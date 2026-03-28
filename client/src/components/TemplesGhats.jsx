import React from "react";
import { motion } from "framer-motion";
import { getPlacesByCityAndCategory } from "../data/places";
import PlaceCard from "./cards/PlaceCard";

const TemplesGhats = ({ city }) => {
    const data = getPlacesByCityAndCategory(city, "temple");

    if (data.length === 0) return null;

    const cityName = city.charAt(0).toUpperCase() + city.slice(1);

    return (
        <section className="relative w-full min-h-screen overflow-hidden">
            {/* BACKGROUND */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/backgrounds/TEMPLES.png')" }}
            />
            <div className="absolute inset-0 bg-black/55" />

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
                        Temples & Ghats
                    </h2>
                    <p className="mt-4 text-lg text-white/60">
                        Sacred shrines and riverside steps of {cityName}
                    </p>
                </motion.div>

                {/* CARDS — now uses PlaceCard + central dataset */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {data.map((place, index) => (
                        <PlaceCard
                            key={place.id}
                            place={place}
                            from={`${city}-temples-ghats`}
                            index={index}
                            variant="card"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TemplesGhats;
