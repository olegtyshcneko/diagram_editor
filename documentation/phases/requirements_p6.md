# Phase 6: Multi-Selection & Advanced Manipulation - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 6 |
| Status | Draft |
| Dependencies | Phase 0-5 |
| Deployable | Yes - Multi-shape workflows |

---

## Phase Overview

Phase 6 enables working with multiple shapes simultaneously. Users will be able to select multiple shapes using various methods, move and manipulate them together, copy/paste/duplicate shapes, and use alignment and distribution tools to create professional-looking diagrams.

### Goals

1. Implement multi-shape selection (Shift+click, selection box)
2. Enable Select All (Ctrl+A)
3. Support moving multiple shapes together
4. Implement copy, cut, paste, and duplicate
5. Add alignment tools (left, center, right, top, middle, bottom)
6. Add distribution tools (horizontal, vertical)
7. Enable style application to multiple shapes

---

## User Stories Included

### From Epic E03: Shape Manipulation

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E03-US02 | Select Multiple Shapes | P0 | Full |
| E03-US03 | Move Shapes (multi) | P0 | Full |
| E03-US07 | Duplicate Shapes | P0 | Full |
| E03-US08 | Copy and Paste Shapes | P0 | Full |
| E03-US11 | Align Shapes | P1 | Full |
| E03-US12 | Distribute Shapes | P1 | Full |

---

## Detailed Acceptance Criteria

### E03-US02: Select Multiple Shapes

**As a** user
**I want** to select multiple shapes at once
**So that** I can move, align, or modify them together

```gherkin
Scenario: Shift-click to add to selection
  Given I have one shape selected
  When I Shift-click on another shape
  Then both shapes are now selected
  And selection handles encompass all selected shapes
  And both shapes are highlighted

Scenario: Shift-click to remove from selection
  Given I have multiple shapes selected (A, B, C)
  When I Shift-click on shape B (already selected)
  Then shape B is removed from the selection
  And shapes A and C remain selected

Scenario: Ctrl-click to add to selection
  Given I have one shape selected
  When I Ctrl-click on another shape
  Then both shapes are selected
  Note: Ctrl-click behaves same as Shift-click for selection

Scenario: Drag to create selection box
  Given I have the Select tool active
  And I click on an empty area of the canvas
  When I drag to create a selection rectangle
  Then a selection box appears showing the drag area
  And the box has a semi-transparent fill and border

Scenario: Selection box selects shapes
  Given I am dragging a selection box
  When I release the mouse
  Then all shapes fully within the rectangle are selected
  And all shapes partially within the rectangle are selected
  And shapes outside the rectangle are not selected

Scenario: Selection box replaces selection
  Given I have shapes selected
  When I drag a selection box (without Shift)
  Then only shapes in the new selection box are selected
  And previously selected shapes are deselected

Scenario: Shift + selection box adds to selection
  Given I have shapes A and B selected
  When I hold Shift and drag a selection box over shape C
  Then shapes A, B, and C are all selected

Scenario: Select all with keyboard
  Given I have shapes on the canvas
  When I press Ctrl+A
  Then all shapes on the canvas are selected

Scenario: Visual feedback for multi-selection
  Given I have multiple shapes selected
  Then all selected shapes show individual selection indicators
  And a bounding box encompasses all selected shapes
```

---

### E03-US03: Move Multiple Shapes

**As a** user
**I want** to move multiple selected shapes together
**So that** I can reposition groups of elements

```gherkin
Scenario: Drag to move multiple shapes
  Given I have multiple shapes selected
  When I click and drag on any selected shape
  Then all selected shapes move together
  And their relative positions are maintained
  And connected lines update accordingly

Scenario: Arrow keys move multiple shapes
  Given I have multiple shapes selected
  When I press an arrow key
  Then all selected shapes move by 1px in that direction
  When I press Shift+arrow key
  Then all selected shapes move by 10px

Scenario: Constrained multi-shape movement
  Given I have multiple shapes selected
  When I hold Shift while dragging
  Then movement is constrained to horizontal or vertical only
  And all shapes move along the constrained axis

Scenario: Move updates all connected lines
  Given I have multiple connected shapes selected
  When I move the selection
  Then all connections between selected shapes move with them
  And connections to unselected shapes update their endpoints
```

