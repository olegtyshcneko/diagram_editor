import type { Point } from './common';

/**
 * Types of context menu that can be displayed
 */
export type ContextMenuType =
  | 'shape'
  | 'multiSelect'
  | 'canvas'
  | 'connection';

/**
 * A single context menu item
 */
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  action: () => void;
  separator?: false;
}

/**
 * A separator in the context menu
 */
export interface ContextMenuSeparator {
  separator: true;
}

/**
 * Either a menu item or a separator
 */
export type ContextMenuEntry = ContextMenuItem | ContextMenuSeparator;

/**
 * State for the context menu
 */
export interface ContextMenuState {
  isOpen: boolean;
  position: Point;
  type: ContextMenuType;
  targetId?: string; // Shape or connection ID, if applicable
}
