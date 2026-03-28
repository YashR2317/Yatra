import React from "react";
import { motion } from "framer-motion";

const AttractionHero = ({ name, city, state, tagline, heroImage }) => (
    <div className="relative w-full h-[85vh] overflow-hidden">
        <img src={heroImage} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10" />
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute bottom-16 left-10 md:left-20 z-10 text-white"
        >
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300 mb-3 font-medium">
                {city}, {state}
            </p>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-wide drop-shadow-lg">{name}</h1>
            <p className="text-lg md:text-xl mt-3 text-gray-200 max-w-xl drop-shadow-md">{tagline}</p>
        </motion.div>
    </div>
);

export default AttractionHero;
