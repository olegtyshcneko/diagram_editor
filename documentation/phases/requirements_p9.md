# Phase 9: File Operations - Requirements

## Document Information

| Field | Value |
|-------|-------|
| Phase | 9 |
| Status | Draft |
| Dependencies | Phase 0-8 |
| Deployable | Yes - Full file support |

---

## Phase Overview

Phase 9 completes the application with comprehensive file operations. Users can save and load diagrams in the native format, import and export draw.io files for compatibility, and export to common image formats. Auto-save, recent files, and browser close warnings protect user work.

### Goals

1. Implement native file format (.ndio) save and load
2. Enable auto-save to localStorage
3. Support draw.io file import and export
4. Export to SVG, PNG, and PDF formats
5. Implement recent files list
6. Add unsaved changes detection and warnings
7. Support drag-and-drop file opening

---

## User Stories Included

### From Epic E09: File Operations

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E09-US01 | Create New Diagram | P0 | Full |
| E09-US02 | Save Diagram Locally | P0 | Full |
| E09-US03 | Open Diagram from File | P0 | Full |
| E09-US04 | Auto-Save | P1 | Full |
| E09-US05 | Recent Files | P2 | Full |
| E09-US06 | Drag and Drop to Open | P2 | Full |
| E09-US07 | Close Diagram | P1 | Full |
| E09-US08 | Document Title | P1 | Full |
| E09-US09 | Template Support | P3 | Deferred |
| E09-US10 | File Information | P3 | Deferred |
| E09-US11 | Confirm Before Closing Browser | P1 | Full |

### From Epic E10: draw.io Compatibility

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E10-US01 | Export to draw.io Format | P0 | Full |
| E10-US02 | Import draw.io Files | P0 | Full |
| E10-US03 | Style Mapping | P0 | Full |
| E10-US04 | Connection Types Mapping | P0 | Full |
| E10-US05 | Layer Compatibility | P2 | Full |
| E10-US06 | XML Compression | P2 | Partial |

### From Epic E14: Export & Import

| Story ID | Title | Priority | Included |
|----------|-------|----------|----------|
| E14-US01 | Export as SVG | P0 | Full |
| E14-US02 | Export as PNG | P1 | Full |
| E14-US03 | Export as PDF | P2 | Basic |
| E14-US04 | Export as JSON | P1 | Full |
| E14-US05 | Import from Image | P2 | Full |
| E14-US06 | Copy as Image | P1 | Full |
| E14-US07 | Import from Clipboard | P2 | Full |
| E14-US08 | Batch Export | P3 | Deferred |

---

## Detailed Acceptance Criteria

### E09-US01: Create New Diagram

**As a** user
**I want** to create a new blank diagram
**So that** I can start a fresh project

```gherkin
Scenario: New diagram from menu
  Given I am in the application
  When I select "File > New" or press Ctrl+N
  Then a new blank diagram is created
  And the canvas is cleared
  And the document title shows "Untitled"

Scenario: Prompt to save unsaved changes
  Given I have unsaved changes in the current diagram
  When I create a new diagram
  Then a dialog appears: "Do you want to save changes?"
  And I can choose "Save", "Don't Save", or "Cancel"

Scenario: Save before new
  Given I have unsaved changes
  When I choose "Save" in the dialog
  Then the current diagram is saved
  And then a new blank diagram is created

Scenario: Don't save before new
  Given I have unsaved changes
  When I choose "Don't Save"
  Then changes are discarded
  And a new blank diagram is created

Scenario: Cancel new diagram
  Given I have unsaved changes
  When I choose "Cancel"
  Then no new diagram is created
  And I continue editing the current diagram
```

---

### E09-US02: Save Diagram Locally

**As a** user
**I want** to save my diagram to my computer
**So that** I can preserve my work

```gherkin
Scenario: Save new diagram
  Given I have a new, unsaved diagram
  When I press Ctrl+S or select "File > Save"
  Then a file save dialog appears (browser download)
  And I can choose a filename
  And the file is saved in native format (.ndio)

Scenario: Save As with new name
  Given I have a diagram open
  When I select "File > Save As" or press Ctrl+Shift+S
  Then a file save dialog appears
  And I can save a copy with a new name
  And the new file becomes the current document

Scenario: Save updates existing file
  Given I have opened or previously saved a diagram
  When I press Ctrl+S
  Then the file is downloaded with the same name
  Note: Browser security prevents overwriting; downloads new file

Scenario: Native format preserves all data
  Given I save a diagram with shapes, connections, groups, layers
  When I open the saved file
  Then all elements are restored exactly
  And styling, positions, z-order preserved
  And groups and layers preserved

Scenario: Save disabled when no changes
  Given I have just saved or opened a file with no changes
  Then the file is still saveable (user may want to re-download)
```

