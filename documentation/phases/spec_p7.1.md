# Phase 7.1: P7 Bug Fixes & Completion - Technical Specification

## Overview

This phase fixes P7 bugs and completes deferred features. Work is ordered: bug fixes first, then history completion, then menu bar.

---

## Implementation Order

### Step 1: Fix KI-006 - Context Menu Click Actions
### Step 2: Fix KI-007 - Resize/Rotation History
### Step 3: Add History for Style Changes
### Step 4: Add History for Text Changes
### Step 5: Add History for Connection Creation
### Step 6: Add History for Alignment/Distribution
### Step 7: Add History for Z-Order Changes
### Step 8: Create Menu Bar Component

---

## Step 1: Fix KI-006 - Context Menu Click Actions

### Problem Analysis
The context menu displays but click actions don't execute.

**Critical Clue:**
- Context menu **WORKS** when right-clicking on empty canvas
- Context menu **DOES NOT WORK** when right-clicking on a shape
- This means the issue is specific to when cursor is over a shape

This suggests the problem is likely:
1. Shape's mouse event handlers (onMouseDown/onMouseUp) are firing when clicking menu items
2. Shape SVG elements may be capturing events even when menu is open
3. The shape or its parent container intercepts clicks meant for the menu
4. Possible z-index/stacking context issue where shape events take priority

### Files to Debug
- `src/components/contextMenu/ContextMenu.tsx`
- `src/hooks/useContextMenu.ts`
- `src/components/shapes/Shape.tsx` - check mouse event handlers
- `src/components/canvas/CanvasContainer.tsx` - check event handling
- `src/hooks/useSelection.ts` - may be triggering on menu click

### Debug Approach
```typescript
// 1. Add console.log to ContextMenu to verify click reaches it
const handleItemClick = (item: ContextMenuEntry) => {
  console.log('Menu item clicked:', item.id);
  if (item.action) {
    console.log('Executing action...');
    item.action();
    console.log('Action executed');
  }
  closeMenu();
};

// 2. Check if Shape.tsx mouse handlers fire during menu click
// In Shape.tsx:
onMouseDown={(e) => {
  console.log('Shape onMouseDown fired while menu open?', contextMenuOpen);
  // ...
}}

// 3. Check if selection hook fires
// In useSelection.ts:
const handleCanvasClick = (screenPoint: Point) => {
  console.log('handleCanvasClick fired');
  // ...
};
```

### Likely Fixes

**Option 1: Stop propagation on menu container**
```typescript
// In ContextMenu.tsx - prevent events from reaching shapes below
<div
  className="fixed z-50 ..."
  onMouseDown={(e) => e.stopPropagation()}
  onMouseUp={(e) => e.stopPropagation()}
  onClick={(e) => e.stopPropagation()}
>
```

**Option 2: Check if shape handlers should be disabled when menu is open**
```typescript
// In Shape.tsx or useSelection - skip if context menu is open
const contextMenuOpen = useContextMenuStore((s) => s.isOpen);
if (contextMenuOpen) return; // Don't process shape clicks
```

**Option 3: Ensure menu z-index is above SVG/shapes**
```typescript
// Context menu should have very high z-index
<div className="fixed z-[9999] ..." style={{ pointerEvents: 'auto' }}>
```

**Option 4: Check backdrop is not blocking menu items**
The backdrop div might be intercepting clicks. Ensure menu content is above backdrop:
```typescript
{/* Backdrop - z-40 */}
<div className="fixed inset-0 z-40" onClick={close} />

{/* Menu content - must be z-50+ to be above backdrop */}
<div className="fixed z-50 ...">
  {/* menu items */}
</div>
```

---

## Step 2: Fix KI-007 - Resize/Rotation History

### Problem Analysis
History tracking code exists in hooks but entries not appearing. Check:
1. Is `pushEntry` being imported and called?
2. Is the before/after state captured correctly?
3. Are the hooks getting the right store references?

### Files to Fix
- `src/hooks/manipulation/useShapeResize.ts`
- `src/hooks/manipulation/useShapeRotate.ts`

