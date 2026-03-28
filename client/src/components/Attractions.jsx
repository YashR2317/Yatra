import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import { getPlacesByCategory } from "../data/places";

const Attractions = () => {
  const navigate = useNavigate();
  // Show 2-3 top attractions per city across all cities
  const data = getPlacesByCategory("attraction").slice(0, 12);

  const handleCardClick = (slug) => {
    navigate(`/place/${slug}`);
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background image */}
      <img
        src="/backgrounds/ATTRACTIONS.png"
        alt="Top Attractions"
        className="w-full h-auto object-contain"
      />

      {/* Dark gradient */}
      <div className="absolute bottom-0 left-0 w-full h-[50%] bg-linear-to-t from-black/90 via-black/60 to-transparent z-10 pointer-events-none" />

      {/* Slider */}
      <motion.div
        className="absolute bottom-10 left-0 w-full z-30 px-4 sm:px-8 lg:px-16"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Swiper
          modules={[Navigation]}
          navigation
          speed={700}
          spaceBetween={50}
          breakpoints={{
            0: { slidesPerView: 1.05 },
            640: { slidesPerView: 1.6 },
            768: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3 }
          }}
        >
          {data.map((item) => (
            <SwiperSlide key={item.id}>
              <div
                onClick={() => handleCardClick(item.slug)}
                className="relative cursor-pointer rounded-2xl overflow-hidden shadow-2xl group"
                style={{ height: "85vh", maxHeight: "800px" }}
              >
                {item.heroImage ? (
                  <img
                    src={item.heroImage}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-900/40 to-amber-950/50 flex items-center justify-center px-6">
                    <span className="text-3xl font-bold text-white/15 tracking-widest uppercase text-center">{item.name}</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />

                <h3 className="absolute bottom-6 left-6 text-white text-xl font-semibold tracking-wide drop-shadow-xl">
                  {item.name}
                </h3>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </section>
  );
};

export default Attractions;