"""
LLM Connector — Routes requests between Gemini and Kaggle backends.
"""

from agent.llm import gemini, kaggle_fallback
from config import get_settings


def _get_mode() -> str:
    return (get_settings().LLM_MODE or "gemini").lower()


async def generate_response(system_prompt: str, user_message: str, history: list[dict] = None) -> dict:
    """Generate a text response using the configured LLM backend."""
    mode = _get_mode()
    history = history or []

    if mode == "kaggle":
        return await kaggle_fallback.generate_response(system_prompt, user_message, history)

    if mode == "hybrid":
        result = await gemini.generate_response(system_prompt, user_message, history)
        if result.get("success"):
            return result

        print(f"[LLM] Gemini failed, falling back to Kaggle: {result.get('error')}")
        kaggle_result = await kaggle_fallback.generate_response(system_prompt, user_message, history)
        if kaggle_result.get("success"):
            return kaggle_result

        return {
            "success": False,
            "error": f"Both backends failed. Gemini: {result.get('error')}. Kaggle: {kaggle_result.get('error')}",
            "source": "hybrid",
        }

    return await gemini.generate_response(system_prompt, user_message, history)


async def generate_json(system_prompt: str, user_message: str) -> dict:
    """Generate a JSON response."""
    mode = _get_mode()

    if mode == "kaggle":
        return await kaggle_fallback.generate_json(system_prompt, user_message)

    if mode == "hybrid":
        result = await gemini.generate_json(system_prompt, user_message)
        if result.get("success"):
            return result

        print(f"[LLM] Gemini JSON failed, falling back to Kaggle: {result.get('error')}")
        kaggle_result = await kaggle_fallback.generate_json(system_prompt, user_message)
        if kaggle_result.get("success"):
            return kaggle_result

        return {
            "success": False,
            "error": f"Both backends failed. Gemini: {result.get('error')}. Kaggle: {kaggle_result.get('error')}",
            "source": "hybrid",
        }

    return await gemini.generate_json(system_prompt, user_message)


async def generate_with_tools(
    system_prompt: str,
    user_message: str,
    tool_declarations: list[dict] = None,
    history: list[dict] = None,
) -> dict:
    """Generate a response with function calling tools."""
    mode = _get_mode()
    tool_declarations = tool_declarations or []
    history = history or []

    if mode in ("gemini", "hybrid"):
        result = await gemini.generate_with_tools(system_prompt, user_message, tool_declarations, history)
        if result.get("success"):
            return result

        if mode == "hybrid":
            print("[LLM] Gemini function calling failed, falling back to Kaggle text-only")
            tool_list = "\n".join(f"- {t['name']}: {t['description']}" for t in tool_declarations)
            augmented_prompt = (
                f"{system_prompt}\n\nYou have access to these tools but cannot call them directly. "
                f"Reason about what you would do with them and provide your best answer:\n{tool_list}"
            )
            kaggle_result = await kaggle_fallback.generate_response(augmented_prompt, user_message, history)
            if kaggle_result.get("success"):
                return {**kaggle_result, "type": "text"}

        return result

    # Kaggle-only mode: no function calling
    result = await kaggle_fallback.generate_response(system_prompt, user_message, history)
    if result.get("success"):
        return {**result, "type": "text"}
    return {"success": False, "error": result.get("error"), "source": "kaggle"}


async def health_check() -> dict:
    """Check health of all LLM backends."""
    import asyncio
    gemini_ok, kaggle_ok = await asyncio.gather(
        gemini.health_check(),
        kaggle_fallback.health_check(),
    )
    return {
        "mode": _get_mode(),
        "gemini": gemini_ok,
        "kaggle": kaggle_ok,
        "available": gemini_ok or kaggle_ok,
    }
