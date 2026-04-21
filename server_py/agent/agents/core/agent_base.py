"""
AgentBase — Base class for all BrajYatra agents.
Implements the ReAct (Reasoning + Acting) loop:
  1. Think — Send context to LLM
  2. Act — Execute tool if LLM requests one
  3. Observe — Feed tool result back to LLM
  4. Repeat until LLM produces a final text answer
"""

import json
import time
from typing import Optional

from agent.llm import connector as llm
from agent.agents.core.tool_registry import get_declarations, execute_tool
from agent.agents.core.message_bus import message_bus


class AgentBase:
    """Base agent implementing the ReAct loop."""

    def __init__(
        self,
        name: str,
        system_prompt: str,
        tool_names: list[str] = None,
        max_iterations: int = 5,
        memory_limit: int = 10,
    ):
        self.name = name
        self.system_prompt = system_prompt
        self.tool_names = tool_names or []
        self.max_iterations = max_iterations
        self.memory_limit = memory_limit

        self.memory: list[dict] = []
        self.session_history: list[dict] = []

        # Register on message bus
        message_bus.subscribe(f"request:{name}", self._handle_bus_request)
        print(f"[{self.name}] Initialized with tools: {self.tool_names}")

    def set_session_history(self, history: list[dict]):
        """Inject session history for multi-turn context."""
        self.session_history = history[-6:]  # Keep last 6 messages

    async def run(self, user_message: str, context: dict = None) -> dict:
        """Run the ReAct loop.

        Args:
            user_message: User's input
            context: Additional context (sessionId, language, etc.)

        Returns:
            { success, text?, source?, ... }
        """
        context = context or {}
        start_time = time.time()

        # Get tool declarations for this agent
        tool_decls = get_declarations(self.name)

        # Build the conversation history for the LLM
        history = list(self.session_history)

        # Add agent memory (use "model" role for Gemini compatibility)
        for mem in self.memory[-self.memory_limit:]:
            history.append({"role": "user", "content": mem.get("input", "")})
            history.append({"role": "model", "content": mem.get("output", "")})

        # ReAct loop
        iteration = 0
        accumulated_context = ""

        while iteration < self.max_iterations:
            iteration += 1

            # Build the message with accumulated tool results
            message_for_llm = user_message
            if accumulated_context:
                message_for_llm = f"{user_message}\n\n--- Tool Results ---\n{accumulated_context}"

            # Call LLM
            if tool_decls:
                result = await llm.generate_with_tools(
                    self.system_prompt,
                    message_for_llm,
                    tool_declarations=tool_decls,
                    history=history,
                )
            else:
                result = await llm.generate_response(
                    self.system_prompt,
                    message_for_llm,
                    history=history,
                )
                if result.get("success"):
                    result["type"] = "text"

            if not result.get("success"):
                print(f"[{self.name}] LLM call failed: {result.get('error')}")
                return {
                    "success": False,
                    "text": "I'm having trouble processing your request. Please try again.",
                    "source": self.name,
                    "error": result.get("error"),
                }

            # Check if LLM wants to call a tool
            if result.get("type") == "functionCall":
                fc = result["functionCall"]
                tool_name = fc["name"]
                tool_args = fc.get("args", {})

                print(f"[{self.name}] Iteration {iteration}: Calling tool '{tool_name}' with args: {json.dumps(tool_args)[:200]}")

                # Execute the tool
                try:
                    tool_result = await execute_tool(tool_name, tool_args)
                    tool_result_str = json.dumps(tool_result, default=str, ensure_ascii=False)

                    # Accumulate context for next iteration
                    accumulated_context += f"\n[Tool: {tool_name}] Result:\n{tool_result_str}\n"

                    # Add to conversation history for context
                    history.append({"role": "user", "content": message_for_llm})
                    history.append({"role": "model", "content": f"I called {tool_name} and got: {tool_result_str[:500]}"})

                except Exception as e:
                    print(f"[{self.name}] Tool execution error: {e}")
                    accumulated_context += f"\n[Tool: {tool_name}] Error: {str(e)}\n"

                continue  # Go to next iteration

            # LLM returned a final text answer
            text = result.get("text", "")
            elapsed = round(time.time() - start_time, 2)

            # Save to memory
            self.memory.append({
                "input": user_message,
                "output": text,
                "timestamp": time.time(),
            })
            if len(self.memory) > self.memory_limit:
                self.memory = self.memory[-self.memory_limit:]

            print(f"[{self.name}] Completed in {elapsed}s ({iteration} iterations)")

            return {
                "success": True,
                "text": text,
                "source": self.name,
                "iterations": iteration,
                "elapsed": elapsed,
                **({} if not result.get("groundingMetadata") else {"groundingMetadata": result["groundingMetadata"]}),
            }

        # Max iterations reached
        print(f"[{self.name}] Max iterations ({self.max_iterations}) reached")
        return {
            "success": True,
            "text": accumulated_context if accumulated_context else "I ran out of steps while processing your request.",
            "source": self.name,
            "iterations": iteration,
            "warning": "max_iterations_reached",
        }

    async def _handle_bus_request(self, data: dict) -> dict:
        """Handle a request from the MessageBus (inter-agent delegation)."""
        task = data.get("task", "") if isinstance(data, dict) else str(data)
        context = data.get("context", {}) if isinstance(data, dict) else {}
        return await self.run(task, context)
