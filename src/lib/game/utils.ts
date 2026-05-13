import {
  CUBE_SIZE,
  GRAVITY_ORDER,
  GRID_COLS,
  GRID_ROWS,
  TILE_GAP,
  TILE_SIZE,
} from "./constants";
import type { Cell, Gravity } from "./types";

export function keyForCell({ col, row }: Cell) {
  return `${col}:${row}`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function manhattan(a: Cell, b: Cell) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

export function rotateGravity(current: Gravity) {
  const currentIndex = GRAVITY_ORDER.indexOf(current);
  return GRAVITY_ORDER[(currentIndex + 1) % GRAVITY_ORDER.length];
}

export function gravityToVector(gravity: Gravity) {
  switch (gravity) {
    case "down":
      return { dc: 0, dr: 1 };
    case "left":
      return { dc: -1, dr: 0 };
    case "up":
      return { dc: 0, dr: -1 };
    case "right":
      return { dc: 1, dr: 0 };
    default:
      throw new Error(`Unsupported gravity value: ${gravity}`);
  }
}

export function isInsideGrid({ col, row }: Cell) {
  return col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS;
}

export function createRng(seed: number) {
  let value = seed >>> 0;

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function getCellOffset(cell: Cell) {
  const x = cell.col * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2 - CUBE_SIZE / 2;
  const y = cell.row * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2 - CUBE_SIZE / 2;

  return { x, y };
}
