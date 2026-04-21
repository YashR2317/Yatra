"""
Agent API Routes — FastAPI router for /api/agent/*.
All 15+ endpoints preserved with identical request/response contracts.
"""

import json
import re
from typing import Optional

from fastapi import APIRouter, Request, Depends, Response, Query
from fastapi.responses import JSONResponse, StreamingResponse
from sse_starlette.sse import EventSourceResponse

from agent.middleware.agent_auth import agent_auth
from agent.db import database as db
from agent.utils.helpers import sanitize_input, generate_id
from agent.utils.place_images import enrich_with_image, get_city_image
from agent.agents.core.message_bus import message_bus
from agent.agents.core.tool_registry import execute_tool
from agent.llm import connector as llm_connector
from agent.llm.streaming import stream_chat_response
from agent.prompts.system_prompts import CHAT_PROMPT
from shared.validators import ChatRequest, ItineraryRequest

router = APIRouter()

# ─── Lazy-initialized agents (avoids circular imports) ───────
_supervisor = None
_itinerary_agent = None
_weather_agent = None


def _get_supervisor():
    global _supervisor
    if _supervisor is None:
        from agent.agents.supervisor import SupervisorAgent
        _supervisor = SupervisorAgent()
        print("[API] Multi-Agent System initialized")
    return _supervisor


def _get_itinerary_agent():
    global _itinerary_agent
    if _itinerary_agent is None:
        from agent.agents.itinerary import ItineraryAgent
        _itinerary_agent = ItineraryAgent()
    return _itinerary_agent


def _get_weather_agent():
    global _weather_agent
    if _weather_agent is None:
        from agent.agents.weather import WeatherAgent
        _weather_agent = WeatherAgent()
    return _weather_agent


# ─── Main Chat Endpoint ─────────────────────────────────────

@router.post("/chat")
async def chat(request: Request, body: ChatRequest):
    """Multi-agent chat endpoint — Supervisor handles all routing."""
    await agent_auth(request)

    try:
        sanitized = sanitize_input(body.message)
        user_lang = body.language or "en"
        sid = body.sessionId

        if not sid:
            sid = generate_id()
            try:
                db.create_session(sid, request.state.user_id)
            except Exception:
                pass
        elif request.state.user_id:
            try:
                db.link_session_to_user(sid, request.state.user_id)
            except Exception:
                pass

        # ── Weather Preference Intercept ────────────────────
        is_itinerary_request = bool(re.search(r"plan\s+a\s+\d+-day.*itinerary", sanitized, re.IGNORECASE))
        has_weather_pref = body.weather_preference

        if is_itinerary_request and not has_weather_pref:
            print("[API] Itinerary request detected without weather preference — fetching weather first")

            city_match = re.search(r"covering\s+([A-Za-z, ]+?)[\.!]", sanitized)
            cities_raw = city_match.group(1) if city_match else "Mathura"
            primary_city = cities_raw.split(",")[0].strip()

            try:
                weather_data = await execute_tool("fetch_weather", {"city": primary_city})
                weather = weather_data or {}
                temp = weather.get("temp", 30)
                is_rainy = weather.get("is_rainy", False)
                is_hot = temp > 32
                is_cold = temp < 15

                if is_rainy:
                    suggestion = "Since it's rainy, indoor temples and covered monuments are recommended first."
                elif is_hot:
                    suggestion = "It's hot — start with indoor temples & ghats early morning, monuments later."
                elif is_cold:
                    suggestion = "It's cold — start at a comfortable pace, ghats after the sun warms up."
                else:
                    suggestion = "Weather is pleasant — perfect for any visit order!"

                try:
                    db.save_message(sid, "user", sanitized, {"intent": "itinerary"})
                except Exception:
                    pass

                return JSONResponse({
                    "sessionId": sid,
                    "type": "weather_preference",
                    "weather": {
                        "city": primary_city,
                        "temp": weather.get("temp", 30),
                        "feels_like": weather.get("feels_like", weather.get("temp", 30)),
                        "description": weather.get("description", "Clear sky"),
                        "humidity": weather.get("humidity", 50),
                        "wind_speed": weather.get("wind_speed", 3),
                        "is_rainy": is_rainy,
                        "is_hot": is_hot,
                        "is_cold": is_cold,
                    },
                    "options": {
                        "message": f"{suggestion} Choose your preferred visit order:",
                        "choices": [
                            {"id": "temples_first", "icon": "🛕", "label": "Temples First", "desc": "Start with sacred temples & darshan, then ghats and markets"},
                            {"id": "ghats_first", "icon": "🌊", "label": "Ghats First", "desc": "Begin with holy bath & ghat visits, then temples"},
                            {"id": "monuments_first", "icon": "🏛️", "label": "Monuments First", "desc": "Start with heritage sites & forts, temples later"},
                            {"id": "auto", "icon": "🔀", "label": "AI Decides", "desc": "Let BrajYatra AI choose the best order based on weather"},
                        ],
                    },
                    "originalMessage": sanitized,
                })
            except Exception as weather_err:
                print(f"[API] Weather check failed: {weather_err}")
                # Fall through to normal supervisor flow

        # ── Multi-Agent Supervisor ──────────────────────────
        final_message = sanitized
        if has_weather_pref:
            pref_map = {
                "temples_first": "temples and darshan first, then ghats and markets",
                "ghats_first": "ghats and holy bath first, then temples",
                "monuments_first": "monuments and heritage sites first, then temples",
            }
            pref_desc = pref_map.get(has_weather_pref, "auto — decide based on weather conditions")
            final_message = f"{sanitized} Visit order preference: {pref_desc}."

        # Inject session history
        supervisor = _get_supervisor()
        try:
            history = db.get_session_history(sid, 6)
            supervisor.set_session_history([
                {"role": "model" if m["role"] == "assistant" else "user", "content": m["content"]}
                for m in history
            ])
        except Exception:
            pass

        response = await supervisor.handle_request(final_message, {
            "sessionId": sid,
            "language": user_lang,
        })

        # Save to chat history
        try:
            db.save_message(sid, "user", sanitized, {"intent": response.get("intent", {}).get("intent", "chat") if isinstance(response.get("intent"), dict) else "chat"})

            assistant_content = ""
            if response.get("itinerary"):
                assistant_content = json.dumps(response["itinerary"])
            elif response.get("recommendations"):
                assistant_content = json.dumps(response["recommendations"])
            else:
                assistant_content = response.get("text", "")

            db.save_message(sid, "assistant", assistant_content, {"type": response.get("type")})

            # Auto-set session title
            try:
                hist = db.get_session_history(sid, 2)
                if len(hist) <= 2:
                    title = sanitized[:50] + "..." if len(sanitized) > 50 else sanitized
                    db.update_session_title(sid, title)
            except Exception:
                pass
        except Exception:
            pass

        # Include agent trace for frontend pipeline visualization
        resp_data = {"sessionId": sid, **response}
        if "agent_trace" not in resp_data:
            resp_data["agent_trace"] = message_bus.get_trace_summary()
        return JSONResponse(resp_data)

    except Exception as error:
        print(f"[API /chat] Error: {error}")
        return JSONResponse(
            {"error": "Something went wrong. Please try again."},
            status_code=500,
        )


