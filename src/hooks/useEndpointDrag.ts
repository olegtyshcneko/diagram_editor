import { useCallback, useState, useRef, useEffect } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useCanvasContainer } from '@/contexts/CanvasContainerContext';
import { screenToCanvas } from '@/lib/geometry/viewport';
import { EMPTY_SHAPE_DELTA } from '@/types/history';
import { useGlobalDrag } from '@/lib/input';
import type { Point } from '@/types/common';
import type { AnchorPosition } from '@/types/connections';
import type { Shape } from '@/types/shapes';
import { findShapeAtPoint } from '@/lib/geometry/hitTest';
import { calculateBestAnchor } from '@/lib/geometry/anchorSelection';
import { getAnchorPosition } from '@/lib/geometry/connection';

interface UseEndpointDragProps {
  connectionId: string;
  endpoint: 'source' | 'target';
  enabled: boolean;
}

interface EndpointDragState {
  isDragging: boolean;
  hoveredShape: Shape | null;
  predictedAnchor: AnchorPosition | null;
  isSnapped: boolean;
}

export function useEndpointDrag({
  connectionId,
  endpoint,
  enabled,
}: UseEndpointDragProps) {
  const containerRef = useCanvasContainer();
  const shapes = useDiagramStore((s) => s.shapes);
  const connections = useDiagramStore((s) => s.connections);
  const disconnectEndpoint = useDiagramStore((s) => s.disconnectEndpoint);
  const reconnectEndpoint = useDiagramStore((s) => s.reconnectEndpoint);
  const updateFloatingEndpoint = useDiagramStore((s) => s.updateFloatingEndpoint);
  const pushEntry = useHistoryStore((s) => s.pushEntry);

  const setEndpointDragging = useInteractionStore((s) => s.setEndpointDragging);
  const setPendingConnectionInteraction = useInteractionStore(
    (s) => s.setPendingConnectionInteraction
  );

  const viewport = useViewportStore((s) => s.viewport);
  const viewportRef = useRef(viewport);

  // Keep viewport ref up to date
  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  // Visual state for rendering highlights
  const [dragState, setDragState] = useState<EndpointDragState>({
    isDragging: false,
    hoveredShape: null,
    predictedAnchor: null,
    isSnapped: false,
  });

  // Track state for undo/redo
  const initialStateRef = useRef<{
    shapeId: string;
    anchor: AnchorPosition;
    wasAttached: boolean;
    connectionBefore: ReturnType<typeof useDiagramStore.getState>['connections'][string] | null;
  } | null>(null);

  // Convert client to canvas coordinates
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

  // Get the other endpoint's info for best anchor calculation
  const getOtherEndpointInfo = useCallback((): {
    point: Point;
    anchor?: AnchorPosition;
  } | null => {
    const connection = connections[connectionId];
    if (!connection) return null;

    if (endpoint === 'source') {
      // We're dragging source, get target info
      if (connection.targetAttached && connection.targetShapeId && connection.targetAnchor) {
        const targetShape = shapes[connection.targetShapeId];
        if (targetShape) {
          return {
            point: getAnchorPosition(targetShape, connection.targetAnchor),
            anchor: connection.targetAnchor,
          };
        }
      } else if (connection.floatingTargetPoint) {
        return { point: connection.floatingTargetPoint };
      }
    } else {
      // We're dragging target, get source info
      if (connection.sourceAttached && connection.sourceShapeId) {
        const sourceShape = shapes[connection.sourceShapeId];
        if (sourceShape) {
          return {
            point: getAnchorPosition(sourceShape, connection.sourceAnchor),
            anchor: connection.sourceAnchor,
          };
        }
      } else if (connection.floatingSourcePoint) {
        return { point: connection.floatingSourcePoint };
      }
    }
    return null;
  }, [connections, connectionId, endpoint, shapes]);

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return;

      e.stopPropagation();
      e.preventDefault();

      const connection = connections[connectionId];
      if (!connection) return;

      // Record initial state for undo
      if (endpoint === 'source') {
        initialStateRef.current = {
          shapeId: connection.sourceShapeId,
          anchor: connection.sourceAnchor,
          wasAttached: connection.sourceAttached,
          connectionBefore: { ...connection },
        };
      } else {
        initialStateRef.current = {
          shapeId: connection.targetShapeId || '',
          anchor: connection.targetAnchor || 'left',
          wasAttached: connection.targetAttached,
          connectionBefore: { ...connection },
        };
      }

      // Get initial position from current anchor
      const canvasPoint = clientToCanvas(e.clientX, e.clientY);
      if (!canvasPoint) return;

      // Disconnect the endpoint
      disconnectEndpoint(connectionId, endpoint, canvasPoint);

      setDragState({
        isDragging: true,
        hoveredShape: null,
        predictedAnchor: null,
        isSnapped: false,
      });

      setEndpointDragging(true);
      setPendingConnectionInteraction(true);
    },
    [
      enabled,
      connections,
      connectionId,
      endpoint,
      clientToCanvas,
      disconnectEndpoint,
      setEndpointDragging,
      setPendingConnectionInteraction,
    ]
  );

  // Handle drag move
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging) return;

      const canvasPoint = clientToCanvas(e.clientX, e.clientY);
      if (!canvasPoint) return;

      // Update floating endpoint position
      updateFloatingEndpoint(connectionId, endpoint, canvasPoint);

      // Find shape under cursor
      const shapesArray = Object.values(shapes);
      const targetShape = findShapeAtPoint(canvasPoint, shapesArray);

      if (targetShape) {
        const otherInfo = getOtherEndpointInfo();
        const sourcePoint = otherInfo?.point || canvasPoint;
        const sourceAnchor = otherInfo?.anchor;

        const result = calculateBestAnchor(
          targetShape,
          canvasPoint,
          sourcePoint,
          sourceAnchor
        );

        setDragState({
          isDragging: true,
          hoveredShape: targetShape,
          predictedAnchor: result.anchor,
          isSnapped: result.snapped,
        });
      } else {
        setDragState({
          isDragging: true,
          hoveredShape: null,
          predictedAnchor: null,
          isSnapped: false,
        });
      }
    },
    [
      dragState.isDragging,
      clientToCanvas,
      updateFloatingEndpoint,
      connectionId,
      endpoint,
      shapes,
      getOtherEndpointInfo,
    ]
  );

  // Handle drag end
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging) return;

      const canvasPoint = clientToCanvas(e.clientX, e.clientY);
      const initialState = initialStateRef.current;

      if (!canvasPoint) {
        // Cancel - leave floating, but still push history
        if (initialState?.connectionBefore) {
          const connectionAfter = useDiagramStore.getState().connections[connectionId];
          if (connectionAfter) {
            pushEntry({
              type: 'UPDATE_STYLE',
              description: 'Disconnect Endpoint',
              shapeDelta: EMPTY_SHAPE_DELTA,
              connectionDelta: {
                added: [],
                removed: [],
                modified: [
                  {
                    id: connectionId,
                    before: initialState.connectionBefore,
                    after: connectionAfter,
                  },
                ],
              },
              selectionBefore: [],
              selectionAfter: [],
            });
          }
        }
        initialStateRef.current = null;
        setDragState({
          isDragging: false,
          hoveredShape: null,
          predictedAnchor: null,
          isSnapped: false,
        });
        setEndpointDragging(false);
        setPendingConnectionInteraction(false);
        return;
      }

      // Check if we should reconnect to a shape
      const shapesArray = Object.values(shapes);
      const targetShape = findShapeAtPoint(canvasPoint, shapesArray);

      if (targetShape) {
        const otherInfo = getOtherEndpointInfo();
        const sourcePoint = otherInfo?.point || canvasPoint;
        const sourceAnchor = otherInfo?.anchor;

        const result = calculateBestAnchor(
          targetShape,
          canvasPoint,
          sourcePoint,
          sourceAnchor
        );

        // Reconnect to the shape
        reconnectEndpoint(connectionId, endpoint, targetShape.id, result.anchor);

        // Push history entry
        if (initialState?.connectionBefore) {
          const connectionAfter = useDiagramStore.getState().connections[connectionId];
          if (connectionAfter) {
            pushEntry({
              type: 'UPDATE_STYLE',
              description: 'Reconnect Endpoint',
              shapeDelta: EMPTY_SHAPE_DELTA,
              connectionDelta: {
                added: [],
                removed: [],
                modified: [
                  {
                    id: connectionId,
                    before: initialState.connectionBefore,
                    after: connectionAfter,
                  },
                ],
              },
              selectionBefore: [],
              selectionAfter: [],
            });
          }
        }
      } else {
        // Leave floating - push history for disconnect
        if (initialState?.connectionBefore) {
          const connectionAfter = useDiagramStore.getState().connections[connectionId];
          if (connectionAfter) {
            pushEntry({
              type: 'UPDATE_STYLE',
              description: 'Disconnect Endpoint',
              shapeDelta: EMPTY_SHAPE_DELTA,
              connectionDelta: {
                added: [],
                removed: [],
                modified: [
                  {
                    id: connectionId,
                    before: initialState.connectionBefore,
                    after: connectionAfter,
                  },
                ],
              },
              selectionBefore: [],
              selectionAfter: [],
            });
          }
        }
      }

      // Clean up
      initialStateRef.current = null;
      setDragState({
        isDragging: false,
        hoveredShape: null,
        predictedAnchor: null,
        isSnapped: false,
      });
      setEndpointDragging(false);
      setPendingConnectionInteraction(false);
    },
    [
      dragState.isDragging,
      clientToCanvas,
      shapes,
      connectionId,
      endpoint,
      getOtherEndpointInfo,
      reconnectEndpoint,
      pushEntry,
      setEndpointDragging,
      setPendingConnectionInteraction,
    ]
  );

  // Handle escape key to cancel
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dragState.isDragging) {
        e.preventDefault();
        const initialState = initialStateRef.current;

        // Restore original connection state
        if (initialState && initialState.wasAttached) {
          reconnectEndpoint(
            connectionId,
            endpoint,
            initialState.shapeId,
            initialState.anchor
          );
        }

        // Clean up without pushing history (cancelled)
        initialStateRef.current = null;
        setDragState({
          isDragging: false,
          hoveredShape: null,
          predictedAnchor: null,
          isSnapped: false,
        });
        setEndpointDragging(false);
        setPendingConnectionInteraction(false);
      }
    },
    [
      dragState.isDragging,
      connectionId,
      endpoint,
      reconnectEndpoint,
      setEndpointDragging,
      setPendingConnectionInteraction,
    ]
  );

  // Use global drag tracking
  useGlobalDrag({
    isActive: dragState.isDragging,
    onMove: handleMouseMove,
    onEnd: handleMouseUp,
    onKeyDown: handleKeyDown,
  });

  return {
    handleDragStart,
    isDragging: dragState.isDragging,
    hoveredShape: dragState.hoveredShape,
    predictedAnchor: dragState.predictedAnchor,
    isSnapped: dragState.isSnapped,
  };
}
