# Phase 8.3: Curved Connections - Todo List

## Status: Completed

## Tasks

### Types & Utilities
- [x] Add `controlPoints` field to Connection interface in `src/types/connections.ts`
- [x] Create `src/lib/geometry/bezier.ts` with bezier curve utilities
  - [x] `calculateAutoControlPoints()` - perpendicular offset calculation
  - [x] `bezierToSVGPath()` - generate SVG path data
  - [x] `getPointOnBezier()` - get point at t parameter
  - [x] `isPointNearBezier()` - hit testing for curves

### Components
- [x] Create `src/components/connections/CurvedConnection.tsx`
  - [x] Invisible hit area `<path>` for selection
  - [x] Visible bezier `<path>` with markers
  - [x] Use manual controlPoints if set, auto-calculate otherwise
- [x] Create `src/components/connections/ConnectionControlPoints.tsx`
  - [x] Guide lines from anchors to control points
  - [x] Draggable circle handles for cp1 and cp2
  - [x] mouseDown handler to start drag

### Hooks
- [x] Create `src/hooks/useControlPointDrag.ts`
  - [x] Drag state management
  - [x] Screen to canvas coordinate conversion
  - [x] History tracking on drag end

### Integration
- [x] Update `src/components/connections/Connection.tsx`
  - [x] Check `curveType === 'bezier'`
  - [x] Calculate/use control points
  - [x] Render CurvedConnection for bezier
  - [x] Render ConnectionControlPoints when selected + curved
- [x] Update `src/components/panels/sections/ConnectionSection.tsx`
  - [x] Add CURVE_TYPE_OPTIONS constant
  - [x] Add Style dropdown (Straight/Curved)
- [x] Update `src/components/connections/index.ts` exports

### Verification
- [x] Create straight connection - renders as line
- [x] Change to "Curved" - bezier renders
- [x] Arrows work on curved path
- [x] Select curved connection - handles appear
- [x] Drag control point - curve updates real-time
- [x] Control point position persists
- [x] Undo/redo works for control points
- [x] Move shape - curve endpoints update
- [x] Zoom works correctly

## Completed Summary

| Task | Status | Notes |
|------|--------|-------|
| Add controlPoints to Connection type | Done | Added ConnectionControlPoints interface and optional field |
| Create bezier utilities | Done | Full bezier math: auto control points, SVG path, point on curve, hit testing |
| Create CurvedConnection component | Done | Renders bezier curve with hit area, markers, and stroke styles |
| Create ConnectionControlPoints component | Done | Guide lines and draggable handles for cp1/cp2 |
| Create useControlPointDrag hook | Done | Handles drag state, coordinate conversion, history tracking |
| Update Connection.tsx | Done | Routes to curved/straight based on curveType, renders control handles |
| Update ConnectionSection.tsx | Done | Added Style dropdown with Straight/Curved options |
| Update index.ts exports | Done | Added CurvedConnection and ConnectionControlPoints exports |
| TypeScript build | Done | No errors |
| Fix curved connection hit testing | Done | Added bezier hit testing to useSelection.ts for proper curve selection |
| Fix control point drag deselection | Done | Added isControlPointDragging flag to prevent canvas click handling after drag |

## Known Issues Added

- KI-009: Start Arrows Partially Hidden Under Shapes (needs marker refX adjustment)
- KI-008: No Multi-Selection for Connections (feature not implemented)
