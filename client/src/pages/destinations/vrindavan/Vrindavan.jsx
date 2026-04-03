import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import SEOHead from "../../../components/SEOHead";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

import Navbar from "../../../components/Navbar";

import Footer from "../../../components/Footer";
import TravelDiaries from "../../../components/TravelDiaries";
import Itineraries from "../../../components/Itineraries";
import TemplesGhats from "../../../components/TemplesGhats";
import HiddenGemsSection from "../../../components/HiddenGemsSection";
import SaptadevaSection from "../../../components/SaptadevaSection";
import Destination from "../../../components/Destination";

import { getPlacesByCityAndCategory } from "../../../data/places";
import folklore from "../../../data/folklore";

/* ── Attractions sub-component ────────────────────────────── */
const Attractions = () => {
  const location = useLocation();
  const data = getPlacesByCityAndCategory("vrindavan", "attraction");
  return (
    <section className="relative w-full overflow-hidden">
      <img src="/backgrounds/ATTRACTIONS.png" alt="Vrindavan Attractions" className="w-full h-auto object-contain" />
      <div className="absolute bottom-0 left-0 w-full h-[50%] bg-linear-to-t from-black/90 via-black/60 to-transparent z-10 pointer-events-none" />
      <motion.div className="absolute bottom-10 left-0 w-full z-30 px-4 sm:px-8 lg:px-16" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }}>
        <Swiper modules={[Navigation]} navigation speed={700} spaceBetween={50} breakpoints={{ 0: { slidesPerView: 1.05 }, 640: { slidesPerView: 1.6 }, 768: { slidesPerView: 2.2 }, 1024: { slidesPerView: 3 } }}>
          {data.map((place) => (
            <SwiperSlide key={place.id}>
              <Link to={`/place/${place.id}`} state={{ from: location.pathname }}>
                <div className="relative cursor-pointer rounded-2xl overflow-hidden shadow-2xl group" style={{ height: "85vh", maxHeight: "800px" }}>
                  {place.heroImage ? (<img src={place.heroImage} alt={place.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />) : (<div className="w-full h-full bg-gradient-to-br from-amber-900/40 via-orange-800/30 to-amber-950/50 flex items-center justify-center px-6"><span className="text-3xl font-bold text-white/15 tracking-widest uppercase text-center">{place.name}</span></div>)}
                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />
                  <h3 className="absolute bottom-6 left-6 text-white text-xl font-semibold tracking-wide drop-shadow-xl">{place.name}</h3>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </section>
  );
};

/* ── Folklores sub-component ──────────────────────────────── */
const Folklores = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const folkloresData = folklore.vrindavan;
  const total = folkloresData.length;

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden bg-cover bg-top bg-no-repeat"
      style={{ backgroundImage: "url('/backgrounds/FASCINATING_FOLKLORES.png')" }}
    >
      <div className="absolute bottom-2 left-5 z-30 text-white/80 tracking-widest">
        <span className="text-2xl font-medium">{String(activeIndex + 1).padStart(2, "0")}</span>
        <span className="mx-2 opacity-60">/</span>
        <span className="opacity-60">{String(total).padStart(2, "0")}</span>
        <div className="mt-2 w-10 h-[1px] bg-white/40" />
      </div>

      <Swiper
        modules={[Navigation]}
        navigation
        slidesPerView={1}
        speed={700}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="relative z-10 [&_.swiper-button-prev]:left-6 [&_.swiper-button-next]:right-6 [&_.swiper-button-prev]:text-white/70 [&_.swiper-button-next]:text-white/70 [&_.swiper-button-prev:hover]:text-white [&_.swiper-button-next:hover]:text-white"
      >
        {folkloresData.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen" onClick={() => navigate(item.link)}>
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex ml-20 items-end px-7 lg:px-10 pb-10 text-white"
              >
                <div className="max-w-3xl">
                  <h2 className="text-2xl lg:text-3xl font-semibold mb-4 leading-snug">{item.title}</h2>
                  <p className="text-base lg:text-xl leading-relaxed opacity-90 mb-3">{item.description}</p>
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
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-center p-4 mt-34"
              >
                <div className="w-[24vw] min-w-[220px] h-[70vh] max-h-[640px] rounded-xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.5)] border border-white/10">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

/* ── Animation variants ───────────────────────────────────── */
const childVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

/* ── MAIN PAGE ────────────────────────────────────────────── */
const Vrindavan = () => {
  const [showMore, setShowMore] = useState(false);

  const sliderImages = [
    "/destinations/vrindavan.webp",
    "/landing/hero1.jpeg",
    "/destinations/vrindavan.webp",
    "/landing/hero1.jpeg",
    "/destinations/vrindavan.webp",
  ];

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <SEOHead
        title="Vrindavan — Land of Krishna's Divine Play"
        description="Visit Vrindavan, the sacred town of Lord Krishna's childhood leelas. Explore Banke Bihari, ISKCON, Nidhivan, and the mystical groves of Braj."
        image="/destinations/vrindavan.webp"
      />
      <Navbar navLinks={[
        { label: "Attractions", href: "#attractions" },
        { label: "Folklore", href: "#folklore" },
        { label: "Itineraries", href: "#itineraries" },
        { label: "Travel Diaries", href: "#travel-diaries" },
        { label: "Temples", href: "#temples-ghats" },
        { label: "Hidden Gems", href: "#hidden-gems" },
        { label: "Saptadeva", href: "#saptadeva" },
        { label: "Nearby", href: "#nearby" },
      ]} />


      {/* HERO SWIPER */}
      <div className="w-screen h-[90vh] overflow-hidden relative mb-2">
        <Swiper
          slidesPerView={1}
          loop
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          effect="fade"
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          className="w-full h-full"
        >
          {sliderImages.map((src, i) => (
            <SwiperSlide key={i} className="relative">
              <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/40 to-black/70 z-20" />
              <img src={src} alt={`Vrindavan Slide ${i + 1}`} className="w-full h-full object-cover" />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-center text-white z-30">
          <h1 className="text-5xl font-extrabold drop-shadow-lg tracking-wide">Welcome to Vrindavan</h1>
          <p className="text-lg mt-2 text-gray-200 drop-shadow-md">The Land of Krishna's Divine Play</p>
        </div>
      </div>

      {/* INFORMATION SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.2 }}
        className="px-8 lg:px-24 py-16"
      >
        <motion.h1 variants={childVariants} className="text-5xl font-bold mb-6 text-gray-900">
          Vrindavan: Where Every Moment is Divine
        </motion.h1>
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* LEFT — DESCRIPTION */}
          <motion.div variants={childVariants} className="w-full lg:w-[60%] text-gray-700 text-lg sm:text-xl leading-relaxed space-y-6">
            <div className="text-xl leading-relaxed text-gray-700 pr-10 pt-10">
              Vrindavan is the mystical town where Lord Krishna spent his childhood, playing his enchanting flute and performing the divine Raas Leela. Located just 15 kilometres from Mathura in Uttar Pradesh, this sacred town is home to over 5,000 temples, each telling a unique story of devotion, love, and spiritual transcendence.
              <div className="m-5" />
              The town's most iconic temple, Banke Bihari, draws millions of devotees each year. The temple is famous for its unique tradition where a curtain is drawn every few minutes to break the devotee's gaze from the mesmerising idol—legend says the deity's eyes are so enchanting that he might follow a devoted worshipper home. The grand ISKCON Temple (Sri Krishna-Balaram Mandir) is another architectural marvel that combines spiritual serenity with modern amenities.
              <div className="m-5" />
              Vrindavan's ancient groves, known as 'vans' or 'kunjs,' are believed to be the sites where Krishna performed his divine pastimes. Nidhivan, perhaps the most mysterious of all, is a dense grove where even today no one stays after sunset—locals believe Krishna still performs the Raas Leela here every night.
              <div className="m-5" />
              The best time to visit Vrindavan is during Janmashtami, Holi, or the pleasant months of October through March. The town is easily accessible from Delhi and Agra.
            </div>
          </motion.div>

          {/* RIGHT — QUICK FACTS */}
          <div className="lg:w-[40%] w-full bg-gray-100 p-5 rounded-xl shadow-lg self-start mt-8">
            <h2 className="text-2xl font-semibold mb-5">Quick Facts</h2>
            <div className="grid grid-cols-2 gap-x-4 mb-6 text-gray-700 text-base">
              <ul className="space-y-1">
                <li><strong>January:</strong> 7°C – 21°C</li>
                <li><strong>February:</strong> 10°C – 25°C</li>
                <li><strong>March:</strong> 15°C – 32°C</li>
                <li><strong>April:</strong> 22°C – 39°C</li>
                <li><strong>May:</strong> 27°C – 44°C</li>
                <li><strong>June:</strong> 29°C – 42°C</li>
              </ul>
              <ul className="space-y-1">
                <li><strong>July:</strong> 27°C – 37°C</li>
                <li><strong>August:</strong> 26°C – 35°C</li>
                <li><strong>September:</strong> 25°C – 34°C</li>
                <li><strong>October:</strong> 20°C – 33°C</li>
                <li><strong>November:</strong> 13°C – 28°C</li>
                <li><strong>December:</strong> 8°C – 22°C</li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold mt-4 mb-2">Nearest Airport</h3>
            <ul className="text-gray-700 text-base space-y-1 mb-4">
              <li>🛫 Dindayal International Airport (Agra)</li>
              <li>🛫 Indira Gandhi International Airport (Delhi)</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">Railway Stations</h3>
            <ul className="text-gray-700 text-base space-y-1 mb-4">
              <li>🚆 Vrindavan Road Railway Station</li>
              <li>🚆 Mathura Junction (nearest major)</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">Best Time & Climate</h3>
            <ul className="text-gray-700 text-base space-y-1 mb-6">
              <li><strong>Best Time to Visit:</strong> October – March</li>
              <li><strong>Climate:</strong> Semi-arid, warm</li>
            </ul>

            <div className="w-full h-[250px] bg-gray-200 rounded-lg overflow-hidden mb-4">
              <iframe
                className="w-full h-full"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56571.6!2d77.7!3d27.58!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39737117a7e6c!2sVrindavan%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000"
                allowFullScreen=""
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {showMore && (
          <div className="mt-4 text-xl text-gray-700 leading-loose pt-[25px] space-y-16">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Vrindavan's Temples: A Spiritual Odyssey</h2>
              <div>
                Every temple in Vrindavan has a story, a legend, and a unique form of worship. From the ancient Govind Dev Temple built with red sandstone gifted by Emperor Akbar, to the modern Prem Mandir that glows like a jewel at night, each shrine offers a different window into the infinite forms of devotion. The narrow lanes between temples are themselves a spiritual experience—lined with chanting, incense, and the ever-present sound of temple bells.
              </div>
            </div>

            <div className="space-y-10">
              <h3 className="text-3xl font-bold">The Mystery of Nidhivan</h3>
              <div>
                Nidhivan is undoubtedly the most enigmatic spot in Vrindavan. This dense grove of tulsi (basil) trees has trunks that appear to twist and intertwine in pairs—locals believe these are the gopis who transform to dance with Krishna each night and return to tree form at dawn. Every evening, pujaris place fresh water, paan, and a bed inside the main temple for Krishna. The next morning, devotees observe that the offerings have been touched, the bed disturbed. No CCTV camera has ever successfully recorded what happens after dark—they mysteriously malfunction. Even birds and monkeys, ubiquitous elsewhere in Vrindavan, avoid Nidhivan after sunset.
              </div>
            </div>

            <div className="bg-gray-100 p-8 rounded-xl">
              <h3 className="font-bold text-2xl pb-3">Vrindavan: A city where the divine is always present</h3>
              <div className="text-lg">Whether you're a pilgrim seeking spiritual awakening or a traveller drawn to ancient mysteries, Vrindavan delivers an experience that transcends the ordinary. Let the flute of Krishna guide your journey.</div>
              <div className="mt-4">
                <a href="/create-trip" className="btn-primary mr-6">Plan your Visit</a>
                <a href="#" className="btn-secondary">See Experiences</a>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={() => setShowMore(!showMore)}
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
          >
            {showMore ? "Read Less" : "Read More"}
          </button>
        </div>
      </motion.div>

      <div id="attractions"><Attractions /></div>
      <div id="folklore"><Folklores /></div>
      <div id="travel-diaries"><TravelDiaries /></div>
      <div id="itineraries"><Itineraries /></div>
      <div id="hidden-gems"><HiddenGemsSection city="vrindavan" /></div>
      <div id="temples-ghats"><TemplesGhats city="vrindavan" /></div>
      <div id="saptadeva"><SaptadevaSection /></div>
      <div id="nearby"><Destination excludeCity="Vrindavan" headingOverride="NEARBY" /></div>
      <Footer />
    </div>
  );
};

export default Vrindavan;