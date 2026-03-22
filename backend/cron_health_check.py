import requests
import os
import sys
from datetime import datetime

# Get the backend base URL from environment variables (no path; script calls /health).
# For Render, this is usually your service URL (e.g., https://your-app.onrender.com)
BACKEND_URL = os.getenv("BACKEND_URL")

def check_health():
    if not BACKEND_URL:
        print(f"[{datetime.now()}] Error: BACKEND_URL environment variable not set.")
        sys.exit(1)

    try:
        base = BACKEND_URL.rstrip("/")
        url = f"{base}/health"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            print(f"[{datetime.now()}] Health Check Success: {url}")
        else:
            print(f"[{datetime.now()}] Health Check Failed: Status {response.status_code}")
    except Exception as e:
        print(f"[{datetime.now()}] Health Check Error: {str(e)}")

if __name__ == "__main__":
    check_health()

