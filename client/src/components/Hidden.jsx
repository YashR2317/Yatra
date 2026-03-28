import React from "react";
import { motion } from "framer-motion";

import { getPlacesByCategory } from "../data/places";
import PlaceCard from "./cards/PlaceCard";

const Hidden = () => {
  const allGems = getPlacesByCategory("hidden-gem");

  return (
    <section className="relative w-full overflow-hidden">
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/backgrounds/LESSER_KNOWN_CORNERS.png')",
        }}
      />
      <div className="absolute inset-0 bg-black/75" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 py-24">
        {/* HEADING */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-wide">
            Hidden Gems
          </h2>
          <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
            Secret spots and overlooked wonders across the sacred land of Braj
          </p>
        </motion.div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allGems.map((gem, index) => (
            <PlaceCard
              key={gem.id}
              place={gem}
              from="home-hidden-gems"
              index={index}
              variant="card"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hidden;
