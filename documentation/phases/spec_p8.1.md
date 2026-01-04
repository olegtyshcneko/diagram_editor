# Phase 8.1: Groups - Technical Specification

## Technical Architecture

### Component Hierarchy

```
App
├── MenuBar (extended with Arrange > Group/Ungroup)
├── Canvas
│   ├── ShapeRenderer
│   ├── GroupOverlay (new) - Visual feedback for groups
│   ├── GroupEditMode (new) - Edit mode UI overlay
│   └── SelectionOverlay (modified for group bounds)
├── PropertyPanel
└── ContextMenu (extended with group options)
```

### State Management

```typescript
// stores/groupStore.ts - New store for group management
interface GroupStore {
  groups: Record<string, Group>;
  editingGroupId: string | null;

  // Actions
  createGroup: (shapeIds: string[]) => string | null;
  ungroup: (groupId: string) => string[];
  enterGroupEdit: (groupId: string) => void;
  exitGroupEdit: () => void;
  getGroupForShape: (shapeId: string) => Group | null;
  getTopLevelGroupForShape: (shapeId: string) => Group | null;
  isInEditingGroup: (shapeId: string) => boolean;
}
```

---

## Files to Create

### New Files

```
src/
├── types/
│   └── group.ts                    # Group type definitions
├── stores/
│   └── groupStore.ts               # Group state management
├── hooks/
│   ├── useGroups.ts                # Group operations hook
│   └── useGroupAwareSelection.ts   # Selection with group logic
├── components/
│   └── canvas/
│       ├── GroupOverlay.tsx        # Group bounding box visual
│       └── GroupEditMode.tsx       # Edit mode overlay
└── utils/
    └── groupUtils.ts               # Group calculation utilities
```

### Files to Modify

```
src/
├── types/
│   └── shapes.ts                   # Add groupId field
├── stores/
│   └── diagramStore.ts             # Add group-related helpers
├── hooks/
│   └── useSelection.ts             # Group-aware selection logic
├── components/
│   ├── canvas/
│   │   ├── Canvas.tsx              # Integrate group overlays
│   │   └── SelectionOverlay.tsx    # Group bounding box
│   ├── menu/
│   │   ├── MenuBar.tsx             # Arrange > Group/Ungroup
│   │   └── ContextMenu.tsx         # Group options
│   └── toolbar/
│       └── Toolbar.tsx             # Keyboard shortcut hints
└── lib/
    └── keyboard.ts                 # Ctrl+G, Ctrl+Shift+G shortcuts
```

---

## Key Interfaces & Types

### Group Types

```typescript
// types/group.ts

export interface Group {
  id: string;
  memberIds: string[];      // Shape IDs in this group
  parentGroupId?: string;   // For nested groups
}

export interface GroupState {
  groups: Record<string, Group>;
  editingGroupId: string | null;
}

// Extended shape type
declare module './shapes' {
  interface Shape {
    groupId?: string;
  }
}
```

---

## Implementation Order

### Step 1: Types and Store Foundation
1. Create `types/group.ts` with Group interface
2. Extend Shape type with optional `groupId`
3. Create `stores/groupStore.ts` with basic actions

### Step 2: Group Creation
4. Implement `createGroup` action
5. Create `utils/groupUtils.ts` with bounds calculation
6. Wire up Ctrl+G keyboard shortcut

### Step 3: Group Selection
7. Create `hooks/useGroupAwareSelection.ts`
8. Modify selection behavior to select entire group
9. Create `GroupOverlay.tsx` for group bounds display

### Step 4: Group Movement
10. Modify shape movement to move entire group
11. Ensure relative positions maintained
12. Add history tracking for group move

### Step 5: Ungrouping
13. Implement `ungroup` action
14. Wire up Ctrl+Shift+G keyboard shortcut
15. Handle nested group ungrouping

