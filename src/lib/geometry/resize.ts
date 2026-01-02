import type { Point, Bounds } from '@/types/common';
import type { HandleType, ResizeOptions, ResizeResult } from '@/types/interaction';
import { isCornerHandle } from './manipulation';

/**
 * Calculate new bounds based on handle drag.
 * Handles all 8 resize directions with optional constraints.
 */
export function calculateResize(
  startBounds: Bounds,
  handle: HandleType,
  delta: Point,
  options: ResizeOptions
): ResizeResult {
  const { maintainAspectRatio, resizeFromCenter, originalAspectRatio, minSize } = options;

  let newBounds = calculateRawResize(startBounds, handle, delta);

  // Apply aspect ratio constraint (only for corner handles)
  if (maintainAspectRatio && isCornerHandle(handle)) {
    newBounds = applyAspectRatio(newBounds, startBounds, handle, originalAspectRatio);
  }

  // Apply minimum size constraints
  newBounds = enforceMinimumSize(newBounds, startBounds, handle, minSize);

  // Apply center resize if Alt is held
  if (resizeFromCenter) {
    newBounds = applyResizeFromCenter(newBounds, startBounds);
  }

  return newBounds;
}

/**
 * Calculate raw resize based on handle position without constraints
 */
function calculateRawResize(startBounds: Bounds, handle: HandleType, delta: Point): ResizeResult {
  let { x, y, width, height } = startBounds;

  switch (handle) {
    case 'nw':
      // Top-left: move origin, adjust size
      x += delta.x;
      y += delta.y;
      width -= delta.x;
      height -= delta.y;
      break;

    case 'n':
      // Top-center: only adjust top edge
      y += delta.y;
      height -= delta.y;
      break;

    case 'ne':
      // Top-right: adjust top and right edges
      y += delta.y;
      width += delta.x;
      height -= delta.y;
      break;

    case 'w':
      // Left-center: only adjust left edge
      x += delta.x;
      width -= delta.x;
      break;

    case 'e':
      // Right-center: only adjust right edge
      width += delta.x;
      break;

    case 'sw':
      // Bottom-left: adjust left and bottom edges
      x += delta.x;
      width -= delta.x;
      height += delta.y;
      break;

    case 's':
      // Bottom-center: only adjust bottom edge
      height += delta.y;
      break;

    case 'se':
      // Bottom-right: adjust right and bottom edges
      width += delta.x;
      height += delta.y;
      break;
  }

  return { x, y, width, height };
}

/**
 * Apply aspect ratio constraint to maintain original proportions
 */
function applyAspectRatio(
  newBounds: ResizeResult,
  startBounds: Bounds,
  handle: HandleType,
  aspectRatio: number
): ResizeResult {
  let { x, y, width, height } = newBounds;

  // Determine which dimension changed more and adjust the other
  const widthChange = Math.abs(width - startBounds.width);
  const heightChange = Math.abs(height - startBounds.height);

  if (widthChange >= heightChange) {
    // Width changed more, adjust height to match aspect ratio
    const targetHeight = width / aspectRatio;
    const heightDiff = targetHeight - height;

    // Adjust y position for handles that affect top edge
    if (handle === 'nw' || handle === 'ne') {
      y -= heightDiff;
    }
    height = targetHeight;
  } else {
    // Height changed more, adjust width to match aspect ratio
    const targetWidth = height * aspectRatio;
    const widthDiff = targetWidth - width;

    // Adjust x position for handles that affect left edge
    if (handle === 'nw' || handle === 'sw') {
      x -= widthDiff;
    }
    width = targetWidth;
  }

  return { x, y, width, height };
}

/**
 * Enforce minimum size constraints
 */
function enforceMinimumSize(
  newBounds: ResizeResult,
  startBounds: Bounds,
  handle: HandleType,
  minSize: number
): ResizeResult {
  let { x, y, width, height } = newBounds;

  // Enforce minimum width
  if (width < minSize) {
    width = minSize;
    // Adjust position based on which edge was being dragged
    if (handle.includes('w')) {
      // Left edge was being dragged, fix right edge position
      x = startBounds.x + startBounds.width - minSize;
    }
    // For 'e' handles, x stays the same (right edge was being dragged)
  }

  // Enforce minimum height
  if (height < minSize) {
    height = minSize;
    // Adjust position based on which edge was being dragged
    if (handle.includes('n')) {
      // Top edge was being dragged, fix bottom edge position
      y = startBounds.y + startBounds.height - minSize;
    }
    // For 's' handles, y stays the same (bottom edge was being dragged)
  }

  return { x, y, width, height };
}

/**
 * Apply resize from center (Alt key behavior).
 * The center point remains stationary while both sides expand/contract equally.
 */
function applyResizeFromCenter(
  newBounds: ResizeResult,
  startBounds: Bounds
): ResizeResult {
  // Calculate how much the bounds changed
  const widthDelta = newBounds.width - startBounds.width;
  const heightDelta = newBounds.height - startBounds.height;

  // Apply the change symmetrically from center
  // Double the size change and center it
  return {
    x: startBounds.x - widthDelta,
    y: startBounds.y - heightDelta,
    width: startBounds.width + widthDelta * 2,
    height: startBounds.height + heightDelta * 2,
  };
}
