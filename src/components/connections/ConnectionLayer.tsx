import React, { useState, useCallback, useContext } from 'react';
import { nanoid } from 'nanoid';
import { useDiagramStore } from '@/stores/diagramStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useViewportStore } from '@/stores/viewportStore';
import { EMPTY_SHAPE_DELTA } from '@/types/history';
import { Connection } from './Connection';
import { CanvasContainerContext } from '@/contexts/CanvasContainerContext';
import { getConnectionEndpoints } from '@/lib/geometry/connection';
import { calculateWaypointInsertIndex, waypointsToAbsolute, absoluteToWaypoint } from '@/lib/geometry/pathUtils';
import type { Waypoint } from '@/types/connections';

export function ConnectionLayer() {
  const shapes = useDiagramStore((s) => s.shapes);
  const connections = useDiagramStore((s) => s.connections);
  const updateConnection = useDiagramStore((s) => s.updateConnection);
  const selectedConnectionIds = useDiagramStore((s) => s.selectedConnectionIds);
  const setSelectedConnectionIds = useDiagramStore(
    (s) => s.setSelectedConnectionIds
  );
  const setEditingLabelConnectionId = useInteractionStore(
    (s) => s.setEditingLabelConnectionId
  );
  const setPendingConnectionInteraction = useInteractionStore(
    (s) => s.setPendingConnectionInteraction
  );
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const viewport = useViewportStore((s) => s.viewport);
  const containerRef = useContext(CanvasContainerContext);

  const [hoveredConnectionId, setHoveredConnectionId] = useState<string | null>(
    null
  );

  const handleConnectionMouseDown = useCallback(
    (connectionId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedConnectionIds([connectionId]);
      // Mark that we just interacted with a connection to prevent canvas click from clearing selection
      setPendingConnectionInteraction(true);
    },
    [setSelectedConnectionIds, setPendingConnectionInteraction]
  );

  // Handle double-click on label - enter edit mode
  const handleLabelDoubleClick = useCallback(
    (connectionId: string) => {
      setEditingLabelConnectionId(connectionId);
    },
    [setEditingLabelConnectionId]
  );

  // Handle double-click on waypoint - remove it
  const handleWaypointDoubleClick = useCallback(
    (connectionId: string, waypointId: string) => {
      const connection = connections[connectionId];
      if (!connection) return;

      const previousWaypoints = connection.waypoints;
      const updatedWaypoints = connection.waypoints.filter(
        (wp) => wp.id !== waypointId
      );

      updateConnection(connectionId, { waypoints: updatedWaypoints });

      // Push history entry
      pushEntry({
        type: 'REMOVE_WAYPOINT',
        description: 'Remove Waypoint',
        shapeDelta: EMPTY_SHAPE_DELTA,
        connectionDelta: {
          added: [],
          removed: [],
          modified: [
            {
              id: connectionId,
              before: { waypoints: previousWaypoints },
              after: { waypoints: updatedWaypoints },
            },
          ],
        },
        selectionBefore: selectedConnectionIds,
        selectionAfter: selectedConnectionIds,
      });
    },
    [connections, updateConnection, pushEntry, selectedConnectionIds]
  );

  // Handle double-click on connection line - add label or waypoint
  const handleConnectionDoubleClick = useCallback(
    (connectionId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const connection = connections[connectionId];
      if (!connection) return;

      const isSelected = selectedConnectionIds.includes(connectionId);

      // If connection has no label, add one at midpoint
      if (!connection.label) {
        updateConnection(connectionId, {
          label: 'Label',
          labelPosition: 0.5,
        });

        pushEntry({
          type: 'ADD_LABEL',
          description: 'Add Label',
          shapeDelta: EMPTY_SHAPE_DELTA,
          connectionDelta: {
            added: [],
            removed: [],
            modified: [
              {
                id: connectionId,
                before: { label: undefined, labelPosition: undefined },
                after: { label: 'Label', labelPosition: 0.5 },
              },
            ],
          },
          selectionBefore: selectedConnectionIds,
          selectionAfter: selectedConnectionIds,
        });

        // Enter edit mode immediately
        setEditingLabelConnectionId(connectionId);
        return;
      }

      // If connection is selected and already has a label, add a waypoint
      // (The click was on the line, not the label)
      // Waypoints only work for straight connections
      if (isSelected && connection.curveType === 'straight') {
        // Convert screen coordinates to canvas coordinates
        const rect = containerRef?.current?.getBoundingClientRect();
        if (!rect) return;

        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const canvasPoint = {
          x: screenX / viewport.zoom + viewport.x,
          y: screenY / viewport.zoom + viewport.y,
        };

        // Get connection endpoints
        const endpoints = getConnectionEndpoints(connection, shapes);
        if (!endpoints) return;

        // Convert existing waypoints to absolute positions for insertion index calculation
        const existingAbsolutePositions = waypointsToAbsolute(
          connection.waypoints,
          endpoints.start,
          endpoints.end
        );

        // Calculate insertion index for the new waypoint
        const insertIndex = calculateWaypointInsertIndex(
          canvasPoint,
          existingAbsolutePositions,
          endpoints.start,
          endpoints.end
        );

        // Create new waypoint with relative position (t + offset)
        const newWaypoint: Waypoint = absoluteToWaypoint(
          canvasPoint,
          endpoints.start,
          endpoints.end,
          nanoid()
        );

        // Insert at calculated position
        const updatedWaypoints = [...connection.waypoints];
        updatedWaypoints.splice(insertIndex, 0, newWaypoint);

        updateConnection(connectionId, { waypoints: updatedWaypoints });

        pushEntry({
          type: 'ADD_WAYPOINT',
          description: 'Add Waypoint',
          shapeDelta: EMPTY_SHAPE_DELTA,
          connectionDelta: {
            added: [],
            removed: [],
            modified: [
              {
                id: connectionId,
                before: { waypoints: connection.waypoints },
                after: { waypoints: updatedWaypoints },
              },
            ],
          },
          selectionBefore: selectedConnectionIds,
          selectionAfter: selectedConnectionIds,
        });
      }
    },
    [connections, updateConnection, pushEntry, selectedConnectionIds, setEditingLabelConnectionId, containerRef, viewport, shapes]
  );

  const connectionList = Object.values(connections);

  if (connectionList.length === 0) return null;

  return (
    <g className="connection-layer">
      {connectionList.map((connection) => (
        <Connection
          key={connection.id}
          connection={connection}
          shapes={shapes}
          isSelected={selectedConnectionIds.includes(connection.id)}
          isHovered={hoveredConnectionId === connection.id}
          onMouseDown={(e) => handleConnectionMouseDown(connection.id, e)}
          onMouseEnter={() => setHoveredConnectionId(connection.id)}
          onMouseLeave={() => setHoveredConnectionId(null)}
          onDoubleClick={(e) => handleConnectionDoubleClick(connection.id, e)}
          onLabelDoubleClick={() => handleLabelDoubleClick(connection.id)}
          onWaypointDoubleClick={(waypointId) =>
            handleWaypointDoubleClick(connection.id, waypointId)
          }
        />
      ))}
    </g>
  );
}
