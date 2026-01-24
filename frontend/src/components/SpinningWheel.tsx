import React from "react";
import { Box, Button, Heading, Text, VStack, HStack, useToast } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import api from "../api/client";

const GOLD = "#65a8bf";

type SpinResult =
  | { type: "PROMO"; code: string; value: number; discountType: "PERCENT" }
  | { type: "VIP_MONTH"; message: string };

const segments = [
  { label: "5%", value: 5, color: "#c9b896" },      // Pastel gold-green
  { label: "10%", value: 10, color: "#a8c5d4" },    // Pastel gold-blue
  { label: "5%", value: 5, color: "#c9b896" },      // Pastel gold-green
  { label: "10%", value: 10, color: "#a8c5d4" },    // Pastel gold-blue
  { label: "15%", value: 15, color: "#d4b896" },    // Pastel gold-amber
  { label: "5%", value: 5, color: "#c9b896" },      // Pastel gold-green
  { label: "10%", value: 10, color: "#a8c5d4" },    // Pastel gold-blue
  { label: "20%", value: 20, color: "#d4a896" },    // Pastel gold-coral
  { label: "5%", value: 5, color: "#c9b896" },      // Pastel gold-green
  { label: "10%", value: 10, color: "#a8c5d4" },    // Pastel gold-blue
  { label: "25%", value: 25, color: "#c4a8d4" },    // Pastel gold-purple
  { label: "VIP", value: 0, color: GOLD },          // Pure gold
];

