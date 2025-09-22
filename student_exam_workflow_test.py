#!/usr/bin/env python3
"""
Student Exam Workflow Test - Focus on Exam Interface Bug Fix
Tests the complete student authentication flow and exam interface functionality
"""

import requests
import json
import sys
from datetime import datetime
import uuid

# Get backend URL from frontend .env
BACKEND_URL = "https://examflow-8.preview.emergentagent.com/api"

class StudentExamWorkflowTester:
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
    
    def test_demo_token_creation_and_validation(self):
        """Test demo token creation and validation workflow"""
        print("\n🔐 Testing Demo Token Creation and Validation...")
        print("=" * 60)
        
        try:
            # Step 1: Create demo tokens
            response = self.session.post(f"{self.base_url}/student/create-demo-token", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                tokens = data.get('tokens', [])
                exam_info = data.get('exam_info', {})
                
                if tokens and exam_info:
                    self.demo_tokens = tokens
                    self.demo_exam_info = exam_info
                    
                    self.log_test("Demo Token Creation", True, 
                                f"Created {len(tokens)} demo tokens successfully", 
                                f"Tokens: {tokens}, Exam: {exam_info.get('title')}")
                    
                    # Step 2: Validate each demo token
                    valid_tokens = 0
                    for token in tokens:
                        validation_request = {"token": token}
                        validation_response = self.session.post(f"{self.base_url}/student/validate-token", 
                                                              json=validation_request, timeout=10)
                        
                        if validation_response.status_code == 200:
                            validation_data = validation_response.json()
                            if validation_data.get('valid'):
                                valid_tokens += 1
                                student_token = validation_data.get('student_token', {})
                                exam_info_response = validation_data.get('exam_info', {})
                                
                                self.log_test(f"Token Validation ({token})", True, 
                                            "Token validated successfully", 
                                            f"Student: {student_token.get('student_name')}, Exam: {exam_info_response.get('title')}")
                            else:
                                self.log_test(f"Token Validation ({token})", False, 
                                            "Token validation failed", 
                                            f"Response: {validation_data}")
                        else:
                            self.log_test(f"Token Validation ({token})", False, 
                                        f"Validation request failed with status {validation_response.status_code}")
                    
                    if valid_tokens == len(tokens):
                        self.log_test("Complete Token Validation Workflow", True, 
                                    f"All {valid_tokens} demo tokens validated successfully")
                        return True
                    else:
                        self.log_test("Complete Token Validation Workflow", False, 
                                    f"Only {valid_tokens}/{len(tokens)} tokens validated successfully")
                        return False
                else:
                    self.log_test("Demo Token Creation", False, 
                                "Demo token creation response incomplete")
                    return False
            else:
                self.log_test("Demo Token Creation", False, 
                            f"Demo token creation failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Demo Token Creation and Validation", False, f"Request failed: {str(e)}")
            return False

    def test_exam_data_structure(self):
        """Test that exam data structure is properly returned for frontend consumption"""
        print("\n📊 Testing Exam Data Structure for Frontend...")
        print("=" * 60)
        
        if not hasattr(self, 'demo_tokens') or not self.demo_tokens:
            self.log_test("Exam Data Structure", False, "No demo tokens available for testing")
            return False
            
        try:
            # Use first demo token to get exam data
            token = self.demo_tokens[0]
            validation_request = {"token": token}
            
            response = self.session.post(f"{self.base_url}/student/validate-token", 
                                       json=validation_request, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                exam_info = data.get('exam_info', {})
                
                # Check required fields for frontend exam interface
                required_fields = ['id', 'title', 'duration', 'question_count']
                missing_fields = [field for field in required_fields if not exam_info.get(field)]
                
                if not missing_fields:
                    self.log_test("Exam Data Structure - Required Fields", True, 
                                "All required exam fields present", 
                                f"ID: {exam_info.get('id')}, Title: {exam_info.get('title')}, Duration: {exam_info.get('duration')} min, Questions: {exam_info.get('question_count')}")
                    
                    # Test getting the actual assessment with questions
                    assessment_response = self.session.get(f"{self.base_url}/assessments/{exam_info.get('id')}", timeout=10)
                    
                    if assessment_response.status_code == 200:
                        assessment_data = assessment_response.json()
                        questions = assessment_data.get('questions', [])
                        
                        if questions:
                            # Verify question structure
                            sample_question = questions[0]
                            question_fields = ['id', 'type', 'question']
                            missing_question_fields = [field for field in question_fields if not sample_question.get(field)]
                            
                            if not missing_question_fields:
                                self.log_test("Exam Data Structure - Questions", True, 
                                            f"Questions properly structured with {len(questions)} questions", 
                                            f"Sample question type: {sample_question.get('type')}, Question: {sample_question.get('question')[:50]}...")
                                
                                # Check MCQ structure if applicable
                                if sample_question.get('type') == 'mcq':
                                    options = sample_question.get('options', [])
                                    correct_answer = sample_question.get('correct_answer')
                                    
                                    if options and correct_answer is not None:
                                        self.log_test("Exam Data Structure - MCQ Format", True, 
                                                    "MCQ questions properly formatted", 
                                                    f"Options: {len(options)}, Correct answer index: {correct_answer}")
                                        return True
                                    else:
                                        self.log_test("Exam Data Structure - MCQ Format", False, 
                                                    "MCQ questions missing options or correct answer")
                                        return False
                                else:
                                    self.log_test("Exam Data Structure - Question Format", True, 
                                                "Non-MCQ questions properly formatted")
                                    return True
                            else:
                                self.log_test("Exam Data Structure - Questions", False, 
                                            f"Questions missing required fields: {missing_question_fields}")
                                return False
                        else:
                            self.log_test("Exam Data Structure - Questions", False, 
                                        "No questions found in assessment")
                            return False
                    else:
                        self.log_test("Exam Data Structure - Assessment Retrieval", False, 
                                    f"Failed to retrieve assessment with status {assessment_response.status_code}")
                        return False
                else:
                    self.log_test("Exam Data Structure - Required Fields", False, 
                                f"Exam info missing required fields: {missing_fields}")
                    return False
            else:
                self.log_test("Exam Data Structure", False, 
                            f"Token validation failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Exam Data Structure", False, f"Request failed: {str(e)}")
            return False

    def test_complete_authentication_workflow(self):
        """Test the complete authentication workflow from token to exam data"""
        print("\n🔄 Testing Complete Authentication Workflow...")
        print("=" * 60)
        
        if not hasattr(self, 'demo_tokens') or not self.demo_tokens:
            self.log_test("Complete Authentication Workflow", False, "No demo tokens available for testing")
            return False
            
        try:
            workflow_steps = []
            token = self.demo_tokens[0]
            
            # Step 1: Token Validation
            validation_request = {"token": token}
            validation_response = self.session.post(f"{self.base_url}/student/validate-token", 
                                                  json=validation_request, timeout=10)
            
            if validation_response.status_code == 200:
                validation_data = validation_response.json()
                if validation_data.get('valid'):
                    workflow_steps.append("✅ Token Validation")
                    student_token = validation_data.get('student_token', {})
                    exam_info = validation_data.get('exam_info', {})
                    
                    # Step 2: Get Full Assessment Data (what frontend needs for exam interface)
                    assessment_response = self.session.get(f"{self.base_url}/assessments/{exam_info.get('id')}", timeout=10)
                    
                    if assessment_response.status_code == 200:
                        assessment_data = assessment_response.json()
                        questions = assessment_data.get('questions', [])
                        
                        if questions:
                            workflow_steps.append("✅ Assessment Data Retrieval")
                            
                            # Step 3: Simulate Face Verification (even though it's disabled, backend still supports it)
                            # This tests that the backend can handle the complete workflow
                            import base64
                            sample_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg=="
                            
                            face_verification_request = {
                                "token": token,
                                "face_image_data": f"data:image/png;base64,{sample_image_b64}",
                                "confidence_threshold": 0.8
                            }
                            
                            face_response = self.session.post(f"{self.base_url}/student/face-verification", 
                                                            json=face_verification_request, timeout=15)
                            
                            if face_response.status_code == 200:
                                face_data = face_response.json()
                                if face_data.get('verified'):
                                    workflow_steps.append("✅ Face Verification (Backend Support)")
                                    session_id = face_data.get('session_id')
                                    
                                    # Complete workflow verification
                                    self.log_test("Complete Authentication Workflow", True, 
                                                f"Full workflow completed successfully", 
                                                f"Steps: {' → '.join(workflow_steps)}, Session ID: {session_id}")
                                    
                                    # Test exam data completeness for frontend
                                    exam_data_complete = all([
                                        assessment_data.get('title'),
                                        assessment_data.get('duration'),
                                        len(questions) > 0,
                                        questions[0].get('question'),
                                        questions[0].get('type')
                                    ])
                                    
                                    if exam_data_complete:
                                        self.log_test("Exam Data Completeness", True, 
                                                    "All exam data required for frontend is available", 
                                                    f"Title: {assessment_data.get('title')}, Questions: {len(questions)}, Duration: {assessment_data.get('duration')} min")
                                        return True
                                    else:
                                        self.log_test("Exam Data Completeness", False, 
                                                    "Exam data incomplete for frontend consumption")
                                        return False
                                else:
                                    workflow_steps.append("❌ Face Verification Failed")
                                    self.log_test("Complete Authentication Workflow", False, 
                                                f"Face verification failed: {face_data.get('message')}")
                                    return False
                            else:
                                workflow_steps.append("❌ Face Verification Error")
                                self.log_test("Complete Authentication Workflow", False, 
                                            f"Face verification request failed with status {face_response.status_code}")
                                return False
                        else:
                            workflow_steps.append("❌ No Questions Found")
                            self.log_test("Complete Authentication Workflow", False, 
                                        "Assessment has no questions")
                            return False
                    else:
                        workflow_steps.append("❌ Assessment Retrieval Failed")
                        self.log_test("Complete Authentication Workflow", False, 
                                    f"Assessment retrieval failed with status {assessment_response.status_code}")
                        return False
                else:
                    workflow_steps.append("❌ Token Invalid")
                    self.log_test("Complete Authentication Workflow", False, 
                                f"Token validation failed: {validation_data.get('message')}")
                    return False
            else:
                workflow_steps.append("❌ Token Validation Error")
                self.log_test("Complete Authentication Workflow", False, 
                            f"Token validation request failed with status {validation_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Complete Authentication Workflow", False, f"Workflow failed: {str(e)}")
            return False

    def test_exam_interface_data_requirements(self):
        """Test that backend provides all data required by ExamInterface component"""
        print("\n🖥️ Testing Exam Interface Data Requirements...")
        print("=" * 60)
        
        if not hasattr(self, 'demo_tokens') or not self.demo_tokens:
            self.log_test("Exam Interface Data Requirements", False, "No demo tokens available for testing")
            return False
            
        try:
            token = self.demo_tokens[0]
            
            # Get exam info from token validation
            validation_request = {"token": token}
            validation_response = self.session.post(f"{self.base_url}/student/validate-token", 
                                                  json=validation_request, timeout=10)
            
            if validation_response.status_code == 200:
                validation_data = validation_response.json()
                exam_info = validation_data.get('exam_info', {})
                
                # Get full assessment data
                assessment_response = self.session.get(f"{self.base_url}/assessments/{exam_info.get('id')}", timeout=10)
                
                if assessment_response.status_code == 200:
                    assessment_data = assessment_response.json()
                    
                    # Check ExamInterface requirements based on the component code
                    interface_requirements = {
                        'title': assessment_data.get('title'),
                        'duration': assessment_data.get('duration'),
                        'questions': assessment_data.get('questions', []),
                        'exam_type': assessment_data.get('exam_type'),
                        'difficulty': assessment_data.get('difficulty')
                    }
                    
                    missing_requirements = []
                    for key, value in interface_requirements.items():
                        if not value:
                            missing_requirements.append(key)
                    
                    if not missing_requirements:
                        # Test question structure for MCQ questions
                        questions = interface_requirements['questions']
                        mcq_questions = [q for q in questions if q.get('type') == 'mcq']
                        
                        if mcq_questions:
                            sample_mcq = mcq_questions[0]
                            mcq_requirements = {
                                'question': sample_mcq.get('question'),
                                'options': sample_mcq.get('options'),
                                'correct_answer': sample_mcq.get('correct_answer'),
                                'type': sample_mcq.get('type')
                            }
                            
                            missing_mcq_fields = [k for k, v in mcq_requirements.items() if v is None]
                            
                            if not missing_mcq_fields:
                                self.log_test("Exam Interface Data Requirements", True, 
                                            "All ExamInterface data requirements met", 
                                            f"Title: {interface_requirements['title']}, Questions: {len(questions)}, MCQ Options: {len(sample_mcq.get('options', []))}")
                                
                                # Test that questions have proper structure for frontend rendering
                                question_structure_valid = True
                                for i, question in enumerate(questions[:3]):  # Test first 3 questions
                                    if question.get('type') == 'mcq':
                                        if not (question.get('options') and len(question.get('options', [])) >= 2):
                                            question_structure_valid = False
                                            self.log_test(f"Question Structure (Q{i+1})", False, 
                                                        "MCQ question has insufficient options")
                                        else:
                                            self.log_test(f"Question Structure (Q{i+1})", True, 
                                                        f"MCQ question properly structured with {len(question.get('options', []))} options")
                                    else:
                                        self.log_test(f"Question Structure (Q{i+1})", True, 
                                                    f"Non-MCQ question properly structured")
                                
                                if question_structure_valid:
                                    self.log_test("Question Structure Validation", True, 
                                                "All questions properly structured for frontend rendering")
                                    return True
                                else:
                                    self.log_test("Question Structure Validation", False, 
                                                "Some questions have structural issues")
                                    return False
                            else:
                                self.log_test("Exam Interface Data Requirements", False, 
                                            f"MCQ questions missing required fields: {missing_mcq_fields}")
                                return False
                        else:
                            self.log_test("Exam Interface Data Requirements", True, 
                                        "No MCQ questions to validate, other requirements met")
                            return True
                    else:
                        self.log_test("Exam Interface Data Requirements", False, 
                                    f"Missing required fields for ExamInterface: {missing_requirements}")
                        return False
                else:
                    self.log_test("Exam Interface Data Requirements", False, 
                                f"Failed to retrieve assessment data with status {assessment_response.status_code}")
                    return False
            else:
                self.log_test("Exam Interface Data Requirements", False, 
                            f"Token validation failed with status {validation_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Exam Interface Data Requirements", False, f"Request failed: {str(e)}")
            return False

    def test_error_handling_scenarios(self):
        """Test error handling scenarios that could cause infinite loops"""
        print("\n⚠️ Testing Error Handling Scenarios...")
        print("=" * 60)
        
        try:
            error_scenarios_passed = 0
            total_scenarios = 0
            
            # Scenario 1: Invalid token
            total_scenarios += 1
            invalid_token_request = {"token": "INVALID_TOKEN_123"}
            response = self.session.post(f"{self.base_url}/student/validate-token", 
                                       json=invalid_token_request, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if not data.get('valid') and data.get('message'):
                    error_scenarios_passed += 1
                    self.log_test("Error Handling - Invalid Token", True, 
                                "Invalid token properly rejected with helpful message", 
                                f"Message: {data.get('message')}")
                else:
                    self.log_test("Error Handling - Invalid Token", False, 
                                "Invalid token not properly handled")
            else:
                self.log_test("Error Handling - Invalid Token", False, 
                            f"Unexpected status code {response.status_code}")
            
            # Scenario 2: Malformed request
            total_scenarios += 1
            try:
                malformed_response = self.session.post(f"{self.base_url}/student/validate-token", 
                                                     json={}, timeout=10)
                
                if malformed_response.status_code in [400, 422]:
                    error_scenarios_passed += 1
                    self.log_test("Error Handling - Malformed Request", True, 
                                f"Malformed request properly rejected with status {malformed_response.status_code}")
                else:
                    self.log_test("Error Handling - Malformed Request", False, 
                                f"Malformed request not properly handled, got status {malformed_response.status_code}")
            except Exception as e:
                self.log_test("Error Handling - Malformed Request", False, f"Request failed: {str(e)}")
            
            # Scenario 3: Non-existent assessment
            total_scenarios += 1
            try:
                nonexistent_response = self.session.get(f"{self.base_url}/assessments/non-existent-id", timeout=10)
                
                if nonexistent_response.status_code == 404 or (nonexistent_response.status_code == 200 and 'error' in nonexistent_response.json()):
                    error_scenarios_passed += 1
                    self.log_test("Error Handling - Non-existent Assessment", True, 
                                "Non-existent assessment properly handled")
                else:
                    self.log_test("Error Handling - Non-existent Assessment", False, 
                                f"Non-existent assessment not properly handled, got status {nonexistent_response.status_code}")
            except Exception as e:
                self.log_test("Error Handling - Non-existent Assessment", False, f"Request failed: {str(e)}")
            
            if error_scenarios_passed == total_scenarios:
                self.log_test("Error Handling Scenarios", True, 
                            f"All {total_scenarios} error scenarios handled correctly")
                return True
            else:
                self.log_test("Error Handling Scenarios", False, 
                            f"Only {error_scenarios_passed}/{total_scenarios} error scenarios handled correctly")
                return False
                
        except Exception as e:
            self.log_test("Error Handling Scenarios", False, f"Error handling test failed: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all student exam workflow tests"""
        print("🚀 Starting Student Exam Workflow Tests")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 80)
        
        tests = [
            self.test_demo_token_creation_and_validation,
            self.test_exam_data_structure,
            self.test_complete_authentication_workflow,
            self.test_exam_interface_data_requirements,
            self.test_error_handling_scenarios
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed_tests += 1
            except Exception as e:
                print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
        
        print("\n" + "=" * 80)
        print("📊 STUDENT EXAM WORKFLOW TEST SUMMARY")
        print("=" * 80)
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {total_tests - passed_tests}")
        print(f"📈 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if passed_tests == total_tests:
            print("\n🎉 All student exam workflow tests passed!")
            print("✅ Backend is ready to support frontend exam interface")
            return True
        else:
            print(f"\n⚠️ {total_tests - passed_tests} test(s) failed")
            print("❌ Backend may have issues supporting frontend exam interface")
            return False

if __name__ == "__main__":
    tester = StudentExamWorkflowTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)