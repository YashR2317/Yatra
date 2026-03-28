import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import travelDiaryDetails from "../data/travelDiaryDetails";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const TravelDiaryDetailPage = () => {
    const { diarySlug } = useParams();
    const navigate = useNavigate();
    const diary = travelDiaryDetails.find((d) => d.slug === diarySlug);

    if (!diary) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Diary Not Found</h1>
                    <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                        We couldn't find a travel diary with the slug "{diarySlug}".
                    </p>
                    <button onClick={() => navigate("/home")} className="btn-secondary">
                        ← Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const relatedDiaries = travelDiaryDetails.filter((d) =>
        diary.relatedDiarySlugs.includes(d.slug)
    );

    return (
        <div className="w-full min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
            <Navbar />

            {/* HERO */}
            <section className="relative w-full h-[75vh] overflow-hidden">
                <img
                    src={diary.heroImage}
                    alt={diary.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
                <div className="absolute bottom-16 left-0 w-full z-10 px-8 lg:px-24">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-6xl font-extrabold text-white max-w-4xl leading-tight"
                    >
                        {diary.title}
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-4 flex items-center gap-4"
                    >
                        <span className="text-amber-400 font-medium">{diary.author}</span>
                        <span className="text-white/40">•</span>
                        <span className="text-white/60 text-sm">{diary.date}</span>
                        <span className="text-white/40">•</span>
                        <span className="text-white/60 text-sm">{diary.city}</span>
                    </motion.div>
                </div>
            </section>

            {/* BREADCRUMB */}
            <div className="max-w-4xl mx-auto px-8 lg:px-10 pt-8 pb-2">
                <nav className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <Link to="/home" className="hover:underline">Home</Link>
                    <span className="mx-2">›</span>
                    <Link to="/home#travel-diaries" className="hover:underline">Travel Diaries</Link>
                    <span className="mx-2">›</span>
                    <span style={{ color: 'var(--color-saffron)' }}>{diary.title}</span>
                </nav>
            </div>

            {/* BACK BUTTON (top) */}
            <div className="max-w-4xl mx-auto px-8 lg:px-10 pt-4 pb-2">
                <button onClick={() => navigate(-1)} className="btn-secondary text-sm">
                    ← Back
                </button>
            </div>

            {/* CONTENT */}
            <article className="max-w-4xl mx-auto px-8 lg:px-10 py-16">
                {/* Opening paragraph */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-xl md:text-2xl leading-relaxed font-light italic border-l-4 pl-6"
                    style={{
                        color: 'var(--color-text-secondary)',
                        borderColor: 'var(--color-saffron)',
                    }}
                >
                    {diary.openingParagraph}
                </motion.p>

                {/* Sections */}
                <div className="mt-16 space-y-16">
                    {diary.sections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold mb-5" style={{ color: 'var(--color-text-primary)' }}>
                                {section.heading}
                            </h2>
                            <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                {section.content}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Photo gallery placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mt-20"
                >
                    <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Photo Gallery</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div
                                key={n}
                                className="aspect-square rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
                            >
                                <span style={{ color: 'var(--color-text-secondary)' }} className="text-sm">Photo {n}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Closing reflection */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mt-20 rounded-2xl p-8 md:p-12"
                    style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
                >
                    <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Final Reflection</h2>
                    <p className="text-lg leading-relaxed italic" style={{ color: 'var(--color-text-secondary)' }}>
                        {diary.closingReflection}
                    </p>
                    <p className="mt-6 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        — {diary.author}, {diary.city}
                    </p>
                </motion.div>
            </article>

            {/* RELATED DIARIES */}
            {relatedDiaries.length > 0 && (
                <section className="py-20" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                    <div className="max-w-5xl mx-auto px-8 lg:px-10">
                        <h2 className="text-3xl font-bold mb-10" style={{ color: 'var(--color-text-primary)' }}>Related Diaries</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {relatedDiaries.map((related) => (
                                <Link to={`/travel-diaries/${related.slug}`} key={related.slug}>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="group relative rounded-2xl overflow-hidden h-72 cursor-pointer"
                                    >
                                        <img
                                            src={related.heroImage}
                                            alt={related.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                        <div className="absolute bottom-6 left-6 right-6 text-white">
                                            <h3 className="text-xl font-bold group-hover:text-amber-300 transition-colors">
                                                {related.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-white/60">{related.city}</p>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* BACK BUTTON (bottom) */}
            <div className="py-12 text-center" style={{ backgroundColor: 'var(--color-bg)' }}>
                <button onClick={() => navigate("/home#travel-diaries")} className="btn-secondary">
                    ← Back to Travel Diaries
                </button>
            </div>

            <Footer />
        </div>
    );
};

export default TravelDiaryDetailPage;
