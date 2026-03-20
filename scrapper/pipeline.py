from extractor import fetch_all_deals, extract_bank, extract_restaurant, extract_branches, extract_cards, extract_deals
from transformer import transform_bank, transform_restaurant, transform_branch, transform_card, transform_deal
from loader import load_bank, load_restaurant, load_branch, load_card, load_deal, load_deal_branch, load_deal_card, get_connection
import traceback

def _log_sync(conn, _r, records=0, fetched=0, inserted=0, updated=0, expired=0, error=None):
    _c = conn.cursor()
    _c.execute(
        "INSERT INTO sync_logs(triggered_by,sync_type,target_restaurant_id,records_processed,deals_fetched,deals_inserted,deals_updated,deals_expired,status,error_message,completed_at)"
        "VALUES('SCHEDULED','FULL',?,?,?,?,?,?,?,?,SYSUTCDATETIME())",
        (_r, records, fetched, inserted, updated, expired, "SUCCESS" if error is None else "FAILED", str(error) if error else None)
    )
    conn.commit()

def _fetch_id(conn, table, column, value):
    _c = conn.cursor()
    _c.execute(f"SELECT id FROM {table} WHERE {column} = ?", value)
    return _c.fetchone()[0]

def run_pipeline(entity_id):
    conn = None
    _restaurant_id = None
    total_fetched = total_inserted = total_updated = 0

    try:
        conn = get_connection()
        all_deals = fetch_all_deals(entity_id)
        total_fetched = len(all_deals)

        seen_banks = set()
        seen_restaurants = set()
        seen_branches = set()
        seen_cards = set()
        seen_deals = set()

        for deal in all_deals:

            # Bank
            _raw_bank = extract_bank(deal)
            _clean_bank = transform_bank(_raw_bank)
            _bank_key = _clean_bank.get("peekaboo_entity_id")
            if _bank_key not in seen_banks:
                _db_bank_id = load_bank(_clean_bank, conn)
                seen_banks.add(_bank_key)
            else:
                _db_bank_id = _fetch_id(conn, "banks", "peekaboo_entity_id", _bank_key)

            # Restaurant
            _raw_rest = extract_restaurant(deal)
            _clean_rest = transform_restaurant(_raw_rest)
            _rest_key = _clean_rest.get("peekaboo_entity_id")
            if _rest_key not in seen_restaurants:
                _restaurant_id = load_restaurant(_clean_rest, conn)
                seen_restaurants.add(_rest_key)
            else:
                _restaurant_id = _fetch_id(conn, "restaurants", "peekaboo_entity_id", _rest_key)

            # Branches
            _branch_ids = []
            for _branch in extract_branches(deal):
                _clean_branch = transform_branch(_branch, _restaurant_id)
                _branch_key = _clean_branch.get("peekaboo_branch_id")
                if _branch_key not in seen_branches:
                    _db_branch_id = load_branch(_clean_branch, conn)
                    seen_branches.add(_branch_key)
                else:
                    _db_branch_id = _fetch_id(conn, "branches", "peekaboo_branch_id", _branch_key)
                _branch_ids.append(_db_branch_id)

            # Cards
            _card_ids = []
            for _card in extract_cards(deal):
                _clean_card = transform_card(_card, _db_bank_id)
                _card_key = _clean_card.get("peekaboo_card_type_id")
                if _card_key not in seen_cards:
                    _db_card_id = load_card(_clean_card, conn)
                    seen_cards.add(_card_key)
                else:
                    _db_card_id = _fetch_id(conn, "cards", "peekaboo_card_type_id", _card_key)
                _card_ids.append(_db_card_id)

            # Deal
            _raw_deal = extract_deals(deal)
            _clean_deal = transform_deal(_raw_deal, _restaurant_id, _db_bank_id)
            _deal_key = _clean_deal.get("peekaboo_deal_id")
            if _deal_key not in seen_deals:
                _db_deal_id = load_deal(_clean_deal, conn)
                seen_deals.add(_deal_key)
                total_inserted += 1
            else:
                _db_deal_id = _fetch_id(conn, "deals", "peekaboo_deal_id", _deal_key)
                total_updated += 1

            for _bid in _branch_ids: load_deal_branch(_db_deal_id, _bid, conn)
            for _cid in _card_ids: load_deal_card(_db_deal_id, _cid, conn)

        _log_sync(conn, _restaurant_id, records=total_fetched, fetched=total_fetched, inserted=total_inserted, updated=total_updated)

    except Exception as _e:
        _log_sync(conn, _restaurant_id, records=total_fetched, fetched=total_fetched, inserted=total_inserted, updated=total_updated, error=_e)
        traceback.print_exc()
    finally:
        if conn: conn.close()