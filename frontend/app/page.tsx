"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowRight, Code2, GitBranch, Shield, Sparkles, BarChart3, Target,
  FileSearch, Zap, Brain, TrendingUp, GraduationCap, Users, ChevronRight
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

function rolePath(role: string) {
  const value = (role || "STUDENT").toUpperCase();
  return value === "ADMIN" ? "/admin" : value === "TEACHER" ? "/teacher" : "/student";
}

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

function FeatureCard({ icon: Icon, title, description, gradient }: { icon: any, title: string, description: string, gradient: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/50 p-7 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-white hover:shadow-xl hover:shadow-indigo-900/5 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.12] dark:hover:bg-white/[0.04] dark:hover:shadow-indigo-950/20"
    >
      <div className={`inline-flex rounded-xl p-2.5 ${gradient}`}>
        <Icon size={20} className="text-white" />
      </div>
      <h3 className="mt-5 text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
      <div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-indigo-500/50 to-cyan-500/50 transition-all duration-500 group-hover:w-full" />
    </motion.div>
  );
}

function StepCard({ number, title, description }: { number: number, title: string, description: string }) {
  return (
    <motion.div variants={fadeUp} className="relative flex gap-5">
      <div className="flex flex-col items-center">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md">{number}</div>
        {number < 4 && <div className="mt-2 h-full w-px bg-gradient-to-b from-indigo-500/30 to-transparent" />}
      </div>
      <div className="pb-10">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
      </div>
    </motion.div>
  );
}

