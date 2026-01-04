# Phase 8.1.1: Group Resize & Rotation - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 8.1.1 |
| Status | Draft |
| Dependencies | Phase 8.1 (Groups) |
| Parent Phase | P8 Organization |
| Deployable | Yes - Enhanced group manipulation |

---

## Phase Overview

Phase 8.1.1 enhances the group functionality from Phase 8.1 by adding unified group selection visuals, group resize, and group rotation capabilities. When a group is selected, users see a single bounding box with resize and rotation handles instead of individual shape handles.

### Goals

1. Unified group selection UI (single bounding box, no individual handles)
2. Group resize - scale all members proportionally
3. Group rotation - rotate all members around group center
4. Maintain consistency with individual shape manipulation (Shift/Alt modifiers)

---

## User Stories

### US01: Unified Group Selection Visual

**As a** user
**I want** to see a single selection box when I select a group
**So that** I can clearly distinguish between group and individual selection

```gherkin
Scenario: Group selection shows unified bounding box
  Given I have a group containing shapes A, B, C
  When I click on any shape in the group
  Then I see a single bounding box around the entire group
  And I do NOT see individual selection handles on each shape
  And the bounding box has 8 resize handles (corners + edges)
  And there is a rotation handle above the bounding box

Scenario: Individual selection in edit mode
  Given I am in group edit mode
  When I click on a shape within the group
  Then I see individual selection handles on that shape only
  And I do NOT see the group bounding box handles

Scenario: Mixed selection behavior
  Given I have a group G and an ungrouped shape S
  When I select both (Shift+click or marquee)
  Then I see a combined bounding box around all shapes
  And I can resize/rotate them as a unit
```

---

### US02: Group Resize

**As a** user
**I want** to resize a group using handles on the group bounding box
**So that** all shapes scale proportionally together

```gherkin
Scenario: Resize group from corner handle
  Given I have a group selected
  When I drag a corner resize handle
  Then all shapes in the group scale proportionally
  And shapes maintain their relative positions within the group
  And shapes maintain their relative sizes to each other

Scenario: Resize group with Shift key (uniform)
  Given I have a group selected
  When I hold Shift and drag any resize handle
  Then the group scales uniformly (maintains aspect ratio)
  And all member shapes scale proportionally

Scenario: Resize group with Alt key (from center)
  Given I have a group selected
  When I hold Alt and drag a resize handle
  Then the group scales from its center point
  And shapes on opposite sides move symmetrically

Scenario: Resize group from edge handle
  Given I have a group selected
  When I drag an edge (non-corner) resize handle
  Then the group stretches in that dimension only
  And shapes scale and reposition accordingly

Scenario: Minimum size constraint
  Given I have a group selected
  When I resize the group very small
  Then each shape respects its minimum size (10x10)
  And the group cannot be smaller than its smallest valid state

Scenario: Resize nested group
  Given I have a parent group containing child groups
  When I resize the parent group
  Then all shapes in all nested groups scale proportionally
```

---

### US03: Group Rotation

**As a** user
**I want** to rotate a group using a rotation handle
**So that** all shapes rotate together around the group center

```gherkin
Scenario: Rotate group with rotation handle
  Given I have a group selected
  When I drag the rotation handle
  Then all shapes rotate around the group's center point
  And each shape's position rotates around group center
  And each shape's individual rotation also changes
  And shapes maintain their relative positions

Scenario: Rotate group with Shift key (15° snap)
  Given I have a group selected
  When I hold Shift and drag the rotation handle
  Then rotation snaps to 15° increments
  And all shapes rotate together at snapped angles

Scenario: Rotation angle display
  Given I am rotating a group
  Then I see the current rotation angle displayed
  And the angle is relative to the group's starting orientation

Scenario: Rotate nested group
  Given I have a parent group containing child groups
  When I rotate the parent group
  Then all shapes in all nested groups rotate around parent center
```

---

### US04: Group Edit Mode Exit Behavior

**As a** user
**I want** to exit group edit mode only by clicking outside the group
**So that** I have explicit control over when I leave edit mode

```gherkin
Scenario: Exit group edit mode by clicking outside
  Given I am in group edit mode for a group
  When I click on the canvas outside the group bounds
  Then I exit group edit mode
  And the group behaves as a unit again

Scenario: Escape does NOT exit group edit mode
  Given I am in group edit mode for a group
  When I press Escape
  Then I remain in group edit mode
  And nothing happens

Scenario: Click on ungrouped shape exits edit mode
  Given I am in group edit mode for a group
  And there is an ungrouped shape outside the group
  When I click on the ungrouped shape
  Then I exit group edit mode
  And the ungrouped shape becomes selected
```

---

### US05: History Integration

**As a** user
**I want** group resize and rotation to be undoable
**So that** I can revert changes if needed

```gherkin
Scenario: Undo group resize
  Given I have resized a group
  When I press Ctrl+Z
  Then all shapes return to their original sizes
  And all shapes return to their original positions

Scenario: Undo group rotation
  Given I have rotated a group
  When I press Ctrl+Z
  Then all shapes return to their original rotations
  And all shapes return to their original positions

Scenario: History description
  Given I resize a group of 3 shapes
  Then history shows "Resize 3 shapes"

  Given I rotate a group of 3 shapes
  Then history shows "Rotate 3 shapes"
```

