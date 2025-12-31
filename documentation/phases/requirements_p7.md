# Phase 7: History, Grid & Keyboard - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 7 |
| Status | Draft |
| Dependencies | Phase 0-6 |
| Deployable | Yes - Professional editing features |

---

## Phase Overview

Phase 7 adds professional editing features that power users expect. This includes undo/redo functionality with history tracking, configurable grid with snap-to-grid capability, comprehensive keyboard shortcuts, context menus, and z-order management for shapes.

### Goals

1. Implement undo/redo system with history stack
2. Add configurable dot grid background
3. Enable snap-to-grid functionality
4. Provide comprehensive keyboard shortcuts for all tools and actions
5. Implement right-click context menus
6. Add z-order controls (bring to front, send to back)

---

## User Stories Included

### From Epic E08: History & Undo

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E08-US01 | Undo Action | P0 | Full |
| E08-US02 | Redo Action | P0 | Full |
| E08-US03 | History Panel | P3 | Deferred |
| E08-US04 | Undo/Redo Menu Items | P1 | Full |

### From Epic E01: Canvas & Viewport

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E01-US07 | Display Grid | P1 | Full |
| E01-US08 | Snap to Grid | P1 | Full |

### From Epic E12: Keyboard Shortcuts

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E12-US01 | Tool Shortcuts | P0 | Full |
| E12-US02 | Action Shortcuts | P0 | Full |
| E12-US03 | View Shortcuts | P1 | Full |
| E12-US04 | Modifier Key Behaviors | P1 | Full |

### From Epic E11: User Interface

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E11-US04 | Context Menu | P0 | Full |

### From Epic E03: Shape Manipulation

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E03-US10 | Bring to Front / Send to Back | P1 | Full |

---

## Detailed Acceptance Criteria

### E08-US01: Undo Action

**As a** user
**I want** to undo my last action
**So that** I can fix mistakes

```gherkin
Scenario: Undo with keyboard
  Given I have performed an action (create, move, delete, style change, etc.)
  When I press Ctrl+Z
  Then the last action is reversed
  And the diagram returns to its previous state

Scenario: Multiple undos
  Given I have performed multiple actions
  When I press Ctrl+Z multiple times
  Then actions are undone in reverse chronological order
  And each undo reverts one atomic action

Scenario: Undo limit
  Given I have performed many actions
  Then undo history keeps at least 50 actions
  And older actions beyond the limit are discarded
  And memory usage remains bounded

Scenario: Undo shape creation
  Given I created a shape
  When I undo
  Then the shape is removed from the canvas
  And selection is cleared

Scenario: Undo shape deletion
  Given I deleted shapes
  When I undo
  Then the shapes are restored
  And their connections are restored
  And the shapes become selected

Scenario: Undo move operation
  Given I moved shapes
  When I undo
  Then shapes return to their original positions
  And connections are updated accordingly

Scenario: Undo style change
  Given I changed a shape's style (fill, stroke, etc.)
  When I undo
  Then the shape reverts to its previous style

Scenario: Undo cannot go past initial state
  Given I have undone all actions
  When I press Ctrl+Z again
  Then nothing happens
  And no error is shown
```

---

### E08-US02: Redo Action

**As a** user
**I want** to redo undone actions
**So that** I can restore changes I accidentally undid

```gherkin
Scenario: Redo with keyboard
  Given I have undone an action
  When I press Ctrl+Y or Ctrl+Shift+Z
  Then the action is reapplied
  And the diagram state advances forward

Scenario: Multiple redos
  Given I have undone multiple actions
  When I press Ctrl+Y multiple times
  Then actions are redone in chronological order

Scenario: Redo stack cleared by new action
  Given I have undone actions
  When I perform a new action (create, move, etc.)
  Then the redo stack is cleared
  And I cannot redo the previously undone actions

Scenario: Redo not available initially
  Given I have not undone any actions
  When I press Ctrl+Y
  Then nothing happens
  And no error is shown
```

---

### E08-US04: Undo/Redo Menu Items

**As a** user
**I want** undo/redo available in menus
**So that** I can access them without keyboard

