// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation } from "react-router";
// import http from "../../api/http";

// // helpers
// // put this near the component
// const toISODateTime = (v) => {
//     if (!v) return null;
//     // already ISO with time? pass through
//     if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return v;
//     // date-only -> midnight UTC
//     if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T00:00:00.000Z`;
//     // anything else -> let Date normalize
//     return new Date(v).toISOString();
// };

// const initialBatch = { batch_code: "", starting_date: "", ending_date: "" };
// const initialClass = {
//     batch_code: "",
//     title: "",
//     description: "",
//     start_date: "",
//     end_date: "",
//     homeroom_teacher_id: "",
//     course_ids: [],            // NEW: multi-course
// };
// const initialSection = {
//     class_id: "",
//     section_name: "",
//     homeroom_teacher_id: "",
//     teaching_map: [],          // [{course_id, teacher_id}]
// };

// export default function AcademicSetup() {
//     const location = useLocation();
//     const institutionId = useMemo(() => {
//         const m = location.pathname.match(/\/(\w+)(?:\/|$)/);
//         return m ? m[1] : null;
//     }, [location.pathname]);

//     const [tab, setTab] = useState("batches");
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");

//     const [courses, setCourses] = useState([]);
//     const [batches, setBatches] = useState([]);
//     const [classes, setClasses] = useState([]);   // each has .courses[]
//     const [sections, setSections] = useState([]); // each has .teaching[]
//     const [teachers, setTeachers] = useState([]); // fetched from your separate Teacher API

//     const [batchForm, setBatchForm] = useState(initialBatch);
//     const [classForm, setClassForm] = useState(initialClass);
//     const [sectionForm, setSectionForm] = useState(initialSection);
//     const [editing, setEditing] = useState({ type: null, id: null });

//     // Fetch everything
//     const fetchAll = async () => {
//         if (!institutionId) return;
//         setLoading(true); setError("");
//         try {
//             const [c, b, cls, sec, t] = await Promise.all([
//                 http.get(`/courses`, { params: { institution_id: institutionId } }),
//                 http.get(`/batch`, { params: { institution_id: institutionId } }),
//                 http.get(`/classes`, { params: { institution_id: institutionId } }),
//                 http.get(`/sections`, { params: { institution_id: institutionId } }),
//                 http.get(`/teacher`, { params: { institution_id: institutionId } }),
//             ]);
//             setCourses(c.data.data || []);
//             setBatches(b.data.data || []);
//             setClasses(cls.data.data || []);
//             setSections(sec.data.data || []);
//             setTeachers(t.data.data || []);
//         } catch (e) {
//             setError(e?.response?.data?.message || e.message);
//             console.log("----Error: ", e);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, [institutionId]);

//     // Helpers
//     const Field = ({ label, children }) => (
//         <label className="block text-sm mb-3">
//             <span className="block text-slate-600 mb-1">{label}</span>
//             {children}
//         </label>
//     );
//     const Panel = ({ children }) => <div className="bg-white rounded-2xl shadow p-6">{children}</div>;
//     const Table = ({ columns = [], data = [], renderActions }) => (
//         <div className="overflow-x-auto">
//             <table className="min-w-full text-sm">
//                 <thead>
//                     <tr className="border-b bg-slate-50 text-left">
//                         {columns.map((c) => (
//                             <th key={c.key} className="py-2 px-3 font-semibold text-slate-600">{c.title}</th>
//                         ))}
//                         {renderActions && <th className="py-2 px-3" />}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {data.map((row) => (
//                         <tr key={row.id} className="border-b hover:bg-slate-50">
//                             {columns.map((c) => (
//                                 <td key={c.key} className="py-2 px-3 align-top">{c.render ? c.render(row) : (row[c.key] ?? "—")}</td>
//                             ))}
//                             {renderActions && <td className="py-2 px-3 text-right">{renderActions(row)}</td>}
//                         </tr>
//                     ))}
//                     {data.length === 0 && (
//                         <tr><td colSpan={columns.length + 1} className="py-8 text-center text-slate-400">No data</td></tr>
//                     )}
//                 </tbody>
//             </table>
//         </div>
//     );

//     // -------- Batches --------
//     const saveBatch = async () => {
//         try {
//             setLoading(true);
//             if (editing.type === "batch" && editing.id) {
//                 await http.patch(`/batch/${editing.id}`, {
//                     institution_id: institutionId,
//                     ...batchForm, // order: spread first
//                     starting_date: toISODateTime(batchForm.starting_date), // override with ISO
//                     ending_date: toISODateTime(batchForm.ending_date),
//                 });
//             } else {
//                 await http.post("/batch", {
//                     institution_id: institutionId,
//                     ...batchForm, // order: spread first
//                     starting_date: toISODateTime(batchForm.starting_date), // override with ISO
//                     ending_date: toISODateTime(batchForm.ending_date),
//                 });
//             }
//             await fetchAll();
//             setBatchForm(initialBatch);
//             setEditing({ type: null, id: null });
//         } catch (e) { alert(e?.response?.data?.message || e.message); }
//         finally { setLoading(false); }
//     };
//     const deleteBatch = async (id) => {
//         if (!confirm("Delete this batch?")) return;
//         setLoading(true);
//         try { await http.delete(`/batch/${id}`); await fetchAll(); }
//         catch (e) { alert(e?.response?.data?.message || e.message); }
//         finally { setLoading(false); }
//     };

//     // -------- Classes (multi-course) --------
//     const saveClass = async () => {
//         try {
//             setLoading(true);
//             if (editing.type === "class" && editing.id) {
//                 await http.patch(`/classes/${editing.id}`, { institution_id: institutionId, ...classForm });
//             } else {
//                 await http.post(`/classes`, { institution_id: institutionId, ...classForm });
//             }
//             await fetchAll();
//             setClassForm(initialClass);
//             setEditing({ type: null, id: null });
//         } catch (e) { alert(e?.response?.data?.message || e.message); }
//         finally { setLoading(false); }
//     };
//     const deleteClass = async (id) => {
//         if (!confirm("Delete this class?")) return;
//         setLoading(true);
//         try { await http.delete(`/classes/${id}`); await fetchAll(); }
//         catch (e) { alert(e?.response?.data?.message || e.message); }
//         finally { setLoading(false); }
//     };

