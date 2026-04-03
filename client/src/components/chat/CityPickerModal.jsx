import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatContext, CITY_IMAGES } from "../../contexts/ChatContext";

export default function CityPickerModal({ onSelect }) {
  const { state, dispatch } = useChatContext();

  if (!state.cityPickerOpen) return null;

  const titleMap = {
    query_darshan: "Select city for Temple Darshan Guide",
    query_prasadam: "Select city for Prasadam & Food",
    query_weather: "Select city for Weather",
  };

  const queryTemplateMap = {
    query_darshan: (city) => `Recommend the best temples for darshan in ${city}`,
    query_prasadam: (city) => `Recommend must-try prasadam and local food in ${city}`,
    query_weather: (city) => `What's the weather like in ${city} today?`,
  };

  const close = () => dispatch({ type: "CLOSE_CITY_PICKER" });

  const handleSelect = (city) => {
    const template = queryTemplateMap[state.cityPickerQueryKey];
    if (template) {
      onSelect(template(city));
    }
    close();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
              {titleMap[state.cityPickerQueryKey] || "Select a City"}
            </h2>
            <button onClick={close} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-[var(--color-text-secondary)]">✕</button>
          </div>

          {/* City Grid */}
          <div className="grid grid-cols-3 gap-3 p-5">
            {Object.entries(CITY_IMAGES).map(([name, img]) => (
              <button
                key={name}
                onClick={() => handleSelect(name)}
                className="rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-amber-500 hover:shadow-md transition-all group"
              >
                <img src={img} alt={name} className="w-full h-16 object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                <p className="py-1.5 text-[11px] font-semibold text-[var(--color-text-primary)] text-center">{name}</p>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
