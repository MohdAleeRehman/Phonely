"""
OLX Market Data Scraper Tool for CrewAI
Scrapes current market prices for used phones from OLX Pakistan using Selenium
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

# Selenium imports
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager


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
        """Run OLX scraping with Selenium"""
        print(f"🚀 OLX SCRAPER ACTUALLY CALLED: {brand} {model} {storage or ''}")
        print(f"🔍 OLX execution started at: {datetime.now().isoformat()}")
        
        try:
            result = self._scrape_olx_selenium(brand, model, storage)
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

    def _scrape_olx_selenium(
        self,
        brand: str,
        model: str,
        storage: Optional[str] = None
    ) -> Dict[str, Any]:
        """Scrape OLX Pakistan using Selenium for JavaScript rendering"""
        
        # Build search query
        query = f"{brand} {model}"
        if storage:
            query += f" {storage}"
        
        # OLX Pakistan mobile phones category
        base_url = "https://www.olx.com.pk"
        search_url = f"{base_url}/mobile-phones_c1453/q-{query.replace(' ', '-')}"
        
        print(f"🔍 OLX: Searching for '{query}'")
        print(f"🔗 URL: {search_url}")
        
        driver = None
        try:
            # Setup Chrome options for headless mode with anti-detection
            chrome_options = Options()
            chrome_options.add_argument('--headless=new')  # Use new headless mode
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--disable-blink-features=AutomationControlled')  # Hide automation
            chrome_options.add_argument('--window-size=1920,1080')
            chrome_options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            
            # Initialize driver with webdriver-manager
            print("🔧 OLX: Initializing Chrome driver...")
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
            
            # Execute CDP commands to hide webdriver
            driver.execute_cdp_cmd('Network.setUserAgentOverride', {
                "userAgent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            })
            driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            # Load page
            print(f"📄 OLX: Loading page...")
            driver.get(search_url)
            
            # Wait for page to load with multiple strategies
            print("⏳ OLX: Waiting for listings to render...")
            try:
                # Wait for article cards (actual OLX structure)
                WebDriverWait(driver, 15).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "_617daaaa"))
                )
                print("✅ OLX: Listings loaded successfully")
            except TimeoutException:
                print("⚠️  OLX: Timeout waiting for listings, continuing anyway...")
            
            # Scroll to trigger lazy loading
            driver.execute_script("window.scrollTo(0, 1000);")
            time.sleep(2)
            driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(1)
            
            # Get page source after JavaScript rendering
            page_source = driver.page_source
            soup = BeautifulSoup(page_source, 'html.parser')
            
            # Extract listings (actual OLX structure uses article elements)
            listings = []
            listing_cards = soup.find_all('article', class_='_617daaaa')
            
            print(f"🔍 OLX: Found {len(listing_cards)} listing cards")
            
            # If no results with storage, try without storage
            if len(listing_cards) == 0 and storage:
                print(f"⚠️  OLX: No results with storage '{storage}', trying without...")
                driver.quit()
                
                # Retry without storage
                query_no_storage = f"{brand} {model}"
                search_url_no_storage = f"{base_url}/mobile-phones_c1453/q-{query_no_storage.replace(' ', '-')}"
                
                # Reinitialize driver
                service = Service(ChromeDriverManager().install())
                driver = webdriver.Chrome(service=service, options=chrome_options)
                driver.execute_cdp_cmd('Network.setUserAgentOverride', {
                    "userAgent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                })
                driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
                
                driver.get(search_url_no_storage)
                time.sleep(3)
                driver.execute_script("window.scrollTo(0, 1000);")
                time.sleep(2)
                
                page_source = driver.page_source
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
            return result
            
        except Exception as e:
            print(f"❌ OLX Selenium error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "error": str(e),
                "listings": [],
                "search_url": search_url
            }
        finally:
            if driver:
                driver.quit()
                print("🔒 OLX: Browser closed")
