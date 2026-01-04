/**
 * Hook for waypoint dragging
 *
 * Manages dragging waypoints to reposition them on connections.
 * Handles coordinate conversion, state updates, and history tracking.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useCanvasContainer } from '@/contexts/CanvasContainerContext';
import { screenToCanvas } from '@/lib/geometry/viewport';
import { absoluteToWaypoint } from '@/lib/geometry/pathUtils';
import { getConnectionEndpoints } from '@/lib/geometry/connection';
import { EMPTY_SHAPE_DELTA } from '@/types/history';
import { useGlobalDrag } from '@/lib/input';
import type { Point } from '@/types/common';
import type { Waypoint } from '@/types/connections';

interface UseWaypointDragProps {
  connectionId: string;
  enabled?: boolean;
}

const NOOP_RETURN = {
  handleDragStart: () => {},
  isDragging: false,
};

/**
 * Hook to manage waypoint dragging for connections.
 * Fetches connection endpoints from store internally.
 */
export function useWaypointDrag({
  connectionId,
  enabled = true,
}: UseWaypointDragProps) {
  const containerRef = useCanvasContainer();
  const updateConnection = useDiagramStore((s) => s.updateConnection);
  const connections = useDiagramStore((s) => s.connections);
  const shapes = useDiagramStore((s) => s.shapes);
  const viewport = useViewportStore((s) => s.viewport);
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const setWaypointDragging = useInteractionStore((s) => s.setWaypointDragging);
  const selectedConnectionIds = useDiagramStore((s) => s.selectedConnectionIds);

  const [isDraggingState, setIsDraggingState] = useState(false);

  // Refs for tracking drag state
  const draggingWaypointIdRef = useRef<string | null>(null);
  const initialWaypointsRef = useRef<Waypoint[] | null>(null);
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
   * Start dragging a waypoint.
   */
  const handleDragStart = useCallback(
    (waypointId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const connection = connections[connectionId];
      if (!connection) return;

      setIsDraggingState(true);
      draggingWaypointIdRef.current = waypointId;
      setWaypointDragging(true);

      // Store initial waypoints for history
      initialWaypointsRef.current = [...connection.waypoints];
    },
    [connectionId, connections, setWaypointDragging]
  );

  /**
   * Handle mouse move during waypoint drag.
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const waypointId = draggingWaypointIdRef.current;
      if (!waypointId) return;

      const canvasPoint = clientToCanvas(e.clientX, e.clientY);
      if (!canvasPoint) return;

      const connection = connections[connectionId];
      if (!connection) return;

      // Get current endpoints from store
      const endpoints = getConnectionEndpoints(connection, shapes);
      if (!endpoints) return;

      // Convert absolute position to relative waypoint (t + offset)
      // This ensures waypoints move correctly when shapes are moved
      const updatedWaypoints = connection.waypoints.map((wp) =>
        wp.id === waypointId
          ? absoluteToWaypoint(canvasPoint, endpoints.start, endpoints.end, wp.id)
          : wp
      );

      updateConnection(connectionId, { waypoints: updatedWaypoints });
    },
    [connectionId, connections, shapes, clientToCanvas, updateConnection]
  );

  /**
   * Handle drag end - push history entry.
   */
  const handleMouseUp = useCallback(() => {
    const waypointId = draggingWaypointIdRef.current;
    const initialWaypoints = initialWaypointsRef.current;

    if (!waypointId || !initialWaypoints) {
      setIsDraggingState(false);
      draggingWaypointIdRef.current = null;
      initialWaypointsRef.current = null;
      requestAnimationFrame(() => setWaypointDragging(false));
      return;
    }

    const connection = connections[connectionId];
    if (connection) {
      // Push history entry
      pushEntry({
        type: 'MOVE_WAYPOINT',
        description: 'Move Waypoint',
        shapeDelta: EMPTY_SHAPE_DELTA,
        connectionDelta: {
          added: [],
          removed: [],
          modified: [
            {
              id: connectionId,
              before: { waypoints: initialWaypoints },
              after: { waypoints: connection.waypoints },
            },
          ],
        },
        selectionBefore: selectedConnectionIds,
        selectionAfter: selectedConnectionIds,
      });
    }

    setIsDraggingState(false);
    draggingWaypointIdRef.current = null;
    initialWaypointsRef.current = null;
    requestAnimationFrame(() => setWaypointDragging(false));
  }, [connectionId, connections, pushEntry, selectedConnectionIds, setWaypointDragging]);

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