//     // -------- Sections (per-course teachers) --------
//     // when selecting a class, prime teaching_map entries for its courses
//     useEffect(() => {
//         if (!sectionForm.class_id) return;
//         const cls = classes.find((c) => c.id === sectionForm.class_id);
//         if (!cls) return;

//         // ensure each course has an entry in the map (teacher_id may be empty)
//         const nextMap = cls.courses.map((course) => {
//             const existing = sectionForm.teaching_map.find((m) => m.course_id === course.id);
//             return existing || { course_id: course.id, teacher_id: "" };
//         });
//         setSectionForm((v) => ({ ...v, teaching_map: nextMap }));
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [sectionForm.class_id]);

//     const setAllTeachers = (teacher_id) => {
//         setSectionForm((v) => ({
//             ...v,
//             teaching_map: (v.teaching_map || []).map((m) => ({ ...m, teacher_id })),
//         }));
//     };

//     const saveSection = async () => {
//         try {
//             setLoading(true);
//             if (editing.type === "section" && editing.id) {
//                 await http.patch(`/sections/${editing.id}`, {
//                     institution_id: institutionId,
//                     ...sectionForm,
//                 });
//             } else {
//                 await http.post(`/sections`, {
//                     institution_id: institutionId,
//                     ...sectionForm,
//                 });
//             }
//             await fetchAll();
//             setSectionForm(initialSection);
//             setEditing({ type: null, id: null });
//         } catch (e) { alert(e?.response?.data?.message || e.message); }
//         finally { setLoading(false); }
//     };
//     const deleteSection = async (id) => {
//         if (!confirm("Delete this section?")) return;
//         setLoading(true);
//         try { await http.delete(`/sections/${id}`); await fetchAll(); }
//         catch (e) { alert(e?.response?.data?.message || e.message); }
//         finally { setLoading(false); }
//     };

//     // UI
//     return (
//         <div className="p-6 space-y-6">
//             <div className="flex items-center gap-3">
//                 <h1 className="text-2xl font-semibold">Academic Setup</h1>
//                 {loading && <span className="text-xs text-slate-500">Loading…</span>}
//                 {error && <span className="text-xs text-red-600">{error}</span>}
//             </div>

//             <div className="flex gap-2 text-sm">
//                 {[
//                     ["batches", "Batches"],
//                     ["classes", "Classes"],
//                     ["sections", "Sections"],
//                     ["courses", "Subjects"],
//                 ].map(([key, label]) => (
//                     <button
//                         key={key}
//                         onClick={() => setTab(key)}
//                         className={`px-3 py-1.5 rounded-full border ${tab === key ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"
//                             }`}
//                     >
//                         {label}
//                     </button>
//                 ))}
//             </div>

//             {/* Batches */}
//             {tab === "batches" && (
//                 <Panel>
//                     <div className="flex items-center justify-between mb-4">
//                         <h2 className="text-lg font-medium">Batches</h2>
//                         <div className="flex gap-2">
//                             <button onClick={() => { setEditing({ type: null, id: null }); setBatchForm(initialBatch); }}
//                                 className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200">Reset</button>
//                             <button onClick={saveBatch} className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">
//                                 {editing.type === "batch" ? "Update Batch" : "Create Batch"}
//                             </button>
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                         <Field label="Batch Code">
//                             <input className="w-full border rounded px-3 py-2" placeholder="2025-A"
//                                 value={batchForm.batch_code} onChange={(e) => setBatchForm((v) => ({ ...v, batch_code: e.target.value }))} />
//                         </Field>
//                         <Field label="Starting Date">
//                             <input type="date" className="w-full border rounded px-3 py-2"
//                                 value={batchForm.starting_date}
//                                 onChange={(e) => setBatchForm((v) => ({ ...v, starting_date: e.target.value }))} />
//                         </Field>
//                         <Field label="Ending Date">
//                             <input type="date" className="w-full border rounded px-3 py-2"
//                                 value={batchForm.ending_date}
//                                 onChange={(e) => setBatchForm((v) => ({ ...v, ending_date: e.target.value }))} />
//                         </Field>
//                     </div>

//                     <Table
//                         columns={[
//                             { key: "batch_code", title: "Batch Code" },
//                             { key: "starting_date", title: "Start", render: (r) => r.starting_date ? new Date(r.starting_date).toLocaleDateString() : "—" },
//                             { key: "ending_date", title: "End", render: (r) => r.ending_date ? new Date(r.ending_date).toLocaleDateString() : "—" },
//                             { key: "created_at", title: "Created", render: (r) => new Date(r.created_at).toLocaleDateString() },
//                         ]}
//                         data={batches}
//                         renderActions={(row) => (
//                             <div className="flex gap-2 justify-end">
//                                 <button className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
//                                     onClick={() => {
//                                         setEditing({ type: "batch", id: row.id });
//                                         setBatchForm({
//                                             batch_code: row.batch_code,
//                                             starting_date: row.starting_date?.slice(0, 10) || "",
//                                             ending_date: row.ending_date?.slice(0, 10) || "",
//                                         });
//                                     }}>Edit</button>
//                                 <button className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
//                                     onClick={() => deleteBatch(row.id)}>Delete</button>
//                             </div>
//                         )}
//                     />
//                 </Panel>
//             )}

