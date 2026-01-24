import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../api/client';
import { Header } from '../components';

const { width } = Dimensions.get('window');

type Widget = {
  id: string;
  kind: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

type Workspace = {
  id: string;
  name: string;
  isDefault: boolean;
};

type WidgetProps = {
  widget: Widget;
  colors: any;
};

const WidgetCard = ({ widget, colors }: WidgetProps) => {
  const getWidgetContent = () => {
    switch (widget.kind) {
      case 'welcome':
        return (
          <View style={styles.widgetContent}>
            <Ionicons name="hand-right" size={32} color={colors.primary} />
            <Text style={[styles.widgetTitle, { color: colors.text }]}>Welcome!</Text>
            <Text style={[styles.widgetSubtitle, { color: colors.textMuted }]}>
              Start your trading journey
            </Text>
          </View>
        );
      case 'market-overview':
        return (
          <View style={styles.widgetContent}>
            <Ionicons name="trending-up" size={32} color={colors.success} />
            <Text style={[styles.widgetTitle, { color: colors.text }]}>Markets</Text>
            <Text style={[styles.widgetSubtitle, { color: colors.textMuted }]}>
              Live market data
            </Text>
          </View>
        );
      case 'economic-calendar':
        return (
          <View style={styles.widgetContent}>
            <Ionicons name="calendar" size={32} color={colors.warning} />
            <Text style={[styles.widgetTitle, { color: colors.text }]}>Calendar</Text>
            <Text style={[styles.widgetSubtitle, { color: colors.textMuted }]}>
              Economic events
            </Text>
          </View>
        );
      case 'tvForexHeatmap':
        return (
          <View style={styles.widgetContent}>
            <Ionicons name="grid" size={32} color={colors.primary} />
            <Text style={[styles.widgetTitle, { color: colors.text }]}>Forex Heatmap</Text>
            <Text style={[styles.widgetSubtitle, { color: colors.textMuted }]}>
              Currency strength
            </Text>
          </View>
        );
      case 'tvCryptoHeatmap':
        return (
          <View style={styles.widgetContent}>
            <Ionicons name="logo-bitcoin" size={32} color={colors.warning} />
            <Text style={[styles.widgetTitle, { color: colors.text }]}>Crypto Heatmap</Text>
            <Text style={[styles.widgetSubtitle, { color: colors.textMuted }]}>
              Crypto performance
            </Text>
          </View>
        );
      case 'tvTickerTape':
        return (
          <View style={styles.widgetContent}>
            <Ionicons name="pulse" size={32} color={colors.info} />
            <Text style={[styles.widgetTitle, { color: colors.text }]}>Ticker Tape</Text>
            <Text style={[styles.widgetSubtitle, { color: colors.textMuted }]}>
              Live prices
            </Text>
          </View>
        );
      default:
        return (
          <View style={styles.widgetContent}>
            <Ionicons name="cube" size={32} color={colors.textMuted} />
            <Text style={[styles.widgetTitle, { color: colors.text }]}>{widget.kind}</Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.widgetCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {getWidgetContent()}
    </View>
  );
};

type Props = {
  navigation: any;
};

export default function DashboardScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!isAuthenticated) {
      setWidgets([
        { id: 'welcome', kind: 'welcome', x: 0, y: 0, w: 6, h: 4 },
        { id: 'markets', kind: 'market-overview', x: 6, y: 0, w: 6, h: 8 },
        { id: 'calendar', kind: 'economic-calendar', x: 0, y: 4, w: 6, h: 8 },
      ]);
      setLoading(false);
      return;
    }

    try {
      const response = await dashboardAPI.getWorkspaces();
      const { workspaces: ws } = response.data;
      setWorkspaces(ws);
      
      const defaultWs = ws.find((w: Workspace) => w.isDefault) || ws[0];
      if (defaultWs) {
        setActiveWorkspace(defaultWs);
        const layoutResponse = await dashboardAPI.getWorkspaceLayout(defaultWs.id);
        const layout = layoutResponse.data?.layout;
        if (layout?.widgets) {
          setWidgets(layout.widgets);
        }
      }
    } catch (error) {
      console.log('Failed to load dashboard:', error);
      // Use default widgets on error
      setWidgets([
        { id: 'welcome', kind: 'welcome', x: 0, y: 0, w: 6, h: 4 },
        { id: 'markets', kind: 'market-overview', x: 6, y: 0, w: 6, h: 8 },
      ]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }, [loadDashboard]);

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <Header 
          showSettings 
          onSettingsPress={handleSettingsPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <Header 
        showSettings 
        onSettingsPress={handleSettingsPress}
      />
      
      {activeWorkspace && workspaces.length > 1 && (
        <View style={styles.workspaceSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {workspaces.map((ws) => (
              <TouchableOpacity
                key={ws.id}
                style={[
                  styles.workspaceTab,
                  ws.id === activeWorkspace.id && { backgroundColor: colors.primary + '20' },
                ]}
                onPress={async () => {
                  setActiveWorkspace(ws);
                  try {
                    const layoutResponse = await dashboardAPI.getWorkspaceLayout(ws.id);
                    const layout = layoutResponse.data?.layout;
                    if (layout?.widgets) {
                      setWidgets(layout.widgets);
                    }
                  } catch (e) {
                    console.log('Failed to load workspace layout:', e);
                  }
                }}
              >
                <Text
                  style={[
                    styles.workspaceTabText,
                    { color: ws.id === activeWorkspace.id ? colors.primary : colors.textMuted },
                  ]}
                >
                  {ws.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.widgetsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {widgets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="grid-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t('dashboard.empty_title')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {t('dashboard.empty_subtitle')}
            </Text>
          </View>
        ) : (
          widgets.map((widget) => (
            <WidgetCard key={widget.id} widget={widget} colors={colors} />
          ))
        )}
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
  },
  workspaceSelector: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  workspaceTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  workspaceTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  widgetsContainer: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  widgetCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    minHeight: 120,
  },
  widgetContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  widgetSubtitle: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
