# Naive Draw.io - Phase Tracker

## Quick Reference

To start a phase, tell Claude: **"start phase N"** (e.g., "start phase 2")

---

## Phase Status

| Phase | Name | Status | Requirements | Spec | Todo |
|-------|------|--------|--------------|------|------|
| P0 | Project Setup | **Completed** | [requirements_p0.md](./requirements_p0.md) | [spec_p0.md](./spec_p0.md) | [todo_p0.md](./todo_p0.md) |
| P1 | Canvas Foundation | **Completed** | [requirements_p1.md](./requirements_p1.md) | [spec_p1.md](./spec_p1.md) | [todo_p1.md](./todo_p1.md) |
| P2 | Basic Shapes | **Completed** | [requirements_p2.md](./requirements_p2.md) | [spec_p2.md](./spec_p2.md) | [todo_p2.md](./todo_p2.md) |
| P3 | Shape Manipulation | **Completed** | [requirements_p3.md](./requirements_p3.md) | [spec_p3.md](./spec_p3.md) | [todo_p3.md](./todo_p3.md) |
| P4 | Styling & Properties | **Completed** | [requirements_p4.md](./requirements_p4.md) | [spec_p4.md](./spec_p4.md) | [todo_p4.md](./todo_p4.md) |
| P5 | Text & Connections | **Completed** | [requirements_p5.md](./requirements_p5.md) | [spec_p5.md](./spec_p5.md) | [todo_p5.md](./todo_p5.md) |
| P5.1 | Text & Connection Fixes | **Completed** | [requirements_p5.1.md](./requirements_p5.1.md) | [spec_p5.1.md](./spec_p5.1.md) | [todo_p5.1.md](./todo_p5.1.md) |
| P5.2 | Automatic Text Wrapping | **Completed** | [requirements_p5.2.md](./requirements_p5.2.md) | [spec_p5.2.md](./spec_p5.2.md) | [todo_p5.2.md](./todo_p5.2.md) |
| P6 | Multi-Selection | **Completed** | [requirements_p6.md](./requirements_p6.md) | [spec_p6.md](./spec_p6.md) | [todo_p6.md](./todo_p6.md) |
| P7 | History & Grid | **Completed** | [requirements_p7.md](./requirements_p7.md) | [spec_p7.md](./spec_p7.md) | [todo_p7.md](./todo_p7.md) |
| P7.1 | P7 Bug Fixes & Completion | **Completed** | [requirements_p7.1.md](./requirements_p7.1.md) | [spec_p7.1.md](./spec_p7.1.md) | [todo_p7.1.md](./todo_p7.1.md) |
| P8 | Organization (Parent) | Not Started | [requirements_p8.md](./requirements_p8.md) | [spec_p8.md](./spec_p8.md) | - |
| P8.1 | Groups | **Completed** | [requirements_p8.1.md](./requirements_p8.1.md) | [spec_p8.1.md](./spec_p8.1.md) | [todo_p8.1.md](./todo_p8.1.md) |
| P8.1.1 | Group Resize & Rotation | **Completed** | [requirements_p8.1.1.md](./requirements_p8.1.1.md) | [spec_p8.1.1.md](./spec_p8.1.1.md) | [todo_p8.1.1.md](./todo_p8.1.1.md) |
| P8.3 | Curved Connections | **Completed** | [requirements_p8.3.md](./requirements_p8.3.md) | [spec_p8.3.md](./spec_p8.3.md) | [todo_p8.3.md](./todo_p8.3.md) |
| P8.4 | Orthogonal Connections | **Completed** | [requirements_p8.4.md](./requirements_p8.4.md) | [spec_p8.4.md](./spec_p8.4.md) | [todo_p8.4.md](./todo_p8.4.md) |
| P8.5 | Labels & Waypoints | **Completed** | [requirements_p8.5.md](./requirements_p8.5.md) | [spec_p8.5.md](./spec_p8.5.md) | [todo_p8.5.md](./todo_p8.5.md) |
| P8.6 | Disconnect & Targeting | **Completed** | [requirements_p8.6.md](./requirements_p8.6.md) | [spec_p8.6.md](./spec_p8.6.md) | [todo_p8.6.md](./todo_p8.6.md) |
| P9 | File Operations | Not Started | [requirements_p9.md](./requirements_p9.md) | [spec_p9.md](./spec_p9.md) | - |
| P10 | Layers | Not Started | [requirements_p10.md](./requirements_p10.md) | [spec_p10.md](./spec_p10.md) | - |

