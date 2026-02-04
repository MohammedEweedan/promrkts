/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { Box, VStack, HStack, Text, Button, keyframes, Portal } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import SplitText from "./SplitText";
import { useThemeMode } from "../themeProvider";

const BRAND = "#65a8bf";
const MotionBox = motion(Box);

const glowPulse = keyframes`
  0% { box-shadow: 0 0 0.4rem rgba(183, 162, 125, 0.6), 0 0 0.9rem rgba(183, 162, 125, 0.3); }
  50% { box-shadow: 0 0 0.9rem rgba(183, 162, 125, 0.9), 0 0 1.8rem rgba(183, 162, 125, 0.5); }
  100% { box-shadow: 0 0 0.4rem rgba(183, 162, 125, 0.6), 0 0 0.9rem rgba(183, 162, 125, 0.3); }
`;

const flowingTextGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

type Props = {
  expired: boolean;
  onOpenSpin: () => void;
  showSpinButton: boolean;
  setShowSpinButton: (v: boolean) => void;
};

export default function GuestLanding({
  expired,
  onOpenSpin,
  showSpinButton,
  setShowSpinButton,
}: Props) {
  const { t } = useTranslation() as any;
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  // GIF splash overlay state
  const [showSplash, setShowSplash] = React.useState(true);
  const [splashComplete, setSplashComplete] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      setSplashComplete(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAnimationComplete = () => setShowSpinButton(true);

  return (
    <>
      {/* Render splash in Portal to escape parent container constraints */}
      {!splashComplete && (
        <Portal>
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={9999}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="rgba(5, 8, 17, 0.75)"
            backdropFilter="blur(20px)"
            width="100vw"
            height="100vh"
            overflow="hidden"
          >
            <Box
              as="img"
              src={process.env.PUBLIC_URL + "/logo.gif"}
              alt="Loading"
              width={{ base: "160px", md: "220px" }}
              height="auto"
              display="block"
            />
          </Box>
        </Portal>
      )}

      {splashComplete && (
      <VStack gap={6} align="center" textAlign="center" w="100%" pt={{ base: 16, md: 24 }} pb={{ base: 8, md: 12 }}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <SplitText
            text={t("home.hero.title")}
            className="text-2xl font-semibold text-center"
            delay={100}
            duration={0.6}
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
          />
        </MotionBox>

      {showSpinButton && (
        <MotionBox
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          px={{ base: 4, md: 6 }}
          py={{ base: 2, md: 3 }}
        >
          <HStack justify="center">
            <Button
              borderColor={BRAND}
              borderWidth="1px"
              borderRadius="full"
              px={{ base: 6, md: 8 }}
              py={{ base: 3, md: 4 }}
              onClick={onOpenSpin}
              _hover={{
                transform: "translateY(-1px) scale(1.02)",
                filter: "brightness(1.05)",
              }}
              _active={{
                transform: "translateY(0) scale(0.99)",
                filter: "brightness(0.98)",
              }}
              animation={`${glowPulse} 2.4s ease-in-out infinite`}
              transition="transform 0.15s ease, filter 0.15s ease"
              bg="transparent"
            >
              <Text
                bgGradient="linear(to-r, black, gray.500, white, gray.500, black)"
                bgClip="text"
                fontWeight="bold"
                fontSize={{ base: "md", md: "lg" }}
                backgroundSize="200% 200%"
                animation={`${flowingTextGradient} 4s linear infinite`}
                letterSpacing="wide"
              >
                {t("home.spin_and_win", { defaultValue: "Spin & Win" })}
              </Text>
            </Button>
          </HStack>
        </MotionBox>
      )}

      <HStack gap={2} justify="center" flexWrap="wrap">
        <Button
          bg={BRAND}
          color={isDark ? "white" : "gray.900"}
          borderColor={BRAND}
          borderWidth="1px"
          _hover={{ bg: "blackAlpha.300" }}
          onClick={() => navigate(expired ? "/contact" : "/products")}
          borderRadius="xl"
        >
          {expired ? t("home.urgency.waitlist") : t("home.hero.cta_primary")}
        </Button>

        <Button
          variant="solid"
          bg={BRAND}
          borderColor={BRAND}
          borderWidth="1px"
          color={mode === "dark" ? "white" : "#1a1a1a"}
          _hover={{ bg: "blackAlpha.300" }}
          onClick={() => navigate("/company/about")}
          borderRadius="xl"
        >
          {t("footer.about", { defaultValue: "About Us" })}
        </Button>
      </HStack>
    </VStack>
      )}
    </>
  );
}
