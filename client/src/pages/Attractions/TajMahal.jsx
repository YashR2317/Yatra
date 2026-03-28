import React from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import StickyCreateTripButton from "../../components/StickyCreateTripButton";
import Footer from "../../components/Footer";

const TajMahal = () => {
    return (
        <div className="w-full min-h-screen overflow-x-hidden">
            <Navbar />
            <StickyCreateTripButton />

            {/* HERO BANNER */}
            <div className="relative w-full h-[85vh] overflow-hidden">
                <img
                    src="/agra/attractions/Taj-Mahal.jpeg"
                    alt="Taj Mahal"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="absolute bottom-16 left-10 md:left-20 z-10 text-white"
                >
                    <p className="text-sm uppercase tracking-[0.3em] text-amber-300 mb-3 font-medium">Agra, Uttar Pradesh</p>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-wide drop-shadow-lg">Taj Mahal</h1>
                    <p className="text-lg md:text-xl mt-3 text-gray-200 max-w-xl drop-shadow-md">
                        The Crown of India — A monument to eternal love
                    </p>
                </motion.div>
            </div>

            {/* CONTENT */}
            <div className="max-w-6xl mx-auto px-8 lg:px-16 py-20">

                {/* DESCRIPTION */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-20"
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-8">About the Taj Mahal</h2>
                    <div className="text-xl leading-relaxed text-gray-700 space-y-6">
                        <p>
                            The Taj Mahal is not merely a monument—it's an immersive experience that stays etched in your memory forever. Commissioned in 1632 by Mughal Emperor Shah Jahan as a mausoleum for his beloved wife Mumtaz Mahal, this UNESCO World Heritage Site is widely considered the finest example of Mughal architecture, combining elements of Indian, Persian, and Islamic design.
                        </p>
                        <p>
                            Built over 22 years by more than 20,000 artisans, the Taj Mahal is a masterpiece of white marble that changes colour with the light. At dawn it glows soft pink, at noon it's brilliant white, and at sunset it takes on a golden hue. On full-moon nights, it radiates an ethereal silver glow. The intricate inlay work features 28 types of precious and semi-precious stones, including lapis lazuli, jade, turquoise, and mother of pearl—all sourced from across Asia.
                        </p>
                        <p>
                            The perfect symmetry of the Taj Mahal extends from its four minarets to the geometric patterns in its gardens, designed as a representation of paradise on Earth. The central dome rises 73 metres and is surrounded by four smaller domed chambers. Inside, the cenotaphs of Shah Jahan and Mumtaz Mahal lie side by side, enclosed within an octagonal marble screen adorned with pietra dura (stone inlay) of extraordinary detail.
                        </p>
                    </div>
                </motion.section>

                {/* HIGHLIGHTS */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-20"
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-8">Highlights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { icon: "🏛️", title: "UNESCO World Heritage Site", desc: "Designated in 1983, it's one of the Seven Wonders of the Modern World." },
                            { icon: "💎", title: "Pietra Dura Masterwork", desc: "28 types of precious stones inlaid into white Makrana marble by master craftsmen." },
                            { icon: "🌅", title: "Colour-Changing Marvel", desc: "The marble changes hue with daylight—pink at dawn, white at noon, golden at sunset." },
                            { icon: "🌙", title: "Full Moon Viewing", desc: "Open on full-moon nights for a magical silver-lit experience (limited tickets)." },
                            { icon: "🕌", title: "Perfect Symmetry", desc: "Four identical facades, four minarets, and a reflecting pool create flawless symmetry." },
                            { icon: "🌿", title: "Charbagh Gardens", desc: "The Mughal-style gardens represent paradise with divided water channels and raised pathways." },
                        ].map((item, i) => (
                            <div key={i} className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-3xl mb-3">{item.icon}</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* VISITING INFORMATION */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-20"
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-8">Visiting Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-amber-50 rounded-xl p-8 border border-amber-100">
                            <h3 className="text-xl font-bold text-amber-900 mb-4">🕐 Timings</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li><strong>Open:</strong> Sunrise to Sunset (approx. 6:00 AM – 6:30 PM)</li>
                                <li><strong>Closed:</strong> Every Friday</li>
                                <li><strong>Night Viewing:</strong> Available 5 nights a month (Full moon ± 2 days), 8:30 PM – 12:30 AM</li>
                            </ul>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
                            <h3 className="text-xl font-bold text-blue-900 mb-4">💰 Entry Fees</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li><strong>Indian Citizens:</strong> ₹50</li>
                                <li><strong>Foreign Tourists:</strong> ₹1,100</li>
                                <li><strong>SAARC/BIMSTEC:</strong> ₹540</li>
                                <li><strong>Children (below 15):</strong> Free</li>
                            </ul>
                        </div>
                        <div className="bg-green-50 rounded-xl p-8 border border-green-100">
                            <h3 className="text-xl font-bold text-green-900 mb-4">📍 Entry Gates</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li><strong>East Gate:</strong> Less crowded, near Shilpgram complex</li>
                                <li><strong>West Gate:</strong> Main gate, closest to parking</li>
                                <li><strong>South Gate:</strong> Open irregularly, check availability</li>
                            </ul>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-8 border border-purple-100">
                            <h3 className="text-xl font-bold text-purple-900 mb-4">📸 Photography</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li><strong>Still Photography:</strong> Allowed (no tripods)</li>
                                <li><strong>Inside Mausoleum:</strong> Photography not permitted</li>
                                <li><strong>Drones:</strong> Strictly prohibited</li>
                            </ul>
                        </div>
                    </div>
                </motion.section>

                {/* TRAVEL TIPS */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-20"
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-8">Travel Tips</h2>
                    <div className="bg-gray-900 text-white rounded-2xl p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                "Arrive at sunrise for the most magical experience and smaller crowds.",
                                "Wear shoe covers or carry socks — you must remove footwear inside the mausoleum area.",
                                "Book tickets online via the ASI website to skip long queues.",
                                "October to March offers the best weather for a comfortable visit.",
                                "Hire an official ASI guide at the entry gate for authentic historical commentary.",
                                "Visit Mehtab Bagh across the Yamuna for a stunning sunset view of the Taj.",
                                "Keep your belongings minimal — large bags, food, and tripods are not allowed inside.",
                                "Combine your visit with nearby Agra Fort (just 2.5 km away) for a full Mughal experience.",
                            ].map((tip, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <span className="text-amber-400 text-xl mt-1 shrink-0">✦</span>
                                    <p className="text-gray-200 leading-relaxed">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* MAP */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-8">Location</h2>
                    <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-lg">
                        <iframe
                            className="w-full h-full"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14261.685403088214!2d78.008074!3d27.176670!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3974771e5aaff179%3A0xcee4d44fe7bd990!2sTaj%20Mahal!5e0!3m2!1sen!2sin!4v1700000000000"
                            allowFullScreen=""
                            loading="lazy"
                        />
                    </div>
                </motion.section>
            </div>

            <Footer />
        </div>
    );
};

export default TajMahal;
