import type { Shape } from '@/types/shapes';
import type { Group } from '@/types/group';

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculate bounding box for a group of shapes
 */
export function calculateGroupBounds(shapes: Shape[]): Bounds {
  if (shapes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const shape of shapes) {
    const bounds = getShapeBounds(shape);
    minX = Math.min(minX, bounds.x);
    minY = Math.min(minY, bounds.y);
    maxX = Math.max(maxX, bounds.x + bounds.width);
    maxY = Math.max(maxY, bounds.y + bounds.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Get bounds for a single shape (without rotation consideration for simplicity)
 */
function getShapeBounds(shape: Shape): Bounds {
  return {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
  };
}

/**
 * Check if a shape is part of any group
 */
export function isShapeGrouped(shapeId: string, groups: Record<string, Group>): boolean {
  return Object.values(groups).some((g) => g.memberIds.includes(shapeId));
}

/**
 * Get all shape IDs in a group (non-recursive - just direct members)
 */
export function getGroupShapeIds(groupId: string, groups: Record<string, Group>): string[] {
  const group = groups[groupId];
  return group?.memberIds || [];
}

/**
 * Get all shape IDs in a group and its nested groups (recursive)
 */
export function getAllGroupShapeIds(
  groupId: string,
  groups: Record<string, Group>
): string[] {
  const group = groups[groupId];
  if (!group) return [];

  const shapeIds: string[] = [...group.memberIds];

  // Find child groups (groups that have this group as parent)
  const childGroups = Object.values(groups).filter(
    (g) => g.parentGroupId === groupId
  );

  for (const childGroup of childGroups) {
    shapeIds.push(...getAllGroupShapeIds(childGroup.id, groups));
  }

  return shapeIds;
}

/**
 * Check if the selected shapes form a complete group
 * (all shapes belong to the same group and all group members are selected)
 */
export function isCompleteGroupSelected(
  selectedIds: string[],
  groups: Record<string, Group>
): Group | null {
  if (selectedIds.length < 2) return null;

  // Find groups that contain any of the selected shapes
  for (const group of Object.values(groups)) {
    // Check if all selected shapes are in this group and
    // all group members are selected
    const selectedInGroup = selectedIds.filter((id) =>
      group.memberIds.includes(id)
    );

    if (
      selectedInGroup.length === group.memberIds.length &&
      selectedInGroup.length === selectedIds.length
    ) {
      return group;
    }
  }

  return null;
}

/**
 * Get the group that should be selected when clicking a shape
 * Returns the top-level group if shape is grouped, null otherwise
 */
export function getSelectableGroupForShape(
  shapeId: string,
  groups: Record<string, Group>
): Group | null {
  // Find the group containing this shape
  const foundGroup = Object.values(groups).find((g) => g.memberIds.includes(shapeId));

  if (!foundGroup) return null;

  let group: Group = foundGroup;

  // Walk up to find the top-level group
  while (group.parentGroupId) {
    const parent: Group | undefined = groups[group.parentGroupId];
    if (parent) {
      group = parent;
    } else {
      break;
    }
  }

  return group;
}
