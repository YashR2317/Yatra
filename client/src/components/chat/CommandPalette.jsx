import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatContext } from "../../contexts/ChatContext";
import { useNavigate } from "react-router-dom";

const COMMANDS = [
  // Quick Actions
  { id: "new-chat", label: "New Chat", icon: "✨", shortcut: "⌘N", category: "Actions", action: "NEW_CHAT" },
  { id: "plan-yatra", label: "Plan Yatra", icon: "🛕", category: "Actions", action: "OPEN_QUESTIONNAIRE" },
  { id: "weather", label: "Check Weather", icon: "🌤️", category: "Actions", query: "What's the weather in Mathura today?" },
  { id: "temple-darshan", label: "Temple Darshan Guide", icon: "🕉️", category: "Actions", query: "Best temples for darshan in Vrindavan" },
  { id: "hotels", label: "Find Hotels", icon: "🏨", category: "Actions", query: "Find hotels near Prem Mandir Vrindavan" },
  { id: "food", label: "Prasadam & Food", icon: "🍛", category: "Actions", query: "Where to get the best prasadam in Mathura?" },
  { id: "budget", label: "Budget Estimate", icon: "💰", category: "Actions", query: "Estimate budget for 3-day Braj Yatra" },
  { id: "parikrama", label: "Parikrama Routes", icon: "🌿", category: "Actions", query: "Tell me about Govardhan Parikrama route and tips" },

  // Navigation
  { id: "nav-home", label: "Go to Home", icon: "🏠", category: "Navigation", navigate: "/home" },
  { id: "nav-destinations", label: "View Destinations", icon: "📍", category: "Navigation", navigate: "/home#destinations" },
  { id: "nav-diaries", label: "Travel Diaries", icon: "📖", category: "Navigation", navigate: "/home#travel-diaries" },
  { id: "nav-itineraries", label: "Saved Itineraries", icon: "🗺️", category: "Navigation", navigate: "/home#itineraries" },
  { id: "nav-gems", label: "Hidden Gems", icon: "💎", category: "Navigation", navigate: "/home#hidden-gems" },
  { id: "nav-virtual", label: "Virtual Tours", icon: "🔮", category: "Navigation", navigate: "/virtual-tours" },
  { id: "nav-trips", label: "Chat / Plan Trip", icon: "✈️", category: "Navigation", navigate: "/create-trip" },
  { id: "nav-account", label: "My Account", icon: "👤", category: "Navigation", navigate: "/account" },

  // Settings
  { id: "toggle-dark", label: "Toggle Dark Mode", icon: "🌙", shortcut: "", category: "Settings", action: "TOGGLE_THEME" },
  { id: "toggle-sound", label: "Toggle Sound", icon: "🔊", category: "Settings", action: "TOGGLE_SOUND" },
  { id: "toggle-ambient", label: "Toggle Ambient Background", icon: "🌓", category: "Settings", action: "TOGGLE_AMBIENT" },
  { id: "toggle-sidebar", label: "Toggle Sidebar", icon: "📋", shortcut: "⌘B", category: "Settings", action: "TOGGLE_SIDEBAR" },
];

