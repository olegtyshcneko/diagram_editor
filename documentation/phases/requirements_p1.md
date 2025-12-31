# Phase 1: Canvas Foundation - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 1 |
| Status | Draft |
| Dependencies | Phase 0 (Project Setup) |
| Deployable | Yes - Empty canvas with zoom/pan |

---

## Phase Overview

Phase 1 implements the core canvas infrastructure that serves as the foundation for all drawing operations. Users will be able to interact with an infinite SVG canvas, zoom in/out using the mouse wheel, and pan around using multiple input methods.

### Goals

1. Create an infinite SVG canvas with proper viewBox handling
2. Implement smooth zoom functionality centered on cursor position
3. Enable panning via middle-mouse drag and spacebar + left-click drag
4. Display zoom level in the status bar
5. Implement viewport state management
6. Create a basic canvas background

---

## User Stories Included

### From Epic E01: Canvas & Viewport

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E01-US01 | View Infinite Canvas | P0 | Full |
| E01-US02 | Zoom with Mouse Wheel | P0 | Full |
| E01-US03 | Pan Canvas | P0 | Full |
| E01-US04 | Zoom to Fit | P1 | Partial (basic implementation) |
| E01-US06 | Reset Zoom | P1 | Full |

---

## Detailed Acceptance Criteria

### E01-US01: View Infinite Canvas

**As a** user
**I want** an infinite canvas to work on
**So that** I can create diagrams of any size without constraints

```gherkin
Scenario: Canvas renders on load
  Given I open the application
  Then an SVG canvas is displayed in the main area
  And the canvas fills the available viewport
  And the canvas has a neutral background color

Scenario: Canvas extends beyond viewport
  Given I am on the diagram editor
  When I pan the canvas in any direction
  Then the canvas continues infinitely
  And there are no visible boundaries

Scenario: Canvas coordinate system
  Given I am viewing the canvas
  Then the canvas uses a standard coordinate system
  And (0,0) starts at the top-left of the initial viewport
  And X increases to the right
  And Y increases downward

Scenario: Viewport state persistence (session)
  Given I pan and zoom to a specific location
  When I refresh the browser (within session)
  Then the viewport should reset to default
  Note: Cross-session persistence is not required for this phase
```

---

### E01-US02: Zoom with Mouse Wheel

**As a** user
**I want** to zoom in and out using my mouse wheel
**So that** I can quickly adjust my view level

```gherkin
Scenario: Zoom in with mouse wheel
  Given I am viewing the canvas at 100% zoom
  When I scroll the mouse wheel up (or toward me)
  Then the canvas zooms in by approximately 10%
  And the zoom is centered on the mouse cursor position
  And the zoom level indicator updates

Scenario: Zoom out with mouse wheel
  Given I am viewing the canvas at 100% zoom
  When I scroll the mouse wheel down (or away from me)
  Then the canvas zooms out by approximately 10%
  And the zoom is centered on the mouse cursor position
  And the zoom level indicator updates

Scenario: Zoom center point
  Given my cursor is at position (500, 300) on the canvas
  When I zoom in
  Then the point under my cursor (500, 300) remains under my cursor
  And surrounding content scales relative to that point

Scenario: Zoom limits - maximum
  Given I am viewing the canvas at 390% zoom
  When I scroll to zoom in
  Then the zoom stops at 400% (maximum)
  And further scroll up does not increase zoom

Scenario: Zoom limits - minimum
  Given I am viewing the canvas at 20% zoom
  When I scroll to zoom out
  Then the zoom stops at 10% (minimum)
  And further scroll down does not decrease zoom

Scenario: Zoom indicator updates
  Given I am viewing the canvas
  When I zoom in or out
  Then the zoom percentage in the status bar updates immediately
  And shows the current zoom level (e.g., "75%", "150%")

Scenario: Smooth zoom transition
  Given I scroll the mouse wheel
  Then the zoom transition is smooth (not jarring)
  And the canvas content scales fluidly
```

---

### E01-US03: Pan Canvas

