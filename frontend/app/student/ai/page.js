"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, RefreshCcw, Send } from "lucide-react";
import AppShell from "@/components/workspace/AppShell";
import { apiGet, apiPost, handleAuthError } from "@/lib/api";

function renderOutput(text) {
  const trimmed = text.trim();
  if ((trimmed.startsWith("{") || trimmed.startsWith("["))) {
    try { return <pre className="overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-200">{JSON.stringify(JSON.parse(trimmed), null, 2)}</pre>; } catch {}
  }
  if (/```|^#{1,6}\s|\*\*|^[-*]\s/m.test(trimmed)) return <div className="prose-cg"><ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown></div>;
  return <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">{text}</pre>;
}

export default function StudentAI() {
  const [prompt, setPrompt] = useState(""); const [output, setOutput] = useState(""); const [model, setModel] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function generate() {
    if (!prompt.trim()) return; setLoading(true); setError("");
    try { const data = await apiPost("/api/ai/generate", { prompt }); setOutput(data.response || ""); setModel(data.model || "qwen2.5-coder:7b"); } catch (e) { setError(e.message); if (handleAuthError(e, window.next?.router)) return; } finally { setLoading(false); }
  }
  async function copy() { if (output) await navigator.clipboard.writeText(output); }
  return <AppShell role="STUDENT" title="AI Mentor" subtitle="A personal learning assistant for explanations, practice and code."><div className="grid gap-5 xl:grid-cols-[.95fr_1.05fr]">
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.035]"><h2 className="text-base font-semibold">Ask your mentor</h2><p className="mt-1 text-xs text-slate-500">Ask for an explanation, debugging help, study plan or practice questions.</p><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") generate(); }} className="mt-5 min-h-80 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm outline-none focus:border-violet-300 dark:border-white/10 dark:bg-[#071018]" placeholder="Example: Teach me binary search using a visual explanation and a Java example." /><div className="mt-4 flex flex-wrap gap-2">{["Explain a concept", "Review my code", "Give me quiz questions", "Make a study plan"].map((x) => <button type="button" key={x} onClick={() => setPrompt(x)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/[0.04]">{x}</button>)}</div><button onClick={generate} disabled={loading || !prompt.trim()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900">{loading ? <RefreshCcw size={15} className="animate-spin" /> : <Send size={15} />}{loading ? "Thinking..." : "Ask CodeGrowth"}</button>{error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/15 dark:bg-red-500/5 dark:text-red-300">{error}</div>}</section>
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.035]"><div className="flex items-center justify-between"><div><h2 className="text-base font-semibold">Response</h2><div className="mt-1 text-xs text-slate-500">{model || "Your answer will appear here"}</div></div><button onClick={copy} disabled={!output} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 disabled:opacity-40 dark:border-white/10 dark:text-slate-300"><Copy size={14} /> Copy</button></div><div className="mt-5 min-h-96 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-[#071018]">{output ? renderOutput(output) : <div className="grid min-h-80 place-items-center text-center text-sm text-slate-500">Start a conversation and your mentor response will show here.</div>}</div></section>
  </div></AppShell>;
}
