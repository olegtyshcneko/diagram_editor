import { memo } from 'react';
import type { Shape } from '@/types/shapes';
import { COLORS } from '@/lib/constants';

interface SelectionHandlesProps {
  shape: Shape;
}

const HANDLE_SIZE = 8;

export const SelectionHandles = memo(function SelectionHandles({
  shape,
}: SelectionHandlesProps) {
  const { x, y, width, height } = shape;
  const halfHandle = HANDLE_SIZE / 2;

  // 8 handle positions: 4 corners + 4 midpoints
  const handles = [
    { cx: x, cy: y, cursor: 'nwse-resize' }, // top-left
    { cx: x + width / 2, cy: y, cursor: 'ns-resize' }, // top-center
    { cx: x + width, cy: y, cursor: 'nesw-resize' }, // top-right
    { cx: x + width, cy: y + height / 2, cursor: 'ew-resize' }, // right-center
    { cx: x + width, cy: y + height, cursor: 'nwse-resize' }, // bottom-right
    { cx: x + width / 2, cy: y + height, cursor: 'ns-resize' }, // bottom-center
    { cx: x, cy: y + height, cursor: 'nesw-resize' }, // bottom-left
    { cx: x, cy: y + height / 2, cursor: 'ew-resize' }, // left-center
  ];

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
      {handles.map((handle, index) => (
        <rect
          key={index}
          x={handle.cx - halfHandle}
          y={handle.cy - halfHandle}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill="white"
          stroke={COLORS.SELECTION}
          strokeWidth={1}
        />
      ))}
    </g>
  );
});
