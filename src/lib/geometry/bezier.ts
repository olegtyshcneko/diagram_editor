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

/**
 * Calculate appropriate control point distance based on points.
 */
function getControlDistance(p1: Point, p2: Point): number {
  const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  return Math.min(distance * 0.4, 100);
}

/**
 * Generate SVG path for a smooth curve through multiple points (including waypoints).
 * Uses Catmull-Rom to Bezier conversion for smooth curves through waypoints.
 *
 * @param start - Start point
 * @param startAnchor - Start anchor position
 * @param end - End point
 * @param endAnchor - End anchor position
 * @param waypoints - Array of waypoint positions
 * @returns SVG path string
 */
export function bezierWithWaypoints(
  start: Point,
  startAnchor: AnchorPosition,
  end: Point,
  endAnchor: AnchorPosition,
  waypoints: Point[]
): string {
  if (waypoints.length === 0) {
    // No waypoints - use standard bezier
    const { cp1, cp2 } = calculateAutoControlPoints(start, startAnchor, end, endAnchor);
    return bezierToSVGPath({ start, cp1, cp2, end });
  }

  // Build array of all points
  const allPoints = [start, ...waypoints, end];

  // For a single waypoint, create two bezier segments
  if (waypoints.length === 1) {
    const mid = waypoints[0];

    // First segment: start -> waypoint
    const cp1_1 = getAnchorOffset(start, startAnchor, getControlDistance(start, mid));
    const cp2_1 = {
      x: mid.x - (mid.x - start.x) * 0.3,
      y: mid.y - (mid.y - start.y) * 0.3,
    };

    // Second segment: waypoint -> end
    const cp1_2 = {
      x: mid.x + (end.x - mid.x) * 0.3,
      y: mid.y + (end.y - mid.y) * 0.3,
    };
    const cp2_2 = getAnchorOffset(end, endAnchor, getControlDistance(mid, end));

    return `M ${start.x} ${start.y} C ${cp1_1.x} ${cp1_1.y}, ${cp2_1.x} ${cp2_1.y}, ${mid.x} ${mid.y} C ${cp1_2.x} ${cp1_2.y}, ${cp2_2.x} ${cp2_2.y}, ${end.x} ${end.y}`;
  }

  // Multiple waypoints - use smooth curve through all points
  let path = `M ${allPoints[0].x} ${allPoints[0].y}`;

  for (let i = 0; i < allPoints.length - 1; i++) {
    const p0 = i > 0 ? allPoints[i - 1] : allPoints[0];
    const p1 = allPoints[i];
    const p2 = allPoints[i + 1];
    const p3 = i < allPoints.length - 2 ? allPoints[i + 2] : allPoints[allPoints.length - 1];

    // Calculate control points using Catmull-Rom to Bezier conversion
    const tension = 0.3;
    const cp1 = {
      x: p1.x + (p2.x - p0.x) * tension,
      y: p1.y + (p2.y - p0.y) * tension,
    };
    const cp2 = {
      x: p2.x - (p3.x - p1.x) * tension,
      y: p2.y - (p3.y - p1.y) * tension,
    };

    // Override control points for first and last segments with anchor-based controls
    if (i === 0) {
      const offset = getAnchorOffset(p1, startAnchor, getControlDistance(p1, p2) * 0.5);
      cp1.x = offset.x;
      cp1.y = offset.y;
    }
    if (i === allPoints.length - 2) {
      const offset = getAnchorOffset(p2, endAnchor, getControlDistance(p1, p2) * 0.5);
      cp2.x = offset.x;
      cp2.y = offset.y;
    }

    path += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p2.x} ${p2.y}`;
  }

  return path;
}
