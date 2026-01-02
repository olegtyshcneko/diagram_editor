# Phase 8: Organization & Advanced Connections - Technical Specification

## Technical Architecture

### Component Hierarchy

```
App
├── MenuBar (extended with Arrange menu)
├── Toolbar
├── MainLayout
│   ├── LayersPanel (new)
│   │   ├── LayerItem
│   │   └── LayerControls
│   ├── Canvas
│   │   ├── GridBackground
│   │   ├── LayerRenderer (new)
│   │   │   └── ShapeRenderer (per layer)
│   │   ├── ConnectionRenderer (extended)
│   │   │   ├── StraightConnection
│   │   │   ├── CurvedConnection (new)
│   │   │   ├── OrthogonalConnection (new)
│   │   │   ├── ConnectionWaypoints (new)
│   │   │   └── ConnectionLabel (new)
│   │   ├── GroupOverlay (new)
│   │   └── SelectionOverlay
│   └── PropertyPanel (extended)
└── StatusBar
```

### State Management Updates

```typescript
// useLayerStore.ts - New store for layers
interface LayerStore {
  layers: Record<string, Layer>;
  layerOrder: string[]; // IDs in render order
  activeLayerId: string;

  // Actions
  addLayer: (name?: string) => string;
  deleteLayer: (id: string, moveShapesTo?: string) => void;
  renameLayer: (id: string, name: string) => void;
  setLayerVisibility: (id: string, visible: boolean) => void;
  setLayerLocked: (id: string, locked: boolean) => void;
  reorderLayers: (newOrder: string[]) => void;
  setActiveLayer: (id: string) => void;
}

// useGroupStore.ts - New store for groups
interface GroupStore {
  groups: Record<string, Group>;
  editingGroupId: string | null;

  // Actions
  createGroup: (shapeIds: string[]) => string;
  ungroup: (groupId: string) => void;
  enterGroupEdit: (groupId: string) => void;
  exitGroupEdit: () => void;
  addToGroup: (groupId: string, shapeIds: string[]) => void;
  removeFromGroup: (groupId: string, shapeIds: string[]) => void;
}

// Updated diagramStore.ts
interface DiagramStore {
  shapes: Record<string, Shape>;
  connections: Record<string, Connection>;

  // Extended shape with layer/group
  updateShapeLayer: (shapeId: string, layerId: string) => void;
  getShapesByLayer: (layerId: string) => Shape[];

  // Extended connection with waypoints
  addWaypoint: (connectionId: string, point: Point, index?: number) => void;
  updateWaypoint: (connectionId: string, index: number, point: Point) => void;
  removeWaypoint: (connectionId: string, index: number) => void;
  setConnectionLabel: (connectionId: string, label: ConnectionLabel | null) => void;
  setConnectionStyle: (connectionId: string, style: ConnectionStyle) => void;
}
```

---

## Files to Create

### New Files

```
src/
├── stores/
│   ├── layerStore.ts             # Layer state management
│   └── groupStore.ts             # Group state management
├── hooks/
│   ├── useLayers.ts              # Layer operations hook
│   ├── useGroups.ts              # Group operations hook
│   ├── useConnectionRouting.ts   # Path calculation hook
│   └── useWaypoints.ts           # Waypoint management hook
├── components/
│   ├── canvas/
│   │   ├── LayerRenderer.tsx     # Renders shapes by layer
│   │   ├── GroupOverlay.tsx      # Group selection visuals
│   │   ├── GroupEditMode.tsx     # Group edit mode UI
│   │   └── connections/
│   │       ├── CurvedConnection.tsx
│   │       ├── OrthogonalConnection.tsx
│   │       ├── ConnectionWaypoints.tsx
│   │       ├── ConnectionLabel.tsx
│   │       ├── ConnectionControlPoints.tsx
│   │       └── ShapeConnectionHighlight.tsx
│   └── panels/
│       ├── LayersPanel.tsx
│       ├── LayerItem.tsx
│       └── LayerControls.tsx
├── utils/
│   ├── bezierUtils.ts            # Bezier curve calculations
│   ├── orthogonalRouting.ts      # Orthogonal path finding
│   ├── pathUtils.ts              # Path manipulation utilities
│   ├── groupUtils.ts             # Group operations
│   └── anchorSelection.ts        # Best anchor calculation for shape-level targeting
└── types/
    ├── layer.ts                  # Layer types
    ├── group.ts                  # Group types
    └── connectionAdvanced.ts     # Extended connection types
```

### Files to Modify

```
src/
├── stores/
│   └── diagramStore.ts           # Add layer/group refs, waypoints
├── components/
│   ├── canvas/
│   │   ├── Canvas.tsx            # Integrate layers, groups
│   │   └── ConnectionRenderer.tsx # Support multiple styles
│   ├── MenuBar.tsx               # Arrange menu with group options
│   └── PropertyPanel.tsx         # Connection style options
├── hooks/
│   ├── useSelection.ts           # Group-aware selection
│   └── useShapeManipulation.ts   # Layer-aware operations
└── types/
    ├── shape.ts                  # Add layerId, groupId
    └── connection.ts             # Add waypoints, style, label
```

---

## Key Interfaces & Types

### Layer Types

```typescript
// types/layer.ts

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;       // 0-1, for future use
  createdAt: number;
}

export interface LayerState {
  layers: Record<string, Layer>;
  layerOrder: string[];  // Render order (bottom to top)
  activeLayerId: string;
}

export const DEFAULT_LAYER: Layer = {
  id: 'default',
  name: 'Layer 1',
  visible: true,
  locked: false,
  opacity: 1,
  createdAt: Date.now(),
};
```

### Group Types

```typescript
// types/group.ts

export interface Group {
  id: string;
  memberIds: string[];      // Shape IDs in this group
  parentGroupId?: string;   // For nested groups
  bounds?: Bounds;          // Cached bounding box
}

export interface GroupState {
  groups: Record<string, Group>;
  editingGroupId: string | null;  // Currently in edit mode
}

// Extended shape type
export interface ShapeWithGroup extends Shape {
  groupId?: string;
  layerId: string;
}
```

### Advanced Connection Types

```typescript
// types/connectionAdvanced.ts

export type ConnectionStyle = 'straight' | 'curved' | 'orthogonal';

export interface ConnectionLabel {
  text: string;
  position: number;          // 0-1 along path
  offset: Point;             // Perpendicular offset from path
  style: TextStyle;
  followPath: boolean;       // Text on path (for curved)
}

export interface ConnectionWaypoint {
  id: string;
  point: Point;
  controlBefore?: Point;     // For curves
  controlAfter?: Point;      // For curves
}

export interface AdvancedConnection extends Connection {
  style: ConnectionStyle;
  waypoints: ConnectionWaypoint[];
  label?: ConnectionLabel;

  // For curved connections
  controlPoints?: {
    source: Point;           // CP near source
    target: Point;           // CP near target
  };

  // Endpoint state
  sourceAttached: boolean;   // false if floating
  targetAttached: boolean;
}
```

