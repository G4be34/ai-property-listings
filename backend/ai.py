from typing import List, Optional
import json
import asyncio
import PyPDF2
from openai import AsyncOpenAI
from functools import lru_cache
import httpx
import re
from backend.db import get_locations
import os

api_key = os.environ.get('OPENAI_API_KEY')

# Initialize AsyncOpenAI client with custom httpx client
http_client = httpx.AsyncClient(
    timeout=httpx.Timeout(60.0, connect=30.0),
    limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
)
client = AsyncOpenAI(
    api_key=api_key,
    http_client=http_client
)

def read_pdf_content(pdf_path: str) -> str:
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            return ' '.join(page.extract_text() for page in reader.pages)
    except Exception as e:
        print(f"Error reading PDF {pdf_path}: {str(e)}")
        return ""

# todo: fetch possible locations from the database and use it to inform the parsing
async def analyze_query_with_gpt(query: str) -> dict:
    """Analyze user query with GPT to extract search criteria"""
    try:
        locations = await get_locations()
        locations = ", ".join(locations)
        print(f"Current available locations: {locations}")
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "system",
                "content": """Extract search criteria from the query. Return ONLY a valid JSON object like this:
                    {
                        "location": location name or null,
                        "bedrooms": number or null,
                        "bathrooms": number or null,
                        "max_price": number or null,
                        "min_price": number or null,
                        "pet_friendly": boolean or null,
                        "washer_dryer": boolean or null
                    }
                    Do not include any other text or explanation.
                    Set washer_dryer to true if query mentions washer/dryer, laundry, or w/d.
                    For location, map the user input to {locations} if possible.
                    If the query is looking for a studio, set bedrooms to 0.5
                    """
            }, {
                "role": "user",
                "content": query
            }],
            temperature=0.1
        )
        content = response.choices[0].message.content.strip()
        print(f"Raw GPT response: {content}")
        return json.loads(content)
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {str(e)}, Content: {content}")
        raise HTTPException(status_code=500, detail="Failed to parse GPT response")
    except Exception as e:
        print(f"GPT analysis error: {str(e)}")
        if "rate_limit_exceeded" in str(e):
            await asyncio.sleep(15)  # Wait for 15 seconds
            try:
                return await analyze_query_with_gpt(query)  # Retry once
            except Exception as retry_error:
                print(f"Retry failed: {str(retry_error)}")
                raise HTTPException(status_code=500, detail=f"GPT analysis failed after retry: {str(retry_error)}")
        raise HTTPException(status_code=500, detail=f"GPT analysis failed: {str(e)}")

async def handle_rate_limit(wait_time: float) -> None:
    """Handle rate limit with exponential backoff"""
    wait_time = min(wait_time * 1.5, 60)  # Don't wait more than 60 seconds
    print(f"Rate limit hit, waiting {wait_time:.2f} seconds...")
    await asyncio.sleep(wait_time)
    return wait_time

# old chat gpt only function that is slow
async def match_listings_with_gpt(content: str, criteria: dict, retry_count: int = 0) -> List[dict]:
    """Match PDF content against search criteria using GPT"""
    wait_time = 15.0  # Initial wait time
    max_retries = 3   # Maximum number of retries
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "system",
                "content": """Extract matching listings as a JSON array. Return ONLY a valid JSON array of objects like this:
                    [
                        {
                            "city": "string",
                            "address": "string",
                            "rent": number,
                            "washer_dryer": boolean,
                            "pet_friendly": boolean,
                            "url": "string or null",
                            "image": "string or null"
                        }
                    ]
                    Do not include any other text or explanation.
                    If the query is looking for a studio, set bedrooms to 0.5
                """
            }, {
                "role": "user",
                "content": f"Criteria: {json.dumps(criteria)}\nContent: {content}"
            }],
            temperature=0.1,
            timeout=60.0  # Increase timeout
        )
        # Get the response content and clean it
        content = response.choices[0].message.content.strip()
        print(f"Raw GPT matching response: {content}")  # Debug print
        
        # Remove markdown formatting if present
        if content.startswith('```'):
            content = content.split('\n', 1)[1]  # Remove first line
            content = content.rsplit('\n', 1)[0]  # Remove last line
            if content.startswith('json'):  # Remove 'json' if present
                content = content[4:].lstrip()
        
        # Handle empty array case
        if content.strip() in ('[]', ''):
            return []
            
        return json.loads(content)
    except json.JSONDecodeError as e:
        print(f"JSON parsing error in matching: {str(e)}, Content: {content}")
        return []
    except Exception as e:
        error_message = str(e)
        print(f"GPT matching error: {error_message}")
        
        if "rate_limit_exceeded" in error_message and retry_count < max_retries:
            wait_time = await handle_rate_limit(wait_time)
            return await match_listings_with_gpt(content, criteria, retry_count + 1)
        elif "timeout" in error_message.lower() and retry_count < max_retries:
            print(f"Timeout error, retrying ({retry_count + 1}/{max_retries})...")
            await asyncio.sleep(5)  # Wait 5 seconds before retry
            return await match_listings_with_gpt(content, criteria, retry_count + 1)
        return []


