import { createContext, useContext, type RefObject } from 'react';

/**
 * Context to provide the canvas container ref to child components.
 * This allows hooks like useControlPointDrag to access the container
 * for coordinate conversion without using DOM queries.
 */
export const CanvasContainerContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

/**
 * Hook to access the canvas container ref.
 * Throws an error if used outside of CanvasContainerContext.Provider.
 */
export function useCanvasContainer(): RefObject<HTMLDivElement | null> {
  const context = useContext(CanvasContainerContext);
  if (!context) {
    throw new Error('useCanvasContainer must be used within a CanvasContainerContext.Provider');
  }
  return context;
}
