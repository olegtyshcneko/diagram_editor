import { useCallback } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { findShapeAtPoint } from '@/lib/geometry/hitTest';
import { screenToCanvas } from '@/lib/geometry/viewport';
import { getConnectionEndpoints, isPointNearLine } from '@/lib/geometry/connection';
import { getAbsoluteControlPoints, isPointNearBezier } from '@/lib/geometry/bezier';
import { calculateOrthogonalPath, isPointNearOrthogonalPath } from '@/lib/geometry/orthogonal';
import type { Point, Size } from '@/types/common';

interface UseSelectionProps {
  containerSize: Size;
}

export function useSelection({ containerSize }: UseSelectionProps) {
  const viewport = useViewportStore((s) => s.viewport);
  const activeTool = useInteractionStore((s) => s.activeTool);
  const shapes = useDiagramStore((s) => s.shapes);
  const connections = useDiagramStore((s) => s.connections);
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

        let isNearConnection = false;

        if (connection.curveType === 'bezier') {
          // For curved connections, use bezier hit testing
          // Use utility to convert relative offsets to absolute positions
          const { cp1, cp2 } = getAbsoluteControlPoints(
            connection.controlPoints,
            endpoints.start,
            endpoints.end,
            connection.sourceAnchor,
            connection.targetAnchor || 'left'
          );

          isNearConnection = isPointNearBezier(
            canvasPoint,
            { start: endpoints.start, cp1, cp2, end: endpoints.end },
            threshold
          );
        } else if (connection.curveType === 'orthogonal') {
          // For orthogonal connections, calculate path and test each segment
          const pathPoints = calculateOrthogonalPath(
            endpoints.start,
            connection.sourceAnchor,
            endpoints.end,
            connection.targetAnchor || 'left'
          );
          isNearConnection = isPointNearOrthogonalPath(
            canvasPoint,
            pathPoints,
            threshold
          );
        } else {
          // For straight connections, use line hit testing
          isNearConnection = isPointNearLine(
            canvasPoint,
            endpoints.start,
            endpoints.end,
            threshold
          );
        }

        if (isNearConnection) {
          setSelectedConnectionIds([id]);
          return;
        }
      }

      // Check if clicked on a shape - if so, Shape.tsx already handled selection
      // on mouseDown with proper modifier key support (Ctrl/Shift+click)
      const shapesArray = Object.values(shapes);
      const hitShape = findShapeAtPoint(canvasPoint, shapesArray);

      // Only clear selection if clicked on empty canvas (no shape hit)
      // Shape clicks are handled by Shape.tsx mouseDown with multi-select support
      // Note: Group edit mode exit is handled in CanvasContainer.handleMouseDown
      if (!hitShape) {
        clearSelection();
      }
    },
    [activeTool, viewport, containerSize, shapes, connections, setSelectedConnectionIds, clearSelection]
  );

  return { handleCanvasClick };
}
