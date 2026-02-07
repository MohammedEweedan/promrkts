import { useEffect } from 'react';

/**
 * Global protection component that disables:
 * - Right-click (context menu)
 * - F12 (DevTools)
 * - Ctrl+Shift+I (Inspect Element)
 * - Ctrl+Shift+J (Console)
 * - Ctrl+Shift+C (Inspect Element)
 * - Ctrl+U (View Source)
 * - Detects DevTools open and redirects
 */

// Console warning message
const showConsoleWarning = () => {
  console.clear();
  console.log(
    '%c🛡️ Security Notice 🛡️',
    'color: #65a8bf; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);'
  );
  console.log(
    '%cTo protect against cybersecurity threats, we have disabled browser inspection tools to keep your data safe. 😊',
    'color: #b7a27d; font-size: 14px; padding: 10px;'
  );
  console.log(
    '%c⚠️ If you are a developer, please contact our team for API access.',
    'color: #ff6b6b; font-size: 12px;'
  );
};

// Track if DevTools is detected
let isDevToolsOpen = false;

// Store original fetch and XHR
const originalFetch = window.fetch;
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

// API interception is set up once, but only blocks when isDevToolsOpen is true
let apisIntercepted = false;

const setupAPIInterception = () => {
  if (apisIntercepted) return;
  apisIntercepted = true;

  // Override fetch - only blocks when DevTools is actually open
  window.fetch = function(...args) {
    if (isDevToolsOpen) {
      console.warn('%c⚠️ API calls blocked while DevTools is open', 'color: #ff6b6b; font-weight: bold;');
      return Promise.reject(new Error('API blocked: DevTools detected'));
    }
    return originalFetch.apply(window, args);
  };

  // Override XHR - only blocks when DevTools is actually open
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async: boolean = true, username?: string | null, password?: string | null) {
    (this as XMLHttpRequest & { _blocked?: boolean })._blocked = isDevToolsOpen;
    return originalXHROpen.call(this, method, url, async, username, password);
  };

  XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
    if ((this as XMLHttpRequest & { _blocked?: boolean })._blocked) {
      console.warn('%c⚠️ API calls blocked while DevTools is open', 'color: #ff6b6b; font-weight: bold;');
      return;
    }
    return originalXHRSend.call(this, body);
  };
};

// DevTools detection - only using reliable window size method
const detectDevTools = (onOpen: () => void, onClose: () => void) => {
  // Method: Window size difference (most reliable for docked DevTools)
  const checkWindowSize = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    return widthThreshold || heightThreshold;
  };

  const runCheck = () => {
    const detected = checkWindowSize();
    
    if (detected && !isDevToolsOpen) {
      isDevToolsOpen = true;
      onOpen();
    } else if (!detected && isDevToolsOpen) {
      isDevToolsOpen = false;
      onClose();
    }
  };

  // Check periodically
  const interval = setInterval(runCheck, 1000);
  
  // Also check on resize
  window.addEventListener('resize', runCheck);

  // Initial check
  runCheck();

  return () => {
    clearInterval(interval);
    window.removeEventListener('resize', runCheck);
  };
};

export const GlobalProtection = () => {
  useEffect(() => {
    // Show initial console warning
    showConsoleWarning();

    // Set up API interception (only blocks when DevTools is detected)
    setupAPIInterception();

    // DevTools detection - block APIs and show warning (no redirect)
    const cleanupDevToolsDetection = detectDevTools(
      // On DevTools open
      () => {
        showConsoleWarning();
        console.log('%c🔒 API calls are now blocked', 'color: #ff6b6b; font-size: 14px; font-weight: bold;');
      },
      // On DevTools close
      () => {
        console.log('%c✅ DevTools closed - API calls restored', 'color: #4ade80; font-size: 14px; font-weight: bold;');
      }
    );
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
      cleanupDevToolsDetection();
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
