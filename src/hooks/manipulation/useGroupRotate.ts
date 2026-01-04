import { useCallback, useRef } from 'react';
import type { Bounds, Point } from '@/types/common';
import type { Shape } from '@/types/shapes';
import { useDiagramStore } from '@/stores/diagramStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useHistoryStore } from '@/stores/historyStore';
import { rotateShapesAroundCenter, type ShapeState } from '@/lib/geometry/groupTransform';
import {
  calculateAngle,
  snapAngle,
  getBoundsCenter,
} from '@/lib/geometry/manipulation';
import { MANIPULATION } from '@/lib/constants';
import { EMPTY_CONNECTION_DELTA } from '@/types/history';

interface UseGroupRotateOptions {
  groupId: string;
  memberIds: string[];
}

/**
 * Hook for handling group rotation operations.
 * Rotates all member shapes around the group center.
 */
export function useGroupRotate({ groupId, memberIds }: UseGroupRotateOptions) {
  const updateShape = useDiagramStore((s) => s.updateShape);
  const shapes = useDiagramStore((s) => s.shapes);
  const viewport = useViewportStore((s) => s.viewport);
  const startManipulation = useInteractionStore((s) => s.startManipulation);
  const endManipulation = useInteractionStore((s) => s.endManipulation);
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);

  // Refs for storing start state
  const selectionAtStartRef = useRef<string[]>([]);
  const startShapeStatesRef = useRef<Record<string, ShapeState>>({});
  const startAngleRef = useRef<number>(0);
  const groupCenterRef = useRef<Point>({ x: 0, y: 0 });

  /**
   * Start a group rotation operation
   */
  const handleGroupRotateStart = useCallback((
    e: React.MouseEvent,
    groupBounds: Bounds
  ) => {
    e.stopPropagation();

    // Calculate and store group center
    const center = getBoundsCenter(groupBounds);
    groupCenterRef.current = center;

    // Calculate starting angle from center to cursor
    const canvasX = viewport.x + e.clientX / viewport.zoom;
    const canvasY = viewport.y + e.clientY / viewport.zoom;
    startAngleRef.current = calculateAngle(center, { x: canvasX, y: canvasY });

    // Capture start state for all member shapes
    const startStates: Record<string, ShapeState> = {};
    for (const id of memberIds) {
      const shape = shapes[id];
      if (shape) {
        startStates[id] = {
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height,
          rotation: shape.rotation,
        };
      }
    }
    startShapeStatesRef.current = startStates;
    selectionAtStartRef.current = [...selectedShapeIds];

    // Store manipulation state globally
    startManipulation({
      type: 'group-rotate',
      shapeId: groupId, // Use groupId as identifier
      startPoint: { x: e.clientX, y: e.clientY },
      startBounds: groupBounds,
      startRotation: 0, // Group rotation is always relative
      handle: 'rotation',
    });
  }, [groupId, memberIds, shapes, viewport, startManipulation, selectedShapeIds]);

  /**
   * Update all shapes during rotation
   */
  const handleGroupRotateUpdate = useCallback((
    e: MouseEvent,
    shiftHeld: boolean
  ) => {
    const manipState = useInteractionStore.getState().manipulationState;
    const startStates = startShapeStatesRef.current;
    const center = groupCenterRef.current;

    if (!manipState || manipState.type !== 'group-rotate') {
      return;
    }

    // Convert cursor to canvas coordinates
    const canvasX = viewport.x + e.clientX / viewport.zoom;
    const canvasY = viewport.y + e.clientY / viewport.zoom;

    // Calculate current angle and delta
    const currentAngle = calculateAngle(center, { x: canvasX, y: canvasY });
    let angleDelta = currentAngle - startAngleRef.current;

    // Apply snapping if Shift held
    if (shiftHeld) {
      // Snap the angle delta to 15-degree increments
      angleDelta = snapAngle(angleDelta, MANIPULATION.ROTATION_SNAP_DEGREES);
    }

    // Rotate all shapes around group center
    const updates = rotateShapesAroundCenter(startStates, center, angleDelta);

    // Apply updates to all shapes
    for (const [shapeId, update] of Object.entries(updates)) {
      updateShape(shapeId, update);
    }
  }, [viewport, updateShape]);

  /**
   * End the group rotation operation and push history entry
   */
  const handleGroupRotateEnd = useCallback(() => {
    const manipState = useInteractionStore.getState().manipulationState;
    const startStates = startShapeStatesRef.current;

    if (manipState && manipState.type === 'group-rotate' && Object.keys(startStates).length > 0) {
      const currentShapes = useDiagramStore.getState().shapes;
      const modified: Array<{
        id: string;
        before: Partial<Shape>;
        after: Partial<Shape>;
      }> = [];

      // Build modification list for all changed shapes
      for (const [shapeId, startState] of Object.entries(startStates)) {
        const currentShape = currentShapes[shapeId];
        if (currentShape) {
          const hasChange =
            currentShape.x !== startState.x ||
            currentShape.y !== startState.y ||
            currentShape.rotation !== startState.rotation;

          if (hasChange) {
            modified.push({
              id: shapeId,
              before: {
                x: startState.x,
                y: startState.y,
                rotation: startState.rotation,
              },
              after: {
                x: currentShape.x,
                y: currentShape.y,
                rotation: currentShape.rotation,
              },
            });
          }
        }
      }

      if (modified.length > 0) {
        const selection = selectionAtStartRef.current.length > 0
          ? selectionAtStartRef.current
          : useDiagramStore.getState().selectedShapeIds;

        pushEntry({
          type: 'ROTATE_SHAPE',
          description: `Rotate ${modified.length} shapes`,
          shapeDelta: {
            added: [],
            removed: [],
            modified,
          },
          connectionDelta: EMPTY_CONNECTION_DELTA,
          selectionBefore: selection,
          selectionAfter: selection,
        });
      }
    }

    // Clear refs
    startShapeStatesRef.current = {};
    selectionAtStartRef.current = [];
    startAngleRef.current = 0;
    groupCenterRef.current = { x: 0, y: 0 };

    // Clear global manipulation state
    endManipulation();
  }, [endManipulation, pushEntry]);

  return {
    handleGroupRotateStart,
    handleGroupRotateUpdate,
    handleGroupRotateEnd,
  };
}
