# Phase 2: Basic Shapes - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 2 |
| Status | Draft |
| Dependencies | Phase 0 (Setup), Phase 1 (Canvas) |
| Deployable | Yes - Can create rectangles/ellipses |

---

## Phase Overview

Phase 2 introduces the ability to create and render basic shapes on the canvas. Users will be able to select shape tools, create rectangles and ellipses by clicking or dragging, and select shapes to view their selection state.

### Goals

1. Implement rectangle and ellipse shape rendering
2. Enable shape creation via toolbar tool selection
3. Support click-to-place (default size) creation
4. Support click-and-drag creation
5. Implement single shape selection
6. Display selection handles around selected shapes
7. Create basic toolbar with shape tools

---

## User Stories Included

### From Epic E02: Shape Creation

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E02-US01 | Create Rectangle | P0 | Full |
| E02-US02 | Create Ellipse | P0 | Full |
| E02-US07 | Shape Creation Maintains Tool | P1 | Full |
| E02-US08 | Shape Preview While Creating | P0 | Full |

### From Epic E03: Shape Manipulation

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E03-US01 | Select Single Shape | P0 | Full |

---

## Detailed Acceptance Criteria

### E02-US01: Create Rectangle

**As a** user
**I want** to create rectangle shapes
**So that** I can represent boxes, containers, and process steps

```gherkin
Scenario: Select rectangle tool from toolbar
  Given I am on the canvas
  When I click the Rectangle tool in the toolbar OR press "R"
  Then the Rectangle tool becomes active
  And the tool button shows as selected/pressed
  And the cursor may change to indicate creation mode

Scenario: Create rectangle by dragging
  Given I have selected the Rectangle tool
  When I click and hold on the canvas at position (100, 100)
  And I drag to position (200, 160)
  And I release the mouse button
  Then a rectangle is created from (100, 100) to (200, 160)
  And the rectangle has width 100 and height 60
  And the rectangle is selected after creation
  And selection handles appear around the rectangle

Scenario: Create rectangle with default size (click)
  Given I have selected the Rectangle tool
  When I single-click on the canvas at position (300, 200)
  Then a rectangle with default dimensions (100x60) is created
  And the rectangle is centered at the click position OR top-left at click
  And the rectangle is selected

Scenario: Rectangle has default styling
  Given I create a rectangle
  Then it has a white fill (#ffffff)
  And it has a black stroke (#000000)
  And stroke width is 2px
  And stroke style is solid

Scenario: Cancel rectangle creation
  Given I am dragging to create a rectangle
  When I press Escape
  Then the rectangle creation is cancelled
  And no shape is added to the canvas
  And the preview disappears
```

---

### E02-US02: Create Ellipse

**As a** user
**I want** to create ellipse/circle shapes
**So that** I can represent nodes, states, and circular elements

```gherkin
Scenario: Select ellipse tool from toolbar
  Given I am on the canvas
  When I click the Ellipse tool in the toolbar OR press "E"
  Then the Ellipse tool becomes active
  And the tool button shows as selected/pressed

Scenario: Create ellipse by dragging
  Given I have selected the Ellipse tool
  When I click and drag on the canvas
  Then an ellipse is created fitting the bounding box of the drag
  And the ellipse is selected after creation

Scenario: Create perfect circle (Shift constraint)
  Given I have selected the Ellipse tool
  When I hold Shift while dragging
  Then a perfect circle is created (width equals height)
  And the circle fits within the drag bounds

Scenario: Create ellipse with default size (click)
  Given I have selected the Ellipse tool
  When I single-click on the canvas
  Then an ellipse with default dimensions (100x60) is created at that position

Scenario: Ellipse has default styling
  Given I create an ellipse
  Then it has the same default styling as rectangles
  And it renders as an SVG ellipse element
```

---

### E02-US07: Shape Creation Maintains Tool

**As a** user
**I want** the shape tool to remain selected after creating a shape
**So that** I can create multiple shapes of the same type quickly

