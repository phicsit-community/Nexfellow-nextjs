"use client";

import { useState, useEffect, createContext, useContext } from "react";

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  // Use null initially to indicate "not yet loaded from localStorage"
  const [theme, setTheme] = useState("light");
  const [effectiveTheme, setEffectiveTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  // On mount, read from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const newEffectiveTheme = media.matches ? "dark" : "light";
      setEffectiveTheme(newEffectiveTheme);
      root.classList.add(newEffectiveTheme);

      const handler = (e) => {
        const newTheme = e.matches ? "dark" : "light";
        setEffectiveTheme(newTheme);
        root.classList.remove("light", "dark");
        root.classList.add(newTheme);
      };
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    } else {
      setEffectiveTheme(theme);
      root.classList.add(theme);
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