//             {/* Classes (multi-course) */}
//             {tab === "classes" && (
//                 <Panel>
//                     <div className="flex items-center justify-between mb-4">
//                         <h2 className="text-lg font-medium">Classes</h2>
//                         <div className="flex gap-2">
//                             <button onClick={() => { setEditing({ type: null, id: null }); setClassForm(initialClass); }}
//                                 className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200">Reset</button>
//                             <button onClick={saveClass} className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">
//                                 {editing.type === "class" ? "Update Class" : "Create Class"}
//                             </button>
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                         <Field label="Batch Code">
//                             <select className="w-full border rounded px-3 py-2"
//                                 value={classForm.batch_code}
//                                 onChange={(e) => setClassForm((v) => ({ ...v, batch_code: e.target.value }))}>
//                                 <option value="">Select batch code</option>
//                                 {batches.map((b) => <option key={b.id} value={b.batch_code}>{b.batch_code}</option>)}
//                             </select>
//                         </Field>

//                         <Field label="Homeroom Teacher (optional)">
//                             <select className="w-full border rounded px-3 py-2"
//                                 value={classForm.homeroom_teacher_id}
//                                 onChange={(e) => setClassForm((v) => ({ ...v, homeroom_teacher_id: e.target.value }))}>
//                                 <option value="">None</option>
//                                 {teachers.map((t) => <option key={t.id} value={t.id}>{t.name_eng} ({t.teacher_initial})</option>)}
//                             </select>
//                         </Field>

//                         <Field label="Subjects in this Class">
//                             <select multiple className="w-full border rounded px-3 py-2 h-32"
//                                 value={classForm.course_ids}
//                                 onChange={(e) => {
//                                     const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
//                                     setClassForm((v) => ({ ...v, course_ids: vals }));
//                                 }}>
//                                 {courses.map((c) => <option key={c.id} value={c.id}>{c.title} ({c.course_code})</option>)}
//                             </select>
//                             <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple.</p>
//                         </Field>

//                         <Field label="Title (optional)">
//                             <input className="w-full border rounded px-3 py-2" placeholder="Class 10"
//                                 value={classForm.title} onChange={(e) => setClassForm((v) => ({ ...v, title: e.target.value }))} />
//                         </Field>
//                         <Field label="Description (optional)">
//                             <input className="w-full border rounded px-3 py-2" placeholder="Notes"
//                                 value={classForm.description} onChange={(e) => setClassForm((v) => ({ ...v, description: e.target.value }))} />
//                         </Field>
//                         <Field label="Start Date">
//                             <input type="date" className="w-full border rounded px-3 py-2"
//                                 value={classForm.start_date} onChange={(e) => setClassForm((v) => ({ ...v, start_date: e.target.value }))} />
//                         </Field>
//                         <Field label="End Date">
//                             <input type="date" className="w-full border rounded px-3 py-2"
//                                 value={classForm.end_date} onChange={(e) => setClassForm((v) => ({ ...v, end_date: e.target.value }))} />
//                         </Field>
//                     </div>

//                     <Table
//                         columns={[
//                             { key: "title", title: "Title" },
//                             {
//                                 key: "courses",
//                                 title: "Subjects",
//                                 render: (r) => (r.courses?.length
//                                     ? r.courses.map((c) => `${c.title} (${c.course_code})`).join(", ")
//                                     : "—"),
//                             },
//                             { key: "batch_code", title: "Batch Code" },
//                             {
//                                 key: "homeroom_teacher",
//                                 title: "Homeroom Teacher",
//                                 render: (r) => r.homeroom_teacher ? `${r.homeroom_teacher.name_eng} (${r.homeroom_teacher.teacher_initial})` : "—",
//                             },
//                             { key: "start_date", title: "Start", render: (r) => r.start_date ? new Date(r.start_date).toLocaleDateString() : "—" },
//                             { key: "end_date", title: "End", render: (r) => r.end_date ? new Date(r.end_date).toLocaleDateString() : "—" },
//                         ]}
//                         data={classes}
//                         renderActions={(row) => (
//                             <div className="flex gap-2 justify-end">
//                                 <button
//                                     className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
//                                     onClick={() => {
//                                         setEditing({ type: "class", id: row.id });
//                                         setClassForm({
//                                             batch_code: row.batch_code || "",
//                                             title: row.title || "",
//                                             description: row.description || "",
//                                             start_date: row.start_date?.slice(0, 10) || "",
//                                             end_date: row.end_date?.slice(0, 10) || "",
//                                             homeroom_teacher_id: row.homeroom_teacher_id || "",
//                                             course_ids: (row.courses || []).map((c) => c.id),
//                                         });
//                                     }}
//                                 >Edit</button>
//                                 <button className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700" onClick={() => deleteClass(row.id)}>Delete</button>
//                             </div>
//                         )}
//                     />
//                 </Panel>
//             )}

//             {/* Sections (assign per-course teachers) */}
//             {tab === "sections" && (
//                 <Panel>
//                     <div className="flex items-center justify-between mb-4">
//                         <h2 className="text-lg font-medium">Sections</h2>
//                         <div className="flex gap-2">
//                             <button onClick={() => { setEditing({ type: null, id: null }); setSectionForm(initialSection); }}
//                                 className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200">Reset</button>
//                             <button onClick={saveSection} className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">
//                                 {editing.type === "section" ? "Update Section" : "Create Section"}
//                             </button>
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                         <Field label="Class">
//                             <select className="w-full border rounded px-3 py-2"
//                                 value={sectionForm.class_id}
//                                 onChange={(e) => setSectionForm((v) => ({ ...v, class_id: e.target.value, teaching_map: [] }))}>
//                                 <option value="">Select class</option>
//                                 {classes.map((c) => (
//                                     <option key={c.id} value={c.id}>
//                                         {c.title || `${c.batch_code} - ${c.courses?.map((x) => x.title).join(", ")}`}
//                                     </option>
//                                 ))}
//                             </select>
//                         </Field>

//                         <Field label="Section Name">
//                             <input className="w-full border rounded px-3 py-2" placeholder="A / Blue / Morning"
//                                 value={sectionForm.section_name}
//                                 onChange={(e) => setSectionForm((v) => ({ ...v, section_name: e.target.value }))} />
//                         </Field>

