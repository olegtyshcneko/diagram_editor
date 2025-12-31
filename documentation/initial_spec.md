# Naive Draw.io - Initial Specification

## Project Overview

A web-based vector diagramming application similar to draw.io, enabling users to create flowcharts, diagrams, and visual representations with shapes, connections, and text.

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | React 18+ | Component model, ecosystem, hooks |
| **Language** | TypeScript | Type safety, better DX, refactoring |
| **Build Tool** | Vite | Fast HMR, modern ESM, minimal config |
| **State Management** | Zustand | Simple, performant, no boilerplate |
| **UI Components** | shadcn/ui | Radix primitives, accessible, customizable |
| **Rendering** | Custom SVG | Native vector, draw.io compatible, DOM events |
| **Styling** | Tailwind CSS | Required by shadcn/ui, utility-first |
| **Deployment** | Vercel | Free tier, instant deploys, edge functions |
| **Database** | Supabase (Postgres) | Free tier, realtime, row-level security |
| **Authentication** | Supabase Auth | Integrated, multiple providers |
| **Storage** | Supabase Storage | File exports, diagram assets |

---

## Core Features

### 1. Canvas & Viewport

- [x] Infinite canvas with SVG rendering
- [x] Zoom via mouse wheel (centered on cursor)
- [x] Pan via middle-mouse drag or spacebar + drag
- [x] Minimap for navigation (future)
- [x] Dot grid background (toggleable, multiple styles: dots/lines/crosses)
- [x] Snap-to-grid (toggleable, with Alt to temporarily disable)
- [x] Rulers (toggleable)

### 2. Shapes

#### Supported Shape Types
| Shape | Priority | Description |
|-------|----------|-------------|
| Rectangle | P0 | Basic rectangle, optional rounded corners |
| Ellipse | P0 | Circle/oval |
| Diamond | P1 | Rotated square for decisions |
| Triangle | P1 | Equilateral or custom |
| Line | P0 | Simple line segment |
| Polygon | P2 | Custom multi-point shape |
| Star | P2 | Configurable points |
| Cylinder | P2 | Database symbol |
| Parallelogram | P2 | Input/output symbol |

#### Shape Properties
```typescript
interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;          // degrees
  fill: string;              // color
  fillOpacity: number;       // 0-1
  stroke: string;            // border color
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  cornerRadius?: number;     // for rectangles
  shadow?: ShadowConfig;
  locked: boolean;
  visible: boolean;
  zIndex: number;
}
```

### 3. Text

#### Text Inside Shapes
- Rich text editing via contentEditable in foreignObject
- Formatting: bold, italic, underline, strikethrough
- Font family, size, color
- Horizontal alignment: left, center, right
- Vertical alignment: top, middle, bottom
- Text wrapping within shape bounds

#### Text Below Shapes
- Optional label attached to shape
- Follows shape position
- Independent formatting

#### Standalone Text
- Free-floating text boxes
- Same formatting options as shape text

```typescript
interface TextContent {
  html: string;              // Rich text as HTML
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  horizontalAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
}
```

### 4. Connections

#### Connection Types
- Straight line
- Orthogonal (right-angle routing)
- Curved (bezier)

#### Arrow Configurations
```typescript
interface Connection {
  id: string;
  sourceShapeId: string | null;  // null for free endpoint
  targetShapeId: string | null;
  sourceAnchor: AnchorPosition;  // 'top' | 'right' | 'bottom' | 'left' | 'center'
  targetAnchor: AnchorPosition;

  // Waypoints for custom routing
  waypoints: Point[];

  // Line style
  stroke: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';

  // Arrows
  sourceArrow: ArrowType;        // 'none' | 'arrow' | 'diamond' | 'circle' | 'open'
  targetArrow: ArrowType;

  // Label
  label?: ConnectionLabel;

  // Curve type
  curveType: 'straight' | 'orthogonal' | 'bezier';
}

interface ConnectionLabel {
  text: string;
  position: number;              // 0-1 along path
  offset: { x: number; y: number };
  style: TextContent;
}

type ArrowType = 'none' | 'arrow' | 'open-arrow' | 'diamond' | 'diamond-filled' | 'circle' | 'circle-filled';
```

### 5. Selection & Manipulation

