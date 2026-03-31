import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating mandir silhouettes */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[8%] text-[180px] opacity-[0.04] select-none"
        >
          🛕
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] right-[10%] text-[140px] opacity-[0.04] select-none"
        >
          🕉️
        </motion.div>
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[40%] right-[20%] text-[100px] opacity-[0.03] select-none"
        >
          🪷
        </motion.div>

        {/* Gradient orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, var(--color-saffron), transparent 70%)" }}
        />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, var(--color-gold), transparent 70%)" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* 404 number with gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1
            className="text-[10rem] sm:text-[14rem] font-extrabold leading-none tracking-tighter select-none"
            style={{
              background: "linear-gradient(135deg, var(--color-saffron) 0%, var(--color-gold) 50%, var(--color-saffron) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
              filter: "drop-shadow(0 4px 30px rgba(192,98,45,0.15))",
            }}
          >
            404
          </h1>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="w-24 h-0.5 mx-auto mb-6"
          style={{ background: "linear-gradient(90deg, transparent, var(--color-saffron), transparent)" }}
        />

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-2xl sm:text-3xl font-semibold mb-3"
          style={{ color: "var(--color-text-primary)" }}
        >
          Path Not Found
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="text-base sm:text-lg mb-10 leading-relaxed max-w-md mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Even in the sacred streets of Braj, some paths are yet to be discovered.
          Let us guide you back to familiar ground.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(192,98,45,0.35)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/home")}
            className="px-8 py-3.5 rounded-lg text-sm font-semibold tracking-wide text-white transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, var(--color-saffron), #D4780A)",
              boxShadow: "0 4px 20px rgba(192,98,45,0.25)",
            }}
          >
            Explore Destinations
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            className="px-8 py-3.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300"
            style={{
              color: "var(--color-stone)",
              border: "1.5px solid var(--color-border)",
              backgroundColor: "transparent",
            }}
          >
            Go Back
          </motion.button>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-14 flex flex-wrap justify-center gap-6 text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {[
            { label: "Mathura", to: "/mathura" },
            { label: "Vrindavan", to: "/vrindavan" },
            { label: "Agra", to: "/agra" },
            { label: "Plan a Trip", to: "/create-trip" },
          ].map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="hover:opacity-100 opacity-60 transition-opacity duration-300 underline underline-offset-4 decoration-1"
              style={{ textDecorationColor: "var(--color-border)" }}
            >
              {label}
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