---

## Implementation Order

### Step 1: Layer System Foundation

1. Create `types/layer.ts`
2. Create `stores/layerStore.ts`
3. Create `hooks/useLayers.ts`
4. Extend Shape type with `layerId`

### Step 2: Layers UI

5. Create `LayersPanel.tsx` component
6. Create `LayerItem.tsx` component
7. Add layers panel toggle to View menu
8. Integrate with main layout

### Step 3: Layer Functionality

9. Create `LayerRenderer.tsx` for layer-based rendering
10. Implement layer visibility logic
11. Implement layer locking logic
12. Implement layer reordering

### Step 4: Group System Foundation

13. Create `types/group.ts`
14. Create `stores/groupStore.ts`
15. Create `hooks/useGroups.ts`
16. Extend Shape type with `groupId`

### Step 5: Group Operations

17. Implement `createGroup` action
18. Implement `ungroup` action
19. Create `GroupOverlay.tsx` for visual feedback
20. Implement group-aware selection

### Step 6: Group Edit Mode

21. Create `GroupEditMode.tsx`
22. Implement `enterGroupEdit` / `exitGroupEdit`
23. Add visual dimming for non-group shapes
24. Update selection behavior in edit mode

### Step 7: Curved Connections

25. Create `utils/bezierUtils.ts`
26. Create `CurvedConnection.tsx` component
27. Create `ConnectionControlPoints.tsx`
28. Add curve style to property panel

### Step 8: Orthogonal Connections

29. Create `utils/orthogonalRouting.ts`
30. Create `OrthogonalConnection.tsx` component
31. Implement auto-routing algorithm

### Step 9: Connection Labels

32. Create `ConnectionLabel.tsx` component
33. Implement label positioning along path
34. Add label editing via double-click
35. Add label styling to property panel

### Step 10: Waypoints

36. Create `hooks/useWaypoints.ts`
37. Create `ConnectionWaypoints.tsx`
38. Implement add/move/remove waypoint logic
39. Integrate waypoints with all connection styles

### Step 11: Disconnect/Reconnect

40. Implement endpoint dragging
41. Add floating endpoint visual state
42. Implement anchor snapping for reattachment

### Step 11.5: Shape-Level Connection Targeting

43. Create `utils/anchorSelection.ts` for best anchor calculation
44. Update `useConnectionCreation` hook for shape-level targeting
45. Add shape highlight state during connection drag
46. Implement approach-direction-based anchor selection
47. Add snap-to-anchor override when close to specific anchor

### Step 12: Menu Integration

43. Add Arrange > Group/Ungroup menu items
44. Add Arrange > Group submenu
45. Update context menus with group options
46. Add keyboard shortcuts

---

## Code Patterns

### Layer Store Implementation

```typescript
// stores/layerStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Layer, DEFAULT_LAYER } from '../types/layer';

interface LayerStore {
  layers: Record<string, Layer>;
  layerOrder: string[];
  activeLayerId: string;

  addLayer: (name?: string) => string;
  deleteLayer: (id: string, moveShapesTo?: string) => void;
  renameLayer: (id: string, name: string) => void;
  setLayerVisibility: (id: string, visible: boolean) => void;
  setLayerLocked: (id: string, locked: boolean) => void;
  reorderLayers: (newOrder: string[]) => void;
  setActiveLayer: (id: string) => void;
  getVisibleLayers: () => Layer[];
  isLayerEditable: (id: string) => boolean;
}

export const useLayerStore = create<LayerStore>()(
  persist(
    (set, get) => ({
      layers: { [DEFAULT_LAYER.id]: DEFAULT_LAYER },
      layerOrder: [DEFAULT_LAYER.id],
      activeLayerId: DEFAULT_LAYER.id,

      addLayer: (name) => {
        const id = nanoid();
        const layerCount = Object.keys(get().layers).length;
        const newLayer: Layer = {
          id,
          name: name || `Layer ${layerCount + 1}`,
          visible: true,
          locked: false,
          opacity: 1,
          createdAt: Date.now(),
        };

        set((state) => ({
          layers: { ...state.layers, [id]: newLayer },
          layerOrder: [...state.layerOrder, id],
          activeLayerId: id,
        }));

        return id;
      },

      deleteLayer: (id, moveShapesTo) => {
        const { layers, layerOrder } = get();
        if (layerOrder.length <= 1) return; // Can't delete last layer

        // Move shapes handled externally via useLayers hook
        const { [id]: _, ...remainingLayers } = layers;
        const newOrder = layerOrder.filter((lid) => lid !== id);
        const newActiveId = moveShapesTo || newOrder[newOrder.length - 1];

        set({
          layers: remainingLayers,
          layerOrder: newOrder,
          activeLayerId: newActiveId,
        });
      },

      renameLayer: (id, name) => {
        set((state) => ({
          layers: {
            ...state.layers,
            [id]: { ...state.layers[id], name },
          },
        }));
      },

      setLayerVisibility: (id, visible) => {
        set((state) => ({
          layers: {
            ...state.layers,
            [id]: { ...state.layers[id], visible },
          },
        }));
      },

      setLayerLocked: (id, locked) => {
        set((state) => ({
          layers: {
            ...state.layers,
            [id]: { ...state.layers[id], locked },
          },
        }));
      },

      reorderLayers: (newOrder) => {
        set({ layerOrder: newOrder });
      },

      setActiveLayer: (id) => {
        set({ activeLayerId: id });
      },

      getVisibleLayers: () => {
        const { layers, layerOrder } = get();
        return layerOrder
          .map((id) => layers[id])
          .filter((layer) => layer.visible);
      },

      isLayerEditable: (id) => {
        const layer = get().layers[id];
        return layer?.visible && !layer?.locked;
      },
    }),
    {
      name: 'naive-draw-layers',
      partialize: (state) => ({
        layers: state.layers,
        layerOrder: state.layerOrder,
        activeLayerId: state.activeLayerId,
      }),
    }
  )
);
```

### Group Store Implementation

