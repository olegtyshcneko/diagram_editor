# Phase 5: Text & Basic Connections - Technical Specification

## Document Information

| Field | Value |
|-------|-------|
| Phase | 5 |
| Status | Draft |
| Dependencies | Phase 0-4 |
| Estimated Files | 15-20 new/modified |

---

## Technical Architecture

### Component Hierarchy

```
Canvas.tsx
├── ShapeLayer.tsx
│   ├── RectangleShape.tsx (with text)
│   └── EllipseShape.tsx (with text)
├── ConnectionLayer.tsx (new)
│   └── Connection.tsx (new)
├── AnchorPointsLayer.tsx (new)
├── TextEditOverlay.tsx (new)
└── SelectionLayer.tsx
```

### State Management

**Diagram Store Extensions:**
```typescript
interface DiagramState {
  shapes: Record<string, Shape>;
  connections: Record<string, Connection>; // New
  selectedShapeIds: string[];
  selectedConnectionIds: string[]; // New

  // New actions
  addConnection: (connection: Partial<Connection>) => string;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  deleteConnection: (id: string) => void;
  setSelectedConnectionIds: (ids: string[]) => void;
  deleteSelectedConnections: () => void;
}
```

**UI Store Extensions:**
```typescript
interface UIState {
  // Text editing
  editingTextShapeId: string | null;
  setEditingTextShapeId: (id: string | null) => void;

  // Connection creation
  connectionCreationState: ConnectionCreationState | null;
  startConnectionCreation: (sourceShapeId: string, anchor: AnchorPosition) => void;
  endConnectionCreation: () => void;
}
```

---

## Files to Create

### New Files

| File Path | Purpose |
|-----------|---------|
| `src/types/connection.ts` | Connection interface and types |
| `src/components/canvas/ConnectionLayer.tsx` | Render all connections |
| `src/components/canvas/Connection.tsx` | Single connection component |
| `src/components/canvas/AnchorPointsLayer.tsx` | Show anchors on hover |
| `src/components/canvas/AnchorPoint.tsx` | Individual anchor point |
| `src/components/canvas/TextEditOverlay.tsx` | Text editing input |
| `src/components/canvas/ShapeText.tsx` | Text rendering inside shapes |
| `src/components/panels/sections/TextSection.tsx` | Text styling controls |
| `src/components/panels/sections/ConnectionSection.tsx` | Connection styling controls |
| `src/hooks/useTextEditing.ts` | Text editing logic |
| `src/hooks/useConnectionCreation.ts` | Connection creation logic |
| `src/hooks/useConnectionSelection.ts` | Connection hit testing |
| `src/lib/connection-utils.ts` | Connection geometry calculations |
| `src/lib/text-utils.ts` | Text measurement and wrapping |

### Modified Files

| File Path | Changes |
|-----------|---------|
| `src/types/shape.ts` | Add text and textStyle properties |
| `src/stores/diagramStore.ts` | Add connections state and actions |
| `src/stores/uiStore.ts` | Add text editing and connection states |
| `src/components/canvas/Canvas.tsx` | Add new layers |
| `src/components/shapes/RectangleShape.tsx` | Render text |
| `src/components/shapes/EllipseShape.tsx` | Render text |
| `src/components/panels/PropertyPanel.tsx` | Add text and connection sections |
| `src/components/toolbar/Toolbar.tsx` | Add connection tool |

---

## Key Interfaces & Types

### Text Types

```typescript
// src/types/shape.ts (additions)

export type TextAlign = 'left' | 'center' | 'right';
export type VerticalAlign = 'top' | 'middle' | 'bottom';

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  color: string;
  align: TextAlign;
  verticalAlign: VerticalAlign;
}

export interface Shape {
  // ... existing properties

  // Text properties
  text?: string;
  textStyle: TextStyle;
}

export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Arial',
  fontSize: 14,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  color: '#000000',
  align: 'center',
  verticalAlign: 'middle',
};
```

### Connection Types

```typescript
// src/types/connection.ts

export type AnchorPosition = 'top' | 'right' | 'bottom' | 'left';

export type ArrowStyle = 'none' | 'arrow' | 'openArrow';

export interface Connection {
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

export const DEFAULT_CONNECTION: Omit<Connection, 'id' | 'sourceShapeId' | 'targetShapeId' | 'sourceAnchor' | 'targetAnchor'> = {
  stroke: '#000000',
  strokeWidth: 2,
  startArrow: 'none',
  endArrow: 'arrow',
};

export interface ConnectionCreationState {
  sourceShapeId: string;
  sourceAnchor: AnchorPosition;
  currentPoint: Point; // Current cursor position
}
```

