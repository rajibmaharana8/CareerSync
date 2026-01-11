from serpapi import GoogleSearch
from app.core.config import settings
from typing import List, Dict

def search_jobs_google(query: str, location: str = "Remote", time_range: str = None, platforms: str = None) -> List[Dict]:
    """
    time_range options: 'today' (24h), '3days', 'week', 'month'
    """
    
    # Map "Remote" to a valid location for SerpAPI
    # SerpAPI doesn't support "Remote" as a location
    if location.lower() == "remote":
        location = "India"  # Default to India for remote jobs
    
    # Map friendly names to SerpAPI chips
    # date_posted:today, date_posted:3days, date_posted:week, date_posted:month
    chips = []
    if time_range:
        chips.append(f"date_posted:{time_range}")
    
    params = {
        "engine": "google_jobs",
        "q": query,
        "location": location,
        "hl": "en",
        "gl": "in",
        "api_key": settings.SERPAPI_KEY,
    }
    
    if chips:
        params["chips"] = ",".join(chips)

    print(f"DEBUG: Search Query: {query}")

    all_cleaned_jobs = []
    pages_to_fetch = 4 # Target ~40 jobs if available
    
    try:
        next_page_token = None
        
        for page in range(pages_to_fetch):
            current_params = params.copy()
            if next_page_token:
                current_params["next_page_token"] = next_page_token
            
            search = GoogleSearch(current_params)
            results = search.get_dict()
            
            if "error" in results:
                print(f"ERROR from SerpAPI on page {page}: {results['error']}")
                break
                
            jobs_list = results.get("jobs_results", [])
            if not jobs_list:
                break
                
            for job in jobs_list:
                if not job.get("company_name"): continue

                apply_options = job.get("apply_options", [])
                apply_link = apply_options[0].get("link") if apply_options else "#"
                platform_name = apply_options[0].get("title") if apply_options else "Google Jobs"

                is_verified = True if job.get("thumbnail") else False
                
                salary = "Salary Not Disclosed"
                if job.get("salary_info"):
                    salary = job.get("salary_info")
                elif job.get("detected_extensions", {}).get("salary"):
                    salary = job.get("detected_extensions", {}).get("salary")
                
                job_type = job.get("detected_extensions", {}).get("job_type", "Not Specified")

                all_cleaned_jobs.append({
                    "job_id": job.get("job_id"),
                    "title": job.get("title"),
                    "company_name": job.get("company_name"),
                    "location": job.get("location", "Remote"),
                    "description": job.get("description", "No description available."),
                    "salary": salary,
                    "job_type": job_type,
                    "thumbnail": job.get("thumbnail"), 
                    "posted_at": job.get("detected_extensions", {}).get("posted_at", "Recently"),
                    "apply_link": apply_link,
                    "platform": platform_name,
                    "is_verified": is_verified
                })
            
            # Check for next page
            next_page_token = results.get("serpapi_pagination", {}).get("next_page_token")
            if not next_page_token:
                break
                
        # Filter by platform if specified
        if platforms:
            requested_platforms = [p.lower() for p in platforms.split(",")]
            if len(requested_platforms) >= 5:
                return all_cleaned_jobs
                
            filtered_jobs = [j for j in all_cleaned_jobs if any(req in j["platform"].lower() for req in requested_platforms)]
            
            if not filtered_jobs and all_cleaned_jobs:
                return all_cleaned_jobs[:20]
            return filtered_jobs
            
        return all_cleaned_jobs


    except Exception as e:
        error_msg = f"Error fetching jobs: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        # Return error info for debugging
        return [{
            "title": "Search Error",
            "company_name": "System",
            "location": "N/A",
            "description": error_msg,
            "thumbnail": None,
            "posted_at": "Now",
            "apply_link": "#",
            "platform": "Error",
            "is_verified": False
        }]