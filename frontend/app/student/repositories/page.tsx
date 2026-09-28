"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/workspace/AppShell";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { Layers, Loader2, GitMerge, AlertCircle, CheckCircle2, RefreshCw, Github } from "lucide-react";

export default function Repositories() {
    const [repos, setRepos] = useState<any[]>([]);
    const [githubRepos, setGithubRepos] = useState<any[]>([]);
    const [githubStatus, setGithubStatus] = useState({ connected: false, linkUrl: "" });
    const [loading, setLoading] = useState(true);
    const [loadingGithub, setLoadingGithub] = useState(true);
    const [form, setForm] = useState({ repositoryUrl: "", branch: "main", name: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRepos();
        checkGithubStatus();
    }, []);

    async function checkGithubStatus() {
        try {
            const status = await apiGet("/api/github/status");
            setGithubStatus(status);
            if (status.connected) {
                fetchGithubRepos();
            } else {
                setLoadingGithub(false);
            }
        } catch (e: any) {
            console.log("Could not check GitHub status");
            setLoadingGithub(false);
        }
    }

    async function fetchGithubRepos() {
        try {
            const data = await apiGet("/api/github/my-repos");
            if (Array.isArray(data)) setGithubRepos(data);
        } catch (e: any) {
            console.log("Not logged in with GitHub or no token");
        } finally {
            setLoadingGithub(false);
        }
    }

    async function fetchRepos() {
        try {
            const data = await apiGet("/api/student/repositories");
            setRepos(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function onSubmit(e) {
        e.preventDefault();
        if (!form.repositoryUrl) return setError("Repository URL is required");
        setIsSubmitting(true);
        setError("");
        try {
            await apiPost("/api/student/repositories", form);
            setForm({ repositoryUrl: "", branch: "main", name: "" });
            fetchRepos();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function deleteRepo(id: any) {
        try {
            await apiDelete(`/api/student/repositories/${id}`);
            fetchRepos();
        } catch (err) {
            alert(err.message);
        }
    }

    return (
        <AppShell role="STUDENT" title="See Your Repos" subtitle="Browse your GitHub repositories, connect them, and track your code growth metrics.">
            {/* GitHub Connection Banner */}
            {!loadingGithub && !githubStatus.connected && (
                <div className="mb-6 flex items-center justify-between rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 p-5 dark:border-indigo-400/20 dark:from-indigo-500/10 dark:to-violet-500/10">
                    <div className="flex items-center gap-4">
                        <div className="grid size-12 place-items-center rounded-xl bg-[#24292e] text-white">
                            <Github className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Connect your GitHub account</h3>
                            <p className="mt-0.5 text-xs text-slate-500">Link GitHub to browse and connect your repositories instantly.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (githubStatus.linkUrl) window.location.href = githubStatus.linkUrl;
                        }}
                        className="flex items-center gap-2 rounded-xl bg-[#24292e] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#1a1f25]"
                    >
                        <Github className="h-4 w-4" />
                        Connect GitHub
                    </button>
                </div>
            )}

            {!loadingGithub && githubStatus.connected && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 dark:border-emerald-400/20 dark:bg-emerald-500/10">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">GitHub connected — select from your repos below or enter a URL manually.</span>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                <div>
                    <div className="rounded-2xl border bg-white p-5 dark:border-white/10 dark:bg-white/[0.035]">
                        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Layers className="h-4 w-4" /> Connect Repository
                        </h2>

                        {githubStatus.connected && githubRepos.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                <label className="block text-xs font-medium text-slate-500">Select your GitHub Repository</label>
                                <div className="max-h-64 overflow-y-auto rounded-xl border dark:border-white/10">
                                    {githubRepos.map(r => (
                                        <button 
                                            key={r.id}
                                            onClick={() => {
                                                setForm({ repositoryUrl: r.html_url, branch: r.default_branch || "main", name: r.name });
                                            }}
                                            className="w-full border-b p-3 text-left last:border-0 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                                        >
                                            <div className="font-medium text-sm text-slate-900 dark:text-white">{r.name}</div>
                                            <div className="text-xs text-slate-500">{r.full_name}</div>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-2 text-xs text-slate-400">Or manually enter below:</div>
                            </div>
                        ) : githubStatus.connected && loadingGithub ? (
                            <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-white/5">
                                <Loader2 className="h-3 w-3 animate-spin" /> Loading your GitHub repos…
                            </div>
                        ) : !githubStatus.connected ? (
                            <div className="mb-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-500 dark:bg-white/5 flex flex-col gap-3 items-start">
                                <p>Connect your GitHub account above to browse and select repos easily.</p>
                            </div>
                        ) : null}

                        <form onSubmit={onSubmit} className="flex flex-col gap-3 mt-2">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500">Repository Name</label>
                                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-xl border p-2.5 text-sm dark:border-white/10 dark:bg-[#071018]" placeholder="e.g. Portfolio Website" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500">Repository URL</label>
                                <input value={form.repositoryUrl} onChange={e => setForm({...form, repositoryUrl: e.target.value})} className="w-full rounded-xl border p-2.5 text-sm dark:border-white/10 dark:bg-[#071018]" placeholder="https://github.com/user/repo" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500">Branch</label>
                                <input value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} className="w-full rounded-xl border p-2.5 text-sm dark:border-white/10 dark:bg-[#071018]" placeholder="main" />
                            </div>
                            {error && <div className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</div>}
                            <button disabled={isSubmitting} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect & Analyze"}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {loading ? (
                        <div className="flex h-32 items-center justify-center text-slate-400">Loading repositories...</div>
                    ) : repos.length === 0 ? (
                        <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed bg-slate-50/50 p-6 text-center dark:border-white/10 dark:bg-white/[0.02]">
                            <Layers className="mb-3 h-8 w-8 text-slate-300" />
                            <h3 className="text-sm font-medium text-slate-900 dark:text-white">No repositories connected</h3>
                            <p className="mt-1 text-sm text-slate-500">Connect a GitHub repository to get automated code quality analysis.</p>
                        </div>
                    ) : (
                        repos.map(repo => (
                            <RepositoryCard key={repo.id} repo={repo} onDelete={() => deleteRepo(repo.id)} onRefresh={fetchRepos} />
                        ))
                    )}
                </div>
            </div>
        </AppShell>
    );
}

function RepositoryCard({ repo, onDelete, onRefresh }) {
    let analysis = null;
    if (repo.latestAnalysisJson) {
        try {
            analysis = JSON.parse(repo.latestAnalysisJson);
            // In case the AI Engine wrapped it in {"status":"...","result":{...}}
            if (analysis.result) analysis = analysis.result;
        } catch (e: any) {}
    }

    return (
        <div className="rounded-2xl border bg-white p-5 dark:border-white/10 dark:bg-white/[0.035]">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{repo.name}</h3>
                    <a href={repo.repositoryUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                        {repo.repositoryUrl}
                    </a>
                </div>
                <div className="flex items-center gap-3">
                    {repo.lastAnalysisStatus === "PENDING" && <span className="flex items-center gap-1 text-xs font-medium text-amber-600"><RefreshCw className="h-3 w-3 animate-spin" /> Analyzing</span>}
                    {repo.lastAnalysisStatus === "COMPLETED" && <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 className="h-3 w-3" /> Analyzed</span>}
                    {repo.lastAnalysisStatus === "FAILED" && <span className="flex items-center gap-1 text-xs font-medium text-red-600"><AlertCircle className="h-3 w-3" /> Failed</span>}
                    <button onClick={onRefresh} className="text-slate-400 hover:text-slate-600" title="Refresh"><RefreshCw className="h-4 w-4" /></button>
                    <button onClick={onDelete} className="text-sm text-red-600 hover:underline">Remove</button>
                </div>
            </div>

            {analysis && analysis.analysis && (
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <MetricCard title="Overall Score" value={`${analysis.analysis.overall_score || 0}/100`} />
                    <MetricCard title="Code Quality" value={`${analysis.analysis.quality_score || 0}/100`} />
                    <MetricCard title="Complexity" value={analysis.analysis.complexity_rating || "Unknown"} />
                    <MetricCard title="Security" value={analysis.analysis.security_rating || "Unknown"} />
                    <MetricCard title="Maintainability" value={analysis.analysis.maintainability_rating || "Unknown"} />
                    <MetricCard title="Key Languages" value={analysis.repository?.primary_language || "Mixed"} />
                </div>
            )}
            
            {analysis && analysis.analysis?.recommendations && analysis.analysis.recommendations.length > 0 && (
                <div className="mt-6 border-t pt-4 dark:border-white/10">
                    <h4 className="mb-3 text-sm font-medium text-slate-900 dark:text-white">Growth Recommendations</h4>
                    <ul className="flex flex-col gap-2">
                        {analysis.analysis.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <GitMerge className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function MetricCard({ title, value }) {
    return (
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.02]">
            <p className="text-xs text-slate-500">{title}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
        </div>
    );
}