```gherkin
Scenario: Edit menu undo
  Given I open the Edit menu
  Then I see "Undo" with Ctrl+Z shortcut displayed
  When I click it
  Then the last action is undone

Scenario: Edit menu redo
  Given I open the Edit menu
  Then I see "Redo" with Ctrl+Y shortcut displayed
  When I click it
  Then the last undone action is redone

Scenario: Undo disabled when unavailable
  Given there is nothing to undo
  Then the Undo menu item is disabled/grayed out
  And it cannot be clicked

Scenario: Redo disabled when unavailable
  Given there is nothing to redo
  Then the Redo menu item is disabled/grayed out

Scenario: Menu shows action description
  Given I have performed an action
  Then the Undo menu item shows "Undo [Action Name]"
  Example: "Undo Move Shape" or "Undo Delete"
```

---

### E01-US07: Display Grid

**As a** user
**I want** to see a grid on the canvas
**So that** I can align shapes precisely and have visual reference points

```gherkin
Scenario: Default dot grid pattern
  Given I open the application
  Then the canvas displays a subtle dot grid pattern by default
  And dots are light gray (#e0e0e0 or similar) on white background
  And dots are evenly spaced (default 20px apart)

Scenario: Toggle grid visibility
  Given I am on the canvas
  When I press Ctrl+G or select "View > Show Grid"
  Then the grid visibility toggles
  And the grid preference is persisted to localStorage

Scenario: Grid scales with zoom
  Given the grid is visible
  When I zoom in or out
  Then the grid pattern scales appropriately
  And dots remain visible but not overwhelming at any zoom level
  And at very low zoom, grid density may reduce for performance

Scenario: Grid style options (future enhancement)
  Given I open grid settings (View > Grid Settings)
  Then I can choose between:
    - Dot grid (default, like draw.io)
    - Line grid (traditional squares)
  And I can adjust grid spacing (10px, 20px, 40px)

Scenario: Grid visibility saved
  Given I toggle grid off
  When I reload the application
  Then the grid remains off
```

---

### E01-US08: Snap to Grid

**As a** user
**I want** shapes to snap to grid lines
**So that** I can align elements precisely

```gherkin
Scenario: Snap while moving shapes
  Given snap-to-grid is enabled
  When I drag a shape
  Then the shape position snaps to the nearest grid intersection
  And snapping occurs in real-time during drag

Scenario: Snap while resizing
  Given snap-to-grid is enabled
  When I resize a shape by dragging a handle
  Then the edge snaps to the nearest grid line
  And the opposite edge remains fixed (or snaps if center resize)

Scenario: Snap while creating shapes
  Given snap-to-grid is enabled
  When I create a shape by dragging
  Then both origin and size snap to grid

Scenario: Toggle snap-to-grid
  Given I am on the canvas
  When I press Ctrl+Shift+G or select "View > Snap to Grid"
  Then snap-to-grid is enabled/disabled
  And the preference is persisted

Scenario: Temporary disable snap with Alt
  Given snap-to-grid is enabled
  When I hold Alt while dragging
  Then snapping is temporarily disabled for that operation
  And releasing Alt re-enables snapping

Scenario: Snap indicator
  Given snap-to-grid is enabled
  Then a status bar indicator shows snap is active
  Or the menu item shows a checkmark
```

---

### E12-US01: Tool Shortcuts

**As a** user
**I want** keyboard shortcuts for tools
**So that** I can switch tools quickly

```gherkin
Scenario: Select tool shortcut
  Given I am on the canvas
  When I press V
  Then the Select tool is activated
  And the toolbar shows Select as active

Scenario: Rectangle tool shortcut
  Given I am on the canvas
  When I press R
  Then the Rectangle tool is activated

Scenario: Ellipse tool shortcut
  Given I am on the canvas
  When I press E
  Then the Ellipse tool is activated

Scenario: Line tool shortcut
  Given I am on the canvas
  When I press L
  Then the Line tool is activated

Scenario: Text tool shortcut
  Given I am on the canvas
  When I press T
  Then the Text tool is activated

Scenario: Connection tool shortcut
  Given I am on the canvas
  When I press C
  Then the Connection tool is activated

Scenario: Escape returns to Select
  Given I have a shape tool selected
  When I press Escape
  Then the Select tool becomes active
  And any in-progress creation is cancelled
```

---

### E12-US02: Action Shortcuts

**As a** user
**I want** keyboard shortcuts for common actions
**So that** I can work efficiently

