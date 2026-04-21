import React, { useState } from "react";
import { motion } from "framer-motion";
import { buildPlaceMapUrl, getPlaceImage, getVirtualTourUrl } from "../../contexts/ChatContext";
import MessageBubble from "./MessageBubble";

const CATEGORY_COLORS = {
  temple: { bg: "bg-amber-100 dark:bg-amber-900/25", text: "text-amber-800 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  ghat: { bg: "bg-blue-100 dark:bg-blue-900/25", text: "text-blue-800 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
  monument: { bg: "bg-stone-100 dark:bg-stone-900/25", text: "text-stone-800 dark:text-stone-300", border: "border-stone-200 dark:border-stone-800" },
  nature: { bg: "bg-emerald-100 dark:bg-emerald-900/25", text: "text-emerald-800 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  heritage: { bg: "bg-purple-100 dark:bg-purple-900/25", text: "text-purple-800 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
  market: { bg: "bg-rose-100 dark:bg-rose-900/25", text: "text-rose-800 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
  religious: { bg: "bg-orange-100 dark:bg-orange-900/25", text: "text-orange-800 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800" },
};

function getCategoryStyle(category) {
  const key = (category || "").toLowerCase();
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.temple;
}

export default function RecommendationCard({ recommendations, summary }) {
  const [expandedIdx, setExpandedIdx] = useState(null);

  if (!recommendations || recommendations.length === 0) {
    return <MessageBubble role="assistant" content={summary || "Could not find recommendations. Try asking differently!"} />;
  }

  return (
    <div className="w-full space-y-3">
      {summary && <MessageBubble role="assistant" content={summary} />}

      {/* Horizontal scrollable on mobile, grid on desktop */}
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible scrollbar-hide snap-x snap-mandatory">
          {recommendations.map((rec, i) => {
            const imgUrl = getPlaceImage(rec.name, rec.city, rec.category);
            const mapUrl = buildPlaceMapUrl(rec.name, rec.city);
            const vrTourUrl = getVirtualTourUrl(rec.name);
            const googleUrl = `https://www.google.com/search?q=${encodeURIComponent((rec.name || "") + ", " + (rec.city || "") + ", India")}`;
            const catStyle = getCategoryStyle(rec.category);
            const isExpanded = expandedIdx === i;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                onClick={(e) => {
                  if (e.target.closest("a, button")) return;
                  window.open(googleUrl, "_blank");
                }}
                className="shrink-0 w-72 sm:w-auto snap-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/30 transition-all cursor-pointer group"
              >
                {/* Image with gradient overlay */}
                <div className="relative">
                  <img
                    src={imgUrl}
                    alt={rec.name || ""}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Name overlay on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-bold text-sm hover:text-amber-300 transition-colors drop-shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      📍 {rec.name}
                    </a>
                    <p className="text-[10px] text-white/80 mt-0.5">{rec.city}</p>
                  </div>

                  {/* Category badge */}
                  <span className={`absolute top-2.5 right-2.5 text-[9px] px-2.5 py-1 rounded-full font-bold ${catStyle.bg} ${catStyle.text} ${catStyle.border} border backdrop-blur-sm`}>
                    {rec.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-3.5">
                  {/* Why text with expand */}
                  {rec.why && (
                    <div className="mb-2.5">
                      <p className={`text-xs text-[var(--color-text-secondary)] leading-relaxed ${!isExpanded ? "line-clamp-2" : ""}`}>
                        {rec.why}
                      </p>
                      {rec.why.length > 100 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpandedIdx(isExpanded ? null : i); }}
                          className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 mt-0.5"
                        >
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Meta tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {rec.best_time && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium">
                        🕐 {rec.best_time}
                      </span>
                    )}
                    {rec.duration && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium">
                        ⏱️ {rec.duration}
                      </span>
                    )}
                    {rec.crowd_level && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium">
                        👥 {rec.crowd_level}
                      </span>
                    )}
                  </div>

                  {/* Insider tip */}
                  {rec.insider_tip && (
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 px-2.5 py-1.5 rounded-lg font-medium mb-3 border border-amber-100 dark:border-amber-800/30">
                      💡 {rec.insider_tip}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-200 transition-colors"
                    >
                      📍 Maps
                    </a>
                    {vrTourUrl && (
                      <a
                        href={vrTourUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-200 transition-colors"
                      >
                        🔮 360° Tour
                      </a>
                    )}
                    <a
                      href={googleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[var(--color-text-secondary)] font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ml-auto"
                    >
                      🔎 Search
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
