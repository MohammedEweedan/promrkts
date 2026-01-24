import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '../components';
import api from '../api/client';
import { getMyPurchases } from '../services/purchasePolling';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type Category = 'courses' | 'subscriptions' | 'guides' | 'communities' | 'challenges';

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Category;
  image?: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  isPurchased?: boolean;
};

const CATEGORIES: { key: Category; icon: string; label: string; gradient: [string, string] }[] = [
  { key: 'courses', icon: 'school', label: 'Courses', gradient: ['#3B82F6', '#1D4ED8'] },
  { key: 'guides', icon: 'book', label: 'Guides', gradient: ['#10B981', '#059669'] },
  { key: 'subscriptions', icon: 'people', label: 'Communities', gradient: ['#8B5CF6', '#7C3AED'] },
  { key: 'challenges', icon: 'trophy', label: 'Challenges', gradient: ['#F59E0B', '#D97706'] },
];

export default function StoreScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const initial = route?.params?.initialCategory as Category | undefined;
    if (initial) setSelectedCategory(initial);
  }, [route?.params?.initialCategory]);

  const loadProducts = async () => {
    try {
      const [challengesResp, coursesResp, subsResp, purchases] = await Promise.all([
        api.get('/challenges').catch(() => ({ data: [] })),
        api.get('/courses').catch(() => ({ data: [] })),
        api.get('/subscriptions').catch(() => ({ data: [] })),
        getMyPurchases().catch(() => []),
      ]);
      
      const purchasedTierIds = new Set<string>(
        (purchases as any[]).filter((p: any) => p.status === 'CONFIRMED').map((p: any) => p.tierId)
      );
      setPurchasedIds(purchasedTierIds);
      
      const challenges = Array.isArray(challengesResp.data) ? challengesResp.data : [];
      const courses = Array.isArray(coursesResp.data) ? coursesResp.data : [];
      const subs = Array.isArray(subsResp.data) ? subsResp.data : [];
      
      const allProducts: Product[] = [
        ...challenges.map((c: any) => ({
          id: c.id,
          title: c.name,
          description: c.description,
          price: c.price_usdt || 0,
          category: 'challenges' as Category,
          rating: c.rating,
          reviews: c.reviewsCount,
          isPurchased: purchasedTierIds.has(c.id),
        })),
        ...courses.map((c: any) => ({
          id: c.id,
          title: c.name,
          description: c.description,
          price: c.price_usdt || 0,
          category: 'courses' as Category,
          rating: c.rating,
          reviews: c.reviewsCount,
          isPurchased: purchasedTierIds.has(c.id),
        })),
        ...subs.map((s: any) => ({
          id: s.id,
          title: s.name,
          description: s.description,
          price: s.price_usdt || 0,
          category: 'subscriptions' as Category,
          isPurchased: purchasedTierIds.has(s.id),
        })),
      ];
      
      setProducts(allProducts);
    } catch (error) {
      console.log('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const filteredProducts = selectedCategory
    ? products.filter((p: Product) => p.category === selectedCategory)
    : [];

  const getCategoryCount = (cat: Category) => {
    return products.filter(p => p.category === cat).length;
  };

  const renderCategoryCard = (cat: typeof CATEGORIES[0]) => (
    <TouchableOpacity
      key={cat.key}
      style={styles.categoryCard}
      onPress={() => setSelectedCategory(cat.key)}
    >
      <LinearGradient
        colors={cat.gradient as [string, string]}
        style={styles.categoryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={cat.icon as any} size={40} color="#fff" />
        <Text style={styles.categoryLabel}>{cat.label}</Text>
        <Text style={styles.categoryCount}>{getCategoryCount(cat.key)} items</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderProduct = (item: Product) => {
    const isPurchased = item.isPurchased || purchasedIds.has(item.id);
    
    return (
      <View
        key={item.id}
        style={[
          styles.productCard, 
          { 
            backgroundColor: isPurchased ? colors.card + '60' : colors.card, 
            borderColor: colors.cardBorder,
            opacity: isPurchased ? 0.6 : 1,
          }
        ]}
      >
        <View style={[styles.productIcon, { backgroundColor: colors.surface }]}>
          <Ionicons
            name={
              item.category === 'courses' ? 'school' :
              item.category === 'subscriptions' ? 'diamond' :
              item.category === 'communities' ? 'people' :
              item.category === 'guides' ? 'book' : 'trophy'
            }
            size={28}
            color={isPurchased ? colors.textMuted : colors.primary}
          />
        </View>
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={[styles.productTitle, { color: isPurchased ? colors.textMuted : colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            {isPurchased && (
              <View style={[styles.purchasedBadge, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={[styles.purchasedText, { color: colors.success }]}>Owned</Text>
              </View>
            )}
          </View>
          <Text style={[styles.productDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
          {item.rating && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={[styles.ratingText, { color: colors.text }]}>{item.rating}</Text>
              <Text style={[styles.reviewsText, { color: colors.textMuted }]}>
                ({item.reviews} reviews)
              </Text>
            </View>
          )}
          <View style={styles.productFooter}>
            {!isPurchased ? (
              <>
                <View>
                  <Text style={[styles.productPrice, { color: colors.primary }]}>
                    ${item.price}
                  </Text>
                  {item.category === 'subscriptions' && (
                    <Text style={[styles.perMonthText, { color: colors.textMuted }]}>per month</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.buyButton, { backgroundColor: colors.primary }]}
                  onPress={() => navigation.navigate('Checkout', { tierId: item.id })}
                >
                  <Text style={styles.buyButtonText}>{item.category === 'subscriptions' ? 'Subscribe' : 'Buy'}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.purchasedActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                  onPress={() => navigation.navigate('CourseContent', { courseId: item.id })}
                >
                  <Text style={styles.actionBtnText}>{t('store.open')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: colors.primary, borderWidth: 1 }]}
                  onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                >
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>{t('store.view_details')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading store...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show category grid when no category selected
  if (!selectedCategory) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <Header />
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={[styles.pageTitle, { color: colors.text }]}>Store</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
            Browse our products by category
          </Text>
          
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map(renderCategoryCard)}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show products for selected category
  const categoryInfo = CATEGORIES.find(c => c.key === selectedCategory);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <Header />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setSelectedCategory(null)}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Back to Categories</Text>
        </TouchableOpacity>
        
        <View style={styles.categoryHeader}>
          <LinearGradient
            colors={(categoryInfo?.gradient || ['#3B82F6', '#1D4ED8']) as [string, string]}
            style={styles.categoryHeaderIcon}
          >
            <Ionicons name={categoryInfo?.icon as any} size={32} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={[styles.categoryHeaderTitle, { color: colors.text }]}>
              {categoryInfo?.label}
            </Text>
            <Text style={[styles.categoryHeaderCount, { color: colors.textMuted }]}>
              {filteredProducts.length} products available
            </Text>
          </View>
        </View>

        <View style={styles.productsSection}>
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No products in this category yet
              </Text>
            </View>
          ) : (
            filteredProducts.map(renderProduct)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 15,
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoryCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  categoryLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  categoryCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  categoryHeaderIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  categoryHeaderCount: {
    fontSize: 14,
    marginTop: 2,
  },
  productsSection: {
    gap: 12,
  },
  productCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  productIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 14,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  purchasedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  purchasedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 12,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  buyButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
  },
  perMonthText: {
    fontSize: 12,
    marginTop: 2,
  },
  purchasedActions: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
