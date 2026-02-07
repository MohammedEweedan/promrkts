/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useEffect } from "react";
import { Box, VStack, HStack, Text, Button, keyframes, Icon, Grid, Container } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useThemeMode } from "../themeProvider";
import { Award, TrendingUp, Users, Shield, Zap, Globe, ChevronRight, Play } from "lucide-react";
import * as THREE from "three";

// ===== DESIGN SYSTEM =====
const UI = {
  // Brand colors
  primary: "#65a8bf",
  secondary: "#b7a27d",
  gradient: "linear-gradient(135deg, #65a8bf 0%, #b7a27d 100%)",
  gradientReverse: "linear-gradient(135deg, #b7a27d 0%, #65a8bf 100%)",
  
  // Surfaces
  bgDark: "#0a0f1a",
  surface: "rgba(15, 23, 42, 0.6)",
  surfaceLight: "rgba(255, 255, 255, 0.03)",
  
  // Text
  textSecondary: "rgba(255, 255, 255, 0.7)",
  textMuted: "rgba(255, 255, 255, 0.5)",
  
  // Borders
  border: "rgba(255, 255, 255, 0.08)",
  borderAccent: "rgba(101, 168, 191, 0.3)",
  
  // Effects
  glow: "0 0 60px rgba(101, 168, 191, 0.25)",
  glowStrong: "0 0 80px rgba(101, 168, 191, 0.4)",
};

const goldGlow = keyframes`
  0% { box-shadow: 0 0 20px rgba(183, 162, 125, 0.3); }
  50% { box-shadow: 0 0 40px rgba(183, 162, 125, 0.5); }
  100% { box-shadow: 0 0 20px rgba(183, 162, 125, 0.3); }
`;

type Props = {
  expired: boolean;
  onOpenSpin: () => void;
  showSpinButton: boolean;
  setShowSpinButton: (v: boolean) => void;
};

// Premium Stat Card Component
const StatCard = ({ icon, value, label, delay }: { icon: any; value: string; label: string; delay: number }) => (
  <Box
    bg={UI.surfaceLight}
    backdropFilter="blur(20px)"
    border="1px solid"
    borderColor={UI.border}
    borderRadius="20px"
    p={{ base: 5, md: 6 }}
    textAlign="center"
    position="relative"
    overflow="hidden"
    _hover={{
      borderColor: UI.borderAccent,
      transform: "translateY(-4px)",
    }}
    transition="all 0.3s ease"
  >
    <Box
      position="absolute"
      top={0}
      left="50%"
      transform="translateX(-50%)"
      w="60%"
      height="1px"
      bg={UI.gradient}
      opacity={0.5}
    />
    <Icon as={icon} boxSize={{ base: 5, md: 6 }} color={UI.primary} mb={3} />
    <Text
      fontSize={{ base: "2xl", md: "3xl" }}
      fontWeight="700"
      letterSpacing="-0.02em"
      bgGradient={UI.gradient}
      bgClip="text"
    >
      {value}
    </Text>
    <Text
      fontSize="xs"
      bgGradient={UI.gradient}
      bgClip="text"
      mt={1}
      textTransform="uppercase"
      letterSpacing="0.1em"
      fontWeight="500"
    >
      {label}
    </Text>
  </Box>
);