```typescript
// stores/groupStore.ts
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Group } from '../types/group';

interface GroupStore {
  groups: Record<string, Group>;
  editingGroupId: string | null;

  createGroup: (shapeIds: string[]) => string | null;
  ungroup: (groupId: string) => string[];
  enterGroupEdit: (groupId: string) => void;
  exitGroupEdit: () => void;
  getGroupForShape: (shapeId: string) => Group | null;
  getTopLevelGroupForShape: (shapeId: string) => Group | null;
  isInEditingGroup: (shapeId: string) => boolean;
}

export const useGroupStore = create<GroupStore>((set, get) => ({
  groups: {},
  editingGroupId: null,

  createGroup: (shapeIds) => {
    if (shapeIds.length < 2) return null;

    const id = nanoid();
    const group: Group = {
      id,
      memberIds: shapeIds,
    };

    set((state) => ({
      groups: { ...state.groups, [id]: group },
    }));

    // Note: Caller must update shapes with groupId
    return id;
  },

  ungroup: (groupId) => {
    const group = get().groups[groupId];
    if (!group) return [];

    const memberIds = [...group.memberIds];

    set((state) => {
      const { [groupId]: _, ...remainingGroups } = state.groups;
      return { groups: remainingGroups };
    });

    // Note: Caller must clear groupId on shapes
    return memberIds;
  },

  enterGroupEdit: (groupId) => {
    set({ editingGroupId: groupId });
  },

  exitGroupEdit: () => {
    set({ editingGroupId: null });
  },

  getGroupForShape: (shapeId) => {
    const { groups } = get();
    return Object.values(groups).find((g) =>
      g.memberIds.includes(shapeId)
    ) || null;
  },

  getTopLevelGroupForShape: (shapeId) => {
    const { groups } = get();
    let group = Object.values(groups).find((g) =>
      g.memberIds.includes(shapeId)
    );

    if (!group) return null;

    // Walk up parent chain
    while (group?.parentGroupId) {
      const parent = groups[group.parentGroupId];
      if (parent) {
        group = parent;
      } else {
        break;
      }
    }

    return group;
  },

  isInEditingGroup: (shapeId) => {
    const { editingGroupId, groups } = get();
    if (!editingGroupId) return false;

    const group = groups[editingGroupId];
    return group?.memberIds.includes(shapeId) || false;
  },
}));
```

### Bezier Curve Utilities

```typescript
// utils/bezierUtils.ts

export interface BezierCurve {
  start: Point;
  cp1: Point;
  cp2: Point;
  end: Point;
}

/**
 * Calculate automatic control points for a smooth curve
 */
export function calculateAutoControlPoints(
  start: Point,
  startAnchor: AnchorPosition,
  end: Point,
  endAnchor: AnchorPosition
): { cp1: Point; cp2: Point } {
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const offset = Math.min(distance * 0.4, 100); // Cap at 100px

  const cp1 = getAnchorOffset(start, startAnchor, offset);
  const cp2 = getAnchorOffset(end, endAnchor, offset);

  return { cp1, cp2 };
}

function getAnchorOffset(
  point: Point,
  anchor: AnchorPosition,
  distance: number
): Point {
  switch (anchor) {
    case 'top':
      return { x: point.x, y: point.y - distance };
    case 'bottom':
      return { x: point.x, y: point.y + distance };
    case 'left':
      return { x: point.x - distance, y: point.y };
    case 'right':
      return { x: point.x + distance, y: point.y };
  }
}

/**
 * Get point along bezier curve at t (0-1)
 */
export function getPointOnBezier(curve: BezierCurve, t: number): Point {
  const { start, cp1, cp2, end } = curve;
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;

  return {
    x: mt3 * start.x + 3 * mt2 * t * cp1.x + 3 * mt * t2 * cp2.x + t3 * end.x,
    y: mt3 * start.y + 3 * mt2 * t * cp1.y + 3 * mt * t2 * cp2.y + t3 * end.y,
  };
}

/**
 * Get tangent angle at point on curve
 */
export function getTangentAtPoint(curve: BezierCurve, t: number): number {
  const { start, cp1, cp2, end } = curve;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  // First derivative of bezier
  const dx =
    3 * mt2 * (cp1.x - start.x) +
    6 * mt * t * (cp2.x - cp1.x) +
    3 * t2 * (end.x - cp2.x);
  const dy =
    3 * mt2 * (cp1.y - start.y) +
    6 * mt * t * (cp2.y - cp1.y) +
    3 * t2 * (end.y - cp2.y);

  return Math.atan2(dy, dx);
}

/**
 * Generate SVG path for bezier curve
 */
export function bezierToSVGPath(curve: BezierCurve): string {
  const { start, cp1, cp2, end } = curve;
  return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
}

/**
 * Calculate bezier curve with waypoints
 */
export function bezierWithWaypoints(
  start: Point,
  startAnchor: AnchorPosition,
  end: Point,
  endAnchor: AnchorPosition,
  waypoints: Point[]
): string {
  if (waypoints.length === 0) {
    const { cp1, cp2 } = calculateAutoControlPoints(start, startAnchor, end, endAnchor);
    return bezierToSVGPath({ start, cp1, cp2, end });
  }

  // Multiple segments through waypoints
  const allPoints = [start, ...waypoints, end];
  let path = `M ${start.x} ${start.y}`;

  for (let i = 0; i < allPoints.length - 1; i++) {
    const p0 = allPoints[i];
    const p1 = allPoints[i + 1];

    // Calculate control points for segment
    const cp1 = {
      x: p0.x + (p1.x - p0.x) * 0.3,
      y: p0.y + (p1.y - p0.y) * 0.1,
    };
    const cp2 = {
      x: p0.x + (p1.x - p0.x) * 0.7,
      y: p0.y + (p1.y - p0.y) * 0.9,
    };

    path += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p1.x} ${p1.y}`;
  }

  return path;
}
```

### Orthogonal Routing

```typescript
// utils/orthogonalRouting.ts

export interface OrthogonalRoute {
  points: Point[];
  segments: Array<{ from: Point; to: Point; direction: 'h' | 'v' }>;
}

/**
 * Calculate orthogonal path between two anchors
 */
