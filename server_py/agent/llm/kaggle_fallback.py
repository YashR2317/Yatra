"""
Kaggle Endpoint Fallback — Calls a remote Kaggle-hosted model.
"""

import json
import re
import httpx
from config import get_settings

TIMEOUT_S = 15  # 15 seconds


def _get_endpoint() -> str | None:
    settings = get_settings()
    url = settings.KAGGLE_ENDPOINT_URL
    if not url:
        return None
    return url.rstrip("/")


async def generate_response(
    system_prompt: str,
    user_message: str,
    history: list[dict] = None,
) -> dict:
    """Generate a text response via the Kaggle endpoint."""
    endpoint = _get_endpoint()
    if not endpoint:
        return {"success": False, "error": "KAGGLE_ENDPOINT_URL not configured", "source": "kaggle"}

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_S) as client:
            resp = await client.post(
                f"{endpoint}/generate",
                json={
                    "system_prompt": system_prompt,
                    "message": user_message,
                    "history": history or [],
                },
            )

        if resp.status_code != 200:
            return {"success": False, "error": f"Kaggle endpoint returned {resp.status_code}", "source": "kaggle"}

        data = resp.json()
        return {"success": True, "text": data.get("text") or data.get("response", ""), "source": "kaggle"}

    except Exception as e:
        return {"success": False, "error": str(e), "source": "kaggle"}


async def generate_json(system_prompt: str, user_message: str) -> dict:
    """Generate a JSON response via Kaggle."""
    result = await generate_response(
        system_prompt + "\n\nYou MUST respond with valid JSON only. No markdown, no explanation.",
        user_message,
    )

    if not result.get("success"):
        return {**result, "source": "kaggle"}

    try:
        json_text = result["text"]
        match = re.search(r"```(?:json)?\s*([\s\S]*?)```", json_text)
        if match:
            json_text = match.group(1)

        parsed = json.loads(json_text.strip())
        return {"success": True, "data": parsed, "raw": json_text, "source": "kaggle"}

    except Exception as e:
        return {"success": False, "error": f"JSON parse failed: {e}", "raw": result.get("text"), "source": "kaggle"}


async def health_check() -> bool:
    """Check if the Kaggle endpoint is reachable."""
    endpoint = _get_endpoint()
    if not endpoint:
        return False

    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(f"{endpoint}/health")
            return resp.status_code == 200
    except Exception:
        return False
