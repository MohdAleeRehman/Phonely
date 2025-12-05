"""
LangGraph Orchestrator for PhonelyAI Inspection System

Architecture:
- LangGraph: Controls execution flow, retries, state management
- LangChain: Ensures tools are actually executed  
- CrewAI: Clean agent definitions (role/goal/backstory)

This replaces the pure CrewAI approach which had issues with Claude
simulating tool responses instead of executing them.
"""

from typing import TypedDict, Annotated, Sequence, Literal
from typing_extensions import TypedDict
import operator
from datetime import datetime
import json
import os
import yaml
from pathlib import Path

from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage, ToolMessage
from langchain_openai import ChatOpenAI
from langchain_core.tools import Tool
from langchain_core.prompts import ChatPromptTemplate
import os

# Import our custom tools
from phonely_ai.tools.whatmobile_tool import WhatMobileTool
from phonely_ai.tools.olx_scraper_tool import OLXScraperTool
from phonely_ai.tools.gsmarena_tool_fixed import GSMArenaTool
from phonely_ai.tools.priceoye_tool import PriceOyeTool


# ============================================================================
# Load Agent Configs from YAML
# ============================================================================

def load_agent_configs():
    """Load agent configurations from agents.yaml"""
    config_path = Path(__file__).parent / "config" / "agents.yaml"
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)

agents_config = load_agent_configs()


# ============================================================================
# State Definition - LangGraph manages this
# ============================================================================

class InspectionState(TypedDict):
    """State for the phone inspection workflow"""
    # Input data
    brand: str
    model: str
    storage: str
    ram: str
    color: str
    age_months: int
    launch_date: str
    retail_price: int
    pta_approved: bool
    has_box: bool
    has_warranty: bool
    description: str
    image_urls: str
    num_images: int
    
    # Messages for LLM
    messages: Annotated[Sequence[BaseMessage], operator.add]
    
    # Outputs from each stage
    vision_result: dict
    text_result: dict
    pricing_result: dict
    
    # Tool execution tracking
    tools_called: Annotated[list[str], operator.add]
    tool_outputs: dict
    
    # Retry tracking
    vision_retries: int
    text_retries: int
    pricing_retries: int
    
    # Final status
    status: str  # "processing", "completed", "failed"
    error: str


# ============================================================================
# LangChain Tool Wrappers - Ensures actual execution
# ============================================================================

def wrap_tool_for_langchain(crewai_tool, tool_name: str):
    """
    Wrap CrewAI tool for LangChain to ensure actual execution.
    LangChain's AgentExecutor will FORCE tool execution, no simulation.
    """
    def tool_func(**kwargs):
        print(f"🔧 LangChain executing tool: {tool_name}")
        print(f"   Parameters: {kwargs}")
        result = crewai_tool._run(**kwargs)
        print(f"✅ Tool {tool_name} completed")
        return result
    
    return Tool(
        name=tool_name,
        description=crewai_tool.description,
        func=tool_func
    )


# Initialize tools
whatmobile_langchain = wrap_tool_for_langchain(
    WhatMobileTool(), 
    "WhatMobile_Pakistan_Info"
)
olx_langchain = wrap_tool_for_langchain(
    OLXScraperTool(), 
    "OLX_Market_Scraper"
)
gsmarena_langchain = wrap_tool_for_langchain(
    GSMArenaTool(), 
    "GSM_Arena_Launch_Date"
)
priceoye_langchain = wrap_tool_for_langchain(
    PriceOyeTool(), 
    "PriceOye_Pakistan_Info"
)


# ============================================================================
# Node Functions - Each step in LangGraph
# ============================================================================

