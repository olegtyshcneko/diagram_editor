import { useDiagramStore } from '@/stores/diagramStore';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { NumberInput } from '@/components/ui/NumberInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TextStyle, HorizontalAlign, VerticalAlign } from '@/types/shapes';
import { DEFAULT_TEXT_STYLE } from '@/types/shapes';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextSectionProps {
  selectedShapeIds: string[];
}

const FONT_FAMILIES = [
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Times New Roman, serif',
  'Georgia, serif',
  'Courier New, monospace',
  'Verdana, sans-serif',
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 24, 36, 48];

export function TextSection({ selectedShapeIds }: TextSectionProps) {
  const shapes = useDiagramStore((s) => s.shapes);
  const updateShape = useDiagramStore((s) => s.updateShape);

  // Get text style from first selected shape
  const firstShape = shapes[selectedShapeIds[0]];
  const textStyle = firstShape?.textStyle || DEFAULT_TEXT_STYLE;

  const handleTextStyleChange = (updates: Partial<TextStyle>) => {
    selectedShapeIds.forEach((id) => {
      const shape = shapes[id];
      if (shape) {
        updateShape(id, {
          textStyle: { ...(shape.textStyle || DEFAULT_TEXT_STYLE), ...updates },
        });
      }
    });
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs text-muted-foreground">Text</Label>

      {/* Font Family */}
      <div className="flex items-center gap-2">
        <Label className="w-12 text-xs shrink-0">Font</Label>
        <Select
          value={textStyle.fontFamily}
          onValueChange={(value) => handleTextStyleChange({ fontFamily: value })}
        >
          <SelectTrigger className="flex-1 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                {font.split(',')[0]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div className="flex items-center gap-2">
        <Label className="w-12 text-xs shrink-0">Size</Label>
        <Select
          value={String(textStyle.fontSize)}
          onValueChange={(value) =>
            handleTextStyleChange({ fontSize: parseInt(value) })
          }
        >
          <SelectTrigger className="w-16 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <NumberInput
          value={textStyle.fontSize}
          onChange={(value) => handleTextStyleChange({ fontSize: value })}
          min={6}
          max={200}
          className="w-16 h-8"
        />
      </div>

      {/* Bold/Italic/Underline */}
      <div className="flex items-center gap-2">
        <Label className="w-12 text-xs shrink-0">Style</Label>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'w-8 h-8',
              textStyle.fontWeight === 'bold' && 'bg-blue-100 border-blue-300'
            )}
            onClick={() =>
              handleTextStyleChange({
                fontWeight: textStyle.fontWeight === 'bold' ? 'normal' : 'bold',
              })
            }
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'w-8 h-8',
              textStyle.fontStyle === 'italic' && 'bg-blue-100 border-blue-300'
            )}
            onClick={() =>
              handleTextStyleChange({
                fontStyle:
                  textStyle.fontStyle === 'italic' ? 'normal' : 'italic',
              })
            }
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'w-8 h-8',
              textStyle.textDecoration === 'underline' &&
                'bg-blue-100 border-blue-300'
            )}
            onClick={() =>
              handleTextStyleChange({
                textDecoration:
                  textStyle.textDecoration === 'underline' ? 'none' : 'underline',
              })
            }
          >
            <Underline className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Text Color */}
      <div className="flex items-center gap-2">
        <Label className="w-12 text-xs shrink-0">Color</Label>
        <ColorPicker
          value={textStyle.fontColor}
          onChange={(color) => handleTextStyleChange({ fontColor: color })}
        />
        <span className="text-xs text-muted-foreground">
          {textStyle.fontColor}
        </span>
      </div>

      {/* Horizontal Alignment */}
      <div className="flex items-center gap-2">
        <Label className="w-12 text-xs shrink-0">Align</Label>
        <div className="flex gap-1">
          {(['left', 'center', 'right'] as HorizontalAlign[]).map((align) => (
            <Button
              key={align}
              variant="outline"
              size="icon"
              className={cn(
                'w-8 h-8',
                textStyle.horizontalAlign === align &&
                  'bg-blue-100 border-blue-300'
              )}
              onClick={() => handleTextStyleChange({ horizontalAlign: align })}
            >
              {align === 'left' && <AlignLeft className="w-4 h-4" />}
              {align === 'center' && <AlignCenter className="w-4 h-4" />}
              {align === 'right' && <AlignRight className="w-4 h-4" />}
            </Button>
          ))}
        </div>
      </div>

      {/* Vertical Alignment */}
      <div className="flex items-center gap-2">
        <Label className="w-12 text-xs shrink-0">V-Align</Label>
        <div className="flex gap-1">
          {(['top', 'middle', 'bottom'] as VerticalAlign[]).map((vAlign) => (
            <Button
              key={vAlign}
              variant="outline"
              size="icon"
              className={cn(
                'w-8 h-8',
                textStyle.verticalAlign === vAlign &&
                  'bg-blue-100 border-blue-300'
              )}
              onClick={() => handleTextStyleChange({ verticalAlign: vAlign })}
            >
              {vAlign === 'top' && <AlignStartVertical className="w-4 h-4" />}
              {vAlign === 'middle' && (
                <AlignCenterVertical className="w-4 h-4" />
              )}
              {vAlign === 'bottom' && <AlignEndVertical className="w-4 h-4" />}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
