# Phase 7.1: P7 Bug Fixes & Completion - Requirements

## Overview

Phase 7.1 addresses bugs discovered during Phase 7 testing and completes deferred functionality. This phase focuses on fixing existing issues before adding remaining features.

## Priority: Bug Fixes First

Before implementing new features, all known issues from P7 must be resolved.

---

## Bug Fixes (Critical)

### KI-006: Context Menu Click Actions Not Working
- Right-click context menu displays correctly
- Clicking menu items does not execute actions
- Menu closes but no operation is performed
- Keyboard shortcuts work fine - functionality exists, just click handlers broken

### KI-007: Resize and Rotation Not Tracked in Undo History
- Resizing shapes does not add history entries
- Rotating shapes does not add history entries
- Ctrl+Z does not revert resize/rotation changes
- Code may exist but is not triggering correctly

---

## Deferred Features from P7

### Complete History Tracking
All operations should be undoable with Ctrl+Z:

| Operation | Current Status | Required |
|-----------|---------------|----------|
| Shape creation | Working | - |
| Shape deletion | Working | - |
| Shape move | Working | - |
| Shape resize | Not working (KI-007) | Fix |
| Shape rotation | Not working (KI-007) | Fix |
| Style changes | Not tracked | Add (per-property) |
| Text changes | Not tracked | Add (per edit session) |
| Connection creation | Not tracked | Add (full restore) |
| Connection deletion | Working | - |
| Alignment | Not tracked | Add (all shapes, single step) |
| Distribution | Not tracked | Add (all shapes, single step) |
| Z-order changes | Not tracked | Add |

### Menu Bar Implementation
Create application menu bar with:

#### Edit Menu
- Undo (Ctrl+Z) - with action description
- Redo (Ctrl+Y)
- Separator
- Cut (Ctrl+X)
- Copy (Ctrl+C)
- Paste (Ctrl+V)
- Duplicate (Ctrl+D)
- Separator
- Delete (Del)
- Select All (Ctrl+A)

#### View Menu
- Show Grid (Ctrl+G) - checkmark when enabled
- Snap to Grid (Ctrl+Shift+G) - checkmark when enabled
- Separator
- Zoom In (Ctrl++)
- Zoom Out (Ctrl+-)
- Zoom to 100% (Ctrl+1)
- Fit to Screen (Ctrl+0)
- Reset View (Ctrl+Shift+F)

#### Arrange Menu
- Bring to Front (Ctrl+Shift+])
- Bring Forward (Ctrl+])
- Send Backward (Ctrl+[)
- Send to Back (Ctrl+Shift+[)
- Separator
- Align Left
- Align Center
- Align Right
- Align Top
- Align Middle
- Align Bottom
- Separator
- Distribute Horizontally
- Distribute Vertically

---

## Dependencies

- Phase 7 completed (history system, grid, context menu infrastructure)
- Existing z-order, alignment, distribution functions in diagramStore

---

## Success Criteria

1. All context menu items execute their actions when clicked
2. Resize and rotation operations appear in undo history
3. All listed operations are undoable
4. Menu bar displays with Edit, View, Arrange menus
5. Menu items show keyboard shortcuts
6. Menu items show disabled state when not applicable
7. Undo menu item shows description of action to undo
8. Build passes with no TypeScript errors
