import { useCallback } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { findShapeAtPoint } from '@/lib/geometry/hitTest';
import { screenToCanvas } from '@/lib/geometry/viewport';
import { getConnectionEndpoints, isPointNearLine } from '@/lib/geometry/connection';
import type { Point, Size } from '@/types/common';

interface UseSelectionProps {
  containerSize: Size;
}

export function useSelection({ containerSize }: UseSelectionProps) {
  const viewport = useViewportStore((s) => s.viewport);
  const activeTool = useInteractionStore((s) => s.activeTool);
  const shapes = useDiagramStore((s) => s.shapes);
  const connections = useDiagramStore((s) => s.connections);
  const selectShape = useDiagramStore((s) => s.selectShape);
  const setSelectedConnectionIds = useDiagramStore((s) => s.setSelectedConnectionIds);
  const clearSelection = useDiagramStore((s) => s.clearSelection);

  const handleCanvasClick = useCallback(
    (screenPoint: Point) => {
      if (activeTool !== 'select') return;

      const canvasPoint = screenToCanvas(screenPoint, viewport, containerSize);

      // Check connections first (they're usually on top/more specific hit area)
      const connectionIds = Object.keys(connections);
      for (let i = connectionIds.length - 1; i >= 0; i--) {
        const id = connectionIds[i];
        const connection = connections[id];

        const endpoints = getConnectionEndpoints(connection, shapes);
        if (!endpoints) continue;

        // Scale threshold based on zoom for consistent hit detection
        const threshold = 8 / viewport.zoom;

        if (isPointNearLine(canvasPoint, endpoints.start, endpoints.end, threshold)) {
          setSelectedConnectionIds([id]);
          return;
        }
      }

      // Then check shapes
      const shapesArray = Object.values(shapes);
      const hitShape = findShapeAtPoint(canvasPoint, shapesArray);

      if (hitShape) {
        selectShape(hitShape.id);
      } else {
        clearSelection();
      }
    },
    [activeTool, viewport, containerSize, shapes, connections, selectShape, setSelectedConnectionIds, clearSelection]
  );

  return { handleCanvasClick };
}
