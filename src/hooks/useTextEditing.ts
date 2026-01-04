import { useCallback, useEffect } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useGroupStore } from '@/stores/groupStore';
import { getSelectableGroupForShape } from '@/lib/groupUtils';

export function useTextEditing() {
  const shapes = useDiagramStore((s) => s.shapes);
  const selectShape = useDiagramStore((s) => s.selectShape);

  const activeTool = useInteractionStore((s) => s.activeTool);
  const editingTextShapeId = useInteractionStore((s) => s.editingTextShapeId);
  const setEditingTextShapeId = useInteractionStore(
    (s) => s.setEditingTextShapeId
  );

  const groups = useGroupStore((s) => s.groups);
  const editingGroupId = useGroupStore((s) => s.editingGroupId);
  const enterGroupEdit = useGroupStore((s) => s.enterGroupEdit);

  // Clear editing state if the shape is deleted
  useEffect(() => {
    if (editingTextShapeId && !shapes[editingTextShapeId]) {
      setEditingTextShapeId(null);
    }
  }, [editingTextShapeId, shapes, setEditingTextShapeId]);

  // Enter text editing mode on double-click (or group edit mode for grouped shapes)
  const handleShapeDoubleClick = useCallback(
    (shapeId: string) => {
      // Only allow with select tool
      if (activeTool !== 'select') return;

      // Check if shape exists
      const shape = shapes[shapeId];
      if (!shape) return;

      // If not in group edit mode and shape is part of a group,
      // enter group edit mode instead of text editing
      if (!editingGroupId) {
        const topGroup = getSelectableGroupForShape(shapeId, groups);
        if (topGroup) {
          enterGroupEdit(topGroup.id);
          // Select just the clicked shape within the group
          selectShape(shapeId);
          return;
        }
      }

      // Otherwise, enter text editing mode
      setEditingTextShapeId(shapeId);
    },
    [activeTool, shapes, editingGroupId, groups, enterGroupEdit, selectShape, setEditingTextShapeId]
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
