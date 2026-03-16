import requests
import json
import pandas as pd

url = "https://peekaboo.guru/api/v8/entity/deals"

## 6, 12, 13, 10 These are those entity ids which are giving data

headers = {
    "accept": "*/*",
    "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NzIsInJvbGUiOiJndWVzdCIsImlhdCI6MTU1MzcwMDgwNiwianRpIjoiUEpJMXFTb2ktQzRBZFJWcm9nb3RNV2UzV3VXcFdXTm0ifQ.2mb26xL4Qt7FfBQZ-XQvp-fhecMpaVUVXWp_GEST_6U",
    "content-type": "application/json",
    "medium": "WEB",
    "origin": "https://peekaboo.guru",
    "referer": "https://peekaboo.guru/lahore/detail/13/kababjees/card-offers?ai=2941&associationTypeId=1943&ei=73011&sourceEntityId=241",
    "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36"
}

payload = {
    "associatedDeals": True,
    "atlId": "_all",
    "card": "All",
    "city": "Lahore",
    "country": "Pakistan",
    "language": "en",
    "lat": 31.554606,
    "limit": 100,
    "long": 74.357158,
    "offset": 0,
    "sourceEntityId": "_all",
    "targetBranchId": "_all",
    "targetEntityId": 13
}

print("Fetching data...")

response = requests.post(url, headers=headers, json=payload, timeout=10)
response.raise_for_status()

json_data = response.json()
print("Success! Data retrieved.\n")

deals_list = json_data.get('deals', [])

if deals_list:
    json_filename = 'deals_4.json'
    with open(json_filename, 'w', encoding='utf-8') as file:
        json.dump(deals_list, file, indent=4, ensure_ascii=False)
    print(f"Successfully saved {len(deals_list)} deals to {json_filename}!")
else:
    print("No deals found in the response to save.")

df = pd.DataFrame(deals_list)

# columns_to_drop = [
#     'keywords',
#     'poweredBy',
#     'redeemableCount',
#     'expiresIn',
#     'likeCount',
#     'likedByMe',
#     'dislikedByMe',
#     'sourceOriginalId',
#     'sourceEntityDescription',
#     'buy',
#     'apply',
#     'isRedeemable',
#     'redeemedCount',
#     'redemptionDetails',
#     'dislikeCount'
# ]

# df.drop(columns=columns_to_drop, inplace=True, errors='ignore')
# df = df.dropna(subset=['title'])

# json_data = df.to_dict(orient='records')

# with open('deals_1.json', 'w') as f:
#     json.dump(json_data, f, indent=4)

print(df.columns)
