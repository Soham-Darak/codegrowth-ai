"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Code2, LockKeyhole, Mail, Sparkles, Users, GraduationCap, ShieldCheck } from "lucide-react";
import CodeGrowthScene from "@/components/visuals/CodeGrowthScene";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function rolePath(role) {
  const value = (role || "STUDENT").toUpperCase();
  return value === "ADMIN" ? "/admin" : value === "TEACHER" ? "/teacher" : "/student";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/backend/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Invalid email or password.");

      const user = { userId: data.userId, name: data.name, email: data.email, role: data.role || "STUDENT" };
      localStorage.setItem("codegrowth_token", data.token);
      localStorage.setItem("codegrowth_user", JSON.stringify(user));
      router.push(rolePath(user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070f] text-slate-100">
      <CodeGrowthScene className="opacity-75" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 py-8 lg:px-10">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-black/25 shadow-2xl shadow-indigo-950/40 backdrop-blur-2xl lg:grid-cols-[1.15fr_.85fr]">
          <section className="relative hidden min-h-[720px] overflow-hidden border-r border-white/10 p-12 lg:block">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
              <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10"><Code2 size={19} className="text-cyan-300" /></div><div><div className="text-sm font-semibold">CodeGrowth AI</div><div className="text-[10px] text-slate-500">Learning + engineering OS</div></div></div>
              <div className="mt-24 max-w-xl"><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.25em] text-indigo-200">One platform • three roles</span><h1 className="mt-6 text-6xl font-semibold leading-[.98] tracking-[-.045em]">Build. Teach. <span className="bg-gradient-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">Grow.</span></h1><p className="mt-6 max-w-lg text-base leading-7 text-slate-400">A local-first AI workspace that adapts to students, teachers, and administrators without losing the developer-first experience.</p></div>
              <div className="mt-12 grid gap-3 sm:grid-cols-3"><div className="glass rounded-2xl p-4"><GraduationCap size={17} className="text-violet-300" /><div className="mt-4 text-sm font-medium">Students</div><div className="mt-1 text-[11px] text-slate-600">Learn + practice</div></div><div className="glass rounded-2xl p-4"><Users size={17} className="text-cyan-300" /><div className="mt-4 text-sm font-medium">Teachers</div><div className="mt-1 text-[11px] text-slate-600">Guide + analyze</div></div><div className="glass rounded-2xl p-4"><ShieldCheck size={17} className="text-amber-300" /><div className="mt-4 text-sm font-medium">Admins</div><div className="mt-1 text-[11px] text-slate-600">Control + observe</div></div></div>
            </motion.div>
          </section>

          <section className="relative z-10 flex items-center p-6 sm:p-10 lg:p-12">
            <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .45 }} className="w-full">
              <div className="mb-8 lg:hidden"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-white/10"><Code2 size={19} className="text-cyan-300" /></div><div><div className="text-sm font-semibold">CodeGrowth AI</div><div className="text-[10px] text-slate-500">Learning + engineering OS</div></div></div></div>
              <div className="mb-8"><span className="text-[10px] font-semibold uppercase tracking-[.25em] text-indigo-300">Welcome back</span><h2 className="mt-3 text-3xl font-semibold tracking-tight">Sign in to your workspace</h2><p className="mt-2 text-sm leading-6 text-slate-500">Your dashboard will open according to your role.</p></div>
              <form onSubmit={login} className="space-y-5">
                <label className="block space-y-2 text-sm text-slate-300"><span>Email</span><div className="relative"><Mail className="absolute left-3.5 top-3.5 text-slate-600" size={17} /><Input className="h-12 rounded-xl border-white/10 bg-white/[0.035] pl-10" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" required /></div></label>
                <label className="block space-y-2 text-sm text-slate-300"><span>Password</span><div className="relative"><LockKeyhole className="absolute left-3.5 top-3.5 text-slate-600" size={17} /><Input className="h-12 rounded-xl border-white/10 bg-white/[0.035] pl-10" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" required /></div></label>
                <AnimatePresence>{error ? <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-red-400/15 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300">{error}</motion.div> : null}</AnimatePresence>
                <Button className="h-12 w-full rounded-xl" size="lg" disabled={loading}>{loading ? <><Sparkles className="animate-pulse" size={16} /> Opening workspace...</> : <>Continue <ArrowRight size={16} /></>}</Button>
              </form>
              <div className="mt-7 border-t border-white/10 pt-6 text-center text-sm text-slate-500">New to CodeGrowth? <Link href="/register" className="font-medium text-indigo-300 transition hover:text-white">Create your account</Link></div>
            </motion.div>
          </section>
        </div>
      </div>
    </main>
  );
}
