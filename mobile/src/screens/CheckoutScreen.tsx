import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '../components';
import api from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Method = 'usdt' | 'card';

export default function CheckoutScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const tierId = route.params?.tierId;

  const [tier, setTier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<Method>('usdt');
  const [promoCode, setPromoCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [purchaseId, setPurchaseId] = useState<string>('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [txnHash, setTxnHash] = useState('');
  const [proofSubmitting, setProofSubmitting] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);

  useEffect(() => {
    loadTier();
  }, [tierId]);

  const loadTier = async () => {
    try {
      let tResp: any = { data: null };
      if (tierId) {
        tResp = await api.get(`/courses/${tierId}`).catch(async () => {
          return await api.get(`/subscriptions/${tierId}`).catch(async () => {
            return await api.get(`/challenges/${tierId}`).catch(() => ({ data: null }));
          });
        });
      }
      setTier(tResp.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const addToWatchList = useCallback(async (pid: string) => {
    try {
      const key = 'watchPurchaseIds';
      const existing = await AsyncStorage.getItem(key);
      const arr = existing ? JSON.parse(existing) : [];
      if (Array.isArray(arr) && !arr.includes(pid)) {
        arr.push(pid);
        await AsyncStorage.setItem(key, JSON.stringify(arr));
      }
    } catch (e) {
      console.log('Failed to add to watch list:', e);
    }
  }, []);

  const handleCheckout = async () => {
    if (!tier) return;

    setProcessing(true);
    try {
      const payload: any = {
        tierId: tier.id,
        method,
        country: 'US',
        courseLanguage: 'en',
      };
      if (promoCode) payload.promoCode = promoCode.trim();

      const resp = await api.post('/purchase/create', payload);
      const provider = (resp.data?.provider || '').toString().toLowerCase();
      
      if (resp.data?.purchaseId && !purchaseId) {
        setPurchaseId(resp.data.purchaseId);
        await addToWatchList(resp.data.purchaseId);
      }

      if (provider === 'usdt') {
        const addr = resp.data?.address || null;
        const amt = typeof resp.data?.amount === 'number' ? resp.data.amount : Number(resp.data?.amount) || null;
        setAddress(addr);
        setAmount(amt);
        setPaymentModalOpen(true);
      } else if (provider === 'stripe') {
        const checkoutUrl = resp.data?.checkoutUrl;
        if (checkoutUrl) {
          Alert.alert('Redirect', 'Opening payment page...', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  const submitProof = async () => {
    if (!txnHash.trim()) {
      Alert.alert('Error', 'Please enter the transaction hash');
      return;
    }

    setProofSubmitting(true);
    try {
      const payload = {
        purchaseId,
        method: 'usdt',
        txHash: txnHash.trim(),
      };

      try {
        await api.post('/purchase/confirm', payload);
      } catch {
        await api.post('/purchase/proof', payload);
      }

      setProofSubmitted(true);
      await addToWatchList(purchaseId);
      
      Alert.alert(
        'Success',
        'Payment proof submitted! Your purchase will be confirmed automatically once verified.',
        [{ text: 'OK', onPress: () => {
          setPaymentModalOpen(false);
          navigation.goBack();
        }}]
      );
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to submit proof');
    } finally {
      setProofSubmitting(false);
    }
  };

  const copyAddress = () => {
    if (address) {
      Clipboard.setString(address);
      Alert.alert('Copied', 'Address copied to clipboard');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <Header showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!tier) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <Header showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>Course not found</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <Header showBack onBackPress={() => navigation.goBack()} />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Course Info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Order Summary</Text>
          <View style={styles.courseInfo}>
            <Text style={[styles.courseName, { color: colors.text }]}>{tier.name}</Text>
            <Text style={[styles.courseDescription, { color: colors.textMuted }]} numberOfLines={2}>
              {tier.description}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Price:</Text>
            <Text style={[styles.priceValue, { color: colors.primary }]}>
              ${tier.price_usdt} USDT
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Payment Method</Text>
          <View style={styles.methodsContainer}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                { borderColor: colors.border },
                method === 'usdt' && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
              ]}
              onPress={() => setMethod('usdt')}
            >
              <Ionicons name="logo-bitcoin" size={24} color={method === 'usdt' ? colors.primary : colors.textMuted} />
              <Text style={[styles.methodText, { color: method === 'usdt' ? colors.primary : colors.textMuted }]}>
                USDT
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                { borderColor: colors.border },
                method === 'card' && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
              ]}
              onPress={() => setMethod('card')}
            >
              <Ionicons name="card" size={24} color={method === 'card' ? colors.primary : colors.textMuted} />
              <Text style={[styles.methodText, { color: method === 'card' ? colors.primary : colors.textMuted }]}>
                Card
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promo Code */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Promo Code (Optional)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Enter promo code"
            placeholderTextColor={colors.textMuted}
            value={promoCode}
            onChangeText={setPromoCode}
          />
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: colors.primary, opacity: processing ? 0.6 : 1 }]}
          onPress={handleCheckout}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="card" size={20} color="#fff" />
              <Text style={styles.checkoutButtonText}>Complete Purchase</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* USDT Payment Modal */}
      <Modal
        visible={paymentModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>USDT Payment</Text>
              <TouchableOpacity onPress={() => setPaymentModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Amount */}
              <View style={styles.paymentSection}>
                <Text style={[styles.paymentLabel, { color: colors.textMuted }]}>Amount to Send</Text>
                <Text style={[styles.paymentAmount, { color: colors.primary }]}>{amount} USDT</Text>
              </View>

              {/* Address */}
              <View style={styles.paymentSection}>
                <Text style={[styles.paymentLabel, { color: colors.textMuted }]}>Send to Address</Text>
                <View style={[styles.addressContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.addressText, { color: colors.text }]} selectable>{address}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.copyButton, { backgroundColor: colors.primary }]}
                  onPress={copyAddress}
                >
                  <Ionicons name="copy" size={18} color="#fff" />
                  <Text style={styles.copyButtonText}>Copy Address</Text>
                </TouchableOpacity>
              </View>

              {/* Transaction Hash Input */}
              {!proofSubmitted && (
                <View style={styles.paymentSection}>
                  <Text style={[styles.paymentLabel, { color: colors.textMuted }]}>
                    Transaction Hash (After Payment)
                  </Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholder="Enter transaction hash"
                    placeholderTextColor={colors.textMuted}
                    value={txnHash}
                    onChangeText={setTxnHash}
                  />
                  <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.primary, opacity: proofSubmitting ? 0.6 : 1 }]}
                    onPress={submitProof}
                    disabled={proofSubmitting}
                  >
                    {proofSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={styles.submitButtonText}>Submit Proof</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {proofSubmitted && (
                <View style={[styles.successContainer, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
                  <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                  <Text style={[styles.successText, { color: colors.success }]}>
                    Payment proof submitted! We'll confirm your purchase shortly.
                  </Text>
                </View>
              )}

              <Text style={[styles.helpText, { color: colors.textMuted }]}>
                After sending USDT to the address above, paste your transaction hash here to complete the purchase.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  courseInfo: {
    marginBottom: 16,
  },
  courseName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  priceLabel: {
    fontSize: 16,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  methodsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  methodText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 10,
    marginTop: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  modalBody: {
    maxHeight: 500,
  },
  paymentSection: {
    marginBottom: 24,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 32,
    fontWeight: '700',
  },
  addressContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 8,
    marginTop: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  successText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
