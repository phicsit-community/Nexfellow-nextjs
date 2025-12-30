// export function ThemeProvider({ children }) {
//   // 'system', 'light', or 'dark'
//   const [theme, setTheme] = useState(() => {
//     return localStorage.getItem("theme") || "light";
//   });

//   useEffect(() => {
//     const root = window.document.documentElement;
//     // Remove any existing theme classes
//     root.classList.remove("light", "dark");

//     let appliedTheme = theme;
//     if (theme === "system") {
//       appliedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
//         ? "dark"
//         : "light";
//     }
//     root.classList.add(appliedTheme);

//     // Listen for system preference changes
//     if (theme === "system") {
//       const media = window.matchMedia("(prefers-color-scheme: dark)");
//       const handler = () => {
//         root.classList.remove("light", "dark");
//         root.classList.add(media.matches ? "dark" : "light");
//       };
//       media.addEventListener("change", handler);
//       return () => media.removeEventListener("change", handler);
//     }
//   }, [theme]);

//   // Persist user choice
//   useEffect(() => {
//     localStorage.setItem("theme", theme);
//   }, [theme]);

//   return (
//     <ThemeContext.Provider value={{ theme, setTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// }

import { useState, useEffect, createContext, useContext } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  const [effectiveTheme, setEffectiveTheme] = useState(() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  });

  useEffect(() => {
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
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

