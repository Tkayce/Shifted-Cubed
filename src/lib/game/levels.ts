import { GRID_COLS, GRID_ROWS } from "./constants";
import type { Cell, Level, NumberedCube } from "./types";
import { clamp, keyForCell, manhattan } from "./utils";

function createRng(seed: number) {
  let value = seed >>> 0;

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function buildLevel(seed: number, difficulty: number, name: string, lore: string, id: string): Level {
  const random = createRng(seed);
  const platforms = new Set<string>();
  const supportRow = GRID_ROWS - 1;
  const pathLength = clamp(4 + Math.floor(difficulty * 0.8), 4, 8);
  const spawnCol = 1 + Math.floor(random() * (GRID_COLS - 2));
  const spawn: Cell = {
    col: spawnCol,
    row: 1 + Math.floor(random() * 2),
  };
  const scenicCells: Cell[] = [];

  for (let col = 0; col < GRID_COLS; col += 1) {
    platforms.add(keyForCell({ col, row: supportRow }));
  }

  let walkerCol = clamp(spawn.col, 1, GRID_COLS - 2);
  for (let row = supportRow - 1; row > spawn.row; row -= 1) {
    platforms.add(keyForCell({ col: walkerCol, row }));
    scenicCells.push({ col: walkerCol, row });

    // Early levels have less randomness to be more forgiving
    const randomThreshold = difficulty < 1 ? 0.5 : Math.max(0.28, 0.55 - difficulty * 0.05);
    if (random() > randomThreshold) {
      const lateral = random() > 0.5 ? 1 : -1;
      walkerCol = clamp(walkerCol + lateral, 1, GRID_COLS - 2);
      platforms.add(keyForCell({ col: walkerCol, row }));
      scenicCells.push({ col: walkerCol, row });
    }
  }

  for (let row = 1; row < GRID_ROWS - 1; row += 1) {
    for (let col = 0; col < GRID_COLS; col += 1) {
      if (col === spawn.col && row === spawn.row) {
        continue;
      }

      // Easy levels have more platforms (less random spawning)
      const baseFill = difficulty < 1 ? 0.35 : difficulty < 2 ? 0.28 : 0.22;
      const chance = row >= GRID_ROWS - 2 ? (difficulty < 1 ? 0.4 : 0.24) : clamp(baseFill + difficulty * 0.02, baseFill, 0.42);
      if (random() < chance) {
        platforms.add(keyForCell({ col, row }));
      }
    }
  }

  for (let step = 0; step < pathLength; step += 1) {
    const row = clamp(supportRow - 1 - step, 1, GRID_ROWS - 2);
    const drift = difficulty < 1 ? 0 : Math.floor(random() * 3) - 1;
    const col = clamp(spawn.col + drift + (step % 2 === 0 ? 1 : -1), 0, GRID_COLS - 1);
    platforms.add(keyForCell({ col, row }));
  }

  platforms.delete(keyForCell(spawn));

  const platformCells = Array.from(platforms, (entry) => {
    const [col, row] = entry.split(":").map(Number);
    return { col, row };
  }).sort((a, b) => a.row - b.row || a.col - b.col);

  // Generate numbered cubes (1 to 3 based on difficulty)
  const numCubes = Math.min(Math.floor(difficulty / 2) + 1, 3);
  const cubes: NumberedCube[] = [];
  
  const cubeCandidates = platformCells
    .filter((cell) => cell.row <= GRID_ROWS - 2 && !(cell.col === spawn.col && cell.row === spawn.row + 1))
    .sort((a, b) => manhattan(b, spawn) - manhattan(a, spawn));

  for (let i = 0; i < numCubes && i < cubeCandidates.length; i++) {
    cubes.push({
      number: i + 1,
      cell: cubeCandidates[i],
      collected: false,
    });
  }

  return {
    id,
    name,
    lore,
    seed,
    difficulty,
    pathLength,
    spawn,
    cubes,
    platforms: platformCells,
    platformSet: platforms,
    scenicCells,
  };
}

export function createCampaignLevel(seed: number, index: number) {
  let difficulty = index + 1;
  
  if (index === 0) difficulty = 0.5;
  else if (index === 1) difficulty = 1.2;
  else if (index === 4) difficulty = 4.5;
  else if (index === 5) difficulty = 6;
  
  return buildLevel(
    seed,
    difficulty,
    `Sector ${index + 1}`,
    [
      "Collect the blue cube first to begin your sequence.",
      "Two cubes await: blue, then emerald. Chain your moves for combos!",
      "The trinity awaits: blue → emerald → amber. Master the flow.",
      "Four sectors deep. Sequences grow intricate. Stay focused.",
      "The challenges intensify. Collect with precision and grace.",
      "The ultimate sector. All skills converge. Can you claim victory?",
    ][index] ?? "A procedurally curated collection sector.",
    `campaign-${index + 1}`
  );
}

export function createEndlessLevel(seed: number, sector: number) {
  return buildLevel(
    seed,
    clamp(sector, 1, 6),
    `Endless ${sector}`,
    "An endless prism of numbered cubes generated from live reactor telemetry.",
    `endless-${seed}`
  );
}
