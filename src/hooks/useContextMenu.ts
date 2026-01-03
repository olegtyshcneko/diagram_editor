import { useState, useCallback, useMemo } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useHistoryStore } from '@/stores/historyStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useHistory } from '@/hooks/useHistory';
import type { Point } from '@/types/common';
import type { ContextMenuType, ContextMenuState, ContextMenuEntry } from '@/types/contextMenu';
import type { Shape } from '@/types/shapes';
import type { Connection } from '@/types/connections';
import type { AlignmentType } from '@/types/selection';
import { EMPTY_CONNECTION_DELTA } from '@/types/history';

/**
 * Hook for managing context menu state and providing menu items
 */
export function useContextMenu() {
  const [menuState, setMenuState] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    type: 'canvas',
  });

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
  const bringToFront = useDiagramStore((s) => s.bringToFront);
  const sendToBack = useDiagramStore((s) => s.sendToBack);
  const bringForward = useDiagramStore((s) => s.bringForward);
  const sendBackward = useDiagramStore((s) => s.sendBackward);
  const alignShapes = useDiagramStore((s) => s.alignShapes);
  const distributeShapes = useDiagramStore((s) => s.distributeShapes);

  // History
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const { undo, redo, canUndo, canRedo } = useHistory();

  // Preferences
  const toggleGrid = usePreferencesStore((s) => s.toggleGrid);
  const showGrid = usePreferencesStore((s) => s.showGrid);

  // Open context menu
  const openMenu = useCallback((
    position: Point,
    type: ContextMenuType,
    targetId?: string
  ) => {
    setMenuState({
      isOpen: true,
      position,
      type,
      targetId,
    });
  }, []);

  // Close context menu
  const closeMenu = useCallback(() => {
    setMenuState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Delete with history tracking
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

    if (hasConnections) {
      deleteSelectedConnections();
    }
    if (hasShapes) {
      deleteSelectedShapes();
    }

    const description = hasShapes
      ? deletedShapes.length === 1
        ? 'Delete Shape'
        : `Delete ${deletedShapes.length} Shapes`
      : deletedConnections.length === 1
        ? 'Delete Connection'
        : `Delete ${deletedConnections.length} Connections`;

    pushEntry({
      type: 'DELETE_SHAPES',
      description,
      shapeDelta: {
        added: [],
        removed: deletedShapes,
        modified: [],
      },
      connectionDelta: {
        added: [],
        removed: deletedConnections,
        modified: [],
      },
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
        shapeDelta: {
          added: addedShapes,
          removed: [],
          modified: [],
        },
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
        shapeDelta: {
          added: addedShapes,
          removed: [],
          modified: [],
        },
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
    // Capture positions before
    const beforePositions = selectedShapeIds.map((id) => {
      const shape = shapes[id];
      return { id, before: { x: shape.x, y: shape.y } };
    });

    alignShapes(alignment);

    // Capture positions after
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
    // Capture positions before
    const beforePositions = selectedShapeIds.map((id) => {
      const shape = shapes[id];
      return { id, before: { x: shape.x, y: shape.y } };
    });

    distributeShapes(direction);

    // Capture positions after
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
  const handleZOrder = useCallback((
    action: 'bringToFront' | 'sendToBack' | 'bringForward' | 'sendBackward'
  ) => {
    // Capture zIndex before
    const beforeZIndexes = selectedShapeIds.map((id) => ({
      id,
      before: { zIndex: shapes[id].zIndex },
    }));

    // Perform action
    switch (action) {
      case 'bringToFront': bringToFront(); break;
      case 'sendToBack': sendToBack(); break;
      case 'bringForward': bringForward(); break;
      case 'sendBackward': sendBackward(); break;
    }

    // Capture zIndex after
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

  // Generate menu items based on context
  const menuItems = useMemo<ContextMenuEntry[]>(() => {
    const hasSelection = selectedShapeIds.length > 0;
    const hasMultiSelection = selectedShapeIds.length > 1;

    switch (menuState.type) {
      case 'shape':
        return [
          { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X', action: handleCut, disabled: !hasSelection },
          { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C', action: () => { copySelection(); closeMenu(); }, disabled: !hasSelection },
          { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V', action: handlePaste, disabled: !clipboard },
          { id: 'duplicate', label: 'Duplicate', shortcut: 'Ctrl+D', action: handleDuplicate, disabled: !hasSelection },
          { separator: true },
          { id: 'bringToFront', label: 'Bring to Front', shortcut: 'Ctrl+Shift+]', action: () => handleZOrder('bringToFront') },
          { id: 'bringForward', label: 'Bring Forward', shortcut: 'Ctrl+]', action: () => handleZOrder('bringForward') },
          { id: 'sendBackward', label: 'Send Backward', shortcut: 'Ctrl+[', action: () => handleZOrder('sendBackward') },
          { id: 'sendToBack', label: 'Send to Back', shortcut: 'Ctrl+Shift+[', action: () => handleZOrder('sendToBack') },
          { separator: true },
          { id: 'delete', label: 'Delete', shortcut: 'Del', action: handleDelete },
        ];

      case 'multiSelect':
        return [
          { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X', action: handleCut },
          { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C', action: () => { copySelection(); closeMenu(); } },
          { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V', action: handlePaste, disabled: !clipboard },
          { id: 'duplicate', label: 'Duplicate', shortcut: 'Ctrl+D', action: handleDuplicate },
          { separator: true },
          { id: 'alignLeft', label: 'Align Left', action: () => handleAlign('left'), disabled: !hasMultiSelection },
          { id: 'alignCenter', label: 'Align Center', action: () => handleAlign('centerHorizontal'), disabled: !hasMultiSelection },
          { id: 'alignRight', label: 'Align Right', action: () => handleAlign('right'), disabled: !hasMultiSelection },
          { id: 'alignTop', label: 'Align Top', action: () => handleAlign('top'), disabled: !hasMultiSelection },
          { id: 'alignMiddle', label: 'Align Middle', action: () => handleAlign('centerVertical'), disabled: !hasMultiSelection },
          { id: 'alignBottom', label: 'Align Bottom', action: () => handleAlign('bottom'), disabled: !hasMultiSelection },
          { separator: true },
          { id: 'distributeH', label: 'Distribute Horizontally', action: () => handleDistribute('horizontal'), disabled: selectedShapeIds.length < 3 },
          { id: 'distributeV', label: 'Distribute Vertically', action: () => handleDistribute('vertical'), disabled: selectedShapeIds.length < 3 },
          { separator: true },
          { id: 'bringToFront', label: 'Bring to Front', action: () => handleZOrder('bringToFront') },
          { id: 'sendToBack', label: 'Send to Back', action: () => handleZOrder('sendToBack') },
          { separator: true },
          { id: 'delete', label: 'Delete', shortcut: 'Del', action: handleDelete },
        ];

      case 'canvas':
        return [
          { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V', action: handlePaste, disabled: !clipboard },
          { separator: true },
          { id: 'selectAll', label: 'Select All', shortcut: 'Ctrl+A', action: () => { selectAll(); closeMenu(); } },
          { separator: true },
          { id: 'toggleGrid', label: showGrid ? 'Hide Grid' : 'Show Grid', shortcut: 'Ctrl+G', action: () => { toggleGrid(); closeMenu(); } },
          { separator: true },
          { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', action: () => { undo(); closeMenu(); }, disabled: !canUndo() },
          { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Y', action: () => { redo(); closeMenu(); }, disabled: !canRedo() },
        ];

      case 'connection':
        return [
          { id: 'delete', label: 'Delete Connection', shortcut: 'Del', action: handleDelete },
        ];

      default:
        return [];
    }
  }, [
    menuState.type,
    selectedShapeIds,
    clipboard,
    showGrid,
    handleCut,
    copySelection,
    handlePaste,
    handleDuplicate,
    handleDelete,
    handleAlign,
    handleDistribute,
    handleZOrder,
    selectAll,
    toggleGrid,
    undo,
    redo,
    canUndo,
    canRedo,
    closeMenu,
  ]);

  return {
    isOpen: menuState.isOpen,
    position: menuState.position,
    type: menuState.type,
    menuItems,
    openMenu,
    closeMenu,
  };
}
