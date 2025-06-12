import requests
import json
import time
import os

API_URL = "https://api.pump.tires/api/tokens"
OUTPUT_FILE = "pump_tokens.json"  # This will write to the repo root
DELAY_BETWEEN_PAGES = 0.25  # seconds

def fetch_tokens():
    tokens = []
    page = 1

    while True:
        print(f"Fetching page {page}...")
        resp = requests.get(API_URL, params={"filter": "launch_timestamp", "page": page})
        resp.raise_for_status()
        data = resp.json()

        batch = data.get("tokens", [])
        if not batch:
            print("No more tokens found. Stopping.")
            break

        for token in batch:
            if not token.get("is_launched"):
                continue

            tokens.append({
                "address": token.get("address"),
                "name": token.get("name"),
                "symbol": token.get("symbol"),
                "image_url": f"https://ipfs.io/ipfs/{token['image_cid']}" if token.get("image_cid") else None,
                "description": token.get("description"),
                "web": token.get("web"),
                "telegram": token.get("telegram"),
                "twitter": token.get("twitter"),
                "creator_address": token.get("creator", {}).get("address")
            })

        page += 1
        time.sleep(DELAY_BETWEEN_PAGES)

    return tokens

def save_tokens_to_file(tokens, filename=OUTPUT_FILE):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(tokens, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(tokens)} tokens to {filename}")

if __name__ == "__main__":
    print("Starting Pump.tires token scraper...")
    tokens = fetch_tokens()
    save_tokens_to_file(tokens)
    print("Done.")
