# Phase 8: Organization & Advanced Connections - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 8 |
| Status | Draft |
| Dependencies | Phase 0-7 |
| Deployable | Yes - Complex diagram features |

---

## Phase Overview

Phase 8 adds organizational features for complex diagrams and advanced connection capabilities. Users can group shapes together for easier manipulation, organize content into layers, and create sophisticated connections with curves, orthogonal routing, waypoints, and labels.

### Goals

1. Implement shape grouping and ungrouping
2. Enable editing shapes within groups
3. Add layers panel with visibility and locking
4. Support curved (Bezier) connections
5. Support orthogonal (right-angle) connections
6. Add connection labels and waypoints
7. Enable disconnecting and reattaching connections

---

## User Stories Included

### From Epic E07: Organization & Layers

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E07-US01 | Group Shapes | P1 | Full |
| E07-US02 | Ungroup Shapes | P1 | Full |
| E07-US03 | Edit Group Contents | P2 | Full |
| E07-US04 | Create Layers | P2 | Full |
| E07-US05 | Layer Visibility | P2 | Full |
| E07-US06 | Lock Layer | P2 | Full |
| E07-US07 | Reorder Layers | P2 | Full |
| E07-US08 | Delete Layer | P2 | Full |

### From Epic E06: Connections (Advanced)

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E06-US04 | Curved (Bezier) Connections | P0 | Full |
| E06-US05 | Orthogonal Connections | P1 | Full |
| E06-US09 | Add Label to Connection | P0 | Full |
| E06-US10 | Text on Connection Path | P1 | Partial |
| E06-US11 | Disconnect Connection | P1 | Full |
| E06-US13 | Waypoints on Connections | P2 | Full |
| E06-US14 | Shape-Level Connection Targeting | P0 | Full |

---

## Detailed Acceptance Criteria

### E07-US01: Group Shapes

**As a** user
**I want** to group shapes together
**So that** I can move and manipulate them as one unit

```gherkin
Scenario: Create group from selection
  Given I have multiple shapes selected (A, B, C)
  When I press Ctrl+G or select "Arrange > Group"
  Then the shapes are grouped together
  And a single bounding box encompasses all shapes
  And the group is selected

Scenario: Group includes connections
  Given I have shapes A and B selected
  And A and B are connected
  When I create a group
  Then the connection is included in the group

Scenario: Select group by clicking any member
  Given I have a group on the canvas
  When I click on any shape within the group
  Then the entire group is selected
  And the group bounding box is shown

Scenario: Move group moves all members
  Given I have a group selected
  When I drag the group
  Then all shapes in the group move together
  And their relative positions are maintained

Scenario: Nested groups
  Given I have groups G1 and G2 on the canvas
  When I select both groups and press Ctrl+G
  Then a parent group is created containing G1 and G2

Scenario: Group preserves z-order
  Given I group shapes with different z-indices
  Then shapes within the group maintain their relative z-order

Scenario: Cannot group single shape
  Given I have exactly one shape selected
  When I press Ctrl+G
  Then nothing happens (group requires 2+ shapes)
```

---

### E07-US02: Ungroup Shapes

**As a** user
**I want** to ungroup shapes
**So that** I can edit individual elements

```gherkin
Scenario: Ungroup with keyboard
  Given I have a group selected
  When I press Ctrl+Shift+G or select "Arrange > Ungroup"
  Then the group is dissolved
  And all individual shapes are now selected
  And shapes can be moved independently

Scenario: Ungroup nested groups
  Given I have a parent group containing child groups G1 and G2
  When I ungroup the parent
  Then only the parent level is ungrouped
  And G1 and G2 remain as groups

Scenario: Ungroup restores individual selection
  Given I ungroup a group with shapes A, B, C
  Then shapes A, B, C are all selected
  And I can now select them individually

Scenario: Ungroup from context menu
  Given I right-click on a group
  Then the context menu shows "Ungroup"
  When I click it
  Then the group is ungrouped
```

---

### E07-US03: Edit Group Contents

**As a** user
**I want** to edit individual shapes within a group
**So that** I don't have to ungroup to make small changes

