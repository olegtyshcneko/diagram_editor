import type { Point } from '@/types/common';
import type { AnchorPosition, ConnectionControlPoints } from '@/types/connections';

/**
 * Bezier curve representation
 */
export interface BezierCurve {
  start: Point;
  cp1: Point;
  cp2: Point;
  end: Point;
}

/**
 * Calculate automatic control points based on anchor positions.
 * Control points extend perpendicular to the anchor direction.
 *
 * @param start - Start point of the connection
 * @param startAnchor - Anchor position on source shape
 * @param end - End point of the connection
 * @param endAnchor - Anchor position on target shape
 * @returns Control points cp1 (near start) and cp2 (near end)
 */
export function calculateAutoControlPoints(
  start: Point,
  startAnchor: AnchorPosition,
  end: Point,
  endAnchor: AnchorPosition
): { cp1: Point; cp2: Point } {
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  // Offset is 40% of distance, capped at 100px
  const offset = Math.min(distance * 0.4, 100);

  const cp1 = getAnchorOffset(start, startAnchor, offset);
  const cp2 = getAnchorOffset(end, endAnchor, offset);

  return { cp1, cp2 };
}

/**
 * Get absolute control point positions from stored relative offsets.
 * If no manual control points are stored, auto-calculates them.
 *
 * This function consolidates the relative-to-absolute conversion logic
 * to avoid duplication across components.
 *
 * @param controlPoints - Stored relative offsets (or undefined for auto-calculation)
 * @param start - Connection start point
 * @param end - Connection end point
 * @param sourceAnchor - Anchor position on source shape
 * @param targetAnchor - Anchor position on target shape
 * @returns Absolute control point positions
 */
export function getAbsoluteControlPoints(
  controlPoints: ConnectionControlPoints | undefined,
  start: Point,
  end: Point,
  sourceAnchor: AnchorPosition,
  targetAnchor: AnchorPosition
): { cp1: Point; cp2: Point } {
  if (controlPoints) {
    // Convert relative offsets to absolute positions
    // cp1 is offset from start, cp2 is offset from end
    return {
      cp1: {
        x: start.x + controlPoints.cp1.x,
        y: start.y + controlPoints.cp1.y,
      },
      cp2: {
        x: end.x + controlPoints.cp2.x,
        y: end.y + controlPoints.cp2.y,
      },
    };
  }
  // Auto-calculate control points (returns absolute positions)
  return calculateAutoControlPoints(start, sourceAnchor, end, targetAnchor);
}

/**
 * Get offset point in the direction of anchor's outward normal.
 */
function getAnchorOffset(
  point: Point,
  anchor: AnchorPosition,
  distance: number
): Point {
  switch (anchor) {
    case 'top':
      return { x: point.x, y: point.y - distance };
    case 'bottom':
      return { x: point.x, y: point.y + distance };
    case 'left':
      return { x: point.x - distance, y: point.y };
    case 'right':
      return { x: point.x + distance, y: point.y };
  }
}

/**
 * Generate SVG path d attribute for a cubic bezier curve.
 */
export function bezierToSVGPath(curve: BezierCurve): string {
  const { start, cp1, cp2, end } = curve;
  return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
}

/**
 * Get point on bezier curve at parameter t (0-1).
 * Uses cubic bezier formula: B(t) = (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3
 */
export function getPointOnBezier(curve: BezierCurve, t: number): Point {
  const { start, cp1, cp2, end } = curve;
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;

  return {
    x: mt3 * start.x + 3 * mt2 * t * cp1.x + 3 * mt * t2 * cp2.x + t3 * end.x,
    y: mt3 * start.y + 3 * mt2 * t * cp1.y + 3 * mt * t2 * cp2.y + t3 * end.y,
  };
}

/**
 * Get the midpoint of a bezier curve (t = 0.5).
 */
export function getBezierMidpoint(curve: BezierCurve): Point {
  return getPointOnBezier(curve, 0.5);
}

/**
 * Check if a point is near a bezier curve (for hit testing).
 * Samples the curve at intervals and checks distance to each sample.
 *
 * @param point - Point to test
 * @param curve - Bezier curve to test against
 * @param threshold - Maximum distance to consider "near" (default 8px)
 * @param samples - Number of samples along the curve (default 20)
 * @returns true if point is within threshold of any sample
 */
export function isPointNearBezier(
  point: Point,
  curve: BezierCurve,
  threshold: number = 8,
  samples: number = 20
): boolean {
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const curvePoint = getPointOnBezier(curve, t);
    const distance = Math.hypot(
      point.x - curvePoint.x,
      point.y - curvePoint.y
    );
    if (distance < threshold) return true;
  }
  return false;
}

/**
 * Get tangent angle at point on curve (for arrow rotation).
 * Uses first derivative of bezier curve.
 */
export function getTangentAngle(curve: BezierCurve, t: number): number {
  const { start, cp1, cp2, end } = curve;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  // First derivative of bezier
  const dx =
    3 * mt2 * (cp1.x - start.x) +
    6 * mt * t * (cp2.x - cp1.x) +
    3 * t2 * (end.x - cp2.x);
  const dy =
    3 * mt2 * (cp1.y - start.y) +
    6 * mt * t * (cp2.y - cp1.y) +
    3 * t2 * (end.y - cp2.y);

  return Math.atan2(dy, dx);
}
