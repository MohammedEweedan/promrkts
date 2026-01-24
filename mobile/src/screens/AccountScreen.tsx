import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components';
import InfoCard from '../components/InfoCard';
import { getMyPurchases } from '../services/purchasePolling';
import api, { uploadAPI } from '../api/client';

type Purchase = {
  id: string;
  tierId: string;
  status: string;
  createdAt?: string;
  tier?: any;
};

export default function AccountScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigation = useNavigation<any>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  
  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Face ID
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<'facial' | 'fingerprint' | 'none'>('none');

  useEffect(() => {
    loadData();
    checkBiometric();
  }, []);

  const loadData = async () => {
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
    } catch (error) {
      console.log('Failed to load data:', error);
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
        const enabled = await SecureStore.getItemAsync('biometric_enabled');
        setBiometricEnabled(enabled === 'true');
        
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('facial');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        }
      }
    } catch (error) {
      console.log('Biometric check error:', error);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // Enable biometric
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Enable ${biometricType === 'facial' ? 'Face ID' : 'Touch ID'}`,
      });
      
      if (result.success) {
        await SecureStore.setItemAsync('biometric_enabled', 'true');
        setBiometricEnabled(true);
        Alert.alert(t('common.success'), t('settings.biometric_enabled'));
      }
    } else {
      // Disable biometric
      await SecureStore.deleteItemAsync('biometric_enabled');
      await SecureStore.deleteItemAsync('biometric_credentials');
      setBiometricEnabled(false);
      Alert.alert(t('common.success'), t('settings.biometric_disabled'));
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(t('common.error'), t('account.permission_required'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      
      try {
        setSaving(true);
        const uploadRes = await uploadAPI.uploadImage(imageUri, 'avatar');
        if (uploadRes.data?.url) {
          await api.put('/users/me', { avatar_url: uploadRes.data.url });
          Alert.alert(t('common.success'), t('account.profile_updated'));
        }
      } catch (error) {
        console.error('Failed to upload profile picture:', error);
        Alert.alert(t('common.error'), t('errors.upload_failed'));
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('account.name_required'));
      return;
    }

    setSaving(true);
    try {
      await api.put('/user/me', { name });
      Alert.alert(t('common.success'), t('account.profile_updated'));
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.update_failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('common.error'), t('account.password_required'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('account.password_mismatch'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('common.error'), t('account.password_length'));
      return;
    }

    setSaving(true);
    try {
      // In a real app, call your API to change password
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert(t('common.success'), t('account.password_changed'));
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.update_failed'));
    } finally {
      setSaving(false);
    }
  };

  const confirmedPurchases = purchases.filter(p => p.status === 'CONFIRMED');
  const enrolledTierIds = new Set(confirmedPurchases.map(p => p.tierId));
  const enrolledTiers = tiers.filter(t => enrolledTierIds.has(t.id));

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <Header />
        <View style={styles.guestContainer}>
          <Ionicons name="person-circle-outline" size={100} color={colors.textMuted} />
          <Text style={[styles.guestTitle, { color: colors.text }]}>{t('account.title')}</Text>
          <Text style={[styles.guestSubtitle, { color: colors.textMuted }]}>
            {t('auth.sign_in')} {t('common.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Picture */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
              </View>
            )}
            <View style={[styles.avatarEditBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarHint, { color: colors.textMuted }]}>{t('account.edit_profile')}</Text>
        </View>

        {/* Membership Card */}
        <InfoCard membershipType="premium" />

        {/* Progress & Achievements */}
        <TouchableOpacity 
          style={[styles.section, styles.progressSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={() => navigation.navigate('Progress')}
          activeOpacity={0.7}
        >
          <View style={styles.progressHeader}>
            <View style={[styles.progressIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="trophy" size={28} color={colors.primary} />
            </View>
            <View style={styles.progressInfo}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 4 }]}>{t('progress.title')}</Text>
              <Text style={[styles.progressSubtitle, { color: colors.textMuted }]}>
                {t('progress.xp')}, {t('progress.badges')}, {t('progress.leaderboard')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        {/* Profile Information */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('account.profile')}</Text>
          
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('account.name')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>{t('account.email')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            value={email}
            editable={false}
            placeholder="your@email.com"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={[styles.hint, { color: colors.textMuted }]}>{t('account.email')} {t('common.edit')}</Text>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Change Password */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('account.password')}</Text>
          
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('account.password')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>{t('account.password')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>{t('account.password')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
            onPress={handleChangePassword}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Settings */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.security')}</Text>
          
          {biometricAvailable && (
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons 
                  name={biometricType === 'facial' ? 'scan' : 'finger-print'} 
                  size={24} 
                  color={colors.primary} 
                />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    {biometricType === 'facial' ? 'Face ID' : 'Touch ID'}
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: colors.textMuted }]}>
                    {t('settings.security')}
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={biometricEnabled ? colors.primary : colors.textMuted}
              />
            </View>
          )}
        </View>

        {/* Purchases */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('account.portfolio')}</Text>
          
          {confirmedPurchases.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('store.no_courses')}</Text>
            </View>
          ) : (
            confirmedPurchases.map((purchase) => {
              const tier = tiers.find(t => t.id === purchase.tierId);
              return (
                <View key={purchase.id} style={[styles.purchaseItem, { borderBottomColor: colors.border }]}>
                  <View style={[styles.purchaseIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.purchaseInfo}>
                    <Text style={[styles.purchaseName, { color: colors.text }]}>
                      {tier?.name || tier?.title || 'Course'}
                    </Text>
                    <Text style={[styles.purchaseDate, { color: colors.textMuted }]}>
                      {purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                  <View style={[styles.purchaseStatus, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.purchaseStatusText, { color: colors.success }]}>Active</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Enrolled Courses */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Enrolled Courses</Text>
          
          {enrolledTiers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="school-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No courses enrolled</Text>
            </View>
          ) : (
            enrolledTiers.map((tier) => (
              <View key={tier.id} style={[styles.courseItem, { borderBottomColor: colors.border }]}>
                <View style={[styles.courseIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="book" size={24} color={colors.primary} />
                </View>
                <View style={styles.courseInfo}>
                  <Text style={[styles.courseName, { color: colors.text }]}>
                    {tier.name || tier.title}
                  </Text>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                      <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '30%' }]} />
                    </View>
                    <Text style={[styles.progressText, { color: colors.textMuted }]}>30%</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: colors.error }]}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout },
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },
  guestSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '700',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarHint: {
    fontSize: 13,
    marginTop: 8,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  hint: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 12,
  },
  purchaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  purchaseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  purchaseName: {
    fontSize: 15,
    fontWeight: '600',
  },
  purchaseDate: {
    fontSize: 13,
    marginTop: 2,
  },
  purchaseStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  purchaseStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  courseName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    paddingVertical: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  progressSubtitle: {
    fontSize: 13,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