---

## Phase Descriptions

### P0: Project Setup
Vite + React + TypeScript, Tailwind CSS, shadcn/ui, Zustand stores, type definitions, app shell layout.

### P1: Canvas Foundation
SVG canvas with viewBox, mouse wheel zoom (cursor-centered), pan via spacebar+click, status bar with zoom/position.

### P2: Basic Shapes
Rectangle and ellipse creation, shape rendering, basic selection with click.

### P3: Shape Manipulation
Move shapes by dragging, resize with handles, rotate, delete with keyboard.

### P4: Styling & Properties
Fill/stroke colors, stroke width/style, property panel UI, style persistence.

### P5: Text & Connections
Text editing inside shapes, straight line connections between shapes.

### P5.1: Text & Connection Fixes
Bug fixes and code quality improvements for Phase 5: text overflow clipping, React anti-patterns, memory leaks, null safety, performance, accessibility, selection behavior.

### P5.2: Automatic Text Wrapping
Replace clipPath with automatic word wrapping. Text wraps at word boundaries to fit shape width, vertical overflow allowed.

### P6: Multi-Selection
Shift+click and marquee selection, copy/paste, alignment tools.

### P7: History & Grid
Undo/redo stack, grid display and snap, keyboard shortcuts, context menu.

### P7.1: P7 Bug Fixes & Completion
Fix context menu click actions (KI-006), fix resize/rotation history (KI-007). Complete history tracking for style changes, text edits, connection creation, alignment/distribution, z-order. Create menu bar with Edit, View, Arrange menus.

### P8: Organization (Parent)
Shape grouping and advanced connections. Divided into sub-phases:

### P8.1: Groups
Group/ungroup shapes (Ctrl+G, Ctrl+Shift+G), group edit mode (double-click), nested groups, group-aware selection.

### P8.1.1: Group Resize & Rotation
Unified group selection (single bounding box, no individual handles), group resize (scale all members proportionally), group rotation (rotate around group center), Shift/Alt modifiers.

### P8.3: Curved Connections
Bezier curve connections, automatic control points, manual control point adjustment, curves update when shapes move.

### P8.4: Orthogonal Connections
Right-angle connections (H/V segments only), auto-routing with L/Z/U-shaped paths, path recalculates on shape move.

### P8.5: Labels & Waypoints
Double-click connection to add label, label positioning, waypoints to control path, add/move/remove waypoints.

### P8.6: Disconnect & Targeting
Drag endpoint to disconnect, floating endpoint visual, reattach to anchors, shape-level targeting (drop on shape body), auto-select best anchor.

### P9: File Operations
Save/load JSON, export to PNG/SVG, import from files.

### P10: Layers
Layers panel, create/delete/rename layers, visibility toggle, layer locking, reorder layers, move shapes between layers.

---

## Completion Notes

### P0 - Completed
- All infrastructure in place
- shadcn/ui button verified working

### P1 - Completed
- Canvas with zoom/pan functional
- KI-001 resolved in Phase 2 (middle mouse pan now works)

### P2 - Completed
- Rectangle and ellipse creation (click + drag)
- Toolbar with Select (V), Rectangle (R), Ellipse (E) tools
- Single shape selection with 8 handles
- Shift constraint for perfect squares/circles
- Creation preview during drag
- Keyboard shortcuts working

### P3 - Completed
- Move shapes by dragging (works with any tool)
- Arrow keys move 1px (10px with Shift)
- Resize with 8 handles (Shift for aspect ratio, Alt for center)
- Rotation handle with angle display (Shift for 15° snap)
- Delete/Backspace removes selected shapes
- Draw-through: shape tools draw on top of existing shapes (Illustrator/Figma behavior)
- 45 unit tests for geometry utilities

### P4 - Completed
- Store refactoring: Split uiStore into viewportStore, interactionStore, preferencesStore
- localStorage persistence for user preferences (recent colors, panel state)
- Property panel with collapsible state
- Position, dimensions, rotation editing
- Fill color picker with presets, recent colors, and opacity
- Stroke color, width presets, custom width, and style (solid/dashed/dotted)
- No Stroke option: width and style controls disabled when stroke is transparent
- Corner radius for rectangles (slider + input)
- Mixed value support for multi-selection
- Integer rounding for all position, size, and rotation values
- Adaptive selection handles: hide edge handles for small shapes, scale handle size (8px → 6px → 4px)
- 16 new files created, 1 deleted (uiStore.ts)

