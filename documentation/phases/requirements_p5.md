# Phase 5: Text & Basic Connections - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 5 |
| Status | Draft |
| Dependencies | Phase 0-4 |
| Deployable | Yes - Labeled shapes with connections |

---

## Phase Overview

Phase 5 introduces text editing inside shapes and basic connection capabilities between shapes. Users will be able to add and format text within shapes, and create straight-line connections with arrows to show relationships between elements.

### Goals

1. Enable text editing inside shapes (double-click to edit)
2. Implement basic text formatting (bold, italic, underline)
3. Support font family, size, and color changes
4. Add text alignment (horizontal and vertical)
5. Create straight-line connections between shapes
6. Implement connection anchor points
7. Add arrow styling to connections

---

## User Stories Included

### From Epic E05: Text Editing

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E05-US01 | Add Text Inside Shape | P0 | Full |
| E05-US02 | Format Text - Bold, Italic, Underline | P0 | Full |
| E05-US03 | Change Font Family | P1 | Full |
| E05-US04 | Change Font Size | P0 | Full |
| E05-US05 | Change Text Color | P0 | Full |
| E05-US06 | Text Alignment | P0 | Full |

### From Epic E06: Connections

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E06-US01 | Create Connection Between Shapes | P0 | Full |
| E06-US02 | Connection Anchor Points | P0 | Full |
| E06-US03 | Straight Line Connections | P0 | Full |
| E06-US06 | Add Arrow to Connection Start | P0 | Full |
| E06-US07 | Add Arrow to Connection End | P0 | Full |
| E06-US08 | Connection Line Styling | P0 | Partial (color, width) |
| E06-US12 | Delete Connection | P0 | Full |
| E06-US14 | Connection Selection and Highlighting | P0 | Full |

---

## Detailed Acceptance Criteria

### E05-US01: Add Text Inside Shape

**As a** user
**I want** to add text inside shapes
**So that** I can label diagram elements

```gherkin
Scenario: Double-click to edit text
  Given I have a shape on the canvas
  When I double-click on the shape
  Then text editing mode is activated
  And a cursor appears inside the shape
  And I can start typing

Scenario: Text appears in shape
  Given I am in text editing mode on a shape
  When I type "Hello World"
  Then the text appears inside the shape
  And the text is centered by default

Scenario: Text wraps within shape
  Given I am typing text inside a shape
  When the text reaches the shape boundary
  Then the text wraps to the next line
  And remains within the shape bounds

Scenario: Save text on exit - click outside
  Given I am editing text inside a shape
  When I click outside the shape
  Then text editing mode ends
  And the text is saved

Scenario: Save text on exit - Escape
  Given I am editing text inside a shape
  When I press Escape
  Then text editing mode ends
  And the text is saved

Scenario: Empty text after edit
  Given I am editing text and delete all characters
  When I exit text editing mode
  Then the shape has no text
  And no placeholder is shown (shape appears empty)

Scenario: Enter key behavior
  Given I am editing text inside a shape
  When I press Enter
  Then a new line is created
  And the cursor moves to the next line
```

---

### E05-US02: Format Text - Bold, Italic, Underline

**As a** user
**I want** to format text with bold, italic, and underline
**So that** I can emphasize important words

```gherkin
Scenario: Apply bold formatting
  Given I am editing text and have selected some text
  When I press Ctrl+B or click the Bold button
  Then the selected text becomes bold
  And the Bold button shows as active

Scenario: Apply italic formatting
  Given I have text selected
  When I press Ctrl+I or click the Italic button
  Then the selected text becomes italic
  And the Italic button shows as active

Scenario: Apply underline formatting
  Given I have text selected
  When I press Ctrl+U or click the Underline button
  Then the selected text becomes underlined
  And the Underline button shows as active

Scenario: Toggle formatting off
  Given I have bold text selected
  When I press Ctrl+B
  Then the bold formatting is removed
  And the Bold button shows as inactive

Scenario: Format applies to new text
  Given I have Bold active but no text selected
  When I type new text
  Then the new text is bold
  Until I toggle bold off

Scenario: Mixed formatting
  Given I have text "Hello World"
  When I select "Hello" and make it bold
  And I select "World" and make it italic
  Then "Hello" is bold only
  And "World" is italic only
  Note: For Phase 5, shape text applies formatting to all text uniformly
```

