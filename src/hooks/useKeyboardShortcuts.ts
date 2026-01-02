import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

export function useKeyboardShortcuts() {
  const setActiveTool = useUIStore((s) => s.setActiveTool);
  const cancelCreation = useUIStore((s) => s.cancelCreation);
  const creationState = useUIStore((s) => s.creationState);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

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
        case 'escape':
          if (creationState) {
            cancelCreation();
          } else {
            setActiveTool('select');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, cancelCreation, creationState]);
}
