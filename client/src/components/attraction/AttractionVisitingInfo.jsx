import React from "react";
import { motion } from "framer-motion";

const colors = [
    { bg: "bg-amber-50", border: "border-amber-100", title: "text-amber-900" },
    { bg: "bg-blue-50", border: "border-blue-100", title: "text-blue-900" },
    { bg: "bg-green-50", border: "border-green-100", title: "text-green-900" },
];

const labels = ["🕐 Timings", "💰 Entry Fee", "📌 Best Season"];
const keys = ["timings", "entryFee", "bestSeason"];

const AttractionVisitingInfo = ({ visitingInfo }) => {
    if (!visitingInfo) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20"
        >
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Visiting Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {keys.map((key, i) => {
                    const raw = visitingInfo[key];
                    if (!raw) return null;
                    const values = Array.isArray(raw) ? raw : [raw];

                    return (
                        <div key={i} className={`${colors[i].bg} rounded-xl p-8 border ${colors[i].border}`}>
                            <h3 className={`text-xl font-bold ${colors[i].title} mb-4`}>{labels[i]}</h3>
                            <ul className="space-y-2 text-gray-700">
                                {values.map((item, j) => (
                                    <li key={j}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </motion.section>
    );
};

export default AttractionVisitingInfo;
