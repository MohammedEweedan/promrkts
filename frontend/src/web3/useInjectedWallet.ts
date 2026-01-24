import * as React from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useInjectedWallet() {
  const [address, setAddress] = React.useState<string | null>(null);
  const [chainId, setChainId] = React.useState<number | null>(null);
  const [provider, setProvider] = React.useState<ethers.providers.Web3Provider | null>(null);

  const isConnected = !!address;

  const connect = React.useCallback(async () => {
    if (!window.ethereum) throw new Error("No wallet found. Install MetaMask.");
    const p = new ethers.providers.Web3Provider(window.ethereum, "any");
    await p.send("eth_requestAccounts", []);
    const signer = p.getSigner();
    const addr = await signer.getAddress();
    const net = await p.getNetwork();

    setProvider(p);
    setAddress(addr);
    setChainId(net.chainId);
  }, []);

  // Note: wallets don't allow true disconnect programmatically; this just clears UI state.
  const disconnect = React.useCallback(() => {
    setAddress(null);
    setChainId(null);
    setProvider(null);
  }, []);

  React.useEffect(() => {
    if (!window.ethereum) return;

    const handleAccounts = (accounts: string[]) => {
      setAddress(accounts?.[0] ?? null);
    };

    const handleChain = (hexChainId: string) => {
      const id = parseInt(hexChainId, 16);
      setChainId(Number.isFinite(id) ? id : null);
    };

    window.ethereum.on?.("accountsChanged", handleAccounts);
    window.ethereum.on?.("chainChanged", handleChain);

    return () => {
      window.ethereum.removeListener?.("accountsChanged", handleAccounts);
      window.ethereum.removeListener?.("chainChanged", handleChain);
    };
  }, []);

  return { provider, address, chainId, isConnected, connect, disconnect };
}
