import { ColorPicker } from '@/components/ui/ColorPicker';
import { NumberInput } from '@/components/ui/NumberInput';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDiagramStore } from '@/stores/diagramStore';
import type { SelectedShapeProperties } from '@/hooks/useSelectedShapes';
import type { StrokeStyle } from '@/types/shapes';
import { isTransparent } from '@/lib/color-utils';
import { cn } from '@/lib/utils';

interface StrokeSectionProps {
  selectedShapeIds: string[];
  properties: SelectedShapeProperties;
}

const STROKE_WIDTH_PRESETS = [1, 2, 3, 4, 6, 8];

export function StrokeSection({ selectedShapeIds, properties }: StrokeSectionProps) {
  const updateShape = useDiagramStore((s) => s.updateShape);

  // Get current values (use first value if mixed)
  const currentStroke = properties.stroke === 'mixed' ? '#000000' : properties.stroke;
  const currentWidth = properties.strokeWidth === 'mixed' ? 2 : properties.strokeWidth;
  const currentStyle = properties.strokeStyle === 'mixed' ? 'solid' : properties.strokeStyle;

  // Check if stroke is disabled (transparent/none)
  const hasNoStroke = isTransparent(currentStroke);

  const handleStrokeColorChange = (color: string) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { stroke: color });
    });
  };

  const handleStrokeWidthChange = (width: number) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { strokeWidth: width });
    });
  };

  const handleStrokeStyleChange = (style: string) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { strokeStyle: style as StrokeStyle });
    });
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs text-muted-foreground">Stroke</Label>

      {/* Color */}
      <div className="flex items-center gap-2">
        <ColorPicker
          value={currentStroke}
          onChange={handleStrokeColorChange}
          allowTransparent={true}
          transparentLabel="No Stroke"
        />
        <span className="text-sm text-muted-foreground">
          {properties.stroke === 'mixed'
            ? 'Mixed'
            : hasNoStroke
              ? 'No Stroke'
              : properties.stroke}
        </span>
      </div>

      {/* Width Presets - disabled when no stroke */}
      <div className={cn('space-y-1', hasNoStroke && 'opacity-50 pointer-events-none')}>
        <Label className="text-xs">Width</Label>
        <div className="flex gap-1 flex-wrap">
          {STROKE_WIDTH_PRESETS.map((width) => (
            <button
              key={width}
              type="button"
              onClick={() => handleStrokeWidthChange(width)}
              disabled={hasNoStroke}
              className={cn(
                'px-2 py-1 text-xs rounded border transition-colors',
                currentWidth === width
                  ? 'border-ring bg-accent'
                  : 'border-border hover:bg-accent/50',
                hasNoStroke && 'cursor-not-allowed'
              )}
            >
              {width}
            </button>
          ))}
        </div>
        <NumberInput
          value={properties.strokeWidth}
          onChange={handleStrokeWidthChange}
          min={0}
          max={50}
          step={1}
          suffix="px"
          disabled={hasNoStroke}
        />
      </div>

      {/* Style - disabled when no stroke */}
      <div className={cn('space-y-1', hasNoStroke && 'opacity-50 pointer-events-none')}>
        <Label className="text-xs">Style</Label>
        <Select
          value={currentStyle}
          onValueChange={handleStrokeStyleChange}
          disabled={hasNoStroke}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">
              <div className="flex items-center gap-2">
                <div className="w-12 h-0.5 bg-foreground" />
                <span>Solid</span>
              </div>
            </SelectItem>
            <SelectItem value="dashed">
              <div className="flex items-center gap-2">
                <div className="w-12 h-0.5 border-t-2 border-dashed border-foreground" />
                <span>Dashed</span>
              </div>
            </SelectItem>
            <SelectItem value="dotted">
              <div className="flex items-center gap-2">
                <div className="w-12 h-0.5 border-t-2 border-dotted border-foreground" />
                <span>Dotted</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
