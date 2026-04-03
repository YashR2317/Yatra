import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import Destination from "../../../components/Destination";

import { getPlacesByCityAndCategory } from "../../../data/places";
import folklore from "../../../data/folklore";

/* ── Attractions sub-component ────────────────────────────── */
const Attractions = () => {
    const navigate = useNavigate();
    const data = getPlacesByCityAndCategory("govardhan", "attraction");
    return (
        <section className="relative w-full overflow-hidden">
            <img src="/backgrounds/ATTRACTIONS.png" alt="Govardhan Attractions" className="w-full h-auto object-contain" />
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
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
                                <h3 className="absolute bottom-6 left-6 text-white text-xl font-semibold tracking-wide drop-shadow-xl z-20">{item.name}</h3>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </motion.div>
        </section>
    );
};

/* ── Folklores sub-component ────────────────────────────── */
const Folklores = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const folkloresData = folklore.govardhan || [];
    const total = folkloresData.length;

    if (total === 0) return null;

    return (
        <section
            className="relative w-full min-h-screen overflow-hidden bg-cover bg-top bg-no-repeat"
            style={{ backgroundImage: "url('/backgrounds/FASCINATING_FOLKLORES.png')" }}
        >
            {/* SLIDE COUNTER */}
            <div className="absolute bottom-2 left-5 z-30 text-white/80 tracking-widest">
                <span className="text-2xl font-medium">{String(activeIndex + 1).padStart(2, "0")}</span>
                <span className="mx-2 opacity-60">/</span>
                <span className="opacity-60">{String(total).padStart(2, "0")}</span>
                <div className="mt-2 w-10 h-[1px] bg-white/40" />
            </div>

            {/* SLIDER */}
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
                            {/* LEFT — TEXT */}
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

                            {/* RIGHT — IMAGE */}
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

/* ── Animation Variants ───────────────────────────────────── */
const childVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

/* ── Main Govardhan Component ─────────────────────────────── */
const Govardhan = () => {
    const [showMore, setShowMore] = useState(false);

    return (
        <div className="w-full min-h-screen overflow-x-hidden">
            <SEOHead
                title="Govardhan — Where Faith Moves Mountains"
                description="Discover Govardhan Hill, the sacred hill Lord Krishna lifted on his finger. Walk the 21 km Parikrama, visit Radha Kund and Manasi Ganga."
                image="/destinations/govardhan.jpg"
            />
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
                    loop={true}
                    autoplay={{ delay: 2500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    navigation={true}
                    effect="fade"
                    modules={[Autoplay, Pagination, Navigation, EffectFade]}
                    className="w-full h-full"
                >
                    {["/destinations/govardhan.jpg"].map((src, i) => (
                        <SwiperSlide key={i} className="relative">
                            <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/40 to-black/70 z-20"></div>
                            <img src={src} alt={`Govardhan ${i + 1}`} className="w-full h-full object-cover" />
                        </SwiperSlide>
                    ))}
                </Swiper>
                <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-center text-white z-30">
                    <h1 className="text-5xl font-extrabold drop-shadow-lg tracking-wide">Welcome to Govardhan</h1>
                    <p className="text-lg mt-2 text-gray-200 drop-shadow-md">The sacred hill that Krishna held aloft</p>
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
                    Govardhan: Where Faith Moves Mountains
                </motion.h1>
                <div className="flex flex-col lg:flex-row gap-10 items-start">
                    {/* LEFT SECTION */}
                    <motion.div variants={childVariants} className="w-full lg:w-[60%] text-gray-700 text-lg sm:text-xl leading-relaxed space-y-6">
                        <div className="text-xl leading-relaxed text-gray-700 pr-10 pt-10">
                            Govardhan is one of the most sacred places in all of Braj, centred around Govardhan Hill — also known as Giriraj — which devotees revere as a living form of Lord Krishna himself. According to the Bhagavata Purana, the young Krishna lifted this entire hill on his little finger to shelter the people of Braj from the devastating rains unleashed by the angry god Indra. This act of divine protection is the cornerstone of Govardhan's spiritual identity.
                            <div className="m-5"></div>
                            The 21-kilometre Govardhan Parikrama — a barefoot circumambulation of the hill — is one of the most powerful pilgrimage walks in India. The path passes through villages, sacred groves, ancient temples, and alongside the hill itself, which rises gently like a sleeping guardian. Pilgrims touch the rocks with reverence, believing each stone to be a manifestation of the divine.
                            <div className="m-5"></div>
                            At the heart of Govardhan lies Manasi Ganga, a sacred lake believed to have been created by Krishna's mind, and the twin kunds of Radha Kund and Shyam Kund — considered the holiest bathing spots in all of Braj. The town is dotted with ancient temples, each marking a different episode from Krishna's pastimes: from the playful Daan Ghati to the majestic Mukharavind.
                            <div className="m-5"></div>
                            Every year after Diwali, the spectacular Annakut festival transforms Govardhan into a sea of colour and devotion, as a mountain of 56 food items is offered to Giriraj. For the spiritual traveller, Govardhan is not just a destination — it is a transformative experience.
                        </div>
                    </motion.div>

                    {/* RIGHT SECTION — Quick Facts */}
                    <div className="lg:w-[40%] w-full bg-gray-100 p-5 rounded-xl shadow-lg self-start mt-8">
                        <h2 className="text-2xl font-semibold mb-5">Quick Facts</h2>

                        <div className="grid grid-cols-2 gap-x-4 mb-6 text-gray-700 text-base">
                            <ul className="space-y-1">
                                <li><strong>January:</strong> 7°C – 20°C</li>
                                <li><strong>February:</strong> 10°C – 25°C</li>
                                <li><strong>March:</strong> 15°C – 32°C</li>
                                <li><strong>April:</strong> 22°C – 38°C</li>
                                <li><strong>May:</strong> 27°C – 44°C</li>
                                <li><strong>June:</strong> 29°C – 42°C</li>
                            </ul>
                            <ul className="space-y-1">
                                <li><strong>July:</strong> 27°C – 36°C</li>
                                <li><strong>August:</strong> 26°C – 34°C</li>
                                <li><strong>September:</strong> 24°C – 33°C</li>
                                <li><strong>October:</strong> 19°C – 32°C</li>
                                <li><strong>November:</strong> 13°C – 28°C</li>
                                <li><strong>December:</strong> 8°C – 22°C</li>
                            </ul>
                        </div>

                        <h3 className="text-lg font-semibold mt-4 mb-2">Getting Here</h3>
                        <ul className="text-gray-700 text-base space-y-1 mb-4">
                            <li>🚗 25 km from Mathura (45 min drive)</li>
                            <li>🚗 25 km from Vrindavan (40 min drive)</li>
                            <li>🚆 Nearest Station: Mathura Junction</li>
                        </ul>

                        <h3 className="text-lg font-semibold mt-4 mb-2">Best Time & Climate</h3>
                        <ul className="text-gray-700 text-base space-y-1 mb-6">
                            <li><strong>Best Time:</strong> October – March</li>
                            <li><strong>Special:</strong> Annakut Festival (post-Diwali)</li>
                            <li><strong>Climate:</strong> Semi-arid, hot summers</li>
                        </ul>

                        {/* Google Map Embed */}
                        <div className="w-full h-[250px] bg-gray-200 rounded-lg overflow-hidden mb-4">
                            <iframe
                                className="w-full h-full"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14200.0!2d77.4627!3d27.4981!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3973a4d2a29b1e99%3A0x6f33e79d0f92f0a5!2sGovardhan!5e0!3m2!1sen!2sin!4v1700000000000"
                                allowFullScreen=""
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>
                </div>

                {showMore && (
                    <div className="mt-4 text-xl text-gray-700 leading-loose pt-[25px] space-y-16">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold">The Sacred Parikrama</h2>
                            <div>
                                The 21 km Govardhan Parikrama is the spiritual heart of any visit. Starting from Manasi Ganga, the trail passes through Radha Kund, Shyam Kund, Kusum Sarovar, and dozens of smaller shrines. Many pilgrims walk barefoot as an act of devotion. The path is flat and well-worn by centuries of faithful feet, passing through villages, fields, and along the base of the hill itself. Along the way, sadhus sit under trees, chai stalls serve sweet tea, and the air carries the sound of kirtans from nearby ashrams.
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold">Annakut: The Mountain of Food</h2>
                            <div>
                                After Diwali, Govardhan transforms during the Annakut festival. Devotees prepare a mountain of 56 food items (Chhappan Bhog) and offer them to Giriraj. Temples overflow with colour, fragrance, and sound. The festival celebrates abundance, gratitude, and divine protection — commemorating the moment when Krishna lifted the hill to shelter his people. It is one of the most spectacular religious celebrations in all of India.
                            </div>
                        </div>

                        <div className="bg-gray-100 p-8 rounded-xl">
                            <h3 className="font-bold text-2xl pb-3">Govardhan: A place that changes you</h3>
                            <div className="text-lg">
                                Walk the parikrama, touch the sacred rocks, bathe at the twin kunds, and taste the temple prasad. Govardhan doesn't just show you divinity — it makes you feel it underfoot, in the breeze, and in the silence between prayers.
                            </div>
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

            {/* Sections */}
            <div id="attractions"><Attractions /></div>
            <div id="folklore"><Folklores /></div>
            <div id="travel-diaries"><TravelDiaries /></div>
            <div id="itineraries"><Itineraries /></div>
            <div id="temples-ghats"><TemplesGhats city="govardhan" /></div>
            <div id="hidden-gems"><HiddenGemsSection city="govardhan" /></div>
            <div id="nearby"><Destination excludeCity="Govardhan" headingOverride="NEARBY" /></div>
            <Footer />
        </div>
    );
};

export default Govardhan;
