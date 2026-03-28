import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem("brajyatra-token"));
    const [isLoading, setIsLoading] = useState(true);

    // Verify token on mount
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const res = await fetch(`${API_BASE}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.success && data.user) {
                    setUser(data.user);
                } else {
                    // Token invalid — clear it
                    localStorage.removeItem("brajyatra-token");
                    setToken(null);
                    setUser(null);
                }
            } catch {
                localStorage.removeItem("brajyatra-token");
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        verifyToken();
    }, [token]);

    const login = useCallback((newToken, userData) => {
        localStorage.setItem("brajyatra-token", newToken);
        setToken(newToken);
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("brajyatra-token");
        setToken(null);
        setUser(null);
    }, []);

    const value = {
        user,
        token,
        isLoading,
        isLoggedIn: !!user,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
};

export default AuthContext;
