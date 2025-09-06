import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../contextapi/AuthContext";

const API = import.meta.env.VITE_BACKEND_LINK || "http://localhost:3010";

const R_ONLY_KEYS = [
    "batch_id", "class_id", "section_id", "class_roll",
    "name_eng", "name_bng", "student_id", "teacher_initial",
    "institution_id", "fingerprint", "email", "religion", "gender",
    "position", "role", "status"
];

// student can edit ONLY these:
const EDITABLE_KEYS = [
    "phone_number", "date_of_birth", "present_adress", "parmanent_adress",
    "blood_group"
];

export default function StudentDashboard() {
    const { profile } = useAuth();
    const studentId = profile?.student_id; // stored by your auth
    const [loading, setLoading] = useState(false);
    const [student, setStudent] = useState(null);
    const [form, setForm] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [signatureFile, setSignatureFile] = useState(null);
    const [msg, setMsg] = useState("");

    const avatar = useMemo(() => {
        const f = student?.image;
        if (!f) return "/no_image.png";
        return f.startsWith("http") ? f : `${API}/image/student/${f}`;
    }, [student]);

    const placement = useMemo(() => ({
        batch: student?.batch?.batch_code,
        class: student?.class ? (student.class.title || `${student.class.batch_code} - ${student.class.course?.title}`) : null,
        section: student?.section?.section_name
    }), [student]);

    async function fetchMe() {
        if (!studentId) return;
        setLoading(true);
        try {
            const { data } = await axios.get(`${API}/student-profile/me`, {
                params: { student_id: studentId }
            });
            const s = data?.data;
            setStudent(s);
            // seed only editable fields into form
            const f = {};
            EDITABLE_KEYS.forEach(k => { f[k] = s?.[k] ?? ""; });
            if (f.date_of_birth) f.date_of_birth = f.date_of_birth.slice(0, 10);
            setForm(f);
        } catch (e) {
            setMsg(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchMe(); /* eslint-disable-next-line */ }, [studentId]);

    const onChange = (key) => (e) => setForm(v => ({ ...v, [key]: e.target.value }));

    async function onSave() {
        if (!student?.id) return;
        setLoading(true);
        setMsg("");
        try {
            const fd = new FormData();
            fd.append("student_id", student.id); // internal id (UUID)
            EDITABLE_KEYS.forEach(k => {
                if (form[k] !== undefined && form[k] !== null) fd.append(k, form[k]);
            });
            if (imageFile) fd.append("image", imageFile);
            if (signatureFile) fd.append("signature", signatureFile);

            await axios.patch(`${API}/student-profile/me`, fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            await fetchMe();
            setImageFile(null);
            setSignatureFile(null);
            setMsg("Saved!");
        } catch (e) {
            setMsg(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Student Dashboard</h1>
                {loading && <span className="text-xs text-slate-500">Loading…</span>}
            </div>

            {msg && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm">{msg}</div>
            )}

            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow p-6 grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6">
                <div className="flex flex-col items-center gap-3">
                    <img src={avatar} alt="avatar" className="w-28 h-28 rounded-full object-cover border" />
                    <label className="text-xs w-full">
                        <span className="block mb-1 text-slate-600">Change photo</span>
                        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                    </label>
                    <label className="text-xs w-full">
                        <span className="block mb-1 text-slate-600">Upload signature</span>
                        <input type="file" accept="image/*" onChange={(e) => setSignatureFile(e.target.files?.[0] || null)} />
                    </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* read-only */}
                    <FieldRO label="Name (EN)" value={student?.name_eng} />
                    <FieldRO label="Name (BN)" value={student?.name_bng} />
                    <FieldRO label="Student ID" value={student?.student_id} />
                    <FieldRO label="Email" value={student?.email} />
                    <FieldRO label="Batch" value={placement.batch} />
                    <FieldRO label="Class" value={placement.class} />
                    <FieldRO label="Section" value={placement.section} />
                    <FieldRO label="Class Roll" value={student?.class_roll} />
                    <FieldRO label="Gender" value={student?.gender} />
                    <FieldRO label="Religion" value={student?.religion} />
                    <FieldRO label="Status" value={student?.status} />
                </div>
            </div>

            {/* Editable card */}
            <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Edit Personal Info</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchMe}
                            className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200"
                        >Reset</button>
                        <button
                            onClick={onSave}
                            className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                        >Save Changes</button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <Field label="Phone Number">
                        <input className="w-full border rounded px-3 py-2" value={form.phone_number || ""} onChange={onChange("phone_number")} />
                    </Field>
                    <Field label="Date of Birth">
                        <input type="date" className="w-full border rounded px-3 py-2" value={form.date_of_birth || ""} onChange={onChange("date_of_birth")} />
                    </Field>
                    <Field label="Blood Group">
                        <input className="w-full border rounded px-3 py-2" value={form.blood_group || ""} onChange={onChange("blood_group")} placeholder="A+ / O- ..." />
                    </Field>
                    <Field className="md:col-span-3" label="Present Address">
                        <input className="w-full border rounded px-3 py-2" value={form.present_adress || ""} onChange={onChange("present_adress")} />
                    </Field>
                    <Field className="md:col-span-3" label="Permanent Address">
                        <input className="w-full border rounded px-3 py-2" value={form.parmanent_adress || ""} onChange={onChange("parmanent_adress")} />
                    </Field>
                </div>
            </div>

            {/* Security (optional) */}
            <PasswordCard studentUuid={student?.id} onSaved={setMsg} />
        </div>
    );
}

const Field = ({ label, className = "", children }) => (
    <label className={`block text-sm ${className}`}>
        <span className="block text-slate-600 mb-1">{label}</span>
        {children}
    </label>
);

const FieldRO = ({ label, value }) => (
    <div className="text-sm">
        <div className="text-slate-500">{label}</div>
        <div className="font-medium">{value ?? "—"}</div>
    </div>
);

function PasswordCard({ studentUuid, onSaved }) {
    const [oldp, setOldp] = useState("");
    const [newp, setNewp] = useState("");
    const [busy, setBusy] = useState(false);

    const API = import.meta.env.VITE_BACKEND_LINK || "http://localhost:3010";

    async function change() {
        if (!studentUuid || !newp) return;
        setBusy(true);
        try {
            await axios.post(`${API}/student-profile/change-password`, {
                student_id: studentUuid, old_password: oldp, new_password: newp
            });
            setOldp(""); setNewp("");
            onSaved?.("Password updated");
        } catch (e) {
            onSaved?.(e?.response?.data?.message || e.message);
        } finally { setBusy(false); }
    }

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-medium mb-4">Security</h2>
            <div className="grid md:grid-cols-3 gap-4">
                <Field label="Current Password">
                    <input type="password" className="w-full border rounded px-3 py-2" value={oldp} onChange={e => setOldp(e.target.value)} />
                </Field>
                <Field label="New Password">
                    <input type="password" className="w-full border rounded px-3 py-2" value={newp} onChange={e => setNewp(e.target.value)} />
                </Field>
                <div className="flex items-end">
                    <button disabled={busy} onClick={change} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                        {busy ? "Saving…" : "Update Password"}
                    </button>
                </div>
            </div>
        </div>
    );
}