---

## Features Included

1. **Unified Group Selection**
   - Single bounding box for selected groups
   - Hide individual shape handles when group selected
   - 8 resize handles on group bounds
   - Rotation handle above group bounds
   - Visual consistency with individual shape selection

2. **Group Resize**
   - Corner handles: proportional scaling
   - Edge handles: stretch in one dimension
   - Shift modifier: uniform/aspect-locked scaling
   - Alt modifier: scale from center
   - Minimum size enforcement
   - Works with nested groups

3. **Group Rotation**
   - Rotation handle on group bounds
   - Rotate around group center
   - Shift modifier: 15° snap
   - Angle display during rotation
   - Works with nested groups

4. **Group Edit Mode Exit Behavior** (behavior change from P8.1)
   - Click outside group exits edit mode
   - Escape key does NOT exit edit mode
   - Click on ungrouped shape exits edit mode and selects that shape

5. **History Support**
   - Full undo/redo for group resize
   - Full undo/redo for group rotation
   - Descriptive history entries

---

## Features Excluded (Deferred)

- Skew/shear transformation
- Non-uniform scaling per axis with keyboard modifiers
- Rotation pivot point adjustment
- Transform origin selection

---

## Dependencies on Previous Phases

### Required from Phase 8.1

| Component | Usage |
|-----------|-------|
| `groupStore` | Group membership, editing state |
| `GroupOverlay` | Enhanced with resize/rotation handles |
| `calculateGroupBounds` | Group bounding box calculation |
| `getTopLevelGroupForShape` | Nested group handling |

### Required from Phase 3

| Component | Usage |
|-----------|-------|
| `useShapeResize` | Resize handle logic (reference) |
| `useShapeRotation` | Rotation handle logic (reference) |
| `SelectionHandles` | Handle rendering (reference) |

---

## Definition of Done

### Unified Selection
- [ ] Group selection shows single bounding box
- [ ] Individual shape handles hidden when group selected
- [ ] 8 resize handles visible on group bounds
- [ ] Rotation handle visible above group bounds
- [ ] Edit mode still shows individual handles

### Group Resize
- [ ] Corner drag scales all shapes proportionally
- [ ] Edge drag stretches in one dimension
- [ ] Shift key maintains aspect ratio
- [ ] Alt key scales from center
- [ ] Minimum size enforced
- [ ] Nested groups resize correctly
- [ ] Snap to grid works during resize

### Group Rotation
- [ ] Rotation handle rotates all shapes
- [ ] Shapes rotate around group center
- [ ] Shift key snaps to 15° increments
- [ ] Angle displayed during rotation
- [ ] Nested groups rotate correctly

### Group Edit Mode Exit
- [ ] Click outside group exits edit mode
- [ ] Escape key does NOT exit edit mode
- [ ] Click on ungrouped shape exits and selects that shape

### History
- [ ] Resize is undoable/redoable
- [ ] Rotation is undoable/redoable
- [ ] History descriptions are accurate

---

## Test Scenarios

1. **Unified Selection**
   - Select group, verify single bounding box
   - Enter edit mode, verify individual handles return

2. **Basic Resize**
   - Create group of 2 shapes, drag corner, verify proportional scaling
   - Verify shapes maintain relative positions

3. **Resize Modifiers**
   - Resize with Shift, verify aspect ratio locked
   - Resize with Alt, verify scales from center

4. **Basic Rotation**
   - Create group, drag rotation handle
   - Verify all shapes rotate around center

5. **Rotation Modifiers**
   - Rotate with Shift, verify 15° snapping

6. **Nested Groups**
   - Create nested group, resize parent
   - Verify all nested shapes scale correctly

7. **History**
   - Resize group, undo, verify restoration
   - Rotate group, undo, verify restoration

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Resize 20 shapes | < 16ms per frame |
| Rotate 20 shapes | < 16ms per frame |
| Handle render | < 8ms |

---

## Notes for Implementation

### Scale Calculation

When resizing from a corner:
1. Calculate scale factors: `scaleX = newWidth / oldWidth`, `scaleY = newHeight / oldHeight`
2. For each shape:
   - New position: `(shape.x - groupBounds.x) * scaleX + newBounds.x`
   - New size: `shape.width * scaleX`, `shape.height * scaleY`

### Rotation Calculation

When rotating around group center:
1. Calculate group center: `centerX = bounds.x + bounds.width/2`, `centerY = bounds.y + bounds.height/2`
2. For each shape:
   - Get shape center relative to group center
   - Rotate that point by the delta angle
   - Update shape position based on new center
   - Add delta angle to shape's rotation

### Handle Visibility Logic

```typescript
// In SelectionHandles or GroupOverlay
const showGroupHandles = isCompleteGroupSelected && !isInGroupEditMode;
const showIndividualHandles = !showGroupHandles;
```
