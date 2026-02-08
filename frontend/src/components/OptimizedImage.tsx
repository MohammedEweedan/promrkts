// src/components/OptimizedImage.tsx
// Optimized image component with lazy loading, WebP support, and blur placeholder

import React, { useState, useRef, useEffect } from "react";
import { Box, Image, Skeleton } from "@chakra-ui/react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  objectFit?: any; // Chakra UI ObjectFit type
  borderRadius?: string | number;
  priority?: boolean; // If true, loads immediately without lazy loading
  placeholder?: "blur" | "skeleton" | "none";
  blurDataURL?: string; // Base64 blur placeholder
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// Simple blur placeholder generator (10x10 gray gradient)
const DEFAULT_BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMWExYTJlO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMTYyMTNlO3N0b3Atb3BhY2l0eToxIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+";

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = "100%",
  height = "auto",
  objectFit = "cover",
  borderRadius = 0,
  priority = false,
  placeholder = "skeleton",
  blurDataURL,
  onLoad,
  onError,
  className,
  style,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const element = imgRef.current;
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
        rootMargin: "200px", // Start loading 200px before visible
        threshold: 0.01,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate WebP source if the original is jpg/png
  const getWebPSrc = (originalSrc: string): string | null => {
    if (originalSrc.startsWith("data:")) return null;
    const ext = originalSrc.split(".").pop()?.toLowerCase();
    if (ext === "jpg" || ext === "jpeg" || ext === "png") {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, ".webp");
    }
    return null;
  };

  const webpSrc = getWebPSrc(src);

  return (
    <Box
      ref={imgRef}
      position="relative"
      width={width}
      height={height}
      borderRadius={borderRadius}
      overflow="hidden"
      className={className}
      style={style}
    >
      {/* Placeholder */}
      {!isLoaded && placeholder !== "none" && (
        <>
          {placeholder === "skeleton" && (
            <Skeleton
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100%"
              startColor="gray.700"
              endColor="gray.600"
            />
          )}
          {placeholder === "blur" && (
            <Box
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100%"
              backgroundImage={`url(${blurDataURL || DEFAULT_BLUR_PLACEHOLDER})`}
              backgroundSize="cover"
              backgroundPosition="center"
              filter="blur(20px)"
              transform="scale(1.1)"
            />
          )}
        </>
      )}

      {/* Actual Image */}
      {isVisible && !hasError && (
        <picture>
          {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
          <Image
            src={src}
            alt={alt}
            width="100%"
            height="100%"
            objectFit={objectFit}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            opacity={isLoaded ? 1 : 0}
            transition="opacity 0.3s ease-in-out"
          />
        </picture>
      )}

      {/* Error state */}
      {hasError && (
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          bg="gray.800"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="gray.500"
          fontSize="sm"
        >
          Failed to load image
        </Box>
      )}
    </Box>
  );
};

export default OptimizedImage;

// Preload critical images
export const preloadCriticalImages = (urls: string[]): void => {
  if (typeof document === "undefined") return;

  urls.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;
    document.head.appendChild(link);
  });
};
