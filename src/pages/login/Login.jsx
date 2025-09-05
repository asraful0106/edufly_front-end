import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contextapi/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();

    const [form, setForm] = useState({ role: "institution", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function onSubmit(e) {
        e.preventDefault();
        setLoading(true); setError("");
        try {
            const p = await login(form);
            const base = `/${p.institution_id}/dashboard`;
            if (p.role === "institution") nav(`${base}`);
            if (p.role === "teacher") nav(`${base}/teacher`);
            if (p.role === "student") nav(`${base}/student`);
        } catch (err) {
            setError(err?.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f6f7f9", padding: "16px" }}>
            <form onSubmit={onSubmit} style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,.06)", padding: 24 }}>
                <h1 style={{ fontSize: 22, marginBottom: 16 }}>Sign in to Edufly</h1>

                <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Role</label>
                <select value={form.role} onChange={(e) => setForm(s => ({ ...s, role: e.target.value }))}
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #dcdfe4", marginBottom: 12 }}>
                    <option value="institution">Institution (Admin)</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                </select>

                <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Email</label>
                <input required type="email" value={form.email}
                    onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))}
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #dcdfe4", marginBottom: 12 }} />

                <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Password</label>
                <input required type="password" value={form.password}
                    onChange={(e) => setForm(s => ({ ...s, password: e.target.value }))}
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #dcdfe4", marginBottom: 12 }} />

                {error && <div style={{ color: "#d11", fontSize: 13, marginBottom: 8 }}>{error}</div>}

                <button disabled={loading}
                    style={{ width: "100%", padding: 12, borderRadius: 12, border: "0", background: "#111", color: "#fff", opacity: loading ? 0.7 : 1 }}>
                    {loading ? "Signing in…" : "Sign in"}
                </button>
            </form>
        </div>
    );
}
