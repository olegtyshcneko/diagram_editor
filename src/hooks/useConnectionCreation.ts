import { useCallback, useEffect } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useViewportStore } from '@/stores/viewportStore';
import type { AnchorPosition } from '@/types/connections';
import type { Point } from '@/types/common';
import { findNearestAnchor, getAnchorPosition } from '@/lib/geometry/connection';

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
    (screenX: number, screenY: number): Point => {
      if (!containerRef.current) return { x: 0, y: 0 };

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
      updateConnectionCreation(canvasPoint);
    },
    [connectionCreationState, screenToCanvas, updateConnectionCreation]
  );

  // Handle mouse up to complete or cancel connection
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!connectionCreationState) return;

      const canvasPoint = screenToCanvas(e.clientX, e.clientY);

      // Find target shape and anchor
      let targetShapeId: string | null = null;
      let targetAnchor: AnchorPosition | null = null;

      // Search all shapes for a nearby anchor
      for (const [id, shape] of Object.entries(shapes)) {
        // Don't connect to self
        if (id === connectionCreationState.sourceShapeId) continue;

        const nearestAnchor = findNearestAnchor(shape, canvasPoint, 25);
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
    [connectionCreationState, screenToCanvas, shapes, addConnection, endConnectionCreation]
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

  // Attach global listeners during connection creation
  useEffect(() => {
    if (!connectionCreationState) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [connectionCreationState, handleMouseMove, handleMouseUp, handleKeyDown]);

  return {
    handleAnchorMouseDown,
    isCreatingConnection: connectionCreationState !== null,
  };
}
