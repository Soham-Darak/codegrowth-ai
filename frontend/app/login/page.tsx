"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Code2, LockKeyhole, Mail, Sparkles, Users, GraduationCap, ShieldCheck } from "lucide-react";
import CodeGrowthScene from "@/components/visuals/CodeGrowthScene";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

function rolePath(role: string) {
  const value = (role || "STUDENT").toUpperCase();
  return value === "ADMIN" ? "/admin" : value === "TEACHER" ? "/teacher" : "/student";
}

async function readResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { message: text }; }
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/backend/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await readResponse(response);
      if (!response.ok) throw new Error(data.message || data.error || `Login failed (${response.status})`);

      const user = { userId: data.userId, name: data.name, email: data.email, role: data.role || "STUDENT" };
      localStorage.setItem("codegrowth_token", data.token);
      localStorage.setItem("codegrowth_user", JSON.stringify(user));
      router.push(rolePath(user.role));
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function oauthLogin(provider: string) {
    try {
      const response = await fetch(`/api/backend/api/auth/oauth/${provider}/url`);
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setError(`Unable to start ${provider} login.`);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#04070f] dark:text-slate-100">
      <CodeGrowthScene className="opacity-75" />
      <div className="absolute right-6 top-6 z-20">
        <ThemeSwitcher />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 py-8 lg:px-10">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white/60 shadow-2xl shadow-slate-200/50 backdrop-blur-2xl dark:border-white/10 dark:bg-black/25 dark:shadow-indigo-950/40 lg:grid-cols-[1.15fr_.85fr]">
          <section className="relative hidden min-h-[720px] overflow-hidden border-r border-slate-200 p-12 dark:border-white/10 lg:block">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
              <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-slate-100 ring-1 ring-slate-200 dark:bg-white/10 dark:ring-white/10"><Code2 size={19} className="text-indigo-600 dark:text-cyan-300" /></div><div><div className="text-sm font-semibold">CodeGrowth AI</div><div className="text-[10px] text-slate-500">Learning + engineering OS</div></div></div>
              <div className="mt-24 max-w-xl"><span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.25em] text-indigo-700 dark:border-white/10 dark:bg-white/5 dark:text-indigo-200">One platform • three roles</span><h1 className="mt-6 text-6xl font-semibold leading-[.98] tracking-[-.045em]">Build. Teach. <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent dark:from-violet-300 dark:via-white dark:to-cyan-300">Grow.</span></h1><p className="mt-6 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-400">A local-first AI workspace that adapts to students, teachers, and administrators without losing the developer-first experience.</p></div>
              <div className="mt-12 grid gap-3 sm:grid-cols-3"><div className="glass rounded-2xl p-4"><GraduationCap size={17} className="text-violet-600 dark:text-violet-300" /><div className="mt-4 text-sm font-medium">Students</div><div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Learn + practice</div></div><div className="glass rounded-2xl p-4"><Users size={17} className="text-cyan-600 dark:text-cyan-300" /><div className="mt-4 text-sm font-medium">Teachers</div><div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Guide + analyze</div></div><div className="glass rounded-2xl p-4"><ShieldCheck size={17} className="text-amber-600 dark:text-amber-300" /><div className="mt-4 text-sm font-medium">Admins</div><div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Control + observe</div></div></div>
            </motion.div>
          </section>
          <section className="relative z-10 flex items-center p-6 sm:p-10 lg:p-12">
            <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .45 }} className="w-full">
              <div className="mb-8 lg:hidden"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-slate-100 dark:bg-white/10"><Code2 size={19} className="text-indigo-600 dark:text-cyan-300" /></div><div><div className="text-sm font-semibold">CodeGrowth AI</div><div className="text-[10px] text-slate-500">Learning + engineering OS</div></div></div></div>
              <div className="mb-8"><span className="text-[10px] font-semibold uppercase tracking-[.25em] text-indigo-600 dark:text-indigo-300">Welcome back</span><h2 className="mt-3 text-3xl font-semibold tracking-tight">Sign in to your workspace</h2><p className="mt-2 text-sm leading-6 text-slate-500">Your dashboard will open according to your role.</p></div>

              {/* OAuth Buttons */}
              <div className="mb-6 space-y-3">
                <button
                  onClick={() => oauthLogin("google")}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white/50 text-sm font-medium text-slate-700 transition hover:bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.08] dark:hover:border-white/20"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
                <button
                  onClick={() => oauthLogin("github")}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white/50 text-sm font-medium text-slate-700 transition hover:bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.08] dark:hover:border-white/20"
                >
                  <GitHubIcon />
                  Continue with GitHub
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/10" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white/80 px-3 text-slate-500 backdrop-blur dark:bg-[#04070f]/80">or sign in with email</span></div>
              </div>

              <form onSubmit={login} className="space-y-5">
                <label className="block space-y-2 text-sm text-slate-700 dark:text-slate-300"><span>Email</span><div className="relative"><Mail className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-600" size={17} /><Input className="h-12 rounded-xl border-slate-200 bg-white/50 pl-10 dark:border-white/10 dark:bg-white/[0.035]" value={email} onChange={(e: any) => setEmail(e.target.value)} type="email" placeholder="you@example.com" required /></div></label>
                <label className="block space-y-2 text-sm text-slate-700 dark:text-slate-300"><span>Password</span><div className="relative"><LockKeyhole className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-600" size={17} /><Input className="h-12 rounded-xl border-slate-200 bg-white/50 pl-10 dark:border-white/10 dark:bg-white/[0.035]" value={password} onChange={(e: any) => setPassword(e.target.value)} type="password" placeholder="••••••••" required /></div></label>
                <AnimatePresence>{error ? <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-400/15 dark:bg-red-500/[0.07] dark:text-red-300">{error}</motion.div> : null}</AnimatePresence>
                <Button className="h-12 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200" size="lg" disabled={loading}>{loading ? <><Sparkles className="animate-pulse" size={16} /> Opening workspace...</> : <>Continue <ArrowRight size={16} /></>}</Button>
              </form>
              <div className="mt-7 border-t border-slate-200 pt-6 text-center text-sm text-slate-500 dark:border-white/10">New to CodeGrowth? <Link href="/register" className="font-medium text-indigo-600 transition hover:text-slate-900 dark:text-indigo-300 dark:hover:text-white">Create your account</Link></div>
            </motion.div>
          </section>
        </div>
      </div>
    </main>
  );
}
