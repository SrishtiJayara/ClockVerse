import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(undefined);

const PRESET_BACKGROUNDS_DARK = {
  none: "radial-gradient(circle at 50% 0%, rgba(78, 205, 196, 0.15) 0%, #0c2226 75%)",
  nebula: "radial-gradient(circle at 50% 50%, rgba(255, 107, 107, 0.15) 0%, #0c2226 100%)",
  sunset: "radial-gradient(circle at 50% 50%, rgba(255, 230, 109, 0.15) 0%, #0c2226 100%)",
  cyberpunk: "radial-gradient(circle at 30% 30%, rgba(78, 205, 196, 0.15) 0%, rgba(255, 107, 107, 0.1) 50%, #0c2226 100%)",
  aurora: "radial-gradient(circle at 50% 50%, rgba(78, 205, 196, 0.12) 0%, #0c2226 100%)"
};

const PRESET_BACKGROUNDS_LIGHT = {
  none: "radial-gradient(circle at 50% 0%, rgba(78, 205, 196, 0.35) 0%, #f7fff7 70%)",
  nebula: "radial-gradient(circle at 50% 50%, rgba(255, 107, 107, 0.12) 0%, #f7fff7 100%)",
  sunset: "radial-gradient(circle at 50% 50%, rgba(255, 230, 109, 0.12) 0%, #f7fff7 100%)",
  cyberpunk: "radial-gradient(circle at 50% 50%, rgba(78, 205, 196, 0.15) 0%, #f7fff7 100%)",
  aurora: "radial-gradient(circle at 50% 50%, rgba(78, 205, 196, 0.1) 0%, #f7fff7 100%)"
};

export function ThemeProvider({ children, defaultTheme = "dark", switchable = true }) {
  const [theme, setTheme] = useState(() => {
    const migrated = localStorage.getItem("theme_migrated_to_dark_v2");
    if (!migrated) {
      localStorage.setItem("theme_migrated_to_dark_v2", "true");
      localStorage.setItem("theme", "dark");
      return "dark";
    }
    return localStorage.getItem("theme") || defaultTheme;
  });

  const [bgKey, setBgKey] = useState(() => {
    return localStorage.getItem("chrono_bg_key") || "none";
  });

  const [customBg, setCustomBg] = useState(() => {
    return localStorage.getItem("chrono_custom_bg") || "";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  // Compute actual CSS background-image value based on active theme
  const presetMap = theme === "dark" ? PRESET_BACKGROUNDS_DARK : PRESET_BACKGROUNDS_LIGHT;
  let bgStyle = presetMap[bgKey] || presetMap.none;
  
  if (bgKey === "custom" && customBg) {
    bgStyle = theme === "dark"
      ? `linear-gradient(rgba(12, 34, 38, 0.65), rgba(12, 34, 38, 0.85)), url(${customBg})`
      : `linear-gradient(rgba(247, 255, 247, 0.75), rgba(247, 255, 247, 0.88)), url(${customBg})`;
  } else if (bgKey !== "none" && presetMap[bgKey]) {
    bgStyle = theme === "dark"
      ? `linear-gradient(rgba(12, 34, 38, 0.35), rgba(12, 34, 38, 0.7)), ${presetMap[bgKey]}`
      : `linear-gradient(rgba(247, 255, 247, 0.25), rgba(247, 255, 247, 0.55)), ${presetMap[bgKey]}`;
  }

  const changeBg = (key, customDataUrl = "") => {
    setBgKey(key);
    localStorage.setItem("chrono_bg_key", key);
    if (key === "custom" && customDataUrl) {
      setCustomBg(customDataUrl);
      localStorage.setItem("chrono_custom_bg", customDataUrl);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      switchable,
      bgKey,
      customBg,
      bgStyle,
      changeBg
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