export function calculateOrthogonalPath(
  start: Point,
  startAnchor: AnchorPosition,
  end: Point,
  endAnchor: AnchorPosition,
  waypoints: Point[] = []
): Point[] {
  if (waypoints.length > 0) {
    return routeWithWaypoints(start, startAnchor, end, endAnchor, waypoints);
  }

  const points: Point[] = [start];
  const exitOffset = 20; // Distance to exit perpendicular

  // Get exit direction
  const exitPoint = getExitPoint(start, startAnchor, exitOffset);
  const entryPoint = getExitPoint(end, endAnchor, exitOffset);

  // Determine routing strategy
  const strategy = determineRoutingStrategy(
    start, startAnchor, exitPoint,
    end, endAnchor, entryPoint
  );

  switch (strategy) {
    case 'direct':
      // L-shaped: one turn
      points.push(exitPoint);
      if (isHorizontal(startAnchor)) {
        points.push({ x: exitPoint.x, y: entryPoint.y });
      } else {
        points.push({ x: entryPoint.x, y: exitPoint.y });
      }
      break;

    case 'z-shape':
      // Z-shaped: two turns
      const midX = (exitPoint.x + entryPoint.x) / 2;
      const midY = (exitPoint.y + entryPoint.y) / 2;

      points.push(exitPoint);
      if (isHorizontal(startAnchor)) {
        points.push({ x: midX, y: exitPoint.y });
        points.push({ x: midX, y: entryPoint.y });
      } else {
        points.push({ x: exitPoint.x, y: midY });
        points.push({ x: entryPoint.x, y: midY });
      }
      break;

    case 'u-shape':
      // U-shaped: for same-direction exits
      const offset = Math.max(
        Math.abs(end.x - start.x) * 0.3,
        Math.abs(end.y - start.y) * 0.3,
        50
      );
      points.push(exitPoint);
      if (isHorizontal(startAnchor)) {
        const farX = startAnchor === 'right'
          ? Math.max(exitPoint.x, entryPoint.x) + offset
          : Math.min(exitPoint.x, entryPoint.x) - offset;
        points.push({ x: farX, y: exitPoint.y });
        points.push({ x: farX, y: entryPoint.y });
      } else {
        const farY = startAnchor === 'bottom'
          ? Math.max(exitPoint.y, entryPoint.y) + offset
          : Math.min(exitPoint.y, entryPoint.y) - offset;
        points.push({ x: exitPoint.x, y: farY });
        points.push({ x: entryPoint.x, y: farY });
      }
      break;
  }

  points.push(entryPoint);
  points.push(end);

  return simplifyPath(points);
}

function getExitPoint(point: Point, anchor: AnchorPosition, offset: number): Point {
  switch (anchor) {
    case 'top': return { x: point.x, y: point.y - offset };
    case 'bottom': return { x: point.x, y: point.y + offset };
    case 'left': return { x: point.x - offset, y: point.y };
    case 'right': return { x: point.x + offset, y: point.y };
  }
}

function isHorizontal(anchor: AnchorPosition): boolean {
  return anchor === 'left' || anchor === 'right';
}

type RoutingStrategy = 'direct' | 'z-shape' | 'u-shape';

function determineRoutingStrategy(
  start: Point, startAnchor: AnchorPosition, exitPoint: Point,
  end: Point, endAnchor: AnchorPosition, entryPoint: Point
): RoutingStrategy {
  const sameDirection =
    (startAnchor === endAnchor) ||
    (isHorizontal(startAnchor) === isHorizontal(endAnchor) &&
     ((startAnchor === 'left' && endAnchor === 'right') ||
      (startAnchor === 'right' && endAnchor === 'left') ||
      (startAnchor === 'top' && endAnchor === 'bottom') ||
      (startAnchor === 'bottom' && endAnchor === 'top')));

  // Same direction exits need U-shape
  if (startAnchor === endAnchor) {
    return 'u-shape';
  }

  // Perpendicular anchors can use direct L-shape
  if (isHorizontal(startAnchor) !== isHorizontal(endAnchor)) {
    return 'direct';
  }

  // Opposite directions on same axis use Z-shape
  return 'z-shape';
}

function simplifyPath(points: Point[]): Point[] {
  // Remove redundant points on same line
  const simplified: Point[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = simplified[simplified.length - 1];
    const curr = points[i];
    const next = points[i + 1];

    // Skip if curr is on line between prev and next
    const onHorizontalLine = prev.y === curr.y && curr.y === next.y;
    const onVerticalLine = prev.x === curr.x && curr.x === next.x;

    if (!onHorizontalLine && !onVerticalLine) {
      simplified.push(curr);
    }
  }

  simplified.push(points[points.length - 1]);
  return simplified;
}

/**
 * Generate SVG path for orthogonal route
 */
export function orthogonalToSVGPath(points: Point[]): string {
  if (points.length < 2) return '';

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }

  return path;
}
```

### Curved Connection Component

```typescript
// components/canvas/connections/CurvedConnection.tsx
import React, { useMemo } from 'react';
import { Connection, Point } from '../../../types';
import { calculateAutoControlPoints, bezierToSVGPath, bezierWithWaypoints } from '../../../utils/bezierUtils';
import { ConnectionLabel } from './ConnectionLabel';
import { ConnectionControlPoints } from './ConnectionControlPoints';

interface CurvedConnectionProps {
  connection: Connection;
  startPoint: Point;
  endPoint: Point;
  startAnchor: AnchorPosition;
  endAnchor: AnchorPosition;
  isSelected: boolean;
  onControlPointDrag?: (cpIndex: number, point: Point) => void;
}

export const CurvedConnection: React.FC<CurvedConnectionProps> = ({
  connection,
  startPoint,
  endPoint,
  startAnchor,
  endAnchor,
  isSelected,
  onControlPointDrag,
}) => {
  const { cp1, cp2 } = useMemo(() => {
    if (connection.controlPoints) {
      return connection.controlPoints;
    }
    return calculateAutoControlPoints(startPoint, startAnchor, endPoint, endAnchor);
  }, [startPoint, startAnchor, endPoint, endAnchor, connection.controlPoints]);

  const pathData = useMemo(() => {
    if (connection.waypoints?.length > 0) {
      return bezierWithWaypoints(
        startPoint,
        startAnchor,
        endPoint,
        endAnchor,
        connection.waypoints.map(w => w.point)
      );
    }
    return bezierToSVGPath({ start: startPoint, cp1, cp2, end: endPoint });
  }, [startPoint, endPoint, cp1, cp2, connection.waypoints]);

  return (
    <g className="curved-connection">
      {/* Hit area for selection */}
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth={12}
        fill="none"
        className="cursor-pointer"
      />

      {/* Visible path */}
      <path
        d={pathData}
        stroke={connection.stroke || '#000'}
        strokeWidth={connection.strokeWidth || 2}
        strokeDasharray={connection.strokeDasharray}
        fill="none"
        markerEnd={connection.endArrow !== 'none' ? `url(#arrow-${connection.endArrow})` : undefined}
        markerStart={connection.startArrow !== 'none' ? `url(#arrow-${connection.startArrow})` : undefined}
      />

      {/* Selection highlight */}
      {isSelected && (
        <path
          d={pathData}
          stroke="#3B82F6"
          strokeWidth={connection.strokeWidth + 2 || 4}
          fill="none"
          opacity={0.3}
        />
      )}

      {/* Control points when selected */}
      {isSelected && (
        <ConnectionControlPoints
          start={startPoint}
          end={endPoint}
          cp1={cp1}
          cp2={cp2}
          onDrag={onControlPointDrag}
        />
      )}

      {/* Label */}
      {connection.label && (
        <ConnectionLabel
          label={connection.label}
          pathData={pathData}
          connectionId={connection.id}
        />
      )}
    </g>
  );
};
```

### Layers Panel Component

```typescript
// components/panels/LayersPanel.tsx
import React from 'react';
import { useLayerStore } from '../../stores/layerStore';
import { useDiagramStore } from '../../stores/diagramStore';
import { LayerItem } from './LayerItem';
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2 } from 'lucide-react';

