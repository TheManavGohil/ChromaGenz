import requests
import os
import sys
from datetime import datetime

# Get the backend URL from environment variables
# For Render, this is usually your service URL (e.g., https://your-app.onrender.com)
BACKEND_URL = os.getenv("BACKEND_URL")

def check_health():
    if not BACKEND_URL:
        print(f"[{datetime.now()}] Error: BACKEND_URL environment variable not set.")
        sys.exit(1)

    try:
        # Pinging the health check endpoint
        response = requests.get(BACKEND_URL, timeout=10)
        if response.status_code == 200:
            print(f"[{datetime.now()}] Health Check Success: {response.json().get('message')}")
        else:
            print(f"[{datetime.now()}] Health Check Failed: Status {response.status_code}")
    except Exception as e:
        print(f"[{datetime.now()}] Health Check Error: {str(e)}")

if __name__ == "__main__":
    check_health()