---

### E05-US03: Change Font Family

**As a** user
**I want** to change the font family
**So that** I can match my organization's branding

```gherkin
Scenario: Select font family from dropdown
  Given I have a shape with text selected
  When I select a font from the font dropdown in property panel
  Then the text changes to that font

Scenario: Available fonts
  Given I open the font dropdown
  Then I see a list of web-safe fonts including:
    - Arial (default)
    - Helvetica
    - Times New Roman
    - Georgia
    - Courier New
    - Verdana
  And each font is displayed in its own typeface (preview)

Scenario: Font applies to entire shape text
  Given I change the font for a shape
  Then all text in that shape uses the new font
  Note: Per-character font changes deferred to future phase
```

---

### E05-US04: Change Font Size

**As a** user
**I want** to change font size
**So that** I can create visual hierarchy

```gherkin
Scenario: Select font size from dropdown
  Given I have a shape with text selected
  When I select a size from the dropdown (8, 10, 12, 14, 16, 18, 24, 36, 48)
  Then the text size changes

Scenario: Enter custom font size
  Given I have a shape with text selected
  When I enter a custom font size (e.g., 15)
  Then the text changes to that size

Scenario: Font size has bounds
  Given I enter a font size
  Then sizes below 6 are rejected or clamped
  And sizes above 200 are rejected or clamped

Scenario: Increase/decrease shortcuts
  Given I have a shape selected
  When I press Ctrl+Shift+> (or Ctrl+Shift+.)
  Then the font size increases by 2
  When I press Ctrl+Shift+< (or Ctrl+Shift+,)
  Then the font size decreases by 2
```

---

### E05-US05: Change Text Color

**As a** user
**I want** to change text color
**So that** I can make text visible on different backgrounds

```gherkin
Scenario: Select text color from picker
  Given I have a shape selected
  When I click the text color picker in the property panel
  And I choose a color
  Then the text in the shape changes to that color

Scenario: Text color independent of fill
  Given I have a shape with blue fill
  When I set text color to white
  Then the text is white
  And the fill remains blue

Scenario: Default text color
  Given I create a new shape with text
  Then the default text color is black (#000000)

Scenario: Auto-contrast (optional future)
  Given I change fill to a dark color
  Then text color could automatically adjust for contrast
  Note: Auto-contrast is optional for Phase 5
```

---

### E05-US06: Text Alignment

**As a** user
**I want** to align text within shapes
**So that** I can control text positioning

```gherkin
Scenario: Horizontal alignment - left
  Given I have a shape with text selected
  When I click the "Left align" button
  Then the text aligns to the left edge of the shape

Scenario: Horizontal alignment - center
  Given I have a shape with text selected
  When I click the "Center align" button
  Then the text is horizontally centered in the shape

Scenario: Horizontal alignment - right
  Given I have a shape with text selected
  When I click the "Right align" button
  Then the text aligns to the right edge of the shape

Scenario: Vertical alignment - top
  Given I have a shape with text selected
  When I click the "Top align" button
  Then the text aligns to the top of the shape

Scenario: Vertical alignment - middle
  Given I have a shape with text selected
  When I click the "Middle align" button (default)
  Then the text is vertically centered in the shape

Scenario: Vertical alignment - bottom
  Given I have a shape with text selected
  When I click the "Bottom align" button
  Then the text aligns to the bottom of the shape

Scenario: Combined alignment
  Given I set horizontal to right and vertical to bottom
  Then the text appears in the bottom-right area of the shape
```

