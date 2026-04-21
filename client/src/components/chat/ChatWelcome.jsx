import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatContext, CITY_IMAGES } from "../../contexts/ChatContext";
import CityPlacesModal from "./CityPlacesModal";

const WELCOME_CARDS = [
  { icon: "🛕", title: "Plan Your Yatra", desc: "Custom itinerary with preferences", action: "questionnaire", shortcut: "1" },
  { icon: "🕉️", title: "Temple Darshan", desc: "Sacred temples & divine darshan", queryKey: "query_darshan", shortcut: "2" },
  { icon: "🎉", title: "Festivals & Events", desc: "Sacred festivals & celebrations", queryKey: "query_festivals", shortcut: "3" },
  { icon: "🌿", title: "Parikrama Guide", desc: "Sacred circumambulation routes", queryKey: "query_parikrama", shortcut: "4" },
];

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return { text: "Shubh Ratri", sub: "Perfect time for Brahma Muhurta meditation 🧘", emoji: "🌙" };
  if (hour < 10) return { text: "Shubh Prabhat", sub: "Perfect time for temple darshan & morning aarti 🙏", emoji: "🌅" };
  if (hour < 14) return { text: "Jai Shri Krishna", sub: "Explore sacred temples & heritage sites ✨", emoji: "☀️" };
  if (hour < 17) return { text: "Radhe Radhe", sub: "Visit ghats & take a sacred parikrama 🌊", emoji: "🌤️" };
  if (hour < 20) return { text: "Shubh Sandhya", sub: "Time for evening aarti at the ghats 🪔", emoji: "🌇" };
  return { text: "Hare Krishna", sub: "Plan tomorrow's sacred yatra tonight 📖", emoji: "🌙" };
}

// Floating saffron particles
function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${8 + Math.random() * 84}%`,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
      size: 3 + Math.random() * 5,
    })),
  []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-amber-400/30 to-orange-400/20"
          style={{
            left: p.left,
            bottom: "-10px",
            width: p.size + "px",
            height: p.size + "px",
          }}
          animate={{
            y: [0, -150 - Math.random() * 100],
            x: [0, (Math.random() - 0.5) * 40],
            opacity: [0, 0.6, 0],
            scale: [1, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export default function ChatWelcome({ onAction, cities, onSearchPlace }) {
  const [selectedCity, setSelectedCity] = useState(null);
  const greeting = getTimeGreeting();

  // Always use our known-good image paths from CITY_IMAGES
  const displayCities = cities.length > 0
    ? cities.map(c => ({ ...c, image: CITY_IMAGES[c.name] || c.image }))
    : Object.entries(CITY_IMAGES).map(([name, image]) => ({ name, image, count: 20 }));

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto relative">
        {/* Floating particles background */}
        <FloatingParticles />

        {/* Om Symbol with radial glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 mb-6"
        >
          <div className="relative">
            {/* Radial glow behind Om */}
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-amber-400/20 via-orange-400/15 to-red-400/10 blur-xl scale-150" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-amber-500/30 om-pulse relative z-10"
              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            >
              ॐ
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-2 relative z-10"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            BRAJYATRA.AI
          </h1>
        </motion.div>

        {/* Time-aware greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mb-8 relative z-10"
        >
          <p className="text-base font-semibold text-[var(--color-text-primary)] flex items-center gap-2 justify-center">
            <span className="text-xl">{greeting.emoji}</span>
            {greeting.text}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-sm leading-relaxed">
            {greeting.sub}
          </p>
        </motion.div>

        {/* Action Cards — 2x2 glassmorphic */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl w-full mb-8 relative z-10">
          {WELCOME_CARDS.map((card, i) => (
            <motion.button
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onAction(card)}
              className="group relative flex flex-col items-center gap-2.5 p-5 rounded-2xl glass hover:shadow-xl hover:shadow-amber-500/10 transition-all cursor-pointer overflow-hidden"
              id={`welcome-card-${i}`}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-orange-500/0 to-red-500/0 group-hover:from-amber-500/5 group-hover:via-orange-500/5 group-hover:to-red-500/5 transition-all duration-500 rounded-2xl" />
              
              <span className="text-3xl group-hover:scale-110 transition-transform relative z-10">{card.icon}</span>
              <span className="text-xs font-bold text-[var(--color-text-primary)] relative z-10">{card.title}</span>
              <span className="text-[10px] text-[var(--color-text-secondary)] leading-tight text-center relative z-10">{card.desc}</span>
              
              {/* Keyboard shortcut badge */}
              <span className="absolute top-2 right-2 text-[8px] font-bold text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-40 transition-opacity bg-[var(--color-surface-alt)] px-1.5 py-0.5 rounded">
                ⌘{card.shortcut}
              </span>
            </motion.button>
          ))}
        </div>

        {/* City Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="w-full max-w-2xl relative z-10"
        >
          <p className="text-[10px] text-[var(--color-text-secondary)] mb-3 uppercase tracking-widest font-bold text-center">
            ✧ Explore Sacred Cities ✧
          </p>
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide justify-center flex-wrap sm:flex-nowrap">
            {displayCities.map((city, i) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.08 }}
                whileHover={{ y: -6, scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedCity(city.name)}
                className="shrink-0 w-36 rounded-xl overflow-hidden glass shadow-md cursor-pointer hover:shadow-xl hover:shadow-amber-500/10 transition-all group"
              >
                <div className="relative">
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Gradient overlay on image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2">
                    <p className="text-sm font-bold text-white drop-shadow-lg">{city.name}</p>
                    {city.count && (
                      <p className="text-[9px] text-white/80 font-medium">{city.count} tirth sthals</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
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
