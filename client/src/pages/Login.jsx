import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/Toast";
import GoogleSignInButton from "../components/GoogleSignInButton";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const { addToast } = useToast();
    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.message || "Login failed.");
                setLoading(false);
                return;
            }

            login(data.token, data.user);
            addToast(`Welcome back, ${data.user.name}!`, "success");
            const redirect = searchParams.get("redirect") || "/home";
            navigate(redirect, { replace: true });
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
                    {/* Logo */}
                    <h1
                        onClick={() => navigate("/")}
                        className="text-white text-2xl font-extrabold tracking-widest text-center mb-2 cursor-pointer"
                    >
                        BRAJYATRA.AI
                    </h1>
                    <p className="text-gray-400 text-center text-sm mb-10">Welcome back, traveller</p>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                placeholder="••••••••"
                            />
                        </div>
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold tracking-widest uppercase rounded-lg shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-60"
                        >
                            {loading ? "Signing in..." : "Log In"}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-gray-500 text-xs tracking-wider uppercase">or</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Google Sign-In */}
                    <GoogleSignInButton
                        disabled={loading}
                        onSuccess={(data) => {
                            login(data.user, data.token);
                            addToast(data.message, "success");
                            const redirect = searchParams.get("redirect") || "/home";
                            navigate(redirect, { replace: true });
                        }}
                        onError={(msg) => setError(msg)}
                    />

                    <div className="text-center mt-4">
                        <Link to="/forgot-password" className="text-gray-500 hover:text-amber-400 text-xs tracking-wide transition">
                            Forgot your password?
                        </Link>
                    </div>

                    <p className="text-gray-500 text-center text-sm mt-6">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-amber-400 hover:text-amber-300 transition">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
