# Phase 3: Shape Manipulation - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 3 |
| Status | Draft |
| Dependencies | Phase 0-2 |
| Deployable | Yes - Full shape manipulation |

---

## Phase Overview

Phase 3 completes the core shape interaction capabilities. Users will be able to move shapes by dragging, resize shapes using the 8 handles, rotate shapes using a rotation handle, and delete shapes. This phase transforms the application from a basic shape placer to a functional diagram editor.

### Goals

1. Enable moving shapes by dragging
2. Implement resizing via 8 resize handles
3. Add rotation capability with rotation handle
4. Enable shape deletion
5. Support constrained operations (Shift for proportional)
6. Implement minimum size enforcement

---

## User Stories Included

### From Epic E03: Shape Manipulation

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E03-US03 | Move Shapes | P0 | Full |
| E03-US04 | Resize Shapes | P0 | Full |
| E03-US05 | Rotate Shapes | P1 | Full |
| E03-US06 | Delete Shapes | P0 | Full |

---

## Detailed Acceptance Criteria

### E03-US03: Move Shapes

**As a** user
**I want** to move shapes by dragging
**So that** I can arrange my diagram

```gherkin
Scenario: Drag to move single shape
  Given I have a shape selected
  When I click and drag the shape body (not handles)
  Then the shape moves following my cursor
  And the shape position updates in real-time
  And the shape remains selected during move

Scenario: Move snaps to canvas coordinates
  Given I am dragging a shape
  Then the shape position updates to match cursor delta
  And movement is 1:1 with mouse movement (at 100% zoom)

Scenario: Move with arrow keys
  Given I have a shape selected
  When I press an arrow key (Up/Down/Left/Right)
  Then the shape moves by 1 pixel in that direction
  When I press Shift+arrow key
  Then the shape moves by 10 pixels in that direction

Scenario: Constrain movement to axis
  Given I am dragging a shape
  When I hold Shift while dragging
  Then movement is constrained to horizontal OR vertical only
  And the constraint is based on the dominant drag direction

Scenario: Move maintains selection
  Given I have a shape selected
  When I move the shape
  Then the shape remains selected after the move
  And selection handles follow the shape

Scenario: Move updates shape state
  Given I move a shape
  Then the shape's x and y coordinates update in the store
  And the diagram is marked as dirty/modified

Scenario: Cannot move locked shape (future)
  Given I have a locked shape selected
  When I try to drag it
  Then the shape does not move
  Note: Lock feature is Phase 6+, but move should check locked state
```

---

### E03-US04: Resize Shapes

**As a** user
**I want** to resize shapes using handles
**So that** I can adjust their dimensions

```gherkin
Scenario: Resize from corner handle
  Given I have a shape selected
  When I drag a corner resize handle (e.g., bottom-right)
  Then the shape resizes from that corner
  And the opposite corner stays fixed
  And width and height update based on drag

Scenario: Resize from edge handle (horizontal)
  Given I have a shape selected
  When I drag the right-center or left-center handle
  Then only the width changes
  And the height remains constant
  And the vertical position is maintained

Scenario: Resize from edge handle (vertical)
  Given I have a shape selected
  When I drag the top-center or bottom-center handle
  Then only the height changes
  And the width remains constant
  And the horizontal position is maintained

Scenario: Resize maintaining aspect ratio (Shift)
  Given I am dragging a corner resize handle
  When I hold Shift
  Then the aspect ratio is preserved
  And width and height scale proportionally

Scenario: Resize from center (Alt)
  Given I am dragging a resize handle
  When I hold Alt
  Then the shape resizes from its center
  And opposite edges move equally
  And the shape center remains stationary

Scenario: Resize from center with aspect ratio (Shift+Alt)
  Given I am dragging a corner handle with Shift+Alt held
  Then the shape resizes from center AND maintains aspect ratio

Scenario: Minimum size enforcement
  Given I am resizing a shape
  When I try to make it smaller than 10x10 pixels
  Then the size stops at the minimum dimension
  And the shape cannot become smaller
  And visual feedback indicates the limit is reached

Scenario: Resize updates dimensions
  Given I resize a shape
  Then the shape's width, height, x, y update correctly
  And the change is reflected immediately in the canvas
  And text inside the shape reflows (future phase)

Scenario: Cursor changes on handle hover
  Given I hover over a resize handle
  Then the cursor changes to indicate resize direction
  And nw-resize, ne-resize, sw-resize, se-resize for corners
  And ew-resize for horizontal edges
  And ns-resize for vertical edges
```

