import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components';

type JournalEntry = {
  id: string;
  date: string;
  symbol: string;
  type: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  profitLoss: number;
  notes: string;
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  tags: string[];
};

const MOCK_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    date: '2024-01-24',
    symbol: 'EUR/USD',
    type: 'long',
    entryPrice: 1.0850,
    exitPrice: 1.0920,
    profitLoss: 70,
    notes: 'Strong bullish momentum after news release. Entry was well-timed.',
    mood: 'great',
    tags: ['forex', 'news-trade'],
  },
  {
    id: '2',
    date: '2024-01-23',
    symbol: 'BTC/USD',
    type: 'short',
    entryPrice: 42500,
    exitPrice: 41800,
    profitLoss: 700,
    notes: 'Resistance rejection at key level. Took partial profits too early.',
    mood: 'good',
    tags: ['crypto', 'swing'],
  },
  {
    id: '3',
    date: '2024-01-22',
    symbol: 'XAU/USD',
    type: 'long',
    entryPrice: 2025,
    exitPrice: 2010,
    profitLoss: -150,
    notes: 'Stopped out due to unexpected USD strength. Need to check calendar.',
    mood: 'bad',
    tags: ['gold', 'loss'],
  },
];

const MOODS = [
  { key: 'great', emoji: '🤩', label: 'Great' },
  { key: 'good', emoji: '😊', label: 'Good' },
  { key: 'neutral', emoji: '😐', label: 'Neutral' },
  { key: 'bad', emoji: '😔', label: 'Bad' },
  { key: 'terrible', emoji: '😫', label: 'Terrible' },
];

type Props = {
  embedded?: boolean;
};

