import os
import sys
import json
import inspect
import requests

parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(parent_dir)

from google import genai
from google.genai import types
from openai import OpenAI
from dotenv import load_dotenv
from typing import Optional

from categorization_engine.extract import extract_transactions
from categorization_engine.transform import transform_transactions, CATEGORY_LABELS

load_dotenv()

# 1. Configure Primary AI (Gemini) using the new Client class
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# 2. Configure Secondary AI (Groq Free Tier Fallback)
fallback_client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1"
)

BASE_URL = "http://localhost:5000"


def analyze_uploaded_statement(file_path: str) -> dict:
    """
    Parses a bank statement CSV file, categories the transactions, and returns
    a comprehensive summary of income, expenses, and category-wise spending.
    """
    try:
        raw_df = extract_transactions(file_path)
        processed_df = transform_transactions(raw_df)

        total_in = float(
            processed_df.loc[processed_df["credit"].notna(), "credit"].sum()
        )
        total_out = float(
            processed_df.loc[processed_df["debit"].notna(), "debit"].sum()
        )
        net_flow = total_in - total_out

        spending_exclude = {"salary", "profit_income", "transfer_in"}
        spend_df = processed_df[~processed_df["category"].isin(spending_exclude)]
        spend_debit = spend_df[spend_df["debit"].notna() & (spend_df["debit"] > 0)]

        cat_summary = spend_debit.groupby("category")["debit"].sum().to_dict()
        readable_breakdown = {
            CATEGORY_LABELS.get(cat, cat): round(amount, 2)
            for cat, amount in cat_summary.items()
        }

        return {
            "status": "success",
            "summary": {
                "total_transactions_tracked": len(processed_df),
                "total_credits_inbound": round(total_in, 2),
                "total_debits_outbound": round(total_out, 2),
                "net_cash_flow": round(net_flow, 2),
                "category_spending_breakdown": readable_breakdown,
            },
        }
    except Exception as e:
        return {"status": "error", "message": f"Failed to analyze statement: {str(e)}"}


def get_deal_filters():
    response = requests.get(f"{BASE_URL}/deals/filters")
    return response.json()


def search_deals(
    search: str = "", bank: str = "", category: str = "", page: int = 1, limit: int = 20
):
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


def get_notifications(user_id: Optional[int] = None):
    params = {"userId": user_id} if user_id else {}
    response = requests.get(f"{BASE_URL}/api/notifications", params=params)
    return response.json()


def get_unread_notification_count(user_id: Optional[int] = None):
    params = {"userId": user_id} if user_id else {}
    response = requests.get(f"{BASE_URL}/api/notifications/count", params=params)
    return response.json()


def mark_notification_read(notification_id: int):
    response = requests.patch(f"{BASE_URL}/api/notifications/{notification_id}/read")
    return response.json()


def mark_all_notifications_read(user_id: Optional[int] = None):
    payload = {"userId": user_id} if user_id else {}
    response = requests.patch(f"{BASE_URL}/api/notifications/read-all", json=payload)
    return response.json()


def register_user(firstname: str, lastname: str, email: str, password: str):
    payload = {
        "firstname": firstname,
        "lastname": lastname,
        "email": email,
        "password": password,
    }
    response = requests.post(f"{BASE_URL}/api/register", json=payload)
    return response.json()


def login_user(email: str, password: str):
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
    analyze_uploaded_statement,
]


# --- NEW: Dynamic Schema Generator for Groq ---
def generate_openai_tools(tool_list):
    """Automatically converts Python functions to OpenAI/Groq JSON tool schemas."""
    openai_tools = []
    for func in tool_list:
        sig = inspect.signature(func)
        properties = {}
        required = []
        for name, param in sig.parameters.items():
            param_type = "string"
            if param.annotation == int:
                param_type = "integer"
            elif param.annotation == float:
                param_type = "number"
            elif param.annotation == bool:
                param_type = "boolean"

            properties[name] = {"type": param_type}
            if param.default == inspect.Parameter.empty:
                required.append(name)

        openai_tools.append(
            {
                "type": "function",
                "function": {
                    "name": func.__name__,
                    "description": func.__doc__ or f"Executes {func.__name__}",
                    "parameters": {
                        "type": "object",
                        "properties": properties,
                        "required": required,
                    },
                },
            }
        )
    return openai_tools