```gherkin
Scenario: Standard editing shortcuts
  Given I use the application
  Then these shortcuts work:
    | Shortcut | Action |
    | Ctrl+Z | Undo |
    | Ctrl+Y | Redo |
    | Ctrl+Shift+Z | Redo (alternative) |
    | Ctrl+C | Copy |
    | Ctrl+V | Paste |
    | Ctrl+X | Cut |
    | Ctrl+D | Duplicate |
    | Ctrl+A | Select All |
    | Delete | Delete selected |
    | Backspace | Delete selected |

Scenario: File shortcuts
  Given I use the application
  Then these shortcuts work:
    | Shortcut | Action |
    | Ctrl+S | Save |
    | Ctrl+Shift+S | Save As |
    | Ctrl+O | Open |
    | Ctrl+N | New |

Scenario: Shortcuts work in all tools
  Given I have any tool selected (not text editing)
  When I press Ctrl+Z
  Then undo works regardless of active tool

Scenario: Shortcuts disabled during text edit
  Given I am editing text inside a shape
  When I press Delete
  Then text is deleted, not the shape
  When I press Ctrl+A
  Then all text in the shape is selected, not all shapes
```

---

### E12-US03: View Shortcuts

**As a** user
**I want** keyboard shortcuts for view operations
**So that** I can navigate quickly

```gherkin
Scenario: Zoom shortcuts
  Given I am on the canvas
  Then these shortcuts work:
    | Shortcut | Action |
    | Ctrl++ | Zoom in |
    | Ctrl+= | Zoom in (alternative) |
    | Ctrl+- | Zoom out |
    | Ctrl+0 | Fit to screen |
    | Ctrl+1 | Actual size (100%) |

Scenario: Grid toggle shortcut
  Given I am on the canvas
  When I press Ctrl+G
  Then the grid toggles visibility

Scenario: Snap toggle shortcut
  Given I am on the canvas
  When I press Ctrl+Shift+G
  Then snap-to-grid toggles
```

---

### E12-US04: Modifier Key Behaviors

**As a** user
**I want** modifier keys to modify tool behavior
**So that** I have precise control

```gherkin
Scenario: Shift modifier for constraints
  Given I hold Shift while:
  Then:
    | Action | Effect |
    | Creating rectangle | Constrains to square |
    | Creating ellipse | Constrains to circle |
    | Moving shape | Constrains to horizontal or vertical |
    | Rotating shape | Snaps to 15-degree increments |
    | Clicking shape | Adds to/removes from selection |
    | Dragging selection box | Adds to existing selection |

Scenario: Alt modifier
  Given I hold Alt while:
  Then:
    | Action | Effect |
    | Resizing shape | Resizes from center |
    | Moving shape | Disables snap-to-grid |
    | Dragging shape | Creates a duplicate (Alt+drag) |

Scenario: Ctrl modifier
  Given I hold Ctrl while:
  Then:
    | Action | Effect |
    | Clicking shapes | Adds/removes from selection |
    | Using arrow keys | Moves by 1px (precision) |

Scenario: Shift+Arrow for larger moves
  Given I have shapes selected
  When I press Shift+Arrow key
  Then shapes move by 10px instead of 1px
```

---

### E11-US04: Context Menu

**As a** user
**I want** a right-click context menu
**So that** I can quickly access relevant actions

```gherkin
Scenario: Context menu on single shape
  Given I right-click on a shape
  Then a context menu appears with options:
    - Cut (Ctrl+X)
    - Copy (Ctrl+C)
    - Paste (Ctrl+V)
    - ---
    - Duplicate (Ctrl+D)
    - Delete (Del)
    - ---
    - Bring to Front (Ctrl+Shift+])
    - Bring Forward (Ctrl+])
    - Send Backward (Ctrl+[)
    - Send to Back (Ctrl+Shift+[)

Scenario: Context menu on multiple shapes
  Given I have multiple shapes selected
  When I right-click on any selected shape
  Then the context menu appears with group options:
    - Cut, Copy, Paste
    - Duplicate, Delete
    - Bring to Front, Send to Back
    - Align submenu (Left, Center, Right, Top, Middle, Bottom)
    - Distribute submenu (Horizontal, Vertical)

Scenario: Context menu on canvas
  Given I right-click on empty canvas
  Then a context menu appears with:
    - Paste (Ctrl+V) - enabled if clipboard has content
    - Paste Here - pastes at click position
    - ---
    - Select All (Ctrl+A)
    - ---
    - Zoom In
    - Zoom Out
    - Fit to Screen
    - Actual Size (100%)

Scenario: Context menu on connection
  Given I right-click on a connection
  Then the context menu appears with:
    - Cut, Copy, Delete
    - Style options (if applicable)

Scenario: Context menu closes on click outside
  Given a context menu is open
  When I click outside the menu
  Then the context menu closes

Scenario: Context menu closes on action
  Given a context menu is open
  When I click a menu item
  Then the action is performed
  And the context menu closes
```

