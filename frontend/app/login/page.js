"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Code2, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
            <div className="flex items-center gap-3 text-sm font-semibold tracking-wide text-white">
              <span className="grid size-9 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/20"><Code2 size={19} /></span>
              CodeGrowth AI
            </div>
            <div className="mt-24 max-w-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-300">Local-first developer workspace</p>
              <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight">Ship smarter. Learn faster. Grow every commit.</h1>
              <p className="mt-6 text-base leading-7 text-slate-400">Your AI coding workspace powered by Spring Boot, FastAPI, Redis, PostgreSQL and a local coding model.</p>
            </div>
            <div className="mt-20 flex gap-2 text-xs text-slate-500"><span className="rounded-full border border-white/10 px-3 py-1">Private by design</span><span className="rounded-full border border-white/10 px-3 py-1">Local AI</span></div>
          </section>

          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mb-10 xl:hidden">
              <div className="flex items-center gap-3 font-semibold"><span className="grid size-9 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300"><Code2 size={19} /></span>CodeGrowth AI</div>
            </div>
            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl">Welcome back</CardTitle>
                <CardDescription>Sign in to open your AI engineering workspace.</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <form onSubmit={login} className="space-y-5">
                  <label className="block space-y-2 text-sm text-slate-300"><span>Email</span><div className="relative"><Mail className="absolute left-3.5 top-3.5 text-slate-500" size={17} /><Input className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" required /></div></label>
                  <label className="block space-y-2 text-sm text-slate-300"><span>Password</span><div className="relative"><LockKeyhole className="absolute left-3.5 top-3.5 text-slate-500" size={17} /><Input className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" required /></div></label>
                  {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-3 text-sm text-red-300">{error}</div> : null}
                  <Button className="w-full" size="lg" disabled={loading}>{loading ? "Signing in..." : <>Sign in <ArrowRight size={16} /></>}</Button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-500">New to CodeGrowth? <Link href="/register" className="font-medium text-indigo-300 hover:text-indigo-200">Create an account</Link></p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
