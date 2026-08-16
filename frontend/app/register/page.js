"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Code2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Could not create your account.");

      localStorage.setItem("codegrowth_token", data.token);
      localStorage.setItem("codegrowth_user", JSON.stringify({ userId: data.userId, name: data.name, email: data.email }));
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-8 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f1a]/85 shadow-2xl shadow-black/40 backdrop-blur xl:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden border-r border-white/10 p-12 xl:block">
            <div className="flex items-center gap-3 text-sm font-semibold tracking-wide"><span className="grid size-9 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/20"><Code2 size={19} /></span>CodeGrowth AI</div>
            <div className="mt-24 max-w-lg"><p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-300">Build your workspace</p><h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight">One place for prompts, code, history and growth.</h1><p className="mt-6 text-base leading-7 text-slate-400">Start with local AI and keep the whole developer workflow inside one focused workspace.</p></div>
          </section>

          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mb-10 xl:hidden"><div className="flex items-center gap-3 font-semibold"><span className="grid size-9 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300"><Code2 size={19} /></span>CodeGrowth AI</div></div>
            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="px-0 pt-0"><CardTitle className="text-2xl">Create your account</CardTitle><CardDescription>Set up your personal AI engineering workspace.</CardDescription></CardHeader>
              <CardContent className="px-0 pb-0">
                <form onSubmit={register} className="space-y-4">
                  <label className="block space-y-2 text-sm text-slate-300"><span>Name</span><div className="relative"><UserRound className="absolute left-3.5 top-3.5 text-slate-500" size={17} /><Input className="pl-10" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Soham" required /></div></label>
                  <label className="block space-y-2 text-sm text-slate-300"><span>Email</span><div className="relative"><Mail className="absolute left-3.5 top-3.5 text-slate-500" size={17} /><Input className="pl-10" value={form.email} onChange={(e) => update("email", e.target.value)} type="email" placeholder="you@example.com" required /></div></label>
                  <label className="block space-y-2 text-sm text-slate-300"><span>Password</span><div className="relative"><LockKeyhole className="absolute left-3.5 top-3.5 text-slate-500" size={17} /><Input className="pl-10" value={form.password} onChange={(e) => update("password", e.target.value)} type="password" placeholder="At least 8 characters" minLength={8} required /></div></label>
                  {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-3 text-sm text-red-300">{error}</div> : null}
                  <Button className="mt-2 w-full" size="lg" disabled={loading}>{loading ? "Creating account..." : <>Create account <ArrowRight size={16} /></>}</Button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-medium text-indigo-300 hover:text-indigo-200">Sign in</Link></p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
