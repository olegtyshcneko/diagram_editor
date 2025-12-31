# Naive Draw.io - Requirements Document

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Created | 2025-01-15 |
| Status | Draft |
| Owner | Product Team |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [User Personas](#2-user-personas)
3. [Epics Overview](#3-epics-overview)
4. [User Stories by Epic](#4-user-stories-by-epic)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Glossary](#6-glossary)

---

## 1. Introduction

### 1.1 Purpose

This document defines the functional and non-functional requirements for Naive Draw.io, a web-based vector diagramming application. Requirements are expressed as user stories with acceptance criteria to ensure clear, testable specifications.

### 1.2 Scope

The application enables users to create, edit, save, and export diagrams consisting of shapes, connections, and text. The system must be compatible with draw.io file format and deployable as both a local application and cloud-hosted service.

### 1.3 Definitions

| Term | Definition |
|------|------------|
| **User Story** | A requirement written as: "As a [persona], I want [goal], so that [benefit]" |
| **Acceptance Criteria** | Testable conditions that must be met for a story to be complete |
| **Epic** | A large body of work containing multiple related user stories |
| **Priority** | P0 (Critical), P1 (High), P2 (Medium), P3 (Low) |

---

## 2. User Personas

### 2.1 Casual User (Casey)

> "I need to quickly sketch a diagram for a meeting."

- Creates simple diagrams occasionally
- Values ease of use over advanced features
- Exports diagrams as images for presentations
- May not have technical background

### 2.2 Power User (Pat)

> "I create complex technical diagrams daily."

- Creates detailed flowcharts, architecture diagrams, ERDs
- Uses keyboard shortcuts extensively
- Requires draw.io compatibility for team collaboration
- Needs precise control over styling and positioning

### 2.3 Team Collaborator (Taylor)

> "I need to share and collaborate on diagrams with my team."

- Works on shared diagrams
- Requires cloud storage and sharing
- Needs to track diagram versions
- Values collaboration features

---

## 3. Epics Overview

| Epic ID | Epic Name | Priority | Stories |
|---------|-----------|----------|---------|
| E01 | Canvas & Viewport | P0 | 8 |
| E02 | Shape Creation | P0 | 10 |
| E03 | Shape Manipulation | P0 | 12 |
| E04 | Shape Styling | P0 | 8 |
| E05 | Text Editing | P0 | 10 |
| E06 | Connections | P0 | 14 |
| E07 | Organization & Layers | P1 | 8 |
| E08 | History & Undo | P0 | 4 |
| E09 | File Operations | P0 | 12 |
| E10 | draw.io Compatibility | P0 | 6 |
| E11 | User Interface | P0 | 10 |
| E12 | Keyboard Shortcuts | P1 | 6 |
| E13 | Cloud & Authentication | P2 | 8 |
| E14 | Export & Import | P1 | 8 |

---

## 4. User Stories by Epic

---

### Epic E01: Canvas & Viewport

#### E01-US01: View Infinite Canvas

**As a** user
**I want** an infinite canvas to work on
**So that** I can create diagrams of any size without constraints

**Priority:** P0
**Story Points:** 5

**Acceptance Criteria:**

```gherkin
Scenario: Canvas extends beyond viewport
  Given I am on the diagram editor
  When I pan the canvas in any direction
  Then the canvas continues infinitely
  And I can place shapes anywhere on the canvas

Scenario: Canvas maintains content position
  Given I have shapes placed on the canvas
  When I close and reopen the diagram
  Then all shapes remain in their original positions
```

---

#### E01-US02: Zoom with Mouse Wheel

**As a** user
**I want** to zoom in and out using my mouse wheel
**So that** I can quickly adjust my view level

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Zoom in with mouse wheel
  Given I am viewing the canvas at 100% zoom
  When I scroll the mouse wheel up
  Then the canvas zooms in by a fixed increment (e.g., 10%)
  And the zoom is centered on the mouse cursor position

Scenario: Zoom out with mouse wheel
  Given I am viewing the canvas at 100% zoom
  When I scroll the mouse wheel down
  Then the canvas zooms out by a fixed increment
  And the zoom is centered on the mouse cursor position

Scenario: Zoom limits
  Given I am viewing the canvas
  When I zoom in beyond 400%
  Then the zoom stops at 400%
  When I zoom out below 10%
  Then the zoom stops at 10%

Scenario: Zoom indicator updates
  Given I am viewing the canvas
  When I zoom in or out
  Then the zoom percentage in the status bar updates immediately
```

---

#### E01-US03: Pan Canvas

**As a** user
**I want** to pan the canvas by dragging
**So that** I can navigate to different areas of my diagram

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Pan with middle mouse button
  Given I am on the canvas
  When I press and hold the middle mouse button
  And I drag in any direction
  Then the canvas pans following my mouse movement
  And the cursor changes to a grab icon

Scenario: Pan with spacebar and drag
  Given I am on the canvas with any tool selected
  When I press and hold the spacebar
  And I click and drag with the left mouse button
  Then the canvas pans following my mouse movement
  And upon releasing spacebar, my previous tool is restored

Scenario: Pan does not move shapes
  Given I have shapes on the canvas
  When I pan the canvas
  Then all shapes maintain their relative positions to each other
```

---

#### E01-US04: Zoom to Fit

**As a** user
**I want** to zoom to fit all content in the viewport
**So that** I can see my entire diagram at once

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Fit all content
  Given I have multiple shapes spread across the canvas
  When I press Ctrl+Shift+F or select "View > Fit to Screen"
  Then the viewport adjusts to show all shapes
  And there is a small padding around the content
  And the zoom level updates accordingly

Scenario: Empty canvas fit
  Given I have an empty canvas
  When I trigger "Fit to Screen"
  Then the canvas resets to default view (100%, centered)
```

---

#### E01-US05: Zoom to Selection

**As a** user
**I want** to zoom to fit selected shapes
**So that** I can focus on specific elements

**Priority:** P2
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Zoom to selected shapes
  Given I have selected one or more shapes
  When I press Ctrl+Shift+1 or select "View > Zoom to Selection"
  Then the viewport adjusts to show only the selected shapes
  And there is padding around the selection

Scenario: No selection
  Given I have no shapes selected
  When I trigger "Zoom to Selection"
  Then nothing happens or a subtle notification appears
```

---

#### E01-US06: Reset Zoom

**As a** user
**I want** to reset the zoom to 100%
**So that** I can view the diagram at actual size

**Priority:** P1
**Story Points:** 1

**Acceptance Criteria:**

```gherkin
Scenario: Reset to 100%
  Given I am viewing the canvas at any zoom level
  When I press Ctrl+1 or select "View > Actual Size"
  Then the zoom resets to 100%
  And the current center of the viewport is maintained
```

---

#### E01-US07: Display Grid

**As a** user
**I want** to see a grid on the canvas
**So that** I can align shapes precisely and have visual reference points

**Priority:** P1
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Default dot grid pattern
  Given I open the application
  Then the canvas displays a subtle dot grid pattern by default
  And dots are light gray (#e0e0e0 or similar) on white background
  And dots are evenly spaced (default 20px apart)

Scenario: Toggle grid visibility
  Given I am on the canvas
  When I press Ctrl+G or select "View > Show Grid"
  Then the grid is displayed/hidden
  And the grid preference is persisted

Scenario: Grid scales with zoom
  Given the grid is visible
  When I zoom in or out
  Then the grid pattern scales appropriately
  And dots remain visible but not overwhelming at any zoom level

Scenario: Grid style options
  Given I open grid settings (View > Grid Settings)
  Then I can choose between:
    - Dot grid (default, like draw.io)
    - Line grid (traditional squares)
    - Cross grid (small crosses at intersections)
  And I can adjust grid spacing (10px, 20px, 40px, custom)
  And I can adjust dot/line opacity

Scenario: Grid adapts to dark mode
  Given dark mode is enabled
  Then the grid dots/lines adjust to be visible on dark background
  And maintain subtle appearance (not distracting)
```

---

#### E01-US08: Snap to Grid

**As a** user
**I want** shapes to snap to grid lines
**So that** I can align elements precisely

**Priority:** P1
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Snap while moving
  Given snap-to-grid is enabled
  When I drag a shape
  Then the shape position snaps to the nearest grid intersection

Scenario: Snap while resizing
  Given snap-to-grid is enabled
  When I resize a shape by dragging a handle
  Then the edge snaps to the nearest grid line

Scenario: Toggle snap-to-grid
  Given I am on the canvas
  When I press Ctrl+Shift+G or select "View > Snap to Grid"
  Then snap-to-grid is enabled/disabled
  And the preference is persisted

Scenario: Temporary disable snap
  Given snap-to-grid is enabled
  When I hold Alt while dragging
  Then snapping is temporarily disabled for that operation
```

---

### Epic E02: Shape Creation

#### E02-US01: Create Rectangle

**As a** user
**I want** to create rectangle shapes
**So that** I can represent boxes, containers, and process steps

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Create rectangle by dragging
  Given I have selected the Rectangle tool (press R or click toolbar)
  When I click and drag on the canvas
  Then a rectangle is created from the start point to the end point
  And the rectangle is selected after creation

Scenario: Create rectangle with default size
  Given I have selected the Rectangle tool
  When I single-click on the canvas
  Then a rectangle with default dimensions (100x60) is created at that position
  And the rectangle is selected

Scenario: Cancel rectangle creation
  Given I am dragging to create a rectangle
  When I press Escape
  Then the rectangle creation is cancelled
  And no shape is added to the canvas
```

---

#### E02-US02: Create Ellipse

**As a** user
**I want** to create ellipse/circle shapes
**So that** I can represent nodes, states, and circular elements

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Create ellipse by dragging
  Given I have selected the Ellipse tool (press E or click toolbar)
  When I click and drag on the canvas
  Then an ellipse is created fitting the bounding box
  And the ellipse is selected after creation

Scenario: Create perfect circle
  Given I have selected the Ellipse tool
  When I hold Shift while dragging
  Then a perfect circle is created (width equals height)

Scenario: Create ellipse with default size
  Given I have selected the Ellipse tool
  When I single-click on the canvas
  Then an ellipse with default dimensions is created
```

---

#### E02-US03: Create Diamond

**As a** user
**I want** to create diamond shapes
**So that** I can represent decision points in flowcharts

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Create diamond by dragging
  Given I have selected the Diamond tool
  When I click and drag on the canvas
  Then a diamond (rotated square) is created
  And connection anchors are at the four points

Scenario: Diamond proportions
  Given I am creating a diamond
  When I hold Shift while dragging
  Then the diamond maintains equal width and height
```

---

#### E02-US04: Create Triangle

**As a** user
**I want** to create triangle shapes
**So that** I can represent directional elements and custom diagrams

**Priority:** P2
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Create triangle by dragging
  Given I have selected the Triangle tool
  When I click and drag on the canvas
  Then an equilateral triangle is created
  And the triangle points upward by default

Scenario: Rotate triangle during creation
  Given I am creating a triangle
  When I hold Shift
  Then the triangle can be oriented in 90-degree increments
```

---

#### E02-US05: Create Line

**As a** user
**I want** to create simple line segments
**So that** I can draw dividers, pointers, and decorations

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Create line by dragging
  Given I have selected the Line tool (press L)
  When I click and drag on the canvas
  Then a line is created from start to end point
  And the line can have arrows on either end

Scenario: Constrain line angle
  Given I am creating a line
  When I hold Shift while dragging
  Then the line snaps to 15-degree angle increments
  And this allows easy horizontal, vertical, and 45-degree lines
```

---

#### E02-US06: Create Text Box

**As a** user
**I want** to create standalone text boxes
**So that** I can add labels and annotations to my diagram

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Create text box
  Given I have selected the Text tool (press T)
  When I click on the canvas
  Then a text box is created at that position
  And the text box enters edit mode immediately
  And I can start typing

Scenario: Create text box by dragging
  Given I have selected the Text tool
  When I click and drag on the canvas
  Then a text box with the specified dimensions is created
  And text will wrap within those dimensions

Scenario: Exit text editing
  Given I am editing text in a text box
  When I click outside the text box or press Escape
  Then text editing mode ends
  And the text is saved
```

---

#### E02-US07: Shape Creation Maintains Tool

**As a** user
**I want** the shape tool to remain selected after creating a shape
**So that** I can create multiple shapes of the same type quickly

**Priority:** P1
**Story Points:** 1

**Acceptance Criteria:**

```gherkin
Scenario: Tool remains selected
  Given I have selected the Rectangle tool
  When I create a rectangle
  Then the Rectangle tool remains selected
  And I can immediately create another rectangle

Scenario: Switch to select tool optionally
  Given I have created a shape
  When I press V or Escape
  Then the Select tool becomes active
```

---

#### E02-US08: Shape Preview While Creating

**As a** user
**I want** to see a preview of the shape while dragging
**So that** I can accurately size and position it

**Priority:** P0
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Live preview during creation
  Given I am dragging to create a shape
  Then a semi-transparent preview of the shape is displayed
  And the preview updates in real-time as I drag
  And dimensions are shown near the shape

Scenario: Preview shows grid snapping
  Given snap-to-grid is enabled
  When I am creating a shape
  Then the preview snaps to grid lines
  And I can see exactly where the shape will be placed
```

---

#### E02-US09: Create Shape from Toolbar Drag

**As a** user
**I want** to drag shapes from the toolbar onto the canvas
**So that** I have an alternative way to add shapes

**Priority:** P2
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Drag shape from toolbar
  Given I see shape icons in the toolbar
  When I drag a shape icon onto the canvas
  Then a shape of that type is created at the drop position
  And the shape has default dimensions
  And the shape is selected

Scenario: Drag preview
  Given I am dragging a shape from the toolbar
  Then a ghost preview follows my cursor
  And dropping outside the canvas cancels the operation
```

---

#### E02-US10: Create Shape with Specific Dimensions

**As a** user
**I want** to specify exact dimensions when creating a shape
**So that** I can create precisely sized elements

**Priority:** P2
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Double-click tool for dimensions dialog
  Given I double-click on a shape tool in the toolbar
  Then a dialog appears asking for width and height
  When I enter dimensions and click OK
  Then I can click on the canvas to place a shape with those dimensions

Scenario: Enter dimensions in property panel
  Given I have a shape selected
  When I enter specific width and height in the property panel
  Then the shape resizes to those exact dimensions
  And I can choose to maintain aspect ratio
```

---

### Epic E03: Shape Manipulation

#### E03-US01: Select Single Shape

**As a** user
**I want** to select a single shape
**So that** I can manipulate or inspect it

**Priority:** P0
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Click to select
  Given I have the Select tool active (press V)
  When I click on a shape
  Then the shape becomes selected
  And selection handles appear around the shape
  And any previously selected shapes are deselected

Scenario: Click empty area to deselect
  Given I have a shape selected
  When I click on an empty area of the canvas
  Then all shapes are deselected

Scenario: Visual selection indicator
  Given a shape is selected
  Then it displays 8 resize handles (corners + midpoints)
  And it displays a rotation handle above the top-center
  And the shape has a selection outline
```

---

#### E03-US02: Select Multiple Shapes

**As a** user
**I want** to select multiple shapes at once
**So that** I can move, align, or modify them together

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Shift-click to add to selection
  Given I have one shape selected
  When I Shift-click on another shape
  Then both shapes are now selected
  And the selection bounding box encompasses both shapes

Scenario: Shift-click to remove from selection
  Given I have multiple shapes selected
  When I Shift-click on one of the selected shapes
  Then that shape is removed from the selection
  And other shapes remain selected

Scenario: Drag to create selection box
  Given I have the Select tool active
  When I click and drag on an empty area
  Then a selection rectangle appears
  And all shapes fully or partially within the rectangle are selected when I release

Scenario: Select all
  Given I have shapes on the canvas
  When I press Ctrl+A
  Then all shapes on the canvas are selected
```

---

#### E03-US03: Move Shapes

**As a** user
**I want** to move shapes by dragging
**So that** I can arrange my diagram

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Drag to move single shape
  Given I have a shape selected
  When I click and drag the shape
  Then the shape moves following my cursor
  And connected lines update accordingly

Scenario: Drag to move multiple shapes
  Given I have multiple shapes selected
  When I drag any of the selected shapes
  Then all selected shapes move together
  And their relative positions are maintained

Scenario: Move with arrow keys
  Given I have shapes selected
  When I press an arrow key
  Then the shapes move by the grid increment (or 1px if grid is off)
  When I press Shift+arrow key
  Then the shapes move by 10x the normal increment

Scenario: Constrain movement axis
  Given I am dragging a shape
  When I hold Shift
  Then movement is constrained to horizontal or vertical only
```

---

#### E03-US04: Resize Shapes

**As a** user
**I want** to resize shapes using handles
**So that** I can adjust their dimensions

**Priority:** P0
**Story Points:** 5

**Acceptance Criteria:**

```gherkin
Scenario: Resize from corner handle
  Given I have a shape selected
  When I drag a corner resize handle
  Then the shape resizes from that corner
  And the opposite corner stays fixed
  And text inside the shape reflows

Scenario: Resize maintaining aspect ratio
  Given I am dragging a resize handle
  When I hold Shift
  Then the aspect ratio is preserved

Scenario: Resize from center
  Given I am dragging a resize handle
  When I hold Alt
  Then the shape resizes from its center
  And opposite edges move equally

Scenario: Resize from edge handle
  Given I have a shape selected
  When I drag a midpoint (edge) handle
  Then only that dimension (width or height) changes

Scenario: Minimum size enforcement
  Given I am resizing a shape
  When I try to make it smaller than 10x10 pixels
  Then the size stops at the minimum dimension
```

---

#### E03-US05: Rotate Shapes

**As a** user
**I want** to rotate shapes
**So that** I can orient them as needed

**Priority:** P1
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Rotate using handle
  Given I have a shape selected
  When I drag the rotation handle (above top-center)
  Then the shape rotates around its center
  And the rotation angle is shown during rotation

Scenario: Constrain rotation angle
  Given I am rotating a shape
  When I hold Shift
  Then rotation snaps to 15-degree increments

Scenario: Rotate via property panel
  Given I have a shape selected
  When I enter a rotation value in the property panel
  Then the shape rotates to that exact angle

Scenario: Rotate multiple shapes
  Given I have multiple shapes selected
  When I rotate using the handle
  Then all shapes rotate around the selection's center point
```

---

#### E03-US06: Delete Shapes

**As a** user
**I want** to delete shapes
**So that** I can remove unwanted elements

**Priority:** P0
**Story Points:** 1

**Acceptance Criteria:**

```gherkin
Scenario: Delete with keyboard
  Given I have one or more shapes selected
  When I press Delete or Backspace
  Then all selected shapes are removed
  And any connections to those shapes are also removed
  And the action can be undone

Scenario: Delete from context menu
  Given I have shapes selected
  When I right-click and select "Delete"
  Then the shapes are deleted

Scenario: Delete from menu
  Given I have shapes selected
  When I select "Edit > Delete"
  Then the shapes are deleted
```

---

#### E03-US07: Duplicate Shapes

**As a** user
**I want** to duplicate shapes
**So that** I can quickly create copies

**Priority:** P0
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Duplicate with keyboard
  Given I have one or more shapes selected
  When I press Ctrl+D
  Then copies of the selected shapes are created
  And the copies are offset slightly from the originals
  And the copies become the new selection

Scenario: Duplicate maintains properties
  Given I duplicate a styled shape
  Then the copy has identical fill, stroke, text, and other properties

Scenario: Duplicate with connections
  Given I have selected shapes that have connections between them
  When I duplicate
  Then the connections between the selected shapes are also duplicated
```

---

#### E03-US08: Copy and Paste Shapes

**As a** user
**I want** to copy and paste shapes
**So that** I can reuse elements and move them between diagrams

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Copy shapes
  Given I have shapes selected
  When I press Ctrl+C
  Then the shapes are copied to the clipboard
  And a subtle notification confirms the copy

Scenario: Paste shapes
  Given I have copied shapes
  When I press Ctrl+V
  Then the shapes are pasted onto the canvas
  And they are offset from the original position
  And the pasted shapes become selected

Scenario: Paste at mouse position
  Given I have copied shapes
  When I right-click on the canvas and select "Paste Here"
  Then the shapes are pasted centered at the click position

Scenario: Cut shapes
  Given I have shapes selected
  When I press Ctrl+X
  Then the shapes are copied and removed from the canvas
```

---

#### E03-US09: Lock Shapes

**As a** user
**I want** to lock shapes
**So that** I don't accidentally move or modify them

**Priority:** P2
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Lock shape
  Given I have a shape selected
  When I press Ctrl+L or select "Lock" from context menu
  Then the shape is locked
  And it cannot be moved, resized, or rotated
  And a lock icon appears on the shape

Scenario: Select locked shape
  Given a shape is locked
  When I click on it
  Then it is selected
  And the property panel shows it as locked
  But resize/rotation handles are not shown

Scenario: Unlock shape
  Given I have a locked shape selected
  When I press Ctrl+L or select "Unlock"
  Then the shape is unlocked
  And it can be manipulated normally
```

---

#### E03-US10: Bring to Front / Send to Back

**As a** user
**I want** to change the z-order of shapes
**So that** I can control which shapes appear on top

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Bring to front
  Given I have a shape selected
  When I press Ctrl+Shift+] or select "Arrange > Bring to Front"
  Then the shape moves to the top of the z-order
  And it appears above all other shapes

Scenario: Send to back
  Given I have a shape selected
  When I press Ctrl+Shift+[ or select "Arrange > Send to Back"
  Then the shape moves to the bottom of the z-order

Scenario: Bring forward one level
  Given I have a shape selected
  When I press Ctrl+] or select "Arrange > Bring Forward"
  Then the shape moves up one level in the z-order

Scenario: Send backward one level
  Given I have a shape selected
  When I press Ctrl+[ or select "Arrange > Send Backward"
  Then the shape moves down one level in the z-order
```

---

#### E03-US11: Align Shapes

**As a** user
**I want** to align multiple shapes
**So that** I can create neat, organized diagrams

**Priority:** P1
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Align left
  Given I have multiple shapes selected
  When I select "Arrange > Align > Left"
  Then all shapes align their left edges to the leftmost shape's left edge

Scenario: Align center horizontal
  Given I have multiple shapes selected
  When I select "Arrange > Align > Center Horizontal"
  Then all shapes align their horizontal centers

Scenario: Align right
  Given I have multiple shapes selected
  When I select "Arrange > Align > Right"
  Then all shapes align their right edges to the rightmost shape's right edge

Scenario: Align top, middle, bottom
  Given I have multiple shapes selected
  When I select vertical alignment options
  Then shapes align accordingly on the vertical axis

Scenario: Single shape alignment
  Given I have only one shape selected
  Then alignment options are disabled or grayed out
```

---

#### E03-US12: Distribute Shapes

**As a** user
**I want** to distribute shapes evenly
**So that** I can create consistent spacing

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Distribute horizontally
  Given I have 3 or more shapes selected
  When I select "Arrange > Distribute > Horizontal"
  Then the shapes are evenly spaced horizontally
  And the leftmost and rightmost shapes stay in place
  And middle shapes are repositioned

Scenario: Distribute vertically
  Given I have 3 or more shapes selected
  When I select "Arrange > Distribute > Vertical"
  Then the shapes are evenly spaced vertically

Scenario: Fewer than 3 shapes
  Given I have fewer than 3 shapes selected
  Then distribution options are disabled
```

---

### Epic E04: Shape Styling

#### E04-US01: Change Fill Color

**As a** user
**I want** to change the fill color of shapes
**So that** I can visually distinguish different elements

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Select fill color from picker
  Given I have a shape selected
  When I click the fill color option in the property panel
  Then a color picker appears
  When I select a color
  Then the shape's fill changes to that color

Scenario: Enter hex color
  Given I have a shape selected
  When I enter a hex color code (e.g., #FF5733)
  Then the shape's fill changes to that color

Scenario: Recent colors
  Given I have used colors previously
  When I open the color picker
  Then I see a row of recently used colors
  And I can quickly select from them

Scenario: No fill (transparent)
  Given I have a shape selected
  When I set fill to "None" or transparent
  Then the shape has no fill
  And underlying elements are visible through it
```

---

#### E04-US02: Change Fill Opacity

**As a** user
**I want** to adjust fill opacity
**So that** I can create layered visual effects

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Adjust opacity slider
  Given I have a shape selected
  When I adjust the fill opacity slider (0-100%)
  Then the shape's fill becomes more or less transparent
  And the change is previewed in real-time

Scenario: Enter opacity value
  Given I have a shape selected
  When I enter an opacity percentage
  Then the fill opacity is set to that value
```

---

#### E04-US03: Change Stroke Color

**As a** user
**I want** to change the stroke (border) color
**So that** I can customize shape outlines

**Priority:** P0
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Select stroke color
  Given I have a shape selected
  When I click the stroke color option
  Then a color picker appears
  When I select a color
  Then the shape's stroke changes to that color

Scenario: No stroke
  Given I have a shape selected
  When I set stroke to "None"
  Then the shape has no visible border
```

---

#### E04-US04: Change Stroke Width

**As a** user
**I want** to adjust stroke width
**So that** I can emphasize or de-emphasize borders

**Priority:** P0
**Story Points:** 1

**Acceptance Criteria:**

```gherkin
Scenario: Adjust stroke width
  Given I have a shape selected
  When I change the stroke width (e.g., 1px, 2px, 4px)
  Then the shape's border thickness changes
  And the change is previewed in real-time

Scenario: Stroke width presets
  Given I am adjusting stroke width
  Then I can choose from presets (1, 2, 3, 4, 5 px)
  Or I can enter a custom value
```

---

#### E04-US05: Change Stroke Style

**As a** user
**I want** to change stroke style
**So that** I can indicate different types of relationships

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Select stroke style
  Given I have a shape selected
  When I select a stroke style (solid, dashed, dotted)
  Then the shape's border style changes accordingly

Scenario: Custom dash pattern
  Given I select "dashed" stroke style
  When I adjust dash length and gap
  Then the pattern updates to match my settings
```

---

#### E04-US06: Add Corner Radius

**As a** user
**I want** to round the corners of rectangles
**So that** I can create softer-looking shapes

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Adjust corner radius
  Given I have a rectangle selected
  When I adjust the corner radius slider
  Then the corners become rounded
  And the change is previewed in real-time

Scenario: Maximum corner radius
  Given I increase corner radius to half the shortest side
  Then the rectangle becomes a pill/stadium shape
  And corner radius cannot exceed this maximum
```

---

#### E04-US07: Add Shadow

**As a** user
**I want** to add shadows to shapes
**So that** I can create depth and emphasis

**Priority:** P2
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Enable shadow
  Given I have a shape selected
  When I enable shadow in the style panel
  Then a drop shadow appears behind the shape

Scenario: Customize shadow
  Given I have enabled shadow
  When I adjust shadow properties (offset X, Y, blur, color)
  Then the shadow updates accordingly
```

---

#### E04-US08: Apply Style to Multiple Shapes

**As a** user
**I want** to apply styles to multiple shapes at once
**So that** I can maintain consistency efficiently

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Style multiple selections
  Given I have multiple shapes selected
  When I change any style property (fill, stroke, etc.)
  Then all selected shapes update with that property

Scenario: Copy style
  Given I have a styled shape selected
  When I press Ctrl+Shift+C or select "Copy Style"
  Then the style is copied

Scenario: Paste style
  Given I have copied a style
  And I have other shapes selected
  When I press Ctrl+Shift+V or select "Paste Style"
  Then the style is applied to all selected shapes
```

---

### Epic E05: Text Editing

#### E05-US01: Add Text Inside Shape

**As a** user
**I want** to add text inside shapes
**So that** I can label diagram elements

**Priority:** P0
**Story Points:** 5

**Acceptance Criteria:**

```gherkin
Scenario: Double-click to edit text
  Given I have a shape on the canvas
  When I double-click on the shape
  Then text editing mode is activated
  And a cursor appears inside the shape
  And I can start typing

Scenario: Text wraps within shape
  Given I am typing text inside a shape
  When the text reaches the shape boundary
  Then the text wraps to the next line

Scenario: Save text on exit
  Given I am editing text inside a shape
  When I click outside the shape or press Escape
  Then the text is saved
  And text editing mode ends
```

---

#### E05-US02: Format Text - Bold, Italic, Underline

**As a** user
**I want** to format text with bold, italic, and underline
**So that** I can emphasize important words

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Apply bold formatting
  Given I am editing text and have selected some text
  When I press Ctrl+B or click the Bold button
  Then the selected text becomes bold

Scenario: Apply italic formatting
  Given I have text selected
  When I press Ctrl+I or click the Italic button
  Then the selected text becomes italic

Scenario: Apply underline formatting
  Given I have text selected
  When I press Ctrl+U or click the Underline button
  Then the selected text becomes underlined

Scenario: Toggle formatting
  Given I have bold text selected
  When I press Ctrl+B
  Then the bold formatting is removed
```

---

#### E05-US03: Change Font Family

**As a** user
**I want** to change the font family
**So that** I can match my organization's branding

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Select font family
  Given I have text selected or am in text editing mode
  When I select a font from the font dropdown
  Then the text changes to that font

Scenario: Available fonts
  Given I open the font dropdown
  Then I see a list of web-safe fonts
  And each font is previewed in its own typeface

Scenario: Default font
  Given I create a new text element
  Then the default font is applied (e.g., Arial, Helvetica)
```

---

#### E05-US04: Change Font Size

**As a** user
**I want** to change font size
**So that** I can create visual hierarchy

**Priority:** P0
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Select font size
  Given I have text selected
  When I select a size from the dropdown (e.g., 12, 14, 16, 18, 24, 36)
  Then the text size changes

Scenario: Enter custom size
  Given I have text selected
  When I enter a custom font size (e.g., 15)
  Then the text changes to that size

Scenario: Increase/decrease size
  Given I have text selected
  When I press Ctrl+Shift+> or Ctrl+Shift+<
  Then the font size increases or decreases by 2px
```

---

#### E05-US05: Change Text Color

**As a** user
**I want** to change text color
**So that** I can make text visible on different backgrounds

**Priority:** P0
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Select text color
  Given I have text selected
  When I click the text color button and choose a color
  Then the selected text changes to that color

Scenario: Different colors within shape
  Given I am editing text in a shape
  When I select part of the text and change its color
  Then only the selected portion changes color
  And other text retains its original color
```

---

#### E05-US06: Text Alignment

**As a** user
**I want** to align text within shapes
**So that** I can control text positioning

**Priority:** P0
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Horizontal alignment
  Given I have a shape with text selected
  When I choose left, center, or right alignment
  Then the text aligns horizontally within the shape

Scenario: Vertical alignment
  Given I have a shape with text selected
  When I choose top, middle, or bottom vertical alignment
  Then the text aligns vertically within the shape

Scenario: Combined alignment
  Given I set horizontal to center and vertical to middle
  Then the text is perfectly centered in the shape
```

---

#### E05-US07: Add Label Below Shape

**As a** user
**I want** to add a label below a shape
**So that** I can identify shapes without cluttering them

**Priority:** P1
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Enable below-shape label
  Given I have a shape selected
  When I enable "Label Below" in the property panel
  Then a text area appears below the shape
  And I can enter text there

Scenario: Label follows shape
  Given a shape has a label below
  When I move the shape
  Then the label moves with it
  And maintains its relative position

Scenario: Style label independently
  Given a shape has a label
  Then I can style the label text independently of the shape text
```

---

#### E05-US08: Edit Text with Rich Text Editor

**As a** user
**I want** a rich text editing experience
**So that** I can easily format text

**Priority:** P1
**Story Points:** 5

**Acceptance Criteria:**

```gherkin
Scenario: Text editing toolbar appears
  Given I double-click to edit text
  Then a formatting toolbar appears near the text
  And it includes bold, italic, underline, font, size, color options

Scenario: Select text with mouse
  Given I am editing text
  When I click and drag across text
  Then the text is selected and highlighted

Scenario: Keyboard selection
  Given I am editing text
  When I hold Shift and press arrow keys
  Then text is selected character by character or word by word (Ctrl+Shift+Arrow)
```

---

#### E05-US09: Text Overflow Handling

**As a** user
**I want** control over how text handles overflow
**So that** I can manage text that exceeds shape bounds

**Priority:** P2
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Clip overflow
  Given text exceeds shape bounds
  When overflow is set to "clip"
  Then text is hidden beyond the shape boundary

Scenario: Resize shape to fit
  Given text exceeds shape bounds
  When I enable "auto-resize"
  Then the shape grows to fit all text

Scenario: Ellipsis overflow
  Given text exceeds shape bounds on a single line
  When overflow is set to "ellipsis"
  Then text ends with "..." where it overflows
```

---

#### E05-US10: Standalone Text Formatting

**As a** user
**I want** standalone text boxes with full formatting
**So that** I can add annotations anywhere on the canvas

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Format standalone text
  Given I have created a standalone text box
  Then I can apply all text formatting options
  And I can resize the text box
  And text wraps within the box dimensions
```

---

### Epic E06: Connections

#### E06-US01: Create Connection Between Shapes

**As a** user
**I want** to connect shapes with lines
**So that** I can show relationships between elements

**Priority:** P0
**Story Points:** 5

**Acceptance Criteria:**

```gherkin
Scenario: Draw connection from anchor to anchor
  Given I have the Connection tool active (press C)
  When I click on a shape's anchor point
  And drag to another shape's anchor point
  Then a connection line is created between the two shapes
  And the connection is attached to both shapes

Scenario: Connection follows shapes
  Given two shapes are connected
  When I move either shape
  Then the connection line updates
  And remains attached to both shapes

Scenario: Anchor points highlight on hover
  Given I have the Connection tool active
  When I hover over a shape
  Then available anchor points are highlighted
  And I can see where connections can attach
```

---

#### E06-US02: Connection Anchor Points

**As a** user
**I want** predefined anchor points on shapes
**So that** I can attach connections at specific locations

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Default anchor points
  Given I have a shape
  Then it has anchor points at:
    - Top center
    - Right center
    - Bottom center
    - Left center
    - (Optional) Corners

Scenario: Snap to nearest anchor
  Given I am creating a connection
  When I hover near an anchor point
  Then the connection snaps to that anchor

Scenario: Free connection point
  Given I am creating a connection
  When I click on a shape away from anchor points
  Then the connection attaches at that exact position
  Or I can choose to snap to the nearest anchor
```

---

#### E06-US03: Straight Line Connections

**As a** user
**I want** straight line connections
**So that** I can create simple, direct relationships

**Priority:** P0
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Create straight connection
  Given I set connection style to "straight"
  When I create a connection between two shapes
  Then a direct line is drawn between anchor points

Scenario: Straight line updates
  Given I have a straight connection
  When I move either connected shape
  Then the line adjusts to maintain the direct path
```

---

#### E06-US04: Curved (Bezier) Connections

**As a** user
**I want** curved connections
**So that** I can create smooth, flowing diagrams

**Priority:** P0
**Story Points:** 5

**Acceptance Criteria:**

```gherkin
Scenario: Create curved connection
  Given I set connection style to "curved"
  When I create a connection between two shapes
  Then a smooth bezier curve connects them

Scenario: Automatic curve control points
  Given I have a curved connection
  Then control points are automatically calculated
  And the curve smoothly exits and enters shapes

Scenario: Manual curve adjustment
  Given I select a curved connection
  When I drag the curve's control points
  Then the curve shape adjusts
  And control points are visible when selected
```

---

#### E06-US05: Orthogonal Connections

**As a** user
**I want** orthogonal (right-angle) connections
**So that** I can create clean, structured diagrams

**Priority:** P1
**Story Points:** 5

**Acceptance Criteria:**

```gherkin
Scenario: Create orthogonal connection
  Given I set connection style to "orthogonal"
  When I create a connection between two shapes
  Then the line uses only horizontal and vertical segments
  And the path routes around obstacles if possible

Scenario: Auto-routing
  Given I have an orthogonal connection
  When I move a connected shape
  Then the path recalculates
  And maintains orthogonal segments
```

---

#### E06-US06: Add Arrow to Connection Start

**As a** user
**I want** to add an arrow to the start of a connection
**So that** I can indicate direction

**Priority:** P0
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Enable start arrow
  Given I have a connection selected
  When I enable "Start Arrow" in the property panel
  Then an arrow appears at the source end of the connection

Scenario: Choose arrow style
  Given I am configuring a start arrow
  When I select a style (arrow, open arrow, diamond, circle)
  Then the arrow changes to that style

Scenario: Disable start arrow
  Given I have a connection with a start arrow
  When I set start arrow to "None"
  Then the arrow is removed
```

---

#### E06-US07: Add Arrow to Connection End

**As a** user
**I want** to add an arrow to the end of a connection
**So that** I can indicate flow direction

**Priority:** P0
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Default end arrow
  Given I create a new connection
  Then it has an arrow at the end by default

Scenario: Configure end arrow
  Given I have a connection selected
  When I choose an end arrow style
  Then the arrow at the target end changes

Scenario: Both arrows
  Given I have a connection
  When I enable both start and end arrows
  Then arrows appear at both ends
  And they can have different styles
```

---

#### E06-US08: Connection Line Styling

**As a** user
**I want** to style connection lines
**So that** I can distinguish different types of relationships

**Priority:** P0
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Change connection color
  Given I have a connection selected
  When I change the stroke color
  Then the connection line and arrows change color

Scenario: Change line thickness
  Given I have a connection selected
  When I change the stroke width
  Then the connection becomes thicker or thinner

Scenario: Change line style
  Given I have a connection selected
  When I select dashed or dotted style
  Then the connection line pattern changes
```

---

#### E06-US09: Add Label to Connection

**As a** user
**I want** to add text labels to connections
**So that** I can describe relationships

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Add connection label
  Given I have a connection selected
  When I double-click on the connection
  Then a text input appears on the connection
  And I can type a label

Scenario: Position label
  Given a connection has a label
  When I drag the label
  Then I can position it along the connection path
  Or offset it from the line

Scenario: Label follows connection
  Given a connection has a label
  When I move connected shapes
  Then the label moves with the connection
  And maintains its relative position
```

---

#### E06-US10: Text on Connection Path

**As a** user
**I want** text to follow the connection curve
**So that** labels integrate smoothly with curved connections

**Priority:** P1
**Story Points:** 4

**Acceptance Criteria:**

```gherkin
Scenario: Text follows curve
  Given I have a curved connection with a label
  When I enable "Text on Path"
  Then the text curves along the connection line

Scenario: Text orientation
  Given text is following a path
  When the curve changes direction significantly
  Then text remains readable (not upside down)

Scenario: Toggle text on path
  Given I have a connection label
  When I toggle "Text on Path" off
  Then the text displays horizontally near the connection
```

---

#### E06-US11: Disconnect Connection

**As a** user
**I want** to disconnect connections from shapes
**So that** I can reattach them elsewhere

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Drag endpoint to disconnect
  Given I have a connection attached to a shape
  When I drag the connection endpoint away from the shape
  Then the connection detaches
  And becomes a floating endpoint

Scenario: Reattach connection
  Given I have a connection with a floating endpoint
  When I drag the endpoint to another shape's anchor
  Then the connection attaches to the new shape
```

---

#### E06-US12: Delete Connection

**As a** user
**I want** to delete connections
**So that** I can remove incorrect or unwanted relationships

**Priority:** P0
**Story Points:** 1

**Acceptance Criteria:**

```gherkin
Scenario: Select and delete connection
  Given I click on a connection to select it
  When I press Delete
  Then the connection is removed
  And the connected shapes are unaffected
```

---

#### E06-US13: Waypoints on Connections

**As a** user
**I want** to add waypoints to connections
**So that** I can control the path precisely

**Priority:** P2
**Story Points:** 4

**Acceptance Criteria:**

```gherkin
Scenario: Add waypoint
  Given I have a connection selected
  When I double-click on the connection line
  Then a waypoint is added at that position
  And I can drag it to adjust the path

Scenario: Remove waypoint
  Given I have a connection with waypoints
  When I double-click on a waypoint
  Then the waypoint is removed
  And the path recalculates

Scenario: Multiple waypoints
  Given I have a connection
  When I add multiple waypoints
  Then the connection passes through all of them in order
```

---

#### E06-US14: Connection Selection and Highlighting

**As a** user
**I want** clear visual feedback when selecting connections
**So that** I can easily work with them

**Priority:** P0
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Hover highlight
  Given I hover over a connection
  Then the connection is highlighted
  And my cursor changes to indicate it's clickable

Scenario: Selection indicator
  Given I click on a connection
  Then the connection shows as selected
  And endpoints and any waypoints are visible
  And the property panel shows connection properties
```

---

### Epic E07: Organization & Layers

#### E07-US01: Group Shapes

**As a** user
**I want** to group shapes together
**So that** I can move and manipulate them as one unit

**Priority:** P1
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Create group
  Given I have multiple shapes selected
  When I press Ctrl+G or select "Group"
  Then the shapes are grouped
  And a single bounding box encompasses all shapes
  And the group can be moved as one

Scenario: Select group
  Given I have a group on the canvas
  When I click on any shape in the group
  Then the entire group is selected

Scenario: Nested groups
  Given I have groups on the canvas
  When I select multiple groups and group them
  Then a parent group is created containing the child groups
```

---

#### E07-US02: Ungroup Shapes

**As a** user
**I want** to ungroup shapes
**So that** I can edit individual elements

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Ungroup
  Given I have a group selected
  When I press Ctrl+Shift+G or select "Ungroup"
  Then the group is dissolved
  And individual shapes are now selected
  And I can move them independently

Scenario: Ungroup nested
  Given I have nested groups
  When I ungroup the parent
  Then only the top level is ungrouped
  And child groups remain grouped
```

---

#### E07-US03: Edit Group Contents

**As a** user
**I want** to edit individual shapes within a group
**So that** I don't have to ungroup to make small changes

**Priority:** P2
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Enter group
  Given I have a group on the canvas
  When I double-click on it
  Then I enter "edit group" mode
  And I can select and edit individual shapes
  And other shapes outside the group are dimmed

Scenario: Exit group editing
  Given I am in group edit mode
  When I click outside the group or press Escape
  Then I exit group edit mode
  And the group behaves as a unit again
```

---

#### E07-US04: Create Layers

**As a** user
**I want** to organize my diagram into layers
**So that** I can manage complex diagrams

**Priority:** P2
**Story Points:** 4

**Acceptance Criteria:**

```gherkin
Scenario: View layers panel
  Given I select "View > Layers Panel"
  Then a layers panel opens
  And I see a list of layers (default: one layer)

Scenario: Add layer
  Given I have the layers panel open
  When I click "Add Layer"
  Then a new layer is created above the current layer
  And I can name the layer

Scenario: Move shapes between layers
  Given I have multiple layers
  And I have shapes selected
  When I right-click and select "Move to Layer > [Layer Name]"
  Then the shapes move to that layer
```

---

#### E07-US05: Layer Visibility

**As a** user
**I want** to show/hide layers
**So that** I can focus on specific parts of the diagram

**Priority:** P2
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Toggle layer visibility
  Given I have the layers panel open
  When I click the visibility icon next to a layer
  Then all shapes on that layer are hidden/shown

Scenario: Hidden layer interaction
  Given a layer is hidden
  Then shapes on that layer cannot be selected
  And they do not appear in exports (optional setting)
```

---

#### E07-US06: Lock Layer

**As a** user
**I want** to lock layers
**So that** I don't accidentally modify background elements

**Priority:** P2
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Lock layer
  Given I have the layers panel open
  When I click the lock icon next to a layer
  Then all shapes on that layer become locked
  And they cannot be selected or modified

Scenario: Unlock layer
  Given a layer is locked
  When I click the lock icon again
  Then the layer is unlocked
  And shapes can be selected and modified
```

---

#### E07-US07: Reorder Layers

**As a** user
**I want** to reorder layers
**So that** I can control which elements appear on top

**Priority:** P2
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Drag to reorder
  Given I have multiple layers
  When I drag a layer up or down in the layers panel
  Then the layer order changes
  And shapes on higher layers appear above shapes on lower layers
```

---

#### E07-US08: Delete Layer

**As a** user
**I want** to delete layers
**So that** I can remove unused organization levels

**Priority:** P2
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Delete empty layer
  Given I have an empty layer
  When I delete it
  Then the layer is removed
  And no confirmation is required

Scenario: Delete layer with shapes
  Given I have a layer with shapes
  When I attempt to delete it
  Then a confirmation dialog appears
  And I can choose to delete shapes or move them to another layer
```

---

### Epic E08: History & Undo

#### E08-US01: Undo Action

**As a** user
**I want** to undo my last action
**So that** I can fix mistakes

**Priority:** P0
**Story Points:** 5

**Acceptance Criteria:**

```gherkin
Scenario: Undo with keyboard
  Given I have performed an action (create, move, delete, etc.)
  When I press Ctrl+Z
  Then the last action is reversed
  And the diagram returns to its previous state

Scenario: Multiple undos
  Given I have performed multiple actions
  When I press Ctrl+Z multiple times
  Then actions are undone in reverse order

Scenario: Undo limit
  Given I have performed many actions
  Then undo history keeps at least 50 actions
  And older actions beyond the limit are discarded
```

---

#### E08-US02: Redo Action

**As a** user
**I want** to redo undone actions
**So that** I can restore changes I accidentally undid

**Priority:** P0
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Redo with keyboard
  Given I have undone an action
  When I press Ctrl+Y or Ctrl+Shift+Z
  Then the action is reapplied

Scenario: Redo after new action
  Given I have undone actions
  When I perform a new action
  Then the redo history is cleared
  And I cannot redo the previously undone actions
```

---

#### E08-US03: History Panel

**As a** user
**I want** to see a history of my actions
**So that** I can navigate to a specific point

**Priority:** P3
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: View history panel
  Given I select "View > History"
  Then a history panel opens
  And I see a list of actions with descriptions

Scenario: Jump to history state
  Given I have the history panel open
  When I click on a previous action
  Then the diagram jumps to that state
  And subsequent actions are grayed out (available for redo)
```

---

#### E08-US04: Undo/Redo Menu Items

**As a** user
**I want** undo/redo available in menus
**So that** I can access them without keyboard

**Priority:** P1
**Story Points:** 1

**Acceptance Criteria:**

```gherkin
Scenario: Edit menu undo
  Given I open the Edit menu
  Then I see "Undo" with Ctrl+Z shortcut
  When I click it
  Then the last action is undone

Scenario: Disabled when unavailable
  Given there is nothing to undo
  Then the Undo menu item is disabled/grayed out
```

---

### Epic E09: File Operations

#### E09-US01: Create New Diagram

**As a** user
**I want** to create a new blank diagram
**So that** I can start a fresh project

**Priority:** P0
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: New diagram from menu
  Given I select "File > New" or press Ctrl+N
  Then a new blank diagram is created
  And the canvas is cleared

Scenario: Prompt to save changes
  Given I have unsaved changes
  When I create a new diagram
  Then I am prompted to save the current diagram
  And I can choose Save, Don't Save, or Cancel

Scenario: New diagram in new tab (optional)
  Given I select "File > New in New Tab"
  Then a new browser tab opens with a blank diagram
```

---

#### E09-US02: Save Diagram Locally

**As a** user
**I want** to save my diagram to my computer
**So that** I can preserve my work

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Save new diagram
  Given I have a new, unsaved diagram
  When I press Ctrl+S or select "File > Save"
  Then a file save dialog appears
  And I can choose location and filename
  And the file is saved in native format (.ndio)

Scenario: Save existing diagram
  Given I have opened or previously saved a diagram
  When I press Ctrl+S
  Then the file is saved to the same location
  And no dialog appears

Scenario: Save As
  Given I have a diagram open
  When I select "File > Save As" or press Ctrl+Shift+S
  Then a file save dialog appears
  And I can save a copy with a new name or location
```

---

#### E09-US03: Open Diagram from File

**As a** user
**I want** to open a saved diagram
**So that** I can continue working on it

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Open file dialog
  Given I select "File > Open" or press Ctrl+O
  Then a file picker dialog appears
  And I can browse for .ndio or .drawio files

Scenario: Open file
  Given I have selected a valid diagram file
  When I click Open
  Then the file is loaded
  And the diagram appears on the canvas
  And the filename appears in the title bar

Scenario: Invalid file error
  Given I try to open an invalid or corrupted file
  Then an error message is displayed
  And my current work is unaffected
```

---

#### E09-US04: Auto-Save

**As a** user
**I want** my work to be auto-saved
**So that** I don't lose work if something goes wrong

**Priority:** P1
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Auto-save to local storage
  Given I am working on a diagram
  Then my work is automatically saved to browser local storage every 30 seconds

Scenario: Recover auto-saved work
  Given the browser crashed or I closed without saving
  When I reopen the application
  Then I am prompted to recover unsaved work
  And I can choose to restore or discard

Scenario: Auto-save indicator
  Given auto-save is active
  Then a subtle indicator shows the last auto-save time
```

---

#### E09-US05: Recent Files

**As a** user
**I want** to see recently opened files
**So that** I can quickly access my work

**Priority:** P2
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Recent files list
  Given I open the File menu
  Then I see a "Recent Files" submenu
  And it lists the last 10 opened files

Scenario: Open from recent
  Given I click on a file in the recent files list
  Then that diagram is opened

Scenario: Clear recent files
  Given I am in the recent files submenu
  Then I can select "Clear Recent Files"
  And the list is emptied
```

---

#### E09-US06: Drag and Drop to Open

**As a** user
**I want** to drag files onto the application to open them
**So that** I can open files quickly

**Priority:** P2
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Drag and drop file
  Given I have the application open
  When I drag a .ndio or .drawio file onto the canvas
  Then the file is opened
  And the diagram is displayed

Scenario: Visual feedback
  Given I am dragging a file over the application
  Then the drop zone is highlighted
  And I can see that dropping will open the file
```

---

#### E09-US07: Close Diagram

**As a** user
**I want** to close the current diagram
**So that** I can start fresh or exit

**Priority:** P1
**Story Points:** 1

**Acceptance Criteria:**

```gherkin
Scenario: Close with unsaved changes
  Given I have unsaved changes
  When I try to close the diagram or navigate away
  Then I am prompted to save
  And I can choose Save, Don't Save, or Cancel

Scenario: Close saved diagram
  Given I have no unsaved changes
  When I close the diagram
  Then it closes without prompting
```

---

#### E09-US08: Document Title

**As a** user
**I want** to see and edit the document title
**So that** I know which file I'm working on

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Display filename
  Given I have a saved diagram open
  Then the filename appears in the browser tab and/or header

Scenario: Unsaved indicator
  Given I have unsaved changes
  Then an asterisk (*) or dot appears next to the filename

Scenario: Rename document
  Given I click on the document title
  Then I can edit it inline
  When I save, the file is saved with the new name
```

---

#### E09-US09: Template Support

**As a** user
**I want** to start from templates
**So that** I don't have to build common diagrams from scratch

**Priority:** P3
**Story Points:** 4

**Acceptance Criteria:**

```gherkin
Scenario: Template gallery
  Given I select "File > New from Template"
  Then a template gallery dialog appears
  And I see categories (Flowchart, Network, UML, etc.)

Scenario: Create from template
  Given I select a template
  When I click "Use Template"
  Then a new diagram is created with the template content
  And I can modify it as needed
```

---

#### E09-US10: File Information

**As a** user
**I want** to see file information
**So that** I can track document metadata

**Priority:** P3
**Story Points:** 1

**Acceptance Criteria:**

```gherkin
Scenario: View file info
  Given I select "File > Properties" or "File > Info"
  Then a dialog shows:
    - Created date
    - Last modified date
    - File size
    - Number of shapes
    - Author (if cloud-saved)
```

---

#### E09-US11: Confirm Before Closing Browser

**As a** user
**I want** to be warned before accidentally closing the browser
**So that** I don't lose unsaved work

**Priority:** P1
**Story Points:** 1

**Acceptance Criteria:**

```gherkin
Scenario: Browser close warning
  Given I have unsaved changes
  When I try to close the browser tab or refresh
  Then the browser shows a warning dialog
  And I must confirm to leave
```

---

#### E09-US12: Import Image as Background

**As a** user
**I want** to import an image as a background
**So that** I can trace or annotate existing diagrams

**Priority:** P3
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Import background image
  Given I select "File > Import > Image as Background"
  When I select an image file
  Then the image is placed as a background layer
  And it is locked by default
  And shapes appear on top of it
```

---

### Epic E10: draw.io Compatibility

#### E10-US01: Export to draw.io Format

**As a** user
**I want** to export my diagram in draw.io format
**So that** I can share it with draw.io users

**Priority:** P0
**Story Points:** 8

**Acceptance Criteria:**

```gherkin
Scenario: Export as .drawio
  Given I select "File > Export > draw.io (.drawio)"
  Then a file is generated in mxGraph XML format
  And I can save it with .drawio extension

Scenario: Shapes are preserved
  Given I export a diagram with various shapes
  Then all shapes appear in draw.io
  And their positions, sizes, and styles are maintained

Scenario: Connections are preserved
  Given I export a diagram with connections
  Then connections appear in draw.io
  And they remain attached to the correct shapes
  And arrow styles are preserved

Scenario: Text is preserved
  Given I export a diagram with text
  Then text appears correctly in draw.io
  And formatting (bold, italic, color) is preserved
```

---

#### E10-US02: Import draw.io Files

**As a** user
**I want** to open draw.io files
**So that** I can edit diagrams created in draw.io

**Priority:** P0
**Story Points:** 8

**Acceptance Criteria:**

```gherkin
Scenario: Open .drawio file
  Given I open a .drawio file
  Then the diagram is rendered correctly
  And shapes appear in their positions
  And connections are attached properly

Scenario: Unsupported features warning
  Given I open a .drawio file with unsupported features
  Then a warning lists what couldn't be imported
  And the rest of the diagram loads correctly

Scenario: Preserve round-trip
  Given I open a .drawio file, make changes, and export
  Then the parts I didn't change remain unchanged
  And draw.io can still open the file
```

---

#### E10-US03: Style Mapping

**As a** user
**I want** styles to map correctly between formats
**So that** my diagrams look the same

**Priority:** P0
**Story Points:** 5

**Acceptance Criteria:**

```gherkin
Scenario: Fill colors match
  Given I have a shape with a specific fill color
  When I export to .drawio and open in draw.io
  Then the fill color matches exactly

Scenario: Stroke styles match
  Given I have shapes with various stroke styles
  When I export and import
  Then solid, dashed, and dotted strokes are preserved

Scenario: Font styles match
  Given I have formatted text
  When I export and import
  Then font family, size, color, and styles are preserved
```

---

#### E10-US04: Connection Types Mapping

**As a** user
**I want** connection types to map correctly
**So that** my diagram structure is preserved

**Priority:** P0
**Story Points:** 4

**Acceptance Criteria:**

```gherkin
Scenario: Arrow types preserved
  Given I have connections with various arrow types
  When I export to .drawio
  Then arrow types match draw.io equivalents

Scenario: Curve types preserved
  Given I have straight, curved, and orthogonal connections
  When I export and import
  Then the connection types are maintained
```

---

#### E10-US05: Layer Compatibility

**As a** user
**I want** layers to work with draw.io
**So that** complex diagrams maintain their organization

**Priority:** P2
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Export layers
  Given I have a diagram with multiple layers
  When I export to .drawio
  Then layers are preserved in the file
  And draw.io recognizes them

Scenario: Import layers
  Given I open a .drawio file with layers
  Then layers appear in my layers panel
  And shapes are on the correct layers
```

---

#### E10-US06: XML Compression

**As a** user
**I want** exported files to be reasonably sized
**So that** I can share them easily

**Priority:** P2
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Compressed export option
  Given I export a large diagram
  Then I can choose to compress the XML
  And the file size is significantly smaller
  And draw.io can still open it
```

---

### Epic E11: User Interface

#### E11-US01: Toolbar Display

**As a** user
**I want** a toolbar with common tools
**So that** I can quickly access drawing functions

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Toolbar visibility
  Given I open the application
  Then a toolbar is visible at the top or left side
  And it contains shape tools, selection tool, connection tool

Scenario: Tool selection
  Given I click on a tool in the toolbar
  Then that tool becomes active
  And the button appears pressed/highlighted
  And my cursor may change to indicate the active tool

Scenario: Tooltips
  Given I hover over a toolbar button
  Then a tooltip appears with the tool name and shortcut
```

---

#### E11-US02: Property Panel

**As a** user
**I want** a property panel
**So that** I can view and edit properties of selected elements

**Priority:** P0
**Story Points:** 5

**Acceptance Criteria:**

```gherkin
Scenario: Show properties for selection
  Given I select a shape
  Then the property panel shows that shape's properties
  And I can modify fill, stroke, text, size, position

Scenario: No selection
  Given nothing is selected
  Then the property panel shows canvas properties
  Or it displays instructions to select an element

Scenario: Multiple selection
  Given I have multiple shapes selected
  Then the property panel shows common properties
  And changing a property affects all selected shapes
  And conflicting values show as "Multiple values"
```

---

#### E11-US03: Menu Bar

**As a** user
**I want** a menu bar
**So that** I can access all features organized by category

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Menu bar display
  Given I open the application
  Then a menu bar is displayed with: File, Edit, View, Insert, Format, Arrange, Help

Scenario: Menu interaction
  Given I click on a menu item
  Then a dropdown appears with available options
  And keyboard shortcuts are shown next to menu items

Scenario: Nested menus
  Given a menu item has a submenu
  Then hovering or clicking reveals the submenu
```

---

#### E11-US04: Context Menu

**As a** user
**I want** a right-click context menu
**So that** I can quickly access relevant actions

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Context menu on shape
  Given I right-click on a shape
  Then a context menu appears with options:
    - Cut, Copy, Paste
    - Duplicate
    - Delete
    - Bring to Front, Send to Back
    - Lock/Unlock
    - Group (if multiple selected)

Scenario: Context menu on canvas
  Given I right-click on empty canvas
  Then a context menu appears with:
    - Paste
    - Select All
    - Zoom options

Scenario: Context menu on connection
  Given I right-click on a connection
  Then relevant connection options appear
```

---

#### E11-US05: Status Bar

**As a** user
**I want** a status bar
**So that** I can see useful information at a glance

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Display information
  Given I am using the application
  Then the status bar shows:
    - Current zoom level
    - Mouse position on canvas
    - Number of selected objects
    - Optional: hints/tips

Scenario: Interactive zoom
  Given I click on the zoom percentage
  Then I can type a custom zoom level
  Or a zoom slider appears
```

---

#### E11-US06: Panel Toggling

**As a** user
**I want** to show/hide panels
**So that** I can maximize canvas space

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Toggle property panel
  Given I select "View > Property Panel" or press a shortcut
  Then the property panel shows or hides
  And the canvas area adjusts accordingly

Scenario: Collapse panels
  Given I click the collapse button on a panel
  Then the panel collapses to a minimal state
  And I can click again to expand
```

---

#### E11-US07: Dark Mode

**As a** user
**I want** a dark mode option
**So that** I can work comfortably in low-light conditions

**Priority:** P2
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Toggle dark mode
  Given I select "View > Dark Mode" or click a theme toggle
  Then the UI switches to dark colors
  And the canvas background can optionally darken

Scenario: Remember preference
  Given I enable dark mode
  When I reload the application
  Then dark mode remains active

Scenario: System preference
  Given I have dark mode set to "System"
  Then the app follows my OS dark mode setting
```

---

#### E11-US08: Responsive Layout

**As a** user
**I want** the interface to adapt to window size
**So that** I can work on different screen sizes

**Priority:** P1
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Narrow window
  Given I resize the window to be narrow
  Then toolbars may collapse or stack
  And panels may auto-hide or become overlay
  And the canvas remains usable

Scenario: Wide window
  Given I have a wide window
  Then panels can be side-by-side
  And I have more canvas space
```

---

#### E11-US09: Loading States

**As a** user
**I want** to see loading indicators
**So that** I know when the app is busy

**Priority:** P1
**Story Points:** 1

**Acceptance Criteria:**

```gherkin
Scenario: Initial load
  Given I navigate to the application
  Then a loading spinner or skeleton is shown
  Until the app is ready

Scenario: File loading
  Given I am opening a large file
  Then a progress indicator is shown
  And I can see it's loading
```

---

#### E11-US10: Error Handling UI

**As a** user
**I want** clear error messages
**So that** I know what went wrong and how to fix it

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Display error toast
  Given an error occurs (save failed, invalid file, etc.)
  Then an error toast/notification appears
  And it describes the problem clearly
  And it disappears after a few seconds or can be dismissed

Scenario: Detailed error option
  Given an error toast is shown
  When I click "Details"
  Then I see more technical information
  And I can copy it for support
```

---

### Epic E12: Keyboard Shortcuts

#### E12-US01: Tool Shortcuts

**As a** user
**I want** keyboard shortcuts for tools
**So that** I can switch tools quickly

**Priority:** P0
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Select tool shortcuts
  Given I press:
    - V for Select tool
    - R for Rectangle
    - E for Ellipse
    - L for Line
    - T for Text
    - C for Connection
  Then the corresponding tool is activated

Scenario: Escape deselects tool
  Given I have a shape tool selected
  When I press Escape
  Then the Select tool becomes active
```

---

#### E12-US02: Action Shortcuts

**As a** user
**I want** keyboard shortcuts for common actions
**So that** I can work efficiently

**Priority:** P0
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Standard shortcuts work
  Given I use the application
  Then these shortcuts work:
    - Ctrl+Z: Undo
    - Ctrl+Y: Redo
    - Ctrl+C: Copy
    - Ctrl+V: Paste
    - Ctrl+X: Cut
    - Ctrl+D: Duplicate
    - Ctrl+A: Select All
    - Delete: Delete selected
    - Ctrl+S: Save
    - Ctrl+O: Open
```

---

#### E12-US03: View Shortcuts

**As a** user
**I want** keyboard shortcuts for view operations
**So that** I can navigate quickly

**Priority:** P1
**Story Points:** 1

**Acceptance Criteria:**

```gherkin
Scenario: Zoom shortcuts
  Given I use the application
  Then these shortcuts work:
    - Ctrl++: Zoom in
    - Ctrl+-: Zoom out
    - Ctrl+0: Fit to screen
    - Ctrl+1: Actual size (100%)
```

---

#### E12-US04: Modifier Key Behaviors

**As a** user
**I want** modifier keys to modify tool behavior
**So that** I have precise control

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Shift modifier
  Given I hold Shift while:
    - Creating shapes: constrains to square/circle
    - Moving: constrains to horizontal/vertical
    - Rotating: snaps to 15-degree increments
    - Selecting: adds to selection

Scenario: Alt modifier
  Given I hold Alt while:
    - Resizing: resizes from center
    - Moving: disables snap-to-grid
    - Duplicating (Alt+drag): creates a copy

Scenario: Ctrl modifier
  Given I hold Ctrl while:
    - Clicking shapes: adds/removes from selection
    - Using arrow keys: moves by smaller increments
```

---

#### E12-US05: Shortcut Customization

**As a** user
**I want** to customize shortcuts
**So that** I can use my preferred key combinations

**Priority:** P3
**Story Points:** 4

**Acceptance Criteria:**

```gherkin
Scenario: View shortcuts
  Given I select "Help > Keyboard Shortcuts"
  Then a dialog shows all available shortcuts

Scenario: Customize shortcut
  Given I am in shortcut settings
  When I click on a shortcut and press a new key combination
  Then the shortcut is remapped
  And conflicts are detected and warned
```

---

#### E12-US06: Keyboard Accessibility

**As a** user using keyboard navigation
**I want** full keyboard support
**So that** I can use the app without a mouse

**Priority:** P2
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Tab navigation
  Given I press Tab
  Then focus moves through UI elements logically
  And focused elements have visible focus indicators

Scenario: Menu keyboard navigation
  Given I press Alt or F10
  Then focus moves to the menu bar
  And I can navigate menus with arrow keys
  And Enter activates menu items
```

---

### Epic E13: Cloud & Authentication

#### E13-US01: User Registration

**As a** new user
**I want** to create an account
**So that** I can save diagrams to the cloud

**Priority:** P2
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Register with email
  Given I click "Sign Up"
  When I enter email, password, and confirm password
  Then an account is created
  And I receive a verification email

Scenario: OAuth registration
  Given I click "Sign up with Google"
  Then I am redirected to Google auth
  And my account is created automatically

Scenario: Password requirements
  Given I enter a weak password
  Then I see password requirements
  And I must meet them to proceed
```

---

#### E13-US02: User Login

**As a** registered user
**I want** to log in
**So that** I can access my saved diagrams

**Priority:** P2
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Login with email
  Given I enter my email and password
  When I click "Log In"
  Then I am authenticated
  And I see my dashboard/recent files

Scenario: OAuth login
  Given I click "Log in with Google"
  Then I authenticate with Google
  And I am logged in

Scenario: Invalid credentials
  Given I enter wrong credentials
  Then I see an error message
  And I can try again
```

---

#### E13-US03: User Logout

**As a** logged-in user
**I want** to log out
**So that** I can secure my account

**Priority:** P2
**Story Points:** 1

**Acceptance Criteria:**

```gherkin
Scenario: Logout
  Given I click my profile menu
  When I click "Log Out"
  Then I am logged out
  And I see the login screen
```

---

#### E13-US04: Save to Cloud

**As a** logged-in user
**I want** to save diagrams to the cloud
**So that** I can access them from any device

**Priority:** P2
**Story Points:** 4

**Acceptance Criteria:**

```gherkin
Scenario: Save to cloud
  Given I am logged in
  When I press Ctrl+S or select "File > Save"
  Then the diagram is saved to my cloud storage
  And I can choose a folder/name

Scenario: Auto-save to cloud
  Given I am logged in and have enabled auto-save
  Then my diagram automatically saves to cloud periodically

Scenario: Offline mode
  Given I lose internet connection
  Then I can continue working
  And changes sync when connection is restored
```

---

#### E13-US05: Load from Cloud

**As a** logged-in user
**I want** to open diagrams from the cloud
**So that** I can continue working on any device

**Priority:** P2
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: File browser
  Given I select "File > Open from Cloud"
  Then I see a list of my saved diagrams
  And I can browse folders

Scenario: Open cloud file
  Given I click on a cloud diagram
  Then it loads in the editor
  And changes will save back to cloud
```

---

#### E13-US06: Share Diagram

**As a** logged-in user
**I want** to share diagrams with others
**So that** I can collaborate

**Priority:** P2
**Story Points:** 4

**Acceptance Criteria:**

```gherkin
Scenario: Generate share link
  Given I have a diagram saved to cloud
  When I select "Share"
  Then a shareable link is generated
  And I can set permissions (view only, can edit)

Scenario: Share with specific users
  Given I want to share with a colleague
  When I enter their email and set permissions
  Then they receive an invitation
  And can access the diagram when logged in
```

---

#### E13-US07: View Shared Diagrams

**As a** user with a shared link
**I want** to view shared diagrams
**So that** I can see what was shared with me

**Priority:** P2
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Open shared link
  Given I have a share link
  When I navigate to it
  Then the diagram opens
  And I can view it based on my permissions

Scenario: View-only access
  Given I have view-only access
  Then I can zoom and pan
  But I cannot edit or save changes
```

---

#### E13-US08: Account Settings

**As a** logged-in user
**I want** to manage my account
**So that** I can update my information

**Priority:** P3
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Change password
  Given I am in account settings
  When I change my password
  Then my password is updated

Scenario: Delete account
  Given I request account deletion
  Then I am warned about data loss
  When I confirm
  Then my account and data are deleted
```

---

### Epic E14: Export & Import

#### E14-US01: Export as SVG

**As a** user
**I want** to export my diagram as SVG
**So that** I can use it in vector graphics software

**Priority:** P0
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Export SVG
  Given I select "File > Export > SVG"
  Then an SVG file is generated
  And it can be opened in Illustrator, Inkscape, or browsers

Scenario: SVG quality
  Given I export as SVG
  Then all shapes and text are crisp at any zoom
  And colors and styles match the diagram
```

---

#### E14-US02: Export as PNG

**As a** user
**I want** to export my diagram as PNG
**So that** I can use it in documents and presentations

**Priority:** P1
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Export PNG
  Given I select "File > Export > PNG"
  Then I can choose resolution (1x, 2x, 3x or custom DPI)
  And a PNG file is generated

Scenario: Transparent background
  Given I export as PNG
  Then I can choose transparent or white background

Scenario: Export selection only
  Given I have shapes selected
  When I export as PNG
  Then I can choose to export only the selection
```

---

#### E14-US03: Export as PDF

**As a** user
**I want** to export my diagram as PDF
**So that** I can print or share it professionally

**Priority:** P2
**Story Points:** 3

**Acceptance Criteria:**

```gherkin
Scenario: Export PDF
  Given I select "File > Export > PDF"
  Then a PDF file is generated
  And I can choose page size (A4, Letter, etc.)

Scenario: Multi-page PDF
  Given my diagram is larger than one page
  Then I can choose to split across pages
  Or scale to fit single page
```

---

#### E14-US04: Export as JSON

**As a** user
**I want** to export as JSON
**So that** I can programmatically process diagrams

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Export JSON
  Given I select "File > Export > JSON"
  Then a JSON file with full diagram data is generated
  And it can be re-imported without data loss
```

---

#### E14-US05: Import from Image

**As a** user
**I want** to import images
**So that** I can include them in my diagrams

**Priority:** P2
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Import image
  Given I select "Insert > Image" or drag an image onto canvas
  Then the image is added as a shape
  And I can resize and position it

Scenario: Supported formats
  Given I import an image
  Then PNG, JPG, GIF, and SVG are supported
```

---

#### E14-US06: Copy as Image

**As a** user
**I want** to copy the diagram to clipboard as image
**So that** I can paste it directly into other apps

**Priority:** P1
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Copy diagram as image
  Given I select "Edit > Copy as Image" or press Ctrl+Shift+C
  Then the diagram (or selection) is copied to clipboard as PNG
  And I can paste it into Word, PowerPoint, etc.
```

---

#### E14-US07: Import from Clipboard

**As a** user
**I want** to paste images from clipboard
**So that** I can quickly add screenshots

**Priority:** P2
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Paste image
  Given I have an image in my clipboard
  When I press Ctrl+V
  Then the image is added to the canvas as a shape
```

---

#### E14-US08: Batch Export

**As a** user
**I want** to export in multiple formats at once
**So that** I can save time

**Priority:** P3
**Story Points:** 2

**Acceptance Criteria:**

```gherkin
Scenario: Export multiple formats
  Given I select "File > Export > Multiple"
  Then I can check formats I want (SVG, PNG, PDF)
  And all selected formats are exported to a folder
```

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-P01 | Initial page load time | < 3 seconds on 3G |
| NFR-P02 | Time to interactive | < 5 seconds |
| NFR-P03 | Shape rendering (1000 shapes) | 60 FPS |
| NFR-P04 | Save operation | < 1 second for 500KB file |
| NFR-P05 | Export PNG (1080p) | < 3 seconds |
| NFR-P06 | Memory usage (1000 shapes) | < 200MB |

### 5.2 Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-S01 | Maximum shapes per diagram | 10,000 |
| NFR-S02 | Maximum connections per diagram | 10,000 |
| NFR-S03 | Maximum file size | 50MB |
| NFR-S04 | Concurrent users (cloud) | 10,000 |

### 5.3 Accessibility

| ID | Requirement | Standard |
|----|-------------|----------|
| NFR-A01 | WCAG compliance | Level AA |
| NFR-A02 | Keyboard navigation | Full support |
| NFR-A03 | Screen reader support | Major screen readers |
| NFR-A04 | Color contrast | 4.5:1 minimum |
| NFR-A05 | Focus indicators | Visible on all interactive elements |

### 5.4 Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### 5.5 Security

| ID | Requirement |
|----|-------------|
| NFR-SEC01 | All traffic over HTTPS |
| NFR-SEC02 | Passwords hashed with bcrypt/Argon2 |
| NFR-SEC03 | XSS prevention (sanitized user content) |
| NFR-SEC04 | CSRF protection on all forms |
| NFR-SEC05 | Rate limiting on API endpoints |
| NFR-SEC06 | Row-level security for cloud data |

### 5.6 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-R01 | Uptime (cloud service) | 99.9% |
| NFR-R02 | Data durability | 99.999999% |
| NFR-R03 | Auto-save reliability | No work lost on crash |

### 5.7 Usability

| ID | Requirement |
|----|-------------|
| NFR-U01 | Learnable by new users in < 10 minutes |
| NFR-U02 | Consistent with platform conventions |
| NFR-U03 | Meaningful error messages |
| NFR-U04 | Undo available for all destructive actions |

---

## 6. Glossary

| Term | Definition |
|------|------------|
| Anchor Point | A connection attachment point on a shape |
| Bezier Curve | A parametric curve used for smooth connections |
| Canvas | The infinite drawing area |
| Connection | A line linking two shapes |
| draw.io | Popular open-source diagramming tool |
| Epic | A collection of related user stories |
| mxGraph | The library underlying draw.io |
| Orthogonal | Connections using only horizontal/vertical segments |
| Shape | A visual element (rectangle, ellipse, etc.) |
| Viewport | The visible portion of the canvas |
| Waypoint | A control point on a connection path |
| Z-order | The front-to-back ordering of shapes |

---

## Appendix A: Priority Matrix

| Priority | Meaning | Timeline |
|----------|---------|----------|
| P0 | Critical - MVP requirement | Phase 1-2 |
| P1 | High - Important for usability | Phase 2-3 |
| P2 | Medium - Enhances experience | Phase 3-4 |
| P3 | Low - Nice to have | Phase 5+ |

## Appendix B: Story Point Reference

| Points | Complexity | Example |
|--------|------------|---------|
| 1 | Trivial | Add tooltip |
| 2 | Simple | Toggle button, minor feature |
| 3 | Medium | Basic shape creation |
| 5 | Complex | Rich text editor |
| 8 | Very Complex | draw.io import/export |
| 13 | Epic-level | Full collaboration system |

---

*Document generated for Naive Draw.io project planning*
