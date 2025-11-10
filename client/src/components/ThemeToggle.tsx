import { useState, useEffect } from "react";

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center justify-center text-2xl shadow-lg"
      aria-label="Toggle theme"
    >
      {isDark ? "⚪" : "⚫"}
    </button>
  );
};
