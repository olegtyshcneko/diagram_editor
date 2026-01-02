import { useRef, useCallback, useEffect, useState } from 'react';
import { Canvas } from './Canvas';
import { TextEditOverlay } from './TextEditOverlay';
import { useViewportStore } from '@/stores/viewportStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useContainerSize } from '@/hooks/useContainerSize';
import { useShapeCreation } from '@/hooks/useShapeCreation';
import { useSelection } from '@/hooks/useSelection';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useConnectionCreation } from '@/hooks/useConnectionCreation';
import { useTextEditing } from '@/hooks/useTextEditing';
import { screenToCanvas } from '@/lib/geometry/viewport';
import { CANVAS_DEFAULTS } from '@/lib/constants';

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
  const setCursorCanvasPosition = useInteractionStore((s) => s.setCursorCanvasPosition);

  // Shape hover tracking for connection anchors
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null);

  // Initialize hooks for shape creation, selection, connections, and keyboard shortcuts
  useKeyboardShortcuts();

  const shapeCreation = useShapeCreation({ containerSize });
  const selection = useSelection({ containerSize });
  const connectionCreation = useConnectionCreation({ containerRef });
  const textEditing = useTextEditing();

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

      // Select tool - selection is handled on click, not mousedown
      // (to distinguish from potential drag operations)
    },
    [spacebarHeld, startPan, activeTool, shapeCreation]
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

      // Handle selection on mouse up (click) for select tool
      if (activeTool === 'select' && e.button === 0) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const screenPoint = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        selection.handleCanvasClick(screenPoint);
      }
    },
    [isPanning, endPan, shapeCreation, manipulationState, activeTool, selection]
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
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
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
    if (connectionCreation.isCreatingConnection) return 'crosshair';
    if (activeTool === 'rectangle' || activeTool === 'ellipse') return 'crosshair';
    if (activeTool === 'connection') return 'crosshair';
    return 'default';
  };

  return (
    <div
      ref={containerRef}
      data-testid="canvas-container"
      className="w-full h-full relative overflow-hidden"
      style={{ cursor: getCursor() }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
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
    </div>
  );
}
