import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from "react";

const ChatContext = createContext(null);

/* ── Image / URL helpers ─────────────────────────────────────── */

export const CITY_IMAGES = {
  Mathura: "/images/places/krishna_janmabhoomi.avif",
  Vrindavan: "/images/places/banke_bihari.jpg",
  Agra: "/images/places/taj_mahal.jpeg",
  Govardhan: "/images/places/govardhan_hill.webp",
  Barsana: "/images/places/radha_rani_temple.jpg",
  Gokul: "/images/places/nand_bhavan.jpg",
};

const PLACE_IMAGES = {
  krishna_janmabhoomi: "/images/places/krishna_janmabhoomi.avif",
  janmabhoomi: "/images/places/krishna_janmabhoomi.avif",
  dwarkadhish: "/images/places/krishna_janmabhoomi.avif",
  "banke bihari": "/images/places/banke_bihari.jpg",
  "prem mandir": "/images/places/prem_mandir.webp",
  iskcon: "/images/places/prem_mandir.webp",
  "taj mahal": "/images/places/taj_mahal.jpeg",
  "agra fort": "/images/places/taj_mahal.jpeg",
  govardhan: "/images/places/govardhan_hill.webp",
  parikrama: "/images/places/govardhan_hill.webp",
  "radha rani": "/images/places/radha_rani_temple.jpg",
  barsana: "/images/places/radha_rani_temple.jpg",
  "nand bhavan": "/images/places/nand_bhavan.jpg",
  gokul: "/images/places/nand_bhavan.jpg",
  "vishram ghat": "/images/places/vishram_ghat.jpeg",
  yamuna: "/images/places/vishram_ghat.jpeg",
};

const CATEGORY_IMAGES = {
  temple: "/images/places/krishna_janmabhoomi.avif",
  ghat: "/images/places/vishram_ghat.jpeg",
  monument: "/images/places/taj_mahal.jpeg",
  nature: "/images/places/govardhan_hill.webp",
  heritage: "/images/places/taj_mahal.jpeg",
  religious: "/images/places/prem_mandir.webp",
};

export function getPlaceImage(placeName, city, category) {
  if (!placeName) return CITY_IMAGES[city] || "/images/places/krishna_janmabhoomi.avif";
  const lower = placeName.toLowerCase();
  for (const [key, url] of Object.entries(PLACE_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  if (city && CITY_IMAGES[city]) return CITY_IMAGES[city];
  if (category && CATEGORY_IMAGES[category.toLowerCase()]) return CATEGORY_IMAGES[category.toLowerCase()];
  return "/images/places/krishna_janmabhoomi.avif";
}


export function buildPlaceMapUrl(place, city) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place + ", " + (city || "") + ", India")}`;
}

export function buildDayRouteUrl(dayData) {
  const stops = (dayData.slots || [])
    .filter((s) => isActualPlace(s))
    .map((s) => `${s.place}, ${dayData.city || ""}, India`);
  if (stops.length < 2)
    return stops.length === 1
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stops[0])}`
      : null;
  const origin = encodeURIComponent(stops[0]);
  const destination = encodeURIComponent(stops[stops.length - 1]);
  const waypoints = stops.slice(1, -1).map((s) => encodeURIComponent(s)).join("|");
  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  if (waypoints) url += `&waypoints=${waypoints}`;
  return url;
}

export function isActualPlace(slot) {
  if (!slot || !slot.place) return false;
  if (slot.is_meal) return false;
  const lower = slot.place.toLowerCase();
  const skip = [
    "travel to","travel from","transit","drive to","walk to","commute",
    "rest","leisure","break","check-in","check in","checkout","check out",
    "lunch","breakfast","dinner","snack","prasadam break","food break",
  ];
  return !skip.some((p) => lower.includes(p));
}

export function isMealSlot(slot) {
  if (!slot || !slot.place) return false;
  if (slot.is_meal) return true;
  const lower = slot.place.toLowerCase();
  return lower.includes("lunch") || lower.includes("breakfast") || lower.includes("dinner") ||
    lower.includes("prasadam break") || lower.includes("food break");
}

export const VIRTUAL_TOURS = {
  "mariam's tomb": "/virtual-tours/mariam-tomb",
  "mariam tomb": "/virtual-tours/mariam-tomb",
  "akbar's tomb": "/virtual-tours/sikandra",
  "akbar tomb": "/virtual-tours/sikandra",
  "itimad-ud-daulah": "/virtual-tours/itmad",
  "itmad-ud-daulah": "/virtual-tours/itmad",
  "baby taj": "/virtual-tours/itmad",
  "ram bagh": "/virtual-tours/aram",
  "aram bagh": "/virtual-tours/aram",
  "chini ka rauza": "/virtual-tours/chini-ka-rauza",
};

export function getVirtualTourUrl(placeName) {
  if (!placeName) return null;
  const lower = placeName.toLowerCase();
  for (const [key, p] of Object.entries(VIRTUAL_TOURS)) {
    if (lower.includes(key)) return p;
  }
  return null;
}

export function getTimeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

/* ── State Management ────────────────────────────────────────── */
const initialState = {
  messages: [],        // { id, role, content, type, data, reactions: [] }
  sessionId: localStorage.getItem("brajyatra_session") || null,
  isLoading: false,
  isStreaming: false,
  partialMessage: "",  // accumulated text during SSE stream
  currentItinerary: null,
  health: null,
  cities: [],
  sidebarOpen: false,
  questionnaireOpen: false,
  cityPickerOpen: false,
  cityPickerQueryKey: null,
  editMode: false,
  commandPaletteOpen: false,
  // Agent pipeline tracking
  agentTrace: null,    // { agents: [{ name, status, elapsed }], currentAgent: string }
  // User preferences
  soundEnabled: localStorage.getItem("brajyatra_sound") === "true",
  voiceEnabled: true,
  ambientEnabled: localStorage.getItem("brajyatra_ambient") === "true",
};

