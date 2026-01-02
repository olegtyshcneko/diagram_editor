import { useCallback, useEffect, useRef } from 'react';
import type { Shape } from '@/types/shapes';
import type { HandleType } from '@/types/interaction';
import { useUIStore } from '@/stores/uiStore';
import { useShapeMove } from './useShapeMove';
import { useShapeResize } from './useShapeResize';
import { useShapeRotate } from './useShapeRotate';

interface UseShapeManipulationOptions {
  shape: Shape;
}

/**
 * Main orchestration hook for shape manipulation.
 * Coordinates move, resize, and rotate operations.
 */
export function useShapeManipulation({ shape }: UseShapeManipulationOptions) {
  const manipulationState = useUIStore((s) => s.manipulationState);

  // Track modifier keys via ref for real-time access during drag
  const modifiersRef = useRef({ shift: false, alt: false });

  // Individual operation hooks
  const { handleMoveStart, handleMoveUpdate, handleMoveEnd } = useShapeMove({
    shapeId: shape.id,
  });

  const { handleResizeStart, handleResizeUpdate, handleResizeEnd } = useShapeResize({
    shapeId: shape.id,
  });

  const { handleRotateStart, handleRotateUpdate, handleRotateEnd } = useShapeRotate({
    shapeId: shape.id,
  });

  // Track modifier keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      modifiersRef.current.shift = e.shiftKey;
      modifiersRef.current.alt = e.altKey;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      modifiersRef.current.shift = e.shiftKey;
      modifiersRef.current.alt = e.altKey;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Set up global mouse events during manipulation
  useEffect(() => {
    // Only handle events for this shape's manipulation
    if (!manipulationState || manipulationState.shapeId !== shape.id) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { shift, alt } = modifiersRef.current;

      switch (manipulationState.type) {
        case 'move':
          handleMoveUpdate(e, shift);
          break;
        case 'resize':
          handleResizeUpdate(e, shift, alt);
          break;
        case 'rotate':
          handleRotateUpdate(e, shift);
          break;
      }
    };

    const handleMouseUp = () => {
      switch (manipulationState.type) {
        case 'move':
          handleMoveEnd();
          break;
        case 'resize':
          handleResizeEnd();
          break;
        case 'rotate':
          handleRotateEnd();
          break;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    manipulationState,
    shape.id,
    handleMoveUpdate,
    handleMoveEnd,
    handleResizeUpdate,
    handleResizeEnd,
    handleRotateUpdate,
    handleRotateEnd,
  ]);

  // Start move on shape body drag (works with any tool)
  const onShapeMouseDown = useCallback((e: React.MouseEvent) => {
    if (shape.locked) return;

    handleMoveStart(e, {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
    });
  }, [shape, handleMoveStart]);

  // Start resize on handle drag
  const onResizeHandleMouseDown = useCallback((
    e: React.MouseEvent,
    handle: HandleType
  ) => {
    if (shape.locked) return;

    handleResizeStart(e, handle, {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
    });
  }, [shape, handleResizeStart]);

  // Start rotation on rotation handle drag
  const onRotationHandleMouseDown = useCallback((e: React.MouseEvent) => {
    if (shape.locked) return;

    handleRotateStart(e, {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
    }, shape.rotation);
  }, [shape, handleRotateStart]);

  return {
    onShapeMouseDown,
    onResizeHandleMouseDown,
    onRotationHandleMouseDown,
    isManipulating: manipulationState?.shapeId === shape.id,
    manipulationType: manipulationState?.shapeId === shape.id ? manipulationState.type : null,
  };
}
