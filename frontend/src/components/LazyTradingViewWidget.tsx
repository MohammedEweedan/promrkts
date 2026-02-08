// src/components/LazyTradingViewWidget.tsx
// Lazy-loaded TradingView widget wrapper for performance optimization
// Only loads the heavy TradingView scripts when the widget is visible in viewport

import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { Box, Skeleton, Text, VStack } from "@chakra-ui/react";

// Lazy load the actual TradingView widget
const TradingViewWidget = lazy(() => import("./TradingViewWidget"));

interface LazyTradingViewWidgetProps {
  widget?: string;
  variant?: string;
  symbol?: string;
  symbols?: string[];
  theme?: "dark" | "light";
  locale?: string;
  className?: string;
  style?: React.CSSProperties;
  options?: Record<string, any>;
  attrs?: Record<string, string | number | boolean | null | undefined>;
  scriptSrcOverride?: string;
  moduleSrcOverride?: string;
  onError?: (err: Error) => void;
  // Lazy loading options
  rootMargin?: string; // IntersectionObserver rootMargin
  threshold?: number; // IntersectionObserver threshold
  placeholder?: React.ReactNode; // Custom placeholder
  minHeight?: string | number; // Minimum height for placeholder
}

// Skeleton placeholder for loading state
const WidgetSkeleton: React.FC<{ minHeight?: string | number }> = ({ minHeight = "300px" }) => (
  <Box
    w="100%"
    h="100%"
    minH={minHeight}
    bg="rgba(15, 23, 42, 0.6)"
    borderRadius="lg"
    overflow="hidden"
    position="relative"
  >
    <VStack spacing={4} p={6} align="stretch" h="100%">
      <Skeleton height="20px" width="60%" startColor="gray.700" endColor="gray.600" />
      <Skeleton height="40px" width="100%" startColor="gray.700" endColor="gray.600" />
      <Skeleton height="150px" width="100%" startColor="gray.700" endColor="gray.600" flex={1} />
      <Skeleton height="20px" width="40%" startColor="gray.700" endColor="gray.600" />
    </VStack>
    <Box
      position="absolute"
      bottom={4}
      left="50%"
      transform="translateX(-50%)"
    >
      <Text fontSize="xs" color="gray.500" opacity={0.7}>
        Loading market data...
      </Text>
    </Box>
  </Box>
);

// Error fallback
const WidgetError: React.FC<{ error: Error }> = ({ error }) => (
  <Box
    w="100%"
    h="100%"
    minH="200px"
    bg="rgba(15, 23, 42, 0.6)"
    borderRadius="lg"
    display="flex"
    alignItems="center"
    justifyContent="center"
    p={4}
  >
    <Text color="red.400" fontSize="sm" textAlign="center">
      Failed to load widget. Please refresh the page.
    </Text>
  </Box>
);

const LazyTradingViewWidget: React.FC<LazyTradingViewWidgetProps> = ({
  rootMargin = "200px", // Start loading 200px before visible
  threshold = 0.1,
  placeholder,
  minHeight = "300px",
  ...widgetProps
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check if IntersectionObserver is supported
    if (!("IntersectionObserver" in window)) {
      // Fallback: load immediately if IntersectionObserver not supported
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // Stop observing once visible
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  const handleError = (err: Error) => {
    setHasError(err);
    widgetProps.onError?.(err);
  };

  if (hasError) {
    return <WidgetError error={hasError} />;
  }

  return (
    <Box ref={containerRef} w="100%" h="100%" minH={minHeight}>
      {isVisible ? (
        <Suspense fallback={placeholder || <WidgetSkeleton minHeight={minHeight} />}>
          <TradingViewWidget {...(widgetProps as any)} onError={handleError} />
        </Suspense>
      ) : (
        placeholder || <WidgetSkeleton minHeight={minHeight} />
      )}
    </Box>
  );
};

export default LazyTradingViewWidget;

// Export a hook for manual lazy loading control
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement>, boolean] => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return [ref, isVisible];
};
