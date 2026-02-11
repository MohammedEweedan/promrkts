import React from "react";
import {
  Box,
  HStack,
  VStack,
  Button,
  Image,
  Tooltip,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LogOut,
  LogIn,
  UserPlus,
  MessageSquare,
  BookOpen,
  LayoutDashboard,
  MapIcon,
  ShoppingBag,
  Languages,
  Sun,
  Moon,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";
import { useThemeMode } from "../themeProvider";
import { useAuth } from "../auth/AuthContext";
import Switch from "./Switch";
import LanguageModal from "./LangModal";

const Header: React.FC = () => {
  const { t, i18n } = useTranslation() as any;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { mode, toggle } = useThemeMode();
  const { user, logout } = useAuth();

  // ✅ treat >= lg (~992px) as desktop so 14" screens
  // get the desktop dock, not the mobile header
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  const MotionBox = motion(Box);
  const isAR = (i18n.language || "en").startsWith("ar");
  const BRAND = "rgb(104, 165, 191)";

  // make dock/button sizes gently scale with breakpoints
  const dockButtonSize = 10;     // perfect size everywhere
  const dockRadius = 12;
  const dockLogoSize = "1.75rem";
  const dockSpacing = 2.5;

  const [dockExpanded, setDockExpanded] = React.useState(true);
  const dockHoverTimeoutRef =
    React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDockMouseEnter = () => {
    if (dockHoverTimeoutRef.current) {
      clearTimeout(dockHoverTimeoutRef.current);
      dockHoverTimeoutRef.current = null;
    }
    setDockExpanded(true);
  };

  const handleDockMouseLeave = () => {
    if (dockHoverTimeoutRef.current) {
      clearTimeout(dockHoverTimeoutRef.current);
    }
    dockHoverTimeoutRef.current = setTimeout(() => {
      setDockExpanded(false);
    }, 280);
  };

  const [langModalOpen, setLangModalOpen] = React.useState(false);
  const [currentLang, setCurrentLang] = React.useState(
    (i18n.language || "en").split("-")[0].toUpperCase()
  );

  const glassBorderColor =
    mode === "dark"
      ? "rgba(255,255,255,0.18)"
      : "rgba(15,23,42,0.18)";

  const glassShadow =
    mode === "dark"
      ? "0 18px 45px rgba(0,0,0,0.55)"
      : "0 18px 45px rgba(15,23,42,0.18)";

  const tickerHeight = "14px";     // not dynamic

  const { pathname } = useLocation();
  const navigate = useNavigate();

  type DockItemData = {
    icon: React.ReactNode;
    label: React.ReactNode;
    onClick: () => void;
    isDanger?: boolean;
  };

  const dockItems: DockItemData[] = React.useMemo(() => {
    const base: DockItemData[] = [
      {
        icon: <MessageSquare strokeWidth={1.5} />,
        label: t("nav.contact") || (isAR ? "اتصل بنا" : "Contact"),
        onClick: () => navigate("/contact"),
      },
      {
        icon: <ShoppingBag strokeWidth={1.5} />,
        label: t("common.products") || (isAR ? "المنتجات" : "Products"),
        onClick: () => navigate("/products"),
      },
    ];
    if (user) {
      base.push({
        icon: <BookOpen strokeWidth={1.5} />,
        label: t("nav.enrolled") || (isAR ? "كورساتي" : "Enrollments"),
        onClick: () => navigate("/enrolled"),
      });
      base.push({
        icon: <LayoutDashboard strokeWidth={1.5} />,
        label: t("header.dashboard") || "Dashboard",
        onClick: () => navigate("/dashboard"),
      });
      base.push({
        icon: <MapIcon strokeWidth={1.5} />,
        label: t("header.path") || "My Path",
        onClick: () => navigate("/path"),
      });
      base.push({
        icon: <LogOut strokeWidth={1.5} />,
        label: t("aria.logout") || "Logout",
        onClick: async () => {
          await logout();
          navigate("/");
        },
        isDanger: true,
      });
    } else {
      base.push({
        icon: <LogIn strokeWidth={1.5} />,
        label: t("auth.login") || "Login",
        onClick: () => navigate("/login"),
      });
      base.push({
        icon: <UserPlus strokeWidth={1.5} />,
        label: t("auth.register") || "Register",
        onClick: () => navigate("/register"),
      });
    }
    return base;
  }, [user, t, navigate, isAR, logout]);

  return (
    <>
      {user && pathname === "/" && isDesktop && (
        <Box pos="fixed" top={0} left={0} right={0} zIndex={1} h={tickerHeight}>
          {/* <TickerTapeSafe
            colorTheme={tickerTheme}
            symbols={tickerSymbols}
            displayMode="compact"
            showSymbolLogo={false}
            isTransparent={false}
            speed="fast"
            fontSize={tickerFontSize}
            fontWeight="normal"
          /> */}
        </Box>
      )}

      {/* Mobile: logo + menu */}
      {!isDesktop && (
        <>
          <Box
            pos="fixed"
            top={user && pathname === "/" ? "8px" : "12px"}
            left={isAR ? undefined : "12px"}
            right={isAR ? "12px" : undefined}
            zIndex={9105}
          >
            <Tooltip label="Go Home" placement="right" hasArrow openDelay={400}>
              <Box
                as={RouterLink}
                to="/"
                opacity={0.95}
                _hover={{ opacity: 1, transform: "translateY(-1px)" }}
                transition="all 0.18s ease-out"
              >
                <Logo h={8} />
              </Box>
            </Tooltip>
          </Box>

          <Button
            onClick={() => setMenuOpen((v) => !v)}
            pos="fixed"
            top={user && pathname === "/" ? "5px" : "8px"}
            right={isAR ? undefined : "8px"}
            left={isAR ? "8px" : undefined}
            zIndex={91200}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            borderRadius="full"
            w="28px"
            h="28px"
            minW="28px"
            p={0}
            border="1px solid"
            borderColor={glassBorderColor}
            boxShadow={glassShadow}
            backdropFilter="blur(26px) saturate(1.4)"
            _hover={{ transform: "scale(1.04)" }}
            _active={{ transform: "scale(0.98)" }}
            alignItems="center"
            bg={mode === "dark" ? "rgba(30, 30, 30, 0.8)" : "rgba(255, 255, 255, 0.8)"}
            color={mode === "dark" ? "white" : "black"}
            justifyContent="center"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </>
      )}

      {/* Desktop: floating dock */}
      {isDesktop && (
        <>
          {!dockExpanded && (
            <Box
              pos="fixed"
              top={user && pathname === "/" ? "6px" : "6px"}
              left="14px"
              zIndex={1200}
            >
              <Box
                as={RouterLink}
                to="/"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Image
                  src={mode === "dark" ? "/text-logo.png" : "/text-logo.png"}
                  alt="Logo"
                  w="120px"
                />
              </Box>
            </Box>
          )}

          <Box
            pos="fixed"
            left={0}
            top="50%"
            transform="translateY(-50%)"
            zIndex={999}
            onMouseEnter={handleDockMouseEnter}
            onMouseLeave={handleDockMouseLeave}
            w="64px"
            pointerEvents="auto"
          >
            <AnimatePresence initial={false}>
              {dockExpanded ? (
                <MotionBox
                  key="full-dock"
                  initial={{ x: -80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -80, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  ml={{ lg: "4px", xl: "10px" }}
                >
                  <Box
                    borderRadius="18px"
                    p={1.5}
                    border="1px solid"
                    borderColor={
                      mode === "dark" ? "rgba(255,255,255,0.16)" : "rgba(148,163,184,0.40)"
                    }
                    sx={{
                      backdropFilter: "blur(24px) saturate(180%)",
                      WebkitBackdropFilter: "blur(24px) saturate(180%)",
                      boxShadow:
                        mode === "dark"
                          ? "0 18px 40px rgba(15,23,42,0.85)"
                          : "0 18px 40px rgba(148,163,184,0.65)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <VStack spacing={dockSpacing}>
                      <Tooltip label="Go Home" placement="right" hasArrow openDelay={400}>
                        <Box
                          as={RouterLink}
                          to="/"
                          w={dockButtonSize}
                          h={dockButtonSize}
                          borderRadius={dockRadius}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          cursor="pointer"
                          transition="all 0.2s ease"
                          _hover={{ transform: "scale(1.05)" }}
                        >
                          <Logo h={dockLogoSize} />
                        </Box>
                      </Tooltip>

                      <Box
                        w="40px"
                        h="1px"
                        bg={mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                      />

                      {dockItems.map((item, index) => {
                        const isDanger = item.isDanger;
                        const baseBg =
                          mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
                        const dangerBg =
                          mode === "dark" ? "rgba(239,68,68,0.18)" : "rgba(220,38,38,0.12)";
                        const baseColor = mode === "dark" ? "#ffffff" : "#222222";
                        const dangerColor = mode === "dark" ? "rgb(248,113,113)" : "rgb(220,38,38)";

                        return (
                          <Box
                            key={index}
                            w={dockButtonSize}
                            h={dockButtonSize}
                            borderRadius={dockRadius}
                            bg={isDanger ? dangerBg : baseBg}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            cursor="pointer"
                            onClick={item.onClick}
                            transition="all 0.2s ease"
                            position="relative"
                            _hover={{
                              bg: isDanger
                                ? mode === "dark"
                                  ? "rgba(239,68,68,0.28)"
                                  : "rgba(220,38,38,0.2)"
                                : mode === "dark"
                                  ? "rgba(104, 165, 191, 0.28)"
                                  : "rgba(104, 165, 191, 0.18)",
                              transform: "scale(1.05)",
                            }}
                            color={isDanger ? dangerColor : baseColor}
                            className="dock-item-vertical"
                          >
                            {item.icon}
                            <Box
                              pos="absolute"
                              left="calc(100% + 12px)"
                              whiteSpace="nowrap"
                              bg={
                                mode === "dark" ? "rgba(40,40,42,0.95)" : "rgba(255,255,255,0.95)"
                              }
                              color={mode === "dark" ? "#ffffff" : "#222222"}
                              px={3}
                              py={2}
                              borderRadius="8px"
                              fontSize="13px"
                              fontWeight="500"
                              opacity={0}
                              pointerEvents="none"
                              transition="opacity 0.2s ease"
                              border="1px solid"
                              borderColor={
                                mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                              }
                              boxShadow="0 4px 12px rgba(0,0,0,0.15)"
                              className="dock-tooltip"
                            >
                              {item.label}
                            </Box>
                          </Box>
                        );
                      })}

                      <Box w="40px" h="1px" />

                      <Box position="relative">
                        <Box onClick={() => setLangModalOpen(true)}>
                          <Languages />
                        </Box>

                        <LanguageModal
                          isOpen={langModalOpen}
                          onClose={() => setLangModalOpen(false)}
                          currentLang={currentLang}
                          onSelect={(lang) => {
                            i18n.changeLanguage(lang.toLowerCase());
                            setCurrentLang(lang);
                          }}
                        />
                      </Box>

                      <Box w="100%" pt={1} pb={2} display="flex" justifyContent="center">
                        <Switch />
                      </Box>
                    </VStack>
                  </Box>
                </MotionBox>
              ) : (
                <MotionBox
                  key="collapsed-dock"
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 0.9 }}
                  exit={{ x: -40, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  ml={{ lg: "4px", xl: "8px" }}
                >
                  <Box
                    w={dockButtonSize}
                    h={dockButtonSize}
                    borderRadius={dockRadius}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    border="1px solid"
                    borderColor={
                      mode === "dark" ? "rgba(255,255,255,0.25)" : "rgba(148,163,184,0.55)"
                    }
                    sx={{
                      backdropFilter: "blur(18px) saturate(160%)",
                      WebkitBackdropFilter: "blur(18px) saturate(160%)",
                      background:
                        mode === "dark" ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.85)",
                      boxShadow:
                        mode === "dark"
                          ? "0 14px 32px rgba(15,23,42,0.85)"
                          : "0 12px 30px rgba(148,163,184,0.65)",
                    }}
                    _hover={{
                      transform: "scale(1.05) translateX(2px)",
                    }}
                  >
                    <ArrowRight size={20} />
                  </Box>
                </MotionBox>
              )}
            </AnimatePresence>
          </Box>
        </>
      )}

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && !isDesktop && (
          <MotionBox
            pos="fixed"
            top={user && pathname === "/" ? "0.25rem" : 0}
            left={0}
            right={0}
            bottom={0}
            bg={mode === "dark" ? "rgba(10,10,12,0.98)" : "rgba(255,255,255,0.99)"}
            zIndex={998}
            overflowY="auto"
            backdropFilter="blur(26px) saturate(1.4)"
            boxShadow={glassShadow}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3 }}
            willChange="backdrop-filter, transform, opacity"
          >
            <VStack
              spacing={0}
              align="center"
              mt={10}
              color={mode === "dark" ? "white" : "#111111"}
            >
              {user ? (
                <>
                  <Box px={6} py={3} fontSize="lg" fontWeight="600" mt={30} color={BRAND}>
                    {t("header.hi", { name: user?.name || user?.email })}
                  </Box>
                  <Button
                    as={RouterLink}
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    variant="ghost"
                    justifyContent="flex-start"
                    px={6}
                    py={6}
                    fontSize="lg"
                    color={mode === "dark" ? "white" : "#111111"}
                    leftIcon={<LayoutDashboard />}
                  >
                    {t("header.dashboard")}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    as={RouterLink}
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    variant="ghost"
                    justifyContent="flex-start"
                    px={6}
                    py={6}
                    mt={40}
                    fontSize="lg"
                    color={mode === "dark" ? "white" : "#111111"}
                    leftIcon={<LogIn />}
                  >
                    {t("auth.login")}
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    variant="ghost"
                    justifyContent="flex-start"
                    px={6}
                    py={6}
                    fontSize="lg"
                    color={mode === "dark" ? "white" : "#111111"}
                    leftIcon={<UserPlus />}
                  >
                    {t("auth.register")}
                  </Button>
                </>
              )}

              <Button
                as={RouterLink}
                to="/contact"
                onClick={() => setMenuOpen(false)}
                variant="ghost"
                justifyContent="flex-start"
                px={6}
                py={6}
                fontSize="lg"
                color={mode === "dark" ? "white" : "#111111"}
                leftIcon={<MessageSquare />}
              >
                {t("footer.contact")}
              </Button>

              <Button
                as={RouterLink}
                to="/products"
                onClick={() => setMenuOpen(false)}
                variant="ghost"
                justifyContent="flex-start"
                px={6}
                py={6}
                fontSize="lg"
                color={mode === "dark" ? "white" : "#111111"}
                leftIcon={<ShoppingBag />}
              >
                {t("common.products")}
              </Button>

              {user && (
                <>
                  <Button
                    as={RouterLink}
                    to="/enrolled"
                    onClick={() => setMenuOpen(false)}
                    variant="ghost"
                    justifyContent="flex-start"
                    px={6}
                    py={6}
                    fontSize="lg"
                    color={mode === "dark" ? "white" : "#111111"}
                    leftIcon={<BookOpen />}
                  >
                    {t("nav.enrolled")}
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/path"
                    onClick={() => setMenuOpen(false)}
                    variant="ghost"
                    justifyContent="flex-start"
                    px={6}
                    py={6}
                    fontSize="lg"
                    color={mode === "dark" ? "white" : "#111111"}
                    leftIcon={<MapIcon />}
                  >
                    {t("header.path") || "My Path"}
                  </Button>
                  <Button
                    onClick={async () => {
                      await logout();
                      setMenuOpen(false);
                    }}
                    variant="ghost"
                    justifyContent="flex-start"
                    px={6}
                    py={6}
                    fontSize="lg"
                    leftIcon={<LogOut />}
                    color={mode === "dark" ? "red.300" : "red.500"}
                  >
                    {t("aria.logout")}
                  </Button>
                </>
              )}

              {/* Theme Toggle in Mobile */}
              <Box px={6} py={4} mt={10}>
                <HStack spacing={3} justify="center">
                  <Box
                    w="60px"
                    h="60px"
                    borderRadius="16px"
                    border="2px solid"
                    borderColor={mode === "light" ? "#65a8bf" : "#65a8bf"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    onClick={() => {
                      if (mode === "dark") toggle();
                    }}
                  >
                    <Sun strokeWidth={1.5} size={26} />
                  </Box>

                  <Box
                    w="60px"
                    h="60px"
                    borderRadius="16px"
                    border="2px solid"
                    borderColor={mode === "light" ? "#65a8bf" : "#65a8bf"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    onClick={() => {
                      if (mode === "light") toggle();
                    }}
                  >
                    <Moon strokeWidth={1.5} size={26} />
                  </Box>
                </HStack>
              </Box>

              {/* Language Switcher in Mobile */}
              <Box px={6} py={4} mt={10} w="100%">
                <VStack spacing={3} align="center">
                  <HStack spacing={2} align="center">
                    <Languages size={20} color="#65a8bf" />
                  </HStack>
                  <Box
                    as="select"
                    value={currentLang.toLowerCase()}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      i18n.changeLanguage(e.target.value);
                      setCurrentLang(e.target.value.toUpperCase());
                      setMenuOpen(false);
                    }}
                    px={4}
                    py={3}
                    borderRadius="12px"
                    border="2px solid"
                    borderColor="#65a8bf"
                    bg={mode === "dark" ? "rgba(30,30,30,0.8)" : "white"}
                    color={mode === "dark" ? "white" : "#111"}
                    fontSize="md"
                    fontWeight="500"
                    minW="200px"
                    cursor="pointer"
                    _focus={{ outline: "none", borderColor: "#65a8bf" }}
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="ar">🇸🇦 العربية</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="ru">🇷🇺 Русский</option>
                    <option value="zh">🇨🇳 中文</option>
                    <option value="pt">🇧🇷 Português</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="hi">🇮🇳 हिंदी</option>
                    <option value="ur">🇵🇰 اردو</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="nl">🇳🇱 Nederlands</option>
                  </Box>
                </VStack>
              </Box>
            </VStack>
          </MotionBox>
        )}
      </AnimatePresence>

      <style>{`
        .dock-item-vertical:hover .dock-tooltip {
          opacity: 1;
        }
      `}</style>
    </>
  );
};

export default Header;
