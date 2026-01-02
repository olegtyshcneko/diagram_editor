import { forwardRef } from 'react';
import type { Viewport } from '@/types/viewport';
import type { Size } from '@/types/common';
import { calculateViewBox } from '@/lib/geometry/viewport';
import { useUIStore } from '@/stores/uiStore';
import { ShapeLayer } from '@/components/shapes/ShapeLayer';
import { CreationPreview } from './CreationPreview';
import { RotationAngleDisplay } from './RotationAngleDisplay';

interface CanvasProps {
  viewport: Viewport;
  containerSize: Size;
  children?: React.ReactNode;
}

/**
 * Pure SVG canvas component that renders based on viewport state.
 * Uses viewBox for zoom/pan transformation.
 */
export const Canvas = forwardRef<SVGSVGElement, CanvasProps>(
  function Canvas({ viewport, containerSize, children }, ref) {
    const viewBox = calculateViewBox(viewport, containerSize);
    const creationState = useUIStore((s) => s.creationState);

    return (
      <svg
        ref={ref}
        className="w-full h-full"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
        style={{ backgroundColor: '#f8f9fa' }}
      >
        {/* Large background rect for infinite canvas feel */}
        <rect
          x={viewport.x - 10000}
          y={viewport.y - 10000}
          width={20000}
          height={20000}
          fill="#f8f9fa"
        />

        {/* Shape layer with all shapes and selection handles */}
        <ShapeLayer />

        {/* Preview during shape creation */}
        {creationState && <CreationPreview creationState={creationState} />}

        {/* Rotation angle display during rotation */}
        <RotationAngleDisplay />

        {/* Additional children if needed */}
        {children}
      </svg>
    );
  }
);
