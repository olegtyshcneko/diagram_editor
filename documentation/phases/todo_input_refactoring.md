# Input Handling Refactoring - Todo List

## Status: Completed

## Overview
Extract duplicated input handling patterns into shared utilities in `src/lib/input/` without breaking existing functionality.

---

## Phase 1: Create Utility Files

- [x] Create `src/lib/input/modifiers.ts` - Modifier key utilities
- [x] Create `src/lib/input/inputGuards.ts` - Input detection guards
- [x] Create `src/lib/input/useGlobalDrag.ts` - Global drag listener hook
- [x] Create `src/lib/input/shortcuts.ts` - Shortcut definitions
- [x] Create `src/lib/input/index.ts` - Barrel export

---

## Phase 2: Migrate Consumers

### 2.1 Input Guards Migration
- [x] Migrate `src/hooks/useKeyboardShortcuts.ts` - inputGuards
- [x] Migrate `src/components/canvas/CanvasContainer.tsx` - inputGuards
- [x] Migrate `src/components/canvas/TextEditOverlay.tsx` - modifiers (isCtrlOrMeta)

### 2.2 Modifiers Migration
- [x] Migrate `src/components/shapes/Shape.tsx` - modifiers (isMultiSelectModifier)
- [x] Migrate `src/hooks/useKeyboardShortcuts.ts` - modifiers (isCtrlOrMeta)

### 2.3 useGlobalDrag Migration (Most Impactful)
- [x] Migrate `src/hooks/useSelectionBox.ts` - useGlobalDrag
- [x] Migrate `src/hooks/useControlPointDrag.ts` - useGlobalDrag
- [x] Migrate `src/hooks/useConnectionCreation.ts` - useGlobalDrag
- [x] Migrate `src/hooks/manipulation/useShapeManipulation.ts` - useGlobalDrag (coordinates move/resize/rotate)
- [N/A] `useShapeMove.ts`, `useShapeResize.ts`, `useShapeRotate.ts` - handlers only, no global listeners

### 2.4 Shortcuts Migration
- [ ] Migrate `src/hooks/useKeyboardShortcuts.ts` - shortcuts (optional, lower priority)

---

## Phase 3: Cleanup & Verification

- [ ] Remove unused imports from migrated files
- [ ] Run full verification checklist
- [ ] Update documentation if needed

---

## Verification Checklist (Verified by User)

### Core Interactions
- [x] Pan canvas (spacebar + drag, middle mouse)
- [x] Zoom (Ctrl+scroll, Ctrl++/-)
- [x] Create rectangle (R key, drag)
- [x] Create ellipse (E key, drag)
- [x] Select shape (click)
- [x] Multi-select (Shift+click, Ctrl+click)
- [x] Selection box (drag on empty canvas)
- [x] Move shape (drag selected)
- [x] Resize shape (drag handles)
- [x] Rotate shape (drag rotation handle)
- [x] Delete (Delete/Backspace key)

### Connections
- [x] Create connection (C key, drag anchor to anchor)
- [x] Cancel connection (Escape)
- [x] Drag control points (curved connections)

### Text Editing
- [x] Double-click to edit text
- [x] Ctrl+B/I/U formatting
- [x] Escape to exit

### Modifier Keys
- [x] Shift+drag = constrain axis (move)
- [x] Shift+drag = maintain aspect ratio (resize)
- [x] Shift+drag = snap 15° (rotate)
- [x] Alt+drag = disable snap
- [x] Ctrl+click = multi-select toggle

### Keyboard Shortcuts
- [x] Ctrl+Z/Y undo/redo
- [x] Ctrl+C/X/V copy/cut/paste
- [x] Ctrl+D duplicate
- [x] Ctrl+A select all
- [x] Arrow keys move selection
- [x] Tool shortcuts (V, R, E, C)

---

## Completed Summary

| Task | Status | Notes |
|------|--------|-------|
| Phase 1: Create utility files | Done | Created modifiers.ts, inputGuards.ts, useGlobalDrag.ts, shortcuts.ts, index.ts |
| Phase 2.1: Input guards migration | Done | useKeyboardShortcuts, CanvasContainer now use shouldSkipGlobalShortcut |
| Phase 2.2: Modifiers migration | Done | Shape.tsx uses isMultiSelectModifier, TextEditOverlay uses isCtrlOrMeta |
| Phase 2.3: useGlobalDrag migration | Done | 4 hooks migrated: useSelectionBox, useControlPointDrag, useConnectionCreation, useShapeManipulation |
| Phase 2.4: Shortcuts migration | Skipped | Optional - shortcuts.ts created but migration deferred (already centralized in one file) |
| Build verification | Done | TypeScript compiles, Vite build successful |
| Manual testing | Done | All interactions verified working by user |