---

### E09-US03: Open Diagram from File

**As a** user
**I want** to open a saved diagram
**So that** I can continue working on it

```gherkin
Scenario: Open file dialog
  Given I select "File > Open" or press Ctrl+O
  Then a file picker dialog appears
  And I can browse for .ndio or .drawio files

Scenario: Open native format file
  Given I select a .ndio file
  When I click Open
  Then the diagram is loaded onto the canvas
  And all shapes, connections, groups, layers restored
  And the filename appears in the title

Scenario: Open draw.io file
  Given I select a .drawio file
  When I click Open
  Then the diagram is imported and displayed
  And a conversion notice may appear for unsupported features

Scenario: Invalid file error
  Given I try to open an invalid or corrupted file
  Then an error message is displayed
  And my current work is unaffected

Scenario: Prompt to save before opening
  Given I have unsaved changes
  When I try to open a file
  Then I am prompted to save the current diagram
```

---

### E09-US04: Auto-Save

**As a** user
**I want** my work to be auto-saved
**So that** I don't lose work if something goes wrong

```gherkin
Scenario: Auto-save to localStorage
  Given I am working on a diagram
  Then my work is automatically saved to browser localStorage
  And auto-save occurs every 30 seconds after changes
  And auto-save occurs immediately before browser close attempt

Scenario: Recover auto-saved work
  Given the browser crashed or I closed without saving
  When I reopen the application
  Then I am prompted to recover unsaved work
  And I can choose "Recover" or "Discard"

Scenario: Recover shows preview
  Given auto-saved data exists
  When recovery prompt appears
  Then it shows when the auto-save occurred
  And optionally shows a preview thumbnail

Scenario: Auto-save indicator
  Given auto-save is active
  Then a subtle indicator shows last auto-save time
  Or shows "All changes saved" status
```

---

### E09-US05: Recent Files

**As a** user
**I want** to see recently opened files
**So that** I can quickly access my work

```gherkin
Scenario: Recent files list
  Given I open the File menu
  Then I see a "Recent Files" submenu
  And it lists the last 10 opened/saved files

Scenario: Recent file entry shows name and date
  Given I view recent files
  Then each entry shows filename
  And shows when it was last opened
  And shows file type icon (.ndio or .drawio)

Scenario: Open from recent files
  Given I click on a file in recent files list
  Then that diagram is opened
  Note: If file was local, prompts to re-upload

Scenario: Clear recent files
  Given I am in the File menu
  When I select "Recent Files > Clear Recent"
  Then the recent files list is emptied

Scenario: Recent files persist across sessions
  Given I have recent files
  When I close and reopen the browser
  Then recent files list is preserved (metadata only)
```

---

### E09-US06: Drag and Drop to Open

**As a** user
**I want** to drag files onto the application to open them
**So that** I can open files quickly

```gherkin
Scenario: Drag and drop file to open
  Given I have the application open
  When I drag a .ndio or .drawio file onto the canvas
  Then the file is opened
  And the diagram is displayed

Scenario: Visual feedback during drag
  Given I am dragging a file over the application
  Then the drop zone is highlighted
  And text indicates "Drop to open"

Scenario: Drop non-diagram file
  Given I drag an unsupported file type
  When I drop it
  Then an error message appears
  And my current work is unaffected

Scenario: Prompt to save on drop
  Given I have unsaved changes
  When I drop a diagram file
  Then I am prompted to save first
```

---

### E09-US07: Close Diagram

**As a** user
**I want** to close the current diagram
**So that** I can start fresh or exit

```gherkin
Scenario: Close with unsaved changes
  Given I have unsaved changes
  When I select "File > Close" or close the tab
  Then I am prompted to save
  And I can choose Save, Don't Save, or Cancel

Scenario: Close saved diagram
  Given I have no unsaved changes
  When I close the diagram
  Then it closes without prompting
  And a blank canvas or welcome screen appears

Scenario: Cancel close
  Given I have unsaved changes
  When I try to close and choose Cancel
  Then the diagram remains open
```

---

### E09-US08: Document Title

**As a** user
**I want** to see and edit the document title
**So that** I know which file I'm working on

