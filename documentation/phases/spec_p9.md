# Phase 9: File Operations - Technical Specification

## Technical Architecture

### Component Hierarchy

```
App
├── MenuBar (extended with File menu)
│   ├── NewMenuItem
│   ├── OpenMenuItem
│   ├── SaveMenuItem
│   ├── SaveAsMenuItem
│   ├── ExportSubmenu
│   │   ├── ExportSVG
│   │   ├── ExportPNG
│   │   ├── ExportPDF
│   │   └── ExportDrawio
│   ├── ImportSubmenu
│   │   └── ImportImage
│   └── RecentFilesSubmenu
├── DocumentTitleBar (new)
├── SavePromptDialog (new)
├── RecoveryDialog (new)
├── ExportDialog (new)
├── MainLayout
│   └── [existing components]
├── DropZone (new, file drag & drop overlay)
└── StatusBar (updated with save status)
```

### State Management Updates

```typescript
// useFileStore.ts - New store for file operations
interface FileStore {
  // Current document
  currentFileName: string | null;
  currentFilePath: string | null;  // For display only
  hasUnsavedChanges: boolean;
  lastSavedAt: number | null;

  // Recent files
  recentFiles: RecentFile[];

  // Auto-save
  autoSaveEnabled: boolean;
  lastAutoSaveAt: number | null;

  // Actions
  setFileName: (name: string | null) => void;
  markAsSaved: () => void;
  markAsUnsaved: () => void;
  addRecentFile: (file: RecentFile) => void;
  clearRecentFiles: () => void;
  setAutoSaveTime: (timestamp: number) => void;
}

// Extended uiStore for dialogs
interface UIStore {
  // ... existing fields ...
  savePromptOpen: boolean;
  savePromptCallback: (() => void) | null;
  recoveryDialogOpen: boolean;
  exportDialogOpen: boolean;
  exportFormat: ExportFormat | null;
}
```

---

## Files to Create

### New Files

```
src/
├── stores/
│   └── fileStore.ts              # File state management
├── hooks/
│   ├── useFileOperations.ts      # Save, open, new operations
│   ├── useAutoSave.ts            # Auto-save logic
│   ├── useExport.ts              # Export to various formats
│   ├── useDragDropFile.ts        # File drag & drop
│   └── useClipboardImage.ts      # Image paste handling
├── components/
│   ├── dialogs/
│   │   ├── SavePromptDialog.tsx
│   │   ├── RecoveryDialog.tsx
│   │   ├── ExportDialog.tsx
│   │   └── ExportOptionsPanel.tsx
│   ├── file/
│   │   ├── DocumentTitleBar.tsx
│   │   ├── RecentFilesMenu.tsx
│   │   └── DropZone.tsx
│   └── menu/
│       ├── FileMenu.tsx
│       └── ExportSubmenu.tsx
├── services/
│   ├── serialization/
│   │   ├── ndioFormat.ts         # Native format serialization
│   │   ├── drawioExport.ts       # draw.io export
│   │   ├── drawioImport.ts       # draw.io import
│   │   └── styleMapping.ts       # Style conversion
│   ├── export/
│   │   ├── svgExport.ts
│   │   ├── pngExport.ts
│   │   ├── pdfExport.ts
│   │   └── jsonExport.ts
│   └── fileApi.ts                # Browser file API wrappers
├── utils/
│   ├── fileUtils.ts              # File helpers
│   └── mxGraphParser.ts          # draw.io XML parsing
└── types/
    ├── file.ts                   # File-related types
    └── drawio.ts                 # draw.io format types
```

### Files to Modify

```
src/
├── App.tsx                       # Add auto-save, drag/drop, beforeunload
├── components/
│   ├── MenuBar.tsx               # Add File menu items
│   └── StatusBar.tsx             # Add save status indicator
├── stores/
│   ├── diagramStore.ts           # Add change tracking
│   └── uiStore.ts                # Add dialog states
└── hooks/
    └── useKeyboardShortcuts.ts   # Add file shortcuts
```

---

## Key Interfaces & Types

### File Types

```typescript
// types/file.ts

export interface NdioFile {
  version: string;
  metadata: FileMetadata;
  diagram: DiagramData;
  viewport: ViewportData;
  settings: SettingsData;
}

export interface FileMetadata {
  title: string;
  created: number;
  modified: number;
  author?: string;
  description?: string;
}

export interface DiagramData {
  shapes: Record<string, Shape>;
  connections: Record<string, Connection>;
  groups: Record<string, Group>;
  layers: Layer[];
  layerOrder: string[];
}

export interface ViewportData {
  zoom: number;
  panOffset: Point;
}

export interface SettingsData {
  gridVisible: boolean;
  gridSize: number;
  snapToGrid: boolean;
}

export interface RecentFile {
  id: string;
  name: string;
  path?: string;
  type: 'ndio' | 'drawio';
  lastOpened: number;
  thumbnail?: string;  // Base64 data URL
}

export type ExportFormat = 'svg' | 'png' | 'pdf' | 'json' | 'drawio';

export interface ExportOptions {
  format: ExportFormat;
  scale?: number;          // For PNG
  background?: 'transparent' | 'white';
  selectionOnly?: boolean;
  pageSize?: 'auto' | 'a4' | 'letter';  // For PDF
}

export interface AutoSaveData {
  data: NdioFile;
  timestamp: number;
  fileName?: string;
}
```

