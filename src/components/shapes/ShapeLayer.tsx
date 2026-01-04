import { useCallback } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useGroupStore } from '@/stores/groupStore';
import { Shape } from './Shape';
import { InteractiveSelectionHandles } from './InteractiveSelectionHandles';
import { getSelectableGroupForShape } from '@/lib/groupUtils';
import type { Group } from '@/types/group';

interface ShapeLayerProps {
  onShapeHover?: (shapeId: string | null) => void;
  onShapeDoubleClick?: (shapeId: string) => void;
}

/**
 * Check if a shape is part of a fully-selected group.
 * Returns true if the shape should have its individual handles hidden
 * (because the group handles will show instead).
 */
function isShapeInSelectedGroup(
  shapeId: string,
  selectedShapeIds: string[],
  groups: Record<string, Group>,
  editingGroupId: string | null
): boolean {
  // If in edit mode, show individual handles for shapes in the editing group
  if (editingGroupId) {
    const editingGroup = groups[editingGroupId];
    if (editingGroup?.memberIds.includes(shapeId)) {
      return false; // Show individual handles in edit mode
    }
  }

  // Check if this shape is part of any fully-selected group
  for (const group of Object.values(groups)) {
    if (group.memberIds.includes(shapeId)) {
      const allMembersSelected = group.memberIds.every((id) =>
        selectedShapeIds.includes(id)
      );
      if (allMembersSelected) {
        return true; // Hide individual handles, group handles will show
      }
    }
  }

  return false;
}

export function ShapeLayer({ onShapeHover, onShapeDoubleClick }: ShapeLayerProps) {
  const shapes = useDiagramStore((s) => s.shapes);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const setSelectedShapeIds = useDiagramStore((s) => s.setSelectedShapeIds);
  const selectShape = useDiagramStore((s) => s.selectShape);

  const groups = useGroupStore((s) => s.groups);
  const editingGroupId = useGroupStore((s) => s.editingGroupId);
  const exitGroupEdit = useGroupStore((s) => s.exitGroupEdit);

  // Sort shapes by zIndex for proper layering
  const sortedShapes = Object.values(shapes).sort((a, b) => a.zIndex - b.zIndex);

  // Group-aware selection handler
  const handleSelect = useCallback((id: string, addToSelection: boolean) => {
    // If in group edit mode
    if (editingGroupId) {
      const editingGroup = groups[editingGroupId];

      // Check if click is inside the editing group
      if (editingGroup?.memberIds.includes(id)) {
        // Individual selection within the group
        if (addToSelection) {
          if (selectedShapeIds.includes(id)) {
            setSelectedShapeIds(selectedShapeIds.filter((sid) => sid !== id));
          } else {
            setSelectedShapeIds([...selectedShapeIds, id]);
          }
        } else {
          selectShape(id);
        }
        return;
      }

      // Click outside editing group - exit edit mode and select normally
      exitGroupEdit();
    }

    // Check if shape is part of a group
    const topGroup = getSelectableGroupForShape(id, groups);

    if (topGroup) {
      // Shape is grouped - select entire group
      const groupShapeIds = topGroup.memberIds;

      if (addToSelection) {
        // Toggle group selection
        const allSelected = groupShapeIds.every((gid) => selectedShapeIds.includes(gid));
        if (allSelected) {
          setSelectedShapeIds(selectedShapeIds.filter((sid) => !groupShapeIds.includes(sid)));
        } else {
          const newSelection = [...new Set([...selectedShapeIds, ...groupShapeIds])];
          setSelectedShapeIds(newSelection);
        }
      } else {
        // Select only this group
        setSelectedShapeIds(groupShapeIds);
      }
    } else {
      // Normal selection for ungrouped shapes
      if (addToSelection) {
        if (selectedShapeIds.includes(id)) {
          setSelectedShapeIds(selectedShapeIds.filter((sid) => sid !== id));
        } else {
          setSelectedShapeIds([...selectedShapeIds, id]);
        }
      } else {
        selectShape(id);
      }
    }
  }, [
    editingGroupId,
    groups,
    selectedShapeIds,
    setSelectedShapeIds,
    selectShape,
    exitGroupEdit,
  ]);

  return (
    <g className="shape-layer">
      {/* Render all shapes */}
      {sortedShapes.map((shape) => (
        <Shape
          key={shape.id}
          shape={shape}
          isSelected={selectedShapeIds.includes(shape.id)}
          onSelect={handleSelect}
          onDoubleClick={onShapeDoubleClick}
          onMouseEnter={() => onShapeHover?.(shape.id)}
          onMouseLeave={() => onShapeHover?.(null)}
        />
      ))}

      {/* Render interactive selection handles on top */}
      {/* Skip handles for shapes that are in a fully-selected group (group handles show instead) */}
      {selectedShapeIds.map((id) => {
        const shape = shapes[id];
        if (!shape) return null;

        // Hide individual handles if shape is in a fully-selected group
        const hideHandles = isShapeInSelectedGroup(id, selectedShapeIds, groups, editingGroupId);
        if (hideHandles) return null;

        return <InteractiveSelectionHandles key={`handles-${id}`} shape={shape} />;
      })}
    </g>
  );
}