- Single click to select
- Shift+click for multi-select
- Click+drag for selection box
- Resize handles (8 points + rotation handle)
- Move by dragging
- Copy/paste (Ctrl+C, Ctrl+V)
- Duplicate (Ctrl+D)
- Delete (Delete/Backspace)
- Group/ungroup (Ctrl+G, Ctrl+Shift+G)
- Align tools (left, center, right, top, middle, bottom)
- Distribute tools (horizontal, vertical)

### 6. History

- Undo (Ctrl+Z)
- Redo (Ctrl+Y / Ctrl+Shift+Z)
- History stack with configurable depth (default: 50)

### 7. Layers

- Multiple layers support
- Layer visibility toggle
- Layer locking
- Layer reordering
- Per-layer opacity

---

## File Format

### Native Format (.ndio)

JSON-based format for internal use:

```json
{
  "version": "1.0",
  "metadata": {
    "created": "2025-01-15T10:30:00Z",
    "modified": "2025-01-15T14:22:00Z",
    "title": "My Diagram"
  },
  "canvas": {
    "width": 1920,
    "height": 1080,
    "background": "#ffffff",
    "gridSize": 20,
    "snapToGrid": true
  },
  "layers": [...],
  "shapes": [...],
  "connections": [...],
  "groups": [...]
}
```

### draw.io Export/Import (.drawio)

XML-based mxGraph format for interoperability:

```xml
<mxGraphModel dx="1426" dy="794" grid="1" gridSize="10">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <!-- Shapes and connections -->
  </root>
</mxGraphModel>
```

### Additional Export Formats

| Format | Priority | Notes |
|--------|----------|-------|
| .drawio | P0 | Full compatibility |
| .svg | P0 | Vector export |
| .png | P1 | Raster export with resolution options |
| .pdf | P2 | Print-ready export |
| .json | P0 | Native format |

---

## User Interface

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Menu Bar (File, Edit, View, Insert, Format, Help)              │
├─────────────┬───────────────────────────────────┬───────────────┤
│             │                                   │               │
│   Toolbar   │                                   │   Property    │
│   (Shapes)  │         Canvas Area               │    Panel      │
│             │                                   │               │
│   - Select  │                                   │  - Fill       │
│   - Rect    │                                   │  - Stroke     │
│   - Ellipse │                                   │  - Text       │
│   - Line    │                                   │  - Size       │
│   - Text    │                                   │  - Position   │
│   - Connect │                                   │               │
│             │                                   │               │
├─────────────┴───────────────────────────────────┴───────────────┤
│  Status Bar (Zoom: 100% | Position: 120, 340 | Selected: 3)     │
└─────────────────────────────────────────────────────────────────┘
```

### Toolbar Components (shadcn/ui)

| Component | shadcn Component | Usage |
|-----------|------------------|-------|
| Shape picker | ToggleGroup | Tool selection |
| Color picker | Popover + custom | Fill/stroke colors |
| Font selector | Select | Font family dropdown |
| Size input | Input | Numeric inputs |
| Alignment | ToggleGroup | Text/object alignment |
| Zoom control | Slider + Input | Zoom level |
| Layer panel | Sheet | Slide-out panel |
| Context menu | ContextMenu | Right-click actions |
| Dialogs | Dialog | Export, settings |
| Tooltips | Tooltip | Tool hints |

---

## State Management (Zustand)

### Store Structure

```typescript
// stores/diagramStore.ts
interface DiagramState {
  // Document
  documentId: string | null;
  documentTitle: string;
  isDirty: boolean;

  // Canvas
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };

  // Elements
  shapes: Record<string, Shape>;
  connections: Record<string, Connection>;
  groups: Record<string, Group>;
  layers: Layer[];

  // Selection
  selectedIds: string[];

  // Actions
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  // ... more actions
}

// stores/uiStore.ts
interface UIState {
  activeTool: Tool;
  showGrid: boolean;
  snapToGrid: boolean;
  showRulers: boolean;
  sidebarOpen: boolean;
  propertyPanelOpen: boolean;
  // ... more UI state
}

