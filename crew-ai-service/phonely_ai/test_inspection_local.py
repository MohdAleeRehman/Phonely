#!/usr/bin/env python3
"""
Local AI Inspection Testing Script
Tests the CrewAI inspection service with sample data before deploying to production
"""

import sys
import json
import asyncio
from datetime import datetime
from pathlib import Path

# Add the phonely_ai package to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from phonely_ai.langgraph_orchestrator import run_inspection
from phonely_ai.api import calculate_age_months


def print_header(text):
    """Print a formatted header"""
    print("\n" + "=" * 80)
    print(f"  {text}")
    print("=" * 80 + "\n")


def print_json(data, title=""):
    """Print JSON data with nice formatting"""
    if title:
        print(f"\n{title}:")
    print(json.dumps(data, indent=2, ensure_ascii=False))


async def test_inspection():
    """Test the AI inspection with sample data"""
    
    print_header("🧪 PhonelyAI Local Inspection Test")
    
    # Sample test data (you can modify these)
    test_cases = [
        {
            "name": "Samsung Galaxy A06 - Real Listing (Used Like New)",
            "data": {
                "images": [
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1764811489/phonely/listings/6930c8d277c9fdc679713343/G3iq0tJ-hEWMwa-_7ZS9u-1764811487921.jpg",
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1764811498/phonely/listings/6930c8d277c9fdc679713343/4cKUd5TzKupuKRR1NwJsg-1764811496611.jpg",
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1764811506/phonely/listings/6930c8d277c9fdc679713343/au1p3I_oNzKxh4omJyF_j-1764811504920.jpg",
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1764811515/phonely/listings/6930c8d277c9fdc679713343/sC8FeCGUSahGRxMyLFKSa-1764811514348.jpg",
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1764811525/phonely/listings/6930c8d277c9fdc679713343/_TsIzvf0iDwFeT-z_CDKC-1764811523394.jpg",
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1764811534/phonely/listings/6930c8d277c9fdc679713343/obOA4gGJokkMBJJxO7rEa-1764811533201.jpg",
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1764811547/phonely/listings/6930c8d277c9fdc679713343/CXytiZ0sQowq3iOSZShQr-1764811545748.jpg",
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1764811555/phonely/listings/6930c8d277c9fdc679713343/wU4N2JGjuKULyg-PjvXl0-1764811554434.jpg",
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1764811564/phonely/listings/6930c8d277c9fdc679713343/1lPK02FIluztVkeYi4sfo-1764811563135.jpg"
                ],
                "num_images": 9,
                "image_urls": ", ".join([
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1764811489/phonely/listings/6930c8d277c9fdc679713343/G3iq0tJ-hEWMwa-_7ZS9u-1764811487921.jpg",
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1764811498/phonely/listings/6930c8d277c9fdc679713343/4cKUd5TzKupuKRR1NwJsg-1764811496611.jpg",
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1764811506/phonely/listings/6930c8d277c9fdc679713343/au1p3I_oNzKxh4omJyF_j-1764811504920.jpg",
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1764811515/phonely/listings/6930c8d277c9fdc679713343/sC8FeCGUSahGRxMyLFKSa-1764811514348.jpg",
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1764811525/phonely/listings/6930c8d277c9fdc679713343/_TsIzvf0iDwFeT-z_CDKC-1764811523394.jpg",
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1764811506/phonely/listings/6930c8d277c9fdc679713343/au1p3I_oNzKxh4omJyF_j-1764811504920.jpg"  # truncated for brevity
                ]),
                "brand": "Samsung",
                "model": "Galaxy A06",
                "description": "Phone is in pristine condition, 10/10, handled with extreme care.\nComplete box, which includes the cable only as per vendor.\nUpgrading to a iPhone, that's why selling it.",
                "storage": "64GB",
                "ram": "4GB",
                "color": "Black",
                "has_box": False,
                "has_warranty": False,
                "launch_date": "2024-10",  # Correct: Galaxy A06 launched Oct 18, 2024 (GSM Arena)
                "retail_price": 27000,  # Correct: 4GB/64GB variant actual market price
                "age_months": calculate_age_months("2024-10"),
                "pta_approved": True
            }
        },
        {
            "name": "iPhone 14 Pro - Good Condition",
            "data": {
                "images": [
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1733234567/phonely/sample1.jpg",
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1733234568/phonely/sample2.jpg"
                ],
                "num_images": 2,
                "image_urls": "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1733234567/phonely/sample1.jpg, https://res.cloudinary.com/dl1kjmaoq/image/upload/v1733234568/phonely/sample2.jpg",
                "brand": "Apple",
                "model": "iPhone 14 Pro",
                "description": "iPhone 14 Pro 256GB in excellent condition. All features working perfectly. Minor scratches on back. Original box and accessories included.",
                "storage": "256GB",
                "ram": "6GB",
                "color": "Deep Purple",
                "has_box": True,
                "has_warranty": False,
                "launch_date": "2022-09",
                "retail_price": 410000,
                "age_months": calculate_age_months("2022-09"),
                "pta_approved": True
            }
        },
        {
            "name": "Samsung S23 Ultra - Excellent",
            "data": {
                "images": [
                    "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1733234569/phonely/sample3.jpg"
                ],
                "num_images": 1,
                "image_urls": "https://res.cloudinary.com/dl1kjmaoq/image/upload/v1733234569/phonely/sample3.jpg",
                "brand": "Samsung",
                "model": "Galaxy S23 Ultra",
                "description": "Like new Samsung S23 Ultra. No scratches, perfect condition. Used for 3 months only.",
                "storage": "512GB",
                "ram": "12GB",
                "color": "Phantom Black",
                "has_box": True,
                "has_warranty": True,
                "launch_date": "2023-02",
                "retail_price": 395000,
                "age_months": calculate_age_months("2023-02"),
                "pta_approved": True
            }
        }
    ]
    
    # Let user choose which test to run
    print("Available test cases:")
    for idx, test in enumerate(test_cases, 1):
        print(f"  {idx}. {test['name']}")
    print(f"  {len(test_cases) + 1}. Run all tests")
    
    try:
        choice = input(f"\nSelect test case (1-{len(test_cases) + 1}): ").strip()
        choice_idx = int(choice) - 1
        
        if choice_idx == len(test_cases):
            # Run all tests
            selected_tests = test_cases
        elif 0 <= choice_idx < len(test_cases):
            # Run single test
            selected_tests = [test_cases[choice_idx]]
        else:
            print("❌ Invalid choice")
            return
    except (ValueError, KeyboardInterrupt):
        print("\n❌ Test cancelled")
        return
    
    # Run selected tests
    for test in selected_tests:
        print_header(f"Testing: {test['name']}")
        
        inspection_data = test['data']
        print_json(inspection_data, "📋 Input Data")
        
        print("\n⏳ Running LangGraph inspection (this may take 30-60 seconds)...\n")
        
        start_time = datetime.now()
        
        try:
            # Run inspection with LangGraph orchestrator
            result = run_inspection(inspection_data)
            
            # Calculate processing time
            end_time = datetime.now()
            processing_time = (end_time - start_time).total_seconds()
            
            print(f"\n✅ Inspection completed in {processing_time:.2f} seconds")
            
            # Parse results
            print_header("📊 LangGraph Results")
            print(f"Status: {result.get('status', 'unknown')}")
            print(f"Tools executed: {', '.join(result.get('tools_executed', []))}")
            
            # Extract structured results
            results = result.get('results', {})
            vision_result = results.get('vision_analysis')
            text_result = results.get('text_analysis')
            pricing_result = results.get('pricing_analysis')
            
            # Display final structured results
            print_header("📈 Structured Results")
            
            if vision_result:
                print_json(vision_result, "🔍 Vision Analysis")
            else:
                print("❌ Vision Analysis: NOT FOUND")
            
            if text_result:
                print_json(text_result, "📝 Text Analysis")
            else:
                print("❌ Text Analysis: NOT FOUND")
            
            if pricing_result:
                print_json(pricing_result, "💰 Pricing Analysis")
            else:
                print("❌ Pricing Analysis: NOT FOUND")
            
            # Show what would be sent to backend
            print_header("🚀 Backend Callback Data")
            
            if vision_result or text_result or pricing_result:
                # Get actual processing time from result
                actual_time = result.get('processing_time', {}).get('total', processing_time * 1000)
                
                callback_data = {
                    "status": result.get('status', 'completed'),
                    "results": {
                        "vision_analysis": vision_result or {"error": "Missing"},
                        "text_analysis": text_result or {"error": "Missing"},
                        "pricing_analysis": pricing_result or {"error": "Missing"}
                    },
                    "processing_time": {
                        "total": actual_time,
                        "visionAgent": round(actual_time * 0.3, 2),
                        "textAgent": round(actual_time * 0.2, 2),
                        "pricingAgent": round(actual_time * 0.5, 2)
                    },
                    "tools_executed": result.get('tools_executed', []),
                    "retries": result.get('retries', {})
                }
                print_json(callback_data)
            else:
                print("❌ No valid results to send to backend - fallback would be used")
            
        except Exception as e:
            print(f"\n❌ Inspection failed: {type(e).__name__}: {str(e)}")
            import traceback
            print("\nFull traceback:")
            traceback.print_exc()
    
    print_header("✅ Testing Complete")


if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                    PhonelyAI Local Inspection Tester                        ║
║                                                                              ║
║  This script tests the LangGraph inspection service locally before          ║
║  deploying to production. Tools are ACTUALLY executed, not simulated.       ║
╚════════════════════════════════════════════════════════════════════════════╝
    """)
    
    try:
        asyncio.run(test_inspection())
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
