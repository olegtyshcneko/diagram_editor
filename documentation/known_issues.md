# Known Issues

Issues to investigate and fix in future phases.

---

## Open Issues

### KI-002: Selection Handles Don't Scale With Zoom
**Status:** Open
**Priority:** Medium
**Reported:** Phase 4

**Description:**
When zooming out, selection handles become very small and difficult to click. When zooming in, handles appear disproportionately large relative to the shape.

**Expected Behavior:**
Handles should scale inversely with zoom level to maintain a consistent screen-space size (e.g., always appear ~8px on screen regardless of zoom).

**Suggested Fix:**
Apply `1 / viewport.zoom` scaling to handle sizes in `InteractiveSelectionHandles` and `SelectionHandles` components. This keeps handles at a usable size at any zoom level.

**Workaround:**
Zoom to 100% for optimal handle usability, or use property panel for precise adjustments.

---

### KI-004: Connection Lines Cut Through Shapes
**Status:** Open (Addressed in Phase 8)
**Priority:** Medium
**Reported:** Phase 5

**Description:**
Straight-line connections between shapes may pass through other shapes on the canvas. When shapes overlap or are inline, the connection line can cut through intermediate shapes.

**Expected Behavior:**
Connections should route around obstacles or provide orthogonal/curved routing options.

**Resolution Plan:**
Phase 8 will introduce:
- Orthogonal connections (right-angle routing)
- Curved (Bezier) connections
- Waypoints for manual path control

**Workaround:**
Manually reposition shapes to avoid overlapping connections, or wait for Phase 8 advanced connections.

---

### KI-006: Context Menu Click Actions Not Working
**Status:** Open
**Priority:** Medium
**Reported:** Phase 7

**Description:**
Right-click context menu appears correctly and displays all options (Cut, Copy, Paste, Duplicate, Bring to Front, Send Backward, Delete, etc.), but clicking on menu items does not execute the actions. The menu closes but no operation is performed.

**Important Context:**
- Context menu **WORKS** when right-clicking on empty canvas (canvas context menu)
- Context menu **DOES NOT WORK** when right-clicking on a shape (shape context menu)
- This suggests the issue is related to shape event handling or selection state when cursor is over a shape

**Expected Behavior:**
Clicking a context menu item should execute the corresponding action (e.g., clicking "Bring to Front" should bring the selected shape to front).

**Note:**
All keyboard shortcuts for these operations work correctly (Ctrl+], Ctrl+[, Ctrl+Shift+], Ctrl+Shift+[, Delete, Ctrl+C/V/X/D, etc.). The underlying functionality is implemented and working - only the context menu click handlers are not triggering.

**Suggested Fix:**
Debug focusing on shape-specific behavior:
1. Check if shape's mouse event handlers interfere with menu clicks
2. Verify selection state is correct when right-clicking on shape
3. Check if shape SVG elements are capturing/blocking events above the context menu
4. Examine z-index stacking - menu should be above shapes
5. Check if `onMouseDown`/`onMouseUp` on shapes triggers during menu click

**Workaround:**
Use keyboard shortcuts instead of context menu clicks.

---

### KI-005: Ellipse Text Uses Rectangular Bounds
**Status:** Open
**Priority:** Low
**Reported:** Phase 5.2

**Description:**
Text wrapping and positioning in ellipses/circles uses rectangular bounding box calculations. When text is vertically aligned to "top", it can extend outside the curved ellipse boundary horizontally because the ellipse is narrower at the top/bottom than in the middle.

**Expected Behavior:**
Text should respect the actual ellipse curve, calculating available width based on the ellipse equation at each vertical position.

**Suggested Fix:**
Calculate text bounds using ellipse geometry:
- For a given Y position, calculate the horizontal width at that point using: `width_at_y = 2 * a * sqrt(1 - ((y - cy) / b)^2)` where `a` = horizontal radius, `b` = vertical radius, `cy` = center Y
- Apply this per-line for proper text fitting within curved boundaries

**Workaround:**
Use "middle" vertical alignment for ellipses, or use smaller font sizes to keep text within the widest part of the ellipse.

---

## Resolved Issues

### KI-007: Resize and Rotation Not Tracked in Undo History
**Status:** Resolved (Phase 7.1)
**Priority:** Medium
**Reported:** Phase 7
**Resolved:** Phase 7.1

**Resolution:**
Fixed multiple React component instance issue in `useShapeResize.ts` and `useShapeRotate.ts`. React StrictMode (and potentially other scenarios) creates multiple hook instances with separate refs. When `handleResizeStart` set refs in Instance A, but `handleResizeEnd` was called on Instance B (which had null refs), the history entry failed.

The fix uses the global Zustand store as the single source of truth:
1. Store all start state (`startBounds`, `startPoint`, `startRotation`) in `manipulationState` via `startManipulation()`
2. In update/end handlers, read from `useInteractionStore.getState().manipulationState` instead of local refs
3. Check for actual changes by comparing current shape state to start state from store
4. Handle multiple `handleResizeEnd` calls gracefully - first call processes history, subsequent calls see `manipulationState === null` and exit early

This pattern ensures consistent behavior regardless of how many component instances exist.

---

### KI-003: Text Overflow Outside Shape Bounds
**Status:** Resolved (Phase 5.1)
**Priority:** Low
**Reported:** Phase 5
**Resolved:** Phase 5.1

**Resolution:**
Added SVG `clipPath` to `ShapeText` component to constrain text rendering within shape bounds. Text that exceeds shape boundaries is now visually clipped.

---

### KI-001: Middle Mouse Pan Not Working
**Status:** Resolved (Phase 2)
**Priority:** Low (workaround exists)
**Reported:** Phase 1
**Resolved:** Phase 2

**Resolution:**
Middle mouse pan now works correctly. Issue may have been browser-specific or resolved through event handling improvements in Phase 2.

---
