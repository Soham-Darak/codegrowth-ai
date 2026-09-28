"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/workspace/AppShell";
import { apiGet } from "@/lib/api";

export default function AdminSystem(){const [d,setD]=useState<any>(null);const [error,setError]=useState("");async function load(){try{setD(await apiGet("/api/admin/system"))}catch (e: any){setError(e.message)}}useEffect(()=>{load()},[]);return <AppShell role="ADMIN" title="System health" subtitle="Operational status from the running services."><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{["backend","database","redis","aiEngine"].map(k=><div key={k} className="rounded-2xl border bg-white p-6 dark:border-white/10 dark:bg-white/[0.035]"><div className="text-xs uppercase tracking-wide text-slate-500">{k}</div><div className={`mt-3 text-xl font-semibold ${d?.[k]==="UP"?"text-emerald-600 dark:text-emerald-300":"text-red-600 dark:text-red-300"}`}>{d?.[k]||"Checking…"}</div></div>)}</div><button onClick={load} className="mt-5 rounded-xl border px-4 py-2.5 text-sm">Refresh health</button>{error&&<div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}</AppShell>}
