from math import remainder
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import time
import math

from backend.types import Query, Listing, QueryResponse
from backend.ai import read_pdf_content, analyze_query_with_gpt, process_listings_with_gpt, handle_rate_limit, match_listings_with_gpt, extract_listings
from backend.blob import save_file
from backend.db import run_query, build_listing_upsert_statement, build_listing_search_query, build_listing_count_query
import signal

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello from FastAPI!"}

def alarm_handler(signum, frame):
    raise Exception("Timeout")


@app.post("/ingest/pdf")
async def ingest_pdf(file: UploadFile = File()):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    location = await save_file(file)
    # Read the PDF content
    content = read_pdf_content(location)

    signal.signal(signal.SIGALRM, alarm_handler)
    

    listings = []
    try:
        signal.alarm(60)  # Produce SIGALRM in `timeout` seconds
        listings = extract_listings(content)
    except Exception as e:
        print(f"Error processing request with predefined function: {str(e)}")
    finally:
        signal.alarm(0)  # Cancel the alarm

    if not len(listings):
        try:
            signal.alarm(60)  # Produce SIGALRM in `timeout` seconds
            listings = await process_listings_with_gpt(content)
        except Exception as e:
            print(f"Error processing request with GPT: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            signal.alarm(0)
            
    query=''
    if(len(listings) > 0):
        query = (build_listing_upsert_statement(listings))
        # print(f"query: {query}")
        await run_query(''.join(query))
    
    return {"message": "PDF processed", "valid_records": len(listings), "listings": listings}
    

@app.post("/search")
async def search_listings(query: Query):
    print(f"Received query: {query}")

    page = query.page or 0
    page_size = query.pageSize or 9
    
    try:
        start_time = time.time()
        criteria = await analyze_query_with_gpt(query.text)
        crit_time = time.time() - start_time
        query = build_listing_search_query(criteria, page, page_size)
        print(f"query: {query}")
        results = await run_query(query)
        query_time = time.time() - start_time - crit_time

        query  = build_listing_count_query(criteria)
        countResults = await run_query(query)
        count = countResults[0].get("count")
        count_time = time.time() - start_time - crit_time - query_time

        # print(f"time taken for criteria: {crit_time}, time taken for query: {query_time}, time taken for count: {count_time}")
        # print(f"Extracted criteria: {criteria}, query: {query}, results: {results}",)
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "count":count,
        "totalPages": math.ceil(count/page_size), 
        "page": page, 
        "query_understanding": criteria, 
        "matches": results
    }
        

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=3010, reload=True)