import { cn } from "@/lib/utils";

export function Button({ className, variant = "primary", size = "default", ...props }) {
  const variants = {
    primary: "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400",
    secondary: "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
    ghost: "text-slate-300 hover:bg-white/[0.06] hover:text-white",
    danger: "border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15",
  };

  const sizes = {
    default: "h-10 px-4",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-5",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-400/40",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
