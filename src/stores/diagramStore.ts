import { create } from 'zustand';
import type { Shape } from '@/types/shapes';
import type { Connection } from '@/types/connections';

interface DiagramState {
  // Document
  documentId: string | null;
  documentTitle: string;
  isDirty: boolean;

  // Elements
  shapes: Record<string, Shape>;
  connections: Record<string, Connection>;

  // Selection
  selectedShapeIds: string[];
  selectedConnectionIds: string[];

  // Actions (to be implemented in later phases)
  // addShape: (shape: Shape) => void;
  // updateShape: (id: string, updates: Partial<Shape>) => void;
  // deleteShape: (id: string) => void;
  // ... more actions
}

export const useDiagramStore = create<DiagramState>()(() => ({
  // Initial state
  documentId: null,
  documentTitle: 'Untitled Diagram',
  isDirty: false,

  shapes: {},
  connections: {},

  selectedShapeIds: [],
  selectedConnectionIds: [],

  // Actions will be added in subsequent phases
}));
