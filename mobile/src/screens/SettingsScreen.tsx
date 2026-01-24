import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { setLanguage } from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
];

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, mode, toggleTheme, isDark } = useTheme();
  
  const [currency, setCurrency] = useState('USD');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Load saved settings on mount
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem('@promrkts_currency');
        const savedPush = await AsyncStorage.getItem('@promrkts_push_notifications');
        const savedEmail = await AsyncStorage.getItem('@promrkts_email_notifications');
        
        if (savedCurrency) setCurrency(savedCurrency);
        if (savedPush !== null) setPushNotifications(savedPush === 'true');
        if (savedEmail !== null) setEmailNotifications(savedEmail === 'true');
      } catch (error) {
        console.log('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const currentLanguage = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];
  const currentCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const handleLanguageChange = async (langCode: string) => {
    await setLanguage(langCode);
    setShowLanguageModal(false);
  };

  const handleCurrencyChange = async (currencyCode: string) => {
    setCurrency(currencyCode);
    await AsyncStorage.setItem('@promrkts_currency', currencyCode);
    setShowCurrencyModal(false);
  };

  const handlePushNotificationsChange = async (value: boolean) => {
    setPushNotifications(value);
    await AsyncStorage.setItem('@promrkts_push_notifications', String(value));
  };

  const handleEmailNotificationsChange = async (value: boolean) => {
    setEmailNotifications(value);
    await AsyncStorage.setItem('@promrkts_email_notifications', String(value));
  };

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Appearance Section */}
        <SectionHeader title={t('settings.appearance')} />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <SettingRow
            icon="moon"
            label={t('settings.theme')}
            value={isDark ? t('settings.dark_mode') : t('settings.light_mode')}
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
            label={t('settings.language')}
            value={currentLanguage.nativeName}
            onPress={() => setShowLanguageModal(true)}
          />
          <SettingRow
            icon="cash"
            label={t('settings.currency')}
            value={`${currentCurrency.symbol} ${currentCurrency.code}`}
            onPress={() => setShowCurrencyModal(true)}
          />
        </View>

        {/* Notifications Section */}
        <SectionHeader title={t('settings.notifications')} />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <SettingRow
            icon="notifications"
            label={t('settings.push_notifications')}
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
            label={t('settings.email_notifications')}
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
        <SectionHeader title={t('settings.security')} />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <SettingRow
            icon="lock-closed"
            label={t('settings.privacy')}
            onPress={() => {}}
          />
          <SettingRow
            icon="shield-checkmark"
            label={t('settings.security')}
            onPress={() => {}}
          />
        </View>

        {/* Support Section */}
        <SectionHeader title={t('settings.help')} />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <SettingRow
            icon="help-circle"
            label={t('settings.help')}
            onPress={() => Linking.openURL('https://promrkts.com/learn/faq')}
          />
          <SettingRow
            icon="chatbubbles"
            label={t('settings.contact')}
            onPress={() => Linking.openURL('https://promrkts.com/contact')}
          />
          <SettingRow
            icon="document-text"
            label={t('settings.terms')}
            onPress={() => Linking.openURL('https://promrkts.com/legal/terms')}
          />
          <SettingRow
            icon="shield"
            label={t('settings.privacy_policy')}
            onPress={() => Linking.openURL('https://promrkts.com/legal/policy')}
          />
        </View>

        {/* About Section */}
        <SectionHeader title={t('settings.about')} />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <SettingRow
            icon="information-circle"
            label={t('settings.version')}
            value="1.0.0"
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            © 2024 ProMrkts. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.language')}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.optionRow,
                  { borderColor: colors.border },
                  i18n.language === lang.code && { backgroundColor: colors.primary + '20' },
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <View>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>{lang.name}</Text>
                  <Text style={[styles.optionSubtitle, { color: colors.textMuted }]}>{lang.nativeName}</Text>
                </View>
                {i18n.language === lang.code && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.currency')}</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {CURRENCIES.map(curr => (
                <TouchableOpacity
                  key={curr.code}
                  style={[
                    styles.optionRow,
                    { borderColor: colors.border },
                    currency === curr.code && { backgroundColor: colors.primary + '20' },
                  ]}
                  onPress={() => handleCurrencyChange(curr.code)}
                >
                  <View style={styles.currencyInfo}>
                    <Text style={[styles.currencySymbol, { color: colors.primary }]}>{curr.symbol}</Text>
                    <View>
                      <Text style={[styles.optionTitle, { color: colors.text }]}>{curr.code}</Text>
                      <Text style={[styles.optionSubtitle, { color: colors.textMuted }]}>{curr.name}</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginTop: 54,
    marginBottom: 8,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    marginRight: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    width: 40,
    textAlign: 'center',
  },
});