---

### E03-US10: Bring to Front / Send to Back

**As a** user
**I want** to change the z-order of shapes
**So that** I can control which shapes appear on top

```gherkin
Scenario: Bring to front
  Given I have a shape selected
  When I press Ctrl+Shift+] or select "Arrange > Bring to Front"
  Then the shape moves to the top of the z-order
  And it renders above all other shapes

Scenario: Send to back
  Given I have a shape selected
  When I press Ctrl+Shift+[ or select "Arrange > Send to Back"
  Then the shape moves to the bottom of the z-order
  And it renders below all other shapes

Scenario: Bring forward one level
  Given I have a shape selected
  When I press Ctrl+] or select "Arrange > Bring Forward"
  Then the shape moves up one level in the z-order
  And it swaps with the shape immediately above it

Scenario: Send backward one level
  Given I have a shape selected
  When I press Ctrl+[ or select "Arrange > Send Backward"
  Then the shape moves down one level in the z-order
  And it swaps with the shape immediately below it

Scenario: Z-order with multiple selection
  Given I have multiple shapes selected
  When I bring them to front
  Then all selected shapes move to the front
  And their relative order is preserved

Scenario: Z-order affects overlapping rendering
  Given I have two overlapping shapes
  When I select the bottom shape and bring to front
  Then it now visually overlaps the other shape

Scenario: Connections render above shapes
  Note: Connections should generally render above shapes
  Or have separate z-order management
```

---

## Features Included

1. **Undo/Redo System**
   - Undo with Ctrl+Z
   - Redo with Ctrl+Y / Ctrl+Shift+Z
   - History stack with 50+ actions
   - Menu items with disabled states
   - Action descriptions in menu

2. **Grid System**
   - Dot grid pattern (default)
   - Toggle visibility (Ctrl+G)
   - Grid scales with zoom
   - Configurable spacing (basic)
   - Persisted preferences

3. **Snap to Grid**
   - Snap during move, resize, create
   - Toggle snap (Ctrl+Shift+G)
   - Temporary disable with Alt key
   - Visual indicator

4. **Keyboard Shortcuts**
   - Tool shortcuts (V, R, E, L, T, C)
   - Action shortcuts (Ctrl+Z/Y/C/V/X/D/A)
   - View shortcuts (Ctrl++/-/0/1/G)
   - File shortcuts (Ctrl+S/O/N)
   - Modifier keys (Shift, Alt, Ctrl)

5. **Context Menus**
   - Shape context menu
   - Multi-selection context menu
   - Canvas context menu
   - Connection context menu
   - Keyboard shortcuts displayed