---

### E03-US05: Rotate Shapes

**As a** user
**I want** to rotate shapes
**So that** I can orient them as needed

```gherkin
Scenario: Rotation handle visibility
  Given I have a shape selected
  Then a rotation handle appears above the shape
  And the handle is positioned above the top-center
  And a line connects the handle to the shape

Scenario: Rotate using handle
  Given I have a shape selected
  When I drag the rotation handle
  Then the shape rotates around its center
  And the rotation follows the angle from center to cursor
  And the rotation angle updates in real-time

Scenario: Rotation angle display
  Given I am rotating a shape
  Then the current rotation angle is displayed near the shape
  And the angle shows in degrees (e.g., "45°")

Scenario: Constrain rotation angle (Shift)
  Given I am rotating a shape
  When I hold Shift
  Then rotation snaps to 15-degree increments
  And the shape jumps between 0°, 15°, 30°, 45°, etc.

Scenario: Rotation center point
  Given I rotate a shape
  Then the shape rotates around its geometric center
  And the center point remains stationary

Scenario: Rotation affects rendering
  Given I have rotated a shape to 45 degrees
  Then the shape renders at a 45-degree angle
  And selection handles also rotate with the shape
  OR handles remain axis-aligned (implementation choice)

Scenario: Rotation via property panel (future)
  Given I have a shape selected
  When I enter a rotation value in the property panel
  Then the shape rotates to that exact angle
  Note: Property panel is Phase 4
```

---

### E03-US06: Delete Shapes

**As a** user
**I want** to delete shapes
**So that** I can remove unwanted elements

```gherkin
Scenario: Delete with keyboard
  Given I have one or more shapes selected
  When I press Delete or Backspace
  Then all selected shapes are removed from the canvas
  And the shapes are removed from the store
  And any connections to those shapes are also removed (future)

Scenario: Delete confirmation not required
  Given I press Delete with shapes selected
  Then the shapes are deleted immediately
  And no confirmation dialog appears
  Note: Undo will be available in Phase 7

Scenario: Delete updates selection
  Given I delete a shape
  Then the selection is cleared
  And no shapes are selected after deletion

Scenario: Delete multiple shapes (future)
  Given I have multiple shapes selected
  When I press Delete
  Then all selected shapes are removed
  Note: Multi-selection is Phase 6, but single delete works now

Scenario: Delete with nothing selected
  Given no shapes are selected
  When I press Delete
  Then nothing happens
  And no error occurs

Scenario: Delete from context menu (future)
  Given I have shapes selected
  When I right-click and select "Delete"
  Then the shapes are deleted
  Note: Context menu is Phase 7
```

---

## Features Included

1. **Shape Movement**
   - Drag to move selected shapes
   - Arrow key movement (1px / 10px with Shift)
   - Constrained axis movement (Shift while dragging)
   - Real-time position updates

2. **Shape Resizing**
   - 8 resize handles (4 corners + 4 edges)
   - Corner resize (both dimensions)
   - Edge resize (single dimension)
   - Proportional resize (Shift)
   - Resize from center (Alt)
   - Minimum size enforcement (10x10)

3. **Shape Rotation**
   - Rotation handle above shape
   - Drag to rotate
   - Rotation angle display
   - 15-degree snapping (Shift)
   - Center-point rotation

4. **Shape Deletion**
   - Delete/Backspace key
   - Immediate deletion (no confirmation)
   - Selection cleared after delete

5. **Visual Feedback**
   - Cursor changes on handles
   - Real-time preview during operations
   - Angle display during rotation

---

## Features Excluded (Deferred)

- Multi-shape movement (E03-US03 partial) - Phase 6
- Keyboard shortcuts for resize/rotate - Future
- Lock shapes (E03-US09) - Phase 6
- Bring to front/Send to back (E03-US10) - Phase 7
- Alignment tools (E03-US11) - Phase 6
- Distribution tools (E03-US12) - Phase 6
- Undo/redo for manipulations - Phase 7
- Snap-to-grid during move/resize - Phase 7
- Smart guides - Future
- Connected line updates during move - Phase 5

---

## Dependencies on Previous Phases

### Phase 0 Requirements
- Type definitions for shapes
- Constants for minimum sizes

### Phase 1 Requirements
- Canvas with coordinate system
- Screen-to-canvas conversion
- Viewport transformation

### Phase 2 Requirements
- Shape components (Rectangle, Ellipse)
- Selection system
- Selection handles component
- Shape store with update action

### Required from Previous Phases

