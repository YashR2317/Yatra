import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatContext } from "../../contexts/ChatContext";
import { useVoiceInput } from "../../hooks/useVoiceInput";

const QUICK_CHIPS = [
  { label: "🛕 Plan Yatra", text: "Plan a sacred yatra itinerary for me" },
  { label: "🏨 Find Hotels", text: "Find hotels near Mathura" },
  { label: "🌤️ Weather", text: "What's the weather in Vrindavan today?" },
  { label: "🍛 Prasadam", text: "Where to get the best prasadam in Mathura?" },
];

const CONTEXTUAL_CHIPS = {
  itinerary: [
    { label: "✏️ Modify route", text: "Modify my itinerary route order" },
    { label: "🏨 Add hotel", text: "Suggest hotels near my itinerary" },
    { label: "🍛 Food stops", text: "Add prasadam and food stops to my itinerary" },
    { label: "💰 Budget tips", text: "Give me budget tips for this trip" },
  ],
  search: [
    { label: "📍 Nearby", text: "What are nearby places to visit?" },
    { label: "🕐 Timings", text: "What are the opening hours and best time to visit?" },
    { label: "🎟️ Tickets", text: "How to book tickets and what's the entry fee?" },
  ],
  recommend: [
    { label: "🗺️ Plan trip", text: "Create an itinerary with these recommended places" },
    { label: "🏨 Hotels nearby", text: "Find hotels near these recommended places" },
    { label: "🚗 How to reach", text: "How do I get to these places? Best transport options?" },
  ],
};

/* Extract place names / keywords from message content for dynamic chips */
const KNOWN_PLACES = [
  "Taj Mahal", "Agra Fort", "Banke Bihari", "Prem Mandir", "ISKCON",
  "Krishna Janmabhoomi", "Vishram Ghat", "Govardhan", "Radha Rani",
  "Nand Bhavan", "Dwarkadhish", "Keshi Ghat", "Yamuna",
];

const CITY_NAMES = ["Mathura", "Vrindavan", "Agra", "Govardhan", "Barsana", "Gokul"];

function extractDynamicChips(content) {
  if (!content || content.length < 20) return [];
  const lower = content.toLowerCase();
  const chips = [];

  // Detect mentioned places
  const mentionedPlaces = KNOWN_PLACES.filter((p) => lower.includes(p.toLowerCase()));
  if (mentionedPlaces.length > 0) {
    const place = mentionedPlaces[0];
    chips.push({ label: `🕐 ${place} timings`, text: `What are the timings and best time to visit ${place}?` });
    chips.push({ label: `🏨 Hotels near ${place}`, text: `Find hotels near ${place}` });
  }

  // Detect mentioned cities
  const mentionedCities = CITY_NAMES.filter((c) => lower.includes(c.toLowerCase()));
  if (mentionedCities.length > 0 && !mentionedPlaces.length) {
    const city = mentionedCities[0];
    chips.push({ label: `🛕 Plan ${city}`, text: `Plan a day trip itinerary for ${city}` });
    chips.push({ label: `🍛 Food in ${city}`, text: `Best food and prasadam spots in ${city}?` });
  }

  // Topic-based chips
  if (lower.includes("festival") || lower.includes("holi") || lower.includes("janmashtami")) {
    chips.push({ label: "📅 Festival dates", text: "When are the exact dates for this festival?" });
    chips.push({ label: "🏨 Stay during festival", text: "Where should I stay during this festival?" });
  }
  if (lower.includes("parikrama") || lower.includes("circumambulation")) {
    chips.push({ label: "🗺️ Route map", text: "Show me the complete parikrama route with stops" });
    chips.push({ label: "⏱️ Duration", text: "How long does the parikrama take on foot?" });
  }
  if (lower.includes("temple") || lower.includes("darshan")) {
    chips.push({ label: "🕐 Darshan timings", text: "What are the darshan timings today?" });
    chips.push({ label: "👗 Dress code", text: "What is the dress code for temple visits?" });
  }

  return chips.slice(0, 3); // max 3 dynamic chips
}