---

## Implementation Order

### Step 1: Connection Types and Store

**File:** `src/types/connection.ts`
(As shown above)

**File:** `src/stores/diagramStore.ts` (additions)

```typescript
import { Connection, DEFAULT_CONNECTION } from '@/types/connection';
import { generateId } from '@/lib/utils';

interface DiagramState {
  shapes: Record<string, Shape>;
  connections: Record<string, Connection>;
  selectedShapeIds: string[];
  selectedConnectionIds: string[];

  // Connection actions
  addConnection: (conn: Partial<Connection>) => string;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  deleteConnection: (id: string) => void;
  setSelectedConnectionIds: (ids: string[]) => void;
  deleteSelectedConnections: () => void;
  clearSelection: () => void;
}

export const useDiagramStore = create<DiagramState>()((set, get) => ({
  shapes: {},
  connections: {},
  selectedShapeIds: [],
  selectedConnectionIds: [],

  // ... existing shape actions

  addConnection: (partialConn) => {
    const id = generateId('conn');
    const connection: Connection = {
      id,
      sourceShapeId: partialConn.sourceShapeId!,
      targetShapeId: partialConn.targetShapeId!,
      sourceAnchor: partialConn.sourceAnchor!,
      targetAnchor: partialConn.targetAnchor!,
      ...DEFAULT_CONNECTION,
      ...partialConn,
    };

    set((state) => ({
      connections: { ...state.connections, [id]: connection },
      selectedShapeIds: [],
      selectedConnectionIds: [id],
    }));

    return id;
  },

  updateConnection: (id, updates) => set((state) => {
    const conn = state.connections[id];
    if (!conn) return state;

    return {
      connections: {
        ...state.connections,
        [id]: { ...conn, ...updates },
      },
    };
  }),

  deleteConnection: (id) => set((state) => {
    const { [id]: _, ...remaining } = state.connections;
    return {
      connections: remaining,
      selectedConnectionIds: state.selectedConnectionIds.filter((cid) => cid !== id),
    };
  }),

  setSelectedConnectionIds: (ids) => set({
    selectedConnectionIds: ids,
    selectedShapeIds: [], // Deselect shapes when selecting connections
  }),

  deleteSelectedConnections: () => set((state) => {
    const { connections, selectedConnectionIds } = state;
    const newConnections = { ...connections };
    selectedConnectionIds.forEach((id) => delete newConnections[id]);

    return {
      connections: newConnections,
      selectedConnectionIds: [],
    };
  }),

  clearSelection: () => set({
    selectedShapeIds: [],
    selectedConnectionIds: [],
  }),
}));
```

### Step 2: Connection Utility Functions

**File:** `src/lib/connection-utils.ts`

```typescript
import { Point } from '@/types/common';
import { Shape } from '@/types/shape';
import { AnchorPosition, Connection } from '@/types/connection';

/**
 * Get the position of an anchor point on a shape
 */
export function getAnchorPosition(shape: Shape, anchor: AnchorPosition): Point {
  const cx = shape.x + shape.width / 2;
  const cy = shape.y + shape.height / 2;

  switch (anchor) {
    case 'top':
      return { x: cx, y: shape.y };
    case 'right':
      return { x: shape.x + shape.width, y: cy };
    case 'bottom':
      return { x: cx, y: shape.y + shape.height };
    case 'left':
      return { x: shape.x, y: cy };
  }
}

/**
 * Get all anchor positions for a shape
 */
export function getAllAnchors(shape: Shape): Array<{ position: AnchorPosition; point: Point }> {
  return [
    { position: 'top', point: getAnchorPosition(shape, 'top') },
    { position: 'right', point: getAnchorPosition(shape, 'right') },
    { position: 'bottom', point: getAnchorPosition(shape, 'bottom') },
    { position: 'left', point: getAnchorPosition(shape, 'left') },
  ];
}

/**
 * Find the nearest anchor to a point
 */
export function findNearestAnchor(
  shape: Shape,
  point: Point,
  threshold: number = 20
): { position: AnchorPosition; point: Point } | null {
  const anchors = getAllAnchors(shape);

  let nearest: { position: AnchorPosition; point: Point } | null = null;
  let minDistance = threshold;

  for (const anchor of anchors) {
    const distance = Math.hypot(
      anchor.point.x - point.x,
      anchor.point.y - point.y
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = anchor;
    }
  }

  return nearest;
}

/**
 * Calculate connection line endpoints
 */
export function getConnectionEndpoints(
  connection: Connection,
  shapes: Record<string, Shape>
): { start: Point; end: Point } | null {
  const sourceShape = shapes[connection.sourceShapeId];
  const targetShape = shapes[connection.targetShapeId];

  if (!sourceShape || !targetShape) return null;

  return {
    start: getAnchorPosition(sourceShape, connection.sourceAnchor),
    end: getAnchorPosition(targetShape, connection.targetAnchor),
  };
}

/**
 * Check if a point is near a line segment (for hit testing)
 */
export function isPointNearLine(
  point: Point,
  lineStart: Point,
  lineEnd: Point,
  threshold: number = 8
): boolean {
  // Calculate perpendicular distance from point to line
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    // Line is a point
    return Math.hypot(point.x - lineStart.x, point.y - lineStart.y) < threshold;
  }

  // Calculate projection factor
  const t = Math.max(0, Math.min(1,
    ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared
  ));

  // Find closest point on line
  const closestX = lineStart.x + t * dx;
  const closestY = lineStart.y + t * dy;

  // Calculate distance
  const distance = Math.hypot(point.x - closestX, point.y - closestY);
  return distance < threshold;
}

/**
 * Generate SVG path for arrow marker
 */
export function getArrowPath(style: 'arrow' | 'openArrow', size: number = 10): string {
  switch (style) {
    case 'arrow':
      return `M 0 0 L ${size} ${size / 2} L 0 ${size} Z`;
    case 'openArrow':
      return `M 0 0 L ${size} ${size / 2} L 0 ${size}`;
  }
}
```