| Component/File | Usage |
|----------------|-------|
| `SelectionHandles.tsx` | Extend with interactive handles |
| `useDiagramStore` | updateShape action |
| `screenToCanvas()` | Convert drag deltas |
| `Shape` interface | x, y, width, height, rotation |
| `SHAPE_DEFAULTS` | MIN_SIZE constant |

---

## Definition of Done

- [ ] Selected shapes can be moved by dragging
- [ ] Arrow keys move selected shapes
- [ ] Shift+arrow keys move by 10px
- [ ] Shift during drag constrains to axis
- [ ] All 8 resize handles work correctly
- [ ] Corner handles resize both dimensions
- [ ] Edge handles resize single dimension
- [ ] Shift constrains resize to aspect ratio
- [ ] Alt resizes from center
- [ ] Minimum size (10x10) is enforced
- [ ] Rotation handle appears above selected shapes
- [ ] Dragging rotation handle rotates shape
- [ ] Shift snaps rotation to 15-degree increments
- [ ] Rotation angle displays during rotation
- [ ] Delete/Backspace removes selected shapes
- [ ] Cursors change appropriately on handles
- [ ] All operations update shape state correctly
- [ ] Operations work at different zoom levels
- [ ] Unit tests cover resize and rotation math
- [ ] Manual testing confirms all scenarios

---

## Test Scenarios

### Move Tests

1. **Drag Move**
   - Select shape, drag 100px right
   - Verify x increased by 100

2. **Arrow Key Move**
   - Select shape, press Right arrow
   - Verify x increased by 1

3. **Shift+Arrow Move**
   - Select shape, press Shift+Right
   - Verify x increased by 10

4. **Constrained Move**
   - Select shape, drag diagonally with Shift
   - Verify moves only horizontally or vertically

### Resize Tests

5. **Corner Resize**
   - Drag bottom-right corner 50px right and 30px down
   - Verify width +50, height +30

6. **Edge Resize**
   - Drag right edge 50px
   - Verify width +50, height unchanged

7. **Proportional Resize**
   - Drag corner with Shift
   - Verify aspect ratio maintained

8. **Center Resize**
   - Drag corner with Alt
   - Verify center position unchanged

9. **Minimum Size**
   - Try to resize below 10x10
   - Verify minimum enforced

### Rotation Tests

10. **Basic Rotation**
    - Drag rotation handle
    - Verify shape rotates

11. **Snapped Rotation**
    - Drag with Shift held
    - Verify snaps to 15° increments

12. **90-Degree Rotation**
    - Rotate to exactly 90°
    - Verify shape renders correctly

### Delete Tests

13. **Delete Key**
    - Select shape, press Delete
    - Verify shape removed

14. **Backspace Key**
    - Select shape, press Backspace
    - Verify shape removed

15. **Delete Nothing**
    - Deselect all, press Delete
    - Verify no error

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Move response | < 16ms (60fps) |
| Resize response | < 16ms (60fps) |
| Rotation response | < 16ms (60fps) |
| Delete operation | < 50ms |

---

## Notes for Implementation

### Resize Calculation

For corner resize, calculate new bounds:
```typescript
// Bottom-right corner drag
newWidth = Math.max(MIN_SIZE, startWidth + deltaX);
newHeight = Math.max(MIN_SIZE, startHeight + deltaY);

// Top-left corner drag (need to adjust position too)
newWidth = Math.max(MIN_SIZE, startWidth - deltaX);
newHeight = Math.max(MIN_SIZE, startHeight - deltaY);
newX = startX + deltaX; // Only if not at minimum
newY = startY + deltaY;
```

### Rotation Calculation

Calculate angle from center to cursor:
```typescript
const dx = cursorX - centerX;
const dy = cursorY - centerY;
let angle = Math.atan2(dy, dx) * (180 / Math.PI);
angle = angle + 90; // Adjust for handle being above shape

if (shiftHeld) {
  angle = Math.round(angle / 15) * 15;
}
```

### Transform for Rotated Shapes

SVG transform attribute:
```xml
<g transform="rotate(45, centerX, centerY)">
  <rect ... />
</g>
```

Or CSS transform:
```css
transform: rotate(45deg);
transform-origin: center;
```

### Handle Positions for Rotated Shapes

Two approaches:
1. **Rotated handles**: Transform handles with shape (complex)
2. **Axis-aligned handles**: Keep handles aligned to axes (simpler, draw.io style)

Recommendation: Start with axis-aligned, update handle positions based on rotated bounding box.
