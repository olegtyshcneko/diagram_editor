# Phase 7: History, Grid & Keyboard - Technical Specification

## Technical Architecture

### Component Hierarchy

```
App
├── MenuBar (updated with Edit menu items)
├── Toolbar
├── Canvas
│   ├── GridBackground (new)
│   ├── ShapeRenderer
│   ├── ConnectionRenderer
│   └── SelectionOverlay
├── ContextMenuProvider (new)
│   └── ContextMenu (new)
├── PropertyPanel
└── StatusBar (updated with grid/snap indicators)
```

### State Management Updates

```typescript
// useHistoryStore.ts - New store for undo/redo
interface HistoryStore {
  past: HistoryEntry[];
  future: HistoryEntry[];
  maxSize: number;

  // Actions
  execute: (entry: HistoryEntry) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getLastActionDescription: () => string | null;
  clear: () => void;
}

// useUIStore.ts - Extended with grid/snap settings
interface UIStore {
  // Existing
  activeTool: ToolType;
  zoom: number;
  panOffset: Point;

  // New in P7
  gridVisible: boolean;
  gridSize: number;
  snapToGrid: boolean;

  // Actions
  setGridVisible: (visible: boolean) => void;
  setGridSize: (size: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
}

// useDiagramStore.ts - Extended with z-order
interface DiagramStore {
  shapes: Record<string, Shape>;
  connections: Record<string, Connection>;

  // New z-order actions
  bringToFront: (shapeIds: string[]) => void;
  bringForward: (shapeIds: string[]) => void;
  sendBackward: (shapeIds: string[]) => void;
  sendToBack: (shapeIds: string[]) => void;
}
```

---

## Files to Create

### New Files

```
src/
├── stores/
│   └── historyStore.ts           # Undo/redo state management
├── hooks/
│   ├── useHistory.ts             # History operations hook
│   ├── useKeyboardShortcuts.ts   # Central shortcut handler
│   └── useContextMenu.ts         # Context menu state hook
├── components/
│   ├── canvas/
│   │   └── GridBackground.tsx    # Grid pattern renderer
│   ├── contextMenu/
│   │   ├── ContextMenuProvider.tsx
│   │   ├── ContextMenu.tsx
│   │   └── ContextMenuItem.tsx
│   └── ui/
│       └── Dropdown.tsx          # For context menu (if not using shadcn)
├── utils/
│   ├── snapUtils.ts              # Snap-to-grid calculations
│   └── zOrderUtils.ts            # Z-order calculations
└── types/
    └── history.ts                # History-related types
```

### Files to Modify

```
src/
├── stores/
│   ├── uiStore.ts                # Add grid/snap state
│   └── diagramStore.ts           # Add z-order methods, history integration
├── components/
│   ├── MenuBar.tsx               # Add Edit, Arrange menus
│   ├── StatusBar.tsx             # Add grid/snap indicators
│   └── canvas/
│       └── Canvas.tsx            # Integrate grid, keyboard events
├── hooks/
│   ├── useShapeManipulation.ts   # Add history tracking, snap
│   ├── useShapeCreation.ts       # Add history tracking, snap
│   └── useClipboard.ts           # Add history tracking
└── App.tsx                       # Add ContextMenuProvider, keyboard listener
```

---

## Key Interfaces & Types

### History Types

```typescript
// types/history.ts

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

export interface HistoryEntry {
  id: string;
  type: ActionType;
  description: string;
  timestamp: number;

  // Snapshot data for undo/redo
  before: HistorySnapshot;
  after: HistorySnapshot;
}

export interface HistorySnapshot {
  shapes?: Record<string, Shape>;
  connections?: Record<string, Connection>;
  selectedIds?: string[];
}

// Optimized: Only store affected items
export interface DeltaHistoryEntry {
  id: string;
  type: ActionType;
  description: string;
  timestamp: number;

  // Only affected items
  shapeDelta: {
    added: Shape[];
    removed: Shape[];
    modified: Array<{ id: string; before: Partial<Shape>; after: Partial<Shape> }>;
  };
  connectionDelta: {
    added: Connection[];
    removed: Connection[];
    modified: Array<{ id: string; before: Partial<Connection>; after: Partial<Connection> }>;
  };
  selectionBefore: string[];
  selectionAfter: string[];
}
```