### Step 3: Anchor Points Component

**File:** `src/components/canvas/AnchorPoint.tsx`

```typescript
import React from 'react';
import { Point } from '@/types/common';
import { AnchorPosition } from '@/types/connection';

interface AnchorPointProps {
  position: Point;
  anchor: AnchorPosition;
  isHighlighted?: boolean;
  onMouseDown?: (e: React.MouseEvent, anchor: AnchorPosition) => void;
}

const ANCHOR_SIZE = 8;

export function AnchorPoint({
  position,
  anchor,
  isHighlighted,
  onMouseDown,
}: AnchorPointProps) {
  return (
    <circle
      cx={position.x}
      cy={position.y}
      r={ANCHOR_SIZE / 2}
      fill={isHighlighted ? '#3B82F6' : 'white'}
      stroke="#3B82F6"
      strokeWidth={2}
      style={{ cursor: 'crosshair' }}
      onMouseDown={(e) => onMouseDown?.(e, anchor)}
    />
  );
}
```

**File:** `src/components/canvas/AnchorPointsLayer.tsx`

```typescript
import React, { useMemo } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';
import { AnchorPoint } from './AnchorPoint';
import { getAllAnchors } from '@/lib/connection-utils';
import { AnchorPosition } from '@/types/connection';

interface AnchorPointsLayerProps {
  hoveredShapeId: string | null;
  onAnchorMouseDown: (shapeId: string, anchor: AnchorPosition, e: React.MouseEvent) => void;
}

export function AnchorPointsLayer({
  hoveredShapeId,
  onAnchorMouseDown,
}: AnchorPointsLayerProps) {
  const shapes = useDiagramStore((s) => s.shapes);
  const activeTool = useUIStore((s) => s.activeTool);
  const connectionState = useUIStore((s) => s.connectionCreationState);

  // Only show anchors when connection tool is active
  if (activeTool !== 'connection') {
    return null;
  }

  const hoveredShape = hoveredShapeId ? shapes[hoveredShapeId] : null;

  return (
    <g className="anchor-points-layer">
      {/* Show anchors on hovered shape */}
      {hoveredShape && getAllAnchors(hoveredShape).map(({ position, point }) => (
        <AnchorPoint
          key={`${hoveredShapeId}-${position}`}
          position={point}
          anchor={position}
          isHighlighted={connectionState?.sourceAnchor === position}
          onMouseDown={(e, anchor) => onAnchorMouseDown(hoveredShapeId!, anchor, e)}
        />
      ))}

      {/* Show preview line during connection creation */}
      {connectionState && (
        <line
          x1={connectionState.sourcePoint.x}
          y1={connectionState.sourcePoint.y}
          x2={connectionState.currentPoint.x}
          y2={connectionState.currentPoint.y}
          stroke="#3B82F6"
          strokeWidth={2}
          strokeDasharray="4 4"
          pointerEvents="none"
        />
      )}
    </g>
  );
}
```

