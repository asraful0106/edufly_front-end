// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation } from "react-router";
// import http from "../../api/http";

// const emptyStudent = {
//     name_eng: "",
//     name_bng: "",
//     student_id: "",
//     class_roll: "",
//     email: "",
//     phone_number: "",
//     date_of_birth: "",
//     religion: "islam",
//     gender: "male",
//     present_adress: "",
//     parmanent_adress: "",
//     signature: "",
//     blood_group: "",
//     role: "student",
//     status: "current",
//     image: "",
// };

// export default function ManageStudent() {
//     const location = useLocation();
//     const institutionId = useMemo(() => {
//         const m = location.pathname.match(/\/(\w+)(?:\/|$)/); // matches /:eiin
//         return m ? m[1] : null;
//     }, [location.pathname]);

//     const [q, setQ] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");

//     const [students, setStudents] = useState([]);
//     const [total, setTotal] = useState(0);

//     const [batches, setBatches] = useState([]);
//     const [classes, setClasses] = useState([]);
//     const [sectionsByClass, setSectionsByClass] = useState({}); // cache {class_id: []}

//     const [placementDraft, setPlacementDraft] = useState({}); // {studentId: {batch_id, class_id, section_id}}
//     const [editId, setEditId] = useState(null);
//     const [form, setForm] = useState(emptyStudent);

//     const [filters, setFilters] = useState({ batch_id: "", class_id: "", section_id: "" });

//     // Fetch base data
//     const loadRefs = async () => {
//         if (!institutionId) return;
//         setLoading(true); setError("");
//         try {
//             const [b, c] = await Promise.all([
//                 http.get("/batch", { params: { institution_id: institutionId } }),
//                 http.get("/classes", { params: { institution_id: institutionId } }),
//             ]);
//             setBatches(b.data.data || []);
//             setClasses(c.data.data || []); // each has course + batch_code
//         } catch (e) {
//             setError(e?.response?.data?.message || e.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const loadStudents = async () => {
//         if (!institutionId) return;
//         setLoading(true); setError("");
//         try {
//             // const resp = await http.get("/student", {
//             //     params: {
//             //         institution_id: institutionId,
//             //         q,
//             //         batch_id: filters.batch_id || undefined,
//             //         class_id: filters.class_id || undefined,
//             //         section_id: filters.section_id || undefined,
//             //         skip: 0,
//             //         take: 50,
//             //     },
//             // });
//             const resp = await http.get(`/student/${institutionId}`);
//             setStudents(resp.data.data || []);
//             setTotal(resp.data.total || 0);
//         } catch (e) {
//             setError(e?.response?.data?.message || e.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { loadRefs(); /* eslint-disable-next-line */ }, [institutionId]);
//     useEffect(() => { loadStudents(); /* eslint-disable-next-line */ }, [institutionId, q, filters.batch_id, filters.class_id, filters.section_id]);

//     // Sections fetcher (per class, cached)
//     const ensureSections = async (class_id) => {
//         if (!class_id || sectionsByClass[class_id]) return;
//         try {
//             const resp = await http.get("/sections", { params: { class_id } });
//             setSectionsByClass((m) => ({ ...m, [class_id]: resp.data.data || [] }));
//         } catch (e) {
//             console.warn("Failed to load sections for class", class_id, e?.message);
//         }
//     };

//     // Inline placement draft helpers
//     const startDraft = (s) => {
//         const draft = placementDraft[s.id] || {
//             batch_id: s.batch?.id || "",
//             class_id: s.class?.id || "",
//             section_id: s.section?.id || "",
//         };
//         // Preload sections if class set
//         if (draft.class_id) ensureSections(draft.class_id);
//         setPlacementDraft((v) => ({ ...v, [s.id]: draft }));
//     };

//     const setDraft = (sid, patch) => {
//         setPlacementDraft((v) => {
//             const next = { ...(v[sid] || {}), ...patch };
//             return { ...v, [sid]: next };
//         });
//     };

