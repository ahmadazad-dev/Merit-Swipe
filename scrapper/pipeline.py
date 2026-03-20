from extractor import fetch_all_deals,extract_bank,extract_restaurant,extract_branches,extract_cards,extract_deals
from transformer import transform_bank,transform_restaurant,transform_branch,transform_card,transform_deal
from loader import load_bank,load_restaurant,load_branch,load_card,load_deal,load_deal_branch,load_deal_card,get_connection
import traceback

def _fsl(conn,_rid,records=0,fetched=0,inserted=0,updated=0,expired=0,error=None):
    c=conn.cursor()
    c.execute("INSERT INTO sync_logs(triggered_by,sync_type,target_restaurant_id,records_processed,deals_fetched,deals_inserted,deals_updated,deals_expired,status,error_message,completed_at)VALUES('SCHEDULED','FULL',?,?,?,?,?,?,?,?,SYSUTCDATETIME())",(_rid,records,fetched,inserted,updated,expired,"SUCCESS"if error is None else"FAILED",str(error)if error else None))
    conn.commit()

def _gid(conn,t,k,v):
    c=conn.cursor();c.execute(f"SELECT id FROM {t} WHERE {k}=?",v);return c.fetchone()[0]

def run_pipeline(_eid):
    conn=None;_rid=None;_tf=_ti=_tu=0
    try:
        conn=get_connection()
        _deals=fetch_all_deals(_eid);_tf=len(_deals)
        _sb=set();_sr=set();_sbr=set();_sc=set();_sd=set()
        for _d in _deals:
            _rb=extract_bank(_d);_cb=transform_bank(_rb);_bid=_cb.get("peekaboo_entity_id")
            _dbid=load_bank(_cb,conn) if _bid not in _sb else _gid(conn,"banks","peekaboo_entity_id",_bid)
            _sb.add(_bid)

            _rr=extract_restaurant(_d);_cr=transform_restaurant(_rr);_restid=_cr.get("peekaboo_entity_id")
            _rid=load_restaurant(_cr,conn) if _restid not in _sr else _gid(conn,"restaurants","peekaboo_entity_id",_restid)
            _sr.add(_restid)

            _dbrids=[]
            for _br in extract_branches(_d):
                _cbr=transform_branch(_br,_rid);_brid=_cbr.get("peekaboo_branch_id")
                _dbrid=load_branch(_cbr,conn) if _brid not in _sbr else _gid(conn,"branches","peekaboo_branch_id",_brid)
                _sbr.add(_brid);_dbrids.append(_dbrid)

            _dcids=[]
            for _c in extract_cards(_d):
                _cc=transform_card(_c,_dbid);_cid=_cc.get("peekaboo_card_type_id")
                _dcid=load_card(_cc,conn) if _cid not in _sc else _gid(conn,"cards","peekaboo_card_type_id",_cid)
                _sc.add(_cid);_dcids.append(_dcid)

            _rd=extract_deals(_d);_cd=transform_deal(_rd,_rid,_dbid);_did=_cd.get("peekaboo_deal_id")
            if _did not in _sd:
                _ddid=load_deal(_cd,conn);_sd.add(_did);_ti+=1
            else:
                _ddid=_gid(conn,"deals","peekaboo_deal_id",_did);_tu+=1

            for _x in _dbrids:load_deal_branch(_ddid,_x,conn)
            for _x in _dcids:load_deal_card(_ddid,_x,conn)

        _fsl(conn,_rid,records=_tf,fetched=_tf,inserted=_ti,updated=_tu)

    except Exception as _e:
        _fsl(conn,_rid,records=_tf,fetched=_tf,inserted=_ti,updated=_tu,error=_e)
        traceback.print_exc()
    finally:
        if conn:conn.close()