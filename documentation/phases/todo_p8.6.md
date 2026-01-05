# Phase 8.6: Disconnect & Shape-Level Targeting - Todo List

## Status: Completed

## Tasks
- [x] Step 1: Extend Connection types with sourceAttached, targetAttached, floatingSourcePoint, floatingTargetPoint
- [x] Step 2: Create anchorSelection.ts utility (calculateBestAnchor, scoring logic)
- [x] Step 3: Add disconnect/reconnect store actions to diagramStore.ts
- [x] Step 4: Create useEndpointDrag hook for endpoint drag/drop
- [x] Step 5: Update Connection.tsx for draggable endpoints and floating visuals
- [x] Step 6: Create ShapeConnectionHighlight component for visual feedback
- [x] Step 7: Update useConnectionCreation.ts for shape-level targeting
- [x] Step 8: Integrate shape highlight in AnchorPointsOverlay
- [x] Step 9: Update getConnectionEndpoints to handle floating endpoints
- [x] Step 10: Add history support for disconnect/reconnect operations
- [x] Manual testing and verification

## Completed Summary
| Task | Status | Notes |
|------|--------|-------|
| Extend Connection types | Done | Added sourceAttached, targetAttached, floatingSourcePoint, floatingTargetPoint |
| Create anchorSelection.ts | Done | calculateBestAnchor with 50/30/20 scoring weights |
| Store actions | Done | disconnectEndpoint, reconnectEndpoint, updateFloatingEndpoint |
| useEndpointDrag hook | Done | Full drag/drop with history support |
| Connection.tsx updates | Done | Draggable endpoints with orange floating visual |
| ShapeConnectionHighlight | Done | Blue border + anchor highlighting |
| useConnectionCreation updates | Done | Shape body hit detection + auto-anchor selection |
| Canvas integration | Done | Props passed through Canvas to AnchorPointsOverlay |
| getConnectionEndpoints | Done | Handles sourceAttached/targetAttached false cases |
| History support | Done | Uses UPDATE_STYLE type with before/after connection state |
| Build verification | Done | TypeScript and Vite build pass |
| Manual testing | Done | All features verified working |

## Files Created
- `src/lib/geometry/anchorSelection.ts`
- `src/hooks/useEndpointDrag.ts`
- `src/components/connections/ShapeConnectionHighlight.tsx`

## Files Modified
- `src/types/connections.ts`
- `src/stores/diagramStore.ts`
- `src/stores/interactionStore.ts`
- `src/lib/geometry/connection.ts`
- `src/hooks/useConnectionCreation.ts`
- `src/components/connections/Connection.tsx`
- `src/components/connections/AnchorPointsOverlay.tsx`
- `src/components/canvas/Canvas.tsx`
- `src/components/canvas/CanvasContainer.tsx`
