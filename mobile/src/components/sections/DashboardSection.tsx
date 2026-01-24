import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { useNavigation } from '@react-navigation/native';
import { getMyPurchases } from '../../services/purchasePolling';
import TradingViewWidget from '../widgets/TradingViewWidget';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Purchase = {
  id: string;
  tierId: string;
  status: string;
  createdAt?: string;
  tier?: any;
};

type DashboardWidgetType = 
  | 'advanced-chart'
  | 'ticker-tape'
  | 'mini-chart'
  | 'market-overview'
  | 'screener'
  | 'crypto-screener'
  | 'hotlists'
  | 'economic-calendar'
  | 'stock-heatmap'
  | 'crypto-heatmap'
  | 'forex-heatmap'
  | 'technical-analysis'
  | 'symbol-info'
  | 'courses';

type WidgetConfig = {
  id: string;
  type: DashboardWidgetType;
  title: string;
  symbol?: string;
  height?: number;
  visible: boolean;
};

type Props = {
  refreshing: boolean;
  onRefresh: () => void;
};

const WIDGET_STORAGE_KEY = '@dashboard_widgets';
const WIDGET_PAIRS_KEY = '@dashboard_widget_pairs';

const AVAILABLE_WIDGETS: Omit<WidgetConfig, 'visible'>[] = [
  { id: 'advanced-chart', type: 'advanced-chart', title: 'Advanced Chart', symbol: 'BINANCE:BTCUSDT' },
  { id: 'btc-mini', type: 'mini-chart', title: 'Bitcoin Mini Chart', symbol: 'BINANCE:BTCUSDT' },
  { id: 'eth-mini', type: 'mini-chart', title: 'Ethereum Mini Chart', symbol: 'BINANCE:ETHUSDT' },
  { id: 'market-overview', type: 'market-overview', title: 'Market Overview' },
  { id: 'screener', type: 'screener', title: 'Stock Screener' },
  { id: 'crypto-screener', type: 'crypto-screener', title: 'Crypto Screener' },
  { id: 'hotlists', type: 'hotlists', title: 'Trending Assets' },
  { id: 'economic-calendar', type: 'economic-calendar', title: 'Economic Calendar' },
  { id: 'stock-heatmap', type: 'stock-heatmap', title: 'Stock Heatmap' },
  { id: 'crypto-heatmap', type: 'crypto-heatmap', title: 'Crypto Heatmap' },
  { id: 'forex-heatmap', type: 'forex-heatmap', title: 'Forex Heatmap' },
  { id: 'technical-analysis', type: 'technical-analysis', title: 'Technical Analysis', symbol: 'BINANCE:BTCUSDT' },
  { id: 'symbol-info', type: 'symbol-info', title: 'Symbol Info', symbol: 'BINANCE:BTCUSDT' },
  { id: 'courses', type: 'courses', title: 'My Courses' },
];

const DEFAULT_WIDGET_IDS = ['advanced-chart', 'market-overview', 'forex-heatmap', 'stock-heatmap', 'crypto-heatmap', 'technical-analysis'];