```gherkin
Scenario: Enter group edit mode
  Given I have a group on the canvas
  When I double-click on the group
  Then I enter "group edit" mode
  And I can select individual shapes within the group
  And shapes outside the group are dimmed/faded

Scenario: Edit shape within group
  Given I am in group edit mode
  When I click on a shape
  Then only that shape is selected (not the whole group)
  And I can move, resize, or style it

Scenario: Exit group edit mode by clicking outside
  Given I am in group edit mode
  When I click outside the group bounds
  Then I exit group edit mode
  And the group behaves as a unit again

Scenario: Exit group edit mode with Escape
  Given I am in group edit mode
  When I press Escape
  Then I exit group edit mode

Scenario: Visual indicator for group edit mode
  Given I am in group edit mode
  Then the group boundary is highlighted differently
  And non-group shapes are visually subdued
  And a breadcrumb or indicator shows "Editing Group"

Scenario: Edit text within grouped shape
  Given I am in group edit mode
  When I double-click a shape with text
  Then text editing mode activates for that shape
```

---

### E07-US04: Create Layers

**As a** user
**I want** to organize my diagram into layers
**So that** I can manage complex diagrams

```gherkin
Scenario: View layers panel
  Given I select "View > Layers Panel" or press a shortcut
  Then a layers panel opens
  And I see a list of layers (default: "Layer 1")

Scenario: Add new layer
  Given I have the layers panel open
  When I click "Add Layer" button
  Then a new layer is created above the current layer
  And the new layer is named "Layer 2" (auto-increment)
  And the new layer becomes active

Scenario: Rename layer
  Given I have the layers panel open
  When I double-click on a layer name
  Then I can edit the name inline
  When I press Enter or click outside
  Then the name is saved

Scenario: Move shapes to layer
  Given I have multiple layers
  And I have shapes selected
  When I right-click and select "Move to Layer > [Layer Name]"
  Then the shapes move to that layer
  And they appear on the target layer

Scenario: New shapes on active layer
  Given I have multiple layers
  And "Layer 2" is the active layer
  When I create a new shape
  Then the shape is added to "Layer 2"
```

---

### E07-US05: Layer Visibility

**As a** user
**I want** to show/hide layers
**So that** I can focus on specific parts of the diagram

```gherkin
Scenario: Toggle layer visibility
  Given I have the layers panel open
  When I click the eye icon next to a layer
  Then all shapes on that layer are hidden/shown
  And the icon changes to indicate visibility state

Scenario: Hidden shapes not selectable
  Given a layer is hidden
  Then shapes on that layer cannot be selected by clicking
  And they are not included in selection box selections

Scenario: Hidden shapes not rendered
  Given a layer is hidden
  Then shapes on that layer are not visible on canvas

Scenario: Hide all but one layer
  Given I want to focus on "Layer 1"
  When I Alt-click the eye icon on "Layer 1"
  Then all other layers are hidden
  And only "Layer 1" is visible

Scenario: Layer visibility persisted
  Given I hide a layer
  When I save and reload the diagram
  Then the layer visibility state is preserved
```

---

### E07-US06: Lock Layer

**As a** user
**I want** to lock layers
**So that** I don't accidentally modify background elements

```gherkin
Scenario: Lock layer
  Given I have the layers panel open
  When I click the lock icon next to a layer
  Then all shapes on that layer become locked
  And the lock icon shows as active

Scenario: Locked shapes not selectable
  Given a layer is locked
  When I click on shapes on that layer
  Then they cannot be selected
  And they cannot be moved or modified

Scenario: Locked shapes visible
  Given a layer is locked
  Then shapes on that layer are still visible
  And they are dimmed or have a subtle indicator

Scenario: Unlock layer
  Given a layer is locked
  When I click the lock icon again
  Then the layer is unlocked
  And shapes can be selected and modified

Scenario: Cannot delete from locked layer
  Given shapes are on a locked layer
  Then attempting to delete them has no effect
```

---

### E07-US07: Reorder Layers

**As a** user
**I want** to reorder layers
**So that** I can control which elements appear on top

```gherkin
Scenario: Drag to reorder layers
  Given I have multiple layers
  When I drag "Layer 1" above "Layer 2" in the layers panel
  Then the layer order changes
  And shapes on "Layer 1" now render above "Layer 2" shapes

Scenario: Layer order affects rendering
  Given I have overlapping shapes on different layers
  Then shapes on higher layers appear above shapes on lower layers
  And this overrides individual shape z-order

Scenario: Move layer up/down with buttons
  Given I have a layer selected in the panel
  Then I can click up/down arrow buttons
  And the layer moves one position in the order
```

