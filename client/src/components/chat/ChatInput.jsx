import React, { useRef, useEffect, useState } from "react";
import { useChatContext } from "../../contexts/ChatContext";

export default function ChatInput({ onSend, onStop }) {
  const { state } = useChatContext();
  const textareaRef = useRef(null);
  const [text, setText] = useState("");

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [text]);

  const handleSend = () => {
    if (!text.trim() || state.isLoading) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:p-4">
      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about Braj Dham, plan a Yatra..."
          rows={1}
          className="flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
          id="chat-input"
        />

        {state.isLoading ? (
          <button
            onClick={onStop}
            className="shrink-0 w-10 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-md"
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
            className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-center transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-amber-500/30"
            title="Send message"
            id="btn-send"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </div>

      <p className="text-center text-[10px] text-[var(--color-text-secondary)] mt-2 opacity-60">
        BrajYatra · Plan Yatra · Darshan Guide · Weather · Krishna Leelas
      </p>
    </div>
  );
}
