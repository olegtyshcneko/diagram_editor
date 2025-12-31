# Phase 0: Project Setup & Infrastructure - Technical Specification

## Technical Architecture

### Project Structure

```
naive_draw_io/
├── documentation/
│   ├── initial_spec.md
│   ├── requirements.md
│   └── phases/
│       ├── requirements_p0.md
│       └── spec_p0.md
├── src/
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # Application entry point
│   ├── index.css                  # Global styles + Tailwind imports
│   ├── vite-env.d.ts              # Vite type declarations
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   │   └── button.tsx         # Initial component for verification
│   │   ├── layout/
│   │   │   └── AppShell.tsx       # Main layout component
│   │   ├── canvas/                # (empty - Phase 1)
│   │   ├── shapes/                # (empty - Phase 2)
│   │   ├── connections/           # (empty - Phase 5)
│   │   ├── panels/                # (empty - Phase 4)
│   │   ├── toolbar/               # (empty - Phase 2)
│   │   └── menu/                  # (empty - Phase 7)
│   ├── hooks/                     # (empty - Phase 1+)
│   ├── stores/
│   │   ├── diagramStore.ts        # Main diagram state (skeleton)
│   │   └── uiStore.ts             # UI state (skeleton)
│   ├── lib/
│   │   ├── utils.ts               # shadcn/ui utilities (cn function)
│   │   ├── constants.ts           # Application constants
│   │   └── geometry/              # (empty - Phase 1+)
│   └── types/
│       ├── shapes.ts              # Shape type definitions
│       ├── connections.ts         # Connection type definitions
│       ├── tools.ts               # Tool type definitions
│       └── common.ts              # Shared utility types
├── public/
│   └── vite.svg                   # Default Vite asset
├── index.html                     # HTML entry point
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.node.json             # Node TypeScript config
├── vite.config.ts                 # Vite configuration (includes Tailwind v4 plugin)
├── components.json                # shadcn/ui configuration
└── .gitignore                     # Git ignore rules
```

---

## Files to Create

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Project dependencies and scripts |
| `tsconfig.json` | TypeScript configuration with path aliases |
| `vite.config.ts` | Vite build configuration (includes Tailwind v4 plugin) |
| `components.json` | shadcn/ui CLI configuration |
| `.gitignore` | Git ignore patterns |

> **Note:** Tailwind v4 doesn't require separate `tailwind.config.js` or `postcss.config.js` files - configuration is done via the Vite plugin and CSS `@theme` blocks.

### Source Files

| File | Purpose |
|------|---------|
| `src/main.tsx` | React DOM render entry point |
| `src/App.tsx` | Root application component |
| `src/index.css` | Global styles with Tailwind v4 import |
| `src/components/layout/AppShell.tsx` | Main layout structure |
| `src/lib/utils.ts` | shadcn/ui cn() utility function |
| `src/lib/constants.ts` | Application-wide constants |
| `src/stores/diagramStore.ts` | Diagram state store skeleton |
| `src/stores/uiStore.ts` | UI state store skeleton |
| `src/types/shapes.ts` | Shape interface definitions |
| `src/types/connections.ts` | Connection interface definitions |
| `src/types/tools.ts` | Tool type definitions |
| `src/types/common.ts` | Shared utility types |

---

## Key Interfaces & Types

### Common Types (`src/types/common.ts`)

```typescript
// Point represents a 2D coordinate
export interface Point {
  x: number;
  y: number;
}

// Bounds represents a rectangular area
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Size represents dimensions
export interface Size {
  width: number;
  height: number;
}
```

### Shape Types (`src/types/shapes.ts`)

