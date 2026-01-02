import { useCallback, useRef } from 'react';
import type { Point, Bounds } from '@/types/common';
import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';
import {
  calculateAngle,
  snapAngle,
  getBoundsCenter,
  normalizeAngle,
} from '@/lib/geometry/manipulation';
import { MANIPULATION } from '@/lib/constants';

interface UseRotateOptions {
  shapeId: string;
}

/**
 * Hook for handling shape rotation operations.
 * Rotates shape around its center with optional 15-degree snapping.
 */
export function useShapeRotate({ shapeId }: UseRotateOptions) {
  const updateShape = useDiagramStore((s) => s.updateShape);
  const viewport = useUIStore((s) => s.viewport);
  const startManipulation = useUIStore((s) => s.startManipulation);
  const endManipulation = useUIStore((s) => s.endManipulation);

  // Refs to store start state
  const centerRef = useRef<Point | null>(null);
  const startAngleRef = useRef<number>(0);
  const initialRotationRef = useRef<number>(0);

  /**
   * Start a rotation operation
   */
  const handleRotateStart = useCallback((
    e: React.MouseEvent,
    bounds: Bounds,
    currentRotation: number
  ) => {
    e.stopPropagation();

    // Calculate center in canvas coordinates
    const center = getBoundsCenter(bounds);
    centerRef.current = center;
    initialRotationRef.current = currentRotation;

    // Calculate starting angle from center to cursor (in canvas coordinates)
    // Convert cursor position to canvas coordinates
    const canvasX = viewport.x + e.clientX / viewport.zoom;
    const canvasY = viewport.y + e.clientY / viewport.zoom;
    startAngleRef.current = calculateAngle(center, { x: canvasX, y: canvasY });

    startManipulation({
      type: 'rotate',
      shapeId,
      startPoint: { x: e.clientX, y: e.clientY },
      startBounds: bounds,
      startRotation: currentRotation,
      handle: 'rotation',
    });
  }, [shapeId, viewport, startManipulation]);

  /**
   * Update rotation during drag
   */
  const handleRotateUpdate = useCallback((
    e: MouseEvent,
    shiftHeld: boolean
  ) => {
    if (!centerRef.current) return;

    // Convert cursor to canvas coordinates
    const canvasX = viewport.x + e.clientX / viewport.zoom;
    const canvasY = viewport.y + e.clientY / viewport.zoom;

    // Calculate current angle from center to cursor
    const currentAngle = calculateAngle(centerRef.current, { x: canvasX, y: canvasY });

    // Calculate rotation delta
    const angleDelta = currentAngle - startAngleRef.current;

    // Calculate new rotation
    let newRotation = normalizeAngle(initialRotationRef.current + angleDelta);

    // Apply snapping if Shift is held
    if (shiftHeld) {
      newRotation = snapAngle(newRotation, MANIPULATION.ROTATION_SNAP_DEGREES);
    }

    updateShape(shapeId, { rotation: newRotation });
  }, [shapeId, viewport, updateShape]);

  /**
   * End the rotation operation
   */
  const handleRotateEnd = useCallback(() => {
    centerRef.current = null;
    endManipulation();
  }, [endManipulation]);

  return {
    handleRotateStart,
    handleRotateUpdate,
    handleRotateEnd,
  };
}
