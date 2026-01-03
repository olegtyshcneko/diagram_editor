import { useRef, useEffect, useCallback } from 'react';
import type { Shape } from '@/types/shapes';
import type { Viewport } from '@/types/viewport';
import { useDiagramStore } from '@/stores/diagramStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { DEFAULT_TEXT_STYLE } from '@/types/shapes';
import { TEXT_DEFAULTS } from '@/lib/constants';

interface TextEditOverlayProps {
  shape: Shape;
  viewport: Viewport;
}

export function TextEditOverlay({
  shape,
  viewport,
}: TextEditOverlayProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const updateShape = useDiagramStore((s) => s.updateShape);
  const setEditingTextShapeId = useInteractionStore(
    (s) => s.setEditingTextShapeId
  );

  const textStyle = shape.textStyle || DEFAULT_TEXT_STYLE;

  // Calculate overlay position in screen coordinates
  const screenX = (shape.x - viewport.x) * viewport.zoom;
  const screenY = (shape.y - viewport.y) * viewport.zoom;
  const screenWidth = shape.width * viewport.zoom;
  const screenHeight = shape.height * viewport.zoom;

  const scaledFontSize = textStyle.fontSize * viewport.zoom;

  // Focus and select text on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleBlur = useCallback(() => {
    setEditingTextShapeId(null);
  }, [setEditingTextShapeId]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      updateShape(shape.id, {
        text: {
          html: newText,
          plainText: newText,
        },
      });
    },
    [shape.id, updateShape]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Handle formatting shortcuts
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();

        if (key === 'b') {
          e.preventDefault();
          updateShape(shape.id, {
            textStyle: {
              ...textStyle,
              fontWeight: textStyle.fontWeight === 'bold' ? 'normal' : 'bold',
            },
          });
          return;
        }

        if (key === 'i') {
          e.preventDefault();
          updateShape(shape.id, {
            textStyle: {
              ...textStyle,
              fontStyle: textStyle.fontStyle === 'italic' ? 'normal' : 'italic',
            },
          });
          return;
        }

        if (key === 'u') {
          e.preventDefault();
          updateShape(shape.id, {
            textStyle: {
              ...textStyle,
              textDecoration:
                textStyle.textDecoration === 'underline' ? 'none' : 'underline',
            },
          });
          return;
        }
      }

      // Exit on Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        setEditingTextShapeId(null);
        return;
      }

      // Stop propagation for all other keys to prevent canvas shortcuts
      e.stopPropagation();
    },
    [shape.id, textStyle, updateShape, setEditingTextShapeId]
  );

  // Prevent click events from bubbling to canvas
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Calculate text alignment
  const textAlign = textStyle.horizontalAlign === 'left'
    ? 'left'
    : textStyle.horizontalAlign === 'right'
      ? 'right'
      : 'center';

  return (
    <textarea
      ref={textareaRef}
      value={shape.text?.plainText || ''}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
      aria-label="Edit shape text"
      aria-multiline="true"
      style={{
        position: 'absolute',
        left: screenX,
        top: screenY,
        width: screenWidth,
        height: screenHeight,
        fontFamily: textStyle.fontFamily,
        fontSize: scaledFontSize,
        fontWeight: textStyle.fontWeight,
        fontStyle: textStyle.fontStyle,
        textDecoration: textStyle.textDecoration,
        color: textStyle.fontColor,
        textAlign,
        background: 'rgba(255, 255, 255, 0.9)',
        border: '2px solid #3B82F6',
        borderRadius: '2px',
        outline: 'none',
        resize: 'none',
        overflow: 'hidden',
        padding: `${TEXT_DEFAULTS.TEXT_PADDING}px`,
        boxSizing: 'border-box',
        lineHeight: TEXT_DEFAULTS.LINE_HEIGHT,
      }}
    />
  );
}
