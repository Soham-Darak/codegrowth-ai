"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Bot, CheckCircle2, ClipboardList, History, Target, Users, Wrench } from "lucide-react";
import { apiGet, handleAuthError } from "@/lib/api";
import AppShell from "@/components/workspace/AppShell";

const ROLE_INFO = {
  STUDENT: { title: "Your learning dashboard", subtitle: "See what needs your attention and keep your learning moving." },
  TEACHER: { title: "Your teaching dashboard", subtitle: "Manage classes, assignments and learner progress from one place." },
  ADMIN: { title: "Platform control center", subtitle: "Monitor users, learning activity and platform services." },
};

function Stat({ label, value, icon: Icon }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.035]"><div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-500">{label}</span><Icon size={17} className="text-slate-400" /></div><div className="mt-3 text-3xl font-semibold tracking-tight">{value ?? 0}</div></div>;
}

function QuickLink({ href, icon: Icon, title, description }) {
  return <Link href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-white/20"><div className="flex items-start justify-between"><div className="grid size-10 place-items-center rounded-xl bg-slate-100 dark:bg-white/[0.05]"><Icon size={18} /></div><ArrowRight size={16} className="text-slate-400 transition group-hover:translate-x-1" /></div><div className="mt-4 text-sm font-semibold">{title}</div><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></Link>;
}

export default function RoleDashboard({ role }) {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const endpoint = role === "STUDENT" ? "/api/student/overview" : role === "TEACHER" ? "/api/teacher/overview" : "/api/admin/overview";
        const result = await apiGet(endpoint);
        if (role === "STUDENT") {
          const [historyData, goalsData] = await Promise.all([apiGet("/api/ai/history"), apiGet("/api/student/goals")]);
          if (active) { setHistory(historyData || []); setGoals(goalsData || []); }
        }
        if (active) setData(result);
      } catch (e) {
        if (!handleAuthError(e, window.next?.router)) setError(e.message);
      } finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [role]);

  const info = ROLE_INFO[role];
  const stats = role === "STUDENT"
    ? [["Courses enrolled", data?.courses, BookOpen], ["Assignments", data?.assignments, ClipboardList], ["Submissions", data?.submissions, CheckCircle2], ["Learning goals", data?.goals, Target]]
    : role === "TEACHER"
      ? [["My courses", data?.courses, BookOpen], ["Students", data?.students, Users], ["Assignments", data?.assignments, ClipboardList], ["Submissions", data?.submissions, CheckCircle2]]
      : [["Users", data?.users, Users], ["Courses", data?.courses, BookOpen], ["Assignments", data?.assignments, ClipboardList], ["AI generations", data?.aiGenerations, Bot]];

  return <AppShell role={role} title={info.title} subtitle={info.subtitle}>
    {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/15 dark:bg-red-500/5 dark:text-red-300">{error}</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value, Icon]) => <Stat key={label} label={label} value={loading ? "…" : value} icon={Icon} />)}</div>

    {role === "STUDENT" && <>
      <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.035]"><div className="flex items-center justify-between"><div><h2 className="text-base font-semibold">Recent AI learning</h2><p className="mt-1 text-xs text-slate-500">Your prompts and explanations saved to PostgreSQL.</p></div><Link href="/student/history" className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-300">View all</Link></div><div className="mt-5 space-y-3">{history.slice(0, 4).map((item) => <Link href={`/student/history?id=${item.id}`} key={item.id} className="block rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/[0.03]"><div className="flex justify-between gap-3"><span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.prompt}</span><span className="shrink-0 text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span></div></Link>)}{!loading && history.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500 dark:border-white/10">No AI sessions yet. Start with the AI mentor.</div>}</div></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.035]"><h2 className="text-base font-semibold">Learning goals</h2><p className="mt-1 text-xs text-slate-500">Targets you have saved for yourself.</p><div className="mt-5 space-y-3">{goals.slice(0, 4).map((goal) => <Link href="/student/goals" key={goal.id} className="block rounded-xl border border-slate-200 p-4 dark:border-white/10"><div className="flex justify-between gap-3 text-sm"><span>{goal.title}</span><span className="text-xs text-slate-500">{goal.progress ?? 0}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${Math.min(100, Math.max(0, goal.progress ?? 0))}%` }} /></div></Link>)}{!loading && goals.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500 dark:border-white/10">No goals yet. Add one from Goals.</div>}</div></section>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-4"><QuickLink href="/student/ai" icon={Bot} title="AI Mentor" description="Learn, debug or practice with the local coding model." /><QuickLink href="/student/courses" icon={BookOpen} title="Courses" description="Browse courses and enroll in the ones you need." /><QuickLink href="/student/assignments" icon={ClipboardList} title="Assignments" description="See work due and submit your answers." /><QuickLink href="/student/profile" icon={Target} title="Profile" description="Keep your academic and career goals current." /></div>
    </>}

    {role === "TEACHER" && <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4"><QuickLink href="/teacher/classes" icon={Users} title="My Classes" description="Create courses, view rosters and manage your classroom." /><QuickLink href="/teacher/assignments" icon={ClipboardList} title="Assignments" description="Create work, review submissions and grade learners." /><QuickLink href="/teacher/announcements" icon={CheckCircle2} title="Announcements" description="Publish updates to your courses." /><QuickLink href="/teacher/ai" icon={Bot} title="AI Tools" description="Generate teaching material and feedback with AI." /></div>}

    {role === "ADMIN" && <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4"><QuickLink href="/admin/users" icon={Users} title="Users" description="Manage roles and account status from the database." /><QuickLink href="/admin/courses" icon={BookOpen} title="Courses" description="Inspect the course catalog created by teachers." /><QuickLink href="/admin/analytics" icon={Target} title="Analytics" description="See real platform totals and adoption metrics." /><QuickLink href="/admin/system" icon={Wrench} title="System" description="Check backend, PostgreSQL, Redis and AI health." /></div>}
  </AppShell>;
}
