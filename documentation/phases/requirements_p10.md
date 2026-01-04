# Phase 10: Layers - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 10 |
| Status | Draft |
| Dependencies | Phase 0-9 |
| Deployable | Yes - Layer management |

---

## Phase Overview

Phase 10 adds a layers system to organize complex diagrams. Users can create multiple layers, control visibility and locking, reorder layers, and move shapes between layers. Shapes render in layer order, with higher layers appearing above lower ones.

### Goals

1. Create layers panel UI
2. Implement layer creation and deletion
3. Add layer visibility toggle
4. Add layer locking
5. Enable layer reordering
6. Support moving shapes between layers

---

## User Stories Included

### From Epic E07: Organization & Layers

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E07-US04 | Create Layers | P2 | Full |
| E07-US05 | Layer Visibility | P2 | Full |
| E07-US06 | Lock Layer | P2 | Full |
| E07-US07 | Reorder Layers | P2 | Full |
| E07-US08 | Delete Layer | P2 | Full |

---

## Detailed Acceptance Criteria

### E07-US04: Create Layers

**As a** user
**I want** to organize my diagram into layers
**So that** I can manage complex diagrams

```gherkin
Scenario: View layers panel
  Given I select "View > Layers Panel" or press a shortcut
  Then a layers panel opens
  And I see a list of layers (default: "Layer 1")

Scenario: Add new layer
  Given I have the layers panel open
  When I click "Add Layer" button
  Then a new layer is created above the current layer
  And the new layer is named "Layer 2" (auto-increment)
  And the new layer becomes active

Scenario: Rename layer
  Given I have the layers panel open
  When I double-click on a layer name
  Then I can edit the name inline
  When I press Enter or click outside
  Then the name is saved

Scenario: Move shapes to layer
  Given I have multiple layers
  And I have shapes selected
  When I right-click and select "Move to Layer > [Layer Name]"
  Then the shapes move to that layer
  And they appear on the target layer

Scenario: New shapes on active layer
  Given I have multiple layers
  And "Layer 2" is the active layer
  When I create a new shape
  Then the shape is added to "Layer 2"
```

---

### E07-US05: Layer Visibility

**As a** user
**I want** to show/hide layers
**So that** I can focus on specific parts of the diagram

```gherkin
Scenario: Toggle layer visibility
  Given I have the layers panel open
  When I click the eye icon next to a layer
  Then all shapes on that layer are hidden/shown
  And the icon changes to indicate visibility state

Scenario: Hidden shapes not selectable
  Given a layer is hidden
  Then shapes on that layer cannot be selected by clicking
  And they are not included in selection box selections

Scenario: Hidden shapes not rendered
  Given a layer is hidden
  Then shapes on that layer are not visible on canvas

Scenario: Hide all but one layer
  Given I want to focus on "Layer 1"
  When I Alt-click the eye icon on "Layer 1"
  Then all other layers are hidden
  And only "Layer 1" is visible

Scenario: Layer visibility persisted
  Given I hide a layer
  When I save and reload the diagram
  Then the layer visibility state is preserved
```

---

### E07-US06: Lock Layer

**As a** user
**I want** to lock layers
**So that** I don't accidentally modify background elements

```gherkin
Scenario: Lock layer
  Given I have the layers panel open
  When I click the lock icon next to a layer
  Then all shapes on that layer become locked
  And the lock icon shows as active

Scenario: Locked shapes not selectable
  Given a layer is locked
  When I click on shapes on that layer
  Then they cannot be selected
  And they cannot be moved or modified

Scenario: Locked shapes visible
  Given a layer is locked
  Then shapes on that layer are still visible
  And they are dimmed or have a subtle indicator

Scenario: Unlock layer
  Given a layer is locked
  When I click the lock icon again
  Then the layer is unlocked
  And shapes can be selected and modified

Scenario: Cannot delete from locked layer
  Given shapes are on a locked layer
  Then attempting to delete them has no effect
```

---

### E07-US07: Reorder Layers

**As a** user
**I want** to reorder layers
**So that** I can control which elements appear on top

```gherkin
Scenario: Drag to reorder layers
  Given I have multiple layers
  When I drag "Layer 1" above "Layer 2" in the layers panel
  Then the layer order changes
  And shapes on "Layer 1" now render above "Layer 2" shapes

Scenario: Layer order affects rendering
  Given I have overlapping shapes on different layers
  Then shapes on higher layers appear above shapes on lower layers
  And this overrides individual shape z-order

Scenario: Move layer up/down with buttons
  Given I have a layer selected in the panel
  Then I can click up/down arrow buttons
  And the layer moves one position in the order
```

---

### E07-US08: Delete Layer

**As a** user
**I want** to delete layers
**So that** I can remove unused organization levels