### Step 4: Connection Component

**File:** `src/components/canvas/Connection.tsx`

```typescript
import React, { useMemo } from 'react';
import { Connection as ConnectionType } from '@/types/connection';
import { Shape } from '@/types/shape';
import { getConnectionEndpoints, getArrowPath } from '@/lib/connection-utils';

interface ConnectionProps {
  connection: ConnectionType;
  shapes: Record<string, Shape>;
  isSelected: boolean;
  isHovered: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function Connection({
  connection,
  shapes,
  isSelected,
  isHovered,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}: ConnectionProps) {
  const endpoints = useMemo(
    () => getConnectionEndpoints(connection, shapes),
    [connection, shapes]
  );

  if (!endpoints) return null;

  const { start, end } = endpoints;
  const { stroke, strokeWidth, startArrow, endArrow, id } = connection;

  // Calculate angle for arrow rotation
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
  const startAngle = angle + 180; // Flip for start arrow

  const markerSize = Math.max(8, strokeWidth * 3);

  return (
    <g className="connection">
      {/* Arrow marker definitions */}
      <defs>
        {endArrow !== 'none' && (
          <marker
            id={`arrow-end-${id}`}
            markerWidth={markerSize}
            markerHeight={markerSize}
            refX={markerSize - 1}
            refY={markerSize / 2}
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path
              d={getArrowPath(endArrow, markerSize)}
              fill={endArrow === 'arrow' ? stroke : 'none'}
              stroke={stroke}
              strokeWidth={1}
            />
          </marker>
        )}
        {startArrow !== 'none' && (
          <marker
            id={`arrow-start-${id}`}
            markerWidth={markerSize}
            markerHeight={markerSize}
            refX={1}
            refY={markerSize / 2}
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <path
              d={getArrowPath(startArrow, markerSize)}
              fill={startArrow === 'arrow' ? stroke : 'none'}
              stroke={stroke}
              strokeWidth={1}
            />
          </marker>
        )}
      </defs>

      {/* Hit area (wider, invisible) */}
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="transparent"
        strokeWidth={Math.max(12, strokeWidth + 10)}
        style={{ cursor: 'pointer' }}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />

      {/* Visible line */}
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke={isSelected ? '#3B82F6' : isHovered ? '#60A5FA' : stroke}
        strokeWidth={isSelected ? strokeWidth + 1 : strokeWidth}
        markerEnd={endArrow !== 'none' ? `url(#arrow-end-${id})` : undefined}
        markerStart={startArrow !== 'none' ? `url(#arrow-start-${id})` : undefined}
        pointerEvents="none"
      />

      {/* Endpoint handles when selected */}
      {isSelected && (
        <>
          <circle cx={start.x} cy={start.y} r={4} fill="white" stroke="#3B82F6" strokeWidth={2} />
          <circle cx={end.x} cy={end.y} r={4} fill="white" stroke="#3B82F6" strokeWidth={2} />
        </>
      )}
    </g>
  );
}
```

### Step 5: Connection Layer

**File:** `src/components/canvas/ConnectionLayer.tsx`

```typescript
import React, { useState, useCallback } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { Connection } from './Connection';

export function ConnectionLayer() {
  const shapes = useDiagramStore((s) => s.shapes);
  const connections = useDiagramStore((s) => s.connections);
  const selectedConnectionIds = useDiagramStore((s) => s.selectedConnectionIds);
  const setSelectedConnectionIds = useDiagramStore((s) => s.setSelectedConnectionIds);

  const [hoveredConnectionId, setHoveredConnectionId] = useState<string | null>(null);

  const handleConnectionMouseDown = useCallback((connectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedConnectionIds([connectionId]);
  }, [setSelectedConnectionIds]);

  return (
    <g className="connection-layer">
      {Object.values(connections).map((connection) => (
        <Connection
          key={connection.id}
          connection={connection}
          shapes={shapes}
          isSelected={selectedConnectionIds.includes(connection.id)}
          isHovered={hoveredConnectionId === connection.id}
          onMouseDown={(e) => handleConnectionMouseDown(connection.id, e)}
          onMouseEnter={() => setHoveredConnectionId(connection.id)}
          onMouseLeave={() => setHoveredConnectionId(null)}
        />
      ))}
    </g>
  );
}
```

### Step 6: Connection Creation Hook

**File:** `src/hooks/useConnectionCreation.ts`

```typescript
import { useCallback, useEffect, useRef } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';
import { AnchorPosition } from '@/types/connection';
import { Point } from '@/types/common';
import { findNearestAnchor, getAnchorPosition } from '@/lib/connection-utils';

