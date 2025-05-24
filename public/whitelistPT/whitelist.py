import requests

API_URL = "https://api.pump.tires/api/tokens"

def scrape_addresses():
    addresses = []
    page = 1

    while True:
        resp = requests.get(
            API_URL,
            params={"filter": "launch_timestamp", "page": page}
        )
        resp.raise_for_status()
        data = resp.json()

        # pull from the real key
        tokens = data.get("tokens", [])
        if not tokens:
            print(f"No tokens on page {page}, stopping.")
            break

        print(f"Page {page}: found {len(tokens)} tokens")
        for t in tokens:
            addr = t.get("address")
            if addr:
                addresses.append(addr)

        page += 1

    return addresses

def save_whitelist(addresses, filename="whitelist.txt"):
    with open(filename, "w") as f:
        for addr in addresses:
            f.write(addr + "\n")
    print(f"Saved {len(addresses)} addresses to {filename}")

if __name__ == "__main__":
    all_addresses = scrape_addresses()
    save_whitelist(all_addresses)
