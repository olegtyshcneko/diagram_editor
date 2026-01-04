import { useCallback } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useHistoryStore } from '@/stores/historyStore';
import { EMPTY_SHAPE_DELTA } from '@/types/history';
import { useGlobalDrag } from '@/lib/input';
import type { AnchorPosition } from '@/types/connections';
import type { Point } from '@/types/common';
import { findNearestAnchor, getAnchorPosition } from '@/lib/geometry/connection';
import { CONNECTION_DEFAULTS } from '@/lib/constants';

interface UseConnectionCreationProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useConnectionCreation({
  containerRef,
}: UseConnectionCreationProps) {
  const shapes = useDiagramStore((s) => s.shapes);
  const addConnection = useDiagramStore((s) => s.addConnection);
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);

  const activeTool = useInteractionStore((s) => s.activeTool);
  const connectionCreationState = useInteractionStore(
    (s) => s.connectionCreationState
  );
  // Stable boolean selector - doesn't change on every currentPoint update
  const isCreatingConnection = useInteractionStore(
    (s) => s.connectionCreationState !== null
  );
  const startConnectionCreation = useInteractionStore(
    (s) => s.startConnectionCreation
  );
  const updateConnectionCreation = useInteractionStore(
    (s) => s.updateConnectionCreation
  );
  const endConnectionCreation = useInteractionStore(
    (s) => s.endConnectionCreation
  );

  const viewport = useViewportStore((s) => s.viewport);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number): Point | null => {
      if (!containerRef.current) {
        console.warn('screenToCanvas called with null container ref');
        return null;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const x = viewport.x + (screenX - rect.left) / viewport.zoom;
      const y = viewport.y + (screenY - rect.top) / viewport.zoom;

      return { x, y };
    },
    [viewport, containerRef]
  );

  // Handle starting a connection from an anchor
  const handleAnchorMouseDown = useCallback(
    (shapeId: string, anchor: AnchorPosition, e: React.MouseEvent) => {
      if (activeTool !== 'connection') return;

      e.stopPropagation();
      e.preventDefault();

      const shape = shapes[shapeId];
      if (!shape) return;

      const anchorPoint = getAnchorPosition(shape, anchor);
      startConnectionCreation(shapeId, anchor, anchorPoint);
    },
    [activeTool, shapes, startConnectionCreation]
  );

  // Handle mouse move during connection creation
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!connectionCreationState) return;

      const canvasPoint = screenToCanvas(e.clientX, e.clientY);
      if (!canvasPoint) return;

      updateConnectionCreation(canvasPoint);
    },
    [connectionCreationState, screenToCanvas, updateConnectionCreation]
  );

  // Handle mouse up to complete or cancel connection
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!connectionCreationState) return;

      const canvasPoint = screenToCanvas(e.clientX, e.clientY);
      if (!canvasPoint) {
        endConnectionCreation();
        return;
      }

      // Find target shape and anchor
      let targetShapeId: string | null = null;
      let targetAnchor: AnchorPosition | null = null;

      // Zoom-aware anchor snap threshold
      const anchorThreshold = CONNECTION_DEFAULTS.ANCHOR_SNAP_THRESHOLD / viewport.zoom;

      // Search all shapes for a nearby anchor
      for (const [id, shape] of Object.entries(shapes)) {
        // Don't connect to self
        if (id === connectionCreationState.sourceShapeId) continue;

        const nearestAnchor = findNearestAnchor(shape, canvasPoint, anchorThreshold);
        if (nearestAnchor) {
          targetShapeId = id;
          targetAnchor = nearestAnchor.anchor;
          break;
        }
      }

      // Create connection if valid target found
      if (targetShapeId && targetAnchor) {
        // Capture selection before (connection creation clears it)
        const selectionBefore = [...selectedShapeIds];

        addConnection({
          sourceShapeId: connectionCreationState.sourceShapeId,
          sourceAnchor: connectionCreationState.sourceAnchor,
          targetShapeId,
          targetAnchor,
        });

        // Get the created connection (it's auto-selected after creation)
        const state = useDiagramStore.getState();
        const newConnectionId = state.selectedConnectionIds[0];
        const createdConnection = newConnectionId
          ? state.connections[newConnectionId]
          : null;

        if (createdConnection) {
          pushEntry({
            type: 'CREATE_CONNECTION',
            description: 'Create Connection',
            shapeDelta: EMPTY_SHAPE_DELTA,
            connectionDelta: {
              added: [createdConnection],
              removed: [],
              modified: [],
            },
            selectionBefore,
            selectionAfter: [], // Connections selected, not shapes
          });
        }
      }

      endConnectionCreation();
    },
    [connectionCreationState, screenToCanvas, shapes, addConnection, endConnectionCreation, viewport.zoom, pushEntry, selectedShapeIds]
  );

  // Handle escape to cancel connection creation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && connectionCreationState) {
        e.preventDefault();
        endConnectionCreation();
      }
    },
    [connectionCreationState, endConnectionCreation]
  );

  // Use centralized global drag hook for mouse/keyboard tracking
  // The hook internally uses refs to always call the latest handler versions
  useGlobalDrag({
    isActive: isCreatingConnection,
    onMove: handleMouseMove,
    onEnd: handleMouseUp,
    onKeyDown: handleKeyDown,
  });

  return {
    handleAnchorMouseDown,
    isCreatingConnection,
  };
}
