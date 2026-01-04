# Phase 7.1: P7 Bug Fixes & Completion - Todo List

## Status: Completed

## Part 1: Bug Fixes

### KI-006: Context Menu Click Actions
- [x] Add event stoppers to ContextMenu.tsx container div
- [x] Test context menu on shapes - Cut, Copy, Paste, Delete
- [x] Test context menu z-order options
- [x] Test context menu alignment options (multi-selection)

### KI-007: Resize/Rotation History
- [x] Debug handleResizeEnd - verify it's being called
- [x] Debug handleRotateEnd - verify it's being called
- [x] Fix the root cause (multiple React instances - use global store as single source of truth)
- [x] Test undo/redo for resize
- [x] Test undo/redo for rotation

---

## Part 2: History Integration

### Style Changes
- [x] FillSection.tsx - add history tracking
- [x] StrokeSection.tsx - add history tracking
- [x] CornerRadiusSection.tsx - add history tracking
- [x] Test undo for fill color changes
- [x] Test undo for stroke changes
- [x] Test undo for corner radius changes

### Text Changes
- [x] Add originalTextRef to capture text at edit start
- [x] Push history entry when editing ends
- [x] Test undo for text edits

### Connection Creation
- [x] Add history tracking to useConnectionCreation.ts
- [x] Test undo for connection creation

### Alignment/Distribution
- [x] Create history wrappers for alignment functions
- [x] Create history wrappers for distribution functions
- [x] Test undo for alignment (all shapes revert)
- [x] Test undo for distribution

### Z-Order Changes
- [x] Add history tracking for bringToFront
- [x] Add history tracking for sendToBack
- [x] Add history tracking for bringForward
- [x] Add history tracking for sendBackward
- [x] Test undo for z-order changes

---

## Part 3: Menu Bar

### Components
- [x] Create src/components/menu/MenuItem.tsx
- [x] Create src/components/menu/Menu.tsx
- [x] Create src/components/menu/MenuBar.tsx
- [x] Create src/components/menu/index.ts
- [x] Integrate MenuBar in AppShell.tsx

### Features
- [x] Edit menu with Undo/Redo (shows action description)
- [x] Edit menu: Cut, Copy, Paste, Duplicate, Delete, Select All
- [x] View menu: Grid toggle, Snap toggle with checkmarks
- [x] View menu: Zoom options
- [x] Arrange menu: Z-order options
- [x] Arrange menu: Alignment options
- [x] Arrange menu: Distribution options
- [x] Disabled state for unavailable actions
- [x] Keyboard shortcuts displayed

---

## Verification

### Bug Fix Verification
- [x] Context menu: All actions work when menu opened on shape
- [x] Undo resize reverts shape size correctly
- [x] Undo rotation reverts shape angle correctly

### History Verification
- [x] Undo fill color change
- [x] Undo stroke changes
- [x] Undo text edit
- [x] Undo connection creation
- [x] Undo alignment (all shapes revert)
- [x] Undo z-order change

### Menu Bar Verification
- [x] All menus open/close correctly
- [x] Undo shows action description
- [x] Disabled items not clickable
- [x] Checkmarks display for toggles
- [x] Menu closes on item click
- [x] Menu closes on outside click

---

## Completed Summary

| Task | Status | Notes |
|------|--------|-------|
| KI-006: Context menu clicks | Done | Added onMouseDown/onMouseUp/onClick stopPropagation to ContextMenu.tsx container |
| KI-007: Resize/rotation history | Done | Fixed multiple React instance issue: use global manipulationState store as single source of truth instead of local refs |
| FillSection history | Done | Added pushEntry for fill color and opacity changes |
| StrokeSection history | Done | Added pushEntry for stroke color, width, and style changes |
| CornerRadiusSection history | Done | Added pushEntry for corner radius changes |
| Text editing history | Done | Added originalTextRef and history push on blur in TextEditOverlay.tsx |
| Connection creation history | Done | Added pushEntry after addConnection in useConnectionCreation.ts |
| Alignment/Distribution history | Done | Added history wrappers in useContextMenu.ts and ArrangementSection.tsx |
| Z-order history | Done | Added history wrappers in useContextMenu.ts and useKeyboardShortcuts.ts |
| Menu Bar components | Done | Created MenuItem.tsx, Menu.tsx, MenuBar.tsx, index.ts |
| Menu Bar integration | Done | Replaced placeholder header with MenuBar in AppShell.tsx |
