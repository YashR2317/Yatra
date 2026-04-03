import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChatProvider, useChatContext } from "../contexts/ChatContext";
import { useChat } from "../hooks/useChat";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWelcome from "../components/chat/ChatWelcome";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInput from "../components/chat/ChatInput";
import QuestionnaireModal from "../components/chat/QuestionnaireModal";
import CityPickerModal from "../components/chat/CityPickerModal";

function ChatPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useChatContext();
  const { sendMessage, stopChat, loadHistory, checkHealth, fetchCities } = useChat();

  // Load health + cities on mount
  useEffect(() => {
    checkHealth().then((h) => dispatch({ type: "SET_HEALTH", payload: h }));
    fetchCities().then((c) => {
      if (c.length > 0) dispatch({ type: "SET_CITIES", payload: c });
    });
  }, [checkHealth, fetchCities, dispatch]);

  // Load session history on mount if we have a stored sessionId
  useEffect(() => {
    if (state.sessionId && state.messages.length === 0) {
      loadHistory(state.sessionId).then((history) => {
        if (!history || history.length === 0) return;
        const msgs = history.map((msg, i) => {
          if (msg.role === "user") {
            return { id: Date.now() + i, role: "user", content: msg.content, type: "text" };
          }
          // Try to parse as structured data
          try {
            const parsed = JSON.parse(msg.content);
            if (parsed && parsed.days && Array.isArray(parsed.days)) {
              return { id: Date.now() + i, role: "assistant", content: "", type: "itinerary", data: parsed };
            }
            if (parsed && parsed.recommendations) {
              return { id: Date.now() + i, role: "assistant", content: "", type: "recommend", data: parsed };
            }
          } catch {}
          return { id: Date.now() + i, role: "assistant", content: msg.content, type: "text" };
        });
        dispatch({ type: "LOAD_HISTORY", payload: msgs });
      });
    }
  }, [state.sessionId]); // intentionally minimal deps

  // Handle sending a message
  const handleSend = useCallback(
    async (text) => {
      dispatch({ type: "ADD_USER_MESSAGE", payload: text });

      try {
        const data = await sendMessage(text, state.sessionId, "en");

        if (data.sessionId) {
          dispatch({ type: "SET_SESSION", payload: data.sessionId });
        }

        switch (data.type) {
          case "itinerary":
            dispatch({
              type: "ADD_ASSISTANT_MESSAGE",
              payload: { content: "", type: "itinerary", data: data.itinerary },
            });
            dispatch({ type: "SET_ITINERARY", payload: data.itinerary });
            break;
          case "recommend":
            dispatch({
              type: "ADD_ASSISTANT_MESSAGE",
              payload: { content: "", type: "recommend", data: { recommendations: data.recommendations, summary: data.summary } },
            });
            break;
          case "search":
            dispatch({
              type: "ADD_ASSISTANT_MESSAGE",
              payload: {
                content: "",
                type: "search",
                data: {
                  placeName: data.searchQuery || data.intent?.query || "Search",
                  city: data.intent?.cities?.[0] || "",
                  text: data.text,
                  groundingMetadata: data.groundingMetadata,
                  isHotelSearch: data.isHotelSearch || false,
                  bookingLinks: data.bookingLinks || [],
                },
              },
            });
            break;
          case "weather_preference":
            dispatch({
              type: "ADD_ASSISTANT_MESSAGE",
              payload: { content: "", type: "weather_preference", data },
            });
            break;
          default:
            dispatch({
              type: "ADD_ASSISTANT_MESSAGE",
              payload: { content: data.text || "Something went wrong.", type: "text" },
            });
        }
      } catch (error) {
        if (error.name === "AbortError") {
          dispatch({ type: "SET_LOADING", payload: false });
          return;
        }
        dispatch({
          type: "ADD_ASSISTANT_MESSAGE",
          payload: { content: "I'm having trouble connecting. Please try again. 🙏", type: "text" },
        });
      }
    },
    [sendMessage, state.sessionId, dispatch]
  );

  // Handle weather preference selection
  const handleWeatherPref = useCallback(
    async (prefId, data) => {
      const selectedLabel = data.options.choices.find((c) => c.id === prefId)?.label || prefId;
      dispatch({ type: "ADD_USER_MESSAGE", payload: `🗺️ ${selectedLabel}` });
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const result = await sendMessage(data.originalMessage, state.sessionId, "en", { weather_preference: prefId });

        if (result.sessionId) dispatch({ type: "SET_SESSION", payload: result.sessionId });

        if (result.type === "itinerary") {
          dispatch({ type: "ADD_ASSISTANT_MESSAGE", payload: { content: "", type: "itinerary", data: result.itinerary } });
          dispatch({ type: "SET_ITINERARY", payload: result.itinerary });
        } else {
          dispatch({ type: "ADD_ASSISTANT_MESSAGE", payload: { content: result.text || "Could not generate itinerary.", type: "text" } });
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          dispatch({ type: "ADD_ASSISTANT_MESSAGE", payload: { content: "I'm having trouble connecting. Please try again. 🙏", type: "text" } });
        }
      }
    },
    [sendMessage, state.sessionId, dispatch]
  );

  // Handle welcome card / sidebar action
  const handleAction = useCallback(
    (action) => {
      if (action.action === "questionnaire") {
        dispatch({ type: "OPEN_QUESTIONNAIRE" });
      } else if (action.queryKey && ["query_darshan", "query_prasadam", "query_weather"].includes(action.queryKey)) {
        dispatch({ type: "OPEN_CITY_PICKER", payload: action.queryKey });
      } else if (action.queryKey) {
        const queries = {
          query_krishna: "Tell me about the significance of Braj Dham and Lord Krishna's leelas",
          query_parikrama: "Plan a complete Braj 84 Kos Parikrama covering all sacred places",
          query_festivals: "Tell me about upcoming festivals and events in Braj Dham",
        };
        handleSend(queries[action.queryKey] || action.queryKey);
      }
    },
    [dispatch, handleSend]
  );

  // Handle clicking a place card from CityPlacesModal → send as search query
  const handleSearchPlace = useCallback(
    (query) => {
      handleSend(query);
    },
    [handleSend]
  );

  // Load a session from sidebar
  const handleLoadSession = useCallback(
    async (sessionId) => {
      dispatch({ type: "CLEAR_MESSAGES" });
      dispatch({ type: "SET_SESSION", payload: sessionId });
      const history = await loadHistory(sessionId);
      if (!history || history.length === 0) return;
      const msgs = history.map((msg, i) => {
        if (msg.role === "user") return { id: Date.now() + i, role: "user", content: msg.content, type: "text" };
        try {
          const parsed = JSON.parse(msg.content);
          if (parsed?.days) return { id: Date.now() + i, role: "assistant", content: "", type: "itinerary", data: parsed };
          if (parsed?.recommendations) return { id: Date.now() + i, role: "assistant", content: "", type: "recommend", data: parsed };
        } catch {}
        return { id: Date.now() + i, role: "assistant", content: msg.content, type: "text" };
      });
      dispatch({ type: "LOAD_HISTORY", payload: msgs });
    },
    [dispatch, loadHistory]
  );

  // New chat
  const handleNewChat = useCallback(() => {
    dispatch({ type: "CLEAR_MESSAGES" });
  }, [dispatch]);

  // Retry a failed message
  const handleRetry = useCallback(
    (text) => {
      dispatch({ type: "REMOVE_LAST_ERROR" });
      handleSend(text);
    },
    [dispatch, handleSend]
  );

  // Handle itinerary editing (add/remove place → regenerate)
  const handleEditItinerary = useCallback(
    async (editData) => {
      const { action, city, place, existingPlaces, remainingPlaces, itinerary } = editData;
      const allCities = [...new Set((itinerary.days || []).map(d => d.city).filter(Boolean))];
      const days = itinerary.days?.length || 1;

      let msg;
      if (action === "remove") {
        msg = `Regenerate my ${days}-day itinerary for ${allCities.join(" and ")}. I removed ${place} from the plan. ` +
          `Keep these places for ${city}: ${remainingPlaces.join(", ")}. ` +
          `Fill the gap with a suitable alternative for ${city}. Maintain the same style and format.`;
      } else {
        msg = `Regenerate my ${days}-day itinerary for ${allCities.join(" and ")}. I added ${place} to my ${city} day. ` +
          `Include these places for ${city}: ${existingPlaces.join(", ")}. ` +
          `Optimize the route order and timing. Maintain the same style and format.`;
      }

      handleSend(msg);
    },
    [handleSend]
  );

  return (
    <div className="fixed inset-0 flex bg-[var(--color-bg)]">
      {/* Sidebar */}
      <ChatSidebar onAction={handleAction} onLoadSession={handleLoadSession} onNewChat={handleNewChat} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile) */}
            <button
              onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
              className="lg:hidden w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-[var(--color-text-secondary)]"
              id="btn-menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${state.health?.status === "ok" ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-[11px] text-[var(--color-text-secondary)]">
                {state.health?.status === "ok"
                  ? `Online · ${state.health?.places || 0} tirth sthals`
                  : "Connecting..."}
              </span>
            </div>
          </div>

          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/home")}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-md hover:shadow-amber-500/30 transition-all flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            Back
          </motion.button>
        </div>

        {/* Messages or Welcome */}
        {state.messages.length === 0 ? (
          <ChatWelcome onAction={handleAction} cities={state.cities} onSearchPlace={handleSearchPlace} />
        ) : (
          <ChatMessages onSendWithWeatherPref={handleWeatherPref} onRetry={handleRetry} onEditItinerary={handleEditItinerary} />
        )}

        {/* Input */}
        <ChatInput onSend={handleSend} onStop={stopChat} />
      </div>

      {/* Modals */}
      <QuestionnaireModal onSubmit={handleSend} />
      <CityPickerModal onSelect={handleSend} />
    </div>
  );
}

// Wrap with ChatProvider
export default function CreateTrip() {
  return (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  );
}
