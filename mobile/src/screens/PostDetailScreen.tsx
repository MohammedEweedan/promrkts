import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { socialAPI, groupsAPI } from '../api/client';

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
};

type Post = {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  likesCount: number;
  commentsCount: number;
  likedByUser: boolean;
};

export default function PostDetailScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { post: initialPost } = route.params || {};

  const [post, setPost] = useState<Post | null>(initialPost);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);

  const fetchComments = useCallback(async () => {
    if (!post?.id) return;
    try {
      const res = await socialAPI.getComments(post.id);
      setComments(res.data?.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [post?.id]);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await groupsAPI.getMyGroups();
      setGroups(res.data?.data || res.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  }, []);

  useEffect(() => {
    fetchComments();
    fetchGroups();
  }, [fetchComments, fetchGroups]);

  const handleLike = async () => {
    if (!post || !user) return;
    try {
      const res = await socialAPI.likePost(post.id);
      setPost({
        ...post,
        likedByUser: res.data.liked,
        likesCount: res.data.liked ? post.likesCount + 1 : post.likesCount - 1,
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async () => {
    if (!post || !commentText.trim() || commenting) return;
    setCommenting(true);
    try {
      const res = await socialAPI.createComment(post.id, commentText.trim());
      setComments([...comments, res.data.data]);
      setCommentText('');
      setPost({ ...post, commentsCount: post.commentsCount + 1 });
    } catch (error) {
      console.error('Error creating comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setCommenting(false);
    }
  };

  const handleShare = async () => {
    if (!post) return;
    try {
      await Share.share({
        message: `${post.content}\n\nShared from promrkts`,
        title: 'Share Post',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSendToGroup = async (groupId: string) => {
    if (!post) return;
    try {
      await groupsAPI.sendMessage(
        groupId, 
        `Shared post: "${post.content}"`,
        post.imageUrl
      );
      setShowShareOptions(false);
      Alert.alert('Success', 'Post shared to group');
    } catch (error) {
      console.error('Error sending to group:', error);
      Alert.alert('Error', 'Failed to share to group');
    }
  };

  const navigateToProfile = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  if (!post) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textMuted }}>Post not found</Text>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Post</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.flex} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView style={styles.content}>
          {/* Post */}
          <View style={[styles.postCard, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={styles.postHeader}
              onPress={() => navigateToProfile(post.user.id)}
            >
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                  {post.user.name?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.postUserInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {post.user.name}
                </Text>
                <Text style={[styles.postTime, { color: colors.textMuted }]}>
                  {formatDate(post.createdAt)}
                </Text>
              </View>
            </TouchableOpacity>

            <Text style={[styles.postContent, { color: colors.text }]}>
              {post.content}
            </Text>

            {post.imageUrl && (
              <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
            )}

            <View style={[styles.postActions, { borderTopColor: colors.border }]}>
              <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                <Ionicons 
                  name={post.likedByUser ? 'heart' : 'heart-outline'} 
                  size={22} 
                  color={post.likedByUser ? '#EF4444' : colors.textMuted} 
                />
                <Text style={[styles.actionText, { color: colors.textMuted }]}>
                  {post.likesCount}
                </Text>
              </TouchableOpacity>

              <View style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={22} color={colors.textMuted} />
                <Text style={[styles.actionText, { color: colors.textMuted }]}>
                  {post.commentsCount}
                </Text>
              </View>

              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => setShowShareOptions(!showShareOptions)}
              >
                <Ionicons name="send-outline" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Share to Group Options */}
            {showShareOptions && groups.length > 0 && (
              <View style={[styles.shareOptions, { backgroundColor: colors.background }]}>
                <Text style={[styles.shareTitle, { color: colors.text }]}>
                  Send to Group
                </Text>
                {groups.map((group) => (
                  <TouchableOpacity
                    key={group.id}
                    style={[styles.groupOption, { borderBottomColor: colors.border }]}
                    onPress={() => handleSendToGroup(group.id)}
                  >
                    <Ionicons name="people" size={20} color={colors.primary} />
                    <Text style={[styles.groupName, { color: colors.text }]}>
                      {group.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Comments */}
          <View style={styles.commentsSection}>
            <Text style={[styles.commentsTitle, { color: colors.text }]}>
              Comments ({comments.length})
            </Text>

            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
            ) : comments.length === 0 ? (
              <Text style={[styles.noComments, { color: colors.textMuted }]}>
                No comments yet. Be the first to comment!
              </Text>
            ) : (
              comments.map((comment) => (
                <View 
                  key={comment.id} 
                  style={[styles.commentCard, { backgroundColor: colors.card }]}
                >
                  <TouchableOpacity 
                    style={styles.commentHeader}
                    onPress={() => comment.user && navigateToProfile(comment.user.id)}
                  >
                    <View style={[styles.commentAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={styles.commentAvatarText}>
                        {comment.user?.name?.charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                    <View style={styles.commentUserInfo}>
                      <Text style={[styles.commentUserName, { color: colors.text }]}>
                        {comment.user?.name || 'Anonymous'}
                      </Text>
                      <Text style={[styles.commentTime, { color: colors.textMuted }]}>
                        {formatDate(comment.createdAt)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <Text style={[styles.commentContent, { color: colors.text }]}>
                    {comment.content}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Comment Input */}
        {user && (
          <View style={[styles.commentInputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <TextInput
              style={[styles.commentInput, { color: colors.text, backgroundColor: colors.background }]}
              placeholder="Write a comment..."
              placeholderTextColor={colors.textMuted}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                { backgroundColor: commentText.trim() ? colors.primary : colors.border }
              ]}
              onPress={handleComment}
              disabled={!commentText.trim() || commenting}
            >
              {commenting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
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
  },
  content: {
    flex: 1,
  },
  postCard: {
    padding: 16,
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  postUserInfo: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  postTime: {
    fontSize: 12,
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
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
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
  },
  shareOptions: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  shareTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  groupOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  groupName: {
    marginLeft: 10,
    fontSize: 14,
  },
  commentsSection: {
    padding: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  noComments: {
    textAlign: 'center',
    marginTop: 20,
  },
  commentCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  commentUserInfo: {
    marginLeft: 10,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentTime: {
    fontSize: 11,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 42,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
