import type { Point } from '@/types/common';
import type { Shape } from '@/types/shapes';
import type { AnchorPosition, Connection } from '@/types/connections';
import { NUMERICAL } from '@/lib/constants';

/**
 * Get the position of an anchor point on a shape
 * Accounts for rotation by computing anchor position in rotated space
 */
export function getAnchorPosition(shape: Shape, anchor: AnchorPosition): Point {
  const cx = shape.x + shape.width / 2;
  const cy = shape.y + shape.height / 2;

  // Get anchor offset from center (unrotated)
  let dx = 0;
  let dy = 0;

  switch (anchor) {
    case 'top':
      dx = 0;
      dy = -shape.height / 2;
      break;
    case 'right':
      dx = shape.width / 2;
      dy = 0;
      break;
    case 'bottom':
      dx = 0;
      dy = shape.height / 2;
      break;
    case 'left':
      dx = -shape.width / 2;
      dy = 0;
      break;
  }

  // Apply rotation
  if (shape.rotation !== 0) {
    const rad = (shape.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rotatedDx = dx * cos - dy * sin;
    const rotatedDy = dx * sin + dy * cos;
    dx = rotatedDx;
    dy = rotatedDy;
  }

  return {
    x: cx + dx,
    y: cy + dy,
  };
}

/**
 * Get all 4 anchor positions for a shape
 */
export function getAllAnchors(
  shape: Shape
): Array<{ anchor: AnchorPosition; point: Point }> {
  const anchors: AnchorPosition[] = ['top', 'right', 'bottom', 'left'];
  return anchors.map((anchor) => ({
    anchor,
    point: getAnchorPosition(shape, anchor),
  }));
}

/**
 * Find the nearest anchor to a point within a threshold
 */
export function findNearestAnchor(
  shape: Shape,
  point: Point,
  threshold: number = 20
): { anchor: AnchorPosition; point: Point } | null {
  const anchors = getAllAnchors(shape);

  let nearest: { anchor: AnchorPosition; point: Point } | null = null;
  let minDistance = threshold;

  for (const anchorData of anchors) {
    const distance = Math.hypot(
      anchorData.point.x - point.x,
      anchorData.point.y - point.y
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = anchorData;
    }
  }

  return nearest;
}

/**
 * Calculate connection line endpoints from source and target shapes.
 * Handles floating endpoints when sourceAttached or targetAttached is false.
 */
export function getConnectionEndpoints(
  connection: Connection,
  shapes: Record<string, Shape>
): { start: Point; end: Point } | null {
  let start: Point | null = null;
  let end: Point | null = null;

  // Calculate start point
  if (connection.sourceAttached !== false) {
    // Source is attached to a shape
    const sourceShape = shapes[connection.sourceShapeId];
    if (!sourceShape) return null;
    start = getAnchorPosition(sourceShape, connection.sourceAnchor);
  } else if (connection.floatingSourcePoint) {
    // Source is floating
    start = connection.floatingSourcePoint;
  } else {
    return null;
  }

  // Calculate end point
  if (connection.targetAttached !== false) {
    // Target is attached to a shape
    if (connection.targetShapeId && connection.targetAnchor) {
      const targetShape = shapes[connection.targetShapeId];
      if (!targetShape) return null;
      end = getAnchorPosition(targetShape, connection.targetAnchor);
    } else if (connection.targetPoint) {
      // Legacy: floating target point (for backwards compatibility)
      end = connection.targetPoint;
    } else {
      return null;
    }
  } else if (connection.floatingTargetPoint) {
    // Target is floating
    end = connection.floatingTargetPoint;
  } else {
    return null;
  }

  return { start, end };
}

/**
 * Check if a point is near a line segment (for hit testing connections)
 * Uses perpendicular distance with clamping to segment bounds
 */
export function isPointNearLine(
  point: Point,
  lineStart: Point,
  lineEnd: Point,
  threshold: number = 8
): boolean {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lengthSquared = dx * dx + dy * dy;

  // Line is actually a point (use epsilon for floating-point comparison)
  if (lengthSquared < NUMERICAL.EPSILON) {
    return (
      Math.hypot(point.x - lineStart.x, point.y - lineStart.y) < threshold
    );
  }

  // Calculate projection factor (0-1 means point is within segment)
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) /
        lengthSquared
    )
  );

  // Find closest point on line segment
  const closestX = lineStart.x + t * dx;
  const closestY = lineStart.y + t * dy;

  // Calculate distance from point to closest point on line
  const distance = Math.hypot(point.x - closestX, point.y - closestY);

  return distance < threshold;
}

/**
 * Calculate angle between two points (in degrees)
 * Used for rotating arrow markers
 */
export function getLineAngle(start: Point, end: Point): number {
  return Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
}

/**
 * Get the center point of a line segment
 */
export function getLineMidpoint(start: Point, end: Point): Point {
  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };
}
