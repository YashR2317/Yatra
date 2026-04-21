import React, { useState, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { useChatContext } from "../../contexts/ChatContext";

const REACTIONS = ["🙏", "❤️", "👏", "🔥", "💡"];

export default function MessageBubble({ id, role, content, isError, onRetry, isStreaming, reactions = [] }) {
  const isUser = role === "user";
  const [showToolbar, setShowToolbar] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const { dispatch } = useChatContext();
  const speechRef = useRef(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard API not available */ }
  }, [content]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({ title: "BrajYatra AI", text: content || "" }).catch(() => {});
    } else {
      handleCopy();
    }
  }, [content, handleCopy]);

  const handleReact = useCallback((reaction) => {
    if (id) dispatch({ type: "REACT_TO_MESSAGE", payload: { messageId: id, reaction } });
    setShowReactions(false);
  }, [id, dispatch]);

  const handleReadAloud = useCallback(() => {
    if (!('speechSynthesis' in window)) return;

    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    // Strip markdown syntax for cleaner TTS
    const cleanText = (content || "")
      .replace(/[#*_~`>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.lang = "en-IN";

    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang === "en-IN") ||
                        voices.find(v => v.lang.startsWith("en")) ||
                        voices[0];
    if (indianVoice) utterance.voice = indianVoice;

    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);

    speechRef.current = utterance;
    setIsReading(true);
    window.speechSynthesis.speak(utterance);
  }, [content, isReading]);

  // Cleanup speech on unmount
  React.useEffect(() => {
    return () => {
      if (isReading) window.speechSynthesis.cancel();
    };
  }, [isReading]);

  const timeAgo = useCallback(() => {
    if (!id) return "";
    const diff = Date.now() - id;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  }, [id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`group flex gap-3 w-full ${isUser ? "flex-row-reverse" : "flex-row"} items-start`}
      onMouseEnter={() => !isUser && setShowToolbar(true)}
      onMouseLeave={() => { setShowToolbar(false); setShowReactions(false); }}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shadow-lg transition-transform group-hover:scale-105 ${
          isUser
            ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
            : isError
            ? "bg-gradient-to-br from-red-400 to-red-600 text-white glow-red"
            : "bg-gradient-to-br from-orange-400 via-amber-500 to-red-500 text-white"
        }`}
        style={{ fontFamily: isUser ? "inherit" : "'Noto Sans Devanagari', sans-serif" }}
      >
        {isUser ? "🙏" : isError ? "⚠" : "ॐ"}
      </div>

      {/* Bubble Container */}
      <div className="flex flex-col gap-1 max-w-[80%]">
        {/* Role label + timestamp */}
        <div className={`flex items-center gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
          <span className={`text-[10px] font-bold tracking-wider uppercase ${
            isUser ? "text-amber-600 dark:text-amber-400" : "text-orange-600 dark:text-orange-400"
          }`}>
            {isUser ? "You" : "BrajYatra AI"}
          </span>
          <span className="text-[9px] text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-60 transition-opacity">
            {timeAgo()}
          </span>
          {/* Read aloud indicator */}
          {isReading && !isUser && (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[9px] text-amber-500 font-semibold"
            >
              🔊 Reading…
            </motion.span>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-5 py-4 leading-relaxed shadow-sm transition-all ${
            isUser
              ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-tr-sm text-[15px]"
              : isError
              ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-tl-sm text-[15px] glow-red"
              : "glass rounded-tl-sm hover:shadow-md"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-base dark:prose-invert max-w-none
              prose-headings:text-[var(--color-text-primary)] prose-headings:font-bold prose-headings:mt-3 prose-headings:mb-2
              prose-p:text-[var(--color-text-primary)] prose-p:text-[15px] prose-p:leading-7 prose-p:my-2
              prose-li:text-[var(--color-text-primary)] prose-li:text-[15px] prose-li:leading-7
              prose-a:text-amber-600 dark:prose-a:text-amber-400 prose-a:font-semibold
              prose-strong:text-[var(--color-text-primary)] prose-strong:font-bold
              prose-code:text-amber-700 dark:prose-code:text-amber-300 prose-code:bg-amber-50 dark:prose-code:bg-amber-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-ul:my-2 prose-ol:my-2"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || ""}</ReactMarkdown>
              {isStreaming && (
                <span
                  className="inline-block w-2 h-5 ml-0.5 bg-amber-500 dark:bg-amber-400 rounded-sm"
                  style={{ animation: "blink 0.8s step-end infinite", verticalAlign: "text-bottom" }}
                />
              )}
            </div>
          )}
        </div>

        {/* Reactions display */}
        {reactions.length > 0 && (
          <div className="flex gap-1 mt-0.5">
            {reactions.map((r, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-sm bg-[var(--color-surface-alt)] rounded-full px-1.5 py-0.5 border border-[var(--color-border)] shadow-sm"
              >
                {r}
              </motion.span>
            ))}
          </div>
        )}

        {/* Hover Toolbar (assistant only) */}
        <AnimatePresence>
          {showToolbar && !isUser && !isError && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex items-center gap-0.5 mt-0.5 flex-wrap"
            >
              {/* Copy */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[var(--color-text-secondary)] hover:bg-amber-50 dark:hover:bg-amber-900/15 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
                title="Copy to clipboard"
              >
                {copied ? "✓ Copied" : "📋 Copy"}
              </button>

              {/* Read Aloud */}
              {'speechSynthesis' in window && (
                <button
                  onClick={handleReadAloud}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    isReading
                      ? "bg-amber-50 dark:bg-amber-900/15 text-amber-600 dark:text-amber-400"
                      : "text-[var(--color-text-secondary)] hover:bg-amber-50 dark:hover:bg-amber-900/15 hover:text-amber-600 dark:hover:text-amber-400"
                  }`}
                  title={isReading ? "Stop reading" : "Read aloud"}
                >
                  {isReading ? "⏹️ Stop" : "🔊 Read"}
                </button>
              )}

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[var(--color-text-secondary)] hover:bg-blue-50 dark:hover:bg-blue-900/15 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                title="Share"
              >
                🔗 Share
              </button>

              {/* React */}
              <div className="relative">
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[var(--color-text-secondary)] hover:bg-pink-50 dark:hover:bg-pink-900/15 hover:text-pink-600 dark:hover:text-pink-400 transition-all"
                  title="React"
                >
                  🙏 React
                </button>

                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute bottom-full left-0 mb-1 flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-2 py-1 shadow-lg z-20"
                    >
                      {REACTIONS.map((r) => (
                        <button
                          key={r}
                          onClick={() => handleReact(r)}
                          className="text-lg hover:scale-125 transition-transform"
                        >
                          {r}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Retry Button */}
        {isError && onRetry && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="self-start flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md hover:shadow-lg hover:shadow-amber-500/25 transition-all mt-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Retry
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
