# Phase 4: Shape Styling & Property Panel - Technical Specification

## Document Information

| Field | Value |
|-------|-------|
| Phase | 4 |
| Status | Draft |
| Dependencies | Phase 0-3 |
| Estimated Files | 12-15 new/modified |

---

## Technical Architecture

### Component Hierarchy

```
App.tsx
├── AppShell.tsx
│   ├── Toolbar.tsx
│   ├── Canvas.tsx
│   │   └── ShapeLayer.tsx (updated with styles)
│   └── PropertyPanel.tsx (new)
│       ├── PositionSection.tsx
│       ├── DimensionsSection.tsx
│       ├── RotationSection.tsx
│       ├── FillSection.tsx
│       │   └── ColorPicker.tsx
│       ├── StrokeSection.tsx
│       └── CornerRadiusSection.tsx
```

### State Management

**No new stores needed.** Style properties are already part of the Shape interface. This phase focuses on:
1. UI components to modify existing shape properties
2. Extending the property panel to show/edit styles
3. Color picker component

---

## Files to Create

### New Files

| File Path | Purpose |
|-----------|---------|
| `src/components/panels/PropertyPanel.tsx` | Main property panel container |
| `src/components/panels/sections/PositionSection.tsx` | X, Y position inputs |
| `src/components/panels/sections/DimensionsSection.tsx` | Width, Height inputs |
| `src/components/panels/sections/RotationSection.tsx` | Rotation angle input |
| `src/components/panels/sections/FillSection.tsx` | Fill color and opacity |
| `src/components/panels/sections/StrokeSection.tsx` | Stroke color, width, style |
| `src/components/panels/sections/CornerRadiusSection.tsx` | Corner radius for rects |
| `src/components/ui/ColorPicker.tsx` | Color picker component |
| `src/components/ui/ColorSwatch.tsx` | Individual color swatch |
| `src/components/ui/NumberInput.tsx` | Validated number input |
| `src/hooks/useSelectedShapes.ts` | Hook for selected shape data |
| `src/lib/color-utils.ts` | Color validation and conversion |

### Modified Files

| File Path | Changes |
|-----------|---------|
| `src/components/layout/AppShell.tsx` | Add property panel slot |
| `src/components/shapes/RectangleShape.tsx` | Apply all style props |
| `src/components/shapes/EllipseShape.tsx` | Apply all style props |
| `src/stores/uiStore.ts` | Add recentColors state |

---

## Key Interfaces & Types

### Style Types (already defined in Phase 0)

```typescript
// src/types/shape.ts (reference)

export type StrokeStyle = 'solid' | 'dashed' | 'dotted';

export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;

  // Style properties (used in this phase)
  fill: string;           // Hex color e.g., "#ffffff"
  fillOpacity: number;    // 0-1
  stroke: string;         // Hex color e.g., "#000000"
  strokeWidth: number;    // Pixels
  strokeStyle: StrokeStyle;
  cornerRadius?: number;  // Only for rectangles

  locked: boolean;
  visible: boolean;
  zIndex: number;
}
```

### Property Panel Types

```typescript
// src/types/ui.ts

export interface PropertyPanelState {
  isCollapsed: boolean;
  width: number;
}

export interface SelectedShapeProperties {
  // Single shape or computed from multiple
  x: number | 'mixed';
  y: number | 'mixed';
  width: number | 'mixed';
  height: number | 'mixed';
  rotation: number | 'mixed';
  fill: string | 'mixed';
  fillOpacity: number | 'mixed';
  stroke: string | 'mixed';
  strokeWidth: number | 'mixed';
  strokeStyle: StrokeStyle | 'mixed';
  cornerRadius: number | 'mixed' | null; // null if not applicable
}
```

### Color Picker Types

```typescript
// src/types/ui.ts

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  onClose?: () => void;
  showOpacity?: boolean;
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
}

export interface ColorSwatchProps {
  color: string;
  selected?: boolean;
  onClick: (color: string) => void;
  size?: 'sm' | 'md' | 'lg';
}
```

