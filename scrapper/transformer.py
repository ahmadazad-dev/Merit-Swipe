def transform_bank(_r):
    _n = _r.get("sourceEntityName", "")
    return {
        "peekaboo_entity_id":   _r.get("sourceEntityId"),
        "peekaboo_original_id": _r.get("sourceOriginalId"),
        "name":                 _n,
        "slug":                 _n.lower().strip().replace(" ", "-"),
        "description":          _r.get("sourceEntityDescription"),
        "contact_number":       _r.get("sourceEntityContactNumber"),
        "url_logo":             _r.get("sourceEntityLogo"),
        "website_url":          None
    }

def transform_restaurant(_r):
    _n = _r.get("targetEntityName")
    return {
        "peekaboo_entity_id":   _r.get("targetEntityId"),
        "name":                 _n,
        "slug":                 _n.lower().strip().replace(" ", "-"),
        "category_id":          None,
        "url_logo":             _r.get("targetEntityLogo")
    }

def transform_branch(_r, _rid):
    return {
        "restaurant_id":        _rid,
        "peekaboo_branch_id":   _r.get("branch_id"),
        "title":                _r.get("title")
    }

def transform_card(_r, _bid):
    return {
        "bank_id":                  _bid,
        "peekaboo_card_type_id":    _r.get("type_id"),
        "peekaboo_association_id":  _r.get("sourceEntityAssociationId"),
        "name":                     _r.get("name"),
        "url_logo":                 _r.get("image")
    }

def transform_deal(_r, _rid, _bid):
    _p = _r.get("percentageValue")
    if _p is not None and (_p <= 0 or _p > 100): _p = None
    _f = _r.get("flatValue")
    if _f is not None and _f <= 0: _f = None
    _c = _r.get("capAmount")
    if _c is not None and _c <= 0: _c = None
    _o = _r.get("orderType")
    return {
        "peekaboo_deal_id":     _r.get("dealId"),
        "restaurant_id":        _rid,
        "bank_id":              _bid,
        "title":                _r.get("title"),
        "description":          _r.get("description"),
        "percentage_value":     _p,
        "flat_value":           _f,
        "cap_amount":           _c,
        "valid_outlet":         1 if _o == "OUTLET"   else 0,
        "valid_delivery":       1 if _o == "DELIVERY" else 0,
        "valid_takeaway":       1 if _o == "TAKEAWAY" else 0,
        "start_date":           _r.get("startDate"),
        "end_date":             _r.get("endDate")
    }