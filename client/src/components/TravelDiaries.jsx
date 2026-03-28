import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import diaries from "../data/traveldiaries.json";

const TravelDiaries = () => {
  const [index, setIndex] = useState(0);
  const total = diaries.length;

  const next = () => setIndex((index + 1) % total);
  const prev = () => setIndex((index - 1 + total) % total);

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-white">
      {/* BACKGROUND */}
      <img
        src="/backgrounds/TRAVEL_DIARIES.png"
        alt="Travel Diaries Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen px-12 lg:px-24">
        {/* CARD */}
        <div className="relative flex items-center justify-center mt-50">

          {/* LEFT ARROW */}
          <button
            onClick={prev}
            className="absolute left-[-60px] text-5xl text-black hover:text-gray-700 transition"
          >
            ‹
          </button>

          {/* RIGHT ARROW */}
          <button
            onClick={next}
            className="absolute right-[-60px] text-5xl text-black hover:text-gray-700 transition"
          >
            ›
          </button>

          <AnimatePresence mode="wait">
            <Link to={`/travel-diaries/${diaries[index].slug}`}>
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6 }}
                className="flex w-[80vw] max-w-6xl shadow-xl bg-white cursor-pointer"
              >
                {/* IMAGE */}
                <div className="w-1/2 h-[420px] overflow-hidden">
                  <img
                    src={`/traveldiaries/${diaries[index].image}`}
                    alt={diaries[index].title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* TEXT */}
                <div className="w-1/2 bg-sky-300 p-10 flex flex-col justify-center">
                  <h3 className="text-3xl font-semibold text-blue-900 mb-4">
                    {diaries[index].title}
                  </h3>

                  <p className="text-base text-blue-900 leading-relaxed mb-6">
                    {diaries[index].description}
                  </p>

                  <p className="text-lg font-semibold text-blue-900">
                    — {diaries[index].author}
                  </p>
                </div>
              </motion.div>
            </Link>
          </AnimatePresence>
        </div>

        {/* COUNTER */}
        <div className="mt-10 text-sm tracking-widest text-gray-500">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </div>
      </div>
    </section>
  );
};

export default TravelDiaries;
