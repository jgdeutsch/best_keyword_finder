import os
import requests
import base64
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

LOGIN = os.getenv("DATAFORSEO_LOGIN")
PASSWORD = os.getenv("DATAFORSEO_PASSWORD")

if not LOGIN or not PASSWORD:
    print("Error: DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD must be set in .env file.")
    exit(1)

CREDENTIALS = base64.b64encode(f"{LOGIN}:{PASSWORD}".encode()).decode()

def get_related_keywords(seed_keyword, location_code=2840, language_code="en"):
    """
    Fetches related keywords from DataForSEO API.
    """
    url = "https://api.dataforseo.com/v3/dataforseo_labs/google/related_keywords/live"
    
    headers = {
        "Authorization": f"Basic {CREDENTIALS}",
        "Content-Type": "application/json"
    }
    
    post_data = [
        {
            "keyword": seed_keyword,
            "location_code": location_code,
            "language_code": language_code,
            "include_serp_info": True,
            "include_clickstream_data": True,
            "depth": 1,
            "limit": 1000  # Increased limit to get more relevant keywords
        }
    ]
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(post_data))
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"API Request Failed: {e}")
        return None

def process_results(data):
    """
    Processes the API response to filter and sort keywords.
    """
    if not data or "tasks" not in data or not data["tasks"]:
        print("No data received from API.")
        return

    task = data["tasks"][0]
    if task["status_code"] != 20000:
        print(f"API Task Error: {task['status_message']}")
        return

    results = task["result"]
    if not results:
        print("No results found.")
        return

    items = results[0].get("items", [])
    
    filtered_keywords = []
    
    for item in items:
        keyword = item.get("keyword_data", {}).get("keyword", item.get("keyword")) # Structure varies slightly sometimes
        
        # Extract metrics. Note: Structure might differ slightly for related_keywords vs keyword_overview
        # For related_keywords, it's usually item['keyword_data']['keyword_info']... or directly in item
        # Let's inspect the item structure safely.
        
        # Based on DataForSEO docs for related_keywords:
        # item['keyword_data']['keyword_info']['search_volume']
        # item['keyword_data']['keyword_properties']['keyword_difficulty']
        
        keyword_data = item.get("keyword_data", {})
        keyword_info = keyword_data.get("keyword_info", {})
        keyword_props = keyword_data.get("keyword_properties", {})
        
        # Extract search volume - try multiple possible locations
        volume = keyword_info.get("search_volume")
        if volume is None:
            volume = item.get("keyword_info", {}).get("search_volume")
        if volume is None:
            volume = keyword_data.get("search_volume")
        
        # Extract keyword difficulty (KD) - try multiple possible locations
        # DataForSEO may return it in keyword_properties or serp_info
        kd = keyword_props.get("keyword_difficulty")
        if kd is None:
            kd = item.get("keyword_properties", {}).get("keyword_difficulty")
        if kd is None:
            kd = keyword_data.get("serp_info", {}).get("keyword_difficulty")
        if kd is None:
            kd = item.get("serp_info", {}).get("keyword_difficulty")

        # Only include keywords with valid volume and KD data, and KD < 40
        if volume is not None and kd is not None and kd < 40:
            filtered_keywords.append({
                "keyword": keyword,
                "search_volume": volume,
                "keyword_difficulty": kd
            })

    # Sort: Highest Volume, then Lowest KD
    sorted_keywords = sorted(
        filtered_keywords,
        key=lambda x: (-x["search_volume"], x["keyword_difficulty"])
    )
    
    return sorted_keywords

def main():
    print("--- DataForSEO Keyword Finder ---")
    seed_keyword = input("Enter a seed keyword: ").strip()
    
    if not seed_keyword:
        print("Keyword cannot be empty.")
        return

    print(f"Searching for related keywords to '{seed_keyword}'...")
    data = get_related_keywords(seed_keyword)
    
    if data:
        top_keywords = process_results(data)
        
        if top_keywords:
            print(f"\nFound {len(top_keywords)} keywords with KD < 40.")
            print("\nTop 10 Recommendations:")
            print(f"{'Keyword':<30} | {'Volume':<10} | {'KD':<5}")
            print("-" * 55)
            
            for kw in top_keywords[:10]:
                print(f"{kw['keyword']:<30} | {kw['search_volume']:<10} | {kw['keyword_difficulty']:<5}")
        else:
            print("No keywords found matching the criteria (KD < 40).")

if __name__ == "__main__":
    main()
