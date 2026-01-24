import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { groupsAPI } from '../api/client';
import { useNavigation } from '@react-navigation/native';

type Group = {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  imageUrl?: string;
  creatorId: string;
  isPublic: boolean;
  membersCount: number;
  messagesCount: number;
  isMember: boolean;
  role?: string;
};

type Message = {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

const POPULAR_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'EURUSD', 'GBPUSD', 'XAUUSD', 'SPX500', 'NAS100'];

export default function GroupsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation<any>();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'my'>('my');
  
  // Create group modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSymbol, setNewGroupSymbol] = useState('BTCUSDT');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [creating, setCreating] = useState(false);
  
  // Chat modal
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const loadGroups = useCallback(async () => {
    try {
      const [allResp, myResp] = await Promise.all([
        groupsAPI.getGroups(),
        isAuthenticated ? groupsAPI.getMyGroups() : Promise.resolve({ data: { data: [] } }),
      ]);
      setGroups(allResp.data?.data || []);
      setMyGroups(myResp.data?.data || []);
    } catch (error) {
      console.log('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    
    setCreating(true);
    try {
      await groupsAPI.createGroup({
        name: newGroupName.trim(),
        symbol: newGroupSymbol,
        description: newGroupDescription.trim() || undefined,
      });
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDescription('');
      loadGroups();
      Alert.alert('Success', 'Group created successfully!');
    } catch (error) {
      console.log('Failed to create group:', error);
      Alert.alert('Error', 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to join groups');
      return;
    }
    
    try {
      const resp = await groupsAPI.joinGroup(groupId);
      loadGroups();
      if (resp.data?.joined) {
        Alert.alert('Joined!', 'You have joined the group');
      }
    } catch (error) {
      console.log('Failed to join group:', error);
      Alert.alert('Error', 'Failed to join group');
    }
  };

  const openGroupChat = async (group: Group) => {
    setSelectedGroup(group);
    setLoadingMessages(true);
    try {
      const resp = await groupsAPI.getMessages(group.id);
      setMessages(resp.data?.data || []);
    } catch (error) {
      console.log('Failed to load messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return;
    
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to send messages');
      return;
    }

    if (!selectedGroup.isMember) {
      Alert.alert('Join Required', 'Please join the group to send messages');
      return;
    }
    
    setSending(true);
    try {
      const resp = await groupsAPI.sendMessage(selectedGroup.id, newMessage.trim());
      if (resp.data?.data) {
        setMessages(prev => [...prev, resp.data.data]);
        setNewMessage('');
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error: any) {
      console.log('Failed to send message:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderGroup = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      onPress={() => openGroupChat(item)}
    >
      <View style={styles.groupHeader}>
        <View style={[styles.groupIcon, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.groupIconText, { color: colors.primary }]}>
            {item.symbol.slice(0, 2)}
          </Text>
        </View>
        <View style={styles.groupInfo}>
          <Text style={[styles.groupName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.groupSymbol, { color: colors.primary }]}>{item.symbol}</Text>
        </View>
        {item.isMember ? (
          <View style={[styles.memberBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.memberBadgeText, { color: colors.primary }]}>Joined</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.joinButton, { backgroundColor: colors.primary }]}
            onPress={() => handleJoinGroup(item.id)}
          >
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        )}
      </View>
      {item.description && (
        <Text style={[styles.groupDescription, { color: colors.textMuted }]} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <View style={styles.groupStats}>
        <View style={styles.groupStat}>
          <Ionicons name="people-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.groupStatText, { color: colors.textMuted }]}>
            {item.membersCount} members
          </Text>
        </View>
        <View style={styles.groupStat}>
          <Ionicons name="chatbubble-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.groupStatText, { color: colors.textMuted }]}>
            {item.messagesCount} messages
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.userId === user?.id;
    return (
      <View style={[styles.messageContainer, isMe && styles.messageContainerMe]}>
        <View
          style={[
            styles.messageBubble,
            isMe
              ? [styles.messageBubbleMe, { backgroundColor: colors.primary }]
              : [styles.messageBubbleOther, { backgroundColor: colors.card }],
          ]}
        >
          {!isMe && (
            <Text style={[styles.messageSender, { color: colors.primary }]}>
              {item.user?.name || 'User'}
            </Text>
          )}
          <Text style={[styles.messageText, { color: isMe ? '#fff' : colors.text }]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textMuted }]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const displayGroups = activeTab === 'my' ? myGroups : groups;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Trading Groups</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            if (!isAuthenticated) {
              Alert.alert('Login Required', 'Please login to create groups');
              return;
            }
            setShowCreateModal(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && [styles.tabActive, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'discover' ? colors.primary : colors.textMuted }]}>
            Discover
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && [styles.tabActive, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'my' ? colors.primary : colors.textMuted }]}>
            My Groups
          </Text>
        </TouchableOpacity>
      </View>

      {/* Groups List */}
      <FlatList
        data={displayGroups}
        renderItem={renderGroup}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {activeTab === 'my' ? 'You haven\'t joined any groups yet' : 'No groups available'}
            </Text>
            {activeTab === 'discover' && (
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.emptyButtonText}>Create First Group</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Create Group Modal */}
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Create Group</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Group Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                placeholder="e.g., Bitcoin Bulls"
                placeholderTextColor={colors.textMuted}
                value={newGroupName}
                onChangeText={setNewGroupName}
              />

              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Trading Pair *</Text>
              <View style={styles.symbolPicker}>
                {POPULAR_SYMBOLS.map((sym) => (
                  <TouchableOpacity
                    key={sym}
                    style={[
                      styles.symbolOption,
                      {
                        backgroundColor: newGroupSymbol === sym ? colors.primary : colors.background,
                        borderColor: newGroupSymbol === sym ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setNewGroupSymbol(sym)}
                  >
                    <Text
                      style={[
                        styles.symbolOptionText,
                        { color: newGroupSymbol === sym ? '#fff' : colors.text },
                      ]}
                    >
                      {sym}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Description (optional)</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                placeholder="What's this group about?"
                placeholderTextColor={colors.textMuted}
                value={newGroupDescription}
                onChangeText={setNewGroupDescription}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={[styles.createGroupButton, { backgroundColor: colors.primary, opacity: creating ? 0.7 : 1 }]}
                onPress={handleCreateGroup}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createGroupButtonText}>Create Group</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Chat Modal */}
      <Modal
        visible={!!selectedGroup}
        animationType="slide"
        onRequestClose={() => setSelectedGroup(null)}
      >
        <SafeAreaView style={[styles.chatContainer, { backgroundColor: colors.background }]}>
          {/* Chat Header */}
          <View style={[styles.chatHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setSelectedGroup(null)}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Text style={[styles.chatHeaderTitle, { color: colors.text }]}>{selectedGroup?.name}</Text>
              <Text style={[styles.chatHeaderSubtitle, { color: colors.primary }]}>{selectedGroup?.symbol}</Text>
            </View>
            <View style={styles.chatHeaderRight}>
              <Text style={[styles.chatMemberCount, { color: colors.textMuted }]}>
                {selectedGroup?.membersCount} members
              </Text>
            </View>
          </View>

          {/* Messages */}
          {loadingMessages ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesContent}
              ListEmptyComponent={
                <View style={styles.emptyMessages}>
                  <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
                  <Text style={[styles.emptyMessagesText, { color: colors.textMuted }]}>
                    No messages yet. Start the conversation!
                  </Text>
                </View>
              }
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />
          )}

          {/* Message Input */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.messageInputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
              {!selectedGroup?.isMember ? (
                <TouchableOpacity
                  style={[styles.joinToChat, { backgroundColor: colors.primary }]}
                  onPress={() => selectedGroup && handleJoinGroup(selectedGroup.id)}
                >
                  <Text style={styles.joinToChatText}>Join group to send messages</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TextInput
                    style={[styles.messageInput, { backgroundColor: colors.inputBg, color: colors.text }]}
                    placeholder="Type a message..."
                    placeholderTextColor={colors.textMuted}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, { backgroundColor: colors.primary, opacity: sending || !newMessage.trim() ? 0.5 : 1 }]}
                    onPress={handleSendMessage}
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="send" size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginLeft: -40,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  groupCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupIconText: {
    fontSize: 16,
    fontWeight: '700',
  },
  groupInfo: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
  },
  groupSymbol: {
    fontSize: 13,
    marginTop: 2,
  },
  memberBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  memberBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  groupDescription: {
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  groupStats: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  groupStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupStatText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  symbolPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  symbolOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  symbolOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  createGroupButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  createGroupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  chatHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatHeaderSubtitle: {
    fontSize: 13,
  },
  chatHeaderRight: {
    alignItems: 'flex-end',
  },
  chatMemberCount: {
    fontSize: 12,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyMessages: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyMessagesText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  messageContainerMe: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleMe: {
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    borderBottomLeftRadius: 4,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  messageInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinToChat: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  joinToChatText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
