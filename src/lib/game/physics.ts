import type { Cell, Gravity, Level, ShiftOutcome } from "./types";
import { gravityToVector, isInsideGrid, keyForCell } from "./utils";

export function findRestingCell(level: Level, fromCell: Cell, gravity: Gravity): ShiftOutcome {
  const vector = gravityToVector(gravity);
  let current = { ...fromCell };
  let travelDistance = 0;
  let hitCube = null;

  while (true) {
    const next = {
      col: current.col + vector.dc,
      row: current.row + vector.dr,
    };

    // Check if we hit a cube along the path
    if (!hitCube) {
      const cubeAtPosition = level.cubes.find(
        cube => !cube.collected && cube.cell.col === next.col && cube.cell.row === next.row
      );
      if (cubeAtPosition) {
        hitCube = cubeAtPosition;
      }
    }

    // Once the next step leaves the board, the cube falls off.
    if (!isInsideGrid(next)) {
      return {
        fallen: true,
        hitCube: null,
        restingCell: null,
        travelDistance,
      };
    }

    // If the next position is a platform, the cube lands there.
    if (level.platformSet.has(keyForCell(next))) {
      return {
        fallen: false,
        hitCube,
        restingCell: next,
        travelDistance: travelDistance + 1,
      };
    }

    // Empty space: keep advancing until a platform or the edge of the board.
    current = next;
    travelDistance += 1;
  }
}