### draw.io Types

```typescript
// types/drawio.ts

export interface MxCell {
  id: string;
  value?: string;
  style?: string;
  parent?: string;
  source?: string;
  target?: string;
  vertex?: boolean;
  edge?: boolean;
  geometry?: MxGeometry;
}

export interface MxGeometry {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  relative?: boolean;
  points?: MxPoint[];
}

export interface MxPoint {
  x: number;
  y: number;
}

export interface MxGraphModel {
  cells: MxCell[];
  rootId: string;
  parentId: string;
}

export interface DrawioFile {
  name: string;
  diagrams: DrawioDiagram[];
}

export interface DrawioDiagram {
  name: string;
  model: MxGraphModel;
}

// Style parsing
export interface MxStyle {
  shape?: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fontColor?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: number;  // Bitmask: 1=bold, 2=italic, 4=underline
  rounded?: boolean;
  arcSize?: number;
  edgeStyle?: string;
  endArrow?: string;
  startArrow?: string;
  dashed?: boolean;
  dashPattern?: string;
}
```

---

## Implementation Order

### Step 1: File Store Foundation

1. Create `types/file.ts`
2. Create `stores/fileStore.ts`
3. Add change tracking to diagram store
4. Create `hooks/useFileOperations.ts`

### Step 2: Native Format Serialization

5. Create `services/serialization/ndioFormat.ts`
6. Implement serialize function
7. Implement deserialize function
8. Add validation

### Step 3: Save Operations

9. Create `services/fileApi.ts` with browser file APIs
10. Implement save to file (download)
11. Implement save as
12. Add to File menu

### Step 4: Open Operations

13. Implement file picker
14. Implement file reading
15. Add file validation
16. Create save prompt dialog

### Step 5: Auto-Save

17. Create `hooks/useAutoSave.ts`
18. Implement localStorage saving
19. Create recovery dialog
20. Add beforeunload handler

### Step 6: Recent Files

21. Implement recent files tracking
22. Create recent files menu
23. Persist to localStorage

### Step 7: draw.io Export

24. Create `services/serialization/drawioExport.ts`
25. Create `services/serialization/styleMapping.ts`
26. Implement shape to mxCell conversion
27. Implement connection to edge conversion
28. Generate XML output

### Step 8: draw.io Import

29. Create `utils/mxGraphParser.ts`
30. Create `services/serialization/drawioImport.ts`
31. Implement XML parsing
32. Implement mxCell to shape conversion
33. Handle unsupported features

### Step 9: SVG Export

34. Create `services/export/svgExport.ts`
35. Implement SVG generation from canvas
36. Add style embedding
37. Add bounds calculation

### Step 10: PNG Export

38. Create `services/export/pngExport.ts`
39. Implement canvas rendering
40. Add scale options
41. Add background options

### Step 11: PDF Export

42. Create `services/export/pdfExport.ts`
43. Integrate pdf-lib or jsPDF
44. Implement basic PDF generation

### Step 12: Image Import

45. Create image import service
46. Implement file import
47. Create `hooks/useClipboardImage.ts`
48. Implement paste from clipboard

### Step 13: Drag and Drop

49. Create `hooks/useDragDropFile.ts`
50. Create `DropZone.tsx` overlay
51. Implement file type detection
52. Handle drop events

### Step 14: UI Polish

53. Create `DocumentTitleBar.tsx`
54. Add unsaved indicator
55. Update status bar
56. Add all keyboard shortcuts

---

## Code Patterns

### File Store Implementation

```typescript
// stores/fileStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { RecentFile } from '../types/file';

interface FileStore {
  currentFileName: string | null;
  hasUnsavedChanges: boolean;
  lastSavedAt: number | null;
  recentFiles: RecentFile[];
  autoSaveEnabled: boolean;
  lastAutoSaveAt: number | null;

  setFileName: (name: string | null) => void;
  markAsSaved: () => void;
  markAsUnsaved: () => void;
  addRecentFile: (file: Omit<RecentFile, 'id' | 'lastOpened'>) => void;
  removeRecentFile: (id: string) => void;
  clearRecentFiles: () => void;
  setAutoSaveTime: (timestamp: number) => void;
}

export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      currentFileName: null,
      hasUnsavedChanges: false,
      lastSavedAt: null,
      recentFiles: [],
      autoSaveEnabled: true,
      lastAutoSaveAt: null,

      setFileName: (name) => {
        set({ currentFileName: name });
        document.title = name ? `${name} - Naive Draw.io` : 'Naive Draw.io';
      },

      markAsSaved: () => {
        set({
          hasUnsavedChanges: false,
          lastSavedAt: Date.now(),
        });
      },

      markAsUnsaved: () => {
        set({ hasUnsavedChanges: true });
      },

      addRecentFile: (file) => {
        const newFile: RecentFile = {
          ...file,
          id: nanoid(),
          lastOpened: Date.now(),
        };

        set((state) => {
          // Remove duplicate by name
          const filtered = state.recentFiles.filter(
            (f) => f.name !== file.name
          );
          // Add to front, limit to 10
          return {
            recentFiles: [newFile, ...filtered].slice(0, 10),
          };
        });
      },

      removeRecentFile: (id) => {
        set((state) => ({
          recentFiles: state.recentFiles.filter((f) => f.id !== id),
        }));
      },

      clearRecentFiles: () => {
        set({ recentFiles: [] });
      },

      setAutoSaveTime: (timestamp) => {
        set({ lastAutoSaveAt: timestamp });
      },
    }),
    {
      name: 'naive-draw-file-store',
      partialize: (state) => ({
        recentFiles: state.recentFiles,
        autoSaveEnabled: state.autoSaveEnabled,
      }),
    }
  )
);
```

