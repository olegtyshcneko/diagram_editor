import { useCallback } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useViewportStore } from '@/stores/viewportStore';
import { screenToCanvas } from '@/lib/geometry/viewport';
import { getConnectionEndpoints, isPointNearLine } from '@/lib/geometry/connection';
import type { Point, Size } from '@/types/common';

interface UseConnectionSelectionProps {
  containerSize: Size;
}

/**
 * Hook that provides connection hit testing for selection
 */
export function useConnectionSelection({ containerSize }: UseConnectionSelectionProps) {
  const viewport = useViewportStore((s) => s.viewport);
  const shapes = useDiagramStore((s) => s.shapes);
  const connections = useDiagramStore((s) => s.connections);
  const setSelectedConnectionIds = useDiagramStore((s) => s.setSelectedConnectionIds);

  /**
   * Find a connection at the given screen point
   * Returns the connection id if found, null otherwise
   */
  const findConnectionAtPoint = useCallback(
    (screenPoint: Point): string | null => {
      const canvasPoint = screenToCanvas(screenPoint, viewport, containerSize);

      // Check connections in reverse order (top-most first)
      const connectionIds = Object.keys(connections);
      for (let i = connectionIds.length - 1; i >= 0; i--) {
        const id = connectionIds[i];
        const connection = connections[id];

        const endpoints = getConnectionEndpoints(connection, shapes);
        if (!endpoints) continue;

        // Scale threshold based on zoom for consistent hit detection
        const threshold = 8 / viewport.zoom;

        if (isPointNearLine(canvasPoint, endpoints.start, endpoints.end, threshold)) {
          return id;
        }
      }

      return null;
    },
    [viewport, containerSize, connections, shapes]
  );

  /**
   * Select a connection by id
   */
  const selectConnection = useCallback(
    (connectionId: string) => {
      setSelectedConnectionIds([connectionId]);
    },
    [setSelectedConnectionIds]
  );

  return {
    findConnectionAtPoint,
    selectConnection,
  };
}