export default function SpinningWheel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [spinning, setSpinning] = React.useState(false);
  const [result, setResult] = React.useState<SpinResult | null>(null);
  const [rotation, setRotation] = React.useState(0);
  const [finalRotation, setFinalRotation] = React.useState(0);
  const [targetSegmentIndex, setTargetSegmentIndex] = React.useState<number | null>(null);
  const toast = useToast();

  React.useEffect(() => {
    if (isOpen) {
      setResult(null);
      setSpinning(false);
      setRotation(0);
      setFinalRotation(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function spin() {
    try {
      setSpinning(true);
      setResult(null);
      
      // Call backend to get result
      const r = await api.post("/spin", {});
      const data = r?.data as SpinResult;
      
      console.log("Backend spin result:", data);
      
      // Determine which segment to land on based on result
      let targetValue: number;
      if (data.type === "VIP_MONTH") {
        targetValue = 0; // VIP segment
        console.log("Landing on VIP segment");
      } else {
        targetValue = data.value;
        console.log(`Landing on ${data.value}% segment`);
      }
      
      // Find matching segment index
      const matchingIndices = segments
        .map((seg, idx) => ({ seg, idx }))
        .filter(({ seg }) => seg.value === targetValue)
        .map(({ idx }) => idx);
      
      const targetIndex = matchingIndices[Math.floor(Math.random() * matchingIndices.length)];
      setTargetSegmentIndex(targetIndex);
      
      console.log(`Target segment index: ${targetIndex}, label: ${segments[targetIndex].label}`);
      
      // Calculate rotation to land on target segment
      const segmentAngle = 360 / segments.length; // 30° per segment
      const spins = 5;
      
      // In the SVG, segment 0 starts at -90° (top), segment 1 at -60°, etc.
      // After we rotate the wheel by X degrees, we want the target segment's CENTER under the arrow (top)
      // Arrow is at 0° (top). We need segment center to be at 0° after rotation.
      
      // Segment center in original SVG position (before any rotation)
      const segmentOriginalCenter = targetIndex * segmentAngle - 90 + segmentAngle / 2;
      
      // To bring this segment to the top (0°), we need to rotate by negative of its position
      // But we want to spin 5 times first, so add 5*360
      const finalRot = spins * 360 - segmentOriginalCenter;
      
      console.log(`Segment ${targetIndex} original center: ${segmentOriginalCenter}°`);
      console.log(`Final rotation: ${finalRot}°, will land on segment ${targetIndex}`);
      
      setFinalRotation(finalRot);
      
      // Wait for animation to complete, then show the SAME result we got from backend
      setTimeout(() => {
        console.log("Showing result:", data);
        setResult(data);
        setSpinning(false);
      }, 4000);
      
    } catch (e) {
      setSpinning(false);
      toast({ status: "error", title: t("spin.error", "Failed to spin") });
    }
  }

  function content() {
    if (!result && !spinning) {
      return (
        <VStack py={6} gap={4} align="center">
          <Text textAlign="center">{t("spin.description", "Spin the wheel to win a discount or VIP access!")}</Text>
          <Button onClick={spin} bg={GOLD} color="black" _hover={{ opacity: 0.9 }} size="lg">
            {t("spin.button", "Spin Now")}
          </Button>
        </VStack>
      );
    }
    
    if (result) {
      if (result.type === "PROMO") {
        return (
          <VStack py={6} gap={3} align="center">
            <Heading size="lg">🎉 {t("spin.won", { defaultValue: "You won {{value}}% off!", value: result.value })}</Heading>
            <HStack>
              <Text fontWeight="bold">{t("spin.code", "Code:")} </Text>
              <Box px={3} py={2} borderRadius="md" bg={GOLD} color="black" fontWeight="bold" fontSize="lg">
                {result.code}
              </Box>
            </HStack>
            <Text fontSize="sm" opacity={0.8}>{t("spin.valid", "Use it at checkout. Valid for 7 days.")}</Text>
          </VStack>
        );
      }
      return (
        <VStack py={6} gap={3} align="center">
          <Heading size="lg">🎁 {t("spin.vip_title", "VIP Month!")}</Heading>
          <Text textAlign="center">{t("spin.vip_message", "Congrats! You won 1 month VIP access. Create an account to claim.")}</Text>
        </VStack>
      );
    }
    
    return null;
  }

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={999999}
      display="flex"
      alignItems="center"
      justifyContent="center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.800"
        backdropFilter="blur(8px)"
      />

      {/* Modal Content */}
      <Box
        position="relative"
        bg="white"
        color="#1a1a1a"
        borderRadius="lg"
        boxShadow="2xl"
        maxW="600px"
        w="90%"
        p={6}
        onClick={(e) => e.stopPropagation()}
        sx={{
          _dark: { bg: "gray.800", color: "white" },
        }}
      >
        {/* Close Button */}
        <Button
          position="absolute"
          top={2}
          right={2}
          size="sm"
          variant="ghost"
          onClick={onClose}
          isDisabled={spinning}
        >
          ✕
        </Button>

        {/* Header */}
        <Heading size="md" mb={4} textAlign="center">
          {t("spin.title", "Spin & Win")}
        </Heading>

        {/* Wheel Container */}
        {!result && (
          <Box position="relative" w="300px" h="300px" mx="auto" mb={4}>
            {/* Arrow Pointer */}
            <Box
              position="absolute"
              top="-10px"
              left="50%"
              transform="translateX(-50%)"
              zIndex={10}
              fontSize="40px"
              color="red.500"
            >
              ▼
            </Box>

            {/* Spinning Wheel */}
            <Box
              position="relative"
              w="100%"
              h="100%"
              transform={`rotate(${spinning ? finalRotation : rotation}deg)`}
              transition={spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none"}
            >
              <svg width="100%" height="100%" viewBox="0 0 300 300" style={{ display: "block" }}>
                {segments.map((segment, index) => {
                  const angle = 360 / segments.length;
                  const startAngle = index * angle - 90; // Start from top (segment 0 at -90°)
                  const endAngle = startAngle + angle;

                  // Convert to radians
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;

                  // Calculate pizza slice path
                  const radius = 150;
                  const centerX = 150;
                  const centerY = 150;

                  const x1 = centerX + radius * Math.cos(startRad);
                  const y1 = centerY + radius * Math.sin(startRad);
                  const x2 = centerX + radius * Math.cos(endRad);
                  const y2 = centerY + radius * Math.sin(endRad);

                  const largeArc = angle > 180 ? 1 : 0;

                  const pathData = `
                    M ${centerX} ${centerY}
                    L ${x1} ${y1}
                    A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
                    Z
                  `;

                  // Text position (middle of slice)
                  const textAngle = startAngle + angle / 2;
                  const textRad = (textAngle * Math.PI) / 180;
                  const textRadius = radius * 0.65;
                  const textX = centerX + textRadius * Math.cos(textRad);
                  const textY = centerY + textRadius * Math.sin(textRad);

                  const isTarget = targetSegmentIndex === index && !spinning;

                  return (
                    <g key={index}>
                      <path
                        d={pathData}
                        fill={segment.color}
                        stroke={isTarget ? "#65a8bf" : "white"}
                        strokeWidth={isTarget ? "4" : "2"}
                      />
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="20"
                        fontWeight="bold"
                        style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
                      >
                        {segment.label}
                      </text>
                    </g>
                  );
                })}
                {/* Outer border */}
                <circle cx="150" cy="150" r="148" fill="none" stroke={GOLD} strokeWidth="4" />
              </svg>

              {/* Center Circle */}
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w="40px"
                h="40px"
                borderRadius="50%"
                bg={GOLD}
                border="3px solid white"
                zIndex={5}
              />
            </Box>
          </Box>
        )}

        {/* Content/Result */}
        {content()}

        {/* Footer */}
        {result && (
          <Box mt={4} textAlign="center">
            <Button onClick={onClose} bg={GOLD} color="black" _hover={{ opacity: 0.9 }}>
              {t("spin.close", "Close")}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
