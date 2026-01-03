import type { Shape } from '@/types/shapes';

/**
 * Z-order modification result - maps shape IDs to new zIndex values
 */
export interface ZOrderUpdate {
  id: string;
  zIndex: number;
}

/**
 * Calculate new z-indexes for bringing selected shapes to front
 */
export function calculateBringToFront(
  allShapes: Shape[],
  selectedIds: string[]
): ZOrderUpdate[] {
  if (selectedIds.length === 0) return [];

  const sorted = [...allShapes].sort((a, b) => a.zIndex - b.zIndex);
  const selectedSet = new Set(selectedIds);

  // Find max zIndex
  const maxZ = sorted.length > 0 ? sorted[sorted.length - 1].zIndex : 0;

  // Selected shapes should be at the top, preserving their relative order
  const updates: ZOrderUpdate[] = [];
  let nextZ = maxZ + 1;

  // Sort selected by their current zIndex to preserve relative order
  const selectedShapes = sorted.filter((s) => selectedSet.has(s.id));
  for (const shape of selectedShapes) {
    updates.push({ id: shape.id, zIndex: nextZ++ });
  }

  return updates;
}

/**
 * Calculate new z-indexes for sending selected shapes to back
 */
export function calculateSendToBack(
  allShapes: Shape[],
  selectedIds: string[]
): ZOrderUpdate[] {
  if (selectedIds.length === 0) return [];

  const sorted = [...allShapes].sort((a, b) => a.zIndex - b.zIndex);
  const selectedSet = new Set(selectedIds);

  // Find min zIndex
  const minZ = sorted.length > 0 ? sorted[0].zIndex : 0;

  const updates: ZOrderUpdate[] = [];

  // Selected shapes go to bottom with negative offsets
  // Sort selected by their current zIndex to preserve relative order
  const selectedShapes = sorted.filter((s) => selectedSet.has(s.id));
  let nextZ = minZ - selectedShapes.length;

  for (const shape of selectedShapes) {
    updates.push({ id: shape.id, zIndex: nextZ++ });
  }

  return updates;
}

/**
 * Calculate new z-indexes for bringing selected shapes one level forward
 */
export function calculateBringForward(
  allShapes: Shape[],
  selectedIds: string[]
): ZOrderUpdate[] {
  if (selectedIds.length === 0) return [];

  const sorted = [...allShapes].sort((a, b) => a.zIndex - b.zIndex);
  const selectedSet = new Set(selectedIds);

  // Find the first non-selected shape that's above all selected shapes
  const selectedShapes = sorted.filter((s) => selectedSet.has(s.id));
  if (selectedShapes.length === 0) return [];

  const maxSelectedZ = Math.max(...selectedShapes.map((s) => s.zIndex));
  const unselectedAbove = sorted.filter(
    (s) => !selectedSet.has(s.id) && s.zIndex > maxSelectedZ
  );

  if (unselectedAbove.length === 0) {
    // Already at front
    return [];
  }

  // Swap with the next shape above
  const nextAbove = unselectedAbove[0];
  const updates: ZOrderUpdate[] = [];

  // Move selected shapes up and the shape above them down
  for (const shape of selectedShapes) {
    updates.push({ id: shape.id, zIndex: nextAbove.zIndex });
  }
  updates.push({ id: nextAbove.id, zIndex: selectedShapes[0].zIndex });

  return updates;
}

/**
 * Calculate new z-indexes for sending selected shapes one level backward
 */
export function calculateSendBackward(
  allShapes: Shape[],
  selectedIds: string[]
): ZOrderUpdate[] {
  if (selectedIds.length === 0) return [];

  const sorted = [...allShapes].sort((a, b) => a.zIndex - b.zIndex);
  const selectedSet = new Set(selectedIds);

  // Find the first non-selected shape that's below all selected shapes
  const selectedShapes = sorted.filter((s) => selectedSet.has(s.id));
  if (selectedShapes.length === 0) return [];

  const minSelectedZ = Math.min(...selectedShapes.map((s) => s.zIndex));
  const unselectedBelow = sorted.filter(
    (s) => !selectedSet.has(s.id) && s.zIndex < minSelectedZ
  );

  if (unselectedBelow.length === 0) {
    // Already at back
    return [];
  }

  // Swap with the shape just below
  const nextBelow = unselectedBelow[unselectedBelow.length - 1];
  const updates: ZOrderUpdate[] = [];

  // Move selected shapes down and the shape below them up
  for (const shape of selectedShapes) {
    updates.push({ id: shape.id, zIndex: nextBelow.zIndex });
  }
  updates.push({ id: nextBelow.id, zIndex: selectedShapes[selectedShapes.length - 1].zIndex });

  return updates;
}
