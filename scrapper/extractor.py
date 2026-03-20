import requests
import time

_url = "https://peekaboo.guru/api/v8/entity/deals"
_headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NzIsInJvbGUiOiJndWVzdCIsImlhdCI6MTU1MzcwMDgwNiwianRpIjoiUEpJMXFTb2ktQzRBZFJWcm9nb3RNV2UzV3VXcFdXTm0ifQ.2mb26xL4Qt7FfBQZ-XQvp-fhecMpaVUVXWp_GEST_6U",
    "medium": "WEB",
    "origin": "https://peekaboo.guru"
}

def _fetch_page(entity_id, offset, retries=3):
    _payload = {
        "targetEntityId": entity_id, "city": "Lahore", "country": "Pakistan",
        "limit": 100, "offset": offset, "associatedDeals": True,
        "atlId": "_all", "card": "All", "lat": 31.554606, "long": 74.357158,
        "sourceEntityId": "_all", "targetBranchId": "_all", "language": "en"
    }
    for _attempt in range(retries):
        try:
            _res = requests.post(_url, headers=_headers, json=_payload, timeout=20)
            _res.raise_for_status()
            return _res.json().get("deals", [])
        except requests.exceptions.Timeout:
            pass
        except requests.exceptions.RequestException:
            break
        time.sleep(2 ** _attempt)
    return []

def fetch_all_deals(entity_id):
    _all, _offset, _size = [], 0, 100
    while True:
        _page = _fetch_page(entity_id, _offset)
        _all.extend(_page)
        if len(_page) < 100:
            break
        _offset += _size
    return _all

def extract_bank(_d):
    return {k: _d.get(k) for k in ["sourceEntityId", "sourceOriginalId", "sourceEntityName", "sourceEntityDescription", "sourceEntityContactNumber", "sourceEntityLogo"]}

def extract_restaurant(_d):
    return {k: _d.get(k) for k in ["targetEntityId", "targetEntityName", "targetEntityLogo"]}

def extract_branches(_d):
    _raw = _d.get("targetBranches") or {}
    return [{"branch_id": int(_k), "title": _v.strip()} for _k, _v in _raw.items()]

def extract_cards(_d):
    _raw = _d.get("associations") or {}
    return [{"type_id": _c.get("typeId"), "name": _c.get("name"), "image": _c.get("image"), "sourceEntityAssociationId": _c.get("sourceEntityAssociationId")} for _c in _raw]

def extract_deals(_d):
    return {k: _d.get(k) for k in ["dealId", "startDate", "endDate", "title", "description", "percentageValue", "orderType", "flatValue", "capAmount"]}