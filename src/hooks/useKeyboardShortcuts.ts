import { useEffect, useCallback } from 'react';
import { useInteractionStore } from '@/stores/interactionStore';
import { useDiagramStore } from '@/stores/diagramStore';
import { useHistoryStore } from '@/stores/historyStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useGroupStore } from '@/stores/groupStore';
import { useHistory } from '@/hooks/useHistory';
import { KEYBOARD } from '@/lib/constants';
import { EMPTY_CONNECTION_DELTA } from '@/types/history';
import { isCompleteGroupSelected } from '@/lib/groupUtils';
import type { Shape } from '@/types/shapes';
import type { Connection } from '@/types/connections';

export function useKeyboardShortcuts() {
  const setActiveTool = useInteractionStore((s) => s.setActiveTool);
  const cancelCreation = useInteractionStore((s) => s.cancelCreation);
  const creationState = useInteractionStore((s) => s.creationState);
  const manipulationState = useInteractionStore((s) => s.manipulationState);
  const connectionCreationState = useInteractionStore((s) => s.connectionCreationState);
  const endConnectionCreation = useInteractionStore((s) => s.endConnectionCreation);
  const editingTextShapeId = useInteractionStore((s) => s.editingTextShapeId);
  const setEditingTextShapeId = useInteractionStore((s) => s.setEditingTextShapeId);

  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const selectedConnectionIds = useDiagramStore((s) => s.selectedConnectionIds);
  const shapes = useDiagramStore((s) => s.shapes);
  const connections = useDiagramStore((s) => s.connections);
  const updateShape = useDiagramStore((s) => s.updateShape);
  const deleteSelectedShapes = useDiagramStore((s) => s.deleteSelectedShapes);
  const deleteSelectedConnections = useDiagramStore((s) => s.deleteSelectedConnections);
  const selectAll = useDiagramStore((s) => s.selectAll);
  const copySelection = useDiagramStore((s) => s.copySelection);
  const pasteClipboard = useDiagramStore((s) => s.pasteClipboard);
  const duplicateSelection = useDiagramStore((s) => s.duplicateSelection);
  const clipboard = useDiagramStore((s) => s.clipboard);

  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const { undo, redo } = useHistory();

  const toggleGrid = usePreferencesStore((s) => s.toggleGrid);
  const toggleSnapToGrid = usePreferencesStore((s) => s.toggleSnapToGrid);

  const bringToFront = useDiagramStore((s) => s.bringToFront);
  const sendToBack = useDiagramStore((s) => s.sendToBack);
  const bringForward = useDiagramStore((s) => s.bringForward);
  const sendBackward = useDiagramStore((s) => s.sendBackward);

  const groups = useGroupStore((s) => s.groups);
  const createGroup = useGroupStore((s) => s.createGroup);
  const ungroup = useGroupStore((s) => s.ungroup);

  // Paste with history tracking
  const pasteWithHistory = useCallback(() => {
    const selectionBefore = [...selectedShapeIds];

    pasteClipboard();

    // Get the newly created shapes (they are now selected)
    const state = useDiagramStore.getState();
    const newShapeIds = state.selectedShapeIds;
    const addedShapes: Shape[] = newShapeIds
      .map((id) => state.shapes[id])
      .filter((s): s is Shape => s !== undefined);

    // Also get any connections between new shapes
    const addedConnections: Connection[] = Object.values(state.connections)
      .filter((conn) =>
        newShapeIds.includes(conn.sourceShapeId) &&
        conn.targetShapeId !== null &&
        newShapeIds.includes(conn.targetShapeId)
      );

    if (addedShapes.length > 0) {
      const description = addedShapes.length === 1 ? 'Paste Shape' : `Paste ${addedShapes.length} Shapes`;
      pushEntry({
        type: 'PASTE',
        description,
        shapeDelta: {
          added: addedShapes,
          removed: [],
          modified: [],
        },
        connectionDelta: {
          added: addedConnections,
          removed: [],
          modified: [],
        },
        selectionBefore,
        selectionAfter: newShapeIds,
      });
    }
  }, [selectedShapeIds, pasteClipboard, pushEntry]);

  // Duplicate with history tracking
  const duplicateWithHistory = useCallback(() => {
    const selectionBefore = [...selectedShapeIds];

    duplicateSelection();

    // Get the newly created shapes (they are now selected)
    const state = useDiagramStore.getState();
    const newShapeIds = state.selectedShapeIds;
    const addedShapes: Shape[] = newShapeIds
      .map((id) => state.shapes[id])
      .filter((s): s is Shape => s !== undefined);

    // Also get connections between new shapes
    const addedConnections: Connection[] = Object.values(state.connections)
      .filter((conn) =>
        newShapeIds.includes(conn.sourceShapeId) &&
        conn.targetShapeId !== null &&
        newShapeIds.includes(conn.targetShapeId)
      );

    if (addedShapes.length > 0) {
      const description = addedShapes.length === 1 ? 'Duplicate Shape' : `Duplicate ${addedShapes.length} Shapes`;
      pushEntry({
        type: 'DUPLICATE',
        description,
        shapeDelta: {
          added: addedShapes,
          removed: [],
          modified: [],
        },
        connectionDelta: {
          added: addedConnections,
          removed: [],
          modified: [],
        },
        selectionBefore,
        selectionAfter: newShapeIds,
      });
    }
  }, [selectedShapeIds, duplicateSelection, pushEntry]);

  // Delete shapes with history tracking
  const deleteWithHistory = useCallback(() => {
    const hasShapes = selectedShapeIds.length > 0;
    const hasConnections = selectedConnectionIds.length > 0;

    if (!hasShapes && !hasConnections) return;

    // Capture shapes and their connected connections before deletion
    const deletedShapes: Shape[] = selectedShapeIds
      .map((id) => shapes[id])
      .filter((s): s is Shape => s !== undefined);

    // Find connections that will be deleted (selected ones + ones connected to deleted shapes)
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

    // Execute deletion
    if (hasConnections) {
      deleteSelectedConnections();
    }
    if (hasShapes) {
      deleteSelectedShapes();
    }

    // Push history entry
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
  }, [selectedShapeIds, selectedConnectionIds, shapes, connections, deleteSelectedShapes, deleteSelectedConnections, pushEntry]);

  // Cut with history tracking (copy then delete with history)
  const cutWithHistory = useCallback(() => {
    copySelection();
    deleteWithHistory();
  }, [copySelection, deleteWithHistory]);

  // Z-order with history tracking
  const zOrderWithHistory = useCallback((
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
  }, [selectedShapeIds, shapes, bringToFront, sendToBack, bringForward, sendBackward, pushEntry]);

  // Group selected shapes with history tracking
  const groupWithHistory = useCallback(() => {
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
  }, [selectedShapeIds, createGroup, updateShape, pushEntry]);

  // Ungroup with history tracking
  const ungroupWithHistory = useCallback(() => {
    // Check if selection forms a complete group
    const selectedGroup = isCompleteGroupSelected(selectedShapeIds, groups);
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
  }, [selectedShapeIds, groups, ungroup, updateShape, pushEntry]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Don't handle tool shortcuts during manipulation
      const isDuringManipulation = manipulationState !== null;

      const hasSelection = selectedShapeIds.length > 0;
      const hasConnectionSelection = selectedConnectionIds.length > 0;
      const isEditingText = editingTextShapeId !== null;
      const isCreatingConnection = connectionCreationState !== null;
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      // Clipboard and edit shortcuts (only when not editing text)
      if (!isEditingText && ctrlOrMeta) {
        // Undo - Ctrl+Z
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
          return;
        }

        // Redo - Ctrl+Y or Ctrl+Shift+Z
        if (e.key === 'y' || (e.key === 'z' && e.shiftKey) || (e.key === 'Z' && e.shiftKey)) {
          e.preventDefault();
          redo();
          return;
        }

        // Select All - Ctrl+A
        if (e.key === 'a') {
          e.preventDefault();
          selectAll();
          return;
        }

        // Copy - Ctrl+C
        if (e.key === 'c' && hasSelection) {
          e.preventDefault();
          copySelection();
          return;
        }

        // Cut - Ctrl+X (with history)
        if (e.key === 'x' && hasSelection) {
          e.preventDefault();
          cutWithHistory();
          return;
        }

        // Paste - Ctrl+V (with history)
        if (e.key === 'v' && clipboard) {
          e.preventDefault();
          pasteWithHistory();
          return;
        }

        // Duplicate - Ctrl+D (with history)
        if (e.key === 'd' && hasSelection) {
          e.preventDefault();
          duplicateWithHistory();
          return;
        }

        // Group - Ctrl+G (requires 2+ shapes selected)
        if (e.key === 'g' && !e.shiftKey && hasSelection && selectedShapeIds.length >= 2) {
          e.preventDefault();
          groupWithHistory();
          return;
        }

        // Ungroup - Ctrl+Shift+G
        if ((e.key === 'g' || e.key === 'G') && e.shiftKey && hasSelection) {
          e.preventDefault();
          ungroupWithHistory();
          return;
        }

        // Z-order shortcuts (only when shapes are selected)
        if (hasSelection) {
          // Bring to Front - Ctrl+Shift+]
          if ((e.key === ']' || e.key === '}') && e.shiftKey) {
            e.preventDefault();
            zOrderWithHistory('bringToFront');
            return;
          }

          // Send to Back - Ctrl+Shift+[
          if ((e.key === '[' || e.key === '{') && e.shiftKey) {
            e.preventDefault();
            zOrderWithHistory('sendToBack');
            return;
          }

          // Bring Forward - Ctrl+]
          if (e.key === ']' && !e.shiftKey) {
            e.preventDefault();
            zOrderWithHistory('bringForward');
            return;
          }

          // Send Backward - Ctrl+[
          if (e.key === '[' && !e.shiftKey) {
            e.preventDefault();
            zOrderWithHistory('sendBackward');
            return;
          }
        }
      }

      // Arrow key movement
      if (hasSelection && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();

        const moveAmount = e.shiftKey ? KEYBOARD.MOVE_STEP_LARGE : KEYBOARD.MOVE_STEP;

        let deltaX = 0;
        let deltaY = 0;

        switch (e.key) {
          case 'ArrowUp':
            deltaY = -moveAmount;
            break;
          case 'ArrowDown':
            deltaY = moveAmount;
            break;
          case 'ArrowLeft':
            deltaX = -moveAmount;
            break;
          case 'ArrowRight':
            deltaX = moveAmount;
            break;
        }

        // Move all selected shapes
        for (const id of selectedShapeIds) {
          const shape = shapes[id];
          if (shape && !shape.locked) {
            updateShape(id, {
              x: shape.x + deltaX,
              y: shape.y + deltaY,
            });
          }
        }
        return;
      }

      // Delete/Backspace - shapes or connections (with history)
      if ((hasSelection || hasConnectionSelection) && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        deleteWithHistory();
        return;
      }

      // Tool shortcuts (only when not manipulating and not editing text)
      if (!isDuringManipulation && !isEditingText) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setActiveTool('select');
            break;
          case 'r':
            setActiveTool('rectangle');
            break;
          case 'e':
            setActiveTool('ellipse');
            break;
          case 'c':
            setActiveTool('connection');
            break;
          case 'g':
            // G toggles grid, Shift+G toggles snap to grid
            if (!ctrlOrMeta) {
              e.preventDefault();
              if (e.shiftKey) {
                toggleSnapToGrid();
              } else {
                toggleGrid();
              }
            }
            break;
          case 'escape':
            // Cancel any in-progress operation
            // Note: Escape does NOT exit group edit mode (click outside to exit instead)
            if (isCreatingConnection) {
              endConnectionCreation();
            } else if (creationState) {
              cancelCreation();
            } else {
              setActiveTool('select');
            }
            break;
        }
      }

      // Escape while editing text exits editing mode
      if (isEditingText && e.key === 'Escape') {
        e.preventDefault();
        setEditingTextShapeId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setActiveTool,
    cancelCreation,
    creationState,
    manipulationState,
    connectionCreationState,
    endConnectionCreation,
    editingTextShapeId,
    setEditingTextShapeId,
    selectedShapeIds,
    selectedConnectionIds,
    shapes,
    updateShape,
    deleteWithHistory,
    selectAll,
    copySelection,
    cutWithHistory,
    pasteWithHistory,
    duplicateWithHistory,
    clipboard,
    undo,
    redo,
    toggleGrid,
    toggleSnapToGrid,
    zOrderWithHistory,
    groupWithHistory,
    ungroupWithHistory,
  ]);
}
