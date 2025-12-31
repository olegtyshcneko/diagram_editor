# Phase 4: Shape Styling & Property Panel - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 4 |
| Status | Draft |
| Dependencies | Phase 0-3 |
| Deployable | Yes - Styled shapes with property panel |

---

## Phase Overview

Phase 4 introduces visual customization capabilities for shapes. Users will be able to change fill colors, stroke colors, stroke width and style, opacity, and corner radius for rectangles. A property panel provides a centralized interface for viewing and modifying shape properties.

### Goals

1. Implement fill color selection with color picker
2. Add fill opacity control
3. Enable stroke color, width, and style customization
4. Add corner radius for rectangles
5. Create property panel component
6. Support applying styles to multiple selected shapes

---

## User Stories Included

### From Epic E04: Shape Styling

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E04-US01 | Change Fill Color | P0 | Full |
| E04-US02 | Change Fill Opacity | P1 | Full |
| E04-US03 | Change Stroke Color | P0 | Full |
| E04-US04 | Change Stroke Width | P0 | Full |
| E04-US05 | Change Stroke Style | P1 | Full |
| E04-US06 | Add Corner Radius | P1 | Full |
| E04-US08 | Apply Style to Multiple Shapes | P1 | Full |

### From Epic E11: User Interface

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E11-US02 | Property Panel | P0 | Full |

---

## Detailed Acceptance Criteria

### E04-US01: Change Fill Color

**As a** user
**I want** to change the fill color of shapes
**So that** I can visually distinguish different elements

```gherkin
Scenario: Select fill color from picker
  Given I have a shape selected
  When I click the fill color option in the property panel
  Then a color picker appears
  When I select a color
  Then the shape's fill changes to that color
  And the change is applied immediately (real-time preview)

Scenario: Enter hex color code
  Given I have a shape selected
  When I enter a hex color code (e.g., #FF5733) in the fill color input
  Then the shape's fill changes to that color
  And the input validates the hex format

Scenario: Recent colors
  Given I have used colors previously in this session
  When I open the color picker
  Then I see a row of recently used colors (up to 8)
  And I can quickly select from them

Scenario: No fill (transparent)
  Given I have a shape selected
  When I click the "No fill" option or transparent button
  Then the shape has no fill (transparent)
  And underlying elements are visible through it
  And the fill color shows as "None" in the panel

Scenario: Preset color palette
  Given I open the fill color picker
  Then I see a palette of preset colors organized by hue
  And I can click any color to apply it immediately
```

---

### E04-US02: Change Fill Opacity

**As a** user
**I want** to adjust fill opacity
**So that** I can create layered visual effects

```gherkin
Scenario: Adjust opacity with slider
  Given I have a shape selected
  When I drag the fill opacity slider from 0% to 100%
  Then the shape's fill becomes more or less transparent
  And the change is previewed in real-time on the canvas

Scenario: Enter opacity value directly
  Given I have a shape selected
  When I enter an opacity percentage (e.g., 75) in the opacity input
  Then the fill opacity is set to that value
  And values are clamped between 0 and 100

Scenario: Opacity affects only fill
  Given I set fill opacity to 50%
  Then the fill color is semi-transparent
  And the stroke remains at its own opacity
  And text inside the shape remains fully opaque

Scenario: Zero opacity equivalent to no fill
  Given I set fill opacity to 0%
  Then the shape appears to have no fill
  But the fill color is preserved (can be restored by increasing opacity)
```

---

### E04-US03: Change Stroke Color

**As a** user
**I want** to change the stroke (border) color
**So that** I can customize shape outlines

```gherkin
Scenario: Select stroke color from picker
  Given I have a shape selected
  When I click the stroke color option in the property panel
  Then a color picker appears
  When I select a color
  Then the shape's stroke changes to that color

Scenario: No stroke
  Given I have a shape selected
  When I set stroke to "None" or click the no-stroke option
  Then the shape has no visible border
  And stroke width controls become disabled

Scenario: Enter stroke hex color
  Given I have a shape selected
  When I enter a hex color code in the stroke color input
  Then the shape's stroke changes to that color

Scenario: Stroke color independent of fill
  Given I have a shape with blue fill
  When I set stroke color to red
  Then the fill remains blue
  And only the border becomes red
```

---

### E04-US04: Change Stroke Width

**As a** user
**I want** to adjust stroke width
**So that** I can emphasize or de-emphasize borders

```gherkin
Scenario: Adjust stroke width with dropdown
  Given I have a shape selected
  When I select a stroke width from presets (1, 2, 3, 4, 5 px)
  Then the shape's border thickness changes
  And the change is visible immediately

Scenario: Enter custom stroke width
  Given I have a shape selected
  When I enter a custom stroke width value (e.g., 3.5)
  Then the shape's border uses that exact width
  And values are clamped to reasonable bounds (0.5 to 20px)

Scenario: Stroke width zero hides stroke
  Given I have a shape selected
  When I set stroke width to 0
  Then the stroke is not visible
  And this is equivalent to "No stroke"

Scenario: Stroke width affects hit area
  Given I have a shape with stroke width 10px
  Then the clickable/selectable area includes the stroke
  And I can click on the thick border to select the shape
```

