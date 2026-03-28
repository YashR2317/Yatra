import React from "react";
import { motion } from "framer-motion";

/**
 * Reusable wrapper for full-width themed sections.
 *
 * Props:
 *  - id:              section anchor id (e.g. "hidden-gems")
 *  - title:           section heading text
 *  - subtitle:        optional subtitle
 *  - backgroundImage: optional background image URL
 *  - dark:            if true, applies dark overlay (default: true)
 *  - children:        section content
 */
const SectionWrapper = ({
    id,
    title,
    subtitle,
    backgroundImage,
    dark = true,
    children,
}) => {
    return (
        <section id={id} className="relative w-full min-h-screen overflow-hidden">
            {/* Background */}
            {backgroundImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${backgroundImage}')` }}
                />
            )}
            {dark && <div className="absolute inset-0 bg-black/55" />}

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 py-24">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-wide">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="mt-4 text-lg text-white/60">{subtitle}</p>
                    )}
                </motion.div>

                {children}
            </div>
        </section>
    );
};

export default SectionWrapper;
