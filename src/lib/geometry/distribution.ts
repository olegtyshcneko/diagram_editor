import type { Shape } from '@/types/shapes';

export interface DistributionUpdate {
  id: string;
  x?: number;
  y?: number;
}

/**
 * Check if shapes can be distributed horizontally without overlap
 * @param shapes - Shapes to check
 * @returns true if distribution is possible (gap >= 0)
 */
export function canDistributeHorizontally(shapes: Shape[]): boolean {
  if (shapes.length < 3) return false;

  const sorted = [...shapes].sort((a, b) => a.x - b.x);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const totalSpace = (last.x + last.width) - first.x;
  const totalShapeWidth = sorted.reduce((sum, s) => sum + s.width, 0);
  const gap = (totalSpace - totalShapeWidth) / (shapes.length - 1);

  return gap >= 0;
}

/**
 * Check if shapes can be distributed vertically without overlap
 * @param shapes - Shapes to check
 * @returns true if distribution is possible (gap >= 0)
 */
export function canDistributeVertically(shapes: Shape[]): boolean {
  if (shapes.length < 3) return false;

  const sorted = [...shapes].sort((a, b) => a.y - b.y);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const totalSpace = (last.y + last.height) - first.y;
  const totalShapeHeight = sorted.reduce((sum, s) => sum + s.height, 0);
  const gap = (totalSpace - totalShapeHeight) / (shapes.length - 1);

  return gap >= 0;
}

/**
 * Calculate position updates for horizontal distribution
 * Distributes shapes evenly between the leftmost and rightmost shapes
 * @param shapes - Shapes to distribute (must be 3+)
 * @returns Array of updates for middle shapes
 */
export function calculateHorizontalDistribution(
  shapes: Shape[]
): DistributionUpdate[] {
  if (shapes.length < 3) return [];

  // Sort by x position (left to right)
  const sorted = [...shapes].sort((a, b) => a.x - b.x);

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  // Calculate total available space and total width of middle shapes
  const totalSpace = (last.x + last.width) - first.x;
  const totalShapeWidth = sorted.reduce((sum, s) => sum + s.width, 0);

  // Calculate equal gap between shapes
  const gap = (totalSpace - totalShapeWidth) / (shapes.length - 1);

  // Don't distribute if gap would be negative (shapes would overlap)
  if (gap < 0) return [];

  const updates: DistributionUpdate[] = [];

  // Position middle shapes (first and last stay in place)
  let currentX = first.x + first.width + gap;
  for (let i = 1; i < sorted.length - 1; i++) {
    updates.push({
      id: sorted[i].id,
      x: Math.round(currentX),
    });
    currentX += sorted[i].width + gap;
  }

  return updates;
}

/**
 * Calculate position updates for vertical distribution
 * Distributes shapes evenly between the topmost and bottommost shapes
 * @param shapes - Shapes to distribute (must be 3+)
 * @returns Array of updates for middle shapes
 */
export function calculateVerticalDistribution(
  shapes: Shape[]
): DistributionUpdate[] {
  if (shapes.length < 3) return [];

  // Sort by y position (top to bottom)
  const sorted = [...shapes].sort((a, b) => a.y - b.y);

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  // Calculate total available space and total height of middle shapes
  const totalSpace = (last.y + last.height) - first.y;
  const totalShapeHeight = sorted.reduce((sum, s) => sum + s.height, 0);

  // Calculate equal gap between shapes
  const gap = (totalSpace - totalShapeHeight) / (shapes.length - 1);

  // Don't distribute if gap would be negative (shapes would overlap)
  if (gap < 0) return [];

  const updates: DistributionUpdate[] = [];

  // Position middle shapes (first and last stay in place)
  let currentY = first.y + first.height + gap;
  for (let i = 1; i < sorted.length - 1; i++) {
    updates.push({
      id: sorted[i].id,
      y: Math.round(currentY),
    });
    currentY += sorted[i].height + gap;
  }

  return updates;
}
