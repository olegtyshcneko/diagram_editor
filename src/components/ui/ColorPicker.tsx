import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ColorSwatch } from '@/components/ui/ColorSwatch';
import { usePreferencesStore } from '@/stores/preferencesStore';
import {
  PRESET_COLORS,
  TRANSPARENT,
  isValidHexColor,
  normalizeHexColor,
  isTransparent,
} from '@/lib/color-utils';
import { cn } from '@/lib/utils';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  showOpacity?: boolean;
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
  allowTransparent?: boolean;
  transparentLabel?: string;
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  showOpacity = false,
  opacity = 100,
  onOpacityChange,
  allowTransparent = true,
  transparentLabel = 'No Fill',
  className,
}: ColorPickerProps) {
  const [hexInput, setHexInput] = React.useState(value);
  const [open, setOpen] = React.useState(false);

  const recentColors = usePreferencesStore((s) => s.recentColors);
  const addRecentColor = usePreferencesStore((s) => s.addRecentColor);

  // Sync hex input when value changes externally
  React.useEffect(() => {
    if (!open) {
      setHexInput(isTransparent(value) ? '' : value);
    }
  }, [value, open]);

  const handleColorSelect = (color: string) => {
    onChange(color);
    if (!isTransparent(color)) {
      addRecentColor(normalizeHexColor(color));
      setHexInput(color);
    } else {
      setHexInput('');
    }
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    setHexInput(input);

    // Auto-add # prefix if user starts typing hex
    if (input && !input.startsWith('#')) {
      input = '#' + input;
    }

    // Apply valid colors immediately
    if (isValidHexColor(input)) {
      const normalized = normalizeHexColor(input);
      onChange(normalized);
      addRecentColor(normalized);
    }
  };

  const handleHexInputBlur = () => {
    // Reset to current value if invalid
    if (!isValidHexColor(hexInput)) {
      setHexInput(isTransparent(value) ? '' : value);
    }
  };

  const handleOpacityChange = (values: number[]) => {
    onOpacityChange?.(values[0]);
  };

  const isCurrentTransparent = isTransparent(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'w-8 h-8 rounded border border-border',
            'hover:ring-2 hover:ring-ring hover:ring-offset-1',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            'transition-all',
            className
          )}
          style={
            isCurrentTransparent
              ? {
                  backgroundImage: `
                    linear-gradient(45deg, #ccc 25%, transparent 25%),
                    linear-gradient(-45deg, #ccc 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #ccc 75%),
                    linear-gradient(-45deg, transparent 75%, #ccc 75%)
                  `,
                  backgroundSize: '8px 8px',
                  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                }
              : { backgroundColor: value }
          }
          title={isCurrentTransparent ? 'Transparent' : value}
        />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        {/* Hex Input */}
        <div className="mb-3">
          <Input
            type="text"
            placeholder="#FFFFFF"
            value={hexInput}
            onChange={handleHexInputChange}
            onBlur={handleHexInputBlur}
            className="h-8 text-sm font-mono"
          />
        </div>

        {/* Recent Colors */}
        {recentColors.length > 0 && (
          <>
            <div className="mb-2">
              <span className="text-xs text-muted-foreground">Recent</span>
              <div className="flex gap-1 mt-1 flex-wrap">
                {recentColors.map((color) => (
                  <ColorSwatch
                    key={color}
                    color={color}
                    size="sm"
                    selected={normalizeHexColor(value) === color}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </div>
            </div>
            <Separator className="my-2" />
          </>
        )}

        {/* Preset Colors Grid (8x8) */}
        <div className="mb-3">
          <span className="text-xs text-muted-foreground">Colors</span>
          <div className="grid grid-cols-8 gap-1 mt-1">
            {PRESET_COLORS.map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                size="sm"
                selected={normalizeHexColor(value) === color}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </div>
        </div>

        {/* Transparent Option */}
        {allowTransparent && (
          <>
            <Separator className="my-2" />
            <button
              type="button"
              onClick={() => handleColorSelect(TRANSPARENT)}
              className={cn(
                'w-full h-8 rounded border border-border text-sm',
                'hover:bg-accent transition-colors',
                'flex items-center justify-center gap-2',
                isCurrentTransparent && 'ring-2 ring-ring'
              )}
            >
              <div
                className="w-4 h-4 rounded border border-border"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #ccc 25%, transparent 25%),
                    linear-gradient(-45deg, #ccc 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #ccc 75%),
                    linear-gradient(-45deg, transparent 75%, #ccc 75%)
                  `,
                  backgroundSize: '6px 6px',
                  backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px',
                }}
              />
              {transparentLabel}
            </button>
          </>
        )}

        {/* Opacity Slider */}
        {showOpacity && (
          <>
            <Separator className="my-2" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-14">Opacity</span>
              <Slider
                value={[opacity]}
                onValueChange={handleOpacityChange}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8 text-right">
                {opacity}%
              </span>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