---

### E07-US08: Delete Layer

**As a** user
**I want** to delete layers
**So that** I can remove unused organization levels

```gherkin
Scenario: Delete empty layer
  Given I have an empty layer (no shapes)
  When I select it and click "Delete Layer"
  Then the layer is removed without confirmation

Scenario: Delete layer with shapes - move shapes
  Given I have a layer with shapes
  When I attempt to delete it
  Then a confirmation dialog appears
  And I can choose "Move shapes to [another layer]"
  When I confirm
  Then the shapes move and the layer is deleted

Scenario: Delete layer with shapes - delete all
  Given I have a layer with shapes
  When I attempt to delete it
  Then I can choose "Delete shapes too"
  When I confirm
  Then the shapes and layer are deleted

Scenario: Cannot delete last layer
  Given I have only one layer
  Then the delete option is disabled
  And I cannot delete the last layer

Scenario: Delete layer from context menu
  Given I right-click on a layer in the panel
  Then I see "Delete Layer" option
```

---

### E06-US04: Curved (Bezier) Connections

**As a** user
**I want** curved connections
**So that** I can create smooth, flowing diagrams

```gherkin
Scenario: Create curved connection
  Given I have connection style set to "curved"
  When I create a connection between two shapes
  Then a smooth bezier curve connects them
  And the curve exits and enters shapes smoothly

Scenario: Automatic control points
  Given I have a curved connection
  Then control points are automatically calculated
  And the curve direction is perpendicular to anchor points

Scenario: Select curved connection
  Given I click on a curved connection
  Then the connection is selected
  And control point handles become visible

Scenario: Adjust curve manually
  Given I have a curved connection selected
  When I drag a control point handle
  Then the curve shape adjusts
  And the curve updates in real-time during drag

Scenario: Curve adapts to shape movement
  Given I have a curved connection between shapes
  When I move one of the shapes
  Then the curve automatically recalculates
  And maintains smooth entry/exit angles

Scenario: Set connection style in property panel
  Given I have a connection selected
  Then the property panel shows connection style dropdown
  And I can change from straight to curved
```

---

### E06-US05: Orthogonal Connections

**As a** user
**I want** orthogonal (right-angle) connections
**So that** I can create clean, structured diagrams

```gherkin
Scenario: Create orthogonal connection
  Given I have connection style set to "orthogonal"
  When I create a connection between two shapes
  Then the line uses only horizontal and vertical segments
  And corners are at 90-degree angles

Scenario: Auto-routing orthogonal connections
  Given I have an orthogonal connection
  When I move a connected shape
  Then the path automatically recalculates
  And maintains orthogonal (H/V only) segments

Scenario: Orthogonal avoids simple overlaps
  Given I have shapes between source and target
  When I create an orthogonal connection
  Then the path attempts to route around obstacles (best effort)

Scenario: Orthogonal connection segments
  Given I have an orthogonal connection
  Then it has 1-3 segments typically
  And exits shapes perpendicular to the anchor side

Scenario: Orthogonal with same-side anchors
  Given source exits right and target enters right
  Then the orthogonal path makes appropriate turns
  And does not overlap with shapes if possible
```

---

### E06-US09: Add Label to Connection

**As a** user
**I want** to add text labels to connections
**So that** I can describe relationships

```gherkin
Scenario: Add label by double-clicking
  Given I have a connection on the canvas
  When I double-click on the connection line
  Then a text input appears on the connection
  And I can type a label

Scenario: Label appears at midpoint
  Given I add a label to a connection
  Then the label is positioned at the midpoint of the line
  And the label has a white/light background for readability

Scenario: Edit existing label
  Given a connection has a label
  When I double-click on the label
  Then text editing mode activates
  And I can modify the text

Scenario: Position label manually
  Given a connection has a label
  When I drag the label
  Then I can position it along the connection path
  Or offset it from the line

Scenario: Label follows connection
  Given a connection has a label
  When I move connected shapes
  Then the label moves with the connection
  And maintains its relative position

Scenario: Style connection label
  Given I have a connection label selected
  Then I can change font, size, color
  And styling options appear in property panel

Scenario: Delete connection label
  Given a connection has a label
  When I select the connection and delete the label text
  Then the label is removed
```

---

### E06-US10: Text on Connection Path (Partial)

**As a** user
**I want** text to optionally follow the connection curve
**So that** labels integrate with curved connections

