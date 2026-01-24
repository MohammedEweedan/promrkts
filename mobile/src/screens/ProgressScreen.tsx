import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components';
import { progressAPI, badgesAPI } from '../api/client';

type Badge = {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  required?: number;
};

type ProgressOverview = {
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  streak: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  videosWatched: number;
  pdfsViewed: number;
  totalTimeSpent: number;
};

const RARITY_COLORS = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

export default function ProgressScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState<ProgressOverview | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'leaderboard'>('overview');

  const fetchData = useCallback(async () => {
    try {
      const [progressRes, badgesRes, leaderboardRes] = await Promise.all([
        progressAPI.getOverview(),
        badgesAPI.getProgress(),
        progressAPI.getLeaderboard(),
      ]);

      setProgress(progressRes.data);
      setBadges(badgesRes.data || []);
      setLeaderboard(leaderboardRes.data || []);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const renderXPBar = () => {
    if (!progress) return null;
    const xpProgress = progress.xpToNextLevel > 0 
      ? ((progress.totalXP % 1000) / 1000) * 100 
      : 100;

    return (
      <View style={[styles.xpCard, { backgroundColor: colors.card }]}>
        <View style={styles.xpHeader}>
          <View style={styles.levelBadge}>
            <Text style={[styles.levelText, { color: colors.primary }]}>
              {progress.level}
            </Text>
          </View>
          <View style={styles.xpInfo}>
            <Text style={[styles.xpTitle, { color: colors.text }]}>
              Level {progress.level}
            </Text>
            <Text style={[styles.xpSubtitle, { color: colors.textMuted }]}>
              {progress.totalXP.toLocaleString()} XP Total
            </Text>
          </View>
          <View style={styles.streakContainer}>
            <Ionicons name="flame" size={24} color="#F59E0B" />
            <Text style={[styles.streakText, { color: colors.text }]}>
              {progress.streak}
            </Text>
          </View>
        </View>
        <View style={[styles.xpBarContainer, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.xpBarFill, 
              { width: `${xpProgress}%`, backgroundColor: colors.primary }
            ]} 
          />
        </View>
        <Text style={[styles.xpToNext, { color: colors.textMuted }]}>
          {progress.xpToNextLevel} XP to Level {progress.level + 1}
        </Text>
      </View>
    );
  };

  const renderStats = () => {
    if (!progress) return null;

    const stats = [
      { icon: 'school', label: 'Courses', value: progress.coursesCompleted },
      { icon: 'checkmark-circle', label: 'Lessons', value: progress.lessonsCompleted },
      { icon: 'play-circle', label: 'Videos', value: progress.videosWatched },
      { icon: 'document-text', label: 'PDFs', value: progress.pdfsViewed },
    ];

    return (
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View 
            key={stat.label} 
            style={[styles.statCard, { backgroundColor: colors.card }]}
          >
            <Ionicons name={stat.icon as any} size={28} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderBadges = () => {
    const unlockedBadges = badges.filter(b => b.isUnlocked);
    const lockedBadges = badges.filter(b => !b.isUnlocked);

    return (
      <View style={styles.badgesContainer}>
        {unlockedBadges.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('progress.unlocked')} ({unlockedBadges.length})
            </Text>
            <View style={styles.badgesGrid}>
              {unlockedBadges.map((badge) => (
                <View 
                  key={badge.id} 
                  style={[
                    styles.badgeCard, 
                    { 
                      backgroundColor: colors.card,
                      borderColor: RARITY_COLORS[badge.rarity],
                      borderWidth: 2,
                    }
                  ]}
                >
                  <View style={[styles.badgeIcon, { backgroundColor: RARITY_COLORS[badge.rarity] + '20' }]}>
                    {badge.iconUrl ? (
                      <Image source={{ uri: badge.iconUrl }} style={styles.badgeImage} />
                    ) : (
                      <Ionicons name="trophy" size={32} color={RARITY_COLORS[badge.rarity]} />
                    )}
                  </View>
                  <Text style={[styles.badgeName, { color: colors.text }]} numberOfLines={1}>
                    {badge.name}
                  </Text>
                  <Text style={[styles.badgeRarity, { color: RARITY_COLORS[badge.rarity] }]}>
                    {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {lockedBadges.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
              {t('progress.locked')} ({lockedBadges.length})
            </Text>
            <View style={styles.badgesGrid}>
              {lockedBadges.map((badge) => (
                <View 
                  key={badge.id} 
                  style={[styles.badgeCard, { backgroundColor: colors.card, opacity: 0.6 }]}
                >
                  <View style={[styles.badgeIcon, { backgroundColor: colors.border }]}>
                    <Ionicons name="lock-closed" size={32} color={colors.textMuted} />
                  </View>
                  <Text style={[styles.badgeName, { color: colors.textMuted }]} numberOfLines={1}>
                    {badge.name}
                  </Text>
                  {badge.progress !== undefined && badge.required !== undefined && (
                    <View style={styles.badgeProgressContainer}>
                      <View style={[styles.badgeProgressBar, { backgroundColor: colors.border }]}>
                        <View 
                          style={[
                            styles.badgeProgressFill, 
                            { 
                              width: `${Math.min((badge.progress / badge.required) * 100, 100)}%`,
                              backgroundColor: colors.primary 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.badgeProgressText, { color: colors.textMuted }]}>
                        {badge.progress}/{badge.required}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    );
  };

  const renderLeaderboard = () => {
    return (
      <View style={styles.leaderboardContainer}>
        {leaderboard.map((entry, index) => (
          <View 
            key={entry.userId || index} 
            style={[
              styles.leaderboardRow, 
              { 
                backgroundColor: colors.card,
                borderLeftColor: index < 3 ? ['#F59E0B', '#9CA3AF', '#CD7F32'][index] : 'transparent',
                borderLeftWidth: index < 3 ? 4 : 0,
              }
            ]}
          >
            <View style={styles.leaderboardRank}>
              {index < 3 ? (
                <Ionicons 
                  name="trophy" 
                  size={24} 
                  color={['#F59E0B', '#9CA3AF', '#CD7F32'][index]} 
                />
              ) : (
                <Text style={[styles.rankNumber, { color: colors.textMuted }]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <View style={styles.leaderboardUser}>
              <Text style={[styles.leaderboardName, { color: colors.text }]}>
                {entry.userName || entry.name || entry.user?.name || 'Anonymous'}
              </Text>
              <Text style={[styles.leaderboardLevel, { color: colors.textMuted }]}>
                {t('progress.level')} {entry.level || 1}
              </Text>
            </View>
            <Text style={[styles.leaderboardXP, { color: colors.primary }]}>
              {(entry.totalXP || 0).toLocaleString()} XP
            </Text>
          </View>
        ))}
        {leaderboard.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="podium-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t('progress.no_leaderboard')}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header showBack onBackPress={() => navigation.goBack()} />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('progress.title') || 'Progress'}</Text>
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
        {(['overview', 'badges', 'leaderboard'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === tab ? colors.primary : colors.textMuted }
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && (
          <>
            {renderXPBar()}
            {renderStats()}
          </>
        )}
        {activeTab === 'badges' && renderBadges()}
        {activeTab === 'leaderboard' && renderLeaderboard()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  xpCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 20,
    fontWeight: '700',
  },
  xpInfo: {
    flex: 1,
    marginLeft: 12,
  },
  xpTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  xpSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  xpBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpToNext: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  badgesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  badgeCard: {
    width: '31%',
    marginHorizontal: '1%',
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeImage: {
    width: 40,
    height: 40,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  badgeRarity: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
  badgeProgressContainer: {
    width: '100%',
    marginTop: 8,
  },
  badgeProgressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  badgeProgressFill: {
    height: '100%',
  },
  badgeProgressText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  leaderboardContainer: {
    flex: 1,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  leaderboardRank: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  leaderboardUser: {
    flex: 1,
    marginLeft: 12,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
  },
  leaderboardLevel: {
    fontSize: 12,
    marginTop: 2,
  },
  leaderboardXP: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});
