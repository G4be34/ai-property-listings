import os
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
import hashlib

connection_string =os.environ.get('DATABASE_URL')

async def run_query(query):
    connection_pool = pool.SimpleConnectionPool(1, 10, connection_string)
    if connection_pool:
        print("Connection pool created successfully")
    conn = connection_pool.getconn()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(query)
    
    # For SELECT queries, fetch the result
    if query.strip().lower().startswith('select'):
        result = cursor.fetchall()
    # For INSERT, UPDATE, DELETE, commit the transaction
    else:
        conn.commit()
        result = {"ok":"true"}
    
    cursor.close()
    connection_pool.putconn(conn)
    connection_pool.closeall()
    print("Connection pool closed successfully")
    return result


async def get_locations():
    query = "SELECT DISTINCT city FROM listings;"
    locations = await run_query(query)
    return [row["city"] for row in locations]


def build_listing_upsert_statement(listings):
    """
    Generates SQL upsert statements for a list of rental listing dictionaries.

    :param listings: List of dictionaries, each representing a rental property.
    :return: List of SQL upsert statements as strings.
    """
    upsert_statements = []
    for listing in listings:
        # Escape single quotes and tabs in string values to prevent SQL errors
        escaped_values = {k: v.replace("'", "''").replace("\t", " ") if isinstance(v, str) else v for k, v in listing.items()}
        hashed_id = generate_unique_id(escaped_values['address'])
        # Construct the SQL upsert statement
        upsert_statement = (
            f"INSERT INTO listings (id, city, address, rent, bedrooms, bathrooms, washer_dryer, pet_friendly, url, image) VALUES "
            f"('{hashed_id}', '{escaped_values['city']}', '{escaped_values['address']}', {escaped_values['rent'] or 'null'}, "
            f"{escaped_values['bedrooms'] or 'null'}, {escaped_values['bathrooms'] or 'null'}, "
            f"{'TRUE' if escaped_values['washer_dryer'] else 'FALSE'}, {'TRUE' if escaped_values['pet_friendly'] else 'FALSE'}, "
            f"'{escaped_values['url'] or 'null'}', '{escaped_values['image']}') "
            f"ON CONFLICT (id) DO UPDATE SET "
            f"city = EXCLUDED.city, "
            f"address = EXCLUDED.address, "
            f"rent = EXCLUDED.rent, "
            f"bedrooms = EXCLUDED.bedrooms, "
            f"bathrooms = EXCLUDED.bathrooms, "
            f"washer_dryer = EXCLUDED.washer_dryer, "
            f"pet_friendly = EXCLUDED.pet_friendly, "
            f"url = EXCLUDED.url, "
            f"image = EXCLUDED.image;"
        )
        upsert_statements.append(upsert_statement)
    return upsert_statements

def build_listing_count_query(criteria):
    base_query="SELECT count(*) FROM listings WHERE 1=1 and rent is not null "
    filters = compute_filters(criteria)
    
    # Combine all filters
    if filters:
        base_query += " AND " + " AND ".join(filters)
    
    return base_query

def build_listing_search_query(criteria, page=0, page_size=9):
    print(f"Received search criteria: {criteria}")
    base_query="SELECT * FROM listings WHERE 1=1 and rent is not null"
    filters = compute_filters(criteria)
    
    # Combine all filters
    if filters:
        base_query += " AND " + " AND ".join(filters)
    
    return base_query + f' offset {page*page_size} limit {page_size};'

def compute_filters(criteria):
    filters = []
    if criteria.get("location"):
        filters.append(f"city like '%{criteria['location']}%'")
        
    if criteria.get("bedrooms") is not None:
        filters.append(f"bedrooms = {criteria['bedrooms']}")

    if criteria.get("bathrooms") is not None:
        filters.append(f"bathrooms = {criteria['bathrooms']}")
    
    if criteria.get("max_price") is not None:
        filters.append(f"rent <= {criteria['max_price']}")

    if criteria.get("min_price") is not None:
        filters.append(f"rent >= {criteria['min_price']}")
    
    if criteria.get("pet_friendly") is not None:
        filters.append(f"pet_friendly = {(criteria['pet_friendly'])}")  # Assuming pet_friendly is stored as 0/1 in DB
    
    if criteria.get("washer_dryer") is not None:
        filters.append(f"washer_dryer = {(criteria['washer_dryer'])}")  # Assuming washer_dryer is stored as 0/1 in DB
    
    return filters


def standardize_address(address):
    """
    Standardizes the address string for consistent hashing.

    :param address: The address string to standardize.
    :return: A standardized address string.
    """
    # Example standardization: convert to lowercase and strip extra spaces
    standardized = ' '.join(address.lower().split())
    return standardized

def generate_unique_id(address):
    """
    Generates a unique numerical identifier from a given address string using combined SHA-256 and SHA-512 hashes.

    :param address: The address string to hash.
    :return: A unique integer identifier.
    """
    standardized_address = standardize_address(address)
    address_bytes = standardized_address.encode('utf-8')
    
    # SHA-256 hash
    sha256 = hashlib.sha256()
    sha256.update(address_bytes)
    unique_id = sha256.hexdigest()

    # print(f"Generated unique ID for address '{address}': {unique_id}")

    return unique_id