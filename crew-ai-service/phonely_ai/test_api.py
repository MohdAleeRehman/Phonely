#!/usr/bin/env python
"""
Test the CrewAI API endpoint
"""
import requests
import json

# Test inspection request
test_payload = {
    "inspection_id": "test_123456",
    "images": [
        "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1763592370/phonely/listings/test/front.jpg",
        "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1763592377/phonely/listings/test/back.jpg",
    ],
    "phone_details": {
        "brand": "Samsung",
        "model": "Galaxy A06",
        "storage": "64GB",
        "ram": "4GB",
        "color": "Black",
        "condition": "good",
        "hasBox": True,
        "hasWarranty": False,
        "launchDate": "2024-09",
        "retailPrice": 28000
    },
    "description": "Good condition phone, barely used for 2 months. No scratches, perfect working condition."
}

print("=" * 60)
print("Testing Phonely AI CrewAI Service")
print("=" * 60)
print(f"📱 Device: {test_payload['phone_details']['brand']} {test_payload['phone_details']['model']}")
print(f"📷 Images: {len(test_payload['images'])}")
print(f"📝 Description: {test_payload['description'][:50]}...")
print("=" * 60)
print("\nSending request to http://localhost:8000/api/v1/inspection/start")
print("(Results will be sent via callback to backend)")
print()

try:
    response = requests.post(
        "http://localhost:8000/api/v1/inspection/start",
        json=test_payload,
        headers={
            "X-API-Key": "fb74a5dd46fde77fa343d4d6b081f4d6",
            "Content-Type": "application/json"
        },
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response:")
    print(json.dumps(response.json(), indent=2))
    
    if response.status_code == 200:
        print("\n✅ SUCCESS! Inspection started in background.")
        print("Check the AI service terminal for CrewAI agent execution logs.")
    else:
        print(f"\n❌ ERROR: {response.status_code}")
        
except Exception as e:
    print(f"\n❌ Request failed: {e}")
