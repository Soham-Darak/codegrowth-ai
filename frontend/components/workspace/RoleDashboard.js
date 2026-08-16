"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Activity, ArrowUpRight, BookOpen, Bot, BrainCircuit, CheckCircle2, ClipboardList, Code2, Database, GraduationCap, History, LayoutDashboard, LogOut, Menu, MessageSquareText, RefreshCcw, Search, Settings, ShieldCheck, Sparkles, Target, UserRound, Users, WandSparkles, X, Zap } from "lucide-react";
import CodeGrowthScene from "@/components/visuals/CodeGrowthScene";

const ROLE_META = {
  STUDENT: {
    label: "Student",
    accent: "from-violet-500 to-cyan-400",
    tagline: "Learn, practice, build.",
    nav: [
      ["Overview", LayoutDashboard],
      ["AI Mentor", Sparkles],
      ["Learning path", BookOpen],
      ["Challenges", Target],
      ["History", History],
    ],
  },
  TEACHER: {
    label: "Teacher",
    accent: "from-cyan-400 to-emerald-400",
    tagline: "Teach smarter, see progress.",
    nav: [
      ["Overview", LayoutDashboard],
      ["My classes", Users],
      ["Assignments", ClipboardList],
      ["AI tools", WandSparkles],
      ["Analytics", Activity],
    ],
  },
  ADMIN: {
    label: "Admin",
    accent: "from-amber-300 to-fuchsia-400",
    tagline: "See the whole system.",
    nav: [
      ["Overview", LayoutDashboard],
      ["Users", Users],
      ["Analytics", Activity],
      ["AI control", BrainCircuit],
      ["Settings", Settings],
    ],
  },
};

const ROLE_STATS = {
  STUDENT: [
    { label: "Learning streak", value: "12 days", note: "+3 from last week", icon: Zap },
    { label: "Challenges solved", value: "48", note: "8 this week", icon: Target },
    { label: "AI sessions", value: "126", note: "24 this week", icon: Sparkles },
    { label: "Current goal", value: "DSA", note: "68% complete", icon: GraduationCap },
  ],
  TEACHER: [
    { label: "Active students", value: "126", note: "+14 this month", icon: Users },
    { label: "Assignments", value: "18", note: "4 need review", icon: ClipboardList },
    { label: "Class engagement", value: "87%", note: "+6% this week", icon: Activity },
    { label: "AI-assisted tasks", value: "63", note: "12 today", icon: WandSparkles },
  ],
  ADMIN: [
    { label: "Users", value: "2,481", note: "+142 this month", icon: Users },
    { label: "AI requests", value: "18.7k", note: "+12% this week", icon: BrainCircuit },
    { label: "Cache hit rate", value: "72%", note: "Redis healthy", icon: Database },
    { label: "System health", value: "99.9%", note: "All services online", icon: ShieldCheck },
  ],
};