6. **Z-Order Controls**
   - Bring to Front (Ctrl+Shift+])
   - Bring Forward (Ctrl+])
   - Send Backward (Ctrl+[)
   - Send to Back (Ctrl+Shift+[)
   - Menu and context menu access

---

## Features Excluded (Deferred)

- History Panel (E08-US03) - P3, deferred to future
- Shortcut Customization (E12-US05) - P3, future
- Full Keyboard Accessibility (E12-US06) - P2, basic support only
- Line grid and cross grid styles - future enhancement
- Custom grid colors - future enhancement

---

## Dependencies on Previous Phases

### Phase 0-6 Requirements
- Working canvas with viewport (P1)
- Shape creation and manipulation (P2-P3)
- Multi-selection system (P6)
- Copy/paste/duplicate (P6)
- Alignment and distribution (P6)
- Connection system (P5)
- Menu bar (all phases)

### Required from Previous Phases

| Component/File | Usage |
|----------------|-------|
| `useDiagramStore` | All shape/connection operations for undo tracking |
| `useUIStore` | Grid/snap preferences, active tool |
| `useSelection` | Selection operations |
| `useClipboard` | Copy/paste for context menu |
| Menu system | Add Undo/Redo, View items |
| Keyboard event handling | Shortcut system |

---

## Definition of Done

### Undo/Redo
- [ ] Ctrl+Z undoes last action
- [ ] Ctrl+Y / Ctrl+Shift+Z redoes
- [ ] At least 50 actions in history
- [ ] Edit menu has Undo/Redo items
- [ ] Items disabled when unavailable
- [ ] All shape operations undoable

### Grid
- [ ] Dot grid displays by default
- [ ] Ctrl+G toggles visibility
- [ ] Grid scales with zoom
- [ ] Grid preference persisted

### Snap to Grid
- [ ] Snap works during move
- [ ] Snap works during resize
- [ ] Snap works during create
- [ ] Ctrl+Shift+G toggles snap
- [ ] Alt temporarily disables snap

### Keyboard Shortcuts
- [ ] All tool shortcuts work (V,R,E,L,T,C)
- [ ] All action shortcuts work
- [ ] All view shortcuts work
- [ ] Modifier keys work correctly

### Context Menus
- [ ] Right-click on shape shows menu
- [ ] Right-click on canvas shows menu
- [ ] All menu items functional
- [ ] Menu closes appropriately

### Z-Order
- [ ] Bring to Front works
- [ ] Send to Back works
- [ ] Bring Forward works
- [ ] Send Backward works
- [ ] Available in menu and context menu

---

## Test Scenarios

### Undo/Redo Tests

1. **Basic Undo**
   - Create shape, press Ctrl+Z
   - Verify shape is removed

2. **Basic Redo**
   - Create shape, undo, press Ctrl+Y
   - Verify shape is restored

3. **Redo Cleared by New Action**
   - Create A, undo, create B
   - Verify cannot redo A

4. **Complex Undo Chain**
   - Create, move, style, delete
   - Undo all 4 actions
   - Verify each step reverts correctly

### Grid Tests

5. **Grid Toggle**
   - Toggle grid with Ctrl+G
   - Verify visibility changes

6. **Grid Persistence**
   - Toggle grid off, reload
   - Verify grid stays off

### Snap Tests

7. **Move with Snap**
   - Enable snap, move shape
   - Verify position snaps to grid

8. **Alt Disables Snap**
   - Enable snap, hold Alt, move
   - Verify shape moves freely

### Shortcut Tests

9. **Tool Shortcuts**
   - Press R, verify Rectangle tool active
   - Press V, verify Select tool active

10. **Action Shortcuts**
    - Select shape, Ctrl+D
    - Verify duplicate created

### Context Menu Tests

11. **Shape Context Menu**
    - Right-click shape
    - Verify menu appears with correct items

12. **Canvas Context Menu**
    - Right-click empty canvas
    - Verify paste and zoom options

### Z-Order Tests

13. **Bring to Front**
    - Create two overlapping shapes
    - Select bottom, Ctrl+Shift+]
    - Verify now on top

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Undo operation | < 50ms |
| Redo operation | < 50ms |
| History memory | < 10MB for 50 operations |
| Grid render (1000px viewport) | < 5ms |
| Context menu appear | < 100ms |
| Keyboard shortcut response | < 50ms |

---

## Notes for Implementation

### History System Architecture

```typescript
// Command pattern for undo/redo
interface HistoryEntry {
  id: string;
  type: string;
  description: string;
  timestamp: number;
  undo: () => void;
  redo: () => void;
}

interface HistoryState {
  entries: HistoryEntry[];
  currentIndex: number; // -1 means no history
  maxEntries: number;
}
```

### Grid Rendering

```typescript
// Efficient grid using SVG pattern
<defs>
  <pattern
    id="dotGrid"
    width={gridSpacing}
    height={gridSpacing}
    patternUnits="userSpaceOnUse"
  >
    <circle
      cx={1}
      cy={1}
      r={1}
      fill="#e0e0e0"
    />
  </pattern>
</defs>
<rect fill="url(#dotGrid)" width="100%" height="100%" />
```

### Snap Calculation

```typescript
function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

function snapPoint(point: Point, gridSize: number): Point {
  return {
    x: snapToGrid(point.x, gridSize),
    y: snapToGrid(point.y, gridSize),
  };
}
```

### Z-Order Management

```typescript
// Z-order stored as index in shapes array
// Or explicit zIndex property
interface Shape {
  id: string;
  zIndex: number;
  // ...
}

// Reorder operation
function bringToFront(shapeId: string): void {
  const maxZ = Math.max(...shapes.map(s => s.zIndex));
  updateShape(shapeId, { zIndex: maxZ + 1 });
}
```
