/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useEffect } from "react";
import { Box, VStack, HStack, Text, Button, keyframes, Portal, Icon, Grid } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import SplitText from "./SplitText";
import { useThemeMode } from "../themeProvider";
import { Award, TrendingUp, Users, Clock, Shield } from "lucide-react";
import * as THREE from "three";

const BRAND = "#65a8bf";
const MotionBox = motion(Box);

const glowPulse = keyframes`
  0% { box-shadow: 0 0 20px rgba(101, 168, 191, 0.3), 0 0 40px rgba(101, 168, 191, 0.1); }
  50% { box-shadow: 0 0 30px rgba(101, 168, 191, 0.5), 0 0 60px rgba(101, 168, 191, 0.2); }
  100% { box-shadow: 0 0 20px rgba(101, 168, 191, 0.3), 0 0 40px rgba(101, 168, 191, 0.1); }
`;

const goldGlow = keyframes`
  0% { box-shadow: 0 0 15px rgba(212, 175, 55, 0.4), 0 0 30px rgba(212, 175, 55, 0.2); }
  50% { box-shadow: 0 0 25px rgba(212, 175, 55, 0.6), 0 0 50px rgba(212, 175, 55, 0.3); }
  100% { box-shadow: 0 0 15px rgba(212, 175, 55, 0.4), 0 0 30px rgba(212, 175, 55, 0.2); }
`;

const pulseScale = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

type Props = {
  expired: boolean;
  onOpenSpin: () => void;
  showSpinButton: boolean;
  setShowSpinButton: (v: boolean) => void;
};

// Stat Card Component
const StatCard = ({ icon, value, label, delay }: { icon: any; value: string; label: string; delay: number }) => (
  <MotionBox
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    bg="rgba(255,255,255,0.03)"
    backdropFilter="blur(10px)"
    border="1px solid"
    borderColor="rgba(101, 168, 191, 0.2)"
    borderRadius="xl"
    p={{ base: 4, md: 6 }}
    textAlign="center"
    position="relative"
    overflow="hidden"
    _hover={{
      borderColor: "rgba(101, 168, 191, 0.5)",
      transform: "translateY(-4px)",
      bg: "rgba(255,255,255,0.05)",
    }}
  >
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      height="1px"
      bgGradient="linear(to-r, transparent, rgba(101, 168, 191, 0.5), transparent)"
    />
    <Icon as={icon} boxSize={{ base: 6, md: 8 }} color={BRAND} mb={3} />
    <Text
      fontSize={{ base: "2xl", md: "3xl" }}
      fontWeight="bold"
      bgGradient={`linear(to-r, ${BRAND}, #8fd3f4)`}
      bgClip="text"
    >
      {value}
    </Text>
    <Text fontSize={{ base: "xs", md: "sm" }} color="gray.400" mt={1} textTransform="uppercase" letterSpacing="wider">
      {label}
    </Text>
  </MotionBox>
);