//                         <Field label="Homeroom Teacher (optional)">
//                             <select className="w-full border rounded px-3 py-2"
//                                 value={sectionForm.homeroom_teacher_id}
//                                 onChange={(e) => setSectionForm((v) => ({ ...v, homeroom_teacher_id: e.target.value }))}>
//                                 <option value="">None</option>
//                                 {teachers.map((t) => <option key={t.id} value={t.id}>{t.name_eng} ({t.teacher_initial})</option>)}
//                             </select>
//                         </Field>
//                     </div>

//                     {/* Assignment Matrix */}
//                     {sectionForm.class_id && (
//                         <div className="border rounded-xl p-4 mb-6">
//                             <div className="flex items-center justify-between mb-3">
//                                 <h3 className="font-medium">Assign Teachers per Subject (for this Section)</h3>
//                                 <div className="flex items-center gap-2">
//                                     <span className="text-sm text-slate-600">Set all to</span>
//                                     <select className="border rounded px-2 py-1"
//                                         onChange={(e) => e.target.value && setAllTeachers(e.target.value)}>
//                                         <option value="">—</option>
//                                         {teachers.map((t) => <option key={t.id} value={t.id}>{t.name_eng} ({t.teacher_initial})</option>)}
//                                     </select>
//                                 </div>
//                             </div>

//                             <div className="space-y-2">
//                                 {(sectionForm.teaching_map || []).map((m, idx) => {
//                                     const course = (classes.find((c) => c.id === sectionForm.class_id)?.courses || []).find((cc) => cc.id === m.course_id);
//                                     return (
//                                         <div key={m.course_id} className="flex items-center gap-3">
//                                             <div className="w-1/2 text-slate-700">{course ? `${course.title} (${course.course_code})` : m.course_id}</div>
//                                             <div className="w-1/2">
//                                                 <select className="w-full border rounded px-3 py-2"
//                                                     value={m.teacher_id}
//                                                     onChange={(e) => {
//                                                         const value = e.target.value;
//                                                         setSectionForm((v) => {
//                                                             const next = [...v.teaching_map];
//                                                             next[idx] = { ...next[idx], teacher_id: value };
//                                                             return { ...v, teaching_map: next };
//                                                         });
//                                                     }}>
//                                                     <option value="">— Select Teacher —</option>
//                                                     {teachers.map((t) => <option key={t.id} value={t.id}>{t.name_eng} ({t.teacher_initial})</option>)}
//                                                 </select>
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         </div>
//                     )}

//                     <Table
//                         columns={[
//                             {
//                                 key: "class",
//                                 title: "Class",
//                                 render: (r) =>
//                                     r.class
//                                         ? r.class.title || `${r.class.batch_code} - ${(r.class.courses || []).map((c) => c.title).join(", ")}`
//                                         : "—",
//                             },
//                             { key: "section_name", title: "Section" },
//                             {
//                                 key: "teaching",
//                                 title: "Subject → Teacher",
//                                 render: (r) =>
//                                     (r.teaching || []).length
//                                         ? r.teaching
//                                             .map((t) => `${t.course.title} → ${t.teacher?.name_eng || "—"}`)
//                                             .join(" | ")
//                                         : "—",
//                             },
//                             {
//                                 key: "created_at",
//                                 title: "Created",
//                                 render: (r) => new Date(r.created_at).toLocaleDateString(),
//                             },
//                         ]}
//                         data={sections}
//                         renderActions={(row) => (
//                             <div className="flex gap-2 justify-end">
//                                 <button
//                                     className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
//                                     onClick={() => {
//                                         setEditing({ type: "section", id: row.id });
//                                         setSectionForm({
//                                             class_id: row.class_id || "",
//                                             section_name: row.section_name || "",
//                                             homeroom_teacher_id: row.homeroom_teacher_id || "",
//                                             teaching_map: (row.teaching || []).map((t) => ({
//                                                 course_id: t.course.id,
//                                                 teacher_id: t.teacher?.id || "",
//                                             })),
//                                         });
//                                     }}
//                                 >Edit</button>
//                                 <button className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
//                                     onClick={() => deleteSection(row.id)}>Delete</button>
//                             </div>
//                         )}
//                     />
//                 </Panel>
//             )}

//             {/* Subjects */}
//             {tab === "courses" && (
//                 <Panel>
//                     <div className="flex items-center justify-between mb-4">
//                         <h2 className="text-lg font-medium">Subjects</h2>
//                         <div className="flex gap-2">
//                             {/* simple quick-create inline form */}
//                             <button onClick={async () => {
//                                 const code = prompt("Course code? (e.g., PHY-101)");
//                                 const title = code ? prompt("Course title? (e.g., Physics)") : null;
//                                 if (!code || !title) return;
//                                 try { setLoading(true); await http.post(`/courses`, { institution_id: institutionId, course_code: code, title }); await fetchAll(); }
//                                 catch (e) { alert(e?.response?.data?.message || e.message); }
//                                 finally { setLoading(false); }
//                             }} className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">Quick Add</button>
//                         </div>
//                     </div>
//                     <Table
//                         columns={[
//                             { key: "course_code", title: "Code" },
//                             { key: "title", title: "Title" },
//                             { key: "description", title: "Description" },
//                         ]}
//                         data={courses}
//                         renderActions={(row) => (
//                             <div className="flex gap-2 justify-end">
//                                 <button className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200" onClick={async () => {
//                                     const title = prompt("New title", row.title);
//                                     if (title == null) return;
//                                     try { setLoading(true); await http.patch(`/courses/${row.id}`, { title }); await fetchAll(); }
//                                     catch (e) { alert(e?.response?.data?.message || e.message); }
//                                     finally { setLoading(false); }
//                                 }}>Rename</button>
//                                 <button className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700" onClick={async () => {
//                                     if (!confirm("Delete subject?")) return;
//                                     try { setLoading(true); await http.delete(`/courses/${row.id}`); await fetchAll(); }
//                                     catch (e) { alert(e?.response?.data?.message || e.message); }
//                                     finally { setLoading(false); }
//                                 }}>Delete</button>
//                             </div>
//                         )}
//                     />
//                 </Panel>
//             )}
//         </div>
//     );
// }

import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import http from "../../api/http";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

