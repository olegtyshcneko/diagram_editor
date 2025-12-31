// Available tools
export type Tool =
  | 'select'
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'triangle'
  | 'line'
  | 'text'
  | 'connection'
  | 'pan';

// Tool metadata
export interface ToolInfo {
  id: Tool;
  name: string;
  shortcut: string;
  icon: string; // Lucide icon name
}

// Tool definitions
export const TOOLS: ToolInfo[] = [
  { id: 'select', name: 'Select', shortcut: 'V', icon: 'MousePointer2' },
  { id: 'rectangle', name: 'Rectangle', shortcut: 'R', icon: 'Square' },
  { id: 'ellipse', name: 'Ellipse', shortcut: 'E', icon: 'Circle' },
  { id: 'diamond', name: 'Diamond', shortcut: 'D', icon: 'Diamond' },
  { id: 'line', name: 'Line', shortcut: 'L', icon: 'Minus' },
  { id: 'text', name: 'Text', shortcut: 'T', icon: 'Type' },
  { id: 'connection', name: 'Connection', shortcut: 'C', icon: 'ArrowRight' },
];