export const LayersPanel: React.FC = () => {
  const {
    layers,
    layerOrder,
    activeLayerId,
    addLayer,
    deleteLayer,
    setActiveLayer,
    reorderLayers,
  } = useLayerStore();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newOrder = Array.from(layerOrder);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);

    reorderLayers(newOrder);
  };

  return (
    <div className="layers-panel w-64 border-l bg-white flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b flex items-center justify-between">
        <span className="font-medium text-sm">Layers</span>
        <button
          onClick={() => addLayer()}
          className="p-1 hover:bg-gray-100 rounded"
          title="Add Layer"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Layer List - reversed for visual order (top layer first) */}
      <div className="flex-1 overflow-y-auto">
        {[...layerOrder].reverse().map((layerId, index) => {
          const layer = layers[layerId];
          if (!layer) return null;

          return (
            <LayerItem
              key={layer.id}
              layer={layer}
              isActive={layer.id === activeLayerId}
              onSelect={() => setActiveLayer(layer.id)}
              onDelete={layerOrder.length > 1 ? () => deleteLayer(layer.id) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
};

// LayerItem.tsx
interface LayerItemProps {
  layer: Layer;
  isActive: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}

export const LayerItem: React.FC<LayerItemProps> = ({
  layer,
  isActive,
  onSelect,
  onDelete,
}) => {
  const { setLayerVisibility, setLayerLocked, renameLayer } = useLayerStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(layer.name);

  const handleNameSubmit = () => {
    renameLayer(layer.id, editName);
    setIsEditing(false);
  };

  return (
    <div
      className={`
        flex items-center px-3 py-2 border-b cursor-pointer
        ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}
      `}
      onClick={onSelect}
    >
      {/* Visibility toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setLayerVisibility(layer.id, !layer.visible);
        }}
        className="p-1 hover:bg-gray-200 rounded mr-1"
      >
        {layer.visible ? <Eye size={14} /> : <EyeOff size={14} className="text-gray-400" />}
      </button>

      {/* Lock toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setLayerLocked(layer.id, !layer.locked);
        }}
        className="p-1 hover:bg-gray-200 rounded mr-2"
      >
        {layer.locked ? <Lock size={14} /> : <Unlock size={14} className="text-gray-400" />}
      </button>

      {/* Name */}
      {isEditing ? (
        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleNameSubmit}
          onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
          className="flex-1 px-1 border rounded text-sm"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="flex-1 text-sm truncate"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          {layer.name}
        </span>
      )}

      {/* Delete */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-gray-200 rounded ml-1 opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};
```

### Shape-Level Connection Targeting

```typescript
// utils/anchorSelection.ts

import type { Point } from '../types/common';
import type { Shape } from '../types/shapes';
import type { AnchorPosition } from '../types/connections';

interface AnchorCandidate {
  anchor: AnchorPosition;
  point: Point;
  score: number;
}

/**
 * Calculate the best anchor point on a target shape based on:
 * 1. Distance from the drag point to each anchor
 * 2. Approach direction (prefer anchors facing the source)
 * 3. Connection cleanliness (avoid crossovers)
 */
export function calculateBestAnchor(
  targetShape: Shape,
  dragPoint: Point,
  sourcePoint: Point,
  sourceAnchor?: AnchorPosition
): { anchor: AnchorPosition; point: Point } {
  const anchors = getAllAnchors(targetShape);

  // Score each anchor
  const candidates: AnchorCandidate[] = anchors.map(({ anchor, point }) => {
    let score = 0;

    // Factor 1: Distance to drag point (closer = better, max 50 points)
    const distanceToDrag = Math.hypot(point.x - dragPoint.x, point.y - dragPoint.y);
    const maxDistance = Math.max(targetShape.width, targetShape.height);
    score += 50 * (1 - Math.min(distanceToDrag / maxDistance, 1));

    // Factor 2: Approach direction (anchor facing source = better, max 30 points)
    const approachAngle = Math.atan2(
      sourcePoint.y - point.y,
      sourcePoint.x - point.x
    );
    const anchorDirection = getAnchorDirection(anchor);
    const angleDiff = Math.abs(normalizeAngle(approachAngle - anchorDirection));
    score += 30 * (1 - angleDiff / Math.PI);

    // Factor 3: Opposite anchor bonus (if source is 'right', prefer 'left', max 20 points)
    if (sourceAnchor && isOppositeAnchor(sourceAnchor, anchor)) {
      score += 20;
    }

    return { anchor, point, score };
  });

  // Sort by score (highest first) and return best
  candidates.sort((a, b) => b.score - a.score);
  return { anchor: candidates[0].anchor, point: candidates[0].point };
}

function getAnchorDirection(anchor: AnchorPosition): number {
  switch (anchor) {
    case 'top': return -Math.PI / 2;    // Points up
    case 'bottom': return Math.PI / 2;  // Points down
    case 'left': return Math.PI;        // Points left
    case 'right': return 0;             // Points right
  }
}

function isOppositeAnchor(a: AnchorPosition, b: AnchorPosition): boolean {
  return (
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left') ||
    (a === 'top' && b === 'bottom') ||
    (a === 'bottom' && b === 'top')
  );
}

function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return Math.abs(angle);
}

/**
 * Check if a point is inside a shape's bounds (for shape-level hit testing)
 */
export function isPointInShape(point: Point, shape: Shape): boolean {
  // Simple bounding box check (rotation handled separately if needed)
  return (
    point.x >= shape.x &&
    point.x <= shape.x + shape.width &&
    point.y >= shape.y &&
    point.y <= shape.y + shape.height
  );
}

/**
 * Find which shape (if any) contains a point
 */
export function findShapeAtPoint(
  point: Point,
  shapes: Shape[]
): Shape | null {
  // Check in reverse order (top-most first)
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (isPointInShape(point, shapes[i])) {
      return shapes[i];
    }
  }
  return null;
}
```

### Updated Connection Creation Hook with Shape-Level Targeting

```typescript
// hooks/useConnectionCreation.ts (updated)

import { calculateBestAnchor, findShapeAtPoint, isPointInShape } from '../utils/anchorSelection';
import { findNearestAnchor } from '../lib/geometry/connection';

const ANCHOR_SNAP_THRESHOLD = 25; // px - snap to specific anchor if within this distance

export function useConnectionCreation({ containerRef }: UseConnectionCreationProps) {
  // ... existing state ...

  // New: Track hovered shape during connection creation
  const [hoveredTargetShape, setHoveredTargetShape] = useState<Shape | null>(null);
  const [predictedAnchor, setPredictedAnchor] = useState<AnchorPosition | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!connectionCreationState) return;

    const canvasPoint = screenToCanvas(e.clientX, e.clientY);
    updateConnectionCreation(canvasPoint);

    // Find shape under cursor (excluding source shape)
    const shapesArray = Object.values(shapes).filter(
      s => s.id !== connectionCreationState.sourceShapeId
    );
    const targetShape = findShapeAtPoint(canvasPoint, shapesArray);

    setHoveredTargetShape(targetShape);

    if (targetShape) {
      // Check if close to a specific anchor (snap mode)
      const nearestAnchor = findNearestAnchor(targetShape, canvasPoint, ANCHOR_SNAP_THRESHOLD);

      if (nearestAnchor) {
        // Snap to specific anchor
        setPredictedAnchor(nearestAnchor.anchor);
      } else {
        // Calculate best anchor based on approach
        const best = calculateBestAnchor(
          targetShape,
          canvasPoint,
          connectionCreationState.sourcePoint,
          connectionCreationState.sourceAnchor
        );
        setPredictedAnchor(best.anchor);
      }
    } else {
      setPredictedAnchor(null);
    }
  }, [connectionCreationState, shapes, screenToCanvas, updateConnectionCreation]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!connectionCreationState) return;

    const canvasPoint = screenToCanvas(e.clientX, e.clientY);

    // Find target shape
    const shapesArray = Object.values(shapes).filter(
      s => s.id !== connectionCreationState.sourceShapeId
    );
    const targetShape = findShapeAtPoint(canvasPoint, shapesArray);

    if (targetShape) {
      // Check for snap to specific anchor first
      const nearestAnchor = findNearestAnchor(targetShape, canvasPoint, ANCHOR_SNAP_THRESHOLD);

      let targetAnchor: AnchorPosition;
      if (nearestAnchor) {
        // Use snapped anchor
        targetAnchor = nearestAnchor.anchor;
      } else {
        // Auto-select best anchor
        const best = calculateBestAnchor(
          targetShape,
          canvasPoint,
          connectionCreationState.sourcePoint,
          connectionCreationState.sourceAnchor
        );
        targetAnchor = best.anchor;
      }

      // Create connection
      addConnection({
        sourceShapeId: connectionCreationState.sourceShapeId,
        sourceAnchor: connectionCreationState.sourceAnchor,
        targetShapeId: targetShape.id,
        targetAnchor,
      });
    }

    // Clean up
    setHoveredTargetShape(null);
    setPredictedAnchor(null);
    endConnectionCreation();
  }, [connectionCreationState, shapes, screenToCanvas, addConnection, endConnectionCreation]);

  return {
    handleAnchorMouseDown,
    isCreatingConnection: connectionCreationState !== null,
    // New exports for UI feedback
    hoveredTargetShape,
    predictedAnchor,
  };
}
```

### Shape Highlight Component

```typescript
// components/connections/ShapeConnectionHighlight.tsx

