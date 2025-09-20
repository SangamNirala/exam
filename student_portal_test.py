#!/usr/bin/env python3
"""
Focused Student Portal Backend Testing Suite
Tests the new student portal endpoints specifically requested in the review
"""

import requests
import json
import sys
from datetime import datetime
import uuid

# Get backend URL from frontend .env
BACKEND_URL = "https://exam-access.preview.emergentagent.com/api"

class StudentPortalTester:
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
    
    def test_token_validation_comprehensive(self):
        """Comprehensive test of POST /api/tokens/validate endpoint"""
        print("\n🎓 Testing Token Validation Endpoint (POST /api/tokens/validate)")
        print("=" * 70)
        
        # Test 1: Valid DEMO token
        try:
            valid_token_request = {"token": "DEMO"}
            response = self.session.post(f"{self.base_url}/tokens/validate", 
                                       json=valid_token_request, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('valid') and data.get('exam_info'):
                    exam_info = data['exam_info']
                    self.demo_assessment_id = exam_info.get('assessment_id')
                    self.demo_questions = exam_info.get('questions', [])
                    
                    self.log_test("Token Validation - DEMO Token", True, 
                                "DEMO token creates demo assessment and returns exam info", 
                                f"Assessment: '{exam_info.get('title')}', Questions: {len(self.demo_questions)}, Duration: {exam_info.get('duration')} min")
                    
                    # Verify exam info structure
                    required_fields = ['token', 'assessment_id', 'title', 'duration', 'total_questions', 'questions']
                    missing_fields = [field for field in required_fields if field not in exam_info]
                    
                    if not missing_fields:
                        self.log_test("Token Validation - Response Structure", True, 
                                    "All required fields present in exam_info", 
                                    f"Fields: {list(exam_info.keys())}")
                    else:
                        self.log_test("Token Validation - Response Structure", False, 
                                    f"Missing required fields: {missing_fields}")
                else:
                    self.log_test("Token Validation - DEMO Token", False, 
                                "Invalid response structure", f"Response: {data}")
            else:
                self.log_test("Token Validation - DEMO Token", False, 
                            f"HTTP {response.status_code}", f"Response: {response.text}")
                
        except Exception as e:
            self.log_test("Token Validation - DEMO Token", False, f"Request failed: {str(e)}")
        
        # Test 2: Invalid token
        try:
            invalid_token_request = {"token": "INVALID123"}
            response = self.session.post(f"{self.base_url}/tokens/validate", 
                                       json=invalid_token_request, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if not data.get('valid') and data.get('error_message'):
                    self.log_test("Token Validation - Invalid Token", True, 
                                "Invalid token properly rejected", 
                                f"Error: {data.get('error_message')}")
                else:
                    self.log_test("Token Validation - Invalid Token", False, 
                                "Invalid token should be rejected", f"Response: {data}")
            else:
                self.log_test("Token Validation - Invalid Token", False, 
                            f"Unexpected HTTP status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Token Validation - Invalid Token", False, f"Request failed: {str(e)}")
        
        # Test 3: Empty token
        try:
            empty_token_request = {"token": ""}
            response = self.session.post(f"{self.base_url}/tokens/validate", 
                                       json=empty_token_request, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if not data.get('valid'):
                    self.log_test("Token Validation - Empty Token", True, 
                                "Empty token properly rejected")
                else:
                    self.log_test("Token Validation - Empty Token", False, 
                                "Empty token should be rejected")
            else:
                self.log_test("Token Validation - Empty Token", False, 
                            f"Unexpected HTTP status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Token Validation - Empty Token", False, f"Request failed: {str(e)}")
        
        # Test 4: Malformed request
        try:
            malformed_request = {"invalid_field": "test"}
            response = self.session.post(f"{self.base_url}/tokens/validate", 
                                       json=malformed_request, timeout=10)
            
            if response.status_code == 422:  # FastAPI validation error
                self.log_test("Token Validation - Malformed Request", True, 
                            "Malformed request properly rejected with validation error")
            else:
                self.log_test("Token Validation - Malformed Request", False, 
                            f"Expected 422, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Token Validation - Malformed Request", False, f"Request failed: {str(e)}")

    def test_student_session_creation_comprehensive(self):
        """Comprehensive test of POST /api/students/sessions endpoint"""
        print("\n👨‍🎓 Testing Student Session Creation (POST /api/students/sessions)")
        print("=" * 70)
        
        # Test 1: Create session with valid DEMO token
        try:
            params = {"token": "DEMO"}
            response = self.session.post(f"{self.base_url}/students/sessions", 
                                       params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('session_id'):
                    self.session_id = data['session_id']
                    self.log_test("Session Creation - Valid Token", True, 
                                "Session created successfully", 
                                f"Session ID: {data['session_id']}")
                    
                    # Verify response structure
                    required_fields = ['session_id', 'success', 'message']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        self.log_test("Session Creation - Response Structure", True, 
                                    "All required fields present in response")
                    else:
                        self.log_test("Session Creation - Response Structure", False, 
                                    f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Session Creation - Valid Token", False, 
                                "Invalid response structure", f"Response: {data}")
            else:
                self.log_test("Session Creation - Valid Token", False, 
                            f"HTTP {response.status_code}", f"Response: {response.text}")
                
        except Exception as e:
            self.log_test("Session Creation - Valid Token", False, f"Request failed: {str(e)}")
        
        # Test 2: Create session with invalid token
        try:
            params = {"token": "INVALID123"}
            response = self.session.post(f"{self.base_url}/students/sessions", 
                                       params=params, timeout=10)
            
            if response.status_code == 400:
                self.log_test("Session Creation - Invalid Token", True, 
                            "Invalid token properly rejected")
            else:
                self.log_test("Session Creation - Invalid Token", False, 
                            f"Expected 400, got {response.status_code}", 
                            f"Response: {response.text}")
                
        except Exception as e:
            self.log_test("Session Creation - Invalid Token", False, f"Request failed: {str(e)}")

    def test_exam_submission_comprehensive(self):
        """Comprehensive test of POST /api/submissions endpoint"""
        print("\n📝 Testing Exam Submission (POST /api/submissions)")
        print("=" * 70)
        
        if not hasattr(self, 'session_id') or not hasattr(self, 'demo_questions'):
            self.log_test("Exam Submission - Prerequisites", False, 
                        "Missing session ID or demo questions from previous tests")
            return
        
        # Create realistic answers based on actual demo questions
        try:
            answers = []
            for i, question in enumerate(self.demo_questions[:3]):  # Use first 3 questions
                if question.get('type') == 'mcq':
                    # Answer the first MCQ correctly (index 0)
                    answers.append({
                        "question_id": question['id'],
                        "answer": 0,  # First option
                        "time_spent": 120,  # 2 minutes
                        "flagged_for_review": False
                    })
                elif question.get('type') == 'descriptive':
                    # Provide a descriptive answer
                    answers.append({
                        "question_id": question['id'],
                        "answer": "Supervised learning uses labeled training data to learn patterns and make predictions, while unsupervised learning finds hidden patterns in unlabeled data without predefined outcomes.",
                        "time_spent": 300,  # 5 minutes
                        "flagged_for_review": True
                    })
            
            submission_request = {
                "session_id": self.session_id,
                "answers": answers,
                "total_time_spent": sum(answer['time_spent'] for answer in answers)
            }
            
            response = self.session.post(f"{self.base_url}/submissions", 
                                       json=submission_request, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('submission_id'):
                    self.submission_id = data['submission_id']
                    summary = data.get('summary', {})
                    
                    self.log_test("Exam Submission - Valid Submission", True, 
                                "Exam submitted and scored successfully", 
                                f"Submission ID: {data['submission_id']}, Score: {summary.get('score', 0)}/{summary.get('max_score', 0)} ({summary.get('percentage', 0)}%), Time: {summary.get('time_spent_minutes', 0)} min")
                    
                    # Verify response structure
                    required_fields = ['submission_id', 'success', 'summary']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        summary_fields = ['exam_title', 'total_questions', 'questions_attempted', 'score', 'max_score', 'percentage']
                        missing_summary_fields = [field for field in summary_fields if field not in summary]
                        
                        if not missing_summary_fields:
                            self.log_test("Exam Submission - Response Structure", True, 
                                        "All required fields present in response and summary")
                        else:
                            self.log_test("Exam Submission - Response Structure", False, 
                                        f"Missing summary fields: {missing_summary_fields}")
                    else:
                        self.log_test("Exam Submission - Response Structure", False, 
                                    f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Exam Submission - Valid Submission", False, 
                                "Invalid response structure", f"Response: {data}")
            else:
                self.log_test("Exam Submission - Valid Submission", False, 
                            f"HTTP {response.status_code}", f"Response: {response.text}")
                
        except Exception as e:
            self.log_test("Exam Submission - Valid Submission", False, f"Request failed: {str(e)}")
        
        # Test 2: Submit with invalid session ID
        try:
            invalid_submission = {
                "session_id": "invalid_session_123",
                "answers": [
                    {
                        "question_id": str(uuid.uuid4()),
                        "answer": 0,
                        "time_spent": 60,
                        "flagged_for_review": False
                    }
                ],
                "total_time_spent": 60
            }
            
            response = self.session.post(f"{self.base_url}/submissions", 
                                       json=invalid_submission, timeout=10)
            
            if response.status_code == 404:
                self.log_test("Exam Submission - Invalid Session", True, 
                            "Invalid session ID properly rejected")
            else:
                self.log_test("Exam Submission - Invalid Session", False, 
                            f"Expected 404, got {response.status_code}", 
                            f"Response: {response.text}")
                
        except Exception as e:
            self.log_test("Exam Submission - Invalid Session", False, f"Request failed: {str(e)}")

    def test_submission_retrieval_comprehensive(self):
        """Comprehensive test of GET /api/submissions/{submission_id} endpoint"""
        print("\n📊 Testing Submission Retrieval (GET /api/submissions/{submission_id})")
        print("=" * 70)
        
        # Test 1: Retrieve valid submission
        if hasattr(self, 'submission_id'):
            try:
                response = self.session.get(f"{self.base_url}/submissions/{self.submission_id}", 
                                          timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    required_fields = ['submission_id', 'exam_title', 'score', 'max_score', 
                                     'percentage', 'questions_attempted', 'total_questions', 
                                     'time_spent_minutes', 'submission_time', 'status']
                    
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        self.log_test("Submission Retrieval - Valid ID", True, 
                                    "Submission details retrieved successfully", 
                                    f"Exam: '{data.get('exam_title')}', Score: {data.get('score')}/{data.get('max_score')} ({data.get('percentage')}%), Status: {data.get('status')}")
                        
                        # Verify data types and values
                        if isinstance(data.get('percentage'), (int, float)) and 0 <= data.get('percentage') <= 100:
                            self.log_test("Submission Retrieval - Data Validation", True, 
                                        "Percentage value is valid")
                        else:
                            self.log_test("Submission Retrieval - Data Validation", False, 
                                        f"Invalid percentage: {data.get('percentage')}")
                    else:
                        self.log_test("Submission Retrieval - Valid ID", False, 
                                    f"Missing required fields: {missing_fields}")
                else:
                    self.log_test("Submission Retrieval - Valid ID", False, 
                                f"HTTP {response.status_code}", f"Response: {response.text}")
                    
            except Exception as e:
                self.log_test("Submission Retrieval - Valid ID", False, f"Request failed: {str(e)}")
        else:
            self.log_test("Submission Retrieval - Valid ID", False, 
                        "No submission ID available from previous test")
        
        # Test 2: Retrieve with invalid submission ID
        try:
            invalid_submission_id = "invalid_submission_123"
            response = self.session.get(f"{self.base_url}/submissions/{invalid_submission_id}", 
                                      timeout=10)
            
            if response.status_code == 404:
                self.log_test("Submission Retrieval - Invalid ID", True, 
                            "Invalid submission ID properly rejected")
            else:
                self.log_test("Submission Retrieval - Invalid ID", False, 
                            f"Expected 404, got {response.status_code}", 
                            f"Response: {response.text}")
                
        except Exception as e:
            self.log_test("Submission Retrieval - Invalid ID", False, f"Request failed: {str(e)}")

    def test_complete_workflow(self):
        """Test complete student portal workflow end-to-end"""
        print("\n🔄 Testing Complete Student Portal Workflow")
        print("=" * 70)
        
        workflow_steps = []
        
        try:
            # Step 1: Token validation
            token_request = {"token": "DEMO"}
            token_response = self.session.post(f"{self.base_url}/tokens/validate", 
                                             json=token_request, timeout=30)
            
            if token_response.status_code == 200 and token_response.json().get('valid'):
                workflow_steps.append("✅ Token validation")
                exam_info = token_response.json()['exam_info']
            else:
                workflow_steps.append("❌ Token validation")
                raise Exception("Token validation failed")
            
            # Step 2: Session creation
            session_params = {"token": "DEMO"}
            session_response = self.session.post(f"{self.base_url}/students/sessions", 
                                               params=session_params, timeout=10)
            
            if session_response.status_code == 200 and session_response.json().get('success'):
                workflow_steps.append("✅ Session creation")
                session_id = session_response.json()['session_id']
            else:
                workflow_steps.append("❌ Session creation")
                raise Exception("Session creation failed")
            
            # Step 3: Exam submission
            questions = exam_info.get('questions', [])
            answers = []
            for question in questions[:2]:  # Submit answers for first 2 questions
                if question.get('type') == 'mcq':
                    answers.append({
                        "question_id": question['id'],
                        "answer": 0,
                        "time_spent": 120,
                        "flagged_for_review": False
                    })
                else:
                    answers.append({
                        "question_id": question['id'],
                        "answer": "Sample answer for descriptive question.",
                        "time_spent": 180,
                        "flagged_for_review": False
                    })
            
            submission_data = {
                "session_id": session_id,
                "answers": answers,
                "total_time_spent": sum(a['time_spent'] for a in answers)
            }
            
            submission_response = self.session.post(f"{self.base_url}/submissions", 
                                                  json=submission_data, timeout=15)
            
            if submission_response.status_code == 200 and submission_response.json().get('success'):
                workflow_steps.append("✅ Exam submission")
                submission_id = submission_response.json()['submission_id']
            else:
                workflow_steps.append("❌ Exam submission")
                raise Exception("Exam submission failed")
            
            # Step 4: Results retrieval
            results_response = self.session.get(f"{self.base_url}/submissions/{submission_id}", 
                                              timeout=10)
            
            if results_response.status_code == 200:
                workflow_steps.append("✅ Results retrieval")
                results = results_response.json()
            else:
                workflow_steps.append("❌ Results retrieval")
                raise Exception("Results retrieval failed")
            
            # Success
            self.log_test("Complete Workflow", True, 
                        "All workflow steps completed successfully", 
                        f"Steps: {' → '.join(workflow_steps)}")
            
            # Verify workflow data consistency
            if (exam_info.get('title') == results.get('exam_title') and 
                len(answers) == results.get('questions_attempted')):
                self.log_test("Workflow Data Consistency", True, 
                            "Data consistency maintained across workflow steps")
            else:
                self.log_test("Workflow Data Consistency", False, 
                            "Data inconsistency detected across workflow steps")
                
        except Exception as e:
            self.log_test("Complete Workflow", False, 
                        f"Workflow failed at: {' → '.join(workflow_steps)}", 
                        f"Error: {str(e)}")

    def run_student_portal_tests(self):
        """Run all student portal endpoint tests"""
        print("🎓 STUDENT PORTAL BACKEND ENDPOINT TESTING")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 80)
        
        # Test all four endpoints comprehensively
        self.test_token_validation_comprehensive()
        self.test_student_session_creation_comprehensive()
        self.test_exam_submission_comprehensive()
        self.test_submission_retrieval_comprehensive()
        self.test_complete_workflow()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 STUDENT PORTAL TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        failed = len(self.test_results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        # Show failures
        failures = [r for r in self.test_results if not r['success']]
        if failures:
            print(f"\n🚨 FAILED TESTS:")
            for failure in failures:
                print(f"   • {failure['test']}: {failure['message']}")
        else:
            print(f"\n🎉 ALL STUDENT PORTAL ENDPOINTS ARE WORKING PERFECTLY!")
        
        print("\n📋 ENDPOINT COVERAGE:")
        print("   ✅ POST /api/tokens/validate - Token validation with DEMO token support")
        print("   ✅ POST /api/students/sessions - Student session creation")
        print("   ✅ POST /api/submissions - Exam submission with scoring")
        print("   ✅ GET /api/submissions/{id} - Submission details retrieval")
        print("   ✅ Complete workflow integration testing")
        
        return failed == 0

if __name__ == "__main__":
    tester = StudentPortalTester()
    success = tester.run_student_portal_tests()
    sys.exit(0 if success else 1)