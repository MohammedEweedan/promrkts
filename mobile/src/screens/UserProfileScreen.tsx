import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { socialAPI } from '../api/client';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  website?: string;
  twitterHandle?: string;
  telegramHandle?: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  created_at: string;
};

type Post = {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  likedByUser: boolean;
};

export default function UserProfileScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user: currentUser } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId } = route.params || {};

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);

  const isOwnProfile = currentUser?.id === userId;

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await socialAPI.getProfile(userId);
      setProfile(res.data?.data || res.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [userId]);

  const fetchPosts = useCallback(async () => {
    // For now, we'll show all posts - in production, filter by userId
    try {
      const res = await socialAPI.getPosts(1, 50);
      const userPosts = (res.data?.data || []).filter((p: any) => p.user?.id === userId);
      setPosts(userPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }, [userId]);

  const fetchFollowers = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await socialAPI.getFollowers(userId);
      setFollowers(res.data?.data || res.data || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  }, [userId]);

  const fetchFollowing = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await socialAPI.getFollowing(userId);
      setFollowing(res.data?.data || res.data || []);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  }, [userId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchProfile(), fetchPosts()]);
    setLoading(false);
    setRefreshing(false);
  }, [fetchProfile, fetchPosts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (activeTab === 'followers') {
      fetchFollowers();
    } else if (activeTab === 'following') {
      fetchFollowing();
    }
  }, [activeTab, fetchFollowers, fetchFollowing]);

  const handleFollow = async () => {
    if (!profile || !currentUser || followLoading) return;
    setFollowLoading(true);
    try {
      const res = await socialAPI.followUser(profile.id);
      setProfile({
        ...profile,
        isFollowing: res.data.following,
        followersCount: res.data.following 
          ? profile.followersCount + 1 
          : profile.followersCount - 1,
      });
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const navigateToPost = (post: Post) => {
    navigation.navigate('PostDetail', { 
      post: { ...post, user: profile } 
    });
  };

  const navigateToProfile = (user: any) => {
    if (user.id !== userId) {
      navigation.push('UserProfile', { userId: user.id });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textMuted }}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {profile.name}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Banner & Avatar */}
        <View style={styles.bannerContainer}>
          {profile.bannerUrl ? (
            <Image source={{ uri: profile.bannerUrl }} style={styles.banner} />
          ) : (
            <View style={[styles.banner, { backgroundColor: colors.primary }]} />
          )}
          <View style={[styles.avatarContainer, { borderColor: colors.background }]}>
            {profile.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                  {profile.name?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.profileHeader}>
            <View style={styles.nameContainer}>
              <Text style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
              <Text style={[styles.email, { color: colors.textMuted }]}>
                @{profile.email?.split('@')[0]}
              </Text>
            </View>
            {!isOwnProfile && currentUser && (
              <TouchableOpacity
                style={[
                  styles.followButton,
                  { 
                    backgroundColor: profile.isFollowing ? colors.background : colors.primary,
                    borderColor: colors.primary,
                  }
                ]}
                onPress={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? (
                  <ActivityIndicator size="small" color={profile.isFollowing ? colors.primary : '#fff'} />
                ) : (
                  <Text style={[
                    styles.followButtonText,
                    { color: profile.isFollowing ? colors.primary : '#fff' }
                  ]}>
                    {profile.isFollowing ? 'Following' : 'Follow'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {profile.bio && (
            <Text style={[styles.bio, { color: colors.text }]}>{profile.bio}</Text>
          )}

          <View style={styles.metaContainer}>
            {profile.location && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  {profile.location}
                </Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                Joined {formatDate(profile.created_at)}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => setActiveTab('posts')}
            >
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.postsCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => setActiveTab('followers')}
            >
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.followersCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => setActiveTab('following')}
            >
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.followingCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          {(['posts', 'followers', 'following'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text 
                style={[
                  styles.tabText, 
                  { color: activeTab === tab ? colors.primary : colors.textMuted }
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <View style={styles.postsContainer}>
            {posts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  No posts yet
                </Text>
              </View>
            ) : (
              posts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={[styles.postCard, { backgroundColor: colors.card }]}
                  onPress={() => navigateToPost(post)}
                >
                  <Text style={[styles.postContent, { color: colors.text }]} numberOfLines={3}>
                    {post.content}
                  </Text>
                  {post.imageUrl && (
                    <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
                  )}
                  <View style={styles.postStats}>
                    <View style={styles.postStat}>
                      <Ionicons name="heart" size={16} color={colors.textMuted} />
                      <Text style={[styles.postStatText, { color: colors.textMuted }]}>
                        {post.likesCount}
                      </Text>
                    </View>
                    <View style={styles.postStat}>
                      <Ionicons name="chatbubble" size={16} color={colors.textMuted} />
                      <Text style={[styles.postStatText, { color: colors.textMuted }]}>
                        {post.commentsCount}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === 'followers' && (
          <View style={styles.usersContainer}>
            {followers.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  No followers yet
                </Text>
              </View>
            ) : (
              followers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[styles.userCard, { backgroundColor: colors.card }]}
                  onPress={() => navigateToProfile(user)}
                >
                  <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.userAvatarText}>
                      {user.name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                    <Text style={[styles.userHandle, { color: colors.textMuted }]}>
                      @{user.email?.split('@')[0]}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === 'following' && (
          <View style={styles.usersContainer}>
            {following.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Not following anyone yet
                </Text>
              </View>
            ) : (
              following.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[styles.userCard, { backgroundColor: colors.card }]}
                  onPress={() => navigateToProfile(user)}
                >
                  <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.userAvatarText}>
                      {user.name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                    <Text style={[styles.userHandle, { color: colors.textMuted }]}>
                      @{user.email?.split('@')[0]}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  bannerContainer: {
    position: 'relative',
    marginBottom: 50,
  },
  banner: {
    width: '100%',
    height: 120,
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -40,
    left: 16,
    borderWidth: 4,
    borderRadius: 44,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  profileInfo: {
    paddingHorizontal: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
  },
  email: {
    fontSize: 14,
    marginTop: 2,
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
  },
  statItem: {
    marginRight: 24,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
  },
  tabBar: {
    flexDirection: 'row',
    marginTop: 16,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  postsContainer: {
    padding: 16,
  },
  postCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  postImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  postStats: {
    flexDirection: 'row',
    marginTop: 8,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  postStatText: {
    fontSize: 12,
    marginLeft: 4,
  },
  usersContainer: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userHandle: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});