```gherkin
Scenario: Display filename
  Given I have a saved diagram open
  Then the filename appears in the browser tab
  And in the application header

Scenario: Unsaved indicator
  Given I have unsaved changes
  Then an asterisk (*) or dot appears next to the filename
  Example: "MyDiagram.ndio *"

Scenario: New document title
  Given I have a new unsaved diagram
  Then the title shows "Untitled" or "New Diagram"

Scenario: Edit document title
  Given I click on the document title in the header
  Then I can edit it inline
  And pressing Enter saves the new title
  And this becomes the filename when saving
```

---

### E09-US11: Confirm Before Closing Browser

**As a** user
**I want** to be warned before accidentally closing the browser
**So that** I don't lose unsaved work

```gherkin
Scenario: Browser close warning
  Given I have unsaved changes
  When I try to close the browser tab
  Then the browser shows a confirmation dialog
  And I must confirm to leave the page

Scenario: Refresh warning
  Given I have unsaved changes
  When I try to refresh the page
  Then the browser shows a confirmation dialog

Scenario: No warning when saved
  Given I have no unsaved changes
  When I close the browser tab
  Then no warning appears
  And the tab closes normally

Scenario: Warning after edit
  Given I saved my diagram
  And then made one more change
  Then closing the browser shows a warning
```

---

### E10-US01: Export to draw.io Format

**As a** user
**I want** to export my diagram in draw.io format
**So that** I can share it with draw.io users

```gherkin
Scenario: Export as .drawio
  Given I select "File > Export > draw.io (.drawio)"
  Then a file is generated in mxGraph XML format
  And I can download it with .drawio extension

Scenario: Shapes preserved
  Given I export a diagram with rectangles, ellipses
  When I open in draw.io
  Then all shapes appear with correct positions and sizes

Scenario: Connections preserved
  Given I export a diagram with connections
  When I open in draw.io
  Then connections appear attached to correct shapes
  And arrow styles are preserved

Scenario: Text preserved
  Given I export a diagram with text in shapes
  When I open in draw.io
  Then text content and basic formatting preserved

Scenario: Styles preserved
  Given I export shapes with custom fill, stroke colors
  When I open in draw.io
  Then colors match exactly

Scenario: Export only selection
  Given I have shapes selected
  When I export to draw.io
  Then I can choose to export only selected shapes
```

---

### E10-US02: Import draw.io Files

**As a** user
**I want** to open draw.io files
**So that** I can edit diagrams created in draw.io

```gherkin
Scenario: Open .drawio file
  Given I open a .drawio file
  Then the diagram is rendered correctly
  And shapes appear in their positions
  And connections are attached properly

Scenario: Unsupported features warning
  Given I open a .drawio file with advanced features
  Then a warning lists what couldn't be imported
  Examples: custom stencils, scripts, embedded images
  And the rest of the diagram loads correctly

Scenario: Basic shapes imported
  Given a draw.io file has rectangles, ellipses, text
  When I import it
  Then these shapes are converted to native shapes

Scenario: Connections imported
  Given a draw.io file has connected shapes
  When I import it
  Then connections are created between shapes
  And connection styles are approximated

Scenario: Groups imported
  Given a draw.io file has grouped shapes
  When I import it
  Then groups are created in our format
```

---

### E10-US03: Style Mapping

**As a** user
**I want** styles to map correctly between formats
**So that** my diagrams look the same

```gherkin
Scenario: Fill colors match
  Given I have a shape with fill color #FF5733
  When I export to draw.io and open in draw.io
  Then the fill color is #FF5733

Scenario: Stroke styles map
  Given I have shapes with solid, dashed, dotted strokes
  When I export and import
  Then stroke styles are preserved or closely matched

Scenario: Font styles map
  Given I have text with bold, italic, specific font
  When I export and import
  Then font styles are preserved where possible

Scenario: Import unknown styles
  Given a draw.io file uses unsupported style
  Then a reasonable default is applied
  And no error occurs
```

---

### E10-US04: Connection Types Mapping

**As a** user
**I want** connection types to map correctly
**So that** my diagram structure is preserved

```gherkin
Scenario: Straight connections export
  Given I have straight connections
  When I export to draw.io
  Then they appear as straight edges

Scenario: Curved connections export
  Given I have curved (Bezier) connections
  When I export to draw.io
  Then they appear as curved edges (edgeStyle=curved)

Scenario: Arrow types preserved
  Given I have connections with various arrows
  When I export to draw.io
  Then arrow styles match draw.io equivalents

Scenario: Import curved edges
  Given a draw.io file has curved edges
  When I import
  Then they become curved connections
```

