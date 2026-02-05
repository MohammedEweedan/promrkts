import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  Modal,
  FlatList,
  Share,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useRoute, useNavigation } from "@react-navigation/native";
import api from "../api/client";
import { EncryptionService } from "../services/encryption.service";

// OPTIONAL (recommended) for embedded widgets/charts inside chat bubbles:
// yarn add react-native-webview
import { WebView } from "react-native-webview";

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isVerified?: boolean;
  contentType?: string;
  sender: { id: string; name: string; avatar_url?: string };
  receiver: { id: string; name: string; avatar_url?: string };
};

type User = {
  id: string;
  name: string;
  avatar_url?: string;
  avatarUrl?: string;
  email: string;
};

// If your backend only supports "content: string", we encode special messages as:
//  - TV price widget:   [TV_PRICE:SYMBOL]
//  - Candlestick chart: [TV_CANDLE:SYMBOL]
const isTVPrice = (content: string) => content?.startsWith("[TV_PRICE:") && content.endsWith("]");
const isTVCandle = (content: string) => content?.startsWith("[TV_CANDLE:") && content.endsWith("]");
const extractSymbol = (content: string) =>
  content.replace("[TV_PRICE:", "").replace("[TV_CANDLE:", "").replace("]", "").trim();

function tradingViewMiniPriceHTML(symbol: string) {
  // Mini Symbol Overview widget (price line + stats)
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      html, body { margin:0; padding:0; background: transparent; }
      #tv { width: 100%; height: 180px; }
    </style>
  </head>
  <body>
    <div class="tradingview-widget-container" id="tv">
      <div id="tradingview_widget"></div>
    </div>
    <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
    <script>
      new TradingView.widget({
        "autosize": true,
        "symbol": "${symbol}",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "light",
        "style": "2",
        "locale": "en",
        "hide_top_toolbar": true,
        "hide_legend": true,
        "allow_symbol_change": false,
        "container_id": "tradingview_widget"
      });
    </script>
  </body>
</html>`;
}

function tradingViewCandleHTML(symbol: string) {
  // Advanced chart (candlesticks)
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      html, body { margin:0; padding:0; background: transparent; }
      #tv { width: 100%; height: 260px; }
    </style>
  </head>
  <body>
    <div class="tradingview-widget-container" id="tv">
      <div id="tradingview_chart"></div>
    </div>
    <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
    <script>
      new TradingView.widget({
        "autosize": true,
        "symbol": "${symbol}",
        "interval": "60",
        "timezone": "Etc/UTC",
        "theme": "light",
        "style": "1",
        "locale": "en",
        "hide_side_toolbar": true,
        "hide_top_toolbar": true,
        "allow_symbol_change": false,
        "container_id": "tradingview_chart"
      });
    </script>
  </body>
</html>`;
}