```typescript
import { Point } from './common';

// Available shape types
export type ShapeType =
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'triangle'
  | 'line'
  | 'text';

// Stroke style options
export type StrokeStyle = 'solid' | 'dashed' | 'dotted';

// Text alignment options
export type HorizontalAlign = 'left' | 'center' | 'right';
export type VerticalAlign = 'top' | 'middle' | 'bottom';

// Text content within a shape
export interface TextContent {
  html: string;
  plainText: string;
}

// Text styling
export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  horizontalAlign: HorizontalAlign;
  verticalAlign: VerticalAlign;
}

// Main Shape interface
export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;

  // Styling
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  cornerRadius?: number;

  // Text
  text?: TextContent;
  textStyle?: TextStyle;

  // State
  locked: boolean;
  visible: boolean;
  zIndex: number;
}

// Default shape values
export const DEFAULT_SHAPE: Omit<Shape, 'id' | 'type' | 'x' | 'y'> = {
  width: 100,
  height: 60,
  rotation: 0,
  fill: '#ffffff',
  fillOpacity: 1,
  stroke: '#000000',
  strokeWidth: 2,
  strokeStyle: 'solid',
  locked: false,
  visible: true,
  zIndex: 0,
};

// Default text style
export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Arial, sans-serif',
  fontSize: 14,
  fontColor: '#000000',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  horizontalAlign: 'center',
  verticalAlign: 'middle',
};
```

### Connection Types (`src/types/connections.ts`)

```typescript
import { Point } from './common';

// Anchor positions on shapes
export type AnchorPosition = 'top' | 'right' | 'bottom' | 'left';

// Arrow marker types
export type ArrowType =
  | 'none'
  | 'arrow'
  | 'open-arrow'
  | 'diamond'
  | 'diamond-filled'
  | 'circle'
  | 'circle-filled';

// Connection curve types
export type CurveType = 'straight' | 'orthogonal' | 'bezier';

// Connection interface
export interface Connection {
  id: string;
  sourceShapeId: string;
  targetShapeId: string | null;
  sourceAnchor: AnchorPosition;
  targetAnchor: AnchorPosition | null;
  targetPoint?: Point;

  // Waypoints for custom routing
  waypoints: Point[];

  // Styling
  stroke: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';

  // Arrows
  sourceArrow: ArrowType;
  targetArrow: ArrowType;

  // Curve
  curveType: CurveType;

  // Label
  label?: string;
  labelPosition?: number; // 0-1 along path
}

// Default connection values
export const DEFAULT_CONNECTION: Omit<Connection, 'id' | 'sourceShapeId' | 'sourceAnchor'> = {
  targetShapeId: null,
  targetAnchor: null,
  waypoints: [],
  stroke: '#000000',
  strokeWidth: 2,
  strokeStyle: 'solid',
  sourceArrow: 'none',
  targetArrow: 'arrow',
  curveType: 'straight',
};
```

### Tool Types (`src/types/tools.ts`)

```typescript
// Available tools
export type Tool =
  | 'select'
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'triangle'
  | 'line'
  | 'text'
  | 'connection'
  | 'pan';

// Tool metadata
export interface ToolInfo {
  id: Tool;
  name: string;
  shortcut: string;
  icon: string; // Lucide icon name
}

// Tool definitions
export const TOOLS: ToolInfo[] = [
  { id: 'select', name: 'Select', shortcut: 'V', icon: 'MousePointer2' },
  { id: 'rectangle', name: 'Rectangle', shortcut: 'R', icon: 'Square' },
  { id: 'ellipse', name: 'Ellipse', shortcut: 'E', icon: 'Circle' },
  { id: 'diamond', name: 'Diamond', shortcut: 'D', icon: 'Diamond' },
  { id: 'line', name: 'Line', shortcut: 'L', icon: 'Minus' },
  { id: 'text', name: 'Text', shortcut: 'T', icon: 'Type' },
  { id: 'connection', name: 'Connection', shortcut: 'C', icon: 'ArrowRight' },
];
```

---

## Implementation Order

### Step 1: Initialize Vite Project

```bash
# Create project
npm create vite@latest naive_draw_io -- --template react-ts

# Navigate to project
cd naive_draw_io

# Install dependencies
npm install
```

### Step 2: Configure Tailwind CSS v4

```bash
# Install Tailwind v4 with Vite plugin
npm install -D tailwindcss @tailwindcss/vite
```

**vite.config.ts** (add tailwindcss plugin):
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**src/index.css:**
```css
@import "tailwindcss";

@theme {
  /* Custom theme variables can be added here */
}
```

> **Note:** Tailwind v4 uses a simplified configuration approach. No separate `tailwind.config.js` or `postcss.config.js` required.

### Step 3: Install shadcn/ui

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Answer prompts:
# - TypeScript: yes
# - Style: Default
# - Base color: Slate
# - CSS variables: yes
# - Components: src/components/ui
# - Utils: src/lib/utils

