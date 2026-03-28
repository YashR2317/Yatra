import React from "react";
import { motion } from "framer-motion";

const AttractionTips = ({ travelTips }) => (
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
                {travelTips.map((tip, i) => (
                    <div key={i} className="flex gap-4 items-start">
                        <span className="text-amber-400 text-xl mt-1 shrink-0">✦</span>
                        <p className="text-gray-200 leading-relaxed">{tip}</p>
                    </div>
                ))}
            </div>
        </div>
    </motion.section>
);

export default AttractionTips;
