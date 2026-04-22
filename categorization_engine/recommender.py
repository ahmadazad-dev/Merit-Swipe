import pandas as pd
from collections import defaultdict
import pyodbc
from transform import CATEGORY_LABELS


def get_database_connection():
    connection_string = (
        "Driver={ODBC Driver 18 for SQL Server};"
        "Server=localhost;"
        "DATABASE=merit_swipe;"
        "UID=sa;"
        "PWD=123456;"
        "Trusted_Connection=yes;"
        "TrustServerCertificate=yes;"
    )
    return pyodbc.connect(connection_string)


def calculate_top_cards(categorized_transactions: pd.DataFrame) -> list[dict]:
    # ADDED .copy() HERE to fix the SettingWithCopyWarning
    debit_transactions = categorized_transactions[
        categorized_transactions["debit"].notna()
        & (categorized_transactions["debit"] > 0)
    ].copy()

    debit_transactions["category_label"] = debit_transactions["category"].map(
        lambda c: CATEGORY_LABELS.get(c, c)
    )

    user_spending_by_category = (
        debit_transactions.groupby("category_label")["debit"].sum().to_dict()
    )

    query = """
        SELECT 
            c.name AS card_name,
            c.url_logo AS card_image,
            b.name AS bank_name,
            r.category AS deal_category,
            MAX(d.percentage_value) AS max_discount
        FROM deals d
        JOIN restaurants r ON d.restaurant_id = r.id
        JOIN banks b ON d.bank_id = b.id
        JOIN deal_cards dc ON d.id = dc.deal_id
        JOIN cards c ON dc.card_id = c.id
        WHERE d.percentage_value IS NOT NULL AND d.percentage_value > 0
        GROUP BY c.name, c.url_logo, b.name, r.category
    """

    connection = get_database_connection()
    try:
        cursor = connection.cursor()
        cursor.execute(query)
        database_rows = cursor.fetchall()
    except Exception as error:
        print(f"Failed to fetch deals: {error}")
        return []
    finally:
        connection.close()

    card_discounts = defaultdict(lambda: defaultdict(int))
    card_info = {}

    for row in database_rows:
        if row.card_name not in card_info:
            card_info[row.card_name] = {"image": row.card_image, "bank": row.bank_name}

        card_discounts[row.card_name][row.deal_category] = float(row.max_discount)

    recommendations = []

    for card_name, discounts in card_discounts.items():
        total_estimated_savings = 0
        highest_saving_category = ""
        max_savings_in_one_category = 0

        for category, discount_percent in discounts.items():
            spent_amount = user_spending_by_category.get(category, 0)
            savings = spent_amount * (discount_percent / 100.0)

            total_estimated_savings += savings

            if savings > max_savings_in_one_category:
                max_savings_in_one_category = savings
                highest_saving_category = category

        if total_estimated_savings > 0:
            recommendations.append(
                {
                    "cardName": card_name,
                    "bankName": card_info[card_name]["bank"],
                    "cardImage": card_info[card_name]["image"],
                    "totalEstimatedSavings": round(total_estimated_savings, 2),
                    "bestCategory": highest_saving_category,
                }
            )

    sorted_recommendations = sorted(
        recommendations, key=lambda card: card["totalEstimatedSavings"], reverse=True
    )

    return sorted_recommendations[:10]