---

## Implementation Order

### Step 1: Color Utilities

Create color validation and conversion functions.

**File:** `src/lib/color-utils.ts`

```typescript
/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
}

/**
 * Normalize hex color to 6-digit format
 */
export function normalizeHexColor(color: string): string {
  if (!isValidHexColor(color)) return '#000000';

  // Expand 3-digit hex to 6-digit
  if (color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  return color.toUpperCase();
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHexColor(hex);
  const result = /^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/.exec(normalized);

  if (!result) return null;

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Convert HSL to hex
 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  return rgbToHex(
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  );
}

/**
 * Preset color palette
 */
export const PRESET_COLORS = [
  // Row 1: Grays
  '#FFFFFF', '#F3F4F6', '#D1D5DB', '#9CA3AF', '#6B7280', '#374151', '#1F2937', '#000000',
  // Row 2: Reds
  '#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#B91C1C', '#7F1D1D',
  // Row 3: Oranges
  '#FFEDD5', '#FED7AA', '#FDBA74', '#FB923C', '#F97316', '#EA580C', '#C2410C', '#7C2D12',
  // Row 4: Yellows
  '#FEF9C3', '#FEF08A', '#FDE047', '#FACC15', '#EAB308', '#CA8A04', '#A16207', '#713F12',
  // Row 5: Greens
  '#DCFCE7', '#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E', '#16A34A', '#15803D', '#14532D',
  // Row 6: Blues
  '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E3A8A',
  // Row 7: Purples
  '#F3E8FF', '#E9D5FF', '#D8B4FE', '#C084FC', '#A855F7', '#9333EA', '#7C3AED', '#5B21B6',
  // Row 8: Pinks
  '#FCE7F3', '#FBCFE8', '#F9A8D4', '#F472B6', '#EC4899', '#DB2777', '#BE185D', '#831843',
];

/**
 * Get contrasting text color for background
 */
export function getContrastingTextColor(bgColor: string): string {
  const rgb = hexToRgb(bgColor);
  if (!rgb) return '#000000';

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
```

### Step 2: Number Input Component

Create a validated number input for property panel.

**File:** `src/components/ui/NumberInput.tsx`

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface NumberInputProps {
  value: number | 'mixed';
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  className,
  disabled,
  placeholder,
}: NumberInputProps) {
  const [localValue, setLocalValue] = useState(
    value === 'mixed' ? '' : String(value)
  );
  const [isFocused, setIsFocused] = useState(false);

  // Sync external value changes when not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value === 'mixed' ? '' : String(value));
    }
  }, [value, isFocused]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);

    const parsed = parseFloat(localValue);
    if (isNaN(parsed)) {
      // Reset to previous value
      setLocalValue(value === 'mixed' ? '' : String(value));
      return;
    }

    // Clamp to bounds
    let clamped = parsed;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);

    setLocalValue(String(clamped));
    onChange(clamped);
  }, [localValue, value, min, max, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const current = parseFloat(localValue) || 0;
      const delta = e.key === 'ArrowUp' ? step : -step;
      const multiplier = e.shiftKey ? 10 : 1;

      let newValue = current + delta * multiplier;
      if (min !== undefined) newValue = Math.max(min, newValue);
      if (max !== undefined) newValue = Math.min(max, newValue);

      setLocalValue(String(newValue));
      onChange(newValue);
    }
  }, [localValue, step, min, max, onChange]);

  return (
    <div className={cn('relative', className)}>
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={value === 'mixed' ? 'Mixed' : placeholder}
        className={cn(
          'pr-6 text-right',
          value === 'mixed' && 'italic text-muted-foreground'
        )}
      />
      {suffix && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}
```

### Step 3: Color Swatch Component

**File:** `src/components/ui/ColorSwatch.tsx`

```typescript
import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { getContrastingTextColor } from '@/lib/color-utils';

interface ColorSwatchProps {
  color: string;
  selected?: boolean;
  onClick: (color: string) => void;
  size?: 'sm' | 'md' | 'lg';
  showCheck?: boolean;
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function ColorSwatch({
  color,
  selected,
  onClick,
  size = 'md',
  showCheck = true,
}: ColorSwatchProps) {
  const isTransparent = color === 'transparent' || color === 'none';

  return (
    <button
      type="button"
      className={cn(
        'rounded border border-gray-200 cursor-pointer transition-transform hover:scale-110',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        sizeClasses[size],
        selected && 'ring-2 ring-blue-500 ring-offset-1'
      )}
      style={{
        backgroundColor: isTransparent ? 'transparent' : color,
        backgroundImage: isTransparent
          ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)'
          : undefined,
        backgroundSize: isTransparent ? '8px 8px' : undefined,
        backgroundPosition: isTransparent ? '0 0, 4px 4px' : undefined,
      }}
      onClick={() => onClick(color)}
      title={color}
    >
      {selected && showCheck && !isTransparent && (
        <Check
          className={cn('w-full h-full p-0.5')}
          style={{ color: getContrastingTextColor(color) }}
        />
      )}
    </button>
  );
}
```

### Step 4: Color Picker Component

**File:** `src/components/ui/ColorPicker.tsx`

```typescript
import React, { useState, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ColorSwatch } from './ColorSwatch';
import { PRESET_COLORS, isValidHexColor, normalizeHexColor } from '@/lib/color-utils';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  showOpacity?: boolean;
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
  allowTransparent?: boolean;
  disabled?: boolean;
}

