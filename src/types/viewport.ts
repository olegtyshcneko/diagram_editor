// Point type not used but kept for future reference
// import type { Point } from './common';

/**
 * Viewport state representing the current view of the canvas
 */
export interface Viewport {
  /** Pan offset X in canvas units */
  x: number;
  /** Pan offset Y in canvas units */
  y: number;
  /** Zoom factor (0.1 to 4.0, where 1.0 = 100%) */
  zoom: number;
}

/**
 * Bounds of the visible viewport area in canvas coordinates
 */
export interface ViewportBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}