# ─── SSE Streaming Chat Endpoint ────────────────────────────

@router.post("/chat/stream")
async def chat_stream(request: Request, body: ChatRequest):
    """SSE streaming chat endpoint."""
    await agent_auth(request)

    sanitized = sanitize_input(body.message)
    sid = body.sessionId

    if not sid:
        sid = generate_id()
        try:
            db.create_session(sid, request.state.user_id)
        except Exception:
            pass
    elif request.state.user_id:
        try:
            db.link_session_to_user(sid, request.state.user_id)
        except Exception:
            pass

    # Build history
    history = []
    try:
        h = db.get_session_history(sid, 6)
        history = [
            {"role": "model" if m["role"] == "assistant" else "user", "content": m["content"]}
            for m in h
        ]
    except Exception:
        pass

    system_prompt = CHAT_PROMPT or f"You are BrajYatra AI..."

    def on_complete(full_text):
        try:
            db.save_message(sid, "user", sanitized, {"intent": "chat"})
            db.save_message(sid, "assistant", full_text, {"type": "text"})
            hist = db.get_session_history(sid, 2)
            if len(hist) <= 2:
                title = sanitized[:50] + "..." if len(sanitized) > 50 else sanitized
                db.update_session_title(sid, title)
        except Exception:
            pass

    return StreamingResponse(
        stream_chat_response(
            system_prompt=system_prompt,
            user_message=sanitized,
            history=history,
            session_id=sid,
            on_complete=on_complete,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ─── Direct Itinerary Endpoint ──────────────────────────────

@router.post("/itinerary")
async def itinerary(body: ItineraryRequest):
    """Direct itinerary generation endpoint."""
    try:
        agent = _get_itinerary_agent()
        result = await agent.plan({
            "cities": body.cities or [],
            "days": body.days or 1,
            "interests": body.interests or [],
            "pace": body.pace or "moderate",
        })
        return JSONResponse(result)
    except Exception as error:
        print(f"[API /itinerary] Error: {error}")
        return JSONResponse({"error": "Failed to generate itinerary"}, status_code=500)


# ─── Places Endpoints ───────────────────────────────────────

@router.get("/places/suggest")
def places_suggest(
    city: str = Query(None),
    exclude: str = Query(None),
    category: str = Query(None),
):
    """Suggest places for a city, optionally excluding IDs and filtering by category."""
    try:
        if not city:
            return JSONResponse({"suggestions": []})

        places = db.get_places_by_city(city)

        if exclude:
            exclude_set = {id_.strip() for id_ in exclude.split(",")}
            places = [p for p in places if p["id"] not in exclude_set]

        from agent.agents.scoring import rank_places
        interests = [category.lower()] if category else []
        scored = rank_places(places, {"interests": interests, "cities": [city]})

        suggestions = [
            {
                "id": p["id"],
                "name": p["name"],
                "city": p["city"],
                "category": p["category"],
                "description": p.get("description"),
                "estimated_visit_duration": p.get("estimated_visit_duration"),
                "crowd_level": p.get("crowd_level"),
                "highlight": bool(p.get("highlight")),
                "score": p.get("score"),
                "image": p.get("image_url"),
            }
            for p in scored[:5]
        ]

        return JSONResponse({"suggestions": suggestions})
    except Exception as error:
        print(f"[API /places/suggest] Error: {error}")
        return JSONResponse({"suggestions": []})


@router.get("/places")
def list_places(
    city: str = Query(None),
    category: str = Query(None),
    q: str = Query(None),
):
    """List places with optional filters."""
    try:
        if q:
            places = db.search_places(q)
        elif city and category:
            places = db.get_places_by_category(city, category)
        elif city:
            places = db.get_places_by_city(city)
        else:
            places = db.get_all_places()

        return JSONResponse([enrich_with_image(p) for p in places])
    except Exception as error:
        print(f"[API /places] Error: {error}")
        return JSONResponse({"error": "Failed to fetch places"}, status_code=500)


@router.get("/places/{place_id}")
def get_place(place_id: str):
    """Get a single place by ID."""
    try:
        place = db.get_place_by_id(place_id)
        if not place:
            return JSONResponse({"error": "Place not found"}, status_code=404)
        return JSONResponse(enrich_with_image(place))
    except Exception:
        return JSONResponse({"error": "Failed to fetch place"}, status_code=500)


@router.get("/places/{place_id}/photo")
async def get_place_photo(place_id: str, maxwidth: int = Query(400)):
    """Proxy Google Places photo for a place."""
    try:
        place = db.get_place_by_id(place_id)
        if not place:
            return JSONResponse({"error": "Place not found"}, status_code=404)

        if not place.get("photo_reference"):
            from agent.utils.place_images import get_place_image
            fallback = get_place_image(place)
            return Response(status_code=302, headers={"Location": fallback})

        from agent.utils.places_photos import fetch_photo
        result = await fetch_photo(place["photo_reference"], maxwidth)

        if not result.get("ok") or not result.get("content"):
            from agent.utils.place_images import get_place_image
            fallback = get_place_image(place)
            return Response(status_code=302, headers={"Location": fallback})

        return Response(
            content=result["content"],
            media_type=result["content_type"],
            headers={
                "Cache-Control": "public, max-age=86400",
                "X-Photo-Source": "google-places",
            },
        )
    except Exception as error:
        print(f"[API /places/{place_id}/photo] Error: {error}")
        return JSONResponse({"error": "Failed to fetch photo"}, status_code=500)


@router.get("/cities")
def list_cities():
    """Get all cities with images and place counts."""
    try:
        cities = [
            {
                "name": city,
                "image": get_city_image(city),
                "count": len(db.get_places_by_city(city)),
            }
            for city in db.get_cities()
        ]
        return JSONResponse(cities)
    except Exception:
        return JSONResponse({"error": "Failed to fetch cities"}, status_code=500)


# ─── Weather Endpoint ───────────────────────────────────────

@router.get("/weather/{city}")
async def get_weather(city: str):
    """Get weather for a city via the WeatherAgent."""
    try:
        weather_agent = _get_weather_agent()
        result = await weather_agent.run(f"What is the current weather in {city}?", {})
        return JSONResponse({
            "success": result.get("success"),
            "text": result.get("text", "Weather data unavailable."),
            "source": result.get("source"),
        })
    except Exception:
        return JSONResponse({"error": "Failed to fetch weather"}, status_code=500)


# ─── Session Endpoints ──────────────────────────────────────

@router.post("/session")
def create_session():
    """Create a new chat session."""
    try:
        sid = generate_id()
        db.create_session(sid)
        return JSONResponse({"sessionId": sid})
    except Exception:
        return JSONResponse({"error": "Failed to create session"}, status_code=500)


@router.get("/session/{session_id}/history")
def get_session_history(session_id: str):
    """Get chat history for a session."""
    try:
        history = db.get_session_history(session_id)
        return JSONResponse(history)
    except Exception:
        return JSONResponse({"error": "Failed to fetch history"}, status_code=500)


# ─── Health & Debug Endpoints ────────────────────────────────

@router.get("/health")
async def health():
    """Health check endpoint."""
    llm_health = await llm_connector.health_check()
    return JSONResponse({
        "status": "ok",
        "architecture": "multi-agent",
        "agents": ["Supervisor", "ItineraryAgent", "RecommenderAgent", "WeatherAgent", "ChatAgent", "BudgetAgent"],
        "places": db.get_places_count(),
        "cities": db.get_cities(),
        "llm": llm_health,
    })


@router.get("/agent-trace")
def agent_trace():
    """Get the inter-agent communication log."""
    return JSONResponse({
        "trace": message_bus.get_trace_summary(),
        "fullLog": message_bus.get_log(),
    })
