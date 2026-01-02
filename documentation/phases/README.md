# Naive Draw.io - Phase Tracker

## Quick Reference

To start a phase, tell Claude: **"start phase N"** (e.g., "start phase 2")

---

## Phase Status

| Phase | Name | Status | Requirements | Spec | Todo |
|-------|------|--------|--------------|------|------|
| P0 | Project Setup | **Completed** | [requirements_p0.md](./requirements_p0.md) | [spec_p0.md](./spec_p0.md) | [todo_p0.md](./todo_p0.md) |
| P1 | Canvas Foundation | **Completed** | [requirements_p1.md](./requirements_p1.md) | [spec_p1.md](./spec_p1.md) | [todo_p1.md](./todo_p1.md) |
| P2 | Basic Shapes | **Completed** | [requirements_p2.md](./requirements_p2.md) | [spec_p2.md](./spec_p2.md) | [todo_p2.md](./todo_p2.md) |
| P3 | Shape Manipulation | Not Started | [requirements_p3.md](./requirements_p3.md) | [spec_p3.md](./spec_p3.md) | - |
| P4 | Styling & Properties | Not Started | [requirements_p4.md](./requirements_p4.md) | [spec_p4.md](./spec_p4.md) | - |
| P5 | Text & Connections | Not Started | [requirements_p5.md](./requirements_p5.md) | [spec_p5.md](./spec_p5.md) | - |
| P6 | Multi-Selection | Not Started | [requirements_p6.md](./requirements_p6.md) | [spec_p6.md](./spec_p6.md) | - |
| P7 | History & Grid | Not Started | [requirements_p7.md](./requirements_p7.md) | [spec_p7.md](./spec_p7.md) | - |
| P8 | Organization | Not Started | [requirements_p8.md](./requirements_p8.md) | [spec_p8.md](./spec_p8.md) | - |
| P9 | File Operations | Not Started | [requirements_p9.md](./requirements_p9.md) | [spec_p9.md](./spec_p9.md) | - |

---

## Phase Descriptions

### P0: Project Setup
Vite + React + TypeScript, Tailwind CSS, shadcn/ui, Zustand stores, type definitions, app shell layout.

### P1: Canvas Foundation
SVG canvas with viewBox, mouse wheel zoom (cursor-centered), pan via spacebar+click, status bar with zoom/position.

### P2: Basic Shapes
Rectangle and ellipse creation, shape rendering, basic selection with click.

### P3: Shape Manipulation
Move shapes by dragging, resize with handles, rotate, delete with keyboard.

### P4: Styling & Properties
Fill/stroke colors, stroke width/style, property panel UI, style persistence.

### P5: Text & Connections
Text editing inside shapes, straight line connections between shapes.

### P6: Multi-Selection
Shift+click and marquee selection, copy/paste, alignment tools.

### P7: History & Grid
Undo/redo stack, grid display and snap, keyboard shortcuts, context menu.

### P8: Organization
Shape grouping, layer ordering (z-index), orthogonal/curved connections.

### P9: File Operations
Save/load JSON, export to PNG/SVG, import from files.

---

## Completion Notes

### P0 - Completed
- All infrastructure in place
- shadcn/ui button verified working

### P1 - Completed
- Canvas with zoom/pan functional
- KI-001 resolved in Phase 2 (middle mouse pan now works)

### P2 - Completed
- Rectangle and ellipse creation (click + drag)
- Toolbar with Select (V), Rectangle (R), Ellipse (E) tools
- Single shape selection with 8 handles
- Shift constraint for perfect squares/circles
- Creation preview during drag
- Keyboard shortcuts working
