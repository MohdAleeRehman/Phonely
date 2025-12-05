#!/usr/bin/env python
import sys
import warnings
import json
from datetime import datetime
from typing import Dict, Any

# NEW: Use LangGraph orchestrator instead of CrewAI-only
from phonely_ai.langgraph_orchestrator import run_inspection as langgraph_run_inspection

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")


def run_inspection(inspection_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run phone inspection with LangGraph + LangChain + CrewAI hybrid architecture.
    
    This replaces the old CrewAI-only approach which had issues with Claude
    simulating tool responses instead of actually executing them.
    
    Args:
        inspection_data: Dictionary containing:
            - images: List of image URLs
            - brand: Phone brand
            - model: Phone model
            - description: User description
            - storage: Storage capacity
            - ram: RAM size
            - color: Phone color
            - has_box: Boolean
            - has_warranty: Boolean
            - launch_date: Launch date (YYYY-MM)
            - retail_price: Original retail price
            - age_months: Age in months
            - pta_approved: PTA status
    
    Returns:
        Dictionary with vision, text, and pricing analysis results
    """
    
    # Convert API format to LangGraph format
    langgraph_inputs = {
        "brand": inspection_data.get("brand", "Unknown"),
        "model": inspection_data.get("model", "Unknown"),
        "storage": inspection_data.get("storage", "Unknown"),
        "ram": inspection_data.get("ram", "Unknown"),
        "color": inspection_data.get("color", "Unknown"),
        "age_months": inspection_data.get("age_months", 0),
        "launch_date": inspection_data.get("launch_date", "Unknown"),
        "retail_price": inspection_data.get("retail_price", 0),
        "pta_approved": inspection_data.get("pta_approved", True),
        "has_box": inspection_data.get("has_box", False),
        "has_warranty": inspection_data.get("has_warranty", False),
        "description": inspection_data.get("description", "No description provided"),
        "image_urls": ",".join(inspection_data.get("images", [])),
        "num_images": len(inspection_data.get("images", [])),
    }
    
    try:
        # Run LangGraph orchestration (tools WILL be executed)
        result = langgraph_run_inspection(langgraph_inputs)
        return result
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "An error occurred during inspection"
        }


def run():
    """
    Run a test inspection with sample data.
    """
    # Sample test data
    test_data = {
        "images": [
            "https://example.com/image1.jpg",
            "https://example.com/image2.jpg",
        ],
        "brand": "Samsung",
        "model": "Galaxy A06",
        "description": "Good condition phone, barely used for 2 months",
        "storage": "64GB",
        "ram": "4GB",
        "color": "Black",
        "has_box": True,
        "has_warranty": False,
        "launch_date": "2024-09",
        "age_months": 2,
        "retail_price": 28000
    }
    
    print("🚀 Starting Phonely AI Inspection...")
    print(f"📱 Phone: {test_data['brand']} {test_data['model']}")
    print(f"📷 Images: {len(test_data['images'])}")
    print("-" * 60)
    
    result = run_inspection(test_data)
    
    print("\n" + "=" * 60)
    print("📊 INSPECTION RESULTS")
    print("=" * 60)
    
    # Convert CrewOutput to dict for JSON serialization
    if hasattr(result, 'raw'):
        result_dict = result.raw
    elif hasattr(result, 'model_dump'):
        result_dict = result.model_dump()
    elif hasattr(result, 'dict'):
        result_dict = result.dict()
    else:
        result_dict = str(result)
    
    print(json.dumps(result_dict, indent=2))


def train():
    """
    Train the crew for a given number of iterations.
    """
    test_data = {
        "images": ["https://example.com/test.jpg"],
        "brand": "Apple",
        "model": "iPhone 13",
        "description": "Excellent condition",
        "storage": "128GB",
        "ram": "4GB",
        "color": "Blue",
        "has_box": True,
        "has_warranty": True,
        "launch_date": "2021-09",
        "age_months": 38,
        "retail_price": 180000
    }
    
    inputs = {
        "num_images": len(test_data["images"]),
        "image_urls": "\n".join(test_data["images"]),
        "brand": test_data["brand"],
        "model": test_data["model"],
        "description": test_data["description"],
        "storage": test_data["storage"],
        "ram": test_data["ram"],
        "color": test_data["color"],
        "has_box": "Yes",
        "has_warranty": "Yes",
        "launch_date": test_data["launch_date"],
        "age_months": test_data["age_months"],
        "retail_price": test_data["retail_price"],
        "vision_results": "Training data",
        "market_data": "Training data"
    }
    
    try:
        PhonelyAi().crew().train(
            n_iterations=int(sys.argv[1]),
            filename=sys.argv[2],
            inputs=inputs
        )
    except Exception as e:
        raise Exception(f"An error occurred while training the crew: {e}")


def replay():
    """
    Replay the crew execution from a specific task.
    """
    try:
        PhonelyAi().crew().replay(task_id=sys.argv[1])
    except Exception as e:
        raise Exception(f"An error occurred while replaying the crew: {e}")


def test():
    """
    Test the crew execution and returns the results.
    """
    test_data = {
        "images": ["https://example.com/test.jpg"],
        "brand": "Samsung",
        "model": "Galaxy S21",
        "description": "Good condition",
        "storage": "256GB",
        "ram": "8GB",
        "color": "Phantom Gray",
        "has_box": False,
        "has_warranty": False,
        "launch_date": "2021-01",
        "age_months": 46,
        "retail_price": 150000
    }
    
    inputs = {
        "num_images": 1,
        "image_urls": test_data["images"][0],
        "brand": test_data["brand"],
        "model": test_data["model"],
        "description": test_data["description"],
        "storage": test_data["storage"],
        "ram": test_data["ram"],
        "color": test_data["color"],
        "has_box": "No",
        "has_warranty": "No",
        "launch_date": test_data["launch_date"],
        "age_months": test_data["age_months"],
        "retail_price": test_data["retail_price"],
        "vision_results": "Test data",
        "market_data": "Test data"
    }
    
    try:
        PhonelyAi().crew().test(
            n_iterations=int(sys.argv[1]),
            openai_model_name=sys.argv[2],
            inputs=inputs
        )
    except Exception as e:
        raise Exception(f"An error occurred while testing the crew: {e}")


def run_with_trigger():
    """
    Run the crew with trigger payload (for API integration).
    """
    if len(sys.argv) < 2:
        raise Exception("No trigger payload provided. Please provide JSON payload as argument.")

    try:
        trigger_payload = json.loads(sys.argv[1])
    except json.JSONDecodeError:
        raise Exception("Invalid JSON payload provided as argument")

    try:
        result = run_inspection(trigger_payload)
        return result
    except Exception as e:
        raise Exception(f"An error occurred while running the crew with trigger: {e}")

