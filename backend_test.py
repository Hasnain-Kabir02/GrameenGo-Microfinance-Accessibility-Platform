#!/usr/bin/env python3
"""
GrameenGo Backend API Testing Suite
Tests all API endpoints for the microfinance platform
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any

class GrameenGoAPITester:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.api_url = f"{self.base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def test_health_endpoints(self):
        """Test health check endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        
        # Test root health
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            self.log_test("Root Health Check", success, 
                         f"Status: {response.status_code}" if not success else "")
        except Exception as e:
            self.log_test("Root Health Check", False, str(e))

        # Test health endpoint
        try:
            response = requests.get(f"{self.api_url}/health", timeout=10)
            success = response.status_code == 200
            self.log_test("Health Endpoint", success, 
                         f"Status: {response.status_code}" if not success else "")
        except Exception as e:
            self.log_test("Health Endpoint", False, str(e))

    def test_user_registration(self):
        """Test user registration"""
        print("\n🔍 Testing User Registration...")
        
        timestamp = int(datetime.now().timestamp())
        test_user = {
            "name": f"Test User {timestamp}",
            "email": f"testuser{timestamp}@grameengo.com",
            "password": "password123",
            "role": "borrower"
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/auth/register",
                json=test_user,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token')
                self.user_id = data.get('id')
                self.log_test("User Registration", True)
                return True
            else:
                self.log_test("User Registration", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("User Registration", False, str(e))
            return False

    def test_user_login(self):
        """Test user login with existing test user"""
        print("\n🔍 Testing User Login...")
        
        # Try with the provided test user
        test_credentials = {
            "email": "testuser@grameengo.com",
            "password": "password123"
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/auth/login",
                json=test_credentials,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token')
                self.user_id = data.get('id')
                self.log_test("User Login (Existing User)", True)
                return True
            else:
                self.log_test("User Login (Existing User)", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("User Login (Existing User)", False, str(e))
            return False

    def test_auth_me(self):
        """Test getting current user info"""
        print("\n🔍 Testing Auth Me Endpoint...")
        
        if not self.token:
            self.log_test("Auth Me", False, "No token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{self.api_url}/auth/me", headers=headers, timeout=10)
            
            success = response.status_code == 200
            self.log_test("Auth Me", success, 
                         f"Status: {response.status_code}" if not success else "")
            return success
        except Exception as e:
            self.log_test("Auth Me", False, str(e))
            return False

    def test_mfi_endpoints(self):
        """Test MFI-related endpoints"""
        print("\n🔍 Testing MFI Endpoints...")
        
        # Test get all MFIs
        try:
            response = requests.get(f"{self.api_url}/mfis", timeout=10)
            if response.status_code == 200:
                mfis = response.json()
                self.log_test("Get All MFIs", True, f"Found {len(mfis)} MFIs")
                
                # Test get specific MFI if any exist
                if mfis:
                    mfi_id = mfis[0]['id']
                    response = requests.get(f"{self.api_url}/mfis/{mfi_id}", timeout=10)
                    success = response.status_code == 200
                    self.log_test("Get MFI by ID", success, 
                                 f"Status: {response.status_code}" if not success else "")
                else:
                    self.log_test("Get MFI by ID", False, "No MFIs available to test")
            else:
                self.log_test("Get All MFIs", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get All MFIs", False, str(e))

    def test_loan_products(self):
        """Test loan products endpoint"""
        print("\n🔍 Testing Loan Products...")
        
        try:
            response = requests.get(f"{self.api_url}/loan-products", timeout=10)
            success = response.status_code == 200
            if success:
                products = response.json()
                self.log_test("Get Loan Products", True, f"Found {len(products)} products")
            else:
                self.log_test("Get Loan Products", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Loan Products", False, str(e))

    def test_applications_endpoints(self):
        """Test application-related endpoints"""
        print("\n🔍 Testing Applications Endpoints...")
        
        if not self.token:
            self.log_test("Applications Test", False, "No authentication token")
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Test get applications
        try:
            response = requests.get(f"{self.api_url}/applications", headers=headers, timeout=10)
            success = response.status_code == 200
            if success:
                apps = response.json()
                self.log_test("Get Applications", True, f"Found {len(apps)} applications")
            else:
                self.log_test("Get Applications", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Applications", False, str(e))

        # Test create application (need MFI first)
        try:
            # Get MFIs first
            mfi_response = requests.get(f"{self.api_url}/mfis", timeout=10)
            if mfi_response.status_code == 200:
                mfis = mfi_response.json()
                if mfis:
                    test_application = {
                        "mfi_id": mfis[0]['id'],
                        "business_name": "Test Business",
                        "business_type": "Retail",
                        "business_age_years": 2,
                        "monthly_revenue": 50000,
                        "loan_amount": 100000,
                        "loan_purpose": "Business expansion",
                        "tenure_months": 12
                    }
                    
                    response = requests.post(
                        f"{self.api_url}/applications",
                        json=test_application,
                        headers=headers,
                        timeout=10
                    )
                    success = response.status_code == 200
                    self.log_test("Create Application", success, 
                                 f"Status: {response.status_code}" if not success else "")
                else:
                    self.log_test("Create Application", False, "No MFIs available")
            else:
                self.log_test("Create Application", False, "Could not fetch MFIs")
        except Exception as e:
            self.log_test("Create Application", False, str(e))

    def test_notifications(self):
        """Test notifications endpoint"""
        print("\n🔍 Testing Notifications...")
        
        if not self.token:
            self.log_test("Notifications Test", False, "No authentication token")
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        try:
            response = requests.get(f"{self.api_url}/notifications", headers=headers, timeout=10)
            success = response.status_code == 200
            if success:
                notifications = response.json()
                self.log_test("Get Notifications", True, f"Found {len(notifications)} notifications")
            else:
                self.log_test("Get Notifications", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Notifications", False, str(e))

    def test_logout(self):
        """Test logout endpoint"""
        print("\n🔍 Testing Logout...")
        
        if not self.token:
            self.log_test("Logout", False, "No authentication token")
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        try:
            response = requests.post(f"{self.api_url}/auth/logout", headers=headers, timeout=10)
            success = response.status_code == 200
            self.log_test("Logout", success, 
                         f"Status: {response.status_code}" if not success else "")
        except Exception as e:
            self.log_test("Logout", False, str(e))

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting GrameenGo Backend API Tests")
        print(f"Testing against: {self.base_url}")
        
        # Test health endpoints first
        self.test_health_endpoints()
        
        # Test authentication flow
        if not self.test_user_login():
            # If login fails, try registration
            if not self.test_user_registration():
                print("❌ Cannot proceed without authentication")
                return self.get_results()
        
        # Test authenticated endpoints
        self.test_auth_me()
        self.test_mfi_endpoints()
        self.test_loan_products()
        self.test_applications_endpoints()
        self.test_notifications()
        self.test_logout()
        
        return self.get_results()

    def get_results(self):
        """Get test results summary"""
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        results = {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": round(success_rate, 2),
            "test_details": self.test_results
        }
        
        print(f"\n📊 Test Results Summary:")
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        return results

def main():
    # Use the public endpoint from frontend .env
    base_url = "https://grameengo.preview.emergentagent.com"
    
    tester = GrameenGoAPITester(base_url)
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if results["success_rate"] >= 80 else 1

if __name__ == "__main__":
    sys.exit(main())