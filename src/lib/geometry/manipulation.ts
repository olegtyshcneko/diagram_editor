import type { Point, Bounds } from '@/types/common';
import type { HandleType, HandlePosition } from '@/types/interaction';
import { CURSOR_MAP } from '@/lib/constants';

/**
 * Get the center point of a bounds rectangle
 */
export function getBoundsCenter(bounds: Bounds): Point {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}

/**
 * Calculate angle in degrees from center to point.
 * Returns angle where 0 = up (12 o'clock), 90 = right, 180 = down, 270 = left.
 * This is adjusted for rotation handle being above the shape.
 */
export function calculateAngle(center: Point, point: Point): number {
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  // atan2 returns radians where 0 = right, positive = counter-clockwise
  // Convert to degrees and adjust so 0 = up (for rotation handle above shape)
  let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

  // Normalize to 0-360 range
  return normalizeAngle(angle);
}

/**
 * Normalize angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

/**
 * Snap angle to nearest increment (e.g., 15 degrees)
 */
export function snapAngle(angle: number, increment: number): number {
  return Math.round(angle / increment) * increment;
}

/**
 * Calculate delta movement constrained to a single axis.
 * Returns delta with either x or y zeroed based on dominant direction.
 */
export function constrainToAxis(delta: Point, threshold: number = 5): Point {
  const absX = Math.abs(delta.x);
  const absY = Math.abs(delta.y);

  // Determine dominant axis with threshold for near-diagonal movements
  if (absX > absY + threshold) {
    // Horizontal is dominant
    return { x: delta.x, y: 0 };
  } else if (absY > absX + threshold) {
    // Vertical is dominant
    return { x: 0, y: delta.y };
  }

  // When close to 45 degrees, use the larger absolute value
  return absX >= absY
    ? { x: delta.x, y: 0 }
    : { x: 0, y: delta.y };
}

/**
 * Get the 8 resize handle positions for a shape's bounding box.
 * Positions are at corners and edge midpoints.
 */
export function getHandlePositions(bounds: Bounds): HandlePosition[] {
  const { x, y, width, height } = bounds;

  return [
    // Top row
    { type: 'nw' as HandleType, x: x, y: y, cursor: CURSOR_MAP.nw },
    { type: 'n' as HandleType, x: x + width / 2, y: y, cursor: CURSOR_MAP.n },
    { type: 'ne' as HandleType, x: x + width, y: y, cursor: CURSOR_MAP.ne },
    // Middle row
    { type: 'w' as HandleType, x: x, y: y + height / 2, cursor: CURSOR_MAP.w },
    { type: 'e' as HandleType, x: x + width, y: y + height / 2, cursor: CURSOR_MAP.e },
    // Bottom row
    { type: 'sw' as HandleType, x: x, y: y + height, cursor: CURSOR_MAP.sw },
    { type: 's' as HandleType, x: x + width / 2, y: y + height, cursor: CURSOR_MAP.s },
    { type: 'se' as HandleType, x: x + width, y: y + height, cursor: CURSOR_MAP.se },
  ];
}

/**
 * Get the rotation handle position (above top-center of shape)
 */
export function getRotationHandlePosition(bounds: Bounds, offset: number): Point {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y - offset,
  };
}

/**
 * Check if a handle type is a corner handle
 */
export function isCornerHandle(handle: HandleType): boolean {
  return handle === 'nw' || handle === 'ne' || handle === 'sw' || handle === 'se';
}
