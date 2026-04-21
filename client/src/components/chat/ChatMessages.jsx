import React, { useRef, useEffect, useState } from "react";
import MessageBubble from "./MessageBubble";
import ItineraryCard from "./ItineraryCard";
import RecommendationCard from "./RecommendationCard";
import WeatherPrefCard from "./WeatherPrefCard";
import SearchResultCard from "./SearchResultCard";
import TypingIndicator from "./TypingIndicator";
import { AnimatePresence, motion } from "framer-motion";
import { useChatContext } from "../../contexts/ChatContext";

export default function ChatMessages({ onSendWithWeatherPref, onRetry, onEditItinerary }) {
  const { state } = useChatContext();
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [state.messages, state.isLoading, state.partialMessage]);

  // Detect scroll position for scroll-to-bottom FAB
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200);
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={containerRef} className="relative flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-6" id="messages-container">
      {state.messages.map((msg, idx) => {
        if (msg.role === "user") {
          return <MessageBubble key={msg.id} id={msg.id} role="user" content={msg.content} reactions={msg.reactions} />;
        }

        // Detect error messages for retry
        const isError = msg.content?.includes("trouble connecting") || msg.content?.includes("Something went wrong");
        const lastUserMsg = isError ? findPreviousUserMessage(state.messages, idx) : null;

        switch (msg.type) {
          case "itinerary":
            return <ItineraryCard key={msg.id} itinerary={msg.data} onEditItinerary={onEditItinerary} />;
          case "recommend":
            return <RecommendationCard key={msg.id} recommendations={msg.data?.recommendations} summary={msg.data?.summary} />;
          case "weather_preference":
            return <WeatherPrefCard key={msg.id} data={msg.data} onSelectPreference={onSendWithWeatherPref} />;
          case "search":
            return <SearchResultCard key={msg.id} data={msg.data} />;
          default:
            return (
              <MessageBubble
                key={msg.id}
                id={msg.id}
                role="assistant"
                content={msg.content}
                isError={isError}
                onRetry={isError && lastUserMsg ? () => onRetry(lastUserMsg) : undefined}
                reactions={msg.reactions}
              />
            );
        }
      })}

      <AnimatePresence>
        {state.isStreaming && state.partialMessage ? (
          <MessageBubble
            key="streaming"
            role="assistant"
            content={state.partialMessage}
            isStreaming
          />
        ) : state.isLoading ? (
          <TypingIndicator />
        ) : null}
      </AnimatePresence>

      <div ref={bottomRef} />

      {/* Scroll to bottom FAB */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="fixed bottom-24 right-6 w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-amber-500/30 flex items-center justify-center z-30 transition-shadow"
            title="Scroll to bottom"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function findPreviousUserMessage(messages, currentIdx) {
  for (let i = currentIdx - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content;
  }
  return null;
}
