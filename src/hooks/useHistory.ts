import { useCallback } from 'react';
import { useHistoryStore } from '@/stores/historyStore';
import { useDiagramStore } from '@/stores/diagramStore';
import { useGroupStore } from '@/stores/groupStore';
import type { HistoryEntry } from '@/types/history';
import type { Shape } from '@/types/shapes';

/**
 * Synchronize group store with shape groupId fields.
 * Rebuilds groups based on shapes' groupId fields.
 */
function syncGroupStore(shapes: Record<string, Shape>) {
  const groupStore = useGroupStore.getState();
  const currentGroups = { ...groupStore.groups };

  // Collect all groupIds from shapes
  const groupIdsInUse = new Set<string>();
  const membersByGroupId = new Map<string, string[]>();

  for (const shape of Object.values(shapes)) {
    if (shape.groupId) {
      groupIdsInUse.add(shape.groupId);
      const members = membersByGroupId.get(shape.groupId) || [];
      members.push(shape.id);
      membersByGroupId.set(shape.groupId, members);
    }
  }

  // Remove groups that are no longer referenced
  for (const groupId of Object.keys(currentGroups)) {
    if (!groupIdsInUse.has(groupId)) {
      delete currentGroups[groupId];
    }
  }

  // Add/update groups that are referenced by shapes
  for (const [groupId, memberIds] of membersByGroupId) {
    if (!currentGroups[groupId]) {
      // Create group that doesn't exist
      currentGroups[groupId] = {
        id: groupId,
        memberIds,
      };
    } else {
      // Update existing group's members
      currentGroups[groupId] = {
        ...currentGroups[groupId],
        memberIds,
      };
    }
  }

  // Update group store
  useGroupStore.setState({ groups: currentGroups });
}

/**
 * Hook that provides undo/redo functionality by applying history deltas to the diagram store.
 * This hook connects the history store to the diagram store.
 */
export function useHistory() {
  const historyStore = useHistoryStore();

  /**
   * Apply an undo operation - reverses the changes in the entry
   */
  const applyUndo = useCallback((entry: HistoryEntry) => {
    const { shapes, connections } = useDiagramStore.getState();

    // Start with current state
    const newShapes = { ...shapes };
    const newConnections = { ...connections };

    // Reverse shape changes
    // Remove shapes that were added
    for (const shape of entry.shapeDelta.added) {
      delete newShapes[shape.id];
    }

    // Restore shapes that were removed
    for (const shape of entry.shapeDelta.removed) {
      newShapes[shape.id] = shape;
    }

    // Revert shape modifications to their 'before' state
    for (const mod of entry.shapeDelta.modified) {
      if (newShapes[mod.id]) {
        newShapes[mod.id] = { ...newShapes[mod.id], ...mod.before };
      }
    }

    // Reverse connection changes
    for (const conn of entry.connectionDelta.added) {
      delete newConnections[conn.id];
    }

    for (const conn of entry.connectionDelta.removed) {
      newConnections[conn.id] = conn;
    }

    for (const mod of entry.connectionDelta.modified) {
      if (newConnections[mod.id]) {
        newConnections[mod.id] = { ...newConnections[mod.id], ...mod.before };
      }
    }

    // Apply changes atomically
    useDiagramStore.setState({
      shapes: newShapes,
      connections: newConnections,
      selectedShapeIds: entry.selectionBefore,
      selectedConnectionIds: [],
      isDirty: true,
    });

    // Sync group store with updated shapes (handles GROUP/UNGROUP undo)
    if (entry.type === 'GROUP' || entry.type === 'UNGROUP') {
      syncGroupStore(newShapes);
    }
  }, []);

  /**
   * Apply a redo operation - reapplies the changes in the entry
   */
  const applyRedo = useCallback((entry: HistoryEntry) => {
    const { shapes, connections } = useDiagramStore.getState();

    const newShapes = { ...shapes };
    const newConnections = { ...connections };

    // Reapply shape changes
    // Remove shapes that were removed
    for (const shape of entry.shapeDelta.removed) {
      delete newShapes[shape.id];
    }

    // Add shapes that were added
    for (const shape of entry.shapeDelta.added) {
      newShapes[shape.id] = shape;
    }

    // Apply shape modifications to their 'after' state
    for (const mod of entry.shapeDelta.modified) {
      if (newShapes[mod.id]) {
        newShapes[mod.id] = { ...newShapes[mod.id], ...mod.after };
      }
    }

    // Reapply connection changes
    for (const conn of entry.connectionDelta.removed) {
      delete newConnections[conn.id];
    }

    for (const conn of entry.connectionDelta.added) {
      newConnections[conn.id] = conn;
    }

    for (const mod of entry.connectionDelta.modified) {
      if (newConnections[mod.id]) {
        newConnections[mod.id] = { ...newConnections[mod.id], ...mod.after };
      }
    }

    // Apply changes atomically
    useDiagramStore.setState({
      shapes: newShapes,
      connections: newConnections,
      selectedShapeIds: entry.selectionAfter,
      selectedConnectionIds: [],
      isDirty: true,
    });

    // Sync group store with updated shapes (handles GROUP/UNGROUP redo)
    if (entry.type === 'GROUP' || entry.type === 'UNGROUP') {
      syncGroupStore(newShapes);
    }
  }, []);

  /**
   * Undo the last action
   */
  const undo = useCallback(() => {
    const entry = historyStore.undo();
    if (entry) {
      applyUndo(entry);
    }
  }, [historyStore, applyUndo]);

  /**
   * Redo the last undone action
   */
  const redo = useCallback(() => {
    const entry = historyStore.redo();
    if (entry) {
      applyRedo(entry);
    }
  }, [historyStore, applyRedo]);

  return {
    undo,
    redo,
    canUndo: historyStore.canUndo,
    canRedo: historyStore.canRedo,
    getUndoDescription: historyStore.getUndoDescription,
    getRedoDescription: historyStore.getRedoDescription,
    pushEntry: historyStore.pushEntry,
    clear: historyStore.clear,
  };
}
