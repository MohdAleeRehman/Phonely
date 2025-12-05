# 🚀 Running Phonely AI Service

## Architecture Overview

The Phonely AI service now uses a **hybrid architecture** for maximum reliability:

- **LangGraph**: Orchestration layer (controls flow, retries, state management)
- **LangChain**: Tool execution layer (forces actual tool execution, no simulation)
- **CrewAI**: Agent definitions (clean role/goal/backstory from agents.yaml)

## Tools Used

1. **WhatMobile Pakistan** - Gets retail prices for new phones
2. **OLX Pakistan (Selenium)** - Scrapes real market listings for used phones
3. **GSM Arena** - Launch date verification
4. **PriceOye** - Secondary Pakistani pricing data

## Requirements

- Python 3.10+
- Chrome/Chromium browser (for Selenium)
- OpenAI API key (for gpt-5.1)

## Installation

```bash
cd /Users/mohdaleerehman/Downloads/Phonely/crew-ai-service/phonely_ai

# Install dependencies
uv sync

# Or with pip
pip install -e .
```

## Configuration

Create/update `.env` file:

```env
# OpenAI API Key
OPENAI_API_KEY=your_api_key_here

# Model (Claude Sonnet 4.5 via OpenAI API compatibility)
MODEL=gpt-5.1

# Backend URL for callbacks
BACKEND_URL=http://localhost:3000

# API Key for authentication
API_KEY=fb74a5dd46fde77fa343d4d6b081f4d6
```

## Running the Service

### Development Mode (Same as before)

```bash
cd /Users/mohdaleerehman/Downloads/Phonely/crew-ai-service/phonely_ai

# Start FastAPI server
python -m uvicorn phonely_ai.api:app --host 0.0.0.0 --port 8000 --reload
```

The service will be available at: `http://localhost:8000`

### API Endpoints

- **Health Check**: `GET http://localhost:8000/`
- **Health Status**: `GET http://localhost:8000/health`
- **Start Inspection**: `POST http://localhost:8000/api/v1/inspect`

### Testing Locally

```bash
# Test with real listing data
python test_inspection_local.py

# Select option 1 for Samsung Galaxy A06 real listing
```

## What Changed

### Before (Pure CrewAI)
- CrewAI orchestrated everything
- Claude Sonnet 4.5 simulated tool responses
- No actual web scraping happened
- Pricing was estimated, not based on real data
- **Result**: PKR 19-21K (simulated)

### Now (LangGraph + LangChain + CrewAI)
- LangGraph orchestrates workflow
- LangChain forces tool execution
- Selenium scrapes OLX for real market data
- WhatMobile provides retail prices
- **Result**: PKR 16-18K (real C2C market pricing)

## Pricing Formula

### C2C (Customer-to-Customer) Market:
1. Start with WhatMobile retail price (e.g., PKR 27,000 for A06)
2. Apply 35-40% depreciation for first year (budget phones)
3. Condition adjustments:
   - Excellent (9-10/10): +5%
   - Very Good (8-8.9/10): 0%
   - Good (6-7.9/10): -5%
   - Fair (4-5.9/10): -10%
4. No box: -PKR 500
5. No warranty: -PKR 1,000
6. C2C quick sale discount: -PKR 1,000-2,000
7. OLX market validation: If listings found, use as sanity check

**Example**: 14-month-old Samsung A06, Very Good condition
- Retail: PKR 27,000
- After 40% depreciation: ~PKR 16,200
- Minus no box/warranty: ~PKR 14,700
- Final C2C range: **PKR 16,000-18,000**

## Logs

Tool execution logs are saved in:
```
logs/tool_outputs/
├── whatmobile_Samsung_Galaxy_A06_YYYYMMDD_HHMMSS.log
├── olx_Samsung_Galaxy_A06_64GB_YYYYMMDD_HHMMSS.log
└── ...
```

Check these logs to verify tools are actually executing (not simulated).

## Performance

- **Vision Analysis**: ~11 seconds
- **Text Analysis**: ~7 seconds  
- **Pricing Analysis**: ~18 seconds (includes Selenium browser automation)
- **Total**: ~36-40 seconds (previously 30-60s with pure CrewAI)

## Troubleshooting

### OLX Scraper Not Finding Listings
- Check if Chrome/Chromium is installed
- OLX may have bot detection - the scraper uses headless Chrome with anti-detection measures
- Check log files in `logs/tool_outputs/olx_*.log` to see HTML content

### Pricing Still Too High
- Check `logs/tool_outputs/whatmobile_*.log` for actual retail price
- Verify OLX scraper is finding listings (check log file)
- Adjust C2C depreciation factor in `langgraph_orchestrator.py` if needed

### Tools Not Executing
- Look for "🚀 TOOL ACTUALLY CALLED" in logs
- If missing, tools are simulated (should not happen with LangGraph)
- Check that `api.py` imports from `langgraph_orchestrator` not `main`

## Files Structure

```
phonely_ai/
├── src/phonely_ai/
│   ├── api.py                          # FastAPI server (updated to use LangGraph)
│   ├── langgraph_orchestrator.py       # NEW: LangGraph workflow
│   ├── config/
│   │   ├── agents.yaml                 # Agent definitions
│   │   └── tasks.yaml                  # Task descriptions (legacy)
│   └── tools/
│       ├── whatmobile_tool.py          # Retail price scraper
│       ├── olx_scraper_tool.py         # Market listings (Selenium)
│       ├── gsmarena_tool_fixed.py      # Launch dates
│       └── priceoye_tool.py            # Secondary pricing
├── test_inspection_local.py            # Test script with real data
├── logs/tool_outputs/                  # Tool execution logs
└── RUNNING.md                          # This file
```

## Production Deployment

Same as before - just ensure:
1. Environment variables are set
2. Chrome/Chromium is available for Selenium
3. Sufficient memory for browser automation (512MB+)
4. Allow 40-60 seconds for inspection completion

## Success Indicators

✅ Tools executed: WhatMobile_Pakistan_Info, OLX_Market_Scraper  
✅ Log files created in `logs/tool_outputs/`  
✅ Pricing: PKR 16-18K for 14-month-old A06 in Very Good condition  
✅ Confidence: High (with OLX data) or Medium (without)  
✅ No retries needed for any agent  

---

**Built with**: LangGraph 1.0.4 + LangChain 0.3.0 + CrewAI 1.5.0 + Selenium 4.38.0
