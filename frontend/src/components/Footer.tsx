import React from "react";
import {
  Box,
  Container,
  SimpleGrid,
  HStack,
  Heading,
  Text,
  Icon,
  Button,
  Link,
  VStack,
  Image,
  useDisclosure,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Twitter, Send, MessageCircle, ChevronUp, ChevronDown, Disc } from "lucide-react";
import { Link as ChakraLink, LinkProps as ChakraLinkProps } from "@chakra-ui/react";
import { Link as RouterLink, LinkProps as RouterLinkProps, useLocation } from "react-router-dom";
import { useThemeMode } from "../themeProvider";

/* ---------- Inner footer with all hooks ---------- */
const FooterInner: React.FC = () => {
  const { t } = useTranslation() as any;
  const { mode } = useThemeMode();
  const footerBtn = mode === "dark" ? "#f9f6f2" : "#222222";
  const isDark = mode === "dark";

  const basePath = process.env.PUBLIC_URL || "";

  // Choose logo/icon per breakpoint + theme
  const logoSrc = useBreakpointValue({
    base: isDark ? `${basePath}/text-logo.png` : `${basePath}/text-logo.png`,
    md: isDark ? `${basePath}/text-logo.png` : `${basePath}/text-logo.png`,
  });

  // Mobile micro-bar (contact) disclosure
  const { isOpen: contactOpen, onToggle: closeContact } = useDisclosure();

  const [footerVisible, setFooterVisible] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setFooterVisible(entries[0]?.isIntersecting ?? false),
      { root: null, threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const accent = "#65a8bf";

  const sections = [
    {
      title: t("footer.learn") || "Learn",
      links: [
        { label: t("footer.resources") || "Resources", to: "/learn/resources" },
        { label: t("footer.faq") || "FAQ", to: "/learn/faq" },
        { label: t("footer.policy") || "Privacy Policy", to: "/legal/policy" },
      ],
    },
    {
      title: t("footer.company") || "Company",
      links: [
        { label: t("footer.about") || "About", to: "/company/about" },
        { label: t("footer.careers") || "Careers", to: "/company/careers" },
        { label: t("footer.terms") || "Terms", to: "/legal/terms" },
      ],
    },
  ];

  // --- Router + Chakra link bridge ---
  type RouterChakraLinkProps = ChakraLinkProps & RouterLinkProps;
  const RouterChakraLink = React.forwardRef<HTMLAnchorElement, RouterChakraLinkProps>(
    (props, ref) => <ChakraLink ref={ref} as={RouterLink} {...props} />
  );
  RouterChakraLink.displayName = "RouterChakraLink";

  const [openIdx, setOpenIdx] = React.useState<number | null>(null);
  const toggleSection = (idx: number) => setOpenIdx((prev) => (prev === idx ? null : idx));

  const SmallCollapse: React.FC<{ in: boolean; children: React.ReactNode }> = ({
    in: open,
    children,
  }) => (
    <Box overflow="hidden" maxHeight={open ? "500px" : "0px"} transition="max-height 0.25s ease">
      {children}
    </Box>
  );

  return (
    <>
      {/* Real footer */}
      <Box ref={sentinelRef}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 3 }}>
            {/* Brand */}
            <VStack align={{ base: "center", md: "flex-start" }}>
              <Image
                src={logoSrc}
                alt="Logo"
                w={{ base: "120px", md: "160px" }}
                h={{ base: "120px", md: "160px" }}
                objectFit="contain"
              />
            </VStack>

            {/* Sections */}
            {sections.map((section, idx) => {
              const isOpen = openIdx === idx;
              return (
                <Box key={idx}>
                  {/* Mobile header toggle */}
                  <Button
                    w="full"
                    variant="ghost"
                    justifyContent="space-between"
                    px={0}
                    color={footerBtn}
                    onClick={() => toggleSection(idx)}
                    display={{ base: "flex", md: "none" }}
                    _hover={{ bg: "transparent", opacity: 0.9 }}
                    _active={{ bg: "transparent" }}
                    aria-expanded={isOpen}
                  >
                    <Heading
                      fontSize={{ base: "md", md: "lg" }}
                      fontWeight={700}
                      letterSpacing="-0.01em"
                    >
                      {section.title}
                    </Heading>
                    <Icon as={isOpen ? ChevronUp : ChevronDown} />
                  </Button>

                  {/* Desktop header */}
                  <Heading size="lg" color={accent} display={{ base: "none", md: "block" }} mb={3}>
                    {section.title}
                  </Heading>

                  {/* Mobile links */}
                  <SmallCollapse in={isOpen}>
                    <Box display={{ base: "block", md: "none" }} pt={2} pb={1} pl={1}>
                      <VStack align="stretch" gap={2.5}>
                        {section.links.map((item, i) => (
                          <RouterChakraLink
                            key={i}
                            to={item.to}
                            color={footerBtn}
                            fontSize={{ base: "sm", md: "sm" }}
                            lineHeight="1.4"
                            _hover={{ color: accent, opacity: 0.9 }}
                            transition="opacity 0.18s ease"
                            sx={{ paddingBlock: "6px" }}
                          >
                            {item.label}
                          </RouterChakraLink>
                        ))}
                      </VStack>
                    </Box>
                  </SmallCollapse>

                  {/* Desktop links */}
                  <VStack align="flex-start" gap={2.5} display={{ base: "none", md: "flex" }}>
                    {section.links.map((item, i) => (
                      <RouterChakraLink
                        key={i}
                        to={item.to}
                        color={footerBtn}
                        _hover={{ opacity: 0.9 }}
                        transition="opacity 0.18s ease"
                        fontSize="md"
                      >
                        {item.label}
                      </RouterChakraLink>
                    ))}
                  </VStack>
                </Box>
              );
            })}
          </SimpleGrid>

          {/* Bottom row */}
          <HStack justify="center" pb={6}>
            <Text fontSize={{ base: "sm", md: "sm" }} textAlign="center" opacity={0.8}>
              © {new Date().getFullYear()} {t("brand")}. {t("footer.rights")}
            </Text>
          </HStack>
        </Container>
      </Box>

      {/* Mobile sticky micro-bar (only while real footer NOT visible) */}
      {!footerVisible && (
        <Box display={{ base: "block", md: "none" }} zIndex={1000}>
          {/* Contact sheet */}
          {contactOpen && (
            <Box
              position="fixed"
              right="12px"
              bottom={`calc(78px + env(safe-area-inset-bottom))`}
              bg="rgba(0,0,0,0.85)"
              backdropFilter="blur(10px)"
              border="1px solid rgba(255,255,255,0.12)"
              rounded="xl"
              px={4}
              pt={3}
              width="min(92vw, 380px)"
              boxShadow="xl"
            >
              <HStack justify="space-between" mb={2}>
                <Text color="#65a8bf" fontWeight={600} fontSize="sm">
                  {t("footer.contact_us") || "Contact us"}
                </Text>
                <Button onClick={closeContact} variant="ghost" color="#65a8bf" size="xs">
                  {t("common.close") || "Close"}
                </Button>
              </HStack>

              <SimpleGrid columns={4} gap={3}>
                <Link
                  as="a"
                  href="https://wa.me/0000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <VStack gap={1}>
                    <Button
                      rounded="full"
                      w="44px"
                      h="44px"
                      p={0}
                      bg="#25D366"
                      color="#65a8bf"
                      _hover={{ opacity: 0.95 }}
                    >
                      <Icon as={MessageCircle} boxSize={5} />
                    </Button>
                    <Text fontSize="xs" color="#65a8bf">
                      WhatsApp
                    </Text>
                  </VStack>
                </Link>

                <Link
                  as="a"
                  href="https://t.me/your_channel"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <VStack gap={1}>
                    <Button
                      rounded="full"
                      w="44px"
                      h="44px"
                      p={0}
                      bg="#0088CC"
                      color="#65a8bf"
                      _hover={{ opacity: 0.95 }}
                    >
                      <Icon as={Send} boxSize={5} />
                    </Button>
                    <Text fontSize="xs" color="#65a8bf">
                      Telegram
                    </Text>
                  </VStack>
                </Link>

                <Link
                  as="a"
                  href="https://twitter.com/your_handle"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <VStack gap={1}>
                    <Button
                      rounded="full"
                      w="44px"
                      h="44px"
                      p={0}
                      bg="#1a1a1a"
                      color="#65a8bf"
                      _hover={{ opacity: 0.95 }}
                    >
                      <Icon as={Twitter} boxSize={5} />
                    </Button>
                    <Text fontSize="xs" color="#65a8bf">
                      Twitter
                    </Text>
                  </VStack>
                </Link>

                <Link
                  as="a"
                  href="https://discord.gg/your_invite"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <VStack gap={1}>
                    <Button
                      rounded="full"
                      w="44px"
                      h="44px"
                      p={0}
                      bg="#5865F2"
                      color="#65a8bf"
                      _hover={{ opacity: 0.95 }}
                    >
                      <Icon as={Disc} boxSize={5} />
                    </Button>
                    <Text fontSize="xs" color="#65a8bf">
                      Discord
                    </Text>
                  </VStack>
                </Link>
              </SimpleGrid>
            </Box>
          )}
        </Box>
      )}
    </>
  );
};

/* ---------- Wrapper that decides visibility (no conditional hooks here) ---------- */
const Footer: React.FC = () => {
  const { pathname } = useLocation();
  const showFooter = pathname !== "/company/about";
  return showFooter ? <FooterInner /> : null;
};

export default Footer;
