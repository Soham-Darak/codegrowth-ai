"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(localStorage.getItem("codegrowth_token") ? "/dashboard" : "/login");
  }, [router]);

  return <main className="grid min-h-screen place-items-center text-sm text-slate-500">Loading CodeGrowth AI…</main>;
}
