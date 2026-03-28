import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getPlacesByCategory } from "../data/places";

const SaptadevaSection = () => {
    const deities = getPlacesByCategory("sapt-devalaya");

    return (
        <section className="relative w-full overflow-hidden">
            {/* BACKGROUND */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/backgrounds/SAPT_DEVALAYA.png')" }}
            />
            <div className="absolute inset-0 bg-black/60" />

            {/* CONTENT */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 py-24">
                {/* HEADING */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-wide">
                        The Saptadeva
                    </h2>
                    <p className="mt-4 text-lg text-white/60 max-w-3xl mx-auto">
                        The seven principal deities installed by the Vrindavan Goswamis —
                        the spiritual heart of Vrindavan's devotional tradition
                    </p>
                </motion.div>

                {/* DEITY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {deities.map((deity, index) => (
                        <Link to={`/place/${deity.slug}`} key={deity.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.15 }}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                                className="group bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden
                                    border border-white/10 hover:border-amber-400/40
                                    transition-all duration-500 hover:shadow-[0_15px_50px_rgba(245,158,11,0.15)]
                                    cursor-pointer h-full"
                            >
                                {/* Image */}
                                {deity.heroImage ? (
                                    <div className="w-full h-48 overflow-hidden">
                                        <img
                                            src={deity.heroImage}
                                            alt={deity.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-48 bg-gradient-to-br from-amber-900/40 via-orange-800/30 to-amber-950/50 flex items-center justify-center px-4">
                                        <span className="text-lg font-bold text-white/15 tracking-widest uppercase text-center">{deity.name}</span>
                                    </div>
                                )}

                                {/* Text */}
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors duration-300">
                                        {deity.name}
                                    </h3>
                                    <p className="mt-2 text-sm text-white/55 leading-relaxed line-clamp-2">
                                        {deity.tagline || (Array.isArray(deity.description) ? deity.description[0] : deity.description)}
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-sm text-amber-400/70 group-hover:text-amber-300 transition-colors">
                                        <span>Explore</span>
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SaptadevaSection;
