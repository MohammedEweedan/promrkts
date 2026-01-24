import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '../components';
import api from '../api/client';

export default function ProductDetailScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const productId = route.params?.productId;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      let productResp: any = { data: null };
      if (productId) {
        productResp = await api.get(`/courses/${productId}`).catch(async () => {
          return await api.get(`/subscriptions/${productId}`).catch(async () => {
            return await api.get(`/challenges/${productId}`).catch(() => ({ data: null }));
          });
        });
      }
      setProduct(productResp.data);
    } catch (error) {
      console.log('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <Header showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <Header showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{t('store.no_courses')}</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <Header showBack onBackPress={() => navigation.goBack()} />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Product Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="school" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{product.name}</Text>
          <Text style={[styles.price, { color: colors.primary }]}>${product.price_usdt} USDT</Text>
        </View>

        {/* Description */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('store.view_details')}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {product.description}
          </Text>
        </View>

        {/* Level */}
        {product.level && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('progress.level')}</Text>
            <View style={[styles.levelBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.levelText, { color: colors.primary }]}>{product.level}</Text>
            </View>
          </View>
        )}

        {/* Features */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('store.featured')}</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                {t('store.courses')}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                {t('account.achievements')}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                {t('community.title')}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                {t('store.new')}
              </Text>
            </View>
          </View>
        </View>

        {/* Buy Button */}
        <TouchableOpacity
          style={[styles.buyButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Checkout', { tierId: product.id })}
        >
          <Ionicons name="cart" size={20} color="#fff" />
          <Text style={styles.buyButtonText}>{t('store.buy_now')} - ${product.price_usdt}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 10,
    marginTop: 8,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
