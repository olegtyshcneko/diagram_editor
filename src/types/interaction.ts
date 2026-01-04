import type { Point, Bounds } from './common';

/**
 * Handle types for shape selection and manipulation
 * 8 resize handles (corners + edges) + 1 rotation handle
 */
export type HandleType =
  | 'nw' | 'n' | 'ne'  // Top row
  | 'w'  |      'e'     // Middle row (no center)
  | 'sw' | 's' | 'se'  // Bottom row
  | 'rotation';         // Rotation handle above shape

/**
 * Types of manipulation operations
 */
export type ManipulationType = 'move' | 'resize' | 'rotate' | 'group-resize' | 'group-rotate';

/**
 * State tracked during an active manipulation operation
 */
export interface ManipulationState {
  /** Type of manipulation being performed */
  type: ManipulationType;
  /** ID of the shape being manipulated */
  shapeId: string;
  /** Screen coordinates at drag start */
  startPoint: Point;
  /** Shape bounds at drag start */
  startBounds: Bounds;
  /** Shape rotation (degrees) at drag start */
  startRotation: number;
  /** Which handle is being dragged (for resize/rotate) */
  handle?: HandleType;
  /** Original aspect ratio for constrained resize */
  aspectRatio?: number;
}

/**
 * Position and cursor information for a handle
 */
export interface HandlePosition {
  /** Handle type identifier */
  type: HandleType;
  /** X position (center of handle) */
  x: number;
  /** Y position (center of handle) */
  y: number;
  /** CSS cursor to show on hover */
  cursor: string;
}

/**
 * Result of a resize calculation
 */
export interface ResizeResult {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Options for resize calculation
 */
export interface ResizeOptions {
  /** Maintain original aspect ratio (Shift key) */
  maintainAspectRatio: boolean;
  /** Resize from center instead of opposite edge (Alt key) */
  resizeFromCenter: boolean;
  /** Original width/height ratio */
  originalAspectRatio: number;
  /** Minimum allowed size */
  minSize: number;
}
