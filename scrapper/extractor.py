import requests
import time

_e="https://peekaboo.guru/api/v8/entity/deals"
_h={"Content-Type":"application/json","Authorization":"Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NzIsInJvbGUiOiJndWVzdCIsImlhdCI6MTU1MzcwMDgwNiwianRpIjoiUEpJMXFTb2ktQzRBZFJWcm9nb3RNV2UzV3VXcFdXTm0ifQ.2mb26xL4Qt7FfBQZ-XQvp-fhecMpaVUVXWp_GEST_6U","medium":"WEB","origin":"https://peekaboo.guru"}

def _fp(a,b,c=3):
    _d={"targetEntityId":a,"city":"Lahore","country":"Pakistan","limit":100,"offset":b,"associatedDeals":True,"atlId":"_all","card":"All","lat":31.554606,"long":74.357158,"sourceEntityId":"_all","targetBranchId":"_all","language":"en"}
    for _i in range(c):
        try:
            _r=requests.post(_e,headers=_h,json=_d,timeout=20)
            _r.raise_for_status()
            return _r.json().get("deals",[])
        except requests.exceptions.Timeout:
            pass
        except requests.exceptions.RequestException:
            break
        time.sleep(2**_i)
    return []

def fetch_all_deals(_a):
    _x,_o,_p=[],0,100
    while True:
        _d=_fp(_a,_o)
        _x.extend(_d)
        if len(_d)<100:break
        _o+=_p
    return _x

def extract_bank(_d):
    return {k:_d.get(k) for k in["sourceEntityId","sourceOriginalId","sourceEntityName","sourceEntityDescription","sourceEntityContactNumber","sourceEntityLogo"]}

def extract_restaurant(_d):
    return {k:_d.get(k) for k in["targetEntityId","targetEntityName","targetEntityLogo"]}

def extract_branches(_d):
    _b=_d.get("targetBranches") or {}
    return [{"branch_id":int(_k),"title":_v.strip()} for _k,_v in _b.items()]

def extract_cards(_d):
    _a=_d.get("associations") or {}
    return [{"type_id":_c.get("typeId"),"name":_c.get("name"),"image":_c.get("image"),"sourceEntityAssociationId":_c.get("sourceEntityAssociationId")} for _c in _a]

def extract_deals(_d):
    return {k:_d.get(k) for k in["dealId","startDate","endDate","title","description","percentageValue","orderType","flatValue","capAmount"]}