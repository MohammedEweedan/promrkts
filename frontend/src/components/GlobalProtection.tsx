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

// DevTools detection using multiple methods
const detectDevTools = (callback: () => void) => {
  let devtoolsOpen = false;
  let hasTriggered = false;

  // Method 1: Window size difference (works for docked DevTools)
  const checkWindowSize = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    return widthThreshold || heightThreshold;
  };

  // Method 2: Console.log timing detection
  const checkConsoleTiming = () => {
    const element = new Image();
    let isOpen = false;
    
    Object.defineProperty(element, 'id', {
      get: function() {
        isOpen = true;
        return '';
      }
    });
    
    console.log(element);
    console.clear();
    return isOpen;
  };

  // Method 3: Debugger statement timing (detects DevTools open on page load)
  const checkDebuggerTiming = () => {
    const start = performance.now();
    // This will pause if DevTools is open with debugger enabled
    // eslint-disable-next-line no-debugger
    debugger;
    const end = performance.now();
    // If debugger paused for more than 100ms, DevTools is likely open
    return (end - start) > 100;
  };

  // Method 4: Function toString detection
  const checkFunctionToString = () => {
    let isOpen = false;
    const fn = function() {};
    fn.toString = function() {
      isOpen = true;
      return '';
    };
    console.log(fn);
    console.clear();
    return isOpen;
  };

  // Method 5: Performance timing detection (detects DevTools open before page load)
  const checkPerformanceTiming = () => {
    const t1 = performance.now();
    for (let i = 0; i < 100; i++) {
      console.log(i);
      console.clear();
    }
    const t2 = performance.now();
    // Console operations are significantly slower when DevTools is open
    return (t2 - t1) > 200;
  };

  // Combined check
  const runChecks = () => {
    if (hasTriggered) return;
    
    const sizeCheck = checkWindowSize();
    const consoleCheck = checkConsoleTiming();
    const functionCheck = checkFunctionToString();
    const performanceCheck = checkPerformanceTiming();
    
    const isDevToolsOpen = sizeCheck || consoleCheck || functionCheck || performanceCheck;
    
    if (isDevToolsOpen && !devtoolsOpen) {
      devtoolsOpen = true;
      hasTriggered = true;
      showConsoleWarning();
      callback();
    } else if (!isDevToolsOpen) {
      devtoolsOpen = false;
    }
  };

  // Run initial check immediately on page load
  // Use setTimeout to ensure DOM is ready
  setTimeout(() => {
    runChecks();
    // Also try debugger check separately (can be intrusive)
    if (!hasTriggered) {
      try {
        const debuggerOpen = checkDebuggerTiming();
        if (debuggerOpen) {
          hasTriggered = true;
          showConsoleWarning();
          callback();
        }
      } catch {
        // Ignore errors from debugger check
      }
    }
  }, 0);

  // Run checks periodically
  const interval = setInterval(runChecks, 500);
  
  // Also check on resize (DevTools docking/undocking)
  window.addEventListener('resize', runChecks);

  return () => {
    clearInterval(interval);
    window.removeEventListener('resize', runChecks);
  };
};

export const GlobalProtection = () => {
  useEffect(() => {
    // Show initial console warning
    showConsoleWarning();

    // DevTools detection - redirect when detected
    const cleanupDevToolsDetection = detectDevTools(() => {
      // Redirect to blank page or close
      try {
        window.location.href = 'about:blank';
      } catch {
        // Fallback: try to close or navigate away
        window.location.replace('https://www.google.com');
      }
    });
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
