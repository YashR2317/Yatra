import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "../components/Toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (data.success) {
                setSent(true);
                addToast("Reset link sent! Check your email.", "success");
            } else {
                addToast(data.message || "Something went wrong.", "error");
            }
        } catch {
            addToast("Could not connect to server.", "error");
        } finally {
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
                    <p className="text-gray-400 text-center text-sm mb-10">
                        Reset your password
                    </p>

                    {!sent ? (
                        <>
                            <p className="text-gray-400 text-sm mb-6 text-center leading-relaxed">
                                Enter the email address associated with your account and we'll send you a link to reset your password.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-gray-300 text-xs tracking-widest uppercase mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 transition"
                                        placeholder="you@example.com"
                                        autoFocus
                                    />
                                </div>
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold tracking-widest uppercase rounded-lg shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-60"
                                >
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </motion.button>
                            </form>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            {/* Success checkmark */}
                            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-6">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            </div>
                            <h2 className="text-white text-lg font-semibold mb-3">
                                Check your email
                            </h2>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                We've sent a password reset link to <span className="text-amber-400">{email}</span>. 
                                The link will expire in 1 hour.
                            </p>
                            <button
                                onClick={() => { setSent(false); setEmail(""); }}
                                className="text-amber-400 hover:text-amber-300 text-sm transition underline underline-offset-4"
                            >
                                Didn't receive it? Try again
                            </button>
                        </motion.div>
                    )}

                    <p className="text-gray-500 text-center text-sm mt-8">
                        Remember your password?{" "}
                        <Link to="/login" className="text-amber-400 hover:text-amber-300 transition">
                            Log In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