### P5 - Completed
- Text editing: Double-click shapes to edit text, multi-line support
- Text styling: Font family/size, bold/italic/underline, color, alignment
- Connections: Straight-line connections between shape anchor points
- Connection tool (C key) in toolbar
- Anchor points show on shape hover when using connection tool
- Connection styling: Stroke color/width, arrow types (none, arrow, open-arrow)
- Connection selection and deletion
- Property panel sections for text and connection styling
- Keyboard shortcuts updated: C for connection tool, Escape cancels connection/text editing
- Delete/Backspace works for connections
- 17 new files created, 14 files modified

### P5.1 - Completed
- Fixed text overflow (KI-003): Text now clips within shape bounds via SVG clipPath
- Fixed React key anti-pattern in ShapeText
- Fixed memory leak in useConnectionCreation (ref pattern for event handlers)
- Fixed null safety issues in AnchorPointsOverlay
- Fixed silent (0,0) failure in screenToCanvas
- Performance: Connection component only depends on relevant shapes (not entire shapes object)
- Performance: Connection component wrapped in React.memo
- Added zoom-aware anchor snap threshold
- Text editing state clears when shape is deleted
- Fixed selection bug: Connection now deselected when shape is selected
- Added accessibility attributes to TextEditOverlay
- Line height consistency between ShapeText and TextEditOverlay
- Floating-point epsilon comparison for hit testing
- Color constants extracted (SELECTION, SELECTION_HOVER)
- 3 new files created, 12 files modified

### P5.2 - Completed
- Automatic text wrapping at word boundaries using Canvas measureText API
- Long words break at character level when exceeding shape width
- User-entered newlines preserved
- Vertical overflow allowed (text can extend below shape)
- Removed clipPath (replaced by proper wrapping)
- Known issue added: KI-005 (ellipse text uses rectangular bounds)
- 1 new file created (text.ts), 1 file modified (ShapeText.tsx)

### P6 - Completed
- Multi-selection: Shift+click and Ctrl+click toggle shapes in selection
- Selection box (marquee): Drag on empty canvas to select multiple shapes
- Shift + selection box adds to existing selection
- Ctrl+A selects all shapes
- Multi-shape movement: Drag any selected shape to move all selected shapes together
- Arrow keys move all selected shapes (1px or 10px with Shift)
- Clipboard: Ctrl+C copy, Ctrl+X cut, Ctrl+V paste (with 20px offset)
- Duplicate: Ctrl+D duplicates with offset
- Connections between copied shapes are preserved
- Pasted shapes become the new selection
- Alignment tools in Property Panel: Left, Center, Right, Top, Middle, Bottom (requires 2+ shapes)
- Distribution tools: Horizontal, Vertical (requires 3+ shapes)
- 8 new files created, 9 files modified

