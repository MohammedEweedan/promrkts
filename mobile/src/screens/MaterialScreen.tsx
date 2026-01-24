import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components';
import api from '../api/client';
import { getMyPurchases } from '../services/purchasePolling';

type CourseTier = {
  id: string;
  name: string;
  description: string;
  price_usdt: number;
  price_stripe: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  rating?: number;
  reviewsCount?: number;
  isVipProduct?: boolean;
  productType?: string;
  challengePlatform?: string | null;
};

type TabType = 'all' | 'courses' | 'challenges' | 'subscriptions';

type Props = {
  embedded?: boolean;
};

export default function MaterialScreen({ embedded = false }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [tiers, setTiers] = useState<CourseTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTiers = async () => {
    try {
      const [purchases, challengesResp, coursesResp, subsResp] = await Promise.all([
        getMyPurchases().catch(() => []),
        api.get('/challenges').catch(() => ({ data: [] })),
        api.get('/courses').catch(() => ({ data: [] })),
        api.get('/subscriptions').catch(() => ({ data: [] })),
      ]);

      const purchasedTierIds = new Set<string>(
        (purchases as any[])
          .filter((p: any) => p?.status === 'CONFIRMED')
          .map((p: any) => String(p?.tierId))
      );
      
      const challenges = Array.isArray(challengesResp.data) ? challengesResp.data : [];
      const courses = Array.isArray(coursesResp.data) ? coursesResp.data : [];
      const subs = Array.isArray(subsResp.data) ? subsResp.data : [];

      const ownedChallenges = challenges
        .filter((c: any) => purchasedTierIds.has(String(c?.id)))
        .map((c: any) => ({ ...c, productType: 'CHALLENGE' }));

      const ownedCourses = courses
        .filter((c: any) => purchasedTierIds.has(String(c?.id)))
        .map((c: any) => ({ ...c, productType: 'COURSE' }));

      const ownedSubs = subs
        .filter((s: any) => purchasedTierIds.has(String(s?.id)))
        .map((s: any) => ({ ...s, productType: 'SUBSCRIPTION' }));

      const ownedOnly = [...ownedChallenges, ...ownedCourses, ...ownedSubs];

      setTiers(ownedOnly);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTiers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTiers();
    setRefreshing(false);
  };

  const isVip = (tier: CourseTier) => {
    const v: any = tier?.isVipProduct;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v === 1;
    if (typeof v === 'string') return v.toLowerCase() === 'true';
    return false;
  };

  const filteredTiers = React.useMemo(() => {
    if (activeTab === 'all') return tiers;
    if (activeTab === 'courses') {
      return tiers.filter(t => String(t.productType || '').toUpperCase() === 'COURSE');
    }
    if (activeTab === 'challenges') {
      return tiers.filter(t => String(t.productType || '').toUpperCase() === 'CHALLENGE');
    }
    if (activeTab === 'subscriptions') {
      return tiers.filter(t => String(t.productType || '').toUpperCase() === 'SUBSCRIPTION');
    }
    return tiers;
  }, [tiers, activeTab]);

  const groupedTiers = React.useMemo(() => {
    const courses = tiers.filter(t => String(t.productType || '').toUpperCase() === 'COURSE');
    const challenges = tiers.filter(t => String(t.productType || '').toUpperCase() === 'CHALLENGE');
    const subscriptions = tiers.filter(t => String(t.productType || '').toUpperCase() === 'SUBSCRIPTION');
    return { courses, challenges, subscriptions };
  }, [tiers]);

  const getTypeMeta = (tier: CourseTier) => {
    const type = String(tier.productType || '').toUpperCase();
    if (type === 'CHALLENGE') return { icon: 'trophy', label: 'Challenges' };
    if (type === 'SUBSCRIPTION') return { icon: 'people', label: 'Communities' };
    return { icon: 'school', label: 'Courses' };
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return colors.success;
      case 'INTERMEDIATE': return colors.warning;
      case 'ADVANCED': return colors.error;
      default: return colors.textMuted;
    }
  };

  const renderTierCard = ({ item }: { item: CourseTier }) => (
    <TouchableOpacity
      style={[styles.tierCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      onPress={() => {
        navigation.navigate('ProductDetail', { productId: item.id });
      }}
    >
      <View style={styles.tierHeader}>
        <View style={styles.tierTitleRow}>
          <View style={styles.tierTitleLeft}>
            <View style={[styles.typeIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name={getTypeMeta(item).icon as any} size={18} color={colors.primary} />
            </View>
            <Text style={[styles.tierTitle, { color: colors.text }]} numberOfLines={2}>
              {item.name}
            </Text>
          </View>
          {isVip(item) && (
            <View style={[styles.vipBadge, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="star" size={12} color={colors.primary} />
              <Text style={[styles.vipText, { color: colors.primary }]}>VIP</Text>
            </View>
          )}
        </View>
        
        {item.level && (
          <View style={[styles.levelBadge, { backgroundColor: getLevelColor(item.level) + '20' }]}>
            <Text style={[styles.levelText, { color: getLevelColor(item.level) }]}>
              {item.level}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.tierDescription, { color: colors.textMuted }]} numberOfLines={3}>
        {item.description}
      </Text>

      <View style={styles.tierFooter}>
        <View style={styles.priceContainer}>
          <Ionicons name="logo-bitcoin" size={16} color={colors.primary} />
          <Text style={[styles.priceText, { color: colors.primary }]}>
            ${item.price_usdt} USDT
          </Text>
          {String(item.productType || '').toUpperCase() === 'SUBSCRIPTION' && (
            <Text style={[styles.perMonthText, { color: colors.textMuted }]}>per month</Text>
          )}
        </View>

        {item.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={[styles.ratingText, { color: colors.text }]}>
              {item.rating.toFixed(1)}
            </Text>
            {item.reviewsCount && (
              <Text style={[styles.reviewsText, { color: colors.textMuted }]}>
                ({item.reviewsCount})
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.enrollButton, { backgroundColor: colors.primary, flex: 1 }]}
          onPress={() => navigation.navigate('CourseContent', { courseId: item.id })}
        >
          <Text style={styles.enrollButtonText}>{t('store.open') || 'Open'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.detailButton, { borderColor: colors.primary, flex: 1 }]}
          onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        >
          <Text style={[styles.detailButtonText, { color: colors.primary }]}>{t('store.view_details')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const tabs = [
    { key: 'all', label: t('common.all') || 'All', icon: 'grid' },
    { key: 'courses', label: t('library.courses') || 'Courses', icon: 'school' },
    { key: 'challenges', label: t('library.challenges') || 'Challenges', icon: 'trophy' },
    { key: 'subscriptions', label: t('library.communities') || 'Communities', icon: 'people' },
  ];

  const Wrapper: any = embedded ? View : SafeAreaView;
  const wrapperProps = embedded
    ? { style: [styles.container, { backgroundColor: colors.background }] }
    : { style: [styles.container, { backgroundColor: colors.background }], edges: ['left', 'right'] };

  return (
    <Wrapper {...wrapperProps}>
      {!embedded && <Header />}
      <View style={styles.content}>
        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                { borderColor: colors.border },
                activeTab === tab.key && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setActiveTab(tab.key as TabType)}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.key ? '#fff' : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? '#fff' : colors.textMuted },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle" size={64} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={loadTiers}
            >
              <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : activeTab === 'all' ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {groupedTiers.courses.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('library.courses') || 'Courses'}</Text>
                {groupedTiers.courses.map((c) => renderTierCard({ item: c }))}
              </View>
            )}
            {groupedTiers.challenges.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('library.challenges') || 'Challenges'}</Text>
                {groupedTiers.challenges.map((c) => renderTierCard({ item: c }))}
              </View>
            )}
            {groupedTiers.subscriptions.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('library.communities') || 'Communities'}</Text>
                {groupedTiers.subscriptions.map((s) => renderTierCard({ item: s }))}
              </View>
            )}

            {tiers.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="library-outline" size={64} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {t('library.empty_title') || 'No materials yet'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                  {t('library.empty_subtitle') || 'Your purchased content will appear here'}
                </Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <FlatList
            data={filteredTiers}
            renderItem={renderTierCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="library-outline" size={64} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {t('library.empty_title') || 'Nothing here yet'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                  {t('library.empty_subtitle') || 'Your purchased content will appear here'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabsContainer: {
    maxHeight: 60,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  tierCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  tierHeader: {
    marginBottom: 12,
  },
  tierTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tierTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    gap: 10,
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  vipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tierDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tierFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  perMonthText: {
    fontSize: 12,
    marginLeft: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  enrollButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  detailButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  detailButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  storeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  storeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