//     const savePlacement = async (sid) => {
//         const draft = placementDraft[sid];
//         if (!draft) return;
//         setLoading(true);
//         try {
//             const resp = await http.patch(`/student/${sid}/placement`, {
//                 batch_id: draft.batch_id || null,
//                 class_id: draft.class_id || null,
//                 section_id: draft.section_id || null,
//             });
//             // Merge result onto the row
//             setStudents((rows) => rows.map((r) => (r.id === sid ? resp.data.data : r)));
//             // Clear draft
//             setPlacementDraft((v) => { const x = { ...v }; delete x[sid]; return x; });
//         } catch (e) {
//             alert(e?.response?.data?.message || e.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const deleteStudent = async (sid) => {
//         if (!confirm("Delete this student?")) return;
//         setLoading(true);
//         try {
//             await http.delete(`/student/${sid}`);
//             setStudents((rows) => rows.filter((r) => r.id !== sid));
//         } catch (e) {
//             alert(e?.response?.data?.message || e.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const openEdit = (s) => {
//         setEditId(s.id);
//         setForm({
//             name_eng: s.name_eng || "",
//             name_bng: s.name_bng || "",
//             student_id: s.student_id || "",
//             class_roll: s.class_roll || "",
//             email: s.email || "",
//             phone_number: s.phone_number || "",
//             date_of_birth: s.date_of_birth ? s.date_of_birth.slice(0, 10) : "",
//             religion: s.religion || "islam",
//             gender: s.gender || "male",
//             present_adress: s.present_adress || "",
//             parmanent_adress: s.parmanent_adress || "",
//             signature: s.signature || "",
//             blood_group: s.blood_group || "",
//             role: s.role || "student",
//             status: s.status || "current",
//             image: s.image || "",
//         });
//     };

//     const saveEdit = async () => {
//         if (!editId) return;
//         setLoading(true);
//         try {
//             const resp = await http.patch(`/student/${editId}`, { ...form });
//             setStudents((rows) => rows.map((r) => (r.id === editId ? { ...r, ...resp.data.data } : r)));
//             setEditId(null);
//             setForm(emptyStudent);
//         } catch (e) {
//             alert(e?.response?.data?.message || e.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // UI helpers
//     const Field = ({ label, children }) => (
//         <label className="block text-sm mb-3">
//             <span className="block text-slate-600 mb-1">{label}</span>
//             {children}
//         </label>
//     );
//     const Panel = ({ children }) => <div className="bg-white rounded-2xl shadow p-6">{children}</div>;

//     // Derived: classes grouped by batch_code
//     const classesByBatchCode = useMemo(() => {
//         const map = {};
//         classes.forEach((c) => {
//             (map[c.batch_code] ||= []).push(c);
//         });
//         return map;
//     }, [classes]);

//     return (
//         <div className="p-6 space-y-6">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-2xl font-semibold">Students</h1>
//                     {loading && <p className="text-xs text-slate-500 mt-1">Loading…</p>}
//                     {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <input
//                         className="border rounded px-3 py-2 text-sm"
//                         placeholder="Search ID, name, email, phone…"
//                         value={q}
//                         onChange={(e) => setQ(e.target.value)}
//                     />
//                     <button
//                         className="px-3 py-2 rounded bg-slate-900 text-white text-sm"
//                         onClick={loadStudents}
//                     >
//                         Search
//                     </button>
//                 </div>
//             </div>

//             <Panel>
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
//                     <Field label="Filter by Batch">
//                         <select
//                             className="w-full border rounded px-3 py-2"
//                             value={filters.batch_id}
//                             onChange={(e) => setFilters((v) => ({ ...v, batch_id: e.target.value, class_id: "", section_id: "" }))}
//                         >
//                             <option value="">All</option>
//                             {batches.map((b) => (
//                                 <option key={b.id} value={b.id}>{b.batch_code}</option>
//                             ))}
//                         </select>
//                     </Field>
//                     <Field label="Filter by Class">
//                         <select
//                             className="w-full border rounded px-3 py-2"
//                             value={filters.class_id}
//                             onChange={async (e) => {
//                                 const val = e.target.value;
//                                 setFilters((v) => ({ ...v, class_id: val, section_id: "" }));
//                                 if (val) await ensureSections(val);
//                             }}
//                         >
//                             <option value="">All</option>
//                             {(() => {
//                                 // If a batch filter is chosen, only show classes from that batch_code
//                                 const code = batches.find((b) => b.id === filters.batch_id)?.batch_code;
//                                 const list = code ? (classesByBatchCode[code] || []) : classes;
//                                 return list.map((c) => (
//                                     <option key={c.id} value={c.id}>
//                                         {c.title || `${c.batch_code} - ${c.course?.title}`}
//                                     </option>
//                                 ));
//                             })()}
//                         </select>
//                     </Field>
//                     <Field label="Filter by Section">
//                         <select
//                             className="w-full border rounded px-3 py-2"
//                             value={filters.section_id}
//                             onChange={(e) => setFilters((v) => ({ ...v, section_id: e.target.value }))}
//                         >
//                             <option value="">All</option>
//                             {(filters.class_id ? (sectionsByClass[filters.class_id] || []) : []).map((s) => (
//                                 <option key={s.id} value={s.id}>{s.section_name}</option>
//                             ))}
//                         </select>
//                     </Field>
//                     <div className="flex items-end">
//                         <span className="text-sm text-slate-500">Total: {total}</span>
//                     </div>
//                 </div>

