"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Code2, GraduationCap, LockKeyhole, Mail, ShieldCheck, UserRound, Users } from "lucide-react";
import CodeGrowthScene from "@/components/visuals/CodeGrowthScene";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function rolePath(role) {
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

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STUDENT" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function register(event) {
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070f] text-slate-100">
      <CodeGrowthScene className="opacity-70" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 py-8 lg:px-10">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-black/25 shadow-2xl shadow-indigo-950/40 backdrop-blur-2xl lg:grid-cols-[1fr_1.05fr]">
          <section className="relative hidden overflow-hidden border-r border-white/10 p-12 lg:block">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10"><Code2 size={19} className="text-violet-300" /></div><div><div className="text-sm font-semibold">CodeGrowth AI</div><div className="text-[10px] text-slate-500">Your AI learning + engineering OS</div></div></div>
              <div className="mt-24 max-w-lg"><span className="text-[10px] font-semibold uppercase tracking-[.26em] text-violet-300">Choose your workspace</span><h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-.04em]">The platform changes with <span className="bg-gradient-to-r from-violet-300 via-cyan-200 to-white bg-clip-text text-transparent">you.</span></h1><p className="mt-6 text-base leading-7 text-slate-400">Students get personalized growth. Teachers get classroom intelligence. Admins get full platform visibility.</p></div>
            </motion.div>
          </section>

          <section className="relative z-10 p-6 sm:p-10 lg:p-12">
            <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .45 }}>
              <div className="mb-8 lg:hidden"><div className="flex items-center gap-3 font-semibold"><span className="grid size-10 place-items-center rounded-xl bg-white/10"><Code2 size={19} className="text-violet-300" /></span>CodeGrowth AI</div></div>
              <div className="mb-7"><span className="text-[10px] font-semibold uppercase tracking-[.25em] text-violet-300">Get started</span><h2 className="mt-3 text-3xl font-semibold tracking-tight">Create your workspace</h2><p className="mt-2 text-sm leading-6 text-slate-500">Choose the role that matches how you use CodeGrowth.</p></div>

              <div className="mb-6 grid gap-2 sm:grid-cols-3">
                {roles.map(({ value, label, description, icon: Icon, disabled }) => {
                  const selected = form.role === value;
                  return <button type="button" key={value} disabled={disabled} onClick={() => update("role", value)} className={`rounded-2xl border p-3.5 text-left transition ${disabled ? "cursor-not-allowed border-white/6 bg-white/[0.018] opacity-55" : selected ? "border-white/20 bg-white/[0.07] shadow-lg shadow-black/20" : "border-white/8 bg-white/[0.025] hover:bg-white/[0.045]"}`}><Icon size={18} className={selected ? "text-white" : disabled ? "text-slate-700" : "text-slate-600"} /><div className="mt-3 text-sm font-semibold">{label}</div><div className="mt-1 text-[10px] leading-4 text-slate-600">{description}</div></button>;
                })}
              </div>

              <form onSubmit={register} className="space-y-4">
                <label className="block space-y-2 text-sm text-slate-300"><span>Name</span><div className="relative"><UserRound className="absolute left-3.5 top-3.5 text-slate-600" size={17} /><Input className="h-12 rounded-xl border-white/10 bg-white/[0.035] pl-10" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" required /></div></label>
                <label className="block space-y-2 text-sm text-slate-300"><span>Email</span><div className="relative"><Mail className="absolute left-3.5 top-3.5 text-slate-600" size={17} /><Input className="h-12 rounded-xl border-white/10 bg-white/[0.035] pl-10" value={form.email} onChange={(e) => update("email", e.target.value)} type="email" placeholder="you@example.com" required /></div></label>
                <label className="block space-y-2 text-sm text-slate-300"><span>Password</span><div className="relative"><LockKeyhole className="absolute left-3.5 top-3.5 text-slate-600" size={17} /><Input className="h-12 rounded-xl border-white/10 bg-white/[0.035] pl-10" value={form.password} onChange={(e) => update("password", e.target.value)} type="password" placeholder="At least 8 characters" minLength={8} required /></div></label>
                <AnimatePresence>{error ? <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-red-400/15 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300">{error}</motion.div> : null}</AnimatePresence>
                <Button className="mt-2 h-12 w-full rounded-xl" size="lg" disabled={loading}>{loading ? "Creating your workspace..." : <>Create workspace <ArrowRight size={16} /></>}</Button>
              </form>
              <p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link href="/login" className="font-medium text-violet-300 transition hover:text-white">Sign in</Link></p>
            </motion.div>
          </section>
        </div>
      </div>
    </main>
  );
}
