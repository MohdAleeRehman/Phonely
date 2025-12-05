"""
WhatMobile Tool - Fetch Pakistani retail prices and phone specifications
"""

from crewai.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field
import requests
from bs4 import BeautifulSoup
import re
import json
import os
from datetime import datetime
from pathlib import Path


class WhatMobileToolInput(BaseModel):
    """Input schema for WhatMobileToolSchema."""
    brand: str = Field(..., description="Phone brand (e.g., Samsung, Apple)")
    model: str = Field(..., description="Phone model (e.g., Galaxy A06, iPhone 14 Pro)")


class WhatMobileTool(BaseTool):
    name: str = "WhatMobile Pakistan Info"
    description: str = (
        "Fetches Pakistani retail prices and phone specifications from WhatMobile.pk. "
        "Provides accurate launch dates, retail prices in PKR, RAM/storage variants. "
        "This is the PRIMARY source for Pakistani market pricing. "
        "Example: brand='Samsung', model='Galaxy A06'"
    )
    args_schema: Type[BaseModel] = WhatMobileToolInput
    
    def _save_tool_log(self, brand: str, model: str, url: str, html_content: str, result: str):
        """Save tool execution log for debugging"""
        print(f"🔍 DEBUG: _save_tool_log called for {brand} {model}")
        try:
            # Calculate logs directory path
            logs_dir = Path(__file__).parent.parent.parent.parent / "logs" / "tool_outputs"
            print(f"🔍 DEBUG: Calculated logs_dir: {logs_dir}")
            print(f"🔍 DEBUG: logs_dir absolute: {logs_dir.resolve()}")
            
            # Create directory
            logs_dir.mkdir(parents=True, exist_ok=True)
            print(f"🔍 DEBUG: Directory created/exists: {logs_dir.exists()}")
            
            # Generate filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            # Sanitize filename
            safe_brand = re.sub(r'[^\w\s-]', '', brand).strip().replace(' ', '_')
            safe_model = re.sub(r'[^\w\s-]', '', model).strip().replace(' ', '_')
            filename = f"whatmobile_{safe_brand}_{safe_model}_{timestamp}.log"
            filepath = logs_dir / filename
            print(f"🔍 DEBUG: Will save to: {filepath}")
            
            log_content = f"""{'='*80}
WHATMOBILE TOOL LOG
{'='*80}
Timestamp: {datetime.now().isoformat()}
Brand: {brand}
Model: {model}
URL: {url}
{'='*80}

TOOL RESULT:
{result}

{'='*80}
HTML CONTENT (first 5000 chars):
{'='*80}
{html_content[:5000]}
...
"""
            
            # Write file
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(log_content)
            print(f"🔍 DEBUG: File written, size: {filepath.stat().st_size} bytes")
            print(f"📝 WhatMobile log saved: {filepath}")
            
        except Exception as e:
            import traceback
            print(f"⚠️  Failed to save WhatMobile log: {e}")
            print(f"🔍 DEBUG: Full traceback:")
            traceback.print_exc()

    def _run(self, brand: str, model: str) -> str:
        """
        Fetch phone information from WhatMobile Pakistan
        
        Args:
            brand: Phone brand name
            model: Phone model name
        
        Returns:
            Formatted string with phone specs and Pakistani retail price
        """
        print(f"🚀 WHATMOBILE TOOL ACTUALLY CALLED: {brand} {model}")
        print(f"🔍 Tool execution started at: {datetime.now().isoformat()}")
        try:
            # Normalize search - WhatMobile uses underscores in URLs
            # Example: Samsung_Galaxy-A06
            model_normalized = model.replace(" ", "_").replace("Galaxy ", "Galaxy-")
            search_term = f"{brand}_{model_normalized}"
            
            # Try direct URL pattern
            url = f"https://www.whatmobile.com.pk/{search_term}"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            
            # If direct URL fails, try search
            if response.status_code != 200:
                search_url = f"https://www.whatmobile.com.pk/search?search={brand}+{model}"
                response = requests.get(search_url, headers=headers, timeout=10)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    # Find first result link
                    first_result = soup.find('a', href=re.compile(f'{brand}.*{model}', re.I))
                    if first_result:
                        url = "https://www.whatmobile.com.pk" + first_result['href']
                        response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code != 200:
                return f"Phone not found on WhatMobile: {brand} {model}"
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract information
            result = f"📱 {brand} {model}\n\n"
            
            # Try to get price from JSON-LD schema first (most reliable)
            script_tags = soup.find_all('script', type='application/ld+json')
            retail_price = None
            
            for script in script_tags:
                try:
                    data = json.loads(script.string)
                    if isinstance(data, dict) and 'offers' in data:
                        if 'Price' in data['offers']:
                            retail_price = int(data['offers']['Price'])
                        elif 'price' in data['offers']:
                            retail_price = int(data['offers']['price'])
                except:
                    continue
            
            # Fallback: Try HTML price elements
            if not retail_price:
                price_elem = soup.find('span', class_='PriceFont') or soup.find('div', class_='price')
                if price_elem:
                    price_text = price_elem.text.strip()
                    # Extract number from "Rs. 27,000" or "PKR 27000"
                    price_match = re.search(r'(\d{1,3}(?:,\d{3})*)', price_text)
                    if price_match:
                        retail_price = int(price_match.group(1).replace(',', ''))
            
            if retail_price:
                result += f"💰 Retail Price: PKR {retail_price:,}\n"
            
            # Get launch date
            specs_table = soup.find('table', class_='specification') or soup.find('div', class_='specifications')
            if specs_table:
                rows = specs_table.find_all('tr') if specs_table.name == 'table' else specs_table.find_all('div')
                for row in rows:
                    text = row.text.lower()
                    if 'release' in text or 'launch' in text or 'announced' in text:
                        # Extract date
                        date_match = re.search(r'(\d{4})[,\s]*(\w+)?', row.text)
                        if date_match:
                            year = date_match.group(1)
                            month = date_match.group(2) if date_match.group(2) else '01'
                            result += f"📅 Launch Date: {year}-{month[:3]}\n"
                            break
            
            # Get storage/RAM
            storage_elem = soup.find(text=re.compile('Storage|Memory', re.I))
            if storage_elem:
                storage_text = storage_elem.find_parent().text
                result += f"💾 {storage_text.strip()}\n"
            
            result += f"\n🔗 Source: {url}\n"
            result += "\n✅ Use this retail price for Pakistani market calculations."
            
            # Save log
            self._save_tool_log(brand, model, url, response.text, result)
            
            return result
            
        except Exception as e:
            return f"❌ Error fetching WhatMobile data: {str(e)}\nUse provided retail_price as fallback."
