import { useCallback, useRef } from 'react';
import type { Point, Bounds } from '@/types/common';
import type { HandleType } from '@/types/interaction';
import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';
import { calculateResize } from '@/lib/geometry/resize';
import { SHAPE_DEFAULTS } from '@/lib/constants';

interface UseResizeOptions {
  shapeId: string;
}

/**
 * Hook for handling shape resize operations.
 * Supports 8-direction resize with aspect ratio and center constraints.
 */
export function useShapeResize({ shapeId }: UseResizeOptions) {
  const updateShape = useDiagramStore((s) => s.updateShape);
  const viewport = useUIStore((s) => s.viewport);
  const startManipulation = useUIStore((s) => s.startManipulation);
  const endManipulation = useUIStore((s) => s.endManipulation);

  // Refs to store start state
  const startPointRef = useRef<Point | null>(null);
  const startBoundsRef = useRef<Bounds | null>(null);
  const handleRef = useRef<HandleType | null>(null);
  const aspectRatioRef = useRef<number>(1);

  /**
   * Start a resize operation
   */
  const handleResizeStart = useCallback((
    e: React.MouseEvent,
    handle: HandleType,
    bounds: Bounds
  ) => {
    e.stopPropagation();

    startPointRef.current = { x: e.clientX, y: e.clientY };
    startBoundsRef.current = bounds;
    handleRef.current = handle;
    aspectRatioRef.current = bounds.width / bounds.height;

    startManipulation({
      type: 'resize',
      shapeId,
      startPoint: { x: e.clientX, y: e.clientY },
      startBounds: bounds,
      startRotation: 0,
      handle,
      aspectRatio: bounds.width / bounds.height,
    });
  }, [shapeId, startManipulation]);

  /**
   * Update size during resize
   */
  const handleResizeUpdate = useCallback((
    e: MouseEvent,
    shiftHeld: boolean,
    altHeld: boolean
  ) => {
    if (!startPointRef.current || !startBoundsRef.current || !handleRef.current) {
      return;
    }

    // Calculate delta in screen space, scaled by zoom
    const delta: Point = {
      x: (e.clientX - startPointRef.current.x) / viewport.zoom,
      y: (e.clientY - startPointRef.current.y) / viewport.zoom,
    };

    const newBounds = calculateResize(
      startBoundsRef.current,
      handleRef.current,
      delta,
      {
        maintainAspectRatio: shiftHeld,
        resizeFromCenter: altHeld,
        originalAspectRatio: aspectRatioRef.current,
        minSize: SHAPE_DEFAULTS.MIN_SIZE,
      }
    );

    updateShape(shapeId, {
      x: newBounds.x,
      y: newBounds.y,
      width: newBounds.width,
      height: newBounds.height,
    });
  }, [shapeId, viewport.zoom, updateShape]);

  /**
   * End the resize operation
   */
  const handleResizeEnd = useCallback(() => {
    startPointRef.current = null;
    startBoundsRef.current = null;
    handleRef.current = null;
    endManipulation();
  }, [endManipulation]);

  return {
    handleResizeStart,
    handleResizeUpdate,
    handleResizeEnd,
  };
}
