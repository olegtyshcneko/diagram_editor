import { useCallback, useRef } from 'react';
import type { Point, Bounds } from '@/types/common';
import type { HandleType } from '@/types/interaction';
import type { Shape } from '@/types/shapes';
import { useDiagramStore } from '@/stores/diagramStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useHistoryStore } from '@/stores/historyStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { scaleShapesInGroup, type ShapeState } from '@/lib/geometry/groupTransform';
import { calculateResize } from '@/lib/geometry/resize';
import { snapToGrid } from '@/lib/geometry/snap';
import { SHAPE_DEFAULTS } from '@/lib/constants';
import { EMPTY_CONNECTION_DELTA } from '@/types/history';

interface UseGroupResizeOptions {
  groupId: string;
  memberIds: string[];
}

/**
 * Hook for handling group resize operations.
 * Scales all member shapes proportionally when the group bounding box is resized.
 */
export function useGroupResize({ groupId, memberIds }: UseGroupResizeOptions) {
  const updateShape = useDiagramStore((s) => s.updateShape);
  const shapes = useDiagramStore((s) => s.shapes);
  const viewport = useViewportStore((s) => s.viewport);
  const startManipulation = useInteractionStore((s) => s.startManipulation);
  const endManipulation = useInteractionStore((s) => s.endManipulation);
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const snapEnabled = usePreferencesStore((s) => s.snapToGrid);
  const gridSize = usePreferencesStore((s) => s.gridSize);

  // Refs for storing start state of ALL member shapes
  const selectionAtStartRef = useRef<string[]>([]);
  const startShapeStatesRef = useRef<Record<string, ShapeState>>({});
  const startGroupBoundsRef = useRef<Bounds | null>(null);

  /**
   * Start a group resize operation
   */
  const handleGroupResizeStart = useCallback((
    e: React.MouseEvent,
    handle: HandleType,
    groupBounds: Bounds
  ) => {
    e.stopPropagation();

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
    startGroupBoundsRef.current = { ...groupBounds };
    selectionAtStartRef.current = [...selectedShapeIds];

    // Store manipulation state globally
    startManipulation({
      type: 'group-resize',
      shapeId: groupId, // Use groupId as identifier
      startPoint: { x: e.clientX, y: e.clientY },
      startBounds: groupBounds,
      startRotation: 0,
      handle,
      aspectRatio: groupBounds.width / groupBounds.height,
    });
  }, [groupId, memberIds, shapes, startManipulation, selectedShapeIds]);

  /**
   * Update all shapes during resize
   */
  const handleGroupResizeUpdate = useCallback((
    e: MouseEvent,
    shiftHeld: boolean,
    altHeld: boolean
  ) => {
    const manipState = useInteractionStore.getState().manipulationState;
    const startGroupBounds = startGroupBoundsRef.current;
    const startStates = startShapeStatesRef.current;

    if (!manipState || manipState.type !== 'group-resize' || !manipState.handle || !startGroupBounds) {
      return;
    }

    const { startPoint, handle, aspectRatio } = manipState;

    // Calculate delta in canvas space
    const delta: Point = {
      x: (e.clientX - startPoint.x) / viewport.zoom,
      y: (e.clientY - startPoint.y) / viewport.zoom,
    };

    // Calculate new group bounds using existing resize logic
    let newGroupBounds = calculateResize(
      startGroupBounds,
      handle,
      delta,
      {
        maintainAspectRatio: shiftHeld,
        resizeFromCenter: altHeld,
        originalAspectRatio: aspectRatio || startGroupBounds.width / startGroupBounds.height,
        minSize: SHAPE_DEFAULTS.MIN_SIZE,
      }
    );

    // Apply grid snapping to group bounds
    const shouldSnap = snapEnabled && !altHeld;
    if (shouldSnap) {
      newGroupBounds = {
        x: snapToGrid(newGroupBounds.x, gridSize),
        y: snapToGrid(newGroupBounds.y, gridSize),
        width: snapToGrid(newGroupBounds.x + newGroupBounds.width, gridSize) - snapToGrid(newGroupBounds.x, gridSize),
        height: snapToGrid(newGroupBounds.y + newGroupBounds.height, gridSize) - snapToGrid(newGroupBounds.y, gridSize),
      };
      // Ensure minimum size
      newGroupBounds.width = Math.max(newGroupBounds.width, SHAPE_DEFAULTS.MIN_SIZE);
      newGroupBounds.height = Math.max(newGroupBounds.height, SHAPE_DEFAULTS.MIN_SIZE);
    }

    // Scale all member shapes proportionally
    const updates = scaleShapesInGroup(startStates, startGroupBounds, newGroupBounds, handle);

    // Apply updates to all shapes
    for (const [shapeId, update] of Object.entries(updates)) {
      updateShape(shapeId, update);
    }
  }, [viewport.zoom, updateShape, snapEnabled, gridSize]);

  /**
   * End the group resize operation and push history entry
   */
  const handleGroupResizeEnd = useCallback(() => {
    const manipState = useInteractionStore.getState().manipulationState;
    const startStates = startShapeStatesRef.current;

    if (manipState && manipState.type === 'group-resize' && Object.keys(startStates).length > 0) {
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
            currentShape.width !== startState.width ||
            currentShape.height !== startState.height;

          if (hasChange) {
            modified.push({
              id: shapeId,
              before: {
                x: startState.x,
                y: startState.y,
                width: startState.width,
                height: startState.height,
              },
              after: {
                x: currentShape.x,
                y: currentShape.y,
                width: currentShape.width,
                height: currentShape.height,
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
          type: 'RESIZE_SHAPE',
          description: `Resize ${modified.length} shapes`,
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
    startGroupBoundsRef.current = null;
    selectionAtStartRef.current = [];

    // Clear global manipulation state
    endManipulation();
  }, [endManipulation, pushEntry]);

  return {
    handleGroupResizeStart,
    handleGroupResizeUpdate,
    handleGroupResizeEnd,
  };
}
