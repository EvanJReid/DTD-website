import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      setIsDark(true);
    } else if (stored === "light") {
      setIsDark(false);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDark(true);
    }
  }, []);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className={cn(
        "relative flex h-7 w-[52px] items-center rounded-full border border-border bg-muted p-0.5 transition-colors",
        "hover:border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className={cn(
          "absolute h-6 w-6 rounded-full bg-background shadow-sm transition-transform duration-200 ease-out",
          isDark ? "translate-x-[24px]" : "translate-x-0"
        )}
      />
      <span className="relative z-10 flex w-full justify-between px-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        <span className={cn(isDark && "opacity-50")}>Lt</span>
        <span className={cn(!isDark && "opacity-50")}>Dk</span>
      </span>
    </button>
  );
}
