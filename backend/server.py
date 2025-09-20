from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import google.generativeai as genai
import PyPDF2
import io
import json
import aiofiles


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Configure Gemini AI
genai.configure(api_key=os.environ['GEMINI_API_KEY'])
model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Assessment Models
class Question(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # 'mcq', 'descriptive', 'coding', 'practical'
    question: str
    options: Optional[List[str]] = None  # For MCQ questions
    correct_answer: Optional[int] = None  # Index of correct answer for MCQ
    difficulty: str = "intermediate"  # 'beginner', 'intermediate', 'advanced'
    estimated_time: int = 2  # minutes
    tags: List[str] = []
    points: float = 1.0
    explanation: Optional[str] = None
    max_words: Optional[int] = None  # For descriptive questions
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QuestionCreate(BaseModel):
    type: str
    question: str
    options: Optional[List[str]] = None
    correct_answer: Optional[int] = None
    difficulty: str = "intermediate"
    estimated_time: int = 2
    tags: List[str] = []
    points: float = 1.0
    explanation: Optional[str] = None
    max_words: Optional[int] = None

class QuestionSettings(BaseModel):
    randomize_order: bool = False
    allow_review: bool = True
    show_correct_answers: bool = False
    passing_score: int = 60
    attempts_allowed: int = 1

class Assessment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    duration: int = 60  # minutes
    instructions: Optional[str] = None
    exam_type: Optional[str] = None  # 'mcq', 'descriptive', 'viva', 'coding', 'practical', 'pen-paper'
    difficulty: str = "intermediate"
    content_source: Optional[str] = None  # 'manual', 'ai', 'hybrid'
    questions: List[Question] = []
    question_settings: QuestionSettings = Field(default_factory=QuestionSettings)
    status: str = "draft"  # 'draft', 'ready', 'published'
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_modified: datetime = Field(default_factory=datetime.utcnow)

class AssessmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    duration: int = 60
    instructions: Optional[str] = None
    exam_type: Optional[str] = None
    difficulty: str = "intermediate"
    content_source: Optional[str] = None

class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    duration: Optional[int] = None
    instructions: Optional[str] = None
    exam_type: Optional[str] = None
    difficulty: Optional[str] = None
    content_source: Optional[str] = None
    status: Optional[str] = None

# Document Processing Models
class DocumentInfo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    content_type: str
    file_size: int
    upload_timestamp: datetime = Field(default_factory=datetime.utcnow)
    processed: bool = False
    extracted_text: Optional[str] = None

class AIGenerationRequest(BaseModel):
    assessment_id: str
    document_contents: List[str]
    question_count: int = 10
    difficulty: str = "intermediate"
    question_types: List[str] = ["mcq"]
    focus_area: str = "balanced"

class AIGenerationResponse(BaseModel):
    success: bool
    questions_generated: int
    questions: List[Question]
    processing_log: List[str]

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Assessment Endpoints
@api_router.post("/assessments", response_model=Assessment)
async def create_assessment(assessment_data: AssessmentCreate):
    assessment_dict = assessment_data.dict()
    assessment_obj = Assessment(**assessment_dict)
    result = await db.assessments.insert_one(assessment_obj.dict())
    return assessment_obj

@api_router.get("/assessments", response_model=List[Assessment])
async def get_assessments():
    assessments = await db.assessments.find().to_list(1000)
    return [Assessment(**assessment) for assessment in assessments]

@api_router.get("/assessments/{assessment_id}", response_model=Assessment)
async def get_assessment(assessment_id: str):
    assessment = await db.assessments.find_one({"id": assessment_id})
    if assessment:
        return Assessment(**assessment)
    return {"error": "Assessment not found"}

@api_router.put("/assessments/{assessment_id}", response_model=Assessment)
async def update_assessment(assessment_id: str, update_data: AssessmentUpdate):
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict["last_modified"] = datetime.utcnow()
    
    result = await db.assessments.update_one(
        {"id": assessment_id}, 
        {"$set": update_dict}
    )
    
    if result.modified_count:
        updated_assessment = await db.assessments.find_one({"id": assessment_id})
        return Assessment(**updated_assessment)
    return {"error": "Assessment not found or no changes made"}

@api_router.delete("/assessments/{assessment_id}")
async def delete_assessment(assessment_id: str):
    result = await db.assessments.delete_one({"id": assessment_id})
    if result.deleted_count:
        return {"message": "Assessment deleted successfully"}
    return {"error": "Assessment not found"}

# Question Endpoints
@api_router.post("/assessments/{assessment_id}/questions", response_model=Question)
async def add_question_to_assessment(assessment_id: str, question_data: QuestionCreate):
    question_dict = question_data.dict()
    question_obj = Question(**question_dict)
    
    result = await db.assessments.update_one(
        {"id": assessment_id},
        {"$push": {"questions": question_obj.dict()}, "$set": {"last_modified": datetime.utcnow()}}
    )
    
    if result.modified_count:
        return question_obj
    return {"error": "Assessment not found"}

@api_router.get("/assessments/{assessment_id}/questions", response_model=List[Question])
async def get_assessment_questions(assessment_id: str):
    assessment = await db.assessments.find_one({"id": assessment_id})
    if assessment:
        return [Question(**q) for q in assessment.get("questions", [])]
    return {"error": "Assessment not found"}

@api_router.put("/assessments/{assessment_id}/questions/{question_id}", response_model=Question)
async def update_question(assessment_id: str, question_id: str, question_data: QuestionCreate):
    question_dict = question_data.dict()
    question_dict["id"] = question_id
    
    result = await db.assessments.update_one(
        {"id": assessment_id, "questions.id": question_id},
        {"$set": {"questions.$": question_dict, "last_modified": datetime.utcnow()}}
    )
    
    if result.modified_count:
        return Question(**question_dict)
    return {"error": "Assessment or question not found"}

@api_router.delete("/assessments/{assessment_id}/questions/{question_id}")
async def delete_question(assessment_id: str, question_id: str):
    result = await db.assessments.update_one(
        {"id": assessment_id},
        {"$pull": {"questions": {"id": question_id}}, "$set": {"last_modified": datetime.utcnow()}}
    )
    
    if result.modified_count:
        return {"message": "Question deleted successfully"}
    return {"error": "Assessment or question not found"}

# Question Settings Endpoints
@api_router.put("/assessments/{assessment_id}/settings")
async def update_question_settings(assessment_id: str, settings: QuestionSettings):
    result = await db.assessments.update_one(
        {"id": assessment_id},
        {"$set": {"question_settings": settings.dict(), "last_modified": datetime.utcnow()}}
    )
    
    if result.modified_count:
        return {"message": "Settings updated successfully"}
    return {"error": "Assessment not found"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
