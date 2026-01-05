import type { Point } from './common';

// Anchor positions on shapes
export type AnchorPosition = 'top' | 'right' | 'bottom' | 'left';

// Connection label styling
export interface ConnectionLabelStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
}

export const DEFAULT_LABEL_STYLE: ConnectionLabelStyle = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 12,
  color: '#000000',
};

/**
 * Waypoint for connection routing.
 *
 * IMPORTANT: Waypoints are stored as RELATIVE positions, not absolute.
 * This ensures waypoints move correctly when connected shapes are moved.
 *
 * - `t` is the position along the baseline (0-1) from start to end
 * - `offset` is the perpendicular/deviation offset from that baseline point
 *
 * To get absolute position:
 *   baselinePoint = start + t * (end - start)
 *   absolutePosition = baselinePoint + offset
 */
export interface Waypoint {
  id: string;
  /** Position along baseline from start (0) to end (1) */
  t: number;
  /** Offset from the baseline point at t */
  offset: Point;
}

// Arrow marker types
export type ArrowType =
  | 'none'
  | 'arrow'
  | 'open-arrow'
  | 'diamond'
  | 'diamond-filled'
  | 'circle'
  | 'circle-filled';

// Connection curve types
export type CurveType = 'straight' | 'orthogonal' | 'bezier';

/**
 * Control points for bezier curves.
 *
 * IMPORTANT: These are stored as RELATIVE OFFSETS from the connection endpoints,
 * not absolute positions. This ensures curves maintain their shape when shapes move.
 * - cp1 is the offset from the start (source anchor) point
 * - cp2 is the offset from the end (target anchor) point
 *
 * To get absolute positions: absolute = endpoint + offset
 */
export interface ConnectionControlPoints {
  cp1: Point; // Offset from source anchor point
  cp2: Point; // Offset from target anchor point
}

// Connection interface
export interface Connection {
  id: string;
  sourceShapeId: string;
  targetShapeId: string | null;
  sourceAnchor: AnchorPosition;
  targetAnchor: AnchorPosition | null;
  targetPoint?: Point;

  // Endpoint attachment state (for disconnect/reconnect feature)
  sourceAttached: boolean; // false if source endpoint is floating
  targetAttached: boolean; // false if target endpoint is floating
  floatingSourcePoint?: Point; // Position when source is detached
  floatingTargetPoint?: Point; // Position when target is detached

  // Waypoints for custom routing (with IDs for stable drag operations)
  waypoints: Waypoint[];

  // Styling
  stroke: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';

  // Arrows
  sourceArrow: ArrowType;
  targetArrow: ArrowType;

  // Curve
  curveType: CurveType;
  /** Manual control points for bezier (as relative offsets). Auto-calculated if undefined. */
  controlPoints?: ConnectionControlPoints;

  // Label
  label?: string;
  labelPosition?: number; // 0-1 along path (0.5 = midpoint)
  labelStyle?: ConnectionLabelStyle;
}

// Connection creation state (during drag)
export interface ConnectionCreationState {
  sourceShapeId: string;
  sourceAnchor: AnchorPosition;
  sourcePoint: Point;
  currentPoint: Point;
}

// Default connection values
export const DEFAULT_CONNECTION: Omit<Connection, 'id' | 'sourceShapeId' | 'sourceAnchor'> = {
  targetShapeId: null,
  targetAnchor: null,
  sourceAttached: true,
  targetAttached: true,
  waypoints: [],
  stroke: '#000000',
  strokeWidth: 2,
  strokeStyle: 'solid',
  sourceArrow: 'none',
  targetArrow: 'arrow',
  curveType: 'straight',
};
