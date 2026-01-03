import { useCallback, useRef } from 'react';
import type { Bounds } from '@/types/common';
import { useDiagramStore } from '@/stores/diagramStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useHistoryStore } from '@/stores/historyStore';
import {
  calculateAngle,
  snapAngle,
  getBoundsCenter,
  normalizeAngle,
} from '@/lib/geometry/manipulation';
import { MANIPULATION } from '@/lib/constants';
import { EMPTY_CONNECTION_DELTA } from '@/types/history';

interface UseRotateOptions {
  shapeId: string;
}

/**
 * Hook for handling shape rotation operations.
 * Rotates shape around its center with optional 15-degree snapping.
 *
 * IMPORTANT: This hook reads start state from the global manipulationState store
 * to avoid issues with multiple React component instances having separate refs.
 */
export function useShapeRotate({ shapeId }: UseRotateOptions) {
  const updateShape = useDiagramStore((s) => s.updateShape);
  const viewport = useViewportStore((s) => s.viewport);
  const startManipulation = useInteractionStore((s) => s.startManipulation);
  const endManipulation = useInteractionStore((s) => s.endManipulation);
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);

  // Only use refs for selection snapshot and start angle (calculated value)
  const selectionAtStartRef = useRef<string[]>([]);
  const startAngleRef = useRef<number>(0);

  /**
   * Start a rotation operation
   */
  const handleRotateStart = useCallback((
    e: React.MouseEvent,
    bounds: Bounds,
    currentRotation: number
  ) => {
    e.stopPropagation();

    // Calculate center in canvas coordinates
    const center = getBoundsCenter(bounds);

    // Calculate starting angle from center to cursor (in canvas coordinates)
    const canvasX = viewport.x + e.clientX / viewport.zoom;
    const canvasY = viewport.y + e.clientY / viewport.zoom;
    startAngleRef.current = calculateAngle(center, { x: canvasX, y: canvasY });

    // Capture selection at start for history
    selectionAtStartRef.current = [...selectedShapeIds];

    // Store ALL start state in the global store - this is the single source of truth
    startManipulation({
      type: 'rotate',
      shapeId,
      startPoint: { x: e.clientX, y: e.clientY },
      startBounds: bounds,
      startRotation: currentRotation,
      handle: 'rotation',
    });
  }, [shapeId, viewport, startManipulation, selectedShapeIds]);

  /**
   * Update rotation during drag
   * Reads start state from the global manipulationState store
   */
  const handleRotateUpdate = useCallback((
    e: MouseEvent,
    shiftHeld: boolean
  ) => {
    // Read start state from the global store (single source of truth)
    const manipState = useInteractionStore.getState().manipulationState;

    if (!manipState || manipState.type !== 'rotate') {
      return;
    }

    const { startBounds, startRotation, shapeId: targetShapeId } = manipState;
    const center = getBoundsCenter(startBounds);

    // Convert cursor to canvas coordinates
    const canvasX = viewport.x + e.clientX / viewport.zoom;
    const canvasY = viewport.y + e.clientY / viewport.zoom;

    // Calculate current angle from center to cursor
    const currentAngle = calculateAngle(center, { x: canvasX, y: canvasY });

    // Calculate rotation delta
    const angleDelta = currentAngle - startAngleRef.current;

    // Calculate new rotation
    let newRotation = normalizeAngle(startRotation + angleDelta);

    // Apply snapping if Shift is held
    if (shiftHeld) {
      newRotation = snapAngle(newRotation, MANIPULATION.ROTATION_SNAP_DEGREES);
    }

    updateShape(targetShapeId, { rotation: Math.round(newRotation) });
  }, [viewport, updateShape]);

  /**
   * End the rotation operation
   * Reads start state from the global manipulationState store
   * Checks for actual changes instead of relying on local refs (which can be stale across instances)
   */
  const handleRotateEnd = useCallback(() => {
    // Read start state from the global store BEFORE clearing it
    const manipState = useInteractionStore.getState().manipulationState;

    if (manipState && manipState.type === 'rotate') {
      const { shapeId: targetShapeId, startRotation } = manipState;
      const currentShape = useDiagramStore.getState().shapes[targetShapeId];

      if (currentShape) {
        // Check if actual change occurred by comparing start and current rotation
        const hasActualChange = currentShape.rotation !== startRotation;

        if (hasActualChange) {
          // Get selection - try local ref first, fall back to current selection
          const selection = selectionAtStartRef.current.length > 0
            ? selectionAtStartRef.current
            : useDiagramStore.getState().selectedShapeIds;

          pushEntry({
            type: 'ROTATE_SHAPE',
            description: 'Rotate Shape',
            shapeDelta: {
              added: [],
              removed: [],
              modified: [{
                id: targetShapeId,
                before: { rotation: startRotation },
                after: { rotation: currentShape.rotation },
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
    startAngleRef.current = 0;

    // Clear global manipulation state
    endManipulation();
  }, [endManipulation, pushEntry]);

  return {
    handleRotateStart,
    handleRotateUpdate,
    handleRotateEnd,
  };
}
