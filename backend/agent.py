import os
import requests
import google.generativeai as genai
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# 1. Configure Primary AI (Gemini)
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# 2. Configure Secondary AI (Groq Free Tier Fallback)
fallback_client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1"
)

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
    model_name="gemini-2.5-flash",
    tools=tools,
    system_instruction=system_instruction,
)

chat = model.start_chat(enable_automatic_function_calling=True)


def run_agent(user_input, user_id=None):
    if user_id:
        contextual_prompt = f"[System Context: The current logged-in user has ID={user_id}. Do NOT ask them for their user ID, just use this ID for all tools.]\nUser: {user_input}"
    else:
        contextual_prompt = f"[System Context: The user is currently NOT logged in. If they ask for a personalized action, tell them they need to log in first.]\nUser: {user_input}"

    try:
        # ATTEMPT 1: Primary AI (Gemini)
        response = chat.send_message(contextual_prompt)
        return response.text

    except Exception as e:
        print(f"⚠️ Gemini API failed (Limit reached or error): {e}")
        print("🔄 Switching to Groq Fallback...")

        fallback_instruction = (
            "You are the central AI assistant for the Merit-Swipe platform. "
            "However, your live database access is temporarily offline due to high traffic. "
            "If the user asks for deals, wallet info, or card actions, politely inform them "
            "that the database is momentarily unavailable and ask them to try again in a minute. "
            "Do NOT output raw JSON."
        )

        try:
            # ATTEMPT 2: Secondary AI (Groq Free Tier Fallback)
            fallback_response = fallback_client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=[
                    {"role": "system", "content": fallback_instruction},
                    {"role": "user", "content": contextual_prompt},
                ],
                max_tokens=500,
            )
            # Appending the warning to the final string sent to the user
            return f"⚠️ *Gemini rate limit reached. Using a less significant fallback model without database access.* ⚠️\n\n{fallback_response.choices[0].message.content}"

        except Exception as fallback_error:
            # ATTEMPT 3: Complete Failure (Both APIs down)
            print(f"🚨 Groq Fallback also failed: {fallback_error}")
            return "I am currently experiencing unusually high traffic. Please try asking again in a few moments!"
