import { memo, useMemo } from 'react';
import type { Shape } from '@/types/shapes';
import { COLORS, MANIPULATION } from '@/lib/constants';

interface SelectionHandlesProps {
  shape: Shape;
}

const {
  HANDLE_SIZE,
  HANDLE_SIZE_SMALL,
  HANDLE_SIZE_TINY,
  HIDE_EDGE_HANDLES_THRESHOLD,
  SMALL_HANDLE_THRESHOLD,
  TINY_HANDLE_THRESHOLD,
} = MANIPULATION;

export const SelectionHandles = memo(function SelectionHandles({
  shape,
}: SelectionHandlesProps) {
  const { x, y, width, height } = shape;

  // Adaptive handle size and visibility based on shape dimensions
  const { handleSize, visibleHandles } = useMemo(() => {
    const minDimension = Math.min(width, height);
    let size = HANDLE_SIZE;
    if (minDimension < TINY_HANDLE_THRESHOLD) {
      size = HANDLE_SIZE_TINY;
    } else if (minDimension < SMALL_HANDLE_THRESHOLD) {
      size = HANDLE_SIZE_SMALL;
    }

    // All 8 handle positions: 4 corners + 4 midpoints
    const allHandles = [
      { cx: x, cy: y, cursor: 'nwse-resize', type: 'nw' },
      { cx: x + width / 2, cy: y, cursor: 'ns-resize', type: 'n' },
      { cx: x + width, cy: y, cursor: 'nesw-resize', type: 'ne' },
      { cx: x + width, cy: y + height / 2, cursor: 'ew-resize', type: 'e' },
      { cx: x + width, cy: y + height, cursor: 'nwse-resize', type: 'se' },
      { cx: x + width / 2, cy: y + height, cursor: 'ns-resize', type: 's' },
      { cx: x, cy: y + height, cursor: 'nesw-resize', type: 'sw' },
      { cx: x, cy: y + height / 2, cursor: 'ew-resize', type: 'w' },
    ];

    // Filter handles based on shape size
    let filtered = allHandles;
    if (width < HIDE_EDGE_HANDLES_THRESHOLD) {
      filtered = filtered.filter(h => h.type !== 'n' && h.type !== 's');
    }
    if (height < HIDE_EDGE_HANDLES_THRESHOLD) {
      filtered = filtered.filter(h => h.type !== 'e' && h.type !== 'w');
    }

    return { handleSize: size, visibleHandles: filtered };
  }, [x, y, width, height]);

  const halfHandle = handleSize / 2;

  return (
    <g className="selection-handles" pointerEvents="none">
      {/* Selection outline */}
      <rect
        x={x - 1}
        y={y - 1}
        width={width + 2}
        height={height + 2}
        fill="none"
        stroke={COLORS.SELECTION}
        strokeWidth={1}
        strokeDasharray="4 2"
      />

      {/* Handles */}
      {visibleHandles.map((handle) => (
        <rect
          key={handle.type}
          x={handle.cx - halfHandle}
          y={handle.cy - halfHandle}
          width={handleSize}
          height={handleSize}
          fill="white"
          stroke={COLORS.SELECTION}
          strokeWidth={1}
        />
      ))}
    </g>
  );
});
