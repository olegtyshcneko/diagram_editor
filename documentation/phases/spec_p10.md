# Phase 10: Layers - Technical Specification

## Technical Architecture

### Component Hierarchy

```
App
├── MenuBar (extended with View > Layers Panel)
├── MainLayout
│   ├── Toolbar
│   ├── Canvas
│   │   ├── LayerRenderer (new) - Renders shapes by layer
│   │   └── ...existing components
│   ├── PropertyPanel
│   └── LayersPanel (new)
│       ├── LayerItem (new)
│       └── LayerControls (new)
└── ContextMenu (extended with Move to Layer)
```

### State Management

```typescript
// stores/layerStore.ts - New store for layer management
interface LayerStore {
  layers: Record<string, Layer>;
  layerOrder: string[];  // Bottom to top render order
  activeLayerId: string;
  panelVisible: boolean;

  // Actions
  addLayer: (name?: string) => string;
  deleteLayer: (id: string, moveShapesTo?: string) => void;
  renameLayer: (id: string, name: string) => void;
  setLayerVisibility: (id: string, visible: boolean) => void;
  setLayerLocked: (id: string, locked: boolean) => void;
  reorderLayers: (newOrder: string[]) => void;
  setActiveLayer: (id: string) => void;
  togglePanel: () => void;
  getVisibleLayers: () => Layer[];
  isLayerEditable: (id: string) => boolean;
}
```

---

## Files to Create

### New Files

```
src/
├── types/
│   └── layer.ts                    # Layer type definitions
├── stores/
│   └── layerStore.ts               # Layer state management
├── hooks/
│   └── useLayers.ts                # Layer operations hook
├── components/
│   ├── panels/
│   │   ├── LayersPanel.tsx         # Main layers panel
│   │   ├── LayerItem.tsx           # Individual layer row
│   │   └── LayerControls.tsx       # Add/delete buttons
│   └── canvas/
│       └── LayerRenderer.tsx       # Layer-based shape rendering
```

### Files to Modify

```
src/
├── types/
│   └── shapes.ts                   # Add layerId field
├── stores/
│   └── diagramStore.ts             # Layer-aware shape creation
├── hooks/
│   ├── useSelection.ts             # Layer-aware selection
│   └── useShapeManipulation.ts     # Check layer lock
├── components/
│   ├── canvas/
│   │   └── Canvas.tsx              # Use LayerRenderer
│   ├── layout/
│   │   └── MainLayout.tsx          # Integrate layers panel
│   └── menu/
│       ├── MenuBar.tsx             # View > Layers Panel toggle
│       └── ContextMenu.tsx         # Move to Layer submenu
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
  opacity: number;       // 0-1, reserved for future
  createdAt: number;
}

export interface LayerState {
  layers: Record<string, Layer>;
  layerOrder: string[];  // Render order (bottom to top)
  activeLayerId: string;
  panelVisible: boolean;
}

export const DEFAULT_LAYER_ID = 'default-layer';

export const createDefaultLayer = (): Layer => ({
  id: DEFAULT_LAYER_ID,
  name: 'Layer 1',
  visible: true,
  locked: false,
  opacity: 1,
  createdAt: Date.now(),
});
```

### Shape Extension

```typescript
// Update types/shapes.ts
export interface Shape {
  // ... existing fields
  layerId: string;  // Required, defaults to DEFAULT_LAYER_ID
}
```

---

## Implementation Order

### Step 1: Types and Store Foundation
1. Create `types/layer.ts` with Layer interface
2. Extend Shape type with `layerId` field
3. Create `stores/layerStore.ts` with basic actions
4. Initialize default layer on app load

### Step 2: Layers Panel UI
5. Create `LayersPanel.tsx` component
6. Create `LayerItem.tsx` for individual layers
7. Create `LayerControls.tsx` for add/delete
8. Integrate panel into MainLayout

### Step 3: Layer Visibility
9. Implement visibility toggle in store
10. Update canvas rendering to skip hidden layers
11. Update selection to skip hidden layer shapes
12. Add eye icon toggle UI

### Step 4: Layer Locking
13. Implement lock toggle in store
14. Update selection to skip locked layer shapes
15. Update manipulation to check layer lock
16. Add lock icon toggle UI

### Step 5: Layer Reordering
17. Implement drag-and-drop in panel
18. Add up/down reorder buttons
19. Update canvas rendering order
20. Persist layer order

