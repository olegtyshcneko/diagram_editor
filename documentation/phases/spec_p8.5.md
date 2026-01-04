# Phase 8.5: Labels & Waypoints - Technical Specification

## Technical Architecture

### Component Hierarchy

```
Canvas
├── ConnectionRenderer
│   ├── StraightConnection (modified for waypoints)
│   ├── CurvedConnection (modified for waypoints)
│   ├── OrthogonalConnection (modified for waypoints)
│   ├── ConnectionLabel (new)
│   └── ConnectionWaypoints (new)
```

### Connection Type Extension

```typescript
interface Connection {
  // ... existing fields
  label?: ConnectionLabel;
  waypoints: ConnectionWaypoint[];
}

interface ConnectionLabel {
  text: string;
  position: number;      // 0-1 along path
  offset: Point;         // Perpendicular offset
  style: TextStyle;
}

interface ConnectionWaypoint {
  id: string;
  point: Point;
}
```

---

## Files to Create

### New Files

```
src/
├── components/
│   └── canvas/
│       └── connections/
│           ├── ConnectionLabel.tsx       # Label renderer
│           └── ConnectionWaypoints.tsx   # Waypoint handles
├── hooks/
│   └── useWaypoints.ts                   # Waypoint operations
└── utils/
    └── pathUtils.ts                      # Path utilities (point on path, etc.)
```

### Files to Modify

```
src/
├── types/
│   └── connections.ts                    # Add label, waypoints
├── stores/
│   └── diagramStore.ts                   # Waypoint/label actions
├── components/
│   ├── canvas/
│   │   ├── connections/
│   │   │   ├── StraightConnection.tsx    # Waypoint support
│   │   │   ├── CurvedConnection.tsx      # Waypoint support
│   │   │   └── OrthogonalConnection.tsx  # Waypoint support
│   │   └── ConnectionRenderer.tsx        # Include label/waypoints
│   └── panels/
│       └── PropertyPanel.tsx             # Label styling section
```

---

## Implementation Order

### Step 1: Types and Store
1. Add `label` and `waypoints` to Connection type
2. Add waypoint actions to diagramStore
3. Add label actions to diagramStore

### Step 2: Path Utilities
4. Create `pathUtils.ts`
5. Implement `getPointOnPath` for position along path
6. Implement `getPathAtPosition` for label placement

### Step 3: Connection Label
7. Create `ConnectionLabel.tsx`
8. Implement label rendering with background
9. Add label editing (double-click)
10. Add label dragging

### Step 4: Waypoints Component
11. Create `ConnectionWaypoints.tsx`
12. Implement waypoint handles
13. Add drag to move waypoints
14. Add double-click to remove

### Step 5: Connection Updates
15. Update StraightConnection for waypoints
16. Update CurvedConnection for waypoints
17. Update OrthogonalConnection for waypoints

### Step 6: Add Waypoint Interaction
18. Create `useWaypoints.ts` hook
19. Implement double-click to add waypoint
20. Handle waypoint selection

### Step 7: Property Panel
21. Add label styling section
22. Font family, size, color controls

### Step 8: History Integration
23. Track label add/edit/remove
24. Track waypoint add/move/remove

---

## Code Patterns

### Path Utilities

```typescript
// utils/pathUtils.ts
import type { Point } from '../types';

/**
 * Get point along a path at position t (0-1)
 */
export function getPointOnPath(
  points: Point[],
  t: number
): { point: Point; angle: number } {
  if (points.length < 2) {
    return { point: points[0] || { x: 0, y: 0 }, angle: 0 };
  }

  // Calculate total path length
  let totalLength = 0;
  const segments: { length: number; start: Point; end: Point }[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const length = Math.hypot(
      points[i + 1].x - points[i].x,
      points[i + 1].y - points[i].y
    );
    segments.push({ length, start: points[i], end: points[i + 1] });
    totalLength += length;
  }

  // Find segment at position t
  const targetLength = t * totalLength;
  let accumulatedLength = 0;

  for (const segment of segments) {
    if (accumulatedLength + segment.length >= targetLength) {
      const segmentT = (targetLength - accumulatedLength) / segment.length;
      const point = {
        x: segment.start.x + (segment.end.x - segment.start.x) * segmentT,
        y: segment.start.y + (segment.end.y - segment.start.y) * segmentT,
      };
      const angle = Math.atan2(
        segment.end.y - segment.start.y,
        segment.end.x - segment.start.x
      );
      return { point, angle };
    }
    accumulatedLength += segment.length;
  }

  // Fallback to end point
  const lastSegment = segments[segments.length - 1];
  return {
    point: lastSegment.end,
    angle: Math.atan2(
      lastSegment.end.y - lastSegment.start.y,
      lastSegment.end.x - lastSegment.start.x
    ),
  };
}

/**
 * Find nearest point on path to a given point
 */
export function getNearestPointOnPath(
  points: Point[],
  targetPoint: Point
): { point: Point; t: number } {
  let nearestPoint = points[0];
  let nearestT = 0;
  let minDistance = Infinity;
  let totalLength = 0;
  let accumulatedLength = 0;

  // Calculate total length first
  for (let i = 0; i < points.length - 1; i++) {
    totalLength += Math.hypot(
      points[i + 1].x - points[i].x,
      points[i + 1].y - points[i].y
    );
  }

  // Check each segment
  accumulatedLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const segmentLength = Math.hypot(
      points[i + 1].x - points[i].x,
      points[i + 1].y - points[i].y
    );

    const nearest = nearestPointOnSegment(points[i], points[i + 1], targetPoint);
    const distance = Math.hypot(nearest.x - targetPoint.x, nearest.y - targetPoint.y);

    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = nearest;

      // Calculate t value
      const segmentT = Math.hypot(nearest.x - points[i].x, nearest.y - points[i].y) / segmentLength;
      nearestT = (accumulatedLength + segmentT * segmentLength) / totalLength;
    }

    accumulatedLength += segmentLength;
  }

  return { point: nearestPoint, t: nearestT };
}

function nearestPointOnSegment(a: Point, b: Point, p: Point): Point {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) return a;

  const t = Math.max(0, Math.min(1,
    ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq
  ));

  return {
    x: a.x + t * dx,
    y: a.y + t * dy,
  };
}
```

