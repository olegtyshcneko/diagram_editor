# Known Issues

Issues to investigate and fix in future phases.

---

## Open Issues

### KI-002: Selection Handles Don't Scale With Zoom
**Status:** Open
**Priority:** Medium
**Reported:** Phase 4

**Description:**
When zooming out, selection handles become very small and difficult to click. When zooming in, handles appear disproportionately large relative to the shape.

**Expected Behavior:**
Handles should scale inversely with zoom level to maintain a consistent screen-space size (e.g., always appear ~8px on screen regardless of zoom).

**Suggested Fix:**
Apply `1 / viewport.zoom` scaling to handle sizes in `InteractiveSelectionHandles` and `SelectionHandles` components. This keeps handles at a usable size at any zoom level.

**Workaround:**
Zoom to 100% for optimal handle usability, or use property panel for precise adjustments.

---

### KI-003: Text Overflow Outside Shape Bounds
**Status:** Open
**Priority:** Low
**Reported:** Phase 5

**Description:**
Text in shapes flows outside the shape bounds if the text content is too long or the shape is too small. The `ShapeText` component renders text without clipping to the shape boundary.

**Expected Behavior:**
Text should either:
1. Clip at shape boundaries (with optional ellipsis)
2. Auto-resize the shape to fit text
3. Show a visual indicator that text is overflowing

**Suggested Fix:**
Options for future implementation:
- Add SVG `clipPath` to constrain text rendering within shape bounds
- Implement text truncation with ellipsis when overflow detected
- Add auto-resize mode that expands shape to fit text content

**Workaround:**
Manually resize shapes to accommodate text, or use shorter text content.

---

### KI-004: Connection Lines Cut Through Shapes
**Status:** Open (Addressed in Phase 8)
**Priority:** Medium
**Reported:** Phase 5

**Description:**
Straight-line connections between shapes may pass through other shapes on the canvas. When shapes overlap or are inline, the connection line can cut through intermediate shapes.

**Expected Behavior:**
Connections should route around obstacles or provide orthogonal/curved routing options.

**Resolution Plan:**
Phase 8 will introduce:
- Orthogonal connections (right-angle routing)
- Curved (Bezier) connections
- Waypoints for manual path control

**Workaround:**
Manually reposition shapes to avoid overlapping connections, or wait for Phase 8 advanced connections.

---

## Resolved Issues

### KI-001: Middle Mouse Pan Not Working
**Status:** Resolved (Phase 2)
**Priority:** Low (workaround exists)
**Reported:** Phase 1
**Resolved:** Phase 2

**Resolution:**
Middle mouse pan now works correctly. Issue may have been browser-specific or resolved through event handling improvements in Phase 2.

---
