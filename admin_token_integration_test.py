#!/usr/bin/env python3
"""
Admin Token Integration Workflow Test
Comprehensive testing of admin token creation and validation flow
"""

import requests
import json
import sys
import re
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://loadingbug.preview.emergentagent.com/api"

class AdminTokenIntegrationTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        self.created_tokens = []
        
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
    
    def get_existing_exam_ids(self):
        """Get existing exam IDs from assessments collection"""
        try:
            response = self.session.get(f"{self.base_url}/assessments", timeout=10)
            if response.status_code == 200:
                assessments = response.json()
                exam_ids = []
                for assessment in assessments:
                    exam_ids.append({
                        'id': assessment.get('id'),
                        'title': assessment.get('title'),
                        'questions': len(assessment.get('questions', []))
                    })
                return exam_ids
            return []
        except Exception as e:
            print(f"Failed to get existing exam IDs: {str(e)}")
            return []
    
    def test_admin_token_creation_with_existing_exams(self):
        """Test 1: Create tokens using POST /api/admin/create-token with valid exam IDs"""
        print("🔑 TEST 1: Admin Token Creation with Existing Exam IDs")
        print("=" * 60)
        
        exam_ids = self.get_existing_exam_ids()
        if not exam_ids:
            self.log_test("Admin Token Creation", False, 
                        "No existing exams found for testing")
            return False
        
        print(f"Found {len(exam_ids)} existing exams:")
        for exam in exam_ids[:3]:  # Show first 3
            print(f"  - {exam['title']} (ID: {exam['id']}, Questions: {exam['questions']})")
        print()
        
        tokens_created = 0
        for i, exam in enumerate(exam_ids[:3]):  # Test with first 3 exams
            try:
                token_request = {
                    "exam_id": exam['id'],
                    "student_name": f"Student {i+1}",
                    "max_usage": 1,
                    "expires_in_hours": 24
                }
                
                response = self.session.post(f"{self.base_url}/admin/create-token", 
                                           json=token_request, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success') and data.get('token'):
                        token = data.get('token')
                        
                        # Verify token format (XXXX-XXX)
                        token_pattern = r'^[A-Z0-9]{4}-[A-Z0-9]{3}$'
                        if re.match(token_pattern, token):
                            self.created_tokens.append({
                                'token': token,
                                'exam_id': exam['id'],
                                'exam_title': exam['title']
                            })
                            tokens_created += 1
                            
                            self.log_test(f"Token Creation for {exam['title'][:30]}...", True, 
                                        f"Token {token} created successfully",
                                        f"Format: XXXX-XXX, Exam: {exam['title']}")
                        else:
                            self.log_test(f"Token Creation for {exam['title'][:30]}...", False, 
                                        f"Token format invalid: {token}")
                    else:
                        self.log_test(f"Token Creation for {exam['title'][:30]}...", False, 
                                    f"Token creation failed: {data.get('message', 'Unknown error')}")
                else:
                    self.log_test(f"Token Creation for {exam['title'][:30]}...", False, 
                                f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_test(f"Token Creation for {exam['title'][:30]}...", False, 
                            f"Request failed: {str(e)}")
        
        if tokens_created > 0:
            self.log_test("Admin Token Creation Summary", True, 
                        f"Successfully created {tokens_created} admin tokens",
                        f"All tokens follow XXXX-XXX format")
            return True
        else:
            self.log_test("Admin Token Creation Summary", False, 
                        "No admin tokens were created successfully")
            return False
    
    def test_token_storage_verification(self):
        """Test 2: Verify tokens are stored correctly in student_tokens collection"""
        print("🗄️ TEST 2: Token Storage Verification")
        print("=" * 60)
        
        if not self.created_tokens:
            self.log_test("Token Storage Verification", False, 
                        "No tokens available for storage testing")
            return False
        
        stored_correctly = 0
        for token_info in self.created_tokens:
            try:
                # Verify token is stored by attempting validation
                test_request = {"token": token_info['token']}
                response = self.session.post(f"{self.base_url}/student/validate-token", 
                                           json=test_request, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('valid'):
                        student_token = data.get('student_token', {})
                        exam_info = data.get('exam_info', {})
                        
                        # Verify all required fields are present
                        required_fields = ['id', 'token', 'exam_id', 'expires_at']
                        missing_fields = [field for field in required_fields if not student_token.get(field)]
                        
                        # Verify data integrity
                        token_matches = student_token.get('token') == token_info['token']
                        exam_id_matches = student_token.get('exam_id') == token_info['exam_id']
                        exam_title_matches = exam_info.get('title') == token_info['exam_title']
                        
                        if not missing_fields and token_matches and exam_id_matches and exam_title_matches:
                            stored_correctly += 1
                            self.log_test(f"Storage Verification ({token_info['token']})", True, 
                                        "Token stored correctly with all required fields",
                                        f"Token ID: {student_token.get('id')}, Exam: {exam_info.get('title')}")
                        else:
                            issues = []
                            if missing_fields:
                                issues.append(f"Missing fields: {missing_fields}")
                            if not token_matches:
                                issues.append("Token mismatch")
                            if not exam_id_matches:
                                issues.append("Exam ID mismatch")
                            if not exam_title_matches:
                                issues.append("Exam title mismatch")
                            
                            self.log_test(f"Storage Verification ({token_info['token']})", False, 
                                        f"Storage issues: {', '.join(issues)}")
                    else:
                        self.log_test(f"Storage Verification ({token_info['token']})", False, 
                                    "Token not found in database or marked as invalid")
                else:
                    self.log_test(f"Storage Verification ({token_info['token']})", False, 
                                f"Validation request failed: HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Storage Verification ({token_info['token']})", False, 
                            f"Request failed: {str(e)}")
        
        if stored_correctly == len(self.created_tokens):
            self.log_test("Token Storage Summary", True, 
                        f"All {stored_correctly} tokens stored correctly in student_tokens collection")
            return True
        else:
            self.log_test("Token Storage Summary", False, 
                        f"Only {stored_correctly}/{len(self.created_tokens)} tokens stored correctly")
            return False
    
    def test_admin_token_validation(self):
        """Test 3: Test token validation with admin-generated tokens (XXXX-XXX format)"""
        print("✅ TEST 3: Admin Token Validation (XXXX-XXX Format)")
        print("=" * 60)
        
        if not self.created_tokens:
            self.log_test("Admin Token Validation", False, 
                        "No admin tokens available for validation testing")
            return False
        
        validated_successfully = 0
        for token_info in self.created_tokens:
            try:
                test_request = {"token": token_info['token']}
                response = self.session.post(f"{self.base_url}/student/validate-token", 
                                           json=test_request, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    valid = data.get('valid', False)
                    student_token = data.get('student_token')
                    exam_info = data.get('exam_info')
                    
                    if valid and student_token and exam_info:
                        # Verify response structure and data
                        token_from_response = student_token.get('token')
                        exam_title = exam_info.get('title')
                        student_name = student_token.get('student_name')
                        
                        if token_from_response == token_info['token']:
                            validated_successfully += 1
                            self.log_test(f"Validation ({token_info['token']})", True, 
                                        "Admin token validated successfully",
                                        f"Student: {student_name}, Exam: {exam_title}, Duration: {exam_info.get('duration')} min")
                        else:
                            self.log_test(f"Validation ({token_info['token']})", False, 
                                        "Token validation data mismatch")
                    else:
                        self.log_test(f"Validation ({token_info['token']})", False, 
                                    f"Validation response incomplete: valid={valid}, student_token={bool(student_token)}, exam_info={bool(exam_info)}")
                else:
                    self.log_test(f"Validation ({token_info['token']})", False, 
                                f"Validation failed: HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Validation ({token_info['token']})", False, 
                            f"Request failed: {str(e)}")
        
        if validated_successfully == len(self.created_tokens):
            self.log_test("Admin Token Validation Summary", True, 
                        f"All {validated_successfully} admin tokens validated successfully")
            return True
        else:
            self.log_test("Admin Token Validation Summary", False, 
                        f"Only {validated_successfully}/{len(self.created_tokens)} admin tokens validated successfully")
            return False
    
    def test_demo_token_compatibility(self):
        """Test 4: Verify tokens work with existing demo tokens (8-character format)"""
        print("🔄 TEST 4: Demo Token Compatibility (8-Character Format)")
        print("=" * 60)
        
        # First create demo tokens
        try:
            response = self.session.post(f"{self.base_url}/student/create-demo-token", timeout=10)
            if response.status_code != 200:
                self.log_test("Demo Token Creation", False, 
                            "Failed to create demo tokens for compatibility testing")
                return False
        except Exception as e:
            self.log_test("Demo Token Creation", False, f"Request failed: {str(e)}")
            return False
        
        # Test demo tokens
        demo_tokens = ['DEMO1234', 'TEST5678', 'SAMPLE99']
        demo_validated = 0
        
        for demo_token in demo_tokens:
            try:
                test_request = {"token": demo_token}
                response = self.session.post(f"{self.base_url}/student/validate-token", 
                                           json=test_request, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('valid'):
                        demo_validated += 1
                        exam_info = data.get('exam_info', {})
                        self.log_test(f"Demo Token ({demo_token})", True, 
                                    "8-character demo token works correctly",
                                    f"Exam: {exam_info.get('title')}")
                    else:
                        self.log_test(f"Demo Token ({demo_token})", False, 
                                    "Demo token validation failed")
                else:
                    self.log_test(f"Demo Token ({demo_token})", False, 
                                f"Demo token request failed: HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Demo Token ({demo_token})", False, f"Request failed: {str(e)}")
        
        # Test admin tokens again to ensure compatibility
        admin_validated = 0
        for token_info in self.created_tokens[:2]:  # Test first 2 admin tokens
            try:
                test_request = {"token": token_info['token']}
                response = self.session.post(f"{self.base_url}/student/validate-token", 
                                           json=test_request, timeout=10)
                
                if response.status_code == 200 and response.json().get('valid'):
                    admin_validated += 1
                    self.log_test(f"Admin Token ({token_info['token']})", True, 
                                "XXXX-XXX admin token still works correctly")
                else:
                    self.log_test(f"Admin Token ({token_info['token']})", False, 
                                "Admin token validation failed after demo token testing")
                    
            except Exception as e:
                self.log_test(f"Admin Token ({token_info['token']})", False, f"Request failed: {str(e)}")
        
        total_expected = len(demo_tokens) + min(2, len(self.created_tokens))
        total_validated = demo_validated + admin_validated
        
        if total_validated == total_expected:
            self.log_test("Token Format Compatibility", True, 
                        f"Both 8-character demo tokens and XXXX-XXX admin tokens work correctly",
                        f"Demo tokens: {demo_validated}/{len(demo_tokens)}, Admin tokens: {admin_validated}/{min(2, len(self.created_tokens))}")
            return True
        else:
            self.log_test("Token Format Compatibility", False, 
                        f"Token compatibility issues: {total_validated}/{total_expected} tokens working")
            return False
    
    def test_edge_cases(self):
        """Test 5: Test edge cases - invalid exam IDs, expired tokens, used tokens"""
        print("⚠️ TEST 5: Edge Cases Testing")
        print("=" * 60)
        
        edge_cases_passed = 0
        total_edge_cases = 0
        
        # Test 1: Invalid exam ID
        try:
            invalid_request = {
                "exam_id": "non-existent-exam-id-12345",
                "student_name": "Test Student",
                "max_usage": 1,
                "expires_in_hours": 24
            }
            
            response = self.session.post(f"{self.base_url}/admin/create-token", 
                                       json=invalid_request, timeout=10)
            
            total_edge_cases += 1
            if response.status_code == 200:
                data = response.json()
                if not data.get('success') and 'not found' in data.get('message', '').lower():
                    edge_cases_passed += 1
                    self.log_test("Edge Case: Invalid Exam ID", True, 
                                "Invalid exam ID correctly rejected",
                                f"Message: {data.get('message')}")
                else:
                    self.log_test("Edge Case: Invalid Exam ID", False, 
                                "Invalid exam ID was not properly rejected")
            else:
                self.log_test("Edge Case: Invalid Exam ID", False, 
                            f"Unexpected response: HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Edge Case: Invalid Exam ID", False, f"Request failed: {str(e)}")
        
        # Test 2: Token with very short expiry (simulate expired token scenario)
        if self.created_tokens:
            try:
                short_expiry_request = {
                    "exam_id": self.created_tokens[0]['exam_id'],
                    "student_name": "Short Expiry Student",
                    "max_usage": 1,
                    "expires_in_hours": 0.001  # Very short expiry
                }
                
                response = self.session.post(f"{self.base_url}/admin/create-token", 
                                           json=short_expiry_request, timeout=10)
                
                total_edge_cases += 1
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        short_token = data.get('token')
                        
                        # Wait a moment then try to validate (should be expired)
                        import time
                        time.sleep(1)
                        
                        test_request = {"token": short_token}
                        val_response = self.session.post(f"{self.base_url}/student/validate-token", 
                                                       json=test_request, timeout=10)
                        
                        if val_response.status_code == 200:
                            val_data = val_response.json()
                            if not val_data.get('valid') and 'expired' in val_data.get('message', '').lower():
                                edge_cases_passed += 1
                                self.log_test("Edge Case: Expired Token", True, 
                                            "Expired token correctly rejected",
                                            f"Message: {val_data.get('message')}")
                            else:
                                self.log_test("Edge Case: Expired Token", False, 
                                            "Expired token was not properly rejected")
                        else:
                            self.log_test("Edge Case: Expired Token", False, 
                                        "Token validation request failed")
                    else:
                        self.log_test("Edge Case: Expired Token", False, 
                                    "Failed to create short expiry token")
                else:
                    self.log_test("Edge Case: Expired Token", False, 
                                f"Token creation failed: HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_test("Edge Case: Expired Token", False, f"Request failed: {str(e)}")
        
        # Test 3: Token usage limit
        if self.created_tokens:
            try:
                # Create a token with max_usage = 1
                single_use_request = {
                    "exam_id": self.created_tokens[0]['exam_id'],
                    "student_name": "Single Use Student",
                    "max_usage": 1,
                    "expires_in_hours": 24
                }
                
                response = self.session.post(f"{self.base_url}/admin/create-token", 
                                           json=single_use_request, timeout=10)
                
                total_edge_cases += 1
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        single_use_token = data.get('token')
                        
                        # First validation should work
                        test_request = {"token": single_use_token}
                        val_response1 = self.session.post(f"{self.base_url}/student/validate-token", 
                                                        json=test_request, timeout=10)
                        
                        if val_response1.status_code == 200 and val_response1.json().get('valid'):
                            # Second validation should fail due to usage limit
                            val_response2 = self.session.post(f"{self.base_url}/student/validate-token", 
                                                            json=test_request, timeout=10)
                            
                            if val_response2.status_code == 200:
                                val_data2 = val_response2.json()
                                if not val_data2.get('valid') and 'used' in val_data2.get('message', '').lower():
                                    edge_cases_passed += 1
                                    self.log_test("Edge Case: Token Usage Limit", True, 
                                                "Token usage limit correctly enforced",
                                                f"Message: {val_data2.get('message')}")
                                else:
                                    self.log_test("Edge Case: Token Usage Limit", False, 
                                                "Token usage limit not properly enforced")
                            else:
                                self.log_test("Edge Case: Token Usage Limit", False, 
                                            "Second validation request failed")
                        else:
                            self.log_test("Edge Case: Token Usage Limit", False, 
                                        "First token validation failed")
                    else:
                        self.log_test("Edge Case: Token Usage Limit", False, 
                                    "Failed to create single-use token")
                else:
                    self.log_test("Edge Case: Token Usage Limit", False, 
                                f"Token creation failed: HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_test("Edge Case: Token Usage Limit", False, f"Request failed: {str(e)}")
        
        if edge_cases_passed == total_edge_cases and total_edge_cases > 0:
            self.log_test("Edge Cases Summary", True, 
                        f"All {total_edge_cases} edge cases handled correctly")
            return True
        else:
            self.log_test("Edge Cases Summary", False, 
                        f"Only {edge_cases_passed}/{total_edge_cases} edge cases handled correctly")
            return False
    
    def run_comprehensive_test(self):
        """Run the complete admin token integration workflow test"""
        print("🚀 ADMIN TOKEN INTEGRATION WORKFLOW TEST")
        print("=" * 80)
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 80)
        print()
        
        # Test connectivity first
        try:
            response = self.session.get(f"{self.base_url}/", timeout=10)
            if response.status_code != 200:
                print("❌ Backend server is not accessible. Stopping tests.")
                return False
        except Exception as e:
            print(f"❌ Backend connectivity failed: {str(e)}")
            return False
        
        print("✅ Backend connectivity confirmed")
        print()
        
        # Run all tests in sequence
        test_results = []
        
        test_results.append(self.test_admin_token_creation_with_existing_exams())
        test_results.append(self.test_token_storage_verification())
        test_results.append(self.test_admin_token_validation())
        test_results.append(self.test_demo_token_compatibility())
        test_results.append(self.test_edge_cases())
        
        # Summary
        print("=" * 80)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        failed = len(self.test_results) - passed
        
        print(f"✅ Total Tests Passed: {passed}")
        print(f"❌ Total Tests Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        print()
        
        # Show test categories
        categories = {
            "Token Creation": 0,
            "Token Storage": 0,
            "Token Validation": 0,
            "Compatibility": 0,
            "Edge Cases": 0
        }
        
        for result in self.test_results:
            if "creation" in result['test'].lower():
                categories["Token Creation"] += 1 if result['success'] else 0
            elif "storage" in result['test'].lower():
                categories["Token Storage"] += 1 if result['success'] else 0
            elif "validation" in result['test'].lower():
                categories["Token Validation"] += 1 if result['success'] else 0
            elif "compatibility" in result['test'].lower():
                categories["Compatibility"] += 1 if result['success'] else 0
            elif "edge" in result['test'].lower():
                categories["Edge Cases"] += 1 if result['success'] else 0
        
        print("📋 Test Categories:")
        for category, count in categories.items():
            print(f"   {category}: {count} tests passed")
        print()
        
        # Show critical failures
        critical_failures = [r for r in self.test_results if not r['success']]
        
        if critical_failures:
            print("🚨 ISSUES FOUND:")
            for failure in critical_failures:
                print(f"   • {failure['test']}: {failure['message']}")
            print()
        
        # Final verdict
        if all(test_results):
            print("🎉 ADMIN TOKEN INTEGRATION WORKFLOW: FULLY FUNCTIONAL!")
            print("   ✅ Admin token creation with valid exam IDs")
            print("   ✅ Tokens stored correctly in student_tokens collection")
            print("   ✅ Admin tokens (XXXX-XXX format) validate successfully")
            print("   ✅ Compatible with existing demo tokens (8-character format)")
            print("   ✅ Edge cases handled properly")
            return True
        else:
            print("⚠️ ADMIN TOKEN INTEGRATION WORKFLOW: ISSUES DETECTED")
            failed_tests = [i+1 for i, result in enumerate(test_results) if not result]
            print(f"   Failed test phases: {failed_tests}")
            return False

if __name__ == "__main__":
    tester = AdminTokenIntegrationTester()
    success = tester.run_comprehensive_test()
    sys.exit(0 if success else 1)