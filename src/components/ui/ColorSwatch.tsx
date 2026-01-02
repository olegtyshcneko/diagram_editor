import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getContrastingTextColor, isTransparent } from '@/lib/color-utils';

export interface ColorSwatchProps {
  color: string;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-8 h-8',
};

const checkSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

// Checkerboard pattern for transparent color display
const checkerboardStyle: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%)
  `,
  backgroundSize: '8px 8px',
  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
};

export function ColorSwatch({
  color,
  selected = false,
  onClick,
  size = 'md',
  className,
}: ColorSwatchProps) {
  const isTransparentColor = isTransparent(color);
  const checkColor = isTransparentColor ? '#666666' : getContrastingTextColor(color);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative rounded border border-border flex items-center justify-center',
        'hover:ring-2 hover:ring-ring hover:ring-offset-1',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        'transition-all',
        selected && 'ring-2 ring-ring ring-offset-1',
        sizeClasses[size],
        className
      )}
      style={isTransparentColor ? checkerboardStyle : { backgroundColor: color }}
      title={isTransparentColor ? 'Transparent' : color}
    >
      {selected && (
        <Check
          className={checkSizes[size]}
          style={{ color: checkColor }}
          strokeWidth={3}
        />
      )}
    </button>
  );
}
