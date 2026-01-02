import { useCallback, useRef } from 'react';
import type { Point, Bounds } from '@/types/common';
import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';
import { constrainToAxis } from '@/lib/geometry/manipulation';

interface UseMoveOptions {
  shapeId: string;
}

/**
 * Hook for handling shape move operations.
 * Manages drag-to-move with optional axis constraints.
 */
export function useShapeMove({ shapeId }: UseMoveOptions) {
  const updateShape = useDiagramStore((s) => s.updateShape);
  const viewport = useUIStore((s) => s.viewport);
  const startManipulation = useUIStore((s) => s.startManipulation);
  const endManipulation = useUIStore((s) => s.endManipulation);

  // Refs to store start state (avoids stale closures)
  const startPointRef = useRef<Point | null>(null);
  const startPositionRef = useRef<Point | null>(null);

  /**
   * Start a move operation
   */
  const handleMoveStart = useCallback((
    e: React.MouseEvent,
    bounds: Bounds
  ) => {
    e.stopPropagation();

    startPointRef.current = { x: e.clientX, y: e.clientY };
    startPositionRef.current = { x: bounds.x, y: bounds.y };

    startManipulation({
      type: 'move',
      shapeId,
      startPoint: { x: e.clientX, y: e.clientY },
      startBounds: bounds,
      startRotation: 0,
    });
  }, [shapeId, startManipulation]);

  /**
   * Update position during move
   */
  const handleMoveUpdate = useCallback((
    e: MouseEvent,
    shiftHeld: boolean
  ) => {
    if (!startPointRef.current || !startPositionRef.current) return;

    // Calculate delta in screen space
    let delta: Point = {
      x: e.clientX - startPointRef.current.x,
      y: e.clientY - startPointRef.current.y,
    };

    // Apply axis constraint if Shift is held
    if (shiftHeld) {
      delta = constrainToAxis(delta);
    }

    // Scale delta by zoom level to get canvas-space movement
    const scaledDelta: Point = {
      x: delta.x / viewport.zoom,
      y: delta.y / viewport.zoom,
    };

    // Calculate new position from start position + delta (not accumulating)
    const newX = startPositionRef.current.x + scaledDelta.x;
    const newY = startPositionRef.current.y + scaledDelta.y;

    updateShape(shapeId, { x: newX, y: newY });
  }, [shapeId, viewport.zoom, updateShape]);

  /**
   * End the move operation
   */
  const handleMoveEnd = useCallback(() => {
    startPointRef.current = null;
    startPositionRef.current = null;
    endManipulation();
  }, [endManipulation]);

  return {
    handleMoveStart,
    handleMoveUpdate,
    handleMoveEnd,
  };
}
