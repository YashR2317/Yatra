import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";

export default function MessageBubble({ role, content, isError, onRetry }) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex gap-3 w-full ${isUser ? "flex-row-reverse" : "flex-row"} items-start`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shadow-md ${
          isUser
            ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
            : isError
            ? "bg-gradient-to-br from-red-400 to-red-600 text-white"
            : "bg-gradient-to-br from-orange-400 to-red-500 text-white"
        }`}
        style={{ fontFamily: isUser ? "inherit" : "'Noto Sans Devanagari', sans-serif" }}
      >
        {isUser ? "🙏" : isError ? "⚠" : "ॐ"}
      </div>

      {/* Bubble */}
      <div className="flex flex-col gap-1.5 max-w-[80%]">
        {/* Role label */}
        <span className={`text-[11px] font-semibold tracking-wide uppercase ${
          isUser ? "text-right text-amber-600 dark:text-amber-400" : "text-left text-orange-600 dark:text-orange-400"
        }`}>
          {isUser ? "You" : "BrajYatra AI"}
        </span>

        <div
          className={`rounded-2xl px-5 py-4 leading-relaxed shadow-sm ${
            isUser
              ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-tr-sm text-[15px]"
              : isError
              ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-tl-sm text-[15px]"
              : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-tl-sm"
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
            </div>
          )}
        </div>

        {/* Retry Button */}
        {isError && onRetry && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="self-start flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-colors"
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