---

### E03-US07: Duplicate Shapes

**As a** user
**I want** to duplicate shapes
**So that** I can quickly create copies

```gherkin
Scenario: Duplicate with keyboard shortcut
  Given I have one or more shapes selected
  When I press Ctrl+D
  Then copies of all selected shapes are created
  And the copies are offset by 20px right and 20px down
  And the copies become the new selection
  And original shapes are deselected

Scenario: Duplicate maintains all properties
  Given I duplicate shapes with styling (fill, stroke, text)
  Then the copies have identical properties
  And this includes position, size, rotation
  And this includes all style properties
  And this includes text content

Scenario: Duplicate multiple shapes
  Given I have shapes A, B, C selected
  When I press Ctrl+D
  Then copies A', B', C' are created
  And relative positions between A', B', C' match A, B, C

Scenario: Duplicate with connections
  Given I have shapes A and B selected
  And A and B are connected
  When I press Ctrl+D
  Then copies A' and B' are created
  And A' and B' are connected in the same way
  Note: Connections between selected shapes are duplicated
```

---

### E03-US08: Copy and Paste Shapes

**As a** user
**I want** to copy and paste shapes
**So that** I can reuse elements and move them between diagrams

```gherkin
Scenario: Copy shapes to clipboard
  Given I have one or more shapes selected
  When I press Ctrl+C
  Then the shapes are copied to the internal clipboard
  And a subtle notification confirms the copy (optional)
  And the original shapes remain selected

Scenario: Paste shapes from clipboard
  Given I have copied shapes
  When I press Ctrl+V
  Then the shapes are pasted onto the canvas
  And they are offset from the copy position (20px right and down)
  And the pasted shapes become selected
  And original shapes are deselected

Scenario: Paste multiple times
  Given I have copied shapes
  When I paste multiple times
  Then each paste creates new copies
  And each subsequent paste is offset further
  Or each paste is offset from the center of viewport

Scenario: Cut shapes
  Given I have shapes selected
  When I press Ctrl+X
  Then the shapes are copied to the clipboard
  And the original shapes are removed from the canvas

Scenario: Paste after cut
  Given I have cut shapes
  When I press Ctrl+V
  Then the shapes appear at the paste location
  And this is functionally a move operation

Scenario: Copy with connections
  Given I have connected shapes selected
  When I copy and paste
  Then connections between the copied shapes are preserved
  And connections to uncopied shapes are not included

Scenario: Paste at cursor (context menu)
  Given I have copied shapes
  When I right-click on the canvas and select "Paste Here"
  Then the shapes are pasted centered at the click position
  Note: Context menu is Phase 7, but paste position logic applies
```

---

### E03-US11: Align Shapes

**As a** user
**I want** to align multiple shapes
**So that** I can create neat, organized diagrams

```gherkin
Scenario: Align left
  Given I have multiple shapes selected
  When I select "Arrange > Align > Left" from the menu
  Then all shapes align their left edges
  And they align to the leftmost shape's left edge

Scenario: Align center (horizontal)
  Given I have multiple shapes selected
  When I select "Arrange > Align > Center Horizontal"
  Then all shapes align their horizontal centers
  And they align to the horizontal center of the selection bounding box

Scenario: Align right
  Given I have multiple shapes selected
  When I select "Arrange > Align > Right"
  Then all shapes align their right edges
  And they align to the rightmost shape's right edge

Scenario: Align top
  Given I have multiple shapes selected
  When I select "Arrange > Align > Top"
  Then all shapes align their top edges
  And they align to the topmost shape's top edge

Scenario: Align middle (vertical)
  Given I have multiple shapes selected
  When I select "Arrange > Align > Middle"
  Then all shapes align their vertical centers
  And they align to the vertical center of the selection bounding box

Scenario: Align bottom
  Given I have multiple shapes selected
  When I select "Arrange > Align > Bottom"
  Then all shapes align their bottom edges
  And they align to the bottommost shape's bottom edge

Scenario: Align with single shape
  Given I have only one shape selected
  Then alignment options are disabled or grayed out
  And no alignment occurs

Scenario: Align updates connections
  Given I align connected shapes
  Then connections update to follow the new positions
```

