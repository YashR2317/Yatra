import React from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getPlaceBySlug, getNearbyPlaces } from "../data/places";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AttractionHero from "../components/attraction/AttractionHero";
import AttractionInfo from "../components/attraction/AttractionInfo";
import AttractionHighlights from "../components/attraction/AttractionHighlights";
import AttractionVisitingInfo from "../components/attraction/AttractionVisitingInfo";
import AttractionTips from "../components/attraction/AttractionTips";
import AttractionMap from "../components/attraction/AttractionMap";

/* ── Parse back-navigation context ────────────────────────── */
function parseFrom(from) {
    if (!from) return { path: "/home", label: "Home" };
    const parts = from.split("-");
    const cities = ["agra", "mathura", "vrindavan", "gokul", "barsana", "govardhan"];
    const city = cities.find((c) => from.startsWith(c));
    if (city) {
        const section = from.slice(city.length + 1);
        const cityLabel = city.charAt(0).toUpperCase() + city.slice(1);
        const sectionLabel = section.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return { path: `/${city}#${section}`, label: `${cityLabel} — ${sectionLabel}` };
    }
    if (from.startsWith("home-")) {
        const section = from.slice(5);
        return { path: `/home#${section}`, label: "Home" };
    }
    return { path: "/home", label: "Home" };
}

const PlacePage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const place = getPlaceBySlug(slug);
    const backCtx = parseFrom(location.state?.from);

    if (!place) {
        return (
            <div className="w-full min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="text-6xl font-bold mb-6 text-amber-500/30">404</div>
                        <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>Place Not Found</h1>
                        <p className="text-xl mb-8 max-w-md" style={{ color: "var(--color-text-secondary)" }}>
                            The place you're looking for doesn't exist yet.
                        </p>
                        <button onClick={() => navigate("/home")} className="btn-primary">Explore Destinations</button>
                    </motion.div>
                </div>
                <Footer />
            </div>
        );
    }

    const handleBack = () => navigate(backCtx.path);
    const nearby = getNearbyPlaces(place.id);

    return (
        <div className="w-full min-h-screen overflow-x-hidden" style={{ backgroundColor: "var(--color-bg)" }}>
            <Navbar />

            {/* Hero */}
            {place.heroImage ? (
                <AttractionHero
                    name={place.name}
                    city={place.city}
                    state={place.state}
                    tagline={place.tagline}
                    heroImage={place.heroImage}
                />
            ) : (
                <section className="relative w-full h-[50vh] bg-gradient-to-br from-amber-900/50 via-orange-800/40 to-amber-950/60 flex items-center justify-center">
                    <div className="text-center text-white z-10">
                        <h1 className="text-4xl md:text-6xl font-extrabold">{place.name}</h1>
                        <p className="mt-2 text-lg text-white/70">{place.city}</p>
                    </div>
                </section>
            )}

            {/* Breadcrumb + Back */}
            <div className="max-w-6xl mx-auto px-8 lg:px-16 pt-8 pb-2">
                <nav className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    <Link to="/home" className="hover:underline">Home</Link>
                    <span className="mx-2">›</span>
                    <Link to={`/${place.city.toLowerCase()}`} className="hover:underline">{place.city}</Link>
                    <span className="mx-2">›</span>
                    <span style={{ color: "var(--color-saffron)" }}>{place.name}</span>
                </nav>
            </div>
            <div className="max-w-6xl mx-auto px-8 lg:px-16 pt-4 pb-2">
                <button onClick={handleBack} className="btn-secondary text-sm">← Back to {backCtx.label}</button>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-8 lg:px-16 py-12">

                {/* Category + Mood chips */}
                {(place.categoryLabel || (place.mood && place.mood.length > 0)) && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {place.categoryLabel && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase"
                                style={{ backgroundColor: "var(--color-saffron)", color: "white" }}>
                                {place.categoryLabel}
                            </span>
                        )}
                        {place.mood && place.mood.map((m) => (
                            <span key={m} className="px-3 py-1 rounded-full text-xs border"
                                style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>
                                {m}
                            </span>
                        ))}
                        {place.duration && (
                            <span className="px-3 py-1 rounded-full text-xs"
                                style={{ backgroundColor: "var(--color-card-bg)", color: "var(--color-text-secondary)" }}>
                                ⏱️ {place.duration}
                            </span>
                        )}
                    </div>
                )}

                {/* Hindi name */}
                {place.nameHi && (
                    <p className="text-2xl mb-6 opacity-60" style={{ color: "var(--color-text-secondary)", fontStyle: "italic" }}>
                        {place.nameHi}
                    </p>
                )}

                {/* Legend pull-quote */}
                {place.legend && (
                    <motion.blockquote
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                        className="border-l-4 pl-6 py-4 mb-10 italic text-lg"
                        style={{ borderColor: "var(--color-saffron)", color: "var(--color-text-secondary)" }}
                    >
                        "{place.legend}"
                    </motion.blockquote>
                )}

                {/* Description paragraphs */}
                {place.description && place.description.length > 0 && (
                    <AttractionInfo name={place.name} description={place.description} />
                )}

                {/* Did You Know callout */}
                {place.didYouKnow && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="rounded-xl p-6 mb-10"
                        style={{ backgroundColor: "var(--color-saffron-light, rgba(192,98,45,0.08))", border: "1px solid var(--color-saffron)" }}
                    >
                        <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-saffron)" }}>
                            💡 Did You Know?
                        </p>
                        <p style={{ color: "var(--color-text-primary)" }}>{place.didYouKnow}</p>
                    </motion.div>
                )}

                {/* Highlights */}
                {place.highlights && place.highlights.length > 0 && (
                    <AttractionHighlights highlights={place.highlights} />
                )}

                {/* Visiting Info */}
                {place.visitingInfo && <AttractionVisitingInfo visitingInfo={place.visitingInfo} />}

                {/* Travel Tips */}
                {place.travelTips && place.travelTips.length > 0 && <AttractionTips travelTips={place.travelTips} />}

                {/* Map */}
                {place.location && place.location.mapQuery && (
                    <AttractionMap name={place.name} mapQuery={place.location.mapQuery} />
                )}

                {/* Nearby Places */}
                {nearby.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>
                            📍 Nearby Places
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {nearby.map((np) => (
                                <Link
                                    key={np.id}
                                    to={`/place/${np.slug}`}
                                    className="group rounded-xl overflow-hidden transition-transform hover:scale-[1.02]"
                                    style={{ backgroundColor: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
                                >
                                    {np.heroImage && (
                                        <div className="h-32 overflow-hidden">
                                            <img src={np.heroImage} alt={np.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <h3 className="font-bold" style={{ color: "var(--color-text-primary)" }}>{np.name}</h3>
                                        <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                                            {np.categoryLabel || np.city} {np.duration ? `• ${np.duration}` : ""}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Back button bottom */}
            <div className="py-12 text-center" style={{ backgroundColor: "var(--color-bg)" }}>
                <button onClick={handleBack} className="btn-secondary">← Back to {backCtx.label}</button>
            </div>

            <Footer />
        </div>
    );
};

export default PlacePage;