### Required Pattern
```typescript
// At start of operation - capture before state
const startResize = useCallback((shapeId: string, handle: HandleType, startPoint: Point) => {
  const shape = shapes[shapeId];
  if (!shape) return;

  // Store original state for history
  originalStateRef.current = {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
  };

  // ... rest of start logic
}, [shapes]);

// At end of operation - push history entry
const endResize = useCallback(() => {
  if (!manipulationState || manipulationState.type !== 'resize') return;

  const shape = shapes[manipulationState.shapeId];
  const original = originalStateRef.current;

  if (shape && original) {
    // Only push if actually changed
    if (shape.x !== original.x || shape.y !== original.y ||
        shape.width !== original.width || shape.height !== original.height) {
      pushEntry({
        type: 'RESIZE_SHAPE',
        description: 'Resize Shape',
        shapeDelta: {
          added: [],
          removed: [],
          modified: [{
            id: shape.id,
            before: original,
            after: {
              x: shape.x,
              y: shape.y,
              width: shape.width,
              height: shape.height,
            },
          }],
        },
        connectionDelta: EMPTY_CONNECTION_DELTA,
        selectionBefore: [shape.id],
        selectionAfter: [shape.id],
      });
    }
  }

  originalStateRef.current = null;
  endManipulation();
}, [manipulationState, shapes, pushEntry, endManipulation]);
```

### Same Pattern for Rotation
```typescript
// Capture: rotation
// After: { rotation: newRotation }
// Before: { rotation: originalRotation }
```

---

## Step 3: Add History for Style Changes

### Scope
Track these style changes (per-property, each change = 1 undo step):
- Fill color/opacity
- Stroke color/opacity/width/style
- Corner radius
- Text properties (font, size, bold, italic, underline, color, alignment)

### Files to Modify
- `src/components/panels/sections/FillSection.tsx`
- `src/components/panels/sections/StrokeSection.tsx`
- `src/components/panels/sections/CornerRadiusSection.tsx`
- `src/components/panels/sections/TextSection.tsx`

### Implementation Pattern
Create a wrapper hook or modify sections to track changes:

```typescript
// Option 1: Wrapper in each section
const handleFillColorChange = useCallback((color: string) => {
  const shape = shapes[selectedShapeIds[0]];
  if (!shape) return;

  const before = { fill: shape.fill };
  updateShape(shape.id, { fill: color });
  const after = { fill: color };

  pushEntry({
    type: 'UPDATE_STYLE',
    description: 'Change Fill Color',
    shapeDelta: {
      added: [],
      removed: [],
      modified: [{ id: shape.id, before, after }],
    },
    connectionDelta: EMPTY_CONNECTION_DELTA,
    selectionBefore: selectedShapeIds,
    selectionAfter: selectedShapeIds,
  });
}, [shapes, selectedShapeIds, updateShape, pushEntry]);

// Option 2: Create useStyleChange hook
function useStyleChange() {
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const shapes = useDiagramStore((s) => s.shapes);
  const updateShape = useDiagramStore((s) => s.updateShape);

  const applyStyleChange = useCallback((
    property: string,
    value: unknown,
    description: string
  ) => {
    const modifications = selectedShapeIds.map(id => {
      const shape = shapes[id];
      return {
        id,
        before: { [property]: shape[property as keyof Shape] },
        after: { [property]: value },
      };
    });

    selectedShapeIds.forEach(id => updateShape(id, { [property]: value }));

    pushEntry({
      type: 'UPDATE_STYLE',
      description,
      shapeDelta: { added: [], removed: [], modified: modifications },
      connectionDelta: EMPTY_CONNECTION_DELTA,
      selectionBefore: selectedShapeIds,
      selectionAfter: selectedShapeIds,
    });
  }, [selectedShapeIds, shapes, updateShape, pushEntry]);

  return { applyStyleChange };
}
```

### Multi-Selection Support
When multiple shapes are selected, track all of them in one history entry:
```typescript
modified: selectedShapeIds.map(id => ({
  id,
  before: { fill: shapes[id].fill },
  after: { fill: newColor },
}))
```

---

## Step 4: Add History for Text Changes

### Scope
Track text content changes when editing is complete (not per-keystroke).

