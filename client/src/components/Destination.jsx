import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const destinations = [
  {
    city: "Agra",
    state: "Uttar Pradesh",
    image: "/destinations/agra.jpg",
    route: "/agra",
  },
  {
    city: "Mathura",
    state: "Uttar Pradesh",
    image: "/destinations/mathura.jpg",
    route: "/mathura",
  },
  {
    city: "Vrindavan",
    state: "Uttar Pradesh",
    image: "/destinations/vrindavan.webp",
    route: "/vrindavan",
  },
  {
    city: "Barsana",
    state: "Uttar Pradesh",
    image: "/destinations/barsana.jpeg",
    route: "/barsana",
  },
  {
    city: "Govardhan",
    state: "Uttar Pradesh",
    image: "/destinations/govardhan.jpg",
    route: "/govardhan",
  },
  {
    city: "Gokul",
    state: "Uttar Pradesh",
    image: "/destinations/gokul.jpg",
    route: "/gokul",
  },
];

const Destination = ({ excludeCity, headingOverride }) => {
  const filteredDestinations = excludeCity
    ? destinations.filter((d) => d.city.toLowerCase() !== excludeCity.toLowerCase())
    : destinations;
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const total = filteredDestinations.length;

  const next = () => setIndex((index + 1) % total);
  const prev = () => setIndex((index - 1 + total) % total);

  const handleExplore = () => {
    const dest = filteredDestinations[index];
    if (dest.route) navigate(dest.route);
  };

  return (
    <section className="relative w-full h-[100vh] overflow-hidden bg-black">
      {/* IMAGE */}
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={filteredDestinations[index].image}
          alt={filteredDestinations[index].city}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* FULL BLACK OVERLAY */}
      <div className="absolute inset-0 bg-black/55" />

      {/* PAGE HEADING */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20">
        <h1 className="text-white text-8xl md:text-9xl lg:text-9xl font-extrabold tracking-widest">
          {headingOverride || "DESTINATIONS"}
        </h1>
      </div>

      {/* LEFT ARROW */}
      <button
        onClick={prev}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20
                   text-white/70 hover:text-white text-5xl transition"
      >
        ‹
      </button>

      {/* RIGHT ARROW */}
      <button
        onClick={next}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20
                   text-white/70 hover:text-white text-5xl transition"
      >
        ›
      </button>

      {/* CITY + STATE + EXPLORE BUTTON (BOTTOM CENTER) */}
      <motion.div
        key={`text-${index}`}
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2
                   text-center text-white z-20"
      >
        <h2 className="text-4xl md:text-5xl font-semibold tracking-wide">
          {filteredDestinations[index].city}
        </h2>
        <p className="text-sm md:text-base opacity-80 mt-1">
          {filteredDestinations[index].state}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExplore}
          className="
            mt-6 px-10 py-3
            border-2 border-white
            text-white text-sm
            tracking-widest uppercase
            rounded-full
            transition-all duration-300
            hover:bg-white hover:text-black
            cursor-pointer
          "
        >
          Explore {filteredDestinations[index].city}
        </motion.button>
      </motion.div>

      {/* SLIDE COUNTER */}
      <div className="absolute top-8 right-10 text-white/70 tracking-widest z-20">
        {String(index + 1).padStart(2, "0")} /{" "}
        {String(total).padStart(2, "0")}
      </div>
    </section>
  );
};

export default Destination;