export function useConnectionCreation() {
  const shapes = useDiagramStore((s) => s.shapes);
  const addConnection = useDiagramStore((s) => s.addConnection);
  const activeTool = useUIStore((s) => s.activeTool);
  const viewport = useUIStore((s) => s.viewport);
  const connectionState = useUIStore((s) => s.connectionCreationState);
  const startConnectionCreation = useUIStore((s) => s.startConnectionCreation);
  const updateConnectionCreation = useUIStore((s) => s.updateConnectionCreation);
  const endConnectionCreation = useUIStore((s) => s.endConnectionCreation);

  const handleAnchorMouseDown = useCallback((
    shapeId: string,
    anchor: AnchorPosition,
    e: React.MouseEvent
  ) => {
    if (activeTool !== 'connection') return;

    e.stopPropagation();
    const shape = shapes[shapeId];
    if (!shape) return;

    const anchorPoint = getAnchorPosition(shape, anchor);
    startConnectionCreation(shapeId, anchor, anchorPoint);
  }, [activeTool, shapes, startConnectionCreation]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!connectionState) return;

    // Convert screen to canvas coordinates
    const canvasX = viewport.x + e.clientX / viewport.zoom;
    const canvasY = viewport.y + e.clientY / viewport.zoom;

    updateConnectionCreation({ x: canvasX, y: canvasY });
  }, [connectionState, viewport, updateConnectionCreation]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!connectionState) return;

    // Convert screen to canvas coordinates
    const canvasX = viewport.x + e.clientX / viewport.zoom;
    const canvasY = viewport.y + e.clientY / viewport.zoom;
    const canvasPoint: Point = { x: canvasX, y: canvasY };

    // Find target shape and anchor
    let targetShapeId: string | null = null;
    let targetAnchor: AnchorPosition | null = null;

    for (const [id, shape] of Object.entries(shapes)) {
      if (id === connectionState.sourceShapeId) continue;

      const nearest = findNearestAnchor(shape, canvasPoint, 25);
      if (nearest) {
        targetShapeId = id;
        targetAnchor = nearest.position;
        break;
      }
    }

    // Create connection if valid target found
    if (targetShapeId && targetAnchor) {
      addConnection({
        sourceShapeId: connectionState.sourceShapeId,
        targetShapeId,
        sourceAnchor: connectionState.sourceAnchor,
        targetAnchor,
      });
    }

    endConnectionCreation();
  }, [connectionState, viewport, shapes, addConnection, endConnectionCreation]);

  // Attach global listeners during connection creation
  useEffect(() => {
    if (!connectionState) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [connectionState, handleMouseMove, handleMouseUp]);

  return {
    handleAnchorMouseDown,
    connectionState,
  };
}
```

### Step 7: Text Editing Components

**File:** `src/components/canvas/ShapeText.tsx`

```typescript
import React, { useMemo } from 'react';
import { TextStyle } from '@/types/shape';

interface ShapeTextProps {
  text: string;
  textStyle: TextStyle;
  shapeBounds: { x: number; y: number; width: number; height: number };
  onDoubleClick?: () => void;
}

export function ShapeText({
  text,
  textStyle,
  shapeBounds,
  onDoubleClick,
}: ShapeTextProps) {
  const { fontFamily, fontSize, fontWeight, fontStyle, textDecoration, color, align, verticalAlign } = textStyle;
  const { x, y, width, height } = shapeBounds;

  // Calculate text position based on alignment
  const textX = useMemo(() => {
    switch (align) {
      case 'left': return x + 8;
      case 'right': return x + width - 8;
      case 'center':
      default: return x + width / 2;
    }
  }, [align, x, width]);

  const textAnchor = useMemo(() => {
    switch (align) {
      case 'left': return 'start';
      case 'right': return 'end';
      case 'center':
      default: return 'middle';
    }
  }, [align]);

  const textY = useMemo(() => {
    switch (verticalAlign) {
      case 'top': return y + fontSize + 4;
      case 'bottom': return y + height - 4;
      case 'middle':
      default: return y + height / 2;
    }
  }, [verticalAlign, y, height, fontSize]);

  const dominantBaseline = useMemo(() => {
    switch (verticalAlign) {
      case 'top': return 'hanging';
      case 'bottom': return 'auto';
      case 'middle':
      default: return 'central';
    }
  }, [verticalAlign]);

  // Split text into lines
  const lines = text.split('\n');

  return (
    <text
      x={textX}
      y={textY}
      textAnchor={textAnchor}
      dominantBaseline={dominantBaseline}
      fontFamily={fontFamily}
      fontSize={fontSize}
      fontWeight={fontWeight}
      fontStyle={fontStyle}
      textDecoration={textDecoration}
      fill={color}
      style={{ cursor: 'text', userSelect: 'none' }}
      onDoubleClick={onDoubleClick}
      pointerEvents="none"
    >
      {lines.map((line, i) => (
        <tspan
          key={i}
          x={textX}
          dy={i === 0 ? 0 : `${fontSize * 1.2}px`}
        >
          {line || '\u00A0'} {/* Non-breaking space for empty lines */}
        </tspan>
      ))}
    </text>
  );
}
```

**File:** `src/components/canvas/TextEditOverlay.tsx`

```typescript
import React, { useRef, useEffect, useCallback } from 'react';
import { Shape } from '@/types/shape';
import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';