### Files to Modify
- `src/hooks/useTextEditing.ts`
- `src/components/canvas/TextEditOverlay.tsx`

### Implementation
Capture text before editing starts, push history when editing ends:

```typescript
// In useTextEditing or TextEditOverlay
const originalTextRef = useRef<string | null>(null);

// When editing starts
const startEditing = (shapeId: string) => {
  const shape = shapes[shapeId];
  originalTextRef.current = shape?.text || '';
  setEditingTextShapeId(shapeId);
};

// When editing ends (blur, Escape, or click outside)
const endEditing = () => {
  const shapeId = editingTextShapeId;
  if (!shapeId) return;

  const shape = shapes[shapeId];
  const originalText = originalTextRef.current;

  if (shape && originalText !== null && shape.text !== originalText) {
    pushEntry({
      type: 'UPDATE_TEXT',
      description: 'Edit Text',
      shapeDelta: {
        added: [],
        removed: [],
        modified: [{
          id: shapeId,
          before: { text: originalText },
          after: { text: shape.text },
        }],
      },
      connectionDelta: EMPTY_CONNECTION_DELTA,
      selectionBefore: [shapeId],
      selectionAfter: [shapeId],
    });
  }

  originalTextRef.current = null;
  setEditingTextShapeId(null);
};
```

---

## Step 5: Add History for Connection Creation

### Scope
Track connection creation with full state (styling, endpoints, everything).

### Files to Modify
- `src/hooks/useConnectionCreation.ts`

### Implementation
```typescript
// After connection is created
const completeConnection = useCallback((targetShapeId: string, targetAnchor: AnchorPosition) => {
  if (!connectionCreationState) return;

  const selectionBefore = [...selectedShapeIds];

  const connectionId = addConnection({
    sourceShapeId: connectionCreationState.sourceShapeId,
    sourceAnchor: connectionCreationState.sourceAnchor,
    targetShapeId,
    targetAnchor,
    // ... other properties
  });

  // Get the created connection with all its properties
  const createdConnection = useDiagramStore.getState().connections[connectionId];

  pushEntry({
    type: 'CREATE_CONNECTION',
    description: 'Create Connection',
    shapeDelta: EMPTY_SHAPE_DELTA,
    connectionDelta: {
      added: [createdConnection], // Full connection object
      removed: [],
      modified: [],
    },
    selectionBefore,
    selectionAfter: [], // Or [connectionId] if connections can be selected
  });

  endConnectionCreation();
}, [connectionCreationState, addConnection, pushEntry, endConnectionCreation]);
```

---

## Step 6: Add History for Alignment/Distribution

### Scope
Track alignment and distribution as single undo step (all affected shapes together).

### Files to Modify
- `src/stores/diagramStore.ts` (alignShapes, distributeShapes methods)
- OR create wrapper functions with history

### Implementation Option 1: Modify Store Methods
```typescript
// In diagramStore - add history-aware versions
alignShapesWithHistory: (alignment: AlignmentType) => {
  const state = get();
  const selectedIds = state.selectedShapeIds;
  if (selectedIds.length < 2) return;

  // Capture before state
  const beforePositions = selectedIds.map(id => ({
    id,
    before: { x: state.shapes[id].x, y: state.shapes[id].y },
  }));

  // Execute alignment
  state.alignShapes(alignment);

  // Capture after state
  const afterState = get();
  const modifications = beforePositions.map(({ id, before }) => ({
    id,
    before,
    after: { x: afterState.shapes[id].x, y: afterState.shapes[id].y },
  }));

  // Push history (need access to historyStore)
  useHistoryStore.getState().pushEntry({
    type: 'ALIGN',
    description: `Align ${alignment}`,
    shapeDelta: { added: [], removed: [], modified: modifications },
    connectionDelta: EMPTY_CONNECTION_DELTA,
    selectionBefore: selectedIds,
    selectionAfter: selectedIds,
  });
},
```

