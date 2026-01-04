import { useEffect, useRef } from 'react';

/**
 * Options for the useGlobalDrag hook
 */
export interface UseGlobalDragOptions {
  /**
   * Whether the drag operation is currently active.
   * Listeners are only attached when this is true.
   */
  isActive: boolean;

  /**
   * Called on every mousemove event while dragging
   */
  onMove?: (e: MouseEvent) => void;

  /**
   * Called on mouseup to end the drag operation
   */
  onEnd?: (e: MouseEvent) => void;

  /**
   * Optional keyboard handler (e.g., for Escape to cancel)
   */
  onKeyDown?: (e: KeyboardEvent) => void;
}

/**
 * Hook for handling global drag operations that need to track mouse movement
 * outside the originating element.
 *
 * This centralizes the common pattern of:
 * 1. Attaching window mousemove/mouseup listeners when a drag starts
 * 2. Removing listeners when the drag ends
 * 3. Optionally handling keyboard events (like Escape to cancel)
 *
 * Uses refs internally to always call the latest handler versions,
 * avoiding stale closure issues without needing handlers in dependencies.
 *
 * @example
 * // Simple usage
 * useGlobalDrag({
 *   isActive: isDragging,
 *   onMove: (e) => updatePosition(e.clientX, e.clientY),
 *   onEnd: () => finishDrag(),
 * });
 *
 * @example
 * // With keyboard handler for cancellation
 * useGlobalDrag({
 *   isActive: isCreating,
 *   onMove: handleMouseMove,
 *   onEnd: handleMouseUp,
 *   onKeyDown: (e) => {
 *     if (e.key === 'Escape') cancel();
 *   },
 * });
 */
export function useGlobalDrag({
  isActive,
  onMove,
  onEnd,
  onKeyDown,
}: UseGlobalDragOptions): void {
  // Store handlers in refs to always get the latest version without
  // re-adding event listeners on every render
  const handlersRef = useRef({ onMove, onEnd, onKeyDown });

  // Update refs on every render (this is intentionally not in useEffect)
  handlersRef.current = { onMove, onEnd, onKeyDown };

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      handlersRef.current.onMove?.(e);
    };

    const handleMouseUp = (e: MouseEvent) => {
      handlersRef.current.onEnd?.(e);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      handlersRef.current.onKeyDown?.(e);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    if (onKeyDown) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      if (onKeyDown) {
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
    // Only re-run when isActive changes or when onKeyDown presence changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, !!onKeyDown]);
}
