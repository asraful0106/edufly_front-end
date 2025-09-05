import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [profile, setProfile] = useState(() => {
        const raw = localStorage.getItem("edufly_profile");
        return raw ? JSON.parse(raw) : null;
    });

    useEffect(() => {
        // try to hydrate from server if we don't have a profile yet
        if (!profile) {
            (async () => {
                try {
                    const { data } = await api.get("/auth/me");
                    setProfile(data.profile);
                } catch {
                    // silently ignore; user remains unauthenticated
                }
            })();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run once on mount

    const isAuthenticated = !!profile;

    useEffect(() => {
        if (profile) localStorage.setItem("edufly_profile", JSON.stringify(profile));
        else localStorage.removeItem("edufly_profile");
    }, [profile]);

    async function login({ role, email, password }) {
        const { data } = await api.post("/auth/login", { role, email, password });
        // backend returns { profile: { role, institution_id, teacher_id, student_id } }
        setProfile(data.profile);
        return data.profile;
    }

    async function logout() {
        try { await api.post("/auth/logout"); } catch (err){ console.log(err) }
        setProfile(null);
    }

    async function hydrate() {
        try {
            const { data } = await api.get("/auth/me");
            setProfile(data.profile);
        } catch {
            setProfile(null);
        }
    }

    const value = useMemo(() => ({ profile, isAuthenticated, login, logout, hydrate }), [profile]);
    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
