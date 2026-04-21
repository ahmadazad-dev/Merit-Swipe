CATEGORY_RULES = [
    ("salary", ["salary credit", "salary"]),
    (
        "profit_income",
        [
            "payment of profit",
            "profit on account",
            "profit on savings",
            "clearing cheque",
            "rtgs transfer from",
            "dispute credit",
            "refund from",
            "reversal pos",
        ],
    ),
    ("dining", ["fuchsia", "cafe aylanto", "dine-in", "restaurant", "cafe", "dining"]),
    (
        "fast_food",
        [
            "kfc",
            "mcdonalds",
            "mcdonald",
            "macdonalds",
            "macdonald",
            "subway",
            "burger king",
            "pizza hut",
            "hardees",
            "optp",
            "dominos",
            "cheeseious",
            "johnny juggnu",
            "indraiver",
            "food panda",
            "foodpanda",
            "fpanda",
            "food-panda",
        ],
    ),
    (
        "transport",
        [
            "careem",
            "uber",
            "yango",
            "indrive",
            "pakistan railways",
            "ride payment",
            "e-commerce uber",
        ],
    ),
    (
        "fuel",
        [
            "pso petrol",
            "shell petrol",
            "shell filling",
            "shell stan",
            "attock petroleum",
            "total parco",
            "petrol pump",
            "csd terminal",
        ],
    ),
    (
        "groceries",
        [
            "jalal sons",
            "imtiaz",
            "al fatah",
            "al-fatah",
            "carrefour",
            "metro cash",
            "green apple mart",
            "imtiaz mkt",
            "imtiaz super",
        ],
    ),
    (
        "clothing",
        [
            "khaadi",
            "lime light",
            "limelight",
            "ndure",
            "outfitters",
            "alkaram",
            "bonanza",
            "j. store",
            "ideas by gul ahmed",
            "gul ahmed",
            "sapphire",
            "breakout",
        ],
    ),
    (
        "health",
        [
            "servaid pharmacy",
            "shaukat khanum",
            "pharmacy",
            "clinic",
            "hospital",
            "health",
        ],
    ),
    (
        "utilities",
        [
            "ptcl",
            "sngpl",
            "kelectric",
            "k-electric",
            "nayatel",
            "storm fiber",
            "utility payment",
            "ubps payment",
            "bill pay",
            "1link bill",
            "online pay spotify",
            "netflix",
            "spotify",
            "aws emea",
            "e-commerce pur aws",
        ],
    ),
    (
        "atm_withdrawal",
        ["atm wdl", "atm debit", "cash withdrawal", "1link", "withholding tax"],
    ),
    (
        "bank_charges",
        [
            "charges taxes",
            "fed stan",
            "visa card replacement",
            "withholding tax debit",
            "withholding tax u/s",
        ],
    ),
    (
        "transfer_out",
        [
            "money transferred to",
            "raast p2p fund transfer to",
            "ibft to",
            "ibft outward",
            "m-banking fund tfr",
            "ibft to ",
        ],
    ),
    (
        "transfer_in",
        [
            "money received",
            "raast p2p fund transfer - - from",
            "ibft inward",
            "ibft from",
            "raast p2p fund transfer --",
        ],
    ),
]

CATEGORY_LABELS = {
    "salary": "Salary",
    "profit_income": "Profit / Refunds",
    "dining": "Dining & Restaurants",
    "fast_food": "Fast Food",
    "transport": "Transport",
    "fuel": "Fuel",
    "groceries": "Groceries",
    "clothing": "Clothing",
    "health": "Health",
    "utilities": "Utilities",
    "atm_withdrawal": "ATM Withdrawal",
    "bank_charges": "Bank Charges",
    "transfer_out": "Transfer Out",
    "transfer_in": "Transfer In",
    "other": "Other",
}


def get_category(text):
    if not text:
        return CATEGORY_LABELS["other"]

    text = text.lower()
    for cat_key, keywords in CATEGORY_RULES:
        if any(kw in text for kw in keywords):
            return CATEGORY_LABELS[cat_key]

    return CATEGORY_LABELS["other"]


def transform_bank(_r):
    _n = _r.get("sourceEntityName", "")
    return {
        "peekaboo_entity_id": _r.get("sourceEntityId"),
        "peekaboo_original_id": _r.get("sourceOriginalId"),
        "name": _n,
        "slug": _n.lower().strip().replace(" ", "-") if _n else "",
        "description": _r.get("sourceEntityDescription"),
        "contact_number": _r.get("sourceEntityContactNumber"),
        "url_logo": _r.get("sourceEntityLogo"),
        "website_url": None,
    }


def transform_restaurant(_r):
    _n = _r.get("targetEntityName", "")
    _category = get_category(_n)

    return {
        "peekaboo_entity_id": _r.get("targetEntityId"),
        "name": _n,
        "slug": _n.lower().strip().replace(" ", "-") if _n else "",
        "category": _category,
        "url_logo": _r.get("targetEntityLogo"),
    }


def transform_branch(_r, _rid):
    return {
        "restaurant_id": _rid,
        "peekaboo_branch_id": _r.get("branch_id"),
        "title": _r.get("title"),
    }


def transform_card(_r, _bid):
    return {
        "bank_id": _bid,
        "peekaboo_card_type_id": _r.get("type_id"),
        "peekaboo_association_id": _r.get("sourceEntityAssociationId"),
        "name": _r.get("name"),
        "url_logo": _r.get("image"),
    }


def transform_deal(_r, _rid, _bid):
    _p = _r.get("percentageValue")
    if _p is not None and (_p <= 0 or _p > 100):
        _p = None
    _f = _r.get("flatValue")
    if _f is not None and _f <= 0:
        _f = None
    _c = _r.get("capAmount")
    if _c is not None and _c <= 0:
        _c = None
    _o = _r.get("orderType")
    return {
        "peekaboo_deal_id": _r.get("dealId"),
        "restaurant_id": _rid,
        "bank_id": _bid,
        "title": _r.get("title"),
        "description": _r.get("description"),
        "percentage_value": _p,
        "flat_value": _f,
        "cap_amount": _c,
        "valid_outlet": 1 if _o == "OUTLET" else 0,
        "valid_delivery": 1 if _o == "DELIVERY" else 0,
        "valid_takeaway": 1 if _o == "TAKEAWAY" else 0,
        "start_date": _r.get("startDate"),
        "end_date": _r.get("endDate"),
    }
