import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const WATCH_KEY = 'watchPurchaseIds';
const CELEBRATED_KEY = 'celebratedPurchaseIds';
const POLL_INTERVAL = 15000; // 15 seconds

export type PurchaseStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

export interface Purchase {
  id: string;
  tierId: string;
  status: PurchaseStatus;
  createdAt?: string;
  amount_usdt?: number;
  tier?: any;
}

let pollingTimer: NodeJS.Timeout | null = null;
let onConfirmCallback: ((purchase: Purchase) => void) | null = null;

export const addToWatchList = async (purchaseId: string) => {
  try {
    const existing = await AsyncStorage.getItem(WATCH_KEY);
    const arr = existing ? JSON.parse(existing) : [];
    if (Array.isArray(arr) && !arr.includes(purchaseId)) {
      arr.push(purchaseId);
      await AsyncStorage.setItem(WATCH_KEY, JSON.stringify(arr));
    }
  } catch (e) {
    console.log('Failed to add to watch list:', e);
  }
};

export const removeFromWatchList = async (purchaseId: string) => {
  try {
    const existing = await AsyncStorage.getItem(WATCH_KEY);
    const arr = existing ? JSON.parse(existing) : [];
    if (Array.isArray(arr)) {
      const filtered = arr.filter((id: string) => id !== purchaseId);
      await AsyncStorage.setItem(WATCH_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.log('Failed to remove from watch list:', e);
  }
};

export const addToCelebrated = async (purchaseId: string) => {
  try {
    const existing = await AsyncStorage.getItem(CELEBRATED_KEY);
    const arr = existing ? JSON.parse(existing) : [];
    if (Array.isArray(arr) && !arr.includes(purchaseId)) {
      arr.push(purchaseId);
      await AsyncStorage.setItem(CELEBRATED_KEY, JSON.stringify(arr));
    }
  } catch (e) {
    console.log('Failed to add to celebrated:', e);
  }
};

export const getMyPurchases = async (): Promise<Purchase[]> => {
  try {
    const resp = await api.get('/purchase/mine');
    return Array.isArray(resp.data) ? resp.data : [];
  } catch (e) {
    console.log('Failed to get purchases:', e);
    return [];
  }
};

export const hasConfirmedPurchases = async (): Promise<boolean> => {
  try {
    const purchases = await getMyPurchases();
    return purchases.some(p => p.status === 'CONFIRMED');
  } catch {
    return false;
  }
};

const pollPurchases = async () => {
  try {
    // Get watch list
    const watchStr = await AsyncStorage.getItem(WATCH_KEY);
    const watchList = watchStr ? JSON.parse(watchStr) : [];
    
    if (!Array.isArray(watchList) || watchList.length === 0) {
      return;
    }

    // Get celebrated list
    const celebratedStr = await AsyncStorage.getItem(CELEBRATED_KEY);
    const celebrated = celebratedStr ? JSON.parse(celebratedStr) : [];

    // Fetch all purchases
    const purchases = await getMyPurchases();
    
    // Find confirmed purchases that are being watched and not celebrated
    const confirmedPurchase = purchases.find(
      p => p.status === 'CONFIRMED' && 
           watchList.includes(p.id) && 
           !celebrated.includes(p.id)
    );

    if (confirmedPurchase) {
      // Mark as celebrated
      await addToCelebrated(confirmedPurchase.id);
      
      // Remove from watch list
      await removeFromWatchList(confirmedPurchase.id);
      
      // Trigger callback
      if (onConfirmCallback) {
        onConfirmCallback(confirmedPurchase);
      }
    }
  } catch (e) {
    console.log('Polling error:', e);
  }
};

export const startPolling = (onConfirm?: (purchase: Purchase) => void) => {
  if (onConfirm) {
    onConfirmCallback = onConfirm;
  }

  if (pollingTimer) {
    return; // Already polling
  }

  // Poll immediately
  pollPurchases();

  // Then poll every 15 seconds
  pollingTimer = setInterval(pollPurchases, POLL_INTERVAL);
};

export const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
  onConfirmCallback = null;
};
