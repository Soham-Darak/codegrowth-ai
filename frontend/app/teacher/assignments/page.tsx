"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/workspace/AppShell";
import { apiGet, apiPost } from "@/lib/api";

export default function TeacherAssignments() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", description: "", dueAt: "" });
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<any>(null);
  const [authenticityResults, setAuthenticityResults] = useState<any>({});
  const [loadingAuth, setLoadingAuth] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const c = await apiGet("/api/teacher/courses");
        setCourses(c || []);
        setSelected(new URLSearchParams(window.location.search).get("course") || c?.[0]?.id || "");
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      try {
        setAssignments((await apiGet(`/api/teacher/courses/${selected}/assignments`)) || []);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, [selected]);

  async function create(e) {
    e.preventDefault();
    if (!selected) return;
    try {
      await apiPost(`/api/teacher/courses/${selected}/assignments`, form);
      setForm({ title: "", description: "", dueAt: "" });
      setAssignments((await apiGet(`/api/teacher/courses/${selected}/assignments`)) || []);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function review(id: any) {
    try {
      setSubmissions(await apiGet(`/api/teacher/assignments/${id}/submissions`));
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function checkAuthenticity(submissionId) {
    setLoadingAuth(true);
    try {
      const res = await apiPost(`/api/teacher/submissions/${submissionId}/authenticity`);
      if (res.analysis) {
        setAuthenticityResults((prev) => ({
          ...prev,
          [submissionId]: res.analysis,
        }));
      }
    } catch (e: any) {
      setError("Authenticity check failed: " + e.message);
    } finally {
      setLoadingAuth(false);
    }
  }

  return (
    <AppShell role="TEACHER" title="Assignments" subtitle="Create work, review submissions and keep grading close to the classroom.">
      <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
        <form onSubmit={create} className="rounded-2xl border bg-white p-6 dark:border-white/10 dark:bg-white/[0.035]">
          <h2 className="font-semibold">Create assignment</h2>
          <select value={selected} onChange={(e: any) => setSelected(e.target.value)} className="mt-4 w-full rounded-xl border p-3 text-sm dark:border-white/10 dark:bg-[#071018]">
            <option value="">Select course</option>
            {courses.map((c) => (
              <option value={c.id} key={c.id}>
                {c.code} — {c.title}
              </option>
            ))}
          </select>
          <input value={form.title} onChange={(e: any) => setForm({ ...form, title: e.target.value })} className="mt-3 w-full rounded-xl border p-3 text-sm dark:border-white/10 dark:bg-[#071018]" placeholder="Assignment title" required />
          <textarea value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} className="mt-3 min-h-28 w-full rounded-xl border p-3 text-sm dark:border-white/10 dark:bg-[#071018]" placeholder="Instructions" />
          <input type="datetime-local" value={form.dueAt ? form.dueAt.slice(0, 16) : ""} onChange={(e: any) => setForm({ ...form, dueAt: e.target.value ? `${e.target.value}:00Z` : "" })} className="mt-3 w-full rounded-xl border p-3 text-sm dark:border-white/10 dark:bg-[#071018]" />
          <button className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">Create assignment</button>
        </form>
        <div className="space-y-3">
          {assignments.map((a: any) => (
            <article key={a.id} className="rounded-2xl border bg-white p-5 dark:border-white/10 dark:bg-white/[0.035]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{a.description || "No instructions."}</p>
                </div>
                <span className="text-xs text-slate-400">{a.dueAt ? new Date(a.dueAt).toLocaleDateString() : "No due date"}</span>
              </div>
              <button onClick={() => review(a.id)} className="mt-4 rounded-xl border px-3 py-2 text-xs font-medium">
                View submissions
              </button>
            </article>
          ))}
          {!assignments.length && <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-slate-500">No assignments for this course.</div>}
        </div>
      </div>
      {submissions && (
        <div className="mt-5 rounded-2xl border bg-white p-6 dark:border-white/10 dark:bg-white/[0.035]">
          <h2 className="font-semibold">Submissions</h2>
          <div className="mt-4 space-y-4">
            {submissions.map((s) => (
              <div key={s.id} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between dark:border-white/10">
                <div className="flex-1">
                  <div className="text-sm font-medium">{s.student?.name || "Student"}</div>
                  <div className="mt-1 text-xs text-slate-500 break-all">{s.content}</div>
                  
                  {authenticityResults[s.id] && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs dark:bg-white/5">
                      <div className="flex items-center gap-4 mb-2">
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">AI Probability:</span>{" "}
                          <span className={authenticityResults[s.id].ai_probability_score > 70 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>{authenticityResults[s.id].ai_probability_score}%</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Authenticity:</span>{" "}
                          <span className={authenticityResults[s.id].authenticity_score < 30 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>{authenticityResults[s.id].authenticity_score}%</span>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{authenticityResults[s.id].analysis_reasoning}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-xs text-slate-500">Score: {s.score ?? "Not graded"}</div>
                  {s.content?.startsWith("http") && (
                    <button 
                      onClick={() => checkAuthenticity(s.id)}
                      disabled={loadingAuth}
                      className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 disabled:opacity-50"
                    >
                      {loadingAuth ? "Analyzing..." : "Check AI Authenticity"}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {!submissions.length && <p className="text-sm text-slate-500">No submissions yet.</p>}
          </div>
        </div>
      )}
      {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    </AppShell>
  );
}
