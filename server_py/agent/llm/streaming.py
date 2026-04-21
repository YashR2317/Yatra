"""
SSE Streaming for Agent Chat — Server-Sent Events via StreamingResponse.
"""

import asyncio
import json
from typing import AsyncGenerator

from google.genai import types

from agent.llm.gemini import get_client, MODEL_NAME


async def stream_chat_response(
    system_prompt: str,
    user_message: str,
    history: list[dict] = None,
    session_id: str = None,
    on_complete=None,
) -> AsyncGenerator[str, None]:
    """Async generator yielding SSE data lines for streaming chat.

    Yields:
        SSE-formatted data strings.
    """
    try:
        client = get_client()
    except RuntimeError as e:
        yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
        return

    # Send session ID first
    if session_id:
        yield f"data: {json.dumps({'type': 'session', 'sessionId': session_id})}\n\n"

    # Build conversation history
    contents = []
    for msg in (history or []):
        role = "model" if msg.get("role") in ("assistant", "model") else "user"
        text = msg.get("content", "")
        if text:
            contents.append(types.Content(
                role=role,
                parts=[types.Part.from_text(text=text)],
            ))
    contents.append(types.Content(
        role="user",
        parts=[types.Part.from_text(text=user_message)],
    ))

    try:
        response = await asyncio.to_thread(
            client.models.generate_content_stream,
            model=MODEL_NAME,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
            ),
        )

        full_text = ""
        for chunk in response:
            text = chunk.text
            if text:
                full_text += text
                yield f"data: {json.dumps({'type': 'chunk', 'text': text, 'accumulated': full_text})}\n\n"

        # Send completion event
        yield f"data: {json.dumps({'type': 'done', 'text': full_text})}\n\n"

        # Send session-done event
        if session_id:
            yield f"data: {json.dumps({'type': 'session_done', 'sessionId': session_id})}\n\n"

        # Callback with full response
        if on_complete:
            on_complete(full_text)

    except Exception as e:
        print(f"[Stream] Error: {e}")
        yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
