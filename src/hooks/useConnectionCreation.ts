import { useCallback, useState } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useHistoryStore } from '@/stores/historyStore';
import { EMPTY_SHAPE_DELTA } from '@/types/history';
import { useGlobalDrag } from '@/lib/input';
import type { AnchorPosition } from '@/types/connections';
import type { Point } from '@/types/common';
import type { Shape } from '@/types/shapes';
import { findNearestAnchor, getAnchorPosition } from '@/lib/geometry/connection';
import { findShapeAtPoint } from '@/lib/geometry/hitTest';
import { calculateBestAnchor, ANCHOR_SNAP_THRESHOLD } from '@/lib/geometry/anchorSelection';

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

  // State for shape-level targeting visual feedback
  const [hoveredShape, setHoveredShape] = useState<Shape | null>(null);
  const [predictedAnchor, setPredictedAnchor] = useState<AnchorPosition | null>(null);
  const [isSnapped, setIsSnapped] = useState(false);

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

      // Track shape under cursor for shape-level targeting
      const shapesArray = Object.values(shapes).filter(
        (s) => s.id !== connectionCreationState.sourceShapeId
      );
      const targetShape = findShapeAtPoint(canvasPoint, shapesArray);

      if (targetShape) {
        const result = calculateBestAnchor(
          targetShape,
          canvasPoint,
          connectionCreationState.sourcePoint,
          connectionCreationState.sourceAnchor
        );
        setHoveredShape(targetShape);
        setPredictedAnchor(result.anchor);
        setIsSnapped(result.snapped);
      } else {
        setHoveredShape(null);
        setPredictedAnchor(null);
        setIsSnapped(false);
      }
    },
    [connectionCreationState, screenToCanvas, updateConnectionCreation, shapes]
  );

  // Handle mouse up to complete or cancel connection
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!connectionCreationState) return;

      const canvasPoint = screenToCanvas(e.clientX, e.clientY);
      if (!canvasPoint) {
        // Clear targeting state
        setHoveredShape(null);
        setPredictedAnchor(null);
        setIsSnapped(false);
        endConnectionCreation();
        return;
      }

      // Find target shape and anchor
      let targetShapeId: string | null = null;
      let targetAnchor: AnchorPosition | null = null;

      // Zoom-aware anchor snap threshold for direct anchor clicking
      const anchorThreshold = ANCHOR_SNAP_THRESHOLD / viewport.zoom;

      // First: Check for direct anchor snap (smaller threshold for precise clicks)
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

      // Second: If no direct anchor snap, check for shape body hit (shape-level targeting)
      if (!targetShapeId) {
        const shapesArray = Object.values(shapes).filter(
          (s) => s.id !== connectionCreationState.sourceShapeId
        );
        const targetShape = findShapeAtPoint(canvasPoint, shapesArray);

        if (targetShape) {
          // Use best anchor calculation for shape-level targeting
          const result = calculateBestAnchor(
            targetShape,
            canvasPoint,
            connectionCreationState.sourcePoint,
            connectionCreationState.sourceAnchor
          );
          targetShapeId = targetShape.id;
          targetAnchor = result.anchor;
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

      // Clear targeting state
      setHoveredShape(null);
      setPredictedAnchor(null);
      setIsSnapped(false);
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
    // Shape-level targeting state for visual feedback
    hoveredShape,
    predictedAnchor,
    isSnapped,
  };
}