# Install a test component
npx shadcn@latest add button
```

> **Note:** With Tailwind v4, shadcn/ui prompts may differ slightly - follow the interactive prompts.

### Step 4: Configure Path Aliases

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

> **Note:** The `vite.config.ts` with path aliases is already shown in Step 2 above.

### Step 5: Install Zustand

```bash
npm install zustand
```

### Step 6: Create Project Structure

```bash
# Create all directories
mkdir -p src/components/{ui,layout,canvas,shapes,connections,panels,toolbar,menu}
mkdir -p src/hooks
mkdir -p src/stores
mkdir -p src/lib/geometry
mkdir -p src/types
```

### Step 7: Create Type Files

Create files as defined in Key Interfaces & Types section above.

### Step 8: Create Store Skeletons

**src/stores/diagramStore.ts:**
```typescript
import { create } from 'zustand';
import { Shape } from '@/types/shapes';
import { Connection } from '@/types/connections';

interface DiagramState {
  // Document
  documentId: string | null;
  documentTitle: string;
  isDirty: boolean;

  // Elements
  shapes: Record<string, Shape>;
  connections: Record<string, Connection>;

  // Selection
  selectedShapeIds: string[];
  selectedConnectionIds: string[];

  // Actions (to be implemented in later phases)
  // addShape: (shape: Shape) => void;
  // updateShape: (id: string, updates: Partial<Shape>) => void;
  // deleteShape: (id: string) => void;
  // ... more actions
}

export const useDiagramStore = create<DiagramState>()((set, get) => ({
  // Initial state
  documentId: null,
  documentTitle: 'Untitled Diagram',
  isDirty: false,

  shapes: {},
  connections: {},

  selectedShapeIds: [],
  selectedConnectionIds: [],

  // Actions will be added in subsequent phases
}));
```

**src/stores/uiStore.ts:**
```typescript
import { create } from 'zustand';
import { Tool } from '@/types/tools';

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

interface UIState {
  // Tools
  activeTool: Tool;

  // Viewport
  viewport: Viewport;

  // UI toggles
  showGrid: boolean;
  snapToGrid: boolean;
  showRulers: boolean;
  sidebarOpen: boolean;
  propertyPanelOpen: boolean;

  // Actions (to be implemented in later phases)
  // setActiveTool: (tool: Tool) => void;
  // setViewport: (viewport: Partial<Viewport>) => void;
  // ... more actions
}

export const useUIStore = create<UIState>()((set) => ({
  // Initial state
  activeTool: 'select',

  viewport: {
    x: 0,
    y: 0,
    zoom: 1,
  },

  showGrid: true,
  snapToGrid: true,
  showRulers: false,
  sidebarOpen: true,
  propertyPanelOpen: true,

  // Actions will be added in subsequent phases
}));
```

### Step 9: Create Constants

**src/lib/constants.ts:**
```typescript
// Canvas defaults
export const CANVAS_DEFAULTS = {
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 4,
  ZOOM_STEP: 0.1,
  DEFAULT_ZOOM: 1,
};

// Grid defaults
export const GRID_DEFAULTS = {
  SIZE: 20,
  COLOR: '#e0e0e0',
  SNAP_THRESHOLD: 5,
};

// Shape defaults
export const SHAPE_DEFAULTS = {
  MIN_SIZE: 10,
  DEFAULT_WIDTH: 100,
  DEFAULT_HEIGHT: 60,
  DEFAULT_FILL: '#ffffff',
  DEFAULT_STROKE: '#000000',
  DEFAULT_STROKE_WIDTH: 2,
};

// Colors
export const COLORS = {
  SELECTION: '#3B82F6',
  SELECTION_FILL: 'rgba(59, 130, 246, 0.1)',
  ANCHOR: '#3B82F6',
  GRID_DOT: '#d0d0d0',
};

// Keyboard
export const KEYBOARD = {
  MOVE_STEP: 1,
  MOVE_STEP_LARGE: 10,
};
```

### Step 10: Create App Shell

**src/components/layout/AppShell.tsx:**
```typescript
import { ReactNode } from 'react';

