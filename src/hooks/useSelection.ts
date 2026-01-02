import { useCallback } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';
import { findShapeAtPoint } from '@/lib/geometry/hitTest';
import { screenToCanvas } from '@/lib/geometry/viewport';
import type { Point, Size } from '@/types/common';

interface UseSelectionProps {
  containerSize: Size;
}

export function useSelection({ containerSize }: UseSelectionProps) {
  const viewport = useUIStore((s) => s.viewport);
  const activeTool = useUIStore((s) => s.activeTool);
  const shapes = useDiagramStore((s) => s.shapes);
  const selectShape = useDiagramStore((s) => s.selectShape);
  const clearSelection = useDiagramStore((s) => s.clearSelection);

  const handleCanvasClick = useCallback(
    (screenPoint: Point) => {
      if (activeTool !== 'select') return;

      const canvasPoint = screenToCanvas(screenPoint, viewport, containerSize);
      const shapesArray = Object.values(shapes);
      const hitShape = findShapeAtPoint(canvasPoint, shapesArray);

      if (hitShape) {
        selectShape(hitShape.id);
      } else {
        clearSelection();
      }
    },
    [activeTool, viewport, containerSize, shapes, selectShape, clearSelection]
  );

  return { handleCanvasClick };
}