### Native Format Serialization

```typescript
// services/serialization/ndioFormat.ts
import { NdioFile, DiagramData } from '../../types/file';
import { useDiagramStore } from '../../stores/diagramStore';
import { useLayerStore } from '../../stores/layerStore';
import { useGroupStore } from '../../stores/groupStore';
import { useUIStore } from '../../stores/uiStore';

const CURRENT_VERSION = '1.0';

export function serializeDiagram(title: string = 'Untitled'): NdioFile {
  const diagramStore = useDiagramStore.getState();
  const layerStore = useLayerStore.getState();
  const groupStore = useGroupStore.getState();
  const uiStore = useUIStore.getState();

  return {
    version: CURRENT_VERSION,
    metadata: {
      title,
      created: Date.now(),
      modified: Date.now(),
    },
    diagram: {
      shapes: diagramStore.shapes,
      connections: diagramStore.connections,
      groups: groupStore.groups,
      layers: Object.values(layerStore.layers),
      layerOrder: layerStore.layerOrder,
    },
    viewport: {
      zoom: uiStore.zoom,
      panOffset: uiStore.panOffset,
    },
    settings: {
      gridVisible: uiStore.gridVisible,
      gridSize: uiStore.gridSize,
      snapToGrid: uiStore.snapToGrid,
    },
  };
}

export function deserializeDiagram(file: NdioFile): void {
  // Validate version
  if (!isVersionCompatible(file.version)) {
    throw new Error(`Unsupported file version: ${file.version}`);
  }

  // Migrate if needed
  const migrated = migrateIfNeeded(file);

  // Load into stores
  const { shapes, connections, groups, layers, layerOrder } = migrated.diagram;

  useDiagramStore.getState().loadDiagram(shapes, connections);
  useGroupStore.setState({ groups, editingGroupId: null });
  useLayerStore.setState({
    layers: Object.fromEntries(layers.map((l) => [l.id, l])),
    layerOrder,
    activeLayerId: layerOrder[0] || 'default',
  });

  // Restore viewport
  const { zoom, panOffset } = migrated.viewport;
  useUIStore.getState().setZoom(zoom);
  useUIStore.getState().setPanOffset(panOffset);

  // Restore settings
  const { gridVisible, gridSize, snapToGrid } = migrated.settings;
  useUIStore.getState().setGridVisible(gridVisible);
  useUIStore.getState().setGridSize(gridSize);
  useUIStore.getState().setSnapToGrid(snapToGrid);
}

function isVersionCompatible(version: string): boolean {
  const [major] = version.split('.');
  return parseInt(major) <= 1;
}

function migrateIfNeeded(file: NdioFile): NdioFile {
  // Future: add migration logic for version upgrades
  return file;
}

export function validateNdioFile(data: unknown): data is NdioFile {
  if (typeof data !== 'object' || data === null) return false;

  const file = data as Partial<NdioFile>;

  return (
    typeof file.version === 'string' &&
    typeof file.metadata === 'object' &&
    typeof file.diagram === 'object' &&
    typeof file.diagram?.shapes === 'object' &&
    typeof file.diagram?.connections === 'object'
  );
}
```

### draw.io Export