### Implementation Option 2: Wrapper Hook
```typescript
// hooks/useAlignmentWithHistory.ts
export function useAlignmentWithHistory() {
  const alignShapes = useDiagramStore((s) => s.alignShapes);
  const distributeShapes = useDiagramStore((s) => s.distributeShapes);
  const shapes = useDiagramStore((s) => s.shapes);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const pushEntry = useHistoryStore((s) => s.pushEntry);

  const alignWithHistory = useCallback((alignment: AlignmentType) => {
    // Capture before
    const before = selectedShapeIds.map(id => ({
      id,
      x: shapes[id].x,
      y: shapes[id].y,
    }));

    // Execute
    alignShapes(alignment);

    // Capture after and push history
    const afterShapes = useDiagramStore.getState().shapes;
    const modifications = before.map(({ id, x, y }) => ({
      id,
      before: { x, y },
      after: { x: afterShapes[id].x, y: afterShapes[id].y },
    }));

    pushEntry({
      type: 'ALIGN',
      description: `Align ${alignment}`,
      shapeDelta: { added: [], removed: [], modified: modifications },
      connectionDelta: EMPTY_CONNECTION_DELTA,
      selectionBefore: selectedShapeIds,
      selectionAfter: selectedShapeIds,
    });
  }, [alignShapes, shapes, selectedShapeIds, pushEntry]);

  // Similar for distributeWithHistory

  return { alignWithHistory, distributeWithHistory };
}
```

---

## Step 7: Add History for Z-Order Changes

### Scope
Track z-order changes (bring to front, send to back, etc.).

### Files to Modify
- `src/stores/diagramStore.ts` (z-order methods)
- OR `src/hooks/useKeyboardShortcuts.ts` and `src/hooks/useContextMenu.ts`

### Implementation
```typescript
// Wrap z-order operations
const bringToFrontWithHistory = useCallback(() => {
  const before = selectedShapeIds.map(id => ({
    id,
    zIndex: shapes[id].zIndex,
  }));

  bringToFront();

  const afterShapes = useDiagramStore.getState().shapes;
  const modifications = before.map(({ id, zIndex }) => ({
    id,
    before: { zIndex },
    after: { zIndex: afterShapes[id].zIndex },
  }));

  pushEntry({
    type: 'Z_ORDER',
    description: 'Bring to Front',
    shapeDelta: { added: [], removed: [], modified: modifications },
    connectionDelta: EMPTY_CONNECTION_DELTA,
    selectionBefore: selectedShapeIds,
    selectionAfter: selectedShapeIds,
  });
}, [selectedShapeIds, shapes, bringToFront, pushEntry]);
```

---

## Step 8: Create Menu Bar Component

### Files to Create
```
src/components/menu/
├── MenuBar.tsx           # Main menu bar container
├── Menu.tsx              # Individual dropdown menu
├── MenuItem.tsx          # Menu item with shortcut display
└── index.ts              # Exports
```

