import { useCallback, useRef } from 'react';
import type { Point, Bounds } from '@/types/common';
import { useDiagramStore } from '@/stores/diagramStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { constrainToAxis } from '@/lib/geometry/manipulation';

interface UseMoveOptions {
  shapeId: string;
}

/**
 * Hook for handling shape move operations.
 * Moves ALL selected shapes together when dragging any selected shape.
 * Manages drag-to-move with optional axis constraints.
 */
export function useShapeMove({ shapeId }: UseMoveOptions) {
  const shapes = useDiagramStore((s) => s.shapes);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const updateShape = useDiagramStore((s) => s.updateShape);
  const viewport = useViewportStore((s) => s.viewport);
  const startManipulation = useInteractionStore((s) => s.startManipulation);
  const endManipulation = useInteractionStore((s) => s.endManipulation);

  // Refs to store start state (avoids stale closures)
  const startPointRef = useRef<Point | null>(null);
  const startPositionRef = useRef<Point | null>(null);
  // Store start positions of ALL selected shapes for multi-move
  const startPositionsRef = useRef<Map<string, Point>>(new Map());

  /**
   * Start a move operation
   * Stores start positions for ALL selected shapes to enable multi-move
   */
  const handleMoveStart = useCallback((
    e: React.MouseEvent,
    bounds: Bounds
  ) => {
    e.stopPropagation();

    startPointRef.current = { x: e.clientX, y: e.clientY };
    startPositionRef.current = { x: bounds.x, y: bounds.y };

    // Store start positions for all selected shapes
    const positions = new Map<string, Point>();
    for (const id of selectedShapeIds) {
      const shape = shapes[id];
      if (shape && !shape.locked) {
        positions.set(id, { x: shape.x, y: shape.y });
      }
    }
    startPositionsRef.current = positions;

    startManipulation({
      type: 'move',
      shapeId,
      startPoint: { x: e.clientX, y: e.clientY },
      startBounds: bounds,
      startRotation: 0,
    });
  }, [shapeId, selectedShapeIds, shapes, startManipulation]);

  /**
   * Update position during move
   * Moves ALL selected shapes by the same delta
   */
  const handleMoveUpdate = useCallback((
    e: MouseEvent,
    shiftHeld: boolean
  ) => {
    if (!startPointRef.current) return;

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

    // Update ALL selected shapes with the same delta
    startPositionsRef.current.forEach((startPos, id) => {
      const newX = Math.round(startPos.x + scaledDelta.x);
      const newY = Math.round(startPos.y + scaledDelta.y);
      updateShape(id, { x: newX, y: newY });
    });
  }, [viewport.zoom, updateShape]);

  /**
   * End the move operation
   */
  const handleMoveEnd = useCallback(() => {
    startPointRef.current = null;
    startPositionRef.current = null;
    startPositionsRef.current.clear();
    endManipulation();
  }, [endManipulation]);

  return {
    handleMoveStart,
    handleMoveUpdate,
    handleMoveEnd,
  };
}
