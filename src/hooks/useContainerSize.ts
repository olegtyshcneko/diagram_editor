import { useState, useEffect, type RefObject } from 'react';
import type { Size } from '@/types/common';

/**
 * Hook that tracks the size of a container element using ResizeObserver.
 * Returns { width: 0, height: 0 } until the element is measured.
 */
export function useContainerSize(ref: RefObject<HTMLElement | null>): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    // Initial measurement
    updateSize();

    // Watch for size changes
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [ref]);

  return size;
}