```typescript
// services/serialization/drawioExport.ts
import { Shape, Connection } from '../../types';
import { DiagramData } from '../../types/file';
import { MxCell, MxStyle } from '../../types/drawio';
import { shapeStyleToMx, connectionStyleToMx } from './styleMapping';

export function exportToDrawio(data: DiagramData): string {
  const cells: MxCell[] = [];
  let cellId = 2; // 0 and 1 are reserved

  // Root cells
  cells.push({ id: '0' });
  cells.push({ id: '1', parent: '0' });

  // Convert shapes to mxCells
  const shapeIdMap = new Map<string, string>();

  Object.values(data.shapes).forEach((shape) => {
    const mxId = String(cellId++);
    shapeIdMap.set(shape.id, mxId);

    cells.push(shapeToMxCell(shape, mxId, '1'));
  });

  // Convert connections to edges
  Object.values(data.connections).forEach((connection) => {
    const mxId = String(cellId++);
    const sourceId = shapeIdMap.get(connection.sourceShapeId);
    const targetId = shapeIdMap.get(connection.targetShapeId);

    if (sourceId && targetId) {
      cells.push(connectionToMxCell(connection, mxId, '1', sourceId, targetId));
    }
  });

  // Generate XML
  return generateMxGraphXml(cells);
}

function shapeToMxCell(shape: Shape, id: string, parent: string): MxCell {
  const style = shapeStyleToMx(shape);

  return {
    id,
    value: shape.text?.content || '',
    style: serializeMxStyle(style),
    parent,
    vertex: true,
    geometry: {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
    },
  };
}

function connectionToMxCell(
  connection: Connection,
  id: string,
  parent: string,
  sourceId: string,
  targetId: string
): MxCell {
  const style = connectionStyleToMx(connection);

  return {
    id,
    value: connection.label?.text || '',
    style: serializeMxStyle(style),
    parent,
    source: sourceId,
    target: targetId,
    edge: true,
    geometry: {
      relative: true,
      points: connection.waypoints?.map((w) => ({ x: w.point.x, y: w.point.y })),
    },
  };
}

function serializeMxStyle(style: MxStyle): string {
  const parts: string[] = [];

  if (style.shape) parts.push(style.shape);

  Object.entries(style).forEach(([key, value]) => {
    if (key !== 'shape' && value !== undefined) {
      parts.push(`${key}=${value}`);
    }
  });

  return parts.join(';');
}

function generateMxGraphXml(cells: MxCell[]): string {
  const cellsXml = cells.map(cellToXml).join('\n        ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="naive-draw-io" modified="${new Date().toISOString()}" version="1.0">
  <diagram name="Page-1" id="page-1">
    <mxGraphModel dx="0" dy="0" grid="1" gridSize="10" guides="1">
      <root>
        ${cellsXml}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

function cellToXml(cell: MxCell): string {
  const attrs: string[] = [`id="${cell.id}"`];

  if (cell.value !== undefined) attrs.push(`value="${escapeXml(cell.value)}"`);
  if (cell.style) attrs.push(`style="${escapeXml(cell.style)}"`);
  if (cell.parent) attrs.push(`parent="${cell.parent}"`);
  if (cell.source) attrs.push(`source="${cell.source}"`);
  if (cell.target) attrs.push(`target="${cell.target}"`);
  if (cell.vertex) attrs.push(`vertex="1"`);
  if (cell.edge) attrs.push(`edge="1"`);

  const hasGeometry = cell.geometry && (
    cell.geometry.x !== undefined ||
    cell.geometry.y !== undefined ||
    cell.geometry.width !== undefined ||
    cell.geometry.height !== undefined
  );

  if (hasGeometry) {
    const geo = cell.geometry!;
    const geoAttrs: string[] = [];

    if (geo.x !== undefined) geoAttrs.push(`x="${geo.x}"`);
    if (geo.y !== undefined) geoAttrs.push(`y="${geo.y}"`);
    if (geo.width !== undefined) geoAttrs.push(`width="${geo.width}"`);
    if (geo.height !== undefined) geoAttrs.push(`height="${geo.height}"`);
    if (geo.relative) geoAttrs.push(`relative="1"`);

    return `<mxCell ${attrs.join(' ')}>
          <mxGeometry ${geoAttrs.join(' ')} as="geometry" />
        </mxCell>`;
  }

  return `<mxCell ${attrs.join(' ')} />`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
```

### draw.io Import

```typescript
// services/serialization/drawioImport.ts
import { Shape, Connection } from '../../types';
import { DiagramData } from '../../types/file';
import { MxCell, MxGraphModel, MxStyle } from '../../types/drawio';
import { mxStyleToShape, mxStyleToConnection } from './styleMapping';
import { parseDrawioXml } from '../../utils/mxGraphParser';

interface ImportResult {
  data: DiagramData;
  warnings: string[];
}

export function importFromDrawio(xmlContent: string): ImportResult {
  const warnings: string[] = [];

  // Parse XML
  const model = parseDrawioXml(xmlContent);

  // Separate vertices (shapes) and edges (connections)
  const vertices = model.cells.filter((c) => c.vertex);
  const edges = model.cells.filter((c) => c.edge);

  // Convert vertices to shapes
  const shapes: Record<string, Shape> = {};
  const idMap = new Map<string, string>(); // mxId -> our id

  vertices.forEach((cell) => {
    try {
      const shape = mxCellToShape(cell);
      shapes[shape.id] = shape;
      idMap.set(cell.id, shape.id);
    } catch (e) {
      warnings.push(`Failed to import shape ${cell.id}: ${e}`);
    }
  });

  // Convert edges to connections
  const connections: Record<string, Connection> = {};

  edges.forEach((cell) => {
    try {
      const sourceId = cell.source ? idMap.get(cell.source) : undefined;
      const targetId = cell.target ? idMap.get(cell.target) : undefined;

      if (sourceId && targetId) {
        const connection = mxCellToConnection(cell, sourceId, targetId);
        connections[connection.id] = connection;
      } else {
        warnings.push(`Skipped edge ${cell.id}: missing source or target`);
      }
    } catch (e) {
      warnings.push(`Failed to import connection ${cell.id}: ${e}`);
    }
  });

  return {
    data: {
      shapes,
      connections,
      groups: {},
      layers: [{ id: 'default', name: 'Layer 1', visible: true, locked: false, opacity: 1, createdAt: Date.now() }],
      layerOrder: ['default'],
    },
    warnings,
  };
}

function mxCellToShape(cell: MxCell): Shape {
  const id = nanoid();
  const style = parseMxStyle(cell.style || '');
  const geo = cell.geometry || {};

  // Determine shape type
  let type: ShapeType = 'rectangle';
  if (style.shape === 'ellipse') type = 'ellipse';
  else if (style.shape === 'rhombus') type = 'diamond';
  else if (style.shape === 'triangle') type = 'triangle';

  const shapeStyle = mxStyleToShape(style);

  return {
    id,
    type,
    x: geo.x || 0,
    y: geo.y || 0,
    width: geo.width || 100,
    height: geo.height || 60,
    rotation: 0,
    layerId: 'default',
    zIndex: 0,
    ...shapeStyle,
    text: cell.value ? { content: cell.value, style: {} } : undefined,
  };
}

function mxCellToConnection(
  cell: MxCell,
  sourceShapeId: string,
  targetShapeId: string
): Connection {
  const id = nanoid();
  const style = parseMxStyle(cell.style || '');
  const connectionStyle = mxStyleToConnection(style);

  return {
    id,
    sourceShapeId,
    targetShapeId,
    sourceAnchor: 'right',  // Default, could be improved
    targetAnchor: 'left',
    sourceAttached: true,
    targetAttached: true,
    ...connectionStyle,
    label: cell.value ? { text: cell.value, position: 0.5, offset: { x: 0, y: 0 }, style: {}, followPath: false } : undefined,
    waypoints: cell.geometry?.points?.map((p) => ({
      id: nanoid(),
      point: { x: p.x, y: p.y },
    })) || [],
  };
}

function parseMxStyle(styleString: string): MxStyle {
  const result: MxStyle = {};

  styleString.split(';').forEach((part) => {
    if (!part.includes('=')) {
      // First part is often shape type
      result.shape = part;
    } else {
      const [key, value] = part.split('=');
      if (key && value) {
        (result as any)[key] = parseStyleValue(value);
      }
    }
  });

  return result;
}

function parseStyleValue(value: string): string | number | boolean {
  if (value === '0' || value === '1') return value === '1';
  if (!isNaN(Number(value))) return Number(value);
  return value;
}
```