interface AppShellProps {
  children?: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Menu Bar */}
      <header className="h-10 bg-white border-b border-gray-200 flex items-center px-4">
        <span className="font-semibold text-gray-800">Naive Draw.io</span>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar / Shape Panel */}
        <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-2">
          <div className="w-10 h-10 bg-gray-200 rounded mb-2" title="Select Tool" />
          <div className="w-10 h-10 bg-gray-200 rounded mb-2" title="Rectangle" />
          <div className="w-10 h-10 bg-gray-200 rounded mb-2" title="Ellipse" />
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 bg-gray-50 relative overflow-hidden">
          {children || (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Canvas will be implemented in Phase 1
            </div>
          )}
        </main>

        {/* Property Panel */}
        <aside className="w-64 bg-white border-l border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 mb-4">Properties</h2>
          <p className="text-sm text-gray-500">
            Select an element to view its properties
          </p>
        </aside>
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-white border-t border-gray-200 flex items-center px-4 text-xs text-gray-500">
        <span>Zoom: 100%</span>
        <span className="mx-4">|</span>
        <span>Position: 0, 0</span>
      </footer>
    </div>
  );
}
```

**src/App.tsx:**
```typescript
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';

function App() {
  return (
    <AppShell>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Phase 0 Setup Complete!</p>
        <Button onClick={() => alert('shadcn/ui working!')}>
          Test Button
        </Button>
      </div>
    </AppShell>
  );
}

export default App;
```

---

## Code Patterns

### Import Pattern

Always use path aliases:
```typescript
// Good
import { Button } from '@/components/ui/button';
import { useDiagramStore } from '@/stores/diagramStore';
import { Shape } from '@/types/shapes';

// Avoid
import { Button } from '../../components/ui/button';
```

### Store Pattern (Zustand)

```typescript
import { create } from 'zustand';

interface StoreState {
  value: number;
  increment: () => void;
}

export const useStore = create<StoreState>()((set) => ({
  value: 0,
  increment: () => set((state) => ({ value: state.value + 1 })),
}));
```

### Component Pattern

```typescript
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

export function Component({ prop1, prop2 = 10 }: ComponentProps) {
  return (
    <div className="...">
      {/* Component content */}
    </div>
  );
}
```

---

## Key Decisions

### Decision 1: Vite over Create React App

**Decision:** Use Vite as the build tool

**Rationale:**
- Significantly faster development server startup
- Native ES modules for faster HMR
- Better TypeScript support out of the box
- Modern, actively maintained
- Smaller bundle sizes

### Decision 2: Zustand over Redux/Context

**Decision:** Use Zustand for state management

**Rationale:**
- Minimal boilerplate
- TypeScript-first design
- Simple API (create, use)
- Good performance with automatic memoization
- Easily integrates with React devtools

### Decision 3: shadcn/ui over other component libraries

**Decision:** Use shadcn/ui for UI components

**Rationale:**
- Copy-paste ownership model (not a dependency)
- Built on Radix UI primitives (accessible)
- Fully customizable with Tailwind
- No version lock-in
- Components match draw.io aesthetic potential

### Decision 4: Path Aliases

**Decision:** Use `@/` path alias for all imports

**Rationale:**
- Cleaner imports regardless of file depth
- Easier refactoring when moving files
- Consistent import style across codebase
- Works with TypeScript and Vite

---

## Testing Approach

Phase 0 testing is primarily manual verification:

### Manual Test Checklist

1. [ ] Run `npm run dev` - no errors
2. [ ] Open browser - app shell displays
3. [ ] Click "Test Button" - alert appears
4. [ ] Tailwind classes visible (backgrounds, borders)
5. [ ] Run `npm run build` - no errors
6. [ ] TypeScript: no red squiggles in IDE

### Smoke Test Commands

```bash
# Development
npm run dev

# Type check
npx tsc --noEmit

# Build
npm run build

# Preview production build
npm run preview
```

---

## Performance Considerations

Not applicable for Phase 0 - focus is on setup correctness.

Future phases will address:
- SVG rendering performance
- State update batching
- Component memoization

---

## Accessibility Requirements

### Phase 0 Minimal Requirements

- Semantic HTML in AppShell (header, main, aside, footer)
- Sufficient color contrast for placeholder text
- Button component from shadcn/ui includes proper focus states

### Future Phases Will Add

- Keyboard navigation
- ARIA labels
- Focus management
- Screen reader support
