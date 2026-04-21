"""
Gemini LLM — Google Generative AI SDK integration (google-genai).
"""

import asyncio
import json
from typing import Optional

from google import genai
from google.genai import types

from config import get_settings

MODEL_NAME = "gemini-2.5-flash"
_client: Optional[genai.Client] = None


def get_client() -> genai.Client:
    """Get or create the Gemini client singleton."""
    global _client
    if _client is not None:
        return _client

    settings = get_settings()
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set in .env")

    _client = genai.Client(api_key=api_key)
    return _client


def _build_history(history: list[dict]) -> list[types.Content]:
    """Convert conversation history to Gemini format."""
    result = []
    for msg in history:
        role = "model" if msg.get("role") == "assistant" else msg.get("role", "user")
        result.append(types.Content(
            role=role,
            parts=[types.Part.from_text(text=msg.get("content", ""))],
        ))
    return result


async def generate_response(
    system_prompt: str,
    user_message: str,
    history: list[dict] = None,
) -> dict:
    """Generate a text response with Google Search grounding.

    Returns:
        { success, text, source, groundingMetadata? }
    """
    history = history or []
    client = get_client()

    attempts = 0
    max_attempts = 3

    while attempts < max_attempts:
        try:
            contents = _build_history(history)
            contents.append(types.Content(
                role="user",
                parts=[types.Part.from_text(text=user_message)],
            ))

            response = await asyncio.to_thread(
                client.models.generate_content,
                model=MODEL_NAME,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    tools=[types.Tool(google_search=types.GoogleSearch())],
                ),
            )

            text = response.text or ""

            # Extract grounding metadata
            grounding_metadata = None
            try:
                candidate = response.candidates[0] if response.candidates else None
                if candidate and hasattr(candidate, "grounding_metadata"):
                    gm = candidate.grounding_metadata
                    if gm and hasattr(gm, "grounding_chunks") and gm.grounding_chunks:
                        grounding_metadata = {
                            "searchQueries": list(gm.web_search_queries or []),
                            "sources": [
                                {"url": c.web.uri, "title": c.web.title}
                                for c in gm.grounding_chunks
                                if hasattr(c, "web") and c.web
                            ],
                        }
            except Exception:
                pass

            return {"success": True, "text": text, "source": "gemini", "groundingMetadata": grounding_metadata}

        except Exception as error:
            attempts += 1
            if attempts >= max_attempts:
                return {"success": False, "error": str(error), "source": "gemini"}
            await asyncio.sleep(2 ** attempts)


async def generate_json(system_prompt: str, user_message: str) -> dict:
    """Generate a JSON response.

    Returns:
        { success, data, raw, source }
    """
    client = get_client()

    attempts = 0
    max_attempts = 3

    while attempts < max_attempts:
        try:
            response = await asyncio.to_thread(
                client.models.generate_content,
                model=MODEL_NAME,
                contents=user_message,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                ),
            )

            text = response.text or ""
            parsed = json.loads(text)
            return {"success": True, "data": parsed, "raw": text, "source": "gemini"}

        except Exception as error:
            attempts += 1
            if attempts >= max_attempts:
                return {"success": False, "error": str(error), "source": "gemini"}
            await asyncio.sleep(2 ** attempts)


async def generate_with_tools(
    system_prompt: str,
    user_message: str,
    tool_declarations: list[dict] = None,
    history: list[dict] = None,
) -> dict:
    """Generate a response with function calling tools (for ReAct pattern).

    Returns:
        { success, type: 'text'|'functionCall', text?, functionCall?: { name, args } }
    """
    tool_declarations = tool_declarations or []
    history = history or []
    client = get_client()

    # Build tool definitions for the SDK
    tools = []
    if tool_declarations:
        function_declarations = []
        for td in tool_declarations:
            function_declarations.append(types.FunctionDeclaration(
                name=td["name"],
                description=td["description"],
                parameters=td.get("parameters"),
            ))
        tools = [types.Tool(function_declarations=function_declarations)]

    attempts = 0
    max_attempts = 3

    while attempts < max_attempts:
        try:
            contents = _build_history(history)
            contents.append(types.Content(
                role="user",
                parts=[types.Part.from_text(text=user_message)],
            ))

            response = await asyncio.to_thread(
                client.models.generate_content,
                model=MODEL_NAME,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    tools=tools if tools else None,
                ),
            )

            if not response.candidates:
                return {"success": False, "error": "No candidate in response", "source": "gemini"}
            candidate = response.candidates[0]
            if not candidate or not candidate.content:
                return {"success": False, "error": "Empty candidate content", "source": "gemini"}

            parts = candidate.content.parts or []

            # Check for function call
            for part in parts:
                if hasattr(part, "function_call") and part.function_call:
                    fc = part.function_call
                    print(f"[Gemini] Function call requested: {fc.name}")
                    return {
                        "success": True,
                        "type": "functionCall",
                        "functionCall": {
                            "name": fc.name,
                            "args": dict(fc.args) if fc.args else {},
                        },
                        "source": "gemini",
                    }

            # Text response (final answer)
            text = ""
            for part in parts:
                if hasattr(part, "text") and part.text:
                    text = part.text
                    break

            if not text:
                text = response.text or ""

            return {
                "success": True,
                "type": "text",
                "text": text,
                "source": "gemini",
            }

        except Exception as error:
            attempts += 1
            print(f"[Gemini] generateWithTools attempt {attempts}/{max_attempts} failed: {error}")
            if attempts >= max_attempts:
                return {"success": False, "error": str(error), "source": "gemini"}
            await asyncio.sleep(2 ** attempts)


async def health_check() -> bool:
    """Check if Gemini is available."""
    try:
        client = get_client()
        response = await asyncio.to_thread(
            client.models.generate_content,
            model=MODEL_NAME,
            contents="Reply with OK",
        )
        return bool(response.text and len(response.text) > 0)
    except Exception:
        return False
