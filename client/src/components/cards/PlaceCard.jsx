import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Reusable place card used across Attractions, Hidden Gems, Temples sections.
 *
 * Props:
 *  - place:  full place object from places.json
 *  - from:   navigation context string, e.g. "agra-attractions"
 *  - index:  for staggered animation delay
 *  - variant: "card" (default) | "slide" — controls layout shape
 */
const PlaceCard = ({ place, from, index = 0, variant = "card" }) => {
    const cityLabel = place.city
        ? place.city.charAt(0).toUpperCase() + place.city.slice(1)
        : "";

    // Description may be a string or array of paragraphs
    const descText = Array.isArray(place.description)
        ? place.description[0]
        : (place.description || "");

    const heroImg = place.heroImage || place.image;

    if (variant === "slide") {
        // Full-height slide for Swiper-based sections
        return (
            <Link to={`/place/${place.slug}`} state={{ from }}>
                <div className="relative cursor-pointer rounded-2xl overflow-hidden shadow-2xl group"
                    style={{ height: "85vh", maxHeight: "800px" }}>
                    {heroImg ? (
                        <img src={heroImg} alt={place.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-900/40 via-orange-800/30 to-amber-950/50 flex items-center justify-center px-6">
                            <span className="text-3xl font-bold text-white/15 tracking-widest uppercase text-center">{place.name}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                    <h3 className="absolute bottom-6 left-6 text-white text-xl font-semibold tracking-wide drop-shadow-xl">
                        {place.name}
                    </h3>
                </div>
            </Link>
        );
    }

    // Default card variant — used in grids
    return (
        <Link to={`/place/${place.slug}`} state={{ from }}>
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white/10 backdrop-blur-md rounded-2xl p-7
          border border-white/10 hover:border-amber-400/40
          transition-all duration-500 hover:shadow-[0_15px_50px_rgba(245,158,11,0.12)]
          cursor-pointer h-full"
            >
                {/* Image thumbnail */}
                {heroImg ? (
                    <div className="w-full h-40 rounded-xl overflow-hidden mb-5">
                        <img src={heroImg} alt={place.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                ) : (
                    <div className="w-full h-40 rounded-xl bg-gradient-to-br from-amber-900/40 via-orange-800/30 to-amber-950/50 flex items-center justify-center mb-5 px-4">
                        <span className="text-lg font-bold text-white/15 tracking-widest uppercase text-center">{place.name}</span>
                    </div>
                )}

                <h3 className="text-xl font-semibold text-white group-hover:text-amber-300 transition-colors duration-300">
                    {place.name}
                </h3>
                <p className="mt-3 text-sm text-white/60 leading-relaxed line-clamp-3">
                    {descText}
                </p>

                {cityLabel && (
                    <p className="text-xs text-amber-400/80 mt-3 tracking-wide uppercase">
                        {cityLabel}
                    </p>
                )}

                <div className="mt-5 flex items-center gap-2 text-sm text-amber-400/70 group-hover:text-amber-300 transition-colors">
                    <span>Explore</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
            </motion.div>
        </Link>
    );
};

export default PlaceCard;