---

### E06-US01: Create Connection Between Shapes

**As a** user
**I want** to connect shapes with lines
**So that** I can show relationships between elements

```gherkin
Scenario: Select connection tool
  Given I am on the canvas
  When I click the Connection tool in the toolbar OR press "C"
  Then the Connection tool becomes active
  And the cursor indicates connection mode

Scenario: Draw connection from anchor to anchor
  Given I have the Connection tool active
  When I click on a shape's anchor point
  And drag to another shape's anchor point
  And release the mouse
  Then a connection line is created between the two shapes
  And the connection is attached to both shapes
  And the connection is selected after creation

Scenario: Connection follows shapes when moved
  Given two shapes are connected
  When I move either shape
  Then the connection line updates
  And remains attached to both shapes at their anchor points

Scenario: Cancel connection creation
  Given I start drawing a connection
  When I press Escape before completing
  Then the connection is cancelled
  And no connection is created

Scenario: Connection requires two endpoints
  Given I start drawing a connection
  When I release the mouse not on a shape anchor
  Then the connection is cancelled
  Or the endpoint floats at that position (implementation choice)
```

---

### E06-US02: Connection Anchor Points

**As a** user
**I want** predefined anchor points on shapes
**So that** I can attach connections at specific locations

```gherkin
Scenario: Default anchor points appear
  Given I have shapes on the canvas
  When I activate the Connection tool
  And I hover over a shape
  Then anchor points are highlighted on the shape:
    - Top center
    - Right center
    - Bottom center
    - Left center

Scenario: Anchor points visual indicator
  Given I am hovering over a shape with Connection tool
  Then anchor points appear as small circles or squares
  And they have a distinct color (e.g., blue)
  And they are visible but not obtrusive

Scenario: Snap to nearest anchor
  Given I am creating a connection
  When I drag near an anchor point
  Then the connection endpoint snaps to that anchor
  And the snap is indicated visually

Scenario: Anchor adapts to shape movement
  Given a connection is attached to the top anchor of a shape
  When I move the shape
  Then the connection stays attached to the top anchor
  And updates position based on the new shape location
```

---

### E06-US03: Straight Line Connections

**As a** user
**I want** straight line connections
**So that** I can create simple, direct relationships

```gherkin
Scenario: Default connection is straight
  Given I create a connection between two shapes
  Then a direct straight line connects the two anchor points

Scenario: Straight line updates on shape move
  Given I have a straight connection between two shapes
  When I move either connected shape
  Then the line adjusts to maintain the direct path
  And there are no bends or curves

Scenario: Line visual appearance
  Given I have a straight connection
  Then it renders as a clean line
  And the default stroke is black, 2px wide
```

---

### E06-US06: Add Arrow to Connection Start

**As a** user
**I want** to add an arrow to the start of a connection
**So that** I can indicate direction

```gherkin
Scenario: Enable start arrow
  Given I have a connection selected
  When I enable "Start Arrow" in the property panel
  Then an arrow appears at the source end of the connection

Scenario: Start arrow style options
  Given I am configuring a start arrow
  Then I can choose from styles:
    - None (default)
    - Arrow (filled triangle)
    - Open Arrow (outline triangle)
  And the arrow changes to the selected style

Scenario: Arrow points away from source shape
  Given I have a connection with start arrow
  Then the arrow points away from the source shape
  And toward the center of the line
```

---

### E06-US07: Add Arrow to Connection End

**As a** user
**I want** to add an arrow to the end of a connection
**So that** I can indicate flow direction

```gherkin
Scenario: Default end arrow
  Given I create a new connection
  Then it has an arrow at the end (target) by default

Scenario: Configure end arrow style
  Given I have a connection selected
  When I choose an end arrow style
  Then the arrow at the target end changes

Scenario: Both arrows
  Given I have a connection
  When I enable both start and end arrows
  Then arrows appear at both ends
  And they can have different styles

Scenario: Remove end arrow
  Given I have a connection with an end arrow
  When I set end arrow to "None"
  Then the arrow is removed
  And only the line remains
```

