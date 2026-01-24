import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { I18nProvider } from './src/i18n';
import RootNavigator from './src/navigation/RootNavigator';
import pushNotifications from './src/services/pushNotifications';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isDark } = useTheme();
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Initialize push notifications
  useEffect(() => {
    pushNotifications.initialize();
    pushNotifications.setupListeners(
      (notification) => {
        console.log('Notification received:', notification);
      },
      (response) => {
        console.log('Notification tapped:', response);
        // Navigate based on notification type
        const data = response.notification.request.content.data;
        // TODO: Add navigation logic based on data.type
      }
    );

    return () => pushNotifications.removeListeners();
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#050811' }]}>
        <Image
          source={require('./assets/logo.gif')}
          style={styles.loadingLogo}
          resizeMode="contain"
        />
      </View>
    );
  }
  
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    width: 200,
    height: 200,
  },
});
