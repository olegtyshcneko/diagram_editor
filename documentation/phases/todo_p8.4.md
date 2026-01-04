# Phase 8.4: Orthogonal Connections - Todo List

## Status: Completed

## Tasks
- [x] Create `src/lib/geometry/orthogonal.ts` routing algorithm
  - [x] Implement `calculateOrthogonalPath()` main function
  - [x] Implement `determineStrategy()` for L/Z/U detection
  - [x] Implement `simplifyPath()` to remove redundant points
  - [x] Implement `orthogonalToSVGPath()` helper
- [x] Create `src/components/connections/OrthogonalConnection.tsx`
  - [x] Follow CurvedConnection.tsx pattern
  - [x] Invisible hit area path
  - [x] Visible path with miter joins
  - [x] Arrow marker support
- [x] Update `src/components/connections/Connection.tsx`
  - [x] Add OrthogonalConnection import
  - [x] Add `isOrthogonal` check
  - [x] Route to OrthogonalConnection
- [x] Update `src/components/panels/sections/ConnectionSection.tsx`
  - [x] Uncomment orthogonal option in CURVE_TYPE_OPTIONS
- [x] Verification testing (manual)
  - [x] L-shape (perpendicular anchors)
  - [x] Z-shape (opposite anchors)
  - [x] U-shape (same-direction anchors)
  - [x] Path recalculates on shape move
  - [x] Style switching works (straight/curved/orthogonal)
  - [x] Arrows display correctly
  - [x] Hit detection works

## Completed Summary
| Task | Status | Notes |
|------|--------|-------|
| Create orthogonal.ts | Done | Routing algorithm with L/Z/U strategies |
| Create OrthogonalConnection.tsx | Done | Follows CurvedConnection pattern |
| Update Connection.tsx | Done | Added routing for orthogonal type |
| Update ConnectionSection.tsx | Done | Enabled orthogonal in dropdown |
| TypeScript check | Done | No errors |
| Production build | Done | Build successful |
| Fix selection deselect bug | Done | Added `isPointNearOrthogonalPath()` hit testing |
| Position-aware routing | Done | Strategy recalculates based on shape positions, not just anchors |
| Manual verification | Done | All test scenarios passed |
