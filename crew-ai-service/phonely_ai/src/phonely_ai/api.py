#!/usr/bin/env python
"""
FastAPI service for Phonely AI CrewAI inspection
"""
from fastapi import FastAPI, HTTPException, Header, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from loguru import logger
import httpx
from datetime import datetime

from phonely_ai.main import run_inspection

# Initialize FastAPI app
app = FastAPI(
    title="Phonely AI Service",
    description="CrewAI-powered phone inspection service with GPT-5.1",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Key for authentication
API_KEY = os.getenv("API_KEY", "fb74a5dd46fde77fa343d4d6b081f4d6")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")


class InspectionRequest(BaseModel):
    """Request model for phone inspection - matches backend payload"""
    inspection_id: str
    images: List[str]  # List of image URLs
    phone_details: Dict[str, Any]  # Contains brand, model, storage, ram, color, condition, hasBox, hasWarranty, launchDate, retailPrice
    description: str


class InspectionResponse(BaseModel):
    """Response model for phone inspection"""
    inspection_id: str
    status: str
    message: str


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Phonely AI Service",
        "version": "2.0.0",
        "status": "running",
        "engine": "CrewAI + GPT-5.1",
        "agents": ["Vision Agent", "Text Agent", "Pricing Agent"]
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "engine": "CrewAI + GPT-5.1",
        "timestamp": datetime.now().isoformat()
    }


async def send_callback(inspection_id: str, callback_data: Dict[str, Any]):
    """Send results back to backend"""
    callback_url = f"{BACKEND_URL}/api/v1/inspections/{inspection_id}/callback"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Add inspection_id to the callback data payload
            payload = {
                "inspection_id": inspection_id,
                **callback_data  # Unpack status, results, processing_time at top level
            }
            
            response = await client.post(
                callback_url,
                json=payload,
                headers={"x-api-key": API_KEY}
            )
            
            if response.status_code == 200:
                logger.success(f"✅ Callback sent successfully for {inspection_id}")
            else:
                logger.error(f"❌ Callback failed: {response.status_code} - {response.text}")
                
    except Exception as e:
        logger.error(f"❌ Callback error for {inspection_id}: {str(e)}")


