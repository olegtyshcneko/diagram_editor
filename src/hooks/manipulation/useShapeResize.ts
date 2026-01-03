import { useCallback, useRef } from 'react';
import type { Point } from '@/types/common';
import type { HandleType } from '@/types/interaction';
import { useDiagramStore } from '@/stores/diagramStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useHistoryStore } from '@/stores/historyStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { calculateResize } from '@/lib/geometry/resize';
import { SHAPE_DEFAULTS } from '@/lib/constants';
import { snapToGrid } from '@/lib/geometry/snap';
import { EMPTY_CONNECTION_DELTA } from '@/types/history';
import type { Bounds } from '@/types/common';

interface UseResizeOptions {
  shapeId: string;
}

/**
 * Hook for handling shape resize operations.
 * Supports 8-direction resize with aspect ratio and center constraints.
 *
 * IMPORTANT: This hook reads start state from the global manipulationState store
 * to avoid issues with multiple React component instances having separate refs.
 */
export function useShapeResize({ shapeId }: UseResizeOptions) {
  const updateShape = useDiagramStore((s) => s.updateShape);
  const viewport = useViewportStore((s) => s.viewport);
  const startManipulation = useInteractionStore((s) => s.startManipulation);
  const endManipulation = useInteractionStore((s) => s.endManipulation);
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const snapEnabled = usePreferencesStore((s) => s.snapToGrid);
  const gridSize = usePreferencesStore((s) => s.gridSize);

  // Only use refs for selection snapshot (start bounds/point are in global store)
  const selectionAtStartRef = useRef<string[]>([]);

  /**
   * Start a resize operation
   */
  const handleResizeStart = useCallback((
    e: React.MouseEvent,
    handle: HandleType,
    bounds: Bounds
  ) => {
    e.stopPropagation();

    // Capture selection at start for history
    selectionAtStartRef.current = [...selectedShapeIds];

    // Store ALL start state in the global store - this is the single source of truth
    startManipulation({
      type: 'resize',
      shapeId,
      startPoint: { x: e.clientX, y: e.clientY },
      startBounds: bounds,
      startRotation: 0,
      handle,
      aspectRatio: bounds.width / bounds.height,
    });
  }, [shapeId, startManipulation, selectedShapeIds]);

  /**
   * Update size during resize
   * Reads start state from the global manipulationState store
   */
  const handleResizeUpdate = useCallback((
    e: MouseEvent,
    shiftHeld: boolean,
    altHeld: boolean
  ) => {
    // Read start state from the global store (single source of truth)
    const manipState = useInteractionStore.getState().manipulationState;

    if (!manipState || manipState.type !== 'resize' || !manipState.handle) {
      return;
    }

    const { startPoint, startBounds, handle, aspectRatio } = manipState;

    // Calculate delta in screen space, scaled by zoom
    const delta: Point = {
      x: (e.clientX - startPoint.x) / viewport.zoom,
      y: (e.clientY - startPoint.y) / viewport.zoom,
    };

    const newBounds = calculateResize(
      startBounds,
      handle,
      delta,
      {
        maintainAspectRatio: shiftHeld,
        resizeFromCenter: altHeld,
        originalAspectRatio: aspectRatio || startBounds.width / startBounds.height,
        minSize: SHAPE_DEFAULTS.MIN_SIZE,
      }
    );

    // Determine if snap is active (altHeld disables snap for resize-from-center already)
    // But we also allow Alt to disable grid snap
    const shouldSnap = snapEnabled && !altHeld;

    let finalX = newBounds.x;
    let finalY = newBounds.y;
    let finalW = newBounds.width;
    let finalH = newBounds.height;

    if (shouldSnap) {
      // Snap position and size to grid
      finalX = snapToGrid(newBounds.x, gridSize);
      finalY = snapToGrid(newBounds.y, gridSize);
      // For width/height, we snap the right/bottom edges
      finalW = snapToGrid(newBounds.x + newBounds.width, gridSize) - finalX;
      finalH = snapToGrid(newBounds.y + newBounds.height, gridSize) - finalY;
      // Ensure minimum size
      finalW = Math.max(finalW, SHAPE_DEFAULTS.MIN_SIZE);
      finalH = Math.max(finalH, SHAPE_DEFAULTS.MIN_SIZE);
    } else {
      finalX = Math.round(finalX);
      finalY = Math.round(finalY);
      finalW = Math.round(finalW);
      finalH = Math.round(finalH);
    }

    updateShape(manipState.shapeId, {
      x: finalX,
      y: finalY,
      width: finalW,
      height: finalH,
    });
  }, [viewport.zoom, updateShape, snapEnabled, gridSize]);

  /**
   * End the resize operation
   * Reads start state from the global manipulationState store
   * Checks for actual changes instead of relying on local refs (which can be stale across instances)
   */
  const handleResizeEnd = useCallback(() => {
    // Read start state from the global store BEFORE clearing it
    const manipState = useInteractionStore.getState().manipulationState;

    if (manipState && manipState.type === 'resize') {
      const { shapeId: targetShapeId, startBounds } = manipState;
      const currentShape = useDiagramStore.getState().shapes[targetShapeId];

      if (currentShape) {
        // Check if actual change occurred by comparing start and current bounds
        const hasActualChange =
          currentShape.x !== startBounds.x ||
          currentShape.y !== startBounds.y ||
          currentShape.width !== startBounds.width ||
          currentShape.height !== startBounds.height;

        if (hasActualChange) {
          // Get selection - try local ref first, fall back to current selection
          const selection = selectionAtStartRef.current.length > 0
            ? selectionAtStartRef.current
            : useDiagramStore.getState().selectedShapeIds;

          pushEntry({
            type: 'RESIZE_SHAPE',
            description: 'Resize Shape',
            shapeDelta: {
              added: [],
              removed: [],
              modified: [{
                id: targetShapeId,
                before: {
                  x: startBounds.x,
                  y: startBounds.y,
                  width: startBounds.width,
                  height: startBounds.height,
                },
                after: {
                  x: currentShape.x,
                  y: currentShape.y,
                  width: currentShape.width,
                  height: currentShape.height,
                },
              }],
            },
            connectionDelta: EMPTY_CONNECTION_DELTA,
            selectionBefore: selection,
            selectionAfter: selection,
          });
        }
      }
    }

    // Clear local state
    selectionAtStartRef.current = [];

    // Clear global manipulation state
    endManipulation();
  }, [endManipulation, pushEntry]);

  return {
    handleResizeStart,
    handleResizeUpdate,
    handleResizeEnd,
  };
}
