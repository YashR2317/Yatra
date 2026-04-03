import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatContext, getTimeAgo } from "../../contexts/ChatContext";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../contexts/AuthContext";

const QUICK_ACTIONS = [
  { icon: "🛕", label: "Plan Yatra", action: "questionnaire" },
  { icon: "🕉️", label: "Temple Darshan", queryKey: "query_darshan" },
  { icon: "🌤️", label: "Weather", queryKey: "query_weather" },
  { icon: "📖", label: "Krishna Leela", queryKey: "query_krishna" },
  { icon: "🍛", label: "Prasadam & Food", queryKey: "query_prasadam" },
  { icon: "🌿", label: "Parikrama", queryKey: "query_parikrama" },
];

export default function ChatSidebar({ onAction, onLoadSession, onNewChat }) {
  const { state, dispatch } = useChatContext();
  const { token } = useAuth();
  const { fetchSessions } = useChat();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (token) {
      fetchSessions().then(setSessions);
    }
  }, [token, fetchSessions]);

  return (
    <>
      {/* Overlay (mobile) */}
      <AnimatePresence>
        {state.sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch({ type: "CLOSE_SIDEBAR" })}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={`fixed lg:relative top-0 left-0 h-full w-72 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col z-50 transition-transform duration-300 ${
          state.sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="px-4 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪷</span>
            <div>
              <h1 className="text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                BRAJYATRA.AI
              </h1>
              <p className="text-[9px] text-[var(--color-text-secondary)]">Hare Krishna · AI Tirth Companion</p>
            </div>
          </div>
        </div>

        {/* New Chat */}
        <div className="px-3 py-3">
          <button
            onClick={() => {
              onNewChat();
              dispatch({ type: "CLOSE_SIDEBAR" });
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Quick Actions */}
        <div className="px-3 pb-3">
          <p className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider px-1 mb-2">
            🪷 Quick Actions
          </p>
          <div className="space-y-0.5">
            {QUICK_ACTIONS.map((qa) => (
              <button
                key={qa.label}
                onClick={() => {
                  onAction(qa);
                  dispatch({ type: "CLOSE_SIDEBAR" });
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[var(--color-text-primary)] hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors text-left"
              >
                <span>{qa.icon}</span>
                {qa.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History */}
        {sessions.length > 0 && (
          <div className="flex-1 overflow-y-auto px-3 pb-3 border-t border-[var(--color-border)] pt-3">
            <p className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider px-1 mb-2">
              💬 Chat History
            </p>
            <div className="space-y-0.5">
              {sessions.map((s) => {
                const preview = s.first_message
                  ? s.first_message.length > 35 ? s.first_message.substring(0, 35) + "..." : s.first_message
                  : s.title || "Chat";
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      onLoadSession(s.id);
                      dispatch({ type: "CLOSE_SIDEBAR" });
                    }}
                    className={`w-full flex flex-col px-3 py-2 rounded-lg text-left transition-colors ${
                      s.id === state.sessionId
                        ? "bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/30"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/30"
                    }`}
                  >
                    <span className="text-[11px] text-[var(--color-text-primary)] truncate">{preview}</span>
                    <span className="text-[9px] text-[var(--color-text-secondary)]">{getTimeAgo(s.updated_at || s.created_at)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
