// frontend/src/pages/TeacherMarks.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router";

const API = import.meta.env.VITE_BACKEND_LINK || "http://localhost:3010";

function Pill({ active, onClick, children }) {
    return (
        <button
            className={`px-3 py-1.5 rounded-full border text-sm ${active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"
                }`}
            onClick={onClick}
            type="button"
        >
            {children}
        </button>
    );
}

export default function TeacherResultSubmission() {
    const location = useLocation();
    const institutionId = useMemo(() => {
        const m = location.pathname.match(/\/(\w+)(?:\/|$)/);
        return m ? m[1] : null;
    }, [location.pathname]);
    const teacherId = new URLSearchParams(location.search).get("teacher_id") || localStorage.getItem("teacher_id") || "";

    const [tab, setTab] = useState("enter"); // enter | mysubmissions
    const [lookups, setLookups] = useState({ homeroomSections: [], assignedSections: [], examTypes: [] });
    const [sectionId, setSectionId] = useState("");
    const [sectionCourses, setSectionCourses] = useState([]);
    const [courseId, setCourseId] = useState("");
    const [examTypeId, setExamTypeId] = useState("");
    const [segments, setSegments] = useState([]);
    const [segmentId, setSegmentId] = useState("");
    const [segment, setSegment] = useState(null);
    const [roster, setRoster] = useState([]); // [{student, result}]
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [remarks, setRemarks] = useState(""); // submit message

    // My submissions
    const [list, setList] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");

    // --- load lookups
    useEffect(() => {
        async function fetchLookups() {
            if (!institutionId || !teacherId) return;
            try {
                const { data } = await axios.get(`${API}/teacher-results/lookups`, {
                    params: { institution_id: institutionId, teacher_id: teacherId }
                });
                setLookups(data.data);
            } catch (e) {
                setErr(e?.response?.data?.message || e.message);
            }
        }
        fetchLookups();
    }, [institutionId, teacherId]);

    // available courses when section changes
    useEffect(() => {
        setSectionCourses([]);
        setCourseId("");
        setSegments([]);
        setSegmentId("");
        setRoster([]);
        if (!sectionId) return;

        const s =
            lookups.homeroomSections.find(x => x.id === sectionId) ||
            lookups.assignedSections.find(x => x.id === sectionId);
        setSectionCourses((s?.courses || []).filter(Boolean));
    }, [sectionId, lookups]);

    // segments when course changes
    useEffect(() => {
        async function fetchSegments() {
            setSegments([]); setSegmentId(""); setRoster([]); setSegment(null);
            if (!courseId) return;
            const { data } = await axios.get(`${API}/teacher-results/segments`, { params: { course_id: courseId } });
            setSegments(data.data || []);
        }
        if (courseId) fetchSegments();
    }, [courseId]);

    // pick segment object
    useEffect(() => {
        setSegment(segments.find(s => s.id === segmentId) || null);
    }, [segmentId, segments]);

    const loadRoster = async () => {
        if (!institutionId || !teacherId || !sectionId || !courseId || !examTypeId || !segmentId) {
            alert("Please select Section, Subject, Exam Type, and Segment.");
            return;
        }
        setLoading(true); setErr("");
        try {
            const { data } = await axios.get(`${API}/teacher-results/roster`, {
                params: {
                    institution_id: institutionId,
                    teacher_id: teacherId,
                    section_id: sectionId,
                    course_id: courseId,
                    examTypeId,
                    mark_segment_id: segmentId
                }
            });
            setRoster(data.data.roster || []);
            setSegment(data.data.segment || null);
        } catch (e) {
            setRoster([]);
            setErr(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const setAll = (val) => {
        if (!segment) return;
        const v = Math.max(0, Math.min(Number(val) || 0, segment.max_marks));
        setRoster(rs => rs.map(r => ({
            ...r,
            result: r.result
                ? { ...r.result, marks: v }
                : { marks: v, remarks: "" }
        })));
    };

    const saveDraft = async () => {
        if (!roster.length) return;
        if (!segment) { alert("Pick a segment"); return; }
        const items = roster.map(r => ({
            student_id: r.student.id,
            marks: Number(r.result?.marks ?? 0),
            remarks: r.result?.remarks || ""
        }));
        setLoading(true);
        try {
            await axios.post(`${API}/teacher-results/save-draft`, {
                institution_id: institutionId,
                teacher_id: teacherId,
                section_id: sectionId,
                course_id: courseId,
                examTypeId,
                mark_segment_id: segmentId,
                items
            });
            alert("Draft saved");
            await loadRoster();
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const submit = async () => {
        if (!roster.length) return;
        if (!segment) { alert("Pick a segment"); return; }
        const items = roster.map(r => ({
            student_id: r.student.id,
            marks: Number(r.result?.marks ?? 0),
            remarks: r.result?.remarks || ""
        }));
        setLoading(true);
        try {
            await axios.post(`${API}/teacher-results/submit`, {
                institution_id: institutionId,
                teacher_id: teacherId,
                section_id: sectionId,
                course_id: courseId,
                examTypeId,
                mark_segment_id: segmentId,
                items,
                remarks
            });
            alert("Submitted for approval");
            await loadRoster();
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const loadMine = async () => {
        if (!institutionId || !teacherId) return;
        setLoading(true); setErr("");
        try {
            const { data } = await axios.get(`${API}/teacher-results/mine`, {
                params: { institution_id: institutionId, teacher_id: teacherId, status: statusFilter }
            });
            setList(data.data || []);
        } catch (e) {
            setList([]);
            setErr(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { if (tab === "mysubmissions") loadMine(); /* eslint-disable-next-line */ }, [tab, statusFilter]);

    const maxMarks = segment?.max_marks ?? null;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Enter Student Marks</h1>
                <div className="flex gap-2">
                    <Pill active={tab === "enter"} onClick={() => setTab("enter")}>Enter Marks</Pill>
                    <Pill active={tab === "mysubmissions"} onClick={() => setTab("mysubmissions")}>My Submissions</Pill>
                </div>
            </div>

            {tab === "enter" && (
                <>
                    <div className="bg-white rounded-2xl shadow p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
                        <label className="text-sm">
                            <span className="block text-slate-600 mb-1">Section</span>
                            <select className="w-full border rounded px-3 py-2" value={sectionId} onChange={e => setSectionId(e.target.value)}>
                                <option value="">Select</option>
                                {lookups.homeroomSections.map(s => (
                                    <option key={`h-${s.id}`} value={s.id}>{s.section_name} (Homeroom)</option>
                                ))}
                                {lookups.assignedSections.map(s => (
                                    <option key={`a-${s.id}`} value={s.id}>{s.section_name} (Assigned)</option>
                                ))}
                            </select>
                        </label>

                        <label className="text-sm">
                            <span className="block text-slate-600 mb-1">Subject</span>
                            <select className="w-full border rounded px-3 py-2" value={courseId} onChange={e => setCourseId(e.target.value)}>
                                <option value="">Select</option>
                                {sectionCourses.map(c => c && (
                                    <option key={c.id} value={c.id}>{c.title} ({c.course_code})</option>
                                ))}
                            </select>
                        </label>

                        <label className="text-sm">
                            <span className="block text-slate-600 mb-1">Exam Type</span>
                            <select className="w-full border rounded px-3 py-2" value={examTypeId} onChange={e => setExamTypeId(e.target.value)}>
                                <option value="">Select</option>
                                {lookups.examTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
                            </select>
                        </label>

                        <label className="text-sm">
                            <span className="block text-slate-600 mb-1">Mark Segment</span>
                            <select className="w-full border rounded px-3 py-2" value={segmentId} onChange={e => setSegmentId(e.target.value)}>
                                <option value="">Select</option>
                                {segments.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} {s.isMainResult ? "(Main)" : ""} — max {s.max_marks}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="text-sm">
                            <span className="block text-slate-600 mb-1">Bulk Set</span>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    max={maxMarks ?? undefined}
                                    placeholder={maxMarks ? `0 - ${maxMarks}` : "Enter value"}
                                    className="w-32 border rounded px-3 py-2"
                                    onKeyDown={(e) => { if (e.key === "Enter") { setAll(e.currentTarget.value); e.currentTarget.blur(); } }}
                                />
                                <button className="px-3 py-2 rounded bg-slate-100" onClick={loadRoster}>Load Students</button>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Press Enter to apply bulk value to all visible rows.
                            </p>
                        </div>

                        <div className="text-sm md:col-span-2">
                            <span className="block text-slate-600 mb-1">Submission Note (optional)</span>
                            <input className="w-full border rounded px-3 py-2" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Any note to admin" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow mt-4">
                        <div className="p-3 flex items-center justify-between border-b">
                            <div className="text-sm text-slate-600">
                                {loading ? "Loading…" : err ? <span className="text-rose-600">{err}</span> : `Students: ${roster.length}${maxMarks ? ` — Max: ${maxMarks}` : ""}`}
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 rounded bg-slate-100" onClick={() => setRoster(rs => rs.map(r => ({ ...r, result: null })))}>Clear</button>
                                <button className="px-3 py-1.5 rounded bg-blue-600 text-white" onClick={saveDraft}>Save Draft</button>
                                <button className="px-3 py-1.5 rounded bg-green-600 text-white" onClick={submit}>Submit</button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b text-left">
                                        <th className="py-2 px-3">Student</th>
                                        <th className="py-2 px-3">Roll</th>
                                        <th className="py-2 px-3">Marks</th>
                                        <th className="py-2 px-3">Remarks</th>
                                        <th className="py-2 px-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roster.map(({ student, result }) => {
                                        const disabled = result?.isPublished || result?.workflow?.status === "approved";
                                        return (
                                            <tr key={student.id} className="border-b hover:bg-slate-50">
                                                <td className="py-2 px-3">
                                                    <div className="font-medium">{student.name_eng}</div>
                                                    <div className="text-xs text-slate-500">{student.student_id}</div>
                                                </td>
                                                <td className="py-2 px-3">{student.class_roll || "—"}</td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={maxMarks ?? undefined}
                                                        disabled={disabled}
                                                        className={`w-32 border rounded px-3 py-2 ${disabled ? "bg-slate-50" : ""}`}
                                                        value={result?.marks ?? ""}
                                                        onChange={(e) => {
                                                            const v = Math.max(0, Math.min(Number(e.target.value || 0), maxMarks ?? Infinity));
                                                            setRoster(rs => rs.map(r =>
                                                                r.student.id === student.id
                                                                    ? { ...r, result: r.result ? { ...r.result, marks: v } : { marks: v, remarks: "" } }
                                                                    : r
                                                            ));
                                                        }}
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        className={`w-full border rounded px-3 py-2 ${disabled ? "bg-slate-50" : ""}`}
                                                        disabled={disabled}
                                                        value={result?.remarks ?? ""}
                                                        onChange={(e) => {
                                                            const txt = e.target.value;
                                                            setRoster(rs => rs.map(r =>
                                                                r.student.id === student.id
                                                                    ? { ...r, result: r.result ? { ...r.result, remarks: txt } : { marks: 0, remarks: txt } }
                                                                    : r
                                                            ));
                                                        }}
                                                        placeholder="Optional"
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${result?.workflow?.status === "approved" ? "bg-green-100 text-green-800" :
                                                            result?.workflow?.status === "pending" ? "bg-amber-100 text-amber-900" :
                                                                result?.workflow?.status === "rejected" ? "bg-rose-100 text-rose-800" :
                                                                    "bg-slate-100 text-slate-700"
                                                        }`}>
                                                        {result?.workflow?.status || "draft"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {(!roster || roster.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="py-10 text-center text-slate-400">No students loaded</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {tab === "mysubmissions" && (
                <div className="bg-white rounded-2xl shadow p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-slate-600">{loading ? "Loading…" : err ? <span className="text-rose-600">{err}</span> : `Rows: ${list.length}`}</div>
                        <div className="flex items-center gap-2">
                            <select className="border rounded px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                <option value="all">All</option>
                                <option value="draft">Draft</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <button className="px-3 py-1.5 rounded bg-slate-100" onClick={loadMine}>Refresh</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b text-left">
                                    <th className="py-2 px-3">Student</th>
                                    <th className="py-2 px-3">Section / Class</th>
                                    <th className="py-2 px-3">Subject</th>
                                    <th className="py-2 px-3">Exam</th>
                                    <th className="py-2 px-3">Segment</th>
                                    <th className="py-2 px-3">Marks</th>
                                    <th className="py-2 px-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map(r => (
                                    <tr key={r.id} className="border-b">
                                        <td className="py-2 px-3">{r.student?.name_eng} <div className="text-xs text-slate-500">{r.student?.student_id}</div></td>
                                        <td className="py-2 px-3">
                                            {r.section?.section_name || "—"}
                                            <div className="text-xs text-slate-500">{r.section?.class?.title || r.section?.class?.batch_code || "—"}</div>
                                        </td>
                                        <td className="py-2 px-3">{r.course?.title} <div className="text-xs text-slate-500">{r.course?.course_code}</div></td>
                                        <td className="py-2 px-3">{r.examType?.name}</td>
                                        <td className="py-2 px-3">{r.markSegment?.name}</td>
                                        <td className="py-2 px-3">{r.marks}</td>
                                        <td className="py-2 px-3">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${r.workflow?.status === "approved" ? "bg-green-100 text-green-800" :
                                                    r.workflow?.status === "pending" ? "bg-amber-100 text-amber-900" :
                                                        r.workflow?.status === "rejected" ? "bg-rose-100 text-rose-800" :
                                                            "bg-slate-100 text-slate-700"
                                                }`}>
                                                {r.workflow?.status || "draft"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!list || list.length === 0) && (
                                    <tr><td colSpan={7} className="py-8 text-center text-slate-400">Nothing yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