function initials(name) {
  return (name || "User").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function StudentContent({ history, onGenerate, generating }) {
  return (
    <>
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div><span className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">AI mentor</span><h2 className="mt-2 text-2xl font-semibold tracking-tight">What are you working on today?</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Ask for an explanation, code review, debugging help, or a learning plan.</p></div>
            <div className="grid size-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/20"><Bot size={21} /></div>
          </div>
          <textarea id="student-prompt" className="mt-6 min-h-44 w-full resize-none rounded-2xl border border-white/10 bg-[#070a12]/80 p-4 font-mono text-sm leading-6 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/10" placeholder="Example: Explain dynamic programming with a Java example..." />
          <div className="mt-4 flex flex-wrap gap-2">
            {["Explain this concept", "Review my code", "Give me practice questions", "Build a study plan"].map((item) => <button key={item} onClick={() => { const el = document.getElementById("student-prompt"); if (el) el.value = item; }} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400 transition hover:border-violet-400/30 hover:text-white">{item}</button>)}
          </div>
          <div className="mt-5 flex items-center justify-between"><span className="text-xs text-slate-600">Local Qwen model • Redis cache enabled</span><button disabled={generating} onClick={() => onGenerate(document.getElementById("student-prompt")?.value || "")} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-violet-950/20 transition hover:translate-y-[-1px] disabled:opacity-50">{generating ? <RefreshCcw className="animate-spin" size={15} /> : <Sparkles size={15} />} {generating ? "Thinking" : "Ask CodeGrowth"}</button></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 via-white/[0.03] to-violet-500/10 p-6 backdrop-blur-xl"><span className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Your progress</span><div className="mt-6 flex items-end justify-between"><div><div className="text-4xl font-semibold">68%</div><div className="mt-1 text-sm text-slate-500">DSA roadmap</div></div><div className="text-right text-xs text-emerald-300">+9% this week</div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: "68%" }} transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-300" /></div><div className="mt-6 space-y-3 text-sm"><div className="flex items-center justify-between"><span className="text-slate-400">Arrays & strings</span><span className="text-emerald-300">Done</span></div><div className="flex items-center justify-between"><span className="text-slate-400">Recursion</span><span className="text-emerald-300">Done</span></div><div className="flex items-center justify-between"><span className="text-slate-400">Graphs</span><span className="text-amber-300">In progress</span></div></div></motion.div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"><div className="flex items-center justify-between"><div><h2 className="text-base font-semibold">Recent activity</h2><p className="mt-1 text-xs text-slate-500">Your latest AI-assisted sessions.</p></div><History size={18} className="text-slate-500" /></div><div className="mt-5 space-y-3">{history.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">Your first session will appear here.</div> : history.slice(0, 5).map((item) => <div key={item.id} className="rounded-2xl border border-white/8 bg-black/10 p-4"><div className="flex items-center justify-between gap-3"><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-slate-500">{item.model}</span><span className="text-[10px] text-slate-600">{new Date(item.createdAt).toLocaleString()}</span></div><p className="mt-2 line-clamp-2 text-sm text-slate-300">{item.prompt}</p></div>)}</div></div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"><div className="flex items-center gap-2 text-sm font-semibold"><GraduationCap size={17} className="text-violet-300" /> Today’s focus</div><div className="mt-5 space-y-3"><div className="rounded-2xl bg-violet-500/10 p-4"><div className="text-sm font-medium">Binary search patterns</div><div className="mt-1 text-xs text-slate-500">20 min recommended</div></div><div className="rounded-2xl bg-cyan-500/10 p-4"><div className="text-sm font-medium">1 LeetCode challenge</div><div className="mt-1 text-xs text-slate-500">Medium • arrays</div></div><div className="rounded-2xl bg-emerald-500/10 p-4"><div className="text-sm font-medium">Review yesterday’s AI notes</div><div className="mt-1 text-xs text-slate-500">5 min</div></div></div></div>
      </section>
    </>
  );
}

function TeacherContent() {
  const rows = [
    ["Aarav Mehta", "DSA Cohort", "92%", "On track"],
    ["Riya Sharma", "Backend", "84%", "Needs review"],
    ["Kunal Jain", "Spring Boot", "76%", "On track"],
    ["Nisha Rao", "DSA Cohort", "61%", "Needs support"],
  ];
  return (
    <>
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl"><div className="flex items-center justify-between"><div><span className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Classroom intelligence</span><h2 className="mt-2 text-2xl font-semibold">Good morning, educator.</h2><p className="mt-2 text-sm text-slate-400">Your classes are healthy. Two students need attention today.</p></div><div className="grid size-12 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-300"><Users size={22} /></div></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-white/[0.035] p-4"><div className="text-xs text-slate-500">Engagement</div><div className="mt-1 text-2xl font-semibold">87%</div></div><div className="rounded-2xl bg-white/[0.035] p-4"><div className="text-xs text-slate-500">Submissions</div><div className="mt-1 text-2xl font-semibold">94%</div></div><div className="rounded-2xl bg-white/[0.035] p-4"><div className="text-xs text-slate-500">At risk</div><div className="mt-1 text-2xl font-semibold text-amber-300">12</div></div></div></div>
        <div className="rounded-3xl border border-emerald-400/10 bg-gradient-to-br from-emerald-400/10 to-cyan-400/5 p-6"><div className="flex items-center gap-2 text-sm font-semibold"><WandSparkles size={17} className="text-emerald-300" /> AI teaching assistant</div><p className="mt-3 text-sm leading-6 text-slate-400">Generate rubrics, assignment variations, hints, and personalized feedback in seconds.</p><button className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm hover:bg-white/10">Open teaching tools <ArrowUpRight size={15} /></button></div>
      </section>
      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6"><div className="flex items-center justify-between"><div><h2 className="text-base font-semibold">Student pulse</h2><p className="mt-1 text-xs text-slate-500">A quick view of learners that need your attention.</p></div><Search size={18} className="text-slate-500" /></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-600"><th className="pb-3">Student</th><th className="pb-3">Track</th><th className="pb-3">Progress</th><th className="pb-3">Status</th></tr></thead><tbody>{rows.map((row) => <tr key={row[0]} className="border-b border-white/5"><td className="py-4 text-slate-200">{row[0]}</td><td className="py-4 text-slate-500">{row[1]}</td><td className="py-4 text-slate-300">{row[2]}</td><td className={`py-4 ${row[3] === "On track" ? "text-emerald-300" : "text-amber-300"}`}>{row[3]}</td></tr>)}</tbody></table></div></section>
    </>
  );
}