// Three.js Candlestick Chart Component - Moving like a real chart
const CandlestickChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number>(0);
  const candleDataRef = useRef<{ open: number; close: number; high: number; low: number; bullish: boolean }[]>([]);
  const candleMeshesRef = useRef<{ body: THREE.Mesh; wick: THREE.Mesh }[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera - positioned to view chart from side angle
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(15, 8, 20);
    camera.lookAt(0, 5, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Generate initial candlestick data
    const generateCandle = (prevPrice: number) => {
      // 70% chance of bullish candle (upward trend)
      const bullish = Math.random() > 0.3;
      const volatility = 0.2 + Math.random() * 0.4;
      
      const open = prevPrice;
      const change = volatility * (bullish ? 1 : -1) * (0.5 + Math.random() * 0.5);
      const close = open + change;
      const wickSize = volatility * 0.4;
      const high = Math.max(open, close) + Math.random() * wickSize;
      const low = Math.min(open, close) - Math.random() * wickSize;
      
      return { open, close, high, low, bullish };
    };

    // Initialize candles
    let currentPrice = 5;
    const numCandles = 50;
    const candleWidth = 0.35;
    const spacing = 0.5;
    const candleGroup = new THREE.Group();

    for (let i = 0; i < numCandles; i++) {
      const candle = generateCandle(currentPrice);
      candleDataRef.current.push(candle);
      currentPrice = candle.close + (candle.bullish ? 0.05 : -0.02);

      const x = (i - numCandles / 2) * spacing;
      
      // Candle body
      const bodyHeight = Math.abs(candle.close - candle.open) || 0.05;
      const bodyY = (candle.open + candle.close) / 2;
      const bodyGeometry = new THREE.BoxGeometry(candleWidth, bodyHeight, candleWidth * 0.6);
      const bodyMaterial = new THREE.MeshPhongMaterial({
        color: candle.bullish ? 0x22c55e : 0xef4444,
        emissive: candle.bullish ? 0x115522 : 0x551111,
        emissiveIntensity: 0.4,
        shininess: 100,
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.set(x, bodyY, 0);

      // Wick
      const wickHeight = candle.high - candle.low;
      const wickY = (candle.high + candle.low) / 2;
      const wickGeometry = new THREE.BoxGeometry(0.04, wickHeight, 0.04);
      const wickMaterial = new THREE.MeshPhongMaterial({
        color: candle.bullish ? 0x22c55e : 0xef4444,
        emissive: candle.bullish ? 0x0a2210 : 0x220a0a,
        emissiveIntensity: 0.3,
      });
      const wick = new THREE.Mesh(wickGeometry, wickMaterial);
      wick.position.set(x, wickY, 0);

      candleGroup.add(body);
      candleGroup.add(wick);
      candleMeshesRef.current.push({ body, wick });
    }

    scene.add(candleGroup);

    // Add subtle grid floor
    const gridHelper = new THREE.GridHelper(60, 60, 0x65a8bf, 0x1a2a35);
    gridHelper.position.y = 0;
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Animation - scrolling chart effect
    let time = 0;
    let scrollOffset = 0;
    const scrollSpeed = 0.015;
    let lastCandleTime = 0;
    const candleInterval = 2; // New candle every 2 seconds worth of animation

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      time += 0.016; // ~60fps
      scrollOffset += scrollSpeed;

      // Move all candles to the left (scrolling effect)
      candleGroup.position.x = -scrollOffset * spacing * 60;

      // Add new candle periodically
      if (time - lastCandleTime > candleInterval) {
        lastCandleTime = time;
        
        const lastCandle = candleDataRef.current[candleDataRef.current.length - 1];
        const newCandle = generateCandle(lastCandle.close + (lastCandle.bullish ? 0.05 : -0.02));
        candleDataRef.current.push(newCandle);

        const newX = (candleDataRef.current.length - 1 - numCandles / 2) * spacing;
        
        // Create new candle meshes
        const bodyHeight = Math.abs(newCandle.close - newCandle.open) || 0.05;
        const bodyY = (newCandle.open + newCandle.close) / 2;
        const bodyGeometry = new THREE.BoxGeometry(candleWidth, bodyHeight, candleWidth * 0.6);
        const bodyMaterial = new THREE.MeshPhongMaterial({
          color: newCandle.bullish ? 0x22c55e : 0xef4444,
          emissive: newCandle.bullish ? 0x115522 : 0x551111,
          emissiveIntensity: 0.4,
          shininess: 100,
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(newX, bodyY, 0);

        const wickHeight = newCandle.high - newCandle.low;
        const wickY = (newCandle.high + newCandle.low) / 2;
        const wickGeometry = new THREE.BoxGeometry(0.04, wickHeight, 0.04);
        const wickMaterial = new THREE.MeshPhongMaterial({
          color: newCandle.bullish ? 0x22c55e : 0xef4444,
          emissive: newCandle.bullish ? 0x0a2210 : 0x220a0a,
          emissiveIntensity: 0.3,
        });
        const wick = new THREE.Mesh(wickGeometry, wickMaterial);
        wick.position.set(newX, wickY, 0);

        candleGroup.add(body);
        candleGroup.add(wick);
      }

      // Gentle camera sway
      camera.position.y = 8 + Math.sin(time * 0.3) * 0.5;
      camera.position.x = 15 + Math.sin(time * 0.2) * 1;
      camera.lookAt(candleGroup.position.x + 5, 5, 0);

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
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={0}
      opacity={0.33}
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
  const isDark = mode === "dark";

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
            backdropFilter="blur(30px)"
            width="100vw"
            height="100vh"
            overflow="hidden"
          >
            <MotionBox
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                as="img"
                src={process.env.PUBLIC_URL + "/logo.gif"}
                alt="Loading"
                width={{ base: "180px", md: "260px" }}
                height="auto"
                display="block"
                filter="drop-shadow(0 0 40px rgba(101, 168, 191, 0.4))"
              />
            </MotionBox>
          </Box>
        </Portal>
      )}

      <AnimatePresence>
        {splashComplete && (
          <Box position="relative" overflow="hidden" minH="100vh">
            {/* Three.js Candlestick Background */}
            <CandlestickChart />

            {/* Gradient overlay for text readability */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              pointerEvents="none"
              zIndex={1}
            />

            {/* Floating orbs */}
            <Box
              position="absolute"
              top="10%"
              right="10%"
              width="300px"
              height="300px"
              borderRadius="full"
              bg={`radial-gradient(circle, rgba(101, 168, 191, 0.15) 0%, transparent 70%)`}
              filter="blur(60px)"
              animation={`${float} 8s ease-in-out infinite`}
              pointerEvents="none"
              zIndex={1}
            />
            <Box
              position="absolute"
              bottom="20%"
              left="5%"
              width="400px"
              height="400px"
              borderRadius="full"
              bg={`radial-gradient(circle, rgba(101, 168, 191, 0.1) 0%, transparent 70%)`}
              filter="blur(80px)"
              animation={`${float} 10s ease-in-out infinite reverse`}
              pointerEvents="none"
              zIndex={1}
            />

            <VStack 
              gap={8} 
              align="center" 
              textAlign="center" 
              w="100%" 
              px={4} 
              pt={{ base: 20, md: 32 }} 
              pb={{ base: 12, md: 20 }}
              position="relative"
              zIndex={2}
            >
              {/* Main headline */}
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                maxW="900px"
              >
                <SplitText
                  text={t("home.hero.title")}
                  className="text-4xl md:text-6xl font-bold text-center leading-tight"
                  delay={80}
                  duration={0.5}
                  splitType="chars"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-100px"
                  textAlign="center"
                  onLetterAnimationComplete={handleAnimationComplete}
                />
              </MotionBox>

              {/* Subheadline */}
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                maxW="600px"
              >
                <Text fontSize={{ base: "md", md: "lg" }} color="gray.300" lineHeight="1.8">
                  {t("home.hero.subtitle", { defaultValue: "Master the markets with professional-grade education and a community of elite traders." })}
                </Text>
              </MotionBox>

              {/* CTA Buttons */}
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <HStack gap={4} justify="center" flexWrap="wrap">
                  <Button
                    size="lg"
                    bg={BRAND}
                    color="white"
                    px={8}
                    py={6}
                    fontSize="md"
                    fontWeight="600"
                    borderRadius="xl"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: `0 20px 40px rgba(101, 168, 191, 0.3)`,
                    }}
                    _active={{ transform: "translateY(0)" }}
                    onClick={() => navigate(expired ? "/contact" : "/products")}
                    animation={`${glowPulse} 3s ease-in-out infinite`}
                  >
                    {expired ? t("home.urgency.waitlist") : t("home.hero.cta_primary", { defaultValue: "Start Learning" })}
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    borderColor="rgba(255,255,255,0.2)"
                    color="white"
                    px={8}
                    py={6}
                    fontSize="md"
                    fontWeight="600"
                    borderRadius="xl"
                    _hover={{
                      bg: "rgba(255,255,255,0.05)",
                      borderColor: BRAND,
                    }}
                    onClick={() => navigate("/company/about")}
                  >
                    {t("footer.about", { defaultValue: "Learn More" })}
                  </Button>
                </HStack>
              </MotionBox>

              {/* Spin button - Gold glowing */}
              {showSpinButton && (
                <MotionBox
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <Button
                    size="lg"
                    onClick={onOpenSpin}
                    bg="linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)"
                    color="#1a1a2e"
                    px={8}
                    py={6}
                    fontSize="md"
                    fontWeight="bold"
                    borderRadius="xl"
                    border="2px solid"
                    borderColor="rgba(212, 175, 55, 0.5)"
                    _hover={{
                      transform: "translateY(-2px)",
                      bg: "linear-gradient(135deg, #f4d03f 0%, #d4af37 50%, #f4d03f 100%)",
                    }}
                    _active={{ transform: "translateY(0)" }}
                    animation={`${goldGlow} 2s ease-in-out infinite`}
                    leftIcon={<Icon as={Award} boxSize={5} />}
                  >
                    {t("home.spin_and_win", { defaultValue: "Spin & Win Prizes" })}
                  </Button>
                </MotionBox>
              )}

              {/* Stats section */}
              <Grid
                templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
                gap={{ base: 4, md: 6 }}
                w="100%"
                maxW="800px"
                mt={8}
              >
                <StatCard icon={TrendingUp} value="50K+" label="Active Traders" delay={1.0} />
                <StatCard icon={Users} value="10K+" label="Community Members" delay={1.1} />
                <StatCard icon={Shield} value="24/7" label="Support" delay={1.2} />
              </Grid>

              {/* Trust text */}
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                mt={8}
              >
                <Text fontSize="sm" color="gray.500" letterSpacing="wide">
                  {t("home.trust", { defaultValue: "Trusted by traders worldwide" })}
                </Text>
              </MotionBox>
            </VStack>

            {/* Bottom right spin reminder */}
            {showSpinButton && (
              <MotionBox
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 2.0, ease: "easeOut" }}
                position="fixed"
                bottom={{ base: 4, md: 6 }}
                right={{ base: 4, md: 6 }}
                zIndex={100}
              >
                <Box
                  as="button"
                  onClick={onOpenSpin}
                  bg="linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)"
                  color="#1a1a2e"
                  px={4}
                  py={3}
                  borderRadius="full"
                  border="2px solid"
                  borderColor="rgba(212, 175, 55, 0.6)"
                  display="flex"
                  alignItems="center"
                  gap={2}
                  fontWeight="bold"
                  fontSize="sm"
                  cursor="pointer"
                  animation={`${goldGlow} 2s ease-in-out infinite, ${pulseScale} 3s ease-in-out infinite`}
                  _hover={{
                    transform: "scale(1.05)",
                    bg: "linear-gradient(135deg, #f4d03f 0%, #d4af37 50%, #f4d03f 100%)",
                  }}
                  transition="transform 0.2s ease"
                >
                  <Icon as={Award} boxSize={5} />
                  <Text display={{ base: "none", md: "block" }}>
                    {t("home.spin_reminder", { defaultValue: "Don't forget to spin!" })}
                  </Text>
                  <Text display={{ base: "block", md: "none" }}>Spin!</Text>
                </Box>
              </MotionBox>
            )}
          </Box>
        )}
      </AnimatePresence>
    </>
  );
}
