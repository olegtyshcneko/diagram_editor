import type { Point } from './common';
import type { ShapeType } from './shapes';

export interface CreationState {
  type: ShapeType;
  startPoint: Point;
  currentPoint: Point;
  isShiftHeld: boolean;
}

export interface CreationBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculate bounds from creation state, handling negative drag directions
 * and shift constraint for squares/circles
 */
export function getCreationBounds(state: CreationState): CreationBounds {
  const { startPoint, currentPoint, isShiftHeld } = state;

  let width = currentPoint.x - startPoint.x;
  let height = currentPoint.y - startPoint.y;

  // Handle negative dimensions (drag up/left)
  let x = width < 0 ? currentPoint.x : startPoint.x;
  let y = height < 0 ? currentPoint.y : startPoint.y;

  width = Math.abs(width);
  height = Math.abs(height);

  // Shift constraint: make square/circle
  if (isShiftHeld) {
    const size = Math.max(width, height);
    width = size;
    height = size;
  }

  return { x, y, width, height };
}
