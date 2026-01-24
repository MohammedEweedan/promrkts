import React from "react";
import { Box, usePrefersReducedMotion } from "@chakra-ui/react";

type ConfettiProps = {
  count?: number; // how many pieces
  emojis?: string[]; // which emojis to sprinkle
  durationRangeSec?: [number, number]; // fall duration [min,max]
  sizeRangePx?: [number, number]; // font-size [min,max]
};

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

// Golden-angle helper for even spread (with a bit of jitter)
const goldenLeft = (i: number) => {
  const phi = 137.508; // degrees
  const base = (i * phi) % 100;
  return (base + rand(-8, 8) + 100) % 100; // jitter ±8%
};

const Confetti: React.FC<ConfettiProps> = ({
  count = 36,
  emojis = ["🎉", "♾️"],
  durationRangeSec = [1.8, 3.2],
  sizeRangePx = [16, 28],
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  const pieces = React.useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const dur = rand(durationRangeSec[0], durationRangeSec[1]);
      const delay = rand(0, 1.2);
      const size = rand(sizeRangePx[0], sizeRangePx[1]);
      const rot = rand(0, 360);
      const sway = rand(12, 36); // px
      const left = goldenLeft(i);
      const emoji = emojis[i % emojis.length];
      return { i, dur, delay, size, rot, sway, left, emoji };
    });
  }, [count, emojis, durationRangeSec, sizeRangePx]);

  if (prefersReducedMotion) {
    // Static sprinkle (no animation) for accessibility
    return (
      <Box pointerEvents="none" position="absolute" inset={0} overflow="hidden">
        {pieces.map((p) => (
          <Box
            key={p.i}
            position="absolute"
            top={`${rand(0, 80)}%`}
            left={`${p.left}%`}
            fontSize={`${p.size}px`}
            transform={`rotate(${p.rot}deg)`}
            opacity={0.7}
          >
            {p.emoji}
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box pointerEvents="none" position="absolute" inset={0} overflow="hidden">
      {pieces.map((p) => (
        <Box
          key={p.i}
          position="absolute"
          top="-10%"
          left={`${p.left}%`}
          fontSize={`${p.size}px`}
          style={
            {
              "--dur": `${p.dur}s`,
              "--delay": `${p.delay}s`,
              "--rot": `${p.rot}deg`,
              "--sway": `${p.sway}px`,
            } as React.CSSProperties
          }
          animation={`fall var(--dur) linear var(--delay) 1,
                      sway var(--dur) ease-in-out var(--delay) 1`}
          transform={`rotate(${p.rot}deg)`}
          willChange="transform, opacity"
        >
          {p.emoji}
        </Box>
      ))}

      <style>{`
        @keyframes fall {
          0%   { transform: translate3d(0, 0, 0) rotate(var(--rot)); opacity: 1; }
          100% { transform: translate3d(0, 140%, 0) rotate(calc(var(--rot) + 360deg)); opacity: 0; }
        }
        /* horizontal drift back and forth while falling */
        @keyframes sway {
          0%   { margin-left: 0px;   }
          25%  { margin-left: calc(var(--sway) * 0.5); }
          50%  { margin-left: calc(var(--sway) * -1); }
          75%  { margin-left: calc(var(--sway) * 0.6); }
          100% { margin-left: 0px; }
        }
      `}</style>
    </Box>
  );
};

export default Confetti;
