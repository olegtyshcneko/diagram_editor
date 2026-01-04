# Phase 8.1: Groups - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 8.1 |
| Status | Draft |
| Dependencies | Phase 0-7 |
| Parent Phase | P8 Organization |
| Deployable | Yes - Group functionality |

---

## Phase Overview

Phase 8.1 adds shape grouping capabilities to the diagram editor. Users can group multiple shapes together to move and manipulate them as a single unit, and can edit individual shapes within a group without ungrouping.

### Goals

1. Implement shape grouping (Ctrl+G)
2. Implement ungrouping (Ctrl+Shift+G)
3. Support nested groups
4. Enable group edit mode (double-click to enter)
5. Maintain group-aware selection behavior

---

## User Stories Included

### From Epic E07: Organization & Layers

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E07-US01 | Group Shapes | P1 | Full |
| E07-US02 | Ungroup Shapes | P1 | Full |
| E07-US03 | Edit Group Contents | P2 | Full |

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

## Features Included

1. **Group Creation**
   - Group multiple shapes with Ctrl+G
   - Connections between grouped shapes included
   - Single bounding box for group
   - Nested groups support

2. **Group Behavior**
   - Click any member selects entire group
   - Move group moves all members
   - Relative positions maintained
   - Z-order preserved within group

3. **Ungrouping**
   - Ungroup with Ctrl+Shift+G
   - Context menu option
   - Ungroup only one level (nested groups preserved)
   - All members become selected after ungroup

4. **Group Edit Mode**
   - Double-click to enter
   - Escape or click outside to exit
   - Select/manipulate individual shapes
   - Visual distinction (dimmed non-group shapes)
   - Edit text within grouped shapes

---

## Features Excluded (Deferred)

- Group opacity/effects
- Group clipping masks
- Group templates
- Lock group (lock individual shapes instead)

---

## Dependencies on Previous Phases

### Required from Previous Phases

| Component/File | Usage |
|----------------|-------|
| `Shape` type | Extended with `groupId` |
| Selection system | Group-aware selection |
| History system | Track group/ungroup operations |
| Context menu | Group/ungroup options |
| Menu bar | Arrange menu items |

---

## Definition of Done

### Grouping
- [ ] Ctrl+G groups selected shapes (2+ required)
- [ ] Group has single bounding box
- [ ] Clicking any grouped shape selects group
- [ ] Moving group moves all members
- [ ] Nested groups supported
- [ ] Connections included when both endpoints grouped

### Ungrouping
- [ ] Ctrl+Shift+G ungroups
- [ ] Context menu shows "Ungroup"
- [ ] Only top level ungrouped (nested preserved)
- [ ] All members selected after ungroup

### Group Edit Mode
- [ ] Double-click enters group edit mode
- [ ] Individual shape selection works
- [ ] Can move/resize/style individual shapes
- [ ] Escape exits edit mode
- [ ] Click outside exits edit mode
- [ ] Non-group shapes dimmed
- [ ] Visual indicator for edit mode

### Integration
- [ ] Arrange menu: Group, Ungroup items
- [ ] History: Undo/redo group operations
- [ ] Selection state persisted correctly

---

## Test Scenarios

1. **Create Group**
   - Select 3 shapes, press Ctrl+G
   - Verify single selection with group bounds

2. **Move Group**
   - Select group, drag to move
   - Verify all shapes move together

3. **Ungroup**
   - Select group, press Ctrl+Shift+G
   - Verify 3 individual shapes selected

4. **Group Edit Mode**
   - Double-click group, click individual shape
   - Verify only that shape selected

5. **Exit Edit Mode**
   - Press Escape while in edit mode
   - Verify returns to normal group behavior

6. **Nested Group**
   - Create group A, create group B, group both
   - Verify nested structure works

7. **Ungroup Nested**
   - Ungroup parent of nested groups
   - Verify child groups remain grouped

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Group 50 shapes | < 100ms |
| Ungroup operation | < 50ms |
| Group selection | < 16ms |
| Enter/exit edit mode | < 16ms |

---

## Notes for Implementation

### Group Structure
Groups are stored as separate entities with references to member shapes. Each shape has an optional `groupId` field.

```typescript
interface Group {
  id: string;
  memberIds: string[];
  parentGroupId?: string; // For nesting
}

interface Shape {
  // ... existing fields
  groupId?: string;
}
```

### Selection Behavior
When not in group edit mode, clicking any grouped shape selects the entire group (all member shapes). In edit mode, individual selection works normally.
