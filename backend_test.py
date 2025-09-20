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
    
    def test_question_endpoints(self):
        """Test for question management endpoints"""
        endpoints_to_test = [
            "/questions",
            "/question",
            "/quiz-questions",
            "/assessment-questions"
        ]
        
        found_endpoints = []
        
        for endpoint in endpoints_to_test:
            try:
                # Test GET
                response = self.session.get(f"{self.base_url}{endpoint}", timeout=5)
                if response.status_code != 404:
                    found_endpoints.append(f"GET {endpoint}")
                    self.log_test(f"Question Endpoint GET {endpoint}", True,
                                f"Endpoint exists, status: {response.status_code}")
                
                # Test POST
                test_data = {
                    "question": "What is 2+2?", 
                    "options": ["3", "4", "5", "6"],
                    "correct_answer": "4"
                }
                response = self.session.post(f"{self.base_url}{endpoint}", 
                                           json=test_data, timeout=5)
                if response.status_code != 404:
                    found_endpoints.append(f"POST {endpoint}")
                    self.log_test(f"Question Endpoint POST {endpoint}", True,
                                f"Endpoint exists, status: {response.status_code}")
                    
            except Exception as e:
                # Ignore connection errors for non-existent endpoints
                pass
        
        if not found_endpoints:
            self.log_test("Question Management Endpoints", False, 
                        "No question management endpoints found",
                        "Expected endpoints like /questions not available")
        else:
            self.log_test("Question Management Endpoints", True, 
                        f"Found {len(found_endpoints)} question endpoints",
                        f"Available: {', '.join(found_endpoints)}")
    
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
        print(f"🚀 Starting Backend API Tests")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test basic connectivity first
        if not self.test_connectivity():
            print("❌ Backend server is not accessible. Stopping tests.")
            return False
        
        # Test existing endpoints
        self.test_status_endpoints()
        self.test_database_connectivity()
        
        # Test for assessment system endpoints
        self.test_assessment_endpoints()
        self.test_question_endpoints()
        
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
        
        return failed == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)