```gherkin
Scenario: Enable text on path for curved connection
  Given I have a curved connection with a label
  When I enable "Text on Path" in the property panel
  Then the text follows the curve of the connection

Scenario: Text remains readable
  Given text is following a curved path
  Then text is oriented to remain readable
  And does not appear upside down

Scenario: Disable text on path
  Given I have text following a path
  When I disable "Text on Path"
  Then the text displays horizontally at the label position

Note: Full implementation may be deferred; basic label positioning is the priority.
```

---

### E06-US11: Disconnect Connection

**As a** user
**I want** to disconnect connections from shapes
**So that** I can reattach them elsewhere

```gherkin
Scenario: Drag endpoint to disconnect
  Given I have a connection attached to shapes
  When I select the connection
  And drag an endpoint away from its shape
  Then the connection detaches from that shape
  And the endpoint becomes a floating point

Scenario: Visual indicator for floating endpoint
  Given a connection has a floating endpoint
  Then the endpoint is visually distinct (different color/shape)
  And it's clear the connection is not attached

Scenario: Reattach to another shape
  Given I have a connection with a floating endpoint
  When I drag the endpoint near another shape's anchor
  Then anchor points highlight
  When I release on an anchor
  Then the connection attaches to the new shape

Scenario: Reattach to same shape different anchor
  Given I want to move a connection from left anchor to top anchor
  When I drag the endpoint to the top anchor
  Then the connection reattaches to the top

Scenario: Click and reconnect
  Given I have a connection selected
  When I click and drag an endpoint
  Then I can reconnect it to a different anchor
```

---

### E06-US13: Waypoints on Connections

**As a** user
**I want** to add waypoints to connections
**So that** I can control the path precisely

```gherkin
Scenario: Add waypoint by double-clicking
  Given I have a connection selected
  When I double-click on the connection line (not on label)
  Then a waypoint is added at that position
  And the connection path goes through the waypoint

Scenario: Move waypoint
  Given I have a connection with waypoints
  When I drag a waypoint
  Then the connection path updates
  And goes through the new waypoint position

Scenario: Remove waypoint by double-clicking
  Given I have a connection with waypoints
  When I double-click on an existing waypoint
  Then the waypoint is removed
  And the path recalculates without it

Scenario: Multiple waypoints
  Given I have a connection
  When I add multiple waypoints
  Then the connection passes through all of them in order
  And I can create complex paths

Scenario: Waypoints with curved connections
  Given I have a curved connection with waypoints
  Then the curve passes through waypoints smoothly
  And control points adjust around waypoints

Scenario: Waypoints visible when selected
  Given I select a connection with waypoints
  Then all waypoints are visible as handles
  And I can drag any waypoint
```

---

### E06-US14: Shape-Level Connection Targeting

**As a** user
**I want** to connect to a shape without precisely clicking an anchor point
**So that** creating connections is faster and easier

```gherkin
Scenario: Connect by dropping on shape
  Given I am creating a connection from shape A
  When I drag to shape B and release anywhere on the shape body
  Then the connection is created
  And the system automatically selects the best anchor point on shape B
  And the best anchor is the one closest to the drag release point

Scenario: Best anchor selection based on approach angle
  Given I am dragging a connection from the right side of shape A
  When I approach shape B from the left
  Then the left anchor of shape B is highlighted
  And releasing creates a connection to the left anchor

Scenario: Shape highlights during drag
  Given I am dragging a connection endpoint
  When I hover over a target shape
  Then the entire shape highlights (e.g., blue border)
  And the predicted best anchor point is emphasized
  And other anchors remain visible but less prominent

Scenario: Snap to specific anchor overrides auto-select
  Given I am dragging a connection to shape B
  When I move close to a specific anchor point (within snap threshold)
  Then that anchor is selected instead of the auto-calculated best
  And the snap is visually indicated

Scenario: Auto-select considers connection direction
  Given shape A is to the left of shape B
  When I create a connection from shape A to shape B
  Then the system prefers right anchor on A and left anchor on B
  And the resulting connection is clean (minimal crossover)

Scenario: Fallback to nearest anchor
  Given I release a connection on a shape corner
  Then the system selects the nearest anchor point
  And never creates invalid connections

Scenario: Works with all connection styles
  Given I have connection style set to curved or orthogonal
  When I use shape-level targeting
  Then the auto-selected anchors work correctly with the connection style
  And curved connections exit/enter perpendicular to selected anchors
```

