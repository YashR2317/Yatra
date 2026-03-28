import React from "react";
import { useNavigate } from "react-router-dom";
import { Instagram, Twitter, Youtube, Facebook } from "lucide-react";

const Footer = () => {
    const navigate = useNavigate();

    const navLinks = [
        { label: "Attractions", hash: "#attractions" },
        { label: "Destinations", hash: "#destinations" },
        { label: "Itineraries", hash: "#itineraries" },
        { label: "Hidden Gems", hash: "#hidden-gems" },
        { label: "Delicacies", hash: "#delicacies" },
        { label: "Travel Diaries", hash: "#travel-diaries" },
    ];

    return (
        <footer className="bg-gray-950 text-white">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-12">

                    {/* Brand */}
                    <div className="md:col-span-1">
                        <h2
                            onClick={() => navigate("/")}
                            className="text-2xl font-extrabold tracking-widest cursor-pointer mb-4"
                        >
                            BRAJYATRA.AI
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Where Travel meets Tradition. Discover the sacred lands of Braj with
                            AI-powered planning and curated experiences.
                        </p>

                        {/* Social Icons */}
                        <div className="flex gap-4 mt-6">
                            <a href="#" className="text-gray-500 hover:text-amber-400 transition"><Instagram size={20} /></a>
                            <a href="#" className="text-gray-500 hover:text-amber-400 transition"><Twitter size={20} /></a>
                            <a href="#" className="text-gray-500 hover:text-amber-400 transition"><Youtube size={20} /></a>
                            <a href="#" className="text-gray-500 hover:text-amber-400 transition"><Facebook size={20} /></a>
                        </div>
                    </div>

                    {/* Destinations */}
                    <div>
                        <h3 className="text-sm font-bold tracking-widest uppercase mb-6 text-gray-300">
                            Destinations
                        </h3>
                        <ul className="space-y-3">
                            {["Agra", "Mathura", "Vrindavan", "Gokul", "Barsana", "Govardhan"].map((city) => (
                                <li key={city}>
                                    <button
                                        onClick={() => navigate(`/${city.toLowerCase()}`)}
                                        className="text-gray-400 hover:text-white transition text-sm"
                                    >
                                        {city}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="text-sm font-bold tracking-widest uppercase mb-6 text-gray-300">
                            Follow Us
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">
                                    <Instagram size={16} /> Instagram
                                </a>
                            </li>
                            <li>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">
                                    <Twitter size={16} /> Twitter
                                </a>
                            </li>
                            <li>
                                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">
                                    <Youtube size={16} /> YouTube
                                </a>
                            </li>
                            <li>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">
                                    <Facebook size={16} /> Facebook
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-bold tracking-widest uppercase mb-6 text-gray-300">
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <button onClick={() => navigate("/create-trip")} className="text-gray-400 hover:text-white transition text-sm">
                                    AI Trip Planner
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate("/virtual-tours")} className="text-gray-400 hover:text-white transition text-sm">
                                    Virtual Tours
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate("/login")} className="text-gray-400 hover:text-white transition text-sm">
                                    Login
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate("/signup")} className="text-gray-400 hover:text-white transition text-sm">
                                    Sign Up
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-bold tracking-widest uppercase mb-6 text-gray-300">
                            Connect
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Built with ❤️ for the sacred land of Braj
                        </p>
                        <p className="text-gray-500 text-xs">
                            A Final Year Project
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-xs tracking-wide">
                        © 2026 BrajYatra.AI — All rights reserved
                    </p>
                    <div className="flex gap-6 text-gray-500 text-xs">
                        <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
                        <span className="hover:text-white transition cursor-pointer">Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