---

### E04-US05: Change Stroke Style

**As a** user
**I want** to change stroke style
**So that** I can indicate different types of relationships

```gherkin
Scenario: Select solid stroke style
  Given I have a shape selected
  When I select "Solid" stroke style
  Then the shape's border is a continuous line

Scenario: Select dashed stroke style
  Given I have a shape selected
  When I select "Dashed" stroke style
  Then the shape's border becomes dashed
  And the default dash pattern is applied (e.g., 8px dash, 4px gap)

Scenario: Select dotted stroke style
  Given I have a shape selected
  When I select "Dotted" stroke style
  Then the shape's border becomes dotted
  And dots are evenly spaced

Scenario: Style dropdown shows preview
  Given I open the stroke style dropdown
  Then each option shows a visual preview of the style
  And I can see solid, dashed, and dotted patterns
```

---

### E04-US06: Add Corner Radius

**As a** user
**I want** to round the corners of rectangles
**So that** I can create softer-looking shapes

```gherkin
Scenario: Adjust corner radius with slider
  Given I have a rectangle selected
  When I adjust the corner radius slider
  Then the corners become progressively rounded
  And the change is previewed in real-time

Scenario: Enter corner radius value
  Given I have a rectangle selected
  When I enter a corner radius value (e.g., 10)
  Then the corners are rounded to that radius

Scenario: Maximum corner radius
  Given I have a rectangle with width 100 and height 60
  When I increase corner radius to 30 (half of shortest side)
  Then the rectangle becomes a pill/stadium shape
  And corner radius cannot exceed half the shortest side

Scenario: Corner radius only for rectangles
  Given I have an ellipse selected
  Then the corner radius control is not shown
  Or it is disabled with a tooltip explaining why

Scenario: Zero corner radius
  Given I have a rounded rectangle selected
  When I set corner radius to 0
  Then the rectangle has sharp corners
```

---

### E04-US08: Apply Style to Multiple Shapes

**As a** user
**I want** to apply styles to multiple shapes at once
**So that** I can maintain consistency efficiently

```gherkin
Scenario: Style multiple selected shapes
  Given I have multiple shapes selected
  When I change any style property (fill, stroke, etc.)
  Then all selected shapes update with that property
  And shapes that don't support the property are unaffected

Scenario: Mixed values indicator
  Given I have multiple shapes selected with different fill colors
  Then the fill color shows as "Multiple" or a mixed indicator
  When I select a new color
  Then all shapes update to that color

Scenario: Copy style (future - noted for implementation)
  Given I have a styled shape selected
  When I press Ctrl+Shift+C or select "Copy Style"
  Then the style properties are copied to clipboard

Scenario: Paste style (future - noted for implementation)
  Given I have copied a style
  And I have other shapes selected
  When I press Ctrl+Shift+V or select "Paste Style"
  Then the style is applied to all selected shapes
  Note: Copy/paste style is optional for Phase 4, can defer to Phase 6
```

---

### E11-US02: Property Panel

**As a** user
**I want** a property panel
**So that** I can view and edit properties of selected elements

```gherkin
Scenario: Property panel shows shape properties
  Given I select a shape
  Then the property panel shows that shape's properties:
    - Position (X, Y)
    - Dimensions (Width, Height)
    - Rotation angle
    - Fill color and opacity
    - Stroke color, width, and style
    - Corner radius (for rectangles)

Scenario: No selection state
  Given nothing is selected
  Then the property panel shows a message like "Select an element to view properties"
  Or shows canvas/document properties

Scenario: Multiple selection
  Given I have multiple shapes selected
  Then the property panel shows:
    - Number of selected shapes
    - Common properties that can be changed
    - "Multiple values" for differing properties

Scenario: Real-time property updates
  Given I change a value in the property panel
  Then the shape updates immediately on the canvas
  And I don't need to press "Apply" or "Enter"

Scenario: Property panel position
  Given I am using the application
  Then the property panel is displayed on the right side of the canvas
  And it can be collapsed/expanded

Scenario: Numerical input validation
  Given I enter a value in a numerical field (X, Y, Width, Height)
  Then invalid values are rejected or corrected
  And minimum/maximum bounds are enforced
  And Width/Height cannot go below minimum shape size (10px)
```

---

## Features Included

1. **Fill Styling**
   - Fill color picker with presets
   - Hex color input
   - Recent colors (session)
   - Fill opacity slider (0-100%)
   - No fill / transparent option

2. **Stroke Styling**
   - Stroke color picker
   - Stroke width (presets and custom)
   - Stroke style (solid, dashed, dotted)
   - No stroke option

3. **Shape-Specific Styling**
   - Corner radius for rectangles
   - Radius slider and input

