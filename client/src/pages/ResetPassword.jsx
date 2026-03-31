import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "../components/Toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { addToast } = useToast();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

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

    // If no token in URL, show invalid state
    if (!token) {
        return (
            <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/home-page.png')" }}
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 w-full max-w-md mx-4"
                >
                    <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl text-center">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-6">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        </div>
                        <h2 className="text-white text-lg font-semibold mb-3">Invalid Reset Link</h2>
                        <p className="text-gray-400 text-sm mb-8">
                            This password reset link is invalid or has expired. Please request a new one.
                        </p>
                        <Link
                            to="/forgot-password"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold tracking-widest uppercase rounded-lg text-sm"
                        >
                            Request New Link
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                addToast("Password reset successfully!", "success");
            } else {
                setError(data.message || "Reset failed. The link may have expired.");
                addToast(data.message || "Reset failed.", "error");
            }
        } catch {
            setError("Could not connect to server.");
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
                        Create a new password
                    </p>

                    {!success ? (
                        <>
                            {error && (
                                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-gray-300 text-xs tracking-widest uppercase mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 transition"
                                        placeholder="Min 6 characters"
                                        autoFocus
                                    />
                                    {password && (
                                        <div className="mt-2">
                                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${strength.color} transition-all duration-300`}
                                                    style={{ width: strength.width }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{strength.label}</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-gray-300 text-xs tracking-widest uppercase mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 transition"
                                        placeholder="Re-enter password"
                                    />
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                                    )}
                                </div>
                                <motion.button
                                    type="submit"
                                    disabled={loading || password !== confirmPassword}
                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold tracking-widest uppercase rounded-lg shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-60"
                                >
                                    {loading ? "Resetting..." : "Reset Password"}
                                </motion.button>
                            </form>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-6">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            </div>
                            <h2 className="text-white text-lg font-semibold mb-3">
                                Password Reset!
                            </h2>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                Your password has been changed successfully. You can now log in with your new password.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate("/login")}
                                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold tracking-widest uppercase rounded-lg shadow-lg"
                            >
                                Go to Login
                            </motion.button>
                        </motion.div>
                    )}

                    <p className="text-gray-500 text-center text-sm mt-8">
                        <Link to="/login" className="text-amber-400 hover:text-amber-300 transition">
                            Back to Login
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
