# Naive Draw.io - Claude Instructions

## Phase-Based Todo Workflow (Hybrid Approach)

### At Start of Each Phase

1. Read `documentation/phases/requirements_pN.md` and `spec_pN.md`
2. Create `documentation/phases/todo_pN.md` with tasks derived from the spec
3. Use TodoWrite tool for granular in-session tracking

### Todo File Format (`todo_pN.md`)

```markdown
# Phase N: [Name] - Todo List

## Status: [Not Started | In Progress | Completed]

## Tasks
- [ ] Task 1 description
- [ ] Task 2 description
...

## Completed Summary
| Task | Status | Notes |
|------|--------|-------|
| Task description | Done | Any issues or notes |
| Task description | Partial | What's missing |
| Task description | Blocked | Why blocked |
```

### During Implementation

- Mark tasks `[x]` as completed immediately
- Add entry to Completed Summary table with:
  - Status: Done, Partial, Blocked
  - Notes: Any issues, deviations, or important info
- If a task reveals subtasks, add them to the list

### At End of Each Phase

- Ensure all tasks marked complete or documented why not
- Update Status to "Completed" (or "Partial" with notes)
- Review summary table for any unresolved issues

### Manual Test Verification

After each phase, run verification steps from spec file and document results in todo summary.

---

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── layout/       # AppShell, layout components
│   ├── canvas/       # Canvas rendering (P1+)
│   ├── shapes/       # Shape components (P2+)
│   ├── connections/  # Connection components (P5+)
│   ├── panels/       # Property panel, etc (P4+)
│   ├── toolbar/      # Tool selection (P2+)
│   └── menu/         # Menu bar, context menu (P7+)
├── hooks/            # Custom React hooks
├── stores/           # Zustand stores
├── lib/              # Utilities and constants
│   └── geometry/     # Geometry calculations (P1+)
└── types/            # TypeScript type definitions

documentation/phases/
├── requirements_p0.md ... requirements_p9.md
├── spec_p0.md ... spec_p9.md
└── todo_p0.md ... todo_p9.md
```

## Coding Conventions

- Use `@/` path alias for imports: `import { Button } from '@/components/ui/button'`
- Zustand stores: typed interfaces, create() pattern
- Components: named exports, Props interface suffix
- Types: dedicated files grouped by domain (shapes.ts, connections.ts, tools.ts)

## Key Commands

```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # Production build
npx tsc --noEmit # Type check
```

## Phase Overview

| Phase | Name | Key Focus |
|-------|------|-----------|
| P0 | Project Setup | Vite, Tailwind, shadcn/ui, Zustand, types |
| P1 | Canvas Foundation | SVG canvas, zoom, pan, viewport |
| P2 | Basic Shapes | Rectangle, ellipse, creation, selection |
| P3 | Shape Manipulation | Move, resize, rotate, delete |
| P4 | Styling & Properties | Colors, stroke, property panel |
| P5 | Text & Connections | Text editing, straight connections |
| P6 | Multi-Selection | Multi-select, copy/paste, alignment |
| P7 | History & Grid | Undo/redo, grid, shortcuts, context menu |
| P8 | Organization | Groups, layers, advanced connections |
| P9 | File Operations | Save, load, export, import |
