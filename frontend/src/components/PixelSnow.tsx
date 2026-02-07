import React, { useEffect, useRef } from "react";
import { Box } from "@chakra-ui/react";

interface PixelSnowProps {
  density?: number;
  speed?: number;
  color?: string;
}

interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  shimmerPhase: number;
  shimmerSpeed: number;
}

const PixelSnow: React.FC<PixelSnowProps> = ({
  density = 80,
  speed = 1,
  color = "#65a8bf",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const snowflakesRef = useRef<Snowflake[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize snowflakes
    const initSnowflakes = () => {
      snowflakesRef.current = [];
      for (let i = 0; i < density; i++) {
        snowflakesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speed: (Math.random() * 0.5 + 0.2) * speed,
          opacity: Math.random() * 0.5 + 0.3,
          shimmerPhase: Math.random() * Math.PI * 2,
          shimmerSpeed: Math.random() * 0.02 + 0.01,
        });
      }
    };

    initSnowflakes();

    // Parse color to RGB
    const parseColor = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 101, g: 168, b: 191 };
    };

    const rgb = parseColor(color);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakesRef.current.forEach((flake) => {
        // Update position
        flake.y += flake.speed;
        flake.x += Math.sin(flake.y * 0.01) * 0.3;

        // Update shimmer
        flake.shimmerPhase += flake.shimmerSpeed;
        const shimmer = (Math.sin(flake.shimmerPhase) + 1) / 2;
        const currentOpacity = flake.opacity * (0.4 + shimmer * 0.6);

        // Reset if off screen
        if (flake.y > canvas.height) {
          flake.y = -10;
          flake.x = Math.random() * canvas.width;
        }
        if (flake.x < 0) flake.x = canvas.width;
        if (flake.x > canvas.width) flake.x = 0;

        // Draw pixel-style snowflake (small square)
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${currentOpacity})`;
        
        // Pixel-perfect rendering
        const pixelX = Math.floor(flake.x);
        const pixelY = Math.floor(flake.y);
        const pixelSize = Math.ceil(flake.size);
        
        ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
        
        // Add subtle glow for larger particles
        if (flake.size > 1.5) {
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${currentOpacity * 0.3})`;
          ctx.fillRect(pixelX - 1, pixelY - 1, pixelSize + 2, pixelSize + 2);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [density, speed, color]);

  return (
    <Box
      as="canvas"
      ref={canvasRef}
      position="fixed"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      pointerEvents="none"
      zIndex={1}
      opacity={0.6}
    />
  );
};

export default PixelSnow;
