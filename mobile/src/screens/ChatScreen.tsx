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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const SUGGESTIONS = [
  { key: 'market_analysis', icon: 'trending-up' },
  { key: 'trading_tips', icon: 'bulb' },
  { key: 'explain_concept', icon: 'school' },
  { key: 'portfolio_review', icon: 'pie-chart' },
];

export default function ChatScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(typingAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      typingAnim.setValue(0);
    }
  }, [isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses: Record<string, string> = {
        market: "Based on current market conditions, I'm seeing strong momentum in the tech sector. The S&P 500 is showing bullish patterns with support at key levels. For forex, EUR/USD is consolidating near resistance. Would you like me to dive deeper into any specific market?",
        trading: "Here are some key trading tips:\n\n1. **Risk Management**: Never risk more than 1-2% of your capital per trade\n2. **Plan Your Trades**: Always have entry, stop-loss, and take-profit levels before entering\n3. **Keep a Journal**: Track all your trades to identify patterns\n4. **Stay Disciplined**: Stick to your strategy, don't let emotions drive decisions\n\nWould you like me to elaborate on any of these?",
        explain: "I'd be happy to explain any trading concept! Some popular topics include:\n\n• Technical Analysis (candlesticks, indicators)\n• Fundamental Analysis\n• Risk/Reward Ratios\n• Position Sizing\n• Market Psychology\n\nWhat would you like to learn about?",
        portfolio: "I can help you review your portfolio strategy. To provide the best analysis, I'd need to know:\n\n1. Your current asset allocation\n2. Investment timeline\n3. Risk tolerance\n4. Financial goals\n\nShare what you're comfortable with and I'll provide personalized insights!",
        default: "I'm here to help with your trading journey! I can assist with:\n\n📊 Market analysis and trends\n💡 Trading strategies and tips\n📚 Educational content\n📈 Portfolio optimization\n\nWhat would you like to explore today?",
      };

      let response = aiResponses.default;
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('market') || lowerText.includes('analysis')) {
        response = aiResponses.market;
      } else if (lowerText.includes('tip') || lowerText.includes('advice')) {
        response = aiResponses.trading;
      } else if (lowerText.includes('explain') || lowerText.includes('what is') || lowerText.includes('learn')) {
        response = aiResponses.explain;
      } else if (lowerText.includes('portfolio') || lowerText.includes('review')) {
        response = aiResponses.portfolio;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestion = (key: string) => {
    const suggestionText = t(`chat.suggestions.${key}`);
    sendMessage(suggestionText);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';

    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <LinearGradient
            colors={['#65a8bf', '#4a8a9f']}
            style={styles.avatarGradient}
          >
            <Ionicons name="sparkles" size={16} color="#fff" />
          </LinearGradient>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isUser ? '#fff' : colors.text },
            ]}
          >
            {item.content}
          </Text>
        </View>
        {isUser && (
          <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={16} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  const renderWelcome = () => (
    <View style={styles.welcomeContainer}>
      <LinearGradient
        colors={['#65a8bf', '#4a8a9f']}
        style={styles.welcomeIcon}
      >
        <Ionicons name="sparkles" size={40} color="#fff" />
      </LinearGradient>
      <Text style={[styles.welcomeTitle, { color: colors.text }]}>
        {t('chat.title')}
      </Text>
      <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
        {t('chat.welcome')}
      </Text>

      <View style={styles.suggestionsGrid}>
        {SUGGESTIONS.map(suggestion => (
          <TouchableOpacity
            key={suggestion.key}
            style={[styles.suggestionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleSuggestion(suggestion.key)}
          >
            <Ionicons
              name={suggestion.icon as any}
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.suggestionText, { color: colors.text }]}>
              {t(`chat.suggestions.${suggestion.key}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={[styles.messageRow]}>
        <LinearGradient
          colors={['#65a8bf', '#4a8a9f']}
          style={styles.avatarGradient}
        >
          <Ionicons name="sparkles" size={16} color="#fff" />
        </LinearGradient>
        <View style={[styles.typingBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Animated.View style={[styles.typingDot, { opacity: typingAnim, backgroundColor: colors.primary }]} />
          <Animated.View style={[styles.typingDot, { opacity: typingAnim, backgroundColor: colors.primary, marginHorizontal: 4 }]} />
          <Animated.View style={[styles.typingDot, { opacity: typingAnim, backgroundColor: colors.primary }]} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {messages.length === 0 ? (
          renderWelcome()
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList as any}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            ListFooterComponent={renderTypingIndicator as any}
          />
        )}

        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg }]}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? colors.primary : colors.surface },
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isTyping}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? '#fff' : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  suggestionCard: {
    width: '45%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  avatarGradient: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 14,
    borderRadius: 18,
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  typingBubble: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