### MenuBar.tsx
```typescript
import React from 'react';
import { Menu } from './Menu';
import { useHistory } from '@/hooks/useHistory';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useDiagramStore } from '@/stores/diagramStore';
// ... other imports

export function MenuBar() {
  const { undo, redo, canUndo, canRedo, getUndoDescription, getRedoDescription } = useHistory();
  const showGrid = usePreferencesStore((s) => s.showGrid);
  const snapToGrid = usePreferencesStore((s) => s.snapToGrid);
  const toggleGrid = usePreferencesStore((s) => s.toggleGrid);
  const toggleSnapToGrid = usePreferencesStore((s) => s.toggleSnapToGrid);
  // ... other state

  const editMenuItems = [
    {
      label: canUndo() ? `Undo ${getUndoDescription()}` : 'Undo',
      shortcut: 'Ctrl+Z',
      action: undo,
      disabled: !canUndo(),
    },
    {
      label: canRedo() ? `Redo ${getRedoDescription()}` : 'Redo',
      shortcut: 'Ctrl+Y',
      action: redo,
      disabled: !canRedo(),
    },
    { separator: true },
    { label: 'Cut', shortcut: 'Ctrl+X', action: cutWithHistory, disabled: !hasSelection },
    { label: 'Copy', shortcut: 'Ctrl+C', action: copySelection, disabled: !hasSelection },
    { label: 'Paste', shortcut: 'Ctrl+V', action: pasteWithHistory, disabled: !clipboard },
    { label: 'Duplicate', shortcut: 'Ctrl+D', action: duplicateWithHistory, disabled: !hasSelection },
    { separator: true },
    { label: 'Delete', shortcut: 'Del', action: deleteWithHistory, disabled: !hasSelection },
    { label: 'Select All', shortcut: 'Ctrl+A', action: selectAll },
  ];

  const viewMenuItems = [
    { label: 'Show Grid', shortcut: 'Ctrl+G', action: toggleGrid, checked: showGrid },
    { label: 'Snap to Grid', shortcut: 'Ctrl+Shift+G', action: toggleSnapToGrid, checked: snapToGrid },
    { separator: true },
    { label: 'Zoom In', shortcut: 'Ctrl++', action: zoomIn },
    { label: 'Zoom Out', shortcut: 'Ctrl+-', action: zoomOut },
    { label: 'Zoom to 100%', shortcut: 'Ctrl+1', action: resetZoom },
    { label: 'Fit to Screen', shortcut: 'Ctrl+0', action: fitToScreen },
    { label: 'Reset View', shortcut: 'Ctrl+Shift+F', action: resetView },
  ];

  const arrangeMenuItems = [
    { label: 'Bring to Front', shortcut: 'Ctrl+Shift+]', action: bringToFrontWithHistory, disabled: !hasSelection },
    { label: 'Bring Forward', shortcut: 'Ctrl+]', action: bringForwardWithHistory, disabled: !hasSelection },
    { label: 'Send Backward', shortcut: 'Ctrl+[', action: sendBackwardWithHistory, disabled: !hasSelection },
    { label: 'Send to Back', shortcut: 'Ctrl+Shift+[', action: sendToBackWithHistory, disabled: !hasSelection },
    { separator: true },
    { label: 'Align Left', action: () => alignWithHistory('left'), disabled: !hasMultiSelection },
    { label: 'Align Center', action: () => alignWithHistory('centerHorizontal'), disabled: !hasMultiSelection },
    { label: 'Align Right', action: () => alignWithHistory('right'), disabled: !hasMultiSelection },
    { label: 'Align Top', action: () => alignWithHistory('top'), disabled: !hasMultiSelection },
    { label: 'Align Middle', action: () => alignWithHistory('centerVertical'), disabled: !hasMultiSelection },
    { label: 'Align Bottom', action: () => alignWithHistory('bottom'), disabled: !hasMultiSelection },
    { separator: true },
    { label: 'Distribute Horizontally', action: () => distributeWithHistory('horizontal'), disabled: selectedShapeIds.length < 3 },
    { label: 'Distribute Vertically', action: () => distributeWithHistory('vertical'), disabled: selectedShapeIds.length < 3 },
  ];

  return (
    <div className="h-8 bg-white border-b border-gray-200 flex items-center px-2 gap-1">
      <Menu label="Edit" items={editMenuItems} />
      <Menu label="View" items={viewMenuItems} />
      <Menu label="Arrange" items={arrangeMenuItems} />
    </div>
  );
}
```

