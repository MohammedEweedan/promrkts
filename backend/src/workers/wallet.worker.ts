// src/workers/wallet.worker.ts
import prisma from "../config/prisma";
import { ethers } from "ethers";
import TronWeb from "tronweb";

type WalletNetwork = "ERC20" | "TRC20";
type WalletAsset = "USDT" | "PMKX";
type WalletDepositStatus = "DETECTED" | "CONFIRMED" | "REJECTED";

const ERC20_CONFIRMATIONS = Number(process.env.ERC20_CONFIRMATIONS || 8);
const POLL_MS = Number(process.env.WALLET_WORKER_POLL_MS || 10_000);

const ETH_RPC = process.env.ETH_RPC_URL || "";
const USDT_ERC20 = process.env.USDT_ERC20_CONTRACT || "";
const PMKX_ERC20 = process.env.PMKX_ERC20_CONTRACT || "";

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function decimals() view returns (uint8)",
];

type TokenContractCfg = { asset: WalletAsset; addr: string };

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function getProvider() {
  const anyE: any = ethers as any;
  if (typeof anyE.JsonRpcProvider === "function") return new anyE.JsonRpcProvider(ETH_RPC); // v6
  if (anyE.providers?.JsonRpcProvider) return new anyE.providers.JsonRpcProvider(ETH_RPC); // v5
  throw new Error("ethers JsonRpcProvider not found");
}

function formatUnits(raw: any, decimals: number): number {
  const anyE: any = ethers as any;
  try {
    if (typeof anyE.formatUnits === "function") return Number(anyE.formatUnits(raw, decimals)); // v6
    if (anyE.utils?.formatUnits) return Number(anyE.utils.formatUnits(raw, decimals)); // v5
  } catch {}
  return Number(raw) / Math.pow(10, decimals);
}

async function scanErc20Transfers() {
  if (!ETH_RPC) return;

  const provider: any = getProvider();

  const contracts: TokenContractCfg[] = [];
  if (USDT_ERC20) contracts.push({ asset: "USDT", addr: USDT_ERC20 });
  if (PMKX_ERC20) contracts.push({ asset: "PMKX", addr: PMKX_ERC20 });
  if (!contracts.length) return;

  const addrs = await prisma.walletAddress.findMany({
    where: { network: "ERC20" as any },
    select: { userId: true, asset: true, address: true },
  });

  if (!addrs.length) return;

  const addrToOwner = new Map<string, { userId: string; asset: WalletAsset; address: string }>();
  for (const a of addrs) {
    addrToOwner.set(String(a.address).toLowerCase(), {
      userId: String(a.userId),
      asset: String(a.asset) as WalletAsset,
      address: String(a.address),
    });
  }

  const latest: number = await provider.getBlockNumber();
  const fromBlock = Math.max(latest - 2000, 0);

  for (const c of contracts) {
    const token: any = new (ethers as any).Contract(c.addr, ERC20_ABI, provider);
    const decimals = Number(await token.decimals().catch(() => 6));

    const filter = token.filters.Transfer(null, null);
    const logs: any[] = await token.queryFilter(filter, fromBlock, latest);

    for (const log of logs) {
      const parsed = token.interface.parseLog(log);
      if (!parsed) continue;

      const to = String(parsed.args.to).toLowerCase();
      const owner = addrToOwner.get(to);
      if (!owner) continue;
      if (owner.asset !== c.asset) continue;

      const txHash = String(log.transactionHash);

      const exists = await prisma.walletDeposit.findFirst({
        where: { network: "ERC20" as any, asset: c.asset as any, txHash },
        select: { id: true },
      });
      if (exists) continue;

      const amount = formatUnits(parsed.args.value, decimals);
      if (!Number.isFinite(amount) || amount <= 0) continue;

      try {
        await prisma.walletDeposit.create({
          data: {
            userId: owner.userId,
            network: "ERC20" as any,
            asset: c.asset as any,
            address: owner.address,
            txHash,
            amount,
            status: "DETECTED" as any,
          },
        });
      } catch (e: any) {
        // ignore unique-race
        if (e?.code !== "P2002") throw e;
      }
    }
  }

  // confirm + credit
  const pending = await prisma.walletDeposit.findMany({
    where: { network: "ERC20" as any, status: "DETECTED" as any },
    take: 200,
  });

  for (const d of pending) {
    const receipt: any = await provider.getTransactionReceipt(d.txHash).catch(() => null);
    if (!receipt) continue;

    const currentBlock: number = await provider.getBlockNumber();
    const blockNum = Number(receipt.blockNumber || 0);
    if (!blockNum) continue;

    const confirmations = currentBlock - blockNum + 1;
    if (confirmations < ERC20_CONFIRMATIONS) continue;

    if (receipt.status != null && Number(receipt.status) !== 1) {
      await prisma.walletDeposit.update({
        where: { id: d.id },
        data: { status: "REJECTED" as any },
      });
      continue;
    }

    await prisma.$transaction(async (tx: { walletDeposit: { update: (arg0: { where: { id: any; }; data: { status: any; confirmedAt: Date; }; }) => any; }; userWallet: { upsert: (arg0: { where: { userId: any; } | { userId: any; }; create: any; update: any; }) => any; }; }) => {
      await tx.walletDeposit.update({
        where: { id: d.id },
        data: { status: "CONFIRMED" as any, confirmedAt: new Date() },
      });

      const asset = String(d.asset) as WalletAsset;

      if (asset === "USDT") {
        await tx.userWallet.upsert({
          where: { userId: d.userId },
          create: { userId: d.userId, usdtBalance: d.amount, pmkxBalance: BigInt(0) } as any,
          update: { usdtBalance: { increment: d.amount } as any } as any,
        });
      } else {
        const tok = BigInt(Math.floor(d.amount));
        if (tok <= BigInt(0)) return;

        await tx.userWallet.upsert({
          where: { userId: d.userId },
          create: { userId: d.userId, usdtBalance: 0, pmkxBalance: tok } as any,
          update: { pmkxBalance: { increment: tok } as any } as any,
        });
      }
    });
  }
}

async function scanTrc20Transfers() {
  // Keep TronWeb imported for when you implement TronGrid / QuickNode TRON scanning.
  // Example skeleton:
  // const fullHost = process.env.TRON_FULLHOST || "https://api.trongrid.io";
  // const tron = new TronWeb({ fullHost });
  return;
}

export async function runWalletWorker() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await scanErc20Transfers();
      await scanTrc20Transfers();
    } catch (e) {
      console.error("[wallet.worker] error:", (e as any)?.message || e);
    }
    await sleep(POLL_MS);
  }
}
