import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export const checkBiometricSupport = async (): Promise<{
  supported: boolean;
  enrolled: boolean;
  type: BiometricType;
}> => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      return { supported: false, enrolled: false, type: 'none' };
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    let type: BiometricType = 'none';
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      type = 'facial';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      type = 'fingerprint';
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      type = 'iris';
    }

    return { supported: true, enrolled, type };
  } catch (error) {
    console.log('Biometric check error:', error);
    return { supported: false, enrolled: false, type: 'none' };
  }
};

export const authenticateWithBiometric = async (
  promptMessage = 'Authenticate to login'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use password',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      return { success: true };
    }

    return { 
      success: false, 
      error: result.error || 'Authentication failed' 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Biometric authentication failed' 
    };
  }
};

export const isBiometricEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch {
    return false;
  }
};

export const setBiometricEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch (error) {
    console.log('Failed to set biometric enabled:', error);
  }
};

export const saveCredentialsForBiometric = async (
  email: string,
  password: string
): Promise<void> => {
  try {
    const credentials = JSON.stringify({ email, password });
    await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, credentials);
  } catch (error) {
    console.log('Failed to save credentials:', error);
  }
};

export const getCredentialsForBiometric = async (): Promise<{
  email: string;
  password: string;
} | null> => {
  try {
    const credentials = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    if (credentials) {
      return JSON.parse(credentials);
    }
    return null;
  } catch {
    return null;
  }
};

export const clearBiometricCredentials = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
  } catch (error) {
    console.log('Failed to clear biometric credentials:', error);
  }
};

export const getBiometricTypeName = (type: BiometricType): string => {
  switch (type) {
    case 'facial':
      return 'Face ID';
    case 'fingerprint':
      return 'Touch ID';
    case 'iris':
      return 'Iris';
    default:
      return 'Biometric';
  }
};