//                 {/* Table */}
//                 <div className="overflow-x-auto">
//                     <table className="min-w-full text-sm">
//                         <thead>
//                             <tr className="border-b bg-slate-50 text-left">
//                                 <th className="py-2 px-3 font-semibold text-slate-600">Student</th>
//                                 <th className="py-2 px-3 font-semibold text-slate-600">ID / Roll</th>
//                                 <th className="py-2 px-3 font-semibold text-slate-600">Batch</th>
//                                 <th className="py-2 px-3 font-semibold text-slate-600">Class</th>
//                                 <th className="py-2 px-3 font-semibold text-slate-600">Section</th>
//                                 <th className="py-2 px-3" />
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {students.map((s) => {
//                                 const draft = placementDraft[s.id];
//                                 const currentBatchCode = (draft?.batch_id
//                                     ? batches.find((b) => b.id === draft.batch_id)?.batch_code
//                                     : s.batch?.batch_code) || "";

//                                 const classOptions = currentBatchCode
//                                     ? (classesByBatchCode[currentBatchCode] || [])
//                                     : classes;

//                                 const selectedClassId = draft?.class_id || s.class?.id || "";
//                                 const sectionOptions = selectedClassId
//                                     ? (sectionsByClass[selectedClassId] || [])
//                                     : [];

//                                 return (
//                                     <tr key={s.id} className="border-b">
//                                         <td className="py-2 px-3">
//                                             <div className="flex items-center gap-3">
//                                                 <img
//                                                     src={`${import.meta.env.VITE_BACKEND_LINK}/image/student/${s.image}`}
//                                                     alt={s.name_eng}
//                                                     className="h-9 w-9 rounded-full object-cover border"
//                                                     onError={(e) => (e.currentTarget.src = "/no_image.png")}
//                                                 />
//                                                 <div className="leading-tight">
//                                                     <div className="font-medium">{s.name_eng}</div>
//                                                     <div className="text-xs text-slate-500">{s.email}</div>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="py-2 px-3">
//                                             <div className="leading-tight">
//                                                 <div>{s.student_id}</div>
//                                                 <div className="text-xs text-slate-500">Roll: {s.class_roll}</div>
//                                             </div>
//                                         </td>

//                                         {/* Batch */}
//                                         <td className="py-2 px-3">
//                                             <select
//                                                 className="border rounded px-2 py-1"
//                                                 value={draft ? draft.batch_id : (s.batch?.id || "")}
//                                                 onChange={(e) => {
//                                                     startDraft(s);
//                                                     const val = e.target.value;
//                                                     // Changing batch resets class & section
//                                                     setDraft(s.id, { batch_id: val, class_id: "", section_id: "" });
//                                                 }}
//                                             >
//                                                 <option value="">—</option>
//                                                 {batches.map((b) => (
//                                                     <option key={b.id} value={b.id}>{b.batch_code}</option>
//                                                 ))}
//                                             </select>
//                                         </td>

//                                         {/* Class */}
//                                         <td className="py-2 px-3">
//                                             <select
//                                                 className="border rounded px-2 py-1"
//                                                 value={draft ? draft.class_id : (s.class?.id || "")}
//                                                 onChange={async (e) => {
//                                                     startDraft(s);
//                                                     const val = e.target.value;
//                                                     setDraft(s.id, { class_id: val, section_id: "" });
//                                                     if (val) await ensureSections(val);
//                                                 }}
//                                                 onFocus={() => startDraft(s)}
//                                             >
//                                                 <option value="">—</option>
//                                                 {classOptions.map((c) => (
//                                                     <option key={c.id} value={c.id}>
//                                                         {c.title || `${c.batch_code} - ${c.course?.title}`}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </td>

//                                         {/* Section */}
//                                         <td className="py-2 px-3">
//                                             <select
//                                                 className="border rounded px-2 py-1"
//                                                 value={draft ? draft.section_id : (s.section?.id || "")}
//                                                 onChange={(e) => {
//                                                     startDraft(s);
//                                                     setDraft(s.id, { section_id: e.target.value });
//                                                 }}
//                                                 onFocus={() => startDraft(s)}
//                                             >
//                                                 <option value="">—</option>
//                                                 {sectionOptions.map((sec) => (
//                                                     <option key={sec.id} value={sec.id}>{sec.section_name}</option>
//                                                 ))}
//                                             </select>
//                                         </td>

//                                         <td className="py-2 px-3 text-right">
//                                             {draft ? (
//                                                 <div className="flex gap-2 justify-end">
//                                                     <button
//                                                         className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
//                                                         onClick={() => setPlacementDraft((v) => { const x = { ...v }; delete x[s.id]; return x; })}
//                                                     >
//                                                         Cancel
//                                                     </button>
//                                                     <button
//                                                         className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
//                                                         onClick={() => savePlacement(s.id)}
//                                                     >
//                                                         Save
//                                                     </button>
//                                                 </div>
//                                             ) : (
//                                                 <div className="flex gap-2 justify-end">
//                                                     <button
//                                                         className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
//                                                         onClick={() => openEdit(s)}
//                                                     >
//                                                         Edit
//                                                     </button>
//                                                     <button
//                                                         className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
//                                                         onClick={() => deleteStudent(s.id)}
//                                                     >
//                                                         Delete
//                                                     </button>
//                                                 </div>
//                                             )}
//                                         </td>
//                                     </tr>
//                                 );
//                             })}

//                             {students.length === 0 && (
//                                 <tr>
//                                     <td colSpan={6} className="py-10 text-center text-slate-400">No students found</td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </Panel>

//             {/* Edit Drawer */}
//             {editId && (
//                 <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setEditId(null)}>
//                     <div
//                         className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-xl p-6 overflow-y-auto"
//                         onClick={(e) => e.stopPropagation()}
//                     >
//                         <div className="flex items-center justify-between mb-4">
//                             <h2 className="text-lg font-medium">Edit Student</h2>
//                             <button className="text-slate-500 hover:text-black" onClick={() => setEditId(null)}>✕</button>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <Field label="Name (English)"><input className="w-full border rounded px-3 py-2" value={form.name_eng} onChange={(e) => setForm(v => ({ ...v, name_eng: e.target.value }))} /></Field>
//                             <Field label="Name (Bangla)"><input className="w-full border rounded px-3 py-2" value={form.name_bng} onChange={(e) => setForm(v => ({ ...v, name_bng: e.target.value }))} /></Field>
//                             <Field label="Student ID"><input className="w-full border rounded px-3 py-2" value={form.student_id} onChange={(e) => setForm(v => ({ ...v, student_id: e.target.value }))} /></Field>
//                             <Field label="Class Roll"><input className="w-full border rounded px-3 py-2" value={form.class_roll} onChange={(e) => setForm(v => ({ ...v, class_roll: e.target.value }))} /></Field>
//                             <Field label="Email"><input type="email" className="w-full border rounded px-3 py-2" value={form.email} onChange={(e) => setForm(v => ({ ...v, email: e.target.value }))} /></Field>
//                             <Field label="Phone"><input className="w-full border rounded px-3 py-2" value={form.phone_number} onChange={(e) => setForm(v => ({ ...v, phone_number: e.target.value }))} /></Field>
//                             <Field label="DOB"><input type="date" className="w-full border rounded px-3 py-2" value={form.date_of_birth} onChange={(e) => setForm(v => ({ ...v, date_of_birth: e.target.value }))} /></Field>
//                             <Field label="Gender">
//                                 <select className="w-full border rounded px-3 py-2" value={form.gender} onChange={(e) => setForm(v => ({ ...v, gender: e.target.value }))}>
//                                     <option value="male">Male</option>
//                                     <option value="female">Female</option>
//                                     <option value="others">Others</option>
//                                 </select>
//                             </Field>
//                             <Field label="Religion">
//                                 <select className="w-full border rounded px-3 py-2" value={form.religion} onChange={(e) => setForm(v => ({ ...v, religion: e.target.value }))}>
//                                     <option value="islam">Islam</option>
//                                     <option value="hindu">Hindu</option>
//                                     <option value="buddhist">Buddhist</option>
//                                     <option value="christian">Christian</option>
//                                     <option value="others">Others</option>
//                                 </select>
//                             </Field>
//                             <Field label="Status">
//                                 <select className="w-full border rounded px-3 py-2" value={form.status} onChange={(e) => setForm(v => ({ ...v, status: e.target.value }))}>
//                                     <option value="current">Current</option>
//                                     <option value="alumni">Alumni</option>
//                                     <option value="dropout">Dropout</option>
//                                     <option value="rusticated">Rusticated</option>
//                                 </select>
//                             </Field>
//                             <Field label="Image URL"><input className="w-full border rounded px-3 py-2" value={form.image} onChange={(e) => setForm(v => ({ ...v, image: e.target.value }))} /></Field>
//                             <Field label="Present Address"><input className="w-full border rounded px-3 py-2" value={form.present_adress} onChange={(e) => setForm(v => ({ ...v, present_adress: e.target.value }))} /></Field>
//                             <Field label="Permanent Address"><input className="w-full border rounded px-3 py-2" value={form.parmanent_adress} onChange={(e) => setForm(v => ({ ...v, parmanent_adress: e.target.value }))} /></Field>
//                             <Field label="Blood Group"><input className="w-full border rounded px-3 py-2" value={form.blood_group} onChange={(e) => setForm(v => ({ ...v, blood_group: e.target.value }))} /></Field>
//                             <Field label="Signature (URL)"><input className="w-full border rounded px-3 py-2" value={form.signature} onChange={(e) => setForm(v => ({ ...v, signature: e.target.value }))} /></Field>
//                         </div>

//                         <div className="flex justify-end gap-2 mt-6">
//                             <button className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200" onClick={() => setEditId(null)}>Cancel</button>
//                             <button className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={saveEdit}>Save</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom"; // IMPORTANT: react-router-dom
import http from "../../api/http";

const emptyStudent = {
    name_eng: "",
    name_bng: "",
    student_id: "",
    class_roll: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    religion: "islam",
    gender: "male",
    present_adress: "",
    parmanent_adress: "",
    signature: "",
    blood_group: "",
    role: "student",
    status: "current",
    image: "",
};

// helper to consistently store IDs as strings in selects/state
const asId = (v) => (v === undefined || v === null ? "" : String(v));

export default function ManageStudent() {
    const location = useLocation();
    const institutionId = useMemo(() => {
        const m = location.pathname.match(/\/([^/]+)(?:\/|$)/);
        return m ? m[1] : null;
    }, [location.pathname]);

    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [students, setStudents] = useState([]);
    const [total, setTotal] = useState(0);

    const [batches, setBatches] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sectionsByClass, setSectionsByClass] = useState({}); // { [class_id]: Section[] }

    const [placementDraft, setPlacementDraft] = useState({}); // { [studentId]: {batch_id, class_id, section_id} }
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyStudent);

    const [filters, setFilters] = useState({ batch_id: "", class_id: "", section_id: "" });

    // Load static refs
    const loadRefs = async () => {
        if (!institutionId) return;
        setLoading(true); setError("");
        try {
            const [b, c] = await Promise.all([
                http.get("/batch", { params: { institution_id: institutionId } }),
                http.get("/classes", { params: { institution_id: institutionId } }),
            ]);
            setBatches((b.data.data || []).map((x) => ({ ...x, id: asId(x.id) })));
            setClasses((c.data.data || []).map((x) => ({ ...x, id: asId(x.id) })));
        } catch (e) {
            setError(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const loadStudents = async () => {
        if (!institutionId) return;
        setLoading(true); setError("");
        try {
            const resp = await http.get(`/student/${institutionId}`);
            let rows = (resp.data.data || []).map((r) => ({
                ...r,
                id: asId(r.id),
                batch_id: asId(r.batch_id),
                class_id: asId(r.class_id),
                section_id: asId(r.section_id),
                batch: r.batch ? { ...r.batch, id: asId(r.batch.id) } : null,
                class: r.class ? { ...r.class, id: asId(r.class.id) } : null,
                section: r.section ? { ...r.section, id: asId(r.section.id) } : null,
            }));

            // simple client-side filters/search
            if (q.trim()) {
                const t = q.trim().toLowerCase();
                rows = rows.filter((r) =>
                    (r.name_eng?.toLowerCase() || "").includes(t) ||
                    (r.name_bng?.toLowerCase() || "").includes(t) ||
                    (r.student_id || "").toLowerCase().includes(t) ||
                    (r.email || "").toLowerCase().includes(t) ||
                    (r.phone_number || "").toLowerCase().includes(t)
                );
            }
            if (filters.batch_id) rows = rows.filter((r) => r.batch_id === asId(filters.batch_id));
            if (filters.class_id) rows = rows.filter((r) => r.class_id === asId(filters.class_id));
            if (filters.section_id) rows = rows.filter((r) => r.section_id === asId(filters.section_id));

            setStudents(rows);
            setTotal(rows.length);
        } catch (e) {
            setError(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadRefs(); /* eslint-disable-next-line */ }, [institutionId]);
    useEffect(() => { loadStudents(); /* eslint-disable-next-line */ }, [institutionId, q, filters.batch_id, filters.class_id, filters.section_id]);

    // Cache sections by class; always store with string class_id key
    const ensureSections = async (class_id) => {
        const cid = asId(class_id);
        if (!cid || sectionsByClass[cid]) return;
        try {
            const resp = await http.get("/sections", { params: { class_id: cid } });
            const list = (resp.data.data || []).map((s) => ({ ...s, id: asId(s.id) }));
            setSectionsByClass((m) => ({ ...m, [cid]: list }));
        } catch (e) {
            console.warn("Failed to load sections for class", cid, e?.message);
        }
    };

    // build a draft object from a row
    const makeDraftFromRow = (s) => ({
        batch_id: asId(s.batch?.id || s.batch_id || ""),
        class_id: asId(s.class?.id || s.class_id || ""),
        section_id: asId(s.section?.id || s.section_id || ""),
    });

    // initialize draft if missing when focusing a row
    const ensureRowDraft = async (s) => {
        setPlacementDraft((prev) => {
            if (prev[s.id]) return prev;
            return { ...prev, [s.id]: makeDraftFromRow(s) };
        });
        const cid = asId(s.class?.id || s.class_id);
        if (cid) await ensureSections(cid);
    };

    const savePlacement = async (sid) => {
        const draft = placementDraft[sid];
        if (!draft) return;
        setLoading(true);
        try {
            const payload = {
                ...(draft.batch_id ? { batch_id: draft.batch_id } : {}),
                class_id: draft.class_id || null,
                section_id: draft.section_id || null,
            };
            const resp = await http.patch(`/student/${sid}/placement`, payload);
            const updated = resp.data.data;
            const norm = {
                ...updated,
                id: asId(updated.id),
                batch_id: asId(updated.batch_id),
                class_id: asId(updated.class_id),
                section_id: asId(updated.section_id),
                batch: updated.batch ? { ...updated.batch, id: asId(updated.batch.id) } : null,
                class: updated.class ? { ...updated.class, id: asId(updated.class.id) } : null,
                section: updated.section ? { ...updated.section, id: asId(updated.section.id) } : null,
            };
            setStudents((rows) => rows.map((r) => (r.id === sid ? norm : r)));
            setPlacementDraft((v) => { const x = { ...v }; delete x[sid]; return x; });
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const clearPlacement = async (sid) => {
        if (!confirm("Remove this student's class & section assignment?")) return;
        setLoading(true);
        try {
            await http.patch(`/student/${sid}/placement`, { class_id: null, section_id: null });
            await loadStudents();
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (s) => {
        setEditId(s.id);
        setForm({
            name_eng: s.name_eng || "",
            name_bng: s.name_bng || "",
            student_id: s.student_id || "",
            class_roll: s.class_roll || "",
            email: s.email || "",
            phone_number: s.phone_number || "",
            date_of_birth: s.date_of_birth ? ("" + s.date_of_birth).slice(0, 10) : "",
            religion: s.religion || "islam",
            gender: s.gender || "male",
            present_adress: s.present_adress || "",
            parmanent_adress: s.parmanent_adress || "",
            signature: s.signature || "",
            blood_group: s.blood_group || "",
            role: s.role || "student",
            status: s.status || "current",
            image: s.image || "",
        });
    };

    const saveEdit = async () => {
        if (!editId) return;
        setLoading(true);
        try {
            const resp = await http.patch(`/student/${editId}`, { ...form });
            setStudents((rows) => rows.map((r) => (r.id === editId ? { ...r, ...resp.data.data } : r)));
            setEditId(null);
            setForm(emptyStudent);
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const Field = ({ label, children }) => (
        <label className="block text-sm mb-3">
            <span className="block text-slate-600 mb-1">{label}</span>
            {children}
        </label>
    );
    const Panel = ({ children }) => <div className="bg-white rounded-2xl shadow p-6">{children}</div>;

    // classes grouped by batch_code (string keys)
    const classesByBatchCode = useMemo(() => {
        const map = {};
        classes.forEach((c) => {
            const code = c.batch_code || "";
            (map[code] ||= []).push(c);
        });
        return map;
    }, [classes]);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Students</h1>
                    {loading && <p className="text-xs text-slate-500 mt-1">Loading…</p>}
                    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
                </div>
                <div className="flex items-center gap-2">
                    <input
                        className="border rounded px-3 py-2 text-sm"
                        placeholder="Search ID, name, email, phone…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <button
                        className="px-3 py-2 rounded bg-slate-900 text-white text-sm"
                        onClick={loadStudents}
                    >
                        Search
                    </button>
                </div>
            </div>

            <Panel>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                    <Field label="Filter by Batch">
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={asId(filters.batch_id)}
                            onChange={(e) => setFilters((v) => ({ ...v, batch_id: asId(e.target.value), class_id: "", section_id: "" }))}
                        >
                            <option value="">All</option>
                            {batches.map((b) => (
                                <option key={b.id} value={b.id}>{b.batch_code}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Filter by Class">
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={asId(filters.class_id)}
                            onChange={async (e) => {
                                const val = asId(e.target.value);
                                setFilters((v) => ({ ...v, class_id: val, section_id: "" }));
                                if (val) await ensureSections(val);
                            }}
                        >
                            <option value="">All</option>
                            {(() => {
                                const code = batches.find((b) => b.id === asId(filters.batch_id))?.batch_code;
                                const list = code ? (classesByBatchCode[code] || []) : classes;
                                return list.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.title || `${c.batch_code} - ${c.course?.title}`}
                                    </option>
                                ));
                            })()}
                        </select>
                    </Field>
                    <Field label="Filter by Section">
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={asId(filters.section_id)}
                            onChange={(e) => setFilters((v) => ({ ...v, section_id: asId(e.target.value) }))}
                        >
                            <option value="">All</option>
                            {(filters.class_id ? (sectionsByClass[asId(filters.class_id)] || []) : []).map((s) => (
                                <option key={s.id} value={s.id}>{s.section_name}</option>
                            ))}
                        </select>
                    </Field>
                    <div className="flex items-end">
                        <span className="text-sm text-slate-500">Total: {total}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b bg-slate-50 text-left">
                                <th className="py-2 px-3 font-semibold text-slate-600">Student</th>
                                <th className="py-2 px-3 font-semibold text-slate-600">ID / Roll</th>
                                <th className="py-2 px-3 font-semibold text-slate-600">Batch</th>
                                <th className="py-2 px-3 font-semibold text-slate-600">Class</th>
                                <th className="py-2 px-3 font-semibold text-slate-600">Section</th>
                                <th className="py-2 px-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => {
                                const draft = placementDraft[s.id];

                                const currentBatchId = asId(draft?.batch_id || s.batch?.id || s.batch_id);
                                const currentBatchCode =
                                    batches.find((b) => b.id === currentBatchId)?.batch_code ||
                                    s.class?.batch_code ||
                                    "";

                                const classOptions = currentBatchCode
                                    ? (classesByBatchCode[currentBatchCode] || [])
                                    : classes;

                                const selectedClassId = asId(draft?.class_id || s.class?.id || s.class_id);
                                const sectionOptions = selectedClassId
                                    ? (sectionsByClass[selectedClassId] || [])
                                    : [];

                                return (
                                    <tr key={s.id} className="border-b">
                                        <td className="py-2 px-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={`${import.meta.env.VITE_BACKEND_LINK}/image/student/${s.image}`}
                                                    alt={s.name_eng}
                                                    className="h-9 w-9 rounded-full object-cover border"
                                                    onError={(e) => (e.currentTarget.src = "/no_image.png")}
                                                />
                                                <div className="leading-tight">
                                                    <div className="font-medium">{s.name_eng}</div>
                                                    <div className="text-xs text-slate-500">{s.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-2 px-3">
                                            <div className="leading-tight">
                                                <div>{s.student_id}</div>
                                                <div className="text-xs text-slate-500">Roll: {s.class_roll}</div>
                                            </div>
                                        </td>

                                        {/* Batch */}
                                        <td className="py-2 px-3">
                                            <select
                                                className="border rounded px-2 py-1"
                                                value={asId(draft ? draft.batch_id : (s.batch?.id || s.batch_id || ""))}
                                                onChange={(e) => {
                                                    const val = asId(e.target.value);
                                                    // single functional update: init (if missing) + patch
                                                    setPlacementDraft((prev) => {
                                                        const cur = prev[s.id] || makeDraftFromRow(s);
                                                        return {
                                                            ...prev,
                                                            [s.id]: { ...cur, batch_id: val, class_id: "", section_id: "" },
                                                        };
                                                    });
                                                }}
                                                onFocus={() => ensureRowDraft(s)}
                                            >
                                                <option value="">—</option>
                                                {batches.map((b) => (
                                                    <option key={b.id} value={b.id}>{b.batch_code}</option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* Class */}
                                        <td className="py-2 px-3">
                                            <select
                                                className="border rounded px-2 py-1"
                                                value={asId(draft ? draft.class_id : (s.class?.id || s.class_id || ""))}
                                                onChange={async (e) => {
                                                    const val = asId(e.target.value);
                                                    setPlacementDraft((prev) => {
                                                        const cur = prev[s.id] || makeDraftFromRow(s);
                                                        return { ...prev, [s.id]: { ...cur, class_id: val, section_id: "" } };
                                                    });
                                                    if (val) await ensureSections(val);
                                                }}
                                                onFocus={() => ensureRowDraft(s)}
                                            >
                                                <option value="">—</option>
                                                {classOptions.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.title || `${c.batch_code} - ${c.course?.title}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* Section */}
                                        <td className="py-2 px-3">
                                            <select
                                                className="border rounded px-2 py-1"
                                                value={asId(draft ? draft.section_id : (s.section?.id || s.section_id || ""))}
                                                onChange={(e) => {
                                                    const val = asId(e.target.value);
                                                    setPlacementDraft((prev) => {
                                                        const cur = prev[s.id] || makeDraftFromRow(s);
                                                        return { ...prev, [s.id]: { ...cur, section_id: val } };
                                                    });
                                                }}
                                                onFocus={() => ensureRowDraft(s)}
                                            >
                                                <option value="">—</option>
                                                {sectionOptions.map((sec) => (
                                                    <option key={sec.id} value={sec.id}>{sec.section_name}</option>
                                                ))}
                                            </select>
                                        </td>

                                        <td className="py-2 px-3 text-right">
                                            {draft ? (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                                                        onClick={() =>
                                                            setPlacementDraft((v) => {
                                                                const x = { ...v };
                                                                delete x[s.id];
                                                                return x;
                                                            })
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                                                        onClick={() => savePlacement(s.id)}
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                                                        onClick={() => openEdit(s)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="px-2 py-1 rounded bg-orange-600 text-white hover:bg-orange-700"
                                                        onClick={() => clearPlacement(s.id)}
                                                    >
                                                        Clear Placement
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {students.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center text-slate-400">No students found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Panel>

            {/* Edit Drawer */}
            {editId && (
                <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setEditId(null)}>
                    <div
                        className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-xl p-6 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium">Edit Student</h2>
                            <button className="text-slate-500 hover:text-black" onClick={() => setEditId(null)}>✕</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Name (English)"><input className="w-full border rounded px-3 py-2" value={form.name_eng} onChange={(e) => setForm(v => ({ ...v, name_eng: e.target.value }))} /></Field>
                            <Field label="Name (Bangla)"><input className="w-full border rounded px-3 py-2" value={form.name_bng} onChange={(e) => setForm(v => ({ ...v, name_bng: e.target.value }))} /></Field>
                            <Field label="Student ID"><input className="w-full border rounded px-3 py-2" value={form.student_id} onChange={(e) => setForm(v => ({ ...v, student_id: e.target.value }))} /></Field>
                            <Field label="Class Roll"><input className="w-full border rounded px-3 py-2" value={form.class_roll} onChange={(e) => setForm(v => ({ ...v, class_roll: e.target.value }))} /></Field>
                            <Field label="Email"><input type="email" className="w-full border rounded px-3 py-2" value={form.email} onChange={(e) => setForm(v => ({ ...v, email: e.target.value }))} /></Field>
                            <Field label="Phone"><input className="w-full border rounded px-3 py-2" value={form.phone_number} onChange={(e) => setForm(v => ({ ...v, phone_number: e.target.value }))} /></Field>
                            <Field label="DOB"><input type="date" className="w-full border rounded px-3 py-2" value={form.date_of_birth} onChange={(e) => setForm(v => ({ ...v, date_of_birth: e.target.value }))} /></Field>
                            <Field label="Gender">
                                <select className="w-full border rounded px-3 py-2" value={form.gender} onChange={(e) => setForm(v => ({ ...v, gender: e.target.value }))}>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="others">Others</option>
                                </select>
                            </Field>
                            <Field label="Religion">
                                <select className="w-full border rounded px-3 py-2" value={form.religion} onChange={(e) => setForm(v => ({ ...v, religion: e.target.value }))}>
                                    <option value="islam">Islam</option>
                                    <option value="hindu">Hindu</option>
                                    <option value="buddhist">Buddhist</option>
                                    <option value="christian">Christian</option>
                                    <option value="others">Others</option>
                                </select>
                            </Field>
                            <Field label="Status">
                                <select className="w-full border rounded px-3 py-2" value={form.status} onChange={(e) => setForm(v => ({ ...v, status: e.target.value }))}>
                                    <option value="current">Current</option>
                                    <option value="alumni">Alumni</option>
                                    <option value="dropout">Dropout</option>
                                    <option value="rusticated">Rusticated</option>
                                </select>
                            </Field>
                            <Field label="Image URL"><input className="w-full border rounded px-3 py-2" value={form.image} onChange={(e) => setForm(v => ({ ...v, image: e.target.value }))} /></Field>
                            <Field label="Present Address"><input className="w-full border rounded px-3 py-2" value={form.present_adress} onChange={(e) => setForm(v => ({ ...v, present_adress: e.target.value }))} /></Field>
                            <Field label="Permanent Address"><input className="w-full border rounded px-3 py-2" value={form.parmanent_adress} onChange={(e) => setForm(v => ({ ...v, parmanent_adress: e.target.value }))} /></Field>
                            <Field label="Blood Group"><input className="w-full border rounded px-3 py-2" value={form.blood_group} onChange={(e) => setForm(v => ({ ...v, blood_group: e.target.value }))} /></Field>
                            <Field label="Signature (URL)"><input className="w-full border rounded px-3 py-2" value={form.signature} onChange={(e) => setForm(v => ({ ...v, signature: e.target.value }))} /></Field>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200" onClick={() => setEditId(null)}>Cancel</button>
                            <button className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={saveEdit}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
