import io
import sys
import traceback
import argparse

from extract   import extract_transactions
from transform import transform_transactions, generate_pdf_report
from loader    import get_connection, load_all


def run_pipeline_pdf(csv_path: str, load_db: bool = True) -> io.BytesIO:
    print("\n" + "━" * 60)
    print("  CATEGORIZATION ENGINE  —  PIPELINE START")
    print("━" * 60)

    print("\n[1/3]  EXTRACT")
    df_raw = extract_transactions(csv_path)

    print("\n[2/3]  TRANSFORM")
    df = transform_transactions(df_raw)

    if load_db:
        print("\n[3/3]  LOAD  →  SQL Server")
        try:
            conn      = get_connection()
            import_id = load_all(df, csv_path, conn)
            conn.close()
            print(f"[pipeline] DB load complete  (import_id={import_id})")
        except Exception as exc:
            print(f"[pipeline] ⚠  DB load FAILED: {exc}")
            traceback.print_exc()
            print("[pipeline]    Continuing to PDF step.")
    else:
        print("\n[3/3]  LOAD  →  skipped")

    print("\n[report]  Generating PDF report …")
    pdf_buf = generate_pdf_report(df)

    print("\n" + "━" * 60)
    print("  PIPELINE COMPLETE")
    print("━" * 60 + "\n")

    return pdf_buf


def _run_cli(csv_path: str, load_db: bool, save_pdf: bool) -> None:
    print("\n" + "━" * 60)
    print("  CATEGORIZATION ENGINE  —  PIPELINE START")
    print("━" * 60)

    print("\n[1/3]  EXTRACT")
    df_raw = extract_transactions(csv_path)

    print("\n[2/3]  TRANSFORM")
    df = transform_transactions(df_raw)

    if load_db:
        print("\n[3/3]  LOAD  →  SQL Server")
        try:
            conn      = get_connection()
            import_id = load_all(df, csv_path, conn)
            conn.close()
            print(f"[pipeline] DB load complete  (import_id={import_id})")
        except Exception as exc:
            print(f"[pipeline] ⚠  DB load FAILED: {exc}")
            traceback.print_exc()
    else:
        print("\n[3/3]  LOAD  →  skipped (--no-db flag)")

    if save_pdf:
        print("\n[report]  Generating PDF …")
        pdf_buf  = generate_pdf_report(df)
        out_path = csv_path.replace(".csv", "_report.pdf")
        with open(out_path, "wb") as f:
            f.write(pdf_buf.read())
        print(f"[report]  PDF saved → {out_path}")
    else:
        print("\n[report]  Chart skipped (--no-chart flag)")

    print("\n" + "━" * 60)
    print("  PIPELINE COMPLETE")
    print("━" * 60 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Categorization Engine Pipeline")
    parser.add_argument("csv",        help="Path to the bank-statement CSV file")
    parser.add_argument("--no-db",    action="store_true", help="Skip the DB load step")
    parser.add_argument("--no-chart", action="store_true", help="Skip the PDF report")
    args = parser.parse_args()

    try:
        _run_cli(
            csv_path = args.csv,
            load_db  = not args.no_db,
            save_pdf = not args.no_chart,
        )
    except Exception as exc:
        print(f"[pipeline]  Pipeline FAILED: {exc}")
        traceback.print_exc()