"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/workspace/AppShell";
import { apiGet } from "@/lib/api";

export default function AdminAccount(){const [user,setUser]=useState<any>(null);const [error,setError]=useState("");useEffect(()=>{apiGet("/api/auth/me").then(setUser).catch(e=>setError(e.message))},[]);return <AppShell role="ADMIN" title="Account" subtitle="Review the identity and role currently used for this admin session."><section className="max-w-2xl rounded-2xl border bg-white p-6 dark:border-white/10 dark:bg-white/[0.035]"><div className="grid gap-4 sm:grid-cols-2"><div><div className="text-xs text-slate-500">Name</div><div className="mt-1 font-medium">{user?.name||"Loading…"}</div></div><div><div className="text-xs text-slate-500">Role</div><div className="mt-1 font-medium">{user?.role||"Loading…"}</div></div><div><div className="text-xs text-slate-500">Email</div><div className="mt-1 font-medium">{user?.email||"Loading…"}</div></div><div><div className="text-xs text-slate-500">User ID</div><div className="mt-1 font-medium">{user?.userId||"Loading…"}</div></div></div></section>{error&&<div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}</AppShell>}