---

### E10-US05: Layer Compatibility

**As a** user
**I want** layers to work with draw.io
**So that** complex diagrams maintain organization

```gherkin
Scenario: Export layers
  Given I have a diagram with multiple layers
  When I export to draw.io
  Then layers appear as mxCell parents in the XML
  And draw.io recognizes them as layers

Scenario: Import layers
  Given a draw.io file has multiple pages/layers
  When I import it
  Then layers are created
  And shapes are on correct layers

Scenario: Layer visibility exported
  Given I have a hidden layer
  When I export to draw.io
  Then the layer visibility state is preserved
```

---

### E14-US01: Export as SVG

**As a** user
**I want** to export my diagram as SVG
**So that** I can use it in vector graphics software

```gherkin
Scenario: Export SVG
  Given I select "File > Export > SVG"
  Then an SVG file is generated
  And downloaded to my computer

Scenario: SVG renders correctly
  Given I export as SVG
  When I open in a browser or Illustrator
  Then all shapes and text appear correctly
  And it scales without pixelation

Scenario: SVG includes all elements
  Given I export as SVG
  Then shapes, connections, text are included
  And colors and styles are accurate

Scenario: Export selection as SVG
  Given I have shapes selected
  When I export as SVG
  Then I can choose to export only selection
```

---

### E14-US02: Export as PNG

**As a** user
**I want** to export my diagram as PNG
**So that** I can use it in documents and presentations

```gherkin
Scenario: Export PNG
  Given I select "File > Export > PNG"
  Then an export dialog appears
  And I can choose resolution (1x, 2x, 3x)
  And a PNG file is downloaded

Scenario: PNG quality options
  Given I export as PNG
  Then I can choose:
    - 1x (standard, 72-96 DPI)
    - 2x (retina, 144-192 DPI)
    - 3x (high resolution)

Scenario: Transparent background option
  Given I export as PNG
  Then I can choose transparent or white background

Scenario: Export selection as PNG
  Given I have shapes selected
  When I export as PNG
  Then I can export only the selection area

Scenario: PNG includes proper bounds
  Given I export as PNG
  Then the image has appropriate padding around content
```

---

### E14-US03: Export as PDF (Basic)

**As a** user
**I want** to export my diagram as PDF
**So that** I can print or share it professionally

```gherkin
Scenario: Export PDF
  Given I select "File > Export > PDF"
  Then a PDF file is generated
  And downloaded to my computer

Scenario: PDF page size
  Given I export as PDF
  Then I can choose page size (A4, Letter, Auto)

Scenario: PDF fits content
  Given my diagram is smaller than page size
  Then content is centered on the page
  And appropriate margins are applied
```

---

### E14-US04: Export as JSON

**As a** user
**I want** to export as JSON
**So that** I can programmatically process diagrams

```gherkin
Scenario: Export JSON
  Given I select "File > Export > JSON"
  Then a JSON file is downloaded
  And it contains full diagram data

Scenario: JSON is human-readable
  Given I export as JSON
  Then the JSON is formatted (pretty-printed)
  And keys are descriptive

Scenario: JSON can be re-imported
  Given I export as JSON
  When I import the JSON file
  Then the diagram is restored exactly
```

---

### E14-US05: Import from Image

**As a** user
**I want** to import images
**So that** I can include them in my diagrams

```gherkin
Scenario: Import image via menu
  Given I select "Insert > Image"
  Then a file picker opens for image files
  When I select an image (PNG, JPG, GIF, SVG)
  Then the image is added to the canvas as a shape

Scenario: Drag and drop image
  Given I drag an image file onto the canvas
  Then the image is inserted at the drop position

Scenario: Resize imported image
  Given I have an image on the canvas
  Then I can resize it using handles
  And aspect ratio can be locked with Shift

Scenario: Image as background
  Given I insert an image
  Then I can set it to be on the background layer
  And lock it to prevent accidental selection
```

---

### E14-US06: Copy as Image

**As a** user
**I want** to copy the diagram to clipboard as image
**So that** I can paste it directly into other apps

```gherkin
Scenario: Copy diagram as image
  Given I select "Edit > Copy as Image" or press Ctrl+Shift+C
  Then the entire diagram is copied to clipboard as PNG
  And I can paste it into Word, PowerPoint, etc.

Scenario: Copy selection as image
  Given I have shapes selected
  When I copy as image
  Then only the selection is copied

Scenario: Copy includes padding
  Given I copy as image
  Then appropriate padding is included around content
```

