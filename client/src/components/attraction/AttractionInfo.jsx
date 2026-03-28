import React from "react";
import { motion } from "framer-motion";

const AttractionInfo = ({ name, description }) => (
    <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-20"
    >
        <h2 className="text-4xl font-bold text-gray-900 mb-8">About {name}</h2>
        <div className="text-xl leading-relaxed text-gray-700 space-y-6">
            {description.map((para, i) => (
                <p key={i}>{para}</p>
            ))}
        </div>
    </motion.section>
);

export default AttractionInfo;
