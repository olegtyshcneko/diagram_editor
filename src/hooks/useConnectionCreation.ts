import { useCallback, useEffect, useRef } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useViewportStore } from '@/stores/viewportStore';
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
        addConnection({
          sourceShapeId: connectionCreationState.sourceShapeId,
          sourceAnchor: connectionCreationState.sourceAnchor,
          targetShapeId,
          targetAnchor,
        });
      }

      endConnectionCreation();
    },
    [connectionCreationState, screenToCanvas, shapes, addConnection, endConnectionCreation, viewport.zoom]
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

  // Store handlers in ref to avoid recreating listeners on every render
  const handlersRef = useRef({ handleMouseMove, handleMouseUp, handleKeyDown });
  useEffect(() => {
    handlersRef.current = { handleMouseMove, handleMouseUp, handleKeyDown };
  });

  // Attach global listeners during connection creation
  // Use stable boolean (isCreatingConnection) as dependency, not the object (connectionCreationState)
  // This prevents re-adding listeners on every mouse move
  useEffect(() => {
    if (!isCreatingConnection) return;

    const onMouseMove = (e: MouseEvent) => handlersRef.current.handleMouseMove(e);
    const onMouseUp = (e: MouseEvent) => handlersRef.current.handleMouseUp(e);
    const onKeyDown = (e: KeyboardEvent) => handlersRef.current.handleKeyDown(e);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isCreatingConnection]);

  return {
    handleAnchorMouseDown,
    isCreatingConnection,
  };
}