### P7 - Completed
- Undo/Redo: Full history system with Ctrl+Z/Ctrl+Y support
- History tracking for: create, delete, move, resize, rotate shapes
- Grid display: Dots pattern, toggle with G key
- Snap to grid: Toggle with Shift+G, snaps position and size
- Grid size configurable (10-50px in 10px increments)
- Context menu: Right-click on shapes for Cut, Copy, Paste, etc.
- Keyboard shortcuts: Comprehensive shortcut support
- Z-order controls: Ctrl+], Ctrl+[, Ctrl+Shift+], Ctrl+Shift+[
- 10 new files created, multiple files modified

### P7.1 - Completed
- Fixed KI-006: Context menu clicks now work on shapes
- Fixed KI-007: Resize and rotation operations tracked in undo history
  - Root cause: React StrictMode creates multiple component instances with separate refs
  - Fix: Use global Zustand store (manipulationState) as single source of truth
- History tracking added for: fill/stroke changes, text edits, connection creation, alignment/distribution, z-order
- Menu bar: Edit menu (Undo/Redo, Cut/Copy/Paste, Delete, Select All), View menu (Grid, Snap, Zoom), Arrange menu (Z-order, Alignment, Distribution)
- Undo shows action description in menu
- Disabled state for unavailable menu actions

### P8.1 - Completed
- Group/Ungroup shapes: Ctrl+G to group, Ctrl+Shift+G to ungroup
- Keyboard shortcuts reassigned: G toggles grid, Shift+G toggles snap to grid
- Group-aware selection: Clicking any grouped shape selects entire group
- Group edit mode: Double-click group to enter, click outside to exit
- In edit mode: Select/move individual shapes within group
- Visual feedback: Blue dashed overlay for selected groups, orange dashed boundary + dimmed shapes in edit mode
- Nested groups: Groups can contain other groups, parent chain traversal
- History integration: Undo/redo works for group/ungroup operations via shape groupId sync
- Menu integration: Group/Ungroup in Arrange menu and context menu
- 6 new files created, 9 files modified

### P8.1.1 - Completed
- Unified group selection: Single bounding box with handles when group is selected
- Individual shape handles hidden when group is fully selected
- Group resize: Drag handles to scale all member shapes proportionally
- Shift modifier: Maintain aspect ratio during resize
- Alt modifier: Resize from center
- Group rotation: Rotate handle rotates all shapes around group center
- Shift modifier: Snap rotation to 15° increments
- Group edit mode exit behavior changed: Click outside to exit (Escape no longer exits)
- Full undo/redo support for group resize and rotation
- 4 new files created, 5 files modified

### P8.3 - Completed
- Curved (Bezier) connections: Switch connection style in Property Panel (Straight/Curved)
- Automatic control points: Calculated perpendicular to anchor direction, 40% of distance (capped at 100px)
- Manual control point adjustment: Drag blue circle handles when curved connection is selected
- Visual feedback: Dashed guide lines from anchors to control points
- Real-time curve updates during drag
- Control points persist on connection
- Undo/redo support for control point changes
- Bezier hit testing: Click anywhere on curve to select
- Fixed selection deselection bug: Added isControlPointDragging flag to prevent canvas interference
- Known issues added: KI-008 (no multi-selection for connections), KI-009 (start arrows partially hidden)
- 5 new files created, 8 files modified

### P8.4 - Completed
- Orthogonal (right-angle) connections: Only horizontal and vertical segments
- Connection style dropdown: Added "Orthogonal" option in Property Panel
- Smart position-aware routing algorithm:
  - L-shape: Perpendicular anchors (e.g., right→top) - one turn
  - Z-shape: Opposite anchors facing each other (e.g., right→left when target is to right)
  - U-shape: Same-direction anchors OR opposite anchors facing away
- Strategy dynamically recalculates when shapes move (not just path points)
- 20px exit offset perpendicular from anchor before turning
- Path simplification: Removes redundant collinear points
- Orthogonal hit testing: `isPointNearOrthogonalPath()` tests each segment
- Arrow markers display correctly at endpoints
- Miter joins for sharp 90° corners
- 2 new files created, 3 files modified

### P8.5 - Completed
- Connection labels: Double-click connection to add "Label" text at midpoint
- Inline label editing: Double-click label to edit text, Enter to confirm, Escape to cancel
- Label positioning: Drag label along path to reposition (0-100% of path length)
- Label styling: Font size, color, position slider in Property Panel
- White background with rounded corners for readability
- Clear label button in Property Panel
- Waypoints: Double-click selected connection to add waypoint at click position
- Waypoint handles: Diamond-shaped handles visible when connection is selected
- Waypoint drag: Drag handles to reposition waypoints
- Waypoint removal: Double-click waypoint handle to remove
- Multiple waypoints supported on all connection types
- Smart waypoint insertion: Inserted at correct position along path
- Smooth curves through waypoints: Uses Catmull-Rom to Bezier conversion for curved connections
- Orthogonal waypoints: Path recalculates through waypoint positions
- Clear waypoints button in Property Panel
- Full undo/redo support for all label and waypoint operations
- 6 new files created, 11 files modified

### P8.6 - Completed
- Disconnect endpoints: Drag endpoint handles to disconnect from shapes
- Floating endpoint visual: Orange indicator with glow ring for disconnected endpoints
- Reconnect to anchors: Drag floating endpoint near any shape to reconnect
- Same shape reconnection: Can reconnect to different anchor on same shape
- Shape-level targeting: Drop connection anywhere on shape body (not just anchors)
- Best anchor auto-selection: Scoring based on distance (50%), approach direction (30%), opposite anchor bonus (20%)
- Snap override: When close to specific anchor (25px), snaps directly to that anchor
- Shape highlighting: Blue border and predicted anchor shown during targeting
- Full undo/redo support for disconnect and reconnect operations
- 3 new files created, 9 files modified