// stores/historyStore.ts
interface HistoryState {
  past: DiagramSnapshot[];
  future: DiagramSnapshot[];
  undo: () => void;
  redo: () => void;
  push: (snapshot: DiagramSnapshot) => void;
}
```

---

## Project Structure

```
naive_draw_io/
├── documentation/
│   ├── initial_spec.md          # This file
│   ├── architecture.md          # Detailed architecture
│   └── api.md                   # API documentation
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Main app page
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── popover.tsx
│   │   │   └── ...
│   │   ├── canvas/
│   │   │   ├── Canvas.tsx       # Main SVG canvas
│   │   │   ├── Viewport.tsx     # Zoom/pan handler
│   │   │   ├── Grid.tsx         # Background grid
│   │   │   ├── SelectionBox.tsx # Multi-select rectangle
│   │   │   └── Minimap.tsx      # Navigation minimap
│   │   ├── shapes/
│   │   │   ├── Shape.tsx        # Shape renderer (switch)
│   │   │   ├── Rectangle.tsx
│   │   │   ├── Ellipse.tsx
│   │   │   ├── Diamond.tsx
│   │   │   ├── Triangle.tsx
│   │   │   ├── Handles.tsx      # Resize/rotate handles
│   │   │   └── Anchors.tsx      # Connection anchor points
│   │   ├── connections/
│   │   │   ├── Connection.tsx   # Connection renderer
│   │   │   ├── ConnectionLine.tsx
│   │   │   ├── ArrowMarkers.tsx # SVG marker definitions
│   │   │   └── ConnectionLabel.tsx
│   │   ├── text/
│   │   │   ├── TextEditor.tsx   # Rich text editor
│   │   │   └── TextOnPath.tsx   # Text along connection
│   │   ├── toolbar/
│   │   │   ├── Toolbar.tsx      # Main toolbar
│   │   │   ├── ShapeTools.tsx   # Shape selection tools
│   │   │   ├── FormatTools.tsx  # Formatting options
│   │   │   └── ZoomControls.tsx
│   │   ├── panels/
│   │   │   ├── PropertyPanel.tsx
│   │   │   ├── LayersPanel.tsx
│   │   │   └── StylePanel.tsx
│   │   ├── menu/
│   │   │   ├── MenuBar.tsx
│   │   │   └── ContextMenu.tsx
│   │   └── common/
│   │       ├── ColorPicker.tsx
│   │       ├── FontPicker.tsx
│   │       └── IconButton.tsx
│   ├── hooks/
│   │   ├── useCanvas.ts         # Canvas interactions
│   │   ├── useViewport.ts       # Zoom/pan logic
│   │   ├── useSelection.ts      # Selection management
│   │   ├── useDrag.ts           # Drag interactions
│   │   ├── useResize.ts         # Resize interactions
│   │   ├── useKeyboard.ts       # Keyboard shortcuts
│   │   ├── useHistory.ts        # Undo/redo
│   │   └── useAutoSave.ts       # Auto-save to storage
│   ├── stores/
│   │   ├── diagramStore.ts      # Main diagram state
│   │   ├── uiStore.ts           # UI state
│   │   └── historyStore.ts      # History state
│   ├── lib/
│   │   ├── drawio/
│   │   │   ├── export.ts        # Export to .drawio
│   │   │   ├── import.ts        # Import from .drawio
│   │   │   ├── styles.ts        # Style string mapping
│   │   │   └── schema.ts        # mxGraph type definitions
│   │   ├── export/
│   │   │   ├── svg.ts           # SVG export
│   │   │   ├── png.ts           # PNG export
│   │   │   └── pdf.ts           # PDF export
│   │   ├── geometry/
│   │   │   ├── point.ts         # Point utilities
│   │   │   ├── bounds.ts        # Bounding box
│   │   │   ├── bezier.ts        # Bezier curve math
│   │   │   ├── intersection.ts  # Line/shape intersection
│   │   │   └── transform.ts     # Matrix transforms
│   │   ├── utils/
│   │   │   ├── id.ts            # ID generation
│   │   │   ├── color.ts         # Color utilities
│   │   │   └── snap.ts          # Snap-to-grid
│   │   └── constants.ts         # App constants
│   └── types/
│       ├── shapes.ts            # Shape type definitions
│       ├── connections.ts       # Connection types
│       ├── diagram.ts           # Document types
│       └── tools.ts             # Tool types
├── public/
│   └── icons/                   # App icons
├── tests/
│   ├── unit/
│   └── e2e/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── components.json              # shadcn/ui config
└── README.md
```

---

## Implementation Phases

### Phase 1: Foundation (MVP)
**Goal:** Basic drawing capabilities

- [ ] Project setup (Vite + React + TypeScript)
- [ ] Install and configure shadcn/ui
- [ ] Basic SVG canvas with viewBox
- [ ] Zoom (wheel) and pan (drag)
- [ ] Rectangle shape
- [ ] Ellipse shape
- [ ] Selection (single)
- [ ] Move shapes
- [ ] Resize shapes
- [ ] Basic toolbar
- [ ] Local storage save/load

### Phase 2: Core Features
**Goal:** Full shape and connection support

- [ ] All basic shapes (diamond, triangle, line)
- [ ] Multi-selection
- [ ] Connection lines (straight)
- [ ] Connection anchors on shapes
- [ ] Arrow markers (both ends, toggleable)
- [ ] Bezier curve connections
- [ ] Text inside shapes
- [ ] Basic formatting (font, size, color)
- [ ] Property panel
- [ ] Undo/redo
- [ ] Keyboard shortcuts

### Phase 3: Advanced Features
**Goal:** Professional editing capabilities

- [ ] Text on connection paths
- [ ] Orthogonal connection routing
- [ ] Groups
- [ ] Layers
- [ ] Alignment/distribution tools
- [ ] Copy/paste
- [ ] Grid and snap
- [ ] Context menu
- [ ] More shapes

### Phase 4: File Operations
**Goal:** Full file compatibility

- [ ] Native JSON format save/load
- [ ] draw.io export
- [ ] draw.io import
- [ ] SVG export
- [ ] PNG export

### Phase 5: Cloud Integration
**Goal:** Persistent storage and auth

- [ ] Supabase setup
- [ ] User authentication
- [ ] Cloud save/load
- [ ] File listing
- [ ] Share links

### Phase 6: Polish
**Goal:** Production ready

- [ ] Minimap
- [ ] Rulers
- [ ] Performance optimization
- [ ] Mobile/tablet support
- [ ] Accessibility
- [ ] Documentation

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Select tool | V |
| Rectangle tool | R |
| Ellipse tool | E |
| Line tool | L |
| Text tool | T |
| Connection tool | C |
| Delete | Delete / Backspace |
| Copy | Ctrl+C |
| Paste | Ctrl+V |
| Cut | Ctrl+X |
| Duplicate | Ctrl+D |
| Undo | Ctrl+Z |
| Redo | Ctrl+Y / Ctrl+Shift+Z |
| Select all | Ctrl+A |
| Deselect | Escape |
| Group | Ctrl+G |
| Ungroup | Ctrl+Shift+G |
| Zoom in | Ctrl++ / Wheel up |
| Zoom out | Ctrl+- / Wheel down |
| Zoom to fit | Ctrl+0 |
| Zoom to 100% | Ctrl+1 |
| Save | Ctrl+S |
| Open | Ctrl+O |
| New | Ctrl+N |
| Pan canvas | Space + Drag |

---

## Performance Considerations

1. **SVG Optimization**
   - Use `transform` instead of individual x/y attributes for movement
   - Batch DOM updates
   - Use `will-change` for animated elements
   - Virtualize off-screen elements for large diagrams

2. **State Management**
   - Zustand with selectors to prevent unnecessary rerenders
   - Immer for immutable updates
   - Debounce history snapshots

3. **Rendering**
   - React.memo for shape components
   - useMemo for expensive calculations (bezier paths)
   - RequestAnimationFrame for smooth animations

4. **Large Diagrams**
   - Viewport culling (don't render off-screen shapes)
   - Level-of-detail (simplify shapes when zoomed out)
   - Web Workers for heavy calculations

---

## Security Considerations

1. **Input Sanitization**
   - Sanitize rich text HTML (DOMPurify)
   - Validate file imports
   - Escape user content in exports

2. **Authentication**
   - Supabase Row Level Security (RLS)
   - Secure API routes
   - CSRF protection

3. **File Handling**
   - Validate file types
   - Size limits on uploads
   - Scan for malicious content

---

## Future Considerations

- Real-time collaboration (Yjs/Supabase Realtime)
- Version history
- Templates library
- Custom shape creation
- Plugin system
- Presentation mode
- Comments/annotations
- Export to more formats (Visio, Lucidchart)
- AI-assisted diagramming

---

## References

- [draw.io GitHub](https://github.com/jgraph/drawio)
- [mxGraph Documentation](https://jgraph.github.io/mxgraph/)
- [SVG Specification](https://www.w3.org/TR/SVG2/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Supabase Documentation](https://supabase.com/docs)
