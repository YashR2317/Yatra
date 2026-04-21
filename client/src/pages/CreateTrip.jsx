import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChatProvider, useChatContext } from "../contexts/ChatContext";
import { useChat } from "../hooks/useChat";
import { useSoundEffects } from "../hooks/useSoundEffects";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWelcome from "../components/chat/ChatWelcome";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInput from "../components/chat/ChatInput";
import QuestionnaireModal from "../components/chat/QuestionnaireModal";
import CityPickerModal from "../components/chat/CityPickerModal";
import CommandPalette from "../components/chat/CommandPalette";

/* ── Toast Notification System ─────────────────────────── */
function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            className={`pointer-events-auto px-4 py-3 rounded-xl text-sm font-semibold shadow-lg border flex items-center gap-2 ${
              toast.type === "success"
                ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                : toast.type === "error"
                ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                : "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
            }`}
          >
            <span>{toast.icon}</span>
            <span>{toast.message}</span>
            <button onClick={() => onDismiss(toast.id)} className="ml-2 opacity-60 hover:opacity-100 text-xs">✕</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ── Ambient Background Helper ─────────────────────────── */
function getAmbientClass() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return "ambient-dawn";
  if (hour >= 8 && hour < 17) return "ambient-day";
  if (hour >= 17 && hour < 20) return "ambient-dusk";
  return "ambient-night";
}

function ChatPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useChatContext();
  const { sendMessage, sendMessageStream, stopChat, loadHistory, checkHealth, fetchCities } = useChat();
  const { playSend, playReceive, playSuccess } = useSoundEffects(state.soundEnabled);
  const [toasts, setToasts] = useState([]);

  // Toast helper
  const showToast = useCallback((message, type = "info", icon = "ℹ️") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, icon }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    // Haptic feedback on mobile
    if (navigator.vibrate) navigator.vibrate(type === "success" ? [100] : [50]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Ambient background class
  const ambientClass = useMemo(() => state.ambientEnabled ? getAmbientClass() : "", [state.ambientEnabled]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const isMod = e.metaKey || e.ctrlKey;

      // ⌘/Ctrl + N → New chat
      if (isMod && e.key === "n") {
        e.preventDefault();
        dispatch({ type: "CLEAR_MESSAGES" });
      }
      // ⌘/Ctrl + K → Command Palette
      if (isMod && e.key === "k") {
        e.preventDefault();
        dispatch({ type: "TOGGLE_COMMAND_PALETTE" });
      }
      // Escape → Close modals
      if (e.key === "Escape") {
        if (state.commandPaletteOpen) dispatch({ type: "CLOSE_COMMAND_PALETTE" });
        else if (state.questionnaireOpen) dispatch({ type: "CLOSE_QUESTIONNAIRE" });
        else if (state.cityPickerOpen) dispatch({ type: "CLOSE_CITY_PICKER" });
        else if (state.sidebarOpen) dispatch({ type: "CLOSE_SIDEBAR" });
      }
      // ⌘ + 1-4 → Quick actions
      if (isMod && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        const actions = [
          { action: "questionnaire" },
          { queryKey: "query_darshan" },
          { queryKey: "query_festivals" },
          { queryKey: "query_parikrama" },
        ];
        handleAction(actions[parseInt(e.key) - 1]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.questionnaireOpen, state.cityPickerOpen, state.sidebarOpen, state.commandPaletteOpen, dispatch]);

  // Handle sending a message
  const handleSend = useCallback(
    async (text) => {
      dispatch({ type: "ADD_USER_MESSAGE", payload: text });
      playSend();

      try {
        const data = await sendMessage(text, state.sessionId, "en");

        if (data.sessionId) {
          dispatch({ type: "SET_SESSION", payload: data.sessionId });
        }

        playReceive();

        switch (data.type) {
          case "itinerary":
            dispatch({
              type: "ADD_ASSISTANT_MESSAGE",
              payload: { content: "", type: "itinerary", data: data.itinerary },
            });
            dispatch({ type: "SET_ITINERARY", payload: data.itinerary });
            playSuccess();
            showToast("Yatra planned successfully!", "success", "🛕");
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
    [sendMessage, state.sessionId, dispatch, playSend, playReceive, playSuccess]
  );

  // Handle weather preference selection
  const handleWeatherPref = useCallback(
    async (prefId, data) => {
      const selectedLabel = data.options.choices.find((c) => c.id === prefId)?.label || prefId;
      dispatch({ type: "ADD_USER_MESSAGE", payload: `🗺️ ${selectedLabel}` });
      dispatch({ type: "SET_LOADING", payload: true });
      playSend();

      try {
        const result = await sendMessage(data.originalMessage, state.sessionId, "en", { weather_preference: prefId });

        if (result.sessionId) dispatch({ type: "SET_SESSION", payload: result.sessionId });

        playReceive();

        if (result.type === "itinerary") {
          dispatch({ type: "ADD_ASSISTANT_MESSAGE", payload: { content: "", type: "itinerary", data: result.itinerary } });
          dispatch({ type: "SET_ITINERARY", payload: result.itinerary });
          playSuccess();
        } else {
          dispatch({ type: "ADD_ASSISTANT_MESSAGE", payload: { content: result.text || "Could not generate itinerary.", type: "text" } });
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          dispatch({ type: "ADD_ASSISTANT_MESSAGE", payload: { content: "I'm having trouble connecting. Please try again. 🙏", type: "text" } });
        }
      }
    },
    [sendMessage, state.sessionId, dispatch, playSend, playReceive, playSuccess]
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
    <div className={`fixed inset-0 flex bg-[var(--color-bg)] ${ambientClass} transition-all duration-1000`}>
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
              <div className={`w-2 h-2 rounded-full ${state.health?.status === "ok" ? "bg-green-500 shadow-sm shadow-green-500/50" : "bg-red-500 shadow-sm shadow-red-500/50"}`} />
              <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">
                {state.health?.status === "ok"
                  ? `Online · ${state.health?.places || 0} tirth sthals`
                  : "Connecting…"}
              </span>
            </div>
          </div>

          {/* Back + Shortcuts */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[9px] text-[var(--color-text-secondary)] opacity-40">
              ⌘N new · ⌘K commands · Esc close
            </span>
            {/* Ambient toggle */}
            <button
              onClick={() => dispatch({ type: "TOGGLE_AMBIENT" })}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all ${
                state.ambientEnabled
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                  : "text-[var(--color-text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title={state.ambientEnabled ? "Disable ambient background" : "Enable ambient background"}
            >
              🌓
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/home")}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-md hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              Back
            </motion.button>
          </div>
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
      <CommandPalette onSendMessage={handleSend} onNewChat={handleNewChat} />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
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
