import React from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const DEFAULT_BOOKING_PLATFORMS = [
  { name: "MakeMyTrip", icon: "🔶", baseUrl: "https://www.makemytrip.com/hotels/hotel-listing", param: "city", color: "#0057a8" },
  { name: "Booking.com", icon: "🟦", baseUrl: "https://www.booking.com/searchresults.html", param: "ss", color: "#003580" },
  { name: "Goibibo", icon: "🟢", baseUrl: "https://www.goibibo.com/hotels/", param: "query", color: "#1eaf50" },
  { name: "OYO", icon: "🔴", baseUrl: "https://www.oyorooms.com/search", param: "location", color: "#d32f2f" },
];

export default function SearchResultCard({ data }) {
  if (!data) return null;

  const { placeName, city, text, groundingMetadata, isHotelSearch, bookingLinks } = data;
  const searchQuery = (placeName || "") + (city ? ", " + city : "") + ", India";
  const encodedQuery = encodeURIComponent(searchQuery);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

  // Use bookingLinks from backend if available, otherwise use defaults for hotel searches
  const platforms = bookingLinks && bookingLinks.length > 0
    ? bookingLinks
    : isHotelSearch
      ? DEFAULT_BOOKING_PLATFORMS.map(p => ({
          ...p,
          url: `${p.baseUrl}?${p.param}=${encodedQuery}`
        }))
      : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div
        className="px-5 py-3 border-b border-[var(--color-border)] flex items-center justify-between"
        style={{
          background: isHotelSearch
            ? "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(99,102,241,0.06))"
            : "linear-gradient(135deg, rgba(192,98,45,0.08), rgba(234,179,8,0.05))",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{isHotelSearch ? "🏨" : "🔍"}</span>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              {isHotelSearch ? `Hotels: ${placeName}` : placeName}
            </h3>
            {city && (
              <p className="text-[10px] text-[var(--color-text-secondary)]">
                📍 {city}, India
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1.5">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] px-2.5 py-1 rounded-full font-medium hover:opacity-80 transition-opacity"
            style={{ background: "linear-gradient(135deg, #4285f4, #34a853)", color: "white" }}
          >
            📍 Maps
          </a>
          <a
            href={`https://www.google.com/search?q=${encodedQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] px-2.5 py-1 rounded-full font-medium hover:opacity-80 transition-opacity"
            style={{ background: "linear-gradient(135deg, #ea4335, #fbbc05)", color: "white" }}
          >
            🔎 Google
          </a>
        </div>
      </div>

      {/* Body — Markdown */}
      <div className="px-5 py-4 prose prose-sm dark:prose-invert max-w-none prose-headings:text-[var(--color-text-primary)] prose-p:text-[var(--color-text-primary)] prose-li:text-[var(--color-text-primary)] prose-a:text-amber-600 dark:prose-a:text-amber-400 prose-strong:text-[var(--color-text-primary)]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text || ""}</ReactMarkdown>
      </div>

      {/* Booking Links — only for hotel searches */}
      {platforms.length > 0 && (
        <div
          className="px-5 py-3 border-t border-[var(--color-border)]"
          style={{ background: "rgba(37,99,235,0.03)" }}
        >
          <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
            🏨 Book Your Stay
          </p>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => (
              <a
                key={p.name}
                href={p.url || `${p.baseUrl}?${p.param}=${encodedQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] px-3.5 py-2 rounded-xl text-white font-bold hover:opacity-90 hover:scale-[1.02] transition-all shadow-sm"
                style={{ background: p.color || "#333" }}
              >
                {p.icon} {p.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Grounding Sources — citations from Google Search */}
      {groundingMetadata?.sources && groundingMetadata.sources.length > 0 && (
        <div className="px-5 py-3 border-t border-[var(--color-border)]">
          <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
            📚 Sources
          </p>
          <div className="flex flex-wrap gap-1.5">
            {groundingMetadata.sources.slice(0, 6).map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] px-2.5 py-1 rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400 transition-colors max-w-[200px] truncate"
                title={source.title || source.url}
              >
                🔗 {source.title || new URL(source.url).hostname}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Footer — Maps + Google */}
      <div className="px-5 py-2.5 border-t border-[var(--color-border)] flex items-center justify-between">
        <span className="text-[9px] text-[var(--color-text-secondary)] italic">
          Powered by Google Search
        </span>
        <div className="flex gap-1.5">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-200 transition-colors"
          >
            📍 View on Maps
          </a>
        </div>
      </div>
    </motion.div>
  );
}
