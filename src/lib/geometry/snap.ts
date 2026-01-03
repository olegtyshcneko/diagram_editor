import type { Point, Bounds } from '@/types/common';

/**
 * Snap a single value to the nearest grid line
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Snap a point to the nearest grid intersection
 */
export function snapPointToGrid(
  point: Point,
  gridSize: number,
  enabled: boolean = true
): Point {
  if (!enabled) return point;

  return {
    x: snapToGrid(point.x, gridSize),
    y: snapToGrid(point.y, gridSize),
  };
}

/**
 * Snap bounds position to grid while maintaining size
 */
export function snapBoundsToGrid(
  bounds: Bounds,
  gridSize: number,
  enabled: boolean = true
): Bounds {
  if (!enabled) return bounds;

  return {
    ...bounds,
    x: snapToGrid(bounds.x, gridSize),
    y: snapToGrid(bounds.y, gridSize),
  };
}

/**
 * Calculate adaptive grid size based on zoom level
 * At very low zoom levels, increase grid spacing to avoid clutter
 */
export function getAdaptiveGridSize(baseSize: number, zoom: number): number {
  if (zoom < 0.25) {
    return baseSize * 4;
  }
  if (zoom < 0.5) {
    return baseSize * 2;
  }
  return baseSize;
}

/**
 * Default grid size in pixels
 */
export const DEFAULT_GRID_SIZE = 20;
