import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useNavigate, Link } from "react-router-dom";

import itineraries from "../data/itineraries.json";

import "swiper/css";
import "swiper/css/navigation";

const Itineraries = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full min-h-screen overflow-hidden">

      {/* SCROLLABLE BACKGROUND */}
      <div
        className="absolute inset-0 bg-repeat-y bg-top"
        style={{
          backgroundImage: "url('/backgrounds/ITINERARIES.png')",
          backgroundSize: "cover",
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-24">

        {/* HEADING */}
        <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-wide text-center mb-12 drop-shadow-lg">
          Itineraries
        </h2>
        <p className="text-lg text-white/60 text-center mb-16 -mt-6">
          Curated journeys through the sacred land of Braj
        </p>

        {/* SLIDER */}
        <Swiper
          modules={[Navigation]}
          navigation
          slidesPerView={3}
          centeredSlides
          spaceBetween={40}
          loop={itineraries.length > 3}
          speed={700}
          grabCursor
          className="
            w-full max-w-7xl px-10
            [&_.swiper-button-prev]:text-white
            [&_.swiper-button-next]:text-white
            [&_.swiper-button-prev]:left-0
            [&_.swiper-button-next]:right-0
          "
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 20 },
            640: { slidesPerView: 1.5, spaceBetween: 30 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 3, spaceBetween: 40 },
          }}
        >
          {itineraries.map((item, index) => (
            <SwiperSlide key={item.id || index}>
              <Link to={`/itineraries/${item.citySlug}`} className="block">
                <div className="flex flex-col items-center group">

                  {/* OVAL IMAGE */}
                  <div
                    className="
                      w-[240px] h-[380px] sm:w-[260px] sm:h-[420px]
                      rounded-[999px]
                      overflow-hidden
                      shadow-[0_25px_60px_rgba(0,0,0,0.6)]
                      group-hover:shadow-[0_30px_70px_rgba(0,0,0,0.7)]
                      transition-shadow duration-500
                    "
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  {/* TITLE */}
                  <p className="mt-6 text-white text-center text-lg tracking-wide group-hover:text-amber-300 transition-colors duration-300">
                    {item.title}
                  </p>

                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* CTA BUTTON */}
        <div className="mt-16">
          <button
            onClick={() => navigate("/create-trip")}
            className="
              px-12 py-4
              text-sm md:text-base
              tracking-widest uppercase
              text-white
              border border-white
              rounded-full
              bg-transparent
              transition-all duration-300
              hover:bg-white hover:text-black
            "
          >
            Create Your Own Itinerary
          </button>
        </div>

      </div>
    </section>
  );
};

export default Itineraries;
