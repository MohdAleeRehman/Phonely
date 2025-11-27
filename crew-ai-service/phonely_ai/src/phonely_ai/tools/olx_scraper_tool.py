"""
OLX Market Data Scraper Tool for CrewAI
Scrapes current market prices for used phones from OLX Pakistan
"""

from crewai.tools import BaseTool
from typing import Type, Optional, List, Dict, Any
from pydantic import BaseModel, Field
import httpx
import asyncio
import random
import json
import re
from bs4 import BeautifulSoup


class OLXScraperInput(BaseModel):
    """Input schema for OLX Scraper."""
    brand: str = Field(..., description="Phone brand (e.g., 'Samsung', 'Apple')")
    model: str = Field(..., description="Phone model (e.g., 'Galaxy A06', 'iPhone 13')")
    storage: Optional[str] = Field(None, description="Storage capacity (e.g., '128GB')")


class OLXScraperTool(BaseTool):
    name: str = "OLX Market Scraper"
    description: str = (
        "Scrapes current market prices for used phones from OLX Pakistan. "
        "Returns a list of active listings with prices, titles, and locations. "
        "Use this to get real-time market data for pricing analysis."
    )
    args_schema: Type[BaseModel] = OLXScraperInput

    def _run(
        self,
        brand: str,
        model: str,
        storage: Optional[str] = None
    ) -> str:
        """Synchronous wrapper for async scraping"""
        try:
            result = asyncio.run(self._scrape_olx(brand, model, storage))
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({
                "error": str(e),
                "listings": [],
                "message": "Failed to scrape OLX. Using fallback pricing."
            })

    async def _scrape_olx(
        self,
        brand: str,
        model: str,
        storage: Optional[str] = None
    ) -> Dict[str, Any]:
        """Scrape OLX Pakistan for phone listings"""
        
        # Build search query
        query = f"{brand} {model}"
        if storage:
            query += f" {storage}"
        
        # OLX Pakistan mobile phones category
        base_url = "https://www.olx.com.pk"
        search_url = f"{base_url}/mobile-phones_c1453/q-{query.replace(' ', '-')}"
        
        user_agents = [
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        ]
        
        headers = {
            "User-Agent": random.choice(user_agents),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": base_url,
            "DNT": "1",
        }
        
        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                # Get search page
                response = await client.get(search_url, headers=headers)
                
                if response.status_code != 200:
                    return {
                        "error": f"OLX returned status {response.status_code}",
                        "listings": []
                    }
                
                # Extract ad IDs from JavaScript dataLayer
                ad_ids = self._extract_ad_ids(response.text)
                
                if not ad_ids:
                    return {
                        "error": "No listings found on OLX",
                        "listings": []
                    }
                
                # Fetch individual listing pages (limit to 5)
                listings = await self._fetch_listings(client, base_url, ad_ids[:5], headers)
                
                return {
                    "source": "OLX Pakistan",
                    "query": query,
                    "total_found": len(ad_ids),
                    "listings": listings,
                    "search_url": search_url
                }
                
        except Exception as e:
            return {
                "error": str(e),
                "listings": []
            }
    
    def _extract_ad_ids(self, html: str) -> List[str]:
        """Extract ad IDs from dataLayer JavaScript"""
        try:
            # Find dataLayer push with ad_ids
            match = re.search(r'window\[\'dataLayer\'\]\.push\((.*?)\);', html, re.DOTALL)
            if not match:
                return []
            
            data = json.loads(match.group(1))
            
            # Extract all ad_ids arrays
            ad_ids = []
            if 'ad_ids' in data:
                ad_ids.extend(data['ad_ids'])
            
            for i in range(2, 10):
                key = f'ad_ids_set_{i}'
                if key in data:
                    ad_ids.extend(data[key])
            
            return ad_ids
        except Exception:
            return []
    
    async def _fetch_listings(
        self,
        client: httpx.AsyncClient,
        base_url: str,
        ad_ids: List[str],
        headers: Dict[str, str]
    ) -> List[Dict[str, Any]]:
        """Fetch individual listing details"""
        listings = []
        
        for ad_id in ad_ids:
            try:
                listing_url = f"{base_url}/item/{ad_id}"
                response = await client.get(listing_url, headers=headers)
                
                if response.status_code == 200:
                    price, title, location = self._extract_listing_data(response.text)
                    
                    if price:
                        try:
                            price = int(float(price))
                            if price > 0:
                                listings.append({
                                    "price": price,
                                    "title": title or "Unknown",
                                    "location": location or "Pakistan",
                                    "url": listing_url
                                })
                        except (ValueError, TypeError):
                            continue
                
                # Small delay between requests
                await asyncio.sleep(random.uniform(0.5, 1.0))
                
            except Exception:
                continue
        
        return listings
    
    def _extract_listing_data(self, html: str) -> tuple:
        """Extract price, title, location from listing page"""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Method 1: JSON-LD structured data (most reliable)
        json_ld = soup.find("script", {"type": "application/ld+json"})
        if json_ld:
            try:
                data = json.loads(json_ld.string)
                price = None
                title = data.get('name', '')
                location = None
                
                if 'offers' in data:
                    offers = data['offers']
                    price = offers.get('price')
                
                if 'address' in data:
                    address = data['address']
                    location = address.get('addressLocality')
                
                if price:
                    return (price, title, location)
            except Exception:
                pass
        
        # Method 2: Meta tags fallback
        try:
            price_meta = soup.find("meta", {"property": "product:price:amount"})
            title_meta = soup.find("meta", {"property": "og:title"})
            
            price = price_meta.get('content') if price_meta else None
            title = title_meta.get('content') if title_meta else None
            
            return (price, title, None)
        except Exception:
            pass
        
        return (None, None, None)