function fuzzyMatch(query, text) {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  // Simple fuzzy: all chars of query appear in order in text
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export default function CommandPalette({ onSendMessage, onNewChat }) {
  const { state, dispatch } = useChatContext();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const isOpen = state.commandPaletteOpen;

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && isOpen) {
        dispatch({ type: "CLOSE_COMMAND_PALETTE" });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, dispatch]);

  // Filtered commands
  const filtered = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    return COMMANDS.filter((cmd) =>
      fuzzyMatch(query, cmd.label) || fuzzyMatch(query, cmd.category) || fuzzyMatch(query, cmd.icon)
    );
  }, [query]);

  // Group by category
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filtered]);

  // Flat list for keyboard nav
  const flatList = useMemo(() => {
    const list = [];
    Object.values(grouped).forEach((cmds) => list.push(...cmds));
    return list;
  }, [grouped]);

  // Keep selectedIdx in bounds
  useEffect(() => {
    if (selectedIdx >= flatList.length) setSelectedIdx(Math.max(0, flatList.length - 1));
  }, [flatList.length, selectedIdx]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selectedIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  const executeCommand = useCallback((cmd) => {
    dispatch({ type: "CLOSE_COMMAND_PALETTE" });

    if (cmd.navigate) {
      navigate(cmd.navigate);
      return;
    }
    if (cmd.query && onSendMessage) {
      onSendMessage(cmd.query);
      return;
    }
    if (cmd.action) {
      switch (cmd.action) {
        case "NEW_CHAT":
          onNewChat?.();
          break;
        case "OPEN_QUESTIONNAIRE":
          dispatch({ type: "OPEN_QUESTIONNAIRE" });
          break;
        case "TOGGLE_THEME":
          document.documentElement.classList.toggle("dark");
          break;
        case "TOGGLE_SOUND":
          dispatch({ type: "TOGGLE_SOUND" });
          break;
        case "TOGGLE_AMBIENT":
          dispatch({ type: "TOGGLE_AMBIENT" });
          break;
        case "TOGGLE_SIDEBAR":
          dispatch({ type: state.sidebarOpen ? "CLOSE_SIDEBAR" : "OPEN_SIDEBAR" });
          break;
        default:
          break;
      }
    }
  }, [dispatch, navigate, onSendMessage, onNewChat, state.sidebarOpen]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, flatList.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatList[selectedIdx]) executeCommand(flatList[selectedIdx]);
    }
  }, [flatList, selectedIdx, executeCommand]);

  if (!isOpen) return null;

  let flatIdx = 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-[15vh]"
        onClick={(e) => { if (e.target === e.currentTarget) dispatch({ type: "CLOSE_COMMAND_PALETTE" }); }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-text-secondary)] shrink-0">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search…"
              className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] outline-none"
              id="command-palette-input"
            />
            <kbd className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-100 dark:bg-gray-800 text-[var(--color-text-secondary)] border border-[var(--color-border)]">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
            {flatList.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-[var(--color-text-secondary)]">No commands found for "<span className="font-bold">{query}</span>"</p>
              </div>
            ) : (
              Object.entries(grouped).map(([category, cmds]) => (
                <div key={category}>
                  <p className="text-[9px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest px-5 py-2 opacity-60">
                    {category}
                  </p>
                  {cmds.map((cmd) => {
                    const idx = flatIdx++;
                    const isSelected = idx === selectedIdx;
                    return (
                      <button
                        key={cmd.id}
                        data-idx={idx}
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => setSelectedIdx(idx)}
                        className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all ${
                          isSelected
                            ? "bg-amber-50 dark:bg-amber-900/15 text-[var(--color-text-primary)]"
                            : "text-[var(--color-text-secondary)] hover:bg-gray-50 dark:hover:bg-gray-800/40"
                        }`}
                      >
                        <span className="text-base shrink-0">{cmd.icon}</span>
                        <span className={`flex-1 text-sm font-medium ${isSelected ? "text-[var(--color-text-primary)]" : ""}`}>
                          {cmd.label}
                        </span>
                        {cmd.shortcut && (
                          <kbd className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-gray-100 dark:bg-gray-800 text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                            {cmd.shortcut}
                          </kbd>
                        )}
                        {isSelected && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 shrink-0">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-2.5 border-t border-[var(--color-border)] flex items-center gap-4">
            <span className="text-[9px] text-[var(--color-text-secondary)] flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded text-[8px] font-mono bg-gray-100 dark:bg-gray-800 border border-[var(--color-border)]">↑</kbd>
              <kbd className="px-1 py-0.5 rounded text-[8px] font-mono bg-gray-100 dark:bg-gray-800 border border-[var(--color-border)]">↓</kbd>
              Navigate
            </span>
            <span className="text-[9px] text-[var(--color-text-secondary)] flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded text-[8px] font-mono bg-gray-100 dark:bg-gray-800 border border-[var(--color-border)]">↵</kbd>
              Select
            </span>
            <span className="text-[9px] text-[var(--color-text-secondary)] ml-auto">
              ⌘K to toggle
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