interface ShapeConnectionHighlightProps {
  shape: Shape;
  predictedAnchor: AnchorPosition | null;
}

export const ShapeConnectionHighlight: React.FC<ShapeConnectionHighlightProps> = ({
  shape,
  predictedAnchor,
}) => {
  const anchors = getAllAnchors(shape);

  return (
    <g className="shape-connection-highlight">
      {/* Shape highlight border */}
      <rect
        x={shape.x - 2}
        y={shape.y - 2}
        width={shape.width + 4}
        height={shape.height + 4}
        fill="none"
        stroke="#3B82F6"
        strokeWidth={2}
        strokeDasharray="4 2"
        rx={4}
        opacity={0.8}
      />

      {/* All anchors (dimmed) */}
      {anchors.map(({ anchor, point }) => (
        <circle
          key={anchor}
          cx={point.x}
          cy={point.y}
          r={anchor === predictedAnchor ? 6 : 4}
          fill={anchor === predictedAnchor ? '#3B82F6' : 'white'}
          stroke="#3B82F6"
          strokeWidth={anchor === predictedAnchor ? 2 : 1}
          opacity={anchor === predictedAnchor ? 1 : 0.5}
        />
      ))}

      {/* Predicted anchor emphasis */}
      {predictedAnchor && (
        <circle
          cx={anchors.find(a => a.anchor === predictedAnchor)?.point.x}
          cy={anchors.find(a => a.anchor === predictedAnchor)?.point.y}
          r={10}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2}
          opacity={0.3}
        />
      )}
    </g>
  );
};
```

### Enhanced Snap Feedback (Magnetic Pull Effect)

For improved UX, the connection preview line can show a "magnetic pull" effect when approaching an anchor:

```typescript
// In useConnectionCreation hook - enhanced preview line calculation

interface ConnectionPreview {
  endPoint: Point;        // Actual cursor position or snapped anchor
  isSnapping: boolean;    // True when snapped to anchor
  snapStrength: number;   // 0-1, for animation interpolation
}

