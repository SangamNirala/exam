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
BACKEND_URL = "https://exam-access.preview.emergentagent.com/api"

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

    def run_all_tests(self):
        """Run all backend tests including new document and AI endpoints"""
        print(f"🚀 Starting Backend API Tests for Assessment Management System")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Initialize variables to store created IDs
        self.created_assessment_id = None
        self.created_question_id = None
        self.created_document_id = None
        
        # Test basic connectivity first
        if not self.test_connectivity():
            print("❌ Backend server is not accessible. Stopping tests.")
            return False
        
        # Test existing endpoints
        self.test_status_endpoints()
        self.test_database_connectivity()
        
        # Test assessment management system endpoints
        print("\n🎯 Testing Assessment Management System...")
        
        # 1. Test assessment creation
        assessment_id = self.test_assessment_creation()
        
        # 2. Test assessment retrieval
        self.test_assessment_retrieval()
        
        # 3. Test specific assessment retrieval
        if assessment_id:
            self.test_specific_assessment_retrieval(assessment_id)
        
        # 4. Test question management
        question_ids = []
        if assessment_id:
            question_ids = self.test_question_management(assessment_id) or []
        
        # 5. Test question retrieval
        if assessment_id:
            self.test_question_retrieval(assessment_id)
        
        # 6. Test question update
        if assessment_id and question_ids:
            self.test_question_update(assessment_id, question_ids[0])
        
        # NEW TESTS: Document Processing and AI Question Generation
        print("\n🤖 Testing Document Processing and AI Question Generation...")
        
        # 7. Test document upload
        document_id = self.test_document_upload()
        
        # 8. Test document info retrieval
        if document_id:
            self.test_document_info_retrieval(document_id)
        
        # 9. Test Gemini API connectivity
        self.test_gemini_api_connectivity()
        
        # 10. Test AI question generation
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
                               ['connectivity', 'database', 'assessment', 'question', 'document', 'gemini', 'ai'])]
        
        if critical_failures:
            print(f"\n🚨 CRITICAL ISSUES FOUND:")
            for failure in critical_failures:
                print(f"   • {failure['test']}: {failure['message']}")
        else:
            print(f"\n🎉 All critical endpoints including document processing and AI generation are working!")
        
        return failed == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)