### Menu.tsx
```typescript
import React, { useState, useRef, useEffect } from 'react';
import { MenuItem } from './MenuItem';

interface MenuProps {
  label: string;
  items: MenuItemType[];
}

export function Menu({ label, items }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        className={`px-3 py-1 text-sm rounded hover:bg-gray-100 ${isOpen ? 'bg-gray-100' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
          {items.map((item, index) => (
            <MenuItem
              key={item.separator ? `sep-${index}` : item.label}
              item={item}
              onClose={() => setIsOpen(false)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### MenuItem.tsx
```typescript
import React from 'react';

interface MenuItemProps {
  item: MenuItemType;
  onClose: () => void;
}

export function MenuItem({ item, onClose }: MenuItemProps) {
  if (item.separator) {
    return <div className="border-t border-gray-200 my-1" />;
  }

  const handleClick = () => {
    if (!item.disabled && item.action) {
      item.action();
      onClose();
    }
  };

  return (
    <button
      className={`
        w-full px-3 py-1.5 text-sm text-left flex items-center justify-between
        ${item.disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}
      `}
      onClick={handleClick}
      disabled={item.disabled}
    >
      <span className="flex items-center gap-2">
        {item.checked !== undefined && (
          <span className="w-4">{item.checked ? '✓' : ''}</span>
        )}
        {item.label}
      </span>
      {item.shortcut && (
        <span className="text-gray-400 text-xs ml-4">{item.shortcut}</span>
      )}
    </button>
  );
}
```

### Integration in App.tsx
```typescript
import { MenuBar } from '@/components/menu';

function App() {
  return (
    <div className="h-screen flex flex-col">
      <MenuBar />
      <div className="flex-1 flex">
        {/* ... rest of app */}
      </div>
    </div>
  );
}
```

---

## Types to Add/Update

### Menu Types
```typescript
// types/menu.ts
export interface MenuItemType {
  label?: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  checked?: boolean;
  separator?: boolean;
}
```

### History Types (if not already present)
Ensure ActionType includes all needed types:
```typescript
export type ActionType =
  | 'CREATE_SHAPE'
  | 'DELETE_SHAPES'
  | 'MOVE_SHAPES'
  | 'RESIZE_SHAPE'
  | 'ROTATE_SHAPE'
  | 'UPDATE_STYLE'
  | 'UPDATE_TEXT'
  | 'CREATE_CONNECTION'
  | 'DELETE_CONNECTIONS'
  | 'PASTE'
  | 'DUPLICATE'
  | 'ALIGN'
  | 'DISTRIBUTE'
  | 'Z_ORDER';
```

---

## Testing Checklist

### Bug Fixes
- [ ] Context menu: Cut works
- [ ] Context menu: Copy works
- [ ] Context menu: Paste works
- [ ] Context menu: Duplicate works
- [ ] Context menu: Delete works
- [ ] Context menu: Bring to Front works
- [ ] Context menu: Send to Back works
- [ ] Context menu: Align options work
- [ ] Context menu: Distribute options work
- [ ] Undo resize reverts shape size
- [ ] Undo rotation reverts shape angle

### History Tracking
- [ ] Undo fill color change
- [ ] Undo stroke color change
- [ ] Undo stroke width change
- [ ] Undo corner radius change
- [ ] Undo text edit
- [ ] Undo text style change (bold, italic, etc.)
- [ ] Undo connection creation
- [ ] Undo alignment (all shapes revert)
- [ ] Undo distribution (all shapes revert)
- [ ] Undo z-order change

### Menu Bar
- [ ] Edit menu opens/closes
- [ ] View menu opens/closes
- [ ] Arrange menu opens/closes
- [ ] Undo shows action description
- [ ] Undo disabled when nothing to undo
- [ ] Redo disabled when nothing to redo
- [ ] Grid toggle shows checkmark
- [ ] Snap toggle shows checkmark
- [ ] All shortcuts displayed correctly
- [ ] Menu closes on item click
- [ ] Menu closes on outside click
- [ ] Disabled items not clickable

---

## Files Summary

### New Files
```
src/components/menu/
├── MenuBar.tsx
├── Menu.tsx
├── MenuItem.tsx
└── index.ts

src/types/menu.ts (optional, can inline types)
src/hooks/useStyleChange.ts (optional helper)
src/hooks/useAlignmentWithHistory.ts (optional helper)
```

### Files to Modify
```
src/components/contextMenu/ContextMenu.tsx (fix click handling)
src/hooks/useContextMenu.ts (verify actions)
src/hooks/manipulation/useShapeResize.ts (fix history)
src/hooks/manipulation/useShapeRotate.ts (fix history)
src/hooks/useTextEditing.ts (add history)
src/hooks/useConnectionCreation.ts (add history)
src/components/panels/sections/FillSection.tsx (add history)
src/components/panels/sections/StrokeSection.tsx (add history)
src/components/panels/sections/CornerRadiusSection.tsx (add history)
src/components/panels/sections/TextSection.tsx (add history)
src/hooks/useKeyboardShortcuts.ts (add z-order history wrappers)
src/App.tsx (add MenuBar)
```