---

### E14-US07: Import from Clipboard

**As a** user
**I want** to paste images from clipboard
**So that** I can quickly add screenshots

```gherkin
Scenario: Paste image from clipboard
  Given I have an image in my clipboard (e.g., screenshot)
  When I press Ctrl+V
  Then the image is added to the canvas
  And positioned at center or cursor position

Scenario: Paste replaces selection
  Given I have shapes selected
  And I paste an image
  Then the image is added (selection not replaced)
  And image becomes selected
```

---

## Features Included

1. **Native File Format**
   - Save to .ndio (JSON-based)
   - Open .ndio files
   - Preserves all diagram data

2. **File Operations**
   - New, Open, Save, Save As
   - Close with save prompt
   - Document title display and editing

3. **Auto-Save**
   - Periodic save to localStorage
   - Recovery prompt on reload
   - Unsaved changes detection

4. **Recent Files**
   - List of recent files
   - Quick access to reopen
   - Clear recent files

5. **Browser Integration**
   - Drag and drop file opening
   - Browser close warning
   - Download-based saving

6. **draw.io Compatibility**
   - Export to .drawio format
   - Import .drawio files
   - Shape and style mapping
   - Connection type mapping
   - Layer export/import

7. **Export Formats**
   - SVG export (vector)
   - PNG export (raster with resolution options)
   - PDF export (basic)
   - JSON export

8. **Image Handling**
   - Import images from files
   - Paste images from clipboard
   - Copy diagram as image

---

## Features Excluded (Deferred)

- Template Support (E09-US09) - P3, future phase
- File Information dialog (E09-US10) - P3, future
- Batch Export (E14-US08) - P3, future
- Cloud storage - Phase 10
- Full XML compression - basic support only
- PDF multi-page - future enhancement

---

## Dependencies on Previous Phases

### Phase 0-8 Requirements
- Complete diagram data model
- All shape types
- Connection system with all styles
- Groups and layers
- History system
- Full styling system

### Required from Previous Phases

| Component/File | Usage |
|----------------|-------|
| `useDiagramStore` | Full diagram state for serialization |
| `useLayerStore` | Layer data for file format |
| `useGroupStore` | Group data for file format |
| `Shape`, `Connection` types | Serialization |
| Canvas component | Image export rendering |

---

## Definition of Done

### Native File Format
- [ ] Save diagram to .ndio file
- [ ] Open .ndio file
- [ ] All data preserved on round-trip

### File Operations
- [ ] Ctrl+N creates new diagram (with save prompt)
- [ ] Ctrl+O opens file picker
- [ ] Ctrl+S saves/downloads file
- [ ] Ctrl+Shift+S saves as new file
- [ ] Document title displayed and editable

### Auto-Save
- [ ] Auto-saves to localStorage every 30s
- [ ] Recovery prompt on reload
- [ ] Unsaved indicator shows

### Browser Integration
- [ ] Drag and drop opens files
- [ ] Browser close warning when unsaved
- [ ] Recent files accessible

### draw.io Compatibility
- [ ] Export produces valid .drawio file
- [ ] Import reads .drawio files
- [ ] Shapes, connections, styles preserved
- [ ] Layers exported and imported

### Export
- [ ] SVG export works
- [ ] PNG export with resolution options
- [ ] PDF export (basic)
- [ ] JSON export for data

### Images
- [ ] Can import image files
- [ ] Can paste images from clipboard
- [ ] Can copy diagram as image

---

## Test Scenarios

### Save/Open Tests

1. **Save and Open Native Format**
   - Create diagram with shapes, connections, groups
   - Save as .ndio
   - Open saved file
   - Verify all data intact

2. **Save Prompt on New**
   - Make changes, don't save
   - Press Ctrl+N
   - Verify prompt appears

### Auto-Save Tests

3. **Auto-Save Recovery**
   - Create diagram
   - Wait for auto-save
   - Close browser (force quit)
   - Reopen, verify recovery prompt

### draw.io Tests

4. **Export to draw.io**
   - Create diagram
   - Export as .drawio
   - Open in draw.io app
   - Verify shapes and connections

5. **Import from draw.io**
   - Open draw.io-created file
   - Verify shapes import
   - Verify connections import

### Export Tests

