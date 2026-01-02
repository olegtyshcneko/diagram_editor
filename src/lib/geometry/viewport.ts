import type { Point, Size } from '@/types/common';
import type { Viewport } from '@/types/viewport';
import { CANVAS_DEFAULTS } from '@/lib/constants';

/**
 * Calculate SVG viewBox string from viewport state
 */
export function calculateViewBox(viewport: Viewport, containerSize: Size): string {
  const { x, y, zoom } = viewport;
  const { width, height } = containerSize;

  const viewWidth = width / zoom;
  const viewHeight = height / zoom;

  return `${x} ${y} ${viewWidth} ${viewHeight}`;
}

/**
 * Convert screen coordinates (relative to container) to canvas coordinates
 */
export function screenToCanvas(
  screenPoint: Point,
  viewport: Viewport,
  _containerSize: Size
): Point {
  const { x: viewX, y: viewY, zoom } = viewport;

  return {
    x: viewX + screenPoint.x / zoom,
    y: viewY + screenPoint.y / zoom,
  };
}

/**
 * Convert canvas coordinates to screen coordinates (relative to container)
 */
export function canvasToScreen(
  canvasPoint: Point,
  viewport: Viewport,
  _containerSize: Size
): Point {
  const { x: viewX, y: viewY, zoom } = viewport;

  return {
    x: (canvasPoint.x - viewX) * zoom,
    y: (canvasPoint.y - viewY) * zoom,
  };
}

/**
 * Clamp zoom to valid range
 */
export function clampZoom(zoom: number): number {
  return Math.max(
    CANVAS_DEFAULTS.MIN_ZOOM,
    Math.min(CANVAS_DEFAULTS.MAX_ZOOM, zoom)
  );
}

/**
 * Calculate new viewport after zooming at a specific screen point.
 * The point under the cursor stays fixed during zoom.
 */
export function zoomAtPoint(
  currentViewport: Viewport,
  zoomDelta: number,
  screenPoint: Point,
  _containerSize: Size
): Viewport {
  const { zoom: currentZoom, x: currentX, y: currentY } = currentViewport;

  // Calculate new zoom level with limits
  const newZoom = clampZoom(currentZoom + zoomDelta);

  // If zoom didn't change (at limits), return current viewport
  if (newZoom === currentZoom) {
    return currentViewport;
  }

  // Calculate canvas point under cursor before zoom
  const canvasX = currentX + screenPoint.x / currentZoom;
  const canvasY = currentY + screenPoint.y / currentZoom;

  // Calculate new viewport position to keep canvas point under cursor
  const newX = canvasX - screenPoint.x / newZoom;
  const newY = canvasY - screenPoint.y / newZoom;

  return {
    x: newX,
    y: newY,
    zoom: newZoom,
  };
}
