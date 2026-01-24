import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const TELEGRAM_URL = 'https://t.me/promrkts';
const DISCORD_INVITE_URL = 'https://discord.gg/promrkts';
const DISCORD_WIDGET_SERVER_ID = '1447879971946102847';

type TabType = 'telegram' | 'discord';

type Props = {
  refreshing: boolean;
  onRefresh: () => void;
};

export default function CommunitySection({ refreshing, onRefresh }: Props) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabType>('telegram');

  const openTelegram = () => {
    Linking.openURL(TELEGRAM_URL);
  };

  const openDiscord = () => {
    Linking.openURL(DISCORD_INVITE_URL);
  };

  const openGroups = () => {
    navigation.navigate('Groups');
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
            <Text style={[styles.statValue, { color: colors.success }]}>200+</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Online</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>24/7</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Active</Text>
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
              Market analysis & insights
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Direct support from experts
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Trading Groups Button */}
      <TouchableOpacity
        style={[styles.groupsButton, { backgroundColor: colors.primary }]}
        onPress={openGroups}
      >
        <Ionicons name="people" size={24} color="#fff" />
        <Text style={styles.groupsButtonText}>Trading Groups</Text>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>

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

      {activeTab === 'telegram' ? renderTelegramTab() : renderDiscordTab()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
    fontSize: 20,
    fontWeight: '700',
  },
  widgetSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    marginBottom: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  featuresList: {
    marginBottom: 20,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    gap: 10,
  },
  openButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  groupsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  groupsButtonText: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
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
