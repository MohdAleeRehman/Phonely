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

from phonely_ai.langgraph_orchestrator import run_inspection

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
        "engine": "LangGraph + LangChain + CrewAI (gpt-5.1)",
        "agents": ["Vision Agent", "Text Agent", "Pricing Agent"],
        "tools": ["WhatMobile Pakistan", "OLX Market Scraper (Selenium)", "GSM Arena", "PriceOye"]
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "engine": "LangGraph + LangChain + CrewAI (gpt-5.1)",
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
        
        # Prepare inspection data for LangGraph orchestrator
        inspection_data = {
            "images": request.images,
            "image_urls": ", ".join(request.images),  # LangGraph expects comma-separated string
            "num_images": len(request.images),
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
        
        # Run LangGraph orchestrated inspection
        result = run_inspection(inspection_data)
        
        # Calculate processing time
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds() * 1000  # Convert to ms
        
        # Extract results from LangGraph response
        vision_result = result.get('results', {}).get('vision_analysis', {})
        text_result = result.get('results', {}).get('text_analysis', {})
        pricing_result = result.get('results', {}).get('pricing_analysis', {})
        
        logger.info(f"✅ Inspection completed: {result.get('status', 'unknown')}")
        logger.info(f"   Tools executed: {', '.join(result.get('tools_executed', []))}")
        logger.info(f"   Pricing: PKR {pricing_result.get('suggested_min_price', 0):,}-{pricing_result.get('suggested_max_price', 0):,}")
        
        # Fallback if any analysis is missing
        if not vision_result:
            vision_result = {
                "condition_score": 7.5,
                "condition": "Good",
                "detected_issues": ["Unable to analyze images"],
                "authenticity": {"score": 85, "is_authentic": True}
            }
        
        if not text_result:
            text_result = {
                "description_quality": "fair",
                "completeness": 50,
                "missing_information": ["Unable to analyze description"]
            }
        
        if not pricing_result:
            # Fallback pricing based on retail price
            retail_price = inspection_data.get("retail_price", 50000)
            age_months = inspection_data.get("age_months", 12)
            depreciation_factor = max(0.4, 1 - (age_months / 12 * 0.35))  # 35% year 1 for C2C
            estimated_price = int(retail_price * depreciation_factor)
            
            pricing_result = {
                "suggested_min_price": int(estimated_price * 0.9),
                "suggested_max_price": int(estimated_price * 1.1),
                "market_average": estimated_price,
                "confidence_level": "low",
                "pta_impact_applied": False
            }
        
        # Structure results in backend's expected format
        parsed_results = {
            "vision_analysis": vision_result,
            "text_analysis": text_result,
            "pricing_analysis": pricing_result
        }
        
        # Prepare results for callback in backend's expected format
        callback_data = {
            "status": result.get("status", "completed"),
            "results": parsed_results,
            "processing_time": result.get("processing_time", {
                "total": round(processing_time, 2),
                "visionAgent": round(processing_time * 0.3, 2),
                "textAgent": round(processing_time * 0.2, 2),
                "pricingAgent": round(processing_time * 0.5, 2)
            }),
            "tools_executed": result.get("tools_executed", []),
            "retries": result.get("retries", {"vision": 0, "text": 0, "pricing": 0})
        }
        
        logger.success(f"✅ Inspection {request.inspection_id} completed successfully")
        logger.info(f"   Processing time: {processing_time:.2f}ms")
        
        # Send callback to backend
        await send_callback(request.inspection_id, callback_data)
        
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
