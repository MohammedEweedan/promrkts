// AccountSettingsScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Image,
  ActivityIndicator,
  Linking,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Header } from "../components";
import { getMyPurchases } from "../services/purchasePolling";
import api, { uploadAPI } from "../api/client";
import { setLanguage } from "../i18n";

type Purchase = {
  id: string;
  tierId: string;
  status: string;
  createdAt?: string;
  tier?: any;
};

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
];

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "de", name: "German", nativeName: "Deutsch" },
];

export default function AccountSettingsScreen() {
  const { t, i18n } = useTranslation();

  // IMPORTANT: ThemeContext must expose toggleTheme + isDark (same as your SettingsScreen)
  const { colors, toggleTheme, isDark } = useTheme() as any;

  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"account" | "settings">("account");

  // Account state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);

  // Profile fields
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Settings state
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<"facial" | "fingerprint" | "none">("none");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  useEffect(() => {
    loadData();
    checkBiometric();
    loadSettings();
  }, []);

  const loadData = async () => {
    try {
      const [purchasesData, coursesResp, subsResp] = await Promise.all([
        getMyPurchases(),
        api.get("/courses").catch(() => ({ data: [] })),
        api.get("/subscriptions").catch(() => ({ data: [] })),
      ]);

      setPurchases(purchasesData);
      const allTiers = [
        ...(Array.isArray(coursesResp.data) ? coursesResp.data : []),
        ...(Array.isArray(subsResp.data) ? subsResp.data : []),
      ];
      setTiers(allTiers);
    } catch (error) {
      console.log("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkBiometric = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (compatible && enrolled) {
        setBiometricAvailable(true);
        const enabled = await SecureStore.getItemAsync("biometric_enabled");
        setBiometricEnabled(enabled === "true");

        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType("facial");
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType("fingerprint");
        }
      }
    } catch (error) {
      console.log("Biometric check error:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const savedCurrency = await AsyncStorage.getItem("@promrkts_currency");
      const savedPush = await AsyncStorage.getItem("@promrkts_push_notifications");
      const savedEmail = await AsyncStorage.getItem("@promrkts_email_notifications");

      if (savedCurrency) setCurrency(savedCurrency);
      if (savedPush !== null) setPushNotifications(savedPush === "true");
      if (savedEmail !== null) setEmailNotifications(savedEmail === "true");
    } catch (error) {
      console.log("Failed to load settings:", error);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Enable ${biometricType === "facial" ? "Face ID" : "Touch ID"}`,
      });

      if (result.success) {
        await SecureStore.setItemAsync("biometric_enabled", "true");
        setBiometricEnabled(true);
        Alert.alert(t("common.success"), t("settings.biometric_enabled"));
      }
    } else {
      await SecureStore.deleteItemAsync("biometric_enabled");
      await SecureStore.deleteItemAsync("biometric_credentials");
      setBiometricEnabled(false);
      Alert.alert(t("common.success"), t("settings.biometric_disabled"));
    }
  };

  const handlePushNotificationsChange = async (value: boolean) => {
    setPushNotifications(value);
    await AsyncStorage.setItem("@promrkts_push_notifications", String(value));
  };

  const handleEmailNotificationsChange = async (value: boolean) => {
    setEmailNotifications(value);
    await AsyncStorage.setItem("@promrkts_email_notifications", String(value));
  };

  const handleLanguageChange = async (langCode: string) => {
    await setLanguage(langCode);
    setShowLanguageModal(false);
  };

  const handleCurrencyChange = async (currencyCode: string) => {
    setCurrency(currencyCode);
    await AsyncStorage.setItem("@promrkts_currency", currencyCode);
    setShowCurrencyModal(false);
  };

  const currentLanguage = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];
  const currentCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(t("common.error"), t("account.permission_required"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);

      try {
        setSaving(true);
        const uploadRes = await uploadAPI.uploadImage(imageUri, "avatar");
        if (uploadRes.data?.url) {
          await api.put("/users/me", { avatar_url: uploadRes.data.url });
          Alert.alert(t("common.success"), t("account.profile_updated"));
        }
      } catch (error) {
        console.error("Failed to upload profile picture:", error);
        Alert.alert(t("common.error"), t("errors.upload_failed"));
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert(t("common.error"), t("account.name_required"));
      return;
    }

    setSaving(true);
    try {
      await api.put("/users/me", { name });
      Alert.alert(t("common.success"), t("account.profile_updated"));
    } catch (error) {
      Alert.alert(t("common.error"), t("errors.update_failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t("common.error"), t("account.password_required"));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t("common.error"), t("account.password_mismatch"));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t("common.error"), t("account.password_length"));
      return;
    }

    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert(t("common.success"), t("account.password_changed"));
    } catch (error) {
      Alert.alert(t("common.error"), t("errors.update_failed"));
    } finally {
      setSaving(false);
    }
  };

  // --- SettingsScreen-like components (same approach as your reference) ---
  const SettingRow = ({
    icon,
    label,
    value,
    onPress,
    rightElement,
  }: {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.settingRow, { borderColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.settingIcon, { backgroundColor: colors.surface }]}>
        <Ionicons name={icon as any} size={20} color={colors.primary} />
      </View>
      <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      {value && <Text style={[styles.settingValue, { color: colors.textMuted }]}>{value}</Text>}
      {rightElement}
      {onPress && !rightElement && (
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{title}</Text>
  );

  const confirmedPurchases = purchases.filter((p) => p.status === "CONFIRMED");
  const enrolledTierIds = new Set(confirmedPurchases.map((p) => p.tierId));
  const enrolledTiers = tiers.filter((t) => enrolledTierIds.has(t.id));

  if (!isAuthenticated) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["left", "right"]}
      >
        <Header />
        <View style={styles.guestContainer}>
          <Ionicons name="person-circle-outline" size={100} color={colors.textMuted} />
          <Text style={[styles.guestTitle, { color: colors.text }]}>{t("account.title")}</Text>
          <Text style={[styles.guestSubtitle, { color: colors.textMuted }]}>
            {t("auth.sign_in")} {t("common.loading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["left", "right"]}
      >
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["left", "right"]}
    >
      <Header />

      {/* Tab Navigation */}
      <View
        style={[
          styles.tabContainer,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "account" && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab("account")}
        >
          <Text
            style={[
              styles.tabButtonText,
              { color: activeTab === "account" ? "#fff" : colors.text },
            ]}
          >
            Account
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "settings" && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab("settings")}
        >
          <Text
            style={[
              styles.tabButtonText,
              { color: activeTab === "settings" ? "#fff" : colors.text },
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          activeTab === "settings" ? styles.settingsScrollContent : styles.accountScrollContent,
        ]}
      >
        {activeTab === "account" && (
          <>
            {/* Profile Picture */}
            <View style={[styles.sectionAccount, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Picture</Text>
              <View style={styles.profilePictureContainer}>
                <TouchableOpacity onPress={pickImage} style={styles.profilePictureWrapper}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profilePicture} />
                  ) : user?.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.profilePicture} />
                  ) : (
                    <View
                      style={[
                        styles.profilePicturePlaceholder,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text style={styles.profilePictureText}>
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </Text>
                    </View>
                  )}
                  <View style={styles.editOverlay}>
                    <Ionicons name="camera" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={pickImage} style={styles.changePhotoButton}>
                  <Text style={[styles.changePhotoText, { color: colors.primary }]}>
                    Change Photo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Profile Information */}
            <View style={[styles.sectionAccount, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Information</Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                    },
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                    },
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textMuted}
                  editable={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Profile"}</Text>
              </TouchableOpacity>
            </View>

            {/* Change Password */}
            <View style={[styles.sectionAccount, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Change Password</Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Current Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                    },
                  ]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>New Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                    },
                  ]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Confirm New Password
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                    },
                  ]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleChangePassword}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? "Updating..." : "Update Password"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Enrolled Courses */}
            {enrolledTiers.length > 0 && (
              <View style={[styles.sectionAccount, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Enrolled Courses</Text>
                {enrolledTiers.map((tier) => (
                  <View key={tier.id} style={styles.courseItem}>
                    <Text style={[styles.courseName, { color: colors.text }]}>{tier.name}</Text>
                    <Text style={[styles.courseStatus, { color: colors.success }]}>Enrolled</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {activeTab === "settings" && (
          <>
            {/* Appearance Section */}
            <SectionHeader title={t("settings.appearance")} />
            <View
              style={[
                styles.sectionSettings,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <SettingRow
                icon="moon"
                label={t("settings.theme")}
                value={isDark ? t("settings.dark_mode") : t("settings.light_mode")}
                rightElement={
                  <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                  />
                }
              />
              <SettingRow
                icon="language"
                label={t("settings.language")}
                value={currentLanguage.nativeName}
                onPress={() => setShowLanguageModal(true)}
              />
              <SettingRow
                icon="cash"
                label={t("settings.currency")}
                value={`${currentCurrency.symbol} ${currentCurrency.code}`}
                onPress={() => setShowCurrencyModal(true)}
              />
            </View>

            {/* Notifications Section */}
            <SectionHeader title={t("settings.notifications")} />
            <View
              style={[
                styles.sectionSettings,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <SettingRow
                icon="notifications"
                label={t("settings.push_notifications")}
                rightElement={
                  <Switch
                    value={pushNotifications}
                    onValueChange={handlePushNotificationsChange}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                  />
                }
              />
              <SettingRow
                icon="mail"
                label={t("settings.email_notifications")}
                rightElement={
                  <Switch
                    value={emailNotifications}
                    onValueChange={handleEmailNotificationsChange}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                  />
                }
              />
            </View>

            {/* Security Section */}
            <SectionHeader title={t("settings.security")} />
            <View
              style={[
                styles.sectionSettings,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <SettingRow icon="lock-closed" label={t("settings.privacy")} onPress={() => {}} />
              <SettingRow
                icon="shield-checkmark"
                label={t("settings.security")}
                onPress={() => {}}
              />
            </View>

            {/* Support Section */}
            <SectionHeader title={t("settings.help")} />
            <View
              style={[
                styles.sectionSettings,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <SettingRow
                icon="help-circle"
                label={t("settings.help")}
                onPress={() => Linking.openURL("https://promrkts.com/learn/faq")}
              />
              <SettingRow
                icon="chatbubbles"
                label={t("settings.contact")}
                onPress={() => Linking.openURL("https://promrkts.com/contact")}
              />
              <SettingRow
                icon="document-text"
                label={t("settings.terms")}
                onPress={() => Linking.openURL("https://promrkts.com/legal/terms")}
              />
              <SettingRow
                icon="shield"
                label={t("settings.privacy_policy")}
                onPress={() => Linking.openURL("https://promrkts.com/legal/policy")}
              />
            </View>

            {/* About Section */}
            <SectionHeader title={t("settings.about")} />
            <View
              style={[
                styles.sectionSettings,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <SettingRow icon="information-circle" label={t("settings.version")} value="1.0.0" />
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>
                © 2024 promrkts. All rights reserved.
              </Text>
            </View>
          </>
        )}

        {/* Language Modal (SettingsScreen look) */}
        <Modal visible={showLanguageModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {t("settings.language")}
                </Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.optionRow,
                    { borderColor: colors.border },
                    i18n.language === lang.code && { backgroundColor: colors.primary + "20" },
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <View>
                    <Text style={[styles.optionTitle, { color: colors.text }]}>{lang.name}</Text>
                    <Text style={[styles.optionSubtitle, { color: colors.textMuted }]}>
                      {lang.nativeName}
                    </Text>
                  </View>
                  {i18n.language === lang.code && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {/* Currency Modal (SettingsScreen look) */}
        <Modal visible={showCurrencyModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {t("settings.currency")}
                </Text>
                <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView>
                {CURRENCIES.map((curr) => (
                  <TouchableOpacity
                    key={curr.code}
                    style={[
                      styles.optionRow,
                      { borderColor: colors.border },
                      currency === curr.code && { backgroundColor: colors.primary + "20" },
                    ]}
                    onPress={() => handleCurrencyChange(curr.code)}
                  >
                    <View style={styles.currencyInfo}>
                      <Text style={[styles.currencySymbol, { color: colors.primary }]}>
                        {curr.symbol}
                      </Text>
                      <View>
                        <Text style={[styles.optionTitle, { color: colors.text }]}>
                          {curr.code}
                        </Text>
                        <Text style={[styles.optionSubtitle, { color: colors.textMuted }]}>
                          {curr.name}
                        </Text>
                      </View>
                    </View>
                    {currency === curr.code && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  guestContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  guestTitle: { fontSize: 24, fontWeight: "600", marginTop: 20 },
  guestSubtitle: { fontSize: 16, marginTop: 8 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  tabContainer: {
    flexDirection: "row",
    margin: 16,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  tabButtonText: { fontSize: 14, fontWeight: "600" },

  // Different paddings per tab (so Settings matches your SettingsScreen exactly)
  accountScrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  settingsScrollContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },

  // Account sections (old look)
  sectionAccount: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },

  profilePictureContainer: { alignItems: "center" },
  profilePictureWrapper: { position: "relative", marginBottom: 16 },
  profilePicture: { width: 100, height: 100, borderRadius: 50 },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  profilePictureText: { fontSize: 36, fontWeight: "600", color: "#fff" },
  editOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoButton: { marginTop: 8 },
  changePhotoText: { fontSize: 14, fontWeight: "600" },

  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },

  courseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  courseName: { fontSize: 16, fontWeight: "500" },
  courseStatus: { fontSize: 14, fontWeight: "600" },

  // SETTINGS styles (match your SettingsScreen)
  sectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginTop: 54,
    marginBottom: 8,
  },
  sectionSettings: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  settingValue: {
    fontSize: 14,
    marginRight: 8,
  },

  footer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  footerText: { fontSize: 12 },

  // Modals (match your SettingsScreen)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionTitle: { fontSize: 16, fontWeight: "600" },
  optionSubtitle: { fontSize: 13, marginTop: 2 },
  currencyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "700",
    width: 40,
    textAlign: "center",
  },
});