### Context Menu Types

```typescript
// types/contextMenu.ts

export type ContextMenuTarget = 'canvas' | 'shape' | 'connection' | 'selection';

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  separator?: boolean;
  submenu?: ContextMenuItem[];
}

export interface ContextMenuState {
  isOpen: boolean;
  position: ContextMenuPosition;
  target: ContextMenuTarget;
  targetId?: string;
}
```

### Grid/Snap Types

```typescript
// types/grid.ts

export interface GridSettings {
  visible: boolean;
  size: number;      // Grid spacing in pixels
  style: 'dot' | 'line' | 'cross';
  color: string;
  opacity: number;
}

export interface SnapSettings {
  enabled: boolean;
  gridSnap: boolean;
  shapeSnap: boolean;  // Future: snap to other shapes
  threshold: number;   // Snap distance threshold
}
```

---

## Implementation Order

### Step 1: History System Foundation

1. Create `types/history.ts` with type definitions
2. Create `stores/historyStore.ts` with Zustand store
3. Create `hooks/useHistory.ts` with operations

### Step 2: Integrate History with Operations

4. Modify `diagramStore.ts` to emit history entries
5. Update `useShapeCreation.ts` to track creates
6. Update `useShapeManipulation.ts` to track moves/resizes
7. Update `useClipboard.ts` to track paste/duplicate

### Step 3: Grid System

8. Create `utils/snapUtils.ts`
9. Create `components/canvas/GridBackground.tsx`
10. Update `uiStore.ts` with grid settings
11. Integrate grid into `Canvas.tsx`

### Step 4: Snap to Grid

12. Add snap logic to `useShapeCreation.ts`
13. Add snap logic to `useShapeManipulation.ts`
14. Add Alt-key bypass for snap

### Step 5: Keyboard Shortcuts

15. Create `hooks/useKeyboardShortcuts.ts`
16. Integrate into `App.tsx`
17. Ensure no conflicts with text editing

### Step 6: Context Menus

18. Create context menu components
19. Create `hooks/useContextMenu.ts`
20. Add `ContextMenuProvider` to App
21. Implement menu items for each target

### Step 7: Z-Order

22. Create `utils/zOrderUtils.ts`
23. Add z-order methods to `diagramStore.ts`
24. Update shape rendering order
25. Add menu items and shortcuts

### Step 8: Menu Integration

26. Add Undo/Redo to Edit menu
27. Add View menu items (Grid, Snap)
28. Add Arrange menu (Z-order, Align, Distribute)
29. Update StatusBar with indicators

---

## Code Patterns

### History Store Implementation

```typescript
// stores/historyStore.ts
import { create } from 'zustand';
import { DeltaHistoryEntry } from '../types/history';
import { nanoid } from 'nanoid';

interface HistoryStore {
  past: DeltaHistoryEntry[];
  future: DeltaHistoryEntry[];
  maxSize: number;

  execute: (entry: Omit<DeltaHistoryEntry, 'id' | 'timestamp'>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getLastActionDescription: () => string | null;
  clear: () => void;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],
  maxSize: 50,

  execute: (entryData) => {
    const entry: DeltaHistoryEntry = {
      ...entryData,
      id: nanoid(),
      timestamp: Date.now(),
    };

    set((state) => {
      const newPast = [...state.past, entry];
      // Trim to max size
      if (newPast.length > state.maxSize) {
        newPast.shift();
      }
      return {
        past: newPast,
        future: [], // Clear redo stack on new action
      };
    });
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;

    const entry = past[past.length - 1];

    // Apply undo by reverting the delta
    applyUndoDelta(entry);

    set({
      past: past.slice(0, -1),
      future: [entry, ...future],
    });
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return;

    const entry = future[0];

    // Apply redo by re-applying the delta
    applyRedoDelta(entry);

    set({
      past: [...past, entry],
      future: future.slice(1),
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  getLastActionDescription: () => {
    const { past } = get();
    return past.length > 0 ? past[past.length - 1].description : null;
  },

  clear: () => set({ past: [], future: [] }),
}));

// Helper functions to apply deltas
function applyUndoDelta(entry: DeltaHistoryEntry): void {
  const { useDiagramStore } = require('./diagramStore');
  const { useSelectionStore } = require('./selectionStore');

  // Restore removed shapes
  entry.shapeDelta.removed.forEach((shape) => {
    useDiagramStore.getState().addShape(shape);
  });

  // Remove added shapes
  entry.shapeDelta.added.forEach((shape) => {
    useDiagramStore.getState().removeShape(shape.id);
  });

  // Revert modified shapes
  entry.shapeDelta.modified.forEach(({ id, before }) => {
    useDiagramStore.getState().updateShape(id, before);
  });

  // Same for connections...

  // Restore selection
  useSelectionStore.getState().setSelection(entry.selectionBefore);
}

function applyRedoDelta(entry: DeltaHistoryEntry): void {
  // Opposite of undo...
}
```

