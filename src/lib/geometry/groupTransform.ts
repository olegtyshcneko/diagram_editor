import type { Shape } from '@/types/shapes';
import type { Bounds, Point } from '@/types/common';
import type { HandleType } from '@/types/interaction';

/**
 * Snapshot of a shape's transform state at the start of a group manipulation
 */
export interface ShapeState {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

/**
 * Get the anchor point (opposite to the handle being dragged).
 * This is the point that stays fixed during resize.
 */
function getAnchorPoint(bounds: Bounds, handle: HandleType): Point {
  const { x, y, width, height } = bounds;

  switch (handle) {
    case 'nw': return { x: x + width, y: y + height };  // Anchor at SE
    case 'n':  return { x: x + width / 2, y: y + height };  // Anchor at S center
    case 'ne': return { x, y: y + height };  // Anchor at SW
    case 'e':  return { x, y: y + height / 2 };  // Anchor at W center
    case 'se': return { x, y };  // Anchor at NW
    case 's':  return { x: x + width / 2, y };  // Anchor at N center
    case 'sw': return { x: x + width, y };  // Anchor at NE
    case 'w':  return { x: x + width, y: y + height / 2 };  // Anchor at E center
    default:   return { x: x + width / 2, y: y + height / 2 };  // Center
  }
}

/**
 * Scale all shapes proportionally when resizing a group.
 * Each shape's position (relative to group) and dimensions are scaled.
 */
export function scaleShapesInGroup(
  startStates: Record<string, ShapeState>,
  startGroupBounds: Bounds,
  newGroupBounds: Bounds,
  handle: HandleType
): Record<string, Partial<Shape>> {
  const updates: Record<string, Partial<Shape>> = {};

  // Calculate scale factors
  const scaleX = startGroupBounds.width > 0
    ? newGroupBounds.width / startGroupBounds.width
    : 1;
  const scaleY = startGroupBounds.height > 0
    ? newGroupBounds.height / startGroupBounds.height
    : 1;

  // Get anchor points (the fixed corner/edge)
  const startAnchor = getAnchorPoint(startGroupBounds, handle);
  const newAnchor = getAnchorPoint(newGroupBounds, handle);

  for (const [shapeId, state] of Object.entries(startStates)) {
    // Calculate shape center relative to start anchor
    const shapeCenterX = state.x + state.width / 2;
    const shapeCenterY = state.y + state.height / 2;

    // Scale the relative position from anchor
    const relX = shapeCenterX - startAnchor.x;
    const relY = shapeCenterY - startAnchor.y;

    const newRelX = relX * scaleX;
    const newRelY = relY * scaleY;

    // Calculate new center position relative to new anchor
    const newCenterX = newAnchor.x + newRelX;
    const newCenterY = newAnchor.y + newRelY;

    // Scale dimensions (enforce minimum of 10)
    const newWidth = Math.max(10, state.width * Math.abs(scaleX));
    const newHeight = Math.max(10, state.height * Math.abs(scaleY));

    // Calculate new top-left position from center
    updates[shapeId] = {
      x: Math.round(newCenterX - newWidth / 2),
      y: Math.round(newCenterY - newHeight / 2),
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    };
  }

  return updates;
}

/**
 * Rotate all shapes around a center point.
 * Updates both position and rotation for each shape.
 */
export function rotateShapesAroundCenter(
  startStates: Record<string, ShapeState>,
  center: Point,
  angleDelta: number
): Record<string, Partial<Shape>> {
  const updates: Record<string, Partial<Shape>> = {};
  const radians = (angleDelta * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  for (const [shapeId, state] of Object.entries(startStates)) {
    // Get shape center
    const shapeCenterX = state.x + state.width / 2;
    const shapeCenterY = state.y + state.height / 2;

    // Translate to origin (group center)
    const relX = shapeCenterX - center.x;
    const relY = shapeCenterY - center.y;

    // Rotate around origin
    const rotatedX = relX * cos - relY * sin;
    const rotatedY = relX * sin + relY * cos;

    // Translate back
    const newCenterX = rotatedX + center.x;
    const newCenterY = rotatedY + center.y;

    // Update position (keep dimensions same)
    updates[shapeId] = {
      x: Math.round(newCenterX - state.width / 2),
      y: Math.round(newCenterY - state.height / 2),
      // Add angle delta to shape's own rotation
      rotation: normalizeAngle(state.rotation + angleDelta),
    };
  }

  return updates;
}

/**
 * Normalize angle to 0-360 range
 */
function normalizeAngle(angle: number): number {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return Math.round(normalized);
}
