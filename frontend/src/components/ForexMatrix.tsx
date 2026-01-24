import React from "react";
import { motion } from "framer-motion";
import { SimpleGrid, Box, Image } from "@chakra-ui/react";
import FinancialFlagIcon from "financial-flag-icons";

type FiatItem =
  | { name: string; type: "lib"; code: string } // rendered with financial-flag-icons
  | { name: string; type: "img"; src: string }; // for XAU (gold brick image)

export interface ForexMatrixProps {
  columns?: number;
  spacing?: number | string;
  duration?: number; // seconds per float cycle
  iconSize?: number; // px
  cardSize?: number; // Chakra units (e.g., 20)
}

const FOREX_ITEMS: FiatItem[] = [
  { name: "GBP/JPY", type: "lib", code: "gbpjpy" },
  { name: "EUR/USD", type: "lib", code: "eurusd" },
  { name: "GBP/USD", type: "lib", code: "gbpusd" },
  { name: "USD/CHF", type: "lib", code: "usdchf" },
  // Gold (XAU) — use your local image
  { name: "Gold (XAU)", type: "img", src: "/images/rand/goldbar.png" },
];

const ForexMatrix: React.FC<ForexMatrixProps> = ({
  columns = 5,
  spacing = 1,
  duration = 4,
  iconSize = 46,
  cardSize = 10,
}) => {
  // Deterministic, per-item delay
  const delays = React.useMemo(() => FOREX_ITEMS.map((_, i) => (i * 0.35) % 1.5), []);

  return (
    <SimpleGrid columns={columns} spacing={spacing}>
      {FOREX_ITEMS.map((it, index) => (
        <motion.div
          key={it.name}
          animate={{ y: [6, -8, 6], opacity: [0.85, 1, 0.85] }}
          transition={{
            duration,
            delay: delays[index],
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Box
            w={cardSize}
            h={cardSize}
            p={2}
            borderRadius="2xl"
            boxShadow="md"
            bg="bg.surface"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {it.type === "lib" ? (
              // Type definitions require `icon` to be a valid key; casting to any avoids compile-time
              // coupling to the package's internal icon union while staying safe at runtime.
              <FinancialFlagIcon
                icon={it.code as any}
                style={{ width: iconSize, height: iconSize }}
              />
            ) : (
              <Image
                src={it.src}
                alt={it.name}
                title={it.name}
                boxSize={`${iconSize}px`}
                objectFit="contain"
              />
            )}
          </Box>
        </motion.div>
      ))}
    </SimpleGrid>
  );
};

export default ForexMatrix;