system_instruction = """
You are a warm, human-like financial coach and guide for Merit-Swipe. Talk to users casually and naturally using clear, friendly language.

Your capabilities include evaluating bank statement uploads. If a user provides or mentions an uploaded statement file path, invoke 'analyze_uploaded_statement'. 
Once you get the summary data back, don't just echo the raw numbers. Review the insights deeply:
1. Praise them if their net cash flow is healthy, or gently offer friendly budgeting advice if they are overspending.
2. Highlight their biggest spending categories (like Dining or Utilities) so they see where their money goes.
3. Suggest that they ask you for credit/debit card recommendations based on this spending profile to maximize their rewards and cashbacks!
"""

config = types.GenerateContentConfig(
    system_instruction=system_instruction,
    tools=tools,
)

chat = client.chats.create(model="gemini-2.5-flash", config=config)


def run_agent(user_input, user_id=None, uploaded_file_path=None):
    if user_id:
        base_prompt = f"[System Context: The current logged-in user has ID={user_id}. Do NOT ask them for their user ID, just use this ID for all tools.]\nUser: {user_input}"
    else:
        base_prompt = f"[System Context: The user is currently NOT logged in. If they ask for a personalized action, tell them they need to log in first.]\nUser: {user_input}"

    contextual_prompt = base_prompt
    if uploaded_file_path:
        contextual_prompt += f"\n[System Note: The user has attached a file located at '{uploaded_file_path}'. Use the 'analyze_uploaded_statement' tool with this path to review their spending.]"

    try:
        # ATTEMPT 1: Primary AI (Gemini)
        response = chat.send_message(contextual_prompt)
        return response.text

    except Exception as e:
        print(f"⚠️ Gemini API failed (Limit reached or error): {e}")
        print("🔄 Switching to Groq Fallback with Tool Calling...")

        # --- UPDATED GROQ LOGIC ---
        # 1. Provide the exact same system instructions as Gemini, rather than restricting it[cite: 4]
        groq_messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": contextual_prompt},
        ]

        # 2. Generate the tools schema dynamically
        groq_tools_schema = generate_openai_tools(tools)
        tool_map = {func.__name__: func for func in tools}

        try:
            # First Call: Ask Groq what it wants to do
            fallback_response = fallback_client.chat.completions.create(
                model="llama3-70b-8192",  # Strong open-source model suitable for tool calling
                messages=groq_messages,
                tools=groq_tools_schema,
                tool_choice="auto",
                max_tokens=500,
            )

            response_message = fallback_response.choices[0].message

            # If Groq decides it needs to use a tool
            if response_message.tool_calls:
                groq_messages.append(
                    response_message
                )  # Add AI's tool request to chat history

                # Execute every tool the AI requested
                for tool_call in response_message.tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)

                    if function_name in tool_map:
                        try:
                            # Run your actual Python function
                            func = tool_map[function_name]
                            function_result = func(**function_args)
                        except Exception as func_e:
                            function_result = {"error": str(func_e)}

                        # Add the raw data back into the conversation for the AI to read
                        groq_messages.append(
                            {
                                "role": "tool",
                                "tool_call_id": tool_call.id,
                                "name": function_name,
                                "content": json.dumps(function_result),
                            }
                        )

                # Second Call: Get the final, natural language response based on the tool's data
                final_response = fallback_client.chat.completions.create(
                    model="llama3-70b-8192", messages=groq_messages, max_tokens=500
                )
                return f"⚠️ *I'm running on a backup system, but I can still help!* ⚠️\n\n{final_response.choices[0].message.content}"

            else:
                # If no tool was needed, just return the text
                return f"⚠️ *I'm running on a backup system!* ⚠️\n\n{response_message.content}"

        except Exception as fallback_error:
            print(f"🚨 Groq Fallback also failed: {fallback_error}")
            return "I'm seeing a ton of traffic right now and need a quick breather! Please try asking again in a few moments."