### Step 6: Layer Deletion
21. Implement delete for empty layers
22. Add confirmation dialog for non-empty
23. Implement move shapes option
24. Implement delete shapes option

### Step 7: Shape-Layer Integration
25. Update shape creation to use active layer
26. Add "Move to Layer" context menu
27. Create `LayerRenderer.tsx` for canvas
28. Update history for layer operations

### Step 8: Menu Integration
29. Add View > Layers Panel toggle
30. Add keyboard shortcut
31. Persist panel visibility state

---

## Code Patterns

### Layer Store Implementation

```typescript
// stores/layerStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { Layer } from '../types/layer';
import { DEFAULT_LAYER_ID, createDefaultLayer } from '../types/layer';

interface LayerStore {
  layers: Record<string, Layer>;
  layerOrder: string[];
  activeLayerId: string;
  panelVisible: boolean;

  addLayer: (name?: string) => string;
  deleteLayer: (id: string, moveShapesTo?: string) => void;
  renameLayer: (id: string, name: string) => void;
  setLayerVisibility: (id: string, visible: boolean) => void;
  setLayerLocked: (id: string, locked: boolean) => void;
  reorderLayers: (newOrder: string[]) => void;
  setActiveLayer: (id: string) => void;
  togglePanel: () => void;
  soloLayer: (id: string) => void;
  getVisibleLayers: () => Layer[];
  isLayerEditable: (id: string) => boolean;
  reset: () => void;
}

const initialLayer = createDefaultLayer();

export const useLayerStore = create<LayerStore>()(
  persist(
    (set, get) => ({
      layers: { [DEFAULT_LAYER_ID]: initialLayer },
      layerOrder: [DEFAULT_LAYER_ID],
      activeLayerId: DEFAULT_LAYER_ID,
      panelVisible: false,

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
        if (layerOrder.length <= 1) return;

        const { [id]: _, ...remainingLayers } = layers;
        const newOrder = layerOrder.filter((lid) => lid !== id);
        const newActiveId = moveShapesTo || newOrder[newOrder.length - 1];

        set({
          layers: remainingLayers,
          layerOrder: newOrder,
          activeLayerId: get().activeLayerId === id ? newActiveId : get().activeLayerId,
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
        if (get().layers[id]) {
          set({ activeLayerId: id });
        }
      },

      togglePanel: () => {
        set((state) => ({ panelVisible: !state.panelVisible }));
      },

      soloLayer: (id) => {
        const { layers } = get();
        const updatedLayers: Record<string, Layer> = {};

        Object.entries(layers).forEach(([layerId, layer]) => {
          updatedLayers[layerId] = {
            ...layer,
            visible: layerId === id,
          };
        });

        set({ layers: updatedLayers });
      },

      getVisibleLayers: () => {
        const { layers, layerOrder } = get();
        return layerOrder
          .map((id) => layers[id])
          .filter((layer) => layer?.visible);
      },

      isLayerEditable: (id) => {
        const layer = get().layers[id];
        return layer?.visible && !layer?.locked;
      },

      reset: () => {
        const defaultLayer = createDefaultLayer();
        set({
          layers: { [DEFAULT_LAYER_ID]: defaultLayer },
          layerOrder: [DEFAULT_LAYER_ID],
          activeLayerId: DEFAULT_LAYER_ID,
        });
      },
    }),
    {
      name: 'naive-draw-layers',
      partialize: (state) => ({
        layers: state.layers,
        layerOrder: state.layerOrder,
        activeLayerId: state.activeLayerId,
        panelVisible: state.panelVisible,
      }),
    }
  )
);
```

### Layers Panel Component

```typescript
// components/panels/LayersPanel.tsx
import React from 'react';
import { useLayerStore } from '../../stores/layerStore';
import { LayerItem } from './LayerItem';
import { LayerControls } from './LayerControls';

export const LayersPanel: React.FC = () => {
  const { layers, layerOrder, activeLayerId, panelVisible } = useLayerStore();

  if (!panelVisible) return null;

  // Display layers in reverse order (top layer first in UI)
  const displayOrder = [...layerOrder].reverse();

  return (
    <div className="layers-panel w-56 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b flex items-center justify-between bg-gray-50">
        <span className="font-medium text-sm">Layers</span>
        <LayerControls />
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto">
        {displayOrder.map((layerId) => {
          const layer = layers[layerId];
          if (!layer) return null;

          return (
            <LayerItem
              key={layer.id}
              layer={layer}
              isActive={layer.id === activeLayerId}
            />
          );
        })}
      </div>
    </div>
  );
};
```

