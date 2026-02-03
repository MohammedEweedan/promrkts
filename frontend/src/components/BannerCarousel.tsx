import React from "react";
import api from "../api/client";
import { Box, HStack, IconButton, Image, Text, VStack } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const MotionBox = motion(Box);

export type BannerItem = {
  id?: string | number;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  href?: string;
};

interface BannerCarouselProps {
  banners?: BannerItem[];
  autoPlayMs?: number;
}
/**
 * A lightweight, dependency-free banner carousel using framer-motion.
 * If no banners prop is passed, it will try to fetch from /content/banners.
 */
const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners: bannersProp, autoPlayMs = 5000 }) => {
  const [banners, setBanners] = React.useState<BannerItem[]>(bannersProp || []);
  const [index, setIndex] = React.useState(0);
  const timer = React.useRef<number | null>(null);
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  // Resolve image URLs similar to Home.tsx
  const apiBase = (process.env.REACT_APP_API_BASE_URL as string) || `${process.env.REACT_APP_BACKEND_URL || 'https://api.promrkts.com/api'}/api`;
  const apiOrigin = React.useMemo(() => apiBase.replace(/\/?api\/?$/, ''), [apiBase]);
  const resolveUrl = React.useCallback((u?: string) => {
    if (!u) return '';
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    if (u.startsWith('/api/')) return `${apiOrigin}${u}`;
    // Support files served from /api/uploads when value is '/uploads/..' or a bare filename
    if (u.startsWith('/uploads/')) return `${apiOrigin}${u.replace(/^\/uploads\//, '/api/uploads/')}`;
    // If it's a bare filename or relative path (not starting with '/'), serve from app public origin
    if (!u.startsWith('/')) return `${window.location.origin}/${u.replace(/^\.\//, '')}`;
    return u;
  }, [apiOrigin]);

  React.useEffect(() => {
    if (bannersProp && bannersProp.length) return; // external data provided
    let mounted = true;
    api.get('/content/banners')
      .then((r) => {
        const data = (r?.data?.data || r?.data?.results || []) as any[];
        if (mounted && Array.isArray(data)) {
          setBanners(
            data.map((b, i) => ({
              id: b.id ?? i,
              imageUrl: b.imageUrl || b.image_url || b.url || b.image,
              title: b.title,
              subtitle: b.subtitle,
              badge: b.badge,
              href: b.href,
            }))
            .filter((b) => !!b.imageUrl)
          );
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.debug('[BannerCarousel] Loaded banners:', data.length);
          }
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [bannersProp]);

  React.useEffect(() => {
    if (!banners.length) return;
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => setIndex((i) => (i + 1) % banners.length), autoPlayMs) as unknown as number;
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [banners, autoPlayMs]);

  const go = (dir: 1 | -1) => setIndex((i) => {
    const next = i + dir;
    if (!banners.length) return 0;
    return (next + banners.length) % banners.length;
  });

  if (!banners.length) return null;

  return (
    <Box position="relative" w="full" maxW="6xl" mx="auto" overflow="hidden" borderRadius="lg" mb={4}>
      <AnimatePresence initial={false} mode="wait">
        <MotionBox
          key={banners[index]?.id ?? index}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          position="relative"
          h={{ base: "200px", md: "420px" }}
        >
          <a href={banners[index]?.href || undefined} target={banners[index]?.href ? "_blank" : undefined} rel="noreferrer">
            <Image
              src={resolveUrl(banners[index].imageUrl)}
              alt={banners[index].title || `banner-${index}`}
              w="100%"
              h="100%"
              objectFit="cover"
              borderRadius="lg"
              onError={() => {
                if (process.env.NODE_ENV === 'development') {
                  // eslint-disable-next-line no-console
                  console.warn('[BannerCarousel] Failed to load image:', banners[index].imageUrl);
                }
              }}
            />
            {(banners[index].title || banners[index].subtitle || banners[index]) && (
              <VStack
                position="absolute"
                inset={0}
                align="start"
                justify="flex-end"
                bgGradient="linear(to-t, rgba(0,0,0,0.55), rgba(0,0,0,0.0))"
                p={{ base: 3, md: 4 }}
                borderRadius="lg"
              >
                {banners[index].title && (
                  <Text fontWeight={700} bg="white" color="black" borderRadius="lg" p={2} fontSize={{ base: "lg", md: "2xl" }}>
                    {banners[index].title}
                  </Text>
                )}
                {banners[index].subtitle && (
                  <Text fontWeight={500} bg="white" color="black" borderRadius="lg" p={2} fontSize={{ base: "sm", md: "md" }}>
                    {banners[index].subtitle}
                  </Text>
                )}
              </VStack>
            )}
          </a>
        </MotionBox>
      </AnimatePresence>

      <HStack position="absolute" top="50%" transform="translateY(-50%)" justify="space-between" w="full" px={2}>
        <IconButton aria-label="Previous" variant="solid" bg="#65a8bf" color="#65a8bf" onClick={() => go(-1)}>
          {isRTL ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
        <IconButton aria-label="Next" variant="solid" bg="#65a8bf" color="#65a8bf" onClick={() => go(1)}>
          {isRTL ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </HStack>

      <HStack position="absolute" bottom={2} left="50%" transform="translateX(-50%)" gap={1}>
        {banners.map((b, i) => (
          <Box
            key={b.id ?? i}
            w={i === index ? 8 : 6}
            h={1}
            borderRadius="full"
            bg={i === index ? "#65a8bf" : "whiteAlpha.700"}
            transition="all 200ms"
          />
        ))}
      </HStack>
    </Box>
  );
};

export default BannerCarousel;
