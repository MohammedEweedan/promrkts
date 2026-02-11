import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  HStack,
  IconButton,
  Text,
  Tooltip,
  useColorModeValue,
  Portal,
} from "@chakra-ui/react";
import {
  ChevronUp,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useResourceProgress } from "./ResourceProgressTracker";

// Use CDN-hosted worker matching the installed pdfjs-dist version
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface TrackedPDFProProps {
  src: string;
  tierId: string;
  resourceId?: string;
  style?: React.CSSProperties;
  watermark?: React.ReactNode;
  defaultReadingMode?: boolean;
}

export const TrackedPDFPro: React.FC<TrackedPDFProProps> = ({
  src,
  tierId,
  resourceId,
  style,
  watermark,
  defaultReadingMode = false,
}) => {
  const { markCompleted } = useResourceProgress(src, "pdf", tierId);

  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(defaultReadingMode);

  const viewedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const bg = useColorModeValue("white", "gray.950");
  const panelBg = useColorModeValue("gray.50", "gray.900");
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const textMuted = useColorModeValue("gray.600", "gray.300");

  // Mark as completed after visible for a short time
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!viewedRef.current) {
        markCompleted(1);
        viewedRef.current = true;
      }
    }, 2000);
    return () => window.clearTimeout(t);
  }, [markCompleted]);

  // Track current page from scroll position
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || numPages === 0) return;
    const scrollTop = el.scrollTop;
    const scrollMid = scrollTop + el.clientHeight / 3;
    let closest = 1;
    let closestDist = Infinity;
    pageRefs.current.forEach((div, pageNum) => {
      const dist = Math.abs(div.offsetTop - scrollMid);
      if (dist < closestDist) {
        closestDist = dist;
        closest = pageNum;
      }
    });
    setCurrentPage(closest);
  }, [numPages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Jump to page
  const jumpToPage = (p: number) => {
    const div = pageRefs.current.get(p);
    if (div && scrollRef.current) {
      scrollRef.current.scrollTo({ top: div.offsetTop - 8, behavior: "smooth" });
    }
  };

  // Fullscreen toggle — use native API with Portal fallback
  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) { setIsFullscreen((v) => !v); return; }
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fallback for iOS / browsers that block fullscreen
      setIsFullscreen((v) => !v);
    }
  }, []);

  // Sync state with native fullscreen changes
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Escape key exits fullscreen
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && (e.key === "p" || e.key === "s")) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isFullscreen && e.key === "Escape" && !document.fullscreenElement) {
      setIsFullscreen(false);
    }
  };

  const clampPage = (p: number) => Math.max(1, Math.min(numPages || 1, p));

  const toolbar = (
    <HStack
      px={3}
      py={1.5}
      spacing={{ base: 1, md: 2 }}
      bg={panelBg}
      borderBottomWidth="1px"
      borderColor={border}
      position="sticky"
      top={0}
      zIndex={2}
      userSelect="none"
      flexWrap="wrap"
    >
      <HStack spacing={1}>
        <Tooltip label="Previous page">
          <IconButton
            aria-label="Previous page"
            size="sm"
            variant="ghost"
            icon={<ChevronUp size={16} />}
            onClick={() => jumpToPage(clampPage(currentPage - 1))}
            isDisabled={currentPage <= 1}
          />
        </Tooltip>
        <Text fontSize="xs" color={textMuted} minW="60px" textAlign="center">
          <b>{currentPage}</b> / {numPages || "—"}
        </Text>
        <Tooltip label="Next page">
          <IconButton
            aria-label="Next page"
            size="sm"
            variant="ghost"
            icon={<ChevronDown size={16} />}
            onClick={() => jumpToPage(clampPage(currentPage + 1))}
            isDisabled={numPages > 0 ? currentPage >= numPages : false}
          />
        </Tooltip>
      </HStack>

      <Box flex="1" />

      <HStack spacing={1}>
        <Tooltip label="Zoom out">
          <IconButton
            aria-label="Zoom out"
            size="sm"
            variant="ghost"
            icon={<ZoomOut size={16} />}
            onClick={() => setScale((s) => Math.max(0.5, Number((s - 0.15).toFixed(2))))}
          />
        </Tooltip>
        <Text fontSize="xs" color={textMuted} minW="36px" textAlign="center">
          {Math.round(scale * 100)}%
        </Text>
        <Tooltip label="Zoom in">
          <IconButton
            aria-label="Zoom in"
            size="sm"
            variant="ghost"
            icon={<ZoomIn size={16} />}
            onClick={() => setScale((s) => Math.min(3, Number((s + 0.15).toFixed(2))))}
          />
        </Tooltip>

        <Tooltip label={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}>
          <IconButton
            aria-label="Toggle fullscreen"
            size="sm"
            variant="ghost"
            icon={isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            onClick={toggleFullscreen}
          />
        </Tooltip>
      </HStack>
    </HStack>
  );

  const viewer = (
    <Box
      ref={containerRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      style={{
        ...style,
        outline: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
      bg={bg}
      borderRadius={isFullscreen ? "0" : "lg"}
      overflow="hidden"
      borderWidth={isFullscreen ? "0" : "1px"}
      borderColor={border}
      position="relative"
      display="flex"
      flexDirection="column"
      height={isFullscreen ? "100%" : undefined}
      maxH={isFullscreen ? "100vh" : "80vh"}
    >
      {toolbar}

      <Box
        ref={scrollRef}
        position="relative"
        flex="1"
        overflow="auto"
        p={{ base: 1, md: 3 }}
        sx={{
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": { bg: "whiteAlpha.300", borderRadius: "3px" },
        }}
      >
        <Document
          file={src.split("#")[0]}
          onLoadSuccess={(pdf) => {
            setNumPages(pdf.numPages);
          }}
          loading={
            <Box display="flex" justifyContent="center" py={10}>
              <Text fontSize="sm" color={textMuted}>Loading PDF…</Text>
            </Box>
          }
          error={
            <Box display="flex" justifyContent="center" py={10}>
              <Text fontSize="sm" color="red.400">Failed to load PDF.</Text>
            </Box>
          }
        >
          {numPages > 0 && Array.from({ length: numPages }, (_, i) => {
            const pageNum = i + 1;
            return (
              <Box
                key={pageNum}
                ref={(el: HTMLDivElement | null) => {
                  if (el) pageRefs.current.set(pageNum, el);
                  else pageRefs.current.delete(pageNum);
                }}
                display="flex"
                justifyContent="center"
                mb={3}
              >
                <Page
                  pageNumber={pageNum}
                  scale={scale}
                  width={undefined}
                  loading={
                    <Box h="400px" display="flex" alignItems="center" justifyContent="center">
                      <Text fontSize="sm" color={textMuted}>Loading page {pageNum}…</Text>
                    </Box>
                  }
                />
              </Box>
            );
          })}
        </Document>

        {watermark}
      </Box>
    </Box>
  );

  // Fullscreen via Portal fallback (when native fullscreen not active)
  if (isFullscreen && !document.fullscreenElement) {
    return (
      <Portal>
        <Box
          position="fixed"
          inset={0}
          zIndex={2000}
          bg={bg}
          display="flex"
          flexDirection="column"
        >
          {viewer}
        </Box>
      </Portal>
    );
  }

  return viewer;
};

export default TrackedPDFPro;
