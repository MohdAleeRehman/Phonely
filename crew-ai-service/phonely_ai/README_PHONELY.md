# Phonely AI - CrewAI Phone Inspection System

AI-powered phone inspection system using **CrewAI** and **GPT-5.1** for intelligent condition assessment, description analysis, and market-based pricing.

## 🤖 Agents

### 1. **Vision Agent** (GPT-5.1 Vision)
- Analyzes 9 product images
- Determines condition score (0-10)
- Detects physical issues (scratches, cracks, dents)
- Verifies authenticity (0-100%)
- Provides detailed reasoning

### 2. **Text Agent** (GPT-5.1)
- Evaluates description quality
- Calculates completeness percentage
- Identifies missing information
- Suggests improvements

### 3. **Pricing Agent** (GPT-5.1)
- Scrapes OLX Pakistan for market data
- Calculates depreciation-based pricing
- Considers condition adjustments
- Provides min/max/average prices with confidence

## 🚀 Setup

### 1. Install dependencies

```bash
cd /Users/mohdaleerehman/Downloads/Phonely/crew-ai-service/phonely_ai
crewai install
```

Or manually:

```bash
uv add httpx beautifulsoup4 lxml
```

### 2. Configure environment

Update `.env` file:

```bash
MODEL=gpt-5.1
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Test the crew

```bash
crewai run
```

## 📝 Usage

### Run inspection programmatically

```python
from phonely_ai.main import run_inspection

inspection_data = {
    "images": [
        "https://example.com/front.jpg",
        "https://example.com/back.jpg",
        # ... up to 9 images
    ],
    "brand": "Samsung",
    "model": "Galaxy A06",
    "description": "Good condition, barely used",
    "storage": "64GB",
    "ram": "4GB",
    "color": "Black",
    "has_box": True,
    "has_warranty": False,
    "launch_date": "2024-09",
    "age_months": 2,
    "retail_price": 28000
}

result = run_inspection(inspection_data)
print(result)
```

### Run with trigger payload (for API integration)

```bash
crewai run_with_trigger '{"images": [...], "brand": "Samsung", ...}'
```

## 🔧 Integration with Backend

To integrate with your Node.js backend:

1. **Option A: Direct Python Call**
   ```javascript
   const { spawn } = require('child_process');
   
   const python = spawn('crewai', ['run_with_trigger', JSON.stringify(inspectionData)], {
     cwd: '/path/to/crew-ai-service/phonely_ai'
   });
   
   python.stdout.on('data', (data) => {
     const result = JSON.parse(data.toString());
     console.log('Inspection complete:', result);
   });
   ```

2. **Option B: FastAPI Wrapper** (Recommended)
   - Create a simple FastAPI server that calls `run_inspection()`
   - Node.js backend sends POST request to FastAPI endpoint
   - FastAPI returns CrewAI results

## 📊 Expected Output

```json
{
  "status": "success",
  "results": {
    "vision_analysis": {
      "condition_score": 8.5,
      "condition": "excellent",
      "detected_issues": [],
      "authenticity": {
        "score": 92,
        "is_authentic": true,
        "confidence": 95,
        "reasoning": "..."
      }
    },
    "text_analysis": {
      "description_quality": "good",
      "completeness": 70,
      "missing_information": ["Purchase date", "Reason for selling"]
    },
    "pricing_analysis": {
      "suggested_min_price": 22000,
      "suggested_max_price": 25000,
      "market_average": 23500,
      "confidence_level": "high"
    }
  }
}
```

## 🎯 Key Features

- ✅ **GPT-5.1 Powered**: Latest OpenAI model for superior reasoning
- ✅ **Real Market Data**: Live OLX scraping for accurate pricing
- ✅ **Authenticity Detection**: AI-based counterfeit detection
- ✅ **Depreciation Model**: Age-based pricing calculations
- ✅ **Sequential Processing**: Vision → Text → Pricing workflow
- ✅ **Structured Output**: JSON format for easy integration

## 📦 Project Structure

```
phonely_ai/
├── .env                      # Environment variables (GPT-5.1 API key)
├── pyproject.toml            # Dependencies
├── README_PHONELY.md         # This file
├── src/
│   └── phonely_ai/
│       ├── main.py           # Entry point & API
│       ├── crew.py           # CrewAI orchestration
│       ├── config/
│       │   ├── agents.yaml   # Vision, Text, Pricing agents
│       │   └── tasks.yaml    # Sequential tasks
│       └── tools/
│           ├── __init__.py
│           └── olx_scraper_tool.py  # OLX market data scraper
└── tests/
```

## 🔒 Security

- Never commit `.env` file with real API keys
- Use environment variables for production
- Implement rate limiting for OLX scraping
- Sanitize user inputs before processing

## 📄 License

Proprietary - Phonely Team
