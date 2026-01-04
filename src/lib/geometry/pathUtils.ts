/**
 * Path utilities for connection labels and waypoints
 *
 * Provides unified functions for calculating positions along any connection type
 * (straight, bezier, orthogonal) with or without waypoints.
 */

import type { Point } from '@/types/common';
import type { AnchorPosition, CurveType, Waypoint } from '@/types/connections';
import { getPointOnBezier, type BezierCurve } from './bezier';
import { calculateOrthogonalPath } from './orthogonal';

export interface PathOptions {
  /** Control point 1 for bezier curves */
  cp1?: Point;
  /** Control point 2 for bezier curves */
  cp2?: Point;
  /** Source anchor position (for orthogonal) */
  startAnchor?: AnchorPosition;
  /** Target anchor position (for orthogonal) */
  endAnchor?: AnchorPosition;
  /** Existing waypoints (already converted to absolute positions) */
  waypointPositions?: Point[];
}

// ============== Waypoint Conversion Functions ==============

/**
 * Convert a relative waypoint to its absolute position
 *
 * @param waypoint - Waypoint with t and offset
 * @param start - Connection start point
 * @param end - Connection end point
 * @returns Absolute position of the waypoint
 */
export function waypointToAbsolute(
  waypoint: Waypoint,
  start: Point,
  end: Point
): Point {
  // Calculate baseline point at t
  const baselinePoint = {
    x: start.x + waypoint.t * (end.x - start.x),
    y: start.y + waypoint.t * (end.y - start.y),
  };

  // Add offset
  return {
    x: baselinePoint.x + waypoint.offset.x,
    y: baselinePoint.y + waypoint.offset.y,
  };
}

/**
 * Convert all waypoints to absolute positions
 *
 * @param waypoints - Array of waypoints with t and offset
 * @param start - Connection start point
 * @param end - Connection end point
 * @returns Array of absolute positions
 */
export function waypointsToAbsolute(
  waypoints: Waypoint[],
  start: Point,
  end: Point
): Point[] {
  return waypoints.map((wp) => waypointToAbsolute(wp, start, end));
}

/**
 * Convert an absolute position to a relative waypoint
 *
 * @param absolutePoint - Absolute position
 * @param start - Connection start point
 * @param end - Connection end point
 * @param id - ID for the waypoint
 * @returns Waypoint with t and offset
 */
export function absoluteToWaypoint(
  absolutePoint: Point,
  start: Point,
  end: Point,
  id: string
): Waypoint {
  // Calculate t by projecting point onto the start-end line
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSq = dx * dx + dy * dy;

  let t: number;
  if (lengthSq === 0) {
    t = 0;
  } else {
    t = ((absolutePoint.x - start.x) * dx + (absolutePoint.y - start.y) * dy) / lengthSq;
    // Clamp t to [0, 1] to keep baseline point between start and end
    t = Math.max(0, Math.min(1, t));
  }

  // Calculate baseline point at t
  const baselinePoint = {
    x: start.x + t * dx,
    y: start.y + t * dy,
  };

  // Calculate offset from baseline
  const offset = {
    x: absolutePoint.x - baselinePoint.x,
    y: absolutePoint.y - baselinePoint.y,
  };

  return { id, t, offset };
}

/**
 * Get a point along any connection path at position t (0-1)
 *
 * @param curveType - Connection curve type
 * @param start - Start point of the connection
 * @param end - End point of the connection
 * @param t - Position along path (0 = start, 1 = end)
 * @param options - Additional options (control points, anchors, waypoints)
 * @returns Point at position t along the path
 */
export function getPointOnPath(
  curveType: CurveType,
  start: Point,
  end: Point,
  t: number,
  options: PathOptions = {}
): Point {
  // Clamp t to [0, 1]
  t = Math.max(0, Math.min(1, t));

  const waypointPoints = options.waypointPositions || [];

  if (curveType === 'bezier' && waypointPoints.length === 0) {
    // Simple bezier curve without waypoints
    if (options.cp1 && options.cp2) {
      const curve: BezierCurve = {
        start,
        cp1: options.cp1,
        cp2: options.cp2,
        end,
      };
      return getPointOnBezier(curve, t);
    }
  }

  // For all other cases, convert to polyline and interpolate
  const pathPoints = getPathPoints(curveType, start, end, options);
  return getPointOnPolyline(pathPoints, t);
}

