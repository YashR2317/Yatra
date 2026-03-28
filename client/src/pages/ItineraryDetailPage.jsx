import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import itineraries from "../data/itineraryDetails";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const slotIcons = {
    morning: "🌅",
    afternoon: "☀️",
    evening: "🌙",
};

const ItineraryDetailPage = () => {
    const { citySlug } = useParams();
    const navigate = useNavigate();
    const data = itineraries[citySlug];

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Itinerary Not Found</h1>
                    <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>We don't have an itinerary for "{citySlug}" yet.</p>
                    <button
                        onClick={() => navigate("/home#itineraries")}
                        className="btn-secondary"
                    >
                        ← Back to Itineraries
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
            <Navbar />

            {/* HERO */}
            <section className="relative w-full h-[70vh] overflow-hidden">
                <img
                    src={data.heroImage}
                    alt={data.city}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                <div className="absolute bottom-16 left-0 w-full z-10 text-center text-white">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-wide"
                    >
                        {data.city}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-3 text-xl text-white/70 italic"
                    >
                        {data.tagline}
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-2 text-sm tracking-widest uppercase text-amber-400/80"
                    >
                        3-Day Itinerary
                    </motion.p>
                </div>
            </section>

            {/* BREADCRUMB */}
            <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-8 pb-2">
                <nav className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <Link to="/home" className="hover:underline">Home</Link>
                    <span className="mx-2">›</span>
                    <Link to="/home#itineraries" className="hover:underline">Itineraries</Link>
                    <span className="mx-2">›</span>
                    <span style={{ color: 'var(--color-saffron)' }}>{data.city}</span>
                </nav>
            </div>

            {/* BACK BUTTON (top) */}
            <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-4 pb-2">
                <button onClick={() => navigate("/home#itineraries")} className="btn-secondary text-sm">
                    ← Back to Itineraries
                </button>
            </div>

            {/* DAYS */}
            <section className="max-w-5xl mx-auto px-6 lg:px-10 py-16">
                {data.days.map((day, dayIdx) => (
                    <motion.div
                        key={day.day}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={{ duration: 0.6, delay: dayIdx * 0.1 }}
                        className="mb-16"
                    >
                        {/* Day header */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-saffron)' }}>
                                <span className="text-white font-extrabold text-lg">{day.day}</span>
                            </div>
                            <div>
                                <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--color-saffron)' }}>Day {day.day}</p>
                                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{day.title}</h2>
                            </div>
                        </div>

                        {/* Slots */}
                        <div className="space-y-5 ml-7 pl-10" style={{ borderLeft: '2px solid var(--color-border)' }}>
                            {Object.entries(day.slots).map(([slot, content]) => (
                                <div key={slot} className="relative">
                                    {/* Dot on timeline */}
                                    <div className="absolute -left-[46px] top-1 w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-saffron)' }} />

                                    <div className="rounded-xl p-6 transition-all duration-300" style={{
                                        backgroundColor: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                    }}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xl">{slotIcons[slot]}</span>
                                            <span className="text-sm font-bold tracking-wider uppercase" style={{ color: 'var(--color-saffron)' }}>
                                                {slot}
                                            </span>
                                        </div>
                                        <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* PRACTICAL TIPS */}
            <section className="py-20" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                <div className="max-w-5xl mx-auto px-6 lg:px-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold mb-10"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        Practical Tips
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { label: "Best Season", value: data.tips.bestSeason, icon: "📅" },
                            { label: "Transport", value: data.tips.transport, icon: "🚗" },
                            { label: "Dress Code", value: data.tips.dressCode, icon: "👗" },
                            { label: "What to Carry", value: data.tips.whatToCarry, icon: "🎒" },
                        ].map((tip) => (
                            <motion.div
                                key={tip.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="rounded-xl p-6"
                                style={{
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">{tip.icon}</span>
                                    <h3 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{tip.label}</h3>
                                </div>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{tip.value}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BACK BUTTON (bottom) */}
            <div className="py-12 text-center" style={{ backgroundColor: 'var(--color-bg)' }}>
                <button
                    onClick={() => navigate("/home#itineraries")}
                    className="btn-secondary"
                >
                    ← Back to Itineraries
                </button>
            </div>

            <Footer />
        </div>
    );
};

export default ItineraryDetailPage;
