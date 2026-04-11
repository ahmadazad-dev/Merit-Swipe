import os
import pandas as pd

_DESC_ALIASES    = ["description", "desc", "narration", "particulars", "details"]
_DEBIT_ALIASES   = ["debit", "dr", "withdrawal", "withdrawals"]
_CREDIT_ALIASES  = ["credit", "cr", "deposit", "deposits"]
_BALANCE_ALIASES = ["available balance", "balance", "running balance", "closing balance"]
_DATE_ALIASES    = ["booking date", "date", "transaction date", "value date"]


def _find_col(columns: list[str], aliases: list[str]) -> str | None:
    lower_cols = {c.lower(): c for c in columns}
    for alias in aliases:
        if alias.lower() in lower_cols:
            return lower_cols[alias.lower()]
    return None


def extract_transactions(csv_path: str) -> pd.DataFrame:
    if not os.path.isfile(csv_path):
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    raw = pd.read_csv(csv_path, dtype=str)

    raw.columns = [c.strip() for c in raw.columns]
    cols = list(raw.columns)

    date_col    = _find_col(cols, _DATE_ALIASES)
    desc_col    = _find_col(cols, _DESC_ALIASES)
    debit_col   = _find_col(cols, _DEBIT_ALIASES)
    credit_col  = _find_col(cols, _CREDIT_ALIASES)
    balance_col = _find_col(cols, _BALANCE_ALIASES)

    if not desc_col:
        raise ValueError(f"Cannot find a description column. Columns found: {cols}")

    keep = {}

    if date_col:
        keep["date"] = raw[date_col].str.strip()

    keep["description"] = raw[desc_col].str.strip()

    if debit_col:
        keep["debit"] = (
            raw[debit_col]
            .str.replace(",", "", regex=False)
            .str.strip()
        )
    else:
        keep["debit"] = None

    if credit_col:
        keep["credit"] = (
            raw[credit_col]
            .str.replace(",", "", regex=False)
            .str.strip()
        )
    else:
        keep["credit"] = None

    if balance_col:
        keep["balance"] = (
            raw[balance_col]
            .str.replace(",", "", regex=False)
            .str.strip()
        )
    else:
        keep["balance"] = None

    df = pd.DataFrame(keep)

    for num_col in ["debit", "credit", "balance"]:
        if num_col in df.columns:
            df[num_col] = pd.to_numeric(df[num_col], errors="coerce")

    df = df[df["description"].notna() & (df["description"] != "")]

    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], dayfirst=True, errors="coerce")

    df = df.reset_index(drop=True)

    total      = len(raw)
    kept       = len(df)
    dropped    = total - kept
    print(f"[extract] Rows in file  : {total}")
    print(f"[extract] Rows kept     : {kept}")
    print(f"[extract] Rows dropped  : {dropped}  (blank description / header repeats)")
    print(f"[extract] Columns       : {list(df.columns)}")

    return df


if __name__ == "__main__":
    import sys
    path = sys.argv[1] if len(sys.argv) > 1 else "Categorization_Data.csv"
    df = extract_transactions(path)
    print(df.head(10).to_string())