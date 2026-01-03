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
| P7 | History & Grid | Not Started | [requirements_p7.md](./requirements_p7.md) | [spec_p7.md](./spec_p7.md) | - |
| P8 | Organization | Not Started | [requirements_p8.md](./requirements_p8.md) | [spec_p8.md](./spec_p8.md) | - |
| P9 | File Operations | Not Started | [requirements_p9.md](./requirements_p9.md) | [spec_p9.md](./spec_p9.md) | - |

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

### P8: Organization
Shape grouping, layer ordering (z-index), orthogonal/curved connections.

### P9: File Operations
Save/load JSON, export to PNG/SVG, import from files.

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
