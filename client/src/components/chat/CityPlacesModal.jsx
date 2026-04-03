import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VIRTUAL_TOURS } from "../../contexts/ChatContext";

const CROWD_COLORS = {
  low: { bg: "rgba(34,197,94,0.15)", text: "#22c55e", label: "Low Crowd" },
  medium: { bg: "rgba(234,179,8,0.15)", text: "#eab308", label: "Moderate" },
  high: { bg: "rgba(249,115,22,0.15)", text: "#f97316", label: "High Crowd" },
  very_high: { bg: "rgba(239,68,68,0.15)", text: "#ef4444", label: "Very High" },
};

const CATEGORY_ICONS = {
  temple: "🛕",
  ghat: "🌊",
  monument: "🏛️",
  museum: "🏛️",
  market: "🛍️",
  restaurant: "🍽️",
  nature: "🌿",
  heritage: "📜",
  mosque: "🕌",
  hidden_gem: "💎",
  parikrama_route: "🚶",
};

function getVirtualTourLink(placeName) {
  if (!placeName) return null;
  const lower = placeName.toLowerCase().trim();
  // Direct key lookup first (exact match)
  if (VIRTUAL_TOURS[lower]) return VIRTUAL_TOURS[lower];
  // Then check if any key is contained in the place name (for partial matches like "Mariam's Tomb")
  for (const [key, path] of Object.entries(VIRTUAL_TOURS)) {
    if (key.length >= 8 && lower.includes(key)) return path;
  }
  return null;
}

function PlaceCard({ place, city, onClose, onSearchPlace }) {
  const [expanded, setExpanded] = useState(false);
  const crowd = CROWD_COLORS[place.crowd_level] || CROWD_COLORS.medium;
  const icon = CATEGORY_ICONS[place.category] || "📍";
  const virtualTour = getVirtualTourLink(place.name);

  // Parse images — prefer the `images` JSON array (local paths like /mathura/attractions/...)
  // over `image_url` which points to agent-only /assets/images/ paths
  let parsedImages = [];
  if (place.images) {
    try {
      parsedImages = typeof place.images === "string" ? JSON.parse(place.images) : place.images;
    } catch { parsedImages = []; }
  }
  const heroImage = (parsedImages.length > 0 ? parsedImages[0] : null);

  // Build a proper Google Maps search URL using place name + city
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ", " + (place.city || city || "") + ", India")}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg hover:shadow-xl transition-shadow"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden group">
        {heroImage ? (
          <img
            src={heroImage}
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-900/40 via-orange-800/30 to-amber-950/50 flex items-center justify-center">
            <span className="text-4xl">{icon}</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Category badge */}
        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "white" }}
        >
          {icon} {place.category?.replace(/_/g, " ")}
        </span>

        {/* Crowd badge */}
        <span
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md"
          style={{ backgroundColor: crowd.bg, color: crowd.text }}
        >
          {crowd.label}
        </span>

        {/* Place name on image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">
            {place.name}
          </h3>
          {place.highlight ? (
            <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              ⭐ Must Visit
            </span>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Quick info pills */}
        <div className="flex flex-wrap gap-1.5">
          {place.opening_hours && (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ backgroundColor: "var(--color-card-bg)", color: "var(--color-text-secondary)" }}
            >
              🕐 {place.opening_hours}
            </span>
          )}
          {place.entry_fee && (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ backgroundColor: "var(--color-card-bg)", color: "var(--color-text-secondary)" }}
            >
              🎫 {place.entry_fee}
            </span>
          )}
          {place.estimated_visit_duration && (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ backgroundColor: "var(--color-card-bg)", color: "var(--color-text-secondary)" }}
            >
              ⏱️ {place.estimated_visit_duration} min
            </span>
          )}
        </div>

        {/* Best time */}
        {place.best_time_to_visit && (
          <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
            🌅 <strong>Best time:</strong> {place.best_time_to_visit}
          </p>
        )}

        {/* Description */}
        <p
          className={`text-xs leading-relaxed ${expanded ? "" : "line-clamp-3"}`}
          style={{ color: "var(--color-text-primary)" }}
        >
          {place.description}
        </p>
        {place.description && place.description.length > 120 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-semibold hover:underline"
            style={{ color: "var(--color-saffron, #c0622d)" }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #4285f4, #34a853)",
              color: "white",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Maps
          </a>

          {virtualTour && (
            <a
              href={virtualTour}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #f97316, #ef4444)",
                color: "white",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20" />
                <path d="M2 12h20" />
              </svg>
              360° View
            </a>
          )}

          {onSearchPlace && (
            <button
              onClick={() => onSearchPlace(`Tell me about ${place.name} in ${place.city || city || ''}, India. Include history, significance, visitor tips, timings, and nearby attractions.`)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                color: "white",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Learn More
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function CityPlacesModal({ city, onClose, onSearchPlace }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    fetch(`${API_BASE}/agent/places?city=${encodeURIComponent(city)}`)
      .then((r) => r.json())
      .then((data) => {
        // Sort by popularity_rank
        const sorted = (Array.isArray(data) ? data : []).sort(
          (a, b) => (a.popularity_rank || 999) - (b.popularity_rank || 999)
        );
        setPlaces(sorted);
      })
      .catch(() => setPlaces([]))
      .finally(() => setLoading(false));
  }, [city, API_BASE]);

  if (!city) return null;

  // Get unique categories for filter
  const categories = [...new Set(places.map((p) => p.category).filter(Boolean))];

  const filtered =
    filter === "all" ? places : places.filter((p) => p.category === filter);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-5xl mx-4 mt-8 mb-8 max-h-[90vh] rounded-3xl overflow-hidden flex flex-col"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          {/* Header */}
          <div
            className="shrink-0 px-6 py-5 flex items-center justify-between"
            style={{
              background: "linear-gradient(135deg, rgba(192,98,45,0.12), rgba(234,179,8,0.08))",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div>
              <h2
                className="text-2xl font-extrabold tracking-tight"
                style={{ color: "var(--color-text-primary)" }}
              >
                📍 Places in {city}
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                {places.length} places · {places.filter((p) => p.highlight).length} must-visit
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Category filters */}
          <div className="shrink-0 px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                filter === "all"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                  : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-amber-500/50"
              }`}
            >
              All ({places.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                  filter === cat
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                    : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-amber-500/50"
                }`}
              >
                {CATEGORY_ICONS[cat] || "📍"} {cat.replace(/_/g, " ")} (
                {places.filter((p) => p.category === cat).length})
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Loading places in {city}...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">🏜️</div>
                <p className="font-bold" style={{ color: "var(--color-text-primary)" }}>
                  No places found
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                  Try a different category filter
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((place) => (
                  <PlaceCard key={place.id} place={place} city={city} onClose={onClose} onSearchPlace={onSearchPlace} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
