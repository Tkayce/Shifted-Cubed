import type { Gravity, SettingsState } from "./types";

export const GRID_COLS = 7;
export const GRID_ROWS = 7;
export const TILE_SIZE = 38;
export const TILE_GAP = 4;
export const BOARD_PIXEL_SIZE = GRID_COLS * TILE_SIZE + (GRID_COLS - 1) * TILE_GAP;
export const CUBE_SIZE = 24;
export const CUBE_FALL_MULTIPLIER = TILE_SIZE + TILE_GAP;
export const START_GRAVITY: Gravity = "down";
export const GRAVITY_ORDER: Gravity[] = ["down", "left", "up", "right"];
export const STARTING_LIVES = 3;

// Cube Collector colors for numbered cubes
export const CUBE_COLORS: Record<number, { hex: string; light: string }> = {
  1: { hex: "#3b82f6", light: "rgb(59, 130, 246)" },     // Blue
  2: { hex: "#10b981", light: "rgb(16, 185, 129)" },    // Emerald
  3: { hex: "#f59e0b", light: "rgb(245, 158, 11)" },    // Amber
};

export const HUD_LABELS: Record<Gravity, string> = {
  down: "South",
  left: "West",
  up: "North",
  right: "East",
};

export const DEFAULT_SETTINGS: SettingsState = {
  soundEnabled: true,
  hapticsEnabled: true,
  darkModeEnabled: true,
};

// CAMPAIGN_LEVEL_SEEDS removed
