import type { Point } from './common';

/**
 * State for the selection box (marquee) during drag selection
 */
export interface SelectionBoxState {
  /** Starting point of the selection box in canvas coordinates */
  startPoint: Point;
  /** Current mouse position in canvas coordinates */
  currentPoint: Point;
  /** Whether Shift is held (for add-to-selection behavior) */
  isShiftHeld: boolean;
}

/**
 * Alignment options for multiple shapes
 */
export type AlignmentType =
  | 'left'
  | 'centerHorizontal'
  | 'right'
  | 'top'
  | 'centerVertical'
  | 'bottom';

/**
 * Bounding box for multiple selected shapes
 */
export interface SelectionBounds {
  /** Left edge (same as minX) */
  x: number;
  /** Top edge (same as minY) */
  y: number;
  /** Width of bounding box */
  width: number;
  /** Height of bounding box */
  height: number;
  /** Minimum X coordinate */
  minX: number;
  /** Maximum X coordinate */
  maxX: number;
  /** Minimum Y coordinate */
  minY: number;
  /** Maximum Y coordinate */
  maxY: number;
}
