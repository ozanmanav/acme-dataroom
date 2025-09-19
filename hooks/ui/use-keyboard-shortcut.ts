import { useEffect } from 'react';

/**
 * Custom hook to handle keyboard shortcuts
 * @param key - The key to listen for
 * @param handler - Function to call when the key is pressed
 * @param options - Additional options for the event listener
 */
export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  options?: {
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
  }
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey = false, altKey = false, shiftKey = false, metaKey = false } = options || {};
      
      if (
        event.key === key &&
        event.ctrlKey === ctrlKey &&
        event.altKey === altKey &&
        event.shiftKey === shiftKey &&
        event.metaKey === metaKey
      ) {
        handler();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, handler, options]);
}