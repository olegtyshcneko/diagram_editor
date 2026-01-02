import { useMemo } from 'react';
import type { TextContent, TextStyle } from '@/types/shapes';

interface ShapeTextProps {
  text: TextContent | undefined;
  textStyle: TextStyle;
  shapeBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const PADDING = 8;

export function ShapeText({ text, textStyle, shapeBounds }: ShapeTextProps) {
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
        return x + PADDING;
      case 'right':
        return x + width - PADDING;
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

  // Split text into lines
  const lines = text.plainText.split('\n');
  const lineHeight = fontSize * 1.2;
  const totalTextHeight = lines.length * lineHeight;

  // Calculate starting Y position based on vertical alignment
  const startY = useMemo(() => {
    switch (verticalAlign) {
      case 'top':
        return y + PADDING + fontSize;
      case 'bottom':
        return y + height - PADDING - totalTextHeight + fontSize;
      case 'middle':
      default:
        return y + (height - totalTextHeight) / 2 + fontSize;
    }
  }, [verticalAlign, y, height, fontSize, totalTextHeight]);

  // SVG dominant-baseline based on alignment
  const dominantBaseline = 'auto';

  return (
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
          key={i}
          x={textX}
          y={startY + i * lineHeight}
        >
          {line || '\u00A0'} {/* Non-breaking space for empty lines */}
        </tspan>
      ))}
    </text>
  );
}
