import React from "react";
import { motion } from "framer-motion";

const AttractionMap = ({ name, mapQuery }) => (
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
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${mapQuery}&zoom=15`}
                allowFullScreen=""
                loading="lazy"
                title={`Map of ${name}`}
            />
        </div>
    </motion.section>
);

export default AttractionMap;
