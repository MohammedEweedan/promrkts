import React, { useState, useEffect, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Alert, TouchableOpacity, View } from 'react-native';
import { startPolling, stopPolling, hasConfirmedPurchases } from '../services/purchasePolling';
import api from '../api/client';

// Screens
import NewHomeScreen from '../screens/NewHomeScreen';
import StoreScreen from '../screens/StoreScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CourseContentScreen from '../screens/CourseContentScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ContactScreen from '../screens/ContactScreen';
import GroupsScreen from '../screens/GroupsScreen';
import HubScreen from '../screens/HubScreen';
import ProgressScreen from '../screens/ProgressScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import UserSearchScreen from '../screens/UserSearchScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AuthStack({ onComplete }: { onComplete: () => void }) {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="Login" 
        options={{ headerShown: false }}
      >
        {(props) => <LoginScreen {...props} onSuccess={onComplete} />}
      </Stack.Screen>
      <Stack.Screen 
        name="Register" 
        options={{ headerShown: false }}
      >
        {(props) => <RegisterScreen {...props} onSuccess={onComplete} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const [hasPurchases, setHasPurchases] = useState(false);

  const checkPurchases = useCallback(async () => {
    try {
      const confirmed = await hasConfirmedPurchases();
      setHasPurchases(confirmed);
    } catch (error) {
      console.log('Failed to check purchases:', error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      checkPurchases();
      
      // Start polling for purchase confirmations
      startPolling((purchase) => {
        // When a purchase is confirmed, show alert and refresh
        Alert.alert(
          'Purchase Confirmed! 🎉',
          `Your purchase of ${purchase.tier?.name || 'course'} has been confirmed!`,
          [
            {
              text: 'View Materials',
              onPress: () => {
                checkPurchases(); // Refresh to show Material tab
              }
            }
          ]
        );
      });
    }

    return () => {
      stopPolling();
    };
  }, [isAuthenticated, checkPurchases]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Hub':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Store':
              iconName = focused ? 'storefront' : 'storefront';
              break;
            case 'Chat':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            case 'AccountSettings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 28,
          height: 85,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={NewHomeScreen}
        options={{ title: t('tabs.home') }}
      />

      <Tab.Screen
        name="Hub"
        component={HubScreen}
        options={{ title: 'Hub' }}
      />

      <Tab.Screen
        name="Store"
        component={StoreScreen}
        options={{
          title: t('tabs.store'),
          tabBarLabel: '',
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              activeOpacity={0.85}
              style={{
                top: -18,
                justifyContent: 'center',
                alignItems: 'center',
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.primary,
                borderWidth: 6,
                borderColor: colors.tabBar,
              }}
            >
              <Ionicons name={'storefront' as any} size={28} color={'#fff'} />
            </TouchableOpacity>
          ),
        }}
      />

      <Tab.Screen
        name="Chat"
        component={MessagesScreen}
        options={{ title: 'Chat' }}
      />
      <Tab.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={{ title: 'Account' }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth">
          {() => <AuthStack onComplete={() => {}} />}
        </Stack.Screen>
      )}
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen 
        name="CourseContent" 
        component={CourseContentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Contact" 
        component={ContactScreen}
        options={{ headerShown: true, title: 'Contact Us' }}
      />
      <Stack.Screen 
        name="Groups" 
        component={GroupsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PostDetail" 
        component={PostDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="UserProfile" 
        component={UserProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CreatePost" 
        component={CreatePostScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="UserSearch" 
        component={UserSearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { isLoading, hasSeenOnboarding } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(!hasSeenOnboarding);
  const [showAuth, setShowAuth] = useState(false);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return null;
  }

  if (showOnboarding && !hasSeenOnboarding) {
    return (
      <OnboardingScreen
        onComplete={() => setShowOnboarding(false)}
        onLogin={() => {
          setAuthScreen('login');
          setShowAuth(true);
          setShowOnboarding(false);
        }}
        onRegister={() => {
          setAuthScreen('register');
          setShowAuth(true);
          setShowOnboarding(false);
        }}
      />
    );
  }

  if (showAuth) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen 
              {...props} 
              onSuccess={() => setShowAuth(false)}
              onRegister={() => props.navigation.navigate('Register')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Register">
          {(props) => (
            <RegisterScreen 
              {...props} 
              onSuccess={() => setShowAuth(false)}
              onLogin={() => props.navigation.navigate('Login')}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  return <MainStack />;
}
