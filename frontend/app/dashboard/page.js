"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function rolePath(role) {
  const value = (role || "STUDENT").toUpperCase();
  return value === "ADMIN" ? "/admin" : value === "TEACHER" ? "/teacher" : "/student";
}

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("codegrowth_token");
    const rawUser = localStorage.getItem("codegrowth_user");
    if (!token || !rawUser) {
      router.replace("/login");
      return;
    }

    try {
      router.replace(rolePath(JSON.parse(rawUser).role));
    } catch {
      localStorage.removeItem("codegrowth_token");
      localStorage.removeItem("codegrowth_user");
      router.replace("/login");
    }
  }, [router]);

  return <main className="grid min-h-screen place-items-center bg-[#04070f] text-sm text-slate-500">Loading your workspace…</main>;
}
