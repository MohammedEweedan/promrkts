import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components';

type Post = {
  id: string;
  author: {
    name: string;
    avatar?: string;
    username: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  createdAt: string;
};

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: { name: 'Alex Trader', username: '@alextrader', avatar: undefined },
    content: 'Just closed a great trade on EUR/USD! The market analysis from the academy really helped me spot this setup. 📈💰',
    likes: 24,
    comments: 8,
    shares: 3,
    liked: false,
    createdAt: '2h ago',
  },
  {
    id: '2',
    author: { name: 'Sarah Markets', username: '@sarahm', avatar: undefined },
    content: 'Anyone else watching the gold breakout? Looking like a strong move incoming! What are your thoughts? 🪙',
    likes: 45,
    comments: 12,
    shares: 7,
    liked: true,
    createdAt: '4h ago',
  },
  {
    id: '3',
    author: { name: 'Mike Finance', username: '@mikef', avatar: undefined },
    content: 'Completed the advanced technical analysis course today! Highly recommend it to everyone starting their trading journey. 🎓',
    likes: 67,
    comments: 15,
    shares: 10,
    liked: false,
    createdAt: '6h ago',
  },
  {
    id: '4',
    author: { name: 'Emma Crypto', username: '@emmac', avatar: undefined },
    content: 'BTC looking strong at this support level. Accumulating here for the next leg up! Who else is bullish? 🚀',
    image: 'https://via.placeholder.com/400x200',
    likes: 89,
    comments: 23,
    shares: 15,
    liked: false,
    createdAt: '8h ago',
  },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [refreshing, setRefreshing] = useState(false);
  const [newPost, setNewPost] = useState('');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const toggleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    
    const post: Post = {
      id: Date.now().toString(),
      author: {
        name: user?.name || 'You',
        username: `@${user?.email?.split('@')[0] || 'user'}`,
      },
      content: newPost,
      likes: 0,
      comments: 0,
      shares: 0,
      liked: false,
      createdAt: 'Just now',
    };
    
    setPosts([post, ...posts]);
    setNewPost('');
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.postHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{item.author.name[0]}</Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={[styles.authorName, { color: colors.text }]}>{item.author.name}</Text>
          <Text style={[styles.authorUsername, { color: colors.textMuted }]}>
            {item.author.username} · {item.createdAt}
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.postContent, { color: colors.text }]}>{item.content}</Text>

      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />
      )}

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => toggleLike(item.id)}>
          <Ionicons
            name={item.liked ? 'heart' : 'heart-outline'}
            size={22}
            color={item.liked ? colors.error : colors.textMuted}
          />
          <Text style={[styles.actionText, { color: colors.textMuted }]}>{item.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.textMuted} />
          <Text style={[styles.actionText, { color: colors.textMuted }]}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={22} color={colors.textMuted} />
          <Text style={[styles.actionText, { color: colors.textMuted }]}>{item.shares}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View style={[styles.createPostContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
      </View>
      <TextInput
        style={[styles.createPostInput, { color: colors.text, backgroundColor: colors.inputBg }]}
        placeholder={t('home.create_post')}
        placeholderTextColor={colors.textMuted}
        value={newPost}
        onChangeText={setNewPost}
        multiline
      />
      <TouchableOpacity
        style={[styles.postButton, { backgroundColor: colors.primary, opacity: newPost.trim() ? 1 : 0.5 }]}
        onPress={handleCreatePost}
        disabled={!newPost.trim()}
      >
        <Ionicons name="send" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <Header showNotifications onNotificationPress={() => {}} />
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader as any}
        contentContainerStyle={styles.listContent as any}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t('home.no_posts')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
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
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    maxHeight: 100,
  },
  postButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontSize: 15,
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
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
});
