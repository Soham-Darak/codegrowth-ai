"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-9 w-9 rounded-full border border-white/10" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative grid size-9 place-items-center rounded-full border border-slate-200 bg-white/50 text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : -90, scale: theme === "dark" ? 1 : 0 }}
        className="absolute"
      >
        <Moon size={16} />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: theme === "light" ? 0 : 90, scale: theme === "light" ? 1 : 0 }}
        className="absolute"
      >
        <Sun size={16} />
      </motion.div>
    </button>
  );
}
