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
      role="switch"
      aria-checked={isDark}
      onClick={() => setIsDark(!isDark)}
      className={cn(
        "relative h-[22px] w-[40px] cursor-pointer rounded-full transition-colors duration-200 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isDark 
          ? "bg-primary" 
          : "bg-muted-foreground/30"
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className={cn(
          "pointer-events-none absolute top-[2px] left-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out",
          isDark ? "translate-x-[18px]" : "translate-x-0"
        )}
      />
    </button>
  );
}
