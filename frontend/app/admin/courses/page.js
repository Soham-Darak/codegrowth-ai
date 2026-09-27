"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/workspace/AppShell";
import { apiGet } from "@/lib/api";

export default function AdminCourses(){const [courses,setCourses]=useState([]);const [error,setError]=useState("");useEffect(()=>{apiGet("/api/admin/courses").then(d=>setCourses(d||[])).catch(e=>setError(e.message))},[]);return <AppShell role="ADMIN" title="Courses" subtitle="Read the live course catalog created by teachers."><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{courses.map(c=><article key={c.id} className="rounded-2xl border bg-white p-5 dark:border-white/10 dark:bg-white/[0.035]"><div className="text-xs font-semibold text-amber-600 dark:text-amber-300">{c.code}</div><h2 className="mt-2 font-semibold">{c.title}</h2><p className="mt-2 text-sm text-slate-500">{c.description||"No description."}</p><div className="mt-4 text-xs text-slate-400">Teacher: {c.teacher?.name||"Unknown"}</div></article>)}{!courses.length&&<div className="col-span-full rounded-2xl border border-dashed p-10 text-center text-sm text-slate-500">No courses have been created.</div>}</div>{error&&<div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}</AppShell>}
