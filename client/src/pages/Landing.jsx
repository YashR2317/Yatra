import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Destination from "../components/Destination";
import Attractions from "../components/Attractions";
import TravelDiaries from "../components/TravelDiaries";
import Itineraries from "../components/Itineraries";
import Navbar from "../components/Navbar"
import Hidden from "../components/Hidden";
import Footer from "../components/Footer";
import Delicacies from "../components/Delicacies";
import heroSlides from "../data/landing.json";

const Landing = () => {
  const [index, setIndex] = useState(0);
  const total = heroSlides.length;
  const nextIndex = (index + 1) % total;

  const goNext = () => setIndex(nextIndex);
  const goPrev = () => setIndex((index - 1 + total) % total);

  /* Keyboard navigation */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index]);

  return (
    <div>
      <Navbar navLinks={[
        { label: "Destinations", href: "#destinations" },
        { label: "Travel Diaries", href: "#travel-diaries" },
        { label: "Itineraries", href: "#itineraries" },
        { label: "Hidden Gems", href: "#hidden-gems" },
        { label: "Delicacies", href: "#delicacies" },
      ]} />
      <section
        className="relative w-full h-screen overflow-hidden cursor-pointer"
        onClick={goNext}
      >
        {/* MAIN IMAGE */}
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={heroSlides[index].img}
            alt={heroSlides[index].name}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          />
        </AnimatePresence>

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/30 to-black/10" />

        {/* SLIDE COUNTER */}
        <div className="absolute top-10 left-10 z-20 text-white tracking-widest">
          <span className="text-xl font-medium">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="mx-2 opacity-60">/</span>
          <span className="opacity-60">
            {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* BOTTOM LEFT — CURRENT PLACE */}
        <motion.div
          key={`text-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="absolute bottom-12 left-10 z-20 text-white"
        >
          <h2 className="text-4xl md:text-5xl font-semibold tracking-wide">
            {heroSlides[index].name}
          </h2>
          <p className="text-sm md:text-base opacity-80 mt-1">
            {heroSlides[index].location}
          </p>
        </motion.div>

        {/* BOTTOM RIGHT — NEXT PREVIEW */}
        <div
          className="absolute bottom-10 right-10 z-20 flex flex-col items-end gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            whileHover={{ scale: 1.06 }}
            className="
            w-56 h-40
            rounded-xl overflow-hidden
            shadow-2xl
            border border-white/20
            cursor-pointer
          "
            onClick={goNext}
          >
            <img
              src={heroSlides[nextIndex].img}
              alt={heroSlides[nextIndex].name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          <div className="text-right text-white">
            <p className="text-sm font-medium tracking-wide">
              {heroSlides[nextIndex].name}
            </p>
            <p className="text-xs opacity-70">
              {heroSlides[nextIndex].location}
            </p>
          </div>

          {/* PROGRESS BAR */}
          <div className="w-40 h-0.5 bg-white/30 overflow-hidden rounded">
            <motion.div
              key={index}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="h-full bg-white"
            />
          </div>
        </div>
      </section>
      <section id="destinations"><Destination /></section>
      {/* <section><Attractions/></section> */}
      <section id="travel-diaries"><TravelDiaries /></section>
      <section id="itineraries"><Itineraries /></section>
      <section id="hidden-gems"><Hidden /></section>
      <section id="delicacies"><Delicacies /></section>
      <Footer />
    </div>
  );
};

export default Landing;
