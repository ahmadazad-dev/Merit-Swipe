import io
import re
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from matplotlib.backends.backend_pdf import PdfPages


CATEGORY_RULES: list[tuple[str, list[str]]] = [

    ("salary",          ["salary credit", "salary"]),
    ("profit_income",   ["payment of profit", "profit on account", "profit on savings",
                         "clearing cheque", "rtgs transfer from", "dispute credit",
                         "refund from", "reversal pos"]),

    ("fast_food",       ["kfc", "mcdonalds", "mcdonald", "macdonalds", "macdonald",
                         "subway", "burger king", "pizza hut", "hardees", "optp",
                         "dominos", "cheeseious", "johnny juggnu", "indraiver",
                         "food panda", "foodpanda", "fpanda", "food-panda"]),

    ("transport",       ["careem", "uber", "yango", "indrive", "pakistan railways",
                         "ride payment", "e-commerce uber"]),

    ("fuel",            ["pso petrol", "shell petrol", "shell filling", "shell stan",
                         "attock petroleum", "total parco", "petrol pump",
                         "csd terminal"]),

    ("groceries",       ["jalal sons", "imtiaz", "al fatah", "al-fatah", "carrefour",
                         "metro cash", "green apple mart", "imtiaz mkt",
                         "imtiaz super"]),

    ("clothing",        ["khaadi", "lime light", "limelight", "ndure", "outfitters",
                         "alkaram", "bonanza", "j. store", "ideas by gul ahmed",
                         "gul ahmed", "sapphire", "breakout"]),

    ("health",          ["servaid pharmacy", "shaukat khanum", "pharmacy", "clinic",
                         "hospital", "health"]),

    ("utilities",       ["ptcl", "sngpl", "kelectric", "k-electric", "nayatel",
                         "storm fiber", "utility payment", "ubps payment",
                         "bill pay", "1link bill", "online pay spotify", "netflix",
                         "spotify", "aws emea", "e-commerce pur aws"]),

    ("atm_withdrawal",  ["atm wdl", "atm debit", "cash withdrawal", "1link",
                         "withholding tax"]),

    ("bank_charges",    ["charges taxes", "fed stan", "visa card replacement",
                         "withholding tax debit", "withholding tax u/s"]),

    ("transfer_out",    ["money transferred to", "raast p2p fund transfer to",
                         "ibft to", "ibft outward", "m-banking fund tfr",
                         "ibft to "]),

    ("transfer_in",     ["money received", "raast p2p fund transfer - - from",
                         "ibft inward", "ibft from", "raast p2p fund transfer --"]),
]

CATEGORY_LABELS = {
    "salary":          "Salary",
    "profit_income":   "Profit / Refunds",
    "fast_food":       "Fast Food",
    "transport":       "Transport",
    "fuel":            "Fuel",
    "groceries":       "Groceries",
    "clothing":        "Clothing",
    "health":          "Health",
    "utilities":       "Utilities",
    "atm_withdrawal":  "ATM Withdrawal",
    "bank_charges":    "Bank Charges",
    "transfer_out":    "Transfer Out",
    "transfer_in":     "Transfer In",
    "other":           "Other",
}


