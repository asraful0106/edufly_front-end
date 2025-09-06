import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router";

const API = import.meta.env.VITE_BACKEND_LINK || "http://localhost:3010";

/* ---------- small helpers ---------- */
const toDateInput = (v) => {
    if (!v) return "";
    const d = typeof v === "string" ? new Date(v) : v instanceof Date ? v : new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    // normalize to local yyyy-mm-dd
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 10);
};
const yearToDate = (y) => (y ? new Date(`${String(y)}-01-01T00:00:00`) : null);
const dateToYear = (d) => {
    if (!d) return "";
    const dt = typeof d === "string" ? new Date(d) : d;
    return Number.isNaN(dt.getTime()) ? "" : String(dt.getFullYear());
};

/* ---------- small UI bits ---------- */
const LockedField = ({ label, value }) => (
    <label className="block text-sm mb-3">
        <span className="block text-slate-600 mb-1">{label}</span>
        <input className="w-full border rounded px-3 py-2 bg-slate-50" value={value ?? ""} disabled />
    </label>
);
const EditField = ({ label, children }) => (
    <label className="block text-sm mb-3">
        <span className="block text-slate-600 mb-1">{label}</span>
        {children}
    </label>
);
const Field = ({ label, children }) => (
    <label className="block text-sm mb-3">
        <span className="block text-slate-600 mb-1">{label}</span>
        {children}
    </label>
);
const Panel = ({ children }) => <div className="bg-white rounded-2xl shadow p-6">{children}</div>;
const Table = ({ columns = [], data = [], actions }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
            <thead>
                <tr className="border-b bg-slate-50 text-left">
                    {columns.map((c) => (
                        <th key={c.key} className="py-2 px-3 font-semibold text-slate-600">
                            {c.title}
                        </th>
                    ))}
                    {actions && <th className="py-2 px-3" />}
                </tr>
            </thead>
            <tbody>
                {data.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-slate-50">
                        {columns.map((c) => (
                            <td key={c.key} className="py-2 px-3 align-top">
                                {c.render ? c.render(row) : row[c.key] ?? "—"}
                            </td>
                        ))}
                        {actions && <td className="py-2 px-3 text-right">{actions(row)}</td>}
                    </tr>
                ))}
                {data.length === 0 && (
                    <tr>
                        <td colSpan={(columns.length + (actions ? 1 : 0))} className="py-8 text-center text-slate-400">
                            No data
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);

export default function TeacherDashboard() {
    const location = useLocation();

    // get teacher_id from ?teacher_id= or localStorage
    // const teacherId = useMemo(
    //     () =>
    //         new URLSearchParams(location.search).get("teacher_id") ||
    //         localStorage.getItem("edufly_profile")?.teacher_id ||
    //         "",
    //     [location.search]
    // );
    // get teacher_id from ?teacher_id= or localStorage
    const teacherId = useMemo(() => {
        const searchParams = new URLSearchParams(location.search);
        const queryId = searchParams.get("teacher_id");

        const storedProfile = localStorage.getItem("edufly_profile");
        const storedId = storedProfile ? JSON.parse(storedProfile)?.teacher_id : "";

        return queryId || storedId || "";
    }, [location.search]);

    const [me, setMe] = useState(null);
    const [stats, setStats] = useState({
        homeroomSections: 0,
        homeroomClasses: 0,
        assignedCourses: 0,
        pendingApprovals: 0,
    });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    // profile (editable)
    const [form, setForm] = useState({
        about: "",
        phone_number: "",
        date_of_birth: "",
        present_adress: "",
        parmanent_adress: "",
        image: "",
        signature: "",
        blood_group: "",
    });

    // password
    const [pwOpen, setPwOpen] = useState(false);
    const [pw, setPw] = useState({ current_password: "", new_password: "", confirm: "" });

    // degrees
    const [degrees, setDegrees] = useState([]);
    const [degForm, setDegForm] = useState({ title: "", year: "" });
    const [editingDegId, setEditingDegId] = useState(null);

    // achievements
    const [achivs, setAchivs] = useState([]);
    const [achForm, setAchForm] = useState({ title: "", description: "", year: "" });
    const [editingAchId, setEditingAchId] = useState(null);

    const fetchMe = async () => {
        if (!teacherId) {
            setErr("Missing teacher_id (query param or localStorage).");
            return;
        }
        setLoading(true);
        setErr("");
        try {
            // institution_id is optional server-side; omit it to avoid URL parsing issues
            const { data } = await axios.get(`${API}/teacher-profile/me`, {
                params: { teacher_id: teacherId },
            });

            const t = data?.data?.teacher ?? null;
            const s = data?.data?.stats ?? {};
            const degs = data?.data?.degrees ?? [];
            const achs = data?.data?.achievements ?? [];

            setMe(t);
            setStats({
                homeroomSections: s.homeroomSections ?? 0,
                homeroomClasses: s.homeroomClasses ?? 0,
                assignedCourses: s.assignedCourses ?? 0,
                pendingApprovals: s.pendingApprovals ?? 0,
            });

            setDegrees(Array.isArray(degs) ? degs : []);
            setAchivs(Array.isArray(achs) ? achs : []);

            // hydrate editable form safely
            setForm({
                about: t?.about || "",
                phone_number: t?.phone_number || "",
                date_of_birth: toDateInput(t?.date_of_birth),
                present_adress: t?.present_adress || "",
                parmanent_adress: t?.parmanent_adress || "",
                image: t?.image ? `${API}/image/teacher/${t.image}` : "",
                signature: t?.signature || "",
                blood_group: t?.blood_group || "",
            });
        } catch (e) {
            setErr(e?.response?.data?.message || e.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teacherId]);

    const updateProfile = async () => {
        if (!me?.id) return;
        setLoading(true);
        try {
            const { data } = await axios.patch(`${API}/teacher-profile/me/${me.id}`, {
                ...form,
                date_of_birth: form.date_of_birth || null,
            });
            setMe(data?.data || me);
            alert("Profile updated");
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const uploadFile = async (file, kind /* avatar | signature */) => {
        if (!me?.id || !file) return;
        const fd = new FormData();
        fd.append("file", file);
        setLoading(true);
        try {
            const { data } = await axios.post(`${API}/teacher-profile/me/${me.id}/${kind}`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const path = data?.data?.path || "";
            if (kind === "avatar") {
                setForm((f) => ({ ...f, image: path }));
                setMe((m) => ({ ...m, image: path }));
            } else {
                setForm((f) => ({ ...f, signature: path }));
                setMe((m) => ({ ...m, signature: path }));
            }
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async () => {
        if (!me?.id) return;
        if (pw.new_password.length < 6) return alert("New password must be at least 6 characters");
        if (pw.new_password !== pw.confirm) return alert("Password confirmation does not match");
        setLoading(true);
        try {
            await axios.post(`${API}/teacher-profile/me/${me.id}/password`, {
                current_password: pw.current_password,
                new_password: pw.new_password,
            });
            alert("Password changed");
            setPw({ current_password: "", new_password: "", confirm: "" });
            setPwOpen(false);
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    /* -------- Degrees -------- */
    const saveDegree = async () => {
        if (!me?.id) return;
        if (!degForm.title || !degForm.year) return alert("Title and Year are required");
        setLoading(true);
        try {
            if (editingDegId) {
                await axios.patch(`${API}/teacher-profile/me/${me.id}/degrees/${editingDegId}`, {
                    title: degForm.title,
                    passing_year: yearToDate(degForm.year),
                });
            } else {
                await axios.post(`${API}/teacher-profile/me/${me.id}/degrees`, {
                    title: degForm.title,
                    passing_year: yearToDate(degForm.year),
                });
            }
            setDegForm({ title: "", year: "" });
            setEditingDegId(null);
            await fetchMe();
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };
    const editDegree = (row) => {
        setEditingDegId(row.id);
        setDegForm({ title: row.title || "", year: dateToYear(row.passing_year) });
    };
    const deleteDegree = async (id) => {
        if (!me?.id) return;
        if (!confirm("Delete this degree?")) return;
        setLoading(true);
        try {
            await axios.delete(`${API}/teacher-profile/me/${me.id}/degrees/${id}`);
            await fetchMe();
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    /* -------- Achievements -------- */
    const saveAchievement = async () => {
        if (!me?.id) return;
        if (!achForm.title || !achForm.year) return alert("Title and Year are required");
        setLoading(true);
        try {
            if (editingAchId) {
                await axios.patch(`${API}/teacher-profile/me/${me.id}/achievements/${editingAchId}`, {
                    title: achForm.title,
                    description: achForm.description || "",
                    year: yearToDate(achForm.year),
                });
            } else {
                await axios.post(`${API}/teacher-profile/me/${me.id}/achievements`, {
                    title: achForm.title,
                    description: achForm.description || "",
                    year: yearToDate(achForm.year),
                });
            }
            setAchForm({ title: "", description: "", year: "" });
            setEditingAchId(null);
            await fetchMe();
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };
    const editAchievement = (row) => {
        setEditingAchId(row.id);
        setAchForm({
            title: row.title || "",
            description: row.description || "",
            year: dateToYear(row.year),
        });
    };
    const deleteAchievement = async (id) => {
        if (!me?.id) return;
        if (!confirm("Delete this achievement?")) return;
        setLoading(true);
        try {
            await axios.delete(`${API}/teacher-profile/me/${me.id}/achievements/${id}`);
            await fetchMe();
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
                    <p className="text-sm text-slate-500">Profile • Degrees • Achievements</p>
                </div>
                {loading && <span className="text-xs text-slate-500">Loading…</span>}
            </div>

            {err && <div className="p-3 rounded bg-rose-50 text-rose-700 text-sm">{String(err)}</div>}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    ["Homeroom Sections", stats.homeroomSections],
                    ["Homeroom Classes", stats.homeroomClasses],
                    ["Assigned Courses", stats.assignedCourses],
                    ["Pending Approvals", stats.pendingApprovals],
                ].map(([label, val]) => (
                    <div key={label} className="bg-white rounded-2xl shadow p-4">
                        <div className="text-xs text-slate-500">{label}</div>
                        <div className="text-2xl font-semibold">{val ?? 0}</div>
                    </div>
                ))}
            </div>

            {/* Profile */}
            <Panel>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-64">
                        <div className="flex flex-col items-center gap-3">
                            <img
                                src={form.image || "/no_image.png"}
                                alt="avatar"
                                className="w-40 h-40 rounded-full object-cover border"
                            />
                            <div className="flex gap-2">
                                <label className="text-sm px-3 py-1.5 rounded bg-slate-100 cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => uploadFile(e.target.files?.[0], "avatar")}
                                    />
                                    Change Photo
                                </label>
                                <label className="text-sm px-3 py-1.5 rounded bg-slate-100 cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => uploadFile(e.target.files?.[0], "signature")}
                                    />
                                    Upload Signature
                                </label>
                            </div>
                            {form.signature && (
                                <div className="text-xs text-slate-500 truncate max-w-full">Signature: {form.signature}</div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        {/* locked */}
                        <LockedField label="Name (English)" value={me?.name_eng} />
                        <LockedField label="Name (Bangla)" value={me?.name_bng} />
                        <LockedField label="Teacher ID" value={me?.teacher_id} />
                        <LockedField label="Initial" value={me?.teacher_initial} />
                        <LockedField label="Email" value={me?.email} />
                        <LockedField label="Institution ID" value={me?.institution_id} />
                        <LockedField label="Religion" value={me?.religion} />
                        <LockedField label="Gender" value={me?.gender} />
                        <LockedField label="Position" value={me?.position} />
                        <LockedField label="Role" value={me?.role} />

                        {/* editable */}
                        <EditField label="Phone">
                            <input
                                className="w-full border rounded px-3 py-2"
                                value={form.phone_number}
                                onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                            />
                        </EditField>
                        <EditField label="Date of Birth">
                            <input
                                type="date"
                                className="w-full border rounded px-3 py-2"
                                value={form.date_of_birth}
                                onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
                            />
                        </EditField>
                        <EditField label="Blood Group">
                            <input
                                className="w-full border rounded px-3 py-2"
                                value={form.blood_group}
                                onChange={(e) => setForm((f) => ({ ...f, blood_group: e.target.value }))}
                            />
                        </EditField>
                        <EditField label="About">
                            <textarea
                                className="w-full border rounded px-3 py-2 min-h-[84px]"
                                value={form.about}
                                onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
                            />
                        </EditField>
                        <EditField label="Present Address">
                            <input
                                className="w-full border rounded px-3 py-2"
                                value={form.present_adress}
                                onChange={(e) => setForm((f) => ({ ...f, present_adress: e.target.value }))}
                            />
                        </EditField>
                        <EditField label="Permanent Address">
                            <input
                                className="w-full border rounded px-3 py-2"
                                value={form.parmanent_adress}
                                onChange={(e) => setForm((f) => ({ ...f, parmanent_adress: e.target.value }))}
                            />
                        </EditField>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <button
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                        onClick={updateProfile}
                        disabled={!me?.id}
                    >
                        Save Changes
                    </button>
                    <button
                        className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200"
                        onClick={() => setPwOpen((s) => !s)}
                        disabled={!me?.id}
                    >
                        {pwOpen ? "Close Password Form" : "Change Password"}
                    </button>
                </div>

                {pwOpen && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <EditField label="Current Password">
                            <input
                                type="password"
                                className="w-full border rounded px-3 py-2"
                                value={pw.current_password}
                                onChange={(e) => setPw((p) => ({ ...p, current_password: e.target.value }))}
                            />
                        </EditField>
                        <EditField label="New Password">
                            <input
                                type="password"
                                className="w-full border rounded px-3 py-2"
                                value={pw.new_password}
                                onChange={(e) => setPw((p) => ({ ...p, new_password: e.target.value }))}
                            />
                        </EditField>
                        <EditField label="Confirm New Password">
                            <input
                                type="password"
                                className="w-full border rounded px-3 py-2"
                                value={pw.confirm}
                                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                            />
                        </EditField>
                        <div>
                            <button
                                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                                onClick={changePassword}
                                disabled={!me?.id}
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                )}
            </Panel>

            {/* Degrees */}
            <Panel>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Degrees</h2>
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200"
                            onClick={() => {
                                setEditingDegId(null);
                                setDegForm({ title: "", year: "" });
                            }}
                        >
                            Reset
                        </button>
                        <button
                            className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                            onClick={saveDegree}
                            disabled={!me?.id}
                        >
                            {editingDegId ? "Update Degree" : "Add Degree"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Field label="Title">
                        <input
                            className="w-full border rounded px-3 py-2"
                            value={degForm.title}
                            onChange={(e) => setDegForm((v) => ({ ...v, title: e.target.value }))}
                            placeholder="B.Sc in Physics"
                        />
                    </Field>
                    <Field label="Passing Year (YYYY)">
                        <input
                            className="w-full border rounded px-3 py-2"
                            value={degForm.year}
                            onChange={(e) => setDegForm((v) => ({ ...v, year: e.target.value.replace(/\D/g, "") }))}
                            maxLength={4}
                            placeholder="2020"
                        />
                    </Field>
                </div>

                <Table
                    columns={[
                        { key: "title", title: "Title" },
                        { key: "passing_year", title: "Year", render: (r) => dateToYear(r.passing_year) },
                    ]}
                    data={degrees}
                    actions={(row) => (
                        <div className="flex gap-2 justify-end">
                            <button className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200" onClick={() => editDegree(row)}>
                                Edit
                            </button>
                            <button
                                className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                onClick={() => deleteDegree(row.id)}
                            >
                                Delete
                            </button>
                        </div>
                    )}
                />
            </Panel>

            {/* Achievements */}
            <Panel>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Achievements</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Field label="Title">
                        <input
                            className="w-full border rounded px-3 py-2"
                            value={achForm.title}
                            onChange={(e) => setAchForm((v) => ({ ...v, title: e.target.value }))}
                            placeholder="Best Teacher Award"
                        />
                    </Field>
                    <Field label="Year (YYYY)">
                        <input
                            className="w-full border rounded px-3 py-2"
                            value={achForm.year}
                            onChange={(e) => setAchForm((v) => ({ ...v, year: e.target.value.replace(/\D/g, "") }))}
                            maxLength={4}
                            placeholder="2023"
                        />
                    </Field>
                    <Field label="Description (optional)">
                        <input
                            className="w-full border rounded px-3 py-2"
                            value={achForm.description}
                            onChange={(e) => setAchForm((v) => ({ ...v, description: e.target.value }))}
                            placeholder="Awarded by…"
                        />
                    </Field>
                </div>

                <div className="flex gap-2 mb-6">
                    <button
                        className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200"
                        onClick={() => {
                            setEditingAchId(null);
                            setAchForm({ title: "", description: "", year: "" });
                        }}
                    >
                        Reset
                    </button>
                    <button
                        className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                        onClick={saveAchievement}
                        disabled={!me?.id}
                    >
                        {editingAchId ? "Update Achievement" : "Add Achievement"}
                    </button>
                </div>

                <Table
                    columns={[
                        { key: "title", title: "Title" },
                        { key: "year", title: "Year", render: (r) => dateToYear(r.year) },
                        { key: "description", title: "Description" },
                    ]}
                    data={achivs}
                    actions={(row) => (
                        <div className="flex gap-2 justify-end">
                            <button className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200" onClick={() => editAchievement(row)}>
                                Edit
                            </button>
                            <button
                                className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                onClick={() => deleteAchievement(row.id)}
                            >
                                Delete
                            </button>
                        </div>
                    )}
                />
            </Panel>
        </div>
    );
}
