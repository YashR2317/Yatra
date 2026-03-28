import React from "react";
import { motion } from "framer-motion";

const AttractionHighlights = ({ highlights }) => (
    <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-20"
    >
        <h2 className="text-4xl font-bold text-gray-900 mb-8">Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {highlights.map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                </div>
            ))}
        </div>
    </motion.section>
);

export default AttractionHighlights;
