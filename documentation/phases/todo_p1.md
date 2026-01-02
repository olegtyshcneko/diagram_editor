# Phase 1: Canvas Foundation - Todo List

## Status: Completed

## Tasks

### Types & Utilities
- [x] Create `src/types/viewport.ts` with Viewport and ViewportBounds interfaces
- [x] Create `src/lib/geometry/viewport.ts` with viewport math utilities (calculateViewBox, screenToCanvas, canvasToScreen, zoomAtPoint, clampZoom)

### Hooks
- [x] Create `src/hooks/useContainerSize.ts` ResizeObserver hook

### Store
- [x] Update `src/stores/uiStore.ts` with viewport state and actions

### Components
- [x] Create `src/components/canvas/Canvas.tsx` SVG component
- [x] Create `src/components/canvas/CanvasContainer.tsx` with event handlers
- [x] Create `src/components/layout/StatusBar.tsx`
- [x] Update `src/components/layout/AppShell.tsx` to integrate canvas and statusbar
- [x] Update `src/App.tsx` to use simplified AppShell

### Verification
- [x] Run `npm run dev` - canvas displays
- [x] Mouse wheel zoom works (centered on cursor)
- [ ] Middle-mouse pan works - **NOT WORKING, see KI-001**
- [x] Spacebar + left-click pan works
- [x] Ctrl+1/Ctrl+0 reset zoom to 100%
- [x] Ctrl++/= zoom in, Ctrl+- zoom out
- [x] Ctrl+Shift+F reset view to origin
- [x] Status bar shows zoom percentage
- [x] Status bar shows cursor position
- [x] Cursor changes during pan (grab/grabbing)
- [x] Run `npm run build` - no errors
- [x] Run `npx tsc --noEmit` - no type errors

## Known Issues
- **KI-001**: Middle mouse pan not working (see `documentation/known_issues.md`)

---

## Completed Summary

| Task | Status | Notes |
|------|--------|-------|
| viewport.ts types | Done | Viewport, ViewportBounds interfaces |
| viewport.ts utilities | Done | All functions implemented, containerSize params prefixed with _ |
| useContainerSize hook | Done | ResizeObserver-based |
| uiStore update | Done | All viewport state and actions added |
| Canvas component | Done | SVG with viewBox, forwardRef |
| CanvasContainer | Done | All event handlers, keyboard shortcuts |
| StatusBar | Done | Reads from store, clickable buttons |
| AppShell integration | Done | CanvasContainer and StatusBar integrated |
| App.tsx update | Done | Removed placeholder content |
| TypeScript build | Done | All type errors fixed |
| Vite build | Done | Production build passes |
