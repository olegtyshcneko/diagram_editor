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

## Resolved Issues

### KI-001: Middle Mouse Pan Not Working
**Status:** Resolved (Phase 2)
**Priority:** Low (workaround exists)
**Reported:** Phase 1
**Resolved:** Phase 2

**Resolution:**
Middle mouse pan now works correctly. Issue may have been browser-specific or resolved through event handling improvements in Phase 2.

---
