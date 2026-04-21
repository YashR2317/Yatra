"""
SearchAgent — Google Search grounded specialist.
"""

import re
from agent.agents.core.agent_base import AgentBase
from agent.prompts.system_prompts import SEARCH_PROMPT
from agent.llm import gemini


# Keywords that indicate hotel/accommodation search
HOTEL_KEYWORDS = [
    "hotel", "hotels", "stay", "accommodation", "lodge", "resort",
    "dharamshala", "dharamsala", "guest house", "hostel", "oyo",
    "where to stay", "book room", "room booking",
]


class SearchAgent(AgentBase):
    """Agent powered by Google Search grounding for real-time information."""

    def __init__(self):
        super().__init__(
            name="SearchAgent",
            system_prompt=SEARCH_PROMPT,
            tool_names=[],  # Uses Google Search grounding, not function tools
            max_iterations=2,
            memory_limit=5,
        )

    async def run(self, user_message: str, context: dict = None) -> dict:
        """Override base run to use Google Search grounding directly."""
        context = context or {}

        try:
            result = await gemini.generate_response(
                self.system_prompt,
                user_message,
                history=self.session_history,
            )

            if not result.get("success"):
                return {
                    "success": False,
                    "text": "I couldn't search for that information right now. Please try again.",
                    "source": self.name,
                }

            text = result.get("text", "")

            # For hotel searches, add booking platform links
            if _is_hotel_search(user_message):
                text = _add_booking_links(text, user_message)

            response = {
                "success": True,
                "text": text,
                "source": self.name,
                "type": "search",
            }

            # Include grounding metadata if available
            if result.get("groundingMetadata"):
                response["groundingMetadata"] = result["groundingMetadata"]

            return response

        except Exception as e:
            print(f"[{self.name}] Error: {e}")
            return {
                "success": False,
                "text": "Search is temporarily unavailable. Please try again.",
                "source": self.name,
                "error": str(e),
            }


def _is_hotel_search(message: str) -> bool:
    """Check if the message is searching for hotels/accommodation."""
    msg_lower = message.lower()
    return any(keyword in msg_lower for keyword in HOTEL_KEYWORDS)


def _add_booking_links(text: str, query: str) -> str:
    """Append booking platform links for hotel searches."""
    # Extract city name from query
    cities = ["Mathura", "Vrindavan", "Agra", "Govardhan", "Barsana", "Gokul"]
    city = "Mathura"  # default
    for c in cities:
        if c.lower() in query.lower():
            city = c
            break

    booking_links = f"""

---
📱 **Book Online:**
- [MakeMyTrip — Hotels in {city}](https://www.makemytrip.com/hotels/hotels-in-{city.lower()})
- [Booking.com — {city}](https://www.booking.com/searchresults.html?ss={city}+India)
- [OYO Rooms — {city}](https://www.oyorooms.com/search?location={city})
"""
    return text + booking_links