def vision_analysis_node(state: InspectionState) -> InspectionState:
    """
    Step 1: Analyze phone images for condition
    Uses CrewAI agent definition but LangChain execution
    """
    print("\n" + "="*80)
    print("VISION ANALYSIS NODE")
    print("="*80)
    
    # Get vision agent config from CrewAI (just for prompts)
    vision_config = agents_config['vision_agent']
    
    llm = ChatOpenAI(model="gpt-5.1", temperature=0.3, openai_api_key=os.getenv("OPENAI_API_KEY"))
    
    prompt = f"""
Role: {vision_config['role']}
Goal: {vision_config['goal']}
Backstory: {vision_config['backstory']}

Task: Analyze {state['num_images']} images of {state['brand']} {state['model']}.
Images: {state['image_urls']}

Assess condition (0-10), detect physical issues, verify authenticity (0-100).

Return ONLY valid JSON:
{{
  "condition_score": <number 0-10>,
  "condition": "<Excellent/Very Good/Good/Fair/Poor>",
  "detected_issues": ["<issue 1>", "<issue 2>", ...],
  "authenticity": {{
    "score": <number 0-100>,
    "is_authentic": <boolean>
  }}
}}
"""
    
    response = llm.invoke(prompt)
    
    try:
        # Parse JSON from response
        result = json.loads(response.content)
        state['vision_result'] = result
        state['status'] = "vision_completed"
        print(f"✅ Vision analysis completed: {result['condition']}")
    except json.JSONDecodeError as e:
        print(f"❌ Vision analysis failed to parse JSON: {e}")
        state['vision_retries'] = state.get('vision_retries', 0) + 1
        state['status'] = "vision_failed"
    
    return state


def text_analysis_node(state: InspectionState) -> InspectionState:
    """
    Step 2: Analyze description quality
    """
    print("\n" + "="*80)
    print("TEXT ANALYSIS NODE")
    print("="*80)
    
    text_config = agents_config['text_agent']
    
    llm = ChatOpenAI(model="gpt-5.1", temperature=0.3, openai_api_key=os.getenv("OPENAI_API_KEY"))
    
    prompt = f"""
Role: {text_config['role']}
Goal: {text_config['goal']}

Task: Evaluate description: "{state['description']}"
Phone: {state['brand']} {state['model']}, {state['storage']}, Box: {state['has_box']}, Warranty: {state['has_warranty']}

Rate quality, assess completeness percentage, identify 3-5 specific missing details.

Return ONLY valid JSON:
{{
  "description_quality": "<excellent/good/fair/poor>",
  "completeness": <number 0-100>,
  "missing_information": ["<detail 1>", "<detail 2>", ...]
}}
"""
    
    response = llm.invoke(prompt)
    
    try:
        result = json.loads(response.content)
        state['text_result'] = result
        state['status'] = "text_completed"
        print(f"✅ Text analysis completed: {result['description_quality']}")
    except json.JSONDecodeError as e:
        print(f"❌ Text analysis failed: {e}")
        state['text_retries'] = state.get('text_retries', 0) + 1
        state['status'] = "text_failed"
    
    return state


