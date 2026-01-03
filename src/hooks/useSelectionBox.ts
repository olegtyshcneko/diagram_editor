import { useCallback, useEffect, useRef } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { screenToCanvas } from '@/lib/geometry/viewport';
import { getShapesInBox } from '@/lib/geometry/selection';
import type { Point, Size } from '@/types/common';

interface UseSelectionBoxProps {
  containerSize: Size;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useSelectionBox({ containerSize, containerRef }: UseSelectionBoxProps) {
  const viewport = useViewportStore((s) => s.viewport);

  const shapes = useDiagramStore((s) => s.shapes);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const setSelectedShapeIds = useDiagramStore((s) => s.setSelectedShapeIds);

  const selectionBoxState = useInteractionStore((s) => s.selectionBoxState);
  const startSelectionBox = useInteractionStore((s) => s.startSelectionBox);
  const updateSelectionBox = useInteractionStore((s) => s.updateSelectionBox);
  const endSelectionBox = useInteractionStore((s) => s.endSelectionBox);

  // Store the original selection for shift+box-select
  const originalSelectionRef = useRef<string[]>([]);

  /**
   * Start selection box on mouse down on empty canvas area
   */
  const handleSelectionBoxStart = useCallback(
    (screenPoint: Point, isShiftHeld: boolean) => {
      const canvasPoint = screenToCanvas(screenPoint, viewport, containerSize);

      // Store current selection if shift is held (for adding to selection)
      if (isShiftHeld) {
        originalSelectionRef.current = selectedShapeIds;
      } else {
        originalSelectionRef.current = [];
      }

      startSelectionBox(canvasPoint, isShiftHeld);
    },
    [viewport, containerSize, selectedShapeIds, startSelectionBox]
  );

  /**
   * Update selection box during mouse move
   */
  const handleSelectionBoxUpdate = useCallback(
    (e: MouseEvent) => {
      if (!selectionBoxState || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const screenPoint: Point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      const canvasPoint = screenToCanvas(screenPoint, viewport, containerSize);
      updateSelectionBox(canvasPoint);
    },
    [selectionBoxState, containerRef, viewport, containerSize, updateSelectionBox]
  );

  /**
   * End selection box on mouse up - calculate and apply selection
   */
  const handleSelectionBoxEnd = useCallback(() => {
    if (!selectionBoxState) return;

    const { startPoint, currentPoint, isShiftHeld } = selectionBoxState;

    // Get shapes in the selection box
    const shapesInBox = getShapesInBox(shapes, startPoint, currentPoint);

    if (isShiftHeld) {
      // Add to existing selection (combine original + new)
      const combinedSet = new Set([...originalSelectionRef.current, ...shapesInBox]);
      setSelectedShapeIds(Array.from(combinedSet));
    } else {
      // Replace selection
      setSelectedShapeIds(shapesInBox);
    }

    endSelectionBox();
    originalSelectionRef.current = [];
  }, [selectionBoxState, shapes, setSelectedShapeIds, endSelectionBox]);

  // Add global mouse listeners when selection box is active
  useEffect(() => {
    if (!selectionBoxState) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleSelectionBoxUpdate(e);
    };

    const handleMouseUp = () => {
      handleSelectionBoxEnd();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectionBoxState, handleSelectionBoxUpdate, handleSelectionBoxEnd]);

  return {
    selectionBoxState,
    handleSelectionBoxStart,
    isSelecting: selectionBoxState !== null,
  };
}
