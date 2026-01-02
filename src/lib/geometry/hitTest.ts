import type { Point } from '@/types/common';
import type { Shape } from '@/types/shapes';

/**
 * Check if a point is inside a shape
 */
export function hitTestShape(point: Point, shape: Shape): boolean {
  switch (shape.type) {
    case 'rectangle':
      return hitTestRectangle(point, shape);
    case 'ellipse':
      return hitTestEllipse(point, shape);
    default:
      return false;
  }
}

/**
 * Check if point is inside rectangle bounds (including stroke)
 */
function hitTestRectangle(point: Point, shape: Shape): boolean {
  const { x, y, width, height, strokeWidth } = shape;
  const padding = strokeWidth / 2;

  return (
    point.x >= x - padding &&
    point.x <= x + width + padding &&
    point.y >= y - padding &&
    point.y <= y + height + padding
  );
}

/**
 * Check if point is inside ellipse (including stroke)
 */
function hitTestEllipse(point: Point, shape: Shape): boolean {
  const { x, y, width, height, strokeWidth } = shape;

  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = width / 2 + strokeWidth / 2;
  const ry = height / 2 + strokeWidth / 2;

  // Ellipse equation: (px-cx)²/rx² + (py-cy)²/ry² <= 1
  const dx = point.x - cx;
  const dy = point.y - cy;

  return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
}

/**
 * Find topmost shape at point (respecting z-order)
 */
export function findShapeAtPoint(
  point: Point,
  shapes: Shape[]
): Shape | null {
  // Sort by zIndex descending (top shapes first)
  const sortedShapes = [...shapes].sort((a, b) => b.zIndex - a.zIndex);

  for (const shape of sortedShapes) {
    if (shape.visible && hitTestShape(point, shape)) {
      return shape;
    }
  }

  return null;
}