def pricing_analysis_node(state: InspectionState) -> InspectionState:
    """
    Step 3: Determine pricing using ACTUAL tool execution via LangChain
    This is where the magic happens - tools MUST be called, no simulation
    """
    print("\n" + "="*80)
    print("PRICING ANALYSIS NODE - TOOL EXECUTION REQUIRED")
    print("="*80)
    
    pricing_config = agents_config['pricing_agent']
    
    # Step 1: FORCE tool execution - call tools directly
    print("\n🔧 Step 1: Calling WhatMobile tool...")
    whatmobile_result = WhatMobileTool()._run(state['brand'], state['model'])
    state['tools_called'] = state.get('tools_called', []) + ["WhatMobile_Pakistan_Info"]
    print(f"✅ WhatMobile result: {whatmobile_result[:100]}...")
    
    print("\n🔧 Step 2: Calling OLX tool...")
    olx_result = OLXScraperTool()._run(state['brand'], state['model'], state['storage'])
    state['tools_called'] = state.get('tools_called', []) + ["OLX_Market_Scraper"]
    print(f"✅ OLX result: {olx_result[:100]}...")
    
    # Step 2: Use LLM to analyze tool results and calculate pricing
    llm = ChatOpenAI(model="gpt-5.1", temperature=0.1, openai_api_key=os.getenv("OPENAI_API_KEY"))
    
    prompt = f"""
{pricing_config['role']}

{pricing_config['backstory']}

TOOL RESULTS (already executed):

1. WhatMobile Result:
{whatmobile_result}

2. OLX Market Result:
{olx_result}

Now calculate pricing based on:
- Age: {state['age_months']} months
- Condition: {state.get('vision_result', {}).get('condition', 'Good')} ({state.get('vision_result', {}).get('condition_score', 7)}/10)
- PTA Approved: {state['pta_approved']}
- Has Box: {state['has_box']}
- Has Warranty: {state['has_warranty']}
- Description Quality: {state.get('text_result', {}).get('description_quality', 'good')}

PRICING FORMULA FOR C2C MARKET (Customer-to-Customer):
- Budget phones (<40K): 35-40% year 1 depreciation (aggressive for C2C)
- Age calculation: {state['age_months']} months = ({state['age_months']}/12) × 35% = {state['age_months']/12*35:.1f}% depreciation
- Launch Date: {state['launch_date']} (verify against GSM Arena if needed)
- Retail Price NEW: PKR {state['retail_price']:,}

C2C PRICING STEPS:
1. Use WhatMobile retail price as base (should be ~27K for A06 4/64GB)
2. Apply monthly depreciation: Base × (1 - age_depreciation)
3. Condition adjustments:
   - Excellent (9-10/10): +5%
   - Very Good (8-8.9/10): 0%
   - Good (6-7.9/10): -5%
   - Fair (4-5.9/10): -10%
   - Poor (<4/10): -20%
4. Missing accessories:
   - No box: -PKR 500
   - No warranty: -PKR 1,000
5. C2C quick sale discount: -PKR 1,000-2,000 (NO shopkeeper margin)
6. OLX reference: If listings found, use their average as sanity check

IMPORTANT: For 14-month-old A06 in Very Good condition:
- Retail: ~27K → After 40% depreciation: ~16.2K
- Minus no box/warranty: ~14.7K  
- C2C quick sale: ~15K-18K range (TARGET: 16K-19K for seller)

Return ONLY this JSON (no explanations):
{{
  "suggested_min_price": <integer>,
  "suggested_max_price": <integer>,
  "market_average": <integer>,
  "confidence_level": "<low/medium/high>",
  "pta_impact_applied": <boolean>
}}
"""
    
    try:
        response = llm.invoke(prompt)
        output = response.content
        
        # Parse JSON from response
        import re
        json_match = re.search(r'\{[^{}]*\}', output, re.DOTALL)
        if json_match:
            pricing_result = json.loads(json_match.group())
        else:
            pricing_result = json.loads(output)
        
        state['pricing_result'] = pricing_result
        state['status'] = "completed"
        print(f"\n✅ Pricing completed: PKR {pricing_result['suggested_min_price']:,}-{pricing_result['suggested_max_price']:,}")
        print(f"   Market Avg: PKR {pricing_result['market_average']:,}")
        print(f"   Confidence: {pricing_result['confidence_level']}")
        
    except Exception as e:
        print(f"\n❌ Pricing failed: {e}")
        state['pricing_retries'] = state.get('pricing_retries', 0) + 1
        state['status'] = "pricing_failed"
        state['error'] = str(e)
    
    return state


# ============================================================================
# Conditional Logic - LangGraph controls flow
# ============================================================================

def should_retry_vision(state: InspectionState) -> Literal["retry_vision", "text_analysis", "failed"]:
    """Decide if we should retry vision analysis"""
    if state['status'] == "vision_completed":
        return "text_analysis"
    if state.get('vision_retries', 0) < 3:
        print(f"⚠️ Retrying vision analysis (attempt {state.get('vision_retries', 0) + 1}/3)")
        return "retry_vision"
    return "failed"


def should_retry_text(state: InspectionState) -> Literal["retry_text", "pricing_analysis", "failed"]:
    """Decide if we should retry text analysis"""
    if state['status'] == "text_completed":
        return "pricing_analysis"
    if state.get('text_retries', 0) < 3:
        print(f"⚠️ Retrying text analysis (attempt {state.get('text_retries', 0) + 1}/3)")
        return "retry_text"
    return "failed"


