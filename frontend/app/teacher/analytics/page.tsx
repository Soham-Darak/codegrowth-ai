"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/workspace/AppShell";
import { apiGet } from "@/lib/api";

export default function TeacherAnalytics(){const [data,setData]=useState<any>(null);const [error,setError]=useState("");useEffect(()=>{apiGet("/api/teacher/overview").then(setData).catch(e=>setError(e.message))},[]);return <AppShell role="TEACHER" title="Analytics" subtitle="Live teaching metrics calculated from your courses and submissions."><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Courses",data?.courses],["Students",data?.students],["Assignments",data?.assignments],["Submissions",data?.submissions]].map(([l,v])=><div key={l} className="rounded-2xl border bg-white p-6 dark:border-white/10 dark:bg-white/[0.035]"><div className="text-xs text-slate-500">{l}</div><div className="mt-2 text-3xl font-semibold">{v??"…"}</div></div>)}</div><div className="mt-5 rounded-2xl border bg-white p-6 dark:border-white/10 dark:bg-white/[0.035]"><h2 className="font-semibold">Interpretation</h2><p className="mt-2 text-sm leading-6 text-slate-500">These figures are read directly from the current PostgreSQL course, enrollment, assignment and submission tables. Add or grade work and refresh this page to see the change.</p></div>{error&&<div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}</AppShell>}
