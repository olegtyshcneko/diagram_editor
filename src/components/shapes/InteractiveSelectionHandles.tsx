import { memo, useMemo } from 'react';
import type { Shape } from '@/types/shapes';
import type { HandleType } from '@/types/interaction';
import { getHandlePositions, getRotationHandlePosition } from '@/lib/geometry/manipulation';
import { COLORS, MANIPULATION } from '@/lib/constants';
import { useShapeManipulation } from '@/hooks/manipulation';

interface InteractiveSelectionHandlesProps {
  shape: Shape;
}

const { HANDLE_SIZE, ROTATION_HANDLE_OFFSET } = MANIPULATION;

/**
 * Interactive selection handles for resizing and rotating shapes.
 * Replaces the static SelectionHandles component.
 */
export const InteractiveSelectionHandles = memo(function InteractiveSelectionHandles({
  shape,
}: InteractiveSelectionHandlesProps) {
  const {
    onResizeHandleMouseDown,
    onRotationHandleMouseDown,
    isManipulating,
    manipulationType,
  } = useShapeManipulation({ shape });

  const bounds = useMemo(() => ({
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
  }), [shape.x, shape.y, shape.width, shape.height]);

  const handles = useMemo(
    () => getHandlePositions(bounds),
    [bounds]
  );

  const rotationHandle = useMemo(
    () => getRotationHandlePosition(bounds, ROTATION_HANDLE_OFFSET),
    [bounds]
  );

  const halfHandle = HANDLE_SIZE / 2;

  return (
    <g className="selection-handles">
      {/* Selection outline */}
      <rect
        x={shape.x - 1}
        y={shape.y - 1}
        width={shape.width + 2}
        height={shape.height + 2}
        fill="none"
        stroke={COLORS.SELECTION}
        strokeWidth={1}
        strokeDasharray="4 2"
        pointerEvents="none"
      />

      {/* Rotation handle connector line */}
      <line
        x1={bounds.x + bounds.width / 2}
        y1={bounds.y}
        x2={rotationHandle.x}
        y2={rotationHandle.y}
        stroke={COLORS.SELECTION}
        strokeWidth={1}
        pointerEvents="none"
      />

      {/* Rotation handle */}
      <circle
        cx={rotationHandle.x}
        cy={rotationHandle.y}
        r={HANDLE_SIZE / 2 + 1}
        fill={isManipulating && manipulationType === 'rotate' ? COLORS.SELECTION : 'white'}
        stroke={COLORS.SELECTION}
        strokeWidth={2}
        style={{ cursor: 'grab' }}
        onMouseDown={onRotationHandleMouseDown}
      />

      {/* Resize handles */}
      {handles.map((handle) => (
        <rect
          key={handle.type}
          x={handle.x - halfHandle}
          y={handle.y - halfHandle}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill={
            isManipulating && manipulationType === 'resize'
              ? COLORS.SELECTION
              : 'white'
          }
          stroke={COLORS.SELECTION}
          strokeWidth={1}
          style={{ cursor: handle.cursor }}
          onMouseDown={(e) => onResizeHandleMouseDown(e, handle.type as HandleType)}
        />
      ))}
    </g>
  );
});