### Layer Item Component

```typescript
// components/panels/LayerItem.tsx
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { useLayerStore } from '../../stores/layerStore';
import type { Layer } from '../../types/layer';
import { cn } from '../../lib/utils';

interface LayerItemProps {
  layer: Layer;
  isActive: boolean;
}

export const LayerItem: React.FC<LayerItemProps> = ({ layer, isActive }) => {
  const {
    setActiveLayer,
    setLayerVisibility,
    setLayerLocked,
    renameLayer,
    soloLayer,
  } = useLayerStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);

  const handleNameSubmit = () => {
    if (editName.trim()) {
      renameLayer(layer.id, editName.trim());
    } else {
      setEditName(layer.name);
    }
    setIsEditing(false);
  };

  const handleVisibilityClick = (e: React.MouseEvent) => {
    if (e.altKey) {
      soloLayer(layer.id);
    } else {
      setLayerVisibility(layer.id, !layer.visible);
    }
    e.stopPropagation();
  };

  return (
    <div
      className={cn(
        'flex items-center px-2 py-1.5 border-b cursor-pointer group',
        isActive ? 'bg-blue-50' : 'hover:bg-gray-50',
        !layer.visible && 'opacity-60'
      )}
      onClick={() => setActiveLayer(layer.id)}
    >
      {/* Visibility toggle */}
      <button
        onClick={handleVisibilityClick}
        className="p-1 hover:bg-gray-200 rounded mr-1"
        title={layer.visible ? 'Hide layer (Alt+click to solo)' : 'Show layer'}
      >
        {layer.visible ? (
          <Eye size={14} className="text-gray-600" />
        ) : (
          <EyeOff size={14} className="text-gray-400" />
        )}
      </button>

      {/* Lock toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setLayerLocked(layer.id, !layer.locked);
        }}
        className="p-1 hover:bg-gray-200 rounded mr-2"
        title={layer.locked ? 'Unlock layer' : 'Lock layer'}
      >
        {layer.locked ? (
          <Lock size={14} className="text-gray-600" />
        ) : (
          <Unlock size={14} className="text-gray-400" />
        )}
      </button>

      {/* Layer name */}
      {isEditing ? (
        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleNameSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleNameSubmit();
            if (e.key === 'Escape') {
              setEditName(layer.name);
              setIsEditing(false);
            }
          }}
          className="flex-1 px-1 py-0.5 border rounded text-sm bg-white"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="flex-1 text-sm truncate"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
            setEditName(layer.name);
          }}
        >
          {layer.name}
        </span>
      )}
    </div>
  );
};
```

### Layer Renderer Component

```typescript
// components/canvas/LayerRenderer.tsx
import React, { useMemo } from 'react';
import { useLayerStore } from '../../stores/layerStore';
import { useDiagramStore } from '../../stores/diagramStore';
import { ShapeRenderer } from './ShapeRenderer';

export const LayerRenderer: React.FC = () => {
  const { layers, layerOrder } = useLayerStore();
  const shapes = useDiagramStore((state) => state.shapes);

  // Group shapes by layer and sort by z-index within each layer
  const shapesByLayer = useMemo(() => {
    const grouped: Record<string, Shape[]> = {};

    Object.values(shapes).forEach((shape) => {
      const layerId = shape.layerId;
      if (!grouped[layerId]) {
        grouped[layerId] = [];
      }
      grouped[layerId].push(shape);
    });

    // Sort each layer's shapes by z-index
    Object.keys(grouped).forEach((layerId) => {
      grouped[layerId].sort((a, b) => a.zIndex - b.zIndex);
    });

    return grouped;
  }, [shapes]);

  return (
    <>
      {layerOrder.map((layerId) => {
        const layer = layers[layerId];
        if (!layer?.visible) return null;

        const layerShapes = shapesByLayer[layerId] || [];

        return (
          <g
            key={layerId}
            className="layer"
            data-layer-id={layerId}
            opacity={layer.locked ? 0.7 : 1}
          >
            {layerShapes.map((shape) => (
              <ShapeRenderer key={shape.id} shape={shape} />
            ))}
          </g>
        );
      })}
    </>
  );
};
```

### Layer-Aware Selection Hook