export function ColorPicker({
  value,
  onChange,
  showOpacity = false,
  opacity = 100,
  onOpacityChange,
  allowTransparent = true,
  disabled,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);

  const recentColors = useUIStore((s) => s.recentColors);
  const addRecentColor = useUIStore((s) => s.addRecentColor);

  const handleColorSelect = useCallback((color: string) => {
    onChange(color);
    setHexInput(color);
    if (color !== 'transparent') {
      addRecentColor(color);
    }
  }, [onChange, addRecentColor]);

  const handleHexInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Add # if missing
    if (inputValue && !inputValue.startsWith('#')) {
      inputValue = '#' + inputValue;
    }

    setHexInput(inputValue);

    if (isValidHexColor(inputValue)) {
      const normalized = normalizeHexColor(inputValue);
      onChange(normalized);
      addRecentColor(normalized);
    }
  }, [onChange, addRecentColor]);

  const handleHexInputBlur = useCallback(() => {
    if (isValidHexColor(hexInput)) {
      setHexInput(normalizeHexColor(hexInput));
    } else {
      setHexInput(value);
    }
  }, [hexInput, value]);

  const isTransparent = value === 'transparent' || value === 'none';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'w-8 h-8 rounded border border-gray-300 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            backgroundColor: isTransparent ? 'transparent' : value,
            backgroundImage: isTransparent
              ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)'
              : undefined,
            backgroundSize: isTransparent ? '8px 8px' : undefined,
            backgroundPosition: isTransparent ? '0 0, 4px 4px' : undefined,
          }}
        />
      </PopoverTrigger>

      <PopoverContent className="w-64 p-3" align="start">
        {/* Hex Input */}
        <div className="mb-3">
          <Label className="text-xs mb-1 block">Hex Color</Label>
          <Input
            value={hexInput}
            onChange={handleHexInputChange}
            onBlur={handleHexInputBlur}
            placeholder="#000000"
            className="font-mono text-sm"
          />
        </div>

        {/* Recent Colors */}
        {recentColors.length > 0 && (
          <div className="mb-3">
            <Label className="text-xs mb-1 block">Recent</Label>
            <div className="flex flex-wrap gap-1">
              {recentColors.map((color) => (
                <ColorSwatch
                  key={color}
                  color={color}
                  selected={value === color}
                  onClick={handleColorSelect}
                  size="sm"
                />
              ))}
            </div>
          </div>
        )}

        {/* Preset Colors */}
        <div className="mb-3">
          <Label className="text-xs mb-1 block">Preset Colors</Label>
          <div className="grid grid-cols-8 gap-1">
            {PRESET_COLORS.map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                selected={value === color}
                onClick={handleColorSelect}
                size="sm"
              />
            ))}
          </div>
        </div>

        {/* Transparent Option */}
        {allowTransparent && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => handleColorSelect('transparent')}
              className={cn(
                'w-full py-1 px-2 text-sm rounded border',
                isTransparent
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50'
              )}
            >
              No Fill / Transparent
            </button>
          </div>
        )}

        {/* Opacity Slider */}
        {showOpacity && onOpacityChange && (
          <div>
            <Label className="text-xs mb-1 block">
              Opacity: {Math.round(opacity)}%
            </Label>
            <Slider
              value={[opacity]}
              onValueChange={([val]) => onOpacityChange(val)}
              min={0}
              max={100}
              step={1}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
```

### Step 5: UI Store Extension (Recent Colors)

**File:** `src/stores/uiStore.ts` (additions)

```typescript
interface UIState {
  // ... existing state

  // Recent colors
  recentColors: string[];
  addRecentColor: (color: string) => void;

  // Property panel
  propertyPanelCollapsed: boolean;
  setPropertyPanelCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  // ... existing state

  recentColors: [],
  addRecentColor: (color) => set((state) => {
    // Don't add duplicates or transparent
    if (color === 'transparent' || state.recentColors.includes(color)) {
      return state;
    }

    // Keep max 8 recent colors
    const updated = [color, ...state.recentColors].slice(0, 8);
    return { recentColors: updated };
  }),

  propertyPanelCollapsed: false,
  setPropertyPanelCollapsed: (collapsed) => set({ propertyPanelCollapsed: collapsed }),
}));
```

### Step 6: useSelectedShapes Hook

**File:** `src/hooks/useSelectedShapes.ts`

```typescript
import { useMemo } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { Shape, StrokeStyle } from '@/types/shape';

