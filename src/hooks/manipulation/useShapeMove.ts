import { useCallback, useRef } from 'react';
import type { Point, Bounds } from '@/types/common';
import { useDiagramStore } from '@/stores/diagramStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useHistoryStore } from '@/stores/historyStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { constrainToAxis } from '@/lib/geometry/manipulation';
import { snapToGrid } from '@/lib/geometry/snap';
import { EMPTY_CONNECTION_DELTA } from '@/types/history';

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
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const snapEnabled = usePreferencesStore((s) => s.snapToGrid);
  const gridSize = usePreferencesStore((s) => s.gridSize);

  // Refs to store start state (avoids stale closures)
  const startPointRef = useRef<Point | null>(null);
  const startPositionRef = useRef<Point | null>(null);
  // Store start positions of ALL selected shapes for multi-move
  const startPositionsRef = useRef<Map<string, Point>>(new Map());
  // Track if any actual movement occurred (for history)
  const hasMoved = useRef<boolean>(false);

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

    hasMoved.current = false;

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
   * Alt key temporarily disables snap-to-grid
   */
  const handleMoveUpdate = useCallback((
    e: MouseEvent,
    shiftHeld: boolean,
    altHeld: boolean = false
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

    // Determine if snap is active (enabled in preferences, not disabled by Alt)
    const shouldSnap = snapEnabled && !altHeld;

    // Update ALL selected shapes with the same delta
    startPositionsRef.current.forEach((startPos, id) => {
      let newX = startPos.x + scaledDelta.x;
      let newY = startPos.y + scaledDelta.y;

      // Apply snap-to-grid
      if (shouldSnap) {
        newX = snapToGrid(newX, gridSize);
        newY = snapToGrid(newY, gridSize);
      } else {
        newX = Math.round(newX);
        newY = Math.round(newY);
      }

      updateShape(id, { x: newX, y: newY });
    });

    // Mark that movement occurred
    hasMoved.current = true;
  }, [viewport.zoom, updateShape, snapEnabled, gridSize]);

  /**
   * End the move operation
   */
  const handleMoveEnd = useCallback(() => {
    // Push history entry if movement actually occurred
    if (hasMoved.current && startPositionsRef.current.size > 0) {
      const currentShapes = useDiagramStore.getState().shapes;
      const modifications = Array.from(startPositionsRef.current.entries())
        .map(([id, startPos]) => {
          const currentShape = currentShapes[id];
          if (!currentShape) return null;
          return {
            id,
            before: { x: startPos.x, y: startPos.y },
            after: { x: currentShape.x, y: currentShape.y },
          };
        })
        .filter((mod): mod is NonNullable<typeof mod> => mod !== null);

      if (modifications.length > 0) {
        const description = modifications.length === 1 ? 'Move Shape' : `Move ${modifications.length} Shapes`;
        pushEntry({
          type: 'MOVE_SHAPES',
          description,
          shapeDelta: {
            added: [],
            removed: [],
            modified: modifications,
          },
          connectionDelta: EMPTY_CONNECTION_DELTA,
          selectionBefore: Array.from(startPositionsRef.current.keys()),
          selectionAfter: Array.from(startPositionsRef.current.keys()),
        });
      }
    }

    startPointRef.current = null;
    startPositionRef.current = null;
    startPositionsRef.current.clear();
    hasMoved.current = false;
    endManipulation();
  }, [endManipulation, pushEntry]);

  return {
    handleMoveStart,
    handleMoveUpdate,
    handleMoveEnd,
  };
}
