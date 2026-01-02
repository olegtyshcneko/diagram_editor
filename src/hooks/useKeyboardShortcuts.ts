import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useDiagramStore } from '@/stores/diagramStore';
import { KEYBOARD } from '@/lib/constants';

export function useKeyboardShortcuts() {
  const setActiveTool = useUIStore((s) => s.setActiveTool);
  const cancelCreation = useUIStore((s) => s.cancelCreation);
  const creationState = useUIStore((s) => s.creationState);
  const manipulationState = useUIStore((s) => s.manipulationState);

  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const shapes = useDiagramStore((s) => s.shapes);
  const updateShape = useDiagramStore((s) => s.updateShape);
  const deleteSelectedShapes = useDiagramStore((s) => s.deleteSelectedShapes);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Don't handle tool shortcuts during manipulation
      const isDuringManipulation = manipulationState !== null;

      const hasSelection = selectedShapeIds.length > 0;

      // Arrow key movement
      if (hasSelection && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();

        const moveAmount = e.shiftKey ? KEYBOARD.MOVE_STEP_LARGE : KEYBOARD.MOVE_STEP;

        let deltaX = 0;
        let deltaY = 0;

        switch (e.key) {
          case 'ArrowUp':
            deltaY = -moveAmount;
            break;
          case 'ArrowDown':
            deltaY = moveAmount;
            break;
          case 'ArrowLeft':
            deltaX = -moveAmount;
            break;
          case 'ArrowRight':
            deltaX = moveAmount;
            break;
        }

        // Move all selected shapes
        for (const id of selectedShapeIds) {
          const shape = shapes[id];
          if (shape && !shape.locked) {
            updateShape(id, {
              x: shape.x + deltaX,
              y: shape.y + deltaY,
            });
          }
        }
        return;
      }

      // Delete/Backspace
      if (hasSelection && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        deleteSelectedShapes();
        return;
      }

      // Tool shortcuts (only when not manipulating)
      if (!isDuringManipulation) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setActiveTool('select');
            break;
          case 'r':
            setActiveTool('rectangle');
            break;
          case 'e':
            setActiveTool('ellipse');
            break;
          case 'escape':
            if (creationState) {
              cancelCreation();
            } else {
              setActiveTool('select');
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setActiveTool,
    cancelCreation,
    creationState,
    manipulationState,
    selectedShapeIds,
    shapes,
    updateShape,
    deleteSelectedShapes,
  ]);
}
