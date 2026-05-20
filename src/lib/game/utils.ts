import { BLOCK_COLORS, BLOCK_SHAPES, CELL_GAP, CELL_SIZE, GRID_COLS, GRID_ROWS } from "./constants";
import type { Block, BlockType, GameGrid } from "./types";

/**
 * Create an empty game grid
 */
export function createEmptyGrid(): GameGrid {
  return Array(GRID_ROWS)
    .fill(null)
    .map(() =>
      Array(GRID_COLS)
        .fill(null)
        .map(() => ({ filled: false, color: null }))
    );
}

/**
 * Generate a random block with weighted probability (Z-shape appears less often)
 */
export function generateRandomBlock(): Block {
  // Weighted block pool: Z appears less frequently (about half the rate of others)
  const weightedPool = [
    "I", "I", "I",
    "O", "O", "O",
    "T", "T", "T",
    "L", "L", "L",
    "J", "J", "J",
    "S", "S", "S",
    "Z", "Z"
  ] as const;
  
  const type = weightedPool[Math.floor(Math.random() * weightedPool.length)] as BlockType;
  const color = BLOCK_COLORS[type];
  const cells = BLOCK_SHAPES[type];

  // Start at top center
  const position = {
    col: Math.floor(GRID_COLS / 2) - 1,
    row: 0,
  };

  return {
    type,
    cells,
    color,
    position,
    rotation: 0,
  };
}

/**
 * Calculate pixel position for a cell
 */
export function getCellPixelPosition(col: number, row: number) {
  const x = col * (CELL_SIZE + CELL_GAP);
  const y = row * (CELL_SIZE + CELL_GAP);
  return { x, y };
}

/**
 * Calculate score based on rows cleared
 */
export function calculateScore(rowsCleared: number, combo: number): number {
  const basePoints = {
    1: 100,
    2: 300,
    3: 500,
    4: 800, // Tetris!
  };

  const points = basePoints[rowsCleared as keyof typeof basePoints] || 0;
  const comboMultiplier = 1 + (combo * 0.5);

  return Math.floor(points * comboMultiplier);
}

/**
 * Get current fall speed based on level
 */
export function getFallSpeed(level: number): number {
  const baseSpeed = 1000;
  const speedDecrease = level * 50;
  return Math.max(200, baseSpeed - speedDecrease);
}
