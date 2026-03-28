import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const AGENT_API = import.meta.env.VITE_AGENT_URL || "http://localhost:3000";

const AccountPage = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile");
    const [itineraries, setItineraries] = useState([]);
    const [itineraryCount, setItineraryCount] = useState(0);
    const [sessions, setSessions] = useState([]);
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    // Fetch itinerary count on mount (for profile tab display)
    useEffect(() => {
        if (token) {
            fetch(`${AGENT_API}/api/user/itineraries/count`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((r) => r.json())
                .then((d) => setItineraryCount(d.count || 0))
                .catch((e) => console.error("Failed to fetch itinerary count:", e));
        }
    }, [token]);

    // Fetch saved itineraries
    useEffect(() => {
        if (token && activeTab === "itineraries") {
            setLoading(true);
            fetch(`${AGENT_API}/api/user/itineraries`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((r) => r.json())
                .then((d) => {
                    const list = d.itineraries || [];
                    setItineraries(list);
                    setItineraryCount(list.length);
                })
                .catch((e) => {
                    console.error("Failed to fetch itineraries:", e);
                    setItineraries([]);
                })
                .finally(() => setLoading(false));
        }
    }, [token, activeTab]);

    // Fetch chat sessions
    useEffect(() => {
        if (token && activeTab === "chats") {
            setLoading(true);
            fetch(`${AGENT_API}/api/user/sessions`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((r) => r.json())
                .then((d) => setSessions(d.sessions || []))
                .catch((e) => {
                    console.error("Failed to fetch sessions:", e);
                    setSessions([]);
                })
                .finally(() => setLoading(false));
        }
    }, [token, activeTab]);

    // Load itinerary details
    const viewItinerary = async (id) => {
        try {
            const res = await fetch(`${AGENT_API}/api/user/itineraries/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.itinerary) {
                setSelectedItinerary(data.itinerary);
            } else {
                console.error("No itinerary in response:", data);
            }
        } catch (e) {
            console.error("Failed to load itinerary:", e);
        }
    };

    // Load session messages
    const viewSession = async (id) => {
        try {
            const res = await fetch(`${AGENT_API}/api/user/sessions/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setSelectedSession({ id, messages: data.messages || [] });
        } catch (e) {
            console.error("Failed to load session:", e);
        }
    };

    // Parse message content for display (handles JSON itineraries & recommendations)
    const getMessageDisplay = (msg) => {
        if (msg.role === "user") return msg.content;
        try {
            const parsed = JSON.parse(msg.content);
            if (parsed && parsed.days && Array.isArray(parsed.days)) {
                return `🛕 ${parsed.title || "Itinerary"} — ${parsed.days.length} day(s)`;
            }
            if (parsed && parsed.recommendations) {
                return `📍 ${parsed.recommendations.length} recommendations${parsed.summary ? ": " + parsed.summary : ""}`;
            }
            return msg.content;
        } catch (e) {
            return msg.content;
        }
    };

    // Delete itinerary
    const deleteItinerary = async (id) => {
        if (!window.confirm("Delete this itinerary?")) return;
        try {
            await fetch(`${AGENT_API}/api/user/itineraries/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            setItineraries((prev) => prev.filter((i) => i.id !== id));
            setItineraryCount((prev) => Math.max(0, prev - 1));
            if (selectedItinerary?.id === id) setSelectedItinerary(null);
        } catch (e) {
            console.error("Failed to delete itinerary:", e);
        }
    };

    if (!user) return null;

    const initials = user.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "?";

    const memberSince = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })
        : "Recently";

    const tabs = [
        { id: "profile", label: "👤 Profile", icon: "👤" },
        { id: "itineraries", label: "🗺️ My Itineraries", icon: "🗺️" },
        { id: "chats", label: "💬 Chat History", icon: "💬" },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Hero strip */}
            <div className="h-48 bg-gradient-to-br from-amber-900/60 to-orange-900/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/home-page.png')] bg-cover bg-center opacity-20" />
            </div>

            {/* Back to Home */}
            <div className="max-w-4xl mx-auto px-6 pt-6">
                <Link to="/home">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400 transition-all text-sm"
                    >
                        ← Back to Home
                    </motion.button>
                </Link>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-4xl mx-auto px-6 mt-4">
                <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/10">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSelectedItinerary(null); setSelectedSession(null); }}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-4xl mx-auto px-6 mt-4 pb-12">
                <AnimatePresence mode="wait">
                    {/* ── Profile Tab ── */}
                    {activeTab === "profile" && (
                        <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                                <div className="flex flex-col items-center mb-8">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-4 border-amber-500/30 object-cover" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
                                            {initials}
                                        </div>
                                    )}
                                    <h2 className="text-white text-2xl font-bold mt-4">{user.name}</h2>
                                    <p className="text-gray-400 text-sm">{user.email}</p>
                                    <span className="mt-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs uppercase tracking-widest">
                                        {user.authProvider === "google" ? "Google Account" : "Email Account"}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Member Since</p>
                                        <p className="text-white font-semibold">{memberSince}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Saved Trips</p>
                                        <p className="text-amber-400 font-bold text-xl">{itineraryCount > 0 ? itineraryCount : "–"}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-green-400 font-semibold">Active Yatri</p>
                                    </div>
                                </div>
                                <motion.button onClick={handleLogout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all">
                                    Log Out
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Itineraries Tab ── */}
                    {activeTab === "itineraries" && (
                        <motion.div key="itineraries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {selectedItinerary ? (
                                <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                                    <button onClick={() => setSelectedItinerary(null)}
                                        className="text-amber-400 text-sm mb-4 hover:underline">← Back to list</button>
                                    <h2 className="text-white text-xl font-bold mb-2">🛕 {selectedItinerary.title}</h2>
                                    <div className="flex gap-2 mb-4 flex-wrap">
                                        {(Array.isArray(selectedItinerary.cities) ? selectedItinerary.cities : []).map((c) => (
                                            <span key={c} className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded text-xs">{c}</span>
                                        ))}
                                        <span className="px-2 py-1 bg-white/5 text-gray-400 rounded text-xs">
                                            📅 {((selectedItinerary.itinerary_data?.days || []).length) || selectedItinerary.days || 1} day{(((selectedItinerary.itinerary_data?.days || []).length) || selectedItinerary.days || 1) > 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    {selectedItinerary.itinerary_data?.summary && (
                                        <p className="text-gray-400 text-sm mb-4 italic">{selectedItinerary.itinerary_data.summary}</p>
                                    )}
                                    {(selectedItinerary.itinerary_data?.days || []).map((day, di) => (
                                        <div key={di} className="mb-6">
                                            <h3 className="text-amber-400 font-semibold mb-3 text-lg">
                                                📍 {day.title || `Day ${di + 1}`}
                                            </h3>
                                            {day.overview && (
                                                <p className="text-gray-400 text-sm mb-3">{day.overview}</p>
                                            )}
                                            <div className="space-y-3">
                                                {(day.slots || day.places || []).map((item, pi) => (
                                                    <div key={pi} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="text-white font-medium">{item.place || item.name || "Unknown"}</h4>
                                                                {(item.city || day.city) && <p className="text-gray-500 text-xs mt-1">📍 {item.city || day.city}</p>}
                                                            </div>
                                                            <div className="text-right text-xs text-gray-500">
                                                                {(item.time || item.time_slot) && <p>{item.time || item.time_slot}</p>}
                                                                {(item.duration_mins || item.estimated_duration) && <p>⏱ {item.duration_mins || item.estimated_duration} min</p>}
                                                                {item.entry_fee !== undefined && <p>🎫 {item.entry_fee > 0 ? `₹${item.entry_fee}` : "Free"}</p>}
                                                            </div>
                                                        </div>
                                                        {item.description && <p className="text-gray-400 text-sm mt-2">{item.description}</p>}
                                                        {item.tip && <p className="text-amber-400/70 text-xs mt-2">💡 {item.tip}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    {loading ? (
                                        <div className="text-center py-12 text-gray-400">Loading itineraries...</div>
                                    ) : itineraries.length === 0 ? (
                                        <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
                                            <p className="text-5xl mb-4">🗺️</p>
                                            <h3 className="text-white text-lg font-semibold mb-2">No Saved Itineraries</h3>
                                            <p className="text-gray-400 text-sm mb-6">Create a trip with the AI planner and save it to view here.</p>
                                            <Link to="/create-trip">
                                                <motion.button whileHover={{ scale: 1.02 }}
                                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold">
                                                    🪷 Plan a Trip
                                                </motion.button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {itineraries.map((itin) => (
                                                <motion.div key={itin.id} whileHover={{ scale: 1.01 }}
                                                    className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl p-5 cursor-pointer hover:border-amber-500/30 transition-all">
                                                    <div className="flex justify-between items-start">
                                                        <div onClick={() => viewItinerary(itin.id)} className="flex-1">
                                                            <h3 className="text-white font-semibold text-lg">🛕 {itin.title}</h3>
                                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                                {(itin.cities || []).map((c) => (
                                                                    <span key={c} className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-xs">{c}</span>
                                                                ))}
                                                                <span className="px-2 py-0.5 bg-white/5 text-gray-400 rounded text-xs">
                                                                    📅 {itin.days} day{itin.days > 1 ? "s" : ""}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-500 text-xs mt-2">
                                                                Saved {new Date(itin.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                            </p>
                                                        </div>
                                                        <button onClick={() => deleteItinerary(itin.id)}
                                                            className="text-gray-500 hover:text-red-400 text-sm p-2 transition-colors" title="Delete">
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ── Chat History Tab ── */}
                    {activeTab === "chats" && (
                        <motion.div key="chats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {selectedSession ? (
                                <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                                    <button onClick={() => setSelectedSession(null)}
                                        className="text-amber-400 text-sm mb-4 hover:underline">← Back to list</button>
                                    <h3 className="text-white font-semibold mb-4">💬 Conversation</h3>
                                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                        {selectedSession.messages.map((msg, i) => {
                                            const displayText = getMessageDisplay(msg);
                                            return (
                                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                                    <div className={`max-w-[80%] p-3 rounded-xl text-sm whitespace-pre-wrap ${msg.role === "user"
                                                        ? "bg-amber-500/20 text-amber-100 border border-amber-500/20"
                                                        : "bg-white/5 text-gray-300 border border-white/10"
                                                        }`}>
                                                        {displayText.length > 800 ? displayText.substring(0, 800) + "..." : displayText}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {loading ? (
                                        <div className="text-center py-12 text-gray-400">Loading chat history...</div>
                                    ) : sessions.length === 0 ? (
                                        <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
                                            <p className="text-5xl mb-4">💬</p>
                                            <h3 className="text-white text-lg font-semibold mb-2">No Chat History</h3>
                                            <p className="text-gray-400 text-sm mb-6">Start chatting with the AI planner to see your history here.</p>
                                            <Link to="/create-trip">
                                                <motion.button whileHover={{ scale: 1.02 }}
                                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold">
                                                    🪷 Start Chatting
                                                </motion.button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {sessions.map((s) => (
                                                <motion.div key={s.id} whileHover={{ scale: 1.01 }} onClick={() => viewSession(s.id)}
                                                    className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl p-4 cursor-pointer hover:border-amber-500/30 transition-all">
                                                    <p className="text-white text-sm font-medium">
                                                        {s.first_message
                                                            ? s.first_message.length > 60 ? s.first_message.substring(0, 60) + "..." : s.first_message
                                                            : s.title || "Chat Session"}
                                                    </p>
                                                    <p className="text-gray-500 text-xs mt-1">
                                                        {new Date(s.updated_at || s.created_at).toLocaleDateString("en-IN", {
                                                            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                                                        })}
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AccountPage;
