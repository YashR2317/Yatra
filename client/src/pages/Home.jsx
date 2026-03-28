import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("/home-page.png")` }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/50" />

      {/* CENTER CONTENT */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center text-white px-6"
        >
          {/* TITLE */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="
                text-6xl
  sm:text-7xl
  lg:text-8xl
  xl:text-9xl
  font-semibold
  tracking-widest
  mb-4
            "
          >
            BRAJYATRA.AI
          </motion.h1>

          {/* TAGLINE */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-base sm:text-lg lg:text-xl opacity-90 mb-10"
          >
            Where Travel meets Tradition
          </motion.p>

          {/* BUTTON */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(isLoggedIn ? "/home" : "/login")}
            className="
              px-14 py-4
              bg-gradient-to-r from-amber-500 via-orange-500 to-red-500
              text-white
              rounded-full
              text-sm
              font-bold
              tracking-widest
              uppercase
              shadow-[0_10px_40px_rgba(245,158,11,0.35)]
              transition-all duration-500
              hover:shadow-[0_15px_50px_rgba(245,158,11,0.55)]
            "
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
