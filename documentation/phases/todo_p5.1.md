# Phase 5.1: Text & Connection Bug Fixes - Todo List

## Status: Completed

## Tasks

### Part 1: Documentation Setup
- [x] Step 1: Create requirements_p5.1.md
- [x] Step 2: Create spec_p5.1.md
- [x] Step 3: Create todo_p5.1.md
- [x] Step 4: Update phases/README.md with P5.1 entry

### Part 2: Constants Setup
- [x] Step 5: Add missing constants to constants.ts (TEXT_LINE_HEIGHT, NUMERICAL.EPSILON, COLORS.SELECTION_HOVER)

### Part 3: Critical Text Fixes
- [x] Step 6: Add SVG clipPath for text overflow (KI-003)
- [x] Step 7: Fix React key anti-pattern in ShapeText
- [x] Step 8: Type safety already correct (fontColor used consistently)
- [x] Step 9: Add accessibility attributes to TextEditOverlay (aria-label, aria-multiline)
- [x] Step 10: Fix line height consistency (use TEXT_DEFAULTS.LINE_HEIGHT)

### Part 4: Critical Connection Fixes
- [x] Step 11: Fix event listener memory leak in useConnectionCreation (ref pattern)
- [x] Step 12: Fix non-null assertions in AnchorPointsOverlay (proper null checks)
- [x] Step 13: Fix silent (0,0) failure in screenToCanvas (log warning, return null)
- [x] Step 14: Shape existence validation already handled in Connection component

### Part 5: High Priority Fixes
- [x] Step 15: Optimize Connection dependency array (only depend on source/target shapes)
- [x] Step 16: Add zoom-aware threshold scaling to useConnectionCreation
- [x] Step 17: Clear text editing state on shape delete
- [x] Step 18: Self-connection prevention already correct (skips source shape in loop)

### Part 6: Medium Priority Fixes
- [x] Step 19: Add epsilon comparison for floating-point in connection.ts
- [x] Step 20: Add React.memo to Connection component
- [x] Step 21: Extract color values to constants (COLORS.SELECTION, COLORS.SELECTION_HOVER)
- [x] Step 22: Fix selection bug (connection now deselected when shape selected)

### Part 7: Verification & Cleanup
- [x] Step 23: Run type check (npx tsc --noEmit) - PASSED
- [x] Step 24: Update known_issues.md - mark KI-003 as resolved
- [x] Step 25: Update phases/README.md with completion status

## Completed Summary

| Task | Status | Notes |
|------|--------|-------|
| Documentation Setup | Done | requirements, spec, todo files created |
| Constants Setup | Done | Added LINE_HEIGHT, EPSILON, SELECTION_HOVER |
| Text Overflow (KI-003) | Done | Added clipPath to ShapeText |
| React Key Fix | Done | Using shapeId in keys |
| Accessibility | Done | Added aria-label, aria-multiline |
| Line Height | Done | Using TEXT_DEFAULTS.LINE_HEIGHT |
| Memory Leak | Done | Using ref pattern for event handlers |
| Null Safety | Done | Removed non-null assertions |
| Silent Failure | Done | screenToCanvas returns null and logs warning |
| Performance | Done | Connection only depends on relevant shapes |
| Zoom Scaling | Done | Threshold scaled by viewport.zoom |
| Text State Cleanup | Done | Effect clears editing state on delete |
| Floating-Point | Done | Using NUMERICAL.EPSILON |
| Memoization | Done | Connection wrapped in React.memo |
| Colors | Done | Using COLORS constants |
| Selection Bug | Done | selectShape clears selectedConnectionIds |

## Files Created (3)
- `documentation/phases/requirements_p5.1.md`
- `documentation/phases/spec_p5.1.md`
- `documentation/phases/todo_p5.1.md`

## Files Modified (12)
- `documentation/phases/README.md` - Added P5.1 entry
- `documentation/known_issues.md` - Marked KI-003 as resolved
- `src/lib/constants.ts` - Added new constants
- `src/components/shapes/ShapeText.tsx` - clipPath, keys, constants
- `src/components/shapes/Rectangle.tsx` - Pass shapeId prop
- `src/components/shapes/Ellipse.tsx` - Pass shapeId prop
- `src/components/canvas/TextEditOverlay.tsx` - Accessibility, constants
- `src/components/connections/Connection.tsx` - Memoization, colors, perf
- `src/components/connections/AnchorPointsOverlay.tsx` - Null safety
- `src/hooks/useConnectionCreation.ts` - Memory leak, zoom, null handling
- `src/hooks/useTextEditing.ts` - State cleanup on delete
- `src/lib/geometry/connection.ts` - Epsilon comparison
- `src/stores/diagramStore.ts` - Selection bug fix