**As a** user
**I want** to pan the canvas by dragging
**So that** I can navigate to different areas of my diagram

```gherkin
Scenario: Pan with middle mouse button
  Given I am on the canvas
  When I press and hold the middle mouse button
  And I drag in any direction
  Then the canvas pans following my mouse movement
  And the cursor changes to a grabbing icon
  When I release the middle mouse button
  Then panning stops
  And the cursor returns to normal

Scenario: Pan with spacebar and left-click
  Given I am on the canvas with any tool selected
  When I press and hold the spacebar
  Then the cursor changes to an open hand (grab cursor)
  When I press the left mouse button and drag
  Then the canvas pans following my mouse movement
  When I release the spacebar
  Then my previous tool is restored
  And the cursor returns to the tool's cursor

Scenario: Pan direction
  Given I am panning the canvas
  When I drag the mouse to the right
  Then the canvas content moves to the right
  And the viewport reveals content that was to the left
  Note: This is "natural" scrolling - content follows mouse

Scenario: Pan speed matches mouse movement
  Given I am panning the canvas
  When I drag the mouse 100 pixels to the right
  Then the canvas content moves approximately 100 pixels to the right
  And pan movement is 1:1 with mouse movement

Scenario: Pan works at any zoom level
  Given I am viewing the canvas at 50% zoom
  When I pan the canvas
  Then panning works correctly
  And the pan distance in screen pixels matches mouse movement
```

---

### E01-US04: Zoom to Fit (Basic)

**As a** user
**I want** to reset the view to default
**So that** I can return to a known starting point

```gherkin
Scenario: Reset to default view
  Given I have panned and zoomed the canvas
  When I select "View > Reset View" or press Ctrl+Shift+F
  Then the viewport resets to default position (0, 0)
  And the zoom resets to 100%

Note: Full "Zoom to Fit" (fitting all content) deferred to Phase 2+
when shapes exist on the canvas.
```

---

### E01-US06: Reset Zoom

**As a** user
**I want** to reset the zoom to 100%
**So that** I can view the diagram at actual size

```gherkin
Scenario: Reset to 100%
  Given I am viewing the canvas at any zoom level (e.g., 175%)
  When I press Ctrl+1 or select "View > Actual Size"
  Then the zoom resets to 100%
  And the current center of the viewport is maintained

Scenario: Reset zoom preserves position
  Given I am viewing at 200% zoom, centered on (500, 500)
  When I reset zoom to 100%
  Then the zoom becomes 100%
  And the viewport remains centered on (500, 500)

Scenario: Keyboard shortcut accessibility
  Given I press Ctrl+0
  Then the zoom resets to 100%
  Note: Ctrl+1 is the primary shortcut, Ctrl+0 as alternative
```

---

## Features Included

1. **SVG Canvas Component**
   - Full-viewport SVG element
   - Proper viewBox configuration
   - CSS styling for background

2. **Viewport Management**
   - Viewport position (x, y pan offset)
   - Zoom level state (0.1 to 4.0)
   - ViewBox calculation from viewport state

3. **Zoom Functionality**
   - Mouse wheel zoom handler
   - Cursor-centered zoom calculation
   - Zoom limits (10% - 400%)
   - Smooth zoom transitions

4. **Pan Functionality**
   - Middle-mouse button pan
   - Spacebar + left-click pan
   - Natural scrolling direction
   - Cursor changes during pan

5. **Status Bar Updates**
   - Live zoom percentage display
   - Cursor position display (canvas coordinates)

6. **Keyboard Shortcuts**
   - Ctrl+1 / Ctrl+0: Reset to 100% zoom
   - Ctrl+Shift+F: Reset view (position and zoom)

---

## Features Excluded (Deferred)

- Grid display (E01-US07) - Phase 7
- Snap to grid (E01-US08) - Phase 7
- Zoom to fit all content (E01-US04 full) - Phase 2+
- Zoom to selection (E01-US05) - Phase 2+
- Minimap navigation - Future
- Rulers - Future
- Touch/gesture support - Future

---

## Dependencies on Previous Phases