```gherkin
Scenario: Tool remains selected after creation
  Given I have selected the Rectangle tool
  When I create a rectangle
  Then the Rectangle tool remains selected
  And I can immediately create another rectangle

Scenario: Switch to select tool with V or Escape
  Given I have created a shape and the tool is still active
  When I press "V" or "Escape"
  Then the Select tool becomes active
  And I can click to select shapes
```

---

### E02-US08: Shape Preview While Creating

**As a** user
**I want** to see a preview of the shape while dragging
**So that** I can accurately size and position it

```gherkin
Scenario: Live preview during drag creation
  Given I am dragging to create a shape
  Then a semi-transparent preview of the shape is displayed
  And the preview updates in real-time as I drag
  And I can see the exact bounds of the shape being created

Scenario: Preview styling
  Given I am creating a shape
  Then the preview has reduced opacity (e.g., 50%)
  And the preview has a dashed or semi-transparent border
  And the preview is visually distinct from completed shapes

Scenario: Dimensions shown during creation (optional)
  Given I am creating a shape
  Then the width and height are displayed near the shape
  Note: This is optional for Phase 2, can be deferred
```

---

### E03-US01: Select Single Shape

**As a** user
**I want** to select a single shape
**So that** I can manipulate or inspect it

```gherkin
Scenario: Click to select
  Given I have the Select tool active (press "V")
  When I click on a shape
  Then the shape becomes selected
  And selection handles appear around the shape
  And any previously selected shapes are deselected

Scenario: Click empty area to deselect
  Given I have a shape selected
  When I click on an empty area of the canvas
  Then all shapes are deselected
  And no selection handles are visible

Scenario: Visual selection indicator
  Given a shape is selected
  Then it displays 8 resize handles (4 corners + 4 midpoints)
  And handles are small squares (e.g., 8x8 pixels)
  And handles have a distinct color (e.g., blue #3B82F6)
  And the shape may have a selection outline (optional)

Scenario: Selection state in store
  Given I select a shape
  Then the shape's ID is stored in selectedShapeIds
  And the property panel would show shape properties (future phase)

Scenario: Click on shape with creation tool
  Given I have the Rectangle tool active
  When I click on an existing shape
  Then a new shape is NOT created on top of it
  OR the new shape starts from that click position
  Note: Behavior should be consistent - recommend creating new shape

Scenario: Select by clicking shape interior
  Given I have a filled shape on the canvas
  When I click inside the shape (not just the border)
  Then the shape is selected

Scenario: Select by clicking shape border
  Given I have a shape on the canvas
  When I click on the shape's border/stroke
  Then the shape is selected
```

---

## Features Included

1. **Shape Rendering**
   - Rectangle component (SVG `<rect>`)
   - Ellipse component (SVG `<ellipse>`)
   - Default styling (fill, stroke)

2. **Shape Creation**
   - Rectangle tool (R key)
   - Ellipse tool (E key)
   - Click to place with default size
   - Drag to create with custom size
   - Preview during drag creation
   - Shift constraint for circles/squares

3. **Tool System**
   - Active tool state
   - Tool switching via keyboard shortcuts
   - Tool switching via toolbar
   - Tool persistence after creation

4. **Selection System (Basic)**
   - Single shape selection
   - Selection handles display
   - Click to select / deselect
   - Selection state in store

5. **Toolbar**
   - Select tool button (V)
   - Rectangle tool button (R)
   - Ellipse tool button (E)
   - Visual feedback for active tool

---

## Features Excluded (Deferred)

- Diamond shape (E02-US03) - Phase 3+
- Triangle shape (E02-US04) - Phase 3+
- Line shape (E02-US05) - Phase 5
- Text box (E02-US06) - Phase 5
- Drag from toolbar (E02-US09) - Future
- Specific dimensions dialog (E02-US10) - Future
- Multi-selection (E03-US02) - Phase 6
- Shape movement (E03-US03) - Phase 3
- Shape resize (E03-US04) - Phase 3
- Shape rotation (E03-US05) - Phase 3
- Property panel display - Phase 4

