import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import api from '../api/client';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type CategoryKey = 'courses' | 'guides' | 'subscriptions' | 'challenges' | 'token';

const HUB_CATEGORIES: { key: CategoryKey; icon: string; label: string; subtitle: string; gradient: [string, string] }[] = [
  { key: 'courses', icon: 'school', label: 'Courses', subtitle: 'Programs & lessons', gradient: ['#3B82F6', '#1D4ED8'] },
  { key: 'guides', icon: 'book', label: 'Guides', subtitle: 'Playbooks & PDFs', gradient: ['#10B981', '#059669'] },
  { key: 'subscriptions', icon: 'people', label: 'Communities', subtitle: 'Subscriptions', gradient: ['#8B5CF6', '#7C3AED'] },
  { key: 'token', icon: 'logo-bitcoin', label: 'PMKX', subtitle: 'Token', gradient: ['#111827', '#000000'] },
  { key: 'challenges', icon: 'trophy', label: 'Challenges', subtitle: 'Compete & win', gradient: ['#F59E0B', '#D97706'] },
];

export default function HubLearningScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let mounted = true;
    const loadCounts = async () => {
      try {
        const [challengesResp, coursesResp, subsResp] = await Promise.all([
          api.get('/challenges').catch(() => ({ data: [] })),
          api.get('/courses').catch(() => ({ data: [] })),
          api.get('/subscriptions').catch(() => ({ data: [] })),
        ]);

        const challenges = Array.isArray(challengesResp.data) ? challengesResp.data : [];
        const courses = Array.isArray(coursesResp.data) ? coursesResp.data : [];
        const subs = Array.isArray(subsResp.data) ? subsResp.data : [];

        if (!mounted) return;
        setCounts({
          courses: courses.length,
          guides: 0,
          subscriptions: subs.length,
          challenges: challenges.length,
          token: 0,
        });
      } catch {
        if (!mounted) return;
        setCounts({});
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCounts();
    return () => {
      mounted = false;
    };
  }, []);

  const openCategory = (key: CategoryKey) => {
    if (key === 'token') {
      // If/when you add a Token screen, change this to navigation.navigate('Token')
      navigation.navigate('Store');
      return;
    }

    navigation.navigate('Store', { initialCategory: key === 'subscriptions' ? 'subscriptions' : key });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>{t('store.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('store.browse')}</Text>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.grid}>
          {HUB_CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.key} style={styles.card} activeOpacity={0.9} onPress={() => openCategory(cat.key)}>
              <LinearGradient colors={cat.gradient} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name={cat.icon as any} size={36} color="#fff" />
                <Text style={styles.cardLabel}>{t(`store.${cat.key}`) || cat.label}</Text>
                <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
                <Text style={styles.cardCount}>{(counts[cat.key] ?? 0)} {t('common.items')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 16,
    fontSize: 14,
  },
  loading: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 18,
    justifyContent: 'flex-end',
  },
  cardLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
  },
  cardCount: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 8,
  },
});
