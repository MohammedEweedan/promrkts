import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components';

const { width } = Dimensions.get('window');

const TELEGRAM_URL = 'https://t.me/promrkts';
const DISCORD_INVITE_URL = 'https://discord.gg/promrkts';
const DISCORD_WIDGET_SERVER_ID = '1447879971946102847';

type TabType = 'telegram' | 'discord';

export default function CommunityScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('telegram');

  const openTelegram = () => {
    Linking.openURL(TELEGRAM_URL);
  };

  const openDiscord = () => {
    Linking.openURL(DISCORD_INVITE_URL);
  };

  const renderTelegramTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.widgetCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.widgetHeader}>
          <View style={[styles.iconContainer, { backgroundColor: '#0088CC' }]}>
            <Ionicons name="send" size={24} color="#fff" />
          </View>
          <View style={styles.widgetInfo}>
            <Text style={[styles.widgetTitle, { color: colors.text }]}>
              {t('community.telegram')}
            </Text>
            <Text style={[styles.widgetSubtitle, { color: colors.textSecondary }]}>
              {t('community.join_telegram')}
            </Text>
          </View>
        </View>

        <View style={[styles.statsRow, { borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>2.5K+</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success }]}>Active</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Status</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>24/7</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Support</Text>
          </View>
        </View>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Real-time trading signals
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Market analysis & news
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Community discussions
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.openButton, { backgroundColor: '#0088CC' }]}
          onPress={openTelegram}
        >
          <Ionicons name="send" size={20} color="#fff" />
          <Text style={styles.openButtonText}>{t('community.open_telegram')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.embedContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.embedTitle, { color: colors.text }]}>Live Feed Preview</Text>
        <WebView
          source={{ uri: `https://t.me/promrkts?embed=1&mode=tme` }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          scalesPageToFit
        />
      </View>
    </View>
  );

  const renderDiscordTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.widgetCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.widgetHeader}>
          <View style={[styles.iconContainer, { backgroundColor: '#5865F2' }]}>
            <Ionicons name="logo-discord" size={24} color="#fff" />
          </View>
          <View style={styles.widgetInfo}>
            <Text style={[styles.widgetTitle, { color: colors.text }]}>
              {t('community.discord')}
            </Text>
            <Text style={[styles.widgetSubtitle, { color: colors.textSecondary }]}>
              {t('community.join_discord')}
            </Text>
          </View>
        </View>

        <View style={[styles.statsRow, { borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>1.8K+</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success }]}>150+</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Online</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>10+</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Channels</Text>
          </View>
        </View>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Voice chat trading rooms
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Exclusive member channels
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Trading bots & tools
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.openButton, { backgroundColor: '#5865F2' }]}
          onPress={openDiscord}
        >
          <Ionicons name="logo-discord" size={20} color="#fff" />
          <Text style={styles.openButtonText}>{t('community.open_discord')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.embedContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.embedTitle, { color: colors.text }]}>Server Widget</Text>
        <WebView
          source={{ uri: `https://discord.com/widget?id=${DISCORD_WIDGET_SERVER_ID}&theme=dark` }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <Header />
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'telegram' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('telegram')}
        >
          <Ionicons
            name="send"
            size={20}
            color={activeTab === 'telegram' ? '#fff' : colors.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'telegram' ? '#fff' : colors.textMuted },
            ]}
          >
            Telegram
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'discord' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('discord')}
        >
          <Ionicons
            name="logo-discord"
            size={20}
            color={activeTab === 'discord' ? '#fff' : colors.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'discord' ? '#fff' : colors.textMuted },
            ]}
          >
            Discord
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'telegram' ? renderTelegramTab() : renderDiscordTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
    paddingBottom: 100,
  },
  widgetCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetInfo: {
    marginLeft: 14,
    flex: 1,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  widgetSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  featureText: {
    fontSize: 14,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  openButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  embedContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  embedTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 0,
  },
  webview: {
    height: 350,
    marginTop: 12,
  },
});