### Grid Background Component

```typescript
// components/canvas/GridBackground.tsx
import React, { useMemo } from 'react';
import { useUIStore } from '../../stores/uiStore';

interface GridBackgroundProps {
  viewBox: { x: number; y: number; width: number; height: number };
}

export const GridBackground: React.FC<GridBackgroundProps> = ({ viewBox }) => {
  const { gridVisible, gridSize } = useUIStore();

  const patternId = useMemo(() => `dotGrid-${gridSize}`, [gridSize]);

  if (!gridVisible) return null;

  return (
    <>
      <defs>
        <pattern
          id={patternId}
          x={0}
          y={0}
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          {/* Dot grid pattern */}
          <circle
            cx={gridSize / 2}
            cy={gridSize / 2}
            r={1}
            fill="#e0e0e0"
          />
        </pattern>
      </defs>
      <rect
        x={viewBox.x}
        y={viewBox.y}
        width={viewBox.width}
        height={viewBox.height}
        fill={`url(#${patternId})`}
        pointerEvents="none"
      />
    </>
  );
};
```

### Snap Utilities

```typescript
// utils/snapUtils.ts

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

export function snapPointToGrid(
  point: Point,
  gridSize: number,
  enabled: boolean = true
): Point {
  if (!enabled) return point;

  return {
    x: snapToGrid(point.x, gridSize),
    y: snapToGrid(point.y, gridSize),
  };
}

export function snapBoundsToGrid(
  bounds: Bounds,
  gridSize: number,
  handle?: HandleType
): Bounds {
  // Snap based on which handle is being dragged
  const snapped = { ...bounds };

  switch (handle) {
    case 'nw':
      snapped.x = snapToGrid(bounds.x, gridSize);
      snapped.y = snapToGrid(bounds.y, gridSize);
      break;
    case 'ne':
      snapped.x = snapToGrid(bounds.x + bounds.width, gridSize) - bounds.width;
      snapped.y = snapToGrid(bounds.y, gridSize);
      break;
    // ... other handles
    default:
      // Snap position only (for moves)
      snapped.x = snapToGrid(bounds.x, gridSize);
      snapped.y = snapToGrid(bounds.y, gridSize);
  }

  return snapped;
}

// Calculate snapped position while maintaining size
export function snapShapePosition(
  shape: Shape,
  newPosition: Point,
  gridSize: number,
  enabled: boolean
): Point {
  if (!enabled) return newPosition;

  return snapPointToGrid(newPosition, gridSize);
}
```

### Keyboard Shortcuts Hook

```typescript
// hooks/useKeyboardShortcuts.ts
import { useEffect, useCallback } from 'react';
import { useUIStore } from '../stores/uiStore';
import { useHistoryStore } from '../stores/historyStore';
import { useSelectionStore } from '../stores/selectionStore';
import { useDiagramStore } from '../stores/diagramStore';
import { useClipboard } from './useClipboard';

interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description: string;
  allowInTextEdit?: boolean;
}

