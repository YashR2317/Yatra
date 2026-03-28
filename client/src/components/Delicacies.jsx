import React from "react";
import { motion } from "framer-motion";

import delicacies from "../data/delicacies";

/* Only show these 2 dishes per city */
const allowedDishes = {
  agra: ["Petha", "Bedai-Jalebi"],
  mathura: ["Peda", "Lassi"],
  vrindavan: ["Panchamrit Prasad", "Radhaballabhi"],
  gokul: ["Makhan", "Kheer"],
  barsana: ["Ladoo Prasad", "Gheevar"],
  govardhan: ["Govardhan Annakut Prasad", "Malpua"],
};

const Delicacies = () => {
  const filteredDishes = Object.entries(delicacies).flatMap(([city, dishes]) => {
    const allowed = allowedDishes[city] || [];
    return dishes
      .filter((d) => allowed.includes(d.name))
      .map((d) => ({ ...d, cityKey: city }));
  });

  return (
    <section className="relative w-full overflow-hidden">
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/backgrounds/DELICACIES.png')" }}
      />
      <div className="absolute inset-0 bg-black/60" />

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
            Local Delicacies of Braj
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
            From Krishna's butter to Mughal feasts — discover the divine
            flavours of the six sacred cities.
          </p>
        </motion.div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDishes.map((item, index) => (
            <motion.div
              key={`${item.cityKey}-${item.name}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className="group bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden
                border border-white/10 hover:border-amber-400/40
                transition-all duration-500 hover:shadow-[0_15px_50px_rgba(245,158,11,0.12)]
                cursor-pointer h-full"
            >
              {/* IMAGE */}
              {item.image ? (
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-amber-900/40 via-orange-800/30 to-amber-950/50 flex items-center justify-center px-4">
                  <span className="text-lg font-bold text-white/15 tracking-widest uppercase text-center">
                    {item.name}
                  </span>
                </div>
              )}

              {/* TEXT */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white group-hover:text-amber-300 transition-colors duration-300">
                  {item.name}
                </h3>
                <p className="mt-2 text-sm text-white/55 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
                <p className="text-xs text-amber-400/80 mt-3 tracking-wide uppercase">
                  {item.city}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Delicacies;