### SVG Export

```typescript
// services/export/svgExport.ts
import { useDiagramStore } from '../../stores/diagramStore';

interface SVGExportOptions {
  selectionOnly?: boolean;
  includeGrid?: boolean;
  padding?: number;
}

export function exportToSVG(options: SVGExportOptions = {}): string {
  const { padding = 20, selectionOnly = false } = options;

  const shapes = useDiagramStore.getState().shapes;
  const connections = useDiagramStore.getState().connections;

  // Get content to export
  const exportShapes = selectionOnly
    ? getSelectedShapes()
    : Object.values(shapes);

  const exportConnections = selectionOnly
    ? getSelectedConnections()
    : Object.values(connections);

  // Calculate bounds
  const bounds = calculateBounds(exportShapes, exportConnections);

  // Generate SVG content
  const svgContent = generateSVGContent(
    exportShapes,
    exportConnections,
    bounds,
    padding
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${bounds.width + padding * 2}"
     height="${bounds.height + padding * 2}"
     viewBox="${bounds.x - padding} ${bounds.y - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}">
  <defs>
    ${generateArrowDefs()}
  </defs>
  ${svgContent}
</svg>`;
}

function generateSVGContent(
  shapes: Shape[],
  connections: Connection[],
  bounds: Bounds,
  padding: number
): string {
  const parts: string[] = [];

  // Render connections first (below shapes)
  connections.forEach((conn) => {
    parts.push(renderConnectionToSVG(conn));
  });

  // Render shapes
  shapes.forEach((shape) => {
    parts.push(renderShapeToSVG(shape));
  });

  return parts.join('\n  ');
}

function renderShapeToSVG(shape: Shape): string {
  const transform = shape.rotation
    ? `transform="rotate(${shape.rotation} ${shape.x + shape.width / 2} ${shape.y + shape.height / 2})"`
    : '';

  switch (shape.type) {
    case 'rectangle':
      return `<rect x="${shape.x}" y="${shape.y}"
        width="${shape.width}" height="${shape.height}"
        rx="${shape.cornerRadius || 0}"
        fill="${shape.fill || '#ffffff'}"
        stroke="${shape.stroke || '#000000'}"
        stroke-width="${shape.strokeWidth || 1}"
        ${shape.strokeDasharray ? `stroke-dasharray="${shape.strokeDasharray}"` : ''}
        ${transform} />
      ${renderText(shape)}`;

    case 'ellipse':
      const cx = shape.x + shape.width / 2;
      const cy = shape.y + shape.height / 2;
      return `<ellipse cx="${cx}" cy="${cy}"
        rx="${shape.width / 2}" ry="${shape.height / 2}"
        fill="${shape.fill || '#ffffff'}"
        stroke="${shape.stroke || '#000000'}"
        stroke-width="${shape.strokeWidth || 1}"
        ${shape.strokeDasharray ? `stroke-dasharray="${shape.strokeDasharray}"` : ''}
        ${transform} />
      ${renderText(shape)}`;

    default:
      return '';
  }
}

function renderText(shape: Shape): string {
  if (!shape.text?.content) return '';

  const x = shape.x + shape.width / 2;
  const y = shape.y + shape.height / 2;

  return `<text x="${x}" y="${y}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="${shape.text.style?.fontFamily || 'Arial'}"
    font-size="${shape.text.style?.fontSize || 14}"
    fill="${shape.text.style?.color || '#000000'}"
    ${shape.text.style?.bold ? 'font-weight="bold"' : ''}
    ${shape.text.style?.italic ? 'font-style="italic"' : ''}
  >${escapeXml(shape.text.content)}</text>`;
}

