# Naive Draw.io

A web-based vector diagramming application built with React and TypeScript. Create, edit, and manipulate diagrams with shapes, connections, and text - similar to draw.io.

## Features

### Current (Phases 0-3 Complete)

- **SVG Canvas** - Infinite canvas with zoom (mouse wheel, cursor-centered) and pan (spacebar + drag)
- **Shape Creation** - Rectangle and ellipse tools with click+drag creation and live preview
- **Shape Selection** - Click to select with visual feedback and selection handles
- **Shape Manipulation**
  - Move: Drag or arrow keys (Shift for 10px increments)
  - Resize: 8 handles with Shift (aspect ratio) and Alt (from center) modifiers
  - Rotate: Rotation handle with Shift snapping to 15° increments
  - Delete: Delete/Backspace keys
- **Keyboard Shortcuts** - V (select), R (rectangle), E (ellipse), Escape (cancel)
- **Status Bar** - Shows zoom level and cursor position

### Planned

| Phase | Features |
|-------|----------|
| P4 | Fill/stroke colors, stroke styles, property panel |
| P5 | Text editing, straight line connections |
| P6 | Multi-selection, copy/paste, alignment tools |
| P7 | Undo/redo, grid display, snap-to-grid, context menus |
| P8 | Groups, layers, curved connections |
| P9 | Save/load, export (PNG/SVG/PDF), draw.io compatibility |

## Tech Stack

- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool with HMR
- **Tailwind CSS 4** - Styling
- **Zustand** - State management
- **shadcn/ui** - UI components
- **Vitest** - Testing

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/olegtyshcneko/diagram_editor.git
cd diagram_editor

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Other Commands

```bash
# Type checking
npx tsc --noEmit

# Run tests
npm test          # Watch mode
npm run test:run  # Single run

# Linting
npm run lint

# Production build
npm run build

# Preview production build
npm run preview
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| V | Select tool |
| R | Rectangle tool |
| E | Ellipse tool |
| Escape | Cancel current operation |
| Delete / Backspace | Delete selected shape |
| Arrow keys | Move selected shape (1px) |
| Shift + Arrow keys | Move selected shape (10px) |
| Mouse wheel | Zoom in/out |
| Spacebar + drag | Pan canvas |

### Shape Creation Modifiers

| Modifier | Effect |
|----------|--------|
| Shift | Constrain to square/circle |

### Resize Modifiers

| Modifier | Effect |
|----------|--------|
| Shift | Preserve aspect ratio |
| Alt | Resize from center |

### Rotation Modifiers

| Modifier | Effect |
|----------|--------|
| Shift | Snap to 15° increments |

## Project Structure

```
src/
├── components/
│   ├── canvas/       # SVG canvas, zoom/pan, creation preview
│   ├── shapes/       # Shape rendering and selection handles
│   ├── toolbar/      # Tool selection UI
│   ├── layout/       # App shell, status bar
│   └── ui/           # shadcn/ui components
├── hooks/            # Custom React hooks for interactions
├── stores/           # Zustand state management
├── lib/              # Utilities and geometry calculations
└── types/            # TypeScript type definitions

documentation/
└── phases/           # Phase specifications and requirements
```

## License

MIT
