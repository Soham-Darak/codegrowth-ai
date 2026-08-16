"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Clock3, Copy, History, LogOut, RefreshCcw, Send, Sparkles, Trash2, UserRound, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const suggestions = [
  "Explain binary search in Java with an example",
  "Review this Java code for performance issues",
  "Generate a Spring Boot REST controller for a user resource",
  "Explain recursion like I am learning DSA for the first time",
];

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [model, setModel] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");

  const historyCount = history.length;
  const greeting = useMemo(() => {
    const name = user?.name?.split(" ")[0] || "Developer";
    return `Good evening, ${name}.`;
  }, [user]);

  useEffect(() => {
    const savedToken = localStorage.getItem("codegrowth_token");
    const savedUser = localStorage.getItem("codegrowth_user");
    if (!savedToken) {
      router.replace("/login");
      return;
    }
    setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));
    loadHistory(savedToken);
  }, [router]);

  async function loadHistory(authToken = token) {
    if (!authToken) return;
    setHistoryLoading(true);
    try {
      const response = await fetch("/api/backend/api/ai/history", {
        headers: { Authorization: `Bearer ${authToken}` },
        cache: "no-store",
      });
      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load history.");
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function generate(event) {
    event?.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || !token) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/backend/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: cleanPrompt }),
      });
      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Generation failed.");
      setOutput(data.response || "No response returned.");
      setModel(data.model || "qwen2.5-coder:7b");
      await loadHistory(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteHistory(id) {
    try {
      const response = await fetch(`/api/backend/api/ai/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }
      if (!response.ok) throw new Error("Could not delete history item.");
      await loadHistory(token);
    } catch (err) {
      setError(err.message);
    }
  }

  async function copyOutput() {
    if (output) await navigator.clipboard.writeText(output);
  }

  function usePrompt(value) {
    setPrompt(value);
  }

  function logout() {
    localStorage.removeItem("codegrowth_token");
    localStorage.removeItem("codegrowth_user");
    router.replace("/login");
  }

  return (
    <main className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#070a12]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/20"><Bot size={19} /></div>
            <div><div className="text-sm font-semibold tracking-wide">CodeGrowth AI</div><div className="hidden text-[11px] text-slate-500 sm:block">AI engineering workspace</div></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400 sm:flex"><span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" /> Local AI online</div>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut size={15} /> <span className="hidden sm:inline">Logout</span></Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-6 px-5 py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
              <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</div>
              <div className="flex items-center gap-2 rounded-xl bg-indigo-500/10 px-3 py-2.5 text-sm text-indigo-200"><Sparkles size={16} /> AI Studio</div>
              <div className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-400"><History size={16} /> History <span className="ml-auto text-xs text-slate-600">{historyCount}</span></div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 p-4"><div className="flex items-center gap-2 text-sm font-medium"><Zap size={15} className="text-cyan-300" /> Local-first</div><p className="mt-2 text-xs leading-5 text-slate-500">Prompts are processed through your local Qwen coding model.</p></div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">AI studio</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{greeting}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Turn questions, bugs, and ideas into useful code with a focused local AI workflow.</p></div>
            <div className="flex items-center gap-2 text-xs text-slate-500"><Clock3 size={14} /> History saved to PostgreSQL</div>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {suggestions.map((suggestion) => <button key={suggestion} onClick={() => usePrompt(suggestion)} className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400 transition hover:border-indigo-400/30 hover:bg-indigo-500/5 hover:text-slate-200">{suggestion}</button>)}
          </div>

          {error ? <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div> : null}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-white/10"><div className="flex items-center justify-between"><div><CardTitle>Prompt workspace</CardTitle><CardDescription>Ask for code, debugging help, architecture ideas, or explanations.</CardDescription></div><span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-[11px] text-indigo-300">Qwen Coder</span></div></CardHeader>
              <CardContent className="space-y-4 p-5">
                <form onSubmit={generate} className="space-y-4">
                  <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-[300px] font-mono text-[13px] leading-6" placeholder="e.g. Review this Java solution for time complexity and suggest an optimized approach..." />
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="text-xs text-slate-600">Responses are cached in Redis for repeated prompts.</div><Button size="lg" disabled={loading || !prompt.trim()}>{loading ? <><RefreshCcw size={16} className="animate-spin" /> Generating</> : <><Send size={16} /> Generate</>}</Button></div>
                </form>
              </CardContent>
            </Card>

            <Card className="flex min-h-[480px] flex-col overflow-hidden">
              <CardHeader className="border-b border-white/10"><div className="flex items-center justify-between"><div><CardTitle>AI output</CardTitle><CardDescription>{model ? `Source: ${model}` : "Your result appears here."}</CardDescription></div>{output ? <Button variant="ghost" size="sm" onClick={copyOutput}><Copy size={15} /> Copy</Button> : null}</div></CardHeader>
              <CardContent className="code-scrollbar min-h-0 flex-1 overflow-auto p-5">
                {output ? <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-slate-300">{output}</pre> : <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center"><div className="grid size-12 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-300"><Sparkles size={21} /></div><h2 className="mt-4 text-sm font-medium text-slate-200">Ready when you are</h2><p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">Write a prompt or pick one of the suggestions above to generate your first result.</p></div>}
              </CardContent>
            </Card>
          </div>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-semibold">Recent generations</h2><p className="text-xs text-slate-500">Your latest prompts, ordered by most recent activity.</p></div><Button variant="ghost" size="sm" onClick={() => loadHistory()}><RefreshCcw size={14} /> Refresh</Button></div>
            <Card>
              <CardContent className="p-0">
                {historyLoading ? <div className="p-6 text-sm text-slate-500">Loading history…</div> : history.length === 0 ? <div className="p-6 text-sm text-slate-500">No generations yet.</div> : <div className="divide-y divide-white/10">{history.slice(0, 8).map((item) => <div key={item.id} className="flex gap-4 p-4 sm:p-5"><div className="mt-1 hidden size-8 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-slate-500 sm:grid"><UserRound size={15} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-slate-500">{item.model}</span><span className="text-[10px] text-slate-600">{new Date(item.createdAt).toLocaleString()}</span></div><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">{item.prompt}</p></div><Button variant="ghost" size="sm" onClick={() => deleteHistory(item.id)} aria-label="Delete history"><Trash2 size={15} className="text-slate-500" /></Button></div>)}</div>}
              </CardContent>
            </Card>
          </section>
        </section>
      </div>
    </main>
  );
}