function AdminContent() {
  return (
    <>
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl"><div className="flex items-center justify-between"><div><span className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">Control center</span><h2 className="mt-2 text-2xl font-semibold">Platform overview</h2><p className="mt-2 text-sm text-slate-400">Monitor adoption, AI usage, and infrastructure health.</p></div><div className="grid size-12 place-items-center rounded-2xl bg-amber-400/10 text-amber-300"><ShieldCheck size={22} /></div></div><div className="mt-6 h-36 rounded-2xl border border-white/5 bg-gradient-to-br from-amber-300/10 via-fuchsia-400/5 to-transparent p-5"><div className="flex h-full items-end gap-2">{[34,47,43,61,57,72,68,84,74,92,80,96].map((height, index) => <motion.div key={index} initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 0.6, delay: index * 0.04 }} className="flex-1 rounded-t-md bg-gradient-to-t from-amber-300/30 to-fuchsia-400/70" />)}</div></div></div>
        <div className="rounded-3xl border border-fuchsia-400/10 bg-gradient-to-br from-fuchsia-400/10 to-indigo-400/5 p-6"><div className="flex items-center gap-2 text-sm font-semibold"><BrainCircuit size={17} className="text-fuchsia-300" /> AI operations</div><div className="mt-5 space-y-4 text-sm"><div><div className="mb-2 flex justify-between text-xs"><span className="text-slate-500">Model availability</span><span className="text-emerald-300">Healthy</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-full w-[99%] rounded-full bg-emerald-400" /></div></div><div><div className="mb-2 flex justify-between text-xs"><span className="text-slate-500">Redis cache</span><span className="text-cyan-300">72% hit</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-full w-[72%] rounded-full bg-cyan-400" /></div></div><div><div className="mb-2 flex justify-between text-xs"><span className="text-slate-500">API latency</span><span className="text-violet-300">184 ms</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-full w-[84%] rounded-full bg-violet-400" /></div></div></div></div>
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-3"><div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"><div className="flex items-center gap-2 text-sm font-semibold"><Users size={17} className="text-amber-300" /> User management</div><p className="mt-3 text-sm text-slate-500">Review students, teachers, roles, and activity.</p><button className="mt-5 inline-flex items-center gap-2 text-sm text-amber-200">Open users <ArrowUpRight size={15} /></button></div><div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"><div className="flex items-center gap-2 text-sm font-semibold"><Activity size={17} className="text-cyan-300" /> Analytics</div><p className="mt-3 text-sm text-slate-500">Track engagement, retention, and AI usage patterns.</p><button className="mt-5 inline-flex items-center gap-2 text-sm text-cyan-200">Open analytics <ArrowUpRight size={15} /></button></div><div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"><div className="flex items-center gap-2 text-sm font-semibold"><Settings size={17} className="text-violet-300" /> Platform settings</div><p className="mt-3 text-sm text-slate-500">Manage models, policies, cache limits, and integrations.</p><button className="mt-5 inline-flex items-center gap-2 text-sm text-violet-200">Open settings <ArrowUpRight size={15} /></button></div></section>
    </>
  );
}

