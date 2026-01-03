import type { Point } from '@/types/common';
import type { Shape } from '@/types/shapes';
import type { SelectionBounds } from '@/types/selection';

/**
 * Calculate the bounding box encompassing all given shapes
 */
export function getSelectionBounds(shapes: Shape[]): SelectionBounds {
  if (shapes.length === 0) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const shape of shapes) {
    minX = Math.min(minX, shape.x);
    minY = Math.min(minY, shape.y);
    maxX = Math.max(maxX, shape.x + shape.width);
    maxY = Math.max(maxY, shape.y + shape.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    minX,
    maxX,
    minY,
    maxY,
  };
}

/**
 * Check if a shape's bounding box intersects with a selection box
 * Uses AABB (Axis-Aligned Bounding Box) intersection test
 */
export function shapeIntersectsBox(
  shape: Shape,
  boxStart: Point,
  boxEnd: Point
): boolean {
  // Normalize selection box coordinates
  const boxMinX = Math.min(boxStart.x, boxEnd.x);
  const boxMaxX = Math.max(boxStart.x, boxEnd.x);
  const boxMinY = Math.min(boxStart.y, boxEnd.y);
  const boxMaxY = Math.max(boxStart.y, boxEnd.y);

  // Shape bounding box
  const shapeMinX = shape.x;
  const shapeMaxX = shape.x + shape.width;
  const shapeMinY = shape.y;
  const shapeMaxY = shape.y + shape.height;

  // AABB intersection test - overlaps if NOT separated on any axis
  const separated =
    shapeMaxX < boxMinX ||
    shapeMinX > boxMaxX ||
    shapeMaxY < boxMinY ||
    shapeMinY > boxMaxY;

  return !separated;
}

/**
 * Get all shape IDs that intersect with a selection box
 */
export function getShapesInBox(
  shapes: Record<string, Shape>,
  boxStart: Point,
  boxEnd: Point
): string[] {
  const result: string[] = [];

  for (const [id, shape] of Object.entries(shapes)) {
    // Skip hidden and locked shapes
    if (shape.visible && !shape.locked && shapeIntersectsBox(shape, boxStart, boxEnd)) {
      result.push(id);
    }
  }

  return result;
}

/**
 * Normalize selection box coordinates to get consistent bounds
 */
export function getSelectionBoxBounds(
  startPoint: Point,
  currentPoint: Point
): { x: number; y: number; width: number; height: number } {
  const x = Math.min(startPoint.x, currentPoint.x);
  const y = Math.min(startPoint.y, currentPoint.y);
  const width = Math.abs(currentPoint.x - startPoint.x);
  const height = Math.abs(currentPoint.y - startPoint.y);

  return { x, y, width, height };
}
