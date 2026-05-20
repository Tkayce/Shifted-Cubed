/**
 * Theme utility for managing dark and light mode colors
 * Provides consistent color system across the application
 */

export type Theme = "dark" | "light";

export const themeColors = {
  dark: {
    // Base colors - Modern dark theme
    bg: {
      primary: "#0a0e27", // Deep navy/purple
      secondary: "#1a1f3a", // Dark blue-gray
      tertiary: "#252d4a", // Medium dark blue
      overlay: "#000000dd", // black with 87% opacity
    },
    text: {
      primary: "#f5f7fa", // Off-white
      secondary: "#d4d8e0", // Light gray
      muted: "#9ca3af", // Medium gray
      dimmed: "#6b7280", // Dim gray
    },
    accent: {
      primary: "#7c3aed", // Vibrant purple
      secondary: "#a78bfa", // Light purple
      success: "#10b981", // Emerald
      warning: "#f59e0b", // Amber
      error: "#ef4444", // Red
    },
    border: {
      primary: "#7c3aed", // Vibrant purple
      secondary: "#6b7280", // Gray
      muted: "#4b5563", // Dark gray
    },
    toggle: {
      onBg: "#10b981", // Emerald
      onBorder: "#34d399", // Light emerald
      onKnob: "#ffffff",
      offBg: "#4b5563", // Dark gray
      offBorder: "#6b7280", // Medium gray
      offKnob: "#d4d8e0", // Light gray
    },
  },
  light: {
    // Base colors - Modern light theme
    bg: {
      primary: "#fafbfc", // Almost white
      secondary: "#f3f4f6", // Light gray
      tertiary: "#e5e7eb", // Medium light gray
      overlay: "#000000b8", // black with 72% opacity
    },
    text: {
      primary: "#111827", // Near black
      secondary: "#374151", // Dark gray
      muted: "#6b7280", // Medium gray
      dimmed: "#9ca3af", // Light gray
    },
    accent: {
      primary: "#7c3aed", // Vibrant purple
      secondary: "#8b5cf6", // Light purple
      success: "#10b981", // Emerald
      warning: "#d97706", // Amber
      error: "#dc2626", // Red
    },
    border: {
      primary: "#7c3aed", // Vibrant purple
      secondary: "#d1d5db", // Light gray
      muted: "#e5e7eb", // Very light gray
    },
    toggle: {
      onBg: "#10b981", // Emerald
      onBorder: "#059669", // Dark emerald
      onKnob: "#ffffff",
      offBg: "#e5e7eb", // Light gray
      offBorder: "#d1d5db", // Medium light gray
      offKnob: "#6b7280", // Medium gray
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
