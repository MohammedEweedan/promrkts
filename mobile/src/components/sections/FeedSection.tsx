import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { socialAPI } from '../../api/client';

type Post = {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    level?: number;
    totalXP?: number;
  };
  likesCount: number;
  commentsCount: number;
  likedByUser: boolean;
};

type Props = {
  refreshing: boolean;
  onRefresh: () => void;
};

export default function FeedSection({ refreshing, onRefresh }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const loadPosts = useCallback(async () => {
    try {
      const resp = await socialAPI.getPosts(1, 50);
      setPosts(resp.data?.data || []);
    } catch (error) {
      console.log('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const toggleLike = async (postId: string) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to like posts');
      return;
    }
    try {
      const resp = await socialAPI.likePost(postId);
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { 
                ...post, 
                likedByUser: resp.data?.liked ?? !post.likedByUser, 
                likesCount: resp.data?.liked ? post.likesCount + 1 : post.likesCount - 1 
              }
            : post
        )
      );
    } catch (error) {
      console.log('Failed to toggle like:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to create posts');
      return;
    }
    
    setPosting(true);
    try {
      const resp = await socialAPI.createPost(newPost.trim());
      if (resp.data?.data) {
        setPosts([resp.data.data, ...posts]);
      }
      setNewPost('');
      setShowCreateModal(false);
    } catch (error) {
      console.log('Failed to create post:', error);
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const openCreateModal = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to create posts');
      return;
    }
    navigation.navigate('CreatePost');
  };

  const navigateToPostDetail = (post: Post) => {
    navigation.navigate('PostDetail', { post });
  };

  const navigateToUserProfile = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  const handleShare = async (post: Post) => {
    try {
      await Share.share({
        message: `${post.content}\n\nShared from ProMrkts`,
        title: 'Share Post',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const toggleFollow = async (userId: string, event?: any) => {
    if (event) event.stopPropagation();
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to follow users');
      return;
    }
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

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity 
      style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      onPress={() => navigateToPostDetail(item)}
      activeOpacity={0.8}
    >
      <View style={styles.postHeader}>
        <TouchableOpacity 
          style={styles.authorSection}
          onPress={() => item.user?.id && navigateToUserProfile(item.user.id)}
        >
          <View style={styles.avatarContainer}>
            {item.user?.avatarUrl ? (
              <Image source={{ uri: item.user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primary + '30' }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>
                  {(item.user?.name || 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}
            {item.user?.level && (
              <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.levelText}>{item.user.level}</Text>
              </View>
            )}
          </View>
          <View style={styles.authorInfo}>
            <Text style={[styles.authorName, { color: colors.text }]}>{item.user?.name || t('common.loading')}</Text>
            <Text style={[styles.authorUsername, { color: colors.textMuted }]}>
              @{item.user?.email?.split('@')[0] || 'user'} · {formatTime(item.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>
        {item.user?.id && item.user.id !== user?.id && (
          <TouchableOpacity
            style={[
              styles.followButtonSmall,
              followingIds.has(item.user.id)
                ? { backgroundColor: colors.surface, borderColor: colors.border }
                : { backgroundColor: colors.primary },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              if (item.user?.id) toggleFollow(item.user.id, e);
            }}
          >
            <Text
              style={[
                styles.followButtonSmallText,
                followingIds.has(item.user.id) ? { color: colors.text } : { color: '#fff' },
              ]}
            >
              {followingIds.has(item.user.id) ? t('common.following') : t('common.follow')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.postContent, { color: colors.text }]}>{item.content}</Text>

      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} resizeMode="cover" />
      )}

      <View style={[styles.postActions, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.actionButton} onPress={() => toggleLike(item.id)}>
          <Ionicons
            name={item.likedByUser ? 'heart' : 'heart-outline'}
            size={20}
            color={item.likedByUser ? colors.error : colors.textMuted}
          />
          <Text style={[styles.actionText, { color: colors.textMuted }]}>{item.likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigateToPostDetail(item)}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.textMuted} />
          <Text style={[styles.actionText, { color: colors.textMuted }]}>{item.commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item)}>
          <Ionicons name="share-social-outline" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { onRefresh(); loadPosts(); }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t('home.no_posts') || 'No posts yet. Be the first to share!'}
            </Text>
          </View>
        }
      />
      
      {/* Floating Create Post Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: colors.primary }]}
        onPress={openCreateModal}
      >
        <Ionicons name="create-outline" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Create Post Modal - inlined to prevent re-render issues */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => { setShowCreateModal(false); setNewPost(''); }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Create Post</Text>
              <TouchableOpacity
                onPress={handleCreatePost}
                disabled={!newPost.trim() || posting}
              >
                {posting ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={[styles.postButtonText, { color: colors.primary, opacity: newPost.trim() ? 1 : 0.5 }]}>
                    Post
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={[styles.userRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.avatar, { backgroundColor: colors.primary + '30' }]}>
                  <Text style={[styles.avatarText, { color: colors.primary }]}>
                    {(user?.name || 'U')[0].toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'User'}</Text>
              </View>
              
              <TextInput
                style={[styles.modalInput, { color: colors.text }]}
                placeholder="What's on your mind?"
                placeholderTextColor={colors.textMuted}
                value={newPost}
                onChangeText={setNewPost}
                multiline
                maxLength={500}
              />
              
              <Text style={[styles.charCount, { color: colors.textMuted }]}>
                {newPost.length}/500
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalBody: {
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  modalInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  createPostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  createPostInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
  },
  postButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  postCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authorSection: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
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
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  authorUsername: {
    fontSize: 13,
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  followButtonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  followButtonSmallText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
