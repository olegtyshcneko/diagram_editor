import { useCallback } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useGroupStore } from '@/stores/groupStore';
import { getSelectableGroupForShape } from '@/lib/groupUtils';

/**
 * Hook that provides group-aware selection behavior.
 * When clicking a grouped shape (not in edit mode), selects the entire group.
 * In edit mode, allows individual shape selection within the group.
 */
export function useGroupAwareSelection() {
  const selectShape = useDiagramStore((s) => s.selectShape);
  const setSelectedShapeIds = useDiagramStore((s) => s.setSelectedShapeIds);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);

  const groups = useGroupStore((s) => s.groups);
  const editingGroupId = useGroupStore((s) => s.editingGroupId);
  const enterGroupEdit = useGroupStore((s) => s.enterGroupEdit);
  const exitGroupEdit = useGroupStore((s) => s.exitGroupEdit);

  /**
   * Handle clicking on a shape with group awareness
   */
  const handleShapeClick = useCallback(
    (shapeId: string, event: React.MouseEvent) => {
      const isMultiSelect = event.shiftKey || event.ctrlKey || event.metaKey;

      // If in group edit mode
      if (editingGroupId) {
        const editingGroup = groups[editingGroupId];

        // Check if click is inside the editing group
        if (editingGroup?.memberIds.includes(shapeId)) {
          // Click inside editing group - select individual shape
          if (isMultiSelect) {
            // Toggle in selection
            if (selectedShapeIds.includes(shapeId)) {
              setSelectedShapeIds(selectedShapeIds.filter((id) => id !== shapeId));
            } else {
              setSelectedShapeIds([...selectedShapeIds, shapeId]);
            }
          } else {
            selectShape(shapeId);
          }
          return;
        }

        // Click outside editing group - exit edit mode and select normally
        exitGroupEdit();
      }

      // Not in edit mode - check if shape is grouped
      const topGroup = getSelectableGroupForShape(shapeId, groups);

      if (topGroup) {
        // Shape is grouped - select entire group
        const groupShapeIds = topGroup.memberIds;

        if (isMultiSelect) {
          // Check if group is already selected (all members selected)
          const allSelected = groupShapeIds.every((id) =>
            selectedShapeIds.includes(id)
          );

          if (allSelected) {
            // Remove all group members from selection
            setSelectedShapeIds(
              selectedShapeIds.filter((id) => !groupShapeIds.includes(id))
            );
          } else {
            // Add all group members to selection
            const newSelection = [...new Set([...selectedShapeIds, ...groupShapeIds])];
            setSelectedShapeIds(newSelection);
          }
        } else {
          // Select only this group
          setSelectedShapeIds(groupShapeIds);
        }
      } else {
        // Shape is not grouped - normal selection
        if (isMultiSelect) {
          if (selectedShapeIds.includes(shapeId)) {
            setSelectedShapeIds(selectedShapeIds.filter((id) => id !== shapeId));
          } else {
            setSelectedShapeIds([...selectedShapeIds, shapeId]);
          }
        } else {
          selectShape(shapeId);
        }
      }
    },
    [
      editingGroupId,
      groups,
      selectedShapeIds,
      selectShape,
      setSelectedShapeIds,
      exitGroupEdit,
    ]
  );

  /**
   * Handle double-clicking on a shape to enter group edit mode
   */
  const handleShapeDoubleClick = useCallback(
    (shapeId: string) => {
      // If not already in edit mode and shape is grouped, enter edit mode
      if (!editingGroupId) {
        const topGroup = getSelectableGroupForShape(shapeId, groups);
        if (topGroup) {
          enterGroupEdit(topGroup.id);
          // Select just the clicked shape
          selectShape(shapeId);
        }
      }
      // If already in edit mode, this double-click might be for text editing
      // (handled elsewhere)
    },
    [editingGroupId, groups, enterGroupEdit, selectShape]
  );

  /**
   * Get all shape IDs that should be selected when clicking the given shape
   */
  const getSelectionForShape = useCallback(
    (shapeId: string): string[] => {
      if (editingGroupId) {
        const editingGroup = groups[editingGroupId];
        if (editingGroup?.memberIds.includes(shapeId)) {
          return [shapeId]; // Individual selection in edit mode
        }
      }

      const topGroup = getSelectableGroupForShape(shapeId, groups);
      return topGroup ? topGroup.memberIds : [shapeId];
    },
    [editingGroupId, groups]
  );

  return {
    handleShapeClick,
    handleShapeDoubleClick,
    getSelectionForShape,
    isInGroupEditMode: !!editingGroupId,
    editingGroupId,
  };
}
