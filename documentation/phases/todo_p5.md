# Phase 5: Text & Basic Connections - Todo List

## Status: Completed

## Tasks

### Part 1: Store Extensions
- [x] Step 1: Extend InteractionStore (text editing + connection creation state)
- [x] Step 2: Add Connection Actions to DiagramStore

### Part 2: Connection Utilities & Components
- [x] Step 3: Create connection geometry utilities
- [x] Step 4: Create Connection component
- [x] Step 5: Create ConnectionLayer component
- [x] Step 6: Create AnchorPoint and AnchorPointsOverlay components

### Part 3: Connection Logic
- [x] Step 7: Create useConnectionCreation hook
- [x] Step 8: Integrate connections into Canvas

### Part 4: Text Rendering
- [x] Step 9: Create ShapeText component
- [x] Step 10: Integrate text into Rectangle and Ellipse

### Part 5: Text Editing
- [x] Step 11: Create TextEditOverlay component
- [x] Step 12: Create useTextEditing hook
- [x] Step 13: Integrate text editing into Canvas

### Part 6: Property Panel
- [x] Step 14: Create TextSection component
- [x] Step 15: Create ConnectionSection component

### Part 7: Toolbar & Keyboard
- [x] Step 16: Add Connection tool to Toolbar
- [x] Step 17: Update keyboard shortcuts

### Part 8: Selection & Extensions
- [x] Step 18: Create useConnectionSelection hook
- [x] Step 19: Integrate connection selection
- [x] Step 20: Extend useSelectedShapes for text properties

### Part 9: Finalize
- [x] Step 21: Add constants for connections and text

### Verification
- [x] Manual testing of all text editing features
- [x] Manual testing of all connection features

## Completed Summary
| Task | Status | Notes |
|------|--------|-------|
| Step 1: InteractionStore | Done | Added editingTextShapeId, connectionCreationState |
| Step 2: DiagramStore | Done | Added connection CRUD actions, cascade delete |
| Step 3: Connection geometry | Done | Created src/lib/geometry/connection.ts |
| Steps 4-6: Connection components | Done | Connection, ConnectionLayer, AnchorPoint, AnchorPointsOverlay |
| Steps 7-8: Connection logic | Done | useConnectionCreation hook, Canvas integration |
| Steps 9-10: Text rendering | Done | ShapeText component, integrated into shapes |
| Steps 11-13: Text editing | Done | TextEditOverlay, useTextEditing hook |
| Steps 14-15: Property panel | Done | TextSection, ConnectionSection components |
| Steps 16-17: Toolbar/shortcuts | Done | Connection tool (C key), updated shortcuts |
| Steps 18-20: Selection | Done | useConnectionSelection, extended useSelectedShapes |
| Step 21: Constants | Done | Added CONNECTION_DEFAULTS, TEXT_DEFAULTS |

## Files Created (17)
- `src/lib/geometry/connection.ts`
- `src/components/connections/Connection.tsx`
- `src/components/connections/ConnectionLayer.tsx`
- `src/components/connections/AnchorPoint.tsx`
- `src/components/connections/AnchorPointsOverlay.tsx`
- `src/components/connections/index.ts`
- `src/components/shapes/ShapeText.tsx`
- `src/components/canvas/TextEditOverlay.tsx`
- `src/hooks/useConnectionCreation.ts`
- `src/hooks/useTextEditing.ts`
- `src/hooks/useConnectionSelection.ts`
- `src/hooks/useSelectedConnections.ts`
- `src/components/panels/sections/TextSection.tsx`
- `src/components/panels/sections/ConnectionSection.tsx`
- `src/components/ui/ColorPicker.tsx` (from P4)
- `src/components/ui/ColorSwatch.tsx` (from P4)
- `src/components/ui/NumberInput.tsx` (from P4)

## Files Modified (14)
- `src/stores/interactionStore.ts`
- `src/stores/diagramStore.ts`
- `src/components/canvas/Canvas.tsx`
- `src/components/canvas/CanvasContainer.tsx`
- `src/components/shapes/Shape.tsx`
- `src/components/shapes/ShapeLayer.tsx`
- `src/components/shapes/Rectangle.tsx`
- `src/components/shapes/Ellipse.tsx`
- `src/components/toolbar/Toolbar.tsx`
- `src/components/panels/PropertyPanel.tsx`
- `src/components/panels/sections/index.ts`
- `src/hooks/useKeyboardShortcuts.ts`
- `src/hooks/useSelection.ts`
- `src/hooks/useSelectedShapes.ts`
- `src/lib/constants.ts`
