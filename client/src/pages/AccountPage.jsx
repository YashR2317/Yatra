import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/Toast";
import { useLanguage } from "../contexts/LanguageContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AccountPage = () => {
    const { user, token, logout, updateUser, updateToken } = useAuth();
    const { addToast } = useToast();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile");
    const [itineraries, setItineraries] = useState([]);
    const [itineraryCount, setItineraryCount] = useState(0);
    const [sessions, setSessions] = useState([]);
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [loading, setLoading] = useState(false);

    // ── Profile Editing State ──
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState("");
    const [editAvatar, setEditAvatar] = useState("");
    const [profileSaving, setProfileSaving] = useState(false);

    // ── Change Password State ──
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [passwordSaving, setPasswordSaving] = useState(false);

    // ── Account Deletion State ──
    const [deletePassword, setDeletePassword] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTyped, setDeleteTyped] = useState("");
    const [deleting, setDeleting] = useState(false);

    const handleLogout = () => {
        logout();
        addToast("Logged out successfully.", "info");
        navigate("/", { replace: true });
    };

    // Fetch itinerary count on mount
    useEffect(() => {
        if (token) {
            fetch(`${API_BASE}/user/itineraries/count`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((r) => r.json())
                .then((d) => setItineraryCount(d.count || 0))
                .catch(() => {});
        }
    }, [token]);

    // Fetch saved itineraries
    useEffect(() => {
        if (token && activeTab === "itineraries") {
            setLoading(true);
            fetch(`${API_BASE}/user/itineraries`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((r) => r.json())
                .then((d) => {
                    const list = d.itineraries || [];
                    setItineraries(list);
                    setItineraryCount(list.length);
                })
                .catch(() => setItineraries([]))
                .finally(() => setLoading(false));
        }
    }, [token, activeTab]);

    // Fetch chat sessions
    useEffect(() => {
        if (token && activeTab === "chats") {
            setLoading(true);
            fetch(`${API_BASE}/user/sessions`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((r) => r.json())
                .then((d) => setSessions(d.sessions || []))
                .catch(() => setSessions([]))
                .finally(() => setLoading(false));
        }
    }, [token, activeTab]);

    // ── Profile Update Handler ──
    const handleProfileSave = async () => {
        setProfileSaving(true);
        try {
            const body = {};
            if (editName && editName !== user.name) body.name = editName;
            if (editAvatar !== (user.avatar || "")) body.avatar = editAvatar;

            if (Object.keys(body).length === 0) {
                setIsEditingProfile(false);
                setProfileSaving(false);
                return;
            }

            const res = await fetch(`${API_BASE}/auth/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (data.success) {
                updateUser(data.user);
                addToast("Profile updated successfully! ✨", "success");
                setIsEditingProfile(false);
            } else {
                addToast(data.message || "Failed to update profile.", "error");
            }
        } catch {
            addToast("Could not connect to server.", "error");
        } finally {
            setProfileSaving(false);
        }
    };

    // ── Change Password Handler ──
    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            addToast("New passwords do not match.", "error");
            return;
        }
        if (newPassword.length < 6) {
            addToast("New password must be at least 6 characters.", "error");
            return;
        }

        setPasswordSaving(true);
        try {
            const res = await fetch(`${API_BASE}/auth/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();

            if (data.success) {
                if (data.token) updateToken(data.token);
                addToast("Password changed successfully! 🔑", "success");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
            } else {
                addToast(data.message || "Failed to change password.", "error");
            }
        } catch {
            addToast("Could not connect to server.", "error");
        } finally {
            setPasswordSaving(false);
        }
    };

    // ── Delete Account Handler ──
    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`${API_BASE}/auth/account`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ password: deletePassword }),
            });
            const data = await res.json();

            if (data.success) {
                addToast("Account deleted. We're sorry to see you go. 🙏", "info");
                logout();
                navigate("/", { replace: true });
            } else {
                addToast(data.message || "Failed to delete account.", "error");
                setDeleting(false);
            }
        } catch {
            addToast("Could not connect to server.", "error");
            setDeleting(false);
        }
    };

    // Load itinerary details
    const viewItinerary = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/user/itineraries/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.itinerary) setSelectedItinerary(data.itinerary);
        } catch (e) {
            console.error("Failed to load itinerary:", e);
        }
    };

    // Load session messages
    const viewSession = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/user/sessions/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setSelectedSession({ id, messages: data.messages || [] });
        } catch (e) {
            console.error("Failed to load session:", e);
        }
    };

    // Parse message content for display
    const getMessageDisplay = (msg) => {
        if (msg.role === "user") return msg.content;
        try {
            const parsed = JSON.parse(msg.content);
            if (parsed?.days && Array.isArray(parsed.days)) {
                return `🛕 ${parsed.title || "Itinerary"} — ${parsed.days.length} day(s)`;
            }
            if (parsed?.recommendations) {
                return `📍 ${parsed.recommendations.length} recommendations${parsed.summary ? ": " + parsed.summary : ""}`;
            }
            return msg.content;
        } catch {
            return msg.content;
        }
    };

    // Delete itinerary
    const deleteItinerary = async (id) => {
        if (!window.confirm("Delete this itinerary?")) return;
        try {
            await fetch(`${API_BASE}/user/itineraries/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            setItineraries((prev) => prev.filter((i) => i.id !== id));
            setItineraryCount((prev) => Math.max(0, prev - 1));
            if (selectedItinerary?.id === id) setSelectedItinerary(null);
            addToast("Itinerary deleted.", "info");
        } catch {
            addToast("Failed to delete itinerary.", "error");
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
        { id: "profile", label: `👤 ${t('acc_profile')}` },
        { id: "itineraries", label: `🗺️ ${t('acc_itineraries')}` },
        { id: "chats", label: `💬 ${t('acc_chats')}` },
        { id: "settings", label: `⚙️ ${t('acc_settings')}` },
    ];

    // Password strength indicator
    const getStrength = (pw) => {
        if (!pw) return { label: "", color: "", width: "0%" };
        if (pw.length < 6) return { label: "Too short", color: "bg-red-500", width: "25%" };
        if (pw.length < 8) return { label: "Weak", color: "bg-orange-500", width: "50%" };
        const hasUpper = /[A-Z]/.test(pw);
        const hasNumber = /[0-9]/.test(pw);
        const hasSpecial = /[^A-Za-z0-9]/.test(pw);
        const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
        if (score >= 2) return { label: "Strong", color: "bg-green-500", width: "100%" };
        return { label: "Fair", color: "bg-yellow-500", width: "75%" };
    };

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
                        {t('acc_back_home')}
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
                                    {/* Avatar */}
                                    {isEditingProfile ? (
                                        <>
                                            {editAvatar ? (
                                                <img src={editAvatar} alt="Preview" className="w-24 h-24 rounded-full border-4 border-amber-500/30 object-cover"
                                                    onError={(e) => { e.target.style.display = 'none'; }} />
                                            ) : (
                                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
                                                    {editName ? editName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : initials}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-4 border-amber-500/30 object-cover" />
                                            ) : (
                                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
                                                    {initials}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Name & Email */}
                                    {isEditingProfile ? (
                                        <div className="mt-4 w-full max-w-sm space-y-3">
                                            <div>
                                                <label className="block text-gray-400 text-xs tracking-widest uppercase mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 transition text-center"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-400 text-xs tracking-widest uppercase mb-1">Avatar URL</label>
                                                <input
                                                    type="url"
                                                    value={editAvatar}
                                                    onChange={(e) => setEditAvatar(e.target.value)}
                                                    placeholder="https://example.com/photo.jpg"
                                                    className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 transition text-center text-sm"
                                                />
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={handleProfileSave}
                                                    disabled={profileSaving}
                                                    className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg text-sm disabled:opacity-60"
                                                >
                                                    {profileSaving ? "Saving..." : "Save Changes"}
                                                </motion.button>
                                                <button
                                                    onClick={() => setIsEditingProfile(false)}
                                                    className="flex-1 py-2 bg-white/5 border border-white/10 text-gray-400 rounded-lg text-sm hover:text-white transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h2 className="text-white text-2xl font-bold mt-4">{user.name}</h2>
                                            <p className="text-gray-400 text-sm">{user.email}</p>
                                            <span className="mt-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs uppercase tracking-widest">
                                                {user.authProvider === "google" ? "Google Account" : "Email Account"}
                                            </span>
                                            <button
                                                onClick={() => { setIsEditingProfile(true); setEditName(user.name); setEditAvatar(user.avatar || ""); }}
                                                className="mt-4 px-5 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-sm hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400 transition-all"
                                            >
                                                ✏️ Edit Profile
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{t('acc_member_since')}</p>
                                        <p className="text-white font-semibold">{memberSince}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{t('acc_saved_trips')}</p>
                                        <p className="text-amber-400 font-bold text-xl">{itineraryCount > 0 ? itineraryCount : "–"}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{t('acc_status')}</p>
                                        <p className="text-green-400 font-semibold">{t('acc_active_yatri')}</p>
                                    </div>
                                </div>

                                <motion.button onClick={handleLogout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all">
                                    {t('acc_logout')}
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
                                            {day.overview && <p className="text-gray-400 text-sm mb-3">{day.overview}</p>}
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
                                            <h3 className="text-white text-lg font-semibold mb-2">{t('acc_no_itineraries')}</h3>
                                            <p className="text-gray-400 text-sm mb-6">{t('acc_no_itineraries_desc')}</p>
                                            <Link to="/create-trip">
                                                <motion.button whileHover={{ scale: 1.02 }}
                                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold">
                                                    {t('acc_plan_trip')}
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
                                    <h3 className="text-white font-semibold mb-4">💬 {t('acc_conversation')}</h3>
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
                                            <h3 className="text-white text-lg font-semibold mb-2">{t('acc_no_chats')}</h3>
                                            <p className="text-gray-400 text-sm mb-6">{t('acc_no_chats_desc')}</p>
                                            <Link to="/create-trip">
                                                <motion.button whileHover={{ scale: 1.02 }}
                                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold">
                                                    {t('acc_start_chatting')}
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

                    {/* ── Settings Tab ── */}
                    {activeTab === "settings" && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="space-y-6">

                            {/* Change Password Section */}
                            {user.authProvider !== "google" && (
                                <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                                    <h3 className="text-white text-lg font-semibold mb-1">{t('acc_change_password')}</h3>
                                    <p className="text-gray-500 text-sm mb-6">{t('acc_change_password_desc')}</p>

                                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                                        <div>
                                            <label className="block text-gray-400 text-xs tracking-widest uppercase mb-1.5">Current Password</label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                required
                                                className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 transition"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-xs tracking-widest uppercase mb-1.5">New Password</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 transition"
                                                placeholder="Min 6 characters"
                                            />
                                            {newPassword && (
                                                <div className="mt-2">
                                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${getStrength(newPassword).color} transition-all duration-300`}
                                                            style={{ width: getStrength(newPassword).width }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">{getStrength(newPassword).label}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-xs tracking-widest uppercase mb-1.5">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={confirmNewPassword}
                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                required
                                                className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 transition"
                                                placeholder="Re-enter new password"
                                            />
                                            {confirmNewPassword && newPassword !== confirmNewPassword && (
                                                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                                            )}
                                        </div>
                                        <motion.button
                                            type="submit"
                                            disabled={passwordSaving || !currentPassword || !newPassword || newPassword !== confirmNewPassword}
                                            whileHover={{ scale: passwordSaving ? 1 : 1.02 }}
                                            whileTap={{ scale: passwordSaving ? 1 : 0.98 }}
                                            className="px-8 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg text-sm shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50"
                                        >
                                            {passwordSaving ? "Updating..." : "Update Password"}
                                        </motion.button>
                                    </form>
                                </div>
                            )}

                            {/* Danger Zone */}
                            <div className="bg-black/70 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 shadow-2xl">
                                <h3 className="text-red-400 text-lg font-semibold mb-1">{t('acc_danger_zone')}</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    Permanently delete your account and all associated data. This action cannot be undone.
                                </p>

                                {!showDeleteConfirm ? (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="px-6 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold rounded-lg text-sm hover:bg-red-500/20 transition-all"
                                    >
                                        {t('acc_delete_account')}
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="space-y-4 max-w-md"
                                    >
                                        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                                            <p className="text-red-300 text-sm font-medium mb-1">This will permanently delete:</p>
                                            <ul className="text-gray-400 text-sm space-y-1 ml-4 list-disc">
                                                <li>Your profile and account data</li>
                                                <li>All saved itineraries</li>
                                                <li>All chat history and sessions</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <label className="block text-gray-400 text-xs tracking-widest uppercase mb-1.5">
                                                Enter your password to confirm
                                            </label>
                                            <input
                                                type="password"
                                                value={deletePassword}
                                                onChange={(e) => setDeletePassword(e.target.value)}
                                                className="w-full bg-white/5 border border-red-500/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-400/60 transition"
                                                placeholder="Your current password"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-400 text-xs tracking-widest uppercase mb-1.5">
                                                Type <span className="text-red-400 font-mono">DELETE</span> to confirm
                                            </label>
                                            <input
                                                type="text"
                                                value={deleteTyped}
                                                onChange={(e) => setDeleteTyped(e.target.value)}
                                                className="w-full bg-white/5 border border-red-500/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-400/60 transition font-mono"
                                                placeholder="DELETE"
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-1">
                                            <motion.button
                                                whileHover={{ scale: deleting ? 1 : 1.02 }}
                                                whileTap={{ scale: deleting ? 1 : 0.98 }}
                                                onClick={handleDeleteAccount}
                                                disabled={deleting || !deletePassword || deleteTyped !== "DELETE"}
                                                className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg text-sm hover:bg-red-500 transition-all disabled:opacity-40"
                                            >
                                                {deleting ? "Deleting..." : "Permanently Delete Account"}
                                            </motion.button>
                                            <button
                                                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteTyped(""); }}
                                                className="px-6 py-2.5 bg-white/5 border border-white/10 text-gray-400 rounded-lg text-sm hover:text-white transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AccountPage;