function chatReducer(state, action) {
  switch (action.type) {
    case "ADD_USER_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, { id: Date.now(), role: "user", content: action.payload, type: "text" }],
        isLoading: true,
      };
    case "ADD_ASSISTANT_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, { id: Date.now(), role: "assistant", ...action.payload }],
        isLoading: false,
      };
    case "SET_SESSION":
      return { ...state, sessionId: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "STREAM_START":
      return { ...state, isStreaming: true, partialMessage: "", isLoading: true };
    case "STREAM_CHUNK":
      return { ...state, partialMessage: action.payload };
    case "STREAM_DONE":
      return {
        ...state,
        isStreaming: false,
        partialMessage: "",
        isLoading: false,
        messages: [...state.messages, { id: Date.now(), role: "assistant", content: action.payload.text, type: "text" }],
        sessionId: action.payload.sessionId || state.sessionId,
      };
    case "STREAM_ERROR":
      return {
        ...state,
        isStreaming: false,
        partialMessage: "",
        isLoading: false,
        messages: [...state.messages, { id: Date.now(), role: "assistant", content: action.payload || "Something went wrong.", type: "text" }],
      };
    case "SET_HEALTH":
      return { ...state, health: action.payload };
    case "SET_CITIES":
      return { ...state, cities: action.payload };
    case "SET_ITINERARY":
      return { ...state, currentItinerary: action.payload };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case "CLOSE_SIDEBAR":
      return { ...state, sidebarOpen: false };
    case "OPEN_QUESTIONNAIRE":
      return { ...state, questionnaireOpen: true, sidebarOpen: false };
    case "CLOSE_QUESTIONNAIRE":
      return { ...state, questionnaireOpen: false };
    case "OPEN_CITY_PICKER":
      return { ...state, cityPickerOpen: true, cityPickerQueryKey: action.payload, sidebarOpen: false };
    case "CLOSE_CITY_PICKER":
      return { ...state, cityPickerOpen: false, cityPickerQueryKey: null };
    case "TOGGLE_EDIT":
      return { ...state, editMode: !state.editMode };
    case "CLEAR_MESSAGES":
      return { ...state, messages: [], currentItinerary: null, editMode: false, sessionId: null };
    case "LOAD_HISTORY":
      return { ...state, messages: action.payload };
    case "REMOVE_LAST_ERROR": {
      const msgs = [...state.messages];
      // Remove trailing error message(s)
      while (msgs.length > 0 && msgs[msgs.length - 1].role === "assistant" &&
        (msgs[msgs.length - 1].content?.includes("trouble connecting") || msgs[msgs.length - 1].content?.includes("Something went wrong"))) {
        msgs.pop();
      }
      return { ...state, messages: msgs };
    }
    case "REACT_TO_MESSAGE": {
      const { messageId, reaction } = action.payload;
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === messageId
            ? { ...m, reactions: m.reactions?.includes(reaction)
                ? m.reactions.filter((r) => r !== reaction)
                : [...(m.reactions || []), reaction] }
            : m
        ),
      };
    }
    case "UPDATE_ITINERARY_SLOT": {
      // Drag-and-drop reorder: update slots for a specific day in the latest itinerary message
      const { dayIdx, slots } = action.payload;
      const msgs = state.messages.map((m) => {
        if (m.type === "itinerary" && m.data?.days?.[dayIdx]) {
          const newDays = [...m.data.days];
          newDays[dayIdx] = { ...newDays[dayIdx], slots };
          return { ...m, data: { ...m.data, days: newDays } };
        }
        return m;
      });
      // Also update currentItinerary if set
      let newCurrent = state.currentItinerary;
      if (newCurrent?.days?.[dayIdx]) {
        const newDays = [...newCurrent.days];
        newDays[dayIdx] = { ...newDays[dayIdx], slots };
        newCurrent = { ...newCurrent, days: newDays };
      }
      return { ...state, messages: msgs, currentItinerary: newCurrent };
    }
    case "TOGGLE_SOUND":
      localStorage.setItem("brajyatra_sound", !state.soundEnabled);
      return { ...state, soundEnabled: !state.soundEnabled };
    case "TOGGLE_VOICE":
      return { ...state, voiceEnabled: !state.voiceEnabled };
    case "TOGGLE_AMBIENT":
      localStorage.setItem("brajyatra_ambient", !state.ambientEnabled);
      return { ...state, ambientEnabled: !state.ambientEnabled };
    case "SET_AGENT_TRACE":
      return { ...state, agentTrace: action.payload };
    case "CLEAR_AGENT_TRACE":
      return { ...state, agentTrace: null };
    case "OPEN_COMMAND_PALETTE":
      return { ...state, commandPaletteOpen: true };
    case "CLOSE_COMMAND_PALETTE":
      return { ...state, commandPaletteOpen: false };
    case "TOGGLE_COMMAND_PALETTE":
      return { ...state, commandPaletteOpen: !state.commandPaletteOpen };
    default:
      return state;
  }
}

/* ── Provider ────────────────────────────────────────────────── */
export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Persist sessionId
  useEffect(() => {
    if (state.sessionId) {
      localStorage.setItem("brajyatra_session", state.sessionId);
    } else {
      localStorage.removeItem("brajyatra_session");
    }
  }, [state.sessionId]);

  return <ChatContext.Provider value={{ state, dispatch }}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}
