import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type HeaderProps = {
  showMenu?: boolean;
  onMenuPress?: () => void;
  showNotifications?: boolean;
  onNotificationPress?: () => void;
  showSettings?: boolean;
  onSettingsPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
  showSearch?: boolean;
  onSearchPress?: () => void;
};

export default function Header({
  showMenu = false,
  onMenuPress,
  showNotifications = false,
  onNotificationPress,
  showSettings = false,
  onSettingsPress,
  showBack = false,
  onBackPress,
  showSearch = false,
  onSearchPress,
}: HeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: colors.surface, 
        borderBottomColor: colors.border,
        paddingTop: insets.top + 8,
      }
    ]}>
      {showBack ? (
        <TouchableOpacity style={styles.iconButton} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : showMenu ? (
        <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
      
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/app-logo.gif')}
          style={styles.textLogo}
          resizeMode="contain"
        />
      </View>

      {showSearch ? (
        <TouchableOpacity style={styles.iconButton} onPress={onSearchPress}>
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : showNotifications ? (
        <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : showSettings ? (
        <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  icon: {
    width: 36,
    height: 36,
  },
  textLogo: {
    width: 150,
    height: 45,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
  },
});
