import requests
import os
from food_map import FOOD_CANONICAL_MAP

SUPABASE_URL = "https://qmxrgtfgbydwhzibpwwv.supabase.co"
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

def normalize_label(label: str):
    return label.lower().strip()

def fetch_nutrition(food_name: str):
    if not SUPABASE_ANON_KEY:
        return None

    food_name = normalize_label(food_name)

    # 🔹 Apply canonical mapping
    canonical_food = FOOD_CANONICAL_MAP.get(food_name, food_name)

    # 🔴 IMPORTANT: wildcard search
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/nutrition_items",
        params={
            "name": f"ilike.%{canonical_food}%"
        },
        headers={
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        },
        timeout=5,
    )

    if response.status_code != 200:
        return None

    data = response.json()

    # Supabase may return dict on error
    if not isinstance(data, list) or len(data) == 0:
        return None

    return data[0]
