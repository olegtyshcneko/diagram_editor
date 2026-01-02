import { useCallback } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useInteractionStore } from '@/stores/interactionStore';

export function useTextEditing() {
  const shapes = useDiagramStore((s) => s.shapes);

  const activeTool = useInteractionStore((s) => s.activeTool);
  const editingTextShapeId = useInteractionStore((s) => s.editingTextShapeId);
  const setEditingTextShapeId = useInteractionStore(
    (s) => s.setEditingTextShapeId
  );

  // Enter text editing mode on double-click
  const handleShapeDoubleClick = useCallback(
    (shapeId: string) => {
      // Only allow text editing with select tool
      if (activeTool !== 'select') return;

      // Check if shape exists and is selected
      const shape = shapes[shapeId];
      if (!shape) return;

      setEditingTextShapeId(shapeId);
    },
    [activeTool, shapes, setEditingTextShapeId]
  );

  // Exit text editing mode
  const exitTextEditing = useCallback(() => {
    setEditingTextShapeId(null);
  }, [setEditingTextShapeId]);

  // Get the currently editing shape
  const editingShape = editingTextShapeId ? shapes[editingTextShapeId] : null;

  return {
    editingTextShapeId,
    editingShape,
    isEditing: editingTextShapeId !== null,
    handleShapeDoubleClick,
    exitTextEditing,
  };
}