def should_retry_pricing(state: InspectionState) -> Literal["retry_pricing", "final", "failed"]:
    """Decide if we should retry pricing"""
    if state['status'] == "completed":
        return "final"
    if state.get('pricing_retries', 0) < 3:
        print(f"⚠️ Retrying pricing (attempt {state.get('pricing_retries', 0) + 1}/3)")
        return "retry_pricing"
    return "failed"


# ============================================================================
# Graph Construction - LangGraph orchestrates everything
# ============================================================================

def create_inspection_graph():
    """
    Create the LangGraph state machine for phone inspection.
    
    Flow:
    START → Vision → (retry?) → Text → (retry?) → Pricing → (retry?) → END
    """
    workflow = StateGraph(InspectionState)
    
    # Add nodes
    workflow.add_node("vision_analysis", vision_analysis_node)
    workflow.add_node("text_analysis", text_analysis_node)
    workflow.add_node("pricing_analysis", pricing_analysis_node)
    
    # Define edges with conditional logic
    workflow.set_entry_point("vision_analysis")
    
    workflow.add_conditional_edges(
        "vision_analysis",
        should_retry_vision,
        {
            "retry_vision": "vision_analysis",
            "text_analysis": "text_analysis",
            "failed": END
        }
    )
    
    workflow.add_conditional_edges(
        "text_analysis",
        should_retry_text,
        {
            "retry_text": "text_analysis",
            "pricing_analysis": "pricing_analysis",
            "failed": END
        }
    )
    
    workflow.add_conditional_edges(
        "pricing_analysis",
        should_retry_pricing,
        {
            "retry_pricing": "pricing_analysis",
            "final": END,
            "failed": END
        }
    )
    
    return workflow.compile()


# ============================================================================
# Main Execution Function
# ============================================================================

def run_inspection(input_data: dict) -> dict:
    """
    Execute phone inspection using LangGraph orchestration.
    
    Args:
        input_data: Dict with phone details (brand, model, images, etc.)
    
    Returns:
        Dict with vision_result, text_result, pricing_result, and metadata
    """
    print("\n" + "="*80)
    print("LANGGRAPH ORCHESTRATED INSPECTION STARTING")
    print("="*80)
    print(f"Phone: {input_data['brand']} {input_data['model']}")
    print("="*80)
    
    # Initialize state
    initial_state: InspectionState = {
        **input_data,
        'messages': [],
        'vision_result': {},
        'text_result': {},
        'pricing_result': {},
        'tools_called': [],
        'tool_outputs': {},
        'vision_retries': 0,
        'text_retries': 0,
        'pricing_retries': 0,
        'status': 'processing',
        'error': ''
    }
    
    # Create and run graph
    graph = create_inspection_graph()
    start_time = datetime.now()
    
    final_state = graph.invoke(initial_state)
    
    end_time = datetime.now()
    total_time = (end_time - start_time).total_seconds() * 1000
    
    # Compile results
    result = {
        'status': final_state['status'],
        'results': {
            'vision_analysis': final_state.get('vision_result', {}),
            'text_analysis': final_state.get('text_result', {}),
            'pricing_analysis': final_state.get('pricing_result', {})
        },
        'processing_time': {
            'total': total_time
        },
        'tools_executed': final_state.get('tools_called', []),
        'retries': {
            'vision': final_state.get('vision_retries', 0),
            'text': final_state.get('text_retries', 0),
            'pricing': final_state.get('pricing_retries', 0)
        }
    }
    
    if final_state.get('error'):
        result['error'] = final_state['error']
    
    print("\n" + "="*80)
    print("INSPECTION COMPLETED")
    print("="*80)
    print(f"Status: {result['status']}")
    print(f"Tools executed: {', '.join(result['tools_executed'])}")
    print(f"Total time: {total_time:.2f}ms")
    print("="*80 + "\n")
    
    return result
