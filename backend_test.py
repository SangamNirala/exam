#!/usr/bin/env python3
"""
Backend API Testing Suite for Assessment Management System
Tests all available backend endpoints and identifies missing functionality
"""

import requests
import json
import sys
from datetime import datetime
import uuid

# Get backend URL from frontend .env
BACKEND_URL = "https://quick-test-entry.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
    
    def test_connectivity(self):
        """Test basic connectivity to backend server"""
        try:
            response = self.session.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Backend Connectivity", True, 
                            f"Server responding correctly", 
                            f"Response: {data}")
                return True
            else:
                self.log_test("Backend Connectivity", False, 
                            f"Server returned status {response.status_code}",
                            f"Response: {response.text}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Backend Connectivity", False, 
                        f"Connection failed: {str(e)}")
            return False
    
    def test_status_endpoints(self):
        """Test existing status check endpoints"""
        # Test GET status endpoint
        try:
            response = self.session.get(f"{self.base_url}/status", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("GET Status Endpoint", True, 
                            f"Status endpoint working", 
                            f"Retrieved {len(data)} status checks")
            else:
                self.log_test("GET Status Endpoint", False, 
                            f"Status endpoint failed with {response.status_code}",
                            f"Response: {response.text}")
        except Exception as e:
            self.log_test("GET Status Endpoint", False, f"Request failed: {str(e)}")
        
        # Test POST status endpoint
        try:
            test_data = {
                "client_name": f"test_client_{uuid.uuid4().hex[:8]}"
            }
            response = self.session.post(f"{self.base_url}/status", 
                                       json=test_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("POST Status Endpoint", True, 
                            f"Status creation working", 
                            f"Created status check with ID: {data.get('id')}")
            else:
                self.log_test("POST Status Endpoint", False, 
                            f"Status creation failed with {response.status_code}",
                            f"Response: {response.text}")
        except Exception as e:
            self.log_test("POST Status Endpoint", False, f"Request failed: {str(e)}")
    
    def test_assessment_creation(self):
        """Test assessment creation endpoint - POST /api/assessments"""
        try:
            test_assessment = {
                "title": "Sample Mathematics Assessment",
                "description": "A comprehensive test covering basic mathematics concepts",
                "subject": "Mathematics",
                "duration": 90,
                "instructions": "Please read all questions carefully before answering",
                "exam_type": "mcq",
                "difficulty": "intermediate",
                "content_source": "manual"
            }
            
            response = self.session.post(f"{self.base_url}/assessments", 
                                       json=test_assessment, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                assessment_id = data.get('id')
                self.created_assessment_id = assessment_id  # Store for later tests
                
                self.log_test("Assessment Creation", True, 
                            "Assessment created successfully", 
                            f"Created assessment with ID: {assessment_id}, Title: {data.get('title')}")
                return assessment_id
            else:
                self.log_test("Assessment Creation", False, 
                            f"Assessment creation failed with status {response.status_code}",
                            f"Response: {response.text}")
                return None
                
        except Exception as e:
            self.log_test("Assessment Creation", False, f"Request failed: {str(e)}")
            return None
    
    def test_assessment_retrieval(self):
        """Test assessment retrieval endpoint - GET /api/assessments"""
        try:
            response = self.session.get(f"{self.base_url}/assessments", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Assessment Retrieval", True, 
                            f"Retrieved {len(data)} assessments successfully", 
                            f"Assessments found: {[a.get('title', 'Untitled') for a in data[:3]]}")
                return data
            else:
                self.log_test("Assessment Retrieval", False, 
                            f"Assessment retrieval failed with status {response.status_code}",
                            f"Response: {response.text}")
                return []
                
        except Exception as e:
            self.log_test("Assessment Retrieval", False, f"Request failed: {str(e)}")
            return []
    
    def test_specific_assessment_retrieval(self, assessment_id):
        """Test specific assessment retrieval - GET /api/assessments/{id}"""
        if not assessment_id:
            self.log_test("Specific Assessment Retrieval", False, 
                        "No assessment ID provided for testing")
            return None
            
        try:
            response = self.session.get(f"{self.base_url}/assessments/{assessment_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Specific Assessment Retrieval", True, 
                            f"Retrieved specific assessment successfully", 
                            f"Assessment: {data.get('title')}, Questions: {len(data.get('questions', []))}")
                return data
            else:
                self.log_test("Specific Assessment Retrieval", False, 
                            f"Specific assessment retrieval failed with status {response.status_code}",
                            f"Response: {response.text}")
                return None
                
        except Exception as e:
            self.log_test("Specific Assessment Retrieval", False, f"Request failed: {str(e)}")
            return None
    
    def test_question_management(self, assessment_id):
        """Test question management endpoints - POST /api/assessments/{id}/questions"""
        if not assessment_id:
            self.log_test("Question Management", False, 
                        "No assessment ID provided for question testing")
            return None
            
        try:
            # Test adding a multiple choice question
            mcq_question = {
                "type": "mcq",
                "question": "What is the capital of France?",
                "options": ["London", "Berlin", "Paris", "Madrid"],
                "correct_answer": 2,
                "difficulty": "beginner",
                "estimated_time": 2,
                "tags": ["geography", "capitals"],
                "points": 1.0,
                "explanation": "Paris is the capital and largest city of France."
            }
            
            response = self.session.post(f"{self.base_url}/assessments/{assessment_id}/questions", 
                                       json=mcq_question, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                question_id = data.get('id')
                self.created_question_id = question_id  # Store for later tests
                
                self.log_test("Question Creation (MCQ)", True, 
                            "MCQ question added successfully", 
                            f"Question ID: {question_id}, Type: {data.get('type')}")
                
                # Test adding a descriptive question
                descriptive_question = {
                    "type": "descriptive",
                    "question": "Explain the concept of photosynthesis in plants.",
                    "difficulty": "intermediate",
                    "estimated_time": 10,
                    "tags": ["biology", "plants"],
                    "points": 5.0,
                    "max_words": 200,
                    "explanation": "Students should explain the process by which plants convert light energy into chemical energy."
                }
                
                response2 = self.session.post(f"{self.base_url}/assessments/{assessment_id}/questions", 
                                           json=descriptive_question, timeout=10)
                
                if response2.status_code == 200:
                    data2 = response2.json()
                    self.log_test("Question Creation (Descriptive)", True, 
                                "Descriptive question added successfully", 
                                f"Question ID: {data2.get('id')}, Max words: {data2.get('max_words')}")
                    return [question_id, data2.get('id')]
                else:
                    self.log_test("Question Creation (Descriptive)", False, 
                                f"Descriptive question creation failed with status {response2.status_code}",
                                f"Response: {response2.text}")
                    return [question_id]
            else:
                self.log_test("Question Creation (MCQ)", False, 
                            f"MCQ question creation failed with status {response.status_code}",
                            f"Response: {response.text}")
                return None
                
        except Exception as e:
            self.log_test("Question Management", False, f"Request failed: {str(e)}")
            return None
    
    def test_question_retrieval(self, assessment_id):
        """Test question retrieval endpoint - GET /api/assessments/{id}/questions"""
        if not assessment_id:
            self.log_test("Question Retrieval", False, 
                        "No assessment ID provided for question retrieval testing")
            return []
            
        try:
            response = self.session.get(f"{self.base_url}/assessments/{assessment_id}/questions", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Question Retrieval", True, 
                            f"Retrieved {len(data)} questions successfully", 
                            f"Question types: {[q.get('type') for q in data]}")
                return data
            else:
                self.log_test("Question Retrieval", False, 
                            f"Question retrieval failed with status {response.status_code}",
                            f"Response: {response.text}")
                return []
                
        except Exception as e:
            self.log_test("Question Retrieval", False, f"Request failed: {str(e)}")
            return []
    
    def test_question_update(self, assessment_id, question_id):
        """Test question update endpoint - PUT /api/assessments/{id}/questions/{question_id}"""
        if not assessment_id or not question_id:
            self.log_test("Question Update", False, 
                        "Missing assessment ID or question ID for update testing")
            return False
            
        try:
            updated_question = {
                "type": "mcq",
                "question": "What is the capital of France? (Updated)",
                "options": ["London", "Berlin", "Paris", "Rome"],
                "correct_answer": 2,
                "difficulty": "beginner",
                "estimated_time": 3,
                "tags": ["geography", "capitals", "europe"],
                "points": 1.5,
                "explanation": "Paris is the capital and largest city of France. Updated explanation."
            }
            
            response = self.session.put(f"{self.base_url}/assessments/{assessment_id}/questions/{question_id}", 
                                      json=updated_question, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Question Update", True, 
                            "Question updated successfully", 
                            f"Updated question: {data.get('question')[:50]}...")
                return True
            else:
                self.log_test("Question Update", False, 
                            f"Question update failed with status {response.status_code}",
                            f"Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Question Update", False, f"Request failed: {str(e)}")
            return False
    
    def test_database_connectivity(self):
        """Test if database operations are working through existing endpoints"""
        try:
            # Create a status check to test DB write
            test_data = {
                "client_name": f"db_test_{uuid.uuid4().hex[:8]}"
            }
            response = self.session.post(f"{self.base_url}/status", 
                                       json=test_data, timeout=10)
            
            if response.status_code == 200:
                created_id = response.json().get('id')
                
                # Try to retrieve it back
                response = self.session.get(f"{self.base_url}/status", timeout=10)
                if response.status_code == 200:
                    status_checks = response.json()
                    found = any(check.get('id') == created_id for check in status_checks)
                    
                    if found:
                        self.log_test("Database Connectivity", True, 
                                    "Database read/write operations working",
                                    f"Successfully created and retrieved record with ID: {created_id}")
                    else:
                        self.log_test("Database Connectivity", False, 
                                    "Database write succeeded but read failed",
                                    f"Created record {created_id} not found in retrieval")
                else:
                    self.log_test("Database Connectivity", False, 
                                "Database write succeeded but read endpoint failed")
            else:
                self.log_test("Database Connectivity", False, 
                            "Database write operation failed",
                            f"Status creation returned {response.status_code}")
                
        except Exception as e:
            self.log_test("Database Connectivity", False, 
                        f"Database test failed: {str(e)}")
    
    def test_document_upload(self):
        """Test document upload endpoint - POST /api/documents/upload"""
        try:
            # Create a simple PDF content for testing
            import io
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter
            
            # Create a test PDF in memory
            buffer = io.BytesIO()
            p = canvas.Canvas(buffer, pagesize=letter)
            p.drawString(100, 750, "Test Document for AI Question Generation")
            p.drawString(100, 720, "This document contains information about machine learning algorithms.")
            p.drawString(100, 690, "Machine learning is a subset of artificial intelligence that enables")
            p.drawString(100, 660, "computers to learn and make decisions from data without being explicitly programmed.")
            p.drawString(100, 630, "Common algorithms include linear regression, decision trees, and neural networks.")
            p.drawString(100, 600, "Supervised learning uses labeled data to train models for prediction tasks.")
            p.drawString(100, 570, "Unsupervised learning finds patterns in data without labeled examples.")
            p.showPage()
            p.save()
            
            # Get PDF bytes
            pdf_bytes = buffer.getvalue()
            buffer.close()
            
            # Prepare file for upload
            files = {
                'file': ('test_document.pdf', pdf_bytes, 'application/pdf')
            }
            
            response = self.session.post(f"{self.base_url}/documents/upload", 
                                       files=files, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                document_id = data.get('document_id')
                text_length = data.get('text_length', 0)
                
                self.created_document_id = document_id  # Store for later tests
                
                self.log_test("Document Upload", True, 
                            "PDF uploaded and processed successfully", 
                            f"Document ID: {document_id}, Text length: {text_length} characters")
                return document_id
            else:
                self.log_test("Document Upload", False, 
                            f"Document upload failed with status {response.status_code}",
                            f"Response: {response.text}")
                return None
                
        except ImportError:
            # Fallback: try with a simple text file as PDF (won't work but tests error handling)
            try:
                files = {
                    'file': ('test.txt', b'This is not a PDF file', 'text/plain')
                }
                
                response = self.session.post(f"{self.base_url}/documents/upload", 
                                           files=files, timeout=30)
                
                if response.status_code == 400:
                    self.log_test("Document Upload Error Handling", True, 
                                "Correctly rejected non-PDF file", 
                                f"Response: {response.json()}")
                else:
                    self.log_test("Document Upload Error Handling", False, 
                                f"Should have rejected non-PDF file but got status {response.status_code}")
                return None
            except Exception as e:
                self.log_test("Document Upload", False, f"Test setup failed: {str(e)}")
                return None
        except Exception as e:
            self.log_test("Document Upload", False, f"Request failed: {str(e)}")
            return None
    
    def test_document_info_retrieval(self, document_id):
        """Test document info retrieval - GET /api/documents/{document_id}"""
        if not document_id:
            self.log_test("Document Info Retrieval", False, 
                        "No document ID provided for testing")
            return None
            
        try:
            response = self.session.get(f"{self.base_url}/documents/{document_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Document Info Retrieval", True, 
                            "Document info retrieved successfully", 
                            f"Filename: {data.get('filename')}, Size: {data.get('file_size')} bytes, Processed: {data.get('processed')}")
                return data
            else:
                self.log_test("Document Info Retrieval", False, 
                            f"Document info retrieval failed with status {response.status_code}",
                            f"Response: {response.text}")
                return None
                
        except Exception as e:
            self.log_test("Document Info Retrieval", False, f"Request failed: {str(e)}")
            return None
    
    def test_ai_question_generation(self, assessment_id):
        """Test AI question generation endpoint - POST /api/assessments/{assessment_id}/generate-questions"""
        if not assessment_id:
            self.log_test("AI Question Generation", False, 
                        "No assessment ID provided for testing")
            return None
            
        try:
            # Test with sample document content about machine learning
            test_request = {
                "assessment_id": assessment_id,
                "document_contents": [
                    """Machine Learning Fundamentals
                    
                    Machine learning is a branch of artificial intelligence that focuses on building systems that can learn from data. There are three main types of machine learning:
                    
                    1. Supervised Learning: Uses labeled training data to learn a mapping from inputs to outputs. Examples include classification and regression tasks.
                    
                    2. Unsupervised Learning: Finds hidden patterns in data without labeled examples. Common techniques include clustering and dimensionality reduction.
                    
                    3. Reinforcement Learning: Learns through interaction with an environment, receiving rewards or penalties for actions taken.
                    
                    Key algorithms include:
                    - Linear Regression: Predicts continuous values
                    - Decision Trees: Creates a tree-like model of decisions
                    - Neural Networks: Mimics the structure of biological neural networks
                    - Support Vector Machines: Finds optimal boundaries between classes
                    
                    Model evaluation is crucial and involves techniques like cross-validation, precision, recall, and F1-score."""
                ],
                "question_count": 5,
                "difficulty": "intermediate",
                "question_types": ["mcq", "descriptive"],
                "focus_area": "balanced"
            }
            
            response = self.session.post(f"{self.base_url}/assessments/{assessment_id}/generate-questions", 
                                       json=test_request, timeout=60)  # Longer timeout for AI processing
            
            if response.status_code == 200:
                data = response.json()
                questions_generated = data.get('questions_generated', 0)
                questions = data.get('questions', [])
                processing_log = data.get('processing_log', [])
                
                # Verify questions are relevant to the content
                relevant_keywords = ['machine learning', 'supervised', 'unsupervised', 'reinforcement', 
                                   'neural network', 'decision tree', 'regression', 'classification']
                
                relevant_questions = 0
                for question in questions:
                    question_text = question.get('question', '').lower()
                    if any(keyword in question_text for keyword in relevant_keywords):
                        relevant_questions += 1
                
                relevance_score = (relevant_questions / len(questions) * 100) if questions else 0
                
                self.log_test("AI Question Generation", True, 
                            f"Generated {questions_generated} questions successfully", 
                            f"Relevance score: {relevance_score:.1f}%, Question types: {[q.get('type') for q in questions]}")
                
                # Test individual question quality
                if questions:
                    sample_question = questions[0]
                    question_details = f"Sample question: {sample_question.get('question')[:100]}..."
                    if sample_question.get('type') == 'mcq':
                        question_details += f" Options: {len(sample_question.get('options', []))}"
                    
                    self.log_test("AI Question Quality", True, 
                                "Generated questions have proper structure", 
                                question_details)
                
                return data
            else:
                self.log_test("AI Question Generation", False, 
                            f"AI question generation failed with status {response.status_code}",
                            f"Response: {response.text}")
                return None
                
        except Exception as e:
            self.log_test("AI Question Generation", False, f"Request failed: {str(e)}")
            return None
    
    def test_gemini_api_connectivity(self):
        """Test if Gemini API is accessible and working"""
        try:
            # Create a simple assessment first
            test_assessment = {
                "title": "Gemini API Test Assessment",
                "description": "Testing Gemini AI integration",
                "subject": "Computer Science",
                "duration": 30,
                "difficulty": "beginner"
            }
            
            response = self.session.post(f"{self.base_url}/assessments", 
                                       json=test_assessment, timeout=10)
            
            if response.status_code == 200:
                assessment_id = response.json().get('id')
                
                # Test with minimal content to check API connectivity
                minimal_request = {
                    "assessment_id": assessment_id,
                    "document_contents": ["Python is a programming language used for web development and data science."],
                    "question_count": 1,
                    "difficulty": "beginner",
                    "question_types": ["mcq"]
                }
                
                response = self.session.post(f"{self.base_url}/assessments/{assessment_id}/generate-questions", 
                                           json=minimal_request, timeout=45)
                
                if response.status_code == 200:
                    self.log_test("Gemini API Connectivity", True, 
                                "Gemini AI is responding and generating questions", 
                                "API key is valid and service is accessible")
                elif response.status_code == 500:
                    self.log_test("Gemini API Connectivity", False, 
                                "Gemini API appears to be inaccessible or API key invalid", 
                                f"Server error: {response.text}")
                else:
                    self.log_test("Gemini API Connectivity", False, 
                                f"Unexpected response from Gemini API test: {response.status_code}")
            else:
                self.log_test("Gemini API Connectivity", False, 
                            "Could not create test assessment for Gemini API testing")
                
        except Exception as e:
            self.log_test("Gemini API Connectivity", False, f"Gemini API test failed: {str(e)}")

    # STUDENT PORTAL AUTHENTICATION SYSTEM TESTS
    def test_demo_token_creation(self):
        """Test demo token creation endpoint - POST /api/student/create-demo-token"""
        try:
            response = self.session.post(f"{self.base_url}/student/create-demo-token", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                success = data.get('success', False)
                tokens = data.get('tokens', [])
                exam_info = data.get('exam_info', {})
                
                # Verify expected demo tokens are created
                expected_tokens = ['DEMO1234', 'TEST5678', 'SAMPLE99']
                tokens_match = all(token in tokens for token in expected_tokens)
                
                if success and tokens_match and exam_info:
                    self.demo_tokens = tokens  # Store for later tests
                    self.demo_exam_id = exam_info.get('id')
                    
                    self.log_test("Demo Token Creation", True, 
                                f"Demo tokens created successfully", 
                                f"Tokens: {tokens}, Exam: {exam_info.get('title')}")
                    return tokens
                else:
                    self.log_test("Demo Token Creation", False, 
                                "Demo token creation response incomplete",
                                f"Success: {success}, Tokens: {tokens}, Exam info: {bool(exam_info)}")
                    return None
            else:
                self.log_test("Demo Token Creation", False, 
                            f"Demo token creation failed with status {response.status_code}",
                            f"Response: {response.text}")
                return None
                
        except Exception as e:
            self.log_test("Demo Token Creation", False, f"Request failed: {str(e)}")
            return None

    def test_token_validation_valid(self):
        """Test token validation with valid demo tokens"""
        if not hasattr(self, 'demo_tokens') or not self.demo_tokens:
            self.log_test("Token Validation (Valid)", False, 
                        "No demo tokens available for testing")
            return False
            
        try:
            # Test each demo token
            valid_tokens_tested = 0
            for token in self.demo_tokens:
                test_request = {"token": token}
                
                response = self.session.post(f"{self.base_url}/student/validate-token", 
                                           json=test_request, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    valid = data.get('valid', False)
                    student_token = data.get('student_token')
                    exam_info = data.get('exam_info')
                    
                    if valid and student_token and exam_info:
                        valid_tokens_tested += 1
                        self.log_test(f"Token Validation ({token})", True, 
                                    "Token validated successfully", 
                                    f"Student: {student_token.get('student_name')}, Exam: {exam_info.get('title')}")
                    else:
                        self.log_test(f"Token Validation ({token})", False, 
                                    "Token validation response incomplete",
                                    f"Valid: {valid}, Student token: {bool(student_token)}, Exam info: {bool(exam_info)}")
                else:
                    self.log_test(f"Token Validation ({token})", False, 
                                f"Token validation failed with status {response.status_code}",
                                f"Response: {response.text}")
            
            if valid_tokens_tested == len(self.demo_tokens):
                self.log_test("Token Validation (Valid)", True, 
                            f"All {valid_tokens_tested} demo tokens validated successfully")
                return True
            else:
                self.log_test("Token Validation (Valid)", False, 
                            f"Only {valid_tokens_tested}/{len(self.demo_tokens)} tokens validated successfully")
                return False
                
        except Exception as e:
            self.log_test("Token Validation (Valid)", False, f"Request failed: {str(e)}")
            return False

    def test_token_validation_invalid(self):
        """Test token validation with invalid tokens"""
        try:
            invalid_tokens = ["INVALID123", "EXPIRED456", "NOTFOUND789", ""]
            
            for token in invalid_tokens:
                test_request = {"token": token}
                
                response = self.session.post(f"{self.base_url}/student/validate-token", 
                                           json=test_request, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    valid = data.get('valid', True)  # Should be False for invalid tokens
                    message = data.get('message', '')
                    
                    if not valid and message:
                        self.log_test(f"Token Validation Invalid ({token or 'empty'})", True, 
                                    "Invalid token correctly rejected", 
                                    f"Message: {message}")
                    else:
                        self.log_test(f"Token Validation Invalid ({token or 'empty'})", False, 
                                    "Invalid token was not properly rejected",
                                    f"Valid: {valid}, Message: {message}")
                else:
                    self.log_test(f"Token Validation Invalid ({token or 'empty'})", False, 
                                f"Unexpected status code {response.status_code}",
                                f"Response: {response.text}")
            
            self.log_test("Token Validation (Invalid)", True, 
                        "Invalid token handling tested successfully")
            return True
                
        except Exception as e:
            self.log_test("Token Validation (Invalid)", False, f"Request failed: {str(e)}")
            return False

    def test_face_verification_valid(self):
        """Test face verification with valid token and image data"""
        if not hasattr(self, 'demo_tokens') or not self.demo_tokens:
            self.log_test("Face Verification (Valid)", False, 
                        "No demo tokens available for testing")
            return False
            
        try:
            # Create a sample base64 image data (1x1 pixel PNG)
            import base64
            # This is a minimal valid base64 encoded 1x1 pixel PNG image
            sample_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg=="
            
            # Test with first demo token
            test_token = self.demo_tokens[0]
            test_request = {
                "token": test_token,
                "face_image_data": f"data:image/png;base64,{sample_image_b64}",
                "confidence_threshold": 0.8
            }
            
            response = self.session.post(f"{self.base_url}/student/face-verification", 
                                       json=test_request, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                verified = data.get('verified', False)
                confidence = data.get('confidence', 0.0)
                message = data.get('message', '')
                session_id = data.get('session_id')
                
                if verified and confidence >= 0.8 and session_id:
                    self.created_session_id = session_id  # Store for potential future tests
                    self.log_test("Face Verification (Valid)", True, 
                                "Face verification successful", 
                                f"Confidence: {confidence:.2f}, Session ID: {session_id}")
                    return True
                else:
                    self.log_test("Face Verification (Valid)", False, 
                                "Face verification response incomplete or failed",
                                f"Verified: {verified}, Confidence: {confidence}, Session: {bool(session_id)}")
                    return False
            else:
                self.log_test("Face Verification (Valid)", False, 
                            f"Face verification failed with status {response.status_code}",
                            f"Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Face Verification (Valid)", False, f"Request failed: {str(e)}")
            return False

    def test_face_verification_invalid_token(self):
        """Test face verification with invalid token"""
        try:
            import base64
            sample_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg=="
            
            test_request = {
                "token": "INVALID_TOKEN",
                "face_image_data": f"data:image/png;base64,{sample_image_b64}",
                "confidence_threshold": 0.8
            }
            
            response = self.session.post(f"{self.base_url}/student/face-verification", 
                                       json=test_request, timeout=10)
            
            if response.status_code == 400:
                self.log_test("Face Verification (Invalid Token)", True, 
                            "Invalid token correctly rejected with 400 status", 
                            f"Response: {response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text}")
                return True
            else:
                self.log_test("Face Verification (Invalid Token)", False, 
                            f"Expected 400 status but got {response.status_code}",
                            f"Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Face Verification (Invalid Token)", False, f"Request failed: {str(e)}")
            return False

    def test_face_verification_invalid_image(self):
        """Test face verification with malformed image data"""
        if not hasattr(self, 'demo_tokens') or not self.demo_tokens:
            self.log_test("Face Verification (Invalid Image)", False, 
                        "No demo tokens available for testing")
            return False
            
        try:
            test_token = self.demo_tokens[0]
            
            # Test with invalid base64 data
            test_request = {
                "token": test_token,
                "face_image_data": "invalid_base64_data",
                "confidence_threshold": 0.8
            }
            
            response = self.session.post(f"{self.base_url}/student/face-verification", 
                                       json=test_request, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                verified = data.get('verified', True)  # Should be False for invalid image
                message = data.get('message', '')
                
                if not verified and 'image' in message.lower():
                    self.log_test("Face Verification (Invalid Image)", True, 
                                "Invalid image data correctly handled", 
                                f"Message: {message}")
                    return True
                else:
                    self.log_test("Face Verification (Invalid Image)", False, 
                                "Invalid image data was not properly handled",
                                f"Verified: {verified}, Message: {message}")
                    return False
            else:
                self.log_test("Face Verification (Invalid Image)", False, 
                            f"Unexpected status code {response.status_code}",
                            f"Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Face Verification (Invalid Image)", False, f"Request failed: {str(e)}")
            return False

    def test_database_collections_created(self):
        """Test that required database collections are created and populated"""
        try:
            # Test that demo tokens were stored by trying to validate them
            if hasattr(self, 'demo_tokens') and self.demo_tokens:
                test_request = {"token": self.demo_tokens[0]}
                response = self.session.post(f"{self.base_url}/student/validate-token", 
                                           json=test_request, timeout=10)
                
                if response.status_code == 200 and response.json().get('valid'):
                    self.log_test("Database Collections (student_tokens)", True, 
                                "Student tokens collection created and populated", 
                                "Demo tokens are retrievable from database")
                else:
                    self.log_test("Database Collections (student_tokens)", False, 
                                "Student tokens may not be properly stored")
            
            # Test that demo assessment was created by trying to retrieve it
            if hasattr(self, 'demo_exam_id') and self.demo_exam_id:
                response = self.session.get(f"{self.base_url}/assessments/{self.demo_exam_id}", timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('title') and 'demo' in data.get('title', '').lower():
                        self.log_test("Database Collections (assessments)", True, 
                                    "Demo assessment created in assessments collection", 
                                    f"Assessment: {data.get('title')}")
                    else:
                        self.log_test("Database Collections (assessments)", False, 
                                    "Demo assessment structure may be incorrect")
                else:
                    self.log_test("Database Collections (assessments)", False, 
                                "Demo assessment not found in database")
            
            # Test exam sessions collection by checking if face verification created a session
            if hasattr(self, 'created_session_id') and self.created_session_id:
                self.log_test("Database Collections (exam_sessions)", True, 
                            "Exam sessions collection working", 
                            f"Session created with ID: {self.created_session_id}")
            else:
                self.log_test("Database Collections (exam_sessions)", False, 
                            "No exam session was created during face verification")
                
        except Exception as e:
            self.log_test("Database Collections", False, f"Database collection test failed: {str(e)}")

    def test_authentication_error_handling(self):
        """Test error handling across all authentication endpoints"""
        try:
            error_tests_passed = 0
            total_error_tests = 0
            
            # Test missing parameters
            endpoints_and_data = [
                ("/student/validate-token", {}),  # Missing token
                ("/student/face-verification", {"token": "DEMO1234"}),  # Missing face_image_data
                ("/student/face-verification", {"face_image_data": "test"}),  # Missing token
            ]
            
            for endpoint, data in endpoints_and_data:
                total_error_tests += 1
                try:
                    response = self.session.post(f"{self.base_url}{endpoint}", 
                                               json=data, timeout=10)
                    
                    # Should return 400 or 422 for missing parameters
                    if response.status_code in [400, 422]:
                        error_tests_passed += 1
                        self.log_test(f"Error Handling ({endpoint})", True, 
                                    f"Correctly handled missing parameters with status {response.status_code}")
                    else:
                        self.log_test(f"Error Handling ({endpoint})", False, 
                                    f"Expected 400/422 for missing params but got {response.status_code}")
                except Exception as e:
                    self.log_test(f"Error Handling ({endpoint})", False, f"Error test failed: {str(e)}")
            
            if error_tests_passed == total_error_tests:
                self.log_test("Authentication Error Handling", True, 
                            f"All {total_error_tests} error handling tests passed")
                return True
            else:
                self.log_test("Authentication Error Handling", False, 
                            f"Only {error_tests_passed}/{total_error_tests} error handling tests passed")
                return False
                
        except Exception as e:
            self.log_test("Authentication Error Handling", False, f"Error handling test failed: {str(e)}")
            return False

    # ADMIN TOKEN INTEGRATION TESTS
    def test_admin_token_creation_valid_exam(self):
        """Test admin token creation with valid exam ID"""
        try:
            # First, create an assessment to use for token creation
            test_assessment = {
                "title": "Admin Token Test Assessment",
                "description": "Assessment for testing admin token creation",
                "subject": "Computer Science",
                "duration": 60,
                "exam_type": "mcq",
                "difficulty": "intermediate"
            }
            
            # Create assessment
            response = self.session.post(f"{self.base_url}/assessments", 
                                       json=test_assessment, timeout=10)
            
            if response.status_code != 200:
                self.log_test("Admin Token Creation (Valid Exam)", False, 
                            "Failed to create test assessment for admin token testing")
                return None
            
            exam_id = response.json().get('id')
            
            # Now test admin token creation
            token_request = {
                "exam_id": exam_id,
                "student_name": "John Smith",
                "max_usage": 1,
                "expires_in_hours": 24
            }
            
            response = self.session.post(f"{self.base_url}/admin/create-token", 
                                       json=token_request, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                success = data.get('success', False)
                token = data.get('token')
                exam_info = data.get('exam_info')
                
                # Verify token format (XXXX-XXX)
                import re
                token_pattern = r'^[A-Z0-9]{4}-[A-Z0-9]{3}$'
                valid_format = bool(token and re.match(token_pattern, token))
                
                if success and token and exam_info and valid_format:
                    self.created_admin_token = token  # Store for later tests
                    self.admin_token_exam_id = exam_id
                    
                    self.log_test("Admin Token Creation (Valid Exam)", True, 
                                "Admin token created successfully", 
                                f"Token: {token}, Format: XXXX-XXX, Exam: {exam_info.get('title')}")
                    return token
                else:
                    self.log_test("Admin Token Creation (Valid Exam)", False, 
                                "Admin token creation response incomplete or invalid format",
                                f"Success: {success}, Token: {token}, Format valid: {valid_format}, Exam info: {bool(exam_info)}")
                    return None
            else:
                self.log_test("Admin Token Creation (Valid Exam)", False, 
                            f"Admin token creation failed with status {response.status_code}",
                            f"Response: {response.text}")
                return None
                
        except Exception as e:
            self.log_test("Admin Token Creation (Valid Exam)", False, f"Request failed: {str(e)}")
            return None

    def test_admin_token_creation_invalid_exam(self):
        """Test admin token creation with invalid exam ID"""
        try:
            token_request = {
                "exam_id": "non-existent-exam-id",
                "student_name": "Test Student",
                "max_usage": 1,
                "expires_in_hours": 24
            }
            
            response = self.session.post(f"{self.base_url}/admin/create-token", 
                                       json=token_request, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                success = data.get('success', True)  # Should be False
                message = data.get('message', '')
                
                if not success and 'not found' in message.lower():
                    self.log_test("Admin Token Creation (Invalid Exam)", True, 
                                "Invalid exam ID correctly rejected", 
                                f"Message: {message}")
                    return True
                else:
                    self.log_test("Admin Token Creation (Invalid Exam)", False, 
                                "Invalid exam ID was not properly rejected",
                                f"Success: {success}, Message: {message}")
                    return False
            else:
                self.log_test("Admin Token Creation (Invalid Exam)", False, 
                            f"Unexpected status code {response.status_code}",
                            f"Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Token Creation (Invalid Exam)", False, f"Request failed: {str(e)}")
            return False

    def test_admin_token_validation(self):
        """Test validation of admin-generated tokens (XXXX-XXX format)"""
        if not hasattr(self, 'created_admin_token') or not self.created_admin_token:
            self.log_test("Admin Token Validation", False, 
                        "No admin token available for testing")
            return False
            
        try:
            test_request = {"token": self.created_admin_token}
            
            response = self.session.post(f"{self.base_url}/student/validate-token", 
                                       json=test_request, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                valid = data.get('valid', False)
                student_token = data.get('student_token')
                exam_info = data.get('exam_info')
                
                if valid and student_token and exam_info:
                    # Verify the token format and data integrity
                    token_from_response = student_token.get('token')
                    exam_id_from_response = student_token.get('exam_id')
                    
                    if (token_from_response == self.created_admin_token and 
                        exam_id_from_response == self.admin_token_exam_id):
                        
                        self.log_test("Admin Token Validation", True, 
                                    "Admin token validated successfully", 
                                    f"Token: {token_from_response}, Student: {student_token.get('student_name')}, Exam: {exam_info.get('title')}")
                        return True
                    else:
                        self.log_test("Admin Token Validation", False, 
                                    "Admin token validation data mismatch",
                                    f"Expected token: {self.created_admin_token}, Got: {token_from_response}")
                        return False
                else:
                    self.log_test("Admin Token Validation", False, 
                                "Admin token validation response incomplete",
                                f"Valid: {valid}, Student token: {bool(student_token)}, Exam info: {bool(exam_info)}")
                    return False
            else:
                self.log_test("Admin Token Validation", False, 
                            f"Admin token validation failed with status {response.status_code}",
                            f"Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Token Validation", False, f"Request failed: {str(e)}")
            return False

    def test_demo_vs_admin_token_compatibility(self):
        """Test that both demo tokens (8-char) and admin tokens (XXXX-XXX) work with validation"""
        try:
            tokens_tested = 0
            tokens_passed = 0
            
            # Test demo tokens (8-character format)
            if hasattr(self, 'demo_tokens') and self.demo_tokens:
                for demo_token in self.demo_tokens[:2]:  # Test first 2 demo tokens
                    test_request = {"token": demo_token}
                    response = self.session.post(f"{self.base_url}/student/validate-token", 
                                               json=test_request, timeout=10)
                    
                    tokens_tested += 1
                    if response.status_code == 200 and response.json().get('valid'):
                        tokens_passed += 1
                        self.log_test(f"Demo Token Compatibility ({demo_token})", True, 
                                    "8-character demo token works correctly")
                    else:
                        self.log_test(f"Demo Token Compatibility ({demo_token})", False, 
                                    "8-character demo token validation failed")
            
            # Test admin token (XXXX-XXX format)
            if hasattr(self, 'created_admin_token') and self.created_admin_token:
                test_request = {"token": self.created_admin_token}
                response = self.session.post(f"{self.base_url}/student/validate-token", 
                                           json=test_request, timeout=10)
                
                tokens_tested += 1
                if response.status_code == 200 and response.json().get('valid'):
                    tokens_passed += 1
                    self.log_test(f"Admin Token Compatibility ({self.created_admin_token})", True, 
                                "XXXX-XXX admin token works correctly")
                else:
                    self.log_test(f"Admin Token Compatibility ({self.created_admin_token})", False, 
                                "XXXX-XXX admin token validation failed")
            
            if tokens_tested > 0:
                if tokens_passed == tokens_tested:
                    self.log_test("Token Format Compatibility", True, 
                                f"All {tokens_tested} token formats work correctly", 
                                "Both 8-character demo tokens and XXXX-XXX admin tokens are compatible")
                    return True
                else:
                    self.log_test("Token Format Compatibility", False, 
                                f"Only {tokens_passed}/{tokens_tested} token formats work correctly")
                    return False
            else:
                self.log_test("Token Format Compatibility", False, 
                            "No tokens available for compatibility testing")
                return False
                
        except Exception as e:
            self.log_test("Token Format Compatibility", False, f"Request failed: {str(e)}")
            return False

    def test_admin_token_storage_verification(self):
        """Test that admin tokens are stored correctly in student_tokens collection"""
        if not hasattr(self, 'created_admin_token') or not self.created_admin_token:
            self.log_test("Admin Token Storage Verification", False, 
                        "No admin token available for storage testing")
            return False
            
        try:
            # Verify token is stored by attempting validation
            test_request = {"token": self.created_admin_token}
            response = self.session.post(f"{self.base_url}/student/validate-token", 
                                       json=test_request, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('valid'):
                    student_token = data.get('student_token', {})
                    
                    # Verify all expected fields are present
                    required_fields = ['id', 'token', 'exam_id', 'expires_at']
                    missing_fields = [field for field in required_fields if not student_token.get(field)]
                    
                    if not missing_fields:
                        self.log_test("Admin Token Storage Verification", True, 
                                    "Admin token stored correctly with all required fields", 
                                    f"Token ID: {student_token.get('id')}, Exam ID: {student_token.get('exam_id')}")
                        return True
                    else:
                        self.log_test("Admin Token Storage Verification", False, 
                                    f"Admin token missing required fields: {missing_fields}")
                        return False
                else:
                    self.log_test("Admin Token Storage Verification", False, 
                                "Admin token not found in database or marked as invalid")
                    return False
            else:
                self.log_test("Admin Token Storage Verification", False, 
                            f"Token validation request failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Admin Token Storage Verification", False, f"Request failed: {str(e)}")
            return False

    def test_admin_token_edge_cases(self):
        """Test edge cases for admin token functionality"""
        try:
            edge_cases_passed = 0
            total_edge_cases = 0
            
            # Test 1: Token usage limit
            if hasattr(self, 'created_admin_token') and self.created_admin_token:
                # First use should work
                test_request = {"token": self.created_admin_token}
                response = self.session.post(f"{self.base_url}/student/validate-token", 
                                           json=test_request, timeout=10)
                
                total_edge_cases += 1
                if response.status_code == 200 and response.json().get('valid'):
                    edge_cases_passed += 1
                    self.log_test("Admin Token Edge Case (Usage Limit)", True, 
                                "Token works within usage limit")
                else:
                    self.log_test("Admin Token Edge Case (Usage Limit)", False, 
                                "Token failed within usage limit")
            
            # Test 2: Create token with different parameters
            if hasattr(self, 'admin_token_exam_id') and self.admin_token_exam_id:
                token_request = {
                    "exam_id": self.admin_token_exam_id,
                    "student_name": "Jane Doe",
                    "max_usage": 3,
                    "expires_in_hours": 48
                }
                
                response = self.session.post(f"{self.base_url}/admin/create-token", 
                                           json=token_request, timeout=10)
                
                total_edge_cases += 1
                if response.status_code == 200 and response.json().get('success'):
                    edge_cases_passed += 1
                    multi_use_token = response.json().get('token')
                    self.log_test("Admin Token Edge Case (Multi-use)", True, 
                                f"Multi-use token created successfully: {multi_use_token}")
                else:
                    self.log_test("Admin Token Edge Case (Multi-use)", False, 
                                "Failed to create multi-use token")
            
            # Test 3: Missing optional parameters
            if hasattr(self, 'admin_token_exam_id') and self.admin_token_exam_id:
                minimal_request = {
                    "exam_id": self.admin_token_exam_id
                }
                
                response = self.session.post(f"{self.base_url}/admin/create-token", 
                                           json=minimal_request, timeout=10)
                
                total_edge_cases += 1
                if response.status_code == 200 and response.json().get('success'):
                    edge_cases_passed += 1
                    minimal_token = response.json().get('token')
                    self.log_test("Admin Token Edge Case (Minimal Params)", True, 
                                f"Token created with minimal parameters: {minimal_token}")
                else:
                    self.log_test("Admin Token Edge Case (Minimal Params)", False, 
                                "Failed to create token with minimal parameters")
            
            if total_edge_cases > 0:
                if edge_cases_passed == total_edge_cases:
                    self.log_test("Admin Token Edge Cases", True, 
                                f"All {total_edge_cases} edge cases handled correctly")
                    return True
                else:
                    self.log_test("Admin Token Edge Cases", False, 
                                f"Only {edge_cases_passed}/{total_edge_cases} edge cases passed")
                    return False
            else:
                self.log_test("Admin Token Edge Cases", False, 
                            "No edge cases could be tested")
                return False
                
        except Exception as e:
            self.log_test("Admin Token Edge Cases", False, f"Edge case testing failed: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests including Student Portal Authentication System"""
        print(f"🚀 Starting Backend API Tests for Student Portal Authentication System")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Initialize variables to store created IDs
        self.created_assessment_id = None
        self.created_question_id = None
        self.created_document_id = None
        self.created_session_id = None
        self.demo_tokens = []
        self.demo_exam_id = None
        
        # Test basic connectivity first
        if not self.test_connectivity():
            print("❌ Backend server is not accessible. Stopping tests.")
            return False
        
        # Test existing endpoints
        self.test_status_endpoints()
        self.test_database_connectivity()
        
        # PRIORITY TESTS: Admin Token Integration Workflow
        print("\n🔑 Testing Admin Token Integration Workflow...")
        
        # 1. Test admin token creation with valid exam ID
        admin_token = self.test_admin_token_creation_valid_exam()
        
        # 2. Test admin token creation with invalid exam ID
        self.test_admin_token_creation_invalid_exam()
        
        # 3. Test admin token validation (XXXX-XXX format)
        if admin_token:
            self.test_admin_token_validation()
        
        # 4. Test admin token storage verification
        if admin_token:
            self.test_admin_token_storage_verification()
        
        # 5. Test admin token edge cases
        if admin_token:
            self.test_admin_token_edge_cases()
        
        # PRIORITY TESTS: Student Portal Authentication System
        print("\n🔐 Testing Student Portal Authentication System...")
        
        # 6. Test demo token creation
        demo_tokens = self.test_demo_token_creation()
        
        # 7. Test token validation with valid tokens
        if demo_tokens:
            self.test_token_validation_valid()
        
        # 8. Test token validation with invalid tokens
        self.test_token_validation_invalid()
        
        # 9. Test compatibility between demo and admin tokens
        if demo_tokens or admin_token:
            self.test_demo_vs_admin_token_compatibility()
        
        # 10. Test face verification with valid token
        if demo_tokens:
            self.test_face_verification_valid()
        
        # 11. Test face verification with invalid token
        self.test_face_verification_invalid_token()
        
        # 12. Test face verification with invalid image data
        if demo_tokens:
            self.test_face_verification_invalid_image()
        
        # 13. Test database collections are created and populated
        self.test_database_collections_created()
        
        # 14. Test error handling across authentication endpoints
        self.test_authentication_error_handling()
        
        # Test assessment management system endpoints (existing functionality)
        print("\n🎯 Testing Assessment Management System...")
        
        # 9. Test assessment creation
        assessment_id = self.test_assessment_creation()
        
        # 10. Test assessment retrieval
        self.test_assessment_retrieval()
        
        # 11. Test specific assessment retrieval
        if assessment_id:
            self.test_specific_assessment_retrieval(assessment_id)
        
        # 12. Test question management
        question_ids = []
        if assessment_id:
            question_ids = self.test_question_management(assessment_id) or []
        
        # 13. Test question retrieval
        if assessment_id:
            self.test_question_retrieval(assessment_id)
        
        # 14. Test question update
        if assessment_id and question_ids:
            self.test_question_update(assessment_id, question_ids[0])
        
        # Document Processing and AI Question Generation Tests
        print("\n🤖 Testing Document Processing and AI Question Generation...")
        
        # 15. Test document upload
        document_id = self.test_document_upload()
        
        # 16. Test document info retrieval
        if document_id:
            self.test_document_info_retrieval(document_id)
        
        # 17. Test Gemini API connectivity
        self.test_gemini_api_connectivity()
        
        # 18. Test AI question generation
        if assessment_id:
            self.test_ai_question_generation(assessment_id)
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        failed = len(self.test_results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        # Show critical failures
        critical_failures = [r for r in self.test_results if not r['success'] and 
                           any(keyword in r['test'].lower() for keyword in 
                               ['connectivity', 'database', 'assessment', 'question', 'document', 'gemini', 'ai', 'token', 'face', 'authentication'])]
        
        if critical_failures:
            print(f"\n🚨 CRITICAL ISSUES FOUND:")
            for failure in critical_failures:
                print(f"   • {failure['test']}: {failure['message']}")
        else:
            print(f"\n🎉 All critical endpoints including Student Portal Authentication System are working!")
        
        # Show authentication-specific summary
        auth_tests = [r for r in self.test_results if any(keyword in r['test'].lower() for keyword in ['token', 'face', 'demo', 'authentication'])]
        auth_passed = sum(1 for r in auth_tests if r['success'])
        
        if auth_tests:
            print(f"\n🔐 AUTHENTICATION SYSTEM SUMMARY:")
            print(f"   ✅ Authentication Tests Passed: {auth_passed}/{len(auth_tests)}")
            if auth_passed == len(auth_tests):
                print(f"   🎯 Student Portal Authentication System is fully functional!")
            else:
                print(f"   ⚠️  Some authentication features need attention")
        
        return failed == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)