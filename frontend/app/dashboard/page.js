"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, Check, Clock3, Code2, Copy, FileJson, History, LogOut, RefreshCcw, Send, Sparkles, Trash2, UserRound, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const suggestions = [
  { icon: Code2, label: "Generate Java", prompt: "Write an optimized Java solution for the following problem and explain the time complexity:" },
  { icon: Sparkles, label: "Explain a DSA topic", prompt: "Explain this DSA concept like I am preparing for an interview:" },
  { icon: Zap, label: "Review my code", prompt: "Review this code for bugs, performance, and readability. Suggest an improved version:" },
  { icon: FileJson, label: "Design an API", prompt: "Design a production-ready REST API for this requirement, including endpoints and request/response examples:" },
];

function detectOutputType(text) {
  const trimmed = text.trim();
  if (/^```[a-zA-Z0-9+_-]*\n[\s\S]*```$/m.test(trimmed) || /```(java|js|ts|python|sql|bash|json|xml|css|html|yaml|yml|cpp|c)\b/i.test(trimmed)) return "code";
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try { JSON.parse(trimmed); return "json"; } catch {}
  }
  if (/^#{1,6}\s|\*\*|`[^`]+`|^[-*]\s|^\d+\.\s/m.test(text)) return "markdown";
  return "text";
}

function cleanCode(text) {
  const match = text.match(/```(?:[\w+-]+)?\n([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

function ResponseRenderer({ output }) {
  const type = detectOutputType(output);
  if (type === "json") {
    try {
      return <pre className="rounded-2xl border border-white/10 bg-black/20 p-5 font-mono text-[13px] leading-6 text-slate-200">{JSON.stringify(JSON.parse(output), null, 2)}</pre>;
    } catch {}
  }
  if (type === "code") {
    return <pre className="overflow-auto rounded-2xl border border-indigo-400/10 bg-[#060910] p-5 font-mono text-[13px] leading-6 text-slate-200"><code>{cleanCode(output)}</code></pre>;
  }
  if (type === "markdown") {
    return <div className="prose-cg"><ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown></div>;
  }
  return <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{output}</p>;
}

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
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const greeting = useMemo(() => `Good evening, ${user?.name?.split(" ")[0] || "Developer"}.`, [user]);
  const avatarLetter = (user?.name || "D").trim().charAt(0).toUpperCase();

  useEffect(() => {
    const savedToken = localStorage.getItem("codegrowth_token");
    const savedUser = localStorage.getItem("codegrowth_user");
    if (!savedToken) { router.replace("/login"); return; }
    setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));
    loadHistory(savedToken);
  }, [router]);

  async function loadHistory(authToken = token) {
    if (!authToken) return;
    setHistoryLoading(true);
    try {
      const response = await fetch("/api/backend/api/ai/history", { headers: { Authorization: `Bearer ${authToken}` }, cache: "no-store" });
      if (response.status === 401 || response.status === 403) { logout(); return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load history.");
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) { setError(err.message); }
    finally { setHistoryLoading(false); }
  }

  async function generate(event) {
    event?.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || !token) return;
    setLoading(true); setError(""); setCopied(false);
    try {
      const response = await fetch("/api/backend/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: cleanPrompt }),
      });
      if (response.status === 401 || response.status === 403) { logout(); return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Generation failed.");
      setOutput(data.response || "No response returned.");
      setModel(data.model || "qwen2.5-coder:7b");
      await loadHistory(token);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function deleteHistory(id) {
    try {
      const response = await fetch(`/api/backend/api/ai/history/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 401 || response.status === 403) { logout(); return; }
      if (!response.ok) throw new Error("Could not delete history item.");
      await loadHistory(token);
    } catch (err) { setError(err.message); }
  }

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function logout() {
    localStorage.removeItem("codegrowth_token");
    localStorage.removeItem("codegrowth_user");
    router.replace("/login");
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#05070d]/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-[1540px] items-center justify-between px-5 lg:px-10">
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-400/25 shadow-[0_0_28px_rgba(99,102,241,.12)]"><Bot size={20} /></div>
            <div><div className="text-[15px] font-semibold tracking-tight">CodeGrowth AI</div><div className="text-[11px] text-slate-500">Local AI engineering workspace</div></div>
          </motion.div>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-[11px] text-slate-400 sm:flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.9)]" /> Local model online</div>
            <div className="ml-1 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] pl-1.5 pr-2 py-1.5">
              <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-cyan-300 text-[11px] font-bold text-slate-950">{avatarLetter}</div>
              <div className="hidden text-left sm:block"><div className="text-xs font-medium text-slate-200">{user?.name || "Developer"}</div><div className="text-[10px] text-slate-500">{user?.email || ""}</div></div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut size={15} /> <span className="hidden sm:inline">Logout</span></Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1540px] gap-6 px-5 py-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-10">
        <aside className="hidden lg:block"><div className="sticky top-[96px] space-y-4">
          <div className="glass rounded-2xl p-3">
            <div className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[.28em] text-slate-500">Workspace</div>
            <div className="flex items-center gap-2 rounded-xl bg-indigo-500/[0.11] px-3 py-2.5 text-sm font-medium text-indigo-200"><Sparkles size={16} /> AI Studio</div>
            <div className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-500"><History size={16} /> History <span className="ml-auto rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-slate-600">{history.length}</span></div>
          </div>
          <div className="glass glow-ring rounded-2xl p-4">
            <div className="flex items-center gap-2 text-sm font-semibold"><Zap size={15} className="text-cyan-300" /> Local-first</div>
            <p className="mt-2 text-xs leading-5 text-slate-500">Your prompts stay in the local development stack and are served by your Qwen coding model.</p>
            <div className="mt-4 flex flex-wrap gap-1.5"><span className="rounded-md border border-white/10 px-2 py-1 text-[10px] text-slate-600">Redis</span><span className="rounded-md border border-white/10 px-2 py-1 text-[10px] text-slate-600">Postgres</span><span className="rounded-md border border-white/10 px-2 py-1 text-[10px] text-slate-600">Ollama</span></div>
          </div>
        </div></aside>

        <section className="min-w-0">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/15 bg-indigo-500/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[.25em] text-indigo-300">AI studio <span className="size-1 rounded-full bg-indigo-300" /></div><h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">{greeting}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">A focused space for generating code, understanding algorithms, reviewing solutions, and turning ideas into implementation.</p></div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600"><Clock3 size={14} /> History synced to PostgreSQL</div>
          </motion.div>

          <div className="mb-6 grid gap-2 md:grid-cols-4">
            {suggestions.map(({ icon: Icon, label, prompt: seed }, index) => <motion.button key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }} onClick={() => setPrompt(seed)} className="group glass rounded-2xl p-3.5 text-left transition hover:-translate-y-0.5 hover:border-indigo-400/20 hover:bg-white/[0.045]"><div className="mb-3 grid size-8 place-items-center rounded-lg bg-white/[0.04] text-slate-500 transition group-hover:bg-indigo-500/10 group-hover:text-indigo-300"><Icon size={15} /></div><div className="text-xs font-medium text-slate-300">{label}</div><div className="mt-1 line-clamp-1 text-[10px] text-slate-600">Start with a guided prompt</div></motion.button>)}
          </div>

          <AnimatePresence>{error ? <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">{error}</motion.div> : null}</AnimatePresence>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(390px,.92fr)]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}>
              <Card className="glass glow-ring overflow-hidden">
                <CardHeader className="border-b border-white/[0.07] p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><CardTitle className="text-base">Prompt workspace</CardTitle><CardDescription className="mt-1.5">Describe what you want to build, understand, or improve.</CardDescription></div><span className="rounded-full border border-indigo-400/15 bg-indigo-500/[0.08] px-2.5 py-1 text-[10px] font-medium text-indigo-300">Qwen Coder</span></div></CardHeader>
                <CardContent className="p-5 sm:p-6"><form onSubmit={generate} className="space-y-4"><div className="relative"><Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-[320px] resize-none border-white/[0.08] bg-black/15 p-4 font-mono text-[13px] leading-6 shadow-inner" placeholder="Tell CodeGrowth what you need...\n\nExample: Explain binary search in Java, show an optimized implementation, and compare its complexity with linear search." /><div className="pointer-events-none absolute bottom-3 right-3 rounded-md border border-white/[0.06] bg-black/30 px-2 py-1 text-[9px] text-slate-600">Ctrl + Enter</div></div><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="flex items-center gap-2 text-[11px] text-slate-600"><span className="size-1.5 rounded-full bg-emerald-400/70" /> Redis caching enabled</div><Button size="lg" disabled={loading || !prompt.trim()}>{loading ? <><RefreshCcw size={16} className="animate-spin" /> Thinking</> : <><Send size={16} /> Generate response</>}</Button></div></form></CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .14 }}>
              <Card className="glass min-h-[526px] overflow-hidden">
                <CardHeader className="border-b border-white/[0.07] p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><CardTitle className="text-base">AI response</CardTitle><CardDescription className="mt-1.5">{model ? `Generated by ${model}` : "The response adapts to what you ask for."}</CardDescription></div>{output ? <Button variant="ghost" size="sm" onClick={copyOutput}>{copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy</>}</Button> : null}</div></CardHeader>
                <CardContent className="code-scrollbar min-h-0 max-h-[640px] overflow-auto p-5 sm:p-6">
                  <AnimatePresence mode="wait">{output ? <motion.div key="output" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}><ResponseRenderer output={output} /></motion.div> : <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[410px] flex-col items-center justify-center text-center"><div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-cyan-400/10 text-indigo-300 ring-1 ring-indigo-400/10 shadow-[0_0_45px_rgba(99,102,241,.10)]"><Sparkles size={23} /></div><h2 className="mt-5 text-sm font-semibold text-slate-200">Your workspace is ready</h2><p className="mt-2 max-w-sm text-xs leading-6 text-slate-600">Ask for code, explanations, refactors, reviews, JSON, or structured output. CodeGrowth will choose a readable presentation.</p></motion.div>}</AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }} className="mt-7">
            <div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-semibold text-slate-200">Recent generations</h2><p className="mt-1 text-[11px] text-slate-600">Your workspace history, newest first.</p></div><Button variant="ghost" size="sm" onClick={() => loadHistory()}><RefreshCcw size={14} /> Refresh</Button></div>
            <Card className="glass overflow-hidden"><CardContent className="p-0">{historyLoading ? <div className="p-6 text-sm text-slate-500">Loading history…</div> : history.length === 0 ? <div className="p-6 text-sm text-slate-600">No generations yet. Your results will appear here.</div> : <div className="divide-y divide-white/[0.06]">{history.slice(0, 8).map((item) => <motion.div layout key={item.id} className="group flex gap-4 p-4 sm:p-5"><div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.035] text-slate-500"><UserRound size={15} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-white/10 bg-white/[0.02] px-2 py-0.5 text-[10px] text-slate-500">{item.model}</span><span className="text-[10px] text-slate-600">{new Date(item.createdAt).toLocaleString()}</span></div><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">{item.prompt}</p></div><Button variant="ghost" size="sm" onClick={() => deleteHistory(item.id)} aria-label="Delete history" className="opacity-60 transition group-hover:opacity-100"><Trash2 size={15} className="text-slate-500" /></Button></motion.div>)}</div>}</CardContent></Card>
          </motion.section>
        </section>
      </div>
    </main>
  );
}
