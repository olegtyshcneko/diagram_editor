import { forwardRef } from 'react';
import type { Viewport } from '@/types/viewport';
import type { Size } from '@/types/common';
import type { AnchorPosition } from '@/types/connections';
import { calculateViewBox } from '@/lib/geometry/viewport';
import { useInteractionStore } from '@/stores/interactionStore';
import { ShapeLayer } from '@/components/shapes/ShapeLayer';
import { ConnectionLayer, AnchorPointsOverlay } from '@/components/connections';
import { CreationPreview } from './CreationPreview';
import { SelectionBoxLayer } from './SelectionBoxLayer';
import { RotationAngleDisplay } from './RotationAngleDisplay';

interface CanvasProps {
  viewport: Viewport;
  containerSize: Size;
  hoveredShapeId: string | null;
  onAnchorMouseDown: (
    shapeId: string,
    anchor: AnchorPosition,
    e: React.MouseEvent
  ) => void;
  onShapeHover: (shapeId: string | null) => void;
  onShapeDoubleClick: (shapeId: string) => void;
  children?: React.ReactNode;
}

/**
 * Pure SVG canvas component that renders based on viewport state.
 * Uses viewBox for zoom/pan transformation.
 */
export const Canvas = forwardRef<SVGSVGElement, CanvasProps>(
  function Canvas(
    {
      viewport,
      containerSize,
      hoveredShapeId,
      onAnchorMouseDown,
      onShapeHover,
      onShapeDoubleClick,
      children,
    },
    ref
  ) {
    const viewBox = calculateViewBox(viewport, containerSize);
    const creationState = useInteractionStore((s) => s.creationState);

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

        {/* Connection layer (behind shapes) */}
        <ConnectionLayer />

        {/* Shape layer with all shapes and selection handles */}
        <ShapeLayer
          onShapeHover={onShapeHover}
          onShapeDoubleClick={onShapeDoubleClick}
        />

        {/* Anchor points overlay (for connection creation) */}
        <AnchorPointsOverlay
          hoveredShapeId={hoveredShapeId}
          onAnchorMouseDown={onAnchorMouseDown}
        />

        {/* Preview during shape creation */}
        {creationState && <CreationPreview creationState={creationState} />}

        {/* Selection box during marquee selection */}
        <SelectionBoxLayer />

        {/* Rotation angle display during rotation */}
        <RotationAngleDisplay />

        {/* Additional children if needed */}
        {children}
      </svg>
    );
  }
);
