"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/workspace/AppShell";
import { apiGet } from "@/lib/api";

export default function TeacherClassDetail(){
 const {id}=useParams(); const [students,setStudents]=useState<any[]>([]); const [assignments,setAssignments]=useState<any[]>([]); const [error,setError]=useState("");
 useEffect(()=>{if(!id)return;(async()=>{try{const [s,a]=await Promise.all([apiGet(`/api/teacher/courses/${id}/students`),apiGet(`/api/teacher/courses/${id}/assignments`)]);setStudents(s||[]);setAssignments(a||[])}catch (e: any){setError(e.message)}})()},[id]);
 return <AppShell role="TEACHER" title="Class details" subtitle="Review the live roster and coursework for this class."><div className="grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border bg-white p-6 dark:border-white/10 dark:bg-white/[0.035]"><h2 className="font-semibold">Students</h2><div className="mt-4 space-y-2">{students.map(e=><div key={e.id} className="flex justify-between rounded-xl border p-3 text-sm dark:border-white/10"><span>{e.student?.name||"Student"}</span><span className="text-slate-500">{e.progress||0}%</span></div>)}{!students.length&&<p className="text-sm text-slate-500">No enrolled students.</p>}</div></section><section className="rounded-2xl border bg-white p-6 dark:border-white/10 dark:bg-white/[0.035]"><h2 className="font-semibold">Assignments</h2><div className="mt-4 space-y-2">{assignments.map(a=><div key={a.id} className="rounded-xl border p-3 dark:border-white/10"><div className="text-sm font-medium">{a.title}</div><div className="mt-1 text-xs text-slate-500">{a.dueAt?new Date(a.dueAt).toLocaleDateString():"No due date"}</div></div>)}{!assignments.length&&<p className="text-sm text-slate-500">No assignments.</p>}</div></section></div>{error&&<div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}</AppShell>;
}