function calculatePreviewEndpoint(
  cursorPoint: Point,
  targetShape: Shape | null,
  predictedAnchor: AnchorPosition | null
): ConnectionPreview {
  if (!targetShape || !predictedAnchor) {
    return { endPoint: cursorPoint, isSnapping: false, snapStrength: 0 };
  }

  const anchorPoint = getAnchorPosition(targetShape, predictedAnchor);
  const distanceToAnchor = Math.hypot(
    cursorPoint.x - anchorPoint.x,
    cursorPoint.y - anchorPoint.y
  );

  const SNAP_RADIUS = 40;      // Start pulling at this distance
  const HARD_SNAP_RADIUS = 15; // Full snap at this distance

  if (distanceToAnchor <= HARD_SNAP_RADIUS) {
    // Hard snap - line goes directly to anchor
    return { endPoint: anchorPoint, isSnapping: true, snapStrength: 1 };
  }

  if (distanceToAnchor <= SNAP_RADIUS) {
    // Magnetic pull - interpolate between cursor and anchor
    const t = 1 - (distanceToAnchor - HARD_SNAP_RADIUS) / (SNAP_RADIUS - HARD_SNAP_RADIUS);
    const pullStrength = easeOutCubic(t); // Smooth easing

    return {
      endPoint: {
        x: cursorPoint.x + (anchorPoint.x - cursorPoint.x) * pullStrength,
        y: cursorPoint.y + (anchorPoint.y - cursorPoint.y) * pullStrength,
      },
      isSnapping: true,
      snapStrength: pullStrength,
    };
  }

  // No snap - follow cursor
  return { endPoint: cursorPoint, isSnapping: false, snapStrength: 0 };
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
```

This creates a smooth "magnetic" feel where the connection line gradually pulls toward the predicted anchor as the cursor approaches, providing clear visual feedback before committing to the connection.

### Group-Aware Selection Hook

```typescript
// hooks/useGroupAwareSelection.ts
import { useCallback } from 'react';
import { useSelectionStore } from '../stores/selectionStore';
import { useGroupStore } from '../stores/groupStore';
import { useDiagramStore } from '../stores/diagramStore';

export function useGroupAwareSelection() {
  const { selectShape, addToSelection, clearSelection, selectedIds } = useSelectionStore();
  const { groups, editingGroupId, getTopLevelGroupForShape } = useGroupStore();
  const { shapes } = useDiagramStore();

  const handleShapeClick = useCallback((
    shapeId: string,
    event: React.MouseEvent
  ) => {
    const isShiftClick = event.shiftKey || event.ctrlKey;

    // If in group edit mode, select individual shapes
    if (editingGroupId) {
      const group = groups[editingGroupId];
      if (group?.memberIds.includes(shapeId)) {
        if (isShiftClick) {
          addToSelection([shapeId]);
        } else {
          selectShape(shapeId);
        }
        return;
      }
      // Clicked outside editing group - exit edit mode
      return;
    }

    // Not in edit mode - select entire group
    const topGroup = getTopLevelGroupForShape(shapeId);

    if (topGroup) {
      // Select all shapes in the group
      const groupShapeIds = topGroup.memberIds;
      if (isShiftClick) {
        addToSelection(groupShapeIds);
      } else {
        clearSelection();
        addToSelection(groupShapeIds);
      }
    } else {
      // No group - normal selection
      if (isShiftClick) {
        addToSelection([shapeId]);
      } else {
        selectShape(shapeId);
      }
    }
  }, [editingGroupId, groups, getTopLevelGroupForShape, selectShape, addToSelection, clearSelection]);

  const handleGroupDoubleClick = useCallback((shapeId: string) => {
    const group = getTopLevelGroupForShape(shapeId);
    if (group) {
      useGroupStore.getState().enterGroupEdit(group.id);
    }
  }, [getTopLevelGroupForShape]);

  return {
    handleShapeClick,
    handleGroupDoubleClick,
    isInGroupEditMode: !!editingGroupId,
    editingGroupId,
  };
}
```

---

## Key Decisions

### Decision 1: Group Storage Model

**Options:**
1. Groups as separate entities referencing shapes (groupId on shapes)
2. Groups as container shapes with children array
3. Flattened with virtual group calculation

**Decision:** Groups as separate entities with `groupId` reference on shapes

**Rationale:**
- Simpler shape data structure
- Easier to ungroup (just clear groupId)
- Groups can be calculated/managed independently
- Better for serialization

### Decision 2: Layer Rendering Order

**Options:**
1. Render layers bottom-to-top in order, shapes within layer by z-index
2. Global z-index ignoring layers
3. Layers override individual z-index completely

**Decision:** Layers take precedence, shapes within layer sorted by z-index

**Rationale:**
- Matches user expectation (layers are like Photoshop layers)
- Allows fine-grained control within layers
- Clear mental model

### Decision 3: Orthogonal Routing Algorithm

**Options:**
1. Simple L/Z-shape routing
2. A* pathfinding avoiding obstacles
3. Visibility graph routing

**Decision:** Simple L/Z/U-shape routing (no obstacle avoidance)

**Rationale:**
- Fast to compute
- Predictable results
- Waypoints allow manual adjustment
- Full obstacle avoidance is complex and often produces unexpected results
- Can be enhanced in future phases

### Decision 4: Connection Style Storage

**Options:**
1. Style per connection
2. Global default with per-connection override
3. Style templates

**Decision:** Style per connection with app defaults

**Rationale:**
- Maximum flexibility
- Simple to implement
- Users expect per-connection control

---

## Testing Approach

### Unit Tests

```typescript
// __tests__/bezierUtils.test.ts
describe('bezierUtils', () => {
  it('should calculate control points for right-to-left connection', () => {
    const start = { x: 100, y: 100 };
    const end = { x: 300, y: 200 };
    const { cp1, cp2 } = calculateAutoControlPoints(start, 'right', end, 'left');

    expect(cp1.x).toBeGreaterThan(start.x);
    expect(cp1.y).toBe(start.y);
    expect(cp2.x).toBeLessThan(end.x);
    expect(cp2.y).toBe(end.y);
  });

  it('should get point on bezier at t=0.5', () => {
    const curve = {
      start: { x: 0, y: 0 },
      cp1: { x: 50, y: 0 },
      cp2: { x: 50, y: 100 },
      end: { x: 100, y: 100 },
    };
    const point = getPointOnBezier(curve, 0.5);
    expect(point.x).toBeCloseTo(50);
    expect(point.y).toBeCloseTo(50);
  });
});

// __tests__/orthogonalRouting.test.ts
describe('orthogonalRouting', () => {
  it('should create L-shape for perpendicular anchors', () => {
    const points = calculateOrthogonalPath(
      { x: 100, y: 100 }, 'right',
      { x: 200, y: 200 }, 'top'
    );

    // Should be: start -> exit -> turn -> entry -> end
    expect(points.length).toBeGreaterThanOrEqual(3);
    // All segments should be horizontal or vertical
    for (let i = 1; i < points.length; i++) {
      const isHorizontal = points[i].y === points[i - 1].y;
      const isVertical = points[i].x === points[i - 1].x;
      expect(isHorizontal || isVertical).toBe(true);
    }
  });
});

// __tests__/groupStore.test.ts
describe('groupStore', () => {
  beforeEach(() => {
    useGroupStore.getState().groups = {};
    useGroupStore.getState().editingGroupId = null;
  });

  it('should create group with member ids', () => {
    const groupId = useGroupStore.getState().createGroup(['shape1', 'shape2']);
    expect(groupId).toBeTruthy();

    const group = useGroupStore.getState().groups[groupId!];
    expect(group.memberIds).toEqual(['shape1', 'shape2']);
  });

  it('should not create group with single shape', () => {
    const groupId = useGroupStore.getState().createGroup(['shape1']);
    expect(groupId).toBeNull();
  });
});
```

### E2E Tests

```typescript
// e2e/groups.spec.ts
describe('Groups', () => {
  beforeEach(() => {
    createShapes(['shapeA', 'shapeB', 'shapeC']);
  });

  it('should group selected shapes', () => {
    cy.selectShapes(['shapeA', 'shapeB']);
    cy.get('body').type('{ctrl}g');

    // Click one shape, verify both selected
    cy.get('[data-shape-id="shapeA"]').click();
    cy.get('[data-shape-id="shapeA"]').should('have.class', 'selected');
    cy.get('[data-shape-id="shapeB"]').should('have.class', 'selected');
  });

  it('should enter group edit mode on double-click', () => {
    cy.selectShapes(['shapeA', 'shapeB']);
    cy.get('body').type('{ctrl}g');

    cy.get('[data-shape-id="shapeA"]').dblclick();

    // Should be in edit mode - can select individual shape
    cy.get('[data-shape-id="shapeA"]').click();
    cy.get('[data-shape-id="shapeA"]').should('have.class', 'selected');
    cy.get('[data-shape-id="shapeB"]').should('not.have.class', 'selected');
  });
});

// e2e/layers.spec.ts
describe('Layers', () => {
  it('should toggle layer visibility', () => {
    createShapeOnLayer('shape1', 'layer1');

    // Hide layer
    cy.get('[data-layer-id="layer1"] [data-testid="visibility-toggle"]').click();
    cy.get('[data-shape-id="shape1"]').should('not.be.visible');

    // Show layer
    cy.get('[data-layer-id="layer1"] [data-testid="visibility-toggle"]').click();
    cy.get('[data-shape-id="shape1"]').should('be.visible');
  });

  it('should prevent selection on locked layer', () => {
    createShapeOnLayer('shape1', 'layer1');

    // Lock layer
    cy.get('[data-layer-id="layer1"] [data-testid="lock-toggle"]').click();

    // Try to select shape
    cy.get('[data-shape-id="shape1"]').click();
    cy.get('[data-shape-id="shape1"]').should('not.have.class', 'selected');
  });
});

// e2e/connections.spec.ts
describe('Advanced Connections', () => {
  it('should create curved connection', () => {
    createShapes(['shapeA', 'shapeB']);
    setConnectionStyle('curved');

    cy.connectShapes('shapeA', 'right', 'shapeB', 'left');

    cy.get('[data-testid="connection"]')
      .find('path')
      .should('have.attr', 'd')
      .and('match', /C /); // Contains curve command
  });

  it('should add waypoint to connection', () => {
    createConnection();
    cy.get('[data-testid="connection"]').click();
    cy.get('[data-testid="connection"]').dblclick(150, 150);

    cy.get('[data-testid="waypoint"]').should('exist');
  });
});
```

---

## Performance Considerations

### Layer Rendering Optimization

```typescript
// Memoize layer shapes to avoid recalculation
const useLayerShapes = (layerId: string) => {
  const shapes = useDiagramStore((state) => state.shapes);

  return useMemo(() => {
    return Object.values(shapes)
      .filter((s) => s.layerId === layerId)
      .sort((a, b) => a.zIndex - b.zIndex);
  }, [shapes, layerId]);
};

// Only re-render affected layers
const LayerRenderer = React.memo<{ layerId: string }>(({ layerId }) => {
  const layerShapes = useLayerShapes(layerId);
  // ...
});
```

### Connection Path Caching

```typescript
// Cache computed paths
const connectionPathCache = new Map<string, string>();

function getCachedPath(connection: Connection, start: Point, end: Point): string {
  const key = `${connection.id}-${start.x}-${start.y}-${end.x}-${end.y}-${connection.style}`;

  if (connectionPathCache.has(key)) {
    return connectionPathCache.get(key)!;
  }

  const path = calculatePath(connection, start, end);
  connectionPathCache.set(key, path);

  // Limit cache size
  if (connectionPathCache.size > 500) {
    const firstKey = connectionPathCache.keys().next().value;
    connectionPathCache.delete(firstKey);
  }

  return path;
}
```

### Group Bounds Caching

```typescript
// Cache and invalidate group bounds
function getGroupBounds(group: Group, shapes: Record<string, Shape>): Bounds {
  // Check if cached bounds still valid
  if (group.bounds && !isGroupBoundsStale(group, shapes)) {
    return group.bounds;
  }

  const memberShapes = group.memberIds
    .map((id) => shapes[id])
    .filter(Boolean);

  const bounds = calculateBoundingBox(memberShapes);

  // Update cache
  group.bounds = bounds;

  return bounds;
}
```

---

## Accessibility Requirements

### Layers Panel

- Keyboard navigation through layer list
- Screen reader announces layer name, visibility, lock status
- Focus trap within panel when open

### Groups

- Announce "Entered group edit mode" / "Exited group edit mode"
- Group selection announced with member count

### Connections

- Connection type (straight/curved/orthogonal) announced
- Waypoint manipulation keyboard accessible

```tsx
// Accessible layer item
<div
  role="listitem"
  aria-selected={isActive}
  aria-label={`Layer ${layer.name}, ${layer.visible ? 'visible' : 'hidden'}, ${layer.locked ? 'locked' : 'unlocked'}`}
>
  ...
</div>

// Group mode announcement
useEffect(() => {
  if (editingGroupId) {
    announceToScreenReader(`Editing group with ${memberCount} shapes`);
  }
}, [editingGroupId]);
```

---

## Migration Notes

### Shape Type Extension

```typescript
// Before (P7)
interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  // ...
}

