"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Code2, GraduationCap, LockKeyhole, Mail, ShieldCheck, UserRound, Users } from "lucide-react";
import CodeGrowthScene from "@/components/visuals/CodeGrowthScene";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

function rolePath(role: string) {
  const value = (role || "STUDENT").toUpperCase();
  return value === "ADMIN" ? "/admin" : value === "TEACHER" ? "/teacher" : "/student";
}

const roles = [
  { value: "STUDENT", label: "Student", description: "Learn, practice and build", icon: GraduationCap },
  { value: "TEACHER", label: "Teacher", description: "Teach, guide and analyze", icon: Users },
  { value: "ADMIN", label: "Admin", description: "Created by an existing admin", icon: ShieldCheck, disabled: true },
];

async function readResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
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

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STUDENT" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function register(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/backend/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await readResponse(response);
      if (!response.ok) {
        throw new Error(data.message || data.error || `Registration failed (${response.status})`);
      }

      const user = { userId: data.userId, name: data.name, email: data.email, role: data.role || form.role };
      localStorage.setItem("codegrowth_token", data.token);
      localStorage.setItem("codegrowth_user", JSON.stringify(user));
      router.push(rolePath(user.role));
    } catch (err) {
      setError(err.message || "Could not create your account.");
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
      <CodeGrowthScene className="opacity-70" />
      <div className="absolute right-6 top-6 z-20">
        <ThemeSwitcher />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 py-8 lg:px-10">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white/60 shadow-2xl shadow-slate-200/50 backdrop-blur-2xl dark:border-white/10 dark:bg-black/25 dark:shadow-indigo-950/40 lg:grid-cols-[1fr_1.05fr]">
          <section className="relative hidden overflow-hidden border-r border-slate-200 p-12 dark:border-white/10 lg:block">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-slate-100 ring-1 ring-slate-200 dark:bg-white/10 dark:ring-white/10"><Code2 size={19} className="text-violet-600 dark:text-violet-300" /></div><div><div className="text-sm font-semibold">CodeGrowth AI</div><div className="text-[10px] text-slate-500">Your AI learning + engineering OS</div></div></div>
              <div className="mt-24 max-w-lg"><span className="text-[10px] font-semibold uppercase tracking-[.26em] text-violet-600 dark:text-violet-300">Choose your workspace</span><h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-.04em]">The platform changes with <span className="bg-gradient-to-r from-violet-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent dark:from-violet-300 dark:via-cyan-200 dark:to-white">you.</span></h1><p className="mt-6 text-base leading-7 text-slate-600 dark:text-slate-400">Students get personalized growth. Teachers get classroom intelligence. Admins get full platform visibility.</p></div>
            </motion.div>
          </section>

          <section className="relative z-10 p-6 sm:p-10 lg:p-12">
            <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .45 }}>
              <div className="mb-8 lg:hidden"><div className="flex items-center gap-3 font-semibold"><span className="grid size-10 place-items-center rounded-xl bg-slate-100 dark:bg-white/10"><Code2 size={19} className="text-violet-600 dark:text-violet-300" /></span>CodeGrowth AI</div></div>
              <div className="mb-7"><span className="text-[10px] font-semibold uppercase tracking-[.25em] text-violet-600 dark:text-violet-300">Get started</span><h2 className="mt-3 text-3xl font-semibold tracking-tight">Create your workspace</h2><p className="mt-2 text-sm leading-6 text-slate-500">Choose the role that matches how you use CodeGrowth.</p></div>

              <div className="mb-6 grid gap-2 sm:grid-cols-3">
                {roles.map(({ value, label, description, icon: Icon, disabled }) => {
                  const selected = form.role === value;
                  return <button type="button" key={value} disabled={disabled} onClick={() => update("role", value)} className={`rounded-2xl border p-3.5 text-left transition ${disabled ? "cursor-not-allowed border-slate-200 bg-slate-100/50 opacity-55 dark:border-white/5 dark:bg-white/[0.02]" : selected ? "border-slate-300 bg-slate-100 shadow-md dark:border-white/20 dark:bg-white/[0.07] dark:shadow-black/20" : "border-slate-200 bg-white/50 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.025] dark:hover:bg-white/[0.045]"}`}><Icon size={18} className={selected ? "text-slate-900 dark:text-white" : disabled ? "text-slate-400 dark:text-slate-700" : "text-slate-500 dark:text-slate-600"} /><div className="mt-3 text-sm font-semibold">{label}</div><div className="mt-1 text-[10px] leading-4 text-slate-500 dark:text-slate-600">{description}</div></button>;
                })}
              </div>

              {/* OAuth Buttons */}
              <div className="mb-6 space-y-3">
                <button
                  onClick={() => oauthLogin("google")}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white/50 text-sm font-medium text-slate-700 transition hover:bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.08] dark:hover:border-white/20"
                >
                  <GoogleIcon />
                  Sign up with Google
                </button>
                <button
                  onClick={() => oauthLogin("github")}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white/50 text-sm font-medium text-slate-700 transition hover:bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.08] dark:hover:border-white/20"
                >
                  <GitHubIcon />
                  Sign up with GitHub
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/10" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white/80 px-3 text-slate-500 backdrop-blur dark:bg-[#04070f]/80">or create an account with email</span></div>
              </div>

              <form onSubmit={register} className="space-y-4">
                <label className="block space-y-2 text-sm text-slate-700 dark:text-slate-300"><span>Name</span><div className="relative"><UserRound className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-600" size={17} /><Input className="h-12 rounded-xl border-slate-200 bg-white/50 pl-10 dark:border-white/10 dark:bg-white/[0.035]" value={form.name} onChange={(e: any) => update("name", e.target.value)} placeholder="Your name" required /></div></label>
                <label className="block space-y-2 text-sm text-slate-700 dark:text-slate-300"><span>Email</span><div className="relative"><Mail className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-600" size={17} /><Input className="h-12 rounded-xl border-slate-200 bg-white/50 pl-10 dark:border-white/10 dark:bg-white/[0.035]" value={form.email} onChange={(e: any) => update("email", e.target.value)} type="email" placeholder="you@example.com" required /></div></label>
                <label className="block space-y-2 text-sm text-slate-700 dark:text-slate-300"><span>Password</span><div className="relative"><LockKeyhole className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-600" size={17} /><Input className="h-12 rounded-xl border-slate-200 bg-white/50 pl-10 dark:border-white/10 dark:bg-white/[0.035]" value={form.password} onChange={(e: any) => update("password", e.target.value)} type="password" placeholder="At least 8 characters" minLength={8} required /></div></label>
                <AnimatePresence>{error ? <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-400/15 dark:bg-red-500/[0.07] dark:text-red-300">{error}</motion.div> : null}</AnimatePresence>
                <Button className="mt-2 h-12 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200" size="lg" disabled={loading}>{loading ? "Creating your workspace..." : <>Create workspace <ArrowRight size={16} /></>}</Button>
              </form>
              <p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link href="/login" className="font-medium text-violet-600 transition hover:text-slate-900 dark:text-violet-300 dark:hover:text-white">Sign in</Link></p>
            </motion.div>
          </section>
        </div>
      </div>
    </main>
  );
}
