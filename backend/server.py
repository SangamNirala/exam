from fastapi import FastAPI, APIRouter
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


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