interface TextEditOverlayProps {
  shape: Shape;
  viewport: { x: number; y: number; zoom: number };
  containerRect: DOMRect;
}

export function TextEditOverlay({
  shape,
  viewport,
  containerRect,
}: TextEditOverlayProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const updateShape = useDiagramStore((s) => s.updateShape);
  const setEditingTextShapeId = useUIStore((s) => s.setEditingTextShapeId);

  // Calculate overlay position in screen coordinates
  const screenX = (shape.x - viewport.x) * viewport.zoom;
  const screenY = (shape.y - viewport.y) * viewport.zoom;
  const screenWidth = shape.width * viewport.zoom;
  const screenHeight = shape.height * viewport.zoom;

  const { textStyle } = shape;
  const scaledFontSize = textStyle.fontSize * viewport.zoom;

  // Focus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleBlur = useCallback(() => {
    setEditingTextShapeId(null);
  }, [setEditingTextShapeId]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateShape(shape.id, { text: e.target.value });
  }, [shape.id, updateShape]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle formatting shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          updateShape(shape.id, {
            textStyle: {
              ...textStyle,
              fontWeight: textStyle.fontWeight === 'bold' ? 'normal' : 'bold',
            },
          });
          break;
        case 'i':
          e.preventDefault();
          updateShape(shape.id, {
            textStyle: {
              ...textStyle,
              fontStyle: textStyle.fontStyle === 'italic' ? 'normal' : 'italic',
            },
          });
          break;
        case 'u':
          e.preventDefault();
          updateShape(shape.id, {
            textStyle: {
              ...textStyle,
              textDecoration: textStyle.textDecoration === 'underline' ? 'none' : 'underline',
            },
          });
          break;
      }
    }

    // Exit on Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditingTextShapeId(null);
    }
  }, [shape.id, textStyle, updateShape, setEditingTextShapeId]);

  return (
    <textarea
      ref={textareaRef}
      value={shape.text || ''}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={{
        position: 'absolute',
        left: screenX,
        top: screenY,
        width: screenWidth,
        height: screenHeight,
        fontFamily: textStyle.fontFamily,
        fontSize: scaledFontSize,
        fontWeight: textStyle.fontWeight,
        fontStyle: textStyle.fontStyle,
        textDecoration: textStyle.textDecoration,
        color: textStyle.color,
        textAlign: textStyle.align,
        background: 'transparent',
        border: '2px solid #3B82F6',
        outline: 'none',
        resize: 'none',
        overflow: 'hidden',
        padding: '4px 8px',
        boxSizing: 'border-box',
      }}
    />
  );
}
```

### Step 8: Text Editing Hook

**File:** `src/hooks/useTextEditing.ts`

```typescript
import { useCallback } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';

