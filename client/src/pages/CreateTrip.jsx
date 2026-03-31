import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

const AGENT_URL = import.meta.env.VITE_AGENT_URL || "http://localhost:5000";

const CreateTrip = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useAuth();

    // Agent UI is served at /agent on the unified server
    const agentBase = `${AGENT_URL}/agent`;
    const agentSrc = token ? `${agentBase}?token=${token}` : agentBase;

    return (
        <div className="relative min-h-screen overflow-hidden bg-gray-950">
            <Navbar autoHide />

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-950">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="text-6xl mb-6"
                        >
                            🪷
                        </motion.div>
                        <p className="text-white/70 text-lg tracking-wider">Loading AI Trip Planner...</p>
                    </motion.div>
                </div>
            )}

            {/* Back button — top-right, high contrast */}
            <div className="fixed top-4 right-4 z-50">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/home")}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all flex items-center gap-2"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back
                </motion.button>
            </div>

            {/* Agent iframe */}
            <iframe
                src={agentSrc}
                title="BrajYatra AI Trip Planner"
                className="w-full h-screen border-0"
                style={{ marginTop: 0 }}
                onLoad={() => setIsLoading(false)}
                allow="geolocation"
            />
        </div>
    );
};

export default CreateTrip;