export default function JournalScreen({ embedded = false }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [entries, setEntries] = useState<JournalEntry[]>(MOCK_ENTRIES);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    symbol: '',
    type: 'long' as 'long' | 'short',
    entryPrice: '',
    exitPrice: '',
    notes: '',
    mood: 'neutral' as JournalEntry['mood'],
  });

  const getMoodEmoji = (mood: JournalEntry['mood']) => {
    return MOODS.find(m => m.key === mood)?.emoji || '😐';
  };

  const formatPL = (pl: number) => {
    const sign = pl >= 0 ? '+' : '';
    return `${sign}$${pl.toFixed(2)}`;
  };

  const calculateStats = () => {
    const totalTrades = entries.length;
    const winningTrades = entries.filter(e => e.profitLoss > 0).length;
    const totalPL = entries.reduce((sum, e) => sum + e.profitLoss, 0);
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    return { totalTrades, winningTrades, totalPL, winRate };
  };

  const stats = calculateStats();

  const handleAddEntry = () => {
    if (!newEntry.symbol || !newEntry.entryPrice || !newEntry.exitPrice) return;

    const entry = parseFloat(newEntry.entryPrice);
    const exit = parseFloat(newEntry.exitPrice);
    const pl = newEntry.type === 'long' ? exit - entry : entry - exit;

    const journalEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      symbol: newEntry.symbol.toUpperCase(),
      type: newEntry.type,
      entryPrice: entry,
      exitPrice: exit,
      profitLoss: pl * 100, // Simplified P/L calculation
      notes: newEntry.notes,
      mood: newEntry.mood,
      tags: [],
    };

    setEntries([journalEntry, ...entries]);
    setModalVisible(false);
    setNewEntry({
      symbol: '',
      type: 'long',
      entryPrice: '',
      exitPrice: '',
      notes: '',
      mood: 'neutral',
    });
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <TouchableOpacity
      style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      onPress={() => setSelectedEntry(item)}
    >
      <View style={styles.entryHeader}>
        <View style={styles.symbolContainer}>
          <Text style={[styles.symbol, { color: colors.text }]}>{item.symbol}</Text>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: item.type === 'long' ? colors.success + '20' : colors.error + '20' },
            ]}
          >
            <Text
              style={[
                styles.typeText,
                { color: item.type === 'long' ? colors.success : colors.error },
              ]}
            >
              {item.type.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={[styles.date, { color: colors.textMuted }]}>{item.date}</Text>
      </View>

      <View style={styles.entryDetails}>
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Entry:</Text>
          <Text style={[styles.priceValue, { color: colors.text }]}>{item.entryPrice}</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.textMuted} />
          <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Exit:</Text>
          <Text style={[styles.priceValue, { color: colors.text }]}>{item.exitPrice}</Text>
        </View>
      </View>

      <View style={styles.entryFooter}>
        <Text style={styles.moodEmoji}>{getMoodEmoji(item.mood)}</Text>
        <Text
          style={[
            styles.profitLoss,
            { color: item.profitLoss >= 0 ? colors.success : colors.error },
          ]}
        >
          {formatPL(item.profitLoss)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderStats = () => (
    <View style={[styles.statsContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalTrades}</Text>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Trades</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.success }]}>{stats.winRate.toFixed(0)}%</Text>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Win Rate</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
      <View style={styles.statItem}>
        <Text
          style={[
            styles.statValue,
            { color: stats.totalPL >= 0 ? colors.success : colors.error },
          ]}
        >
          {formatPL(stats.totalPL)}
        </Text>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total P/L</Text>
      </View>
    </View>
  );

  const Wrapper: any = embedded ? View : SafeAreaView;
  const wrapperProps = embedded
    ? { style: [styles.container, { backgroundColor: colors.background }] }
    : { style: [styles.container, { backgroundColor: colors.background }], edges: ['left', 'right'] };

  return (
    <Wrapper {...wrapperProps}>
      {!embedded && <Header />}
      {renderStats()}

      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent as any}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('journal.empty')}</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* New Entry Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('journal.new_entry')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('journal.symbol')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., EUR/USD"
                placeholderTextColor={colors.textMuted}
                value={newEntry.symbol}
                onChangeText={text => setNewEntry({ ...newEntry, symbol: text })}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { borderColor: colors.border },
                    newEntry.type === 'long' && { backgroundColor: colors.success, borderColor: colors.success },
                  ]}
                  onPress={() => setNewEntry({ ...newEntry, type: 'long' })}
                >
                  <Text style={[styles.typeButtonText, newEntry.type === 'long' && { color: '#fff' }]}>
                    LONG
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { borderColor: colors.border },
                    newEntry.type === 'short' && { backgroundColor: colors.error, borderColor: colors.error },
                  ]}
                  onPress={() => setNewEntry({ ...newEntry, type: 'short' })}
                >
                  <Text style={[styles.typeButtonText, newEntry.type === 'short' && { color: '#fff' }]}>
                    SHORT
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.priceInputRow}>
                <View style={styles.priceInputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('journal.entry_price')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    value={newEntry.entryPrice}
                    onChangeText={text => setNewEntry({ ...newEntry, entryPrice: text })}
                  />
                </View>
                <View style={styles.priceInputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('journal.exit_price')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    value={newEntry.exitPrice}
                    onChangeText={text => setNewEntry({ ...newEntry, exitPrice: text })}
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('journal.mood')}</Text>
              <View style={styles.moodSelector}>
                {MOODS.map(mood => (
                  <TouchableOpacity
                    key={mood.key}
                    style={[
                      styles.moodButton,
                      { borderColor: colors.border },
                      newEntry.mood === mood.key && { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
                    ]}
                    onPress={() => setNewEntry({ ...newEntry, mood: mood.key as JournalEntry['mood'] })}
                  >
                    <Text style={styles.moodButtonEmoji}>{mood.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('journal.notes')}</Text>
              <TextInput
                style={[styles.input, styles.notesInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                placeholder="Add notes about this trade..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                value={newEntry.notes}
                onChangeText={text => setNewEntry({ ...newEntry, notes: text })}
              />

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleAddEntry}
              >
                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  entryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '700',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
  },
  entryDetails: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceLabel: {
    fontSize: 12,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  moodEmoji: {
    fontSize: 20,
  },
  profitLoss: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeButtonText: {
    fontWeight: '600',
  },
  priceInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
  },
  moodSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  moodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  moodButtonEmoji: {
    fontSize: 24,
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
