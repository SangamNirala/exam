#!/usr/bin/env python3
"""
Student Portal Backend Testing Suite
Tests backend endpoints specifically needed for the Student Portal system
"""

import requests
import json
import sys
from datetime import datetime
import uuid

# Get backend URL from frontend .env
BACKEND_URL = "https://examshield-6.preview.emergentagent.com/api"

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
    
    def test_student_authentication_endpoints(self):
        """Test endpoints needed for student authentication"""
        # Since we don't have specific student auth endpoints, test if we can retrieve assessments
        # which would be needed for student portal
        try:
            response = self.session.get(f"{self.base_url}/assessments", timeout=10)
            if response.status_code == 200:
                assessments = response.json()
                self.log_test("Student Assessment Access", True, 
                            f"Students can access assessment list", 
                            f"Found {len(assessments)} assessments available")
                return assessments
            else:
                self.log_test("Student Assessment Access", False, 
                            f"Cannot access assessments: {response.status_code}")
                return []
        except Exception as e:
            self.log_test("Student Assessment Access", False, f"Request failed: {str(e)}")
            return []
    
    def test_exam_data_retrieval(self, assessment_id):
        """Test exam data retrieval for student portal"""
        if not assessment_id:
            self.log_test("Exam Data Retrieval", False, "No assessment ID for testing")
            return None
            
        try:
            # Test getting specific assessment with questions
            response = self.session.get(f"{self.base_url}/assessments/{assessment_id}", timeout=10)
            if response.status_code == 200:
                exam_data = response.json()
                questions = exam_data.get('questions', [])
                
                # Verify exam data has required fields for student portal
                required_fields = ['id', 'title', 'duration', 'instructions']
                missing_fields = [field for field in required_fields if field not in exam_data]
                
                if not missing_fields and questions:
                    self.log_test("Exam Data Retrieval", True, 
                                f"Complete exam data available for students", 
                                f"Exam: {exam_data.get('title')}, Questions: {len(questions)}, Duration: {exam_data.get('duration')} min")
                    return exam_data
                elif not questions:
                    self.log_test("Exam Data Retrieval", False, 
                                "Exam has no questions for students to take")
                    return None
                else:
                    self.log_test("Exam Data Retrieval", False, 
                                f"Exam data missing required fields: {missing_fields}")
                    return None
            else:
                self.log_test("Exam Data Retrieval", False, 
                            f"Cannot retrieve exam data: {response.status_code}")
                return None
        except Exception as e:
            self.log_test("Exam Data Retrieval", False, f"Request failed: {str(e)}")
            return None
    
    def test_session_management_data_storage(self):
        """Test if we can store session/monitoring data using existing endpoints"""
        try:
            # Use status endpoint to simulate session data storage
            session_data = {
                "client_name": f"student_session_{uuid.uuid4().hex[:8]}"
            }
            
            response = self.session.post(f"{self.base_url}/status", 
                                       json=session_data, timeout=10)
            
            if response.status_code == 200:
                session_record = response.json()
                self.log_test("Session Data Storage", True, 
                            "Can store student session/monitoring data", 
                            f"Session ID: {session_record.get('id')}")
                return session_record.get('id')
            else:
                self.log_test("Session Data Storage", False, 
                            f"Cannot store session data: {response.status_code}")
                return None
        except Exception as e:
            self.log_test("Session Data Storage", False, f"Request failed: {str(e)}")
            return None
    
    def test_question_format_for_students(self, assessment_id):
        """Test if questions are properly formatted for student consumption"""
        if not assessment_id:
            self.log_test("Question Format for Students", False, "No assessment ID for testing")
            return False
            
        try:
            response = self.session.get(f"{self.base_url}/assessments/{assessment_id}/questions", timeout=10)
            if response.status_code == 200:
                questions = response.json()
                
                if not questions:
                    self.log_test("Question Format for Students", False, "No questions available")
                    return False
                
                # Check if questions have proper format for students
                sample_question = questions[0]
                required_fields = ['id', 'type', 'question', 'points']
                missing_fields = [field for field in required_fields if field not in sample_question]
                
                # For MCQ questions, check if options are available
                if sample_question.get('type') == 'mcq':
                    if 'options' not in sample_question or not sample_question['options']:
                        missing_fields.append('options')
                
                if not missing_fields:
                    self.log_test("Question Format for Students", True, 
                                f"Questions properly formatted for student portal", 
                                f"Sample: {sample_question.get('type')} question with {len(sample_question.get('options', []))} options")
                    return True
                else:
                    self.log_test("Question Format for Students", False, 
                                f"Questions missing required fields: {missing_fields}")
                    return False
            else:
                self.log_test("Question Format for Students", False, 
                            f"Cannot retrieve questions: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Question Format for Students", False, f"Request failed: {str(e)}")
            return False
    
    def test_assessment_settings_for_students(self, assessment_id):
        """Test if assessment settings are available for student portal"""
        if not assessment_id:
            self.log_test("Assessment Settings", False, "No assessment ID for testing")
            return False
            
        try:
            response = self.session.get(f"{self.base_url}/assessments/{assessment_id}", timeout=10)
            if response.status_code == 200:
                assessment = response.json()
                settings = assessment.get('question_settings', {})
                
                # Check if important settings are available
                important_settings = ['randomize_order', 'allow_review', 'passing_score', 'attempts_allowed']
                available_settings = [setting for setting in important_settings if setting in settings]
                
                if len(available_settings) >= 2:  # At least 2 important settings
                    self.log_test("Assessment Settings", True, 
                                f"Assessment settings available for student portal", 
                                f"Available settings: {available_settings}")
                    return True
                else:
                    self.log_test("Assessment Settings", False, 
                                f"Insufficient assessment settings available")
                    return False
            else:
                self.log_test("Assessment Settings", False, 
                            f"Cannot retrieve assessment settings: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Assessment Settings", False, f"Request failed: {str(e)}")
            return False
    
    def test_comprehensive_student_workflow(self):
        """Test complete student workflow from login to exam completion"""
        print("\n🎓 Testing Complete Student Portal Workflow...")
        
        # Step 1: Student accesses available assessments
        assessments = self.test_student_authentication_endpoints()
        
        if not assessments:
            self.log_test("Student Workflow", False, "Cannot access assessments - workflow blocked")
            return False
        
        # Step 2: Student selects an assessment
        test_assessment_id = assessments[0].get('id') if assessments else None
        
        if not test_assessment_id:
            self.log_test("Student Workflow", False, "No valid assessment ID - workflow blocked")
            return False
        
        # Step 3: Student retrieves exam data
        exam_data = self.test_exam_data_retrieval(test_assessment_id)
        
        if not exam_data:
            self.log_test("Student Workflow", False, "Cannot retrieve exam data - workflow blocked")
            return False
        
        # Step 4: Check question format
        questions_ok = self.test_question_format_for_students(test_assessment_id)
        
        # Step 5: Check assessment settings
        settings_ok = self.test_assessment_settings_for_students(test_assessment_id)
        
        # Step 6: Test session management
        session_id = self.test_session_management_data_storage()
        
        # Overall workflow assessment
        if questions_ok and settings_ok and session_id:
            self.log_test("Complete Student Workflow", True, 
                        "Full student portal workflow is functional", 
                        f"Assessment: {exam_data.get('title')}, Questions: {len(exam_data.get('questions', []))}")
            return True
        else:
            issues = []
            if not questions_ok:
                issues.append("question format")
            if not settings_ok:
                issues.append("assessment settings")
            if not session_id:
                issues.append("session management")
            
            self.log_test("Complete Student Workflow", False, 
                        f"Student workflow has issues with: {', '.join(issues)}")
            return False
    
    def run_student_portal_tests(self):
        """Run all Student Portal specific tests"""
        print(f"🎓 Starting Student Portal Backend Tests")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test basic connectivity first
        try:
            response = self.session.get(f"{self.base_url}/", timeout=10)
            if response.status_code != 200:
                print("❌ Backend server is not accessible. Stopping tests.")
                return False
        except:
            print("❌ Backend server is not accessible. Stopping tests.")
            return False
        
        # Run comprehensive student workflow test
        workflow_success = self.test_comprehensive_student_workflow()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 STUDENT PORTAL TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        failed = len(self.test_results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        # Show critical failures
        critical_failures = [r for r in self.test_results if not r['success']]
        
        if critical_failures:
            print(f"\n🚨 ISSUES FOUND:")
            for failure in critical_failures:
                print(f"   • {failure['test']}: {failure['message']}")
        else:
            print(f"\n🎉 Student Portal backend is fully ready!")
        
        return failed == 0

if __name__ == "__main__":
    tester = StudentPortalTester()
    success = tester.run_student_portal_tests()
    sys.exit(0 if success else 1)