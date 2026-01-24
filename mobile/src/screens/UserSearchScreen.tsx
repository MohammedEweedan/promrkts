import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components';
import { socialAPI } from '../api/client';

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  level?: number;
  totalXP?: number;
};

export default function UserSearchScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const searchUsers = async (query: string) => {
    if (query.trim().length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const resp = await socialAPI.searchUsers(query);
      setUsers(resp.data || []);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    searchUsers(text);
  };

  const toggleFollow = async (userId: string) => {
    try {
      const resp = await socialAPI.followUser(userId);
      setFollowingIds(prev => {
        const newSet = new Set(prev);
        if (resp.data?.following) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
    >
      <View style={styles.avatarContainer}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '30' }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {(item.name || 'U')[0].toUpperCase()}
            </Text>
          </View>
        )}
        {item.level && (
          <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.userEmail, { color: colors.textMuted }]}>
          @{item.email.split('@')[0]}
        </Text>
        {item.totalXP !== undefined && (
          <Text style={[styles.userXP, { color: colors.textMuted }]}>
            {item.totalXP.toLocaleString()} XP
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.followButton,
          followingIds.has(item.id)
            ? { backgroundColor: colors.surface, borderColor: colors.border }
            : { backgroundColor: colors.primary },
        ]}
        onPress={(e) => {
          e.stopPropagation();
          toggleFollow(item.id);
        }}
      >
        <Text
          style={[
            styles.followButtonText,
            followingIds.has(item.id) ? { color: colors.text } : { color: '#fff' },
          ]}
        >
          {followingIds.has(item.id) ? t('common.following') : t('common.follow')}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <Header showBack onBackPress={() => navigation.goBack()} />
      
      <View style={styles.content}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('common.search')}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : users.length > 0 ? (
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : searchQuery.length >= 2 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t('common.no_results')}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t('common.search')}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  userXP: {
    fontSize: 12,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});
