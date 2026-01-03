import { useMemo } from 'react';
import type { TextContent, TextStyle } from '@/types/shapes';
import { TEXT_DEFAULTS } from '@/lib/constants';
import { wrapText } from '@/lib/geometry/text';

interface ShapeTextProps {
  shapeId: string;
  text: TextContent | undefined;
  textStyle: TextStyle;
  shapeBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const { TEXT_PADDING, LINE_HEIGHT } = TEXT_DEFAULTS;

export function ShapeText({ shapeId, text, textStyle, shapeBounds }: ShapeTextProps) {
  // Don't render if no text
  if (!text?.plainText) return null;

  const {
    fontFamily,
    fontSize,
    fontColor,
    fontWeight,
    fontStyle,
    textDecoration,
    horizontalAlign,
    verticalAlign,
  } = textStyle;

  const { x, y, width, height } = shapeBounds;

  // Calculate text X position based on horizontal alignment
  const textX = useMemo(() => {
    switch (horizontalAlign) {
      case 'left':
        return x + TEXT_PADDING;
      case 'right':
        return x + width - TEXT_PADDING;
      case 'center':
      default:
        return x + width / 2;
    }
  }, [horizontalAlign, x, width]);

  // SVG text-anchor based on horizontal alignment
  const textAnchor = useMemo(() => {
    switch (horizontalAlign) {
      case 'left':
        return 'start';
      case 'right':
        return 'end';
      case 'center':
      default:
        return 'middle';
    }
  }, [horizontalAlign]);

  // Calculate max width for text wrapping
  const maxWidth = width - TEXT_PADDING * 2;

  // Wrap text to fit within shape width
  const lines = useMemo(
    () =>
      wrapText({
        text: text.plainText,
        maxWidth,
        fontSize,
        fontFamily,
        fontWeight,
        fontStyle,
      }),
    [text.plainText, maxWidth, fontSize, fontFamily, fontWeight, fontStyle]
  );

  const lineHeight = fontSize * LINE_HEIGHT;
  const totalTextHeight = lines.length * lineHeight;

  // Calculate starting Y position based on vertical alignment
  const startY = useMemo(() => {
    switch (verticalAlign) {
      case 'top':
        return y + TEXT_PADDING + fontSize;
      case 'bottom':
        return y + height - TEXT_PADDING - totalTextHeight + fontSize;
      case 'middle':
      default:
        return y + (height - totalTextHeight) / 2 + fontSize;
    }
  }, [verticalAlign, y, height, fontSize, totalTextHeight]);

  // SVG dominant-baseline based on alignment
  const dominantBaseline = 'auto';

  return (
    <g>
      <text
        x={textX}
        textAnchor={textAnchor}
        dominantBaseline={dominantBaseline}
        fontFamily={fontFamily}
        fontSize={fontSize}
        fontWeight={fontWeight}
        fontStyle={fontStyle}
        textDecoration={textDecoration}
        fill={fontColor}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {lines.map((line, i) => (
          <tspan
            key={`${shapeId}-line-${i}`}
            x={textX}
            y={startY + i * lineHeight}
          >
            {line || '\u00A0'} {/* Non-breaking space for empty lines */}
          </tspan>
        ))}
      </text>
    </g>
  );
}