### Phase 0 Requirements
- Vite + React + TypeScript project initialized
- Tailwind CSS configured
- Zustand installed and skeleton stores created
- Type definitions for viewport state
- Constants defined (zoom limits, etc.)
- App shell layout component

### Required from Phase 0

| Component/File | Usage in Phase 1 |
|----------------|------------------|
| `src/stores/uiStore.ts` | Viewport state (x, y, zoom) |
| `src/lib/constants.ts` | CANVAS_DEFAULTS (zoom limits) |
| `src/types/common.ts` | Point, Bounds types |
| `src/components/layout/AppShell.tsx` | Layout container |

---

## Definition of Done

- [ ] SVG canvas renders in the main area
- [ ] Canvas fills available viewport space
- [ ] Mouse wheel zooms in/out
- [ ] Zoom is centered on cursor position
- [ ] Zoom limits (10% - 400%) are enforced
- [ ] Middle-mouse drag pans the canvas
- [ ] Spacebar + left-click pans the canvas
- [ ] Cursor changes appropriately during pan
- [ ] Spacebar release restores previous state
- [ ] Status bar shows current zoom percentage
- [ ] Status bar shows cursor position
- [ ] Ctrl+1 resets zoom to 100%
- [ ] Ctrl+Shift+F resets view to default
- [ ] Pan and zoom work together smoothly
- [ ] No jank or performance issues during interactions
- [ ] All interactions work at various zoom levels
- [ ] Unit tests cover viewport calculations
- [ ] Manual testing confirms all scenarios pass

---

## Test Scenarios

### Functional Tests

1. **Canvas Rendering**
   - Open app, verify canvas is visible
   - Resize browser, verify canvas resizes

2. **Zoom In**
   - Start at 100%, scroll up, verify zoom increases
   - Verify cursor position stays fixed during zoom

3. **Zoom Out**
   - Start at 100%, scroll down, verify zoom decreases
   - Verify zoom doesn't go below 10%

4. **Zoom Limits**
   - Zoom to 400%, try to zoom more, verify blocked
   - Zoom to 10%, try to zoom less, verify blocked

5. **Pan with Middle Mouse**
   - Press middle mouse, drag, verify canvas moves
   - Verify cursor changes to grabbing

6. **Pan with Spacebar**
   - Press space, press left mouse, drag, verify canvas moves
   - Release space, verify tool/cursor restored

7. **Reset Zoom**
   - Zoom to 200%, press Ctrl+1, verify returns to 100%
   - Verify viewport center is maintained

8. **Status Bar**
   - Zoom, verify percentage updates
   - Move mouse, verify position updates

### Edge Cases

1. **Rapid Zoom**
   - Scroll wheel rapidly, verify no glitches

2. **Zoom While Panning**
   - Start pan, scroll wheel, verify both work

3. **Pan at Extreme Zoom**
   - Zoom to 10%, pan, verify works correctly
   - Zoom to 400%, pan, verify works correctly

4. **Keyboard During Pan**
   - Hold spacebar, release, verify state resets correctly

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Zoom response time | < 16ms (60fps) |
| Pan response time | < 16ms (60fps) |
| Time to first canvas render | < 500ms |
| Memory usage (empty canvas) | < 50MB |

---

## Notes for Implementation

### ViewBox Calculation

The SVG viewBox should be calculated from viewport state:
```
viewBox = `${-offsetX} ${-offsetY} ${width/zoom} ${height/zoom}`
```

Where:
- `offsetX`, `offsetY` are pan offsets
- `width`, `height` are container dimensions
- `zoom` is the zoom factor (1.0 = 100%)

### Cursor-Centered Zoom

When zooming, calculate the new offset to keep the point under the cursor fixed:
```
newOffsetX = cursorCanvasX - (cursorScreenX / newZoom)
newOffsetY = cursorCanvasY - (cursorScreenY / newZoom)
```

### Event Handling Priority

1. Spacebar should be captured before other keyboard handlers
2. Middle mouse should not trigger browser scroll
3. Wheel events should prevent default scroll behavior
