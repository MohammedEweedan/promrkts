import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../api/client';
import { startPolling, stopPolling } from '../services/purchasePolling';

type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: 'user' | 'admin';
  email_confirmed?: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  confirmAccount: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  resendConfirmation: (email: string) => Promise<{ success: boolean; error?: string }>;
  setHasSeenOnboarding: (value: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = '@promrkts_user';
const ONBOARDING_KEY = '@promrkts_onboarding_seen';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const [token, userData, onboardingSeen] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(ONBOARDING_KEY),
      ]);
      
      setHasSeenOnboardingState(onboardingSeen === 'true');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (e) {
      console.log('Failed to load user:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.data.status === 'success') {
        const { user: userData, accessToken } = response.data.data;
        
        await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
        setUser(userData);
        
        // Start polling for purchase confirmations
        startPolling();
        
        return { success: true };
      }
      
      return { success: false, error: response.data.message || 'Login failed' };
    } catch (e: any) {
      console.log('Login failed:', e);
      const errorMessage = e.response?.data?.message || 'Invalid email or password';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    name: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(email, password, name, phone);
      
      if (response.data.status === 'success') {
        const { user: userData, accessToken } = response.data.data;
        
        await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
        setUser(userData);
        
        // Start polling for purchase confirmations
        startPolling();
        
        return { success: true };
      }
      
      return { success: false, error: response.data.message || 'Registration failed' };
    } catch (e: any) {
      console.log('Register failed:', e);
      const errorMessage = e.response?.data?.message || 'Registration failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Stop polling when user logs out
      stopPolling();
      
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      setUser(null);
    } catch (e) {
      console.log('Logout failed:', e);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authAPI.forgotPassword(email);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.message || 'Failed to send reset email' };
    }
  };

  const confirmAccount = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authAPI.confirmAccount(email, code);
      if (response.data.status === 'success') {
        if (user) {
          const updated = { ...user, email_confirmed: true };
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
          setUser(updated);
        }
        return { success: true };
      }
      return { success: false, error: response.data.message };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.message || 'Invalid code' };
    }
  };

  const resendConfirmation = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await authAPI.resendConfirmation(email);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.message || 'Failed to resend code' };
    }
  };

  const setHasSeenOnboarding = async (value: boolean) => {
    await AsyncStorage.setItem(ONBOARDING_KEY, value.toString());
    setHasSeenOnboardingState(value);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        hasSeenOnboarding,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
        confirmAccount,
        resendConfirmation,
        setHasSeenOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