function StatBadge({ value, label }: { value: string, label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-300">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("codegrowth_token");
    const user = localStorage.getItem("codegrowth_user");
    if (token && user) {
      setIsLoggedIn(true);
    }
  }, []);

  function goToDashboard() {
    try {
      const rawUser = localStorage.getItem("codegrowth_user");
      const user = rawUser ? JSON.parse(rawUser) : null;
      router.push(rolePath(user?.role));
    } catch {
      router.push("/login");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#04070f] dark:text-slate-100">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-500/[0.05] via-violet-500/[0.03] to-transparent blur-3xl dark:from-indigo-600/[0.07] dark:via-violet-600/[0.04]" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.03] blur-3xl dark:bg-cyan-600/[0.04]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 ring-1 ring-slate-200 dark:from-indigo-500/20 dark:to-violet-500/20 dark:ring-white/10">
            <Code2 size={17} className="text-indigo-600 dark:text-cyan-300" />
          </div>
          <span className="text-sm font-semibold tracking-tight">CodeGrowth AI</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {isLoggedIn ? (
            <button onClick={goToDashboard} className="flex items-center gap-2 rounded-xl bg-slate-200/50 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.14]">
              Dashboard <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <Link href="/login" className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Sign in</Link>
              <Link href="/register" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110">
                Get Started <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-10 lg:pt-24">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-700 backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:text-indigo-200">
            <Sparkles size={13} className="text-indigo-500 dark:text-indigo-400" />
            AI-powered developer growth platform
          </motion.div>
          <motion.h1 variants={fadeUp} className="mx-auto mt-8 max-w-4xl text-5xl font-bold leading-[1.08] tracking-[-0.03em] lg:text-7xl">
            Turn every commit into a
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-cyan-300"> growth milestone</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 lg:text-lg dark:text-slate-400">
            CodeGrowth AI analyzes your repositories, evaluates your code, identifies weaknesses, and builds a personalized roadmap to make you a measurably better developer.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110">
              Start Growing <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
            </Link>
            <Link href="/login" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-medium transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]">
              Sign in
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mx-auto mt-20 flex max-w-2xl items-center justify-around rounded-2xl border border-slate-200 bg-white/60 px-8 py-6 shadow-xl shadow-slate-200/50 backdrop-blur dark:border-white/[0.06] dark:bg-white/[0.02] dark:shadow-none"
        >
          <StatBadge value="6" label="Analysis Dimensions" />
          <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
          <StatBadge value="3" label="Agent System" />
          <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
          <StatBadge value="∞" label="Growth Potential" />
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <span className="text-xs font-semibold uppercase tracking-[.25em] text-indigo-300">How it works</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight lg:text-4xl">Four steps to continuous improvement</h2>
          </motion.div>
          <div className="mx-auto max-w-xl">
            <StepCard number={1} title="Connect your repository" description="Link any GitHub repository. CodeGrowth scans the file tree, language distribution, and architecture." />
            <StepCard number={2} title="AI-powered analysis" description="Three specialized agents evaluate your code: deterministic evidence checks, code quality metrics, and LLM-powered insights." />
            <StepCard number={3} title="Understand your weaknesses" description="Get clear findings across security, complexity, testing, documentation, and correctness — with evidence and file-level context." />
            <StepCard number={4} title="Track your growth" description="Re-analyze after improvements. Watch your scores rise. Build an evidence-based development track record." />
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <span className="text-xs font-semibold uppercase tracking-[.25em] text-cyan-300">Capabilities</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight lg:text-4xl">Everything you need to grow</h2>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={FileSearch} title="Repository Intelligence" description="Deep scan of your GitHub repos — file structure, language breakdown, architecture patterns, and dependency analysis." gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" />
            <FeatureCard icon={Brain} title="Multi-Agent Analysis" description="Three AI agents work together: deterministic evidence validation, code quality analysis, and LLM-assisted evaluation." gradient="bg-gradient-to-br from-violet-500 to-violet-700" />
            <FeatureCard icon={Shield} title="Security Analysis" description="Detect hardcoded secrets, insecure patterns, missing validation, and vulnerability indicators in your codebase." gradient="bg-gradient-to-br from-rose-500 to-rose-700" />
            <FeatureCard icon={BarChart3} title="Quality Metrics" description="Complexity scoring, code quality ratings, testing coverage analysis, and documentation completeness checks." gradient="bg-gradient-to-br from-cyan-500 to-cyan-700" />
            <FeatureCard icon={Target} title="Assignment Evaluation" description="Teachers create assignments with requirements. AI evaluates student submissions against each requirement with evidence." gradient="bg-gradient-to-br from-amber-500 to-amber-700" />
            <FeatureCard icon={TrendingUp} title="Growth Tracking" description="Track your progress over time. See what improved, what regressed, and get personalized recommendations for your next focus." gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" />
          </div>
        </motion.div>
      </section>

      {/* Role Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <span className="text-xs font-semibold uppercase tracking-[.25em] text-violet-300">Built for everyone</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight lg:text-4xl">One platform, three experiences</h2>
          </motion.div>
          <div className="grid gap-5 md:grid-cols-3">
            <motion.div variants={fadeUp} className="rounded-2xl border border-slate-200 bg-gradient-to-b from-violet-50 to-transparent p-8 dark:border-white/[0.06] dark:from-violet-500/[0.06]">
              <GraduationCap size={24} className="text-violet-500 dark:text-violet-300" />
              <h3 className="mt-5 text-lg font-semibold">Students</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Analyze your projects, understand weaknesses, track improvement, and build real evidence of your growth as a developer.</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-violet-400" /> Personal growth dashboard</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-violet-400" /> AI code analysis</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-violet-400" /> Learning roadmap</li>
              </ul>
            </motion.div>
            <motion.div variants={fadeUp} className="rounded-2xl border border-slate-200 bg-gradient-to-b from-cyan-50 to-transparent p-8 dark:border-white/[0.06] dark:from-cyan-500/[0.06]">
              <Users size={24} className="text-cyan-500 dark:text-cyan-300" />
              <h3 className="mt-5 text-lg font-semibold">Educators</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Create assignments with specific requirements. AI evaluates every submission automatically, freeing you to focus on teaching.</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-cyan-400" /> Automated evaluation</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-cyan-400" /> Class analytics</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-cyan-400" /> Submission tracking</li>
              </ul>
            </motion.div>
            <motion.div variants={fadeUp} className="rounded-2xl border border-slate-200 bg-gradient-to-b from-amber-50 to-transparent p-8 dark:border-white/[0.06] dark:from-amber-500/[0.06]">
              <Shield size={24} className="text-amber-500 dark:text-amber-300" />
              <h3 className="mt-5 text-lg font-semibold">Administrators</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Monitor platform health, manage users, track adoption metrics, and ensure the system runs smoothly for everyone.</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-amber-400" /> Platform monitoring</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-amber-400" /> User management</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-amber-400" /> System health</li>
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Technology Trust */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center">
          <motion.div variants={fadeUp}>
            <span className="text-xs font-semibold uppercase tracking-[.25em] text-slate-500">Powered by</span>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
              <span className="flex items-center gap-2"><Zap size={15} className="text-cyan-400" /> FastAPI</span>
              <span className="flex items-center gap-2"><Code2 size={15} className="text-indigo-400" /> Next.js 15</span>
              <span className="flex items-center gap-2"><GitBranch size={15} className="text-violet-400" /> GitHub API</span>
              <span className="flex items-center gap-2"><Brain size={15} className="text-rose-400" /> Ollama AI</span>
              <span className="flex items-center gap-2"><Shield size={15} className="text-emerald-400" /> Spring Security</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-violet-50 to-cyan-50 p-12 text-center shadow-xl shadow-slate-200/50 dark:border-white/[0.06] dark:from-indigo-500/[0.08] dark:via-violet-500/[0.05] dark:to-cyan-500/[0.08] dark:shadow-none lg:p-16"
        >
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">Ready to measure your growth?</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-400">Stop guessing. Start growing. Connect a repository and get your first analysis in minutes.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3.5 text-sm font-semibold shadow-lg shadow-indigo-500/25 transition hover:shadow-xl hover:brightness-110">
              Create Free Account <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 py-10 dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Code2 size={15} className="text-indigo-500 dark:text-cyan-400" />
            CodeGrowth AI
          </div>
          <div className="text-xs text-slate-600">© {new Date().getFullYear()} CodeGrowth AI. Built for developers who never stop learning.</div>
        </div>
      </footer>
    </main>
  );
}
