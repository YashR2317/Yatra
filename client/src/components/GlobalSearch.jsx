import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Static page results for non-API searches
const STATIC_PAGES = [
  { type: "page", name: "Plan a Trip", path: "/create-trip", icon: "🗺️", desc: "Create an AI-powered itinerary" },
  { type: "page", name: "Mathura", path: "/mathura", icon: "🛕", desc: "Birthplace of Lord Krishna" },
  { type: "page", name: "Vrindavan", path: "/vrindavan", icon: "🪷", desc: "Land of Radha-Krishna leelas" },
  { type: "page", name: "Agra", path: "/agra", icon: "🏛️", desc: "Home of the Taj Mahal" },
  { type: "page", name: "Govardhan", path: "/govardhan", icon: "⛰️", desc: "Sacred Govardhan Hill" },
  { type: "page", name: "Barsana", path: "/barsana", icon: "🌸", desc: "Radha Rani's birthplace" },
  { type: "page", name: "Gokul", path: "/gokul", icon: "🐄", desc: "Where Krishna grew up" },
  { type: "page", name: "Virtual Tours", path: "/virtual-tours", icon: "🎥", desc: "360° heritage tours" },
  { type: "page", name: "My Account", path: "/account", icon: "👤", desc: "Profile & saved trips" },
];

const RECENT_KEY = "brajyatra-recent-searches";
const MAX_RECENT = 5;

function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch { return []; }
}

function addRecentSearch(term) {
  const recent = getRecentSearches().filter(r => r !== term);
  recent.unshift(term);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [recents, setRecents] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const abortRef = useRef(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setRecents(getRecentSearches());
      setQuery("");
      setResults([]);
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Search debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIdx(0);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query.trim());
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = useCallback(async (q) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    const lower = q.toLowerCase();

    // Search static pages
    const pageResults = STATIC_PAGES.filter(p =>
      p.name.toLowerCase().includes(lower) || p.desc.toLowerCase().includes(lower)
    );

    // Search places via API
    let placeResults = [];
    try {
      const res = await fetch(`${API_BASE}/agent/places?q=${encodeURIComponent(q)}`, {
        signal: abortRef.current.signal,
      });
      if (res.ok) {
        const places = await res.json();
        placeResults = places.slice(0, 8).map(p => ({
          type: "place",
          name: p.name,
          path: `/place/${p.id}`,
          icon: p.category === "temple" ? "🛕" : p.category === "ghat" ? "🌊" : p.category === "monument" ? "🏛️" : "📍",
          desc: `${p.city} · ${p.category || "attraction"}`,
        }));
      }
    } catch (e) {
      if (e.name !== "AbortError") console.warn("Search failed:", e);
    }

    setResults([...pageResults, ...placeResults]);
    setSelectedIdx(0);
    setLoading(false);
  }, []);

  const handleSelect = useCallback((item) => {
    addRecentSearch(item.name);
    setOpen(false);
    navigate(item.path);
  }, [navigate]);

  const handleKeyDown = (e) => {
    const total = results.length || recents.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx(prev => (prev + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx(prev => (prev - 1 + total) % total);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0) {
        handleSelect(results[selectedIdx]);
      } else if (!query && recents.length > 0) {
        setQuery(recents[selectedIdx]);
      }
    }
  };

  if (!open) return null;

  const showRecents = !query.trim() && recents.length > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
        onClick={() => setOpen(false)}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
          }}
          className="relative w-full max-w-xl mx-4 rounded-2xl overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search places, destinations, pages..."
              className="flex-1 bg-transparent outline-none text-base"
              style={{ color: "var(--color-text-primary)" }}
              id="global-search-input"
            />
            <kbd
              className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono"
              style={{ backgroundColor: "var(--color-surface-alt)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}
            >
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[50vh] overflow-y-auto py-2">
            {loading && (
              <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Searching...
              </div>
            )}

            {!loading && showRecents && (
              <>
                <div className="px-5 py-2 text-[11px] font-bold tracking-widest uppercase" style={{ color: "var(--color-text-secondary)" }}>
                  Recent
                </div>
                {recents.map((term, i) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${i === selectedIdx ? "bg-[var(--color-surface-alt)]" : "hover:bg-[var(--color-surface-alt)]"}`}
                    onMouseEnter={() => setSelectedIdx(i)}
                  >
                    <span className="text-base opacity-50">🕐</span>
                    <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>{term}</span>
                  </button>
                ))}
              </>
            )}

            {!loading && query && results.length === 0 && (
              <div className="px-5 py-10 text-center">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  No results for "<strong style={{ color: "var(--color-text-primary)" }}>{query}</strong>"
                </p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <>
                {/* Pages */}
                {results.filter(r => r.type === "page").length > 0 && (
                  <div className="px-5 py-2 text-[11px] font-bold tracking-widest uppercase" style={{ color: "var(--color-text-secondary)" }}>
                    Pages
                  </div>
                )}
                {results.filter(r => r.type === "page").map((item, i) => {
                  const globalIdx = results.indexOf(item);
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIdx(globalIdx)}
                      className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${globalIdx === selectedIdx ? "bg-[var(--color-surface-alt)]" : "hover:bg-[var(--color-surface-alt)]"}`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>{item.name}</p>
                        <p className="text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>{item.desc}</p>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" className="opacity-40">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  );
                })}

                {/* Places */}
                {results.filter(r => r.type === "place").length > 0 && (
                  <div className="px-5 py-2 text-[11px] font-bold tracking-widest uppercase mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    Places
                  </div>
                )}
                {results.filter(r => r.type === "place").map((item) => {
                  const globalIdx = results.indexOf(item);
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIdx(globalIdx)}
                      className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${globalIdx === selectedIdx ? "bg-[var(--color-surface-alt)]" : "hover:bg-[var(--color-surface-alt)]"}`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>{item.name}</p>
                        <p className="text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>{item.desc}</p>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" className="opacity-40">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-5 py-2.5 border-t text-[11px]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded font-mono text-[10px]" style={{ backgroundColor: "var(--color-surface-alt)", border: "1px solid var(--color-border)" }}>↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded font-mono text-[10px]" style={{ backgroundColor: "var(--color-surface-alt)", border: "1px solid var(--color-border)" }}>↵</kbd> select</span>
            </div>
            <span>⌘K to toggle</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Export the open trigger for Navbar
export function useGlobalSearch() {
  const open = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  }, []);
  return { openSearch: open };
}
