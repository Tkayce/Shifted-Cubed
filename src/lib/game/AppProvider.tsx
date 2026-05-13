import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { s } from "react-native-wind";

import { DEFAULT_SETTINGS } from "./constants";
import { loadJson, saveJson, STORAGE_KEYS, type PersistedProgress } from "./storage";
import type { SessionStats, SettingsState } from "./types";

type AppContextValue = {
  hydrated: boolean;
  settings: SettingsState;
  progress: PersistedProgress;
  onboardingSeen: boolean;
  updateSettings: (updater: (current: SettingsState) => SettingsState) => void;
  markOnboardingSeen: () => void;
  updateProgress: (session: SessionStats) => void;
};

const defaultProgress: PersistedProgress = {
  bestScore: 0,
  highestSector: 1,
  lastSession: null,
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState<PersistedProgress>(defaultProgress);
  const [onboardingSeen, setOnboardingSeen] = useState(false);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      const [savedSettings, savedProgress, savedOnboarding] = await Promise.all([
        loadJson(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
        loadJson(STORAGE_KEYS.progress, defaultProgress),
        loadJson(STORAGE_KEYS.onboarding, false),
      ]);

      if (!active) {
        return;
      }

      setSettings(savedSettings);
      setProgress(savedProgress);
      setOnboardingSeen(savedOnboarding);
      setHydrated(true);
    }

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  const updateSettings = useCallback((updater: (current: SettingsState) => SettingsState) => {
    setSettings((current) => {
      const next = updater(current);
      void saveJson(STORAGE_KEYS.settings, next);
      return next;
    });
  }, []);

  const markOnboardingSeen = useCallback(() => {
    setOnboardingSeen(true);
    void saveJson(STORAGE_KEYS.onboarding, true);
  }, []);

  const updateProgress = useCallback((session: SessionStats) => {
    setProgress((current) => {
      const next = {
        bestScore: Math.max(current.bestScore, session.score),
        highestSector: Math.max(current.highestSector, session.sector),
        lastSession: session,
      };
      void saveJson(STORAGE_KEYS.progress, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      settings,
      progress,
      onboardingSeen,
      updateSettings,
      markOnboardingSeen,
      updateProgress,
    }),
    [hydrated, markOnboardingSeen, onboardingSeen, progress, settings, updateProgress, updateSettings]
  );

  if (!hydrated) {
    return <View style={s`flex-1 bg-slate-950`} />;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppProvider");
  }

  return context;
}
