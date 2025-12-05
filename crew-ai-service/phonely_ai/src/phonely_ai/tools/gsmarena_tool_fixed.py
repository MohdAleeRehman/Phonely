"""
GSM Arena Tool - Fetch phone launch dates and specifications
⚠️ Use WhatMobile/PriceOye for Pakistani retail prices (GSM Arena uses USD/EUR)
"""

from crewai.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field
import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
import os
from pathlib import Path


class GSMArenaToolInput(BaseModel):
    """Input schema for GSMArenaToolSchema."""
    brand: str = Field(..., description="Phone brand (e.g., Samsung, Apple)")
    model: str = Field(..., description="Phone model (e.g., Galaxy A06, iPhone 14 Pro)")


class GSMArenaTool(BaseTool):
    name: str = "GSM Arena Phone Info"
    description: str = (
        "Fetches phone LAUNCH DATE and specifications from GSM Arena. "
        "Provides accurate announced/release dates for age calculation. "
        "⚠️ DO NOT use for pricing (uses USD/EUR). Use WhatMobile for Pakistani PKR prices. "
        "Example: brand='Samsung', model='Galaxy A06'"
    )
    args_schema: Type[BaseModel] = GSMArenaToolInput
    
    def _save_tool_log(self, brand: str, model: str, url: str, html_content: str, result: str):
        """Save tool execution log for debugging"""
        try:
            logs_dir = Path(__file__).parent.parent.parent.parent / "logs" / "tool_outputs"
            logs_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"gsmarena_{brand}_{model}_{timestamp}.log"
            filepath = logs_dir / filename
            
            log_content = f"""{'='*80}\nGSM ARENA TOOL LOG\n{'='*80}\nTimestamp: {datetime.now().isoformat()}\nBrand: {brand}\nModel: {model}\nURL: {url}\n{'='*80}\n\nTOOL RESULT:\n{result}\n\n{'='*80}\nHTML CONTENT (first 5000 chars):\n{'='*80}\n{html_content[:5000]}\n...\n"""
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(log_content)
                
            print(f"📝 GSM Arena log saved: {filepath}")
        except Exception as e:
            print(f"⚠️  Failed to save GSM Arena log: {e}")

    def _run(self, brand: str, model: str) -> str:
        """
        Fetch phone launch date from GSM Arena
        
        Args:
            brand: Phone brand name
            model: Phone model name
            
        Returns:
            Formatted string with launch date and device age
        """
        try:
            # GSM Arena search - use their search endpoint
            search_query = f"{brand}+{model}".replace(" ", "+")
            search_url = f"https://www.gsmarena.com/results.php3?sQuickSearch=yes&sName={search_query}"
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://www.gsmarena.com/'
            }
            
            response = requests.get(search_url, headers=headers, timeout=10)
            if response.status_code != 200:
                return f"Failed to search GSM Arena: HTTP {response.status_code}"
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find search results - GSM Arena uses .makers ul li structure
            makers_div = soup.find('div', class_='makers')
            if not makers_div:
                return f"Phone not found on GSM Arena: {brand} {model}"
            
            first_result = makers_div.find('a')
            if not first_result:
                return f"Phone not found on GSM Arena: {brand} {model}"
            
            # Get phone page URL (e.g., samsung_galaxy_a06-13265.php)
            phone_url = "https://www.gsmarena.com/" + first_result['href']
            
            # Fetch phone details page
            phone_response = requests.get(phone_url, headers=headers, timeout=10)
            if phone_response.status_code != 200:
                return f"Failed to fetch phone details: HTTP {phone_response.status_code}"
            
            phone_soup = BeautifulSoup(phone_response.content, 'html.parser')
            
            # Extract phone name
            phone_name_elem = phone_soup.find('h1', class_='specs-phone-name-title')
            phone_name = phone_name_elem.text.strip() if phone_name_elem else f"{brand} {model}"
            
            result = f"📱 {phone_name}\n\n"
            
            # Find specs in #specs-list
            specs_list = phone_soup.find('div', id='specs-list')
            if not specs_list:
                return f"Specs not found for {brand} {model}"
            
            # Extract launch information
            announced_date = None
            status = None
            
            # Find all spec tables
            tables = specs_list.find_all('table')
            for table in tables:
                rows = table.find_all('tr')
                for row in rows:
                    header = row.find('td', class_='ttl')
                    value_cell = row.find('td', class_='nfo')
                    
                    if header and value_cell:
                        key = header.text.strip().lower()
                        value = value_cell.text.strip()
                        
                        if 'announced' in key:
                            announced_date = value
                        elif 'status' in key:
                            status = value
            
            # Parse launch date
            launch_date = None
            age_months = 0
            
            if announced_date:
                result += f"📅 Announced: {announced_date}\n"
                
                # Parse date - e.g., "2024, October 18" or "2024, October"
                date_match = re.search(r'(\d{4})[,\s]*(\w+)', announced_date)
                if date_match:
                    year = int(date_match.group(1))
                    month_str = date_match.group(2)
                    
                    # Convert month name to number
                    month_map = {
                        'january': 1, 'february': 2, 'march': 3, 'april': 4,
                        'may': 5, 'june': 6, 'july': 7, 'august': 8,
                        'september': 9, 'october': 10, 'november': 11, 'december': 12
                    }
                    month = month_map.get(month_str.lower(), 1)
                    
                    # Format as YYYY-MM
                    launch_date = f"{year}-{month:02d}"
                    result += f"🗓️  Launch Date: {launch_date}\n"
                    
                    # Calculate age
                    launch_datetime = datetime(year, month, 1)
                    now = datetime.now()
                    age_months = (now.year - launch_datetime.year) * 12 + (now.month - launch_datetime.month)
                    result += f"⏳ Device Age: {age_months} months\n"
            
            if status:
                result += f"✅ Status: {status}\n"
            
            result += f"\n🔗 Source: {phone_url}\n"
            result += "\n⚠️ For Pakistani retail prices, use WhatMobile or PriceOye tools."
            
            # Save log
            self._save_tool_log(brand, model, phone_url, phone_response.text, result)
            
            return result
            
        except Exception as e:
            return f"❌ Error fetching GSM Arena data: {str(e)}\nUse provided launch_date as fallback."