/**
 * Get all path points as a polyline (for rendering and calculations)
 */
export function getPathPoints(
  curveType: CurveType,
  start: Point,
  end: Point,
  options: PathOptions = {}
): Point[] {
  const waypointPoints = options.waypointPositions || [];

  if (curveType === 'orthogonal') {
    // Orthogonal routing
    if (waypointPoints.length === 0) {
      return calculateOrthogonalPath(
        start,
        options.startAnchor || 'right',
        end,
        options.endAnchor || 'left'
      );
    }
    // With waypoints: route through each waypoint
    return routeOrthogonalWithWaypoints(start, end, waypointPoints, options);
  }

  if (curveType === 'bezier' && waypointPoints.length === 0) {
    // Sample bezier curve to polyline for consistent handling
    if (options.cp1 && options.cp2) {
      return sampleBezierToPolyline(start, options.cp1, options.cp2, end, 20);
    }
  }

  // Straight or bezier with waypoints: simple polyline
  return [start, ...waypointPoints, end];
}

/**
 * Find the nearest t-value (0-1) for a point on the path
 * Used for placing labels/waypoints where user clicks
 */
export function findNearestTOnPath(
  curveType: CurveType,
  clickPoint: Point,
  start: Point,
  end: Point,
  options: PathOptions = {}
): { t: number; distance: number; point: Point } {
  const pathPoints = getPathPoints(curveType, start, end, options);
  return findNearestTOnPolyline(pathPoints, clickPoint);
}

/**
 * Get total length of a path
 */
export function getPathTotalLength(
  curveType: CurveType,
  start: Point,
  end: Point,
  options: PathOptions = {}
): number {
  const pathPoints = getPathPoints(curveType, start, end, options);
  return getPolylineLength(pathPoints);
}

/**
 * Calculate the insertion index for a new waypoint based on click position
 *
 * @param clickPoint - Where the user clicked
 * @param existingWaypointPositions - Current waypoint absolute positions
 * @param start - Connection start point
 * @param end - Connection end point
 * @returns Index where the new waypoint should be inserted
 */
export function calculateWaypointInsertIndex(
  clickPoint: Point,
  existingWaypointPositions: Point[],
  start: Point,
  end: Point
): number {
  if (existingWaypointPositions.length === 0) {
    return 0;
  }

  // Build array of all points including start and end
  const allPoints = [
    start,
    ...existingWaypointPositions,
    end,
  ];

  // Find which segment the click is closest to
  let minDistance = Infinity;
  let insertIndex = 0;

  for (let i = 0; i < allPoints.length - 1; i++) {
    const segStart = allPoints[i];
    const segEnd = allPoints[i + 1];

    const distance = pointToSegmentDistance(clickPoint, segStart, segEnd);

    if (distance < minDistance) {
      minDistance = distance;
      // Insert after segment i means inserting at index i in waypoints array
      // (because segment 0 is start→waypoint[0], segment 1 is waypoint[0]→waypoint[1], etc.)
      insertIndex = i;
    }
  }

  return insertIndex;
}

// ============== Internal helper functions ==============

/**
 * Get point on a polyline at position t (0-1)
 */
function getPointOnPolyline(points: Point[], t: number): Point {
  if (points.length < 2) {
    return points[0] || { x: 0, y: 0 };
  }

  const totalLength = getPolylineLength(points);
  if (totalLength === 0) {
    return points[0];
  }

  const targetLength = t * totalLength;
  let accumulatedLength = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const segmentLength = getSegmentLength(points[i], points[i + 1]);

    if (accumulatedLength + segmentLength >= targetLength) {
      // Found the segment containing target position
      const segmentT =
        segmentLength === 0
          ? 0
          : (targetLength - accumulatedLength) / segmentLength;

      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * segmentT,
        y: points[i].y + (points[i + 1].y - points[i].y) * segmentT,
      };
    }

    accumulatedLength += segmentLength;
  }

  // Fallback to end point
  return points[points.length - 1];
}

/**
 * Find nearest t-value on a polyline
 */
