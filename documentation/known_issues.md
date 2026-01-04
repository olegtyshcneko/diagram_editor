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
**Status:** Partially Resolved (Phase 8.3, 8.4)
**Priority:** Low
**Reported:** Phase 5

**Description:**
Straight-line connections between shapes may pass through other shapes on the canvas. When shapes overlap or are inline, the connection line can cut through intermediate shapes.

**Resolution (Partial):**
Phase 8 introduced alternative connection styles:
- ✅ Curved (Bezier) connections (P8.3)
- ✅ Orthogonal connections with smart routing (P8.4)
- ⏳ Waypoints for manual path control (P8.5)

**Remaining:**
Automatic obstacle avoidance (A* pathfinding) is not implemented. Users must manually choose connection style or reposition shapes.

**Workaround:**
Switch connection style to "Orthogonal" or "Curved" in the Property Panel, or reposition shapes.

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

### KI-008: No Multi-Selection for Connections
**Status:** Open
**Priority:** Low
**Reported:** Phase 8.3

---

### KI-012: Waypoints Only Work for Straight Connections
**Status:** Open
**Priority:** Medium
**Reported:** Phase 8.5

**Description:**
Waypoints (manual path control points) are currently only supported for straight connection style. Curved (bezier) and orthogonal connections do not support waypoints. The style selector is disabled when waypoints exist, forcing users to clear waypoints before changing connection style.

**Current Behavior:**
- Double-clicking on curved/orthogonal connections does not add waypoints
- Waypoints panel section hidden for non-straight connections
- Style selector disabled when waypoints exist on a straight connection

**Expected Behavior:**
Waypoints should work across all connection types:
- **Bezier:** Waypoints could act as through-points that the curve passes through or near
- **Orthogonal:** Waypoints could define mandatory routing points for the orthogonal path

**Technical Considerations:**
- Bezier with waypoints: Could use Catmull-Rom splines or multi-segment beziers
- Orthogonal with waypoints: Already partially implemented in `routeOrthogonalWithWaypoints()` but disabled
- Waypoint storage uses relative positioning (t + offset from baseline), which may need adaptation for non-linear paths

**Workaround:**
Use straight connections when waypoints are needed, or use bezier control points for curved path adjustment.

---

### KI-009: Start Arrows Partially Hidden Under Shapes
**Status:** Open
**Priority:** Medium
**Reported:** Phase 8.3

**Description:**
Start arrows (source arrows) on connections appear partially underneath the source shape, while end arrows (target arrows) display correctly outside the target shape. This makes start arrows less visible or completely hidden.

**Expected Behavior:**
Both start and end arrows should be fully visible outside their respective shapes, with the arrow tip at the anchor point and the arrow body extending outward along the connection line.

**Root Cause:**
The `refX` attribute on the start arrow marker is set to `1`, positioning the arrow very close to the line start. For end arrows, `refX` is set to `ARROW_SIZE - 1`, which positions them at the line end correctly. The asymmetry causes start arrows to overlap with the shape.

**Current Code (Connection.tsx):**
```typescript
// End marker - refX positions arrow at line end
refX={ARROW_SIZE - 1}

// Start marker - refX too small, arrow overlaps shape
refX={1}
```

**Suggested Fix:**
Adjust the start marker's `refX` or the line start point to account for arrow size, similar to how end arrows work. May need to shorten the line at the start by the arrow size.

**Workaround:**
Use end arrows only, or accept partial visibility of start arrows.

---

### KI-010: Group Edit Mode Exits When Clicking Inside Group Bounds
**Status:** Open
**Priority:** Medium
**Reported:** Input Refactoring Phase

**Description:**
When in group edit mode, clicking on an empty area inside the group's bounding box exits group edit mode entirely. This is unexpected behavior - users expect to deselect the currently selected element within the group while staying in group edit mode.

**Current Behavior:**
1. User double-clicks a group to enter group edit mode
2. User selects a shape within the group
3. User clicks on empty space inside the group bounds
4. Group edit mode exits (unexpected)

