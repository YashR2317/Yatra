"""
MessageBus — Inter-agent pub/sub communication system.
Singleton class providing:
  - subscribe/publish event patterns
  - request/response pattern with timeout
  - Full message trace logging
"""

import asyncio
import time
from typing import Any, Callable, Awaitable, Optional


class MessageBus:
    """Centralized message bus for inter-agent communication."""

    _instance: Optional["MessageBus"] = None

    def __new__(cls):
        """Singleton pattern."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True

        self._handlers: dict[str, list[Callable]] = {}
        self._log: list[dict] = []
        self._max_log_size = 100
        print("[MessageBus] Initialized (singleton)")

    def subscribe(self, event: str, handler: Callable):
        """Subscribe to an event."""
        if event not in self._handlers:
            self._handlers[event] = []
        self._handlers[event].append(handler)
        print(f"[MessageBus] Subscribed to: {event}")

    def unsubscribe(self, event: str, handler: Callable):
        """Unsubscribe from an event."""
        if event in self._handlers:
            self._handlers[event] = [h for h in self._handlers[event] if h != handler]

    async def publish(self, event: str, data: Any = None, source: str = "unknown"):
        """Publish an event to all subscribers."""
        self._add_log("PUBLISH", source, event, data)

        handlers = self._handlers.get(event, [])
        for handler in handlers:
            try:
                result = handler(data)
                if asyncio.iscoroutine(result):
                    await result
            except Exception as e:
                print(f"[MessageBus] Error in handler for {event}: {e}")

    async def request(
        self,
        event: str,
        data: Any = None,
        source: str = "unknown",
        timeout: float = 30.0,
    ) -> Any:
        """Request-response pattern with timeout.

        Publishes an event and waits for the first handler to return a response.
        """
        self._add_log("REQUEST", source, event, data)

        handlers = self._handlers.get(event, [])
        if not handlers:
            self._add_log("NO_HANDLER", "MessageBus", event, None)
            return None

        try:
            handler = handlers[0]  # Use first registered handler
            result = handler(data)
            if asyncio.iscoroutine(result):
                result = await asyncio.wait_for(result, timeout=timeout)

            self._add_log("RESPONSE", f"→{source}", event, result)
            return result

        except asyncio.TimeoutError:
            self._add_log("TIMEOUT", "MessageBus", event, {"timeout_seconds": timeout})
            print(f"[MessageBus] Timeout waiting for response to {event} ({timeout}s)")
            return None
        except Exception as e:
            self._add_log("ERROR", "MessageBus", event, {"error": str(e)})
            print(f"[MessageBus] Error in request {event}: {e}")
            return None

    def _add_log(self, log_type: str, source: str, event: str, data: Any = None):
        """Add an entry to the message log."""
        entry = {
            "type": log_type,
            "source": source,
            "event": event,
            "data_summary": _summarize_data(data),
            "timestamp": time.time(),
        }
        self._log.append(entry)

        # Trim to max size
        if len(self._log) > self._max_log_size:
            self._log = self._log[-self._max_log_size:]

    def get_log(self) -> list[dict]:
        """Get the full message log."""
        return list(self._log)

    def get_trace_summary(self) -> dict:
        """Get a structured agent trace for frontend pipeline visualization."""
        agents_seen = {}
        for entry in self._log[-30:]:
            source = entry.get("source", "")
            event = entry.get("event", "")
            log_type = entry.get("type", "")
            ts = entry.get("timestamp", 0)

            # Extract agent name from source or event
            agent_name = None
            if "Agent" in source:
                agent_name = source.replace("→", "").strip()
            elif "delegate" in event.lower() and isinstance(entry.get("data_summary"), str):
                for name in ["ItineraryAgent", "WeatherAgent", "RecommenderAgent",
                             "ChatAgent", "BudgetAgent", "SearchAgent", "SupervisorAgent"]:
                    if name.lower() in entry["data_summary"].lower() or name.lower() in event.lower():
                        agent_name = name
                        break

            if agent_name:
                if agent_name not in agents_seen:
                    agents_seen[agent_name] = {"name": agent_name, "status": "done", "started": ts, "elapsed": 0}
                agents_seen[agent_name]["elapsed"] = round(ts - agents_seen[agent_name]["started"], 1)

        agents_list = list(agents_seen.values())
        # Mark the last one as the final agent
        for a in agents_list:
            a.pop("started", None)

        return {
            "agents": agents_list,
            "total": len(agents_list),
        }

    def clear_log(self):
        """Clear the message log."""
        self._log.clear()

    @classmethod
    def reset(cls):
        """Reset the singleton (for testing)."""
        cls._instance = None


def _summarize_data(data: Any) -> str:
    """Create a brief summary of message data for logging."""
    if data is None:
        return "<no data>"
    if isinstance(data, str):
        return data[:80] if len(data) > 80 else data
    if isinstance(data, dict):
        keys = list(data.keys())[:3]
        return "{ " + ", ".join(keys) + "... }" if len(data) > 3 else "{ " + ", ".join(keys) + " }"
    if isinstance(data, list):
        return f"[{len(data)} items]"
    return str(data)[:60]


# Default singleton instance
message_bus = MessageBus()
