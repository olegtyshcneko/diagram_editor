# Phase 7: History, Grid & Keyboard - Todo List

## Status: In Progress

## Tasks

### Step 1: History System Foundation
- [x] Create `src/types/history.ts` with type definitions
- [x] Create `src/stores/historyStore.ts` with Zustand store
- [x] Create `src/hooks/useHistory.ts` with operations wrapper

### Step 2: Integrate History with Operations
- [x] Modify manipulation hooks to emit history entries
- [x] Track shape creation in history
- [x] Track shape deletion in history
- [x] Track shape moves in history (end of drag)
- [x] Track shape resize in history
- [x] Track shape rotation in history
- [x] Track clipboard operations (paste, duplicate) in history
- [ ] Track style changes in history (deferred - requires property panel updates)
- [ ] Track text changes in history (deferred)
- [ ] Track connection creation/deletion in history (partial - delete tracked)
- [ ] Track alignment/distribution in history (deferred)

### Step 3: Grid System
- [x] Create `src/lib/geometry/snap.ts` with snap utility functions
- [x] Create `src/components/canvas/GridBackground.tsx` component
- [x] Update `Canvas.tsx` to integrate grid background
- [x] Add grid size preference to preferencesStore (default 20px)
- [x] Implement adaptive grid density at low zoom levels

### Step 4: Snap to Grid
- [x] Add snap logic to shape creation (`useShapeCreation.ts`)
- [x] Add snap logic to shape move (`useShapeMove.ts`)
- [x] Add snap logic to shape resize (`useShapeResize.ts`)
- [x] Implement Alt-key bypass for snap during operations
- [x] Update status bar with snap indicator

### Step 5: Keyboard Shortcuts (Extensions)
- [x] Add Ctrl+Z for undo
- [x] Add Ctrl+Y and Ctrl+Shift+Z for redo
- [x] Add Ctrl+G for grid toggle
- [x] Add Ctrl+Shift+G for snap toggle
- [x] Add Ctrl++ / Ctrl+= for zoom in
- [x] Add Ctrl+- for zoom out
- [x] Add Ctrl+0 for 100% zoom (already existed)
- [x] Add Ctrl+1 for 100% zoom (already existed)
- [x] Add Z-order shortcuts (Ctrl+], Ctrl+[, Ctrl+Shift+], Ctrl+Shift+[)

### Step 6: Z-Order Controls
- [x] Create `src/lib/geometry/zOrder.ts` with z-order utilities
- [x] Add `bringToFront` method to diagramStore
- [x] Add `bringForward` method to diagramStore
- [x] Add `sendBackward` method to diagramStore
- [x] Add `sendToBack` method to diagramStore
- [x] Ensure shape rendering respects zIndex order (already implemented)
- [ ] Track z-order changes in history (deferred)

### Step 7: Context Menus
- [x] Create `src/types/contextMenu.ts` with type definitions
- [x] Create `src/hooks/useContextMenu.ts` hook
- [x] Create `src/components/contextMenu/ContextMenu.tsx` component
- [x] Implement shape context menu (Cut, Copy, Paste, Duplicate, Delete, z-order)
- [x] Implement multi-selection context menu (includes align/distribute submenus)
- [x] Implement canvas context menu (Paste, Select All, undo/redo, grid toggle)
- [x] Implement connection context menu (Delete)
- [x] Hook context menu into Canvas and App

### Step 8: Menu Bar Integration
- [ ] Add Edit menu with Undo/Redo items (deferred - no menu bar component)
- [ ] Add View menu with Grid toggle, Snap toggle, zoom options
- [ ] Add Arrange menu with z-order options
- [ ] Show disabled state for Undo/Redo when unavailable
- [ ] Display action description in Undo menu item

### Step 9: Status Bar Updates
- [x] Display grid visibility indicator
- [x] Display snap-to-grid indicator
- [ ] Show undo/redo status or count (optional - not implemented)

### Step 10: Manual Verification
- [ ] Test undo/redo for shape creation
- [ ] Test undo/redo for shape deletion
- [ ] Test undo/redo for shape move
- [ ] Test undo/redo for shape resize
- [ ] Test undo/redo for style changes
- [ ] Test redo stack cleared by new action
- [ ] Test grid toggle with Ctrl+G
- [ ] Test grid persists after reload
- [ ] Test snap during move/resize/create
- [ ] Test Alt disables snap temporarily
- [ ] Test all tool shortcuts (V, R, E, C)
- [ ] Test all action shortcuts (Ctrl+C/V/X/D/A/Z/Y)
- [ ] Test all view shortcuts (Ctrl++/-/0/1/G)
- [ ] Test z-order shortcuts
- [ ] Test context menu on shape
- [ ] Test context menu on canvas
- [ ] Test context menu on multi-selection
- [ ] Test context menu closes on click outside

## Completed Summary
| Task | Status | Notes |
|------|--------|-------|
| History System Foundation | Done | Types, store, and hook created |
| History Integration (Core) | Partial | Shape create, move, paste, duplicate, delete work. Resize/rotate NOT working (KI-007) |
| Grid System | Done | GridBackground component with adaptive density |
| Snap to Grid | Done | Creation, move, resize with Alt bypass |
| Keyboard Shortcuts | Done | Undo/redo, zoom, grid, z-order shortcuts |
| Z-Order Controls | Done | All 4 z-order methods with keyboard shortcuts |
| Context Menus | Partial | Menus display correctly, but click actions NOT working (KI-006) |
| Status Bar Updates | Done | Grid and snap indicators |
| Menu Bar | Moved to P7.1 | Will be implemented in Phase 7.1 |
| History for styles/text/z-order | Moved to P7.1 | Will be implemented in Phase 7.1 |

## Known Issues (To be fixed in P7.1)
- **KI-006**: Context menu click actions not working
- **KI-007**: Resize and rotation not tracked in undo history
