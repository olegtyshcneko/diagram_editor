# Phase 0: Project Setup & Infrastructure - Todo List

## Status: Completed

## Tasks

### Project Initialization
- [x] Initialize Vite project with React + TypeScript template
- [x] Install and configure Tailwind CSS
- [x] Install and configure shadcn/ui
- [x] Configure path aliases (@/) in tsconfig.json and vite.config.ts
- [x] Install Zustand

### Project Structure
- [x] Create directory structure (components/, hooks/, stores/, lib/, types/)
- [x] Create empty placeholder directories for future phases

### Type Definitions
- [x] Create `src/types/common.ts` (Point, Bounds, Size)
- [x] Create `src/types/shapes.ts` (Shape, ShapeType, defaults)
- [x] Create `src/types/connections.ts` (Connection, AnchorPosition, defaults)
- [x] Create `src/types/tools.ts` (Tool, ToolInfo, TOOLS array)

### Store Skeletons
- [x] Create `src/stores/diagramStore.ts` (shapes, connections, selection state)
- [x] Create `src/stores/uiStore.ts` (tool, viewport, UI toggles)

### Constants & Utilities
- [x] Create `src/lib/constants.ts` (canvas, grid, shape, color defaults)
- [x] Verify `src/lib/utils.ts` exists (cn function from shadcn)

### App Shell
- [x] Create `src/components/layout/AppShell.tsx` (header, sidebar, main, property panel, status bar)
- [x] Update `src/App.tsx` to use AppShell

### Verification
- [x] Run `npm run dev` - no errors, app displays
- [x] Click test button - shadcn/ui working
- [x] Run `npm run build` - no errors
- [x] Run `npx tsc --noEmit` - no type errors

---

## Completed Summary

| Task | Status | Notes |
|------|--------|-------|
| Vite initialization | Done | Used temp directory approach since target dir had files |
| Tailwind CSS | Done | Upgraded to v4.1.18 with @tailwindcss/vite, OKLCH colors, tw-animate-css |
| shadcn/ui | Done | Button component added for verification |
| Path aliases | Done | Configured in tsconfig.json, tsconfig.app.json, vite.config.ts |
| Zustand | Done | v5.0.9 installed |
| Directory structure | Done | All component directories created |
| Type definitions | Done | common, shapes, connections, tools |
| Store skeletons | Done | diagramStore, uiStore with initial state |
| Constants | Done | Canvas, grid, shape, color defaults |
| AppShell | Done | Full layout with header, sidebar, main, panel, footer |
| Build verification | Done | tsc and vite build pass |
| Dev server | Done | Starts on localhost:5173 |
