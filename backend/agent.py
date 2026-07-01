import os
import requests
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

BASE_URL = "http://localhost:5000"


def get_deal_filters():
    response = requests.get(f"{BASE_URL}/deals/filters")
    return response.json()


def search_deals(search="", bank="", category="", page=1, limit=20):
    params = {
        "search": search,
        "bank": bank,
        "category": category,
        "page": page,
        "limit": limit,
    }
    response = requests.get(f"{BASE_URL}/deals", params=params)
    return response.json()


def get_top_deals():
    response = requests.get(f"{BASE_URL}/api/deals/top")
    return response.json()


def get_all_cards():
    response = requests.get(f"{BASE_URL}/api/cards")
    return response.json()


def get_user_wallet(user_id: int):
    response = requests.get(f"{BASE_URL}/api/wallet/{user_id}")
    return response.json()


def get_personalized_deals(user_id: int):
    response = requests.get(f"{BASE_URL}/api/deals/my-wallet/{user_id}")
    return response.json()


def add_card_to_wallet(user_id: int, card_id: int):
    payload = {"userId": user_id, "cardId": card_id}
    response = requests.post(f"{BASE_URL}/api/wallet", json=payload)
    return response.json()


def remove_card_from_wallet(user_id: int, card_id: int):
    payload = {"userId": user_id, "cardId": card_id}
    response = requests.delete(f"{BASE_URL}/api/wallet", json=payload)
    return response.json()


def get_notifications(user_id: int = None):
    params = {"userId": user_id} if user_id else {}
    response = requests.get(f"{BASE_URL}/api/notifications", params=params)
    return response.json()


def get_unread_notification_count(user_id: int = None):
    params = {"userId": user_id} if user_id else {}
    response = requests.get(f"{BASE_URL}/api/notifications/count", params=params)
    return response.json()


def mark_notification_read(notification_id: int):
    response = requests.patch(f"{BASE_URL}/api/notifications/{notification_id}/read")
    return response.json()


def mark_all_notifications_read(user_id: int = None):
    payload = {"userId": user_id} if user_id else {}
    response = requests.patch(f"{BASE_URL}/api/notifications/read-all", json=payload)
    return response.json()


def register_user(firstname, lastname, email, password):
    payload = {
        "firstname": firstname,
        "lastname": lastname,
        "email": email,
        "password": password,
    }
    response = requests.post(f"{BASE_URL}/api/register", json=payload)
    return response.json()


def login_user(email, password):
    payload = {"email": email, "password": password}
    response = requests.post(f"{BASE_URL}/api/login", json=payload)
    return response.json()


tools = [
    get_deal_filters,
    search_deals,
    get_top_deals,
    get_all_cards,
    get_user_wallet,
    get_personalized_deals,
    add_card_to_wallet,
    remove_card_from_wallet,
    get_notifications,
    get_unread_notification_count,
    mark_notification_read,
    mark_all_notifications_read,
    register_user,
    login_user,
]

system_instruction = """
You are the central AI assistant for the Merit-Swipe platform. Your job is to help users find card discounts, manage their wallets, and categorize their expenses. 
Use the provided tools to interact directly with the backend database. If a user asks for top deals, their personalized wallet deals, or wants to add a card, execute the corresponding tool and format the returned JSON data into a clean, readable response.
"""

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash", tools=tools, system_instruction=system_instruction
)

chat = model.start_chat(enable_automatic_function_calling=True)


def run_agent(user_input):
    response = chat.send_message(user_input)
    return response.text
