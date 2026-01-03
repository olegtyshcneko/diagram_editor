import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { HistoryEntry, HistoryEntryInput } from '@/types/history';

const MAX_HISTORY_SIZE = 50;

interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];

  // Getters
  canUndo: () => boolean;
  canRedo: () => boolean;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;

  // Actions
  pushEntry: (entry: HistoryEntryInput) => void;
  undo: () => HistoryEntry | null;
  redo: () => HistoryEntry | null;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  past: [],
  future: [],

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  getUndoDescription: () => {
    const { past } = get();
    return past.length > 0 ? past[past.length - 1].description : null;
  },

  getRedoDescription: () => {
    const { future } = get();
    return future.length > 0 ? future[0].description : null;
  },

  pushEntry: (entryInput) => {
    const entry: HistoryEntry = {
      ...entryInput,
      id: nanoid(),
      timestamp: Date.now(),
    };

    set((state) => {
      const newPast = [...state.past, entry];
      // Trim to max size (remove oldest entries)
      while (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return {
        past: newPast,
        future: [], // Clear redo stack on new action
      };
    });
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return null;

    const entry = past[past.length - 1];

    set({
      past: past.slice(0, -1),
      future: [entry, ...future],
    });

    return entry;
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return null;

    const entry = future[0];

    set({
      past: [...past, entry],
      future: future.slice(1),
    });

    return entry;
  },

  clear: () => set({ past: [], future: [] }),
}));