6. **SVG Export Quality**
   - Export as SVG
   - Open in browser
   - Zoom in, verify sharp

7. **PNG Resolution**
   - Export at 2x resolution
   - Verify image dimensions doubled

### Image Tests

8. **Paste Screenshot**
   - Take screenshot
   - Paste into app
   - Verify image appears

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Save 1000 shapes | < 1 second |
| Open 1000 shapes | < 2 seconds |
| Auto-save | < 500ms (non-blocking) |
| SVG export | < 1 second |
| PNG export (2x) | < 3 seconds |
| draw.io import | < 3 seconds |

---

## Notes for Implementation

### Native File Format Structure

```typescript
// .ndio file format (JSON)
interface NdioFile {
  version: string;          // File format version
  metadata: {
    title: string;
    created: number;
    modified: number;
    author?: string;
  };
  diagram: {
    shapes: Record<string, Shape>;
    connections: Record<string, Connection>;
    groups: Record<string, Group>;
    layers: Layer[];
    layerOrder: string[];
  };
  viewport: {
    zoom: number;
    panOffset: Point;
  };
  settings: {
    gridVisible: boolean;
    gridSize: number;
    snapToGrid: boolean;
  };
}
```

### draw.io XML Structure (mxGraph)

```xml
<mxfile>
  <diagram name="Page-1">
    <mxGraphModel>
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <!-- Shapes -->
        <mxCell id="shape1" value="Label"
                style="rounded=0;whiteSpace=wrap;html=1;"
                vertex="1" parent="1">
          <mxGeometry x="100" y="100" width="120" height="60" as="geometry" />
        </mxCell>
        <!-- Connections -->
        <mxCell id="edge1" value=""
                style="edgeStyle=orthogonalEdgeStyle;endArrow=classic;"
                edge="1" parent="1" source="shape1" target="shape2">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

### Browser File API Usage

```typescript
// Save file (download)
function saveFile(data: NdioFile, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.ndio') ? filename : `${filename}.ndio`;
  a.click();
  URL.revokeObjectURL(url);
}

// Open file (input element)
function openFile(): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ndio,.drawio,.xml';
    input.onchange = () => {
      if (input.files?.[0]) {
        resolve(input.files[0]);
      } else {
        reject(new Error('No file selected'));
      }
    };
    input.click();
  });
}
```

### Auto-Save Implementation

```typescript
const AUTO_SAVE_KEY = 'naive-draw-autosave';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

function setupAutoSave(): void {
  let isDirty = false;

  // Mark as dirty on changes
  useDiagramStore.subscribe(() => {
    isDirty = true;
  });

  // Periodic save
  setInterval(() => {
    if (isDirty) {
      const data = serializeDiagram();
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
      isDirty = false;
    }
  }, AUTO_SAVE_INTERVAL);

  // Save before unload
  window.addEventListener('beforeunload', (e) => {
    if (isDirty) {
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify({
        data: serializeDiagram(),
        timestamp: Date.now(),
      }));
    }
  });
}
```

### Browser Close Warning

```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
      return ''; // Message for older browsers
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges]);
```

### SVG Export

```typescript
function exportSVG(includeStyles: boolean = true): string {
  const svgElement = canvasRef.current?.querySelector('svg');
  if (!svgElement) throw new Error('No SVG found');

  // Clone to avoid modifying original
  const clone = svgElement.cloneNode(true) as SVGElement;

  // Remove UI elements (selection handles, grid, etc.)
  clone.querySelectorAll('[data-ui-element]').forEach(el => el.remove());

  // Embed styles if requested
  if (includeStyles) {
    const styles = document.createElement('style');
    styles.textContent = getEmbeddedStyles();
    clone.insertBefore(styles, clone.firstChild);
  }

  // Set viewBox to content bounds
  const bounds = calculateContentBounds();
  clone.setAttribute('viewBox',
    `${bounds.x - 10} ${bounds.y - 10} ${bounds.width + 20} ${bounds.height + 20}`
  );

  return new XMLSerializer().serializeToString(clone);
}
```

### PNG Export

```typescript
async function exportPNG(scale: number = 1): Promise<Blob> {
  const svg = exportSVG();
  const bounds = calculateContentBounds();

  const canvas = document.createElement('canvas');
  canvas.width = (bounds.width + 20) * scale;
  canvas.height = (bounds.height + 20) * scale;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  // Optional: white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render SVG to canvas
  const img = new Image();
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });

  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(url);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}
```
