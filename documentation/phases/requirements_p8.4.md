# Phase 8.4: Orthogonal Connections - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 8.4 |
| Status | Draft |
| Dependencies | Phase 8.3 (Curved Connections) |
| Parent Phase | P8 Organization |
| Deployable | Yes - Orthogonal connection style |

---

## Phase Overview

Phase 8.4 adds orthogonal (right-angle) connection support. Orthogonal connections use only horizontal and vertical line segments, creating clean structured diagrams commonly used in flowcharts, network diagrams, and UML.

### Goals

1. Implement orthogonal connection rendering
2. Auto-route with L, Z, or U-shaped paths
3. Recalculate path when shapes move
4. Add orthogonal option to style selector

---

## User Stories Included

### From Epic E06: Connections (Advanced)

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E06-US05 | Orthogonal Connections | P1 | Full |

---

## Detailed Acceptance Criteria

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

## Features Included

1. **Orthogonal Rendering**
   - Horizontal and vertical segments only
   - 90-degree corners (no rounding in this phase)
   - Arrow markers at endpoints
   - Selection highlight

2. **Auto-Routing Algorithm**
   - L-shaped path (perpendicular anchors)
   - Z-shaped path (opposite anchors)
   - U-shaped path (same-direction anchors)
   - Exit perpendicular to anchor

3. **Dynamic Recalculation**
   - Recalculate on shape move
   - Update during drag (real-time)
   - Maintain route style

4. **Style Selection**
   - Add "Orthogonal" to style dropdown
   - Convert between styles

---

## Features Excluded (Deferred)

- Advanced obstacle avoidance (A* pathfinding)
- Manual segment adjustment (covered in 8.5 Waypoints)
- Rounded corners
- Minimum segment length constraints

---

## Dependencies on Previous Phases

### Required from Previous Phases

| Component/File | Usage |
|----------------|-------|
| `Connection` type | Extended with 'orthogonal' style |
| ConnectionRenderer | Route to orthogonal component |
| Property panel | Style dropdown extended |

---

## Definition of Done

### Orthogonal Rendering
- [ ] Only H/V segments
- [ ] 90-degree corners
- [ ] Arrows display correctly
- [ ] Selection hit area works

### Auto-Routing
- [ ] L-shaped for perpendicular anchors
- [ ] Z-shaped for opposite anchors
- [ ] U-shaped for same-side anchors
- [ ] Exit perpendicular to anchor

### Dynamic Updates
- [ ] Recalculate on shape move
- [ ] Update in real-time during drag
- [ ] Path stays orthogonal

### Style Selection
- [ ] "Orthogonal" in dropdown
- [ ] Can switch to/from orthogonal

---

## Test Scenarios

1. **Create Orthogonal - L Shape**
   - Right anchor → Top anchor
   - Verify L-shaped path

2. **Create Orthogonal - Z Shape**
   - Right anchor → Left anchor
   - Verify Z-shaped path with midpoint

3. **Create Orthogonal - U Shape**
   - Right anchor → Right anchor
   - Verify U-shaped path going around

4. **Move Shape**
   - Create orthogonal connection
   - Move target shape
   - Verify path recalculates

5. **Switch to Orthogonal**
   - Create straight connection
   - Change style to orthogonal
   - Verify conversion

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Path calculation | < 10ms |
| Path render | < 2ms |
| Recalculation | < 10ms |
| 50 orthogonal connections | < 100ms |

---

## Notes for Implementation

### Routing Strategy

```typescript
type RoutingStrategy = 'L-shape' | 'Z-shape' | 'U-shape';

// Determine strategy based on anchor positions:
// - Perpendicular anchors (e.g., right→top): L-shape
// - Opposite anchors (e.g., right→left): Z-shape
// - Same-direction anchors (e.g., right→right): U-shape
```

### Path Simplification
Remove redundant points where three consecutive points are on the same line (horizontal or vertical).
