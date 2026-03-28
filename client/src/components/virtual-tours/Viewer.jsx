import React from "react";
import { motion } from "framer-motion";

export default function Viewer({
  image,
  heading,
  hotspots = [],
  directionKey,
  onHotspotClick
}) {
  return (
    <div className="w-full h-full relative bg-black overflow-hidden">

      {/* IMAGE */}
      {image && (
        <motion.img
          key={directionKey}
          src={image}
          alt="view"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* CINEMATIC VIGNETTE OVERLAY */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.35) 100%)",
        }}
      />

      {/* BOTTOM GRADIENT FADE */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)",
        }}
      />

      {/* HEADING OVERLAY */}
      {heading && (
        <motion.div
          className="absolute top-5 left-5 z-20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="glass-dark px-5 py-2.5 rounded-xl shadow-lg">
            <h2
              className="text-white text-sm md:text-base font-medium tracking-wide font-body"
              style={{ letterSpacing: "0.04em" }}
            >
              {heading}
            </h2>
          </div>
        </motion.div>
      )}

      {/* HOTSPOTS */}
      {hotspots.map((h, i) => (
        <button
          key={i}
          onClick={() => onHotspotClick(h.target)}
          className="absolute z-20 group cursor-pointer"
          style={{
            top: `${h.top}%`,
            left: `${h.left}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Outer pulse ring */}
          <span
            className="absolute inset-0 rounded-full"
            style={{
              width: "48px",
              height: "48px",
              top: "50%",
              left: "50%",
              animation: "hotspot-ring 2s ease-out infinite",
              border: "2px solid rgba(196, 146, 58, 0.5)",
            }}
          />
          {/* Inner button */}
          <span
            className="
              relative flex items-center justify-center
              w-11 h-11 rounded-full
              bg-white/90 shadow-lg
              transition-all duration-300 ease-out
              group-hover:scale-110 group-hover:shadow-xl
              group-hover:bg-white
            "
            style={{
              animation: "hotspot-pulse 2.5s ease-in-out infinite",
              boxShadow: "0 0 16px rgba(196, 146, 58, 0.3), 0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#1a1a2e] transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      ))}
    </div>
  );
}