async def process_listings_with_gpt(content: str, retry_count: int = 0) -> List[dict]:
    """Match PDF content against search criteria using GPT"""
    wait_time = 15.0  # Initial wait time
    max_retries = 1   # Maximum number of retries

    print(f"Processing listings with GPT: {content}")
    # print("Processing listings with GPT")
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "system",
                "content": """Write a python function, which accepts a big string of content matching the provided input. The function should extract the all the listings as a JSON array. This function should return ONLY a valid JSON array of objects like this:
                    [
                        {
                            "city": "string",
                            "bedrooms","float",
                            "bathrooms","float",
                            "address": "string",
                            "rent": number,
                            "washer_dryer": boolean,
                            "pet_friendly": boolean,
                            "url": "string or null",
                            "image": "string or null"
                        }
                    ]
                    Do not include any other text or explanation. 
                    Do not return the processed listings, return the python code so I can run it. 
                    Do not json dump the listings, return the python object.
                    The function should be called ai_extract_listings and accept a single argument called content.
                    Any code including the word import is unacceptable. Do not import dependencies or include code outside the function.
                    You can assume re is already imported so dont import re.
                    Bed and bathrooms should default to 1 if not specified.
                    Use regex to parse the listings.
                    If bedrooms value is not a number and is the string studio, set bedrooms to 0.5
                    """
            }, {
                "role": "user",
                "content": f"Content: {content}"
            }],
            temperature=0.0,
            timeout=60.0  # Increase timeout
        )
        print("got response")
        # Get the response content and clean it
        code = response.choices[0].message.content.strip()
        # print(f"Raw GPT matching response: {content}")  # Debug print
        
        # Remove markdown formatting if present
        if code.startswith('```'):
            code = code.split('\n', 1)[1]  # Remove first line
            code = code.rsplit('\n', 1)[0]  # Remove last line
            if code.startswith('json'):  # Remove 'json' if present
                code = code[4:].lstrip()
        
        # Add a new line at the end and beginning of the code.
        code = "\n" + code + "\n"

        # Execute the function code
        exec(code, globals())

        print("code compiled", code)

        # Call the function
        listings = ai_extract_listings(content[:2])
        
        return listings
            
    except json.JSONDecodeError as e:
        print(f"JSON parsing error in matching: {str(e)}, Content: {content}")
        return []
    except Exception as e:
        error_message = str(e)
        print(f"GPT matching error: {error_message}")
        
        if "rate_limit_exceeded" in error_message and retry_count < max_retries:
            wait_time = await handle_rate_limit(wait_time)
            return await match_listings_with_gpt(content, criteria, retry_count + 1)
        elif "timeout" in error_message.lower() and retry_count < max_retries:
            print(f"Timeout error, retrying ({retry_count + 1}/{max_retries})...")
            await asyncio.sleep(5)  # Wait 5 seconds before retry
            return await match_listings_with_gpt(content, criteria, retry_count + 1)
        return []


