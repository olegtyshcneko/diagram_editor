# Phase 5.2: Automatic Text Wrapping - Requirements

## Overview

Implement automatic word wrapping for text within shapes, replacing the simple clipPath solution from P5.1.

## User Story

As a user, when I type or paste text into a shape, I want the text to automatically wrap to new lines so that it fits within the shape's width. Text should only overflow vertically (downward), not horizontally.

## Requirements

### R1: Automatic Word Wrapping
- Text automatically wraps at word boundaries when it exceeds shape width
- Wrapping recalculates when:
  - Text content changes
  - Shape is resized
  - Font family or size changes

### R2: Long Word Handling
- Single words longer than shape width are broken at character level
- At least one character per line is guaranteed

### R3: User Newlines Preserved
- User-entered newlines (`Enter` key) are preserved
- Multiple consecutive newlines create empty lines

### R4: Vertical Overflow Allowed
- Text can extend below the shape boundary
- No vertical clipping (user can see all text)

### R5: Pure SVG Output
- Solution uses SVG `<text>` and `<tspan>` elements
- No `<foreignObject>` or HTML elements
- Ensures compatibility with SVG export

## Non-Requirements

- Auto-resize shape to fit text (deferred to future phase)
- Hyphenation (breaking words with hyphens)
- Justified text alignment
