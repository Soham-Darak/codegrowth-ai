"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/workspace/AppShell";
import { apiGet, apiPut } from "@/lib/api";
import { Github, CheckCircle2, AlertCircle, Save, Loader2 } from "lucide-react";

export default function StudentProfile() {
  const [form, setForm] = useState({
    university: "",
    branch: "",
    academicYear: "",
    targetRole: "",
    bio: "",
  });
  const [githubStatus, setGithubStatus] = useState({ connected: false, linkUrl: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [profile, gh] = await Promise.all([
          apiGet("/api/student/profile").catch(() => ({})),
          apiGet("/api/github/status").catch(() => ({ connected: false, linkUrl: "" })),
        ]);
        if (profile) {
          setForm({
            university: profile.university || "",
            branch: profile.branch || "",
            academicYear: profile.academicYear || "",
            targetRole: profile.targetRole || "",
            bio: profile.bio || "",
          });
        }
        if (gh) setGithubStatus(gh);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiPut("/api/student/profile", form);
      setSuccess("Profile saved successfully.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell
      role="STUDENT"
      title="Profile & Settings"
      subtitle="Keep your academic background, career goals, and integrations current."
    >
      <div className="max-w-4xl space-y-6">
        {/* GitHub Integration Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.035]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="grid size-12 place-items-center rounded-2xl bg-[#24292e] text-white">
                <Github size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">GitHub Account</h3>
                  {githubStatus.connected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                      <CheckCircle2 size={12} /> Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-400">
                      Not Connected
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {githubStatus.connected
                    ? "Your GitHub account is connected. You can select and analyze your repositories anytime."
                    : "Link your GitHub account to import repositories and view automated code quality insights."}
                </p>
              </div>
            </div>

            {!githubStatus.connected && githubStatus.linkUrl && (
              <button
                type="button"
                onClick={() => { window.location.href = githubStatus.linkUrl; }}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#24292e] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1b1f23]"
              >
                <Github size={15} />
                Connect GitHub
              </button>
            )}

            {githubStatus.connected && (
              <a
                href="/student/repositories"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                See Your Repos &rarr;
              </a>
            )}
          </div>
        </div>

        {/* Academic Profile Form */}
        <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.035]">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Academic & Career Details</h3>
          <p className="mt-1 text-xs text-slate-500">This helps tailor AI recommendations and mentor explanations to your level.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">University / College</label>
              <input
                value={form.university}
                onChange={e => setForm({ ...form, university: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-[#071018]"
                placeholder="e.g. Stanford University"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Branch / Major</label>
              <input
                value={form.branch}
                onChange={e => setForm({ ...form, branch: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-[#071018]"
                placeholder="e.g. Computer Science & Engineering"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Academic Year</label>
              <input
                value={form.academicYear}
                onChange={e => setForm({ ...form, academicYear: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-[#071018]"
                placeholder="e.g. 3rd Year"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Target Role</label>
              <input
                value={form.targetRole}
                onChange={e => setForm({ ...form, targetRole: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-[#071018]"
                placeholder="e.g. Full-Stack Software Engineer"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Bio & Goals</label>
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              className="min-h-32 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-[#071018]"
              placeholder="Tell us about your interests, programming experience, and what you aim to achieve."
            />
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {success && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 size={15} /> {success}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
