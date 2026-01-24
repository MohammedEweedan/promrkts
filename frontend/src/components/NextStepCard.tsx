import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Button,
  Icon,
  Stack,
  Tooltip,
} from "@chakra-ui/react";
import {
  CheckCircle,
  PlayCircle,
  Lock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export type StepStatus = "completed" | "available" | "locked" | "in-progress";

export type NextStepCardAction = {
  label: string;
  onClick: () => void;
  isPrimary?: boolean;
  disabled?: boolean;
};

export type NextStepCardProps = {
  title: string;
  description: string;
  badge?: string;
  status?: StepStatus;
  subtext?: string;
  accent?: string;
  actions?: NextStepCardAction[];
  icon?: React.ReactNode;
  tooltip?: string;
};

const statusIcon = (status: StepStatus = "available") => {
  switch (status) {
    case "completed":
      return CheckCircle;
    case "locked":
      return Lock;
    case "in-progress":
      return Sparkles;
    default:
      return PlayCircle;
  }
};

const statusColor = (status: StepStatus = "available") => {
  switch (status) {
    case "completed":
      return "green.400";
    case "locked":
      return "gray.500";
    case "in-progress":
      return "orange.300";
    default:
      return "brand.400";
  }
};

const NextStepCard: React.FC<NextStepCardProps> = ({
  title,
  description,
  badge,
  status = "available",
  subtext,
  accent = "linear-gradient(120deg, rgba(0,191,99,0.16), rgba(148, 233, 203, 0.08))",
  actions,
  icon,
  tooltip,
}) => {
  const IconCmp = statusIcon(status);
  const content = (
    <Box
      borderRadius="2xl"
      border="1px solid"
      borderColor="rgba(255,255,255,0.08)"
      bg={accent}
      backdropFilter="blur(18px)"
      px={{ base: 4, md: 6 }}
      py={{ base: 5, md: 6 }}
      w="100%"
    >
      <Flex align={{ base: "flex-start", md: "center" }} gap={4} direction={{ base: "column", md: "row" }}>
        <Flex
          w={14}
          h={14}
          borderRadius="xl"
          align="center"
          justify="center"
          bg="rgba(255,255,255,0.08)"
          color={statusColor(status)}
          flexShrink={0}
        >
          {icon ?? <Icon as={IconCmp} strokeWidth={1.4} boxSize={8} />}
        </Flex>
        <Box flex="1">
          <Stack direction={{ base: "column", md: "row" }} align={{ base: "flex-start", md: "center" }} spacing={{ base: 2, md: 4 }} mb={2}>
            <Heading as="h3" size="md">
              {title}
            </Heading>
            {badge && (
              <Badge
                borderRadius="full"
                px={3}
                py={0.5}
                fontWeight="600"
                textTransform="none"
                bg="rgba(255,255,255,0.08)"
              >
                {badge}
              </Badge>
            )}
          </Stack>
          <Text color="whiteAlpha.800">{description}</Text>
          {subtext && (
            <Text mt={3} fontSize="sm" color="whiteAlpha.600">
              {subtext}
            </Text>
          )}
        </Box>
        {actions && actions.length > 0 && (
          <Stack direction={{ base: "column", md: "column" }} spacing={2} minW={{ base: "100%", md: 44 }}>
            {actions.map(({ label, onClick, isPrimary, disabled }, idx) => (
              <Button
                key={`${label}-${idx}`}
                onClick={onClick}
                rightIcon={<ArrowRight size={18} />}
                variant={isPrimary ? "solid" : "ghost"}
                colorScheme={isPrimary ? "green" : undefined}
                bg={isPrimary ? "#65a8bf" : "transparent"}
                _hover={isPrimary ? { bg: "#00a651" } : { bg: "rgba(255,255,255,0.08)" }}
                disabled={disabled || status === "locked"}
              >
                {label}
              </Button>
            ))}
          </Stack>
        )}
      </Flex>
    </Box>
  );

  if (tooltip) {
    return (
      <Tooltip label={tooltip} placement="top-start" hasArrow>
        {content}
      </Tooltip>
    );
  }

  return content;
};

export default NextStepCard;
