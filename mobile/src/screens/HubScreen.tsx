import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components';
import JournalScreen from './JournalScreen';
import AIChatScreen from './AIChatScreen';
import HubLearningScreen from './HubLearningScreen';

const { width } = Dimensions.get('window');

type HubTab = 'journal' | 'ai' | 'learning';

export default function HubScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<HubTab>('journal');

  const renderTab = () => {
    switch (activeTab) {
      case 'journal':
        return <JournalScreen embedded />;
      case 'ai':
        return <AIChatScreen embedded />;
      case 'learning':
        return <HubLearningScreen />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        translucent={false}
        backgroundColor={colors.surface}
        barStyle="light-content"
      />

      <Header showNotifications onNotificationPress={() => {}} />

      <View
        style={[
          styles.tabsContainer,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.tabsContent}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'journal' && [styles.tabActive, { borderBottomColor: colors.primary }],
            ]}
            onPress={() => setActiveTab('journal')}
          >
            <Ionicons
              name={'book' as any}
              size={22}
              color={activeTab === 'journal' ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'ai' && [styles.tabActive, { borderBottomColor: colors.primary }],
            ]}
            onPress={() => setActiveTab('ai')}
          >
            <Ionicons
              name={'chatbubbles' as any}
              size={22}
              color={activeTab === 'ai' ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'learning' && [styles.tabActive, { borderBottomColor: colors.primary }],
            ]}
            onPress={() => setActiveTab('learning')}
          >
            <Ionicons
              name={'school' as any}
              size={22}
              color={activeTab === 'learning' ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>{renderTab()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    borderBottomWidth: 1,
  },
  tabsContent: {
    flexDirection: 'row',
    width: '100%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 3,
  },
  content: {
    flex: 1,
    width,
  },
});