### Step 6: Group Edit Mode
16. Create `GroupEditMode.tsx` overlay
17. Implement `enterGroupEdit` / `exitGroupEdit`
18. Add visual dimming for non-group shapes
19. Update selection behavior for edit mode

### Step 7: Menu Integration
20. Add Arrange > Group menu item
21. Add Arrange > Ungroup menu item
22. Add context menu options
23. Add history tracking for group/ungroup

---

## Code Patterns

### Group Store Implementation

```typescript
// stores/groupStore.ts
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Group } from '../types/group';

interface GroupStore {
  groups: Record<string, Group>;
  editingGroupId: string | null;

  createGroup: (shapeIds: string[]) => string | null;
  ungroup: (groupId: string) => string[];
  enterGroupEdit: (groupId: string) => void;
  exitGroupEdit: () => void;
  getGroupForShape: (shapeId: string) => Group | null;
  getTopLevelGroupForShape: (shapeId: string) => Group | null;
  isInEditingGroup: (shapeId: string) => boolean;
  getGroupMembers: (groupId: string) => string[];
  reset: () => void;
}

export const useGroupStore = create<GroupStore>((set, get) => ({
  groups: {},
  editingGroupId: null,

  createGroup: (shapeIds) => {
    if (shapeIds.length < 2) return null;

    const id = nanoid();
    const group: Group = {
      id,
      memberIds: shapeIds,
    };

    set((state) => ({
      groups: { ...state.groups, [id]: group },
    }));

    return id;
  },

  ungroup: (groupId) => {
    const group = get().groups[groupId];
    if (!group) return [];

    const memberIds = [...group.memberIds];

    set((state) => {
      const { [groupId]: _, ...remainingGroups } = state.groups;
      return {
        groups: remainingGroups,
        editingGroupId: state.editingGroupId === groupId ? null : state.editingGroupId,
      };
    });

    return memberIds;
  },

  enterGroupEdit: (groupId) => {
    if (get().groups[groupId]) {
      set({ editingGroupId: groupId });
    }
  },

  exitGroupEdit: () => {
    set({ editingGroupId: null });
  },

  getGroupForShape: (shapeId) => {
    const { groups } = get();
    return Object.values(groups).find((g) =>
      g.memberIds.includes(shapeId)
    ) || null;
  },

  getTopLevelGroupForShape: (shapeId) => {
    const { groups } = get();
    let group = Object.values(groups).find((g) =>
      g.memberIds.includes(shapeId)
    );

    if (!group) return null;

    // Walk up parent chain
    while (group?.parentGroupId) {
      const parent = groups[group.parentGroupId];
      if (parent) {
        group = parent;
      } else {
        break;
      }
    }

    return group;
  },

  isInEditingGroup: (shapeId) => {
    const { editingGroupId, groups } = get();
    if (!editingGroupId) return false;

    const group = groups[editingGroupId];
    return group?.memberIds.includes(shapeId) || false;
  },

  getGroupMembers: (groupId) => {
    const group = get().groups[groupId];
    return group?.memberIds || [];
  },

  reset: () => {
    set({ groups: {}, editingGroupId: null });
  },
}));
```

### Group Utilities

```typescript
// utils/groupUtils.ts
import type { Shape } from '../types/shapes';
import type { Bounds } from '../types/common';

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
    // Account for rotation if needed
    const shapeBounds = getShapeBounds(shape);
    minX = Math.min(minX, shapeBounds.x);
    minY = Math.min(minY, shapeBounds.y);
    maxX = Math.max(maxX, shapeBounds.x + shapeBounds.width);
    maxY = Math.max(maxY, shapeBounds.y + shapeBounds.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function getShapeBounds(shape: Shape): Bounds {
  // Simple bounds (rotation handling can be added later)
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
  return Object.values(groups).some(g => g.memberIds.includes(shapeId));
}

/**
 * Get all shape IDs in a group and its nested groups
 */
export function getAllGroupShapeIds(
  groupId: string,
  groups: Record<string, Group>
): string[] {
  const group = groups[groupId];
  if (!group) return [];

  const shapeIds: string[] = [];

  for (const memberId of group.memberIds) {
    // Check if this member is a group itself
    const nestedGroup = Object.values(groups).find(g =>
      g.parentGroupId === groupId || g.memberIds.includes(memberId)
    );

    if (nestedGroup && nestedGroup.id !== groupId) {
      shapeIds.push(...getAllGroupShapeIds(nestedGroup.id, groups));
    } else {
      shapeIds.push(memberId);
    }
  }

  return shapeIds;
}
```

