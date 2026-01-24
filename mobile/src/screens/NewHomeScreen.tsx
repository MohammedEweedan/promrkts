import React, { useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components";
import FeedSection from "../components/sections/FeedSection";
import DashboardSection from "../components/sections/DashboardSection";
import CommunitySection from "../components/sections/CommunitySection";
import PromrktsIndexSection from "../components/sections/PromrktsIndexSection";
import TradingViewWidget from "../components/widgets/TradingViewWidget";

const { width } = Dimensions.get("window");

type SectionType = "feed" | "dashboard" | "index" | "community";

export default function NewHomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [activeSection, setActiveSection] = useState<SectionType>("feed");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const sections = [
    { key: "feed", label: t("tabs.feed") || "Feed", icon: "home" },
    { key: "dashboard", label: t("tabs.dashboard") || "Dashboard", icon: "grid" },
    { key: "index", label: "Index", icon: "stats-chart" },
    { key: "community", label: t("tabs.community") || "Community", icon: "people" },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "feed":
        return <FeedSection refreshing={refreshing} onRefresh={onRefresh} />;
      case "dashboard":
        return <DashboardSection refreshing={refreshing} onRefresh={onRefresh} />;
      case "index":
        return <PromrktsIndexSection refreshing={refreshing} onRefresh={onRefresh} />;
      case "community":
        return <CommunitySection refreshing={refreshing} onRefresh={onRefresh} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Paint the status bar area the same as your header */}
      <StatusBar
        translucent={false}
        backgroundColor={colors.surface} // IMPORTANT for Android
        barStyle="light-content"
      />

      {/* Header already applies insets.top */}
      <Header 
        showSearch
        onSearchPress={() => navigation.navigate('UserSearch')}
        showNotifications 
        onNotificationPress={() => {
          Alert.alert(
            t('settings.notifications') || 'Notifications',
            'No new notifications',
            [{ text: 'OK' }]
          );
        }} 
      />

      {/* Tabs */}
      <View
        style={[
          styles.tabsContainer,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.tabsContent}>
          {sections.map((section) => (
            <TouchableOpacity
              key={section.key}
              style={[
                styles.sectionTab,
                activeSection === section.key && [
                  styles.sectionTabActive,
                  { borderBottomColor: colors.primary },
                ],
              ]}
              onPress={() => setActiveSection(section.key as SectionType)}
            >
              <Ionicons
                name={section.icon as any}
                size={24}
                color={activeSection === section.key ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Ticker */}
      <View style={{ backgroundColor: colors.background }}>
        <TradingViewWidget type="ticker-tape" height={69} />
      </View>

      {/* Content */}
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {renderSection()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabsContainer: { borderBottomWidth: 1 },
  tabsContent: { flexDirection: "row", width: "100%" },
  sectionTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  sectionTabActive: { borderBottomWidth: 3 },
  content: { flex: 1 },
});
