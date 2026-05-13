/**
 * Theme utility for managing dark and light mode colors
 * Provides consistent color system across the application
 */

export type Theme = "dark" | "light";

export const themeColors = {
  dark: {
    // Base colors
    bg: {
      primary: "#020617", // slate-950
      secondary: "#0f172a", // slate-900
      tertiary: "#1e293b", // slate-800
      overlay: "#000000cc", // black with 80% opacity
    },
    text: {
      primary: "#ffffff", // white
      secondary: "#cbd5e1", // slate-200
      muted: "#94a3b8", // slate-400
      dimmed: "#64748b", // slate-500
    },
    accent: {
      primary: "#06b6d4", // cyan-500
      secondary: "#22d3ee", // cyan-400
      success: "#10b981", // emerald-500
      warning: "#f59e0b", // amber-500
      error: "#ef4444", // red-500
    },
    border: {
      primary: "#0ea5e9", // sky-400
      secondary: "#64748b", // slate-500
      muted: "#475569", // slate-600
    },
    toggle: {
      onBg: "#059669", // emerald-600
      onBorder: "#34d399", // emerald-400
      onKnob: "#ffffff",
      offBg: "#475569", // slate-600
      offBorder: "#64748b", // slate-500
      offKnob: "#cbd5e1", // slate-200
    },
  },
  light: {
    // Base colors
    bg: {
      primary: "#f8fafc", // slate-50
      secondary: "#f1f5f9", // slate-100
      tertiary: "#e2e8f0", // slate-200
      overlay: "#00000099", // black with 60% opacity
    },
    text: {
      primary: "#0f172a", // slate-900
      secondary: "#334155", // slate-700
      muted: "#64748b", // slate-500
      dimmed: "#94a3b8", // slate-400
    },
    accent: {
      primary: "#0891b2", // cyan-600
      secondary: "#06b6d4", // cyan-500
      success: "#059669", // emerald-600
      warning: "#d97706", // amber-600
      error: "#dc2626", // red-600
    },
    border: {
      primary: "#0284c7", // sky-600
      secondary: "#94a3b8", // slate-400
      muted: "#cbd5e1", // slate-200
    },
    toggle: {
      onBg: "#10b981", // emerald-500
      onBorder: "#059669", // emerald-600
      onKnob: "#ffffff",
      offBg: "#cbd5e1", // slate-200
      offBorder: "#94a3b8", // slate-400
      offKnob: "#64748b", // slate-500
    },
  },
};

export function getTheme(isDarkMode: boolean) {
  return isDarkMode ? themeColors.dark : themeColors.light;
}

/**
 * Returns background style for screen based on theme
 */
export function getScreenBg(isDarkMode: boolean) {
  return isDarkMode ? "bg-slate-950" : "bg-slate-50";
}

/**
 * Returns container background based on theme
 */
export function getContainerBg(isDarkMode: boolean) {
  return isDarkMode ? "bg-slate-900/80" : "bg-slate-100/80";
}

/**
 * Returns text color based on theme and type
 */
export function getTextColor(isDarkMode: boolean, type: "primary" | "secondary" | "muted" = "primary") {
  const colors = getTheme(isDarkMode).text;
  return colors[type];
}

/**
 * Returns border color based on theme
 */
export function getBorderColor(isDarkMode: boolean, type: "primary" | "secondary" | "muted" = "primary") {
  const colors = getTheme(isDarkMode).border;
  return colors[type];
}

/**
 * Returns tailwind class names for theme
 */
export const themeClasses = {
  dark: {
    screen: "bg-slate-950",
    container: "bg-slate-900/80",
    border: {
      primary: "border-cyan-500",
      secondary: "border-slate-600",
    },
    text: {
      primary: "text-white",
      secondary: "text-slate-300",
      muted: "text-slate-400",
    },
  },
  light: {
    screen: "bg-slate-50",
    container: "bg-slate-100/80",
    border: {
      primary: "border-cyan-600",
      secondary: "border-slate-300",
    },
    text: {
      primary: "text-slate-900",
      secondary: "text-slate-700",
      muted: "text-slate-500",
    },
  },
};

export function getScreenClasses(isDarkMode: boolean) {
  return isDarkMode ? themeClasses.dark.screen : themeClasses.light.screen;
}

export function getContainerClasses(isDarkMode: boolean) {
  return isDarkMode ? themeClasses.dark.container : themeClasses.light.container;
}