### Connection Label Component

```typescript
// components/canvas/connections/ConnectionLabel.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ConnectionLabel as LabelType, Point } from '../../../types';
import { getPointOnPath } from '../../../utils/pathUtils';

interface ConnectionLabelProps {
  label: LabelType;
  pathPoints: Point[];
  connectionId: string;
  isSelected: boolean;
  onUpdate: (label: Partial<LabelType>) => void;
  onDelete: () => void;
}

export const ConnectionLabel: React.FC<ConnectionLabelProps> = ({
  label,
  pathPoints,
  connectionId,
  isSelected,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(label.text);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate label position
  const { point } = getPointOnPath(pathPoints, label.position);
  const labelX = point.x + (label.offset?.x || 0);
  const labelY = point.y + (label.offset?.y || 0);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditText(label.text);
  }, [label.text]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editText.trim()) {
      onUpdate({ text: editText.trim() });
    } else {
      onDelete();
    }
  }, [editText, onUpdate, onDelete]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setEditText(label.text);
      setIsEditing(false);
    }
  }, [label.text]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const style = label.style || { fontFamily: 'sans-serif', fontSize: 12, color: '#000' };
  const padding = 4;

  if (isEditing) {
    return (
      <foreignObject
        x={labelX - 50}
        y={labelY - 12}
        width={100}
        height={24}
      >
        <input
          ref={inputRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full px-1 text-center border rounded text-sm"
          style={{
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            color: style.color,
          }}
        />
      </foreignObject>
    );
  }

  return (
    <g
      className="connection-label cursor-pointer"
      onDoubleClick={handleDoubleClick}
    >
      {/* Background */}
      <rect
        x={labelX - (label.text.length * style.fontSize * 0.3) - padding}
        y={labelY - style.fontSize / 2 - padding}
        width={label.text.length * style.fontSize * 0.6 + padding * 2}
        height={style.fontSize + padding * 2}
        fill="white"
        stroke={isSelected ? '#3B82F6' : '#E5E7EB'}
        strokeWidth={1}
        rx={2}
      />

      {/* Text */}
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fill: style.color,
        }}
        pointerEvents="none"
      >
        {label.text}
      </text>
    </g>
  );
};
```

### Connection Waypoints Component

```typescript
// components/canvas/connections/ConnectionWaypoints.tsx
import React, { useCallback, useState } from 'react';
import type { ConnectionWaypoint, Point } from '../../../types';

interface ConnectionWaypointsProps {
  waypoints: ConnectionWaypoint[];
  isSelected: boolean;
  onWaypointMove: (id: string, point: Point) => void;
  onWaypointRemove: (id: string) => void;
}

export const ConnectionWaypoints: React.FC<ConnectionWaypointsProps> = ({
  waypoints,
  isSelected,
  onWaypointMove,
  onWaypointRemove,
}) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleMouseDown = useCallback(
    (id: string) => (e: React.MouseEvent) => {
      e.stopPropagation();
      setDraggingId(id);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        // Convert to canvas coordinates (actual implementation needs viewport transform)
        const point = { x: moveEvent.clientX, y: moveEvent.clientY };
        onWaypointMove(id, point);
      };

      const handleMouseUp = () => {
        setDraggingId(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [onWaypointMove]
  );

  const handleDoubleClick = useCallback(
    (id: string) => (e: React.MouseEvent) => {
      e.stopPropagation();
      onWaypointRemove(id);
    },
    [onWaypointRemove]
  );

  if (!isSelected || waypoints.length === 0) return null;

  return (
    <g className="connection-waypoints">
      {waypoints.map((waypoint) => (
        <circle
          key={waypoint.id}
          cx={waypoint.point.x}
          cy={waypoint.point.y}
          r={6}
          fill={draggingId === waypoint.id ? '#3B82F6' : 'white'}
          stroke="#3B82F6"
          strokeWidth={2}
          className="cursor-move"
          onMouseDown={handleMouseDown(waypoint.id)}
          onDoubleClick={handleDoubleClick(waypoint.id)}
        />
      ))}
    </g>
  );
};
```

