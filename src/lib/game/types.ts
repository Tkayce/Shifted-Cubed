export type Cell = {
  col: number;
  row: number;
};

export type Gravity = "down" | "left" | "up" | "right";

export type GameMode = "campaign" | "endless";

export type NumberedCube = {
  number: number;
  cell: Cell;
  collected: boolean;
};

export type Level = {
  id: string;
  name: string;
  seed: number;
  difficulty: number;
  pathLength: number;
  spawn: Cell;
  cubes: NumberedCube[];
  platforms: Cell[];
  platformSet: Set<string>;
  scenicCells: Cell[];
  lore: string;
};

export type ShiftOutcome = {
  fallen: boolean;
  hitCube: NumberedCube | null;
  restingCell: Cell | null;
  travelDistance: number;
};

export type SettingsState = {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  darkModeEnabled: boolean;
};

export type SessionStats = {
  score: number;
  combo: number;
  lives: number;
  sector: number;
  clearedLevels: number;
  statusText: string;
};
