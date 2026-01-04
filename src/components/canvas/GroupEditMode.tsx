import React, { useMemo } from 'react';
import { useGroupStore } from '@/stores/groupStore';
import { useDiagramStore } from '@/stores/diagramStore';
import { calculateGroupBounds } from '@/lib/groupUtils';

// Colors for group edit mode
const GROUP_EDIT_COLOR = '#F59E0B'; // Orange/amber
const DIM_OPACITY = 0.3;

/**
 * Renders the group edit mode overlay:
 * - Dims all shapes outside the editing group
 * - Shows an orange dashed boundary around the group being edited
 */
export const GroupEditMode: React.FC = React.memo(() => {
  const editingGroupId = useGroupStore((s) => s.editingGroupId);
  const group = useGroupStore((s) =>
    editingGroupId ? s.groups[editingGroupId] : null
  );
  const shapes = useDiagramStore((s) => s.shapes);

  const bounds = useMemo(() => {
    if (!group) return null;

    const memberShapes = group.memberIds
      .map((id) => shapes[id])
      .filter(Boolean);

    if (memberShapes.length === 0) return null;

    return calculateGroupBounds(memberShapes);
  }, [group, shapes]);

  if (!editingGroupId || !group || !bounds) return null;

  const maskId = `group-edit-mask-${editingGroupId}`;
  const padding = 8;

  return (
    <g className="group-edit-mode" pointerEvents="none">
      {/* Define mask that cuts out the group area */}
      <defs>
        <mask id={maskId}>
          {/* White background - will be visible (dimmed) */}
          <rect
            x={-10000}
            y={-10000}
            width={20000}
            height={20000}
            fill="white"
          />
          {/* Black cutout for the group - will be transparent */}
          <rect
            x={bounds.x - padding}
            y={bounds.y - padding}
            width={bounds.width + padding * 2}
            height={bounds.height + padding * 2}
            fill="black"
            rx={4}
          />
        </mask>
      </defs>

      {/* Dimming overlay (masked to not cover the group) */}
      <rect
        x={-10000}
        y={-10000}
        width={20000}
        height={20000}
        fill={`rgba(0, 0, 0, ${DIM_OPACITY})`}
        mask={`url(#${maskId})`}
      />

      {/* Group boundary highlight */}
      <rect
        x={bounds.x - padding}
        y={bounds.y - padding}
        width={bounds.width + padding * 2}
        height={bounds.height + padding * 2}
        fill="none"
        stroke={GROUP_EDIT_COLOR}
        strokeWidth={2}
        strokeDasharray="4 2"
        rx={4}
      />
    </g>
  );
});

GroupEditMode.displayName = 'GroupEditMode';
