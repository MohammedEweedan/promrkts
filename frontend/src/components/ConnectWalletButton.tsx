import React from "react";
import { Button, HStack, Text, useToast } from "@chakra-ui/react";
import { useInjectedWallet } from "../web3/useInjectedWallet";

function shortAddr(a?: string | null) {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default function ConnectWalletButton() {
  const toast = useToast();
  const { address, isConnected, connect, disconnect } = useInjectedWallet();
  const [loading, setLoading] = React.useState(false);

  if (isConnected) {
    return (
      <HStack spacing={3}>
        <Text fontSize="sm" opacity={0.85}>
          {shortAddr(address)}
        </Text>
        <Button size="sm" variant="solid" color="red.500" onClick={disconnect}>
          Disconnect
        </Button>
      </HStack>
    );
  }

  return (
    <Button
      size="sm"
      variant="solid"
      bg="#65a8bf"
      isLoading={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await connect();
        } catch (e: any) {
          toast({
            title: "Wallet connection failed",
            description: e?.message || "Could not connect wallet.",
            status: "error",
            duration: 3500,
            isClosable: true,
          });
        } finally {
          setLoading(false);
        }
      }}
    >
      Connect Wallet
    </Button>
  );
}