// After (P8)
interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  layerId: string;     // Required - default to first layer
  groupId?: string;    // Optional - undefined if not grouped
  // ...
}
```

### Connection Type Extension

```typescript
// Before (P5-P7)
interface Connection {
  id: string;
  sourceShapeId: string;
  targetShapeId: string;
  sourceAnchor: AnchorPosition;
  targetAnchor: AnchorPosition;
  stroke: string;
  strokeWidth: number;
  startArrow: ArrowStyle;
  endArrow: ArrowStyle;
}

// After (P8)
interface Connection {
  // ... existing fields ...
  style: ConnectionStyle;      // 'straight' | 'curved' | 'orthogonal'
  waypoints: ConnectionWaypoint[];
  label?: ConnectionLabel;
  controlPoints?: { source: Point; target: Point };
  sourceAttached: boolean;     // For disconnect feature
  targetAttached: boolean;
}
```

### Migration Script

```typescript
function migrateToP8(data: DiagramData): DiagramData {
  // Add default layer if not present
  const defaultLayerId = data.layers?.[0]?.id || 'default';

  // Migrate shapes
  const shapes = Object.fromEntries(
    Object.entries(data.shapes).map(([id, shape]) => [
      id,
      {
        ...shape,
        layerId: shape.layerId || defaultLayerId,
      },
    ])
  );

  // Migrate connections
  const connections = Object.fromEntries(
    Object.entries(data.connections).map(([id, conn]) => [
      id,
      {
        ...conn,
        style: conn.style || 'straight',
        waypoints: conn.waypoints || [],
        sourceAttached: true,
        targetAttached: true,
      },
    ])
  );

  return {
    ...data,
    shapes,
    connections,
    layers: data.layers || [{ id: defaultLayerId, name: 'Layer 1', visible: true, locked: false, opacity: 1, createdAt: Date.now() }],
    groups: data.groups || {},
  };
}
```
