import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  HStack,
  IconButton,
  Text,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
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

/**
 * Simple, mobile-friendly single-page PDF viewer.
 * No fullscreen / Portal — the parent controls layout (modal, inline, etc.).
 * Pages are navigated one at a time to avoid mobile scroll glitches.
 */
export const TrackedPDFPro: React.FC<TrackedPDFProProps> = ({
  src,
  tierId,
  resourceId,
  style,
  watermark,
}) => {
  const { markCompleted } = useResourceProgress(src, "pdf", tierId);

  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loadError, setLoadError] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const viewedRef = useRef(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [containerW, setContainerW] = useState<number>(0);

  const bg = useColorModeValue("white", "gray.950");
  const panelBg = useColorModeValue("gray.50", "gray.900");
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const mutedColor = useColorModeValue("gray.500", "gray.400");

  // Measure container width for responsive page sizing
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerW(entry.contentRect.width);
      }
    });
    ro.observe(el);
    setContainerW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Mark as completed after 2s
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!viewedRef.current) {
        markCompleted(1);
        viewedRef.current = true;
      }
    }, 2000);
    return () => window.clearTimeout(t);
  }, [markCompleted]);

  const clamp = (p: number) => Math.max(1, Math.min(numPages || 1, p));
  const goPrev = () => { setPage((p) => clamp(p - 1)); setPageLoading(true); };
  const goNext = () => { setPage((p) => clamp(p + 1)); setPageLoading(true); };

  // Keyboard nav
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); goPrev(); }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); goNext(); }
    if (e.ctrlKey && (e.key === "p" || e.key === "s")) { e.preventDefault(); }
  };

  // Swipe support for mobile
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only trigger if horizontal swipe is dominant and > 50px
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goNext();
      else goPrev();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numPages]);

  // Page width: fill container minus padding, capped for readability
  const pageWidth = containerW > 0 ? Math.min(containerW - 16, 900) : undefined;

  const fileSrc = src.split("#")[0];

  return (
    <Box
      ref={wrapRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onContextMenu={(e) => e.preventDefault()}
      style={{ ...style, outline: "none" }}
      bg={bg}
      borderRadius="lg"
      overflow="hidden"
      borderWidth="1px"
      borderColor={border}
      display="flex"
      flexDirection="column"
      height="100%"
      position="relative"
    >
      {/* Toolbar */}
      <HStack
        px={{ base: 2, md: 3 }}
        py={1.5}
        spacing={{ base: 1, md: 2 }}
        bg={panelBg}
        borderBottomWidth="1px"
        borderColor={border}
        flexShrink={0}
        userSelect="none"
        justify="space-between"
      >
        {/* Page nav */}
        <HStack spacing={1}>
          <IconButton
            aria-label="Previous page"
            size="sm"
            variant="ghost"
            icon={<ChevronLeft size={18} />}
            onClick={goPrev}
            isDisabled={page <= 1}
          />
          <Text fontSize="xs" fontWeight="600" color={textColor} minW="50px" textAlign="center">
            {page} / {numPages || "…"}
          </Text>
          <IconButton
            aria-label="Next page"
            size="sm"
            variant="ghost"
            icon={<ChevronRight size={18} />}
            onClick={goNext}
            isDisabled={numPages > 0 ? page >= numPages : true}
          />
        </HStack>

        {/* Zoom */}
        <HStack spacing={1}>
          <IconButton
            aria-label="Zoom out"
            size="xs"
            variant="ghost"
            icon={<ZoomOut size={15} />}
            onClick={() => setScale((s) => Math.max(0.5, +(s - 0.15).toFixed(2)))}
          />
          <Text fontSize="2xs" color={mutedColor} minW="30px" textAlign="center">
            {Math.round(scale * 100)}%
          </Text>
          <IconButton
            aria-label="Zoom in"
            size="xs"
            variant="ghost"
            icon={<ZoomIn size={15} />}
            onClick={() => setScale((s) => Math.min(3, +(s + 0.15).toFixed(2)))}
          />
          <IconButton
            aria-label="Reset zoom"
            size="xs"
            variant="ghost"
            icon={<RotateCw size={14} />}
            onClick={() => setScale(1)}
          />
        </HStack>
      </HStack>

      {/* Page area */}
      <Box
        flex="1"
        overflow="auto"
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
        p={{ base: 1, md: 2 }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        sx={{
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { width: "5px" },
          "&::-webkit-scrollbar-thumb": { bg: "whiteAlpha.300", borderRadius: "3px" },
        }}
      >
        {loadError ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="sm" color="red.400" mb={2}>Failed to load PDF.</Text>
            <Text fontSize="xs" color={mutedColor}>Check that the file exists and try refreshing.</Text>
          </Box>
        ) : (
          <Document
            file={fileSrc}
            onLoadSuccess={(pdf) => {
              setNumPages(pdf.numPages);
              setLoadError(false);
              setPageLoading(false);
            }}
            onLoadError={() => setLoadError(true)}
            loading={
              <Box display="flex" flexDirection="column" alignItems="center" py={10} gap={3}>
                <Spinner size="lg" color="#65a8bf" />
                <Text fontSize="sm" color={mutedColor}>Loading PDF…</Text>
              </Box>
            }
          >
            <Box position="relative" display="flex" justifyContent="center">
              {pageLoading && numPages > 0 && (
                <Box position="absolute" inset={0} display="flex" alignItems="center" justifyContent="center" zIndex={1}>
                  <Spinner size="md" color="#65a8bf" />
                </Box>
              )}
              <Page
                pageNumber={page}
                scale={scale}
                width={pageWidth}
                onRenderSuccess={() => setPageLoading(false)}
                loading={
                  <Box
                    h={{ base: "60vh", md: "70vh" }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Spinner size="md" color="#65a8bf" />
                  </Box>
                }
              />
            </Box>
          </Document>
        )}

        {watermark}
      </Box>

      {/* Mobile swipe hint (only on first load) */}
      {numPages > 1 && page === 1 && (
        <Text
          fontSize="2xs"
          color={mutedColor}
          textAlign="center"
          py={1}
          display={{ base: "block", md: "none" }}
        >
          Swipe left/right to navigate pages
        </Text>
      )}
    </Box>
  );
};

export default TrackedPDFPro;
