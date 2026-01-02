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
