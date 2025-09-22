#!/usr/bin/env python3
"""
Focused Token Validation Testing for "Take Test" Feature
Tests the specific requirements mentioned in the review request
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://loadingbug.preview.emergentagent.com/api"

class TokenValidationTester:
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
        print(f"{status}: {test_name}")
        print(f"   {message}")
        if details:
            print(f"   Details: {details}")
        print()
    
    def test_backend_accessibility(self):
        """Test that backend is accessible from external URL"""
        print("🌐 TESTING BACKEND ACCESSIBILITY")
        print("=" * 50)
        
        try:
            response = self.session.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Backend Accessibility", True, 
                            f"Backend accessible via external URL: {self.base_url}", 
                            f"Response: {data}")
                return True
            else:
                self.log_test("Backend Accessibility", False, 
                            f"Backend returned status {response.status_code}",
                            f"Response: {response.text}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Backend Accessibility", False, 
                        f"Connection failed: {str(e)}")
            return False
    
    def test_demo_token_validation(self):
        """Test POST /api/student/validate-token with demo tokens"""
        print("🔑 TESTING DEMO TOKEN VALIDATION")
        print("=" * 50)
        
        # First ensure demo tokens exist
        try:
            response = self.session.post(f"{self.base_url}/student/create-demo-token", timeout=10)
            if response.status_code != 200:
                self.log_test("Demo Token Setup", False, "Failed to create demo tokens")
                return False
        except Exception as e:
            self.log_test("Demo Token Setup", False, f"Demo token creation failed: {str(e)}")
            return False
        
        demo_tokens = ['DEMO1234', 'TEST5678', 'SAMPLE99']
        all_passed = True
        
        for token in demo_tokens:
            try:
                test_request = {"token": token}
                response = self.session.post(f"{self.base_url}/student/validate-token", 
                                           json=test_request, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    valid = data.get('valid', False)
                    student_token = data.get('student_token')
                    exam_info = data.get('exam_info')
                    
                    if valid and student_token and exam_info:
                        # Check required fields for ExamInterface
                        required_exam_fields = ['id', 'title', 'duration', 'question_count', 'questions']
                        missing_fields = [field for field in required_exam_fields if field not in exam_info]
                        
                        if not missing_fields:
                            self.log_test(f"Demo Token Validation ({token})", True, 
                                        "Token validated successfully with complete response format", 
                                        f"Student: {student_token.get('student_name')}, "
                                        f"Exam: {exam_info.get('title')}, "
                                        f"Questions: {len(exam_info.get('questions', []))}")
                        else:
                            self.log_test(f"Demo Token Validation ({token})", False, 
                                        f"Response missing required fields for ExamInterface: {missing_fields}")
                            all_passed = False
                    else:
                        self.log_test(f"Demo Token Validation ({token})", False, 
                                    "Token validation response incomplete",
                                    f"Valid: {valid}, Student token: {bool(student_token)}, Exam info: {bool(exam_info)}")
                        all_passed = False
                else:
                    self.log_test(f"Demo Token Validation ({token})", False, 
                                f"Token validation failed with status {response.status_code}",
                                f"Response: {response.text}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Demo Token Validation ({token})", False, f"Request failed: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_admin_token_validation(self):
        """Test token validation with admin-generated tokens"""
        print("🔐 TESTING ADMIN TOKEN VALIDATION")
        print("=" * 50)
        
        try:
            # Create a test assessment first
            test_assessment = {
                "title": "Take Test Feature - Admin Token Test",
                "description": "Assessment for testing admin token validation",
                "subject": "Computer Science",
                "duration": 45,
                "exam_type": "mcq",
                "difficulty": "intermediate"
            }
            
            response = self.session.post(f"{self.base_url}/assessments", 
                                       json=test_assessment, timeout=10)
            
            if response.status_code != 200:
                self.log_test("Admin Token Test Setup", False, "Failed to create test assessment")
                return False
            
            exam_id = response.json().get('id')
            
            # Create admin token
            token_request = {
                "exam_id": exam_id,
                "student_name": "Take Test Student",
                "max_usage": 1,
                "expires_in_hours": 24
            }
            
            response = self.session.post(f"{self.base_url}/admin/create-token", 
                                       json=token_request, timeout=10)
            
            if response.status_code != 200:
                self.log_test("Admin Token Creation", False, "Failed to create admin token")
                return False
            
            admin_token = response.json().get('token')
            
            # Test validation of admin token
            test_request = {"token": admin_token}
            response = self.session.post(f"{self.base_url}/student/validate-token", 
                                       json=test_request, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                valid = data.get('valid', False)
                student_token = data.get('student_token')
                exam_info = data.get('exam_info')
                
                if valid and student_token and exam_info:
                    # Verify token format (XXXX-XXX)
                    import re
                    token_pattern = r'^[A-Z0-9]{4}-[A-Z0-9]{3}$'
                    valid_format = bool(admin_token and re.match(token_pattern, admin_token))
                    
                    # Check required fields for ExamInterface
                    required_exam_fields = ['id', 'title', 'duration', 'question_count', 'questions']
                    missing_fields = [field for field in required_exam_fields if field not in exam_info]
                    
                    if valid_format and not missing_fields:
                        self.log_test("Admin Token Validation", True, 
                                    "Admin token validated successfully with complete response format", 
                                    f"Token: {admin_token} (XXXX-XXX format), "
                                    f"Student: {student_token.get('student_name')}, "
                                    f"Exam: {exam_info.get('title')}")
                        return True
                    else:
                        issues = []
                        if not valid_format:
                            issues.append("Invalid token format")
                        if missing_fields:
                            issues.append(f"Missing fields: {missing_fields}")
                        
                        self.log_test("Admin Token Validation", False, 
                                    f"Admin token validation issues: {', '.join(issues)}")
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
    
    def test_exam_data_structure(self):
        """Test that exam data structure is properly formatted for ExamInterface"""
        print("📋 TESTING EXAM DATA STRUCTURE")
        print("=" * 50)
        
        try:
            # Use demo token to get exam data
            test_request = {"token": "DEMO1234"}
            response = self.session.post(f"{self.base_url}/student/validate-token", 
                                       json=test_request, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                exam_info = data.get('exam_info')
                
                if exam_info:
                    # Check exam structure
                    required_fields = ['id', 'title', 'duration', 'question_count', 'questions']
                    missing_fields = [field for field in required_fields if field not in exam_info]
                    
                    if not missing_fields:
                        questions = exam_info.get('questions', [])
                        
                        if questions:
                            # Check question structure
                            sample_question = questions[0]
                            required_question_fields = ['id', 'type', 'question', 'options', 'correct_answer']
                            missing_question_fields = [field for field in required_question_fields 
                                                     if field not in sample_question]
                            
                            if not missing_question_fields:
                                # Verify MCQ structure
                                options = sample_question.get('options', [])
                                correct_answer = sample_question.get('correct_answer')
                                
                                if len(options) == 4 and isinstance(correct_answer, int) and 0 <= correct_answer <= 3:
                                    self.log_test("Exam Data Structure", True, 
                                                "Exam data properly formatted for ExamInterface", 
                                                f"Exam: {exam_info.get('title')}, "
                                                f"Questions: {len(questions)}, "
                                                f"Sample question type: {sample_question.get('type')}, "
                                                f"Options: {len(options)}")
                                    return True
                                else:
                                    self.log_test("Exam Data Structure", False, 
                                                "MCQ question structure invalid",
                                                f"Options: {len(options)}, Correct answer: {correct_answer}")
                                    return False
                            else:
                                self.log_test("Exam Data Structure", False, 
                                            f"Question missing required fields: {missing_question_fields}")
                                return False
                        else:
                            self.log_test("Exam Data Structure", False, 
                                        "No questions found in exam data")
                            return False
                    else:
                        self.log_test("Exam Data Structure", False, 
                                    f"Exam info missing required fields: {missing_fields}")
                        return False
                else:
                    self.log_test("Exam Data Structure", False, 
                                "No exam info in response")
                    return False
            else:
                self.log_test("Exam Data Structure", False, 
                            f"Failed to get exam data, status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Exam Data Structure", False, f"Request failed: {str(e)}")
            return False
    
    def test_network_error_debugging(self):
        """Test to debug potential network errors from frontend"""
        print("🔍 DEBUGGING NETWORK CONNECTIVITY")
        print("=" * 50)
        
        try:
            # Test different endpoints to isolate issues
            endpoints_to_test = [
                "/",
                "/student/validate-token",
                "/student/create-demo-token"
            ]
            
            all_accessible = True
            
            for endpoint in endpoints_to_test:
                try:
                    if endpoint == "/student/validate-token":
                        # POST request with data
                        response = self.session.post(f"{self.base_url}{endpoint}", 
                                                   json={"token": "DEMO1234"}, timeout=10)
                    elif endpoint == "/student/create-demo-token":
                        # POST request without data
                        response = self.session.post(f"{self.base_url}{endpoint}", timeout=10)
                    else:
                        # GET request
                        response = self.session.get(f"{self.base_url}{endpoint}", timeout=10)
                    
                    if response.status_code in [200, 400, 422]:  # Valid responses
                        self.log_test(f"Network Test ({endpoint})", True, 
                                    f"Endpoint accessible, status: {response.status_code}")
                    else:
                        self.log_test(f"Network Test ({endpoint})", False, 
                                    f"Unexpected status: {response.status_code}")
                        all_accessible = False
                        
                except requests.exceptions.Timeout:
                    self.log_test(f"Network Test ({endpoint})", False, "Request timeout")
                    all_accessible = False
                except requests.exceptions.ConnectionError:
                    self.log_test(f"Network Test ({endpoint})", False, "Connection error")
                    all_accessible = False
                except Exception as e:
                    self.log_test(f"Network Test ({endpoint})", False, f"Error: {str(e)}")
                    all_accessible = False
            
            return all_accessible
            
        except Exception as e:
            self.log_test("Network Debugging", False, f"Test failed: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all token validation tests"""
        print("🎯 STUDENT TOKEN VALIDATION TESTING FOR 'TAKE TEST' FEATURE")
        print("=" * 70)
        print(f"Testing against: {self.base_url}")
        print("=" * 70)
        print()
        
        tests = [
            self.test_backend_accessibility,
            self.test_network_error_debugging,
            self.test_demo_token_validation,
            self.test_admin_token_validation,
            self.test_exam_data_structure
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
            except Exception as e:
                print(f"❌ FAIL: {test.__name__} - Unexpected error: {str(e)}")
        
        print("=" * 70)
        print("📊 FINAL TEST SUMMARY")
        print("=" * 70)
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {total - passed}")
        print(f"📈 Success Rate: {(passed/total)*100:.1f}%")
        print()
        
        if passed == total:
            print("🎉 ALL TESTS PASSED - Token validation is working correctly for 'Take Test' feature!")
            print("✅ Backend is accessible from external URL")
            print("✅ Demo tokens validate successfully")
            print("✅ Admin tokens validate successfully")
            print("✅ Response format includes all required fields for ExamInterface")
            print("✅ Exam data structure is properly formatted")
        else:
            print("⚠️  SOME TESTS FAILED - Issues found that may cause 'Network error' in frontend:")
            failed_tests = [result for result in self.test_results if not result['success']]
            for failed in failed_tests:
                print(f"   • {failed['test']}: {failed['message']}")
        
        return passed == total

if __name__ == "__main__":
    tester = TokenValidationTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)