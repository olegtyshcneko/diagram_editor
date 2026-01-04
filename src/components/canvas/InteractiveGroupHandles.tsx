import React, { memo, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Shape } from '@/types/shapes';
import type { HandleType } from '@/types/interaction';
import { calculateGroupBounds } from '@/lib/groupUtils';
import { getHandlePositions, getRotationHandlePosition } from '@/lib/geometry/manipulation';
import { useGroupResize } from '@/hooks/manipulation/useGroupResize';
import { useGroupRotate } from '@/hooks/manipulation/useGroupRotate';
import { useInteractionStore } from '@/stores/interactionStore';
import { COLORS, MANIPULATION } from '@/lib/constants';

interface InteractiveGroupHandlesProps {
  groupId: string;
  memberIds: string[];
  memberShapes: Shape[];
}

const { HANDLE_SIZE, ROTATION_HANDLE_OFFSET } = MANIPULATION;

/**
 * Interactive resize and rotation handles for a group of shapes.
 * Renders a single bounding box with handles around all group members.
 */
export const InteractiveGroupHandles = memo(function InteractiveGroupHandles({
  groupId,
  memberIds,
  memberShapes,
}: InteractiveGroupHandlesProps) {
  // Calculate group bounds from member shapes
  const bounds = useMemo(
    () => calculateGroupBounds(memberShapes),
    [memberShapes]
  );

  // Get manipulation hooks
  const { handleGroupResizeStart, handleGroupResizeUpdate, handleGroupResizeEnd } =
    useGroupResize({ groupId, memberIds });

  const { handleGroupRotateStart, handleGroupRotateUpdate, handleGroupRotateEnd } =
    useGroupRotate({ groupId, memberIds });

  // Track manipulation state
  const manipulationState = useInteractionStore((s) => s.manipulationState);
  const isResizing = manipulationState?.type === 'group-resize' && manipulationState?.shapeId === groupId;
  const isRotating = manipulationState?.type === 'group-rotate' && manipulationState?.shapeId === groupId;
  const isManipulating = isResizing || isRotating;

  // Track modifier keys during manipulation
  const modifiersRef = useRef({ shift: false, alt: false });

  // Handle global mouse move/up during manipulation
  useEffect(() => {
    if (!isManipulating) return;

    const handleMouseMove = (e: MouseEvent) => {
      modifiersRef.current = { shift: e.shiftKey, alt: e.altKey };

      if (isResizing) {
        handleGroupResizeUpdate(e, e.shiftKey, e.altKey);
      } else if (isRotating) {
        handleGroupRotateUpdate(e, e.shiftKey);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        handleGroupResizeEnd();
      } else if (isRotating) {
        handleGroupRotateEnd();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      modifiersRef.current = { shift: e.shiftKey, alt: e.altKey };
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      modifiersRef.current = { shift: e.shiftKey, alt: e.altKey };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    isManipulating,
    isResizing,
    isRotating,
    handleGroupResizeUpdate,
    handleGroupResizeEnd,
    handleGroupRotateUpdate,
    handleGroupRotateEnd,
  ]);

  // Calculate handle positions
  const handlePositions = useMemo(
    () => getHandlePositions(bounds),
    [bounds]
  );

  const rotationHandle = useMemo(
    () => getRotationHandlePosition(bounds, ROTATION_HANDLE_OFFSET),
    [bounds]
  );

  const halfHandle = HANDLE_SIZE / 2;

  // Event handlers
  const onResizeHandleMouseDown = useCallback(
    (e: React.MouseEvent, handle: HandleType) => {
      handleGroupResizeStart(e, handle, bounds);
    },
    [handleGroupResizeStart, bounds]
  );

  const onRotationHandleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handleGroupRotateStart(e, bounds);
    },
    [handleGroupRotateStart, bounds]
  );

  return (
    <g className="group-handles">
      {/* Selection outline */}
      <rect
        x={bounds.x - 1}
        y={bounds.y - 1}
        width={bounds.width + 2}
        height={bounds.height + 2}
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
        r={halfHandle + 1}
        fill={isRotating ? COLORS.SELECTION : 'white'}
        stroke={COLORS.SELECTION}
        strokeWidth={2}
        style={{ cursor: 'grab' }}
        onMouseDown={onRotationHandleMouseDown}
      />

      {/* Resize handles */}
      {handlePositions.map((handle) => (
        <rect
          key={handle.type}
          x={handle.x - halfHandle}
          y={handle.y - halfHandle}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill={isResizing ? COLORS.SELECTION : 'white'}
          stroke={COLORS.SELECTION}
          strokeWidth={1}
          style={{ cursor: handle.cursor }}
          onMouseDown={(e) => onResizeHandleMouseDown(e, handle.type as HandleType)}
        />
      ))}
    </g>
  );
});
