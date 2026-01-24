import React from "react";
import { motion } from "framer-motion";
import { SimpleGrid, Box } from "@chakra-ui/react";

// Import only the icons you need (tree-shaken)
import { TokenBTC, TokenETH, TokenUSDT, TokenBNB, TokenSOL } from "@web3icons/react";

type CryptoItem = {
  name: string;
  // Use broad typing to avoid the propTypes mismatch error from the library
  Component: React.ComponentType<any>;
};

export interface CryptoMatrixProps {
  columns?: number;
  spacing?: number | string;
  duration?: number; // seconds per float cycle
  iconSize?: number; // px
  cardSize?: number; // Chakra units (e.g., 20)
}

const CRYPTO_ITEMS: CryptoItem[] = [
  { name: "Bitcoin", Component: TokenBTC },
  { name: "Ethereum", Component: TokenETH },
  { name: "Tether", Component: TokenUSDT },
  { name: "BNB", Component: TokenBNB },
  { name: "Solana", Component: TokenSOL },
];

const CryptoMatrix: React.FC<CryptoMatrixProps> = ({
  columns = 5,
  spacing = 1,
  duration = 4,
  iconSize = 46,
  cardSize = 10,
}) => {
  // Deterministic per-item delay
  const delays = React.useMemo(() => CRYPTO_ITEMS.map((_, i) => (i * 0.35) % 1.5), []);

  return (
    <SimpleGrid columns={columns} spacing={spacing}>
      {CRYPTO_ITEMS.map(({ name, Component }, index) => (
        <motion.div
          key={name}
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
            borderRadius="2xl"
            boxShadow="md"
            bg="bg.surface"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {/* Avoid passing `variant` to dodge the union mismatch; width/height work fine */}
            <Component size={iconSize} />
          </Box>
        </motion.div>
      ))}
    </SimpleGrid>
  );
};

export default CryptoMatrix;