---

## Features Included

1. **Shape Grouping**
   - Group multiple shapes (Ctrl+G)
   - Ungroup shapes (Ctrl+Shift+G)
   - Nested groups support
   - Group selection behavior
   - Group edit mode (double-click)

2. **Layers System**
   - Layers panel
   - Create/delete layers
   - Rename layers
   - Layer visibility toggle
   - Layer locking
   - Layer reordering
   - Move shapes between layers

3. **Curved Connections**
   - Bezier curve connections
   - Automatic control points
   - Manual control point adjustment
   - Smooth anchor exit/entry

4. **Orthogonal Connections**
   - Right-angle only segments
   - Automatic path routing
   - Path recalculation on move

5. **Connection Labels**
   - Add labels to connections
   - Position labels along path
   - Style connection labels
   - Labels follow connection movement

6. **Connection Waypoints**
   - Add waypoints to control path
   - Move waypoints
   - Remove waypoints
   - Multiple waypoints per connection

7. **Disconnect/Reconnect**
   - Drag to disconnect endpoints
   - Reattach to different anchors
   - Visual feedback for floating endpoints

8. **Shape-Level Connection Targeting**
   - Connect to shapes without precise anchor clicking
   - Auto-select best anchor based on approach direction
   - Shape highlight on hover during connection drag
   - Snap override when close to specific anchor

---

## Features Excluded (Deferred)

- Full text-on-path with SVG textPath - Complex, partial support only
- Advanced auto-routing avoiding all shapes - Future enhancement
- Connection bundling - Future
- Swimlanes - Future, separate feature
- Shape snapping to guides - Future

---

## Dependencies on Previous Phases

### Phase 0-7 Requirements
- Shape system with transforms (P2-P3)
- Connection system with anchors (P5)
- Selection and manipulation (P6)
- Z-order management (P7)
- History system for undo (P7)
- Context menus (P7)

### Required from Previous Phases

| Component/File | Usage |
|----------------|-------|
| `Shape` type | Extended with `groupId`, `layerId` |
| `Connection` type | Extended with waypoints, label, style |
| `useDiagramStore` | Group and layer management |
| History system | Track group/layer operations |
| Property panel | Connection style options |
| Context menu | Group/ungroup options |

---

## Definition of Done

### Grouping
- [ ] Ctrl+G groups selected shapes
- [ ] Ctrl+Shift+G ungroups
- [ ] Clicking any grouped shape selects group
- [ ] Moving group moves all members
- [ ] Double-click enters group edit mode
- [ ] Click outside or Escape exits group edit
- [ ] Nested groups supported

### Layers
- [ ] Layers panel shows all layers
- [ ] Can add/delete/rename layers
- [ ] Layer visibility toggles correctly
- [ ] Layer locking prevents modification
- [ ] Layers can be reordered
- [ ] Shapes render in layer order
- [ ] New shapes go to active layer

### Curved Connections
- [ ] Can create curved (Bezier) connections
- [ ] Control points auto-calculated
- [ ] Can manually adjust control points
- [ ] Curves update when shapes move

### Orthogonal Connections
- [ ] Can create orthogonal connections
- [ ] Only H/V segments used
- [ ] Path recalculates on shape move

### Connection Labels
- [ ] Double-click adds label
- [ ] Label positioned on connection
- [ ] Can drag to reposition label
- [ ] Labels move with connection

### Waypoints
- [ ] Double-click adds waypoint
- [ ] Can drag waypoints
- [ ] Double-click removes waypoint
- [ ] Path goes through all waypoints

### Disconnect/Reconnect
- [ ] Can drag endpoint to disconnect
- [ ] Can reattach to different anchor
- [ ] Visual feedback for floating endpoints

### Shape-Level Connection Targeting
- [ ] Can drop connection on shape body (not just anchor)
- [ ] Best anchor auto-selected based on approach direction
- [ ] Shape highlights when hovered during connection drag
- [ ] Predicted anchor point emphasized
- [ ] Close proximity to specific anchor snaps to it
- [ ] Works with straight, curved, and orthogonal styles

---

## Test Scenarios

### Grouping Tests

1. **Create Group**
   - Select 3 shapes, press Ctrl+G
   - Verify single selection with group bounds

2. **Ungroup**
   - Select group, press Ctrl+Shift+G
   - Verify 3 individual shapes selected

