// Block Stack Game Types

export type Cell = {
  col: number;
  row: number;
};

export type BlockType = "I" | "O" | "T" | "L" | "J" | "S" | "Z";

export type BlockCell = {
  col: number;
  row: number;
};

export type Block = {
  type: BlockType;
  cells: BlockCell[]; // Relative positions of cells in the block
  color: string;
  position: Cell; // Anchor position (top-left of bounding box)
  rotation: number; // 0, 1, 2, or 3 (0°, 90°, 180°, 270°)
};

export type GridCell = {
  filled: boolean;
  color: string | null;
};

export type GameGrid = GridCell[][];

export type SettingsState = {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  darkModeEnabled: boolean;
};

export type GameState = {
  score: number;
  rowsCleared: number;
  level: number;
  combo: number;
  isGameOver: boolean;
};

export type SessionStats = {
  score: number;
  sector: number;
  combo: number;
  lives: number;
  clearedLevels: number;
  statusText: string;
};
