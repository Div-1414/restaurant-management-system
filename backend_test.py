#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class RestaurantAPITester:
    def __init__(self, base_url="https://tablewise-32.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.restaurant_id = None
        self.table_id = None
        self.category_id = None
        self.menu_item_id = None
        self.order_id = None
        self.session_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_login(self, username, password):
        """Test login and get token"""
        success, response = self.run_test(
            "Super Admin Login",
            "POST",
            "auth/login/",
            200,
            data={"username": username, "password": password}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token received: {self.token[:20]}...")
            return True
        return False

    def test_create_restaurant(self):
        """Create a test restaurant"""
        restaurant_data = {
            "name": f"Test Restaurant {datetime.now().strftime('%H%M%S')}",
            "location": "123 Test Street, Test City",
            "contact": "+1234567890",
            "status": "active"
        }
        
        success, response = self.run_test(
            "Create Restaurant",
            "POST",
            "restaurants/",
            201,
            data=restaurant_data
        )
        
        if success and 'id' in response:
            self.restaurant_id = response['id']
            print(f"   Restaurant ID: {self.restaurant_id}")
            return True
        return False

    def test_get_restaurants(self):
        """Get all restaurants"""
        success, response = self.run_test(
            "Get Restaurants",
            "GET",
            "restaurants/",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} restaurants")
            return True
        return False

    def test_restaurant_stats(self):
        """Get restaurant statistics"""
        if not self.restaurant_id:
            print("❌ No restaurant ID available for stats test")
            return False
            
        success, response = self.run_test(
            "Restaurant Stats",
            "GET",
            f"restaurants/{self.restaurant_id}/stats/",
            200
        )
        
        if success:
            expected_keys = ['total_tables', 'occupied_tables', 'available_tables', 'active_sessions', 'today_orders', 'today_revenue']
            if all(key in response for key in expected_keys):
                print(f"   Stats: {response}")
                return True
        return False

    def test_bulk_create_tables(self):
        """Create tables in bulk"""
        if not self.restaurant_id:
            print("❌ No restaurant ID available for table creation")
            return False
            
        success, response = self.run_test(
            "Bulk Create Tables",
            "POST",
            "tables/bulk_create/",
            201,
            data={
                "restaurant_id": self.restaurant_id,
                "count": 5,
                "frontend_url": "https://tablewise-32.preview.emergentagent.com"
            }
        )
        
        if success and isinstance(response, list) and len(response) == 5:
            self.table_id = response[0]['id']
            print(f"   Created {len(response)} tables, first table ID: {self.table_id}")
            return True
        return False

    def test_get_tables(self):
        """Get tables for restaurant"""
        if not self.restaurant_id:
            print("❌ No restaurant ID available for getting tables")
            return False
            
        success, response = self.run_test(
            "Get Tables",
            "GET",
            "tables/",
            200,
            params={"restaurant_id": self.restaurant_id}
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} tables")
            return True
        return False

    def test_generate_qr_code(self):
        """Generate QR code for table"""
        if not self.table_id:
            print("❌ No table ID available for QR generation")
            return False
            
        success, response = self.run_test(
            "Generate QR Code",
            "POST",
            f"tables/{self.table_id}/generate_qr/",
            200,
            data={"frontend_url": "https://tablewise-32.preview.emergentagent.com"}
        )
        
        if success and 'qr_url' in response and 'qr_image' in response:
            print(f"   QR URL: {response['qr_url']}")
            return True
        return False

    def test_create_menu_category(self):
        """Create a menu category"""
        if not self.restaurant_id:
            print("❌ No restaurant ID available for category creation")
            return False
            
        category_data = {
            "restaurant": self.restaurant_id,
            "name": "Test Appetizers",
            "image": "https://images.unsplash.com/photo-1541014741259-de529411b96a",
            "display_order": 1
        }
        
        success, response = self.run_test(
            "Create Menu Category",
            "POST",
            "menu-categories/",
            201,
            data=category_data
        )
        
        if success and 'id' in response:
            self.category_id = response['id']
            print(f"   Category ID: {self.category_id}")
            return True
        return False

    def test_create_menu_item(self):
        """Create a menu item"""
        if not self.category_id:
            print("❌ No category ID available for menu item creation")
            return False
            
        item_data = {
            "category": self.category_id,
            "name": "Test Burger",
            "description": "Delicious test burger with all the fixings",
            "price": "15.99",
            "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
            "available": True
        }
        
        success, response = self.run_test(
            "Create Menu Item",
            "POST",
            "menu-items/",
            201,
            data=item_data
        )
        
        if success and 'id' in response:
            self.menu_item_id = response['id']
            print(f"   Menu Item ID: {self.menu_item_id}")
            return True
        return False

    def test_get_customer_menu(self):
        """Get customer menu for table"""
        if not self.restaurant_id or not self.table_id:
            print("❌ Missing restaurant or table ID for customer menu test")
            return False
            
        success, response = self.run_test(
            "Get Customer Menu",
            "GET",
            f"customer/menu/{self.restaurant_id}/{self.table_id}/",
            200
        )
        
        if success and 'restaurant' in response and 'table' in response and 'menu' in response:
            print(f"   Menu has {len(response['menu'])} categories")
            return True
        return False

    def test_create_order(self):
        """Create a customer order"""
        if not self.table_id or not self.menu_item_id:
            print("❌ Missing table or menu item ID for order creation")
            return False
            
        order_data = {
            "table_id": self.table_id,
            "items": [
                {
                    "menu_item_id": self.menu_item_id,
                    "quantity": 2
                }
            ],
            "special_instructions": "Extra sauce please"
        }
        
        success, response = self.run_test(
            "Create Order",
            "POST",
            "customer/order/",
            201,
            data=order_data
        )
        
        if success and 'id' in response:
            self.order_id = response['id']
            self.session_id = response.get('session')
            print(f"   Order ID: {self.order_id}")
            print(f"   Session ID: {self.session_id}")
            return True
        return False

    def test_get_orders(self):
        """Get orders for restaurant"""
        if not self.restaurant_id:
            print("❌ No restaurant ID available for getting orders")
            return False
            
        success, response = self.run_test(
            "Get Orders",
            "GET",
            "orders/",
            200,
            params={"restaurant_id": self.restaurant_id}
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} orders")
            return True
        return False

    def test_update_order_status(self):
        """Update order status (kitchen workflow)"""
        if not self.order_id:
            print("❌ No order ID available for status update")
            return False
            
        # Test updating to preparing
        success, response = self.run_test(
            "Update Order Status to Preparing",
            "PATCH",
            f"orders/{self.order_id}/update_status/",
            200,
            data={"status": "preparing"}
        )
        
        if not success:
            return False
            
        # Test updating to ready
        success, response = self.run_test(
            "Update Order Status to Ready",
            "PATCH",
            f"orders/{self.order_id}/update_status/",
            200,
            data={"status": "ready"}
        )
        
        return success

    def test_generate_bill(self):
        """Generate bill for session"""
        if not self.session_id:
            print("❌ No session ID available for bill generation")
            return False
            
        success, response = self.run_test(
            "Generate Bill",
            "POST",
            "bills/generate/",
            201,
            data={
                "session_id": self.session_id,
                "tax_rate": 10
            }
        )
        
        if success and 'id' in response:
            print(f"   Bill ID: {response['id']}")
            print(f"   Total: ${response.get('total', 'N/A')}")
            return True
        return False

    def test_create_user(self):
        """Create a new user (kitchen staff)"""
        if not self.restaurant_id:
            print("❌ No restaurant ID available for user creation")
            return False
            
        user_data = {
            "username": f"kitchen_staff_{datetime.now().strftime('%H%M%S')}",
            "password": "testpass123",
            "email": f"kitchen{datetime.now().strftime('%H%M%S')}@test.com",
            "first_name": "Test",
            "last_name": "Kitchen",
            "role": "kitchen_staff",
            "restaurant": self.restaurant_id,
            "phone": "+1234567890"
        }
        
        success, response = self.run_test(
            "Create Kitchen Staff User",
            "POST",
            "users/",
            201,
            data=user_data
        )
        
        if success and 'id' in response:
            print(f"   User ID: {response['id']}")
            return True
        return False

def main():
    print("🚀 Starting Restaurant Management System API Tests")
    print("=" * 60)
    
    # Setup
    tester = RestaurantAPITester()
    
    # Test sequence
    tests = [
        ("Login", lambda: tester.test_login("admin", "admin123")),
        ("Create Restaurant", tester.test_create_restaurant),
        ("Get Restaurants", tester.test_get_restaurants),
        ("Restaurant Stats", tester.test_restaurant_stats),
        ("Bulk Create Tables", tester.test_bulk_create_tables),
        ("Get Tables", tester.test_get_tables),
        ("Generate QR Code", tester.test_generate_qr_code),
        ("Create Menu Category", tester.test_create_menu_category),
        ("Create Menu Item", tester.test_create_menu_item),
        ("Get Customer Menu", tester.test_get_customer_menu),
        ("Create Order", tester.test_create_order),
        ("Get Orders", tester.test_get_orders),
        ("Update Order Status", tester.test_update_order_status),
        ("Generate Bill", tester.test_generate_bill),
        ("Create User", tester.test_create_user),
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Print results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if failed_tests:
        print(f"❌ Failed tests: {', '.join(failed_tests)}")
        return 1
    else:
        print("✅ All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())