---

## Dependencies on Previous Phases

### Phase 0 Requirements
- Project structure and configuration
- Type definitions for shapes
- Zustand store setup
- shadcn/ui components available

### Phase 1 Requirements
- Canvas component with viewBox
- Viewport state management
- Screen-to-canvas coordinate conversion
- Event handling infrastructure

### Required from Previous Phases

| Component/File | Usage |
|----------------|-------|
| `Canvas.tsx` | Parent component for shapes |
| `useUIStore` | Active tool state |
| `screenToCanvas()` | Convert click to canvas coords |
| `SHAPE_DEFAULTS` | Default dimensions and styling |
| `Shape` interface | Shape data structure |

---

## Definition of Done

- [ ] Rectangle tool can be selected (click and "R" key)
- [ ] Ellipse tool can be selected (click and "E" key)
- [ ] Rectangles can be created by clicking (default size)
- [ ] Rectangles can be created by dragging
- [ ] Ellipses can be created by clicking (default size)
- [ ] Ellipses can be created by dragging
- [ ] Shift creates perfect circles/squares
- [ ] Preview appears while dragging to create
- [ ] Escape cancels shape creation
- [ ] Created shapes have default styling
- [ ] Select tool can be activated ("V" key)
- [ ] Clicking a shape selects it
- [ ] Clicking empty area deselects
- [ ] Selection handles appear around selected shapes
- [ ] Tool remains selected after creating shape
- [ ] Shapes persist in Zustand store
- [ ] Shapes render correctly at different zoom levels
- [ ] Unit tests cover shape creation logic
- [ ] Manual testing confirms all scenarios

---

## Test Scenarios

### Shape Creation Tests

1. **Rectangle by Click**
   - Select Rectangle tool
   - Click on canvas
   - Verify rectangle appears with default size

2. **Rectangle by Drag**
   - Select Rectangle tool
   - Drag from (100,100) to (250,200)
   - Verify rectangle at correct position and size

3. **Ellipse by Drag with Shift**
   - Select Ellipse tool
   - Hold Shift and drag
   - Verify perfect circle (width === height)

4. **Cancel Creation**
   - Start dragging to create
   - Press Escape
   - Verify no shape created

### Selection Tests

5. **Select Shape**
   - Create a shape
   - Switch to Select tool
   - Click on shape
   - Verify handles appear

6. **Deselect by Clicking Empty**
   - Select a shape
   - Click on empty canvas
   - Verify handles disappear

7. **Select Different Shape**
   - Create two shapes
   - Select first shape
   - Click second shape
   - Verify only second is selected

### Tool Tests

8. **Tool Persistence**
   - Select Rectangle tool
   - Create rectangle
   - Verify Rectangle tool still active
   - Create another rectangle

9. **Tool Shortcuts**
   - Press "R" - verify Rectangle active
   - Press "E" - verify Ellipse active
   - Press "V" - verify Select active

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Shape render time | < 1ms per shape |
| Selection response | < 16ms (60fps) |
| Preview update | < 16ms (60fps) |
| Shape creation | < 50ms total |

---

## Notes for Implementation

### Shape ID Generation

Use a utility function to generate unique IDs:
```typescript
export function generateId(): string {
  return `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

### Hit Testing

For selection, implement hit testing:
- Check if click point is inside shape bounds
- For ellipse, use ellipse equation for precise hit testing
- Consider stroke width in hit area

### Shape Layering

- New shapes should be created on top (highest zIndex)
- Selection order doesn't affect z-order in this phase

### Coordinate System

- Store shapes in canvas coordinates
- Convert screen clicks to canvas using `screenToCanvas()`
- Render shapes directly with canvas coordinates (viewBox handles transformation)
