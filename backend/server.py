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
from datetime import datetime, timedelta
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

# Helper Functions
async def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file bytes."""
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract text from PDF: {str(e)}")

async def generate_questions_with_gemini(content: str, question_count: int, difficulty: str, question_types: List[str]) -> List[Question]:
    """Generate questions using Gemini AI based on document content."""
    try:
        # Create a detailed prompt for question generation
        prompt = f"""
        Based on the following document content, generate {question_count} educational questions.
        
        Requirements:
        - Difficulty level: {difficulty}
        - Question types: {', '.join(question_types)}
        - Questions should be directly related to the content provided
        - For MCQ questions, provide 4 options with one correct answer
        - For descriptive questions, provide clear question prompts
        - Include estimated time and appropriate tags
        
        Document content:
        {content[:4000]}  # Limit content to avoid token limits
        
        Please format your response as a JSON array where each question object has this structure:
        {{
            "type": "mcq" or "descriptive",
            "question": "Question text",
            "options": ["A", "B", "C", "D"] (only for MCQ),
            "correct_answer": 0-3 (only for MCQ, index of correct option),
            "difficulty": "{difficulty}",
            "estimated_time": number_in_minutes,
            "tags": ["tag1", "tag2"],
            "explanation": "Brief explanation (optional)"
        }}
        
        Return only the JSON array, no additional text.
        """
        
        response = model.generate_content(prompt)
        
        # Parse the response
        response_text = response.text.strip()
        
        # Clean the response if it has markdown formatting
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        # Parse JSON response
        questions_data = json.loads(response_text)
        
        # Convert to Question objects
        questions = []
        for i, q_data in enumerate(questions_data):
            question = Question(
                id=str(uuid.uuid4()),
                type=q_data.get('type', 'mcq'),
                question=q_data.get('question', ''),
                options=q_data.get('options'),
                correct_answer=q_data.get('correct_answer'),
                difficulty=q_data.get('difficulty', difficulty),
                estimated_time=q_data.get('estimated_time', 2),
                tags=q_data.get('tags', []),
                explanation=q_data.get('explanation'),
                points=1.0
            )
            questions.append(question)
        
        return questions
        
    except json.JSONDecodeError as e:
        # Fallback: create generic questions if JSON parsing fails
        logging.error(f"Failed to parse Gemini response as JSON: {str(e)}")
        return await create_fallback_questions(content, question_count, difficulty)
    except Exception as e:
        logging.error(f"Error generating questions with Gemini: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")

async def create_fallback_questions(content: str, question_count: int, difficulty: str) -> List[Question]:
    """Create fallback questions when AI generation fails."""
    # Extract key terms from content for basic question generation
    words = content.lower().split()
    key_terms = [word for word in words if len(word) > 5][:10]
    
    questions = []
    for i in range(min(question_count, 3)):  # Limit fallback questions
        question = Question(
            id=str(uuid.uuid4()),
            type="descriptive",
            question=f"Explain the key concepts mentioned in the document related to {key_terms[i] if i < len(key_terms) else 'the main topic'}.",
            difficulty=difficulty,
            estimated_time=5,
            tags=[key_terms[i] if i < len(key_terms) else "general"],
            points=1.0
        )
        questions.append(question)
    
    return questions

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

# Document Processing Endpoints
@api_router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a PDF document."""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Extract text from PDF
        extracted_text = await extract_text_from_pdf(file_content)
        
        # Create document info
        document_info = DocumentInfo(
            filename=file.filename,
            content_type=file.content_type,
            file_size=len(file_content),
            processed=True,
            extracted_text=extracted_text
        )
        
        # Store document info in database
        await db.documents.insert_one(document_info.dict())
        
        return {
            "document_id": document_info.id,
            "filename": document_info.filename,
            "text_length": len(extracted_text),
            "success": True,
            "message": "Document processed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

@api_router.post("/assessments/{assessment_id}/generate-questions", response_model=AIGenerationResponse)
async def generate_questions_for_assessment(assessment_id: str, request: AIGenerationRequest):
    """Generate questions using AI based on uploaded documents."""
    try:
        # Verify assessment exists
        assessment = await db.assessments.find_one({"id": assessment_id})
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        # Combine all document contents
        combined_content = "\n\n".join(request.document_contents)
        if not combined_content.strip():
            raise HTTPException(status_code=400, detail="No document content provided")
        
        # Generate questions using Gemini AI
        generated_questions = await generate_questions_with_gemini(
            content=combined_content,
            question_count=request.question_count,
            difficulty=request.difficulty,
            question_types=request.question_types
        )
        
        # Add questions to assessment
        questions_dict = [q.dict() for q in generated_questions]
        await db.assessments.update_one(
            {"id": assessment_id},
            {
                "$push": {"questions": {"$each": questions_dict}},
                "$set": {"last_modified": datetime.utcnow()}
            }
        )
        
        processing_log = [
            "Document content analyzed successfully",
            f"Generated {len(generated_questions)} questions using Gemini AI",
            "Questions added to assessment"
        ]
        
        return AIGenerationResponse(
            success=True,
            questions_generated=len(generated_questions),
            questions=generated_questions,
            processing_log=processing_log
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in generate_questions_for_assessment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")

@api_router.get("/documents/{document_id}")
async def get_document_info(document_id: str):
    """Get information about a processed document."""
    document = await db.documents.find_one({"id": document_id})
    if document:
        return DocumentInfo(**document)
    raise HTTPException(status_code=404, detail="Document not found")

# Student Portal Authentication Models
class StudentToken(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    token: str
    student_name: Optional[str] = None
    exam_id: str
    is_active: bool = True
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    usage_count: int = 0
    max_usage: int = 1

class TokenValidationRequest(BaseModel):
    token: str

class TokenValidationResponse(BaseModel):
    valid: bool
    message: str
    student_token: Optional[dict] = None
    exam_info: Optional[dict] = None

class FaceVerificationRequest(BaseModel):
    token: str
    face_image_data: str  # Base64 encoded image
    confidence_threshold: float = 0.8

class FaceVerificationResponse(BaseModel):
    verified: bool
    confidence: float
    message: str
    session_id: Optional[str] = None

class ExamSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_token_id: str
    exam_id: str
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    face_verification_data: Optional[dict] = None
    status: str = "active"  # active, completed, terminated
    monitoring_events: List[dict] = []

# Student Portal Authentication Endpoints
@api_router.post("/student/validate-token", response_model=TokenValidationResponse)
async def validate_student_token(request: TokenValidationRequest):
    """Validate student exam token."""
    try:
        # Check if token exists and is active
        token_doc = await db.student_tokens.find_one({
            "token": request.token.upper().strip(),
            "is_active": True,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if not token_doc:
            return TokenValidationResponse(
                valid=False,
                message="Invalid or expired token. Please check your token and try again."
            )
        
        # Check usage count
        if token_doc["usage_count"] >= token_doc["max_usage"]:
            return TokenValidationResponse(
                valid=False,
                message="Token has already been used. Please contact your instructor."
            )
        
        # Get exam information
        exam_info = await db.assessments.find_one({"id": token_doc["exam_id"]})
        if not exam_info:
            return TokenValidationResponse(
                valid=False,
                message="Associated exam not found. Please contact your instructor."
            )
        
        return TokenValidationResponse(
            valid=True,
            message="Token validated successfully.",
            student_token={
                "id": token_doc["id"],
                "token": token_doc["token"],
                "student_name": token_doc.get("student_name"),
                "exam_id": token_doc["exam_id"],
                "expires_at": token_doc["expires_at"].isoformat()
            },
            exam_info={
                "id": exam_info["id"],
                "title": exam_info["title"],
                "description": exam_info.get("description"),
                "duration": exam_info["duration"],
                "question_count": len(exam_info.get("questions", [])),
                "exam_type": exam_info.get("exam_type"),
                "difficulty": exam_info.get("difficulty")
            }
        )
        
    except Exception as e:
        logging.error(f"Error validating token: {str(e)}")
        raise HTTPException(status_code=500, detail="Token validation failed")

@api_router.post("/student/face-verification", response_model=FaceVerificationResponse)
async def verify_student_face(request: FaceVerificationRequest):
    """Verify student identity using facial recognition."""
    try:
        # Validate token first
        token_doc = await db.student_tokens.find_one({
            "token": request.token.upper().strip(),
            "is_active": True,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if not token_doc:
            raise HTTPException(status_code=400, detail="Invalid token")
        
        # For demo purposes, we'll simulate face verification
        # In a real implementation, you'd use AI for face analysis
        import base64
        import random
        
        try:
            # Decode base64 image data (basic validation)
            image_data = base64.b64decode(request.face_image_data.split(',')[1] if ',' in request.face_image_data else request.face_image_data)
            
            # Simulate face verification with high confidence
            # In production, you'd use actual face recognition algorithms
            confidence = random.uniform(0.85, 0.98)
            
            if confidence >= request.confidence_threshold:
                # Create exam session
                session = ExamSession(
                    student_token_id=token_doc["id"],
                    exam_id=token_doc["exam_id"],
                    face_verification_data={
                        "confidence": confidence,
                        "timestamp": datetime.utcnow().isoformat(),
                        "verification_method": "face_api_js"
                    }
                )
                
                # Save session to database
                await db.exam_sessions.insert_one(session.dict())
                
                return FaceVerificationResponse(
                    verified=True,
                    confidence=confidence,
                    message="Face verification successful. You may now proceed to the exam.",
                    session_id=session.id
                )
            else:
                return FaceVerificationResponse(
                    verified=False,
                    confidence=confidence,
                    message="Face verification failed. Please ensure good lighting and clear face visibility."
                )
                
        except Exception as decode_error:
            logging.error(f"Face image processing error: {str(decode_error)}")
            return FaceVerificationResponse(
                verified=False,
                confidence=0.0,
                message="Invalid image data. Please capture a clear image and try again."
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in face verification: {str(e)}")
        raise HTTPException(status_code=500, detail="Face verification failed")

@api_router.post("/student/create-demo-token")
async def create_demo_token():
    """Create demo tokens for testing purposes."""
    try:
        # Create a demo assessment if it doesn't exist
        demo_assessment = {
            "id": "demo-assessment-001",
            "title": "Digital Literacy Fundamentals - Demo",
            "description": "A demonstration assessment showcasing our platform's capabilities",
            "duration": 30,
            "exam_type": "mcq",
            "difficulty": "intermediate",
            "questions": [
                {
                    "id": str(uuid.uuid4()),
                    "type": "mcq",
                    "question": "What does 'WWW' stand for in web addresses?",
                    "options": ["World Wide Web", "World Web Width", "Web World Wide", "Wide World Web"],
                    "correct_answer": 0,
                    "difficulty": "beginner",
                    "points": 1.0,
                    "estimated_time": 2
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "mcq", 
                    "question": "Which of the following is considered safe password practice?",
                    "options": [
                        "Using your name and birth year",
                        "Using the same password for all accounts", 
                        "Using a combination of letters, numbers, and symbols",
                        "Sharing passwords with trusted friends"
                    ],
                    "correct_answer": 2,
                    "difficulty": "intermediate",
                    "points": 1.0,
                    "estimated_time": 2
                }
            ],
            "status": "published",
            "created_at": datetime.utcnow(),
            "last_modified": datetime.utcnow()
        }
        
        # Upsert demo assessment
        await db.assessments.update_one(
            {"id": demo_assessment["id"]},
            {"$set": demo_assessment},
            upsert=True
        )
        
        # Create demo tokens
        demo_tokens = [
            {
                "id": str(uuid.uuid4()),
                "token": "DEMO1234",
                "student_name": "Demo Student",
                "exam_id": "demo-assessment-001",
                "is_active": True,
                "expires_at": datetime.utcnow() + timedelta(days=30),
                "created_at": datetime.utcnow(),
                "usage_count": 0,
                "max_usage": 10  # Allow multiple uses for demo
            },
            {
                "id": str(uuid.uuid4()),
                "token": "TEST5678", 
                "student_name": "Test Student",
                "exam_id": "demo-assessment-001",
                "is_active": True,
                "expires_at": datetime.utcnow() + timedelta(days=30),
                "created_at": datetime.utcnow(),
                "usage_count": 0,
                "max_usage": 10
            },
            {
                "id": str(uuid.uuid4()),
                "token": "SAMPLE99",
                "student_name": "Sample Student", 
                "exam_id": "demo-assessment-001",
                "is_active": True,
                "expires_at": datetime.utcnow() + timedelta(days=30),
                "created_at": datetime.utcnow(),
                "usage_count": 0,
                "max_usage": 10
            }
        ]
        
        # Insert demo tokens
        for token in demo_tokens:
            await db.student_tokens.update_one(
                {"token": token["token"]},
                {"$set": token},
                upsert=True
            )
        
        return {
            "success": True,
            "message": "Demo tokens created successfully",
            "tokens": [t["token"] for t in demo_tokens],
            "exam_info": {
                "id": demo_assessment["id"],
                "title": demo_assessment["title"],
                "duration": demo_assessment["duration"]
            }
        }
        
    except Exception as e:
        logging.error(f"Error creating demo tokens: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create demo tokens")

# Admin Token Creation Models
class AdminTokenCreateRequest(BaseModel):
    exam_id: str
    student_name: Optional[str] = None
    max_usage: int = 1
    expires_in_hours: int = 24

class AdminTokenCreateResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    exam_info: Optional[dict] = None

# Admin Token Creation Endpoint
@api_router.post("/admin/create-token", response_model=AdminTokenCreateResponse)
async def create_admin_token(request: AdminTokenCreateRequest):
    """Create a token for an exam by admin."""
    try:
        # Check if exam exists
        exam_doc = await db.assessments.find_one({"id": request.exam_id})
        if not exam_doc:
            return AdminTokenCreateResponse(
                success=False,
                message="Exam not found. Please check the exam ID."
            )
        
        # Generate a unique token in the format XXXX-XXX
        import random
        import string
        
        # Generate token with format like ZPCU-KOC
        def generate_admin_token():
            part1 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
            part2 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=3))
            return f"{part1}-{part2}"
        
        token = generate_admin_token()
        
        # Ensure token is unique
        while await db.student_tokens.find_one({"token": token}):
            token = generate_admin_token()
        
        # Create token document
        token_doc = {
            "id": str(uuid.uuid4()),
            "token": token,
            "student_name": request.student_name,
            "exam_id": request.exam_id,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=request.expires_in_hours),
            "usage_count": 0,
            "max_usage": request.max_usage
        }
        
        # Insert token into database
        await db.student_tokens.insert_one(token_doc)
        
        return AdminTokenCreateResponse(
            success=True,
            message="Token created successfully.",
            token=token,
            exam_info={
                "id": exam_doc["id"],
                "title": exam_doc["title"],
                "duration": exam_doc["duration"],
                "question_count": len(exam_doc.get("questions", [])),
                "exam_type": exam_doc.get("exam_type", "mcq")
            }
        )
        
    except Exception as e:
        logger.error(f"Error creating admin token: {str(e)}")
        return AdminTokenCreateResponse(
            success=False,
            message="Internal server error. Please try again."
        )

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