4. **Property Panel**
   - Position display/edit (X, Y)
   - Dimensions display/edit (Width, Height)
   - Rotation display/edit
   - All fill properties
   - All stroke properties
   - Multi-selection support

5. **Multi-Shape Styling**
   - Apply style changes to all selected shapes
   - Mixed values indicator

---

## Features Excluded (Deferred)

- Shadow effects (E04-US07) - Future
- Gradient fills - Future
- Copy/Paste style (E04-US08 partial) - Phase 6
- Pattern fills - Future
- Stroke opacity separate from color - Future
- Custom dash patterns - Future

---

## Dependencies on Previous Phases

### Phase 0 Requirements
- Type definitions including style properties
- Constants for default styles

### Phase 1 Requirements
- Canvas rendering infrastructure
- Viewport state for panel positioning

### Phase 2 Requirements
- Shape components that accept style props
- Shape store with style properties

### Phase 3 Requirements
- Selection system for knowing which shapes to style
- Shape update actions

### Required from Previous Phases

| Component/File | Usage |
|----------------|-------|
| `Shape` interface | Style properties (fill, stroke, etc.) |
| `useDiagramStore` | updateShape action |
| `selectedShapeIds` | Know which shapes to style |
| `SHAPE_DEFAULTS` | Default style values |
| App shell layout | Property panel placement |

---

## Definition of Done

- [ ] Fill color can be changed via color picker
- [ ] Fill color can be entered as hex code
- [ ] Recent colors are shown in picker
- [ ] Fill can be set to transparent/none
- [ ] Fill opacity slider works (0-100%)
- [ ] Stroke color can be changed via color picker
- [ ] Stroke width presets work (1-5px)
- [ ] Custom stroke width can be entered
- [ ] Stroke style can be changed (solid/dashed/dotted)
- [ ] Stroke can be removed (none)
- [ ] Corner radius works for rectangles
- [ ] Corner radius is limited to valid range
- [ ] Property panel shows all properties for selected shape
- [ ] Property panel shows "no selection" state appropriately
- [ ] Position and dimensions can be edited in property panel
- [ ] Changes in property panel apply immediately
- [ ] Multi-selection shows common properties
- [ ] Style changes apply to all selected shapes
- [ ] Color picker has accessible UI
- [ ] All inputs have appropriate validation
- [ ] Manual testing confirms all scenarios

---

## Test Scenarios

### Fill Tests

1. **Change Fill Color**
   - Select shape, open color picker
   - Click a color, verify shape updates

2. **Hex Color Input**
   - Enter "#FF0000", verify shape turns red
   - Enter invalid hex, verify rejection

3. **Transparent Fill**
   - Select "No fill", verify shape is transparent
   - Verify shapes behind are visible

4. **Fill Opacity**
   - Set opacity to 50%, verify semi-transparent
   - Set opacity to 0%, verify equivalent to transparent

### Stroke Tests

5. **Change Stroke Color**
   - Select shape, change stroke color
   - Verify border color changes

6. **Stroke Width**
   - Select different widths (1, 3, 5px)
   - Verify border thickness changes

7. **Stroke Style**
   - Select dashed, verify pattern
   - Select dotted, verify pattern

8. **No Stroke**
   - Select "No stroke", verify border disappears

### Corner Radius Tests

9. **Round Corners**
   - Adjust slider, verify corners round
   - Enter value, verify exact radius

10. **Maximum Radius**
    - Try to exceed max, verify limit enforced

### Property Panel Tests

11. **Position Edit**
    - Change X/Y in panel, verify shape moves

12. **Dimension Edit**
    - Change Width/Height, verify shape resizes

13. **Multi-Selection**
    - Select multiple shapes, change fill
    - Verify all shapes update

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Color change response | < 16ms (60fps) |
| Property panel render | < 50ms |
| Multi-shape style update | < 50ms for 10 shapes |
| Color picker open | < 100ms |

---

## Notes for Implementation

### Color Picker Component

Consider using a library like `react-colorful` or building a custom picker:
- Hue/saturation/brightness selector
- Hex input field
- Recent colors storage (sessionStorage or state)
- Preset color palette

### Property Panel Layout

```
+---------------------------+
| Properties                |
+---------------------------+
| Position                  |
|   X: [____]  Y: [____]    |
+---------------------------+
| Size                      |
|   W: [____]  H: [____]    |
|   [ ] Constrain           |
+---------------------------+
| Rotation                  |
|   [____] degrees          |
+---------------------------+
| Fill                      |
|   [Color] [Opacity___]    |
+---------------------------+
| Stroke                    |
|   [Color] [Width] [Style] |
+---------------------------+
| Corner Radius             |
|   [_________] (rect only) |
+---------------------------+
```

### Style Application Strategy

When applying styles to multiple shapes:
1. Collect selected shape IDs
2. Batch update all shapes with the new property value
3. Use a single store update to minimize re-renders