// helpers
// put this near the component
const toISODateTime = (v) => {
    if (!v) return null;
    // already ISO with time? pass through
    if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return v;
    // date-only -> midnight UTC
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T00:00:00.000Z`;
    // anything else -> let Date normalize
    return new Date(v).toISOString();
};

const initialBatch = { batch_code: "", starting_date: "", ending_date: "" };

const initialClass = {
    batch_code: "",
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    homeroom_teacher_id: "",
    course_ids: [],  // multi-course (join table)
    course_id: "",   // NEW: primary course (required by backend)
};

const initialSection = {
    class_id: "",
    section_name: "",
    homeroom_teacher_id: "",
    teaching_map: [], // [{course_id, teacher_id}]
};

export default function AcademicSetup() {
    const location = useLocation();
    const institutionId = useMemo(() => {
        const m = location.pathname.match(/\/(\w+)(?:\/|$)/);
        return m ? m[1] : null;
    }, [location.pathname]);

    const [tab, setTab] = useState("batches");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [classes, setClasses] = useState([]);   // each has .courses[] and .primary_course (from backend)
    const [sections, setSections] = useState([]); // each has .teaching[]
    const [teachers, setTeachers] = useState([]); // fetched from your separate Teacher API

    const [batchForm, setBatchForm] = useState(initialBatch);
    const [classForm, setClassForm] = useState(initialClass);
    const [sectionForm, setSectionForm] = useState(initialSection);
    const [editing, setEditing] = useState({ type: null, id: null });

    // Fetch everything
    const fetchAll = async () => {
        if (!institutionId) return;
        setLoading(true);
        setError("");
        try {
            const [c, b, cls, sec, t] = await Promise.all([
                http.get(`/courses`, { params: { institution_id: institutionId } }),
                http.get(`/batch`, { params: { institution_id: institutionId } }),
                http.get(`/classes`, { params: { institution_id: institutionId } }),
                http.get(`/sections`, { params: { institution_id: institutionId } }),
                http.get(`/teacher`, { params: { institution_id: institutionId } }),
            ]);
            setCourses(c.data.data || []);
            setBatches(b.data.data || []);
            setClasses(cls.data.data || []);
            setSections(sec.data.data || []);
            setTeachers(t.data.data || []);
        } catch (e) {
            setError(e?.response?.data?.message || e.message);
            console.log("----Error: ", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll(); // eslint-disable-next-line
    }, [institutionId]);

    // Helpers
    const Field = ({ label, children }) => (
        <label className="block text-sm mb-3">
            <span className="block text-slate-600 mb-1">{label}</span>
            {children}
        </label>
    );
    const Panel = ({ children }) => (
        <div className="bg-white rounded-2xl shadow p-6">{children}</div>
    );
    const Table = ({ columns = [], data = [], renderActions }) => (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="border-b bg-slate-50 text-left">
                        {columns.map((c) => (
                            <th key={c.key} className="py-2 px-3 font-semibold text-slate-600">
                                {c.title}
                            </th>
                        ))}
                        {renderActions && <th className="py-2 px-3" />}
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
                            {renderActions && (
                                <td className="py-2 px-3 text-right">{renderActions(row)}</td>
                            )}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td
                                colSpan={columns.length + 1}
                                className="py-8 text-center text-slate-400"
                            >
                                No data
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    // -------- Batches --------
    const saveBatch = async () => {
        try {
            setLoading(true);
            if (editing.type === "batch" && editing.id) {
                await http.patch(`/batch/${editing.id}`, {
                    institution_id: institutionId,
                    ...batchForm,
                    starting_date: toISODateTime(batchForm.starting_date),
                    ending_date: toISODateTime(batchForm.ending_date),
                });
            } else {
                await http.post("/batch", {
                    institution_id: institutionId,
                    ...batchForm,
                    starting_date: toISODateTime(batchForm.starting_date),
                    ending_date: toISODateTime(batchForm.ending_date),
                });
            }
            await fetchAll();
            setBatchForm(initialBatch);
            setEditing({ type: null, id: null });
            toast.success("Batch Created Successfully!", {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: false,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "light",
                        });
        } catch (e) {
            console.error('Error Creating Teacher:', e);
            toast.error("Some thing wrong! Unable to create batch.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        } finally {
            setLoading(false);
        }
    };
    const deleteBatch = async (id) => {
        // if (!confirm("Delete this batch?")) return;
        // setLoading(true);
        // try {
        //     await http.delete(`/batch/${id}`);
        //     await fetchAll();
        // } catch (e) {
        //     alert(e?.response?.data?.message || e.message);
        // } finally {
        //     setLoading(false);
        // }
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true);
                try {
                    const response = await http.delete(`/batch/${id}`);
                    if (response.data.success) {
                        await fetchAll();
                        Swal.fire({
                            title: "Deleted!",
                            text: "The batch has been deleted.",
                            icon: "success"
                        });
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: response.data.message || "Unable to delete batch.",
                            icon: "error"
                        });
                    }
                } catch (err) {
                    console.log(err);
                    Swal.fire({
                        title: "Error!",
                        text: err.response?.data?.message || "Something went wrong.",
                        icon: "error"
                    });
                }
                finally {
                    setLoading(false);
                }
            }
        });
    };

    // -------- Classes (multi-course + primary course_id) --------
    const saveClass = async () => {
        try {
            setLoading(true);

            // Option A requirements
            if (!classForm.course_id) {
                throw new Error("Primary Subject is required.");
            }
            if (!classForm.course_ids?.length) {
                throw new Error("Select at least one subject.");
            }

            const payload = {
                institution_id: institutionId,
                ...classForm,
                start_date: toISODateTime(classForm.start_date),
                end_date: toISODateTime(classForm.end_date),
            };

            if (editing.type === "class" && editing.id) {
                await http.patch(`/classes/${editing.id}`, payload);
            } else {
                await http.post(`/classes`, payload);
            }
            await fetchAll();
            setClassForm(initialClass);
            setEditing({ type: null, id: null });
            toast.success("Class Created Successfully!", {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: false,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "light",
                        });
        } catch (e) {
            console.error('Error Creating Teacher:', e);
            toast.error("Some thing wrong! Unable to create class.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        } finally {
            setLoading(false);
        }
    };
    const deleteClass = async (id) => {
        // if (!confirm("Delete this class?")) return;
        // setLoading(true);
        // try {
        //     await http.delete(`/classes/${id}`);
        //     await fetchAll();
        // } catch (e) {
        //     alert(e?.response?.data?.message || e.message);
        // } 
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true);
                try {
                    const response = await http.delete(`/classes/${id}`);
                    if (response.data.success) {
                        await fetchAll();
                        Swal.fire({
                            title: "Deleted!",
                            text: "The class has been deleted.",
                            icon: "success"
                        });
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: response.data.message || "Unable to delete class.",
                            icon: "error"
                        });
                    }
                } catch (err) {
                    console.log(err);
                    Swal.fire({
                        title: "Error!",
                        text: err.response?.data?.message || "Something went wrong.",
                        icon: "error"
                    });
                }
                finally {
                    setLoading(false);
                }
            }
        });
    }

    // -------- Sections (per-course teachers) --------
    // when selecting a class, prime teaching_map entries for its courses
    useEffect(() => {
        if (!sectionForm.class_id) return;
        const cls = classes.find((c) => c.id === sectionForm.class_id);
        if (!cls) return;

        // ensure each course has an entry in the map (teacher_id may be empty)
        const nextMap = (cls.courses || []).map((course) => {
            const existing = (sectionForm.teaching_map || []).find(
                (m) => m.course_id === course.id
            );
            return existing || { course_id: course.id, teacher_id: "" };
        });
        setSectionForm((v) => ({ ...v, teaching_map: nextMap }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sectionForm.class_id]);

    const setAllTeachers = (teacher_id) => {
        setSectionForm((v) => ({
            ...v,
            teaching_map: (v.teaching_map || []).map((m) => ({
                ...m,
                teacher_id,
            })),
        }));
    };

    const saveSection = async () => {
        try {
            setLoading(true);
            if (editing.type === "section" && editing.id) {
                await http.patch(`/sections/${editing.id}`, {
                    institution_id: institutionId,
                    ...sectionForm,
                });
            } else {
                await http.post(`/sections`, {
                    institution_id: institutionId,
                    ...sectionForm,
                });
            }
            await fetchAll();
            setSectionForm(initialSection);
            setEditing({ type: null, id: null });
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };
    const deleteSection = async (id) => {
        if (!confirm("Delete this section?")) return;
        setLoading(true);
        try {
            await http.delete(`/sections/${id}`);
            await fetchAll();
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    // UI
    const classSubmitDisabled =
        loading ||
        !classForm.batch_code ||
        !classForm.course_id ||
        !(classForm.course_ids?.length) ||
        !classForm.start_date ||
        !classForm.end_date;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">Academic Setup</h1>
                {loading && <span className="text-xs text-slate-500">Loading…</span>}
                {error && <span className="text-xs text-red-600">{error}</span>}
            </div>

            <div className="flex gap-2 text-sm">
                {[
                    ["batches", "Batches"],
                    ["classes", "Classes"],
                    ["sections", "Sections"],
                    ["courses", "Subjects"],
                ].map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`px-3 py-1.5 rounded-full border ${tab === key
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-200"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Batches */}
            {tab === "batches" && (
                <Panel>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium">Batches</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setEditing({ type: null, id: null });
                                    setBatchForm(initialBatch);
                                }}
                                className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200"
                            >
                                Reset
                            </button>
                            <button
                                onClick={saveBatch}
                                className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                                {editing.type === "batch" ? "Update Batch" : "Create Batch"}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Field label="Batch Code">
                            <input
                                className="w-full border rounded px-3 py-2"
                                placeholder="2025-A"
                                value={batchForm.batch_code}
                                onChange={(e) =>
                                    setBatchForm((v) => ({ ...v, batch_code: e.target.value }))
                                }
                            />
                        </Field>
                        <Field label="Starting Date">
                            <input
                                type="date"
                                className="w-full border rounded px-3 py-2"
                                value={batchForm.starting_date}
                                onChange={(e) =>
                                    setBatchForm((v) => ({ ...v, starting_date: e.target.value }))
                                }
                            />
                        </Field>
                        <Field label="Ending Date">
                            <input
                                type="date"
                                className="w-full border rounded px-3 py-2"
                                value={batchForm.ending_date}
                                onChange={(e) =>
                                    setBatchForm((v) => ({ ...v, ending_date: e.target.value }))
                                }
                            />
                        </Field>
                    </div>

                    <Table
                        columns={[
                            { key: "batch_code", title: "Batch Code" },
                            {
                                key: "starting_date",
                                title: "Start",
                                render: (r) =>
                                    r.starting_date
                                        ? new Date(r.starting_date).toLocaleDateString()
                                        : "—",
                            },
                            {
                                key: "ending_date",
                                title: "End",
                                render: (r) =>
                                    r.ending_date
                                        ? new Date(r.ending_date).toLocaleDateString()
                                        : "—",
                            },
                            {
                                key: "created_at",
                                title: "Created",
                                render: (r) =>
                                    new Date(r.created_at).toLocaleDateString(),
                            },
                        ]}
                        data={batches}
                        renderActions={(row) => (
                            <div className="flex gap-2 justify-end">
                                <button
                                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                                    onClick={() => {
                                        setEditing({ type: "batch", id: row.id });
                                        setBatchForm({
                                            batch_code: row.batch_code,
                                            starting_date: row.starting_date?.slice(0, 10) || "",
                                            ending_date: row.ending_date?.slice(0, 10) || "",
                                        });
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                    onClick={() => deleteBatch(row.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    />
                </Panel>
            )}

            {/* Classes (multi-course + primary course) */}
            {tab === "classes" && (
                <Panel>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium">Classes</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setEditing({ type: null, id: null });
                                    setClassForm(initialClass);
                                }}
                                className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200"
                            >
                                Reset
                            </button>
                            <button
                                onClick={saveClass}
                                disabled={classSubmitDisabled}
                                className={`px-3 py-1.5 rounded text-white ${classSubmitDisabled
                                    ? "bg-slate-300 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                            >
                                {editing.type === "class" ? "Update Class" : "Create Class"}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Field label="Batch Code">
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={classForm.batch_code}
                                onChange={(e) =>
                                    setClassForm((v) => ({ ...v, batch_code: e.target.value }))
                                }
                            >
                                <option value="">Select batch code</option>
                                {batches.map((b) => (
                                    <option key={b.id} value={b.batch_code}>
                                        {b.batch_code}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Homeroom Teacher (optional)">
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={classForm.homeroom_teacher_id}
                                onChange={(e) =>
                                    setClassForm((v) => ({
                                        ...v,
                                        homeroom_teacher_id: e.target.value,
                                    }))
                                }
                            >
                                <option value="">None</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name_eng} ({t.teacher_initial})
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Subjects in this Class">
                            <select
                                multiple
                                className="w-full border rounded px-3 py-2 h-32"
                                value={classForm.course_ids}
                                onChange={(e) => {
                                    const vals = Array.from(e.target.selectedOptions).map(
                                        (o) => o.value
                                    );
                                    setClassForm((v) => {
                                        let nextPrimary = v.course_id;
                                        if (!vals.includes(nextPrimary)) {
                                            nextPrimary = vals[0] || "";
                                        }
                                        return { ...v, course_ids: vals, course_id: nextPrimary };
                                    });
                                }}
                            >
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.title} ({c.course_code})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">
                                Hold Ctrl/Cmd to select multiple.
                            </p>
                        </Field>

                        <Field label="Primary Subject">
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={classForm.course_id}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setClassForm((v) => {
                                        const has = v.course_ids.includes(value);
                                        return {
                                            ...v,
                                            course_id: value,
                                            course_ids: has
                                                ? v.course_ids
                                                : value
                                                    ? [value, ...v.course_ids]
                                                    : v.course_ids,
                                        };
                                    });
                                }}
                            >
                                <option value="">Select primary subject</option>
                                {(classForm.course_ids.length
                                    ? courses.filter((c) => classForm.course_ids.includes(c.id))
                                    : courses
                                ).map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.title} ({c.course_code})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">
                                This is required by the backend (<code>course_id</code>).
                            </p>
                        </Field>

                        <Field label="Title (optional)">
                            <input
                                className="w-full border rounded px-3 py-2"
                                placeholder="Class 10"
                                value={classForm.title}
                                onChange={(e) =>
                                    setClassForm((v) => ({ ...v, title: e.target.value }))
                                }
                            />
                        </Field>
                        <Field label="Description (optional)">
                            <input
                                className="w-full border rounded px-3 py-2"
                                placeholder="Notes"
                                value={classForm.description}
                                onChange={(e) =>
                                    setClassForm((v) => ({ ...v, description: e.target.value }))
                                }
                            />
                        </Field>
                        <Field label="Start Date">
                            <input
                                type="date"
                                className="w-full border rounded px-3 py-2"
                                value={classForm.start_date}
                                onChange={(e) =>
                                    setClassForm((v) => ({ ...v, start_date: e.target.value }))
                                }
                            />
                        </Field>
                        <Field label="End Date">
                            <input
                                type="date"
                                className="w-full border rounded px-3 py-2"
                                value={classForm.end_date}
                                onChange={(e) =>
                                    setClassForm((v) => ({ ...v, end_date: e.target.value }))
                                }
                            />
                        </Field>
                    </div>

                    <Table
                        columns={[
                            { key: "title", title: "Title" },
                            {
                                key: "courses",
                                title: "Subjects",
                                render: (r) =>
                                    r.courses?.length
                                        ? r.courses
                                            .map((c) => `${c.title} (${c.course_code})`)
                                            .join(", ")
                                        : "—",
                            },
                            {
                                key: "primary_course",
                                title: "Primary",
                                render: (r) =>
                                    r.primary_course
                                        ? `${r.primary_course.title} (${r.primary_course.course_code})`
                                        : "—",
                            },
                            { key: "batch_code", title: "Batch Code" },
                            {
                                key: "homeroom_teacher",
                                title: "Homeroom Teacher",
                                render: (r) =>
                                    r.homeroom_teacher
                                        ? `${r.homeroom_teacher.name_eng} (${r.homeroom_teacher.teacher_initial})`
                                        : "—",
                            },
                            {
                                key: "start_date",
                                title: "Start",
                                render: (r) =>
                                    r.start_date
                                        ? new Date(r.start_date).toLocaleDateString()
                                        : "—",
                            },
                            {
                                key: "end_date",
                                title: "End",
                                render: (r) =>
                                    r.end_date
                                        ? new Date(r.end_date).toLocaleDateString()
                                        : "—",
                            },
                        ]}
                        data={classes}
                        renderActions={(row) => (
                            <div className="flex gap-2 justify-end">
                                <button
                                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                                    onClick={() => {
                                        setEditing({ type: "class", id: row.id });
                                        setClassForm({
                                            batch_code: row.batch_code || "",
                                            title: row.title || "",
                                            description: row.description || "",
                                            start_date: row.start_date?.slice(0, 10) || "",
                                            end_date: row.end_date?.slice(0, 10) || "",
                                            homeroom_teacher_id: row.homeroom_teacher_id || "",
                                            course_ids: (row.courses || []).map((c) => c.id),
                                            course_id: row.primary_course?.id || "", // hydrate primary
                                        });
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                    onClick={() => deleteClass(row.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    />
                </Panel>
            )}

            {/* Sections (assign per-course teachers) */}
            {tab === "sections" && (
                <Panel>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium">Sections</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setEditing({ type: null, id: null });
                                    setSectionForm(initialSection);
                                }}
                                className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200"
                            >
                                Reset
                            </button>
                            <button
                                onClick={saveSection}
                                className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                                {editing.type === "section" ? "Update Section" : "Create Section"}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Field label="Class">
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={sectionForm.class_id}
                                onChange={(e) =>
                                    setSectionForm((v) => ({
                                        ...v,
                                        class_id: e.target.value,
                                        teaching_map: [],
                                    }))
                                }
                            >
                                <option value="">Select class</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.title ||
                                            `${c.batch_code} - ${c.courses
                                                ?.map((x) => x.title)
                                                .join(", ")}`}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Section Name">
                            <input
                                className="w-full border rounded px-3 py-2"
                                placeholder="A / Blue / Morning"
                                value={sectionForm.section_name}
                                onChange={(e) =>
                                    setSectionForm((v) => ({
                                        ...v,
                                        section_name: e.target.value,
                                    }))
                                }
                            />
                        </Field>

                        <Field label="Homeroom Teacher (optional)">
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={sectionForm.homeroom_teacher_id}
                                onChange={(e) =>
                                    setSectionForm((v) => ({
                                        ...v,
                                        homeroom_teacher_id: e.target.value,
                                    }))
                                }
                            >
                                <option value="">None</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name_eng} ({t.teacher_initial})
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {/* Assignment Matrix */}
                    {sectionForm.class_id && (
                        <div className="border rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-medium">
                                    Assign Teachers per Subject (for this Section)
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-600">Set all to</span>
                                    <select
                                        className="border rounded px-2 py-1"
                                        onChange={(e) => e.target.value && setAllTeachers(e.target.value)}
                                    >
                                        <option value="">—</option>
                                        {teachers.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name_eng} ({t.teacher_initial})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {(sectionForm.teaching_map || []).map((m, idx) => {
                                    const course = (
                                        classes.find((c) => c.id === sectionForm.class_id)?.courses ||
                                        []
                                    ).find((cc) => cc.id === m.course_id);
                                    return (
                                        <div key={m.course_id} className="flex items-center gap-3">
                                            <div className="w-1/2 text-slate-700">
                                                {course
                                                    ? `${course.title} (${course.course_code})`
                                                    : m.course_id}
                                            </div>
                                            <div className="w-1/2">
                                                <select
                                                    className="w-full border rounded px-3 py-2"
                                                    value={m.teacher_id}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setSectionForm((v) => {
                                                            const next = [...v.teaching_map];
                                                            next[idx] = { ...next[idx], teacher_id: value };
                                                            return { ...v, teaching_map: next };
                                                        });
                                                    }}
                                                >
                                                    <option value="">— Select Teacher —</option>
                                                    {teachers.map((t) => (
                                                        <option key={t.id} value={t.id}>
                                                            {t.name_eng} ({t.teacher_initial})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <Table
                        columns={[
                            {
                                key: "class",
                                title: "Class",
                                render: (r) =>
                                    r.class
                                        ? r.class.title ||
                                        `${r.class.batch_code} - ${(r.class.courses || [])
                                            .map((c) => c.title)
                                            .join(", ")}`
                                        : "—",
                            },
                            { key: "section_name", title: "Section" },
                            {
                                key: "teaching",
                                title: "Subject → Teacher",
                                render: (r) =>
                                    (r.teaching || []).length
                                        ? r.teaching
                                            .map(
                                                (t) =>
                                                    `${t.course.title} → ${t.teacher?.name_eng || "—"}`
                                            )
                                            .join(" | ")
                                        : "—",
                            },
                            {
                                key: "created_at",
                                title: "Created",
                                render: (r) => new Date(r.created_at).toLocaleDateString(),
                            },
                        ]}
                        data={sections}
                        renderActions={(row) => (
                            <div className="flex gap-2 justify-end">
                                <button
                                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                                    onClick={() => {
                                        setEditing({ type: "section", id: row.id });
                                        setSectionForm({
                                            class_id: row.class_id || "",
                                            section_name: row.section_name || "",
                                            homeroom_teacher_id: row.homeroom_teacher_id || "",
                                            teaching_map: (row.teaching || []).map((t) => ({
                                                course_id: t.course.id,
                                                teacher_id: t.teacher?.id || "",
                                            })),
                                        });
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                    onClick={() => deleteSection(row.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    />
                </Panel>
            )}

            {/* Subjects */}
            {tab === "courses" && (
                <Panel>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium">Subjects</h2>
                        <div className="flex gap-2">
                            {/* simple quick-create inline form */}
                            <button
                                onClick={async () => {
                                    const code = prompt("Course code? (e.g., PHY-101)");
                                    const title = code
                                        ? prompt("Course title? (e.g., Physics)")
                                        : null;
                                    if (!code || !title) return;
                                    try {
                                        setLoading(true);
                                        await http.post(`/courses`, {
                                            institution_id: institutionId,
                                            course_code: code,
                                            title,
                                        });
                                        await fetchAll();
                                    } catch (e) {
                                        alert(e?.response?.data?.message || e.message);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Quick Add
                            </button>
                        </div>
                    </div>
                    <Table
                        columns={[
                            { key: "course_code", title: "Code" },
                            { key: "title", title: "Title" },
                            { key: "description", title: "Description" },
                        ]}
                        data={courses}
                        renderActions={(row) => (
                            <div className="flex gap-2 justify-end">
                                <button
                                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                                    onClick={async () => {
                                        const title = prompt("New title", row.title);
                                        if (title == null) return;
                                        try {
                                            setLoading(true);
                                            await http.patch(`/courses/${row.id}`, { title });
                                            await fetchAll();
                                        } catch (e) {
                                            alert(e?.response?.data?.message || e.message);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                >
                                    Rename
                                </button>
                                <button
                                    className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                    onClick={async () => {
                                        if (!confirm("Delete subject?")) return;
                                        try {
                                            setLoading(true);
                                            await http.delete(`/courses/${row.id}`);
                                            await fetchAll();
                                        } catch (e) {
                                            alert(e?.response?.data?.message || e.message);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    />
                </Panel>
            )}
        </div>
    );
}