export function useTextEditing() {
  const editingTextShapeId = useUIStore((s) => s.editingTextShapeId);
  const setEditingTextShapeId = useUIStore((s) => s.setEditingTextShapeId);
  const activeTool = useUIStore((s) => s.activeTool);

  const handleShapeDoubleClick = useCallback((shapeId: string) => {
    if (activeTool === 'select') {
      setEditingTextShapeId(shapeId);
    }
  }, [activeTool, setEditingTextShapeId]);

  const exitTextEditing = useCallback(() => {
    setEditingTextShapeId(null);
  }, [setEditingTextShapeId]);

  return {
    editingTextShapeId,
    handleShapeDoubleClick,
    exitTextEditing,
    isEditing: editingTextShapeId !== null,
  };
}
```

### Step 9: Property Panel Text Section

**File:** `src/components/panels/sections/TextSection.tsx`

```typescript
import React, { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { NumberInput } from '@/components/ui/NumberInput';
import { useDiagramStore } from '@/stores/diagramStore';
import { TextStyle, TextAlign, VerticalAlign } from '@/types/shape';
import {
  Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextSectionProps {
  textStyle: TextStyle | 'mixed';
  selectedShapeIds: string[];
}

const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Verdana',
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 24, 36, 48];

export function TextSection({ textStyle, selectedShapeIds }: TextSectionProps) {
  const updateShape = useDiagramStore((s) => s.updateShape);
  const shapes = useDiagramStore((s) => s.shapes);

  const handleTextStyleChange = useCallback((updates: Partial<TextStyle>) => {
    selectedShapeIds.forEach((id) => {
      const shape = shapes[id];
      if (shape) {
        updateShape(id, {
          textStyle: { ...shape.textStyle, ...updates },
        });
      }
    });
  }, [selectedShapeIds, shapes, updateShape]);

  if (textStyle === 'mixed') {
    return (
      <div className="text-sm text-muted-foreground">
        Multiple text styles selected
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Text</h4>

      {/* Font Family */}
      <div className="flex items-center gap-2">
        <Label className="w-12 text-xs">Font</Label>
        <Select
          value={textStyle.fontFamily}
          onValueChange={(value) => handleTextStyleChange({ fontFamily: value })}
        >
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div className="flex items-center gap-2">
        <Label className="w-12 text-xs">Size</Label>
        <Select
          value={String(textStyle.fontSize)}
          onValueChange={(value) => handleTextStyleChange({ fontSize: parseInt(value) })}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <NumberInput
          value={textStyle.fontSize}
          onChange={(value) => handleTextStyleChange({ fontSize: value })}
          min={6}
          max={200}
          className="w-16"
        />
      </div>

      {/* Formatting Buttons */}
      <div className="flex items-center gap-1">
        <Label className="w-12 text-xs">Style</Label>
        <Button
          variant="outline"
          size="icon"
          className={cn('w-8 h-8', textStyle.fontWeight === 'bold' && 'bg-blue-100')}
          onClick={() => handleTextStyleChange({
            fontWeight: textStyle.fontWeight === 'bold' ? 'normal' : 'bold',
          })}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={cn('w-8 h-8', textStyle.fontStyle === 'italic' && 'bg-blue-100')}
          onClick={() => handleTextStyleChange({
            fontStyle: textStyle.fontStyle === 'italic' ? 'normal' : 'italic',
          })}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={cn('w-8 h-8', textStyle.textDecoration === 'underline' && 'bg-blue-100')}
          onClick={() => handleTextStyleChange({
            textDecoration: textStyle.textDecoration === 'underline' ? 'none' : 'underline',
          })}
        >
          <Underline className="w-4 h-4" />
        </Button>
      </div>

      {/* Text Color */}
      <div className="flex items-center gap-2">
        <Label className="w-12 text-xs">Color</Label>
        <ColorPicker
          value={textStyle.color}
          onChange={(color) => handleTextStyleChange({ color })}
          allowTransparent={false}
        />
      </div>

      {/* Horizontal Alignment */}
      <div className="flex items-center gap-1">
        <Label className="w-12 text-xs">Align</Label>
        {(['left', 'center', 'right'] as TextAlign[]).map((align) => (
          <Button
            key={align}
            variant="outline"
            size="icon"
            className={cn('w-8 h-8', textStyle.align === align && 'bg-blue-100')}
            onClick={() => handleTextStyleChange({ align })}
          >
            {align === 'left' && <AlignLeft className="w-4 h-4" />}
            {align === 'center' && <AlignCenter className="w-4 h-4" />}
            {align === 'right' && <AlignRight className="w-4 h-4" />}
          </Button>
        ))}
      </div>

      {/* Vertical Alignment */}
      <div className="flex items-center gap-1">
        <Label className="w-12 text-xs">V-Align</Label>
        {(['top', 'middle', 'bottom'] as VerticalAlign[]).map((vAlign) => (
          <Button
            key={vAlign}
            variant="outline"
            size="icon"
            className={cn('w-8 h-8', textStyle.verticalAlign === vAlign && 'bg-blue-100')}
            onClick={() => handleTextStyleChange({ verticalAlign: vAlign })}
          >
            {vAlign === 'top' && <AlignStartVertical className="w-4 h-4" />}
            {vAlign === 'middle' && <AlignCenterVertical className="w-4 h-4" />}
            {vAlign === 'bottom' && <AlignEndVertical className="w-4 h-4" />}
          </Button>
        ))}
      </div>
    </div>
  );
}
```

### Step 10: Update Canvas with New Layers

**File:** `src/components/canvas/Canvas.tsx` (updated)

```typescript
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';
import { ShapeLayer } from './ShapeLayer';
import { ConnectionLayer } from './ConnectionLayer';
import { AnchorPointsLayer } from './AnchorPointsLayer';
import { SelectionLayer } from './SelectionLayer';
import { TextEditOverlay } from './TextEditOverlay';
import { useViewport } from '@/hooks/useViewport';
import { useConnectionCreation } from '@/hooks/useConnectionCreation';
import { useTextEditing } from '@/hooks/useTextEditing';
import { calculateViewBox } from '@/lib/viewport';

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null);

  const shapes = useDiagramStore((s) => s.shapes);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const viewport = useUIStore((s) => s.viewport);

  const { handleAnchorMouseDown, connectionState } = useConnectionCreation();
  const { editingTextShapeId, handleShapeDoubleClick } = useTextEditing();

  useViewport(containerRef);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const viewBox = calculateViewBox(viewport, containerSize);

  // Get editing shape for overlay
  const editingShape = editingTextShapeId ? shapes[editingTextShapeId] : null;

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden relative">
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        className="bg-gray-50"
      >
        {/* Connections (below shapes) */}
        <ConnectionLayer />

        {/* Shapes */}
        <ShapeLayer
          shapes={shapes}
          selectedShapeIds={selectedShapeIds}
          onShapeHover={setHoveredShapeId}
          onShapeDoubleClick={handleShapeDoubleClick}
        />

        {/* Selection handles */}
        <SelectionLayer shapes={shapes} selectedShapeIds={selectedShapeIds} />

        {/* Anchor points (during connection mode) */}
        <AnchorPointsLayer
          hoveredShapeId={hoveredShapeId}
          onAnchorMouseDown={handleAnchorMouseDown}
        />
      </svg>

      {/* Text editing overlay (HTML) */}
      {editingShape && containerRef.current && (
        <TextEditOverlay
          shape={editingShape}
          viewport={viewport}
          containerRect={containerRef.current.getBoundingClientRect()}
        />
      )}
    </div>
  );
}
```

---

## Key Decisions

### 1. Text Editing via HTML Overlay

**Decision:** Use an HTML textarea positioned over the SVG shape for text editing.

**Rationale:**
- Native text input handling (selection, cursor, clipboard)
- Better accessibility
- Simpler than contenteditable or pure SVG text editing
- Works well across browsers

### 2. Uniform Text Formatting per Shape

**Decision:** Apply formatting (bold, italic, etc.) to entire shape text, not per-character.

**Rationale:**
- Simpler implementation for Phase 5
- Matches typical diagram use case
- Per-character formatting can be added in future phase

### 3. Straight Lines Only for Phase 5

**Decision:** Only implement straight line connections.

**Rationale:**
- Foundation for connection system
- Curved and orthogonal connections require complex routing algorithms
- Phase 8 will add advanced connection types

---

## Testing Approach

### Unit Tests

```typescript
// src/lib/__tests__/connection-utils.test.ts
import { getAnchorPosition, findNearestAnchor, isPointNearLine } from '../connection-utils';

describe('getAnchorPosition', () => {
  const shape = { x: 100, y: 100, width: 200, height: 100 };

  it('returns correct top anchor', () => {
    expect(getAnchorPosition(shape, 'top')).toEqual({ x: 200, y: 100 });
  });

  it('returns correct right anchor', () => {
    expect(getAnchorPosition(shape, 'right')).toEqual({ x: 300, y: 150 });
  });
});

describe('isPointNearLine', () => {
  it('detects point near horizontal line', () => {
    expect(isPointNearLine({ x: 150, y: 102 }, { x: 100, y: 100 }, { x: 200, y: 100 }, 5)).toBe(true);
  });

  it('rejects point far from line', () => {
    expect(isPointNearLine({ x: 150, y: 120 }, { x: 100, y: 100 }, { x: 200, y: 100 }, 5)).toBe(false);
  });
});
```

---

## Performance Considerations

- Connections re-render when source or target shape moves
- Use `useMemo` for connection endpoint calculations
- Debounce text updates if typing causes lag
- Consider virtualization if many connections exist

---

## Accessibility Requirements

- Text editing supports standard keyboard navigation
- Ctrl+B/I/U shortcuts work
- Escape exits text editing
- Connection tool can be activated via keyboard
- Screen readers announce connection creation status
