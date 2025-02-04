from pydantic import BaseModel
from typing import List, Optional

class Query(BaseModel):
    text: str
    page: Optional[int] = 0
    pageSize: Optional[int] = 9
    
class Listing(BaseModel):
    city: str
    address: str
    rent: float
    washer_dryer: bool
    pet_friendly: bool
    url: Optional[str]
    image: Optional[str]

class QueryResponse(BaseModel):
    count: int
    left: int
    matches: List[Listing]
    query_understanding: dict
