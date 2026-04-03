import React, { useState } from "react";
import { motion } from "framer-motion";

export default function WeatherPrefCard({ data, onSelectPreference }) {
  const [selected, setSelected] = useState(null);
  if (!data) return null;

  const weather = data.weather;
  const options = data.options;
  const weatherEmoji = weather.is_rainy ? "🌧️" : weather.temp > 32 ? "🔥" : weather.temp < 15 ? "🥶" : "🌤️";

  const handleSelect = (pref) => {
    setSelected(pref);
    setTimeout(() => onSelectPreference(pref, data), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xl mx-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg overflow-hidden"
    >
      {/* Weather Info */}
      <div className="px-5 py-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/10 dark:to-blue-900/10 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{weatherEmoji}</span>
          <div>
            <p className="text-xl font-bold text-[var(--color-text-primary)]">{weather.temp}°C</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{weather.description} in {weather.city}</p>
            <p className="text-[10px] text-[var(--color-text-secondary)]">
              Feels like {weather.feels_like}°C · 💧 {weather.humidity}% · 💨 {weather.wind_speed} m/s
            </p>
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mt-2">{options.message}</p>
      </div>

      {/* Choices */}
      <div className="p-4 space-y-2">
        {options.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => handleSelect(choice.id)}
            disabled={selected !== null}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              selected === choice.id
                ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-500/30"
                : "border-[var(--color-border)] hover:border-amber-500/30 hover:bg-amber-50/30 dark:hover:bg-amber-900/5"
            } disabled:opacity-70`}
          >
            <span className="text-xl shrink-0">{choice.icon}</span>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{choice.label}</p>
              <p className="text-[11px] text-[var(--color-text-secondary)]">{choice.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