### Group-Aware Selection Hook

```typescript
// hooks/useGroupAwareSelection.ts
import { useCallback } from 'react';
import { useSelectionStore } from '../stores/selectionStore';
import { useGroupStore } from '../stores/groupStore';

export function useGroupAwareSelection() {
  const { selectShape, addToSelection, clearSelection, selectedIds } = useSelectionStore();
  const { groups, editingGroupId, getTopLevelGroupForShape, exitGroupEdit } = useGroupStore();

  const handleShapeClick = useCallback((
    shapeId: string,
    event: React.MouseEvent
  ) => {
    const isMultiSelect = event.shiftKey || event.ctrlKey || event.metaKey;

    // If in group edit mode, check if click is inside the editing group
    if (editingGroupId) {
      const group = groups[editingGroupId];
      if (group?.memberIds.includes(shapeId)) {
        // Click inside editing group - select individual shape
        if (isMultiSelect) {
          addToSelection([shapeId]);
        } else {
          clearSelection();
          selectShape(shapeId);
        }
        return;
      }
      // Click outside editing group - exit edit mode
      exitGroupEdit();
    }

    // Not in edit mode - select entire group
    const topGroup = getTopLevelGroupForShape(shapeId);

    if (topGroup) {
      // Select all shapes in the group
      const groupShapeIds = topGroup.memberIds;
      if (isMultiSelect) {
        addToSelection(groupShapeIds);
      } else {
        clearSelection();
        addToSelection(groupShapeIds);
      }
    } else {
      // No group - normal selection
      if (isMultiSelect) {
        addToSelection([shapeId]);
      } else {
        clearSelection();
        selectShape(shapeId);
      }
    }
  }, [editingGroupId, groups, getTopLevelGroupForShape, selectShape, addToSelection, clearSelection, exitGroupEdit]);

  const handleShapeDoubleClick = useCallback((shapeId: string) => {
    const group = getTopLevelGroupForShape(shapeId);
    if (group && !editingGroupId) {
      useGroupStore.getState().enterGroupEdit(group.id);
      // Clear selection and select just the clicked shape
      clearSelection();
      selectShape(shapeId);
    }
  }, [getTopLevelGroupForShape, editingGroupId, clearSelection, selectShape]);

  return {
    handleShapeClick,
    handleShapeDoubleClick,
    isInGroupEditMode: !!editingGroupId,
    editingGroupId,
  };
}
```

### Group Overlay Component

```typescript
// components/canvas/GroupOverlay.tsx
import React from 'react';
import { useGroupStore } from '../../stores/groupStore';
import { useDiagramStore } from '../../stores/diagramStore';
import { useSelectionStore } from '../../stores/selectionStore';
import { calculateGroupBounds } from '../../utils/groupUtils';

interface GroupOverlayProps {
  groupId: string;
}

export const GroupOverlay: React.FC<GroupOverlayProps> = ({ groupId }) => {
  const group = useGroupStore((state) => state.groups[groupId]);
  const shapes = useDiagramStore((state) => state.shapes);
  const selectedIds = useSelectionStore((state) => state.selectedIds);
  const editingGroupId = useGroupStore((state) => state.editingGroupId);

  if (!group) return null;

  const memberShapes = group.memberIds
    .map((id) => shapes[id])
    .filter(Boolean);

  if (memberShapes.length === 0) return null;

  const bounds = calculateGroupBounds(memberShapes);

  // Check if this group is selected (all members selected)
  const isSelected = group.memberIds.every((id) => selectedIds.includes(id));
  const isEditing = editingGroupId === groupId;

  if (!isSelected && !isEditing) return null;

  return (
    <g className="group-overlay" pointerEvents="none">
      {/* Group bounding box */}
      <rect
        x={bounds.x - 4}
        y={bounds.y - 4}
        width={bounds.width + 8}
        height={bounds.height + 8}
        fill="none"
        stroke={isEditing ? '#F59E0B' : '#3B82F6'}
        strokeWidth={isEditing ? 2 : 1}
        strokeDasharray={isEditing ? '4 2' : 'none'}
        rx={2}
        opacity={0.6}
      />
    </g>
  );
};
```