export default function ChatInput({ onSend, onStop }) {
  const { state, dispatch } = useChatContext();
  const textareaRef = useRef(null);
  const [text, setText] = useState("");
  const [showHint, setShowHint] = useState(false);

  // Voice input
  const { isListening, transcript, supported: voiceSupported, toggleListening } = useVoiceInput({
    onResult: (result) => {
      setText((prev) => (prev ? prev + " " + result : result));
    },
  });

  // Update text with transcript while listening
  useEffect(() => {
    if (isListening && transcript) {
      setText(transcript);
    }
  }, [transcript, isListening]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [text]);

  const handleSend = useCallback(() => {
    if (!text.trim() || state.isLoading) return;
    onSend(text.trim());
    setText("");
  }, [text, state.isLoading, onSend]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleChipClick = useCallback((chipText) => {
    onSend(chipText);
  }, [onSend]);

  // Determine contextual chips based on last message type + content
  const lastAssistantMsg = useMemo(() =>
    [...state.messages].reverse().find((m) => m.role === "assistant"),
    [state.messages]
  );

  const chips = useMemo(() => {
    if (state.messages.length === 0) return QUICK_CHIPS;

    // Type-based chips
    if (lastAssistantMsg?.type === "itinerary") return CONTEXTUAL_CHIPS.itinerary;
    if (lastAssistantMsg?.type === "search") return CONTEXTUAL_CHIPS.search;
    if (lastAssistantMsg?.type === "recommend") return CONTEXTUAL_CHIPS.recommend;

    // Content-based dynamic chips for text responses
    if (lastAssistantMsg?.content) {
      const dynamic = extractDynamicChips(lastAssistantMsg.content);
      if (dynamic.length > 0) return dynamic;
    }

    return null;
  }, [state.messages, lastAssistantMsg]);

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:p-4">
      <div className="max-w-3xl mx-auto">
        {/* Quick suggestion chips */}
        <AnimatePresence>
          {chips && !state.isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-1.5 mb-3"
            >
              {chips.map((chip, i) => (
                <motion.button
                  key={chip.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleChipClick(chip.text)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all"
                >
                  {chip.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Row */}
        <div className="flex items-end gap-2">
          {/* Voice button */}
          {voiceSupported && state.voiceEnabled && (
            <button
              onClick={toggleListening}
              className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                isListening
                  ? "bg-red-500 text-white glow-red"
                  : "bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-amber-500/50 hover:text-amber-600"
              }`}
              title={isListening ? "Stop listening" : "Voice input"}
              id="btn-voice"
            >
              {isListening ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                </motion.div>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>
          )}

          {/* Textarea */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowHint(true)}
              onBlur={() => setShowHint(false)}
              placeholder={isListening ? "Listening… speak now 🎤" : "Ask about Braj Dham, plan a Yatra…"}
              rows={1}
              className={`w-full resize-none rounded-xl border px-4 py-3 pr-12 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all ${
                state.isLoading ? "border-glow-active border-amber-400/40 bg-amber-50/30 dark:bg-amber-900/05" : "border-[var(--color-border)] bg-[var(--color-bg)]"
              }`}
              id="chat-input"
            />
            {/* Character count */}
            {text.length > 100 && (
              <span className="absolute bottom-1 right-12 text-[9px] text-[var(--color-text-secondary)] opacity-50">
                {text.length}/2000
              </span>
            )}
          </div>

          {/* Send / Stop */}
          {state.isLoading ? (
            <button
              onClick={onStop}
              className="shrink-0 w-10 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-md hover:shadow-lg"
              title="Stop generating"
              id="btn-stop"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-center transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/30"
              title="Send message (Enter)"
              id="btn-send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
        </div>

        {/* Hint + sound toggle */}
        <div className="flex items-center justify-between mt-2">
          <AnimatePresence>
            {showHint && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="text-[9px] text-[var(--color-text-secondary)]"
              >
                Shift+Enter for new line · Enter to send · ⌘K commands
              </motion.p>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-3 ml-auto">
            {/* Sound toggle */}
            <button
              onClick={() => dispatch({ type: "TOGGLE_SOUND" })}
              className="text-[10px] text-[var(--color-text-secondary)] hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1"
              title={state.soundEnabled ? "Mute sounds" : "Enable sounds"}
            >
              {state.soundEnabled ? "🔊" : "🔇"}
            </button>
            {/* Command palette trigger */}
            <button
              onClick={() => dispatch({ type: "OPEN_COMMAND_PALETTE" })}
              className="text-[10px] text-[var(--color-text-secondary)] hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1"
              title="Command Palette (⌘K)"
            >
              ⌨️
            </button>
            <p className="text-[9px] text-[var(--color-text-secondary)] opacity-40">
              BrajYatra · AI Tirth Companion
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
