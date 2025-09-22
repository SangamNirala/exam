#!/usr/bin/env python3
"""
Focused Token Validation Test for Review Request
Tests that backend token validation endpoints are still working correctly 
after frontend face verification removal.
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://examflow-8.preview.emergentagent.com/api"

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
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
    
    def test_backend_connectivity(self):
        """Test that backend is running on port 8001 (mapped to external URL)"""
        try:
            response = self.session.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Backend Connectivity", True, 
                            f"Backend is running correctly", 
                            f"Response: {data}")
                return True
            else:
                self.log_test("Backend Connectivity", False, 
                            f"Backend returned status {response.status_code}",
                            f"Response: {response.text}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Backend Connectivity", False, 
                        f"Backend connection failed: {str(e)}")
            return False
    
    def test_demo_token_creation(self):
        """Test demo token creation endpoint"""
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

    def test_token_validation_demo_tokens(self):
        """Test POST /api/student/validate-token with demo tokens (DEMO1234, TEST5678, SAMPLE99)"""
        if not hasattr(self, 'demo_tokens') or not self.demo_tokens:
            self.log_test("Token Validation Demo Tokens", False, 
                        "No demo tokens available for testing")
            return False
            
        try:
            # Test each specific demo token mentioned in the review request
            demo_tokens_to_test = ['DEMO1234', 'TEST5678', 'SAMPLE99']
            valid_tokens_tested = 0
            
            for token in demo_tokens_to_test:
                test_request = {"token": token}
                
                response = self.session.post(f"{self.base_url}/student/validate-token", 
                                           json=test_request, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    valid = data.get('valid', False)
                    student_token = data.get('student_token')
                    exam_info = data.get('exam_info')
                    message = data.get('message', '')
                    
                    if valid and student_token and exam_info:
                        valid_tokens_tested += 1
                        self.log_test(f"Token Validation ({token})", True, 
                                    "Token validated successfully with proper response format", 
                                    f"Student: {student_token.get('student_name')}, Exam: {exam_info.get('title')}, Duration: {exam_info.get('duration')} min")
                    else:
                        self.log_test(f"Token Validation ({token})", False, 
                                    "Token validation response format incorrect",
                                    f"Valid: {valid}, Student token: {bool(student_token)}, Exam info: {bool(exam_info)}")
                else:
                    self.log_test(f"Token Validation ({token})", False, 
                                f"Token validation failed with status {response.status_code}",
                                f"Response: {response.text}")
            
            if valid_tokens_tested == len(demo_tokens_to_test):
                self.log_test("Token Validation Demo Tokens", True, 
                            f"All {valid_tokens_tested} demo tokens validated successfully with proper response format")
                return True
            else:
                self.log_test("Token Validation Demo Tokens", False, 
                            f"Only {valid_tokens_tested}/{len(demo_tokens_to_test)} tokens validated successfully")
                return False
                
        except Exception as e:
            self.log_test("Token Validation Demo Tokens", False, f"Request failed: {str(e)}")
            return False

    def test_token_validation_invalid_tokens(self):
        """Test that invalid tokens are properly rejected"""
        try:
            invalid_tokens = ["INVALID123", "EXPIRED456", "NOTFOUND789", "", "WRONG_TOKEN"]
            
            rejected_tokens = 0
            for token in invalid_tokens:
                test_request = {"token": token}
                
                response = self.session.post(f"{self.base_url}/student/validate-token", 
                                           json=test_request, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    valid = data.get('valid', True)  # Should be False for invalid tokens
                    message = data.get('message', '')
                    
                    if not valid and message:
                        rejected_tokens += 1
                        self.log_test(f"Invalid Token Rejection ({token or 'empty'})", True, 
                                    "Invalid token correctly rejected", 
                                    f"Message: {message}")
                    else:
                        self.log_test(f"Invalid Token Rejection ({token or 'empty'})", False, 
                                    "Invalid token was not properly rejected",
                                    f"Valid: {valid}, Message: {message}")
                else:
                    self.log_test(f"Invalid Token Rejection ({token or 'empty'})", False, 
                                f"Unexpected status code {response.status_code}",
                                f"Response: {response.text}")
            
            if rejected_tokens == len(invalid_tokens):
                self.log_test("Token Validation Invalid Tokens", True, 
                            f"All {rejected_tokens} invalid tokens properly rejected")
                return True
            else:
                self.log_test("Token Validation Invalid Tokens", False, 
                            f"Only {rejected_tokens}/{len(invalid_tokens)} invalid tokens properly rejected")
                return False
                
        except Exception as e:
            self.log_test("Token Validation Invalid Tokens", False, f"Request failed: {str(e)}")
            return False

    def test_response_format_validation(self):
        """Test that token validation returns proper response format"""
        if not hasattr(self, 'demo_tokens') or not self.demo_tokens:
            self.log_test("Response Format Validation", False, 
                        "No demo tokens available for testing")
            return False
            
        try:
            # Test with first demo token
            test_request = {"token": self.demo_tokens[0]}
            
            response = self.session.post(f"{self.base_url}/student/validate-token", 
                                       json=test_request, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields in response
                required_fields = ['valid', 'message']
                optional_fields = ['student_token', 'exam_info']
                
                missing_required = [field for field in required_fields if field not in data]
                
                if not missing_required:
                    # Check student_token structure if present
                    student_token = data.get('student_token')
                    exam_info = data.get('exam_info')
                    
                    student_token_valid = True
                    exam_info_valid = True
                    
                    if student_token:
                        required_student_fields = ['id', 'token', 'exam_id']
                        missing_student_fields = [field for field in required_student_fields if field not in student_token]
                        if missing_student_fields:
                            student_token_valid = False
                    
                    if exam_info:
                        required_exam_fields = ['id', 'title', 'duration']
                        missing_exam_fields = [field for field in required_exam_fields if field not in exam_info]
                        if missing_exam_fields:
                            exam_info_valid = False
                    
                    if student_token_valid and exam_info_valid:
                        self.log_test("Response Format Validation", True, 
                                    "Token validation response has proper format", 
                                    f"All required fields present, student_token and exam_info properly structured")
                        return True
                    else:
                        self.log_test("Response Format Validation", False, 
                                    "Token validation response format issues",
                                    f"Student token valid: {student_token_valid}, Exam info valid: {exam_info_valid}")
                        return False
                else:
                    self.log_test("Response Format Validation", False, 
                                "Token validation response missing required fields",
                                f"Missing fields: {missing_required}")
                    return False
            else:
                self.log_test("Response Format Validation", False, 
                            f"Token validation failed with status {response.status_code}",
                            f"Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Response Format Validation", False, f"Request failed: {str(e)}")
            return False

    def test_no_regression_after_frontend_changes(self):
        """Test that backend functionality remains unchanged after frontend face verification removal"""
        try:
            # This test verifies that all backend endpoints are still accessible
            # and working as expected, confirming no regression occurred
            
            # Test 1: Demo token creation still works
            response = self.session.post(f"{self.base_url}/student/create-demo-token", timeout=10)
            demo_creation_works = response.status_code == 200 and response.json().get('success', False)
            
            # Test 2: Token validation still works
            if demo_creation_works:
                tokens = response.json().get('tokens', [])
                if tokens:
                    test_request = {"token": tokens[0]}
                    response = self.session.post(f"{self.base_url}/student/validate-token", 
                                               json=test_request, timeout=10)
                    token_validation_works = response.status_code == 200 and response.json().get('valid', False)
                else:
                    token_validation_works = False
            else:
                token_validation_works = False
            
            # Test 3: Face verification endpoint still exists (even if frontend doesn't use it)
            if tokens:
                import base64
                sample_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg=="
                test_request = {
                    "token": tokens[0],
                    "face_image_data": f"data:image/png;base64,{sample_image_b64}",
                    "confidence_threshold": 0.8
                }
                response = self.session.post(f"{self.base_url}/student/face-verification", 
                                           json=test_request, timeout=15)
                face_verification_works = response.status_code == 200
            else:
                face_verification_works = False
            
            if demo_creation_works and token_validation_works and face_verification_works:
                self.log_test("No Regression After Frontend Changes", True, 
                            "All backend endpoints remain functional after frontend face verification removal", 
                            "Demo creation, token validation, and face verification endpoints all working")
                return True
            else:
                self.log_test("No Regression After Frontend Changes", False, 
                            "Some backend functionality may have been affected",
                            f"Demo creation: {demo_creation_works}, Token validation: {token_validation_works}, Face verification: {face_verification_works}")
                return False
                
        except Exception as e:
            self.log_test("No Regression After Frontend Changes", False, f"Regression test failed: {str(e)}")
            return False

    def run_focused_tests(self):
        """Run focused tests for the review request"""
        print(f"🔍 FOCUSED TOKEN VALIDATION TEST - Review Request")
        print(f"📡 Testing against: {self.base_url}")
        print(f"🎯 Focus: Token validation endpoints after frontend face verification removal")
        print("=" * 80)
        
        # Initialize variables
        self.demo_tokens = []
        self.demo_exam_id = None
        
        # Test 1: Verify backend is running correctly on port 8001 (mapped to external URL)
        if not self.test_backend_connectivity():
            print("❌ Backend server is not accessible. Stopping tests.")
            return False
        
        # Test 2: Create demo tokens for testing
        demo_tokens = self.test_demo_token_creation()
        
        # Test 3: Test POST /api/student/validate-token with demo tokens (DEMO1234, TEST5678, SAMPLE99)
        if demo_tokens:
            self.test_token_validation_demo_tokens()
        
        # Test 4: Verify that token validation returns proper response format
        if demo_tokens:
            self.test_response_format_validation()
        
        # Test 5: Test that invalid tokens are still properly rejected
        self.test_token_validation_invalid_tokens()
        
        # Test 6: Verify no regression after frontend changes
        self.test_no_regression_after_frontend_changes()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 FOCUSED TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        failed = len(self.test_results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        # Show critical failures
        if failed > 0:
            failures = [r for r in self.test_results if not r['success']]
            print(f"\n🚨 ISSUES FOUND:")
            for failure in failures:
                print(f"   • {failure['test']}: {failure['message']}")
        else:
            print(f"\n🎉 ALL TESTS PASSED!")
            print(f"✅ Backend token validation endpoints are working correctly after frontend face verification removal")
            print(f"✅ Demo tokens (DEMO1234, TEST5678, SAMPLE99) validate successfully")
            print(f"✅ Invalid tokens are properly rejected")
            print(f"✅ Response format is correct")
            print(f"✅ No regression detected")
        
        return failed == 0

if __name__ == "__main__":
    tester = TokenValidationTester()
    success = tester.run_focused_tests()
    sys.exit(0 if success else 1)