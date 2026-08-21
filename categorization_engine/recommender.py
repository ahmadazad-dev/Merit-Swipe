import pandas as pd
from collections import defaultdict
import pyodbc
from typing import List, Dict, Tuple
from transform import CATEGORY_LABELS

# ==========================================
# 1. Transaction Agent
# ==========================================
class TransactionAgent:
    """Agent responsible for cleaning and analyzing user transaction data."""
    def __init__(self, category_labels: dict):
        self.category_labels = category_labels

    def analyze_spending(self, categorized_transactions: pd.DataFrame) -> Dict[str, float]:
        # Filter for valid debit transactions
        debit_transactions = categorized_transactions[
            categorized_transactions["debit"].notna()
            & (categorized_transactions["debit"] > 0)
        ].copy()

        # Map categories to human-readable labels
        debit_transactions["category_label"] = debit_transactions["category"].map(
            lambda c: self.category_labels.get(c, c)
        )

        # Aggregate total spending by category
        user_spending_by_category = (
            debit_transactions.groupby("category_label")["debit"].sum().to_dict()
        )
        
        return user_spending_by_category


# ==========================================
# 2. Database Agent
# ==========================================
class DatabaseAgent:
    """Agent responsible for fetching and formatting deals from the SQL database."""
    def __init__(self, connection_string: str):
        self.connection_string = connection_string

    def _get_connection(self):
        return pyodbc.connect(self.connection_string)

    def fetch_deals(self) -> Tuple[Dict[str, Dict], Dict[str, Dict[str, float]]]:
        query = """
            SELECT 
                c.name AS card_name,
                c.url_logo AS card_image,
                b.name AS bank_name,
                cat.name AS deal_category,
                MAX(d.percentage_value) AS max_discount
            FROM deals d
            JOIN restaurants r ON d.restaurant_id = r.id
            LEFT JOIN categories cat ON r.category_id = cat.id
            JOIN banks b ON d.bank_id = b.id
            JOIN deal_cards dc ON d.id = dc.deal_id
            JOIN cards c ON dc.card_id = c.id
            WHERE d.percentage_value IS NOT NULL AND d.percentage_value > 0
            GROUP BY c.name, c.url_logo, b.name, cat.name
        """
        
        card_info = {}
        card_discounts = defaultdict(lambda: defaultdict(float))

        try:
            with self._get_connection() as connection:
                cursor = connection.cursor()
                cursor.execute(query)
                database_rows = cursor.fetchall()

                # Process database rows into dictionaries
                for row in database_rows:
                    if row.card_name not in card_info:
                        card_info[row.card_name] = {
                            "image": row.card_image, 
                            "bank": row.bank_name
                        }

                    card_discounts[row.card_name][row.deal_category] = float(row.max_discount)
                    
        except Exception as error:
            print(f"Failed to fetch deals: {error}")
            
        return card_info, card_discounts


# ==========================================
# 3. Recommender Agent
# ==========================================
class RecommenderAgent:
    """Agent responsible for calculating savings and generating ranked recommendations."""
    def __init__(self, max_recommendations: int = 10):
        self.max_recommendations = max_recommendations

    def generate_recommendations(
        self, 
        user_spending: Dict[str, float], 
        card_info: Dict[str, Dict], 
        card_discounts: Dict[str, Dict[str, float]]
    ) -> List[Dict]:
        
        recommendations = []

        for card_name, discounts in card_discounts.items():
            total_estimated_savings = 0
            highest_saving_category = ""
            max_savings_in_one_category = 0

            for category, discount_percent in discounts.items():
                spent_amount = user_spending.get(category, 0)
                savings = spent_amount * (discount_percent / 100.0)

                total_estimated_savings += savings

                if savings > max_savings_in_one_category:
                    max_savings_in_one_category = savings
                    highest_saving_category = category

            # Only recommend cards that actually save the user money
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

        # Rank by highest savings
        sorted_recommendations = sorted(
            recommendations, key=lambda card: card["totalEstimatedSavings"], reverse=True
        )

        return sorted_recommendations[:self.max_recommendations]


# ==========================================
# 4. Orchestrator Agent
# ==========================================
class OrchestratorAgent:
    """Master agent that manages the workflow between the specialized agents."""
    def __init__(self):
        # Initialize dependencies
        self.transaction_agent = TransactionAgent(CATEGORY_LABELS)
        
        db_connection_string = (
            "Driver={ODBC Driver 18 for SQL Server};"
            "Server=localhost;"
            "DATABASE=merit_swipe;"
            "UID=sa;"
            "PWD=123456;"
            "Trusted_Connection=yes;"
            "TrustServerCertificate=yes;"
        )
        self.database_agent = DatabaseAgent(db_connection_string)
        self.recommender_agent = RecommenderAgent(max_recommendations=10)

    def get_top_cards(self, categorized_transactions: pd.DataFrame) -> List[Dict]:
        """The main entry point for the recommendation pipeline."""
        
        # Step 1: Agent 1 analyzes the data
        user_spending = self.transaction_agent.analyze_spending(categorized_transactions)
        
        # Step 2: Agent 2 retrieves external knowledge (deals)
        card_info, card_discounts = self.database_agent.fetch_deals()
        
        # Step 3: Agent 3 generates the final output
        recommendations = self.recommender_agent.generate_recommendations(
            user_spending, card_info, card_discounts
        )
        
        return recommendations


# ==========================================
# Usage Execution
# ==========================================
# To use this in your main application flow, you simply do:
# 
# orchestrator = OrchestratorAgent()
# recommendations = orchestrator.get_top_cards(categorized_transactions_dataframe)