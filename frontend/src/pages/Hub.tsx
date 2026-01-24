import React from "react";
import {
  Box,
  Container,
  Heading,
  HStack,
  Button,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import PathPage from "./Path"; // reuse your PathPage
import Progress from "./Progress"; // reuse your Progress page
import Journal from "./Journal"; // create next (below)

export default function Hub() {
  const { t } = useTranslation();

  const [active, setActive] = React.useState<"progress" | "path" | "journal">("progress");

  const MotionBox = motion(Box);

  const panelVariants = {
    initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
    animate: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
  };

  const panelKey = active;

  return (
    <Box minH="100vh" py={{ base: 6, md: 10 }}>
      <Container maxW="7xl">
        <Box mb={6}>
          <HStack justify="center" align="center" gap={4}>
            <Box minW={{ base: "100%", md: "420px" }}>
              <Heading size={{ base: "lg", md: "xl" }}>
                {t("hub.title", "Your Trading Hub")}
              </Heading>
            </Box>
          </HStack>
          <HStack spacing={2} wrap="wrap" w={{ base: "100%", md: "auto" }}>
            <Button
              size="sm"
              variant={active === "progress" ? "solid" : "solid"}
              colorScheme={active === "progress" ? "green" : undefined}
              onClick={() => setActive("progress")}
            >
              {t("hub.jump.progress", "Progress")}
            </Button>
            <Button
              size="sm"
              variant={active === "path" ? "solid" : "solid"}
              colorScheme={active === "path" ? "green" : undefined}
              onClick={() => setActive("path")}
            >
              {t("hub.jump.path", "Path")}
            </Button>
            <Button
              size="sm"
              variant={active === "journal" ? "solid" : "solid"}
              colorScheme={active === "journal" ? "green" : undefined}
              onClick={() => setActive("journal")}
            >
              {t("hub.jump.journal", "Journal")}
            </Button>
          </HStack>
        </Box>

        <AnimatePresence mode="wait" custom={1}>
          <MotionBox
            key={panelKey}
            custom={1}
            variants={panelVariants as any}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {active === "progress" ? <Progress /> : null}
            {active === "path" ? <PathPage /> : null}
            {active === "journal" ? <Journal /> : null}
          </MotionBox>
        </AnimatePresence>
      </Container>
    </Box>
  );
}
