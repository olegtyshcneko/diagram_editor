# Phase 8.5: Labels & Waypoints - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 8.5 |
| Status | Draft |
| Dependencies | Phase 8.4 (Orthogonal Connections) |
| Parent Phase | P8 Organization |
| Deployable | Yes - Connection labels and waypoints |

---

## Phase Overview

Phase 8.5 adds connection labels and waypoints. Users can add text labels to connections and insert waypoints to manually control connection paths. These features work with all connection styles (straight, curved, orthogonal).

### Goals

1. Add text labels to connections
2. Position labels along connection path
3. Add waypoints to control path
4. Waypoints work with all connection styles

---

## User Stories Included

### From Epic E06: Connections (Advanced)

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E06-US09 | Add Label to Connection | P0 | Full |
| E06-US10 | Text on Connection Path | P1 | Partial (basic horizontal labels only) |
| E06-US13 | Waypoints on Connections | P2 | Full |

---

## Detailed Acceptance Criteria

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

### E06-US10: Text on Connection Path (Basic)

**As a** user
**I want** basic horizontal labels on connections
**So that** labels are readable

```gherkin
Scenario: Label displays horizontally
  Given I have a connection with a label
  Then the text displays horizontally
  And is centered at the label position

Note: Full text-on-path (text following curves) is deferred.
Basic horizontal labels only in this phase.
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

## Features Included

1. **Connection Labels**
   - Double-click to add label
   - Label at connection midpoint
   - White background for readability
   - Edit by double-clicking
   - Drag to reposition
   - Follows connection movement
   - Delete by clearing text

2. **Label Styling**
   - Font family selection
   - Font size
   - Text color
   - Property panel section

3. **Waypoints**
   - Double-click to add
   - Drag to move
   - Double-click waypoint to remove
   - Multiple waypoints supported
   - Works with all connection styles
   - Visible handles when selected

4. **All Styles Support**
   - Straight connections with waypoints
   - Curved connections through waypoints
   - Orthogonal with waypoints

---

## Features Excluded (Deferred)

- Text following curved path (textPath SVG)
- Label rotation to match path angle
- Multiple labels per connection
- Rich text in labels

---

## Dependencies on Previous Phases

### Required from Previous Phases

| Component/File | Usage |
|----------------|-------|
| `Connection` type | Extended with `label`, `waypoints` |
| All connection renderers | Support waypoints |
| Property panel | Label styling section |
| Text editing system | Reuse for labels |

---

## Definition of Done

### Labels
- [ ] Double-click adds label
- [ ] Label at midpoint by default
- [ ] White background on label
- [ ] Can edit existing label
- [ ] Can drag to reposition
- [ ] Label follows connection
- [ ] Can delete label
- [ ] Styling in property panel

### Waypoints
- [ ] Double-click line adds waypoint
- [ ] Can drag waypoints
- [ ] Double-click waypoint removes it
- [ ] Multiple waypoints work
- [ ] Waypoints visible when selected
- [ ] Works with straight connections
- [ ] Works with curved connections
- [ ] Works with orthogonal connections

---

## Test Scenarios

1. **Add Label**
   - Double-click connection, type "Label"
   - Verify label appears at midpoint

2. **Edit Label**
   - Double-click existing label
   - Change text, verify update

3. **Drag Label**
   - Drag label along path
   - Verify position updates

4. **Add Waypoint**
   - Select connection, double-click line
   - Verify waypoint added, path changes

5. **Move Waypoint**
   - Drag waypoint
   - Verify path updates through new position

6. **Remove Waypoint**
   - Double-click existing waypoint
   - Verify removed, path recalculates

7. **Multiple Waypoints**
   - Add 3 waypoints
   - Verify path goes through all

8. **Curved with Waypoints**
   - Add waypoints to curved connection
   - Verify smooth curve through waypoints

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Label render | < 2ms |
| Waypoint update | < 5ms |
| Path with 5 waypoints | < 10ms |

---

## Notes for Implementation

### Label Structure

```typescript
interface ConnectionLabel {
  text: string;
  position: number;      // 0-1 along path
  offset: Point;         // Offset from path
  style: {
    fontFamily: string;
    fontSize: number;
    color: string;
  };
}
```

### Waypoint Structure

```typescript
interface ConnectionWaypoint {
  id: string;
  point: Point;
}

interface Connection {
  // ... existing fields
  label?: ConnectionLabel;
  waypoints: ConnectionWaypoint[];
}
```

### Path Calculation with Waypoints
For straight and orthogonal: path goes through waypoints
For curved: smooth bezier curve through all waypoints
