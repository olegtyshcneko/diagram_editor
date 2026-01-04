import { useState, useCallback } from 'react';
import { Menu } from './Menu';
import { MenuItem, MenuSeparator } from './MenuItem';
import { useDiagramStore } from '@/stores/diagramStore';
import { useHistoryStore } from '@/stores/historyStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useGroupStore } from '@/stores/groupStore';
import { useHistory } from '@/hooks/useHistory';
import { EMPTY_CONNECTION_DELTA } from '@/types/history';
import { isCompleteGroupSelected } from '@/lib/groupUtils';
import type { Shape } from '@/types/shapes';
import type { Connection } from '@/types/connections';
import type { AlignmentType } from '@/types/selection';

export function MenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Diagram store
  const shapes = useDiagramStore((s) => s.shapes);
  const connections = useDiagramStore((s) => s.connections);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const selectedConnectionIds = useDiagramStore((s) => s.selectedConnectionIds);
  const selectAll = useDiagramStore((s) => s.selectAll);
  const copySelection = useDiagramStore((s) => s.copySelection);
  const deleteSelectedShapes = useDiagramStore((s) => s.deleteSelectedShapes);
  const deleteSelectedConnections = useDiagramStore((s) => s.deleteSelectedConnections);
  const clipboard = useDiagramStore((s) => s.clipboard);
  const pasteClipboard = useDiagramStore((s) => s.pasteClipboard);
  const duplicateSelection = useDiagramStore((s) => s.duplicateSelection);
  const alignShapes = useDiagramStore((s) => s.alignShapes);
  const distributeShapes = useDiagramStore((s) => s.distributeShapes);
  const bringToFront = useDiagramStore((s) => s.bringToFront);
  const sendToBack = useDiagramStore((s) => s.sendToBack);
  const bringForward = useDiagramStore((s) => s.bringForward);
  const sendBackward = useDiagramStore((s) => s.sendBackward);

  // History
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const currentEntry = useHistoryStore((s) => {
    const { past } = s;
    return past.length > 0 ? past[past.length - 1] : null;
  });
  const futureEntry = useHistoryStore((s) => {
    const { future } = s;
    return future.length > 0 ? future[0] : null;
  });
  const { undo, redo, canUndo, canRedo } = useHistory();

  // Preferences
  const showGrid = usePreferencesStore((s) => s.showGrid);
  const snapToGrid = usePreferencesStore((s) => s.snapToGrid);
  const toggleGrid = usePreferencesStore((s) => s.toggleGrid);
  const toggleSnapToGrid = usePreferencesStore((s) => s.toggleSnapToGrid);

  // Viewport
  const viewport = useViewportStore((s) => s.viewport);
  const setViewport = useViewportStore((s) => s.setViewport);
  const resetView = useViewportStore((s) => s.resetView);

  // Groups
  const groups = useGroupStore((s) => s.groups);
  const createGroup = useGroupStore((s) => s.createGroup);
  const ungroup = useGroupStore((s) => s.ungroup);
  const updateShape = useDiagramStore((s) => s.updateShape);

  const hasSelection = selectedShapeIds.length > 0;
  const hasMultiSelection = selectedShapeIds.length > 1;
  const selectedGroup = isCompleteGroupSelected(selectedShapeIds, groups);

  const closeMenu = useCallback(() => setOpenMenu(null), []);

  // Delete with history
  const handleDelete = useCallback(() => {
    const hasShapes = selectedShapeIds.length > 0;
    const hasConnections = selectedConnectionIds.length > 0;

    if (!hasShapes && !hasConnections) return;

    const deletedShapes: Shape[] = selectedShapeIds
      .map((id) => shapes[id])
      .filter((s): s is Shape => s !== undefined);

    const deletedConnectionIds = new Set<string>(selectedConnectionIds);
    Object.values(connections).forEach((conn) => {
      if (selectedShapeIds.includes(conn.sourceShapeId) ||
          (conn.targetShapeId && selectedShapeIds.includes(conn.targetShapeId))) {
        deletedConnectionIds.add(conn.id);
      }
    });

    const deletedConnections: Connection[] = Array.from(deletedConnectionIds)
      .map((id) => connections[id])
      .filter((c): c is Connection => c !== undefined);

    if (hasConnections) deleteSelectedConnections();
    if (hasShapes) deleteSelectedShapes();

    const description = hasShapes
      ? deletedShapes.length === 1 ? 'Delete Shape' : `Delete ${deletedShapes.length} Shapes`
      : deletedConnections.length === 1 ? 'Delete Connection' : `Delete ${deletedConnections.length} Connections`;

    pushEntry({
      type: 'DELETE_SHAPES',
      description,
      shapeDelta: { added: [], removed: deletedShapes, modified: [] },
      connectionDelta: { added: [], removed: deletedConnections, modified: [] },
      selectionBefore: selectedShapeIds,
      selectionAfter: [],
    });

    closeMenu();
  }, [selectedShapeIds, selectedConnectionIds, shapes, connections, deleteSelectedShapes, deleteSelectedConnections, pushEntry, closeMenu]);

  // Paste with history
  const handlePaste = useCallback(() => {
    const selectionBefore = [...selectedShapeIds];
    pasteClipboard();

    const state = useDiagramStore.getState();
    const newShapeIds = state.selectedShapeIds;
    const addedShapes: Shape[] = newShapeIds
      .map((id) => state.shapes[id])
      .filter((s): s is Shape => s !== undefined);

    if (addedShapes.length > 0) {
      pushEntry({
        type: 'PASTE',
        description: addedShapes.length === 1 ? 'Paste Shape' : `Paste ${addedShapes.length} Shapes`,
        shapeDelta: { added: addedShapes, removed: [], modified: [] },
        connectionDelta: EMPTY_CONNECTION_DELTA,
        selectionBefore,
        selectionAfter: newShapeIds,
      });
    }

    closeMenu();
  }, [selectedShapeIds, pasteClipboard, pushEntry, closeMenu]);

  // Duplicate with history
  const handleDuplicate = useCallback(() => {
    const selectionBefore = [...selectedShapeIds];
    duplicateSelection();

    const state = useDiagramStore.getState();
    const newShapeIds = state.selectedShapeIds;
    const addedShapes: Shape[] = newShapeIds
      .map((id) => state.shapes[id])
      .filter((s): s is Shape => s !== undefined);

    if (addedShapes.length > 0) {
      pushEntry({
        type: 'DUPLICATE',
        description: addedShapes.length === 1 ? 'Duplicate Shape' : `Duplicate ${addedShapes.length} Shapes`,
        shapeDelta: { added: addedShapes, removed: [], modified: [] },
        connectionDelta: EMPTY_CONNECTION_DELTA,
        selectionBefore,
        selectionAfter: newShapeIds,
      });
    }

    closeMenu();
  }, [selectedShapeIds, duplicateSelection, pushEntry, closeMenu]);

  // Cut with history
  const handleCut = useCallback(() => {
    copySelection();
    handleDelete();
  }, [copySelection, handleDelete]);

  // Align with history
  const handleAlign = useCallback((alignment: AlignmentType) => {
    const beforePositions = selectedShapeIds.map((id) => ({
      id,
      before: { x: shapes[id].x, y: shapes[id].y },
    }));

    alignShapes(alignment);

    const state = useDiagramStore.getState();
    const modifications = beforePositions.map(({ id, before }) => ({
      id,
      before,
      after: { x: state.shapes[id].x, y: state.shapes[id].y },
    }));

    pushEntry({
      type: 'ALIGN',
      description: `Align ${alignment}`,
      shapeDelta: { added: [], removed: [], modified: modifications },
      connectionDelta: EMPTY_CONNECTION_DELTA,
      selectionBefore: selectedShapeIds,
      selectionAfter: selectedShapeIds,
    });

    closeMenu();
  }, [selectedShapeIds, shapes, alignShapes, pushEntry, closeMenu]);

  // Distribute with history
  const handleDistribute = useCallback((direction: 'horizontal' | 'vertical') => {
    const beforePositions = selectedShapeIds.map((id) => ({
      id,
      before: { x: shapes[id].x, y: shapes[id].y },
    }));

    distributeShapes(direction);

    const state = useDiagramStore.getState();
    const modifications = beforePositions.map(({ id, before }) => ({
      id,
      before,
      after: { x: state.shapes[id].x, y: state.shapes[id].y },
    }));

    pushEntry({
      type: 'DISTRIBUTE',
      description: `Distribute ${direction}`,
      shapeDelta: { added: [], removed: [], modified: modifications },
      connectionDelta: EMPTY_CONNECTION_DELTA,
      selectionBefore: selectedShapeIds,
      selectionAfter: selectedShapeIds,
    });

    closeMenu();
  }, [selectedShapeIds, shapes, distributeShapes, pushEntry, closeMenu]);

  // Z-order with history
  const handleZOrder = useCallback((action: 'bringToFront' | 'sendToBack' | 'bringForward' | 'sendBackward') => {
    const beforeZIndexes = selectedShapeIds.map((id) => ({
      id,
      before: { zIndex: shapes[id].zIndex },
    }));

    switch (action) {
      case 'bringToFront': bringToFront(); break;
      case 'sendToBack': sendToBack(); break;
      case 'bringForward': bringForward(); break;
      case 'sendBackward': sendBackward(); break;
    }

    const state = useDiagramStore.getState();
    const modifications = beforeZIndexes.map(({ id, before }) => ({
      id,
      before,
      after: { zIndex: state.shapes[id].zIndex },
    }));

    const descriptions: Record<string, string> = {
      bringToFront: 'Bring to Front',
      sendToBack: 'Send to Back',
      bringForward: 'Bring Forward',
      sendBackward: 'Send Backward',
    };

    pushEntry({
      type: 'Z_ORDER',
      description: descriptions[action],
      shapeDelta: { added: [], removed: [], modified: modifications },
      connectionDelta: EMPTY_CONNECTION_DELTA,
      selectionBefore: selectedShapeIds,
      selectionAfter: selectedShapeIds,
    });

    closeMenu();
  }, [selectedShapeIds, shapes, bringToFront, sendToBack, bringForward, sendBackward, pushEntry, closeMenu]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setViewport({ zoom: Math.min(viewport.zoom * 1.25, 4) });
    closeMenu();
  }, [viewport.zoom, setViewport, closeMenu]);

  const handleZoomOut = useCallback(() => {
    setViewport({ zoom: Math.max(viewport.zoom / 1.25, 0.1) });
    closeMenu();
  }, [viewport.zoom, setViewport, closeMenu]);

  const handleZoom100 = useCallback(() => {
    resetView();
    closeMenu();
  }, [resetView, closeMenu]);

  // Group with history
  const handleGroup = useCallback(() => {
    if (selectedShapeIds.length < 2) return;

    const selectionBefore = [...selectedShapeIds];

    // Create the group
    const groupId = createGroup(selectedShapeIds);
    if (!groupId) return;

    // Update shapes with groupId
    for (const id of selectedShapeIds) {
      updateShape(id, { groupId });
    }

    // Push history entry
    pushEntry({
      type: 'GROUP',
      description: `Group ${selectedShapeIds.length} shapes`,
      shapeDelta: {
        added: [],
        removed: [],
        modified: selectedShapeIds.map((id) => ({
          id,
          before: { groupId: undefined },
          after: { groupId },
        })),
      },
      connectionDelta: EMPTY_CONNECTION_DELTA,
      selectionBefore,
      selectionAfter: selectedShapeIds,
    });

    closeMenu();
  }, [selectedShapeIds, createGroup, updateShape, pushEntry, closeMenu]);

  // Ungroup with history
  const handleUngroup = useCallback(() => {
    if (!selectedGroup) return;

    const selectionBefore = [...selectedShapeIds];
    const groupId = selectedGroup.id;
    const memberIds = [...selectedGroup.memberIds];

    // Ungroup
    ungroup(groupId);

    // Clear groupId from shapes
    for (const id of memberIds) {
      updateShape(id, { groupId: undefined });
    }

    // Push history entry
    pushEntry({
      type: 'UNGROUP',
      description: `Ungroup ${memberIds.length} shapes`,
      shapeDelta: {
        added: [],
        removed: [],
        modified: memberIds.map((id) => ({
          id,
          before: { groupId },
          after: { groupId: undefined },
        })),
      },
      connectionDelta: EMPTY_CONNECTION_DELTA,
      selectionBefore,
      selectionAfter: memberIds,
    });

    closeMenu();
  }, [selectedGroup, selectedShapeIds, ungroup, updateShape, pushEntry, closeMenu]);

  // Build undo/redo labels
  const undoLabel = canUndo() && currentEntry
    ? `Undo ${currentEntry.description}`
    : 'Undo';
  const redoLabel = canRedo() && futureEntry
    ? `Redo ${futureEntry.description}`
    : 'Redo';

  return (
    <header className="h-10 bg-white border-b border-gray-200 flex items-center px-4 gap-1">
      <span className="font-semibold text-gray-800 mr-4">Naive Draw.io</span>

      {/* Edit Menu */}
      <Menu
        label="Edit"
        isOpen={openMenu === 'edit'}
        onOpen={() => setOpenMenu('edit')}
        onClose={closeMenu}
      >
        <MenuItem
          label={undoLabel}
          shortcut="Ctrl+Z"
          disabled={!canUndo()}
          onClick={() => { undo(); closeMenu(); }}
        />
        <MenuItem
          label={redoLabel}
          shortcut="Ctrl+Y"
          disabled={!canRedo()}
          onClick={() => { redo(); closeMenu(); }}
        />
        <MenuSeparator />
        <MenuItem
          label="Cut"
          shortcut="Ctrl+X"
          disabled={!hasSelection}
          onClick={handleCut}
        />
        <MenuItem
          label="Copy"
          shortcut="Ctrl+C"
          disabled={!hasSelection}
          onClick={() => { copySelection(); closeMenu(); }}
        />
        <MenuItem
          label="Paste"
          shortcut="Ctrl+V"
          disabled={!clipboard}
          onClick={handlePaste}
        />
        <MenuItem
          label="Duplicate"
          shortcut="Ctrl+D"
          disabled={!hasSelection}
          onClick={handleDuplicate}
        />
        <MenuSeparator />
        <MenuItem
          label="Delete"
          shortcut="Del"
          disabled={!hasSelection && selectedConnectionIds.length === 0}
          onClick={handleDelete}
        />
        <MenuSeparator />
        <MenuItem
          label="Select All"
          shortcut="Ctrl+A"
          onClick={() => { selectAll(); closeMenu(); }}
        />
      </Menu>

      {/* View Menu */}
      <Menu
        label="View"
        isOpen={openMenu === 'view'}
        onOpen={() => setOpenMenu('view')}
        onClose={closeMenu}
      >
        <MenuItem
          label="Show Grid"
          shortcut="G"
          checked={showGrid}
          onClick={() => { toggleGrid(); closeMenu(); }}
        />
        <MenuItem
          label="Snap to Grid"
          shortcut="Shift+G"
          checked={snapToGrid}
          onClick={() => { toggleSnapToGrid(); closeMenu(); }}
        />
        <MenuSeparator />
        <MenuItem
          label="Zoom In"
          shortcut="Ctrl++"
          onClick={handleZoomIn}
        />
        <MenuItem
          label="Zoom Out"
          shortcut="Ctrl+-"
          onClick={handleZoomOut}
        />
        <MenuItem
          label="Zoom to 100%"
          shortcut="Ctrl+0"
          onClick={handleZoom100}
        />
        <MenuSeparator />
        <MenuItem
          label={`Zoom: ${Math.round(viewport.zoom * 100)}%`}
          disabled
          onClick={() => {}}
        />
      </Menu>

      {/* Arrange Menu */}
      <Menu
        label="Arrange"
        isOpen={openMenu === 'arrange'}
        onOpen={() => setOpenMenu('arrange')}
        onClose={closeMenu}
      >
        <MenuItem
          label="Bring to Front"
          shortcut="Ctrl+Shift+]"
          disabled={!hasSelection}
          onClick={() => handleZOrder('bringToFront')}
        />
        <MenuItem
          label="Bring Forward"
          shortcut="Ctrl+]"
          disabled={!hasSelection}
          onClick={() => handleZOrder('bringForward')}
        />
        <MenuItem
          label="Send Backward"
          shortcut="Ctrl+["
          disabled={!hasSelection}
          onClick={() => handleZOrder('sendBackward')}
        />
        <MenuItem
          label="Send to Back"
          shortcut="Ctrl+Shift+["
          disabled={!hasSelection}
          onClick={() => handleZOrder('sendToBack')}
        />
        <MenuSeparator />
        <MenuItem
          label="Align Left"
          disabled={!hasMultiSelection}
          onClick={() => handleAlign('left')}
        />
        <MenuItem
          label="Align Center"
          disabled={!hasMultiSelection}
          onClick={() => handleAlign('centerHorizontal')}
        />
        <MenuItem
          label="Align Right"
          disabled={!hasMultiSelection}
          onClick={() => handleAlign('right')}
        />
        <MenuSeparator />
        <MenuItem
          label="Align Top"
          disabled={!hasMultiSelection}
          onClick={() => handleAlign('top')}
        />
        <MenuItem
          label="Align Middle"
          disabled={!hasMultiSelection}
          onClick={() => handleAlign('centerVertical')}
        />
        <MenuItem
          label="Align Bottom"
          disabled={!hasMultiSelection}
          onClick={() => handleAlign('bottom')}
        />
        <MenuSeparator />
        <MenuItem
          label="Distribute Horizontally"
          disabled={selectedShapeIds.length < 3}
          onClick={() => handleDistribute('horizontal')}
        />
        <MenuItem
          label="Distribute Vertically"
          disabled={selectedShapeIds.length < 3}
          onClick={() => handleDistribute('vertical')}
        />
        <MenuSeparator />
        <MenuItem
          label="Group"
          shortcut="Ctrl+G"
          disabled={!hasMultiSelection}
          onClick={handleGroup}
        />
        <MenuItem
          label="Ungroup"
          shortcut="Ctrl+Shift+G"
          disabled={!selectedGroup}
          onClick={handleUngroup}
        />
      </Menu>
    </header>
  );
}
