# Naive Draw.io

A web-based vector diagramming application built with React and TypeScript. Create, edit, and manipulate diagrams with shapes, connections, and text - similar to draw.io.

## Features

### Current (Phases 0-7)

- **SVG Canvas** - Infinite canvas with zoom (mouse wheel, cursor-centered) and pan (spacebar + drag)
- **Shape Creation** - Rectangle and ellipse tools with click+drag creation and live preview
- **Shape Selection** - Click to select with visual feedback and adaptive selection handles
- **Shape Manipulation**
  - Move: Drag or arrow keys (Shift for 10px increments)
  - Resize: 8 handles with Shift (aspect ratio) and Alt (from center) modifiers
  - Rotate: Rotation handle with Shift snapping to 15° increments
  - Delete: Delete/Backspace keys
- **Styling & Properties**
  - Fill color with opacity, presets, and recent colors
  - Stroke color, width (presets + custom), and style (solid/dashed/dotted)
  - Corner radius for rectangles
  - Property panel with collapsible sections
- **Text Editing**
  - Double-click shapes to edit text
  - Multi-line support with automatic word wrapping
  - Font family, size, bold/italic/underline
  - Text color and alignment (left/center/right)
- **Connections**
  - Straight-line connections between shape anchor points
  - Connection tool (C key) with anchor point visualization
  - Arrow types: none, arrow, open-arrow
  - Connection styling: stroke color and width
- **Multi-Selection**
  - Shift+click or Ctrl+click to toggle selection
  - Selection box (marquee) for area selection
  - Ctrl+A to select all
- **Clipboard Operations**
  - Copy (Ctrl+C), Cut (Ctrl+X), Paste (Ctrl+V)
  - Duplicate (Ctrl+D)
  - Connections preserved when copying connected shapes
- **Alignment & Distribution**
  - Align: Left, Center, Right, Top, Middle, Bottom
  - Distribute: Horizontal, Vertical (3+ shapes)
- **History** - Undo (Ctrl+Z) and Redo (Ctrl+Y/Ctrl+Shift+Z)
- **Grid** - Toggle grid display, snap-to-grid, configurable size
- **Context Menu** - Right-click for quick actions
- **Status Bar** - Shows zoom level and cursor position

### Planned

| Phase | Features |
|-------|----------|
| P8 | Groups, layers, orthogonal/curved connections |
| P9 | Save/load JSON, export (PNG/SVG), import |

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

### Tools

| Key | Action |
|-----|--------|
| V | Select tool |
| R | Rectangle tool |
| E | Ellipse tool |
| C | Connection tool |

### General

| Key | Action |
|-----|--------|
| Escape | Cancel current operation / deselect |
| Delete / Backspace | Delete selected shapes/connections |
| Arrow keys | Move selected shapes (1px) |
| Shift + Arrow keys | Move selected shapes (10px) |
| Mouse wheel | Zoom in/out |
| Spacebar + drag | Pan canvas |
| Double-click shape | Edit text |

### Edit Operations

| Key | Action |
|-----|--------|
| Ctrl + Z | Undo |
| Ctrl + Y | Redo |
| Ctrl + Shift + Z | Redo (alternate) |
| Ctrl + A | Select all |
| Ctrl + C | Copy |
| Ctrl + X | Cut |
| Ctrl + V | Paste |
| Ctrl + D | Duplicate |

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
│   ├── canvas/       # SVG canvas, zoom/pan, grid, selection box
│   ├── connections/  # Connection rendering and anchor points
│   ├── shapes/       # Shape rendering, text, selection handles
│   ├── panels/       # Property panel sections
│   ├── toolbar/      # Tool selection UI
│   ├── menu/         # Context menu
│   ├── layout/       # App shell, status bar
│   └── ui/           # shadcn/ui components
├── hooks/            # Custom React hooks for interactions
├── stores/           # Zustand state management
├── lib/              # Utilities, geometry, text calculations
└── types/            # TypeScript type definitions

documentation/
├── phases/           # Phase specifications and requirements
├── known_issues.md   # Tracked bugs and issues
└── improvements.md   # Planned enhancements and feature ideas
```

## Documentation

- **[Known Issues](documentation/known_issues.md)** - Bugs and issues to be fixed in future phases
- **[Improvements](documentation/improvements.md)** - Planned enhancements and feature ideas

## License

MIT
