/**
 * Orthogonal routing utilities for connections
 *
 * Orthogonal connections use only horizontal and vertical segments,
 * creating clean right-angle paths commonly used in flowcharts and UML.
 */

import type { Point } from '@/types/common';
import type { AnchorPosition } from '@/types/connections';

/** Routing strategy based on anchor positions */
export type RoutingStrategy = 'direct' | 'z-shape' | 'u-shape';

/** Distance to exit perpendicular from anchor before turning */
const EXIT_OFFSET = 20;

/**
 * Calculate orthogonal path between two anchor points
 *
 * @param start - Start point (source anchor position)
 * @param startAnchor - Which anchor on source shape
 * @param end - End point (target anchor position)
 * @param endAnchor - Which anchor on target shape
 * @returns Array of points forming the orthogonal path
 */
export function calculateOrthogonalPath(
  start: Point,
  startAnchor: AnchorPosition,
  end: Point,
  endAnchor: AnchorPosition
): Point[] {
  const points: Point[] = [start];

  // Get exit and entry points (offset from anchors)
  const exitPoint = getExitPoint(start, startAnchor, EXIT_OFFSET);
  const entryPoint = getExitPoint(end, endAnchor, EXIT_OFFSET);

  // Determine routing strategy based on anchor positions AND shape positions
  const strategy = determineStrategy(startAnchor, endAnchor, start, end);

  switch (strategy) {
    case 'direct':
      // L-shaped path: one turn (perpendicular anchors)
      points.push(exitPoint);
      if (isHorizontal(startAnchor)) {
        // Start horizontal, turn vertical
        points.push({ x: exitPoint.x, y: entryPoint.y });
      } else {
        // Start vertical, turn horizontal
        points.push({ x: entryPoint.x, y: exitPoint.y });
      }
      break;

    case 'z-shape':
      // Z-shaped path: two turns (opposite anchors on same axis)
      points.push(exitPoint);
      if (isHorizontal(startAnchor)) {
        // Horizontal-vertical-horizontal
        const midX = (exitPoint.x + entryPoint.x) / 2;
        points.push({ x: midX, y: exitPoint.y });
        points.push({ x: midX, y: entryPoint.y });
      } else {
        // Vertical-horizontal-vertical
        const midY = (exitPoint.y + entryPoint.y) / 2;
        points.push({ x: exitPoint.x, y: midY });
        points.push({ x: entryPoint.x, y: midY });
      }
      break;

    case 'u-shape':
      // U-shaped path: goes around (same-direction anchors)
      points.push(exitPoint);

      // Calculate offset to go around
      const offset = Math.max(
        Math.abs(end.x - start.x) * 0.3,
        Math.abs(end.y - start.y) * 0.3,
        50
      );

      if (isHorizontal(startAnchor)) {
        // Both anchors exit horizontally
        const farX =
          startAnchor === 'right'
            ? Math.max(exitPoint.x, entryPoint.x) + offset
            : Math.min(exitPoint.x, entryPoint.x) - offset;
        points.push({ x: farX, y: exitPoint.y });
        points.push({ x: farX, y: entryPoint.y });
      } else {
        // Both anchors exit vertically
        const farY =
          startAnchor === 'bottom'
            ? Math.max(exitPoint.y, entryPoint.y) + offset
            : Math.min(exitPoint.y, entryPoint.y) - offset;
        points.push({ x: exitPoint.x, y: farY });
        points.push({ x: entryPoint.x, y: farY });
      }
      break;
  }

  points.push(entryPoint);
  points.push(end);

  return simplifyPath(points);
}

/**
 * Get the exit point from an anchor (offset in anchor direction)
 */
function getExitPoint(
  point: Point,
  anchor: AnchorPosition,
  offset: number
): Point {
  switch (anchor) {
    case 'top':
      return { x: point.x, y: point.y - offset };
    case 'bottom':
      return { x: point.x, y: point.y + offset };
    case 'left':
      return { x: point.x - offset, y: point.y };
    case 'right':
      return { x: point.x + offset, y: point.y };
  }
}

/**
 * Check if an anchor exits horizontally
 */
function isHorizontal(anchor: AnchorPosition): boolean {
  return anchor === 'left' || anchor === 'right';
}

/**
 * Determine the routing strategy based on anchor positions AND shape positions
 *
 * This is smarter than just looking at anchors - it considers whether the
 * anchors are actually facing toward each other or away from each other.
 */
function determineStrategy(
  startAnchor: AnchorPosition,
  endAnchor: AnchorPosition,
  start: Point,
  end: Point
): RoutingStrategy {
  // Same-direction anchors always need U-shape
  if (startAnchor === endAnchor) {
    return 'u-shape';
  }

  // Perpendicular anchors can use direct L-shape
  if (isHorizontal(startAnchor) !== isHorizontal(endAnchor)) {
    return 'direct';
  }

  // Opposite directions on same axis - check if they face each other
  // This is the smart part: right→left only works well if target is to the right
  if (isHorizontal(startAnchor)) {
    // right↔left case
    const sourceGoingRight = startAnchor === 'right';
    const targetIsToRight = end.x > start.x;

    // If source goes right and target is to the right, they face each other → Z-shape
    // If source goes left and target is to the left, they face each other → Z-shape
    // Otherwise they're facing away and need U-shape to go around
    const facingEachOther = sourceGoingRight === targetIsToRight;
    return facingEachOther ? 'z-shape' : 'u-shape';
  } else {
    // top↔bottom case
    const sourceGoingDown = startAnchor === 'bottom';
    const targetIsBelow = end.y > start.y;

    const facingEachOther = sourceGoingDown === targetIsBelow;
    return facingEachOther ? 'z-shape' : 'u-shape';
  }
}

/**
 * Remove redundant points that lie on the same line
 */
function simplifyPath(points: Point[]): Point[] {
  if (points.length <= 2) return points;

  const simplified: Point[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = simplified[simplified.length - 1];
    const curr = points[i];
    const next = points[i + 1];

    // Check if current point is on the same horizontal or vertical line
    const onHorizontalLine = prev.y === curr.y && curr.y === next.y;
    const onVerticalLine = prev.x === curr.x && curr.x === next.x;

    // Only keep points that represent actual turns
    if (!onHorizontalLine && !onVerticalLine) {
      simplified.push(curr);
    }
  }

  simplified.push(points[points.length - 1]);
  return simplified;
}

/**
 * Convert orthogonal path points to SVG path string
 */
export function orthogonalToSVGPath(points: Point[]): string {
  if (points.length < 2) return '';

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }

  return path;
}

/**
 * Check if a point is near an orthogonal path (for hit testing)
 */
export function isPointNearOrthogonalPath(
  point: Point,
  pathPoints: Point[],
  threshold: number
): boolean {
  if (pathPoints.length < 2) return false;

  // Check each segment of the orthogonal path
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const p1 = pathPoints[i];
    const p2 = pathPoints[i + 1];

    if (isPointNearLineSegment(point, p1, p2, threshold)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a point is near a line segment
 */
function isPointNearLineSegment(
  point: Point,
  lineStart: Point,
  lineEnd: Point,
  threshold: number
): boolean {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    // Line segment is a point
    const dist = Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
    return dist <= threshold;
  }

  // Calculate projection of point onto line segment
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) /
        lengthSquared
    )
  );

  // Find the closest point on the segment
  const closestX = lineStart.x + t * dx;
  const closestY = lineStart.y + t * dy;

  // Calculate distance from point to closest point on segment
  const distance = Math.hypot(point.x - closestX, point.y - closestY);

  return distance <= threshold;
}
