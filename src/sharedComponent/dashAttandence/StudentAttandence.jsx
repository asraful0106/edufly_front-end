import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom"; // must be from react-router-dom
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_LINK || "http://localhost:3010";

const STATUS = ["present", "absent", "late", "leave"];
const StatusPill = ({ value, onChange }) => (
    <div className="inline-flex gap-1 bg-slate-100 rounded-full p-1">
        {STATUS.map((s) => (
            <button
                key={s}
                type="button"
                className={`px-2 py-1 text-xs rounded-full ${value === s ? "bg-white shadow" : "hover:bg-white/60"
                    }`}
                onClick={() => onChange(s)}
            >
                {s}
            </button>
        ))}
    </div>
);

export default function StudenceAttandance() {
    const location = useLocation();

    // ---- NEW: read edufly_profile from localStorage once ----
    const profile = useMemo(() => {
        try {
            const raw = localStorage.getItem("edufly_profile");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }, []);

    // Prefer institution_id from profile; fall back to first path segment
    const institutionId = useMemo(() => {
        if (profile?.institution_id) return String(profile.institution_id);
        if (profile?.institution_eiin) return String(profile.institution_eiin);
        const m = location.pathname.match(/^\/([^/]+)/);
        return m ? m[1] : null;
    }, [profile, location.pathname]);

    // Prefer teacher_id from profile; fall back to ?teacher_id=... or legacy localStorage
    const params = new URLSearchParams(location.search);
    const teacherId =
        (profile?.role === "teacher" && profile?.teacher_id) ||
        params.get("teacher_id") ||
        localStorage.getItem("teacher_id") ||
        "";

    const [tab, setTab] = useState("take"); // take | analytics
    const [scopeType, setScopeType] = useState("class"); // class | section
    const [lookups, setLookups] = useState({
        classes: [],
        sectionsHomeroom: [],
        sectionsAssigned: [],
    });
    const [classId, setClassId] = useState("");
    const [sectionId, setSectionId] = useState("");
    const [courses, setCourses] = useState([]); // available courses for current scope
    const [courseId, setCourseId] = useState("");
    const [date, setDate] = useState(() =>
        new Date().toISOString().slice(0, 10)
    );
    const [roster, setRoster] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    // analytics
    const [range, setRange] = useState({
        from: new Date(new Date().setDate(new Date().getDate() - 7))
            .toISOString()
            .slice(0, 10),
        to: new Date().toISOString().slice(0, 10),
    });
    const [analytics, setAnalytics] = useState(null);

    // ----- load lookups -----
    const fetchLookups = async () => {
        if (!institutionId || !teacherId) return;
        try {
            const { data } = await axios.get(`${API}/attendance/lookups`, {
                params: { institution_id: institutionId, teacher_id: teacherId },
            });
            setLookups(data.data);
            setErr("");
        } catch (e) {
            setErr(e?.response?.data?.message || e.message);
        }
    };
    useEffect(() => {
        fetchLookups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [institutionId, teacherId]);

    // ----- whenever scope/class/section changes, fetch available courses -----
    const fetchCourses = async () => {
        setCourses([]);
        setCourseId("");
        if (!teacherId) return;
        try {
            if (scopeType === "class" && classId) {
                const { data } = await axios.get(
                    `${API}/attendance/available-courses`,
                    {
                        params: { class_id: classId, teacher_id: teacherId },
                    }
                );
                setCourses(data.data || []);
            } else if (scopeType === "section" && sectionId) {
                const { data } = await axios.get(
                    `${API}/attendance/available-courses`,
                    {
                        params: { section_id: sectionId, teacher_id: teacherId },
                    }
                );
                setCourses(data.data || []);
            }
            setErr("");
        } catch (e) {
            setErr(e?.response?.data?.message || e.message);
        }
    };
    useEffect(() => {
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scopeType, classId, sectionId]);

    // ----- load roster -----
    const loadRoster = async () => {
        if (!institutionId || !teacherId || !date) return;
        if (new Date(date) > new Date()) {
            alert("Date cannot be in the future");
            return;
        }
        if (scopeType === "class" && !classId) {
            alert("Select class");
            return;
        }
        if (scopeType === "section" && !sectionId) {
            alert("Select section");
            return;
        }
        if (!courseId) {
            alert("Select subject");
            return;
        }

        setLoading(true);
        setErr("");
        try {
            const { data } = await axios.get(`${API}/attendance/roster`, {
                params: {
                    institution_id: institutionId,
                    teacher_id: teacherId,
                    date,
                    class_id: scopeType === "class" ? classId : undefined,
                    section_id: scopeType === "section" ? sectionId : undefined,
                    course_id: courseId,
                },
            });
            setRoster(data.data.roster || []);
        } catch (e) {
            setRoster([]);
            setErr(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const save = async () => {
        if (!roster.length) return;
        const items = roster.map((r) => ({
            student_id: r.student.id,
            status: r.record?.status || "present",
            remarks: r.record?.remarks || "",
        }));
        setLoading(true);
        try {
            await axios.post(`${API}/attendance/save`, {
                institution_id: institutionId,
                teacher_id: teacherId,
                date,
                class_id: scopeType === "class" ? classId : undefined,
                section_id: scopeType === "section" ? sectionId : undefined,
                course_id: courseId,
                items,
            });
            alert("Saved!");
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const setAll = (status) => {
        setRoster((rs) =>
            rs.map((row) => ({
                ...row,
                record: {
                    ...(row.record || {}),
                    student_id: row.student.id,
                    status,
                    remarks: row.record?.remarks || "",
                },
            }))
        );
    };

    // ----- analytics -----
    const loadAnalytics = async () => {
        if (!institutionId || !teacherId) return;
        setLoading(true);
        setErr("");
        try {
            const { data } = await axios.get(`${API}/attendance/analytics`, {
                params: {
                    institution_id: institutionId,
                    teacher_id: teacherId,
                    from: range.from,
                    to: range.to,
                    class_id: scopeType === "class" ? classId : undefined,
                    section_id: scopeType === "section" ? sectionId : undefined,
                    course_id: courseId || undefined,
                },
            });
            setAnalytics(data.data);
        } catch (e) {
            setAnalytics(null);
            setErr(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (tab === "analytics") loadAnalytics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);

    const maxDate = new Date().toISOString().slice(0, 10);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Student Attendance</h1>
                <div className="flex gap-2">
                    <button
                        className={`px-3 py-1.5 rounded-full ${tab === "take"
                                ? "bg-slate-900 text-white"
                                : "bg-white border border-slate-200"
                            }`}
                        onClick={() => setTab("take")}
                    >
                        Take Attendance
                    </button>
                    <button
                        className={`px-3 py-1.5 rounded-full ${tab === "analytics"
                                ? "bg-slate-900 text-white"
                                : "bg-white border border-slate-200"
                            }`}
                        onClick={() => setTab("analytics")}
                    >
                        Analytics
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
                <label className="text-sm">
                    <span className="block text-slate-600 mb-1">Scope</span>
                    <select
                        className="w-full border rounded px-3 py-2"
                        value={scopeType}
                        onChange={(e) => {
                            setScopeType(e.target.value);
                            setClassId("");
                            setSectionId("");
                            setCourses([]);
                            setCourseId("");
                        }}
                    >
                        <option value="class">Class</option>
                        <option value="section">Section</option>
                    </select>
                </label>

                {scopeType === "class" ? (
                    <label className="text-sm">
                        <span className="block text-slate-600 mb-1">Class (homeroom)</span>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={classId}
                            onChange={(e) => {
                                setClassId(e.target.value);
                                setCourseId("");
                            }}
                        >
                            <option value="">Select class</option>
                            {lookups.classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title || c.batch_code}
                                </option>
                            ))}
                        </select>
                    </label>
                ) : (
                    <label className="text-sm">
                        <span className="block text-slate-600 mb-1">Section</span>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={sectionId}
                            onChange={(e) => {
                                setSectionId(e.target.value);
                                setCourseId("");
                            }}
                        >
                            <option value="">Select section</option>
                            {lookups.sectionsHomeroom.map((s) => (
                                <option key={`h-${s.id}`} value={s.id}>
                                    {s.section_name} (Homeroom)
                                </option>
                            ))}
                            {lookups.sectionsAssigned.map((s) => (
                                <option key={`a-${s.id}`} value={s.id}>
                                    {s.section_name} (Assigned)
                                </option>
                            ))}
                        </select>
                    </label>
                )}

                <label className="text-sm">
                    <span className="block text-slate-600 mb-1">Subject</span>
                    <select
                        className="w-full border rounded px-3 py-2"
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                    >
                        <option value="">Select subject</option>
                        {courses.map(
                            (c) =>
                                c && (
                                    <option key={c.id} value={c.id}>
                                        {c.title} ({c.course_code})
                                    </option>
                                )
                        )}
                    </select>
                </label>

                <label className="text-sm">
                    <span className="block text-slate-600 mb-1">Date</span>
                    <input
                        type="date"
                        className="w-full border rounded px-3 py-2"
                        value={date}
                        max={maxDate}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </label>

                <div className="md:col-span-5 flex items-end gap-2">
                    <button
                        className="px-3 py-2 rounded bg-slate-100 text-sm"
                        onClick={() => {
                            setScopeType("class");
                            setClassId("");
                            setSectionId("");
                            setCourses([]);
                            setCourseId("");
                            setRoster([]);
                            setDate(maxDate);
                        }}
                    >
                        Reset
                    </button>
                    <button
                        className="px-3 py-2 rounded bg-slate-900 text-white text-sm"
                        onClick={loadRoster}
                    >
                        Load Roster
                    </button>
                </div>
            </div>

            {/* Take Attendance */}
            {tab === "take" && (
                <div className="bg-white rounded-2xl shadow">
                    <div className="p-4 flex items-center justify-between border-b">
                        <div className="text-sm text-slate-600">
                            {loading ? (
                                "Loading…"
                            ) : err ? (
                                <span className="text-rose-600">{err}</span>
                            ) : (
                                `Students: ${roster.length}`
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setAll("present")}
                                className="px-2 py-1 rounded bg-green-100 text-green-800 text-sm"
                            >
                                All Present
                            </button>
                            <button
                                onClick={() => setAll("absent")}
                                className="px-2 py-1 rounded bg-rose-100 text-rose-800 text-sm"
                            >
                                All Absent
                            </button>
                            <button
                                onClick={() => setAll("late")}
                                className="px-2 py-1 rounded bg-amber-100 text-amber-900 text-sm"
                            >
                                All Late
                            </button>
                            <button
                                onClick={() =>
                                    setRoster((rs) => rs.map((r) => ({ ...r, record: null })))
                                }
                                className="px-2 py-1 rounded bg-slate-100 text-sm"
                            >
                                Clear
                            </button>
                            <button
                                onClick={save}
                                className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm"
                            >
                                Save
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b text-left">
                                    <th className="py-2 px-3">Student</th>
                                    <th className="py-2 px-3">Status</th>
                                    <th className="py-2 px-3">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roster.map(({ student, record }) => (
                                    <tr key={student.id} className="border-b hover:bg-slate-50">
                                        <td className="py-2 px-3">
                                            <div className="font-medium">{student.name_eng}</div>
                                            <div className="text-xs text-slate-500">
                                                {student.student_id}
                                            </div>
                                        </td>
                                        <td className="py-2 px-3">
                                            <StatusPill
                                                value={record?.status || "present"}
                                                onChange={(s) =>
                                                    setRoster((rs) =>
                                                        rs.map((r) =>
                                                            r.student.id === student.id
                                                                ? {
                                                                    ...r,
                                                                    record: {
                                                                        ...(r.record || {}),
                                                                        student_id: student.id,
                                                                        status: s,
                                                                    },
                                                                }
                                                                : r
                                                        )
                                                    )
                                                }
                                            />
                                        </td>
                                        <td className="py-2 px-3">
                                            <input
                                                className="w-full border rounded px-3 py-2"
                                                placeholder="Optional"
                                                value={record?.remarks || ""}
                                                onChange={(e) =>
                                                    setRoster((rs) =>
                                                        rs.map((r) =>
                                                            r.student.id === student.id
                                                                ? {
                                                                    ...r,
                                                                    record: {
                                                                        ...(r.record || {}),
                                                                        student_id: student.id,
                                                                        status: r.record?.status || "present",
                                                                        remarks: e.target.value,
                                                                    },
                                                                }
                                                                : r
                                                        )
                                                    )
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {(!roster || roster.length === 0) && (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="py-10 text-center text-slate-400"
                                        >
                                            No roster loaded
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Analytics */}
            {tab === "analytics" && (
                <div className="bg-white rounded-2xl shadow p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                        <label className="text-sm">
                            <span className="block text-slate-600 mb-1">From</span>
                            <input
                                type="date"
                                className="w-full border rounded px-3 py-2"
                                value={range.from}
                                max={maxDate}
                                onChange={(e) =>
                                    setRange((r) => ({ ...r, from: e.target.value }))
                                }
                            />
                        </label>
                        <label className="text-sm">
                            <span className="block text-slate-600 mb-1">To</span>
                            <input
                                type="date"
                                className="w-full border rounded px-3 py-2"
                                value={range.to}
                                max={maxDate}
                                onChange={(e) =>
                                    setRange((r) => ({ ...r, to: e.target.value }))
                                }
                            />
                        </label>

                        {/* reuse same scope & course pickers */}
                        <label className="text-sm">
                            <span className="block text-slate-600 mb-1">Scope</span>
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={scopeType}
                                onChange={(e) => {
                                    setScopeType(e.target.value);
                                    setClassId("");
                                    setSectionId("");
                                    setCourses([]);
                                    setCourseId("");
                                }}
                            >
                                <option value="class">Class</option>
                                <option value="section">Section</option>
                            </select>
                        </label>

                        {scopeType === "class" ? (
                            <label className="text-sm">
                                <span className="block text-slate-600 mb-1">Class</span>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={classId}
                                    onChange={(e) => {
                                        setClassId(e.target.value);
                                        setCourseId("");
                                    }}
                                >
                                    <option value="">Select</option>
                                    {lookups.classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.title || c.batch_code}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ) : (
                            <label className="text-sm">
                                <span className="block text-slate-600 mb-1">Section</span>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={sectionId}
                                    onChange={(e) => {
                                        setSectionId(e.target.value);
                                        setCourseId("");
                                    }}
                                >
                                    <option value="">Select</option>
                                    {lookups.sectionsHomeroom.map((s) => (
                                        <option key={`h-${s.id}`} value={s.id}>
                                            {s.section_name} (Homeroom)
                                        </option>
                                    ))}
                                    {lookups.sectionsAssigned.map((s) => (
                                        <option key={`a-${s.id}`} value={s.id}>
                                            {s.section_name} (Assigned)
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}

                        <label className="text-sm">
                            <span className="block text-slate-600 mb-1">Subject</span>
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                                onFocus={fetchCourses}
                            >
                                <option value="">All / Select</option>
                                {courses.map(
                                    (c) =>
                                        c && (
                                            <option key={c.id} value={c.id}>
                                                {c.title} ({c.course_code})
                                            </option>
                                        )
                                )}
                            </select>
                        </label>

                        <div className="flex items-end">
                            <button
                                onClick={loadAnalytics}
                                className="px-3 py-2 rounded bg-slate-900 text-white text-sm"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    {analytics ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="border rounded-xl p-4">
                                    <div className="text-xs text-slate-500">Present</div>
                                    <div className="text-xl font-semibold">
                                        {analytics.counts.present}
                                    </div>
                                </div>
                                <div className="border rounded-xl p-4">
                                    <div className="text-xs text-slate-500">Absent</div>
                                    <div className="text-xl font-semibold">
                                        {analytics.counts.absent}
                                    </div>
                                </div>
                                <div className="border rounded-xl p-4">
                                    <div className="text-xs text-slate-500">Late</div>
                                    <div className="text-xl font-semibold">
                                        {analytics.counts.late}
                                    </div>
                                </div>
                                <div className="border rounded-xl p-4">
                                    <div className="text-xs text-slate-500">Leave</div>
                                    <div className="text-xl font-semibold">
                                        {analytics.counts.leave}
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-slate-500">Present Rate</div>
                                        <div className="text-2xl font-semibold">
                                            {analytics.presentRate}%
                                        </div>
                                    </div>
                                    <div className="w-2/3 h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500"
                                            style={{ width: `${analytics.presentRate}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm mt-2">
                                    <thead>
                                        <tr className="bg-slate-50 border-b text-left">
                                            <th className="py-2 px-3">Day</th>
                                            <th className="py-2 px-3">Present</th>
                                            <th className="py-2 px-3">Absent</th>
                                            <th className="py-2 px-3">Late</th>
                                            <th className="py-2 px-3">Leave</th>
                                            <th className="py-2 px-3">Present %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.series.map((s) => (
                                            <tr key={s.day} className="border-b">
                                                <td className="py-2 px-3">{s.day}</td>
                                                <td className="py-2 px-3">{s.present}</td>
                                                <td className="py-2 px-3">{s.absent}</td>
                                                <td className="py-2 px-3">{s.late}</td>
                                                <td className="py-2 px-3">{s.leave}</td>
                                                <td className="py-2 px-3">{s.presentRate}%</td>
                                            </tr>
                                        ))}
                                        {analytics.series.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="py-8 text-center text-slate-400"
                                                >
                                                    No data in range
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="text-slate-400 text-sm">No analytics loaded</div>
                    )}
                </div>
            )}
        </div>
    );
}
