"""
PriceOye Tool - Fetch Pakistani retail prices and phone specifications
"""

from crewai.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field
import requests
from bs4 import BeautifulSoup
import re
import os
from datetime import datetime
from pathlib import Path


class PriceOyeToolInput(BaseModel):
    """Input schema for PriceOyeToolSchema."""
    brand: str = Field(..., description="Phone brand (e.g., Samsung, Apple)")
    model: str = Field(..., description="Phone model (e.g., Galaxy A06, iPhone 14 Pro)")


class PriceOyeTool(BaseTool):
    name: str = "PriceOye Pakistan Info"
    description: str = (
        "Fetches Pakistani retail prices from PriceOye.pk. "
        "Provides current market prices in PKR for new phones. "
        "Use as secondary source to cross-verify WhatMobile prices. "
        "Example: brand='Samsung', model='Galaxy A06'"
    )
    args_schema: Type[BaseModel] = PriceOyeToolInput
    
    def _save_tool_log(self, brand: str, model: str, url: str, html_content: str, result: str):
        """Save tool execution log for debugging"""
        try:
            logs_dir = Path(__file__).parent.parent.parent.parent / "logs" / "tool_outputs"
            logs_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"priceoye_{brand}_{model}_{timestamp}.log"
            filepath = logs_dir / filename
            
            log_content = f"""{'='*80}\nPRICEOYE TOOL LOG\n{'='*80}\nTimestamp: {datetime.now().isoformat()}\nBrand: {brand}\nModel: {model}\nURL: {url}\n{'='*80}\n\nTOOL RESULT:\n{result}\n\n{'='*80}\nHTML CONTENT (first 5000 chars):\n{'='*80}\n{html_content[:5000]}\n...\n"""
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(log_content)
                
            print(f"📝 PriceOye log saved: {filepath}")
        except Exception as e:
            print(f"⚠️  Failed to save PriceOye log: {e}")

    def _run(self, brand: str, model: str) -> str:
        """
        Fetch phone pricing from PriceOye Pakistan
        
        Args:
            brand: Phone brand name
            model: Phone model name
            
        Returns:
            Formatted string with Pakistani retail price
        """
        try:
            # Normalize search - PriceOye uses kebab-case
            # Example: samsung-galaxy-a06
            model_normalized = model.lower().replace(" ", "-")
            brand_lower = brand.lower()
            search_term = f"{brand_lower}-{model_normalized}"
            
            # Try direct URL pattern
            url = f"https://priceoye.pk/mobiles/{brand_lower}/{search_term}"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            
            # If direct URL fails, try search
            if response.status_code != 200:
                search_url = f"https://priceoye.pk/search?q={brand}+{model}"
                response = requests.get(search_url, headers=headers, timeout=10)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    # Find first result link
                    first_result = soup.find('a', href=re.compile(f'/mobiles/.*{model_normalized}', re.I))
                    if first_result:
                        url = "https://priceoye.pk" + first_result['href']
                        response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code != 200:
                return f"Phone not found on PriceOye: {brand} {model}"
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract information
            result = f"📱 {brand} {model}\n\n"
            
            # Get price (PriceOye has price in specific elements)
            price_elem = soup.find('span', class_='price-box') or soup.find('div', class_='product-price')
            if price_elem:
                price_text = price_elem.text.strip()
                # Extract number from "Rs 27,000" or "PKR 27,000"
                price_match = re.search(r'(\d{1,3}(?:,\d{3})*)', price_text.replace(',', ''))
                if price_match:
                    retail_price = int(price_match.group(1).replace(',', ''))
                    result += f"💰 PriceOye Price: PKR {retail_price:,}\n"
            
            result += f"\n🔗 Source: {url}\n"
            
            # Save log
            self._save_tool_log(brand, model, url, response.text, result)
            
            return result
            
        except Exception as e:
            return f"❌ Error fetching PriceOye data: {str(e)}"
