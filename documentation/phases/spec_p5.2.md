# Phase 5.2: Automatic Text Wrapping - Technical Specification

## Overview

Replace clipPath-based text overflow handling with automatic word wrapping using Canvas measureText API.

## Technical Approach

### Text Measurement
Use Canvas 2D `measureText()` API to calculate text width:
- Create offscreen canvas element
- Set font style matching SVG text
- Measure word/line widths to determine wrap points

### Wrapping Algorithm
1. Split text by user newlines (`\n`) into paragraphs
2. For each paragraph:
   - Split into words by whitespace
   - Accumulate words into current line
   - When line exceeds maxWidth, start new line
   - Handle single long words with character-level breaking

## Files to Create

### `src/lib/geometry/text.ts`

```typescript
interface WrapTextOptions {
  text: string;
  maxWidth: number;
  fontSize: number;
  fontFamily: string;
  fontWeight?: string;
  fontStyle?: string;
}

export function wrapText(options: WrapTextOptions): string[];
```

**Implementation:**
1. Create offscreen canvas for measurement
2. Set font: `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
3. Split text by `\n` to preserve user newlines
4. For each paragraph, accumulate words until line width exceeds maxWidth
5. Handle edge cases: empty text, single long word, very narrow width

## Files to Modify

### `src/components/shapes/ShapeText.tsx`

**Changes:**
1. Import `wrapText` from `@/lib/geometry/text`
2. Calculate `maxWidth = width - TEXT_PADDING * 2`
3. Replace `text.plainText.split('\n')` with:
   ```typescript
   const lines = useMemo(() =>
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
   ```
4. Remove clipPath `<defs>` and `<clipPath>` elements
5. Remove `clipPath` attribute from `<g>` wrapper

### `documentation/phases/README.md`

Add P5.2 row to phase table and description section.

## Edge Cases

| Case | Behavior |
|------|----------|
| Empty text | Return `['']` |
| Single long word | Break at character level |
| Very narrow shape (< 1 char) | Show 1 char per line minimum |
| Multiple newlines `\n\n` | Preserve as empty lines |
| Leading/trailing whitespace | Trimmed by word split |

## Algorithm Pseudocode

```
function wrapText(text, maxWidth, font):
  paragraphs = text.split('\n')
  lines = []

  for paragraph in paragraphs:
    if paragraph is empty:
      lines.push('')
      continue

    words = paragraph.split(/\s+/)
    currentLine = ''

    for word in words:
      testLine = currentLine + ' ' + word

      if measureWidth(testLine) > maxWidth and currentLine:
        lines.push(currentLine)
        currentLine = word

        // Handle word longer than maxWidth
        while measureWidth(currentLine) > maxWidth:
          breakPoint = findFittingCharCount(currentLine, maxWidth)
          lines.push(currentLine.slice(0, breakPoint))
          currentLine = currentLine.slice(breakPoint)
      else:
        currentLine = testLine

    if currentLine:
      lines.push(currentLine)

  return lines or ['']
```

## Verification Steps

1. Type long text in shape - should wrap at word boundaries
2. Resize shape narrower - text should rewrap dynamically
3. Press Enter for newlines - should be preserved
4. Type very long word - should break at characters
5. Change font size - text should rewrap
6. Run `npx tsc --noEmit` - should pass
