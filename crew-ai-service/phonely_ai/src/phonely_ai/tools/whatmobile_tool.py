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
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            # WhatMobile URL patterns:
            # - Brand uses underscores: Apple_, Samsung_, Vivo_
            # - Model uses hyphens: Galaxy-A55, iPhone-15-Pro-Max
            # - Some have "5G" suffix, some don't
            # - Some have storage (512GB), some don't
            # - Galaxy models: "Galaxy " → "Galaxy-"
            
            # Generate multiple URL variations to try
            url_variations = []
            
            # Clean model name
            model_clean = model.strip()
            
            # Replace "Galaxy " with "Galaxy-" for Samsung
            if "Galaxy" in model_clean:
                model_clean = model_clean.replace("Galaxy ", "Galaxy-")
            
            # Replace spaces with hyphens in model
            model_hyphenated = model_clean.replace(" ", "-")
            
            # Build base URL: Brand_Model
            base_url = f"{brand}_{model_hyphenated}"
            
            # Variation 1: Exact as provided
            url_variations.append(base_url)
            
            # Variation 2: Without storage suffix (remove 128GB, 256GB, 512GB, etc)
            model_no_storage = re.sub(r'-?\d+(GB|TB)', '', model_hyphenated, flags=re.IGNORECASE)
            if model_no_storage != model_hyphenated:
                url_variations.append(f"{brand}_{model_no_storage}")
            
            # Variation 3: With "5G" if not present
            if '5G' not in model_hyphenated.upper():
                url_variations.append(f"{brand}_{model_hyphenated}-5G")
                if model_no_storage != model_hyphenated:
                    url_variations.append(f"{brand}_{model_no_storage}-5G")
            
            # Variation 4: Without "5G" if present
            if '5G' in model_hyphenated.upper():
                model_no_5g = re.sub(r'-?5G', '', model_hyphenated, flags=re.IGNORECASE).rstrip('-')
                url_variations.append(f"{brand}_{model_no_5g}")
            
            # Try each URL variation
            response = None
            url = None
            
            for variation in url_variations:
                test_url = f"https://www.whatmobile.com.pk/{variation}"
                print(f"🔍 Trying URL: {test_url}")
                try:
                    test_response = requests.get(test_url, headers=headers, timeout=10)
                    if test_response.status_code == 200:
                        # Verify it's not a 404 page disguised as 200
                        if 'not found' not in test_response.text.lower()[:500]:
                            response = test_response
                            url = test_url
                            print(f"✅ Found at: {test_url}")
                            break
                except:
                    continue
            
            # If all direct URLs fail, try search
            if not response or response.status_code != 200:
                print(f"⚠️  Direct URLs failed, trying search...")
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
                # Strategy 1: Find text that says "{model} price in Pakistan is Rs. XXX"
                # This is the most reliable as it's the main price statement
                page_text = soup.get_text()
                
                # Create a flexible pattern that matches the model name + price statement
                # Example: "Samsung Galaxy A55 price in Pakistan is Rs. 139,999"
                model_pattern = re.escape(model[:20])  # Use first 20 chars of model name
                price_statement_match = re.search(
                    rf'{model_pattern}.*?price in Pakistan is Rs\.\s*(\d{{1,3}}(?:,\d{{3}})*)',
                    page_text,
                    re.IGNORECASE | re.DOTALL
                )
                if price_statement_match:
                    retail_price = int(price_statement_match.group(1).replace(',', ''))
                    print(f"💰 Found price via main statement: PKR {retail_price:,}")
                
                # Strategy 2: Look in the specifications table for "Price in Rs: XXX"
                if not retail_price:
                    # Find all table cells
                    table_cells = soup.find_all(['td', 'th'])
                    for cell in table_cells:
                        cell_text = cell.get_text()
                        if 'Price in Rs:' in cell_text or 'Price in PKR:' in cell_text:
                            price_match = re.search(r'(\d{1,3}(?:,\d{3})*)', cell_text)
                            if price_match:
                                retail_price = int(price_match.group(1).replace(',', ''))
                                print(f"💰 Found price via specs table: PKR {retail_price:,}")
                                break
                
                # Strategy 3: Last resort - PriceFont span (but validate it's a reasonable phone price)
                if not retail_price:
                    price_elem = soup.find('span', class_='PriceFont') or soup.find('div', class_='price')
                    if price_elem:
                        price_text = price_elem.text.strip()
                        price_match = re.search(r'Rs\.?\s*(\d{1,3}(?:,\d{3})*)', price_text)
                        if price_match:
                            potential_price = int(price_match.group(1).replace(',', ''))
                            # Sanity check: phone prices are typically > 10,000 PKR
                            if potential_price >= 10000:
                                retail_price = potential_price
                                print(f"💰 Found price via PriceFont: PKR {retail_price:,}")
            
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
