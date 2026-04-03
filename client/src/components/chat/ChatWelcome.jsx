import React, { useState } from "react";
import { motion } from "framer-motion";
import { useChatContext, CITY_IMAGES } from "../../contexts/ChatContext";
import CityPlacesModal from "./CityPlacesModal";

const WELCOME_CARDS = [
  { icon: "🛕", title: "Plan Your Yatra", desc: "Custom itinerary with preferences", action: "questionnaire" },
  { icon: "🕉️", title: "Temple Darshan", desc: "Sacred temples & divine darshan", queryKey: "query_darshan" },
  { icon: "🎉", title: "Festivals & Events", desc: "Sacred festivals & celebrations", queryKey: "query_festivals" },
  { icon: "🌿", title: "Parikrama Guide", desc: "Sacred circumambulation routes", queryKey: "query_parikrama" },
];

export default function ChatWelcome({ onAction, cities, onSearchPlace }) {
  const [selectedCity, setSelectedCity] = useState(null);

  // Always use our known-good image paths from CITY_IMAGES
  const displayCities = cities.length > 0
    ? cities.map(c => ({ ...c, image: CITY_IMAGES[c.name] || c.image }))
    : Object.entries(CITY_IMAGES).map(([name, image]) => ({ name, image, count: 20 }));

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <div className="text-5xl mb-3">🪷</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            BRAJYATRA.AI
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1 italic">
            Where Travel meets Tradition
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-3 max-w-md leading-relaxed">
            Your AI-powered <em>Tirth Companion</em> for the sacred <strong>Braj Dham</strong> — walk
            the land where <strong>Shri Krishna</strong> performed His divine leelas.
          </p>
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl w-full mb-8">
          {WELCOME_CARDS.map((card, i) => (
            <motion.button
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              onClick={() => onAction(card)}
              className="group flex flex-col items-center gap-2 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer"
              id={`welcome-card-${i}`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{card.icon}</span>
              <span className="text-xs font-semibold text-[var(--color-text-primary)]">{card.title}</span>
              <span className="text-[10px] text-[var(--color-text-secondary)] leading-tight text-center">{card.desc}</span>
            </motion.button>
          ))}
        </div>

        {/* City Carousel — click to show places */}
        <p className="text-[10px] text-[var(--color-text-secondary)] mb-2 uppercase tracking-widest font-semibold">
          Explore sacred cities
        </p>
        <div className="flex gap-3 overflow-x-auto pb-3 max-w-2xl w-full scrollbar-hide">
          {displayCities.map((city, i) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedCity(city.name)}
              className="shrink-0 w-28 rounded-xl overflow-hidden border border-[var(--color-border)] shadow-sm cursor-pointer hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all"
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-16 object-cover"
                loading="lazy"
              />
              <div className="px-2 py-1.5 text-center">
                <p className="text-[11px] font-semibold text-[var(--color-text-primary)]">{city.name}</p>
                {city.count && (
                  <p className="text-[9px] text-[var(--color-text-secondary)]">{city.count} places</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* City Places Modal */}
      {selectedCity && (
        <CityPlacesModal
          city={selectedCity}
          onClose={() => setSelectedCity(null)}
          onSearchPlace={(query) => {
            setSelectedCity(null);
            if (onSearchPlace) onSearchPlace(query);
          }}
        />
      )}
    </>
  );
}
