import React from "react";
import { motion } from "framer-motion";
import { buildPlaceMapUrl, getPlaceImage, getVirtualTourUrl } from "../../contexts/ChatContext";
import MessageBubble from "./MessageBubble";

export default function RecommendationCard({ recommendations, summary }) {
  if (!recommendations || recommendations.length === 0) {
    return <MessageBubble role="assistant" content={summary || "Could not find recommendations. Try asking differently!"} />;
  }

  return (
    <div className="w-full space-y-3">
      {summary && <MessageBubble role="assistant" content={summary} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
        {recommendations.map((rec, i) => {
          const imgUrl = getPlaceImage(rec.name, rec.city, rec.category);
          const mapUrl = buildPlaceMapUrl(rec.name, rec.city);
          const vrTourUrl = getVirtualTourUrl(rec.name);
          const googleUrl = `https://www.google.com/search?q=${encodeURIComponent((rec.name || "") + ", " + (rec.city || "") + ", India")}`;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={(e) => {
                if (e.target.closest("a, button")) return;
                window.open(googleUrl, "_blank");
              }}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all cursor-pointer group"
            >
              <img
                src={imgUrl}
                alt={rec.name || ""}
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => (e.target.style.display = "none")}
              />
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-1">
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors" onClick={(e) => e.stopPropagation()}>
                      📍 {rec.name}
                    </a>
                  </h4>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-medium shrink-0">
                    {rec.category}
                  </span>
                </div>

                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">📍 {rec.city}</p>
                {rec.why && <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed line-clamp-3">{rec.why}</p>}

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {rec.best_time && <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">🕐 {rec.best_time}</span>}
                  {rec.duration && <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">⏱️ {rec.duration}</span>}
                  {rec.crowd_level && <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">👥 {rec.crowd_level}</span>}
                </div>

                {rec.insider_tip && (
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-900/10 px-2 py-1 rounded-lg">
                    💡 {rec.insider_tip}
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-200 transition-colors">
                    📍 Maps
                  </a>
                  {vrTourUrl && (
                    <a href={vrTourUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium hover:bg-purple-200 transition-colors">
                      🔮 360° Tour
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
