import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

const StickyCreateTripButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  // Hide on landing, splash, and create-trip pages
  const hiddenPaths = ["/create-trip", "/home", "/"];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.08, boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate("/create-trip")}
      className="
        fixed bottom-8 right-8 z-50
        px-8 py-4
        bg-gradient-to-r from-amber-500 via-orange-500 to-red-500
        text-white text-sm font-bold tracking-widest uppercase
        rounded-full
        shadow-[0_10px_40px_rgba(245,158,11,0.4)]
        cursor-pointer
        transition-all duration-300
        hover:shadow-[0_15px_50px_rgba(245,158,11,0.55)]
      "
    >
      ✨ {t('heading_create_trip') || 'Create Trip'}
    </motion.button>
  );
};

export default StickyCreateTripButton;