export default function MessagesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = route.params as { user?: User } | undefined;
  const selectedUser = routeParams?.user;
  const [alertShown, setAlertShown] = useState(false);

  // Add fallback for when selectedUser is not provided
  React.useEffect(() => {
    if (!selectedUser) {
      console.log('No selected user provided, showing empty state');
      setLoading(false);
    }
  }, [selectedUser]);

  // Check if we're in the Tab Navigator (Chat tab) without params
  React.useEffect(() => {
    if (!selectedUser && route.name === 'Chat') {
      console.log('In Chat tab without user params, showing empty state');
      setLoading(false);
    }
  }, [selectedUser, route.name]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [encryptionKeys, setEncryptionKeys] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [receiverPublicKey, setReceiverPublicKey] = useState<string | null>(null);

  // WhatsApp-like: use an inverted FlatList
  const listRef = useRef<FlatList<Message>>(null);

  // Attachment modal for sharing chart/widget
  const [attachOpen, setAttachOpen] = useState(false);
  const [symbolModalOpen, setSymbolModalOpen] = useState<null | "price" | "candle">(null);
  const [symbolInput, setSymbolInput] = useState("NASDAQ:AAPL");

  useEffect(() => {
    // Only initialize encryption if we have a selected user
    if (selectedUser) {
      initializeEncryption();
    } else if (route.name === 'Chat') {
      // In Chat tab without user, load conversations
      loadConversations();
    }
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout - setting loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [selectedUser, route.name]);

  useEffect(() => {
    if (encryptionKeys) {
      loadMessages();
    }
  }, [encryptionKeys]);

  const initializeEncryption = async () => {
    console.log('initializeEncryption called');
    console.log('user:', user);
    console.log('selectedUser:', selectedUser);
    
    if (!user?.id) {
      console.log('Missing user.id');
      setLoading(false);
      return;
    }
    
    if (!selectedUser?.id) {
      console.log('Missing selectedUser.id');
      setLoading(false);
      return;
    }

    try {
      console.log('Initializing encryption for user:', user.id);
      
      // Get or generate user's encryption keys
      let keys = await EncryptionService.retrieveKeys(user.id);
      
      if (!keys) {
        console.log('Generating new encryption keys for user:', user.id);
        // Generate new keys if they don't exist
        keys = await EncryptionService.generateKeyPair();
        await EncryptionService.storeKeys(keys, user.id);
        
        // Send public key to backend
        await api.post('/messages/keys/generate', {
          publicKey: keys.publicKey,
        });
        console.log('Generated and stored encryption keys');
      } else {
        console.log('Found existing encryption keys');
      }
      
      setEncryptionKeys(keys);

      // Get receiver's public key - check locally first, then API
      try {
        console.log('Getting receiver public key for:', selectedUser.id);
        // Check if receiver keys exist locally (from previous conversations)
        const receiverKeys = await EncryptionService.retrieveKeys(selectedUser.id);
        if (receiverKeys) {
          setReceiverPublicKey(receiverKeys.publicKey);
          console.log('Found receiver keys locally');
        } else {
          // Try to get from API
          const response = await api.get(`/messages/keys/${selectedUser.id}`);
          setReceiverPublicKey(response.data.publicKey);
          console.log('Got receiver keys from API');
        }
      } catch (keyError) {
        console.log('Receiver has not generated encryption keys yet');
        // Don't show error for this - it's normal if the other user hasn't set up encryption yet
        setReceiverPublicKey(null);
      }
      
      console.log('Encryption initialization complete');
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      Alert.alert('Error', 'Failed to initialize encryption. Messages may not be secure.');
    }
  };

  const loadConversations = async () => {
    if (!user?.id) {
      console.log('Missing user for loading conversations');
      setLoading(false);
      return;
    }

    try {
      console.log('Loading conversations for user:', user.id);
      const response = await api.get('/messages/conversations');
      const data = Array.isArray(response.data) ? response.data : [];
      console.log('Loaded conversations:', data.length);
      
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedUser || !encryptionKeys) {
      console.log('Missing required data for loading messages');
      setLoading(false);
      return;
    }

    try {
      console.log('Loading messages for user:', selectedUser.id);
      const response = await api.get(`/messages/conversation/${selectedUser.id}`);
      const data = Array.isArray(response.data) ? response.data : [];
      console.log('Loaded messages:', data.length);
      
      // Decrypt messages
      const decryptedMessages = await Promise.all(
        data.map(async (msg: any) => {
          try {
            console.log('Decrypting message:', msg.id);
            
            // Skip decryption if receiver doesn't have keys yet
            if (!receiverPublicKey && msg.senderId !== user?.id) {
              console.log('Skipping decryption - receiver has no keys');
              return {
                ...msg,
                content: '[Waiting for recipient to enable encryption]',
                isVerified: false,
              };
            }

            const decrypted = await EncryptionService.decryptMessage(
              {
                encryptedContent: msg.encryptedContent,
                encryptionKey: msg.encryptionKey,
                senderPublicKey: msg.senderPublicKey,
                signature: msg.signature,
                iv: msg.iv,
                tag: msg.tag,
              },
              encryptionKeys.privateKey,
              msg.senderId === user?.id ? encryptionKeys.publicKey : receiverPublicKey!
            );
            
            console.log('Successfully decrypted message:', msg.id);
            return {
              ...msg,
              content: decrypted.content,
              isVerified: decrypted.isVerified,
            };
          } catch (error) {
            console.error('Failed to decrypt message:', error);
            return {
              ...msg,
              content: '[Unable to decrypt message]',
              isVerified: false,
            };
          }
        })
      );
      
      console.log('Decrypted all messages successfully');
      // Ensure newest last for inverted list rendering
      setMessages(decryptedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (contentOverride?: string) => {
    const contentToSend = (contentOverride ?? newMessage).trim();
    if (!contentToSend || !selectedUser || !encryptionKeys) return;

    // Generate receiver keys if they don't exist (like WhatsApp)
    if (!receiverPublicKey) {
      try {
        // Generate keys for the receiver (simulating WhatsApp behavior)
        const receiverKeys = await EncryptionService.generateKeyPair();
        
        // Store receiver's keys locally for this conversation
        // Note: In a real WhatsApp-like system, the receiver would generate their own keys
        // For demo purposes, we'll store them and use them for encryption
        await EncryptionService.storeKeys(receiverKeys, selectedUser.id);
        
        // Update receiver public key
        setReceiverPublicKey(receiverKeys.publicKey);
        
        console.log('Generated encryption keys for receiver:', selectedUser.id);
      } catch (error) {
        console.error('Failed to generate receiver keys:', error);
        Alert.alert('Error', 'Failed to enable encryption for this conversation.');
        return;
      }
    }

    setSending(true);
    try {
      // Encrypt the message
      const encrypted = await EncryptionService.encryptMessage(
        contentToSend,
        receiverPublicKey!,
        encryptionKeys.privateKey
      );

      const response = await api.post("/messages", {
        receiverId: selectedUser.id,
        content: contentToSend,
        encryptedContent: encrypted.encryptedContent,
        encryptionKey: encrypted.encryptionKey,
        senderPublicKey: encrypted.senderPublicKey,
        signature: encrypted.signature,
        iv: encrypted.iv,
        tag: encrypted.tag,
        contentType: "text",
      });

      const newMsg: Message = {
        id: response.data?.id || String(Date.now()),
        senderId: user?.id || "",
        receiverId: selectedUser.id,
        content: contentToSend,
        createdAt: new Date().toISOString(),
        isVerified: true,
        contentType: "text",
        sender: {
          id: user?.id || "",
          name: user?.name || "Unknown",
          avatar_url: (user as any)?.avatar,
        },
        receiver: selectedUser,
      };

      setMessages((prev) => [...prev, newMsg]);
      if (!contentOverride) setNewMessage("");
      // scroll to bottom (top of inverted)
      requestAnimationFrame(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }));
    } catch (error) {
      console.log("Failed to send message:", error);
      Alert.alert("Error", "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const onShareWidgetExternally = async (type: "price" | "candle", symbol: string) => {
    // Share a TradingView page link (works without embedding)
    // You can customize this to your own site too.
    const url = `https://www.tradingview.com/symbols/${encodeURIComponent(symbol.replace(":", "-"))}/`;
    const title = type === "price" ? `Price widget: ${symbol}` : `Candlestick chart: ${symbol}`;
    await Share.share({ message: `${title}\n${url}` });
  };

  const onSendWidgetIntoChat = async (type: "price" | "candle", symbol: string) => {
    const tag = type === "price" ? `[TV_PRICE:${symbol}]` : `[TV_CANDLE:${symbol}]`;
    setSymbolModalOpen(null);
    setAttachOpen(false);
    await sendMessage(tag);
  };

  const Bubble = ({ msg, isOwn }: { msg: Message; isOwn: boolean }) => {
    const content = msg.content || "";
    const time = formatTime(msg.createdAt);

    const bubbleBg = isOwn ? "#25D366" : colors.card; // WhatsApp green for own
    const textColor = isOwn ? "#fff" : colors.text;
    
    // Show verification status for encrypted messages
    const showVerification = msg.isVerified !== undefined;

    const symbol = isTVPrice(content) || isTVCandle(content) ? extractSymbol(content) : null;
    const isPrice = symbol && isTVPrice(content);
    const isCandle = symbol && isTVCandle(content);

    return (
      <View style={[styles.row, isOwn ? styles.rowRight : styles.rowLeft]}>
        {!isOwn && (
          <View style={styles.smallAvatarWrap}>
            {msg.sender?.avatar_url ? (
              <Image source={{ uri: msg.sender.avatar_url }} style={styles.smallAvatar} />
            ) : (
              <View style={[styles.smallAvatarFallback, { backgroundColor: colors.primary }]}>
                <Text style={styles.smallAvatarText}>
                  {msg.sender?.name?.[0]?.toUpperCase() || "U"}
                </Text>
              </View>
            )}
          </View>
        )}

        <View
          style={[
            styles.bubble,
            { backgroundColor: bubbleBg },
            isOwn ? styles.bubbleRight : styles.bubbleLeft,
          ]}
        >
          {symbol ? (
            <View style={styles.widgetCard}>
              <View style={styles.widgetHeader}>
                <Text style={[styles.widgetTitle, { color: textColor }]}>
                  {isPrice ? "Price Widget" : "Candlestick Chart"} • {symbol}
                </Text>

                <TouchableOpacity
                  onPress={() => onShareWidgetExternally(isPrice ? "price" : "candle", symbol)}
                  style={styles.widgetShareBtn}
                >
                  <Ionicons name="share-social" size={18} color={textColor} />
                </TouchableOpacity>
              </View>

              {/* Embedded widget/chart (WhatsApp-like “card”) */}
              <View style={styles.widgetWebWrap}>
                <WebView
                  originWhitelist={["*"]}
                  source={{
                    html: isPrice
                      ? tradingViewMiniPriceHTML(symbol)
                      : tradingViewCandleHTML(symbol),
                  }}
                  javaScriptEnabled
                  domStorageEnabled
                  style={styles.widgetWeb}
                  scrollEnabled={false}
                />
              </View>

              <View style={styles.timeRow}>
                <Text
                  style={[
                    styles.timeText,
                    { color: isOwn ? "rgba(255,255,255,0.85)" : colors.textMuted },
                  ]}
                >
                  {time}
                </Text>
                {showVerification && (
                  <Ionicons
                    name={msg.isVerified ? "checkmark-done" : "warning"}
                    size={12}
                    color={msg.isVerified 
                      ? (isOwn ? "rgba(255,255,255,0.7)" : colors.success)
                      : (isOwn ? "rgba(255,255,255,0.7)" : colors.warning)
                    }
                    style={styles.verificationIcon}
                  />
                )}
              </View>
            </View>
          ) : (
            <>
              <Text style={[styles.msgText, { color: textColor }]}>{content}</Text>
              <View style={styles.timeRow}>
                <Text
                  style={[
                    styles.timeText,
                    { color: isOwn ? "rgba(255,255,255,0.85)" : colors.textMuted },
                  ]}
                >
                  {time}
                </Text>
                {showVerification && (
                  <Ionicons
                    name={msg.isVerified ? "checkmark-done" : "warning"}
                    size={12}
                    color={msg.isVerified 
                      ? (isOwn ? "rgba(255,255,255,0.7)" : colors.success)
                      : (isOwn ? "rgba(255,255,255,0.7)" : colors.warning)
                    }
                    style={styles.verificationIcon}
                  />
                )}
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  const dataForList = useMemo(() => {
    // FlatList inverted expects newest FIRST. We keep messages newest LAST, so reverse here.
    return [...messages].reverse();
  }, [messages]);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top", "left", "right"]}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedUser) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top", "left", "right"]}
      >
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
        </View>
        <View style={styles.chatListContainer}>
          {conversations.length > 0 ? (
            <FlatList
              data={conversations}
              keyExtractor={(item, index) => item.id || `conversation-${index}`}
              contentContainerStyle={styles.conversationsList}
              renderItem={({ item, index }) => {
                console.log('Rendering conversation item:', item);
                const otherUser = item.senderId === user?.id ? item.receiver : item.sender;
                return (
                  <TouchableOpacity
                    key={`conversation-${item.id || index}`}
                    style={[styles.conversationItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => (navigation as any).navigate("Messages", { user: otherUser })}
                  >
                    <View style={styles.conversationAvatar}>
                      {otherUser?.avatar_url ? (
                        <Image source={{ uri: otherUser.avatar_url }} style={styles.avatar} />
                      ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                          <Text style={styles.avatarText}>{otherUser?.name?.[0]?.toUpperCase() || "U"}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.conversationContent}>
                      <Text style={[styles.conversationName, { color: colors.text }]} numberOfLines={1}>
                        {otherUser?.name || 'Unknown User'}
                      </Text>
                      <Text style={[styles.conversationLastMessage, { color: colors.textMuted }]} numberOfLines={1}>
                        {typeof item.lastMessage === 'string' ? item.lastMessage : 'No messages yet'}
                      </Text>
                    </View>
                    <View style={styles.conversationMeta}>
                      <Text style={[styles.conversationTime, { color: colors.textMuted }]}>
                        {item.lastMessageTime ? formatTime(item.lastMessageTime) : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.textMuted} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                No conversations yet
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: colors.textMuted }]}>
                Start a conversation by searching for users and tapping the Message button
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      // ✅ “same top margin to protect the top” = include 'top'
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* WhatsApp-like header */}
      <View
        style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerAvatar}>
          {selectedUser?.avatar_url ? (
            <Image source={{ uri: selectedUser.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{selectedUser?.name?.[0]?.toUpperCase() || "U"}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {selectedUser.name}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Active now</Text>
        </View>

        <TouchableOpacity onPress={() => setAttachOpen(true)} style={styles.headerBtn}>
          <Ionicons name="add-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* WhatsApp vibe background */}
      <ImageBackground
        source={require("../../assets/icon.png")} // <-- add your own subtle pattern image (or remove ImageBackground)
        resizeMode="repeat"
        style={styles.bg}
        imageStyle={{ opacity: 0.08 }}
      >
        <FlatList
          ref={listRef}
          data={dataForList}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <Bubble msg={item} isOwn={item.senderId === user?.id} />}
          onContentSizeChange={() => {
            // keep pinned to bottom in WhatsApp style
            listRef.current?.scrollToOffset({ offset: 0, animated: false });
          }}
        />

        {/* Input */}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View
            style={[
              styles.inputBar,
              { backgroundColor: colors.card, borderTopColor: colors.border },
            ]}
          >
            <TouchableOpacity onPress={() => setAttachOpen(true)} style={styles.attachBtn}>
              <Ionicons name="add" size={24} color={colors.textMuted} />
            </TouchableOpacity>

            <View
              style={[
                styles.inputPill,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            >
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="Message"
                placeholderTextColor={colors.textMuted}
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
                maxLength={500}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: newMessage.trim() ? "#25D366" : colors.inputBg },
              ]}
              onPress={() => sendMessage()}
              disabled={!newMessage.trim() || sending}
            >
              <Ionicons
                name="send"
                size={18}
                color={newMessage.trim() ? "#fff" : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>

      {/* Attach modal */}
      <Modal visible={attachOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Share</Text>
              <TouchableOpacity onPress={() => setAttachOpen(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.actionRow, { borderColor: colors.border }]}
              onPress={() => {
                setSymbolInput("NASDAQ:AAPL");
                setSymbolModalOpen("price");
              }}
            >
              <Ionicons name="stats-chart" size={20} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Share price widget (TradingView)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionRow, { borderColor: colors.border }]}
              onPress={() => {
                setSymbolInput("NASDAQ:AAPL");
                setSymbolModalOpen("candle");
              }}
            >
              <Ionicons name="trending-up" size={20} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Share candlestick chart (TradingView)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionRow, { borderColor: colors.border }]}
              onPress={() =>
                Alert.alert("Info", "Biometric settings live in Account Settings screen")
              }
            >
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>Security options</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Symbol modal */}
      <Modal visible={!!symbolModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {symbolModalOpen === "price" ? "Price widget" : "Candlestick chart"}
              </Text>
              <TouchableOpacity onPress={() => setSymbolModalOpen(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.helpText, { color: colors.textMuted }]}>
              Enter a symbol like: <Text style={{ fontWeight: "700" }}>NASDAQ:AAPL</Text> or{" "}
              <Text style={{ fontWeight: "700" }}>BINANCE:BTCUSDT</Text>
            </Text>

            <View
              style={[
                styles.symbolInputWrap,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            >
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                value={symbolInput}
                onChangeText={setSymbolInput}
                placeholder="EXCHANGE:SYMBOL"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                style={[styles.symbolInput, { color: colors.text }]}
              />
            </View>

            <View style={styles.symbolActions}>
              <TouchableOpacity
                style={[styles.symbolBtn, { borderColor: colors.border }]}
                onPress={() => onShareWidgetExternally(symbolModalOpen as any, symbolInput.trim())}
              >
                <Ionicons name="share-social" size={18} color={colors.text} />
                <Text style={[styles.symbolBtnText, { color: colors.text }]}>Share link</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.symbolBtnPrimary, { backgroundColor: "#25D366" }]}
                onPress={() => onSendWidgetIntoChat(symbolModalOpen as any, symbolInput.trim())}
              >
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={[styles.symbolBtnTextPrimary, { color: "#fff" }]}>Send in chat</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.tinyNote, { color: colors.textMuted }]}>
              Note: Embedded TradingView widgets require internet and WebView enabled.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16 },

  chatListContainer: { flex: 1 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  emptyStateTitle: { fontSize: 20, fontWeight: "600", marginTop: 16, textAlign: "center" },
  emptyStateSubtitle: { fontSize: 14, marginTop: 8, textAlign: "center", lineHeight: 20 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  headerBtn: { padding: 4 },
  headerAvatar: { width: 34, height: 34, borderRadius: 17, overflow: "hidden" },
  avatar: { width: "100%", height: "100%" },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  headerSubtitle: { fontSize: 12, marginTop: 2 },

  bg: { flex: 1 },

  listContent: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 10 },

  row: { flexDirection: "row", marginVertical: 3, alignItems: "flex-end" },
  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },

  smallAvatarWrap: { width: 26, height: 26, borderRadius: 13, overflow: "hidden", marginRight: 6 },
  smallAvatar: { width: "100%", height: "100%" },
  smallAvatarFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  smallAvatarText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  bubble: {
    maxWidth: "82%",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  bubbleLeft: { borderTopLeftRadius: 6 },
  bubbleRight: { borderTopRightRadius: 6 },

  msgText: { fontSize: 15, lineHeight: 20 },
  timeRow: { alignItems: "flex-end", marginTop: 2 },
  timeText: { fontSize: 11 },

  // Widget card inside bubble
  widgetCard: { gap: 8 },
  widgetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  widgetTitle: { fontSize: 13, fontWeight: "700" },
  widgetShareBtn: { padding: 4 },
  widgetWebWrap: { borderRadius: 12, overflow: "hidden" },
  widgetWeb: { height: 260, width: "100%", backgroundColor: "transparent" },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 10,
    borderTopWidth: 1,
  },
  attachBtn: { padding: 6 },
  inputPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textInput: { fontSize: 15, maxHeight: 110, padding: 0, margin: 0 },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: "75%" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "800" },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  actionText: { fontSize: 15, fontWeight: "600" },

  helpText: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  symbolInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  symbolInput: { flex: 1, fontSize: 15 },

  symbolActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  symbolBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  symbolBtnPrimary: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  symbolBtnText: { fontSize: 14, fontWeight: "800" },
  symbolBtnTextPrimary: { fontSize: 14, fontWeight: "800" },
  tinyNote: { fontSize: 12, marginTop: 10 },
  verificationIcon: { marginLeft: 4, marginTop: 2 },
  
  // Conversation list styles
  conversationsList: { padding: 16 },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  conversationAvatar: {
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  conversationLastMessage: {
    fontSize: 14,
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  conversationTime: {
    fontSize: 12,
  },
});
