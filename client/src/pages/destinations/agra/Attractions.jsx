import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import { getPlacesByCityAndCategory } from "../../../data/places";

const Attractions = () => {
  const location = useLocation();
  const data = getPlacesByCityAndCategory("agra", "attraction");

  return (
    <section className="relative w-full overflow-hidden">

      {/* Background image */}
      <img
        src="/backgrounds/ATTRACTIONS.png"
        alt="Agra Attractions"
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
          {data.map((place) => (
            <SwiperSlide key={place.id}>
              <Link to={`/place/${place.id}`} state={{ from: location.pathname }}>
                <div
                  className="relative cursor-pointer rounded-2xl overflow-hidden shadow-2xl group"
                  style={{ height: "85vh", maxHeight: "800px" }}
                >
                  {place.heroImage ? (
                    <img
                      src={place.heroImage}
                      alt={place.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-900/40 via-orange-800/30 to-amber-950/50 flex items-center justify-center px-6">
                      <span className="text-3xl font-bold text-white/15 tracking-widest uppercase text-center">{place.name}</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />

                  <h3 className="absolute bottom-6 left-6 text-white text-xl font-semibold tracking-wide drop-shadow-xl">
                    {place.name}
                  </h3>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </section>
  );
};

export default Attractions;
