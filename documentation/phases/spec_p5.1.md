# Phase 5.1: Text & Connection Bug Fixes - Technical Specification

## Document Information

| Field | Value |
|-------|-------|
| Phase | 5.1 |
| Status | Draft |
| Dependencies | Phase 5 |
| Estimated Files | 12 modified |

---

## Technical Fixes

### C1: Text Overflow Fix (KI-003)

**File:** `src/components/shapes/ShapeText.tsx`

**Solution:** Add SVG clipPath to constrain text rendering within shape bounds.

```tsx
// Add clipPath definition and wrap text element
<defs>
  <clipPath id={`text-clip-${shapeId}`}>
    <rect
      x={x + PADDING}
      y={y + PADDING}
      width={width - PADDING * 2}
      height={height - PADDING * 2}
    />
  </clipPath>
</defs>
<g clipPath={`url(#text-clip-${shapeId})`}>
  <text ...>{lines}</text>
</g>
```

---

### C2: React Key Anti-Pattern Fix

**File:** `src/components/shapes/ShapeText.tsx`

**Current (line 96):**
```tsx
{lines.map((line, i) => (
  <tspan key={i} ...>
```

**Fixed:**
```tsx
{lines.map((line, i) => (
  <tspan key={`${shapeId}-line-${i}-${line.slice(0, 10)}`} ...>
```

Use combination of shapeId, index, and content prefix for stable keys.

---

### C3: Type Safety Fix

**File:** `src/types/shapes.ts`

Verify property naming consistency. The TextStyle interface should use `fontColor` consistently:

```tsx
export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  fontColor: string;  // Ensure this is used everywhere
  horizontalAlign: TextAlign;
  verticalAlign: VerticalAlign;
}
```

Update `TextEditOverlay.tsx` to use `fontColor` instead of `color`.

---

### C4: Memory Leak Fix

**File:** `src/hooks/useConnectionCreation.ts`

**Current (lines 128-140):** Effect adds/removes listeners based on connectionCreationState.

**Fixed:** Use refs to store handlers and clean up properly:

```tsx
const handlersRef = useRef({ handleMouseMove, handleMouseUp, handleKeyDown });

useEffect(() => {
  handlersRef.current = { handleMouseMove, handleMouseUp, handleKeyDown };
});

useEffect(() => {
  if (!connectionCreationState) return;

  const handlers = handlersRef.current;

  window.addEventListener('mousemove', handlers.handleMouseMove);
  window.addEventListener('mouseup', handlers.handleMouseUp);
  window.addEventListener('keydown', handlers.handleKeyDown);

  return () => {
    window.removeEventListener('mousemove', handlers.handleMouseMove);
    window.removeEventListener('mouseup', handlers.handleMouseUp);
    window.removeEventListener('keydown', handlers.handleKeyDown);
  };
}, [connectionCreationState]);
```

---

### C5: Null Safety Fix

**File:** `src/components/connections/AnchorPointsOverlay.tsx`

**Current (lines 45, 48, 60):** Uses `connectionCreationState!` non-null assertion.

**Fixed:** Add proper null checks:

```tsx
{connectionCreationState && sourceShape && (
  <AnchorPoint
    key={`source-${connectionCreationState.sourceShapeId}-${anchor}`}
    isHighlighted={anchor === connectionCreationState.sourceAnchor}
    ...
  />
)}
```

---

### C6: Silent Failure Fix

**File:** `src/hooks/useConnectionCreation.ts`

**Current (line 38):**
```tsx
if (!containerRef.current) return { x: 0, y: 0 };
```

**Fixed:** Log warning and return null:
```tsx
if (!containerRef.current) {
  console.warn('screenToCanvas called with null container ref');
  return null;
}
// Update callers to handle null return
```

---

### H1: Performance Optimization

**File:** `src/components/connections/Connection.tsx`

**Current (lines 27-30):**
```tsx
const endpoints = useMemo(
  () => getConnectionEndpoints(connection, shapes),
  [connection, shapes]  // shapes is entire Record
);
```

**Fixed:** Only depend on source and target shapes:
```tsx
const sourceShape = shapes[connection.sourceShapeId];
const targetShape = shapes[connection.targetShapeId];

const endpoints = useMemo(
  () => getConnectionEndpoints(connection, sourceShape, targetShape),
  [connection, sourceShape, targetShape]
);
```

---

### H3: Zoom-Aware Threshold Fix

**Files:**
- `src/hooks/useConnectionCreation.ts`
- `src/hooks/useConnectionSelection.ts`

Apply consistent zoom scaling:

```tsx
// In useConnectionCreation.ts (line 93)
const threshold = 25 / viewport.zoom;
const nearestAnchor = findNearestAnchor(shape, canvasPoint, threshold);

// In useConnectionSelection.ts (line 39) - already correct
const threshold = 8 / viewport.zoom;
```

---

### H4: Accessibility Fix

**File:** `src/components/canvas/TextEditOverlay.tsx`

Add accessibility attributes:

```tsx
<textarea
  ref={textareaRef}
  aria-label="Edit shape text"
  role="textbox"
  aria-multiline="true"
  ...
/>
```

---

### H5: Line Height Consistency

**Files:**
- `src/components/shapes/ShapeText.tsx`
- `src/components/canvas/TextEditOverlay.tsx`

Extract line height to constant and use consistently:

```tsx
// In constants.ts
export const TEXT_LINE_HEIGHT = 1.2;

// In ShapeText.tsx
const lineHeight = fontSize * TEXT_LINE_HEIGHT;

// In TextEditOverlay.tsx
lineHeight: TEXT_LINE_HEIGHT,
```

---

### H6: Text Editing State Cleanup

**File:** `src/hooks/useTextEditing.ts`

Clear editing state when shape is deleted:

```tsx
// Subscribe to shape deletion
useEffect(() => {
  if (editingTextShapeId && !shapes[editingTextShapeId]) {
    setEditingTextShapeId(null);
  }
}, [editingTextShapeId, shapes, setEditingTextShapeId]);
```

---

### M1: Magic Numbers to Constants

**File:** `src/lib/constants.ts`

Add missing constants:

```tsx
// Connection constants
export const CONNECTION_HIT_AREA_MIN_WIDTH = 12;
export const CONNECTION_HIT_AREA_PADDING = 10;
export const ANCHOR_SNAP_THRESHOLD = 25;
export const CONNECTION_LINE_THRESHOLD = 8;

// Text constants
export const TEXT_PADDING = 8;
export const TEXT_LINE_HEIGHT = 1.2;
```

---

### M2: Floating-Point Fix

**File:** `src/lib/geometry/connection.ts`

**Current (line 139):**
```tsx
if (lengthSquared === 0) {
```

**Fixed:** Use epsilon comparison:
```tsx
const EPSILON = 1e-10;
if (lengthSquared < EPSILON) {
```

---

### M3: Connection Memoization

**File:** `src/components/connections/ConnectionLayer.tsx`

Wrap Connection in React.memo:

```tsx
import { memo } from 'react';

const MemoizedConnection = memo(Connection);

// In render:
{connectionList.map((connection) => (
  <MemoizedConnection key={connection.id} ... />
))}
```

---

### M6: Selection Bug Fix

**File:** `src/hooks/useSelection.ts` or `src/stores/diagramStore.ts`

When selecting a shape, ensure connections are deselected:

```tsx
// In setSelectedShapeIds or selection handler:
setSelectedShapeIds: (ids) => set({
  selectedShapeIds: ids,
  selectedConnectionIds: [],  // Clear connection selection
}),
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/shapes/ShapeText.tsx` | clipPath, key fix, line height |
| `src/components/canvas/TextEditOverlay.tsx` | fontColor, accessibility, line height |
| `src/components/connections/Connection.tsx` | optimize deps, colors |
| `src/components/connections/AnchorPointsOverlay.tsx` | null safety |
| `src/components/connections/ConnectionLayer.tsx` | memoization |
| `src/hooks/useConnectionCreation.ts` | memory leak, zoom, validation |
| `src/hooks/useConnectionSelection.ts` | zoom scaling |
| `src/hooks/useTextEditing.ts` | state cleanup |
| `src/hooks/useSelection.ts` | selection fix |
| `src/lib/geometry/connection.ts` | epsilon comparison |
| `src/lib/constants.ts` | new constants |
| `src/stores/diagramStore.ts` | selection behavior |

---

## Implementation Order

1. **Documentation Setup** - Create requirements, spec, todo files
2. **Constants** - Add all missing constants first
3. **Critical Fixes** - Text overflow, keys, type safety, memory leak, null safety
4. **High Priority** - Performance, zoom, accessibility, state cleanup
5. **Medium Priority** - Memoization, colors, selection bug
6. **Verification** - Type check, manual testing
