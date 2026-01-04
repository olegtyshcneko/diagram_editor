import React, { useMemo } from 'react';
import { useGroupStore } from '@/stores/groupStore';
import { useDiagramStore } from '@/stores/diagramStore';
import { InteractiveGroupHandles } from './InteractiveGroupHandles';
import type { Shape } from '@/types/shapes';

interface SelectedGroupData {
  groupId: string;
  memberIds: string[];
  memberShapes: Shape[];
}

/**
 * Renders interactive handles for all selected groups.
 * When a group is fully selected (all members selected), displays
 * a unified bounding box with resize and rotation handles.
 */
export const GroupOverlay: React.FC = React.memo(() => {
  const groups = useGroupStore((s) => s.groups);
  const editingGroupId = useGroupStore((s) => s.editingGroupId);
  const shapes = useDiagramStore((s) => s.shapes);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);

  // Find all groups that are fully selected
  const selectedGroups = useMemo(() => {
    const result: SelectedGroupData[] = [];

    for (const group of Object.values(groups)) {
      // Skip the group being edited (it has its own visual via GroupEditMode)
      if (group.id === editingGroupId) continue;

      // Check if all members of this group are selected
      const allMembersSelected = group.memberIds.every((id) =>
        selectedShapeIds.includes(id)
      );

      if (allMembersSelected && group.memberIds.length > 0) {
        // Get the shapes for this group
        const memberShapes = group.memberIds
          .map((id) => shapes[id])
          .filter((s): s is Shape => s !== undefined);

        if (memberShapes.length > 0) {
          result.push({
            groupId: group.id,
            memberIds: group.memberIds,
            memberShapes,
          });
        }
      }
    }

    return result;
  }, [groups, editingGroupId, shapes, selectedShapeIds]);

  if (selectedGroups.length === 0) return null;

  return (
    <g className="group-overlays">
      {selectedGroups.map(({ groupId, memberIds, memberShapes }) => (
        <InteractiveGroupHandles
          key={groupId}
          groupId={groupId}
          memberIds={memberIds}
          memberShapes={memberShapes}
        />
      ))}
    </g>
  );
});

GroupOverlay.displayName = 'GroupOverlay';
