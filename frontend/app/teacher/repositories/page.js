"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/workspace/AppShell";
import { apiGet } from "@/lib/api";
import { Layers, Search, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, Code2 } from "lucide-react";

export default function TeacherReposPage() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadRepos = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/teacher/all-repos");
      setRepos(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch repositories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepos();
  }, []);

  const filteredRepos = repos.filter(repo => {
    const s = search.toLowerCase();
    const studentName = repo.student?.name?.toLowerCase() || "";
    const studentEmail = repo.student?.email?.toLowerCase() || "";
    const repoName = repo.name?.toLowerCase() || "";
    const repoUrl = repo.repositoryUrl?.toLowerCase() || "";
    return studentName.includes(s) || studentEmail.includes(s) || repoName.includes(s) || repoUrl.includes(s);
  });

  return (
    <AppShell
      role="TEACHER"
      title="Student Repositories"
      subtitle="View, monitor and review all GitHub repositories connected by students across your courses"
    >
      {/* Header Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name, email, or repo..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-[#071018]"
          />
        </div>

        <button
          onClick={loadRepos}
          disabled={loading}
          className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-400">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading all student repositories...
        </div>
      ) : filteredRepos.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-white/10 dark:bg-white/[0.01]">
          <Layers className="mb-3 h-10 w-10 text-slate-300" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {search ? "No matching repositories found" : "No student repositories connected yet"}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {search
              ? "Try adjusting your search terms."
              : "When students connect their GitHub repositories, they will appear here for automated assessment."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredRepos.map(repo => {
            let analysis = null;
            if (repo.latestAnalysisJson) {
              try {
                analysis = JSON.parse(repo.latestAnalysisJson);
                if (analysis.result) analysis = analysis.result;
              } catch (e) {}
            }

            const overallScore = analysis?.analysis?.overall_score;
            const qualityScore = analysis?.analysis?.quality_score;

            return (
              <div
                key={repo.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-white/[0.035]"
              >
                <div>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-900 dark:text-white">{repo.name}</h3>
                      <p className="truncate text-xs text-slate-500">{repo.repositoryUrl}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {repo.branch || "main"}
                    </span>
                  </div>

                  {/* Student Info */}
                  <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-slate-50 p-3 dark:bg-white/[0.02]">
                    <div className="grid size-8 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                      {repo.student?.name?.charAt(0).toUpperCase() || "S"}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                        {repo.student?.name || "Student"}
                      </div>
                      <div className="truncate text-[10px] text-slate-500">
                        {repo.student?.email || "No email"}
                      </div>
                    </div>
                  </div>

                  {/* Analysis Scores if available */}
                  {overallScore !== undefined ? (
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 text-center dark:border-white/5 dark:bg-white/[0.02]">
                        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Overall Score</div>
                        <div className="mt-0.5 text-base font-bold text-indigo-600 dark:text-indigo-400">
                          {overallScore}/100
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 text-center dark:border-white/5 dark:bg-white/[0.02]">
                        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Code Quality</div>
                        <div className="mt-0.5 text-base font-bold text-emerald-600 dark:text-emerald-400">
                          {qualityScore || 0}/100
                        </div>
                      </div>
                    </div>
                  ) : repo.lastAnalysisStatus === "PENDING" ? (
                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                      <RefreshCw size={12} className="animate-spin" /> AI Analysis in progress...
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/10">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Code2 size={13} />
                    <span>{repo.lastAnalysisStatus || "READY"}</span>
                  </div>
                  <a
                    href={repo.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    View Source <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