export default function DashboardSection({ refreshing, onRefresh }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [activeWidgetIds, setActiveWidgetIds] = useState<string[]>(DEFAULT_WIDGET_IDS);
  const [widgetPairs, setWidgetPairs] = useState<Record<string, string>>({});
  const [fullscreenWidget, setFullscreenWidget] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [purchasesData, coursesResp, subsResp] = await Promise.all([
        getMyPurchases(),
        api.get('/courses').catch(() => ({ data: [] })),
        api.get('/subscriptions').catch(() => ({ data: [] })),
      ]);

      setPurchases(purchasesData);
      const allTiers = [
        ...(Array.isArray(coursesResp.data) ? coursesResp.data : []),
        ...(Array.isArray(subsResp.data) ? subsResp.data : []),
      ];
      setTiers(allTiers);

      try {
        const savedWidgets = await AsyncStorage.getItem(WIDGET_STORAGE_KEY);
        const savedPairs = await AsyncStorage.getItem(WIDGET_PAIRS_KEY);
        
        if (savedWidgets) {
          setActiveWidgetIds(JSON.parse(savedWidgets));
        }
        if (savedPairs) {
          setWidgetPairs(JSON.parse(savedPairs));
        }
      } catch (storageError) {
        console.log('Storage error:', storageError);
      }
    } catch (error) {
      console.log('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const confirmedPurchases = purchases.filter(p => p.status === 'CONFIRMED');
  const enrolledTierIds = new Set(confirmedPurchases.map(p => p.tierId));
  const enrolledTiers = tiers.filter(t => enrolledTierIds.has(t.id));

  const toggleWidget = async (widgetId: string) => {
    const newIds = activeWidgetIds.includes(widgetId)
      ? activeWidgetIds.filter(id => id !== widgetId)
      : [...activeWidgetIds, widgetId];
    
    setActiveWidgetIds(newIds);
    try {
      await AsyncStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(newIds));
    } catch (error) {
      console.error('Failed to save widgets:', error);
    }
  };

  const handlePairChange = async (widgetId: string, newSymbol: string) => {
    const newPairs = { ...widgetPairs, [widgetId]: newSymbol };
    setWidgetPairs(newPairs);
    await AsyncStorage.setItem(WIDGET_PAIRS_KEY, JSON.stringify(newPairs));
  };

  const getWidgetTitle = (widget: WidgetConfig) => {
    return widget.title;
  };

  const renderWidget = (widgetConfig: WidgetConfig) => {
    const currentSymbol = widgetPairs[widgetConfig.id] || widgetConfig.symbol;
    const isFullscreen = fullscreenWidget === widgetConfig.id;

    const NORMAL_HEADER_ESTIMATE = 56;
    const FULLSCREEN_HEADER_ESTIMATE = 64;
    const normalHeight =
      widgetConfig.type === 'advanced-chart'
        ? Math.max(720, SCREEN_HEIGHT - 180)
        : (widgetConfig.height || 600);

    const fullscreenHeight = Math.max(
      720,
      SCREEN_HEIGHT - insets.top - insets.bottom - FULLSCREEN_HEADER_ESTIMATE
    );

    // Fullscreen modal for TradingView widgets
    if (isFullscreen && widgetConfig.type !== 'courses') {
      return (
        <Modal
          key={widgetConfig.id}
          visible={true}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setFullscreenWidget(null)}
        >
          <View style={[styles.fullscreenContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <View style={[styles.fullscreenHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <Text style={[styles.fullscreenTitle, { color: colors.text }]}>{getWidgetTitle(widgetConfig)}</Text>
              <TouchableOpacity onPress={() => setFullscreenWidget(null)} style={styles.fullscreenClose}>
                <Ionicons name="close-circle" size={40} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <TradingViewWidget 
              type={widgetConfig.type as any}
              symbol={currentSymbol} 
              height={fullscreenHeight}
              allowPairChange={true}
              onPairChange={(newSymbol) => handlePairChange(widgetConfig.id, newSymbol)}
            />
            <View style={{ height: insets.bottom }} />
          </View>
        </Modal>
      );
    }

    switch (widgetConfig.type) {
      case 'advanced-chart':
      case 'mini-chart':
      case 'technical-analysis':
      case 'symbol-info':
        return (
          <View key={widgetConfig.id} style={styles.widgetContainer}>
            <View style={styles.widgetHeader}>
              <Text style={[styles.widgetTitle, { color: colors.text }]}>{getWidgetTitle(widgetConfig)}</Text>
              <View style={styles.widgetActions}>
                <TouchableOpacity 
                  onPress={() => setFullscreenWidget(widgetConfig.id)}
                  style={styles.actionButton}
                >
                  <Ionicons name="expand" size={20} color={colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleWidget(widgetConfig.id)} style={styles.actionButton}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.chartWrapper}>
              <TradingViewWidget 
                type={widgetConfig.type as any}
                symbol={currentSymbol} 
                height={widgetConfig.type === 'advanced-chart' ? (normalHeight - NORMAL_HEADER_ESTIMATE) : widgetConfig.height}
                allowPairChange={true}
                onPairChange={(newSymbol) => handlePairChange(widgetConfig.id, newSymbol)}
              />
            </View>
          </View>
        );

      case 'market-overview':
      case 'screener':
      case 'crypto-screener':
      case 'hotlists':
      case 'economic-calendar':
      case 'stock-heatmap':
      case 'crypto-heatmap':
      case 'forex-heatmap':
        return (
          <View key={widgetConfig.id} style={styles.widgetContainer}>
            <View style={styles.widgetHeader}>
              <Text style={[styles.widgetTitle, { color: colors.text }]}>{getWidgetTitle(widgetConfig)}</Text>
              <View style={styles.widgetActions}>
                <TouchableOpacity 
                  onPress={() => setFullscreenWidget(widgetConfig.id)}
                  style={styles.actionButton}
                >
                  <Ionicons name="expand" size={20} color={colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleWidget(widgetConfig.id)} style={styles.actionButton}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
            <TradingViewWidget 
              type={widgetConfig.type as any}
              height={widgetConfig.height}
            />
          </View>
        );

      case 'courses':
        return (
          <View key={widgetConfig.id} style={styles.widgetContainer}>
            <View style={styles.widgetHeader}>
              <Text style={[styles.widgetTitle, { color: colors.text }]}>My Courses</Text>
              <View style={styles.widgetActions}>
                <TouchableOpacity onPress={() => navigation.navigate('Material')} style={styles.actionButton}>
                  <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleWidget(widgetConfig.id)} style={styles.actionButton}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
            {enrolledTiers.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                <Ionicons name="school-outline" size={40} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  No courses yet
                </Text>
                <TouchableOpacity
                  style={[styles.browseButton, { backgroundColor: colors.primary }]}
                  onPress={() => navigation.navigate('Store')}
                >
                  <Text style={styles.browseButtonText}>Browse Courses</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {enrolledTiers.slice(0, 5).map((tier) => (
                  <TouchableOpacity
                    key={tier.id}
                    style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                    onPress={() => navigation.navigate('Material')}
                  >
                    <View style={[styles.courseIcon, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name="book" size={24} color={colors.primary} />
                    </View>
                    <Text style={[styles.courseName, { color: colors.text }]} numberOfLines={2}>
                      {tier.name || tier.title}
                    </Text>
                    <View style={styles.courseProgress}>
                      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                        <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '30%' }]} />
                      </View>
                      <Text style={[styles.progressText, { color: colors.textMuted }]}>30%</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const activeWidgets = AVAILABLE_WIDGETS
    .filter(w => activeWidgetIds.includes(w.id))
    .map(w => ({ ...w, visible: true }));

  return (
    <View style={[styles.safeContainer, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { onRefresh(); loadDashboard(); }} />
        }
      >
        <View style={[styles.welcomeCard, { backgroundColor: colors.primary }]}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeGreeting}>Welcome back,</Text>
            <Text style={styles.welcomeName}>{user?.name || 'Trader'}</Text>
            <Text style={styles.welcomeSubtitle}>Your personalized trading dashboard</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{enrolledTiers.length}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{activeWidgets.length}</Text>
              <Text style={styles.statLabel}>Widgets</Text>
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => navigation.navigate('Contact')}
          >
            <Ionicons name="chatbubbles" size={20} color={colors.primary} />
            <Text style={[styles.contactButtonText, { color: colors.text }]}>Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addWidgetButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowWidgetPicker(true)}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.addWidgetButtonText}>Add Widget</Text>
          </TouchableOpacity>
        </View>

        {activeWidgets.map(renderWidget)}

        <Modal
          visible={showWidgetPicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowWidgetPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Add Widgets</Text>
                <TouchableOpacity onPress={() => setShowWidgetPicker(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.widgetList}>
                {AVAILABLE_WIDGETS.map((widget) => {
                  const isActive = activeWidgetIds.includes(widget.id);
                  return (
                    <TouchableOpacity
                      key={widget.id}
                      style={[
                        styles.widgetPickerItem,
                        { 
                          backgroundColor: isActive ? colors.primary + '20' : 'transparent',
                          borderBottomColor: colors.border,
                        }
                      ]}
                      onPress={() => toggleWidget(widget.id)}
                    >
                      <View style={styles.widgetPickerLeft}>
                        <Ionicons 
                          name={isActive ? 'checkbox' : 'square-outline'} 
                          size={24} 
                          color={isActive ? colors.primary : colors.textMuted} 
                        />
                        <View style={styles.widgetPickerInfo}>
                          <Text style={[styles.widgetPickerTitle, { color: colors.text }]}>
                            {widget.title}
                          </Text>
                          <Text style={[styles.widgetPickerType, { color: colors.textMuted }]}>
                            {widget.type}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  welcomeCard: {
    marginHorizontal: 16,
    marginTop: 10, // IMPORTANT: kills the "bar" above the card
    marginBottom: 16,
    borderRadius: 20,
    padding: 24,
  },
  welcomeContent: {
    marginBottom: 20,
  },
  welcomeGreeting: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  welcomeName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 4,
  },
  welcomeSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  controls: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  addWidgetButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  addWidgetButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  widgetContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  widgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  widgetActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    marginTop: 12,
    marginBottom: 16,
  },
  browseButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  courseCard: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 12,
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  courseName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    height: 36,
  },
  courseProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  progressText: {
    fontSize: 11,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  widgetList: {
    maxHeight: 500,
  },
  widgetPickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  widgetPickerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  widgetPickerInfo: {
    flex: 1,
  },
  widgetPickerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  widgetPickerType: {
    fontSize: 13,
    marginTop: 2,
  },
  fullscreenContainer: {
    flex: 1,
  },
  fullscreenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  fullscreenTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  fullscreenClose: {
    padding: 4,
  },
  fullscreenWidgetContainer: {
    flex: 1,
  },
  chartWrapper: {
    flex: 1,
  },
});
