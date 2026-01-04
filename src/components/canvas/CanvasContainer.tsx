import { useRef, useCallback, useEffect, useState } from 'react';
import { Canvas } from './Canvas';
import { TextEditOverlay } from './TextEditOverlay';
import { LabelEditOverlay } from '@/components/connections/LabelEditOverlay';
import { getConnectionEndpoints } from '@/lib/geometry/connection';
import { getAbsoluteControlPoints } from '@/lib/geometry/bezier';
import { waypointsToAbsolute } from '@/lib/geometry/pathUtils';
import { useViewportStore } from '@/stores/viewportStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useGroupStore } from '@/stores/groupStore';
import { useContainerSize } from '@/hooks/useContainerSize';
import { useShapeCreation } from '@/hooks/useShapeCreation';
import { useSelection } from '@/hooks/useSelection';
import { useSelectionBox } from '@/hooks/useSelectionBox';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useConnectionCreation } from '@/hooks/useConnectionCreation';
import { useTextEditing } from '@/hooks/useTextEditing';
import { useContextMenu } from '@/hooks/useContextMenu';
import { screenToCanvas } from '@/lib/geometry/viewport';
import { findShapeAtPoint } from '@/lib/geometry/hitTest';
import { useDiagramStore } from '@/stores/diagramStore';
import { CANVAS_DEFAULTS } from '@/lib/constants';
import { ContextMenu } from '@/components/contextMenu';
import { CanvasContainerContext } from '@/contexts/CanvasContainerContext';
import { shouldSkipGlobalShortcut } from '@/lib/input';

/**
 * Canvas container that handles all mouse, wheel, and keyboard events
 * for zoom and pan interactions.
 */
