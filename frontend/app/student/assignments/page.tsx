"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/workspace/AppShell";
import { apiGet, apiPost } from "@/lib/api";

export default function StudentAssignments() {
  const [items, setItems] = useState<any[]>([]); const [drafts, setDrafts] = useState<any>({}); const [error, setError] = useState("");
  async function load() { try { setItems(await apiGet("/api/student/assignments") || []); } catch (e: any) { setError(e.message); } }
  useEffect(() => { load(); }, []);
  async function submit(id: any) { try { await apiPost(`/api/student/assignments/${id}/submit`, { content: drafts[id] || "" }); await load(); } catch (e: any) { setError(e.message); } }
  return <AppShell role="STUDENT" title="Assignments" subtitle="Complete coursework and submit directly to your teacher."><div className="space-y-4">{items.map((a: any) => <article key={a.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.035]"><div className="flex items-start justify-between gap-4"><div><div className="text-xs text-violet-500">{a.course?.code || "Course"}</div><h2 className="mt-1 font-semibold">{a.title}</h2><p className="mt-2 text-sm text-slate-500">{a.description || "No description."}</p></div><span className="text-xs text-slate-400">{a.dueAt ? new Date(a.dueAt).toLocaleDateString() : "No due date"}</span></div><textarea value={drafts[a.id] || ""} onChange={(e: any) => setDrafts((d) => ({ ...d, [a.id]: e.target.value }))} className="mt-4 min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-white/10 dark:bg-[#071018]" placeholder="Write your submission here..." /><button onClick={() => submit(a.id)} className="mt-3 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">Submit work</button></article>)}{!items.length && <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500 dark:border-white/10">No assignments are available for your enrolled courses.</div>}{error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}</div></AppShell>;
}