---

### E06-US08: Connection Line Styling (Partial)

**As a** user
**I want** to style connection lines
**So that** I can distinguish different types of relationships

```gherkin
Scenario: Change connection color
  Given I have a connection selected
  When I change the stroke color in the property panel
  Then the connection line and arrows change color

Scenario: Change line thickness
  Given I have a connection selected
  When I change the stroke width
  Then the connection becomes thicker or thinner

Note: Stroke style (dashed, dotted) for connections deferred to Phase 8
```

---

### E06-US12: Delete Connection

**As a** user
**I want** to delete connections
**So that** I can remove incorrect or unwanted relationships

```gherkin
Scenario: Select and delete connection
  Given I click on a connection to select it
  When I press Delete or Backspace
  Then the connection is removed
  And the connected shapes are unaffected

Scenario: Delete does not affect shapes
  Given I delete a connection
  Then only the connection is removed
  And both shapes remain on the canvas
  And no other connections are affected
```

---

### E06-US14: Connection Selection and Highlighting

**As a** user
**I want** clear visual feedback when selecting connections
**So that** I can easily work with them

```gherkin
Scenario: Hover highlight
  Given I hover over a connection with the Select tool
  Then the connection is highlighted (e.g., thicker or different color)
  And my cursor changes to indicate it's clickable

Scenario: Selection indicator
  Given I click on a connection
  Then the connection shows as selected
  And endpoints are visible as handles
  And the property panel shows connection properties

Scenario: Click detection
  Given I have connections on the canvas
  When I click near a connection line
  Then the connection is selected if click is within a few pixels of the line
  And precise clicking on thin lines is not required
```

---

## Features Included

1. **Text Editing**
   - Double-click to enter edit mode
   - Text cursor and typing
   - Multi-line text with Enter
   - Exit with click outside or Escape

2. **Text Formatting**
   - Bold (Ctrl+B)
   - Italic (Ctrl+I)
   - Underline (Ctrl+U)
   - Applied to all text in shape (uniform)

3. **Text Styling**
   - Font family selection
   - Font size selection
   - Text color picker
   - Horizontal alignment (left, center, right)
   - Vertical alignment (top, middle, bottom)

4. **Connections**
   - Connection tool (C key)
   - Straight line connections
   - 4 anchor points per shape
   - Anchor point highlighting on hover
   - Connections follow shape movement

5. **Connection Arrows**
   - Start arrow (optional)
   - End arrow (default)
   - Arrow styles: None, Arrow, Open Arrow

6. **Connection Styling**
   - Stroke color
   - Stroke width

7. **Connection Selection**
   - Click to select
   - Hover highlighting
   - Delete with keyboard

---

## Features Excluded (Deferred)

- Rich text (per-character formatting) - Future
- Text overflow handling options - Future
- Label below shape (E05-US07) - Future
- Rich text editor toolbar (E05-US08) - Future
- Curved connections (E06-US04) - Phase 8
- Orthogonal connections (E06-US05) - Phase 8
- Connection labels (E06-US09) - Phase 8
- Waypoints on connections (E06-US13) - Phase 8
- Stroke style for connections (dashed/dotted) - Phase 8
- Disconnect and reconnect (E06-US11) - Phase 8

---

## Dependencies on Previous Phases

### Phase 0-4 Requirements
- Shape interface with text properties
- Canvas rendering
- Selection system
- Property panel infrastructure
- Color picker component

### Required from Previous Phases

| Component/File | Usage |
|----------------|-------|
| `Shape` interface | text, textStyle properties |
| `PropertyPanel` | Text styling controls |
| `ColorPicker` | Text color selection |
| Selection system | Know when to show text controls |
| `useDiagramStore` | Update shape text |

