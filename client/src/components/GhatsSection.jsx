import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getPlacesByCityAndCategory } from "../data/places";

const GhatsSection = () => {
    const ghats = getPlacesByCityAndCategory("vrindavan", "ghat");

    if (ghats.length === 0) return null;

    return (
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-gray-950 via-blue-950 to-gray-950 py-24">
            {/* CONTENT */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16">
                {/* HEADING */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-wide">
                        Ghats of Vrindavan
                    </h2>
                    <p className="mt-4 text-lg text-blue-300/70 max-w-2xl mx-auto">
                        Riverside sanctuaries where the Yamuna meets devotion — each ghat holds a unique ritual and atmosphere
                    </p>
                </motion.div>

                {/* GHAT CARDS — image-based from places.json */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {ghats.map((ghat, index) => (
                        <Link to={`/place/${ghat.slug}`} key={ghat.id} state={{ from: "vrindavan-ghats" }}>
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.15 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group rounded-2xl overflow-hidden
                             border border-white/10 hover:border-blue-400/40
                             transition-all duration-500 hover:shadow-[0_15px_50px_rgba(96,165,250,0.1)]"
                            >
                                {/* Image */}
                                {ghat.heroImage ? (
                                    <div className="w-full h-48 overflow-hidden">
                                        <img src={ghat.heroImage} alt={ghat.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                ) : (
                                    <div className="w-full h-48 bg-gradient-to-br from-blue-900/40 via-cyan-800/30 to-blue-950/50 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-white/15 tracking-widest uppercase">{ghat.name}</span>
                                    </div>
                                )}

                                {/* Info */}
                                <div className="bg-white/5 backdrop-blur-md p-6">
                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
                                        {ghat.name}
                                    </h3>
                                    {ghat.tagline && (
                                        <p className="mt-2 text-sm text-white/55 leading-relaxed line-clamp-2">
                                            {ghat.tagline}
                                        </p>
                                    )}
                                    <div className="mt-4 flex items-center gap-2 text-sm text-blue-400/70 group-hover:text-blue-300 transition-colors">
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

export default GhatsSection;