### Group Edit Mode Overlay

```typescript
// components/canvas/GroupEditMode.tsx
import React from 'react';
import { useGroupStore } from '../../stores/groupStore';
import { useDiagramStore } from '../../stores/diagramStore';
import { useViewportStore } from '../../stores/viewportStore';
import { calculateGroupBounds } from '../../utils/groupUtils';

export const GroupEditMode: React.FC = () => {
  const editingGroupId = useGroupStore((state) => state.editingGroupId);
  const group = useGroupStore((state) =>
    editingGroupId ? state.groups[editingGroupId] : null
  );
  const shapes = useDiagramStore((state) => state.shapes);
  const { canvasWidth, canvasHeight } = useViewportStore();

  if (!editingGroupId || !group) return null;

  const memberShapes = group.memberIds
    .map((id) => shapes[id])
    .filter(Boolean);

  const bounds = calculateGroupBounds(memberShapes);

  // Create a mask that dims everything outside the group
  return (
    <g className="group-edit-mode" pointerEvents="none">
      {/* Dimming overlay for non-group areas */}
      <defs>
        <mask id={`group-edit-mask-${editingGroupId}`}>
          <rect x={-10000} y={-10000} width={20000} height={20000} fill="white" />
          <rect
            x={bounds.x - 8}
            y={bounds.y - 8}
            width={bounds.width + 16}
            height={bounds.height + 16}
            fill="black"
            rx={4}
          />
        </mask>
      </defs>

      <rect
        x={-10000}
        y={-10000}
        width={20000}
        height={20000}
        fill="rgba(0, 0, 0, 0.3)"
        mask={`url(#group-edit-mask-${editingGroupId})`}
      />

      {/* Group boundary highlight */}
      <rect
        x={bounds.x - 8}
        y={bounds.y - 8}
        width={bounds.width + 16}
        height={bounds.height + 16}
        fill="none"
        stroke="#F59E0B"
        strokeWidth={2}
        strokeDasharray="4 2"
        rx={4}
      />
    </g>
  );
};
```

### Keyboard Shortcuts

```typescript
// Add to keyboard shortcut handler

// Group selected shapes
if ((e.ctrlKey || e.metaKey) && e.key === 'g' && !e.shiftKey) {
  e.preventDefault();
  const selectedIds = useSelectionStore.getState().selectedIds;
  if (selectedIds.length >= 2) {
    const groupId = useGroupStore.getState().createGroup(selectedIds);
    if (groupId) {
      // Update shapes with groupId
      selectedIds.forEach(id => {
        useDiagramStore.getState().updateShape(id, { groupId });
      });
      // Record in history
      useHistoryStore.getState().pushHistory({
        type: 'group',
        description: `Group ${selectedIds.length} shapes`,
        // ... undo/redo data
      });
    }
  }
  return;
}

