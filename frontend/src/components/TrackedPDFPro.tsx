import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  HStack,
  IconButton,
  Text,
  Tooltip,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useColorModeValue,
  Portal,
} from "@chakra-ui/react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  X,
  Minimize2,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { useResourceProgress } from "./ResourceProgressTracker";

// IMPORTANT: point PDF.js worker to your bundle’s worker file
// Vite example: new URL(..., import.meta.url)
// CRA/Webpack usually works with this as-is
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type FitMode = "width" | "page";

interface TrackedPDFProProps {
  src: string;
  tierId: string;
  resourceId?: string;
  style?: React.CSSProperties;
  watermark?: React.ReactNode;

  // optional: start in reading mode
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
  const [page, setPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.1);
  const [rotation, setRotation] = useState<number>(0);
  const [fit, setFit] = useState<FitMode>("width");
  const [readingMode, setReadingMode] = useState<boolean>(defaultReadingMode);

  const viewedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pageWrapRef = useRef<HTMLDivElement | null>(null);

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

  // Prevent print/save shortcuts while focused
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && (e.key === "p" || e.key === "s")) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (readingMode && e.key === "Escape") {
      setReadingMode(false);
    }
  };

  // Fit-width / fit-page: compute scale based on container size
  const recomputeFitScale = () => {
    const wrap = pageWrapRef.current;
    const cont = containerRef.current;
    if (!wrap || !cont) return;

    // react-pdf renders a canvas inside; width/height available after render
    const canvas = wrap.querySelector("canvas");
    if (!canvas) return;

    const contW = cont.clientWidth;
    const contH = cont.clientHeight;

    // canvas size already includes current scale; normalize it back
    // We approximate baseline by dividing by current scale.
    const baseW = canvas.width / scale;
    const baseH = canvas.height / scale;

    if (fit === "width") {
      const newScale = Math.max(0.5, Math.min(2.5, contW / baseW));
      setScale(newScale);
    } else {
      const newScale = Math.max(0.5, Math.min(2.5, Math.min(contW / baseW, contH / baseH)));
      setScale(newScale);
    }
  };

  // Recompute when fit mode changes or when reading mode changes (different container)
  useEffect(() => {
    // slight delay so canvas exists
    const t = window.setTimeout(recomputeFitScale, 50);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fit, readingMode, page, numPages]);

  // Recompute on resize
  useEffect(() => {
    const onResize = () => recomputeFitScale();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fit, scale]);

  const clampPage = (p: number) => Math.max(1, Math.min(numPages || 1, p));

  const toolbar = (
    <HStack
      px={3}
      py={2}
      spacing={2}
      bg={panelBg}
      borderBottomWidth="1px"
      borderColor={border}
      position="sticky"
      top={0}
      zIndex={2}
      userSelect="none"
    >
      <HStack spacing={1}>
        <Tooltip label="Previous page">
          <IconButton
            aria-label="Previous page"
            size="sm"
            icon={<ChevronLeft size={18} />}
            onClick={() => setPage((p) => clampPage(p - 1))}
            isDisabled={page <= 1}
          />
        </Tooltip>

        <Tooltip label="Next page">
          <IconButton
            aria-label="Next page"
            size="sm"
            icon={<ChevronRight size={18} />}
            onClick={() => setPage((p) => clampPage(p + 1))}
            isDisabled={numPages > 0 ? page >= numPages : false}
          />
        </Tooltip>

        <Text fontSize="sm" color={textMuted} ml={2}>
          Page <b>{page}</b> / {numPages || "—"}
        </Text>
      </HStack>

      <Box flex="1" />

      <HStack spacing={1}>
        <Tooltip label="Zoom out">
          <IconButton
            aria-label="Zoom out"
            size="sm"
            icon={<ZoomOut size={18} />}
            onClick={() => setScale((s) => Math.max(0.5, Number((s - 0.1).toFixed(2))))}
          />
        </Tooltip>

        <Box w="160px" px={2}>
          <Slider
            aria-label="zoom"
            value={Math.round(scale * 100)}
            min={50}
            max={250}
            onChange={(v) => setScale(Number((v / 100).toFixed(2)))}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>

        <Tooltip label="Zoom in">
          <IconButton
            aria-label="Zoom in"
            size="sm"
            icon={<ZoomIn size={18} />}
            onClick={() => setScale((s) => Math.min(2.5, Number((s + 0.1).toFixed(2))))}
          />
        </Tooltip>

        <Tooltip label="Rotate">
          <IconButton
            aria-label="Rotate"
            size="sm"
            icon={<RotateCw size={18} />}
            onClick={() => setRotation((r) => (r + 90) % 360)}
          />
        </Tooltip>

        <Tooltip label={fit === "width" ? "Fit page" : "Fit width"}>
          <IconButton
            aria-label="Toggle fit"
            size="sm"
            icon={fit === "width" ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            onClick={() => setFit((f) => (f === "width" ? "page" : "width"))}
          />
        </Tooltip>

        <Tooltip label={readingMode ? "Exit reading mode (Esc)" : "Reading mode"}>
          <IconButton
            aria-label="Reading mode"
            size="sm"
            icon={readingMode ? <X size={18} /> : <Maximize2 size={18} />}
            onClick={() => setReadingMode((v) => !v)}
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
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
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
      borderRadius="lg"
      overflow="hidden"
      borderWidth="1px"
      borderColor={border}
      position="relative"
    >
      {toolbar}

      <Box
        position="relative"
        height="100%"
        overflow="auto"
        p={{ base: 2, md: 4 }}
      >
        <Box ref={pageWrapRef} display="flex" justifyContent="center">
          <Document
            file={src}
            onLoadSuccess={(pdf) => {
              setNumPages(pdf.numPages);
              setPage((p) => clampPage(p));
            }}
            loading={
              <Text fontSize="sm" color={textMuted}>
                Loading PDF…
              </Text>
            }
            error={
              <Text fontSize="sm" color="red.400">
                Failed to load PDF.
              </Text>
            }
            // small “Adobe-like” perf tweak: only render current page
            renderMode="canvas"
          >
            <Page
              pageNumber={page}
              scale={scale}
              rotate={rotation}
              loading={
                <Text fontSize="sm" color={textMuted}>
                  Rendering page…
                </Text>
              }
            />
          </Document>
        </Box>

        {watermark}
      </Box>
    </Box>
  );

  // Reading Mode: blur/dim everything behind, keep viewer crisp
  if (!readingMode) return viewer;

  return (
    <Portal>
      <Box
        position="fixed"
        inset={0}
        zIndex={2000}
        // Blur everything behind this overlay
        style={{
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
        bg="rgba(0,0,0,0.55)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={{ base: 2, md: 6 }}
        onMouseDown={(e) => {
          // click outside closes
          if (e.target === e.currentTarget) setReadingMode(false);
        }}
      >
        <Box width="min(1100px, 96vw)" height="min(92vh, 900px)">
          {viewer}
        </Box>
      </Box>
    </Portal>
  );
};

export default TrackedPDFPro;
