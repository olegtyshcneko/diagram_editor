import React, { useMemo } from 'react';
import type { Viewport } from '@/types/viewport';
import type { Size } from '@/types/common';
import { getAdaptiveGridSize, DEFAULT_GRID_SIZE } from '@/lib/geometry/snap';

interface GridBackgroundProps {
  viewport: Viewport;
  containerSize: Size;
  visible: boolean;
  gridSize?: number;
}

/**
 * Renders a dot grid pattern on the canvas.
 * Uses SVG patterns for efficient rendering.
 * Grid density adapts to zoom level for performance.
 */
export const GridBackground: React.FC<GridBackgroundProps> = React.memo(
  function GridBackground({
    viewport,
    containerSize,
    visible,
    gridSize = DEFAULT_GRID_SIZE,
  }) {
    // Calculate adaptive grid size based on zoom
    const adaptiveSize = useMemo(
      () => getAdaptiveGridSize(gridSize, viewport.zoom),
      [gridSize, viewport.zoom]
    );

    // Calculate viewBox dimensions
    const viewDimensions = useMemo(() => {
      const viewWidth = containerSize.width / viewport.zoom;
      const viewHeight = containerSize.height / viewport.zoom;
      return { viewWidth, viewHeight };
    }, [containerSize, viewport.zoom]);

    // Pattern ID needs to be unique per grid size to avoid conflicts
    const patternId = useMemo(
      () => `dotGrid-${adaptiveSize}`,
      [adaptiveSize]
    );

    if (!visible) {
      return null;
    }

    // Calculate grid bounds with some padding
    const padding = adaptiveSize * 2;
    const startX = Math.floor((viewport.x - padding) / adaptiveSize) * adaptiveSize;
    const startY = Math.floor((viewport.y - padding) / adaptiveSize) * adaptiveSize;
    const endX = Math.ceil((viewport.x + viewDimensions.viewWidth + padding) / adaptiveSize) * adaptiveSize;
    const endY = Math.ceil((viewport.y + viewDimensions.viewHeight + padding) / adaptiveSize) * adaptiveSize;

    const gridWidth = endX - startX;
    const gridHeight = endY - startY;

    return (
      <>
        <defs>
          <pattern
            id={patternId}
            x={0}
            y={0}
            width={adaptiveSize}
            height={adaptiveSize}
            patternUnits="userSpaceOnUse"
          >
            {/* Dot at center of each grid cell */}
            <circle
              cx={adaptiveSize / 2}
              cy={adaptiveSize / 2}
              r={1}
              fill="#d0d0d0"
            />
          </pattern>
        </defs>
        <rect
          x={startX}
          y={startY}
          width={gridWidth}
          height={gridHeight}
          fill={`url(#${patternId})`}
          pointerEvents="none"
        />
      </>
    );
  }
);
