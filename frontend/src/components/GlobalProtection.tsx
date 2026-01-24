import { useEffect } from 'react';

/**
 * Global protection component that disables:
 * - Right-click (context menu)
 * - F12 (DevTools)
 * - Ctrl+Shift+I (Inspect Element)
 * - Ctrl+Shift+J (Console)
 * - Ctrl+Shift+C (Inspect Element)
 * - Ctrl+U (View Source)
 */
export const GlobalProtection = () => {
  useEffect(() => {
    // Disable right-click globally
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts for DevTools
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I (Inspect)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }

      // Cmd+Option+I (Mac Inspect)
      if (e.metaKey && e.altKey && e.key === 'i') {
        e.preventDefault();
        return false;
      }

      // Cmd+Option+J (Mac Console)
      if (e.metaKey && e.altKey && e.key === 'j') {
        e.preventDefault();
        return false;
      }

      // Cmd+Option+C (Mac Inspect Element)
      if (e.metaKey && e.altKey && e.key === 'c') {
        e.preventDefault();
        return false;
      }

      // Cmd+Option+U (Mac View Source)
      if (e.metaKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    };

    // Disable text selection on certain elements
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      // Allow text selection in input fields and textareas
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return true;
      }
      // Prevent selection on videos and PDFs
      if (target.tagName === 'VIDEO' || target.tagName === 'OBJECT' || target.tagName === 'EMBED') {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'VIDEO' || target.tagName === 'IMG' || target.tagName === 'OBJECT') {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    // Add CSS to prevent text selection on media elements
    const style = document.createElement('style');
    style.textContent = `
      video, object, embed, iframe {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
      }
    `;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      document.head.removeChild(style);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default GlobalProtection;
