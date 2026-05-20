import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SessionStats, SettingsState } from "./types";

export const STORAGE_KEYS = {
  settings: "shift-cubed.settings",
  progress: "shift-cubed.progress",
  onboarding: "shift-cubed.onboarding",
} as const;

async function getItem(key: string) {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error('AsyncStorage getItem error:', error);
    return null;
  }
}

async function setItem(key: string, value: string) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error('AsyncStorage setItem error:', error);
  }
}

export async function loadJson<T>(key: string, fallback: T) {
  try {
    const raw = await getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function saveJson<T>(key: string, value: T) {
  try {
    await setItem(key, JSON.stringify(value));
  } catch {
    // Ignore persistence failures to keep the runtime stable.
  }
}

export type PersistedProgress = {
  bestScore: number;
  highestSector: number;
  lastSession: SessionStats | null;
};

export type PersistedSettings = SettingsState;
