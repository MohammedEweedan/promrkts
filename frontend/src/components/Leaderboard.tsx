import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Heading,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { Trophy, Medal } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import { useThemeMode } from "../themeProvider";
import { useAuth } from "../auth/AuthContext";

const GOLD = "#65a8bf";

interface LeaderboardEntry {
  userId: string;
  name: string;
  totalXP: number;
  level: number;
}

export const Leaderboard: React.FC = () => {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const { user } = useAuth() as any;

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const hoverBg = mode === "dark" ? "whiteAlpha.100" : "blackAlpha.50";

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get("/progress/leaderboard");
        setLeaderboard(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Sort by XP descending and take top 3
  const topThree = useMemo(
    () =>
      [...leaderboard]
        .sort((a, b) => b.totalXP - a.totalXP)
        .slice(0, 3),
    [leaderboard]
  );

  // Try to find the current user's entry
  const currentUserEntry = useMemo(() => {
    if (!user || !leaderboard.length) return null;

    const lowerName = (user.name || user.email || "").toLowerCase();

    return (
      leaderboard.find(
        (e) =>
          e.userId === user.id ||
          e.userId === user.userId ||
          e.name?.toLowerCase() === lowerName
      ) || null
    );
  }, [user, leaderboard]);

  const getRankIcon = (rank: number) => {
    const size = 4; // smaller icons
    switch (rank) {
      case 1:
        return <Icon as={Trophy} color="yellow.400" boxSize={size} />;
      case 2:
        return <Icon as={Medal} color="gray.400" boxSize={size} />;
      case 3:
        return <Icon as={Medal} color="orange.500" boxSize={size} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <Text>{t("leaderboard.loading", "Loading...")}</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch" w="full">
      <Card bg="bg.surface" borderColor={GOLD} borderWidth="1px">
        <CardBody>
          <Heading size="md" mb={4}>
            <HStack spacing={2} align="center">
              <Icon as={Trophy} boxSize={4} color={GOLD} />
              <Text>
                {t("leaderboard.title", "Leaderboard")}
              </Text>
            </HStack>
          </Heading>

          {topThree.length === 0 ? (
            <Text textAlign="center" py={8}>
              {t("leaderboard.no_data", "No data available yet")}
            </Text>
          ) : (
            <VStack spacing={2} align="stretch">
              {topThree.map((entry, index) => (
                <HStack
                  key={entry.userId}
                  justify="space-between"
                  px={3}
                  py={2}
                  borderRadius="md"
                  _hover={{ bg: hoverBg }}
                >
                  <HStack spacing={3}>
                    {getRankIcon(index + 1)}
                    <Text fontWeight={index === 0 ? "bold" : "semibold"}>
                      {entry.name}
                    </Text>
                  </HStack>
                  <HStack spacing={4}>
                    <Text fontSize="sm">
                      {t("leaderboard.level_short", "Lvl")} {entry.level}
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      {entry.totalXP.toLocaleString()} XP
                    </Text>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          )}

          {currentUserEntry && (
            <Box
              mt={5}
              pt={3}
              borderTop="1px solid"
              borderColor={mode === "dark" ? "whiteAlpha.200" : "blackAlpha.100"}
            >
              <Text
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="widest"
                mb={2}
                color="gray.400"
              >
                {t("leaderboard.you_section", "Your stats")}
              </Text>
              <HStack
                justify="space-between"
                px={3}
                py={2}
                borderRadius="md"
                bg={mode === "dark" ? "whiteAlpha.100" : "blackAlpha.50"}
              >
                <HStack spacing={2}>
                  <Badge colorScheme="teal" fontSize="0.65rem">
                    {t("leaderboard.you", "You")}
                  </Badge>
                  <Text fontWeight="semibold">{currentUserEntry.name}</Text>
                </HStack>
                <HStack spacing={4}>
                  <Text fontSize="sm">
                    {t("leaderboard.level_short", "Lvl")} {currentUserEntry.level}
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    {currentUserEntry.totalXP.toLocaleString()} XP
                  </Text>
                </HStack>
              </HStack>
            </Box>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
};

export default Leaderboard;
