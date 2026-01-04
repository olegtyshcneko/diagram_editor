import type { Point } from './common';

// Anchor positions on shapes
export type AnchorPosition = 'top' | 'right' | 'bottom' | 'left';

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

  // Waypoints for custom routing
  waypoints: Point[];

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
  labelPosition?: number; // 0-1 along path
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
  waypoints: [],
  stroke: '#000000',
  strokeWidth: 2,
  strokeStyle: 'solid',
  sourceArrow: 'none',
  targetArrow: 'arrow',
  curveType: 'straight',
};
