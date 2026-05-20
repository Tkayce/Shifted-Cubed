import type { BlockType, SettingsState } from "./types";

// Grid Configuration
export const GRID_COLS = 10;
export const GRID_ROWS = 18;
export const CELL_SIZE = 26;
export const CELL_GAP = 2;
export const BOARD_PIXEL_SIZE = GRID_COLS * CELL_SIZE + (GRID_COLS - 1) * CELL_GAP;

// Game Speed
export const INITIAL_FALL_SPEED = 1000; // ms per row
export const MIN_FALL_SPEED = 200; // Fastest speed
export const SPEED_INCREASE_PER_LEVEL = 50; // Speed up every level

// Scoring
export const POINTS_SINGLE_ROW = 100;
export const POINTS_DOUBLE_ROW = 300;
export const POINTS_TRIPLE_ROW = 500;
export const POINTS_QUADRUPLE_ROW = 800; // Tetris!
export const COMBO_MULTIPLIER = 1.5;

// Block Colors - Vibrant Neon Theme
export const BLOCK_COLORS: Record<BlockType, string> = {
  I: "#00f5ff", // Cyan neon
  O: "#ffed00", // Yellow neon
  T: "#ff00ff", // Magenta neon
  L: "#ff6600", // Orange neon
  J: "#0066ff", // Blue neon
  S: "#00ff00", // Green neon
  Z: "#ff0066", // Pink neon
};

// Block Shapes (relative cell positions)
export const BLOCK_SHAPES: Record<BlockType, BlockCell[]> = {
  I: [
    { col: 0, row: 0 },
    { col: 0, row: 1 },
    { col: 0, row: 2 },
    { col: 0, row: 3 },
  ],
  O: [
    { col: 0, row: 0 },
    { col: 1, row: 0 },
    { col: 0, row: 1 },
    { col: 1, row: 1 },
  ],
  T: [
    { col: 1, row: 0 },
    { col: 0, row: 1 },
    { col: 1, row: 1 },
    { col: 2, row: 1 },
  ],
  L: [
    { col: 0, row: 0 },
    { col: 0, row: 1 },
    { col: 0, row: 2 },
    { col: 1, row: 2 },
  ],
  J: [
    { col: 1, row: 0 },
    { col: 1, row: 1 },
    { col: 1, row: 2 },
    { col: 0, row: 2 },
  ],
  S: [
    { col: 1, row: 0 },
    { col: 2, row: 0 },
    { col: 0, row: 1 },
    { col: 1, row: 1 },
  ],
  Z: [
    { col: 0, row: 0 },
    { col: 1, row: 0 },
    { col: 1, row: 1 },
    { col: 2, row: 1 },
  ],
};

type BlockCell = { col: number; row: number };

export const BLOCK_TYPES: BlockType[] = ["I", "O", "T", "L", "J", "S", "Z"];

export const DEFAULT_SETTINGS: SettingsState = {
  soundEnabled: true,
  hapticsEnabled: true,
  darkModeEnabled: true,
};
