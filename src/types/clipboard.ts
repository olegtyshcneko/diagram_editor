import type { ShapeType, StrokeStyle, TextStyle, TextContent } from './shapes';
import type { AnchorPosition, ArrowType } from './connections';
import type { SelectionBounds } from './selection';

/**
 * Shape data stored in clipboard (without id, will be regenerated on paste)
 */
export interface ClipboardShape {
  /** Original shape ID for connection remapping */
  originalId: string;
  /** Shape type */
  type: ShapeType;
  /** X position */
  x: number;
  /** Y position */
  y: number;
  /** Width */
  width: number;
  /** Height */
  height: number;
  /** Rotation in degrees */
  rotation: number;
  /** Fill color */
  fill: string;
  /** Fill opacity (0-1) */
  fillOpacity: number;
  /** Stroke color */
  stroke: string;
  /** Stroke width */
  strokeWidth: number;
  /** Stroke style */
  strokeStyle: StrokeStyle;
  /** Corner radius (for rectangles) */
  cornerRadius?: number;
  /** Text content */
  text?: TextContent;
  /** Text styling */
  textStyle?: TextStyle;
}

/**
 * Connection data stored in clipboard
 */
export interface ClipboardConnection {
  /** Original source shape ID */
  sourceOriginalId: string;
  /** Original target shape ID */
  targetOriginalId: string;
  /** Source anchor position */
  sourceAnchor: AnchorPosition;
  /** Target anchor position */
  targetAnchor: AnchorPosition;
  /** Stroke color */
  stroke: string;
  /** Stroke width */
  strokeWidth: number;
  /** Stroke style */
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  /** Arrow at source end */
  sourceArrow: ArrowType;
  /** Arrow at target end */
  targetArrow: ArrowType;
}

/**
 * Complete clipboard data for copy/paste operations
 */
export interface ClipboardData {
  /** Copied shapes */
  shapes: ClipboardShape[];
  /** Connections between copied shapes only */
  connections: ClipboardConnection[];
  /** Bounding box of copied shapes (for positioning) */
  bounds: SelectionBounds;
  /** Timestamp when copied */
  timestamp: number;
}
