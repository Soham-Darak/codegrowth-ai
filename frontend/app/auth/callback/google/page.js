"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("No authorization code received from Google.");
      return;
    }

    async function handleCallback() {
      try {
        const response = await fetch("/api/backend/api/auth/oauth/google/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        if (!response.ok) throw new Error(data.message || data.error || "Google login failed");

        const user = { userId: data.userId, name: data.name, email: data.email, role: data.role || "STUDENT" };
        localStorage.setItem("codegrowth_token", data.token);
        localStorage.setItem("codegrowth_user", JSON.stringify(user));

        const rolePath = user.role === "ADMIN" ? "/admin" : user.role === "TEACHER" ? "/teacher" : "/student";
        router.push(rolePath);
      } catch (err) {
        setError(err.message || "Authentication failed");
      }
    }

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#04070f] text-slate-100">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <a href="/login" className="text-indigo-300 underline">Back to login</a>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#04070f] text-slate-100">
      <div className="text-center space-y-3">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" />
        <p className="text-sm text-slate-400">Completing Google sign-in…</p>
      </div>
    </main>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#04070f] text-slate-100"><p className="text-sm text-slate-400">Loading…</p></main>}>
      <GoogleCallbackInner />
    </Suspense>
  );
}