**Expected Behavior:**
- Clicking on empty space **inside** the group bounds: Deselect current element, stay in group edit mode
- Clicking on empty space **outside** the group bounds: Exit group edit mode

**Affected Code:**
- `src/components/canvas/Canvas.tsx` or `CanvasContainer.tsx` - click handling during group edit mode
- Logic that determines when to call `setEditingGroupId(null)`

**Suggested Fix:**
When handling canvas clicks during group edit mode:
1. Calculate the group's bounding box (union of all member shapes)
2. Check if click point is inside or outside this bounding box
3. If inside: just clear selection within the group, don't exit edit mode
4. If outside: exit group edit mode

```typescript
// Pseudocode
const handleCanvasClick = (canvasPoint: Point) => {
  if (editingGroupId) {
    const groupBounds = getGroupBounds(editingGroupId);
    if (isPointInBounds(canvasPoint, groupBounds)) {
      // Inside group - just deselect, stay in edit mode
      clearSelection();
    } else {
      // Outside group - exit edit mode
      setEditingGroupId(null);
    }
    return;
  }
  // ... normal click handling
};
```

**Workaround:**
Press Escape or click outside the group bounds to exit group edit mode intentionally.

---

### KI-011: Selection Box Doesn't Treat Groups as Atomic Units
**Status:** Open
**Priority:** Medium
**Reported:** Input Refactoring Phase

**Description:**
When using the selection box (marquee selection) to select shapes, if the box covers some ungrouped shapes AND only a partial set of shapes from a group, only the individual shapes within the box are selected. This breaks the expected group behavior where groups should be treated as a single entity.

**Example:**
- Canvas has: Shape A (ungrouped), Shape B + Shape C (grouped together)
- User draws selection box covering Shape A and Shape B (but not Shape C)
- Current behavior: Shape A and Shape B are selected (group is partially selected)
- Expected behavior: Either select all of Shape A, B, C (include entire group) OR only select Shape A (exclude group entirely)

**Expected Behavior:**
Groups should be treated as atomic units during selection box operations:
- **Option A (Inclusive):** If any shape in a group intersects the selection box, select the entire group
- **Option B (Exclusive):** Only select a group if ALL its shapes are within the selection box

**Affected Code:**
- `src/hooks/useSelectionBox.ts` - `handleSelectionBoxEnd()`
- `src/lib/geometry/selection.ts` - `getShapesInBox()`

**Suggested Fix:**
After determining which shapes are in the selection box, check for partial group selections:
```typescript
// Pseudocode for Option A (inclusive)
const shapesInBox = getShapesInBox(shapes, startPoint, currentPoint);
const expandedSelection = new Set(shapesInBox);

for (const shapeId of shapesInBox) {
  const shape = shapes[shapeId];
  if (shape.groupId) {
    // Add all shapes in this group
    const group = groups[shape.groupId];
    group.memberIds.forEach(id => expandedSelection.add(id));
  }
}
```

**Workaround:**
Manually Shift+click to add/remove shapes, or ensure the selection box fully covers all shapes in a group.

---

### KI-008: No Multi-Selection for Connections

**Description:**
Connections can only be selected one at a time. Clicking a connection replaces the current selection rather than adding to it. There's no Shift+click or Ctrl+click support for selecting multiple connections.

**Expected Behavior:**
Users should be able to select multiple connections using Shift+click or Ctrl+click, similar to shape multi-selection.

**Current Code:**
```typescript
// ConnectionLayer.tsx - always replaces selection
setSelectedConnectionIds([connectionId]);
```

**Note:**
The PropertyPanel already supports updating multiple connections (iterates over `selectedConnectionIds`), but the selection mechanism only allows single selection.

**Workaround:**
Select and modify connections one at a time.

---

## Resolved Issues

### KI-006: Context Menu Click Actions Not Working
**Status:** Resolved (Phase 7.1)
**Priority:** Medium
**Reported:** Phase 7
**Resolved:** Phase 7.1

**Resolution:**
Fixed context menu click handling for shapes. The issue was related to event propagation and selection state management when right-clicking on shapes.

---

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
