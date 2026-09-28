"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/workspace/AppShell";
import { apiGet, apiPost, handleAuthError } from "@/lib/api";

export default function StudentCourses() {
  const [courses, setCourses] = useState<any[]>([]); const [enrolled, setEnrolled] = useState<any[]>([]); const [error, setError] = useState("");
  async function load() { try { const [all, current] = await Promise.all([apiGet("/api/student/courses"), apiGet("/api/student/courses/enrolled")]); setCourses(all || []); setEnrolled(current || []); } catch (e: any) { if (!handleAuthError(e)) setError(e.message); } }
  useEffect(() => { load(); }, []);
  async function enroll(id: any) { try { await apiPost(`/api/student/courses/${id}/enroll`, {}); load(); } catch (e: any) { setError(e.message); } }
  const ids = new Set(enrolled.map((item: any) => item.course?.id));
  return <AppShell role="STUDENT" title="Courses" subtitle="Browse the real course catalog and manage your enrollment."><section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.035]"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{courses.map((course) => <article key={course.id} className="rounded-2xl border border-slate-200 p-5 dark:border-white/10"><div className="text-xs font-semibold text-violet-500">{course.code}</div><h2 className="mt-2 text-lg font-semibold">{course.title}</h2><p className="mt-2 min-h-12 text-sm text-slate-500">{course.description || "No description provided."}</p><button disabled={ids.has(course.id)} onClick={() => enroll(course.id)} className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:bg-emerald-600 dark:bg-white dark:text-slate-900 disabled:dark:bg-emerald-500">{ids.has(course.id) ? "Enrolled" : "Enroll"}</button></article>)}{!courses.length && <div className="col-span-full rounded-xl border border-dashed p-10 text-center text-sm text-slate-500">No courses have been created yet.</div>}</div></section>{error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}</AppShell>;
}