export interface SelectedShapeProperties {
  x: number | 'mixed';
  y: number | 'mixed';
  width: number | 'mixed';
  height: number | 'mixed';
  rotation: number | 'mixed';
  fill: string | 'mixed';
  fillOpacity: number | 'mixed';
  stroke: string | 'mixed';
  strokeWidth: number | 'mixed';
  strokeStyle: StrokeStyle | 'mixed';
  cornerRadius: number | 'mixed' | null;
}

/**
 * Get common properties from selected shapes
 */
export function useSelectedShapes() {
  const shapes = useDiagramStore((s) => s.shapes);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);

  const selectedShapes = useMemo(() => {
    return selectedShapeIds
      .map((id) => shapes[id])
      .filter((s): s is Shape => s !== undefined);
  }, [shapes, selectedShapeIds]);

  const properties = useMemo((): SelectedShapeProperties | null => {
    if (selectedShapes.length === 0) return null;
    if (selectedShapes.length === 1) {
      const shape = selectedShapes[0];
      return {
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        rotation: shape.rotation,
        fill: shape.fill,
        fillOpacity: shape.fillOpacity,
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
        strokeStyle: shape.strokeStyle,
        cornerRadius: shape.type === 'rectangle' ? (shape.cornerRadius ?? 0) : null,
      };
    }

    // Multiple shapes - check for common values
    const getCommonValue = <K extends keyof Shape>(
      key: K
    ): Shape[K] | 'mixed' => {
      const first = selectedShapes[0][key];
      const allSame = selectedShapes.every((s) => s[key] === first);
      return allSame ? first : 'mixed';
    };

    // Check if any shape is a rectangle for corner radius
    const hasRectangles = selectedShapes.some((s) => s.type === 'rectangle');
    let cornerRadius: number | 'mixed' | null = null;

    if (hasRectangles) {
      const rectangles = selectedShapes.filter((s) => s.type === 'rectangle');
      const firstRadius = rectangles[0]?.cornerRadius ?? 0;
      const allSameRadius = rectangles.every(
        (s) => (s.cornerRadius ?? 0) === firstRadius
      );
      cornerRadius = allSameRadius ? firstRadius : 'mixed';
    }

    return {
      x: getCommonValue('x'),
      y: getCommonValue('y'),
      width: getCommonValue('width'),
      height: getCommonValue('height'),
      rotation: getCommonValue('rotation'),
      fill: getCommonValue('fill'),
      fillOpacity: getCommonValue('fillOpacity'),
      stroke: getCommonValue('stroke'),
      strokeWidth: getCommonValue('strokeWidth'),
      strokeStyle: getCommonValue('strokeStyle'),
      cornerRadius,
    };
  }, [selectedShapes]);

  return {
    selectedShapes,
    selectedCount: selectedShapes.length,
    properties,
  };
}
```

### Step 7: Property Panel Sections

**File:** `src/components/panels/sections/FillSection.tsx`

```typescript
import React, { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { useDiagramStore } from '@/stores/diagramStore';

interface FillSectionProps {
  fill: string | 'mixed';
  fillOpacity: number | 'mixed';
  selectedShapeIds: string[];
}

export function FillSection({
  fill,
  fillOpacity,
  selectedShapeIds,
}: FillSectionProps) {
  const updateShape = useDiagramStore((s) => s.updateShape);

  const handleFillChange = useCallback((color: string) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { fill: color });
    });
  }, [selectedShapeIds, updateShape]);

  const handleOpacityChange = useCallback((value: number) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { fillOpacity: value / 100 });
    });
  }, [selectedShapeIds, updateShape]);

  const displayFill = fill === 'mixed' ? '#808080' : fill;
  const displayOpacity = fillOpacity === 'mixed' ? 100 : fillOpacity * 100;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Fill</h4>

      <div className="flex items-center gap-2">
        <Label className="w-16 text-xs">Color</Label>
        <ColorPicker
          value={displayFill}
          onChange={handleFillChange}
          allowTransparent={true}
        />
        <span className="text-xs text-muted-foreground font-mono">
          {fill === 'mixed' ? 'Mixed' : fill}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Label className="w-16 text-xs">Opacity</Label>
        <Slider
          value={[displayOpacity]}
          onValueChange={([val]) => handleOpacityChange(val)}
          min={0}
          max={100}
          step={1}
          className="flex-1"
        />
        <span className="w-10 text-xs text-right">
          {fillOpacity === 'mixed' ? '—' : `${Math.round(displayOpacity)}%`}
        </span>
      </div>
    </div>
  );
}
```

**File:** `src/components/panels/sections/StrokeSection.tsx`

```typescript
import React, { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { NumberInput } from '@/components/ui/NumberInput';
import { useDiagramStore } from '@/stores/diagramStore';
import { StrokeStyle } from '@/types/shape';

interface StrokeSectionProps {
  stroke: string | 'mixed';
  strokeWidth: number | 'mixed';
  strokeStyle: StrokeStyle | 'mixed';
  selectedShapeIds: string[];
}

const STROKE_WIDTH_PRESETS = [1, 2, 3, 4, 5];

export function StrokeSection({
  stroke,
  strokeWidth,
  strokeStyle,
  selectedShapeIds,
}: StrokeSectionProps) {
  const updateShape = useDiagramStore((s) => s.updateShape);

  const handleStrokeColorChange = useCallback((color: string) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { stroke: color });
    });
  }, [selectedShapeIds, updateShape]);

  const handleStrokeWidthChange = useCallback((width: number) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { strokeWidth: width });
    });
  }, [selectedShapeIds, updateShape]);

  const handleStrokeStyleChange = useCallback((style: string) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { strokeStyle: style as StrokeStyle });
    });
  }, [selectedShapeIds, updateShape]);

  const displayStroke = stroke === 'mixed' ? '#808080' : stroke;
  const isNoStroke = stroke === 'transparent' || stroke === 'none';

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Stroke</h4>

      <div className="flex items-center gap-2">
        <Label className="w-16 text-xs">Color</Label>
        <ColorPicker
          value={displayStroke}
          onChange={handleStrokeColorChange}
          allowTransparent={true}
        />
        <span className="text-xs text-muted-foreground font-mono">
          {stroke === 'mixed' ? 'Mixed' : stroke}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Label className="w-16 text-xs">Width</Label>
        <div className="flex gap-1">
          {STROKE_WIDTH_PRESETS.map((w) => (
            <button
              key={w}
              onClick={() => handleStrokeWidthChange(w)}
              className={`w-7 h-7 text-xs rounded border ${
                strokeWidth === w
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              disabled={isNoStroke}
            >
              {w}
            </button>
          ))}
        </div>
        <NumberInput
          value={strokeWidth}
          onChange={handleStrokeWidthChange}
          min={0.5}
          max={20}
          step={0.5}
          suffix="px"
          className="w-20"
          disabled={isNoStroke}
        />
      </div>

      <div className="flex items-center gap-2">
        <Label className="w-16 text-xs">Style</Label>
        <Select
          value={strokeStyle === 'mixed' ? '' : strokeStyle}
          onValueChange={handleStrokeStyleChange}
          disabled={isNoStroke}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={strokeStyle === 'mixed' ? 'Mixed' : undefined} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">
              <div className="flex items-center gap-2">
                <div className="w-12 h-0.5 bg-current" />
                <span>Solid</span>
              </div>
            </SelectItem>
            <SelectItem value="dashed">
              <div className="flex items-center gap-2">
                <div className="w-12 h-0.5 bg-current" style={{ backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0, currentColor 4px, transparent 4px, transparent 8px)' }} />
                <span>Dashed</span>
              </div>
            </SelectItem>
            <SelectItem value="dotted">
              <div className="flex items-center gap-2">
                <div className="w-12 h-0.5" style={{ backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0, currentColor 2px, transparent 2px, transparent 4px)' }} />
                <span>Dotted</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
```

**File:** `src/components/panels/sections/CornerRadiusSection.tsx`

```typescript
import React, { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { NumberInput } from '@/components/ui/NumberInput';
import { useDiagramStore } from '@/stores/diagramStore';

interface CornerRadiusSectionProps {
  cornerRadius: number | 'mixed' | null;
  selectedShapeIds: string[];
  maxRadius: number;
}

export function CornerRadiusSection({
  cornerRadius,
  selectedShapeIds,
  maxRadius,
}: CornerRadiusSectionProps) {
  const updateShape = useDiagramStore((s) => s.updateShape);

  const handleRadiusChange = useCallback((value: number) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { cornerRadius: value });
    });
  }, [selectedShapeIds, updateShape]);

  // Not applicable for non-rectangles
  if (cornerRadius === null) {
    return null;
  }

  const displayRadius = cornerRadius === 'mixed' ? 0 : cornerRadius;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Corner Radius</h4>

      <div className="flex items-center gap-2">
        <Slider
          value={[displayRadius]}
          onValueChange={([val]) => handleRadiusChange(val)}
          min={0}
          max={maxRadius}
          step={1}
          className="flex-1"
        />
        <NumberInput
          value={cornerRadius}
          onChange={handleRadiusChange}
          min={0}
          max={maxRadius}
          suffix="px"
          className="w-20"
        />
      </div>
    </div>
  );
}
```

### Step 8: Main Property Panel

**File:** `src/components/panels/PropertyPanel.tsx`

```typescript
import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUIStore } from '@/stores/uiStore';
import { useDiagramStore } from '@/stores/diagramStore';
import { useSelectedShapes } from '@/hooks/useSelectedShapes';
import { NumberInput } from '@/components/ui/NumberInput';
import { Label } from '@/components/ui/label';
import { FillSection } from './sections/FillSection';
import { StrokeSection } from './sections/StrokeSection';
import { CornerRadiusSection } from './sections/CornerRadiusSection';
import { cn } from '@/lib/utils';

export function PropertyPanel() {
  const isCollapsed = useUIStore((s) => s.propertyPanelCollapsed);
  const setCollapsed = useUIStore((s) => s.setPropertyPanelCollapsed);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const updateShape = useDiagramStore((s) => s.updateShape);

  const { selectedShapes, selectedCount, properties } = useSelectedShapes();

  // Calculate max corner radius based on smallest dimension
  const maxCornerRadius = useMemo(() => {
    if (selectedShapes.length === 0) return 50;

    const rectangles = selectedShapes.filter((s) => s.type === 'rectangle');
    if (rectangles.length === 0) return 50;

    const minDimension = Math.min(
      ...rectangles.map((s) => Math.min(s.width, s.height))
    );
    return Math.floor(minDimension / 2);
  }, [selectedShapes]);

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { [axis]: value });
    });
  };

  const handleDimensionChange = (dim: 'width' | 'height', value: number) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { [dim]: value });
    });
  };

  const handleRotationChange = (value: number) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { rotation: value });
    });
  };

  if (isCollapsed) {
    return (
      <div className="w-10 h-full border-l bg-white flex flex-col items-center pt-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          title="Expand property panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-64 h-full border-l bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="font-medium text-sm">Properties</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(true)}
          title="Collapse property panel"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {!properties ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            Select a shape to view properties
          </div>
        ) : (
          <>
            {/* Selection Info */}
            {selectedCount > 1 && (
              <div className="text-xs text-muted-foreground mb-2">
                {selectedCount} shapes selected
              </div>
            )}

            {/* Position */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Position</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">X</Label>
                  <NumberInput
                    value={properties.x}
                    onChange={(v) => handlePositionChange('x', v)}
                    suffix="px"
                  />
                </div>
                <div>
                  <Label className="text-xs">Y</Label>
                  <NumberInput
                    value={properties.y}
                    onChange={(v) => handlePositionChange('y', v)}
                    suffix="px"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Dimensions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Size</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Width</Label>
                  <NumberInput
                    value={properties.width}
                    onChange={(v) => handleDimensionChange('width', v)}
                    min={10}
                    suffix="px"
                  />
                </div>
                <div>
                  <Label className="text-xs">Height</Label>
                  <NumberInput
                    value={properties.height}
                    onChange={(v) => handleDimensionChange('height', v)}
                    min={10}
                    suffix="px"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Rotation */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Rotation</h4>
              <NumberInput
                value={properties.rotation}
                onChange={handleRotationChange}
                min={0}
                max={360}
                suffix="°"
              />
            </div>

            <Separator />

            {/* Fill */}
            <FillSection
              fill={properties.fill}
              fillOpacity={properties.fillOpacity}
              selectedShapeIds={selectedShapeIds}
            />

            <Separator />

            {/* Stroke */}
            <StrokeSection
              stroke={properties.stroke}
              strokeWidth={properties.strokeWidth}
              strokeStyle={properties.strokeStyle}
              selectedShapeIds={selectedShapeIds}
            />

            {/* Corner Radius (conditional) */}
            {properties.cornerRadius !== null && (
              <>
                <Separator />
                <CornerRadiusSection
                  cornerRadius={properties.cornerRadius}
                  selectedShapeIds={selectedShapeIds}
                  maxRadius={maxCornerRadius}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

### Step 9: Update App Shell

**File:** `src/components/layout/AppShell.tsx` (updated)

```typescript
import React from 'react';
import { Toolbar } from '@/components/toolbar/Toolbar';
import { Canvas } from '@/components/canvas/Canvas';
import { PropertyPanel } from '@/components/panels/PropertyPanel';
import { StatusBar } from '@/components/layout/StatusBar';

export function AppShell() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <Toolbar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative">
          <Canvas />
        </div>

        {/* Property Panel */}
        <PropertyPanel />
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}
```

### Step 10: Update Shape Components

**File:** `src/components/shapes/RectangleShape.tsx` (updated)

```typescript
import React from 'react';
import { Shape } from '@/types/shape';
import { useShapeManipulation } from '@/hooks/useShapeManipulation';

interface Props {
  shape: Shape;
  isSelected: boolean;
}

export function RectangleShape({ shape, isSelected }: Props) {
  const { onShapeMouseDown } = useShapeManipulation({ shape });

  const {
    x, y, width, height, rotation,
    fill, fillOpacity, stroke, strokeWidth, strokeStyle,
    cornerRadius = 0,
  } = shape;

  // Calculate center for rotation transform
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Stroke dash array based on style
  const strokeDasharray =
    strokeStyle === 'dashed' ? '8 4' :
    strokeStyle === 'dotted' ? '2 2' :
    undefined;

  // Handle transparent/none fill
  const fillColor = fill === 'transparent' || fill === 'none' ? 'none' : fill;

  // Handle transparent/none stroke
  const strokeColor = stroke === 'transparent' || stroke === 'none' ? 'none' : stroke;

  return (
    <g
      transform={rotation ? `rotate(${rotation}, ${centerX}, ${centerY})` : undefined}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={cornerRadius}
        ry={cornerRadius}
        fill={fillColor}
        fillOpacity={fillOpacity}
        stroke={strokeColor}
        strokeWidth={strokeColor === 'none' ? 0 : strokeWidth}
        strokeDasharray={strokeDasharray}
        style={{ cursor: isSelected ? 'move' : 'pointer' }}
        onMouseDown={onShapeMouseDown}
      />
    </g>
  );
}
```

---

## Key Decisions

### 1. Color Picker Implementation

**Decision:** Build a custom color picker component rather than using browser native.

**Rationale:**
- Consistent cross-browser experience
- Can include recent colors feature
- Integrates with app styling
- More control over UX

### 2. Real-time Updates

**Decision:** Apply style changes immediately without confirmation.

**Rationale:**
- Draw.io behavior
- More fluid editing experience
- Undo will be available (Phase 7)

### 3. Mixed Values Handling

**Decision:** Show "Mixed" indicator but allow overwriting all.

**Rationale:**
- Users expect to be able to style multiple shapes at once
- Clear indication when values differ
- Simple mental model

---

## Testing Approach

### Unit Tests

```typescript
// src/lib/__tests__/color-utils.test.ts
import { isValidHexColor, normalizeHexColor, hexToRgb } from '../color-utils';

describe('color-utils', () => {
  describe('isValidHexColor', () => {
    it('validates 6-digit hex', () => {
      expect(isValidHexColor('#FF5733')).toBe(true);
      expect(isValidHexColor('#ff5733')).toBe(true);
    });

    it('validates 3-digit hex', () => {
      expect(isValidHexColor('#F53')).toBe(true);
    });

    it('rejects invalid formats', () => {
      expect(isValidHexColor('FF5733')).toBe(false);
      expect(isValidHexColor('#GG5733')).toBe(false);
      expect(isValidHexColor('#FF57')).toBe(false);
    });
  });

  describe('normalizeHexColor', () => {
    it('expands 3-digit to 6-digit', () => {
      expect(normalizeHexColor('#F53')).toBe('#FF5533');
    });

    it('uppercases', () => {
      expect(normalizeHexColor('#ff5733')).toBe('#FF5733');
    });
  });
});
```

---

## Performance Considerations

- Use `useMemo` for computed properties from multiple shapes
- Debounce color picker changes if performance issues occur
- Batch shape updates when styling multiple shapes

---

## Accessibility Requirements

- Color picker must be keyboard navigable
- Inputs must have proper labels
- Color contrast indicators (future enhancement)
- Screen reader announcements for value changes
