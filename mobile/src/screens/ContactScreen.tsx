import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const WHATSAPP_NUMBER = process.env.EXPO_PUBLIC_WHATSAPP_NUMBER || '';
const TELEGRAM_HANDLE = process.env.EXPO_PUBLIC_TELEGRAM_HANDLE || 'promrkts';

type Ticket = {
  id: string;
  ticketId: string;
  status: 'OPEN' | 'READ' | 'ESCALATED' | 'RESOLVED';
  createdAt: string;
  preview: string;
};

export default function ContactScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadMyTickets();
    }
  }, [isAuthenticated]);

  const loadMyTickets = async () => {
    setTicketsLoading(true);
    try {
      const resp = await api.get('/communications/my');
      setMyTickets(resp.data?.items || []);
    } catch (error) {
      console.log('Failed to load tickets:', error);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Required Fields', 'Please fill in your name, email, and message.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/communications', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim(),
        source: 'mobile_app',
      });
      setSent(true);
      setMessage('');
      if (isAuthenticated) {
        loadMyTickets();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    if (WHATSAPP_NUMBER) {
      Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}`);
    }
  };

  const openTelegram = () => {
    if (TELEGRAM_HANDLE) {
      Linking.openURL(`https://t.me/${TELEGRAM_HANDLE}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return '#22c55e';
      case 'ESCALATED': return '#f97316';
      case 'READ': return '#3b82f6';
      default: return '#888';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  if (sent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Message Sent!</Text>
          <Text style={[styles.successText, { color: colors.textMuted }]}>
            Thank you for reaching out. We'll get back to you as soon as possible.
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => setSent(false)}
          >
            <Text style={styles.primaryButtonText}>Send Another Message</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Contact Us</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Have a question or need help? We're here for you.
            </Text>
          </View>

          {/* Quick Contact Options */}
          <View style={styles.quickContactRow}>
            {WHATSAPP_NUMBER && (
              <TouchableOpacity
                style={[styles.quickContactCard, { backgroundColor: '#25D366' }]}
                onPress={openWhatsApp}
              >
                <Ionicons name="logo-whatsapp" size={24} color="#fff" />
                <Text style={styles.quickContactText}>WhatsApp</Text>
              </TouchableOpacity>
            )}
            {TELEGRAM_HANDLE && (
              <TouchableOpacity
                style={[styles.quickContactCard, { backgroundColor: '#0088cc' }]}
                onPress={openTelegram}
              >
                <Ionicons name="paper-plane" size={24} color="#fff" />
                <Text style={styles.quickContactText}>Telegram</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Contact Form */}
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Send a Message</Text>

            <Text style={[styles.label, { color: colors.textMuted }]}>Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.label, { color: colors.textMuted }]}>Email *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
              placeholder="your@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: colors.textMuted }]}>Phone (optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
              placeholder="+1 234 567 8900"
              placeholderTextColor={colors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={[styles.label, { color: colors.textMuted }]}>Message *</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
              placeholder="How can we help you?"
              placeholderTextColor={colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text style={styles.submitButtonText}>Send Message</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* My Tickets */}
          {isAuthenticated && (
            <View style={[styles.ticketsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>My Tickets</Text>
              
              {ticketsLoading ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
              ) : myTickets.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  No tickets yet. Send us a message above!
                </Text>
              ) : (
                myTickets.map((ticket) => (
                  <View
                    key={ticket.id}
                    style={[styles.ticketItem, { borderBottomColor: colors.border }]}
                  >
                    <View style={styles.ticketHeader}>
                      <Text style={[styles.ticketId, { color: colors.text }]}>#{ticket.ticketId}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                          {ticket.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.ticketPreview, { color: colors.textMuted }]} numberOfLines={2}>
                      {ticket.preview}
                    </Text>
                    <Text style={[styles.ticketDate, { color: colors.textMuted }]}>
                      {formatDate(ticket.createdAt)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  quickContactRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickContactCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickContactText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  formCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
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
    minHeight: 120,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ticketsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  ticketItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketId: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ticketPreview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  ticketDate: {
    fontSize: 12,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  primaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
