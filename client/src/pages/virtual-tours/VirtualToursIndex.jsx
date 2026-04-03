import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../contexts/LanguageContext";

const tours = [
  {
    slug: "mariam-tomb",
    nameKey: "vt_mariam_name",
    descKey: "vt_mariam_desc",
    image: "/tours/mariam-tomb/1.1.jpg",
  },
  {
    slug: "sikandra",
    nameKey: "vt_sikandra_name",
    descKey: "vt_sikandra_desc",
    image: "/tours/sikandra/1.1.jpg",
  },
  {
    slug: "itmad",
    nameKey: "vt_itmad_name",
    descKey: "vt_itmad_desc",
    image: "/tours/itmad/3.1.jpg",
  },
  {
    slug: "aram",
    nameKey: "vt_aram_name",
    descKey: "vt_aram_desc",
    image: "/tours/aram/1.jpg",
  },
  {
    slug: "chini-ka-rauza",
    nameKey: "vt_chini_name",
    descKey: "vt_chini_desc",
    image: "/tours/chini-ka-ruaza/1.jpg",
  },
];

/* Same navLinks as homepage Landing.jsx so navbar stays consistent */
const NAV_LINKS = [
  { label: "Destinations", href: "#destinations", labelKey: "nav_destinations" },
  { label: "Travel Diaries", href: "#travel-diaries", labelKey: "nav_travel_diaries" },
  { label: "Itineraries", href: "#itineraries", labelKey: "nav_itineraries" },
  { label: "Hidden Gems", href: "#hidden-gems", labelKey: "nav_hidden_gems" },
  { label: "Delicacies", href: "#delicacies", labelKey: "nav_delicacies" },
];

export default function VirtualToursIndex() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  /* Build translated navLinks */
  const translatedNavLinks = NAV_LINKS.map((link) => ({
    ...link,
    label: t(link.labelKey),
  }));

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/home-page.png')" }}
      />
      <div className="absolute inset-0 bg-black/80" />

      <Navbar navLinks={translatedNavLinks} autoHide />

      {/* Content */}
      <div className="relative z-10 pt-28 pb-20 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-wide mb-4">
            {t('vt_heading')}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {t('vt_subtitle')}
          </p>
        </motion.div>

        {/* Tour Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour, i) => (
            <motion.div
              key={tour.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => navigate(`/virtual-tours/${tour.slug}`)}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/40 transition-all duration-500 shadow-xl hover:shadow-amber-500/10"
            >
              {/* Image */}
              <div className="h-52 overflow-hidden relative">
                <img
                  src={tour.image}
                  alt={t(tour.nameKey)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {/* Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500/90 text-white text-xs font-bold tracking-wider uppercase">
                  {t('vt_badge')}
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {t(tour.nameKey)}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {t(tour.descKey)}
                </p>
                <div className="mt-4 flex items-center gap-2 text-amber-400 text-sm font-semibold">
                  <span>{t('vt_start_tour')}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
