import React, { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import ItineraryCard from "./ItineraryCard";
import RecommendationCard from "./RecommendationCard";
import WeatherPrefCard from "./WeatherPrefCard";
import SearchResultCard from "./SearchResultCard";
import TypingIndicator from "./TypingIndicator";
import { AnimatePresence } from "framer-motion";
import { useChatContext } from "../../contexts/ChatContext";

export default function ChatMessages({ onSendWithWeatherPref, onRetry, onEditItinerary }) {
  const { state } = useChatContext();
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [state.messages, state.isLoading]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-6" id="messages-container">
      {state.messages.map((msg, idx) => {
        if (msg.role === "user") {
          return <MessageBubble key={msg.id} role="user" content={msg.content} />;
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
                role="assistant"
                content={msg.content}
                isError={isError}
                onRetry={isError && lastUserMsg ? () => onRetry(lastUserMsg) : undefined}
              />
            );
        }
      })}

      <AnimatePresence>
        {state.isLoading && <TypingIndicator />}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
}

function findPreviousUserMessage(messages, currentIdx) {
  for (let i = currentIdx - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content;
  }
  return null;
}