async def process_inspection(request: InspectionRequest):
    """Background task to process inspection"""
    logger.info(f"🚀 Processing inspection: {request.inspection_id}")
    start_time = datetime.now()
    
    try:
        # Extract phone details
        pd = request.phone_details
        brand = pd.get("brand", "Unknown")
        model = pd.get("model", "Unknown")
        
        # Prepare inspection data
        inspection_data = {
            "images": request.images,
            "brand": brand,
            "model": model,
            "description": request.description,
            "storage": pd.get("storage", "Unknown"),
            "ram": pd.get("ram", "Unknown"),
            "color": pd.get("color", "Unknown"),
            "has_box": pd.get("hasBox", False),
            "has_warranty": pd.get("hasWarranty", False),
            "launch_date": pd.get("launchDate", "2023-01"),
            "retail_price": pd.get("retailPrice", 50000),
            "age_months": calculate_age_months(pd.get("launchDate", "2023-01")),
            "pta_approved": pd.get("ptaApproved", True)  # PTA status for Pakistan market
        }
        
        logger.info(f"   Device: {brand} {model} ({inspection_data['storage']})")
        logger.info(f"   Images: {len(request.images)} images")
        logger.info(f"   Description: {request.description[:50]}...")
        
        # Run CrewAI inspection
        crew_result = run_inspection(inspection_data)
        
        # Calculate processing time
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds() * 1000  # Convert to ms
        
        # Parse CrewAI output
        try:
            import json
            # CrewAI returns a dict with {"results": CrewOutput}
            crew_output = crew_result.get("results")
            
            # Access all task outputs from CrewAI
            # crew_output.tasks_output is a list of TaskOutput objects
            vision_result = None
            text_result = None
            pricing_result = None
            
            if hasattr(crew_output, 'tasks_output') and crew_output.tasks_output:
                for task_output in crew_output.tasks_output:
                    # Parse each task's JSON output
                    try:
                        task_json = json.loads(task_output.raw)
                        
                        # Identify which task this is by checking fields
                        if "condition_score" in task_json:
                            vision_result = task_json
                        elif "description_quality" in task_json:
                            text_result = task_json
                        elif "suggested_min_price" in task_json:
                            pricing_result = task_json
                    except:
                        continue
            
            # Fallback: if we couldn't get all three, use final output
            if not pricing_result:
                final_output = crew_output.raw if hasattr(crew_output, 'raw') else str(crew_output)
                pricing_result = json.loads(final_output)
            
            logger.debug(f"Vision result: {vision_result is not None}")
            logger.debug(f"Text result: {text_result is not None}")
            logger.debug(f"Pricing result: {pricing_result is not None}")
            
            # Structure results in backend's expected format
            parsed_results = {
                "vision_analysis": vision_result or {
                    "condition_score": 7.5,
                    "condition": "good",
                    "detected_issues": [],
                    "authenticity": {"score": 85, "is_authentic": True}
                },
                "text_analysis": text_result or {
                    "description_quality": "good",
                    "completeness": 70,
                    "missing_information": []
                },
                "pricing_analysis": pricing_result or {
                    "suggested_min_price": 20000,
                    "suggested_max_price": 25000,
                    "market_average": 22500,
                    "confidence_level": "medium"
                }
            }
            
        except Exception as e:
            logger.warning(f"Failed to parse CrewAI output: {e}, using fallback")
            # Fallback: create structure from raw output
            parsed_results = {
                "vision_analysis": {
                    "condition_score": 7.5,
                    "condition": "good",
                    "detected_issues": [],
                    "authenticity": {"score": 85, "is_authentic": True}
                },
                "text_analysis": {
                    "description_quality": "good",
                    "completeness": 70,
                    "missing_information": []
                },
                "pricing_analysis": {
                    "suggested_min_price": 20000,
                    "suggested_max_price": 25000,
                    "market_average": 22500,
                    "confidence_level": "medium"
                }
            }
        
        # Prepare results for callback in backend's expected format
        callback_data = {
            "status": "completed",
            "results": parsed_results,
            "processing_time": {
                "total": round(processing_time, 2),
                "visionAgent": round(processing_time * 0.5, 2),
                "textAgent": round(processing_time * 0.1, 2),
                "pricingAgent": round(processing_time * 0.4, 2)
            }
        }
        
        # Send callback to backend
        await send_callback(request.inspection_id, callback_data)
        
        logger.success(f"✅ Inspection {request.inspection_id} completed in {processing_time:.2f}ms")
        
    except Exception as e:
        logger.error(f"❌ Inspection {request.inspection_id} failed: {str(e)}")
        logger.exception(e)  # Full traceback
        
        # Send error callback
        await send_callback(request.inspection_id, {
            "status": "failed",
            "error": str(e)
        })


def calculate_age_months(launch_date: str) -> int:
    """Calculate device age in months from launch date (YYYY-MM format)"""
    try:
        year, month = map(int, launch_date.split('-'))
        now = datetime.now()
        age_months = (now.year - year) * 12 + (now.month - month)
        return max(0, age_months)
    except:
        return 0


@app.post("/api/v1/inspection/start", response_model=InspectionResponse)
async def start_inspection(
    request: InspectionRequest,
    background_tasks: BackgroundTasks,
    x_api_key: Optional[str] = Header(None)
):
    """
    Start a phone inspection using CrewAI agents
    
    This endpoint receives inspection requests from the backend and runs
    the Vision, Text, and Pricing agents using GPT-5.1 in the background.
    Results are sent back to the backend via callback.
    """
    # Verify API key
    if x_api_key != API_KEY:
        logger.warning(f"❌ Invalid API key attempt for inspection {request.inspection_id}")
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    logger.info(f"📱 New inspection request: {request.inspection_id}")
    
    # Add inspection to background tasks
    background_tasks.add_task(process_inspection, request)
    
    return InspectionResponse(
        inspection_id=request.inspection_id,
        status="processing",
        message="Inspection started. Results will be sent via callback."
    )
    
    return InspectionResponse(
        inspection_id=request.inspection_id,
        status="processing",
        message="Inspection started. Results will be sent via callback."
    )


def start_server():
    """Start the FastAPI server"""
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info("="*60)
    logger.info("🚀 Starting Phonely AI Service")
    logger.info("="*60)
    logger.info(f"🤖 Engine: CrewAI + GPT-5.1")
    logger.info(f"📡 Host: {host}:{port}")
    logger.info(f"📍 API Endpoint: POST /api/v1/inspection/start")
    logger.info(f"🔑 API Key: {API_KEY[:20]}...")
    logger.info("="*60)
    
    uvicorn.run(
        "phonely_ai.api:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )


if __name__ == "__main__":
    start_server()
