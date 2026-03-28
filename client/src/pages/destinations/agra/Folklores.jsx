import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import folklore from "../../../data/folklore";

const Folklores = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const attractionsData = folklore.agra;
  const total = attractionsData.length;

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden bg-cover bg-top bg-no-repeat"
      style={{ backgroundImage: "url('/backgrounds/FASCINATING_FOLKLORES.png')" }}
    >

      {/* BACKGROUND */}


      {/* SLIDE COUNTER */}
      <div className="absolute bottom-2 left-5 z-30 text-white/80 tracking-widest">
        <span className="text-2xl font-medium">
          {String(activeIndex + 1).padStart(2, "0")}
        </span>
        <span className="mx-2 opacity-60">/</span>
        <span className="opacity-60">
          {String(total).padStart(2, "0")}
        </span>
        <div className="mt-2 w-10 h-[1px] bg-white/40" />
      </div>

      {/* SLIDER */}
      <Swiper
        modules={[Navigation]}
        navigation
        slidesPerView={1}
        speed={700}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="
          relative z-10
          [&_.swiper-button-prev]:left-6
          [&_.swiper-button-next]:right-6
          [&_.swiper-button-prev]:text-white/70
          [&_.swiper-button-next]:text-white/70
          [&_.swiper-button-prev:hover]:text-white
          [&_.swiper-button-next:hover]:text-white
        "
      >
        {attractionsData.map((item, index) => (
          <SwiperSlide key={index}>
            <div
              className="grid grid-cols-1 lg:grid-cols-2 min-h-screen"
              onClick={() => navigate(item.link)}
            >
              {/* LEFT — TEXT */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex ml-20 items-end px-7 lg:px-10 pb-10 text-white"
              >
                <div className="max-w-3xl">
                  <h2 className="text-2xl lg:text-3xl font-semibold mb-4 leading-snug">
                    {item.title}
                  </h2>

                  <p className="text-base lg:text-xl leading-relaxed opacity-90 mb-3">
                    {item.description}
                  </p>

                  <a
                    href={item.sourcelink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-m italic underline opacity-70 hover:opacity-100"
                  >
                    Source — {item.source}
                  </a>
                </div>
              </motion.div>

              {/* RIGHT — IMAGE */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-center p-4 mt-34"
              >
                <div
                  className="
                    w-[24vw]
                    min-w-[220px]
                    h-[70vh]
                    max-h-[640px]
                    rounded-xl
                    overflow-hidden
                    shadow-[0_30px_80px_rgba(0,0,0,0.5)]
                    border border-white/10
                  "
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Folklores;