export default function RoleDashboard({ role = "STUDENT" }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [history, setHistory] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const meta = ROLE_META[role] || ROLE_META.STUDENT;
  const firstName = user?.name?.split(" ")[0] || meta.label;
  const stats = ROLE_STATS[role] || ROLE_STATS.STUDENT;

  useEffect(() => {
    const storedToken = localStorage.getItem("codegrowth_token");
    const storedUser = localStorage.getItem("codegrowth_user");
    if (!storedToken || !storedUser) {
      router.replace("/login");
      return;
    }
    const parsed = JSON.parse(storedUser);
    const actualRole = (parsed.role || "STUDENT").toUpperCase();
    if (actualRole !== role) {
      router.replace(actualRole === "ADMIN" ? "/admin" : actualRole === "TEACHER" ? "/teacher" : "/student");
      return;
    }
    setToken(storedToken);
    setUser(parsed);
    fetchHistory(storedToken);
  }, [role, router]);

  async function fetchHistory(authToken) {
    const response = await fetch("/api/backend/api/ai/history", { headers: { Authorization: `Bearer ${authToken}` }, cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setHistory(Array.isArray(data) ? data : []);
  }

  async function generate(prompt) {
    if (!prompt.trim() || !token) return;
    setGenerating(true);
    try {
      const response = await fetch("/api/backend/api/ai/generate", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ prompt }) });
      if (response.ok) await fetchHistory(token);
    } finally {
      setGenerating(false);
    }
  }

  function logout() {
    localStorage.removeItem("codegrowth_token");
    localStorage.removeItem("codegrowth_user");
    router.replace("/login");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070f] text-slate-100">
      <CodeGrowthScene className="fixed opacity-55" />
      <div className="relative z-10">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#04070f]/70 backdrop-blur-2xl">
          <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3"><button onClick={() => setMobileNav(true)} className="rounded-xl border border-white/10 p-2 lg:hidden"><Menu size={18} /></button><div className="grid size-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10"><Code2 size={19} /></div><div><div className="text-sm font-semibold tracking-wide">CodeGrowth</div><div className="text-[10px] text-slate-500">{meta.label} workspace</div></div></div>
            <div className="flex items-center gap-3"><div className="hidden rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-slate-400 sm:block"><span className="mr-2 inline-block size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.75)]" /> Local AI online</div><div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3"><div className={`grid size-8 place-items-center rounded-full bg-gradient-to-br ${meta.accent} text-[11px] font-bold text-slate-950`}>{initials(user?.name)}</div><div className="hidden text-left sm:block"><div className="text-xs font-semibold">{user?.name}</div><div className="text-[10px] uppercase tracking-wider text-slate-500">{meta.label}</div></div></div><button onClick={logout} className="rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"><LogOut size={17} /></button></div>
          </div>
        </header>

        <AnimatePresence>{mobileNav ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileNav(false)}><motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", stiffness: 280, damping: 28 }} onClick={(event) => event.stopPropagation()} className="h-full w-[280px] border-r border-white/10 bg-[#060913] p-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{meta.label}</span><button onClick={() => setMobileNav(false)}><X size={18} /></button></div><div className="mt-6 space-y-2">{meta.nav.map(([label, Icon]) => <div key={label} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400"><Icon size={16} />{label}</div>)}</div></motion.aside></motion.div> : null}</AnimatePresence>

        <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-8 lg:py-8">
          <aside className="hidden lg:block"><div className="sticky top-24 rounded-3xl border border-white/10 bg-white/[0.035] p-3 backdrop-blur-xl"><div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-600">Navigation</div>{meta.nav.map(([label, Icon], index) => <div key={label} className={`mb-1 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm ${index === 0 ? "bg-white/10 text-white" : "text-slate-500"}`}><Icon size={16} />{label}{index === 0 ? <span className="ml-auto size-1.5 rounded-full bg-white" /> : null}</div>)}<div className="mt-4 border-t border-white/10 pt-4"><div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] p-4"><div className="flex items-center gap-2 text-sm font-semibold"><Sparkles size={15} className="text-violet-300" /> {meta.tagline}</div><p className="mt-2 text-xs leading-5 text-slate-600">Your role controls the tools and insights shown here.</p></div></div></div></aside>

          <section className="min-w-0">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.26em] text-slate-500"><span className={`h-px w-6 bg-gradient-to-r ${meta.accent}`} /> {meta.label} hub</div><h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Welcome back, <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{firstName}</span>.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{meta.tagline} CodeGrowth adapts your workspace to how you contribute.</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-right backdrop-blur-xl"><div className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Today</div><div className="mt-1 text-sm font-medium">Monday • Aug 17</div></div></div></motion.div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, note, icon: Icon }, index) => <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -3 }} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl"><div className="flex items-center justify-between"><span className="text-xs text-slate-500">{label}</span><Icon size={16} className="text-slate-600" /></div><div className="mt-3 text-2xl font-semibold">{value}</div><div className="mt-1 text-[11px] text-slate-600">{note}</div></motion.div>)}</div>

            <div className="mt-6">{role === "STUDENT" ? <StudentContent history={history} onGenerate={generate} generating={generating} /> : role === "TEACHER" ? <TeacherContent /> : <AdminContent />}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