def _clean_description(raw: str) -> str:
    if not isinstance(raw, str):
        return ""

    text = re.sub(r"\bSTAN\s*\(\d+\)", "", raw, flags=re.IGNORECASE)
    text = re.sub(r"\bSTAN\s*\d+", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\bREF\s+\w+", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\b[A-Z0-9]{8,}\b", "", text)
    text = re.sub(r"PK\w+\d{4}", "", text, flags=re.IGNORECASE)
    text = re.sub(r"XXXX\w*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\bBR-\d+\b", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s{2,}", " ", text).strip(" -,")
    text = text.title()
    return text or raw


def _categorize(desc: str) -> str:
    lower = desc.lower()
    for category, keywords in CATEGORY_RULES:
        if any(kw in lower for kw in keywords):
            return category
    return "other"


def transform_transactions(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["clean_description"] = out["description"].apply(_clean_description)
    out["category"]          = out["description"].apply(_categorize)

    print(f"[transform] Rows processed    : {len(out)}")
    print(f"[transform] Category breakdown:")
    for cat, count in out["category"].value_counts().items():
        label = CATEGORY_LABELS.get(cat, cat)
        print(f"             {label:<30} {count:>5} rows")

    return out


BG_PAGE   = "#1e1e2e"
BG_AXES   = "#181825"
FG_TEXT   = "#cdd6f4"
ACCENT    = "#cba6f7"
BAR_COLOR = "#89b4fa"
GRID_CLR  = "#313244"

PIE_COLORS = [
    "#cba6f7", "#89b4fa", "#a6e3a1", "#f38ba8",
    "#fab387", "#f9e2af", "#94e2d5", "#eba0ac",
    "#74c7ec", "#b4befe", "#a6adc8", "#585b70",
]

fmt_k  = mticker.FuncFormatter(lambda x, _: f"{x/1000:,.0f}K")
fmt_pkr = lambda v: f"PKR {v:,.0f}"


def _base_fig(title: str, subtitle: str = "") -> tuple:
    fig, ax = plt.subplots(figsize=(14, 9))
    fig.patch.set_facecolor(BG_PAGE)
    ax.set_facecolor(BG_AXES)
    ax.spines[:].set_visible(False)
    ax.tick_params(colors=FG_TEXT, labelsize=10)

    fig.text(
        0.5, 0.97, title,
        ha="center", va="top",
        color=FG_TEXT, fontsize=18, fontweight="bold",
    )
    if subtitle:
        fig.text(
            0.5, 0.935, subtitle,
            ha="center", va="top",
            color=ACCENT, fontsize=11,
        )

    fig.subplots_adjust(top=0.86, bottom=0.10, left=0.18, right=0.92)
    return fig, ax


def _footer(fig: plt.Figure, page_num: int, total_pages: int) -> None:
    fig.text(
        0.5, 0.02,
        f"MeritSwipe Categorization Engine  ·  Page {page_num} of {total_pages}",
        ha="center", va="bottom",
        color="#585b70", fontsize=8,
    )


def generate_pdf_report(df: pd.DataFrame) -> io.BytesIO:

    SPENDING_EXCLUDE = {"salary", "profit_income", "transfer_in"}

    spend       = df[~df["category"].isin(SPENDING_EXCLUDE)].copy()
    spend_debit = spend[spend["debit"].notna() & (spend["debit"] > 0)]

    total_in    = df.loc[df["credit"].notna(), "credit"].sum()
    total_out   = df.loc[df["debit"].notna(),  "debit"].sum()
    net_flow    = total_in - total_out

    cat_summary = (
        spend_debit.groupby("category")["debit"]
        .agg(["sum", "count"])
        .rename(columns={"sum": "total", "count": "txns"})
        .sort_values("total", ascending=False)
    )
    grand_spend = cat_summary["total"].sum()
    label_list  = [CATEGORY_LABELS.get(c, c) for c in cat_summary.index]

    print("\n" + "═" * 60)
    print("  TRANSACTION REPORT")
    print("═" * 60)
    print(f"  Total Transactions   : {len(df)}")
    print(f"  Total Credits (In)   : PKR {total_in:>14,.2f}")
    print(f"  Total Debits  (Out)  : PKR {total_out:>14,.2f}")
    print(f"  Net Flow             : PKR {net_flow:>14,.2f}")
    print("═" * 60 + "\n")

    TOTAL_PAGES = 5
    buf = io.BytesIO()

    with PdfPages(buf) as pdf:

        fig = plt.figure(figsize=(14, 9))
        fig.patch.set_facecolor(BG_PAGE)

        header_ax = fig.add_axes([0, 0.80, 1, 0.18])
        header_ax.set_facecolor("#11111b")
        header_ax.axis("off")
        header_ax.text(
            0.5, 0.62, "MeritSwipe",
            ha="center", va="center",
            color=ACCENT, fontsize=36, fontweight="bold",
            transform=header_ax.transAxes,
        )
        header_ax.text(
            0.5, 0.22, "Categorization Engine  ·  Spending Report",
            ha="center", va="center",
            color=FG_TEXT, fontsize=14,
            transform=header_ax.transAxes,
        )

        kpis = [
            ("Total Credits", f"PKR {total_in:,.0f}", "#a6e3a1"),
            ("Total Debits",  f"PKR {total_out:,.0f}", "#f38ba8"),
            ("Net Flow",      f"PKR {net_flow:,.0f}",
             "#a6e3a1" if net_flow >= 0 else "#f38ba8"),
        ]
        for i, (kpi_title, kpi_val, kpi_color) in enumerate(kpis):
            left = 0.06 + i * 0.31
            ax = fig.add_axes([left, 0.52, 0.27, 0.22])
            ax.set_facecolor("#181825")
            ax.set_xlim(0, 1); ax.set_ylim(0, 1)
            ax.axis("off")
            ax.add_patch(plt.Rectangle((0, 0.88), 1, 0.12,
                                       color=kpi_color, transform=ax.transAxes,
                                       clip_on=False))
            ax.text(0.5, 0.62, kpi_title,
                    ha="center", va="center", color=FG_TEXT,
                    fontsize=12, transform=ax.transAxes)
            ax.text(0.5, 0.32, kpi_val,
                    ha="center", va="center", color="white",
                    fontsize=15, fontweight="bold", transform=ax.transAxes)

        stat_labels = [
            ("Total Transactions", f"{len(df):,}"),
            ("Spending Categories", f"{len(cat_summary)}"),
            ("Largest Category",
             CATEGORY_LABELS.get(cat_summary.index[0], cat_summary.index[0])
             if len(cat_summary) else "—"),
            ("Biggest Spend",
             f"PKR {cat_summary['total'].iloc[0]:,.0f}"
             if len(cat_summary) else "—"),
        ]
        for i, (lbl, val) in enumerate(stat_labels):
            left = 0.06 + i * 0.235
            ax = fig.add_axes([left, 0.30, 0.21, 0.17])
            ax.set_facecolor("#313244")
            ax.set_xlim(0, 1); ax.set_ylim(0, 1)
            ax.axis("off")
            ax.text(0.5, 0.70, lbl,
                    ha="center", va="center", color="#a6adc8",
                    fontsize=9, transform=ax.transAxes)
            ax.text(0.5, 0.32, val,
                    ha="center", va="center", color="white",
                    fontsize=13, fontweight="bold", transform=ax.transAxes)

        tbl_ax = fig.add_axes([0.06, 0.055, 0.88, 0.22])
        tbl_ax.set_facecolor("#181825")
        tbl_ax.axis("off")
        tbl_ax.text(0.0, 0.96, "Spending Breakdown by Category",
                    color=ACCENT, fontsize=11, fontweight="bold",
                    transform=tbl_ax.transAxes, va="top")

        col_x = [0.0, 0.30, 0.55, 0.72, 0.88]
        headers_txt = ["Category", "Total Spent (PKR)", "Transactions", "% of Spend", "Bar"]
        for cx, htxt in zip(col_x, headers_txt):
            tbl_ax.text(cx, 0.83, htxt, color="#a6adc8",
                        fontsize=8.5, transform=tbl_ax.transAxes,
                        fontweight="bold", va="top")

        row_h = 0.135
        for ri, (cat, row) in enumerate(cat_summary.iterrows()):
            y = 0.75 - ri * row_h
            if y < 0:
                break
            pct  = 100 * row["total"] / grand_spend if grand_spend else 0
            clr  = PIE_COLORS[ri % len(PIE_COLORS)]
            vals = [
                CATEGORY_LABELS.get(cat, cat),
                f"{row['total']:,.0f}",
                f"{int(row['txns']):,}",
                f"{pct:.1f}%",
            ]
            for cx, v in zip(col_x, vals):
                tbl_ax.text(cx, y, v, color=FG_TEXT,
                            fontsize=8, transform=tbl_ax.transAxes, va="top")
            bar_w = 0.10 * (pct / 100)
            tbl_ax.add_patch(plt.Rectangle(
                (col_x[4], y - 0.01), bar_w, 0.07,
                color=clr, transform=tbl_ax.transAxes, clip_on=False
            ))

        _footer(fig, 1, TOTAL_PAGES)
        pdf.savefig(fig, facecolor=fig.get_facecolor())
        plt.close(fig)

        fig, ax = _base_fig(
            "Spending by Category",
            "Debit transactions only · Transfers & Salary excluded",
        )

        colors_bar = [PIE_COLORS[i % len(PIE_COLORS)] for i in range(len(cat_summary))]
        bars = ax.barh(
            label_list[::-1],
            cat_summary["total"].values[::-1],
            color=colors_bar[::-1],
            edgecolor="none",
            height=0.55,
        )
        ax.xaxis.set_major_formatter(fmt_k)
        ax.set_xlabel("Amount (PKR)", color=FG_TEXT, fontsize=11, labelpad=10)
        ax.xaxis.label.set_color(FG_TEXT)
        ax.tick_params(axis="x", colors=FG_TEXT)
        ax.tick_params(axis="y", colors=FG_TEXT, labelsize=11)
        ax.grid(axis="x", color=GRID_CLR, linewidth=0.8, linestyle="--")
        ax.set_axisbelow(True)

        for bar, val in zip(bars, cat_summary["total"].values[::-1]):
            pct = 100 * val / grand_spend if grand_spend else 0
            ax.text(
                bar.get_width() + grand_spend * 0.003,
                bar.get_y() + bar.get_height() / 2,
                f"PKR {val:,.0f}  ({pct:.1f}%)",
                va="center", color=FG_TEXT, fontsize=9,
            )

        _footer(fig, 2, TOTAL_PAGES)
        pdf.savefig(fig, facecolor=fig.get_facecolor())
        plt.close(fig)

        fig = plt.figure(figsize=(14, 9))
        fig.patch.set_facecolor(BG_PAGE)
        fig.text(0.5, 0.97, "Spending Share",
                 ha="center", va="top",
                 color=FG_TEXT, fontsize=18, fontweight="bold")
        fig.text(0.5, 0.935, "Proportion of total spending by category",
                 ha="center", va="top", color=ACCENT, fontsize=11)

        ax_pie = fig.add_axes([0.10, 0.10, 0.50, 0.78])
        ax_pie.set_facecolor(BG_PAGE)

        wedges, _, autotexts = ax_pie.pie(
            cat_summary["total"],
            labels=None,
            colors=PIE_COLORS[:len(cat_summary)],
            autopct="%1.1f%%",
            pctdistance=0.78,
            startangle=140,
            wedgeprops=dict(edgecolor=BG_PAGE, linewidth=2.5, width=0.55),
        )
        for t in autotexts:
            t.set_fontsize(10)
            t.set_color("white")
            t.set_fontweight("bold")

        ax_pie.text(0, 0, f"PKR\n{grand_spend/1e6:.2f}M\ntotal",
                    ha="center", va="center",
                    color=FG_TEXT, fontsize=13, fontweight="bold",
                    linespacing=1.6)

        legend_ax = fig.add_axes([0.62, 0.10, 0.35, 0.78])
        legend_ax.set_facecolor(BG_PAGE)
        legend_ax.axis("off")
        legend_ax.text(0.05, 0.97, "Category Breakdown",
                       color=ACCENT, fontsize=12, fontweight="bold",
                       transform=legend_ax.transAxes, va="top")

        for ri, (cat, row) in enumerate(cat_summary.iterrows()):
            pct = 100 * row["total"] / grand_spend if grand_spend else 0
            y   = 0.90 - ri * 0.082
            clr = PIE_COLORS[ri % len(PIE_COLORS)]
            legend_ax.add_patch(plt.Rectangle(
                (0.02, y + 0.005), 0.045, 0.045,
                color=clr, transform=legend_ax.transAxes, clip_on=False
            ))
            legend_ax.text(0.10, y + 0.025,
                           CATEGORY_LABELS.get(cat, cat),
                           color=FG_TEXT, fontsize=10,
                           transform=legend_ax.transAxes, va="center")
            legend_ax.text(0.72, y + 0.025,
                           f"{pct:.1f}%",
                           color=PIE_COLORS[ri % len(PIE_COLORS)],
                           fontsize=10, fontweight="bold",
                           transform=legend_ax.transAxes, va="center",
                           ha="right")

        _footer(fig, 3, TOTAL_PAGES)
        pdf.savefig(fig, facecolor=fig.get_facecolor())
        plt.close(fig)

        fig, ax = _base_fig(
            "Monthly Spending Trend",
            "Total debit spend per calendar month · Transfers & Salary excluded",
        )

        if "date" in spend_debit.columns and spend_debit["date"].notna().any():
            monthly = (
                spend_debit.set_index("date")["debit"]
                .resample("ME")
                .sum()
            )
            ax.fill_between(monthly.index, monthly.values,
                            alpha=0.25, color=ACCENT)
            ax.plot(monthly.index, monthly.values,
                    color=ACCENT, linewidth=2.5,
                    marker="o", markersize=7, markerfacecolor=ACCENT)

            ax.yaxis.set_major_formatter(fmt_k)
            ax.set_ylabel("Spend (PKR)", color=FG_TEXT, fontsize=11, labelpad=10)
            ax.yaxis.label.set_color(FG_TEXT)
            ax.tick_params(axis="both", colors=FG_TEXT)
            ax.grid(axis="y", color=GRID_CLR, linewidth=0.8, linestyle="--")
            ax.set_axisbelow(True)

            for x, y in zip(monthly.index, monthly.values):
                ax.annotate(
                    f"PKR {y/1000:.1f}K",
                    xy=(x, y),
                    xytext=(0, 12), textcoords="offset points",
                    ha="center", color=FG_TEXT, fontsize=8.5,
                    arrowprops=dict(arrowstyle="-", color=GRID_CLR, lw=0.8),
                )

            peak_m  = monthly.idxmax()
            low_m   = monthly.idxmin()
            avg_m   = monthly.mean()
            fig.text(0.93, 0.76, "Monthly Stats", color=ACCENT,
                     fontsize=10, fontweight="bold", ha="center")
            stats_items = [
                ("Peak month",    f"{peak_m.strftime('%b %Y')}"),
                ("Peak spend",    f"PKR {monthly.max():,.0f}"),
                ("Lowest month",  f"{low_m.strftime('%b %Y')}"),
                ("Lowest spend",  f"PKR {monthly.min():,.0f}"),
                ("Monthly avg",   f"PKR {avg_m:,.0f}"),
                ("Months tracked",f"{len(monthly)}"),
            ]
            for si, (slbl, sval) in enumerate(stats_items):
                y_pos = 0.70 - si * 0.065
                fig.text(0.93, y_pos, slbl,  color="#a6adc8", fontsize=8.5, ha="center")
                fig.text(0.93, y_pos - 0.030, sval, color=FG_TEXT,
                         fontsize=9, fontweight="bold", ha="center")

            fig.subplots_adjust(right=0.84)
        else:
            ax.text(0.5, 0.5, "Date column not available for trend analysis",
                    ha="center", va="center", color=FG_TEXT, fontsize=13,
                    transform=ax.transAxes)

        _footer(fig, 4, TOTAL_PAGES)
        pdf.savefig(fig, facecolor=fig.get_facecolor())
        plt.close(fig)

        fig, ax = _base_fig(
            "Transaction Count by Category",
            "How frequently each category appears in your statement",
        )

        sorted_count  = cat_summary["txns"].sort_values(ascending=False)
        sorted_labels = [CATEGORY_LABELS.get(c, c) for c in sorted_count.index]
        bar_colors    = [PIE_COLORS[i % len(PIE_COLORS)]
                         for i in range(len(sorted_count))]

        bars2 = ax.barh(
            sorted_labels[::-1],
            sorted_count.values[::-1],
            color=bar_colors[::-1],
            edgecolor="none",
            height=0.55,
        )
        ax.set_xlabel("Number of Transactions", color=FG_TEXT,
                      fontsize=11, labelpad=10)
        ax.xaxis.label.set_color(FG_TEXT)
        ax.tick_params(axis="x", colors=FG_TEXT)
        ax.tick_params(axis="y", colors=FG_TEXT, labelsize=11)
        ax.grid(axis="x", color=GRID_CLR, linewidth=0.8, linestyle="--")
        ax.set_axisbelow(True)

        total_txns = sorted_count.sum()
        for bar, cnt in zip(bars2, sorted_count.values[::-1]):
            pct = 100 * cnt / total_txns if total_txns else 0
            ax.text(
                bar.get_width() + total_txns * 0.005,
                bar.get_y() + bar.get_height() / 2,
                f"{int(cnt):,}  ({pct:.1f}%)",
                va="center", color=FG_TEXT, fontsize=9,
            )

        _footer(fig, 5, TOTAL_PAGES)
        pdf.savefig(fig, facecolor=fig.get_facecolor())
        plt.close(fig)

        d = pdf.infodict()
        d["Title"]   = "MeritSwipe Spending Report"
        d["Subject"] = "Transaction Categorization Dashboard"

    buf.seek(0)
    return buf


if __name__ == "__main__":
    import sys
    from extract import extract_transactions

    path     = sys.argv[1] if len(sys.argv) > 1 else "Categorization_Data.csv"
    raw      = extract_transactions(path)
    df       = transform_transactions(raw)
    pdf_buf  = generate_pdf_report(df)
    out_path = path.replace(".csv", "_report.pdf")
    with open(out_path, "wb") as f:
        f.write(pdf_buf.read())
    print(f"PDF saved → {out_path}")