```gherkin
Scenario: Delete empty layer
  Given I have an empty layer (no shapes)
  When I select it and click "Delete Layer"
  Then the layer is removed without confirmation

Scenario: Delete layer with shapes - move shapes
  Given I have a layer with shapes
  When I attempt to delete it
  Then a confirmation dialog appears
  And I can choose "Move shapes to [another layer]"
  When I confirm
  Then the shapes move and the layer is deleted

Scenario: Delete layer with shapes - delete all
  Given I have a layer with shapes
  When I attempt to delete it
  Then I can choose "Delete shapes too"
  When I confirm
  Then the shapes and layer are deleted

Scenario: Cannot delete last layer
  Given I have only one layer
  Then the delete option is disabled
  And I cannot delete the last layer

Scenario: Delete layer from context menu
  Given I right-click on a layer in the panel
  Then I see "Delete Layer" option
```

---

## Features Included

1. **Layers Panel**
   - Toggle panel visibility (View menu)
   - List of layers with icons
   - Active layer highlighting
   - Layer selection

2. **Layer Creation & Naming**
   - Add new layer button
   - Auto-increment naming
   - Inline rename (double-click)
   - New shapes on active layer

3. **Layer Visibility**
   - Eye icon toggle
   - Hidden layers not rendered
   - Hidden shapes not selectable
   - Alt-click to solo layer

4. **Layer Locking**
   - Lock icon toggle
   - Locked shapes visible but not selectable
   - Locked shapes cannot be modified
   - Visual indicator for locked state

5. **Layer Reordering**
   - Drag and drop in panel
   - Up/down buttons
   - Layer order affects rendering
   - Higher layers render on top

6. **Layer Deletion**
   - Delete empty layers
   - Confirmation for non-empty
   - Move shapes or delete with layer
   - Cannot delete last layer

7. **Move Shapes to Layer**
   - Context menu option
   - Select target layer
   - Works with multi-selection

---

## Features Excluded (Deferred)

- Layer opacity
- Layer blending modes
- Layer groups/folders
- Layer effects (drop shadow, etc.)
- Layer templates

---

## Dependencies on Previous Phases

### Required from Previous Phases

| Component/File | Usage |
|----------------|-------|
| `Shape` type | Extended with `layerId` |
| Selection system | Layer-aware selection |
| Property panel | Layer panel docking |
| Context menu | Move to layer option |
| Menu bar | View menu toggle |

---

## Definition of Done

### Layers Panel
- [ ] Panel toggles via View > Layers
- [ ] Shows all layers with visibility/lock icons
- [ ] Active layer highlighted
- [ ] Add Layer button works
- [ ] Rename via double-click

### Layer Visibility
- [ ] Eye icon toggles visibility
- [ ] Hidden shapes not rendered
- [ ] Hidden shapes not selectable
- [ ] Alt-click solos layer

### Layer Locking
- [ ] Lock icon toggles lock state
- [ ] Locked shapes visible but dimmed
- [ ] Locked shapes cannot be selected/modified
- [ ] Delete blocked on locked layer

### Layer Reordering
- [ ] Drag to reorder in panel
- [ ] Up/down buttons work
- [ ] Rendering order updates
- [ ] Higher layers on top

### Layer Deletion
- [ ] Can delete empty layers
- [ ] Confirmation for non-empty
- [ ] Move shapes option works
- [ ] Delete shapes option works
- [ ] Cannot delete last layer

### Shape-Layer Integration
- [ ] New shapes on active layer
- [ ] Move to Layer context menu
- [ ] Shapes render by layer order

---

## Test Scenarios

1. **Create Layer**
   - Click Add Layer, verify new layer appears
   - Verify auto-naming (Layer 1, Layer 2, etc.)

2. **Rename Layer**
   - Double-click layer name, type new name
   - Press Enter, verify name saved

3. **Toggle Visibility**
   - Create shapes on layer, hide layer
   - Verify shapes disappear from canvas

4. **Toggle Lock**
   - Lock layer, try to select shape
   - Verify shape cannot be selected

5. **Reorder Layers**
   - Create overlapping shapes on different layers
   - Reorder layers, verify rendering order changes

6. **Delete Layer with Shapes**
   - Delete layer with shapes
   - Choose "Move to Layer 1"
   - Verify shapes moved, layer deleted

7. **New Shapes on Active Layer**
   - Make Layer 2 active
   - Create shape, verify it's on Layer 2

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Layer toggle | < 16ms |
| Layer visibility | < 16ms |
| Layer reorder | < 16ms |
| Render 10 layers | < 50ms |

---

## Notes for Implementation

### Layer Structure

```typescript
interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;       // 0-1, for future use
  createdAt: number;
}

interface LayerState {
  layers: Record<string, Layer>;
  layerOrder: string[];  // Render order (bottom to top)
  activeLayerId: string;
}
```

### Shape Extension

```typescript
interface Shape {
  // ... existing fields
  layerId: string;  // Required - defaults to first layer
}
```

### Rendering Order
Shapes are rendered layer by layer (bottom to top based on `layerOrder`). Within each layer, shapes are rendered by their individual z-index.