---

## Definition of Done

### Text Editing
- [ ] Double-click on shape enters text edit mode
- [ ] Text can be typed and appears in shape
- [ ] Enter creates new line
- [ ] Click outside exits edit mode and saves
- [ ] Escape exits edit mode and saves
- [ ] Ctrl+B toggles bold
- [ ] Ctrl+I toggles italic
- [ ] Ctrl+U toggles underline
- [ ] Font family can be changed
- [ ] Font size can be changed
- [ ] Text color can be changed
- [ ] Horizontal alignment works (left, center, right)
- [ ] Vertical alignment works (top, middle, bottom)

### Connections
- [ ] Connection tool can be selected (C key)
- [ ] Anchor points show on hover over shapes
- [ ] Connections can be drawn between shapes
- [ ] Connections are straight lines
- [ ] Connections follow shapes when moved
- [ ] Default end arrow appears
- [ ] Start arrow can be enabled
- [ ] Arrow style can be changed
- [ ] Connection color can be changed
- [ ] Connection width can be changed
- [ ] Connections can be selected
- [ ] Hover highlights connections
- [ ] Delete removes selected connections
- [ ] Manual testing confirms all scenarios

---

## Test Scenarios

### Text Tests

1. **Enter Text Edit Mode**
   - Double-click shape, verify cursor appears

2. **Type Text**
   - Type "Test", verify text appears in shape

3. **Multi-line Text**
   - Type "Line 1[Enter]Line 2", verify two lines

4. **Bold Formatting**
   - Press Ctrl+B, type "Bold", verify bold

5. **Text Alignment**
   - Change to left align, verify text moves left

### Connection Tests

6. **Create Connection**
   - Use C tool, drag from shape A to shape B
   - Verify line connects them

7. **Move Connected Shape**
   - Move shape A, verify connection follows

8. **Select Connection**
   - Click on connection line, verify selected

9. **Delete Connection**
   - Select connection, press Delete
   - Verify connection removed, shapes remain

10. **Arrow Styles**
    - Enable start arrow, verify appears
    - Change end arrow to "None", verify removed

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Text input response | < 16ms (60fps) |
| Connection creation | < 50ms |
| Connection update on move | < 16ms (60fps) |
| Anchor point display | < 50ms |

---

## Notes for Implementation

### Text Rendering in SVG

Use SVG `<text>` element with `<tspan>` for multi-line:
```xml
<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">
  <tspan x="50%" dy="0">Line 1</tspan>
  <tspan x="50%" dy="1.2em">Line 2</tspan>
</text>
```

### Text Editing Approach

Options:
1. **Overlay HTML textarea** - Position over shape, capture input
2. **ContentEditable div** - More control over formatting
3. **SVG foreignObject** - Embed HTML in SVG

Recommendation: Use overlay HTML textarea for simplicity in Phase 5.

### Connection Data Model

```typescript
interface Connection {
  id: string;
  sourceShapeId: string;
  targetShapeId: string;
  sourceAnchor: AnchorPosition; // 'top' | 'right' | 'bottom' | 'left'
  targetAnchor: AnchorPosition;
  stroke: string;
  strokeWidth: number;
  startArrow: ArrowStyle;
  endArrow: ArrowStyle;
}

type ArrowStyle = 'none' | 'arrow' | 'openArrow';
```

### Anchor Point Calculation

```typescript
function getAnchorPosition(shape: Shape, anchor: AnchorPosition): Point {
  const cx = shape.x + shape.width / 2;
  const cy = shape.y + shape.height / 2;

  switch (anchor) {
    case 'top': return { x: cx, y: shape.y };
    case 'right': return { x: shape.x + shape.width, y: cy };
    case 'bottom': return { x: cx, y: shape.y + shape.height };
    case 'left': return { x: shape.x, y: cy };
  }
}
```
