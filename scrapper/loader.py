import pyodbc

_cs=("DRIVER={ODBC Driver 17 for SQL Server};""SERVER=AHMADLAPTOP123\\SQLEXPRESS;""DATABASE=merit_swipe;""Trusted_Connection=yes;""TrustServerCertificate=yes;")

def get_connection():return pyodbc.connect(_cs)

def _ex(conn,q,v):
    c=conn.cursor();c.execute(q,v);conn.commit();return c

def _sid(conn,t,k,v):
    c=conn.cursor();c.execute(f"SELECT id FROM {t} WHERE {k} = ?",v);return c.fetchone()[0]

def load_bank(_d,conn):
    _ex(conn,"""MERGE banks WITH(HOLDLOCK)AS T USING(VALUES(?,?,?,?,?,?,?,?))AS S(peekaboo_entity_id,peekaboo_original_id,name,slug,description,contact_number,url_logo,website_url)ON T.peekaboo_entity_id=S.peekaboo_entity_id WHEN MATCHED THEN UPDATE SET name=S.name,slug=S.slug,url_logo=S.url_logo,updated_at=SYSUTCDATETIME()WHEN NOT MATCHED THEN INSERT(peekaboo_entity_id,peekaboo_original_id,name,slug,description,contact_number,url_logo,website_url)VALUES(S.peekaboo_entity_id,S.peekaboo_original_id,S.name,S.slug,S.description,S.contact_number,S.url_logo,S.website_url);""",(_d.get("peekaboo_entity_id"),_d.get("peekaboo_original_id"),_d.get("name"),_d.get("slug"),_d.get("description"),_d.get("contact_number"),_d.get("url_logo"),_d.get("website_url")))
    return _sid(conn,"banks","peekaboo_entity_id",_d.get("peekaboo_entity_id"))

def load_restaurant(_d,conn):
    _ex(conn,"""MERGE restaurants WITH(HOLDLOCK)AS T USING(VALUES(?,?,?,?,?))AS S(peekaboo_entity_id,name,slug,category_id,url_logo)ON T.peekaboo_entity_id=S.peekaboo_entity_id WHEN MATCHED THEN UPDATE SET name=S.name,slug=S.slug,url_logo=S.url_logo,updated_at=SYSUTCDATETIME()WHEN NOT MATCHED THEN INSERT(peekaboo_entity_id,name,slug,category_id,url_logo)VALUES(S.peekaboo_entity_id,S.name,S.slug,S.category_id,S.url_logo);""",(_d.get("peekaboo_entity_id"),_d.get("name"),_d.get("slug"),_d.get("category_id"),_d.get("url_logo")))
    return _sid(conn,"restaurants","peekaboo_entity_id",_d.get("peekaboo_entity_id"))

def load_branch(_d,conn):
    _ex(conn,"""MERGE branches WITH(HOLDLOCK)AS T USING(VALUES(?,?,?))AS S(restaurant_id,title,peekaboo_branch_id)ON T.peekaboo_branch_id=S.peekaboo_branch_id WHEN MATCHED THEN UPDATE SET title=S.title,updated_at=SYSUTCDATETIME()WHEN NOT MATCHED THEN INSERT(restaurant_id,title,peekaboo_branch_id)VALUES(S.restaurant_id,S.title,S.peekaboo_branch_id);""",(_d.get("restaurant_id"),_d.get("title"),_d.get("peekaboo_branch_id")))
    return _sid(conn,"branches","peekaboo_branch_id",_d.get("peekaboo_branch_id"))

def load_card(_d,conn):
    _ex(conn,"""MERGE cards WITH(HOLDLOCK)AS T USING(VALUES(?,?,?,?,?))AS S(bank_id,peekaboo_card_type_id,peekaboo_association_id,name,url_logo)ON T.peekaboo_card_type_id=S.peekaboo_card_type_id WHEN MATCHED THEN UPDATE SET name=S.name,url_logo=S.url_logo,updated_at=SYSUTCDATETIME()WHEN NOT MATCHED THEN INSERT(bank_id,peekaboo_card_type_id,peekaboo_association_id,name,url_logo)VALUES(S.bank_id,S.peekaboo_card_type_id,S.peekaboo_association_id,S.name,S.url_logo);""",(_d.get("bank_id"),_d.get("peekaboo_card_type_id"),_d.get("peekaboo_association_id"),_d.get("name"),_d.get("url_logo")))
    return _sid(conn,"cards","peekaboo_card_type_id",_d.get("peekaboo_card_type_id"))

def load_deal(_d,conn):
    _ex(conn,"""MERGE deals WITH(HOLDLOCK)AS T USING(VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?))AS S(peekaboo_deal_id,restaurant_id,bank_id,title,description,percentage_value,flat_value,cap_amount,valid_outlet,valid_delivery,valid_takeaway,start_date,end_date)ON T.peekaboo_deal_id=S.peekaboo_deal_id WHEN MATCHED THEN UPDATE SET title=S.title,description=S.description,bank_id=S.bank_id,percentage_value=S.percentage_value,valid_outlet=S.valid_outlet,valid_delivery=S.valid_delivery,valid_takeaway=S.valid_takeaway,start_date=S.start_date,end_date=S.end_date,updated_at=SYSUTCDATETIME()WHEN NOT MATCHED THEN INSERT(peekaboo_deal_id,restaurant_id,bank_id,title,description,percentage_value,flat_value,cap_amount,valid_outlet,valid_delivery,valid_takeaway,start_date,end_date)VALUES(S.peekaboo_deal_id,S.restaurant_id,S.bank_id,S.title,S.description,S.percentage_value,S.flat_value,S.cap_amount,S.valid_outlet,S.valid_delivery,S.valid_takeaway,S.start_date,S.end_date);""",(_d.get("peekaboo_deal_id"),_d.get("restaurant_id"),_d.get("bank_id"),_d.get("title"),_d.get("description"),_d.get("percentage_value"),_d.get("flat_value"),_d.get("cap_amount"),_d.get("valid_outlet"),_d.get("valid_delivery"),_d.get("valid_takeaway"),_d.get("start_date"),_d.get("end_date")))
    return _sid(conn,"deals","peekaboo_deal_id",_d.get("peekaboo_deal_id"))

def load_deal_branch(_a,_b,conn):
    _ex(conn,"""MERGE deal_branches AS T USING(SELECT ? AS deal_id,? AS branch_id)AS S ON T.deal_id=S.deal_id AND T.branch_id=S.branch_id WHEN NOT MATCHED THEN INSERT(deal_id,branch_id)VALUES(S.deal_id,S.branch_id);""",(_a,_b))

def load_deal_card(_a,_b,conn):
    _ex(conn,"""MERGE deal_cards AS T USING(SELECT ? AS deal_id,? AS card_id)AS S ON T.deal_id=S.deal_id AND T.card_id=S.card_id WHEN NOT MATCHED THEN INSERT(deal_id,card_id)VALUES(S.deal_id,S.card_id);""",(_a,_b))