def extract_listings_original(content):
    print(f"Extracting listings from content: {content}")
    listings = []
    pattern = r'City:\s*(.*?)\s*Address:\s*(.*?)\s*Rent:\s*(\d+\.\d+)\s*In-unit\s*Washer\s*and\s*Dryer:\s*(Yes|No)\s*Pet-friendly:\s*(Yes|No)\s*URL:\s*(.*?)\s*Image:\s*(.*?)\s*(?=Lis/ng|\Z)'
    
    matches = re.findall(pattern, content)
    print(f"Found {len(matches)} matches")
    
    for match in matches:
        city, address, rent, bedrooms, bathrooms, washer_dryer, pet_friendly, url, image = match
        print(f"city: {city}, address: {address}, rent: {rent}, bedrooms: {bedrooms}, bathrooms: {bathrooms}, washer_dryer: {washer_dryer}, pet_friendly: {pet_friendly}, url: {url}, image: {image}")
        listings.append({
            "city": city.strip(),
            "address": address.strip(),
            "rent": float(rent),
            "bedrooms": int(bedrooms),
            "bathrooms": float(bathrooms),
            "washer_dryer": washer_dryer.strip() == "Yes",
            "pet_friendly": pet_friendly.strip() == "Yes",
            "url": url.strip() if url.strip() else None,
            "image": image.strip() if image.strip() else None
        })

    return listings


def extract_listings(content):
     # Normalize whitespace and fix text encoding issues
    content = re.sub(r"\s+", " ", content)
    content = content.replace("Lis1ng", "Listing").replace("speci6ied", "specified")
    
    patterns = [r'Listing\s+\d+:', r'-{8,}', r'(?=City:\s*)']
    best_blocks = []
    for pattern in patterns:
        candidate = [b for b in re.split(pattern, content) if b.strip()]
        if len(candidate) > len(best_blocks):
            best_blocks = candidate

    print("Found", len(best_blocks), "blocks")
    
    listings = []
    for block in best_blocks:
        if not re.search(r'City:\s*', block, re.IGNORECASE):
            continue

        city_match = re.search(r'City:\s*(.+?)(?=\t•|Address:|$)', block, re.IGNORECASE)
        address_match = re.search(r'Address:\s*(.+?)(?=\t•|Rent:|$)', block, re.IGNORECASE)
        bedrooms_match = re.search(r'Bedrooms?:\s*([\w\.]+)', block, re.IGNORECASE)
        bathrooms_match = re.search(r'Bathrooms?:\s*([\w\.]+)', block, re.IGNORECASE)
        rent_match = re.search(r'Rent:\s*\$?([\d,\.]+)', block, re.IGNORECASE)
        wd_match = re.search(r'Washer\s*/?\s*Dryer:\s*(Yes|No)', block, re.IGNORECASE)
        pet_match = re.search(r'(?:Pet\s*Friendly|Pets):\s*(Yes|No)', block, re.IGNORECASE)
        url_match = re.search(r'URL:\s*(\S+)', block, re.IGNORECASE)
        image_match = re.search(r'Image:\s*(\S+)', block, re.IGNORECASE)

        if not (city_match or address_match or rent_match):
            continue

        city = city_match.group(1).strip().replace("\t", " ") if city_match else ""
        if "Neighborhood:" in city:
            city = city.split("Neighborhood:")[0].strip()
        
        address = address_match.group(1).strip().replace("\t", " ") if address_match else ""

        if bedrooms_match:
            bd_val = bedrooms_match.group(1).strip().lower()
            if bd_val == "studio":
                bedrooms = 0.5
            else:
                try:
                    bedrooms = float(bd_val)
                except:
                    bedrooms = 1.0
        else:
            bedrooms = 1.0

        if bathrooms_match:
            bt_val = bathrooms_match.group(1).strip().lower()
            try:
                bathrooms = float(bt_val)
            except:
                bathrooms = 1.0
        else:
            bathrooms = 1.0

        if rent_match:
            rent_str = rent_match.group(1).replace(",", "").strip()
            try:
                rent = float(rent_str)
            except:
                rent = None
        else:
            rent = None

        if bedrooms != bedrooms:
            bedrooms = None
        if bathrooms != bathrooms:
            bathrooms = None
        if rent != rent:
            rent = None

        washer_dryer = True if wd_match and wd_match.group(1).strip().lower() == "yes" else False
        pet_friendly = True if pet_match and pet_match.group(1).strip().lower() == "yes" else False

        # Validate URL to filter out invalid values
        if url_match:
            url_value = url_match.group(1).strip().replace("\t", " ")
            if "http" in url_value and "." in url_value:
                url = url_value
            else:
                url = None
        else:
            url = None

        image = image_match.group(1).strip().replace("\t", " ") if image_match else None

        listing = {
            "city": city,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "address": address,
            "rent": rent,
            "washer_dryer": washer_dryer,
            "pet_friendly": pet_friendly,
            "url": url,
            "image": image
        }
        listings.append(listing)
    return listings






