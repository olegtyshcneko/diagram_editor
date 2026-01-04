# Phase 8.3: Curved Connections - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 8.3 |
| Status | Draft |
| Parent Phase | P8 Organization |
| Deployable | Yes - Curved connection style |

---

## Phase Overview

Phase 8.3 adds curved (Bezier) connection support. Users can create smooth curved connections between shapes with automatic control point calculation and optional manual adjustment.

### Goals

1. Implement curved connection rendering
2. Auto-calculate control points based on anchor direction
3. Enable manual control point adjustment
4. Add connection style selection to property panel

---

## User Stories Included

### From Epic E06: Connections (Advanced)

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E06-US04 | Curved (Bezier) Connections | P0 | Full |

---

## Detailed Acceptance Criteria

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

## Features Included

1. **Curved Connection Rendering**
   - Bezier curve path (cubic bezier)
   - Smooth curve through control points
   - Arrow markers on curved paths
   - Selection highlight for curves

2. **Automatic Control Points**
   - Calculate based on anchor direction
   - Control point offset proportional to distance
   - Perpendicular exit from source anchor
   - Perpendicular entry to target anchor

3. **Manual Control Point Adjustment**
   - Visible handles when selected
   - Drag to adjust curve shape
   - Real-time curve update
   - Control points persist with connection

4. **Connection Style Selection**
   - Dropdown in property panel
   - Options: Straight, Curved
   - Style stored on connection
   - Default style configurable

5. **Shape Movement Response**
   - Recalculate control points on move
   - Maintain smooth curve shape
   - Update in real-time during drag

---

## Features Excluded (Deferred to 8.5)

- Waypoints on curved connections
- Multiple curve segments
- Quadratic bezier option
- Custom control point presets

---

## Dependencies on Previous Phases

### Required from Previous Phases

| Component/File | Usage |
|----------------|-------|
| `Connection` type | Extended with `style`, `controlPoints` |
| Connection rendering | Extended for curve paths |
| Property panel | Connection style dropdown |
| Selection system | Control point handles |

---

## Definition of Done

### Curved Rendering
- [ ] Bezier curve renders smoothly
- [ ] Arrows display correctly on curves
- [ ] Curve hit area for selection works
- [ ] Selection highlight follows curve

### Control Points
- [ ] Auto-calculated based on anchors
- [ ] Perpendicular to anchor direction
- [ ] Proportional to connection distance
- [ ] Recalculate on shape move

### Manual Adjustment
- [ ] Handles visible when selected
- [ ] Drag updates curve in real-time
- [ ] Control points persist
- [ ] Handles disappear on deselect

### Style Selection
- [ ] Dropdown in property panel
- [ ] Can switch straight ↔ curved
- [ ] New connections use selected style

---

## Test Scenarios

1. **Create Curved Connection**
   - Set style to curved, create connection
   - Verify smooth bezier curve renders

2. **Auto Control Points**
   - Create curved connection between shapes
   - Verify curve exits/enters perpendicular to anchors

3. **Move Shape**
   - Move connected shape
   - Verify curve recalculates smoothly

4. **Adjust Control Point**
   - Select curved connection
   - Drag control point handle
   - Verify curve updates

5. **Switch Styles**
   - Create straight connection
   - Change to curved in property panel
   - Verify conversion works

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Curve calculation | < 5ms |
| Curve render | < 2ms |
| Control point update | < 5ms |
| 50 curved connections | < 50ms total |

---

## Notes for Implementation

### Bezier Curve Math

```typescript
// Cubic bezier: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
// P0 = start, P1 = control point 1, P2 = control point 2, P3 = end

interface CurvedConnection extends Connection {
  style: 'curved';
  controlPoints: {
    cp1: Point;  // Near source
    cp2: Point;  // Near target
  };
}
```

### Control Point Calculation
Control points are offset from anchor points in the perpendicular direction:
- Source control point: offset from source in anchor's outward direction
- Target control point: offset from target in anchor's outward direction
- Offset distance: ~40% of total connection length, capped at 100px