function renderConnectionToSVG(connection: Connection): string {
  // Calculate path based on connection style
  const path = calculateConnectionPath(connection);

  return `<path d="${path}"
    fill="none"
    stroke="${connection.stroke || '#000000'}"
    stroke-width="${connection.strokeWidth || 2}"
    ${connection.strokeDasharray ? `stroke-dasharray="${connection.strokeDasharray}"` : ''}
    ${connection.endArrow !== 'none' ? `marker-end="url(#arrow)"` : ''}
    ${connection.startArrow !== 'none' ? `marker-start="url(#arrow-start)"` : ''}
  />`;
}

function generateArrowDefs(): string {
  return `
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
      markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
    </marker>
    <marker id="arrow-start" viewBox="0 0 10 10" refX="1" refY="5"
      markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 10 0 L 0 5 L 10 10 z" fill="context-stroke" />
    </marker>
  `;
}
```

### PNG Export

```typescript
// services/export/pngExport.ts

interface PNGExportOptions {
  scale?: number;
  background?: 'transparent' | 'white' | string;
  selectionOnly?: boolean;
}

export async function exportToPNG(options: PNGExportOptions = {}): Promise<Blob> {
  const { scale = 1, background = 'white', selectionOnly = false } = options;

  // Get SVG first
  const svgString = exportToSVG({ selectionOnly });

  // Parse SVG to get dimensions
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgElement = svgDoc.documentElement;

  const width = parseFloat(svgElement.getAttribute('width') || '800');
  const height = parseFloat(svgElement.getAttribute('height') || '600');

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d')!;

  // Apply scale
  ctx.scale(scale, scale);

  // Draw background
  if (background !== 'transparent') {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }

  // Convert SVG to data URL and draw
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  const img = new Image();

  return new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(svgUrl);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        },
        'image/png',
        1.0
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error('Failed to load SVG for PNG export'));
    };

    img.src = svgUrl;
  });
}
```

### Auto-Save Hook

```typescript
// hooks/useAutoSave.ts
import { useEffect, useRef, useCallback } from 'react';
import { useDiagramStore } from '../stores/diagramStore';
import { useFileStore } from '../stores/fileStore';
import { serializeDiagram } from '../services/serialization/ndioFormat';