---

### E03-US12: Distribute Shapes

**As a** user
**I want** to distribute shapes evenly
**So that** I can create consistent spacing

```gherkin
Scenario: Distribute horizontally
  Given I have 3 or more shapes selected
  When I select "Arrange > Distribute > Horizontal"
  Then the shapes are evenly spaced horizontally
  And the leftmost shape stays in place
  And the rightmost shape stays in place
  And middle shapes are repositioned to be evenly spaced

Scenario: Distribute vertically
  Given I have 3 or more shapes selected
  When I select "Arrange > Distribute > Vertical"
  Then the shapes are evenly spaced vertically
  And the topmost shape stays in place
  And the bottommost shape stays in place
  And middle shapes are repositioned

Scenario: Distribute with 2 shapes
  Given I have exactly 2 shapes selected
  Then distribution options are disabled or do nothing meaningful
  And a tooltip or message explains why

Scenario: Distribute with fewer than 3 shapes
  Given I have 0, 1, or 2 shapes selected
  Then distribution options are disabled

Scenario: Equal spacing calculation
  Given I have shapes A, B, C, D selected horizontally
  And A is at x=0, D is at x=300
  When I distribute horizontally
  Then B is at x=100, C is at x=200 (equal 100px gaps)
```

---

## Features Included

1. **Multi-Selection**
   - Shift-click to add/remove
   - Ctrl-click to add/remove
   - Selection box (drag on empty canvas)
   - Shift + selection box (add to existing)
   - Select All (Ctrl+A)
   - Visual feedback for multi-selection

2. **Multi-Shape Movement**
   - Drag multiple shapes together
   - Arrow key movement for all selected
   - Shift constrained movement
   - Maintains relative positions

3. **Copy/Paste/Duplicate**
   - Copy (Ctrl+C)
   - Cut (Ctrl+X)
   - Paste (Ctrl+V)
   - Duplicate (Ctrl+D)
   - Offset pasting
   - Connection preservation

4. **Alignment Tools**
   - Align Left
   - Align Center (Horizontal)
   - Align Right
   - Align Top
   - Align Middle (Vertical)
   - Align Bottom

5. **Distribution Tools**
   - Distribute Horizontally
   - Distribute Vertically

---

## Features Excluded (Deferred)

- Lock shapes (E03-US09) - Future
- Z-order (Bring to Front, Send to Back) - Phase 7
- Smart guides during move - Future
- Snap to other shapes - Future
- Group shapes (E07-US01) - Phase 8

---

## Dependencies on Previous Phases

### Phase 0-5 Requirements
- Selection system with selectedShapeIds array
- Shape store with update actions
- Canvas coordinate conversion
- Move functionality
- Connection update on shape move

### Required from Previous Phases

| Component/File | Usage |
|----------------|-------|
| `selectedShapeIds` | Multi-selection array |
| `useDiagramStore` | Shape operations |
| `useShapeManipulation` | Movement logic |
| Connection system | Update connections on align/move |

---

## Definition of Done

### Multi-Selection
- [ ] Shift-click adds/removes from selection
- [ ] Ctrl-click adds/removes from selection
- [ ] Drag on empty canvas creates selection box
- [ ] Selection box selects intersecting shapes
- [ ] Shift + selection box adds to selection
- [ ] Ctrl+A selects all shapes
- [ ] Multi-selection has visual indicator

### Multi-Shape Movement
- [ ] Dragging any selected shape moves all
- [ ] Relative positions maintained during move
- [ ] Arrow keys move all selected shapes
- [ ] Shift constrains multi-shape movement

### Copy/Paste/Duplicate
- [ ] Ctrl+C copies selected shapes
- [ ] Ctrl+V pastes copied shapes
- [ ] Ctrl+X cuts (copies and deletes)
- [ ] Ctrl+D duplicates with offset
- [ ] Connections between copied shapes preserved
- [ ] Pasted shapes become new selection

