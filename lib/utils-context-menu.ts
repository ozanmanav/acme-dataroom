import { ContextMenuPosition } from '@/types';

/**
 * Constants for context menu calculations
 */
export const CONTEXT_MENU_CONSTANTS = {
  MIN_WIDTH: 180,
  ITEM_HEIGHT: 40,
  VIEWPORT_PADDING: 10,
} as const;

/**
 * Calculates the adjusted position for a context menu to keep it within the viewport
 * @param position - The initial position where the menu should appear
 * @param itemCount - Number of items in the menu
 * @param menuWidth - Width of the menu (optional, defaults to MIN_WIDTH)
 * @returns Adjusted position and z-index for the context menu
 */
export function calculateContextMenuPosition(
  position: ContextMenuPosition,
  itemCount: number,
  menuWidth: number = CONTEXT_MENU_CONSTANTS.MIN_WIDTH
): React.CSSProperties {
  const menuHeight = itemCount * CONTEXT_MENU_CONSTANTS.ITEM_HEIGHT;
  
  // Calculate adjusted position to keep menu within viewport
  const adjustedLeft = Math.min(
    position.x,
    window.innerWidth - menuWidth - CONTEXT_MENU_CONSTANTS.VIEWPORT_PADDING
  );
  
  const adjustedTop = Math.min(
    position.y,
    window.innerHeight - menuHeight - CONTEXT_MENU_CONSTANTS.VIEWPORT_PADDING
  );

  return {
    position: 'fixed' as const,
    left: Math.max(CONTEXT_MENU_CONSTANTS.VIEWPORT_PADDING, adjustedLeft),
    top: Math.max(CONTEXT_MENU_CONSTANTS.VIEWPORT_PADDING, adjustedTop),
    zIndex: 1000,
  };
}