// Ungroup selected group
if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'G') {
  e.preventDefault();
  const selectedIds = useSelectionStore.getState().selectedIds;
  // Find group containing all selected shapes
  const groups = useGroupStore.getState().groups;
  const group = Object.values(groups).find(g =>
    g.memberIds.length === selectedIds.length &&
    g.memberIds.every(id => selectedIds.includes(id))
  );
  if (group) {
    const memberIds = useGroupStore.getState().ungroup(group.id);
    // Clear groupId from shapes
    memberIds.forEach(id => {
      useDiagramStore.getState().updateShape(id, { groupId: undefined });
    });
    // Record in history
    useHistoryStore.getState().pushHistory({
      type: 'ungroup',
      description: `Ungroup ${memberIds.length} shapes`,
      // ... undo/redo data
    });
  }
  return;
}
```

---

## Testing Approach

### Unit Tests

```typescript
// __tests__/groupStore.test.ts
describe('groupStore', () => {
  beforeEach(() => {
    useGroupStore.getState().reset();
  });

  it('should create group with member ids', () => {
    const groupId = useGroupStore.getState().createGroup(['shape1', 'shape2']);
    expect(groupId).toBeTruthy();

    const group = useGroupStore.getState().groups[groupId!];
    expect(group.memberIds).toEqual(['shape1', 'shape2']);
  });

  it('should not create group with single shape', () => {
    const groupId = useGroupStore.getState().createGroup(['shape1']);
    expect(groupId).toBeNull();
  });

  it('should ungroup and return member ids', () => {
    const groupId = useGroupStore.getState().createGroup(['shape1', 'shape2']);
    const memberIds = useGroupStore.getState().ungroup(groupId!);

    expect(memberIds).toEqual(['shape1', 'shape2']);
    expect(useGroupStore.getState().groups[groupId!]).toBeUndefined();
  });

  it('should find group for shape', () => {
    const groupId = useGroupStore.getState().createGroup(['shape1', 'shape2']);
    const group = useGroupStore.getState().getGroupForShape('shape1');

    expect(group?.id).toBe(groupId);
  });

  it('should enter and exit group edit mode', () => {
    const groupId = useGroupStore.getState().createGroup(['shape1', 'shape2']);

    useGroupStore.getState().enterGroupEdit(groupId!);
    expect(useGroupStore.getState().editingGroupId).toBe(groupId);

    useGroupStore.getState().exitGroupEdit();
    expect(useGroupStore.getState().editingGroupId).toBeNull();
  });
});

// __tests__/groupUtils.test.ts
describe('groupUtils', () => {
  it('should calculate group bounds', () => {
    const shapes = [
      { x: 10, y: 10, width: 50, height: 50 },
      { x: 100, y: 100, width: 50, height: 50 },
    ];
    const bounds = calculateGroupBounds(shapes);

    expect(bounds.x).toBe(10);
    expect(bounds.y).toBe(10);
    expect(bounds.width).toBe(140); // 100 + 50 - 10
    expect(bounds.height).toBe(140);
  });
});
```

---

## Performance Considerations

### Group Bounds Caching
Calculate and cache group bounds when group is created or shapes are modified. Invalidate cache when any member shape moves or resizes.

```typescript
interface Group {
  id: string;
  memberIds: string[];
  parentGroupId?: string;
  cachedBounds?: Bounds;
  boundsVersion?: number;
}
```

### Selective Re-rendering
Use React.memo and useMemo to prevent unnecessary re-renders of group overlays when unrelated shapes change.

---

## Accessibility Requirements

- Screen reader announces "Entered group edit mode" / "Exited group edit mode"
- Group selection announced with member count: "Selected group with 3 shapes"
- Keyboard navigation: Tab through shapes in group edit mode
- Focus management when entering/exiting edit mode

---

## History Integration

Group and ungroup operations must be tracked in history:

```typescript
interface GroupHistoryEntry {
  type: 'group';
  groupId: string;
  memberIds: string[];
  previousGroupIds: Record<string, string | undefined>; // shapeId -> previous groupId
}

interface UngroupHistoryEntry {
  type: 'ungroup';
  group: Group; // Full group data for redo
  shapeGroupIds: Record<string, string>; // shapeId -> groupId that was removed
}
```
