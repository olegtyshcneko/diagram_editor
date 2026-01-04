/**
 * Hook for label position dragging
 *
 * Manages dragging labels to reposition them along the connection path.
 * Projects mouse position onto the path to calculate new label position.
 * Fetches all connection data from store internally.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useCanvasContainer } from '@/contexts/CanvasContainerContext';
import { screenToCanvas } from '@/lib/geometry/viewport';
import { findNearestTOnPath, waypointsToAbsolute } from '@/lib/geometry/pathUtils';
import { getConnectionEndpoints } from '@/lib/geometry/connection';
import { getAbsoluteControlPoints } from '@/lib/geometry/bezier';
import { EMPTY_SHAPE_DELTA } from '@/types/history';
import { useGlobalDrag } from '@/lib/input';
import type { Point } from '@/types/common';

interface UseLabelDragProps {
  connectionId: string;
  enabled?: boolean;
}

const NOOP_RETURN = {
  handleDragStart: () => {},
  isDragging: false,
};

/**
 * Hook to manage label position dragging on connections.
 * Projects mouse position onto the path to calculate label position (0-1).
 * Fetches connection data from store internally.
 */
export function useLabelDrag({
  connectionId,
  enabled = true,
}: UseLabelDragProps) {
  const containerRef = useCanvasContainer();
  const updateConnection = useDiagramStore((s) => s.updateConnection);
  const connections = useDiagramStore((s) => s.connections);
  const shapes = useDiagramStore((s) => s.shapes);
  const viewport = useViewportStore((s) => s.viewport);
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const setLabelDragging = useInteractionStore((s) => s.setLabelDragging);
  const selectedConnectionIds = useDiagramStore((s) => s.selectedConnectionIds);

  const [isDraggingState, setIsDraggingState] = useState(false);

  // Refs for tracking drag state
  const initialPositionRef = useRef<number | null>(null);
  const viewportRef = useRef(viewport);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  /**
   * Convert client coordinates to canvas coordinates.
   */
  const clientToCanvas = useCallback(
    (clientX: number, clientY: number): Point | null => {
      const container = containerRef.current;
      if (!container) return null;

      const rect = container.getBoundingClientRect();
      const screenPoint = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };

      return screenToCanvas(screenPoint, viewportRef.current, { width: 0, height: 0 });
    },
    [containerRef]
  );

  /**
   * Start dragging the label.
   */
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const connection = connections[connectionId];
      if (!connection) return;

      setIsDraggingState(true);
      setLabelDragging(true);

      // Store initial position for history
      initialPositionRef.current = connection.labelPosition ?? 0.5;
    },
    [connectionId, connections, setLabelDragging]
  );

  /**
   * Handle mouse move during label drag.
   * Projects mouse position onto the path to find new label position.
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingState) return;

      const canvasPoint = clientToCanvas(e.clientX, e.clientY);
      if (!canvasPoint) return;

      const connection = connections[connectionId];
      if (!connection) return;

      // Get current endpoints
      const endpoints = getConnectionEndpoints(connection, shapes);
      if (!endpoints) return;

      const { start, end } = endpoints;
      const isCurved = connection.curveType === 'bezier';

      // Build path options from current connection state
      const { cp1, cp2 } = isCurved
        ? getAbsoluteControlPoints(
            connection.controlPoints,
            start,
            end,
            connection.sourceAnchor,
            connection.targetAnchor || 'left'
          )
        : { cp1: undefined, cp2: undefined };

      const waypointPositions = waypointsToAbsolute(connection.waypoints, start, end);

      // Find nearest t-value on the path
      const { t } = findNearestTOnPath(
        connection.curveType,
        canvasPoint,
        start,
        end,
        {
          cp1,
          cp2,
          startAnchor: connection.sourceAnchor,
          endAnchor: connection.targetAnchor || 'left',
          waypointPositions,
        }
      );

      // Clamp t to [0.05, 0.95] to keep label visible on path
      const clampedT = Math.max(0.05, Math.min(0.95, t));

      updateConnection(connectionId, { labelPosition: clampedT });
    },
    [connectionId, connections, shapes, clientToCanvas, updateConnection, isDraggingState]
  );

  /**
   * Handle drag end - push history entry.
   */
  const handleMouseUp = useCallback(() => {
    const initialPosition = initialPositionRef.current;

    if (initialPosition === null) {
      setIsDraggingState(false);
      initialPositionRef.current = null;
      requestAnimationFrame(() => setLabelDragging(false));
      return;
    }

    const connection = connections[connectionId];
    if (connection && connection.labelPosition !== initialPosition) {
      // Push history entry
      pushEntry({
        type: 'UPDATE_LABEL',
        description: 'Move Label',
        shapeDelta: EMPTY_SHAPE_DELTA,
        connectionDelta: {
          added: [],
          removed: [],
          modified: [
            {
              id: connectionId,
              before: { labelPosition: initialPosition },
              after: { labelPosition: connection.labelPosition },
            },
          ],
        },
        selectionBefore: selectedConnectionIds,
        selectionAfter: selectedConnectionIds,
      });
    }

    setIsDraggingState(false);
    initialPositionRef.current = null;
    requestAnimationFrame(() => setLabelDragging(false));
  }, [connectionId, connections, pushEntry, selectedConnectionIds, setLabelDragging]);

  // Use global drag hook
  useGlobalDrag({
    isActive: isDraggingState,
    onMove: handleMouseMove,
    onEnd: handleMouseUp,
  });

  if (!enabled) {
    return NOOP_RETURN;
  }

  return {
    handleDragStart,
    isDragging: isDraggingState,
  };
}
