import { useRef, useEffect, useCallback } from 'react';
import type { Shape, TextContent } from '@/types/shapes';
import type { Viewport } from '@/types/viewport';
import { useDiagramStore } from '@/stores/diagramStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useHistoryStore } from '@/stores/historyStore';
import { EMPTY_CONNECTION_DELTA } from '@/types/history';
import { DEFAULT_TEXT_STYLE } from '@/types/shapes';
import { TEXT_DEFAULTS } from '@/lib/constants';
import { isCtrlOrMeta } from '@/lib/input';

interface TextEditOverlayProps {
  shape: Shape;
  viewport: Viewport;
}

export function TextEditOverlay({
  shape,
  viewport,
}: TextEditOverlayProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const originalTextRef = useRef<TextContent | undefined>(undefined);
  const updateShape = useDiagramStore((s) => s.updateShape);
  const setEditingTextShapeId = useInteractionStore(
    (s) => s.setEditingTextShapeId
  );
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);

  const textStyle = shape.textStyle || DEFAULT_TEXT_STYLE;

  // Calculate overlay position in screen coordinates
  const screenX = (shape.x - viewport.x) * viewport.zoom;
  const screenY = (shape.y - viewport.y) * viewport.zoom;
  const screenWidth = shape.width * viewport.zoom;
  const screenHeight = shape.height * viewport.zoom;

  const scaledFontSize = textStyle.fontSize * viewport.zoom;

  // Capture original text and focus on mount
  useEffect(() => {
    // Capture original text at start of editing
    originalTextRef.current = shape.text ? { ...shape.text } : undefined;

    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleBlur = useCallback(() => {
    // Get current shape state
    const currentShape = useDiagramStore.getState().shapes[shape.id];
    const currentText = currentShape?.text;
    const originalText = originalTextRef.current;

    // Check if text changed
    const originalPlainText = originalText?.plainText || '';
    const currentPlainText = currentText?.plainText || '';

    if (originalPlainText !== currentPlainText) {
      // Push history entry
      pushEntry({
        type: 'UPDATE_TEXT',
        description: 'Edit Text',
        shapeDelta: {
          added: [],
          removed: [],
          modified: [{
            id: shape.id,
            before: { text: originalText },
            after: { text: currentText },
          }],
        },
        connectionDelta: EMPTY_CONNECTION_DELTA,
        selectionBefore: selectedShapeIds,
        selectionAfter: selectedShapeIds,
      });
    }

    setEditingTextShapeId(null);
  }, [setEditingTextShapeId, shape.id, pushEntry, selectedShapeIds]);

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
      if (isCtrlOrMeta(e.nativeEvent)) {
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
