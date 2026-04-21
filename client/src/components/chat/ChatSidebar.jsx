import React, { useEffect, useState, useMemo } from "react";
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

function groupSessions(sessions) {
  const now = Date.now();
  const today = [];
  const thisWeek = [];
  const earlier = [];

  sessions.forEach((s) => {
    const date = new Date(s.updated_at || s.created_at).getTime();
    const diff = now - date;
    if (diff < 86400000) today.push(s);
    else if (diff < 604800000) thisWeek.push(s);
    else earlier.push(s);
  });

  return { today, thisWeek, earlier };
}

function getSessionIcon(session) {
  const msg = (session.first_message || "").toLowerCase();
  if (msg.includes("itinerary") || msg.includes("plan") || msg.includes("yatra")) return "🛕";
  if (msg.includes("hotel") || msg.includes("stay")) return "🏨";
  if (msg.includes("weather")) return "🌤️";
  if (msg.includes("search") || msg.includes("find")) return "🔍";
  return "💬";
}

export default function ChatSidebar({ onAction, onLoadSession, onNewChat }) {
  const { state, dispatch } = useChatContext();
  const { token } = useAuth();
  const { fetchSessions } = useChat();
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (token) {
      fetchSessions().then(setSessions);
    }
  }, [token, fetchSessions]);

  // Filter sessions by search
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter((s) =>
      (s.first_message || "").toLowerCase().includes(q) ||
      (s.title || "").toLowerCase().includes(q)
    );
  }, [sessions, searchQuery]);

  const grouped = useMemo(() => groupSessions(filteredSessions), [filteredSessions]);

  const renderSessionGroup = (title, items) => {
    if (items.length === 0) return null;
    return (
      <div key={title} className="mb-3">
        <p className="text-[9px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest px-3 mb-1.5 opacity-60">
          {title}
        </p>
        <div className="space-y-0.5">
          {items.map((s) => {
            const preview = s.first_message
              ? s.first_message.length > 32 ? s.first_message.substring(0, 32) + "…" : s.first_message
              : s.title || "Chat";
            const icon = getSessionIcon(s);
            return (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => {
                  onLoadSession(s.id);
                  dispatch({ type: "CLOSE_SIDEBAR" });
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all group/session ${
                  s.id === state.sessionId
                    ? "bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/30"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/30"
                }`}
              >
                <span className="text-sm shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] text-[var(--color-text-primary)] font-medium truncate block">{preview}</span>
                  <span className="text-[9px] text-[var(--color-text-secondary)]">{getTimeAgo(s.updated_at || s.created_at)}</span>
                </div>
                {s.message_count > 0 && (
                  <span className="text-[8px] text-[var(--color-text-secondary)] opacity-0 group-hover/session:opacity-60 transition-opacity bg-[var(--color-surface-alt)] px-1.5 py-0.5 rounded-full">
                    {s.message_count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={`fixed lg:relative top-0 left-0 h-full bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col z-50 transition-all duration-300 ${
          collapsed ? "w-16" : "w-72"
        } ${
          state.sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo / Collapse toggle */}
        <div className="px-3 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                ॐ
              </div>
              <div>
                <h1 className="text-sm font-extrabold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent tracking-tight">
                  BRAJYATRA.AI
                </h1>
                <p className="text-[8px] text-[var(--color-text-secondary)] font-medium">AI Tirth Companion</p>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold shadow-md mx-auto">
              ॐ
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 items-center justify-center text-[var(--color-text-secondary)] transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed ? <polyline points="9 18 15 12 9 6" /> : <polyline points="15 18 9 12 15 6" />}
            </svg>
          </button>
        </div>

        {!collapsed && (
          <>
            {/* New Chat */}
            <div className="px-3 py-3">
              <button
                onClick={() => {
                  onNewChat();
                  dispatch({ type: "CLOSE_SIDEBAR" });
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-md hover:shadow-lg hover:shadow-amber-500/20 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Chat
              </button>
            </div>

            {/* Quick Actions */}
            <div className="px-3 pb-3">
              <p className="text-[9px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest px-1 mb-2 opacity-60">
                Quick Actions
              </p>
              <div className="space-y-0.5">
                {QUICK_ACTIONS.map((qa) => (
                  <button
                    key={qa.label}
                    onClick={() => {
                      onAction(qa);
                      dispatch({ type: "CLOSE_SIDEBAR" });
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[var(--color-text-primary)] hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all text-left group/qa"
                  >
                    <span className="text-sm group-hover/qa:scale-110 transition-transform">{qa.icon}</span>
                    <span className="font-medium">{qa.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search + Chat History */}
            {sessions.length > 0 && (
              <div className="flex-1 overflow-y-auto border-t border-[var(--color-border)] pt-3">
                {/* Search */}
                <div className="px-3 mb-3">
                  <div className="relative">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search chats…"
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[10px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                {/* Grouped sessions */}
                <div className="px-0 pb-3">
                  {renderSessionGroup("Today", grouped.today)}
                  {renderSessionGroup("This Week", grouped.thisWeek)}
                  {renderSessionGroup("Earlier", grouped.earlier)}
                  {filteredSessions.length === 0 && searchQuery && (
                    <p className="text-[10px] text-[var(--color-text-secondary)] text-center py-4 italic">No matching chats</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Collapsed mode — icon-only quick actions */}
        {collapsed && (
          <div className="flex flex-col items-center gap-1 py-3">
            <button
              onClick={() => { onNewChat(); dispatch({ type: "CLOSE_SIDEBAR" }); }}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all mb-2"
              title="New Chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            {QUICK_ACTIONS.slice(0, 4).map((qa) => (
              <button
                key={qa.label}
                onClick={() => { onAction(qa); dispatch({ type: "CLOSE_SIDEBAR" }); }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all tooltip"
                data-tip={qa.label}
                title={qa.label}
              >
                {qa.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
