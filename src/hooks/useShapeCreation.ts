import { useCallback } from 'react';
import { useViewportStore } from '@/stores/viewportStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useDiagramStore } from '@/stores/diagramStore';
import type { Point, Size } from '@/types/common';
import type { ShapeType } from '@/types/shapes';
import { screenToCanvas } from '@/lib/geometry/viewport';
import { getCreationBounds } from '@/types/creation';
import { SHAPE_DEFAULTS } from '@/lib/constants';

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

    if (bounds.width < minSize && bounds.height < minSize) {
      // Click (not drag) - use default size, centered at click point
      addShape({
        type: creationState.type,
        x: Math.round(creationState.startPoint.x - SHAPE_DEFAULTS.DEFAULT_WIDTH / 2),
        y: Math.round(creationState.startPoint.y - SHAPE_DEFAULTS.DEFAULT_HEIGHT / 2),
        width: SHAPE_DEFAULTS.DEFAULT_WIDTH,
        height: SHAPE_DEFAULTS.DEFAULT_HEIGHT,
      });
    } else {
      // Drag - use drawn size
      addShape({
        type: creationState.type,
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
      });
    }

    cancelCreation();
  }, [creationState, addShape, cancelCreation]);

  return {
    isCreating: creationState !== null,
    creationState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
