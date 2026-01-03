import type { Shape } from '@/types/shapes';
import type { AlignmentType } from '@/types/selection';
import { getSelectionBounds } from './selection';

export interface AlignmentUpdate {
  id: string;
  x?: number;
  y?: number;
}

/**
 * Calculate position updates for aligning shapes
 * @param shapes - Shapes to align
 * @param alignment - Alignment type
 * @returns Array of updates to apply to shapes
 */
export function calculateAlignment(
  shapes: Shape[],
  alignment: AlignmentType
): AlignmentUpdate[] {
  if (shapes.length < 2) return [];

  const bounds = getSelectionBounds(shapes);
  const updates: AlignmentUpdate[] = [];

  for (const shape of shapes) {
    const update: AlignmentUpdate = { id: shape.id };

    switch (alignment) {
      case 'left':
        // Align left edges to the leftmost shape
        update.x = bounds.minX;
        break;

      case 'centerHorizontal':
        // Align horizontal centers
        const centerX = bounds.x + bounds.width / 2;
        update.x = centerX - shape.width / 2;
        break;

      case 'right':
        // Align right edges to the rightmost shape
        update.x = bounds.maxX - shape.width;
        break;

      case 'top':
        // Align top edges to the topmost shape
        update.y = bounds.minY;
        break;

      case 'centerVertical':
        // Align vertical centers
        const centerY = bounds.y + bounds.height / 2;
        update.y = centerY - shape.height / 2;
        break;

      case 'bottom':
        // Align bottom edges to the bottommost shape
        update.y = bounds.maxY - shape.height;
        break;
    }

    updates.push(update);
  }

  return updates;
}
