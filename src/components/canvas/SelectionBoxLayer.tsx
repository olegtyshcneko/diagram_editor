import { memo } from 'react';
import { useInteractionStore } from '@/stores/interactionStore';
import { getSelectionBoxBounds } from '@/lib/geometry/selection';

/**
 * Renders the selection box (marquee) rectangle during drag selection
 */
export const SelectionBoxLayer = memo(function SelectionBoxLayer() {
  const selectionBoxState = useInteractionStore((s) => s.selectionBoxState);

  if (!selectionBoxState) {
    return null;
  }

  const { startPoint, currentPoint } = selectionBoxState;
  const { x, y, width, height } = getSelectionBoxBounds(startPoint, currentPoint);

  // Don't render if box is too small (either dimension < 1px)
  if (width < 1 || height < 1) {
    return null;
  }

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="rgba(59, 130, 246, 0.1)"
      stroke="#3B82F6"
      strokeWidth={1}
      strokeDasharray="4 4"
      pointerEvents="none"
    />
  );
});