const AUTO_SAVE_KEY = 'naive-draw-autosave';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export function useAutoSave() {
  const isDirtyRef = useRef(false);
  const { setAutoSaveTime, hasUnsavedChanges, currentFileName } = useFileStore();

  // Track changes
  useEffect(() => {
    const unsubscribe = useDiagramStore.subscribe(() => {
      isDirtyRef.current = true;
    });
    return unsubscribe;
  }, []);

  // Perform auto-save
  const performAutoSave = useCallback(() => {
    if (!isDirtyRef.current) return;

    const data = serializeDiagram(currentFileName || 'Untitled');
    const autoSaveData = {
      data,
      timestamp: Date.now(),
      fileName: currentFileName,
    };

    try {
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(autoSaveData));
      setAutoSaveTime(Date.now());
      isDirtyRef.current = false;
      console.log('Auto-saved at', new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Auto-save failed:', e);
      // localStorage might be full
    }
  }, [currentFileName, setAutoSaveTime]);

  // Periodic auto-save
  useEffect(() => {
    const interval = setInterval(performAutoSave, AUTO_SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [performAutoSave]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirtyRef.current) {
        performAutoSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [performAutoSave]);

  // Check for recovery data
  const checkForRecovery = useCallback(() => {
    try {
      const saved = localStorage.getItem(AUTO_SAVE_KEY);
      if (saved) {
        const autoSaveData = JSON.parse(saved);
        return autoSaveData;
      }
    } catch (e) {
      console.error('Failed to read auto-save data:', e);
    }
    return null;
  }, []);

  const clearRecoveryData = useCallback(() => {
    localStorage.removeItem(AUTO_SAVE_KEY);
  }, []);

  return {
    performAutoSave,
    checkForRecovery,
    clearRecoveryData,
  };
}
```

### File Operations Hook

```typescript
// hooks/useFileOperations.ts
import { useCallback } from 'react';
import { useFileStore } from '../stores/fileStore';
import { useDiagramStore } from '../stores/diagramStore';
import { useUIStore } from '../stores/uiStore';
import {
  serializeDiagram,
  deserializeDiagram,
  validateNdioFile,
} from '../services/serialization/ndioFormat';
import { importFromDrawio } from '../services/serialization/drawioImport';
import { exportToDrawio } from '../services/serialization/drawioExport';
import { downloadFile, readFile, showFilePicker } from '../services/fileApi';

export function useFileOperations() {
  const {
    currentFileName,
    setFileName,
    markAsSaved,
    markAsUnsaved,
    hasUnsavedChanges,
    addRecentFile,
  } = useFileStore();

  const { clearDiagram } = useDiagramStore();
  const { setSavePromptOpen, setSavePromptCallback } = useUIStore();

  // New diagram
  const newDiagram = useCallback(async () => {
    if (hasUnsavedChanges) {
      return new Promise<boolean>((resolve) => {
        setSavePromptCallback(() => {
          clearDiagram();
          setFileName(null);
          markAsSaved();
          resolve(true);
        });
        setSavePromptOpen(true);
      });
    }

    clearDiagram();
    setFileName(null);
    markAsSaved();
    return true;
  }, [hasUnsavedChanges, clearDiagram, setFileName, markAsSaved]);

  // Save diagram
  const saveDiagram = useCallback((saveAs: boolean = false) => {
    const filename = saveAs || !currentFileName
      ? prompt('Enter filename:', currentFileName || 'diagram') || 'diagram'
      : currentFileName;

    const finalFilename = filename.endsWith('.ndio')
      ? filename
      : `${filename}.ndio`;

    const data = serializeDiagram(finalFilename.replace('.ndio', ''));
    const json = JSON.stringify(data, null, 2);

    downloadFile(json, finalFilename, 'application/json');

    setFileName(finalFilename);
    markAsSaved();
    addRecentFile({ name: finalFilename, type: 'ndio' });

    return true;
  }, [currentFileName, setFileName, markAsSaved, addRecentFile]);

  // Open diagram
  const openDiagram = useCallback(async () => {
    if (hasUnsavedChanges) {
      const confirmed = await promptSave();
      if (!confirmed) return false;
    }

    try {
      const file = await showFilePicker(['.ndio', '.drawio', '.xml']);
      const content = await readFile(file);

      if (file.name.endsWith('.drawio') || file.name.endsWith('.xml')) {
        // Import draw.io
        const { data, warnings } = importFromDrawio(content);
        if (warnings.length > 0) {
          console.warn('Import warnings:', warnings);
          // Could show warning dialog
        }
        useDiagramStore.getState().loadDiagram(data.shapes, data.connections);
        setFileName(file.name.replace(/\.(drawio|xml)$/, '.ndio'));
      } else {
        // Open native format
        const data = JSON.parse(content);
        if (!validateNdioFile(data)) {
          throw new Error('Invalid file format');
        }
        deserializeDiagram(data);
        setFileName(file.name);
      }

      markAsSaved();
      addRecentFile({ name: file.name, type: file.name.endsWith('.drawio') ? 'drawio' : 'ndio' });

      return true;
    } catch (e) {
      console.error('Failed to open file:', e);
      alert(`Failed to open file: ${e instanceof Error ? e.message : 'Unknown error'}`);
      return false;
    }
  }, [hasUnsavedChanges, setFileName, markAsSaved, addRecentFile]);

  // Export to draw.io
  const exportDrawio = useCallback(() => {
    const data = useDiagramStore.getState();
    const xml = exportToDrawio({
      shapes: data.shapes,
      connections: data.connections,
      groups: {},
      layers: [],
      layerOrder: [],
    });

    const filename = (currentFileName?.replace('.ndio', '') || 'diagram') + '.drawio';
    downloadFile(xml, filename, 'application/xml');

    return true;
  }, [currentFileName]);

  return {
    newDiagram,
    saveDiagram,
    saveAsDialog: () => saveDiagram(true),
    openDiagram,
    exportDrawio,
    hasUnsavedChanges,
    currentFileName,
  };
}
```

---

## Key Decisions

### Decision 1: Native File Format

**Options:**
1. Binary format (smaller, not human-readable)
2. JSON format (larger, human-readable)
3. Compressed JSON

**Decision:** JSON format (.ndio)

**Rationale:**
- Human-readable for debugging
- Easy to version control
- Standard format parseable anywhere
- Compression can be added later

### Decision 2: File Save Method

**Options:**
1. File System Access API (modern, limited support)
2. Download-based (universal support)
3. Server-side save

**Decision:** Download-based with File System Access API fallback

**Rationale:**
- Works in all browsers
- No server required
- File System Access API for better UX where supported

### Decision 3: Auto-Save Storage

**Options:**
1. localStorage only
2. IndexedDB
3. Service worker cache

**Decision:** localStorage with size limits

**Rationale:**
- Simple implementation
- Sufficient for typical diagrams
- IndexedDB can be added if needed

### Decision 4: draw.io Compatibility Level

**Options:**
1. Full mxGraph compatibility
2. Basic shape/connection only
3. Best-effort with warnings

**Decision:** Best-effort with warnings

**Rationale:**
- draw.io has many advanced features
- Full compatibility would be enormous scope
- Users can still use most diagrams
- Warnings inform users of limitations

---

## Testing Approach

### Unit Tests

```typescript
// __tests__/ndioFormat.test.ts
describe('ndioFormat', () => {
  it('should serialize and deserialize diagram', () => {
    const diagram = createTestDiagram();
    const serialized = serializeDiagram('Test');
    const json = JSON.stringify(serialized);
    const parsed = JSON.parse(json);

    expect(validateNdioFile(parsed)).toBe(true);
    deserializeDiagram(parsed);

    const restored = useDiagramStore.getState();
    expect(Object.keys(restored.shapes)).toHaveLength(
      Object.keys(diagram.shapes).length
    );
  });
});

// __tests__/drawioExport.test.ts
describe('drawioExport', () => {
  it('should export valid XML', () => {
    const xml = exportToDrawio(testDiagram);

    expect(xml).toContain('<?xml');
    expect(xml).toContain('<mxfile');
    expect(xml).toContain('<mxCell');
  });

  it('should preserve shape positions', () => {
    const xml = exportToDrawio(testDiagram);

    expect(xml).toContain('x="100"');
    expect(xml).toContain('y="200"');
  });
});

// __tests__/drawioImport.test.ts
describe('drawioImport', () => {
  it('should import basic shapes', () => {
    const xml = `<mxfile>...</mxfile>`;
    const { data, warnings } = importFromDrawio(xml);

    expect(Object.keys(data.shapes).length).toBeGreaterThan(0);
  });

  it('should report unsupported features', () => {
    const xmlWithAdvanced = `...`;
    const { warnings } = importFromDrawio(xmlWithAdvanced);

    expect(warnings.length).toBeGreaterThan(0);
  });
});
```

### E2E Tests

```typescript
// e2e/file-operations.spec.ts
describe('File Operations', () => {
  it('should save and open native format', () => {
    createDiagram();
    cy.get('[data-testid="save-button"]').click();

    // New diagram
    cy.get('[data-testid="new-button"]').click();
    cy.get('[data-testid="canvas"]').should('be.empty');

    // Open saved file
    cy.get('[data-testid="open-button"]').click();
    cy.get('input[type="file"]').selectFile('downloads/diagram.ndio');

    cy.get('[data-testid="shape"]').should('exist');
  });

  it('should warn about unsaved changes', () => {
    createDiagram();
    cy.get('[data-testid="new-button"]').click();

    cy.get('[data-testid="save-prompt"]').should('be.visible');
  });
});

// e2e/export.spec.ts
describe('Export', () => {
  it('should export to SVG', () => {
    createDiagram();
    cy.get('[data-testid="export-svg"]').click();

    // Verify download
    cy.readFile('downloads/diagram.svg').should('contain', '<svg');
  });

  it('should export to draw.io', () => {
    createDiagram();
    cy.get('[data-testid="export-drawio"]').click();

    cy.readFile('downloads/diagram.drawio').should('contain', '<mxfile');
  });
});
```

---

## Performance Considerations

### Large File Handling

```typescript
// Chunked serialization for large diagrams
async function serializeLargeDiagram(): Promise<string> {
  const shapes = Object.values(useDiagramStore.getState().shapes);

  // Process in chunks to avoid blocking
  const chunks: string[] = [];
  const chunkSize = 100;

  for (let i = 0; i < shapes.length; i += chunkSize) {
    const chunk = shapes.slice(i, i + chunkSize);
    chunks.push(JSON.stringify(chunk));

    // Yield to main thread
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return chunks.join('');
}
```

### PNG Export Performance

```typescript
// Use OffscreenCanvas for better performance
async function exportPNGOffscreen(options: PNGExportOptions): Promise<Blob> {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width * scale, height * scale);
    // ... render to offscreen canvas
    return canvas.convertToBlob({ type: 'image/png' });
  }

  // Fallback to regular canvas
  return exportToPNG(options);
}
```

### Auto-Save Debouncing

```typescript
// Debounce rapid changes
const debouncedAutoSave = debounce(performAutoSave, 5000, {
  maxWait: 30000, // Force save every 30s even with continuous changes
});
```

---

## Accessibility Requirements

### File Dialogs

- Native file picker (inherently accessible)
- Custom dialogs with proper ARIA
- Keyboard shortcuts documented

### Status Announcements

```tsx
// Announce save status
<div
  role="status"
  aria-live="polite"
  className="sr-only"
>
  {lastSaved && `Document saved at ${formatTime(lastSaved)}`}
</div>

// Unsaved indicator
<span
  aria-label={hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
  title={hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
>
  {hasUnsavedChanges && '*'}
</span>
```

### Export Dialog

- Focus trap
- Clear labels for options
- Keyboard navigation

---

## Browser Compatibility Notes

### File System Access API

```typescript
// Feature detection
const supportsFileSystemAccess =
  'showSaveFilePicker' in window &&
  'showOpenFilePicker' in window;

// Use if available
async function saveWithFileSystemAccess() {
  if (supportsFileSystemAccess) {
    const handle = await window.showSaveFilePicker({
      suggestedName: 'diagram.ndio',
      types: [{
        description: 'Naive Draw.io files',
        accept: { 'application/json': ['.ndio'] },
      }],
    });
    const writable = await handle.createWritable();
    await writable.write(data);
    await writable.close();
  } else {
    // Fallback to download
    downloadFile(data, 'diagram.ndio', 'application/json');
  }
}
```

### Clipboard API

```typescript
// Image paste - check for support
async function handlePaste(event: ClipboardEvent) {
  if (!navigator.clipboard?.read) {
    // Fallback to clipboardData
    const items = event.clipboardData?.items;
    // ...
    return;
  }

  const items = await navigator.clipboard.read();
  // ...
}
```

---

## Migration Notes

This is the final phase. No further migrations expected.

### Data Model Summary

By end of Phase 9, the complete data model is:

```typescript
interface CompleteDiagram {
  // Core elements
  shapes: Record<string, Shape>;
  connections: Record<string, Connection>;

  // Organization (P8)
  groups: Record<string, Group>;
  layers: Layer[];
  layerOrder: string[];

  // Metadata (P9)
  metadata: {
    title: string;
    created: number;
    modified: number;
  };

  // Settings
  viewport: ViewportData;
  settings: SettingsData;
}
```

This model supports:
- All shape types with styling
- All connection types with styles
- Groups with nesting
- Layers with visibility/locking
- Full serialization to .ndio
- Import/export to draw.io
- Export to SVG, PNG, PDF
