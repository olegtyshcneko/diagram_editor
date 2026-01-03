import { useEffect } from 'react';
import { useInteractionStore } from '@/stores/interactionStore';
import { useDiagramStore } from '@/stores/diagramStore';
import { KEYBOARD } from '@/lib/constants';

export function useKeyboardShortcuts() {
  const setActiveTool = useInteractionStore((s) => s.setActiveTool);
  const cancelCreation = useInteractionStore((s) => s.cancelCreation);
  const creationState = useInteractionStore((s) => s.creationState);
  const manipulationState = useInteractionStore((s) => s.manipulationState);
  const connectionCreationState = useInteractionStore((s) => s.connectionCreationState);
  const endConnectionCreation = useInteractionStore((s) => s.endConnectionCreation);
  const editingTextShapeId = useInteractionStore((s) => s.editingTextShapeId);
  const setEditingTextShapeId = useInteractionStore((s) => s.setEditingTextShapeId);

  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const selectedConnectionIds = useDiagramStore((s) => s.selectedConnectionIds);
  const shapes = useDiagramStore((s) => s.shapes);
  const updateShape = useDiagramStore((s) => s.updateShape);
  const deleteSelectedShapes = useDiagramStore((s) => s.deleteSelectedShapes);
  const deleteSelectedConnections = useDiagramStore((s) => s.deleteSelectedConnections);
  const selectAll = useDiagramStore((s) => s.selectAll);
  const copySelection = useDiagramStore((s) => s.copySelection);
  const cutSelection = useDiagramStore((s) => s.cutSelection);
  const pasteClipboard = useDiagramStore((s) => s.pasteClipboard);
  const duplicateSelection = useDiagramStore((s) => s.duplicateSelection);
  const clipboard = useDiagramStore((s) => s.clipboard);

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
      const hasConnectionSelection = selectedConnectionIds.length > 0;
      const isEditingText = editingTextShapeId !== null;
      const isCreatingConnection = connectionCreationState !== null;
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      // Clipboard shortcuts (only when not editing text)
      if (!isEditingText && ctrlOrMeta) {
        // Select All - Ctrl+A
        if (e.key === 'a') {
          e.preventDefault();
          selectAll();
          return;
        }

        // Copy - Ctrl+C
        if (e.key === 'c' && hasSelection) {
          e.preventDefault();
          copySelection();
          return;
        }

        // Cut - Ctrl+X
        if (e.key === 'x' && hasSelection) {
          e.preventDefault();
          cutSelection();
          return;
        }

        // Paste - Ctrl+V
        if (e.key === 'v' && clipboard) {
          e.preventDefault();
          pasteClipboard();
          return;
        }

        // Duplicate - Ctrl+D
        if (e.key === 'd' && hasSelection) {
          e.preventDefault();
          duplicateSelection();
          return;
        }
      }

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

      // Delete/Backspace - shapes or connections
      if ((hasSelection || hasConnectionSelection) && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        if (hasConnectionSelection) {
          deleteSelectedConnections();
        }
        if (hasSelection) {
          deleteSelectedShapes();
        }
        return;
      }

      // Tool shortcuts (only when not manipulating and not editing text)
      if (!isDuringManipulation && !isEditingText) {
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
          case 'c':
            setActiveTool('connection');
            break;
          case 'escape':
            // Cancel any in-progress operation
            if (isCreatingConnection) {
              endConnectionCreation();
            } else if (creationState) {
              cancelCreation();
            } else {
              setActiveTool('select');
            }
            break;
        }
      }

      // Escape while editing text exits editing mode
      if (isEditingText && e.key === 'Escape') {
        e.preventDefault();
        setEditingTextShapeId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setActiveTool,
    cancelCreation,
    creationState,
    manipulationState,
    connectionCreationState,
    endConnectionCreation,
    editingTextShapeId,
    setEditingTextShapeId,
    selectedShapeIds,
    selectedConnectionIds,
    shapes,
    updateShape,
    deleteSelectedShapes,
    deleteSelectedConnections,
    selectAll,
    copySelection,
    cutSelection,
    pasteClipboard,
    duplicateSelection,
    clipboard,
  ]);
}
