"""
OLX Market Data Scraper Tool for CrewAI
Scrapes current market prices for used phones from OLX Pakistan using Playwright
"""

from crewai.tools import BaseTool
from typing import Type, Optional, List, Dict, Any
from pydantic import BaseModel, Field
import json
import re
import time
from bs4 import BeautifulSoup
import os
from datetime import datetime
from pathlib import Path

# Playwright imports (better for cloud servers)
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
import asyncio


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
    
    def _save_tool_log(self, brand: str, model: str, storage: str, url: str, html_content: str, result: dict):
        """Save tool execution log for debugging"""
        print(f"🔍 DEBUG: OLX _save_tool_log called for {brand} {model}")
        try:
            logs_dir = Path(__file__).parent.parent.parent.parent / "logs" / "tool_outputs"
            print(f"🔍 DEBUG: OLX logs_dir: {logs_dir.resolve()}")
            logs_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_brand = re.sub(r'[^\w\s-]', '', brand).strip().replace(' ', '_')
            safe_model = re.sub(r'[^\w\s-]', '', model).strip().replace(' ', '_')
            safe_storage = re.sub(r'[^\w\s-]', '', storage or 'unknown').strip().replace(' ', '_')
            filename = f"olx_{safe_brand}_{safe_model}_{safe_storage}_{timestamp}.log"
            filepath = logs_dir / filename
            print(f"🔍 DEBUG: OLX will save to: {filepath}")
            
            log_content = f"""{'='*80}\nOLX SCRAPER LOG\n{'='*80}\nTimestamp: {datetime.now().isoformat()}\nBrand: {brand}\nModel: {model}\nStorage: {storage}\nURL: {url}\n{'='*80}\n\nTOOL RESULT:\n{json.dumps(result, indent=2)}\n\n{'='*80}\nHTML CONTENT (first 5000 chars):\n{'='*80}\n{html_content[:5000]}\n...\n"""
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(log_content)
            print(f"🔍 DEBUG: OLX file written, size: {filepath.stat().st_size} bytes")
            print(f"📝 OLX log saved: {filepath}")
        except Exception as e:
            import traceback
            print(f"⚠️  Failed to save OLX log: {e}")
            traceback.print_exc()

    def _run(
        self,
        brand: str,
        model: str,
        storage: Optional[str] = None
    ) -> str:
        """Run OLX scraping with Playwright async in a separate thread"""
        print(f"🚀 OLX SCRAPER ACTUALLY CALLED: {brand} {model} {storage or ''}")
        print(f"🔍 OLX execution started at: {datetime.now().isoformat()}")
        
        try:
            # Run async function in a separate thread to avoid event loop conflicts
            import concurrent.futures
            
            def run_async_in_thread():
                """Run the async function in a new event loop in a separate thread"""
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    result = loop.run_until_complete(self._scrape_olx_async(brand, model, storage))
                    return result
                finally:
                    loop.close()
            
            # Execute in thread pool to avoid uvloop conflicts
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(run_async_in_thread)
                result = future.result(timeout=60)  # 60 second timeout
            
            return json.dumps(result, indent=2)
        except Exception as e:
            import traceback
            print(f"❌ OLX scraping failed: {e}")
            traceback.print_exc()
            return json.dumps({
                "error": str(e),
                "listings": [],
                "message": "Failed to scrape OLX. Using fallback pricing."
            })

    async def _scrape_olx_async(
        self,
        brand: str,
        model: str,
        storage: Optional[str] = None
    ) -> Dict[str, Any]:
        """Scrape OLX Pakistan using Playwright async API"""
        
        # Build search query
        query = f"{brand} {model}"
        if storage:
            query += f" {storage}"
        
        # OLX Pakistan mobile phones category
        base_url = "https://www.olx.com.pk"
        search_url = f"{base_url}/mobile-phones_c1453/q-{query.replace(' ', '-')}"
        
        print(f"🔍 OLX: Searching for '{query}'")
        print(f"🔗 URL: {search_url}")
        
        try:
            # Initialize Playwright async (much better for cloud servers!)
            print("🔧 OLX: Initializing Playwright browser...")
            async with async_playwright() as p:
                # Launch browser with headless mode
                browser = await p.chromium.launch(
                    headless=True,
                    args=[
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-blink-features=AutomationControlled'
                    ]
                )
                
                # Create context with real browser-like settings
                context = await browser.new_context(
                    user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    viewport={'width': 1920, 'height': 1080}
                )
                
                # Create page
                page = await context.new_page()
                
                # Load page (use domcontentloaded instead of networkidle - faster and more reliable)
                print(f"📄 OLX: Loading page...")
                await page.goto(search_url, wait_until='domcontentloaded', timeout=45000)
                
                # Wait for listings to render
                print("⏳ OLX: Waiting for listings to render...")
                try:
                    await page.wait_for_selector('article._617daaaa', timeout=20000)
                    print("✅ OLX: Listings loaded successfully")
                except PlaywrightTimeout:
                    print("⚠️  OLX: Timeout waiting for listings, continuing anyway...")
                
                # Give JavaScript time to fully render
                await asyncio.sleep(2)
                
                # Scroll to trigger lazy loading
                await page.evaluate("window.scrollTo(0, 1000)")
                await asyncio.sleep(2)
                await page.evaluate("window.scrollTo(0, 0)")
                await asyncio.sleep(1)
                
                # Get page HTML after JavaScript rendering
                page_source = await page.content()
                soup = BeautifulSoup(page_source, 'html.parser')
            
                # Extract listings (actual OLX structure uses article elements)
                listings = []
                listing_cards = soup.find_all('article', class_='_617daaaa')
                
                print(f"🔍 OLX: Found {len(listing_cards)} listing cards")
                
                # If no results with storage, try without storage
                if len(listing_cards) == 0 and storage:
                    print(f"⚠️  OLX: No results with storage '{storage}', trying without...")
                    
                    # Retry without storage
                    query_no_storage = f"{brand} {model}"
                    search_url_no_storage = f"{base_url}/mobile-phones_c1453/q-{query_no_storage.replace(' ', '-')}"
                    
                    await page.goto(search_url_no_storage, wait_until='domcontentloaded', timeout=45000)
                    await asyncio.sleep(3)
                    await page.evaluate("window.scrollTo(0, 1000)")
                    await asyncio.sleep(2)
                    
                    page_source = await page.content()
                    soup = BeautifulSoup(page_source, 'html.parser')
                    listing_cards = soup.find_all('article', class_='_617daaaa')
                    search_url = search_url_no_storage
                    print(f"🔍 OLX: Found {len(listing_cards)} listing cards (without storage)")
            
            for card in listing_cards[:10]:  # Limit to 10 listings
                try:
                    # Extract title (actual class from HTML)
                    title_elem = card.find('h2', class_='_1093b649')
                    title = title_elem.text.strip() if title_elem else None
                    
                    # Extract price (actual class from HTML)
                    price_elem = card.find('span', class_='f83175ac')
                    price_text = price_elem.text.strip() if price_elem else None
                    
                    # Extract location (actual class from HTML)
                    location_elem = card.find('span', class_='f047db22')
                    location = location_elem.text.strip() if location_elem else None
                    if location:
                        # Remove bullet point separator if present
                        location = location.split('•')[0].strip()
                    
                    # Extract URL
                    link_elem = card.find('a', href=True)
                    url = base_url + link_elem['href'] if link_elem else None
                    
                    # Parse price (remove Rs, commas)
                    price = None
                    if price_text:
                        price_match = re.search(r'Rs\s*([\d,]+)', price_text)
                        if price_match:
                            price = int(price_match.group(1).replace(',', ''))
                    
                    if title and price:
                        listings.append({
                            "title": title,
                            "price": price,
                            "location": location or "Unknown",
                            "url": url,
                            "source": "OLX Pakistan"
                        })
                        print(f"  📱 {title[:50]}... - Rs {price:,}")
                
                except Exception as e:
                    print(f"⚠️  Failed to parse listing: {e}")
                    continue
            
            # After processing all listings, prepare result
            result = {
                "source": "OLX Pakistan",
                "query": query,
                "total_found": len(listing_cards),
                "listings": listings,
                "search_url": search_url
            }
            
            # Save log
            self._save_tool_log(brand, model, storage or "N/A", search_url, page_source, result)
            
            print(f"✅ OLX: Extracted {len(listings)} valid listings")
            
            # Close browser
            await browser.close()
            print("🔒 OLX: Browser closed")
            
            return result
            
        except Exception as e:
            print(f"❌ OLX Playwright error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "error": str(e),
                "listings": [],
                "search_url": search_url
            }
