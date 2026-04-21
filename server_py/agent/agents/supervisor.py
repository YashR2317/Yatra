"""
SupervisorAgent — Central coordinator and router.
The Supervisor:
1. Receives the user's message
2. Uses LLM to decide which specialist agent to delegate to
3. Routes the request via the MessageBus
4. Formats and returns the specialist's response
"""

import json
import re
import time
from typing import Optional

from agent.agents.core.agent_base import AgentBase
from agent.agents.core.message_bus import message_bus
from agent.prompts.system_prompts import SUPERVISOR_PROMPT, get_language_instruction
from agent.llm import connector as llm


class SupervisorAgent(AgentBase):
    """Central coordinator that routes requests to specialist agents."""

    def __init__(self):
        super().__init__(
            name="SupervisorAgent",
            system_prompt=SUPERVISOR_PROMPT,
            tool_names=["delegate_to_agent"],
            max_iterations=6,
            memory_limit=5,
        )

        # Instantiate specialist agents (they register themselves on the MessageBus)
        self._init_specialists()

    def _init_specialists(self):
        """Initialize all specialist agents."""
        from agent.agents.itinerary import ItineraryAgent
        from agent.agents.recommender import RecommenderAgent
        from agent.agents.weather import WeatherAgent
        from agent.agents.chat import ChatAgent
        from agent.agents.budget_agent import BudgetAgent
        from agent.agents.search import SearchAgent

        self.specialists = {
            "ItineraryAgent": ItineraryAgent(),
            "RecommenderAgent": RecommenderAgent(),
            "WeatherAgent": WeatherAgent(),
            "ChatAgent": ChatAgent(),
            "BudgetAgent": BudgetAgent(),
            "SearchAgent": SearchAgent(),
        }
        print(f"[{self.name}] Specialists initialized: {list(self.specialists.keys())}")

    async def handle_request(self, user_message: str, context: dict = None) -> dict:
        """Handle a user request by delegating to specialist agents.

        Args:
            user_message: The user's message
            context: { sessionId?, language? }

        Returns:
            Formatted response matching the API contract
        """
        context = context or {}
        language = context.get("language", "en")
        start_time = time.time()

        # Clear the message bus log for this request
        message_bus.clear_log()

        try:
            # Use the ReAct loop which will call delegate_to_agent
            result = await self._supervisor_loop(user_message, context)
            elapsed = round(time.time() - start_time, 2)
            result["elapsed"] = elapsed
            result["agent_trace"] = message_bus.get_trace_summary()
            return result

        except Exception as e:
            print(f"[{self.name}] Error: {e}")
            # Fallback to ChatAgent
            try:
                chat_result = await self.specialists["ChatAgent"].run(user_message, context)
                return self._format_chat_response(chat_result)
            except Exception:
                return {
                    "type": "text",
                    "text": "I'm sorry, I'm having trouble processing your request. Please try again.",
                    "source": self.name,
                }

    async def _supervisor_loop(self, user_message: str, context: dict) -> dict:
        """Custom supervisor loop using delegate_to_agent tool."""
        language = context.get("language", "en")
        lang_instruction = get_language_instruction(language)

        # Call LLM with delegate_to_agent tool
        from agent.agents.core.tool_registry import get_declarations
        tool_decls = get_declarations("SupervisorAgent")

        history = list(self.session_history)
        accumulated_results = []
        iteration = 0

        while iteration < self.max_iterations:
            iteration += 1

            # On first iteration, use the user's original message.
            # On subsequent iterations, the delegation results are in the history.
            current_message = user_message if iteration == 1 else (
                f"Based on the agent results above, decide if you need to delegate to another agent or provide the final answer to: {user_message}"
            )

            result = await llm.generate_with_tools(
                f"{self.system_prompt}{lang_instruction}",
                current_message,
                tool_declarations=tool_decls,
                history=history,
            )

            if not result.get("success"):
                # Fallback to chat
                chat_result = await self.specialists["ChatAgent"].run(user_message, context)
                return self._format_chat_response(chat_result)

            # Check if supervisor wants to delegate
            if result.get("type") == "functionCall":
                fc = result["functionCall"]
                if fc["name"] == "delegate_to_agent":
                    args = fc.get("args", {})
                    agent_name = args.get("agent", "")
                    task = args.get("task", user_message)
                    delegation_context_data = args.get("context", {})

                    print(f"[{self.name}] Delegating to {agent_name}: {task[:100]}")

                    # Execute the delegation
                    agent_result = await self._delegate_to_agent(
                        agent_name, task, delegation_context_data, context
                    )

                    if agent_result:
                        accumulated_results.append({
                            "agent": agent_name,
                            "result": agent_result,
                        })

                        # Check if we got a structured response (itinerary/recommendations)
                        if agent_result.get("type") in ("itinerary", "recommendations"):
                            return agent_result

                        # Add the delegation result to history as a proper turn
                        result_summary = agent_result.get("text", str(agent_result))[:800]
                        history.append({"role": "user", "content": current_message})
                        history.append({"role": "model", "content": f"I delegated to {agent_name} and received: {result_summary}"})

                        # For text responses, check if we need to delegate more
                        if len(accumulated_results) >= 3:
                            return self._format_combined_response(accumulated_results)

                    continue  # Next iteration

            # Text response — supervisor is done
            text = result.get("text", "")
            if accumulated_results:
                return self._format_combined_response(accumulated_results, text)

            return {"type": "text", "text": text, "source": self.name}

        # Max iterations
        if accumulated_results:
            return self._format_combined_response(accumulated_results)

        return {
            "type": "text",
            "text": "I apologize, but I wasn't able to fully process your request. Please try again.",
            "source": self.name,
        }

    async def _delegate_to_agent(
        self,
        agent_name: str,
        task: str,
        delegation_context: dict,
        request_context: dict,
    ) -> Optional[dict]:
        """Delegate a task to a specialist agent."""
        agent = self.specialists.get(agent_name)
        if not agent:
            print(f"[{self.name}] Unknown agent: {agent_name}")
            return None

        await message_bus.publish(
            f"delegation:{agent_name}",
            {"task": task, "context": delegation_context},
            source=self.name,
        )

        try:
            # Special handling for ItineraryAgent
            if agent_name == "ItineraryAgent":
                params = {
                    "cities": delegation_context.get("cities", []),
                    "days": delegation_context.get("days", 1),
                    "interests": delegation_context.get("interests", []),
                    "pace": delegation_context.get("pace", "moderate"),
                    "group_type": delegation_context.get("group_type", "family"),
                    "budget_level": delegation_context.get("budget_level", "medium"),
                    "language": request_context.get("language", "en"),
                }
                # Try to parse params from task if not in context
                if not params["cities"]:
                    params = self._extract_params_from_task(task, params)
                return await agent.plan(params)

            # Special handling for RecommenderAgent
            elif agent_name == "RecommenderAgent":
                params = {
                    "cities": delegation_context.get("cities", []),
                    "interests": delegation_context.get("interests", []),
                    "group_type": delegation_context.get("group_type"),
                    "budget_level": delegation_context.get("budget_level"),
                    "query": task,
                }
                return await agent.recommend(params)

            # All other agents use the standard run()
            else:
                agent.set_session_history(self.session_history)
                return await agent.run(task, request_context)

        except Exception as e:
            print(f"[{self.name}] Delegation to {agent_name} failed: {e}")
            return {
                "type": "text",
                "text": f"The {agent_name} encountered an error. Please try again.",
                "source": agent_name,
                "error": str(e),
            }

    def _extract_params_from_task(self, task: str, defaults: dict) -> dict:
        """Extract itinerary parameters from the task description."""
        import re

        params = dict(defaults)

        # Extract days
        days_match = re.search(r"(\d+)[- ]day", task, re.IGNORECASE)
        if days_match:
            params["days"] = int(days_match.group(1))

        # Extract cities
        from agent.config.constants import CITIES
        for city in CITIES:
            if city.lower() in task.lower():
                if city not in params["cities"]:
                    params["cities"].append(city)

        return params

    def _format_chat_response(self, result: dict) -> dict:
        """Format a ChatAgent response for the API."""
        return {
            "type": "text",
            "text": result.get("text", ""),
            "source": result.get("source", "ChatAgent"),
        }

    def _format_combined_response(self, results: list[dict], coordinator_note: str = "") -> dict:
        """Combine multiple agent responses."""
        # If any result is structured (itinerary/recommendations), return it
        for r in results:
            result = r["result"]
            if isinstance(result, dict) and result.get("type") in ("itinerary", "recommendations"):
                return result

        # Otherwise combine text responses
        texts = []
        for r in results:
            result = r["result"]
            if isinstance(result, dict):
                text = result.get("text", "")
            else:
                text = str(result)
            if text:
                texts.append(text)

        combined = "\n\n".join(texts)
        if coordinator_note:
            combined = f"{combined}\n\n---\n{coordinator_note}"

        return {
            "type": "text",
            "text": combined,
            "source": "SupervisorAgent",
            "delegations": [r["agent"] for r in results],
        }