```typescript
// hooks/useLayerAwareSelection.ts
import { useCallback } from 'react';
import { useLayerStore } from '../stores/layerStore';
import { useDiagramStore } from '../stores/diagramStore';

export function useLayerAwareSelection() {
  const { layers } = useLayerStore();
  const shapes = useDiagramStore((state) => state.shapes);

  const canSelectShape = useCallback((shapeId: string): boolean => {
    const shape = shapes[shapeId];
    if (!shape) return false;

    const layer = layers[shape.layerId];
    if (!layer) return true; // Default to selectable if layer not found

    return layer.visible && !layer.locked;
  }, [shapes, layers]);

  const getSelectableShapes = useCallback((): string[] => {
    return Object.values(shapes)
      .filter((shape) => {
        const layer = layers[shape.layerId];
        return layer?.visible && !layer?.locked;
      })
      .map((shape) => shape.id);
  }, [shapes, layers]);

  return {
    canSelectShape,
    getSelectableShapes,
  };
}
```

### Context Menu - Move to Layer

```typescript
// Add to ContextMenu.tsx

const MoveToLayerSubmenu: React.FC<{ shapeIds: string[] }> = ({ shapeIds }) => {
  const { layers, layerOrder } = useLayerStore();
  const { updateShape } = useDiagramStore();
  const shapes = useDiagramStore((state) => state.shapes);

  // Get current layer of first selected shape
  const currentLayerId = shapes[shapeIds[0]]?.layerId;

  const handleMoveToLayer = (targetLayerId: string) => {
    shapeIds.forEach((id) => {
      updateShape(id, { layerId: targetLayerId });
    });
  };

  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>Move to Layer</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        {layerOrder.map((layerId) => {
          const layer = layers[layerId];
          if (!layer) return null;

          return (
            <ContextMenuItem
              key={layerId}
              disabled={layerId === currentLayerId}
              onClick={() => handleMoveToLayer(layerId)}
            >
              {layer.name}
              {layerId === currentLayerId && ' (current)'}
            </ContextMenuItem>
          );
        })}
      </ContextMenuSubContent>
    </ContextMenuSub>
  );
};
```

---

## Testing Approach

### Unit Tests

```typescript
// __tests__/layerStore.test.ts
describe('layerStore', () => {
  beforeEach(() => {
    useLayerStore.getState().reset();
  });

  it('should initialize with default layer', () => {
    const { layers, layerOrder, activeLayerId } = useLayerStore.getState();
    expect(Object.keys(layers)).toHaveLength(1);
    expect(layerOrder).toHaveLength(1);
    expect(activeLayerId).toBe(DEFAULT_LAYER_ID);
  });

  it('should add new layer', () => {
    const newId = useLayerStore.getState().addLayer('Test Layer');
    const { layers, layerOrder, activeLayerId } = useLayerStore.getState();

    expect(layers[newId].name).toBe('Test Layer');
    expect(layerOrder).toContain(newId);
    expect(activeLayerId).toBe(newId);
  });

  it('should toggle visibility', () => {
    const { activeLayerId } = useLayerStore.getState();
    useLayerStore.getState().setLayerVisibility(activeLayerId, false);

    expect(useLayerStore.getState().layers[activeLayerId].visible).toBe(false);
  });

  it('should not delete last layer', () => {
    const { layerOrder } = useLayerStore.getState();
    const lastLayerId = layerOrder[0];

    useLayerStore.getState().deleteLayer(lastLayerId);

    expect(useLayerStore.getState().layerOrder).toHaveLength(1);
  });
});
```

---

## Performance Considerations

### Memoized Layer Shapes
Cache shapes grouped by layer to avoid recalculation on every render.

### Virtualized Layer List
For diagrams with many layers, consider virtualizing the layer list (though unlikely to have >20 layers).

### Selective Re-render
Use React.memo for LayerItem to prevent re-render when other layers change.

---

## Accessibility Requirements

- Keyboard navigation through layer list (Arrow Up/Down)
- Screen reader announces layer state: "Layer 1, visible, unlocked"
- Focus management when adding/deleting layers
- ARIA labels for visibility and lock buttons

---

## History Integration

Layer operations tracked in history:

```typescript
interface LayerHistoryEntry {
  type: 'layer-add' | 'layer-delete' | 'layer-rename' | 'layer-reorder' |
        'layer-visibility' | 'layer-lock' | 'move-to-layer';
  layerId: string;
  previousState: Partial<Layer>;
  newState: Partial<Layer>;
  affectedShapes?: string[]; // For move-to-layer
}
```
