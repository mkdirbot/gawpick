import requests
import json
import sys

RANDOM_ORG_API_KEY = "86a383a1-1593-408e-8464-d4e042a3a6f3"

# Read participants from stdin
participants = sys.stdin.read().splitlines()

if not participants:
    print("No participants yet!")
    sys.exit()

response = requests.post(
    "https://api.random.org/json-rpc/4/invoke",
    json={
        "jsonrpc": "2.0",
        "method": "generateIntegers",
        "params": {
            "apiKey": RANDOM_ORG_API_KEY,
            "n": 5,  # Number of winners
            "min": 0,
            "max": len(participants) - 1,
            "replacement": False
        },
        "id": 1
    }
)

winners = response.json()["result"]["random"]["data"]
for i in winners:
    print(participants[i])