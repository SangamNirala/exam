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
BACKEND_URL = "https://admin-quick-editor.preview.emergentagent.com/api"

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
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting Backend API Tests for Assessment Management System")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Initialize variables to store created IDs
        self.created_assessment_id = None
        self.created_question_id = None
        
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
                               ['connectivity', 'database', 'assessment', 'question'])]
        
        if critical_failures:
            print(f"\n🚨 CRITICAL ISSUES FOUND:")
            for failure in critical_failures:
                print(f"   • {failure['test']}: {failure['message']}")
        else:
            print(f"\n🎉 All critical assessment management endpoints are working!")
        
        return failed == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)