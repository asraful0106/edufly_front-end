import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import http from "../../api/http";

const StatusPill = ({ s }) => {
    const cls = {
        approved: "bg-green-100 text-green-700 border-green-200",
        rejected: "bg-rose-100 text-rose-700 border-rose-200",
        pending: "bg-amber-100 text-amber-800 border-amber-200",
        draft: "bg-slate-100 text-slate-700 border-slate-200",
    }[s] || "bg-slate-100 text-slate-700 border-slate-200";
    return <span className={`px-2 py-0.5 text-xs rounded-full border ${cls}`}>{s}</span>;
};

export default function ResultsPublish() {
    const loc = useLocation();
    const institutionId = useMemo(() => {
        const m = loc.pathname.match(/\/(\w+)(?:\/|$)/);
        return m ? m[1] : null;
    }, [loc.pathname]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [q, setQ] = useState("");
    const [status, setStatus] = useState("pending"); // default focus on pending
    const [courseId, setCourseId] = useState("");
    const [examTypeId, setExamTypeId] = useState("");

    const [courses, setCourses] = useState([]);
    const [examTypes, setExamTypes] = useState([]);

    const [rows, setRows] = useState([]);
    const [selected, setSelected] = useState({}); // id: true

    const [rejectModal, setRejectModal] = useState({ open: false, ids: [], remarks: "" });

    const loadLookups = async () => {
        if (!institutionId) return;
        try {
            const resp = await http.get("/results/lookups", {
                params: { institution_id: institutionId },
            });
            setCourses(resp.data.data.courses || []);
            setExamTypes(resp.data.data.examTypes || []);
        } catch (e) {
            console.warn(e);
        }
    };

    const loadRows = async () => {
        if (!institutionId) return;
        setLoading(true); setError("");
        try {
            const resp = await http.get("/results", {
                params: {
                    institution_id: institutionId,
                    q: q || undefined,
                    course_id: courseId || undefined,
                    examTypeId: examTypeId || undefined,
                    status: status || "all",
                    skip: 0,
                    take: 100,
                },
            });
            setRows(resp.data.data || []);
        } catch (e) {
            setError(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadLookups(); /* eslint-disable-next-line */ }, [institutionId]);
    useEffect(() => { loadRows(); /* eslint-disable-next-line */ }, [institutionId, q, courseId, examTypeId, status]);

    const toggleSelectAll = (checked) => {
        if (checked) {
            const next = {};
            rows.forEach(r => next[r.id] = true);
            setSelected(next);
        } else {
            setSelected({});
        }
    };
    const toggleOne = (id) => setSelected(s => ({ ...s, [id]: !s[id] }));

    const approveOne = async (id) => {
        setLoading(true);
        try {
            const resp = await http.post(`/results/${id}/approve`, { institution_id: institutionId });
            setRows(rs => rs.map(r => r.id === id ? resp.data.data : r));
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const rejectOne = (id) => setRejectModal({ open: true, ids: [id], remarks: "" });

    const deleteOne = async (id) => {
        if (!confirm("Delete this result?")) return;
        setLoading(true);
        try {
            await http.delete(`/results/${id}`);
            setRows(rs => rs.filter(r => r.id !== id));
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const bulkIds = Object.keys(selected).filter(k => selected[k]);

    const bulkApprove = async () => {
        if (bulkIds.length === 0) return;
        setLoading(true);
        try {
            await http.post(`/results/bulk`, {
                action: "approve",
                ids: bulkIds,
                institution_id: institutionId,
            });
            await loadRows();
            setSelected({});
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const bulkRejectOpen = () => {
        if (bulkIds.length === 0) return;
        setRejectModal({ open: true, ids: bulkIds, remarks: "" });
    };

    const bulkDelete = async () => {
        if (bulkIds.length === 0) return;
        if (!confirm(`Delete ${bulkIds.length} result(s)?`)) return;
        setLoading(true);
        try {
            await http.post(`/results/bulk`, { action: "delete", ids: bulkIds });
            await loadRows();
            setSelected({});
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const submitReject = async () => {
        const ids = rejectModal.ids;
        if (ids.length === 1) {
            setLoading(true);
            try {
                const resp = await http.post(`/results/${ids[0]}/reject`, {
                    institution_id: institutionId,
                    remarks: rejectModal.remarks || undefined,
                });
                setRows(rs => rs.map(r => r.id === ids[0] ? resp.data.data : r));
                setRejectModal({ open: false, ids: [], remarks: "" });
            } catch (e) {
                alert(e?.response?.data?.message || e.message);
            } finally {
                setLoading(false);
            }
        } else {
            // bulk reject
            setLoading(true);
            try {
                await http.post(`/results/bulk`, {
                    action: "reject",
                    ids,
                    institution_id: institutionId,
                    remarks: rejectModal.remarks || undefined,
                });
                setRejectModal({ open: false, ids: [], remarks: "" });
                await loadRows();
                setSelected({});
            } catch (e) {
                alert(e?.response?.data?.message || e.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Result Publishing</h1>
                    {loading && <p className="text-xs text-slate-500">Working…</p>}
                    {error && <p className="text-xs text-rose-600">{error}</p>}
                </div>
                <div className="flex gap-2">
                    <input
                        className="border rounded px-3 py-2 text-sm"
                        placeholder="Search student, teacher…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <button className="px-3 py-2 rounded bg-slate-900 text-white text-sm" onClick={loadRows}>Search</button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                <label className="text-sm">
                    <span className="block text-slate-600 mb-1">Status</span>
                    <select className="w-full border rounded px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="draft">Draft</option>
                    </select>
                </label>

                <label className="text-sm">
                    <span className="block text-slate-600 mb-1">Subject</span>
                    <select className="w-full border rounded px-3 py-2" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                        <option value="">All</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.course_code})</option>)}
                    </select>
                </label>

                <label className="text-sm">
                    <span className="block text-slate-600 mb-1">Exam Type</span>
                    <select className="w-full border rounded px-3 py-2" value={examTypeId} onChange={(e) => setExamTypeId(e.target.value)}>
                        <option value="">All</option>
                        {examTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </label>

                <div className="flex items-end gap-2">
                    <button onClick={() => { setQ(""); setCourseId(""); setExamTypeId(""); setStatus("pending"); }} className="px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 text-sm">Reset</button>
                    <button onClick={loadRows} className="px-3 py-2 rounded bg-slate-900 text-white text-sm">Refresh</button>
                </div>
            </div>

            {/* Bulk bar */}
            <div className="bg-white rounded-2xl shadow p-4 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                    Selected: <b>{Object.keys(selected).filter(k => selected[k]).length}</b>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-2 rounded bg-green-600 text-white text-sm disabled:opacity-50"
                        disabled={bulkIds.length === 0} onClick={bulkApprove}>Approve</button>
                    <button className="px-3 py-2 rounded bg-amber-600 text-white text-sm disabled:opacity-50"
                        disabled={bulkIds.length === 0} onClick={bulkRejectOpen}>Reject</button>
                    <button className="px-3 py-2 rounded bg-rose-600 text-white text-sm disabled:opacity-50"
                        disabled={bulkIds.length === 0} onClick={bulkDelete}>Delete</button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b bg-slate-50 text-left">
                            <th className="py-2 px-3">
                                <input
                                    type="checkbox"
                                    checked={rows.length > 0 && rows.every(r => selected[r.id])}
                                    onChange={(e) => toggleSelectAll(e.target.checked)}
                                />
                            </th>
                            <th className="py-2 px-3 font-semibold text-slate-600">Student</th>
                            <th className="py-2 px-3 font-semibold text-slate-600">Subject</th>
                            <th className="py-2 px-3 font-semibold text-slate-600">Exam</th>
                            <th className="py-2 px-3 font-semibold text-slate-600">Segment</th>
                            <th className="py-2 px-3 font-semibold text-slate-600">Marks</th>
                            <th className="py-2 px-3 font-semibold text-slate-600">Status</th>
                            <th className="py-2 px-3 font-semibold text-slate-600">Published</th>
                            <th className="py-2 px-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r => (
                            <tr key={r.id} className="border-b hover:bg-slate-50">
                                <td className="py-2 px-3">
                                    <input type="checkbox" checked={!!selected[r.id]} onChange={() => toggleOne(r.id)} />
                                </td>
                                <td className="py-2 px-3">
                                    <div className="leading-tight">
                                        <div className="font-medium">{r.student?.name_eng || "—"}</div>
                                        <div className="text-xs text-slate-500">{r.student?.student_id}</div>
                                    </div>
                                </td>
                                <td className="py-2 px-3">{r.course ? `${r.course.title} (${r.course.course_code})` : "—"}</td>
                                <td className="py-2 px-3">{r.examType?.name || "—"}</td>
                                <td className="py-2 px-3">{r.markSegment?.name || "—"}</td>
                                <td className="py-2 px-3">
                                    {r.marks}/{r.markSegment?.max_marks ?? "—"}
                                </td>
                                <td className="py-2 px-3">
                                    <div className="flex items-center gap-2">
                                        <StatusPill s={r.workflow?.status || (r.isPublished ? "approved" : "draft")} />
                                        {r.workflow?.latestApproval?.remarks && (
                                            <span className="text-xs text-slate-500" title={r.workflow.latestApproval.remarks}>
                                                • {r.workflow.latestApproval.remarks.slice(0, 18)}{r.workflow.latestApproval.remarks.length > 18 ? "…" : ""}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-2 px-3">
                                    {r.published_at ? new Date(r.published_at).toLocaleString() : "—"}
                                </td>
                                <td className="py-2 px-3 text-right">
                                    <div className="flex gap-2 justify-end">
                                        <button className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                                            onClick={() => approveOne(r.id)}>Approve</button>
                                        <button className="px-2 py-1 rounded bg-amber-600 text-white hover:bg-amber-700"
                                            onClick={() => rejectOne(r.id)}>Reject</button>
                                        <button className="px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-700"
                                            onClick={() => deleteOne(r.id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={9} className="py-10 text-center text-slate-400">No results found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Reject modal */}
            {rejectModal.open && (
                <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setRejectModal({ open: false, ids: [], remarks: "" })}>
                    <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-xl p-6"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Reject Result{rejectModal.ids.length > 1 ? "s" : ""}</h3>
                            <button onClick={() => setRejectModal({ open: false, ids: [], remarks: "" })}>✕</button>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">
                            Add an optional note explaining why you’re rejecting.
                        </p>
                        <textarea
                            className="w-full border rounded px-3 py-2 mt-3 min-h-[120px]"
                            placeholder="Remarks (optional)"
                            value={rejectModal.remarks}
                            onChange={(e) => setRejectModal(m => ({ ...m, remarks: e.target.value }))}
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button className="px-3 py-2 rounded bg-slate-100 hover:bg-slate-200" onClick={() => setRejectModal({ open: false, ids: [], remarks: "" })}>Cancel</button>
                            <button className="px-3 py-2 rounded bg-amber-600 text-white hover:bg-amber-700" onClick={submitReject}>Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
