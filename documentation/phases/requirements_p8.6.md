# Phase 8.6: Disconnect & Shape-Level Targeting - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 8.6 |
| Status | Draft |
| Dependencies | Phase 8.5 (Labels & Waypoints) |
| Parent Phase | P8 Organization |
| Deployable | Yes - Enhanced connection UX |

---

## Phase Overview

Phase 8.6 improves connection interaction with two features: the ability to disconnect/reconnect connection endpoints, and shape-level connection targeting that allows users to drop connections on shape bodies instead of precisely clicking anchor points.

### Goals

1. Enable disconnecting connection endpoints
2. Enable reconnecting to different anchors
3. Implement shape-level targeting
4. Auto-select best anchor based on approach direction

---

## User Stories Included

### From Epic E06: Connections (Advanced)

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E06-US11 | Disconnect Connection | P1 | Full |
| E06-US14 | Shape-Level Connection Targeting | P0 | Full |

---

## Detailed Acceptance Criteria

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

1. **Disconnect Endpoints**
   - Drag endpoint to disconnect
   - Endpoint becomes floating
   - Visual indicator for floating state
   - Connection remains on canvas

2. **Reconnect to Anchor**
   - Drag floating endpoint to anchor
   - Anchor highlights on hover
   - Snap to anchor on release
   - Works with all shapes

3. **Floating Endpoint Visual**
   - Different color (e.g., orange/red)
   - Clear disconnected state
   - Persists until reconnected

4. **Shape-Level Targeting**
   - Drop on shape body, not just anchor
   - Auto-select best anchor
   - Based on approach direction
   - Based on relative position

5. **Shape Highlight During Drag**
   - Whole shape highlights
   - Predicted anchor emphasized
   - Other anchors dimmed
   - Clear visual feedback

6. **Snap Override**
   - Close to specific anchor snaps to it
   - Overrides auto-selection
   - Visible snap indicator
   - Configurable threshold

---

## Features Excluded (Deferred)

- Floating connections (both ends detached)
- Connection to canvas point (no shape)
- Connection groups
- Connection bundling

---

## Dependencies on Previous Phases

### Required from Previous Phases

| Component/File | Usage |
|----------------|-------|
| `Connection` type | Add `sourceAttached`, `targetAttached` |
| Connection creation hook | Update for shape targeting |
| Anchor system | Extend with best-anchor logic |
| Selection overlay | Endpoint drag handles |

---

## Definition of Done

### Disconnect
- [ ] Can drag endpoint to disconnect
- [ ] Floating endpoint visual (orange circle)
- [ ] Connection stays on canvas
- [ ] Endpoint follows cursor while dragging

### Reconnect
- [ ] Drag near anchor to reconnect
- [ ] Anchor highlights on hover
- [ ] Snap to anchor on release
- [ ] History tracks reconnect

### Shape-Level Targeting
- [ ] Drop on shape body works
- [ ] Best anchor auto-selected
- [ ] Based on approach direction
- [ ] Shape highlights on hover

### Snap Override
- [ ] Close to anchor snaps
- [ ] Overrides auto-select
- [ ] Visual snap indicator
- [ ] Works with all connection styles

---

## Test Scenarios

1. **Disconnect Endpoint**
   - Create connection
   - Select, drag target endpoint away
   - Verify floating visual

2. **Reconnect to Same Shape**
   - Disconnect endpoint
   - Drag to different anchor on same shape
   - Verify reconnection

3. **Reconnect to Different Shape**
   - Disconnect endpoint
   - Drag to new shape's anchor
   - Verify new connection target

4. **Shape-Level Target**
   - Start connection from shape A
   - Drag to center of shape B
   - Verify auto-selects best anchor

5. **Approach Direction**
   - Approach from left of shape B
   - Verify left anchor selected

6. **Snap Override**
   - Approach shape B
   - Move very close to top anchor
   - Verify snaps to top (not auto)

7. **All Styles Work**
   - Test with straight, curved, orthogonal
   - Verify targeting works for each

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Anchor calculation | < 5ms |
| Shape highlight | < 16ms |
| Snap detection | < 5ms |
| Reconnection | < 10ms |

---

## Notes for Implementation

### Best Anchor Calculation

```typescript
function calculateBestAnchor(
  targetShape: Shape,
  dragPoint: Point,
  sourcePoint: Point,
  sourceAnchor?: AnchorPosition
): AnchorPosition {
  // Score each anchor based on:
  // 1. Distance to drag point (50%)
  // 2. Approach direction alignment (30%)
  // 3. Opposite anchor bonus (20%)
  // Return highest scoring anchor
}
```

### Snap Threshold
Default: 25px from anchor center
At this distance, specific anchor overrides auto-selection

### Connection State

```typescript
interface Connection {
  // ... existing
  sourceAttached: boolean;  // false if floating
  targetAttached: boolean;  // false if floating
  floatingSourcePoint?: Point;  // Position when detached
  floatingTargetPoint?: Point;
}
```
