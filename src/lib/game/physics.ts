import { GRID_COLS, GRID_ROWS } from "./constants";
import type { Block, GameGrid } from "./types";

/**
 * Check if a block can be placed at a specific position
 */
export function canPlaceBlock(block: Block, grid: GameGrid): boolean {
  for (const cell of block.cells) {
    const absCol = block.position.col + cell.col;
    const absRow = block.position.row + cell.row;

    // Check bounds
    if (absCol < 0 || absCol >= GRID_COLS || absRow < 0 || absRow >= GRID_ROWS) {
      return false;
    }

    // Check collision with existing blocks
    if (grid[absRow][absCol].filled) {
      return false;
    }
  }

  return true;
}

/**
 * Move block down by one row and check if it can move
 */
export function moveBlockDown(block: Block, grid: GameGrid): Block | null {
  const newBlock: Block = {
    ...block,
    position: { col: block.position.col, row: block.position.row + 1 },
  };

  if (canPlaceBlock(newBlock, grid)) {
    return newBlock;
  }

  return null; // Block cannot move down
}

/**
 * Move block left/right
 */
export function moveBlockHorizontal(block: Block, direction: number, grid: GameGrid): Block | null {
  const newBlock: Block = {
    ...block,
    position: { col: block.position.col + direction, row: block.position.row },
  };

  if (canPlaceBlock(newBlock, grid)) {
    return newBlock;
  }

  return null;
}

/**
 * Rotate block cells 90 degrees clockwise
 */
function rotateCells(cells: { col: number; row: number }[]): { col: number; row: number }[] {
  return cells.map(cell => ({
    col: -cell.row,
    row: cell.col,
  }));
}

/**
 * Rotate block 90 degrees clockwise
 */
export function rotateBlock(block: Block, grid: GameGrid): Block | null {
  // O block doesn't need rotation
  if (block.type === "O") {
    return block;
  }

  const rotatedCells = rotateCells(block.cells);
  const newBlock: Block = {
    ...block,
    cells: rotatedCells,
    rotation: (block.rotation + 1) % 4,
  };

  // Check if rotated block can be placed
  if (canPlaceBlock(newBlock, grid)) {
    return newBlock;
  }

  // Try wall kicks (shift left or right if rotation is blocked)
  const wallKickOffsets = [
    { col: -1, row: 0 }, // Try left
    { col: 1, row: 0 },  // Try right
    { col: -2, row: 0 }, // Try further left
    { col: 2, row: 0 },  // Try further right
    { col: 0, row: -1 }, // Try up
  ];

  for (const offset of wallKickOffsets) {
    const kickedBlock: Block = {
      ...newBlock,
      position: {
        col: block.position.col + offset.col,
        row: block.position.row + offset.row,
      },
    };

    if (canPlaceBlock(kickedBlock, grid)) {
      return kickedBlock;
    }
  }

  return null; // Rotation not possible
}

/**
 * Lock block into the grid
 */
export function lockBlockInGrid(block: Block, grid: GameGrid): GameGrid {
  const newGrid = grid.map(row => [...row]);

  for (const cell of block.cells) {
    const absCol = block.position.col + cell.col;
    const absRow = block.position.row + cell.row;

    if (absRow >= 0 && absRow < GRID_ROWS && absCol >= 0 && absCol < GRID_COLS) {
      newGrid[absRow][absCol] = {
        filled: true,
        color: block.color,
      };
    }
  }

  return newGrid;
}

/**
 * Check for complete rows
 */
export function findCompleteRows(grid: GameGrid): number[] {
  const completeRows: number[] = [];

  for (let row = 0; row < GRID_ROWS; row++) {
    const isComplete = grid[row].every(cell => cell.filled);
    if (isComplete) {
      completeRows.push(row);
    }
  }

  return completeRows;
}

/**
 * Clear completed rows and drop blocks above
 */
export function clearRows(grid: GameGrid, rowsToClear: number[]): GameGrid {
  let newGrid = grid.map(row => [...row]);

  // Sort rows from bottom to top
  const sortedRows = [...rowsToClear].sort((a, b) => b - a);

  for (const rowIndex of sortedRows) {
    // Remove the row
    newGrid.splice(rowIndex, 1);

    // Add empty row at top
    const emptyRow = Array(GRID_COLS).fill(null).map(() => ({ filled: false, color: null }));
    newGrid.unshift(emptyRow);
  }

  return newGrid;
}

/**
 * Check if game is over (blocks reached top)
 */
export function isGameOver(grid: GameGrid): boolean {
  // Check top 2 rows for any filled cells
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (grid[row][col].filled) {
        return true;
      }
    }
  }
  return false;
}
