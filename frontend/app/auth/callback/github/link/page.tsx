"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GitHubLinkCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("No authorization code received from GitHub.");
      return;
    }

    async function handleLink() {
      try {
        const token = localStorage.getItem("codegrowth_token");
        if (!token) {
          setError("You must be logged in first. Redirecting...");
          setTimeout(() => router.push("/login"), 2000);
          return;
        }

        const response = await fetch("/api/backend/api/github/link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || data.message || "GitHub linking failed");

        // Update local storage to reflect GitHub connection
        const userStr = localStorage.getItem("codegrowth_user");
        if (userStr) {
          const user = JSON.parse(userStr);
          user.githubConnected = true;
          localStorage.setItem("codegrowth_user", JSON.stringify(user));
        }

        // Navigate to repositories page
        router.push("/student/repositories");
      } catch (err) {
        setError(err.message || "GitHub linking failed");
      }
    }

    handleLink();
  }, [searchParams, router]);

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#04070f] text-slate-100">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <a href="/student/repositories" className="text-indigo-300 underline">Back to repositories</a>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#04070f] text-slate-100">
      <div className="text-center space-y-3">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" />
        <p className="text-sm text-slate-400">Linking your GitHub account…</p>
      </div>
    </main>
  );
}

export default function GitHubLinkCallbackPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#04070f] text-slate-100"><p className="text-sm text-slate-400">Loading…</p></main>}>
      <GitHubLinkCallbackInner />
    </Suspense>
  );
}