### Alignment
- [ ] Align left works with 2+ shapes
- [ ] Align center (horizontal) works
- [ ] Align right works
- [ ] Align top works
- [ ] Align middle (vertical) works
- [ ] Align bottom works
- [ ] Disabled for single shape

### Distribution
- [ ] Distribute horizontal works with 3+ shapes
- [ ] Distribute vertical works with 3+ shapes
- [ ] Disabled for fewer than 3 shapes
- [ ] Manual testing confirms all scenarios

---

## Test Scenarios

### Multi-Selection Tests

1. **Shift-click Add**
   - Select shape A, Shift-click B
   - Verify both selected

2. **Shift-click Remove**
   - Select A, B, C; Shift-click B
   - Verify A and C remain selected

3. **Selection Box**
   - Drag box over shapes B, C
   - Verify B and C selected, A not

4. **Select All**
   - Press Ctrl+A
   - Verify all shapes selected

### Movement Tests

5. **Move Multiple**
   - Select A and B, drag A
   - Verify B moves same delta

6. **Arrow Keys Multiple**
   - Select A and B, press Right arrow
   - Verify both move right 1px

### Copy/Paste Tests

7. **Copy and Paste**
   - Select A, press Ctrl+C, Ctrl+V
   - Verify copy appears offset

8. **Cut and Paste**
   - Select A, press Ctrl+X
   - Verify A removed
   - Press Ctrl+V, verify A appears

9. **Duplicate**
   - Select A, press Ctrl+D
   - Verify copy appears, becomes selected

### Alignment Tests

10. **Align Left**
    - Select 3 shapes at different x positions
    - Align left, verify all x values equal leftmost

11. **Align Center**
    - Select 3 shapes
    - Align center, verify horizontal centers match

### Distribution Tests

12. **Distribute Horizontal**
    - Select 4 shapes at x=0, 50, 200, 300
    - Distribute, verify x=0, 100, 200, 300

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Multi-selection update | < 16ms |
| Selection box render | < 16ms (60fps) |
| Copy 100 shapes | < 100ms |
| Paste 100 shapes | < 200ms |
| Align 50 shapes | < 50ms |

---

## Notes for Implementation

### Selection Box Rendering

```typescript
// Selection box SVG rect
<rect
  x={Math.min(startX, currentX)}
  y={Math.min(startY, currentY)}
  width={Math.abs(currentX - startX)}
  height={Math.abs(currentY - startY)}
  fill="rgba(59, 130, 246, 0.1)"
  stroke="#3B82F6"
  strokeWidth={1}
  strokeDasharray="4 4"
/>
```

### Clipboard Structure

```typescript
interface ClipboardData {
  shapes: Shape[];
  connections: Connection[];
  copyOffset: { x: number; y: number }; // For paste offset
}
```

### Alignment Calculation

```typescript
// Align left example
function alignLeft(shapes: Shape[]): void {
  const minX = Math.min(...shapes.map(s => s.x));
  shapes.forEach(shape => {
    updateShape(shape.id, { x: minX });
  });
}

// Align center (horizontal)
function alignCenterHorizontal(shapes: Shape[]): void {
  const bounds = getSelectionBounds(shapes);
  const centerX = bounds.x + bounds.width / 2;
  shapes.forEach(shape => {
    updateShape(shape.id, { x: centerX - shape.width / 2 });
  });
}
```

### Distribution Calculation

```typescript
function distributeHorizontal(shapes: Shape[]): void {
  if (shapes.length < 3) return;

  // Sort by x position
  const sorted = [...shapes].sort((a, b) => a.x - b.x);

  // Calculate total space and gap
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const totalWidth = (last.x + last.width) - first.x;
  const totalShapeWidth = shapes.reduce((sum, s) => sum + s.width, 0);
  const gap = (totalWidth - totalShapeWidth) / (shapes.length - 1);

  // Position middle shapes
  let currentX = first.x + first.width + gap;
  for (let i = 1; i < sorted.length - 1; i++) {
    updateShape(sorted[i].id, { x: currentX });
    currentX += sorted[i].width + gap;
  }
}
```
