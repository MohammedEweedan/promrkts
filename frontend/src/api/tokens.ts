// src/api/tokens.ts
import api from "./client";

export type TokenInfo = {
  symbol: string;
  priceUsdtPerTok: number;
  profitSharePct: number; // 0.10
  totalSupply: string;    // bigint as string
  soldSupply: string;
  remainingSupply: string;
  userTokens: string;
  userPctOfTokenPool: number;     // 0..1
  userPctOfCompanyValue: number;  // 0..0.10
  // extras we will add (recommended):
  unlockAt?: string | null;       // ISO date
  earnedUsdt?: number;            // number
  earnedUsdtEstimate?: number;    // ✅ add this if backend returns this name
  totalProfitsUsdt?: number;
};

export async function getTokenInfo(): Promise<TokenInfo> {
  const r = await api.get("/tokens/info");
  return r.data;
}

export async function createTokenPurchase(payload: { tokens: number; method: "usdt" | "card" }) {
  const r = await api.post("/tokens/purchase/create", payload);
  return r.data as {
    provider: "usdt" | "card";
    tokenPurchaseId: string;
    address?: string;
    amount?: number;
    checkoutUrl?: string;
  };
}

export async function submitTokenProof(payload: { tokenPurchaseId: string; txHash: string }) {
  const r = await api.post("/tokens/purchase/proof", payload);
  return r.data as { ok: boolean; status: string };
}

export async function getMyTokenPurchases() {
  const r = await api.get("/tokens/purchase/mine");
  return r.data as Array<{
    id: string;
    status: "PENDING" | "CONFIRMED" | "FAILED";
    tokens: string;
    usdtDue: number;
    createdAt: string;
    confirmedAt?: string | null;
    txnHash?: string | null;
  }>;
}

export const marketBuy = async (payload: { tokens?: number; usdt?: number }) =>
  (await api.post("/tokens/market/buy", payload)).data;

export const marketSell = async (payload: { tokens?: number; usdt?: number }) =>
  (await api.post("/tokens/market/sell", payload)).data;

export const unstakeTokens = async (payload: { tokens: number; earlyUnlock?: boolean }) =>
  (await api.post("/tokens/unstake", payload)).data;

export const submitTokenPurchaseProof = async (payload: { tokenPurchaseId: string; txnHash: string }) =>
  (await api.post("/tokens/purchase/proof", payload)).data;

// ✅ Wallet linking
export const getMyWallet = async () => (await api.get("/tokens/wallet/me")).data;

export const linkUsdtWallet = async (payload: { address: string; network: "ERC20" | "TRC20" }) =>
  (await api.post("/tokens/wallet/link-usdt", payload)).data;

// ✅ Admin metrics
export const adminTokenMetrics = async () => (await api.get("/tokens/admin/metrics")).data;
