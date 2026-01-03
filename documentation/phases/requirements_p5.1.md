# Phase 5.1: Text & Connection Bug Fixes - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 5.1 |
| Status | Draft |
| Dependencies | Phase 5 |
| Deployable | Yes - Bug fixes and improvements |

---

## Phase Overview

Phase 5.1 addresses known issues and code quality problems discovered during Phase 5 code review. This is a stabilization phase focused on fixing bugs, improving code quality, and enhancing user experience.

### Goals

1. Fix text overflow issue (KI-003)
2. Fix React anti-patterns and type safety issues
3. Resolve memory leaks and null safety problems
4. Improve performance and accessibility
5. Fix selection behavior between shapes and connections

---

## Issues Addressed

### Critical Priority

| ID | Issue | Description |
|----|-------|-------------|
| C1 | Text Overflow (KI-003) | Text flows outside shape bounds when content is too long |
| C2 | React Key Anti-Pattern | Array index used as key in text line rendering |
| C3 | Type Safety | Property name mismatch between `fontColor` and `color` |
| C4 | Memory Leak | Event listener cleanup race condition in connection creation |
| C5 | Null Safety | Non-null assertions without proper verification |
| C6 | Silent Failure | screenToCanvas returns (0,0) on null ref hiding bugs |

### High Priority

| ID | Issue | Description |
|----|-------|-------------|
| H1 | Performance | O(n^2) recalculation due to overly broad dependency |
| H2 | Validation | No self-connection prevention post-check |
| H3 | UX | Inconsistent zoom-aware threshold scaling |
| H4 | Accessibility | Missing aria-label, role for text editing |
| H5 | Consistency | Line height mismatch between SVG and HTML |
| H6 | State Management | Text editing state not cleared on shape delete |
| H7 | Error Handling | Missing shape existence checks for connections |

### Medium Priority

| ID | Issue | Description |
|----|-------|-------------|
| M1 | Code Quality | Magic numbers without constants |
| M2 | Numerical | Potential NaN from floating-point precision |
| M3 | Performance | Connection component not memoized |
| M4 | Maintenance | Hard-coded color values |
| M5 | Feature | Incomplete arrow type support |
| M6 | Selection Bug | Connection not deselected when shape is selected |

---

## Acceptance Criteria

### C1: Text Overflow Fix

```gherkin
Scenario: Text clips to shape bounds
  Given I have a shape with text
  When the text content exceeds the shape bounds
  Then the text is clipped at the shape boundary
  And no text appears outside the shape

Scenario: Text editing still works with clipping
  Given I have a shape with overflowing text
  When I double-click to edit
  Then I can see and edit all text in the overlay
  And saving returns to clipped view
```

### C2: React Key Fix

```gherkin
Scenario: No console warnings for keys
  Given I have shapes with multi-line text
  When the text content changes
  Then no React key warnings appear in console
  And text updates correctly
```

### M6: Selection Behavior Fix

```gherkin
Scenario: Shape selection deselects connection
  Given I have a connection selected
  When I click on a shape
  Then the shape becomes selected
  And the connection is deselected
  And the property panel shows shape properties

Scenario: Connection selection deselects shape
  Given I have a shape selected
  When I click on a connection
  Then the connection becomes selected
  And the shape is deselected
  And the property panel shows connection properties
```

---

## Definition of Done

- [ ] Text stays within shape bounds (KI-003 resolved)
- [ ] No React key warnings in console
- [ ] No runtime errors from null/undefined access
- [ ] Connection anchors work correctly at all zoom levels
- [ ] No memory leaks during connection creation/cancellation
- [ ] Screen readers can identify text editing textarea
- [ ] Selecting shape deselects connection (and vice versa)
- [ ] Type check passes with no errors
- [ ] All critical and high priority issues resolved
- [ ] Known issues document updated

---

## Test Scenarios

1. **Text Overflow**: Create shape, add long text, verify clipping
2. **Multi-line Text**: Add multi-line text, modify lines, check for key warnings
3. **Selection Toggle**: Select connection, then shape, verify deselection
4. **Zoom Anchors**: Zoom to 25%, try to click anchor points
5. **Connection Creation**: Create/cancel connections rapidly, check for memory leaks
6. **Shape Deletion**: Delete shape while editing text, verify no errors
