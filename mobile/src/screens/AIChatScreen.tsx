import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const TAB_BAR_HEIGHT = 85;

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const QUICK_SUGGESTIONS = [
  { icon: 'trending-up', text: 'Render BTC chart & analyze', prompt: 'Show me a chart for BTCUSDT and analyze the current trend' },
  { icon: 'analytics', text: 'Analyze my trade journal', prompt: 'Look through my trade journal and analyze my recent trades' },
  { icon: 'warning', text: 'Analyze my losing trades', prompt: 'Analyze my losing trades and identify patterns I should avoid' },
  { icon: 'globe', text: 'Market outlook today', prompt: 'What is the outlook for the markets today? Any major events?' },
  { icon: 'newspaper', text: 'Latest crypto news', prompt: 'What is the latest news affecting the crypto market?' },
  { icon: 'cash', text: 'Gold & forex outlook', prompt: 'What is the outlook for gold and major forex pairs?' },
];

type Props = {
  embedded?: boolean;
};

export default function AIChatScreen({ embedded = false }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI trading assistant. I can help you analyze charts, review your trade journal, identify patterns in your trades, and provide market insights. What would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you want to: "${messageText}". This feature is being developed. Soon I'll be able to analyze charts, review your journal, and provide real-time market insights!`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageContainer, isUser ? styles.messageContainerUser : styles.messageContainerAssistant]}>
        {!isUser && (
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="sparkles" size={16} color="#fff" />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser
              ? [styles.messageBubbleUser, { backgroundColor: colors.primary }]
              : [styles.messageBubbleAssistant, { backgroundColor: colors.card }],
          ]}
        >
          <Text style={[styles.messageText, { color: isUser ? '#fff' : colors.text }]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, { color: isUser ? 'rgba(255,255,255,0.7)' : colors.textMuted }]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const Wrapper: any = embedded ? View : SafeAreaView;
  const wrapperProps = embedded
    ? { style: [styles.container, { backgroundColor: colors.background }] }
    : { style: [styles.container, { backgroundColor: colors.background }], edges: ['left', 'right'] };

  const reservedBottom = embedded ? TAB_BAR_HEIGHT : 0;

  return (
    <Wrapper {...wrapperProps}>
      {!embedded && (
        <SafeAreaView edges={['top']} style={{ backgroundColor: colors.card }}>
          <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={[styles.aiIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="sparkles" size={24} color="#fff" />
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>AI Trading Assistant</Text>
              <Text style={[styles.headerSubtitle, { color: colors.success }]}>● Online</Text>
            </View>
          </View>
        </SafeAreaView>
      )}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.messagesContent, { paddingBottom: 20 + reservedBottom + 72 }]}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        style={styles.messagesList}
        ListHeaderComponent={
          messages.length === 1 ? (
            <View style={styles.suggestionsContainer}>
              <Text style={[styles.suggestionsTitle, { color: colors.textMuted }]}>Quick Actions</Text>
              <View style={styles.suggestionsGrid}>
                {QUICK_SUGGESTIONS.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.suggestionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => handleSend(suggestion.prompt)}
                  >
                    <Ionicons name={suggestion.icon as any} size={24} color={colors.primary} />
                    <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={2}>
                      {suggestion.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null
        }
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <View style={[styles.typingIndicator, { backgroundColor: colors.card }]}>
            <View style={[styles.typingDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.typingDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.typingDot, { backgroundColor: colors.primary }]} />
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.card, borderTopColor: colors.border, marginBottom: reservedBottom },
          ]}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Ask me anything about trading..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: inputText.trim() && !loading ? colors.primary : colors.border }]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || loading}
            >
              <Ionicons name="arrow-up" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          {!embedded && <SafeAreaView edges={['bottom']} />}
        </View>
      </KeyboardAvoidingView>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  suggestionsContainer: {
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  suggestionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  messageContainerUser: {
    alignSelf: 'flex-end',
  },
  messageContainerAssistant: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    borderRadius: 18,
    padding: 12,
    paddingHorizontal: 16,
    maxWidth: '100%',
  },
  messageBubbleUser: {
    borderBottomRightRadius: 4,
  },
  messageBubbleAssistant: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    alignSelf: 'flex-start',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  inputWrapper: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 48,
    borderWidth: 1,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