export function CanvasContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerSize = useContainerSize(containerRef);

  // Viewport store
  const viewport = useViewportStore((s) => s.viewport);
  const isPanning = useViewportStore((s) => s.isPanning);
  const spacebarHeld = useViewportStore((s) => s.spacebarHeld);
  const zoomAtPoint = useViewportStore((s) => s.zoomAtPoint);
  const startPan = useViewportStore((s) => s.startPan);
  const updatePan = useViewportStore((s) => s.updatePan);
  const endPan = useViewportStore((s) => s.endPan);
  const setSpacebarHeld = useViewportStore((s) => s.setSpacebarHeld);
  const resetZoom = useViewportStore((s) => s.resetZoom);
  const resetView = useViewportStore((s) => s.resetView);

  // Interaction store
  const activeTool = useInteractionStore((s) => s.activeTool);
  const manipulationState = useInteractionStore((s) => s.manipulationState);
  const isControlPointDragging = useInteractionStore((s) => s.isControlPointDragging);
  const isWaypointDragging = useInteractionStore((s) => s.isWaypointDragging);
  const isLabelDragging = useInteractionStore((s) => s.isLabelDragging);
  const pendingConnectionInteraction = useInteractionStore((s) => s.pendingConnectionInteraction);
  const setPendingConnectionInteraction = useInteractionStore((s) => s.setPendingConnectionInteraction);
  const setCursorCanvasPosition = useInteractionStore((s) => s.setCursorCanvasPosition);

  // Group store
  const editingGroupId = useGroupStore((s) => s.editingGroupId);
  const exitGroupEdit = useGroupStore((s) => s.exitGroupEdit);

  // Shape hover tracking for connection anchors
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null);

  // Get shapes for hit testing
  const shapes = useDiagramStore((s) => s.shapes);
  const connections = useDiagramStore((s) => s.connections);

  // Get editing label connection
  const editingLabelConnectionId = useInteractionStore((s) => s.editingLabelConnectionId);

  // Initialize hooks for shape creation, selection, connections, and keyboard shortcuts
  useKeyboardShortcuts();

  const shapeCreation = useShapeCreation({ containerSize });
  const selection = useSelection({ containerSize });
  const selectionBox = useSelectionBox({ containerSize, containerRef });
  const connectionCreation = useConnectionCreation({ containerRef });
  const textEditing = useTextEditing();
  const contextMenu = useContextMenu();

  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const selectedConnectionIds = useDiagramStore((s) => s.selectedConnectionIds);

  // Wheel handler for zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const screenPoint = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Normalize wheel delta to zoom step
      const delta = -Math.sign(e.deltaY) * CANVAS_DEFAULTS.ZOOM_STEP;

      zoomAtPoint(delta, screenPoint, containerSize);
    },
    [zoomAtPoint, containerSize]
  );

  // Mouse down handler for pan, shape creation, and selection
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const screenPoint = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Middle mouse button OR spacebar held + left click = pan
      if (e.button === 1 || (e.button === 0 && spacebarHeld)) {
        e.preventDefault();
        startPan(screenPoint);
        return;
      }

      // Left click only for other interactions
      if (e.button !== 0) return;

      // Shape creation tools
      if (activeTool === 'rectangle' || activeTool === 'ellipse') {
        shapeCreation.handleMouseDown(screenPoint);
        return;
      }

      // Select tool - start selection box if clicking on empty canvas
      if (activeTool === 'select') {
        const canvasPoint = screenToCanvas(screenPoint, viewport, containerSize);
        const shapesArray = Object.values(shapes);
        const hitShape = findShapeAtPoint(canvasPoint, shapesArray);

        // Only start selection box if not clicking on a shape
        if (!hitShape) {
          // Exit group edit mode when clicking on empty canvas
          if (editingGroupId) {
            exitGroupEdit();
          }
          selectionBox.handleSelectionBoxStart(screenPoint, e.shiftKey || e.ctrlKey || e.metaKey);
        }
      }
    },
    [spacebarHeld, startPan, activeTool, shapeCreation, viewport, containerSize, shapes, selectionBox, editingGroupId, exitGroupEdit]
  );

  // Mouse move handler for pan, shape creation, and cursor position
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const screenPoint = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Update cursor canvas position for status bar
      const canvasPoint = screenToCanvas(screenPoint, viewport, containerSize);
      setCursorCanvasPosition({
        x: Math.round(canvasPoint.x),
        y: Math.round(canvasPoint.y),
      });

      // Update pan if panning
      if (isPanning) {
        updatePan(screenPoint);
        return;
      }

      // Update shape creation preview if creating
      if (shapeCreation.isCreating) {
        shapeCreation.handleMouseMove(screenPoint, e.shiftKey);
      }
    },
    [isPanning, updatePan, viewport, containerSize, setCursorCanvasPosition, shapeCreation]
  );

  // Mouse up handler
  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        endPan();
        return;
      }

      // Complete shape creation
      if (shapeCreation.isCreating) {
        shapeCreation.handleMouseUp();
        return;
      }

      // Skip selection handling if we're in a manipulation (resize/rotate/move)
      // The manipulation will end via the window mouseup listener
      if (manipulationState) {
        return;
      }

      // Skip selection handling if we're dragging connection elements
      if (isControlPointDragging || isWaypointDragging || isLabelDragging) {
        return;
      }

      // Skip selection handling if we just clicked on a connection
      // (the connection already handled its own selection)
      if (pendingConnectionInteraction) {
        setPendingConnectionInteraction(false);
        return;
      }

      // Handle selection on mouse up (click) for select tool
      // Skip if selection box is active (it handles its own selection)
      if (activeTool === 'select' && e.button === 0 && !selectionBox.isSelecting) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const screenPoint = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        selection.handleCanvasClick(screenPoint);
      }
    },
    [isPanning, endPan, shapeCreation, manipulationState, isControlPointDragging, isWaypointDragging, isLabelDragging, pendingConnectionInteraction, setPendingConnectionInteraction, activeTool, selection, selectionBox.isSelecting]
  );

  // Global mouse up (in case mouse is released outside canvas while dragging)
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isPanning) {
        endPan();
      }
      if (shapeCreation.isCreating) {
        shapeCreation.handleMouseUp();
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isPanning, endPan, shapeCreation]);

  // Keyboard handlers for spacebar and shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (shouldSkipGlobalShortcut(e)) {
        return;
      }

      // Spacebar for pan mode
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setSpacebarHeld(true);
      }

      // Ctrl+1 or Ctrl+0: Reset zoom to 100%
      if ((e.key === '1' || e.key === '0') && e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        resetZoom();
      }

      // Ctrl+Shift+F: Reset view
      if ((e.key === 'f' || e.key === 'F') && e.ctrlKey && e.shiftKey && !e.altKey) {
        e.preventDefault();
        resetView();
      }

      // Ctrl++ or Ctrl+=: Zoom in
      if ((e.key === '+' || e.key === '=') && e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          // Zoom at center of canvas
          const centerPoint = {
            x: rect.width / 2,
            y: rect.height / 2,
          };
          zoomAtPoint(CANVAS_DEFAULTS.ZOOM_STEP, centerPoint, containerSize);
        }
      }

      // Ctrl+-: Zoom out
      if (e.key === '-' && e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          // Zoom at center of canvas
          const centerPoint = {
            x: rect.width / 2,
            y: rect.height / 2,
          };
          zoomAtPoint(-CANVAS_DEFAULTS.ZOOM_STEP, centerPoint, containerSize);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacebarHeld(false);
        if (isPanning) {
          endPan();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setSpacebarHeld, isPanning, endPan, resetZoom, resetView, zoomAtPoint, containerSize]);

  // Attach wheel listener with passive: false to allow preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Cursor style based on interaction state and active tool
  const getCursor = () => {
    if (isPanning) return 'grabbing';
    if (spacebarHeld) return 'grab';
    if (shapeCreation.isCreating) return 'crosshair';
    if (selectionBox.isSelecting) return 'crosshair';
    if (connectionCreation.isCreatingConnection) return 'crosshair';
    if (activeTool === 'rectangle' || activeTool === 'ellipse') return 'crosshair';
    if (activeTool === 'connection') return 'crosshair';
    return 'default';
  };

  return (
    <CanvasContainerContext.Provider value={containerRef}>
      <div
        ref={containerRef}
        data-testid="canvas-container"
        className="w-full h-full relative overflow-hidden"
        style={{ cursor: getCursor() }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => {
          e.preventDefault();

          // Determine context menu type based on what's under the cursor
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;

          const screenPoint = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
          const canvasPoint = screenToCanvas(screenPoint, viewport, containerSize);
          const shapesArray = Object.values(shapes);
          const hitShape = findShapeAtPoint(canvasPoint, shapesArray);

          if (hitShape) {
            // Right-clicked on a shape
            if (selectedShapeIds.length > 1 && selectedShapeIds.includes(hitShape.id)) {
              // Multi-selection context menu
              contextMenu.openMenu({ x: e.clientX, y: e.clientY }, 'multiSelect', hitShape.id);
            } else {
              // Single shape context menu
              contextMenu.openMenu({ x: e.clientX, y: e.clientY }, 'shape', hitShape.id);
            }
          } else if (selectedConnectionIds.length > 0) {
            // Connection context menu (if connections are selected)
            contextMenu.openMenu({ x: e.clientX, y: e.clientY }, 'connection');
          } else {
            // Canvas context menu
            contextMenu.openMenu({ x: e.clientX, y: e.clientY }, 'canvas');
          }
        }}
      >
        {containerSize.width > 0 && containerSize.height > 0 && (
          <Canvas
            ref={svgRef}
            viewport={viewport}
            containerSize={containerSize}
            hoveredShapeId={hoveredShapeId}
            onAnchorMouseDown={connectionCreation.handleAnchorMouseDown}
            onShapeHover={setHoveredShapeId}
            onShapeDoubleClick={textEditing.handleShapeDoubleClick}
          />
        )}

        {/* Text editing overlay (HTML positioned over SVG) */}
        {textEditing.editingShape && (
          <TextEditOverlay
            shape={textEditing.editingShape}
            viewport={viewport}
          />
        )}

        {/* Label editing overlay for connections */}
        {editingLabelConnectionId && (() => {
          const editingConnection = connections[editingLabelConnectionId];
          if (!editingConnection || !editingConnection.label) return null;

          const endpoints = getConnectionEndpoints(editingConnection, shapes);
          if (!endpoints) return null;

          const { start, end } = endpoints;
          const isCurved = editingConnection.curveType === 'bezier';

          // Calculate control points for curved connections
          const { cp1, cp2 } = isCurved
            ? getAbsoluteControlPoints(
                editingConnection.controlPoints,
                start,
                end,
                editingConnection.sourceAnchor,
                editingConnection.targetAnchor || 'left'
              )
            : { cp1: start, cp2: end };

          // Convert relative waypoints to absolute positions
          const waypointPositions = waypointsToAbsolute(
            editingConnection.waypoints,
            start,
            end
          );

          return (
            <LabelEditOverlay
              connectionId={editingLabelConnectionId}
              label={editingConnection.label}
              position={editingConnection.labelPosition ?? 0.5}
              style={editingConnection.labelStyle}
              curveType={editingConnection.curveType}
              startPoint={start}
              endPoint={end}
              cp1={isCurved ? cp1 : undefined}
              cp2={isCurved ? cp2 : undefined}
              startAnchor={editingConnection.sourceAnchor}
              endAnchor={editingConnection.targetAnchor || undefined}
              waypointPositions={waypointPositions}
              viewport={viewport}
            />
          );
        })()}

        {/* Context menu */}
        <ContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          items={contextMenu.menuItems}
          onClose={contextMenu.closeMenu}
        />
      </div>
    </CanvasContainerContext.Provider>
  );
}