function findNearestTOnPolyline(
  points: Point[],
  targetPoint: Point
): { t: number; distance: number; point: Point } {
  if (points.length < 2) {
    const point = points[0] || { x: 0, y: 0 };
    return {
      t: 0,
      distance: Math.hypot(targetPoint.x - point.x, targetPoint.y - point.y),
      point,
    };
  }

  const totalLength = getPolylineLength(points);
  let accumulatedLength = 0;
  let minDistance = Infinity;
  let bestT = 0;
  let bestPoint: Point = points[0];

  for (let i = 0; i < points.length - 1; i++) {
    const segStart = points[i];
    const segEnd = points[i + 1];
    const segmentLength = getSegmentLength(segStart, segEnd);

    // Find nearest point on this segment
    const nearest = nearestPointOnSegment(targetPoint, segStart, segEnd);
    const distance = Math.hypot(
      targetPoint.x - nearest.point.x,
      targetPoint.y - nearest.point.y
    );

    if (distance < minDistance) {
      minDistance = distance;
      bestPoint = nearest.point;

      // Calculate t value
      const distanceOnSegment = getSegmentLength(segStart, nearest.point);
      bestT =
        totalLength === 0
          ? 0
          : (accumulatedLength + distanceOnSegment) / totalLength;
    }

    accumulatedLength += segmentLength;
  }

  return { t: bestT, distance: minDistance, point: bestPoint };
}

/**
 * Get total length of polyline
 */
function getPolylineLength(points: Point[]): number {
  let length = 0;
  for (let i = 0; i < points.length - 1; i++) {
    length += getSegmentLength(points[i], points[i + 1]);
  }
  return length;
}

/**
 * Get length of a line segment
 */
function getSegmentLength(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Find nearest point on a line segment
 */
function nearestPointOnSegment(
  point: Point,
  segStart: Point,
  segEnd: Point
): { point: Point; t: number } {
  const dx = segEnd.x - segStart.x;
  const dy = segEnd.y - segStart.y;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    return { point: segStart, t: 0 };
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - segStart.x) * dx + (point.y - segStart.y) * dy) / lengthSq
    )
  );

  return {
    point: {
      x: segStart.x + t * dx,
      y: segStart.y + t * dy,
    },
    t,
  };
}

/**
 * Calculate distance from point to line segment
 */
function pointToSegmentDistance(
  point: Point,
  segStart: Point,
  segEnd: Point
): number {
  const { point: nearest } = nearestPointOnSegment(point, segStart, segEnd);
  return Math.hypot(point.x - nearest.x, point.y - nearest.y);
}

/**
 * Sample a bezier curve into a polyline for consistent calculations
 */
function sampleBezierToPolyline(
  start: Point,
  cp1: Point,
  cp2: Point,
  end: Point,
  samples: number
): Point[] {
  const curve: BezierCurve = { start, cp1, cp2, end };
  const points: Point[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    points.push(getPointOnBezier(curve, t));
  }

  return points;
}

/**
 * Route orthogonal path through waypoints
 * Each waypoint forces the path to pass through it
 */
function routeOrthogonalWithWaypoints(
  start: Point,
  end: Point,
  waypoints: Point[],
  options: PathOptions
): Point[] {
  const allCheckpoints = [start, ...waypoints, end];
  const result: Point[] = [start];

  for (let i = 0; i < allCheckpoints.length - 1; i++) {
    const from = allCheckpoints[i];
    const to = allCheckpoints[i + 1];

    // Determine anchors for this segment
    const fromAnchor = i === 0 ? options.startAnchor || 'right' : inferExitAnchor(from, to);
    const toAnchor =
      i === allCheckpoints.length - 2
        ? options.endAnchor || 'left'
        : inferEntryAnchor(from, to);

    // Get path for this segment
    const segmentPath = calculateOrthogonalPath(from, fromAnchor, to, toAnchor);

    // Add points (skip first to avoid duplication)
    for (let j = 1; j < segmentPath.length; j++) {
      result.push(segmentPath[j]);
    }
  }

  return result;
}

/**
 * Infer best exit anchor based on relative position
 */
function inferExitAnchor(from: Point, to: Point): AnchorPosition {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'bottom' : 'top';
  }
}

/**
 * Infer best entry anchor based on relative position
 */
function inferEntryAnchor(from: Point, to: Point): AnchorPosition {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'left' : 'right';
  } else {
    return dy > 0 ? 'top' : 'bottom';
  }
}
