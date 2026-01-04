import { useCallback, useEffect, useRef, useState } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useCanvasContainer } from '@/contexts/CanvasContainerContext';
import { screenToCanvas } from '@/lib/geometry/viewport';
import { EMPTY_SHAPE_DELTA } from '@/types/history';
import { useGlobalDrag } from '@/lib/input';
import type { Point } from '@/types/common';
import type { ConnectionControlPoints } from '@/types/connections';

interface UseControlPointDragProps {
  connectionId: string;
  currentCp1: Point;  // Absolute position (for tracking during drag)
  currentCp2: Point;  // Absolute position (for tracking during drag)
  startPoint: Point;  // Connection start point (for calculating relative offsets)
  endPoint: Point;    // Connection end point (for calculating relative offsets)
  enabled?: boolean;  // Whether this hook should be active (default: true)
}

// No-op return value for disabled state
const NOOP_RETURN = {
  handleDragStart: () => {},
};

/**
 * Hook to manage control point dragging for curved connections.
 * Handles coordinate conversion, state updates, and history tracking.
 *
 * IMPORTANT: Control points are stored as RELATIVE OFFSETS from endpoints.
 * This ensures curves maintain their shape when shapes are moved.
 * - cp1 is stored as offset from startPoint
 * - cp2 is stored as offset from endPoint
 */
export function useControlPointDrag({
  connectionId,
  currentCp1,
  currentCp2,
  startPoint,
  endPoint,
  enabled = true,
}: UseControlPointDragProps) {
  const containerRef = useCanvasContainer();
  const updateConnection = useDiagramStore((s) => s.updateConnection);
  const connections = useDiagramStore((s) => s.connections);
  const viewport = useViewportStore((s) => s.viewport);
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const setControlPointDragging = useInteractionStore(
    (s) => s.setControlPointDragging
  );

  // State to track if we're currently dragging (triggers effect for event listeners)
  const [isDraggingState, setIsDraggingState] = useState(false);

  // Refs to track drag details
  const dragCpIndex = useRef<1 | 2 | null>(null);
  // Store initial control points as RELATIVE OFFSETS for history
  const initialControlPoints = useRef<ConnectionControlPoints | null>(null);

  // Store current absolute positions in ref for use during drag
  const currentControlPointsRef = useRef({ cp1: currentCp1, cp2: currentCp2 });
  // Store current endpoints in ref for calculating relative offsets
  const startPointRef = useRef(startPoint);
  const endPointRef = useRef(endPoint);
  // Store viewport in ref for use in event handlers
  const viewportRef = useRef(viewport);

  useEffect(() => {
    currentControlPointsRef.current = { cp1: currentCp1, cp2: currentCp2 };
    startPointRef.current = startPoint;
    endPointRef.current = endPoint;
    viewportRef.current = viewport;
  }, [currentCp1, currentCp2, startPoint, endPoint, viewport]);

  /**
   * Convert client coordinates to canvas coordinates using the container ref.
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

      // Use the existing screenToCanvas utility
      // Note: containerSize is not used in the current implementation
      return screenToCanvas(screenPoint, viewportRef.current, { width: 0, height: 0 });
    },
    [containerRef]
  );

  /**
   * Handle starting a control point drag.
   */
  const handleDragStart = useCallback(
    (cpIndex: 1 | 2, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      setIsDraggingState(true);
      dragCpIndex.current = cpIndex;
      setControlPointDragging(true);

      // Store initial control points as RELATIVE OFFSETS for history
      // Convert current absolute positions to relative offsets from endpoints
      const currentCp = currentControlPointsRef.current;
      const start = startPointRef.current;
      const end = endPointRef.current;

      initialControlPoints.current = {
        cp1: {
          x: currentCp.cp1.x - start.x,
          y: currentCp.cp1.y - start.y,
        },
        cp2: {
          x: currentCp.cp2.x - end.x,
          y: currentCp.cp2.y - end.y,
        },
      };
    },
    [setControlPointDragging]
  );

  /**
   * Handle mouse move during drag.
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragCpIndex.current) return;

      const canvasPoint = clientToCanvas(e.clientX, e.clientY);
      if (!canvasPoint) return;

      const start = startPointRef.current;
      const end = endPointRef.current;
      const currentCp = currentControlPointsRef.current;

      // Calculate relative offset for the dragged control point
      // cp1 is relative to start, cp2 is relative to end
      const draggedOffset =
        dragCpIndex.current === 1
          ? { x: canvasPoint.x - start.x, y: canvasPoint.y - start.y }
          : { x: canvasPoint.x - end.x, y: canvasPoint.y - end.y };

      // Get current relative offsets for the non-dragged control point
      const currentCp1Offset = {
        x: currentCp.cp1.x - start.x,
        y: currentCp.cp1.y - start.y,
      };
      const currentCp2Offset = {
        x: currentCp.cp2.x - end.x,
        y: currentCp.cp2.y - end.y,
      };

      // Build new control points as RELATIVE OFFSETS
      const newControlPoints: ConnectionControlPoints = {
        cp1: dragCpIndex.current === 1 ? draggedOffset : currentCp1Offset,
        cp2: dragCpIndex.current === 2 ? draggedOffset : currentCp2Offset,
      };

      // Update connection with relative offsets
      updateConnection(connectionId, { controlPoints: newControlPoints });

      // Also update the ref with the new absolute position for visual tracking
      if (dragCpIndex.current === 1) {
        currentControlPointsRef.current.cp1 = canvasPoint;
      } else {
        currentControlPointsRef.current.cp2 = canvasPoint;
      }
    },
    [connectionId, clientToCanvas, updateConnection]
  );

  /**
   * Handle drag end - push history entry.
   */
  const handleMouseUp = useCallback(() => {
    if (!initialControlPoints.current) {
      setIsDraggingState(false);
      dragCpIndex.current = null;
      initialControlPoints.current = null;
      // Use requestAnimationFrame for cleaner timing than setTimeout
      requestAnimationFrame(() => setControlPointDragging(false));
      return;
    }

    const connection = connections[connectionId];
    if (connection && connection.controlPoints) {
      // Push history entry for undo/redo
      pushEntry({
        type: 'UPDATE_STYLE',
        description: 'Adjust curve control point',
        shapeDelta: EMPTY_SHAPE_DELTA,
        connectionDelta: {
          added: [],
          removed: [],
          modified: [
            {
              id: connectionId,
              before: { controlPoints: initialControlPoints.current },
              after: { controlPoints: connection.controlPoints },
            },
          ],
        },
        selectionBefore: [],
        selectionAfter: [],
      });
    }

    setIsDraggingState(false);
    dragCpIndex.current = null;
    initialControlPoints.current = null;
    // Use requestAnimationFrame for cleaner timing than setTimeout
    requestAnimationFrame(() => setControlPointDragging(false));
  }, [connectionId, connections, pushEntry, setControlPointDragging]);

  // Use centralized global drag hook for mouse tracking
  useGlobalDrag({
    isActive: isDraggingState,
    onMove: handleMouseMove,
    onEnd: handleMouseUp,
  });

  // Return no-op if disabled
  if (!enabled) {
    return NOOP_RETURN;
  }

  return {
    handleDragStart,
  };
}
