import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Dimensions,
  Animated,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { socialAPI } from '../../api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type VoteType = 'STRONG_SELL' | 'SELL' | 'NEUTRAL' | 'BUY' | 'STRONG_BUY';

type SymbolData = {
  symbol: string;
  STRONG_SELL: number;
  SELL: number;
  NEUTRAL: number;
  BUY: number;
  STRONG_BUY: number;
  total: number;
  index: number;
  sentiment: string;
  color: string;
};

type IndexData = {
  symbols: SymbolData[];
  overall: {
    index: number;
    sentiment: string;
    totalVotes: number;
  };
};

type Props = {
  refreshing: boolean;
  onRefresh: () => void;
};

// All major trading pairs across all markets
const ALL_PAIRS = [
  // Crypto
  { symbol: 'BTCUSDT', name: 'Bitcoin/USDT', category: 'Crypto' },
  { symbol: 'ETHUSDT', name: 'Ethereum/USDT', category: 'Crypto' },
  { symbol: 'BNBUSDT', name: 'BNB/USDT', category: 'Crypto' },
  { symbol: 'SOLUSDT', name: 'Solana/USDT', category: 'Crypto' },
  { symbol: 'XRPUSDT', name: 'XRP/USDT', category: 'Crypto' },
  { symbol: 'ADAUSDT', name: 'Cardano/USDT', category: 'Crypto' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin/USDT', category: 'Crypto' },
  { symbol: 'AVAXUSDT', name: 'Avalanche/USDT', category: 'Crypto' },
  { symbol: 'MATICUSDT', name: 'Polygon/USDT', category: 'Crypto' },
  { symbol: 'DOTUSDT', name: 'Polkadot/USDT', category: 'Crypto' },
  
  // Forex Majors
  { symbol: 'EURUSD', name: 'Euro/USD', category: 'Forex' },
  { symbol: 'GBPUSD', name: 'GBP/USD', category: 'Forex' },
  { symbol: 'USDJPY', name: 'USD/JPY', category: 'Forex' },
  { symbol: 'USDCHF', name: 'USD/CHF', category: 'Forex' },
  { symbol: 'AUDUSD', name: 'AUD/USD', category: 'Forex' },
  { symbol: 'NZDUSD', name: 'NZD/USD', category: 'Forex' },
  { symbol: 'USDCAD', name: 'USD/CAD', category: 'Forex' },
  
  // Forex Crosses
  { symbol: 'EURGBP', name: 'EUR/GBP', category: 'Forex' },
  { symbol: 'EURJPY', name: 'EUR/JPY', category: 'Forex' },
  { symbol: 'GBPJPY', name: 'GBP/JPY', category: 'Forex' },
  
  // Commodities
  { symbol: 'XAUUSD', name: 'Gold/USD', category: 'Commodities' },
  { symbol: 'XAGUSD', name: 'Silver/USD', category: 'Commodities' },
  { symbol: 'USOIL', name: 'Crude Oil', category: 'Commodities' },
  { symbol: 'UKOIL', name: 'Brent Oil', category: 'Commodities' },
  
  // Indices
  { symbol: 'SPX500', name: 'S&P 500', category: 'Indices' },
  { symbol: 'NAS100', name: 'Nasdaq 100', category: 'Indices' },
  { symbol: 'US30', name: 'Dow Jones', category: 'Indices' },
  { symbol: 'GER40', name: 'DAX', category: 'Indices' },
  { symbol: 'UK100', name: 'FTSE 100', category: 'Indices' },
  { symbol: 'JPN225', name: 'Nikkei 225', category: 'Indices' },
  
  // Stocks
  { symbol: 'AAPL', name: 'Apple', category: 'Stocks' },
  { symbol: 'MSFT', name: 'Microsoft', category: 'Stocks' },
  { symbol: 'GOOGL', name: 'Google', category: 'Stocks' },
  { symbol: 'AMZN', name: 'Amazon', category: 'Stocks' },
  { symbol: 'TSLA', name: 'Tesla', category: 'Stocks' },
  { symbol: 'NVDA', name: 'NVIDIA', category: 'Stocks' },
  { symbol: 'META', name: 'Meta', category: 'Stocks' },
];

const VOTE_OPTIONS: { type: VoteType; label: string; color: string; icon: string }[] = [
  { type: 'STRONG_SELL', label: 'Strong Sell', color: '#ef4444', icon: 'trending-down' },
  { type: 'SELL', label: 'Sell', color: '#f97316', icon: 'arrow-down' },
  { type: 'NEUTRAL', label: 'Neutral', color: '#888888', icon: 'remove' },
  { type: 'BUY', label: 'Buy', color: '#84cc16', icon: 'arrow-up' },
  { type: 'STRONG_BUY', label: 'Strong Buy', color: '#22c55e', icon: 'trending-up' },
];

export default function PromrktsIndexSection({ refreshing, onRefresh }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [indexData, setIndexData] = useState<IndexData | null>(null);
  const [myVotes, setMyVotes] = useState<Record<string, VoteType>>({});
  const [votingSymbol, setVotingSymbol] = useState<string | null>(null);
  const [selectedPair, setSelectedPair] = useState<string>('BTCUSDT');
  const [showPairPicker, setShowPairPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const needleRotation = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    try {
      const [indexResp, votesResp] = await Promise.all([
        socialAPI.getPromrktsIndex(),
        isAuthenticated ? socialAPI.getMyVotes() : Promise.resolve({ data: { data: [] } }),
      ]);
      
      setIndexData(indexResp.data?.data || null);
      
      const votesMap: Record<string, VoteType> = {};
      (votesResp.data?.data || []).forEach((v: any) => {
        votesMap[v.symbol] = v.vote;
      });
      setMyVotes(votesMap);
    } catch (error) {
      console.log('Failed to load index data:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVote = async (symbol: string, vote: VoteType) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to vote');
      return;
    }

    setVotingSymbol(symbol);
    try {
      await socialAPI.castVote(symbol, vote);
      setMyVotes(prev => ({ ...prev, [symbol]: vote }));
      loadData();
    } catch (error) {
      console.log('Failed to cast vote:', error);
      Alert.alert('Error', 'Failed to cast vote');
    } finally {
      setVotingSymbol(null);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Strong Sell': return '#ef4444';
      case 'Sell': return '#f97316';
      case 'Strong Buy': return '#22c55e';
      case 'Buy': return '#84cc16';
      default: return '#888888';
    }
  };

  const getGaugeRotation = (index: number) => {
    const clampedIndex = Math.max(-2, Math.min(2, index));
    return (clampedIndex / 2) * 90;
  };

  const selectedSymbolData = indexData?.symbols.find(s => s.symbol === selectedPair);
  const pairInfo = ALL_PAIRS.find(p => p.symbol === selectedPair);

  // Create blank gauge data for new pairs
  const getSymbolDataOrBlank = (): SymbolData => {
    if (selectedSymbolData) return selectedSymbolData;
    
    // Return blank data for new pair
    return {
      symbol: selectedPair,
      STRONG_SELL: 0,
      SELL: 0,
      NEUTRAL: 0,
      BUY: 0,
      STRONG_BUY: 0,
      total: 0,
      index: 0,
      sentiment: 'Neutral',
      color: '#6b7280',
    };
  };

  const displayData = getSymbolDataOrBlank();

  // Animate gauge needle when index changes
  useEffect(() => {
    const targetRotation = getGaugeRotation(displayData.index);
    Animated.spring(needleRotation, {
      toValue: targetRotation,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
  }, [displayData.index]);

  const categories = ['All', ...Array.from(new Set(ALL_PAIRS.map(p => p.category)))];
  
  // Filter pairs by category and search query
  const filteredPairs = ALL_PAIRS.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const trendingPairs = indexData?.symbols
    .slice()
    .sort((a, b) => b.total - a.total)
    .slice(0, 5) || [];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { onRefresh(); loadData(); }} />
      }
    >
      {/* Pair Selector Dropdown */}
      <TouchableOpacity
        style={[styles.pairSelector, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        onPress={() => setShowPairPicker(true)}
      >
        <View style={styles.pairSelectorContent}>
          <Text style={[styles.pairSelectorLabel, { color: colors.textMuted }]}>Selected Pair</Text>
          <Text style={[styles.pairSelectorValue, { color: colors.text }]}>
            {pairInfo?.name || selectedPair}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={24} color={colors.textMuted} />
      </TouchableOpacity>

      {/* Main Gauge Display for Selected Pair */}
      <View style={[styles.gaugeCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.gaugeTitle, { color: colors.text }]}>{selectedPair}</Text>
        {!selectedSymbolData && (
          <View style={[styles.newPairBadge, { backgroundColor: colors.warning + '20' }]}>
            <Text style={[styles.newPairText, { color: colors.warning }]}>New Pair - Be the first to vote!</Text>
          </View>
        )}
          
          {/* Gauge - Line Indicator Style */}
          <View style={styles.gaugeContainer}>
            <View style={[styles.gaugeBackground, { borderColor: colors.border }]}>
              {/* Thin arc line that changes color based on position */}
              <View style={[styles.gaugeArc, { borderColor: colors.border }]} />
              
              {/* Colored indicator line at current position */}
              <Animated.View 
                style={[
                  styles.gaugeIndicatorLine,
                  { 
                    backgroundColor: getSentimentColor(displayData.sentiment),
                    transform: [{ rotate: needleRotation.interpolate({
                      inputRange: [-90, 90],
                      outputRange: ['-90deg', '90deg'],
                    }) }] 
                  }
                ]}
              />
              
              {/* Animated needle pointer */}
              <Animated.View 
                style={[
                  styles.gaugeNeedle,
                  { transform: [{ rotate: needleRotation.interpolate({
                    inputRange: [-90, 90],
                    outputRange: ['-90deg', '90deg'],
                  }) }] }
                ]}
              >
                <View style={[styles.needlePointer, { backgroundColor: getSentimentColor(displayData.sentiment) }]} />
              </Animated.View>
              
              <View style={[styles.gaugeCenterDot, { backgroundColor: colors.card, borderWidth: 3, borderColor: getSentimentColor(displayData.sentiment) }]} />
            </View>
            
            <View style={styles.gaugeLabels}>
              <Text style={[styles.gaugeLabel, { color: '#ef4444' }]}>Sell</Text>
              <Text style={[styles.gaugeLabel, { color: '#888' }]}>Neutral</Text>
              <Text style={[styles.gaugeLabel, { color: '#22c55e' }]}>Buy</Text>
            </View>
          </View>

          {/* Index Value */}
          <View style={styles.indexValueContainer}>
            <Text style={[styles.indexValue, { color: getSentimentColor(displayData.sentiment) }]}>
              {displayData.index > 0 ? '+' : ''}{displayData.index.toFixed(2)}
            </Text>
            <Text style={[styles.indexSentiment, { color: getSentimentColor(displayData.sentiment) }]}>
              {displayData.sentiment}
            </Text>
            <Text style={[styles.indexVotes, { color: colors.textMuted }]}>
              {displayData.total} votes
            </Text>
          </View>

          {/* Vote Buttons - All 5 in a single row */}
          <View style={styles.voteButtonsContainer}>
            {VOTE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.voteButton,
                  { 
                    backgroundColor: myVotes[selectedPair] === option.type 
                      ? option.color 
                      : colors.background + '80',
                  }
                ]}
                onPress={() => handleVote(selectedPair, option.type)}
                disabled={votingSymbol === selectedPair}
              >
                {votingSymbol === selectedPair ? (
                  <ActivityIndicator size="small" color={option.color} />
                ) : (
                  <Ionicons 
                    name={option.icon as any} 
                    size={18} 
                    color={myVotes[selectedPair] === option.type ? '#fff' : option.color} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
      </View>

      {/* Trending Pairs */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        <Ionicons name="flame" size={18} color="#f97316" /> Trending Pairs
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.trendingContainer}
      >
        {trendingPairs.map((pair, index) => (
          <TouchableOpacity
            key={pair.symbol}
            style={[
              styles.trendingCard, 
              { 
                backgroundColor: colors.card, 
                borderColor: selectedPair === pair.symbol ? colors.primary : colors.cardBorder 
              }
            ]}
            onPress={() => setSelectedPair(pair.symbol)}
          >
            <View style={styles.trendingRank}>
              <Text style={[styles.trendingRankText, { color: colors.primary }]}>#{index + 1}</Text>
            </View>
            <Text style={[styles.trendingSymbol, { color: colors.text }]}>{pair.symbol}</Text>
            <View style={styles.trendingStats}>
              <Text style={[styles.trendingIndex, { color: getSentimentColor(pair.sentiment) }]}>
                {pair.index > 0 ? '+' : ''}{pair.index.toFixed(2)}
              </Text>
              <Text style={[styles.trendingVotes, { color: colors.textMuted }]}>
                {pair.total} votes
              </Text>
            </View>
            <View style={[styles.miniGauge, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.miniGaugeFill, 
                  { 
                    width: `${((pair.index + 2) / 4) * 100}%`,
                    backgroundColor: getSentimentColor(pair.sentiment),
                  }
                ]} 
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* All Pairs List */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>All Pairs</Text>
      
      {indexData?.symbols.map((symbol) => (
        <TouchableOpacity 
          key={symbol.symbol} 
          style={[
            styles.pairRow, 
            { 
              backgroundColor: colors.card, 
              borderColor: selectedPair === symbol.symbol ? colors.primary : colors.cardBorder 
            }
          ]}
          onPress={() => setSelectedPair(symbol.symbol)}
        >
          <View style={styles.pairRowLeft}>
            <Text style={[styles.pairRowSymbol, { color: colors.text }]}>{symbol.symbol}</Text>
            <Text style={[styles.pairRowVotes, { color: colors.textMuted }]}>{symbol.total} votes</Text>
          </View>
          <View style={styles.pairRowRight}>
            <Text style={[styles.pairRowIndex, { color: getSentimentColor(symbol.sentiment) }]}>
              {symbol.index > 0 ? '+' : ''}{symbol.index.toFixed(2)}
            </Text>
            <View style={[styles.pairRowBadge, { backgroundColor: getSentimentColor(symbol.sentiment) + '20' }]}>
              <Text style={[styles.pairRowSentiment, { color: getSentimentColor(symbol.sentiment) }]}>
                {symbol.sentiment}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Pair Picker Modal */}
      <Modal
        visible={showPairPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPairPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Pair</Text>
              <TouchableOpacity onPress={() => setShowPairPicker(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="search" size={20} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search pairs..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selectedCategory === cat ? colors.primary : colors.background,
                      borderColor: selectedCategory === cat ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    { color: selectedCategory === cat ? '#fff' : colors.text }
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <FlatList
              data={filteredPairs}
              keyExtractor={(item) => item.symbol}
              renderItem={({ item }) => {
                const symbolData = indexData?.symbols.find(s => s.symbol === item.symbol);
                return (
                  <TouchableOpacity
                    style={[
                      styles.pairPickerItem,
                      { 
                        backgroundColor: selectedPair === item.symbol ? colors.primary + '20' : 'transparent',
                        borderBottomColor: colors.border,
                      }
                    ]}
                    onPress={() => {
                      setSelectedPair(item.symbol);
                      setShowPairPicker(false);
                    }}
                  >
                    <View>
                      <Text style={[styles.pairPickerSymbol, { color: colors.text }]}>{item.symbol}</Text>
                      <Text style={[styles.pairPickerName, { color: colors.textMuted }]}>{item.name}</Text>
                    </View>
                    <View style={styles.pairPickerRight}>
                      {symbolData && (
                        <Text style={[styles.pairPickerIndex, { color: getSentimentColor(symbolData.sentiment) }]}>
                          {symbolData.index > 0 ? '+' : ''}{symbolData.index.toFixed(2)}
                        </Text>
                      )}
                      {selectedPair === item.symbol && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  pairSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  pairSelectorContent: {
    flex: 1,
  },
  pairSelectorLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  pairSelectorValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  gaugeCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: 'center',
  },
  gaugeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  gaugeBackground: {
    width: 200,
    height: 100,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderWidth: 2,
    borderBottomWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  gaugeArc: {
    position: 'absolute',
    width: 200,
    height: 100,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderWidth: 3,
    borderBottomWidth: 0,
  },
  gaugeIndicatorLine: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 6,
    height: 85,
    marginLeft: -3,
    borderRadius: 3,
    transformOrigin: 'bottom center',
    opacity: 0.3,
  },
  gaugeNeedle: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 4,
    height: 80,
    marginLeft: -2,
    transformOrigin: 'bottom center',
  },
  needlePointer: {
    width: 4,
    height: 70,
    borderRadius: 2,
  },
  gaugeCenterDot: {
    position: 'absolute',
    bottom: -12,
    left: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: -12,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginTop: 8,
  },
  gaugeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  indexValueContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  indexValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  indexSentiment: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  indexVotes: {
    fontSize: 13,
    marginTop: 4,
  },
  voteButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingHorizontal: 8,
  },
  voteButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  trendingContainer: {
    paddingRight: 16,
  },
  trendingCard: {
    width: 140,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
  },
  trendingRank: {
    marginBottom: 8,
  },
  trendingRankText: {
    fontSize: 12,
    fontWeight: '700',
  },
  trendingSymbol: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  trendingStats: {
    marginBottom: 8,
  },
  trendingIndex: {
    fontSize: 20,
    fontWeight: '700',
  },
  trendingVotes: {
    fontSize: 11,
  },
  miniGauge: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniGaugeFill: {
    height: '100%',
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  pairRowLeft: {
    flex: 1,
  },
  pairRowSymbol: {
    fontSize: 16,
    fontWeight: '600',
  },
  pairRowVotes: {
    fontSize: 12,
    marginTop: 2,
  },
  pairRowRight: {
    alignItems: 'flex-end',
  },
  pairRowIndex: {
    fontSize: 18,
    fontWeight: '700',
  },
  pairRowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  pairRowSentiment: {
    fontSize: 11,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 60,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pairPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  pairPickerSymbol: {
    fontSize: 16,
    fontWeight: '600',
  },
  pairPickerName: {
    fontSize: 13,
    marginTop: 2,
  },
  pairPickerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pairPickerIndex: {
    fontSize: 16,
    fontWeight: '600',
  },
  newPairBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'center',
  },
  newPairText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
