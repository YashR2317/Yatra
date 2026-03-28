import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Signup = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const getStrength = () => {
        if (!password) return { label: "", color: "", width: "0%" };
        if (password.length < 6) return { label: "Too short", color: "bg-red-500", width: "25%" };
        if (password.length < 8) return { label: "Weak", color: "bg-orange-500", width: "50%" };
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
        if (score >= 2) return { label: "Strong", color: "bg-green-500", width: "100%" };
        return { label: "Fair", color: "bg-yellow-500", width: "75%" };
    };

    const strength = getStrength();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.message || "Signup failed.");
                setLoading(false);
                return;
            }

            login(data.token, data.user);
            navigate("/home", { replace: true });
        } catch {
            setError("Could not connect to server. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/home-page.png')" }}
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl">
                    <h1
                        onClick={() => navigate("/")}
                        className="text-white text-2xl font-extrabold tracking-widest text-center mb-2 cursor-pointer"
                    >
                        BRAJYATRA.AI
                    </h1>
                    <p className="text-gray-400 text-center text-sm mb-10">Start your sacred journey</p>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-300 text-xs tracking-widest uppercase mb-2">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 transition"
                                placeholder="Your full name"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-xs tracking-widest uppercase mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 transition"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-xs tracking-widest uppercase mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 transition"
                                placeholder="Min 6 characters"
                            />
                            {password && (
                                <div className="mt-2">
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }} />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{strength.label}</p>
                                </div>
                            )}
                        </div>
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold tracking-widest uppercase rounded-lg shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-60"
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </motion.button>
                    </form>

                    <p className="text-gray-500 text-center text-sm mt-8">
                        Already have an account?{" "}
                        <Link to="/login" className="text-amber-400 hover:text-amber-300 transition">
                            Log In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
