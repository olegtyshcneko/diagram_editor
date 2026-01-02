import { memo, useMemo } from 'react';
import type { Shape } from '@/types/shapes';
import type { HandleType } from '@/types/interaction';
import { getHandlePositions, getRotationHandlePosition } from '@/lib/geometry/manipulation';
import { COLORS, MANIPULATION } from '@/lib/constants';
import { useShapeManipulation } from '@/hooks/manipulation';

interface InteractiveSelectionHandlesProps {
  shape: Shape;
}

const {
  HANDLE_SIZE,
  HANDLE_SIZE_SMALL,
  HANDLE_SIZE_TINY,
  ROTATION_HANDLE_OFFSET,
  HIDE_EDGE_HANDLES_THRESHOLD,
  SMALL_HANDLE_THRESHOLD,
  TINY_HANDLE_THRESHOLD,
} = MANIPULATION;

// Edge handle types that can be hidden for small shapes
const HORIZONTAL_EDGE_HANDLES = ['n', 's'];
const VERTICAL_EDGE_HANDLES = ['e', 'w'];

/**
 * Interactive selection handles for resizing and rotating shapes.
 * Adapts handle visibility and size based on shape dimensions.
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

  // Determine which handles to show and their size based on shape dimensions
  const { handleSize, visibleHandles, rotationOffset } = useMemo(() => {
    const minDimension = Math.min(bounds.width, bounds.height);
    const allHandles = getHandlePositions(bounds);

    // Determine handle size based on smallest dimension
    let size = HANDLE_SIZE;
    if (minDimension < TINY_HANDLE_THRESHOLD) {
      size = HANDLE_SIZE_TINY;
    } else if (minDimension < SMALL_HANDLE_THRESHOLD) {
      size = HANDLE_SIZE_SMALL;
    }

    // Filter handles based on shape size
    let filtered = allHandles;
    if (bounds.width < HIDE_EDGE_HANDLES_THRESHOLD) {
      // Hide horizontal edge handles (n, s) when width is small
      filtered = filtered.filter(h => !HORIZONTAL_EDGE_HANDLES.includes(h.type));
    }
    if (bounds.height < HIDE_EDGE_HANDLES_THRESHOLD) {
      // Hide vertical edge handles (e, w) when height is small
      filtered = filtered.filter(h => !VERTICAL_EDGE_HANDLES.includes(h.type));
    }

    // Scale rotation offset for smaller shapes (min 15px)
    const rotOffset = Math.max(15, Math.min(ROTATION_HANDLE_OFFSET, bounds.height * 0.5));

    return {
      handleSize: size,
      visibleHandles: filtered,
      rotationOffset: rotOffset,
    };
  }, [bounds]);

  const rotationHandle = useMemo(
    () => getRotationHandlePosition(bounds, rotationOffset),
    [bounds, rotationOffset]
  );

  const halfHandle = handleSize / 2;

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

      {/* Rotation handle connector line and handle */}
      <line
        x1={bounds.x + bounds.width / 2}
        y1={bounds.y}
        x2={rotationHandle.x}
        y2={rotationHandle.y}
        stroke={COLORS.SELECTION}
        strokeWidth={1}
        pointerEvents="none"
      />
      <circle
        cx={rotationHandle.x}
        cy={rotationHandle.y}
        r={halfHandle + 1}
        fill={isManipulating && manipulationType === 'rotate' ? COLORS.SELECTION : 'white'}
        stroke={COLORS.SELECTION}
        strokeWidth={2}
        style={{ cursor: 'grab' }}
        onMouseDown={onRotationHandleMouseDown}
      />

      {/* Resize handles - filtered based on shape size */}
      {visibleHandles.map((handle) => (
        <rect
          key={handle.type}
          x={handle.x - halfHandle}
          y={handle.y - halfHandle}
          width={handleSize}
          height={handleSize}
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
