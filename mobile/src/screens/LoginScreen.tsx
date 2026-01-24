import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

type Props = {
  onSuccess?: () => void;
  onRegister?: () => void;
};

export default function LoginScreen({ onSuccess, onRegister }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { login } = useAuth();
  const navigation = useNavigation<any>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'facial' | 'fingerprint' | 'none'>('none');
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const savedCreds = await SecureStore.getItemAsync('biometric_credentials');
      
      if (compatible && enrolled) {
        setBiometricAvailable(true);
        setHasSavedCredentials(!!savedCreds);
        
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('facial');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        }
      }
    } catch (err) {
      console.log('Biometric check error:', err);
    }
  };

  const handleLogin = async (useEmail?: string, usePassword?: string) => {
    const loginEmail = useEmail || email;
    const loginPassword = usePassword || password;
    
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError(t('auth.fill_all_fields') || 'Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(loginEmail, loginPassword);
    
    if (result.success) {
      // Save credentials for biometric login if available
      if (biometricAvailable) {
        try {
          await SecureStore.setItemAsync(
            'biometric_credentials',
            JSON.stringify({ email: loginEmail, password: loginPassword })
          );
          setHasSavedCredentials(true);
        } catch (err) {
          console.log('Failed to save credentials:', err);
        }
      }
      onSuccess?.();
    } else {
      setError(result.error || t('auth.invalid_credentials') || 'Invalid credentials');
    }
    
    setLoading(false);
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: biometricType === 'facial' ? 'Login with Face ID' : 'Login with Touch ID',
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        const savedCreds = await SecureStore.getItemAsync('biometric_credentials');
        if (savedCreds) {
          const { email: savedEmail, password: savedPassword } = JSON.parse(savedCreds);
          await handleLogin(savedEmail, savedPassword);
        } else {
          Alert.alert('No Saved Credentials', 'Please login with email and password first.');
        }
      }
    } catch (err) {
      console.log('Biometric auth error:', err);
      Alert.alert('Authentication Failed', 'Please try again or use password.');
    }
  };

  const handleRegisterPress = () => {
    if (onRegister) {
      onRegister();
    } else {
      navigation.navigate('Register');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image
              source={require('../../assets/logo.gif')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.text }]}>
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to continue your trading journey
            </Text>
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('account.email')}
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="email@example.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('account.password')}
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                {t('auth.forgot_password')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={() => handleLogin()}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Signing in...' : t('auth.sign_in') || 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Biometric Login Button */}
            {biometricAvailable && hasSavedCredentials && (
              <TouchableOpacity
                style={[styles.biometricButton, { borderColor: colors.primary }]}
                onPress={handleBiometricLogin}
                disabled={loading}
              >
                <Ionicons 
                  name={biometricType === 'facial' ? 'scan' : 'finger-print'} 
                  size={24} 
                  color={colors.primary} 
                />
                <Text style={[styles.biometricButtonText, { color: colors.primary }]}>
                  {biometricType === 'facial' ? 'Login with Face ID' : 'Login with Touch ID'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <TouchableOpacity
              style={[styles.socialButton, { borderColor: colors.border }]}
            >
              <Ionicons name="logo-google" size={20} color={colors.text} />
              <Text style={[styles.socialButtonText, { color: colors.text }]}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { borderColor: colors.border }]}
            >
              <Ionicons name="logo-apple" size={20} color={colors.text} />
              <Text style={[styles.socialButtonText, { color: colors.text }]}>
                Continue with Apple
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {t('auth.no_account')}{' '}
            </Text>
            <TouchableOpacity onPress={handleRegisterPress}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                {t('auth.sign_up')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 10,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 16,
    gap: 10,
  },
  biometricButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
