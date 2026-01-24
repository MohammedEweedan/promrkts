import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = CARD_WIDTH * 0.63; // Standard card ratio

type Props = {
  membershipType?: 'basic' | 'premium' | 'vip';
  memberId?: string;
  expiryDate?: string;
  onAddToWallet?: () => void;
};

export default function InfoCard({ 
  membershipType = 'basic', 
  memberId,
  expiryDate,
  onAddToWallet 
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [showQR, setShowQR] = useState(false);

  const getMembershipGradient = (): [string, string, string] => {
    switch (membershipType) {
      case 'vip':
        return ['#FFD700', '#FFA500', '#FF8C00'];
      case 'premium':
        return ['#667eea', '#764ba2', '#6B8DD6'];
      default:
        return ['#1a1a2e', '#16213e', '#0f3460'];
    }
  };

  const getMembershipLabel = () => {
    switch (membershipType) {
      case 'vip':
        return 'VIP Member';
      case 'premium':
        return 'Premium Member';
      default:
        return 'Member';
    }
  };

  const cardId = memberId || user?.id?.slice(0, 8).toUpperCase() || 'PROMRKTS';
  const cardExpiry = expiryDate || '12/26';
  const cardHolder = user?.name || 'TRADER';

  const handleAddToAppleWallet = async () => {
    // In a real implementation, this would:
    // 1. Call backend to generate a .pkpass file
    // 2. Download the pass
    // 3. Open it with PassKit
    
    // For now, show info about the feature
    Alert.alert(
      'Add to Apple Wallet',
      'This feature requires a backend service to generate Apple Wallet passes (.pkpass files). The pass would include:\n\n• Your membership ID\n• QR code for verification\n• Membership tier\n• Expiry date',
      [
        { text: 'Learn More', onPress: () => Linking.openURL('https://developer.apple.com/wallet/') },
        { text: 'OK' }
      ]
    );
    
    onAddToWallet?.();
  };

  const handleAddToGoogleWallet = async () => {
    // In a real implementation, this would:
    // 1. Call Google Pay API to create a pass
    // 2. Generate a save link
    // 3. Open the link
    
    Alert.alert(
      'Add to Google Wallet',
      'This feature requires Google Pay API integration. The pass would include:\n\n• Your membership ID\n• QR code for verification\n• Membership tier\n• Expiry date',
      [
        { text: 'Learn More', onPress: () => Linking.openURL('https://developers.google.com/wallet') },
        { text: 'OK' }
      ]
    );
    
    onAddToWallet?.();
  };

  const handleAddToWallet = () => {
    if (Platform.OS === 'ios') {
      handleAddToAppleWallet();
    } else {
      handleAddToGoogleWallet();
    }
  };

  return (
    <View style={styles.container}>
      {/* Card */}
      <TouchableOpacity 
        activeOpacity={0.95}
        onPress={() => setShowQR(!showQR)}
        style={styles.cardWrapper}
      >
        <LinearGradient
          colors={getMembershipGradient()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Card Pattern Overlay */}
          <View style={styles.cardPattern}>
            <View style={[styles.patternCircle, styles.patternCircle1]} />
            <View style={[styles.patternCircle, styles.patternCircle2]} />
          </View>

          {/* Card Content */}
          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.brandName}>PROMRKTS</Text>
                <Text style={styles.membershipType}>{getMembershipLabel()}</Text>
              </View>
              {membershipType === 'vip' && (
                <View style={styles.vipBadge}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                </View>
              )}
            </View>

            {/* QR Code or Card Number */}
            {showQR ? (
              <View style={styles.qrContainer}>
                <View style={styles.qrBackground}>
                  <QRCode
                    value={`promrkts://member/${cardId}`}
                    size={100}
                    backgroundColor="white"
                    color="black"
                  />
                </View>
                <Text style={styles.qrHint}>Tap to hide QR</Text>
              </View>
            ) : (
              <View style={styles.cardNumberContainer}>
                <Text style={styles.cardNumber}>
                  •••• •••• •••• {cardId.slice(-4)}
                </Text>
                <Text style={styles.tapHint}>Tap to show QR</Text>
              </View>
            )}

            {/* Footer */}
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.cardLabel}>CARD HOLDER</Text>
                <Text style={styles.cardValue}>{cardHolder.toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>VALID THRU</Text>
                <Text style={styles.cardValue}>{cardExpiry}</Text>
              </View>
              <View style={styles.chipContainer}>
                <View style={styles.chip}>
                  <View style={styles.chipLine} />
                  <View style={styles.chipLine} />
                  <View style={styles.chipLine} />
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Add to Wallet Button */}
      <TouchableOpacity
        style={[styles.walletButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        onPress={handleAddToWallet}
      >
        <Ionicons 
          name={Platform.OS === 'ios' ? 'wallet' : 'card'} 
          size={24} 
          color={colors.text} 
        />
        <Text style={[styles.walletButtonText, { color: colors.text }]}>
          Add to {Platform.OS === 'ios' ? 'Apple Wallet' : 'Google Wallet'}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {/* Card Info */}
      <View style={[styles.infoContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Member ID</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{cardId}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Status</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>Active</Text>
            </View>
          </View>
        </View>
        <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="ribbon-outline" size={20} color={colors.primary} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Tier</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{getMembershipLabel()}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Valid Until</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{cardExpiry}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  cardWrapper: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  patternCircle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  patternCircle2: {
    width: 200,
    height: 200,
    bottom: -50,
    left: -50,
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  membershipType: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 1,
  },
  vipBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBackground: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 12,
  },
  qrHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 8,
  },
  cardNumberContainer: {
    alignItems: 'center',
  },
  cardNumber: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 4,
  },
  tapHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  chipContainer: {
    alignItems: 'flex-end',
  },
  chip: {
    width: 40,
    height: 30,
    backgroundColor: 'rgba(255,215,0,0.8)',
    borderRadius: 6,
    padding: 4,
    justifyContent: 'space-around',
  },
  chipLine: {
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 1,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    gap: 12,
  },
  walletButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoDivider: {
    height: 1,
    marginVertical: 12,
  },
});
