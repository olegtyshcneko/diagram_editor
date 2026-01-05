import type { Point } from '@/types/common';
import type { Shape } from '@/types/shapes';
import type { AnchorPosition } from '@/types/connections';
import { getAllAnchors } from './connection';

/**
 * Snap threshold in pixels - if cursor is within this distance of a specific anchor,
 * that anchor is selected instead of the auto-calculated best anchor.
 */
export const ANCHOR_SNAP_THRESHOLD = 25;

interface AnchorCandidate {
  anchor: AnchorPosition;
  point: Point;
  score: number;
}

export interface BestAnchorResult {
  anchor: AnchorPosition;
  point: Point;
  snapped: boolean; // True if snapped to specific anchor (within threshold)
}

/**
 * Calculate the best anchor point on a target shape.
 *
 * Scoring is based on:
 * - Distance to drag point (50% weight) - closer is better
 * - Approach direction alignment (30% weight) - anchor facing source is better
 * - Opposite anchor bonus (20% weight) - if source is 'right', prefer 'left'
 *
 * If the drag point is within ANCHOR_SNAP_THRESHOLD of a specific anchor,
 * that anchor is selected (snapped) regardless of scoring.
 */
export function calculateBestAnchor(
  targetShape: Shape,
  dragPoint: Point,
  sourcePoint: Point,
  sourceAnchor?: AnchorPosition
): BestAnchorResult {
  const anchors = getAllAnchors(targetShape);

  // First check if we should snap to a specific anchor
  for (const { anchor, point } of anchors) {
    const distance = Math.hypot(point.x - dragPoint.x, point.y - dragPoint.y);
    if (distance <= ANCHOR_SNAP_THRESHOLD) {
      return { anchor, point, snapped: true };
    }
  }

  // Score each anchor for auto-selection
  const candidates: AnchorCandidate[] = anchors.map(({ anchor, point }) => {
    let score = 0;

    // Factor 1: Distance to drag point (closer = better, max 50 points)
    const distanceToDrag = Math.hypot(
      point.x - dragPoint.x,
      point.y - dragPoint.y
    );
    const maxDistance = Math.max(targetShape.width, targetShape.height, 100);
    score += 50 * (1 - Math.min(distanceToDrag / maxDistance, 1));

    // Factor 2: Approach direction (anchor facing source = better, max 30 points)
    // Calculate angle from anchor to source point
    const approachAngle = Math.atan2(
      sourcePoint.y - point.y,
      sourcePoint.x - point.x
    );
    const anchorDirection = getAnchorDirection(anchor);
    const angleDiff = normalizeAngle(approachAngle - anchorDirection);
    score += 30 * (1 - angleDiff / Math.PI);

    // Factor 3: Opposite anchor bonus (max 20 points)
    if (sourceAnchor && isOppositeAnchor(sourceAnchor, anchor)) {
      score += 20;
    }

    return { anchor, point, score };
  });

  // Sort by score (highest first) and return best
  candidates.sort((a, b) => b.score - a.score);
  return {
    anchor: candidates[0].anchor,
    point: candidates[0].point,
    snapped: false,
  };
}

/**
 * Get the outward direction angle for an anchor position.
 * - top: -π/2 (points up)
 * - bottom: π/2 (points down)
 * - left: π (points left)
 * - right: 0 (points right)
 */
export function getAnchorDirection(anchor: AnchorPosition): number {
  switch (anchor) {
    case 'top':
      return -Math.PI / 2;
    case 'bottom':
      return Math.PI / 2;
    case 'left':
      return Math.PI;
    case 'right':
      return 0;
  }
}

/**
 * Check if two anchors are opposite (left↔right, top↔bottom)
 */
export function isOppositeAnchor(
  a: AnchorPosition,
  b: AnchorPosition
): boolean {
  return (
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left') ||
    (a === 'top' && b === 'bottom') ||
    (a === 'bottom' && b === 'top')
  );
}

/**
 * Normalize an angle difference to [0, π]
 */
function normalizeAngle(angle: number): number {
  // First normalize to [-π, π]
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  // Return absolute value (we care about magnitude of difference, not direction)
  return Math.abs(angle);
}

/**
 * Check if a point is inside a shape's bounding box.
 * Note: This is a simple AABB check. For rotated shapes or ellipses,
 * use hitTestShape from hitTest.ts for accurate detection.
 */
export function isPointInShapeBounds(point: Point, shape: Shape): boolean {
  const padding = (shape.strokeWidth || 0) / 2;
  return (
    point.x >= shape.x - padding &&
    point.x <= shape.x + shape.width + padding &&
    point.y >= shape.y - padding &&
    point.y <= shape.y + shape.height + padding
  );
}
