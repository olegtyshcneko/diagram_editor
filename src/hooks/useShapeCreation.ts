import { useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';
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
  const viewport = useUIStore((s) => s.viewport);
  const activeTool = useUIStore((s) => s.activeTool);
  const creationState = useUIStore((s) => s.creationState);
  const startCreation = useUIStore((s) => s.startCreation);
  const updateCreation = useUIStore((s) => s.updateCreation);
  const cancelCreation = useUIStore((s) => s.cancelCreation);
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
        x: creationState.startPoint.x - SHAPE_DEFAULTS.DEFAULT_WIDTH / 2,
        y: creationState.startPoint.y - SHAPE_DEFAULTS.DEFAULT_HEIGHT / 2,
        width: SHAPE_DEFAULTS.DEFAULT_WIDTH,
        height: SHAPE_DEFAULTS.DEFAULT_HEIGHT,
      });
    } else {
      // Drag - use drawn size
      addShape({
        type: creationState.type,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
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