// ===== THREE.JS GLOBE COMPONENT =====
const GlobeAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera (match example)
    const camera = new THREE.PerspectiveCamera(44, width / height, 4.51, 90);
    camera.position.z = 11.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Sphere Geometry with Displacement (match provided example)
    const geometry = new THREE.SphereGeometry(2.3, 60, 72);
    const positionAttribute = geometry.attributes.position as THREE.BufferAttribute;
    const vertexCount = positionAttribute.count;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < vertexCount; i++) {
      vertex.fromBufferAttribute(positionAttribute, i);
      const offset = (Math.random() - 0.5) * 0.55;
      vertex.multiplyScalar(1 + offset * Math.sin(vertex.length() * 1.6));
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    geometry.computeVertexNormals();

    // Shiny, dim sun-like effect (adapted) with color shifting
    const material = new THREE.MeshStandardMaterial({
      color: 0x65a8bf,
      metalness: 0.5,
      roughness: 0.65,
      transparent: true,
      opacity: 0.22,
      emissive: 0xb7a27d,
      emissiveIntensity: 0.75,
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Lighting Setup
    const pointLight = new THREE.PointLight(0x404040, 5, 360);
    pointLight.position.set(9, 9, 9);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
    scene.add(ambientLight);

    const hueA = new THREE.Color("#65a8bf");
    const hueB = new THREE.Color("#b7a27d");
    const tmpColor = new THREE.Color();
    const tmpEmissive = new THREE.Color();

    // Animate Sphere Rotation and Shine Effect
    let time = 0;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      time += 0.01;
      sphere.rotation.x += 0.004;
      sphere.rotation.y += 0.008;

      // Smooth brand hue shift between #65a8bf and #b7a27d
      const hueT = (Math.sin(time * 0.55) + 1) / 2;
      tmpColor.copy(hueA).lerp(hueB, hueT);
      material.color.copy(tmpColor);

      // Keep emissive shifting too, but biased toward gold
      tmpEmissive.copy(hueB).lerp(hueA, 0.35 * (1 - hueT));
      material.emissive.copy(tmpEmissive);

      const shine = Math.random() * 0.1;
      material.emissiveIntensity = 0.85 + shine;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);
      if (rendererRef.current && containerRef.current) {
        geometry.dispose();
        material.dispose();
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      position="absolute"
      top="50%"
      left={{ base: "50%", md: "auto" }}
      right={{ base: "auto", md: "5%" }}
      transform={{ base: "translate(-50%, -50%)", md: "translateY(-50%)" }}
      w={{ base: "600px", md: "700px", lg: "800px" }}
      h={{ base: "600px", md: "700px", lg: "800px" }}
      zIndex={0}
      opacity={0.8}
      pointerEvents="none"
    />
  );
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

  // Show spin button immediately - no delay
  React.useEffect(() => {
    setShowSpinButton(true);
  }, [setShowSpinButton]);

  return (
    <Box position="relative" overflow="hidden" minH="100vh">
      {/* 3D Globe Background */}
      <GlobeAnimation />

      {/* Gradient overlays for depth */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        pointerEvents="none"
        zIndex={1}
      />

      {/* Main Content */}
      <Container maxW="container.xl" position="relative" zIndex={2}>
        <Grid
          templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
          gap={{ base: 8, lg: 16 }}
          alignItems="center"
          minH="100vh"
          py={{ base: 20, md: 0 }}
        >
          {/* Left: Hero Content */}
          <VStack align={{ base: "center", lg: "flex-start" }} spacing={8} textAlign={{ base: "center", lg: "left" }}>
            {/* Main Headline */}
            <Text
                as="h1"
                fontSize={{ base: "3rem", md: "4rem", lg: "4.5rem" }}
                fontWeight="800"
                lineHeight="1.1"
                letterSpacing="-0.03em"
              >
                {t("home.hero.title_line1", { defaultValue: "Master Trading." })}
                <br />
                <Text as="span" bgGradient={UI.gradient} bgClip="text">
                  {t("home.hero.title_line2", { defaultValue: "Build Wealth." })}
                </Text>
              </Text>

            {/* Subtitle */}
            <Text fontSize={{ base: "md", md: "lg" }} lineHeight="1.8" maxW="500px">
                {t("home.hero.subtitle", {
                  defaultValue: "Professional trading education with AI-powered coaching, live signals, and a global community of elite traders.",
                })}
              </Text>

            {/* Unified CTA - Spin & Win */}
            {showSpinButton && (
              <Box>
                <Button
                    size="lg"
                    onClick={onOpenSpin}
                    bg={UI.secondary}
                    color="#0a0f1a"
                    px={8}
                    py={6}
                    fontSize="md"
                    fontWeight="700"
                    borderRadius="16px"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "0 0 40px rgba(183, 162, 125, 0.4)",
                    }}
                    _active={{ transform: "translateY(0)" }}
                    animation={`${goldGlow} 2.5s ease-in-out infinite`}
                    leftIcon={<Icon as={Award} boxSize={5} />}
                  >
                    {t("home.spin_and_win", { defaultValue: "Spin & Win Prizes" })}
                </Button>
              </Box>
            )}

            {/* Stats Row */}
            <Box w="100%">
              <Grid
                templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
                gap={4}
                maxW={{ base: "100%", lg: "600px" }}
              >
                <StatCard icon={TrendingUp} value={t("home.stats.traders", { defaultValue: "50K+" })} label={t("home.stats.traders_label", { defaultValue: "Active Traders" })} delay={0} />
                <StatCard icon={Users} value={t("home.stats.members", { defaultValue: "12K+" })} label={t("home.stats.members_label", { defaultValue: "Members" })} delay={0} />
                <StatCard icon={Shield} value={t("home.stats.support", { defaultValue: "24/7" })} label={t("home.stats.support_label", { defaultValue: "Support" })} delay={0} />
                <StatCard icon={Zap} value={t("home.stats.signals", { defaultValue: "95%" })} label={t("home.stats.signals_label", { defaultValue: "Win Rate" })} delay={0} />
              </Grid>
            </Box>

            {/* Trust Badge */}
            <HStack spacing={3} color={UI.textMuted}>
              <Icon as={Globe} boxSize={4} />
              <Text fontSize="sm" fontWeight="500">
                {t("home.trust", { defaultValue: "Trusted by traders in 50+ countries" })}
              </Text>
            </HStack>
          </VStack>

          {/* Right: Empty space for globe (globe is positioned absolutely) */}
          <Box display={{ base: "none", lg: "block" }} />
        </Grid>
      </Container>

    </Box>
  );
}
