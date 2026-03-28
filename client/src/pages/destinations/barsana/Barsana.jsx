import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
import Destination from "../../../components/Destination";

import { getPlacesByCityAndCategory } from "../../../data/places";
import folklore from "../../../data/folklore";

/* ── Attractions sub-component ────────────────────────────── */
const Attractions = () => {
    const navigate = useNavigate();
    const data = getPlacesByCityAndCategory("barsana", "attraction");
    return (
        <section className="relative w-full overflow-hidden">
            <img src="/backgrounds/ATTRACTIONS.png" alt="Barsana Attractions" className="w-full h-auto object-contain" />
            <div className="absolute bottom-0 left-0 w-full h-[50%] bg-linear-to-t from-black/90 via-black/60 to-transparent z-10 pointer-events-none" />
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
                        1024: { slidesPerView: 3 },
                    }}
                >
                    {data.map((item) => (
                        <SwiperSlide key={item.id}>
                            <div
                                onClick={() => navigate(`/place/${item.slug}`)}
                                className="relative cursor-pointer rounded-2xl overflow-hidden shadow-2xl group"
                                style={{ height: "85vh", maxHeight: "800px" }}
                            >
                                <img src={item.heroImage} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />
                                <h3 className="absolute bottom-6 left-6 text-white text-xl font-semibold tracking-wide drop-shadow-xl">{item.name}</h3>
                            </div>
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
    const folkloresData = folklore.barsana;
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
const Barsana = () => {
    const [showMore, setShowMore] = useState(false);

    const sliderImages = [
        "/destinations/barsana.jpeg",
        "/landing/hero3.png",
        "/destinations/barsana.jpeg",
        "/landing/hero3.png",
        "/destinations/barsana.jpeg",
    ];

    return (
        <div className="w-full min-h-screen overflow-x-hidden">
            <Navbar navLinks={[
                { label: "Attractions", href: "#attractions" },
                { label: "Folklore", href: "#folklore" },
                { label: "Itineraries", href: "#itineraries" },
                { label: "Travel Diaries", href: "#travel-diaries" },
                { label: "Temples & Ghats", href: "#temples-ghats" },
                { label: "Hidden Gems", href: "#hidden-gems" },
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
                            <img src={src} alt={`Barsana Slide ${i + 1}`} className="w-full h-full object-cover" />
                        </SwiperSlide>
                    ))}
                </Swiper>
                <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-center text-white z-30">
                    <h1 className="text-5xl font-extrabold drop-shadow-lg tracking-wide">Welcome to Barsana</h1>
                    <p className="text-lg mt-2 text-gray-200 drop-shadow-md">The Sacred Abode of Radha Rani</p>
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
                    Barsana: Radha's Eternal Kingdom
                </motion.h1>
                <div className="flex flex-col lg:flex-row gap-10 items-start">
                    {/* LEFT — DESCRIPTION */}
                    <motion.div variants={childVariants} className="w-full lg:w-[60%] text-gray-700 text-lg sm:text-xl leading-relaxed space-y-6">
                        <div className="text-xl leading-relaxed text-gray-700 pr-10 pt-10">
                            Barsana is the legendary hometown of Radha, the eternal consort of Lord Krishna. Nestled among four sacred hills in the Braj region of Uttar Pradesh, this small town pulses with centuries of devotion, colour, and celebration. It is one of the most revered pilgrimage sites in India, where the love story of Radha and Krishna is not just remembered—it is relived every single day.
                            <div className="m-5" />
                            The town is crowned by the magnificent Radha Rani Temple, perched atop the Bhanugarh hill. This is one of the very few temples in India dedicated exclusively to Radha. The temple's red sandstone architecture and the panoramic views it offers of the Braj countryside make it a breathtaking destination. Climbing the temple steps is itself considered an act of devotion.
                            <div className="m-5" />
                            Barsana is globally famous for its spectacular Lathmar Holi celebration, held a week before the main Holi festival. In this unique tradition, women from Barsana chase and playfully beat men from the neighbouring village of Nandgaon with wooden sticks, recreating the legend of Krishna visiting Radha's village to tease her and her friends. The event draws thousands of visitors and photographers from around the world.
                            <div className="m-5" />
                            Visit between October and March for pleasant weather, or time your trip with Holi (February-March) for the most unforgettable experience.
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

                        <h3 className="text-lg font-semibold mt-4 mb-2">Railway Station</h3>
                        <ul className="text-gray-700 text-base space-y-1 mb-4">
                            <li>🚆 Mathura Junction (nearest major)</li>
                        </ul>

                        <h3 className="text-lg font-semibold mt-4 mb-2">Best Time & Climate</h3>
                        <ul className="text-gray-700 text-base space-y-1 mb-6">
                            <li><strong>Best Time to Visit:</strong> October – March (or during Holi)</li>
                            <li><strong>Climate:</strong> Semi-arid, warm</li>
                        </ul>

                        <div className="w-full h-[250px] bg-gray-200 rounded-lg overflow-hidden mb-4">
                            <iframe
                                className="w-full h-full"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14144.7!2d77.38!3d27.65!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397376!2sBarsana%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000"
                                allowFullScreen=""
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>

                {showMore && (
                    <div className="mt-4 text-xl text-gray-700 leading-loose pt-[25px] space-y-16">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold">The Sacred Hills of Barsana</h2>
                            <div>
                                Barsana is surrounded by four hills, each believed to represent a head of Lord Brahma. According to ancient scriptures, Brahma took the form of these hills so he could eternally witness the divine love pastimes of Radha and Krishna. The main hill, Bhanugarh, is named after Radha's father, King Vrishabhanu. As you climb to the Radha Rani Temple at its summit, every step brings you closer to the divine atmosphere that devotees say has remained unchanged for thousands of years.
                            </div>
                        </div>

                        <div className="space-y-10">
                            <h3 className="text-3xl font-bold">Lathmar Holi: The World's Most Unique Celebration</h3>
                            <div>
                                Nothing in the world quite compares to Barsana's Lathmar Holi. Days before the rest of India celebrates Holi, this ancient tradition brings thousands to the narrow lanes of Barsana. Men from Nandgaon (Krishna's village) arrive singing provocative folk songs, and the women of Barsana respond by chasing them with lathis (wooden sticks). The men defend themselves with shields, and the entire town erupts in a shower of colours, music, drums, and joyful chaos. This isn't merely a festival—it's a living re-enactment of the divine love between Radha and Krishna that has been performed for centuries.
                            </div>
                        </div>

                        <div className="bg-gray-100 p-8 rounded-xl">
                            <h3 className="font-bold text-2xl pb-3">Barsana: Where love is the only religion</h3>
                            <div className="text-lg">Barsana is not just a destination—it's an emotion. The devotion of its people, the beauty of its hills, and the colours of its festivals create an experience that stays with you long after you've left.</div>
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
            <div id="hidden-gems"><HiddenGemsSection city="barsana" /></div>
            <div id="temples-ghats"><TemplesGhats city="barsana" /></div>
            <div id="nearby"><Destination excludeCity="Barsana" headingOverride="NEARBY" /></div>
            <Footer />
        </div>
    );
};

export default Barsana;
