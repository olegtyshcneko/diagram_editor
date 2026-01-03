import { useCallback } from 'react';
import { useViewportStore } from '@/stores/viewportStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useDiagramStore } from '@/stores/diagramStore';
import { useHistoryStore } from '@/stores/historyStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import type { Point, Size } from '@/types/common';
import type { ShapeType } from '@/types/shapes';
import { screenToCanvas } from '@/lib/geometry/viewport';
import { getCreationBounds } from '@/types/creation';
import { SHAPE_DEFAULTS } from '@/lib/constants';
import { snapToGrid } from '@/lib/geometry/snap';
import { EMPTY_CONNECTION_DELTA } from '@/types/history';

interface UseShapeCreationProps {
  containerSize: Size;
}

export function useShapeCreation({ containerSize }: UseShapeCreationProps) {
  const viewport = useViewportStore((s) => s.viewport);
  const activeTool = useInteractionStore((s) => s.activeTool);
  const creationState = useInteractionStore((s) => s.creationState);
  const startCreation = useInteractionStore((s) => s.startCreation);
  const updateCreation = useInteractionStore((s) => s.updateCreation);
  const cancelCreation = useInteractionStore((s) => s.cancelCreation);
  const addShape = useDiagramStore((s) => s.addShape);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const snapEnabled = usePreferencesStore((s) => s.snapToGrid);
  const gridSize = usePreferencesStore((s) => s.gridSize);

  const isCreationTool = activeTool === 'rectangle' || activeTool === 'ellipse';

  const handleMouseDown = useCallback(
    (screenPoint: Point) => {
      if (!isCreationTool) return;

      const canvasPoint = screenToCanvas(screenPoint, viewport, containerSize);
      startCreation(activeTool as ShapeType, canvasPoint);
    },
    [isCreationTool, activeTool, viewport, containerSize, startCreation]
  );

  const handleMouseMove = useCallback(
    (screenPoint: Point, isShiftHeld: boolean) => {
      if (!creationState) return;

      const canvasPoint = screenToCanvas(screenPoint, viewport, containerSize);
      updateCreation(canvasPoint, isShiftHeld);
    },
    [creationState, viewport, containerSize, updateCreation]
  );

  const handleMouseUp = useCallback(() => {
    if (!creationState) return;

    const bounds = getCreationBounds(creationState);
    const minSize = 5;

    // Capture selection before the operation
    const selectionBefore = [...selectedShapeIds];

    let newId: string;
    if (bounds.width < minSize && bounds.height < minSize) {
      // Click (not drag) - use default size, centered at click point
      let x = creationState.startPoint.x - SHAPE_DEFAULTS.DEFAULT_WIDTH / 2;
      let y = creationState.startPoint.y - SHAPE_DEFAULTS.DEFAULT_HEIGHT / 2;

      // Apply snap
      if (snapEnabled) {
        x = snapToGrid(x, gridSize);
        y = snapToGrid(y, gridSize);
      } else {
        x = Math.round(x);
        y = Math.round(y);
      }

      newId = addShape({
        type: creationState.type,
        x,
        y,
        width: SHAPE_DEFAULTS.DEFAULT_WIDTH,
        height: SHAPE_DEFAULTS.DEFAULT_HEIGHT,
      });
    } else {
      // Drag - use drawn size
      let x = bounds.x;
      let y = bounds.y;
      let w = bounds.width;
      let h = bounds.height;

      // Apply snap
      if (snapEnabled) {
        x = snapToGrid(x, gridSize);
        y = snapToGrid(y, gridSize);
        // Snap right/bottom edges
        w = snapToGrid(bounds.x + bounds.width, gridSize) - x;
        h = snapToGrid(bounds.y + bounds.height, gridSize) - y;
        // Ensure minimum size
        w = Math.max(w, SHAPE_DEFAULTS.MIN_SIZE);
        h = Math.max(h, SHAPE_DEFAULTS.MIN_SIZE);
      } else {
        x = Math.round(x);
        y = Math.round(y);
        w = Math.round(w);
        h = Math.round(h);
      }

      newId = addShape({
        type: creationState.type,
        x,
        y,
        width: w,
        height: h,
      });
    }

    // Get the created shape and push to history
    const createdShape = useDiagramStore.getState().shapes[newId];
    if (createdShape) {
      const shapeTypeName = creationState.type.charAt(0).toUpperCase() + creationState.type.slice(1);
      pushEntry({
        type: 'CREATE_SHAPE',
        description: `Create ${shapeTypeName}`,
        shapeDelta: {
          added: [createdShape],
          removed: [],
          modified: [],
        },
        connectionDelta: EMPTY_CONNECTION_DELTA,
        selectionBefore,
        selectionAfter: [newId],
      });
    }

    cancelCreation();
  }, [creationState, addShape, cancelCreation, selectedShapeIds, pushEntry, snapEnabled, gridSize]);

  return {
    isCreating: creationState !== null,
    creationState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
