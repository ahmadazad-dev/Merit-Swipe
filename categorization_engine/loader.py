import os
import math
import pyodbc
import pandas as pd
from datetime import datetime, timezone

CONNECTION_STRING = (
    "Driver={ODBC Driver 18 for SQL Server};"
    "Server=localhost;"
    "Database=merit_swipe;"
    "UID=sa;"
    "PWD=123456;"
    "Trusted_Connection=yes;"
    "TrustServerCertificate=yes;"
)

USER_ID = 1


def get_connection() -> pyodbc.Connection:
    return pyodbc.connect(CONNECTION_STRING)


def load_transaction_import(
    csv_path: str,
    row_count_total: int,
    row_count_imported: int,
    row_count_failed: int,
    status: str,
    error_summary: str | None,
    conn: pyodbc.Connection,
) -> int:

    original_filename = os.path.basename(csv_path)
    file_size_bytes = os.path.getsize(csv_path) if os.path.isfile(csv_path) else 0
    completed_at = datetime.now(timezone.utc) if status != "failed" else None

    query = """
      INSERT INTO transaction_imports
         (user_id, original_filename, file_size_bytes,
         row_count_total, row_count_imported, row_count_failed,
         status, error_summary, imported_at, completed_at)
      OUTPUT INSERTED.id
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, SYSUTCDATETIME(), ?);
    """

    values = (
        USER_ID,
        original_filename,
        file_size_bytes,
        row_count_total,
        row_count_imported,
        row_count_failed,
        status,
        error_summary,
        completed_at,
    )

    cursor = conn.cursor()
    cursor.execute(query, values)
    row = cursor.fetchone()
    conn.commit()
    import_id = int(row[0])
    print(f"[loader] transaction_imports → id={import_id}")
    return import_id


def _safe_float(val) -> float | None:
    try:
        f = float(val)
        return None if math.isnan(f) else f
    except (TypeError, ValueError):
        return None


def _safe_date(val):
    if pd.isna(val):
        return None
    if isinstance(val, (pd.Timestamp, datetime)):
        return val.date()
    try:
        return pd.to_datetime(val, dayfirst=True).date()
    except Exception:
        return None


def load_transactions(
    df: pd.DataFrame,
    import_id: int,
    conn: pyodbc.Connection,
) -> tuple[int, int]:

    query = """
    MERGE transactions WITH (HOLDLOCK) AS target
    USING (VALUES (?, ?, ?, (SELECT TOP 1 id FROM categories WHERE slug = ?), ?, ?, ?, ?, ?)) AS source
        (user_id, import_id, merchant_name_raw, category_id,
         amount, currency, transaction_date, notes, created_at)
    ON  target.user_id            = source.user_id
    AND target.import_id          = source.import_id
    AND target.merchant_name_raw  = source.merchant_name_raw
    AND target.transaction_date   = source.transaction_date
    AND target.amount             = source.amount
    WHEN MATCHED THEN
        UPDATE SET category_id = source.category_id
    WHEN NOT MATCHED THEN
        INSERT (user_id, import_id, merchant_name_raw, category_id,
                amount, currency, transaction_date, notes, created_at)
        VALUES (source.user_id, source.import_id, source.merchant_name_raw,
                source.category_id, source.amount, source.currency,
                source.transaction_date, source.notes, source.created_at);
    """

    cursor = conn.cursor()
    imported = 0
    failed = 0
    errors = []

    for _, row in df.iterrows():
        debit = _safe_float(row.get("debit"))
        credit = _safe_float(row.get("credit"))
        amount = debit if debit is not None else credit

        merchant_raw = str(row.get("description", ""))[:300]
        txn_date = _safe_date(row.get("date"))
        notes = str(row.get("clean_description", ""))[:500]
        currency = "PKR"

        category_slug = str(row.get("category", "other"))

        values = (
            USER_ID,
            import_id,
            merchant_raw,
            category_slug,
            amount,
            currency,
            txn_date,
            notes,
            datetime.now(timezone.utc),
        )

        try:
            cursor.execute(query, values)
            conn.commit()
            imported += 1
        except pyodbc.Error as exc:
            conn.rollback()
            failed += 1
            errors.append(str(exc)[:200])

    print(f"[loader] transactions → imported={imported}  failed={failed}")
    if errors:
        print(f"[loader] First error: {errors[0]}")

    return imported, failed


def load_all(
    df: pd.DataFrame,
    csv_path: str,
    conn: pyodbc.Connection,
) -> int:

    total = len(df)

    import_id = load_transaction_import(
        csv_path=csv_path,
        row_count_total=total,
        row_count_imported=0,
        row_count_failed=0,
        status="processing",
        error_summary=None,
        conn=conn,
    )

    imported, failed = load_transactions(df, import_id, conn)

    status = "completed" if failed == 0 else ("partial" if imported > 0 else "failed")
    error_summary = f"{failed} rows failed to load." if failed else None

    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE transaction_imports
        SET row_count_imported = ?,
            row_count_failed   = ?,
            status             = ?,
            error_summary      = ?,
            completed_at       = SYSUTCDATETIME()
        WHERE id = ?
        """,
        (imported, failed, status, error_summary, import_id),
    )
    conn.commit()
    print(f"[loader] transaction_imports updated → status={status}")

    return import_id
