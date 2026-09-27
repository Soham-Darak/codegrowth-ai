"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function rolePath(role) {
  const value = (role || "STUDENT").toUpperCase();
  return value === "ADMIN" ? "/admin" : value === "TEACHER" ? "/teacher" : "/student";
}

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("codegrowth_token");
    const user = localStorage.getItem("codegrowth_user");
    if (!token || !user) return router.replace("/login");
    try { router.replace(rolePath(JSON.parse(user).role)); }
    catch { localStorage.removeItem("codegrowth_token"); localStorage.removeItem("codegrowth_user"); router.replace("/login"); }
  }, [router]);
  return <main className="grid min-h-screen place-items-center bg-[#f6f8fc] text-sm text-slate-500 dark:bg-[#071018]">Opening your workspace…</main>;
}