### Waypoints Hook

```typescript
// hooks/useWaypoints.ts
import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import { useDiagramStore } from '../stores/diagramStore';
import { getNearestPointOnPath } from '../utils/pathUtils';
import type { Point, ConnectionWaypoint } from '../types';

export function useWaypoints(connectionId: string) {
  const { connections, updateConnection } = useDiagramStore();
  const connection = connections[connectionId];

  const addWaypoint = useCallback((clickPoint: Point, pathPoints: Point[]) => {
    if (!connection) return;

    // Find where to insert the waypoint
    const { point } = getNearestPointOnPath(pathPoints, clickPoint);

    const newWaypoint: ConnectionWaypoint = {
      id: nanoid(),
      point,
    };

    // Find correct insertion index based on position along path
    const existingWaypoints = connection.waypoints || [];
    // For simplicity, append to end (could calculate proper position)
    const updatedWaypoints = [...existingWaypoints, newWaypoint];

    updateConnection(connectionId, { waypoints: updatedWaypoints });
    return newWaypoint.id;
  }, [connection, connectionId, updateConnection]);

  const moveWaypoint = useCallback((waypointId: string, point: Point) => {
    if (!connection) return;

    const updatedWaypoints = (connection.waypoints || []).map(wp =>
      wp.id === waypointId ? { ...wp, point } : wp
    );

    updateConnection(connectionId, { waypoints: updatedWaypoints });
  }, [connection, connectionId, updateConnection]);

  const removeWaypoint = useCallback((waypointId: string) => {
    if (!connection) return;

    const updatedWaypoints = (connection.waypoints || []).filter(
      wp => wp.id !== waypointId
    );

    updateConnection(connectionId, { waypoints: updatedWaypoints });
  }, [connection, connectionId, updateConnection]);

  return {
    waypoints: connection?.waypoints || [],
    addWaypoint,
    moveWaypoint,
    removeWaypoint,
  };
}
```

### Curved Connection with Waypoints

```typescript
// Update CurvedConnection to support waypoints
import { bezierWithWaypoints } from '../../../utils/bezierUtils';

// In CurvedConnection component:
const pathData = useMemo(() => {
  const waypointPoints = (connection.waypoints || []).map(w => w.point);

  if (waypointPoints.length === 0) {
    // Original logic
    const { cp1, cp2 } = connection.controlPoints ||
      calculateAutoControlPoints(startPoint, startAnchor, endPoint, endAnchor);
    return bezierToSVGPath({ start: startPoint, cp1, cp2, end: endPoint });
  }

  // Path through waypoints
  return bezierWithWaypoints(startPoint, startAnchor, endPoint, endAnchor, waypointPoints);
}, [startPoint, startAnchor, endPoint, endAnchor, connection.controlPoints, connection.waypoints]);
```

---

## Testing Approach

### Unit Tests

```typescript
// __tests__/pathUtils.test.ts
describe('pathUtils', () => {
  it('should get midpoint on path', () => {
    const points = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
    const { point } = getPointOnPath(points, 0.5);

    expect(point.x).toBe(50);
    expect(point.y).toBe(0);
  });

  it('should find nearest point on segment', () => {
    const points = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
    const { point, t } = getNearestPointOnPath(points, { x: 50, y: 20 });

    expect(point.x).toBe(50);
    expect(point.y).toBe(0);
    expect(t).toBeCloseTo(0.5);
  });
});
```

---

## History Integration

```typescript
interface LabelHistoryEntry {
  type: 'connection-label-add' | 'connection-label-update' | 'connection-label-remove';
  connectionId: string;
  previousLabel?: ConnectionLabel;
  newLabel?: ConnectionLabel;
}

interface WaypointHistoryEntry {
  type: 'waypoint-add' | 'waypoint-move' | 'waypoint-remove';
  connectionId: string;
  waypointId: string;
  previousPoint?: Point;
  newPoint?: Point;
}
```
