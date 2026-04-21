"""
User Data Routes — Itinerary and session management for /api/user/*.
"""

from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse

from agent.middleware.agent_auth import require_auth
from agent.db import database as db
from agent.utils.helpers import generate_id

router = APIRouter()


# ─── Itineraries ────────────────────────────────────────────────

@router.get("/itineraries")
async def list_itineraries(request: Request, _=Depends(require_auth)):
    """List all itineraries for the authenticated user."""
    try:
        itineraries = db.get_itineraries_by_user(request.state.user_id)
        return JSONResponse({"itineraries": itineraries})
    except Exception as e:
        print(f"[User] Failed to fetch itineraries: {e}")
        return JSONResponse({"error": "Failed to fetch itineraries"}, status_code=500)


@router.get("/itineraries/count")
async def itinerary_count(request: Request, _=Depends(require_auth)):
    """Get itinerary count for the authenticated user."""
    try:
        count = db.get_itinerary_count(request.state.user_id)
        return JSONResponse({"count": count})
    except Exception as e:
        print(f"[User] Failed to count itineraries: {e}")
        return JSONResponse({"error": "Failed to count itineraries"}, status_code=500)


@router.get("/itineraries/{itinerary_id}")
async def get_itinerary(itinerary_id: str, request: Request, _=Depends(require_auth)):
    """Get a single itinerary by ID."""
    try:
        itinerary = db.get_itinerary_by_id(itinerary_id)
        if not itinerary:
            return JSONResponse({"error": "Itinerary not found"}, status_code=404)
        if itinerary.get("user_id") != request.state.user_id:
            return JSONResponse({"error": "Access denied"}, status_code=403)
        return JSONResponse({"itinerary": itinerary})
    except Exception as e:
        print(f"[User] Failed to fetch itinerary: {e}")
        return JSONResponse({"error": "Failed to fetch itinerary"}, status_code=500)


@router.post("/itineraries")
async def save_itinerary(request: Request, _=Depends(require_auth)):
    """Save a new itinerary."""
    try:
        body = await request.json()
        title = body.get("title")
        itinerary_data = body.get("itinerary_data")

        if not title or not itinerary_data:
            return JSONResponse({"error": "Title and itinerary data are required"}, status_code=400)

        itinerary_id = generate_id()
        result = db.save_itinerary(
            itinerary_id,
            request.state.user_id,
            title,
            body.get("cities", []),
            body.get("days", 1),
            itinerary_data,
        )
        return JSONResponse({"success": True, "itinerary": result}, status_code=201)
    except Exception as e:
        print(f"[User] Failed to save itinerary: {e}")
        return JSONResponse({"error": "Failed to save itinerary"}, status_code=500)


@router.delete("/itineraries/{itinerary_id}")
async def delete_itinerary(itinerary_id: str, request: Request, _=Depends(require_auth)):
    """Delete an itinerary."""
    try:
        deleted = db.delete_itinerary(itinerary_id, request.state.user_id)
        if not deleted:
            return JSONResponse({"error": "Itinerary not found or access denied"}, status_code=404)
        return JSONResponse({"success": True})
    except Exception as e:
        print(f"[User] Failed to delete itinerary: {e}")
        return JSONResponse({"error": "Failed to delete itinerary"}, status_code=500)


# ─── Chat Sessions ──────────────────────────────────────────────

@router.get("/sessions")
async def list_sessions(request: Request, _=Depends(require_auth)):
    """List all chat sessions for the authenticated user."""
    try:
        sessions = db.get_sessions_by_user(request.state.user_id)
        return JSONResponse({"sessions": sessions})
    except Exception as e:
        print(f"[User] Failed to fetch sessions: {e}")
        return JSONResponse({"error": "Failed to fetch sessions"}, status_code=500)


@router.get("/sessions/{session_id}")
async def get_session(session_id: str, request: Request, _=Depends(require_auth)):
    """Get session messages."""
    try:
        messages = db.get_session_history(session_id, 100)
        return JSONResponse({"messages": messages})
    except Exception as e:
        print(f"[User] Failed to fetch session: {e}")
        return JSONResponse({"error": "Failed to fetch session messages"}, status_code=500)
