"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/workspace/AppShell";
import { apiGet } from "@/lib/api";

export default function AdminAnalytics(){const [d,setD]=useState(null);const [error,setError]=useState("");useEffect(()=>{apiGet("/api/admin/analytics").then(setD).catch(e=>setError(e.message))},[]);const items=[["Total users",d?.totalUsers],["Courses",d?.totalCourses],["Enrollments",d?.totalEnrollments],["Assignments",d?.totalAssignments],["Submissions",d?.totalSubmissions],["AI generations",d?.totalAiGenerations]];return <AppShell role="ADMIN" title="Analytics" subtitle="Every figure on this page comes from the current database state."><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map(([l,v])=><div key={l} className="rounded-2xl border bg-white p-6 dark:border-white/10 dark:bg-white/[0.035]"><div className="text-xs text-slate-500">{l}</div><div className="mt-2 text-3xl font-semibold">{v??"…"}</div></div>)}</div>{error&&<div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}</AppShell>}
