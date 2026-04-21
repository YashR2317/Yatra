import { useCallback, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const AGENT_API = `${API_BASE}/agent`;
const USER_API = `${API_BASE}/user`;

export function useChat() {
  const { token } = useAuth();
  const abortRef = useRef(null);

  const headers = useCallback(() => {
    const h = { "Content-Type": "application/json" };
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  }, [token]);

  /** POST /api/agent/chat (standard JSON response) */
  const sendMessage = useCallback(
    async (message, sessionId, language = "en", extra = {}) => {
      abortRef.current = new AbortController();
      const body = { message, language, ...extra };
      if (sessionId) body.sessionId = sessionId;
      const res = await fetch(`${AGENT_API}/chat`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
      return res.json();
    },
    [headers]
  );

  /**
   * POST /api/agent/chat/stream (SSE — token-by-token)
   * @param {string}   message
   * @param {string}   sessionId
   * @param {string}   language
   * @param {object}   extra      — additional body fields
   * @param {function} onChunk    — called with accumulated text on each token
   * @param {function} onDone     — called with { text, sessionId } when stream completes
   * @param {function} onError    — called with error message string
   */
  const sendMessageStream = useCallback(
    async (message, sessionId, language = "en", extra = {}, { onChunk, onDone, onError } = {}) => {
      abortRef.current = new AbortController();
      const body = { message, language, ...extra };
      if (sessionId) body.sessionId = sessionId;

      try {
        const res = await fetch(`${AGENT_API}/chat/stream`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(body),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => `Stream failed: ${res.status}`);
          if (onError) onError(errText);
          throw new Error(errText);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let streamSessionId = sessionId;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // keep incomplete line in buffer

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'session' || data.type === 'session_done') {
                // Server sends sessionId at start and end of stream
                if (data.sessionId) streamSessionId = data.sessionId;
              } else if (data.type === 'chunk' && onChunk) {
                onChunk(data.accumulated);
              } else if (data.type === 'done') {
                if (onDone) onDone({ text: data.text, sessionId: streamSessionId });
              } else if (data.type === 'error' && onError) {
                onError(data.error);
              }
            } catch { /* skip malformed JSON lines */ }
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') return; // user cancelled
        if (onError) onError(err.message);
      }
    },
    [headers]
  );

  /** Abort the current request */
  const stopChat = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
  }, []);

  /** GET /api/agent/session/:id/history */
  const loadHistory = useCallback(
    async (sessionId) => {
      const res = await fetch(`${AGENT_API}/session/${sessionId}/history`);
      if (!res.ok) return [];
      return res.json();
    },
    []
  );

  /** GET /api/agent/health */
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${AGENT_API}/health`);
      return res.json();
    } catch {
      return { status: "offline" };
    }
  }, []);

  /** GET /api/agent/cities */
  const fetchCities = useCallback(async () => {
    try {
      const res = await fetch(`${AGENT_API}/cities`);
      return res.json();
    } catch {
      return [];
    }
  }, []);

  /** GET /api/agent/places?city=... */
  const fetchPlaces = useCallback(async (city) => {
    try {
      const res = await fetch(`${AGENT_API}/places?city=${encodeURIComponent(city)}`);
      return res.json();
    } catch {
      return [];
    }
  }, []);

  /** GET /api/agent/places/suggest */
  const fetchSuggestions = useCallback(async (city, excludeIds = [], category = "") => {
    try {
      const params = new URLSearchParams({ city, exclude: excludeIds.join(","), category });
      const res = await fetch(`${AGENT_API}/places/suggest?${params}`);
      const data = await res.json();
      return data.suggestions || [];
    } catch {
      return [];
    }
  }, []);

  /** POST /api/user/itineraries */
  const saveItinerary = useCallback(
    async (itinerary) => {
      const cities = (itinerary.days || []).reduce((acc, d) => {
        if (d.city && !acc.includes(d.city)) acc.push(d.city);
        (d.slots || []).forEach((p) => {
          if (p.city && !acc.includes(p.city)) acc.push(p.city);
        });
        return acc;
      }, []);

      const res = await fetch(`${USER_API}/itineraries`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          title: itinerary.title || `${cities.join(", ")} Yatra` || "My Braj Yatra",
          cities,
          days: (itinerary.days || []).length,
          itinerary_data: itinerary,
        }),
      });
      return res.json();
    },
    [headers]
  );

  /** GET /api/user/sessions (chat history list) */
  const fetchSessions = useCallback(async () => {
    if (!token) return [];
    try {
      const res = await fetch(`${USER_API}/sessions`, { headers: headers() });
      const data = await res.json();
      return data.sessions || [];
    } catch {
      return [];
    }
  }, [token, headers]);

  /** GET /api/user/sessions/:id */
  const loadSession = useCallback(
    async (sessionId) => {
      const res = await fetch(`${USER_API}/sessions/${sessionId}`, { headers: headers() });
      return res.json();
    },
    [headers]
  );

  return {
    sendMessage,
    sendMessageStream,
    stopChat,
    loadHistory,
    checkHealth,
    fetchCities,
    fetchPlaces,
    fetchSuggestions,
    saveItinerary,
    fetchSessions,
    loadSession,
  };
}
