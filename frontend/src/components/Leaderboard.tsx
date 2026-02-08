import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Badge,
  Icon,
  Progress,
  Avatar,
} from "@chakra-ui/react";
import { Trophy, Medal, Flame } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import { useThemeMode } from "../themeProvider";
import { useAuth } from "../auth/AuthContext";

const ACCENT = "#65a8bf";
const GOLD_COLOR = "#b7a27d";

interface LeaderboardEntry {
  userId: string;
  name: string;
  totalXP: number;
  level: number;
}

const RANK_STYLES: Record<number, { bg: string; border: string; icon: any; iconColor: string; label: string }> = {
  1: { bg: "rgba(255, 215, 0, 0.08)", border: "rgba(255, 215, 0, 0.3)", icon: Trophy, iconColor: "yellow.400", label: "1st" },
  2: { bg: "rgba(192, 192, 192, 0.06)", border: "rgba(192, 192, 192, 0.25)", icon: Medal, iconColor: "gray.400", label: "2nd" },
  3: { bg: "rgba(205, 127, 50, 0.06)", border: "rgba(205, 127, 50, 0.25)", icon: Medal, iconColor: "orange.400", label: "3rd" },
};

export const Leaderboard: React.FC = () => {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const { user } = useAuth() as any;

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Current user rank
  const currentUserRank = useMemo(() => {
    if (!currentUserEntry) return null;
    const sorted = [...leaderboard].sort((a, b) => b.totalXP - a.totalXP);
    const idx = sorted.findIndex((e) => e.userId === currentUserEntry.userId);
    return idx >= 0 ? idx + 1 : null;
  }, [currentUserEntry, leaderboard]);

  // Don't render anything if loading or no data
  if (loading) {
    return (
      <Box p={6}>
        <Text>{t("leaderboard.loading", "Loading...")}</Text>
      </Box>
    );
  }

  // Hide entirely when no leaderboard data
  if (topThree.length === 0) return null;

  const maxXP = topThree[0]?.totalXP || 1;

  return (
    <VStack spacing={4} align="stretch" w="full" maxW="600px" mx="auto">
      <Card
        bg={mode === "dark" ? "rgba(15, 23, 42, 0.6)" : "white"}
        borderColor={ACCENT}
        borderWidth="1px"
        backdropFilter="blur(12px)"
        overflow="hidden"
      >
        <CardBody p={0}>
          {/* Top 3 Podium */}
          <VStack spacing={0} align="stretch">
            {topThree.map((entry, index) => {
              const rank = index + 1;
              const style = RANK_STYLES[rank];
              const xpPercent = Math.max(8, (entry.totalXP / maxXP) * 100);

              return (
                <HStack
                  key={entry.userId}
                  px={5}
                  py={4}
                  spacing={4}
                  bg={style.bg}
                  borderBottom="1px solid"
                  borderColor={mode === "dark" ? "whiteAlpha.50" : "blackAlpha.50"}
                  _hover={{ bg: mode === "dark" ? "whiteAlpha.100" : "blackAlpha.50" }}
                  transition="background 0.2s"
                >
                  {/* Rank */}
                  <Box minW="32px" textAlign="center">
                    <Icon as={style.icon} color={style.iconColor} boxSize={5} />
                  </Box>

                  {/* Avatar */}
                  <Avatar
                    size="sm"
                    name={entry.name}
                    bg={rank === 1 ? "yellow.500" : rank === 2 ? "gray.500" : "orange.500"}
                    color="white"
                    fontSize="xs"
                    fontWeight="bold"
                  />

                  {/* Name + XP bar */}
                  <Box flex={1}>
                    <HStack justify="space-between" mb={1}>
                      <Text
                        fontWeight={rank === 1 ? "bold" : "semibold"}
                        fontSize="sm"
                        noOfLines={1}
                      >
                        {entry.name}
                      </Text>
                      <HStack spacing={2}>
                        <Badge
                          fontSize="0.65rem"
                          colorScheme={rank === 1 ? "yellow" : rank === 2 ? "gray" : "orange"}
                          variant="subtle"
                        >
                          Lvl {entry.level}
                        </Badge>
                        <Text fontSize="xs" fontWeight="bold" color={ACCENT}>
                          {entry.totalXP.toLocaleString()} XP
                        </Text>
                      </HStack>
                    </HStack>
                    <Progress
                      value={xpPercent}
                      size="xs"
                      borderRadius="full"
                      bg={mode === "dark" ? "whiteAlpha.100" : "blackAlpha.100"}
                      sx={{
                        "& > div": {
                          background: rank === 1
                            ? "linear-gradient(90deg, #FFD700, #FFA500)"
                            : rank === 2
                            ? "linear-gradient(90deg, #C0C0C0, #A0A0A0)"
                            : `linear-gradient(90deg, ${ACCENT}, ${GOLD_COLOR})`,
                        },
                      }}
                    />
                  </Box>
                </HStack>
              );
            })}
          </VStack>

          {/* Current user section */}
          {currentUserEntry && !topThree.find((e) => e.userId === currentUserEntry.userId) && (
            <Box
              px={5}
              py={4}
              borderTop="2px solid"
              borderColor={ACCENT}
              bg={mode === "dark" ? "rgba(101, 168, 191, 0.05)" : "blue.50"}
            >
              <HStack spacing={4}>
                <Box minW="32px" textAlign="center">
                  <Text fontSize="sm" fontWeight="bold" color={ACCENT}>
                    #{currentUserRank}
                  </Text>
                </Box>
                <Avatar size="sm" name={currentUserEntry.name} bg={ACCENT} color="white" fontSize="xs" />
                <Box flex={1}>
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <Text fontWeight="semibold" fontSize="sm">{currentUserEntry.name}</Text>
                      <Badge colorScheme="teal" fontSize="0.6rem">{t("leaderboard.you", "You")}</Badge>
                    </HStack>
                    <HStack spacing={2}>
                      <Badge fontSize="0.65rem" variant="subtle">Lvl {currentUserEntry.level}</Badge>
                      <HStack spacing={1}>
                        <Icon as={Flame} boxSize={3} color="orange.400" />
                        <Text fontSize="xs" fontWeight="bold" color={ACCENT}>
                          {currentUserEntry.totalXP.toLocaleString()} XP
                        </Text>
                      </HStack>
                    </HStack>
                  </HStack>
                </Box>
              </HStack>
            </Box>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
};

export default Leaderboard;
