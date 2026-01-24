import React, { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { useResourceProgress } from './ResourceProgressTracker';

interface TrackedPDFProps {
  resourceId?: string; // Optional now, we use src for tracking
  src: string;
  tierId: string; // Required for tracking
  style?: React.CSSProperties;
  onContextMenu?: (e: React.MouseEvent) => void;
  watermark?: React.ReactNode;
}

export const TrackedPDF: React.FC<TrackedPDFProps> = ({
  resourceId,
  src,
  tierId,
  style,
  onContextMenu,
  watermark,
}) => {
  const { markCompleted } = useResourceProgress(src, 'pdf', tierId);
  const viewedRef = useRef(false);
  const objectRef = useRef<HTMLObjectElement>(null);

  useEffect(() => {
    console.log('📄 TrackedPDF mounted:', { src, tierId });
    
    // Mark as viewed immediately when component mounts (PDF is visible)
    const immediateTimer = setTimeout(() => {
      if (!viewedRef.current) {
        console.log('✅ Marking PDF as completed (immediate):', src);
        markCompleted(1);
        viewedRef.current = true;
      }
    }, 2000); // 2 seconds after mount

    // Backup timer in case immediate doesn't work
    const backupTimer = setTimeout(() => {
      if (!viewedRef.current) {
        console.log('✅ Marking PDF as completed (backup):', src);
        markCompleted(1);
        viewedRef.current = true;
      }
    }, 5000); // 5 seconds

    return () => {
      clearTimeout(immediateTimer);
      clearTimeout(backupTimer);
    };
  }, [markCompleted, src, tierId]);

  // Prevent all context menu actions
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // Prevent keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent Ctrl+P (print)
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      return false;
    }
    // Prevent Ctrl+S (save)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      return false;
    }
  };

  return (
    <Box 
      position="relative" 
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      style={{
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {/* PDF iframe - scrollable but protected */}
      <Box
        position="relative"
        onContextMenu={handleContextMenu}
        onDragStart={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
      >
        <iframe
          ref={objectRef as any}
          src={`${src}#toolbar=0&navpanes=0&scrollbar=1`}
          title="PDF Viewer"
          style={{
            ...style,
            border: 'none',
            // Allow scrolling but block context menu
          }}
          onContextMenu={handleContextMenu}
        />
      </Box>
      {watermark}
    </Box>
  );
};

export default TrackedPDF;
