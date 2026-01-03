/**
 * Text wrapping utilities for SVG text rendering
 */

export interface WrapTextOptions {
  text: string;
  maxWidth: number;
  fontSize: number;
  fontFamily: string;
  fontWeight?: string;
  fontStyle?: string;
}

/**
 * Wraps text to fit within a maximum width, preserving user-entered newlines.
 * Uses Canvas measureText API for accurate text measurement.
 *
 * @param options - Text wrapping options
 * @returns Array of wrapped lines
 */
export function wrapText(options: WrapTextOptions): string[] {
  const {
    text,
    maxWidth,
    fontSize,
    fontFamily,
    fontWeight = 'normal',
    fontStyle = 'normal',
  } = options;

  // Handle edge cases
  if (!text) return [''];
  if (maxWidth <= 0) return [text]; // Can't wrap, return as-is

  // Create offscreen canvas for text measurement
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.warn('Could not get canvas context for text measurement');
    return text.split('\n');
  }

  // Set font to match SVG text style
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

  // Split by user-entered newlines to preserve paragraph structure
  const paragraphs = text.split('\n');
  const wrappedLines: string[] = [];

  for (const paragraph of paragraphs) {
    // Preserve empty lines (from consecutive newlines)
    if (!paragraph) {
      wrappedLines.push('');
      continue;
    }

    // Split paragraph into words
    const words = paragraph.split(/\s+/).filter((w) => w.length > 0);
    if (words.length === 0) {
      wrappedLines.push('');
      continue;
    }

    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        // Current line is full, push it and start new line with current word
        wrappedLines.push(currentLine);
        currentLine = word;

        // Handle single word longer than maxWidth (break at character level)
        while (ctx.measureText(currentLine).width > maxWidth && currentLine.length > 1) {
          const breakPoint = findBreakPoint(ctx, currentLine, maxWidth);
          wrappedLines.push(currentLine.slice(0, breakPoint));
          currentLine = currentLine.slice(breakPoint);
        }
      } else {
        currentLine = testLine;
      }
    }

    // Push remaining text in current line
    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  }

  return wrappedLines.length > 0 ? wrappedLines : [''];
}

/**
 * Find the character index where text should break to fit within maxWidth.
 * Uses binary search for efficiency.
 */
function findBreakPoint(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): number {
  // Binary search for the break point
  let low = 1;
  let high = text.length;
  let result = 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const width = ctx.measureText(text.slice(0, mid)).width;

    if (width <= maxWidth) {
      result = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return result;
}