3. **Group Edit Mode**
   - Double-click group, click individual shape
   - Verify only that shape selected

4. **Nested Group**
   - Create group A, create group B, group both
   - Verify nested structure works

### Layers Tests

5. **Layer Visibility**
   - Hide layer, verify shapes disappear
   - Show layer, verify shapes return

6. **Layer Locking**
   - Lock layer, try to select shape
   - Verify shape not selectable

7. **Layer Order**
   - Shapes on higher layer render above

### Connection Tests

8. **Curved Connection**
   - Create curved connection
   - Drag control point, verify curve changes

9. **Orthogonal Connection**
   - Create orthogonal connection
   - Move shape, verify path recalculates

10. **Add Connection Label**
    - Double-click connection
    - Type label, verify displays

11. **Add Waypoint**
    - Select connection, double-click line
    - Verify waypoint added, drag it

12. **Shape-Level Targeting**
    - Create connection by dropping on shape body
    - Verify best anchor auto-selected
    - Verify shape highlights during hover

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Group 50 shapes | < 100ms |
| Ungroup operation | < 50ms |
| Layer toggle | < 16ms |
| Curve calculation | < 5ms |
| Orthogonal routing | < 10ms |
| Waypoint update | < 5ms |

---

## Notes for Implementation

### Group Structure

```typescript
// Groups can be represented as:
// Option 1: groupId reference on shapes
interface Shape {
  id: string;
  groupId?: string; // Reference to group
  // ...
}

interface Group {
  id: string;
  memberIds: string[];
  parentGroupId?: string; // For nesting
}

// Option 2: Groups are shapes that contain other shapes
interface GroupShape extends Shape {
  type: 'group';
  children: Shape[];
}
```

### Layer Structure

```typescript
interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  order: number; // Z-order among layers
}

interface Shape {
  id: string;
  layerId: string;
  // ...
}
```

### Bezier Curve Calculation

```typescript
// Automatic control points for smooth curves
function calculateControlPoints(
  start: Point,
  startAnchor: AnchorPosition,
  end: Point,
  endAnchor: AnchorPosition
): { cp1: Point; cp2: Point } {
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const offset = distance * 0.4; // Control point offset

  // Control points perpendicular to anchor direction
  const cp1 = getOffsetPoint(start, startAnchor, offset);
  const cp2 = getOffsetPoint(end, endAnchor, offset);

  return { cp1, cp2 };
}

function getOffsetPoint(
  point: Point,
  anchor: AnchorPosition,
  distance: number
): Point {
  switch (anchor) {
    case 'top': return { x: point.x, y: point.y - distance };
    case 'bottom': return { x: point.x, y: point.y + distance };
    case 'left': return { x: point.x - distance, y: point.y };
    case 'right': return { x: point.x + distance, y: point.y };
  }
}
```

### Orthogonal Routing Algorithm

```typescript
function calculateOrthogonalPath(
  start: Point,
  startAnchor: AnchorPosition,
  end: Point,
  endAnchor: AnchorPosition
): Point[] {
  const points: Point[] = [start];

  // Simple L-shaped or Z-shaped routing
  // Exit perpendicular to anchor
  const exitPoint = getExitPoint(start, startAnchor);
  const entryPoint = getExitPoint(end, endAnchor);

  // Determine if we need middle segment
  if (needsMiddleSegment(start, startAnchor, end, endAnchor)) {
    const midY = (exitPoint.y + entryPoint.y) / 2;
    points.push({ x: exitPoint.x, y: midY });
    points.push({ x: entryPoint.x, y: midY });
  } else {
    points.push(exitPoint);
    points.push(entryPoint);
  }

  points.push(end);
  return points;
}
```

### Connection with Waypoints

```typescript
interface Connection {
  id: string;
  sourceShapeId: string;
  targetShapeId: string;
  sourceAnchor: AnchorPosition;
  targetAnchor: AnchorPosition;

  // Advanced properties
  style: 'straight' | 'curved' | 'orthogonal';
  waypoints: Point[];
  label?: ConnectionLabel;

  // Control points for curves (auto-calculated or manual)
  controlPoints?: {
    cp1?: Point;
    cp2?: Point;
  };
}

interface ConnectionLabel {
  text: string;
  position: number; // 0-1 along the path
  offset: Point;    // Offset from path
  style: TextStyle;
}
```