export function useKeyboardShortcuts() {
  const { setActiveTool, toggleGrid, toggleSnap, zoomIn, zoomOut, resetZoom, fitToScreen } = useUIStore();
  const { undo, redo, canUndo, canRedo } = useHistoryStore();
  const { selectAll, deleteSelected, selectedIds } = useSelectionStore();
  const { bringToFront, bringForward, sendBackward, sendToBack } = useDiagramStore();
  const { copy, paste, cut, duplicate } = useClipboard();

  const shortcuts: ShortcutHandler[] = [
    // Tools
    { key: 'v', handler: () => setActiveTool('select'), description: 'Select tool' },
    { key: 'r', handler: () => setActiveTool('rectangle'), description: 'Rectangle tool' },
    { key: 'e', handler: () => setActiveTool('ellipse'), description: 'Ellipse tool' },
    { key: 'l', handler: () => setActiveTool('line'), description: 'Line tool' },
    { key: 't', handler: () => setActiveTool('text'), description: 'Text tool' },
    { key: 'c', handler: () => setActiveTool('connection'), description: 'Connection tool' },
    { key: 'Escape', handler: () => setActiveTool('select'), description: 'Cancel/Select' },

    // Edit actions
    { key: 'z', ctrl: true, handler: undo, description: 'Undo' },
    { key: 'y', ctrl: true, handler: redo, description: 'Redo' },
    { key: 'z', ctrl: true, shift: true, handler: redo, description: 'Redo' },
    { key: 'c', ctrl: true, handler: copy, description: 'Copy' },
    { key: 'v', ctrl: true, handler: paste, description: 'Paste' },
    { key: 'x', ctrl: true, handler: cut, description: 'Cut' },
    { key: 'd', ctrl: true, handler: duplicate, description: 'Duplicate' },
    { key: 'a', ctrl: true, handler: selectAll, description: 'Select All' },
    { key: 'Delete', handler: deleteSelected, description: 'Delete' },
    { key: 'Backspace', handler: deleteSelected, description: 'Delete' },

    // View
    { key: '=', ctrl: true, handler: zoomIn, description: 'Zoom In' },
    { key: '+', ctrl: true, handler: zoomIn, description: 'Zoom In' },
    { key: '-', ctrl: true, handler: zoomOut, description: 'Zoom Out' },
    { key: '0', ctrl: true, handler: fitToScreen, description: 'Fit to Screen' },
    { key: '1', ctrl: true, handler: resetZoom, description: 'Actual Size' },
    { key: 'g', ctrl: true, handler: toggleGrid, description: 'Toggle Grid' },
    { key: 'g', ctrl: true, shift: true, handler: toggleSnap, description: 'Toggle Snap' },

    // Z-Order
    { key: ']', ctrl: true, shift: true, handler: () => bringToFront(selectedIds), description: 'Bring to Front' },
    { key: ']', ctrl: true, handler: () => bringForward(selectedIds), description: 'Bring Forward' },
    { key: '[', ctrl: true, handler: () => sendBackward(selectedIds), description: 'Send Backward' },
    { key: '[', ctrl: true, shift: true, handler: () => sendToBack(selectedIds), description: 'Send to Back' },
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if we're in a text input
    const target = event.target as HTMLElement;
    const isTextEditing =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    // Find matching shortcut
    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        // Skip non-text-edit shortcuts when editing text
        if (isTextEditing && !shortcut.allowInTextEdit) {
          // Allow Ctrl+C/V/X/A/Z in text fields (browser handles them)
          if (shortcut.ctrl && ['c', 'v', 'x', 'a', 'z'].includes(shortcut.key)) {
            return; // Let browser handle it
          }
          continue;
        }

        event.preventDefault();
        event.stopPropagation();
        shortcut.handler();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
}
```

### Context Menu Component

```typescript
// components/contextMenu/ContextMenu.tsx
import React from 'react';
import { useContextMenu } from '../../hooks/useContextMenu';
import { ContextMenuItem } from './ContextMenuItem';

export const ContextMenu: React.FC = () => {
  const { state, menuItems, close } = useContextMenu();

  if (!state.isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={close}
        onContextMenu={(e) => {
          e.preventDefault();
          close();
        }}
      />

      {/* Menu */}
      <div
        className="fixed z-50 min-w-48 bg-white rounded-md shadow-lg border py-1"
        style={{
          left: state.position.x,
          top: state.position.y,
        }}
      >
        {menuItems.map((item, index) => (
          <ContextMenuItem
            key={item.id}
            item={item}
            onClose={close}
          />
        ))}
      </div>
    </>
  );
};

// ContextMenuItem.tsx
export const ContextMenuItem: React.FC<{
  item: ContextMenuItemType;
  onClose: () => void;
}> = ({ item, onClose }) => {
  if (item.separator) {
    return <div className="border-t my-1" />;
  }

  const handleClick = () => {
    if (!item.disabled) {
      item.onClick();
      onClose();
    }
  };

  return (
    <button
      className={`
        w-full px-3 py-1.5 text-left text-sm
        flex items-center justify-between
        ${item.disabled
          ? 'text-gray-400 cursor-not-allowed'
          : 'hover:bg-gray-100'
        }
      `}
      onClick={handleClick}
      disabled={item.disabled}
    >
      <span>{item.label}</span>
      {item.shortcut && (
        <span className="text-gray-400 text-xs ml-4">{item.shortcut}</span>
      )}
    </button>
  );
};
```

### Z-Order Utilities

```typescript
// utils/zOrderUtils.ts
import { Shape } from '../types/shape';

/**
 * Get shapes sorted by z-index
 */
export function getShapesByZOrder(shapes: Shape[]): Shape[] {
  return [...shapes].sort((a, b) => a.zIndex - b.zIndex);
}

/**
 * Calculate new z-index for bringing shape to front
 */
export function calculateBringToFront(
  shapes: Shape[],
  targetIds: string[]
): Map<string, number> {
  const updates = new Map<string, number>();
  const maxZ = Math.max(...shapes.map(s => s.zIndex), 0);

  // Sort target shapes by their current z-order
  const targetShapes = shapes
    .filter(s => targetIds.includes(s.id))
    .sort((a, b) => a.zIndex - b.zIndex);

  // Assign new z-indices starting from maxZ + 1
  targetShapes.forEach((shape, index) => {
    updates.set(shape.id, maxZ + 1 + index);
  });

  return updates;
}

/**
 * Calculate new z-index for sending shape to back
 */
export function calculateSendToBack(
  shapes: Shape[],
  targetIds: string[]
): Map<string, number> {
  const updates = new Map<string, number>();
  const minZ = Math.min(...shapes.map(s => s.zIndex), 0);

  const targetShapes = shapes
    .filter(s => targetIds.includes(s.id))
    .sort((a, b) => a.zIndex - b.zIndex);

  targetShapes.forEach((shape, index) => {
    updates.set(shape.id, minZ - targetShapes.length + index);
  });

  return updates;
}

/**
 * Bring shapes forward by one level
 */
export function calculateBringForward(
  shapes: Shape[],
  targetIds: string[]
): Map<string, number> {
  const updates = new Map<string, number>();
  const sorted = getShapesByZOrder(shapes);

  // Process each target shape
  targetIds.forEach(targetId => {
    const targetIndex = sorted.findIndex(s => s.id === targetId);
    if (targetIndex === -1 || targetIndex === sorted.length - 1) return;

    // Find next non-selected shape to swap with
    for (let i = targetIndex + 1; i < sorted.length; i++) {
      if (!targetIds.includes(sorted[i].id)) {
        // Swap z-indices
        const targetZ = sorted[targetIndex].zIndex;
        const swapZ = sorted[i].zIndex;
        updates.set(targetId, swapZ);
        updates.set(sorted[i].id, targetZ);
        break;
      }
    }
  });

  return updates;
}

/**
 * Send shapes backward by one level
 */
export function calculateSendBackward(
  shapes: Shape[],
  targetIds: string[]
): Map<string, number> {
  const updates = new Map<string, number>();
  const sorted = getShapesByZOrder(shapes);

  targetIds.forEach(targetId => {
    const targetIndex = sorted.findIndex(s => s.id === targetId);
    if (targetIndex === -1 || targetIndex === 0) return;

    for (let i = targetIndex - 1; i >= 0; i--) {
      if (!targetIds.includes(sorted[i].id)) {
        const targetZ = sorted[targetIndex].zIndex;
        const swapZ = sorted[i].zIndex;
        updates.set(targetId, swapZ);
        updates.set(sorted[i].id, targetZ);
        break;
      }
    }
  });

  return updates;
}
```

### History-Aware Operation Wrapper

```typescript
// hooks/useHistoryAwareOperations.ts
import { useCallback } from 'react';
import { useHistoryStore } from '../stores/historyStore';
import { useDiagramStore } from '../stores/diagramStore';
import { useSelectionStore } from '../stores/selectionStore';
import { Shape } from '../types/shape';

export function useHistoryAwareOperations() {
  const { execute } = useHistoryStore();
  const { shapes, addShape, removeShape, updateShape } = useDiagramStore();
  const { selectedIds, setSelection } = useSelectionStore();

  const createShapeWithHistory = useCallback((shape: Shape) => {
    // Capture state before
    const selectionBefore = [...selectedIds];

    // Execute operation
    addShape(shape);
    setSelection([shape.id]);

    // Record in history
    execute({
      type: 'CREATE_SHAPE',
      description: `Create ${shape.type}`,
      shapeDelta: {
        added: [shape],
        removed: [],
        modified: [],
      },
      connectionDelta: {
        added: [],
        removed: [],
        modified: [],
      },
      selectionBefore,
      selectionAfter: [shape.id],
    });
  }, [addShape, execute, selectedIds, setSelection]);

  const deleteShapesWithHistory = useCallback((ids: string[]) => {
    const selectionBefore = [...selectedIds];
    const deletedShapes = ids.map(id => shapes[id]).filter(Boolean);

    // Execute operation
    ids.forEach(id => removeShape(id));
    setSelection([]);

    // Record in history
    execute({
      type: 'DELETE_SHAPES',
      description: `Delete ${ids.length} shape(s)`,
      shapeDelta: {
        added: [],
        removed: deletedShapes,
        modified: [],
      },
      connectionDelta: {
        added: [],
        removed: [], // TODO: include deleted connections
        modified: [],
      },
      selectionBefore,
      selectionAfter: [],
    });
  }, [execute, removeShape, selectedIds, setSelection, shapes]);

  const moveShapesWithHistory = useCallback((
    ids: string[],
    delta: Point
  ) => {
    const selectionBefore = [...selectedIds];
    const modifications = ids.map(id => ({
      id,
      before: { x: shapes[id].x, y: shapes[id].y },
      after: { x: shapes[id].x + delta.x, y: shapes[id].y + delta.y },
    }));

    // Execute operation
    ids.forEach(id => {
      updateShape(id, {
        x: shapes[id].x + delta.x,
        y: shapes[id].y + delta.y,
      });
    });

    // Record in history
    execute({
      type: 'MOVE_SHAPES',
      description: `Move ${ids.length} shape(s)`,
      shapeDelta: {
        added: [],
        removed: [],
        modified: modifications,
      },
      connectionDelta: {
        added: [],
        removed: [],
        modified: [],
      },
      selectionBefore,
      selectionAfter: selectionBefore,
    });
  }, [execute, selectedIds, shapes, updateShape]);

  return {
    createShapeWithHistory,
    deleteShapesWithHistory,
    moveShapesWithHistory,
    // ... other operations
  };
}
```

---

## Key Decisions

### Decision 1: Delta-based History vs Full Snapshots

**Options:**
1. Store full diagram snapshots for each history entry
2. Store only the delta (changes) for each entry

**Decision:** Delta-based storage

**Rationale:**
- Memory efficient - only stores what changed
- Faster undo/redo for small operations
- Allows for larger history stacks
- Trade-off: More complex implementation

### Decision 2: History Granularity

**Options:**
1. Record every mouse movement during drag
2. Record only completed operations
3. Debounced recording during drag

**Decision:** Record completed operations only

**Rationale:**
- Intuitive for users (one undo = one logical operation)
- Memory efficient
- Matches user expectations from other apps

### Decision 3: Grid Pattern Implementation

**Options:**
1. SVG pattern element (declarative)
2. Canvas 2D rendering
3. CSS background pattern

**Decision:** SVG pattern element

**Rationale:**
- Scales automatically with viewBox
- GPU accelerated
- Consistent with SVG-based canvas
- Easy to customize

### Decision 4: Keyboard Event Handling

**Options:**
1. Global window listener
2. Canvas-focused listener
3. React event propagation

**Decision:** Global window listener with intelligent filtering

**Rationale:**
- Works regardless of focus state
- Can filter out text editing contexts
- Consistent behavior across the app
- Allows shortcuts when canvas isn't focused

### Decision 5: Context Menu Implementation

**Options:**
1. Browser native context menu
2. Custom React component
3. shadcn/ui dropdown menu

**Decision:** Custom React component (with optional shadcn integration)

**Rationale:**
- Full control over styling
- Consistent with app design
- Can show keyboard shortcuts
- Supports submenus

---

## Testing Approach

### Unit Tests

```typescript
// __tests__/historyStore.test.ts
describe('historyStore', () => {
  beforeEach(() => {
    useHistoryStore.getState().clear();
  });

  it('should execute and add to history', () => {
    const entry = createMockHistoryEntry();
    useHistoryStore.getState().execute(entry);

    expect(useHistoryStore.getState().past).toHaveLength(1);
    expect(useHistoryStore.getState().canUndo()).toBe(true);
  });

  it('should undo last action', () => {
    // Create shape
    createShapeWithHistory(mockShape);
    expect(useDiagramStore.getState().shapes).toHaveProperty(mockShape.id);

    // Undo
    useHistoryStore.getState().undo();
    expect(useDiagramStore.getState().shapes).not.toHaveProperty(mockShape.id);
  });

  it('should clear redo stack on new action', () => {
    createShapeWithHistory(mockShape1);
    useHistoryStore.getState().undo();
    expect(useHistoryStore.getState().canRedo()).toBe(true);

    createShapeWithHistory(mockShape2);
    expect(useHistoryStore.getState().canRedo()).toBe(false);
  });

  it('should respect max history size', () => {
    for (let i = 0; i < 60; i++) {
      createShapeWithHistory({ ...mockShape, id: `shape-${i}` });
    }

    expect(useHistoryStore.getState().past.length).toBeLessThanOrEqual(50);
  });
});

// __tests__/snapUtils.test.ts
describe('snapUtils', () => {
  it('should snap value to grid', () => {
    expect(snapToGrid(23, 20)).toBe(20);
    expect(snapToGrid(33, 20)).toBe(40);
    expect(snapToGrid(30, 20)).toBe(40);
  });

  it('should snap point to grid', () => {
    const result = snapPointToGrid({ x: 23, y: 47 }, 20);
    expect(result).toEqual({ x: 20, y: 40 });
  });

  it('should not snap when disabled', () => {
    const result = snapPointToGrid({ x: 23, y: 47 }, 20, false);
    expect(result).toEqual({ x: 23, y: 47 });
  });
});

// __tests__/zOrderUtils.test.ts
describe('zOrderUtils', () => {
  const mockShapes: Shape[] = [
    { id: 'a', zIndex: 0 },
    { id: 'b', zIndex: 1 },
    { id: 'c', zIndex: 2 },
  ];

  it('should bring shape to front', () => {
    const updates = calculateBringToFront(mockShapes, ['a']);
    expect(updates.get('a')).toBe(3);
  });

  it('should send shape to back', () => {
    const updates = calculateSendToBack(mockShapes, ['c']);
    expect(updates.get('c')).toBe(-1);
  });
});
```

### E2E Tests

```typescript
// e2e/history.spec.ts
describe('History', () => {
  it('should undo shape creation', () => {
    cy.get('[data-tool="rectangle"]').click();
    cy.get('[data-testid="canvas"]').click(200, 200);

    cy.get('[data-testid="shape"]').should('have.length', 1);

    cy.get('body').type('{ctrl}z');

    cy.get('[data-testid="shape"]').should('have.length', 0);
  });

  it('should redo after undo', () => {
    cy.get('[data-tool="rectangle"]').click();
    cy.get('[data-testid="canvas"]').click(200, 200);
    cy.get('body').type('{ctrl}z');
    cy.get('body').type('{ctrl}y');

    cy.get('[data-testid="shape"]').should('have.length', 1);
  });
});

// e2e/grid.spec.ts
describe('Grid', () => {
  it('should toggle grid visibility', () => {
    cy.get('[data-testid="grid"]').should('exist');
    cy.get('body').type('{ctrl}g');
    cy.get('[data-testid="grid"]').should('not.exist');
    cy.get('body').type('{ctrl}g');
    cy.get('[data-testid="grid"]').should('exist');
  });

  it('should snap shapes to grid', () => {
    cy.get('[data-tool="rectangle"]').click();
    cy.get('[data-testid="canvas"]')
      .trigger('mousedown', 103, 107)
      .trigger('mouseup');

    // Should snap to nearest grid intersection
    cy.get('[data-testid="shape"]')
      .should('have.attr', 'x', '100')
      .should('have.attr', 'y', '100');
  });
});

// e2e/contextMenu.spec.ts
describe('Context Menu', () => {
  it('should show shape context menu', () => {
    createShape();
    cy.get('[data-testid="shape"]').rightclick();

    cy.get('[data-testid="context-menu"]').should('be.visible');
    cy.get('[data-testid="context-menu"]').contains('Delete');
    cy.get('[data-testid="context-menu"]').contains('Duplicate');
  });

  it('should delete shape from context menu', () => {
    createShape();
    cy.get('[data-testid="shape"]').rightclick();
    cy.get('[data-testid="context-menu"]').contains('Delete').click();

    cy.get('[data-testid="shape"]').should('not.exist');
  });
});
```

---

## Performance Considerations

### History Memory Management

```typescript
// Efficient delta storage
interface CompactDelta {
  // Use typed arrays for position data
  positions: Float32Array;
  // Store only changed properties
  styleChanges: Map<string, Partial<Style>>;
}

// Memory estimation
function estimateHistoryMemory(entries: DeltaHistoryEntry[]): number {
  // Rough estimate: ~1KB per simple operation, ~10KB for complex
  return entries.reduce((sum, entry) => {
    const shapeBytes =
      entry.shapeDelta.added.length * 500 +
      entry.shapeDelta.removed.length * 500 +
      entry.shapeDelta.modified.length * 200;
    return sum + shapeBytes + 100; // Base overhead
  }, 0);
}
```

### Grid Rendering Optimization

```typescript
// Adaptive grid density
function calculateGridDensity(zoom: number, baseSize: number): number {
  // Reduce density at low zoom levels
  if (zoom < 0.25) return baseSize * 4;
  if (zoom < 0.5) return baseSize * 2;
  return baseSize;
}

// Only render visible portion
function getVisibleGridBounds(viewBox: ViewBox, gridSize: number): GridBounds {
  return {
    startX: Math.floor(viewBox.x / gridSize) * gridSize,
    startY: Math.floor(viewBox.y / gridSize) * gridSize,
    endX: Math.ceil((viewBox.x + viewBox.width) / gridSize) * gridSize,
    endY: Math.ceil((viewBox.y + viewBox.height) / gridSize) * gridSize,
  };
}
```

### Keyboard Event Debouncing

```typescript
// Debounce rapid key presses
const DEBOUNCE_MS = 50;

function useThrottledShortcuts() {
  const lastExecution = useRef<Map<string, number>>(new Map());

  const throttledHandler = useCallback((shortcut: string, handler: () => void) => {
    const now = Date.now();
    const last = lastExecution.current.get(shortcut) || 0;

    if (now - last >= DEBOUNCE_MS) {
      lastExecution.current.set(shortcut, now);
      handler();
    }
  }, []);

  return throttledHandler;
}
```

---

## Accessibility Requirements

### Keyboard Navigation

- All shortcuts documented and discoverable
- Focus management when context menu opens/closes
- Arrow keys work for menu navigation
- Escape closes context menu

### Screen Reader Support

```tsx
// Context menu with ARIA
<div
  role="menu"
  aria-label="Context menu"
  aria-expanded={isOpen}
>
  <button
    role="menuitem"
    aria-disabled={item.disabled}
  >
    {item.label}
  </button>
</div>

// Status announcements
<div
  role="status"
  aria-live="polite"
  className="sr-only"
>
  {lastAction && `${lastAction} completed`}
</div>
```

### Visual Indicators

- Clear active tool indication
- Grid visibility clearly shown
- Snap status in status bar
- Context menu has visible focus states

---

## Migration Notes

### From Phase 6

1. Wrap existing operations with history tracking
2. Add grid component to Canvas
3. Integrate keyboard shortcuts (some may already exist)
4. Add z-index property to Shape type if not present

### State Migration

```typescript
// If shapes don't have zIndex, add during load
function migrateShapes(shapes: Record<string, Shape>): Record<string, Shape> {
  const entries = Object.entries(shapes);
  return Object.fromEntries(
    entries.map(([id, shape], index) => [
      id,
      { ...shape, zIndex: shape.zIndex ?? index }
    ])
  );
}
```
