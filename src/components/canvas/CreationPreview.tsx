import { memo } from 'react';
import type { CreationState } from '@/types/creation';
import { getCreationBounds } from '@/types/creation';
import { COLORS } from '@/lib/constants';

interface CreationPreviewProps {
  creationState: CreationState;
}

export const CreationPreview = memo(function CreationPreview({
  creationState,
}: CreationPreviewProps) {
  const bounds = getCreationBounds(creationState);
  const { type } = creationState;

  // Don't render if bounds are too small
  if (bounds.width < 1 && bounds.height < 1) {
    return null;
  }

  const commonProps = {
    fill: 'none',
    stroke: COLORS.SELECTION,
    strokeWidth: 2,
    strokeDasharray: '6 3',
    opacity: 0.7,
    pointerEvents: 'none' as const,
  };

  if (type === 'rectangle') {
    return (
      <rect
        x={bounds.x}
        y={bounds.y}
        width={bounds.width}
        height={bounds.height}
        {...commonProps}
      />
    );
  }

  if (type === 'ellipse') {
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const rx = bounds.width / 2;
    const ry = bounds.height / 2;
    return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} {...commonProps} />;
  }

  return null;
});
