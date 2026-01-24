// src/pages/TokenCheckout.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Code,
  Input,
  Badge,
  useBreakpointValue,
  Divider,
  SimpleGrid,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useToast,
  Tooltip,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import SpotlightCard from "../components/SpotlightCard";
import { motion } from "framer-motion";
import { Coins, CreditCard, Copy, Timer } from "lucide-react";
import {
  createTokenPurchase,
  submitTokenProof,
  getMyTokenPurchases,
  getTokenInfo,
} from "../api/tokens";

type Method = "usdt" | "card";
const MotionBox = motion(Box);

const AI = {
  accent: "#65a8bf",
  edge: "rgba(104, 165, 191, .5)",
  glow: "0 0 40px rgba(104, 165, 191, .35)",
  bg: "rgba(11,19,34,0.98)",
  panel: "rgba(15,23,42,0.60)",
  border: "rgba(255,255,255,0.08)",
};

const TokenCheckout: React.FC = () => {
  const { t } = useTranslation() as any;
  const navigate = useNavigate();
  const toast = useToast();
  const isMdUp = useBreakpointValue({ base: false, md: true });
  const [quotedPrice, setQuotedPrice] = React.useState<number | null>(null);

  const [method, setMethod] = React.useState<Method>("usdt");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [tokenInfo, setTokenInfo] = React.useState<any | null>(null);

  const [tokensWanted, setTokensWanted] = React.useState<number>(0);
  const [purchaseId, setPurchaseId] = React.useState<string>("");
  const [address, setAddress] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState<number | null>(null);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);

  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [paymentExpiresAt, setPaymentExpiresAt] = React.useState<number | null>(null);
  const [remainingSec, setRemainingSec] = React.useState(0);

  const [txnHash, setTxnHash] = React.useState("");
  const [proofSubmitting, setProofSubmitting] = React.useState(false);
  const [proofError, setProofError] = React.useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = React.useState<string | null>(null);
  const [proofSubmitted, setProofSubmitted] = React.useState(false);

  const openPaymentModal = React.useCallback(() => {
    const expires = Date.now() + 30 * 60 * 1000;
    setPaymentExpiresAt(expires);
    setPaymentOpen(true);
  }, []);

  const symbol = tokenInfo?.symbol || "TOKEN";
  const startCheckout = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!tokensWanted || tokensWanted <= 0)
        throw new Error(t("token.checkout.errors.enterAmount"));

      const resp: any = await createTokenPurchase({ tokens: tokensWanted, method });

      // ---- purchase id (your backend returns `id`) ----
      const pid = resp?.tokenPurchaseId || resp?.id || resp?.purchase?.id || resp?.data?.id;
      if (pid) setPurchaseId(String(pid));

      // ---- quote / price ----
      const priceFromBackend =
        (typeof resp?.priceAtBuy === "number" ? resp.priceAtBuy : null) ??
        (resp?.tokens && resp?.usdtDue ? Number(resp.usdtDue) / Number(resp.tokens) : null);

      if (priceFromBackend && Number.isFinite(priceFromBackend)) {
        setQuotedPrice(priceFromBackend);
      }

      // ---- provider detection (backend may not return provider anymore) ----
      const provider =
        resp?.provider ||
        resp?.payment?.provider ||
        resp?.paymentProvider ||
        resp?.method ||
        method; // fall back to the selected UI method

      // ---- CARD ----
      if (provider === "card") {
        const url = resp?.checkoutUrl || resp?.payment?.checkoutUrl || resp?.url;
        if (url) {
          window.location.href = String(url);
          return;
        }
        throw new Error(t("token.checkout.errors.cardMissingUrl"));
      }

      // ---- USDT ----
      if (provider === "usdt") {
        // Address might be returned elsewhere, or you may need to fetch it by purchaseId
        const addr =
          resp?.address ||
          resp?.paymentAddress ||
          resp?.depositAddress ||
          resp?.payToAddress ||
          resp?.payment?.address ||
          null;

        // Your backend response includes `usdtDue` — use that as amount
        const amt =
          (typeof resp?.amount === "number" ? resp.amount : null) ??
          (resp?.usdtDue != null ? Number(resp.usdtDue) : null);

        setAddress(addr);
        setAmount(amt);

        if (!addr) {
          // If your backend intentionally doesn't return address here, you MUST fetch it via purchaseId
          throw new Error(t("token.checkout.errors.usdtMissingAddress"));
        }

        const { default: QRCode } = await import("qrcode");
        const dataUrl = await QRCode.toDataURL(addr, { margin: 1, scale: 5 });
        setQrDataUrl(dataUrl);

        openPaymentModal();
        return;
      }

      // ---- unknown ----
      throw new Error(`${t("token.checkout.errors.unknownProvider")}: ${String(provider)}`);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || t("token.checkout.errors.startFailed"));
    } finally {
      setLoading(false);
    }
  }, [tokensWanted, method, openPaymentModal, t]);

    const price = quotedPrice ?? Number(tokenInfo?.priceUsdtPerTok || tokenInfo?.price || 0);
    const estDue = tokensWanted > 0 && price > 0 ? tokensWanted * price : 0;

  const fadeIn = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  const [tokenInfoLoading, setTokenInfoLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        setTokenInfoLoading(true);
        const info = await getTokenInfo();
        setTokenInfo(info);
      } catch (e) {
        console.error("getTokenInfo failed", e);
        setTokenInfo(null);
      } finally {
        setTokenInfoLoading(false);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (!paymentOpen || !paymentExpiresAt) return;
    const tick = () => {
      const secs = Math.max(0, Math.floor((paymentExpiresAt - Date.now()) / 1000));
      setRemainingSec(secs);
      if (secs <= 0) setPaymentOpen(false);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [paymentOpen, paymentExpiresAt]);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "Copied",
        status: "success",
        duration: 1200,
        isClosable: true,
      });
    } catch {
      toast({
        title: "Copy failed",
        status: "error",
        duration: 1600,
        isClosable: true,
      });
    }
  };

  const fetchPurchaseStatus = React.useCallback(async (): Promise<string | null> => {
    try {
      if (!purchaseId) return null;
      const list = await getMyTokenPurchases();
      const found = (list || []).find((p: any) => p.id === purchaseId);
      const status = found?.status || null;
      if (status) setPurchaseStatus(status);
      return status;
    } catch {
      return null;
    }
  }, [purchaseId]);

  const startPollingStatus = React.useCallback(() => {
    let active = true;
    const poll = async () => {
      if (!active) return;
      const st = await fetchPurchaseStatus();
      if (st === "CONFIRMED") {
        navigate("/token");
        return;
      }
      setTimeout(poll, 5000);
    };
    poll();
    return () => {
      active = false;
    };
  }, [fetchPurchaseStatus, navigate]);

  const submitProof = async () => {
    setProofError(null);
    setProofSubmitting(true);

    try {
      if (!purchaseId) throw new Error("Missing purchase ID");
      if (!txnHash || txnHash.trim().length < 10) throw new Error("Enter valid TXID");

      await submitTokenProof({ tokenPurchaseId: purchaseId, txHash: txnHash.trim() });

      setProofSubmitted(true);
      toast({
        title: "Proof submitted",
        description: "We’re verifying your transaction.",
        status: "success",
        duration: 2200,
        isClosable: true,
      });

      startPollingStatus();
    } catch (e: any) {
      setProofError(e?.response?.data?.message || e?.message || "Failed to submit proof");
    } finally {
      setProofSubmitting(false);
    }
  };

  const timeMMSS = React.useMemo(() => {
    const mm = Math.floor(remainingSec / 60);
    const ss = String(remainingSec % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [remainingSec]);

  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="container.xl">
        <MotionBox initial="hidden" animate="visible" variants={fadeIn}>
          <VStack align="stretch" spacing={6}>
            {/* Header */}
            <SpotlightCard>
              <Box p={{ base: 5, md: 7 }}>
                <HStack justify="space-between" flexWrap="wrap" gap={3}>
                  <VStack align="start" spacing={1}>
                    <HStack spacing={3} wrap="wrap">
                      {tokenInfoLoading ? (
                        <Badge variant="outline">{t("token.checkout.loadingPrice")}</Badge>
                      ) : price ? (
                        <Badge variant="outline">
                          {t("token.checkout.priceLabel")} ${price.toFixed(6)} /{" "}
                          {t("token.checkout.tokenUnit")}
                        </Badge>
                      ) : (
                        <Badge colorScheme="red">{t("token.checkout.priceUnavailable")}</Badge>
                      )}
                    </HStack>

                    <Heading size="lg" color={AI.accent}>
                      Buy {symbol}
                    </Heading>

                    <Text color={AI.accent} opacity={0.75} maxW="3xl">
                      Create → pay → submit TXID → confirm. Same flow as your Token page, just
                      cleaner.
                    </Text>
                  </VStack>

                  <HStack gap={2} flexWrap="wrap">
                    <Button
                      variant="outline"
                      borderColor={AI.accent}
                      color={AI.accent}
                      onClick={() => navigate("/token")}
                    >
                      Back to Token
                    </Button>
                  </HStack>
                </HStack>
              </Box>
            </SpotlightCard>

            {error && (
              <Box
                p={4}
                border="1px solid rgba(255,90,90,0.35)"
                bg="rgba(255,90,90,0.10)"
                borderRadius="xl"
                color="red.200"
              >
                {error}
              </Box>
            )}

            {/* Main Checkout Card */}
            <SpotlightCard>
              <Box p={{ base: 5, md: 7 }}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {/* Left: Inputs */}
                  <Box>
                    <Heading size="md" color={AI.accent} mb={3}>
                      Order
                    </Heading>

                    <Box
                      p={4}
                      border="1px solid rgba(255,255,255,0.08)"
                      borderRadius="xl"
                      bg="rgba(15,23,42,0.55)"
                    >
                      <Text color={AI.accent} opacity={0.85} fontWeight={700} mb={2}>
                        Tokens to buy
                      </Text>

                      <Input
                        type="number"
                        value={tokensWanted || ""}
                        onChange={(e) => setTokensWanted(Math.max(0, Number(e.target.value || 0)))}
                        placeholder="e.g. 10000"
                        bg="rgba(11,19,34,0.65)"
                        borderColor="rgba(255,255,255,0.15)"
                        color={AI.accent}
                      />

                      <HStack mt={3} justify="space-between" flexWrap="wrap" gap={2}>
                        <Text color={AI.accent} opacity={0.7} fontSize="sm">
                          Est. due
                        </Text>
                        <Text color={AI.accent} fontWeight="bold">
                          {estDue.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT
                        </Text>
                      </HStack>
                    </Box>

                    <Divider my={5} borderColor="rgba(255,255,255,0.08)" />

                    <Heading size="md" color={AI.accent} mb={3}>
                      Payment method
                    </Heading>

                    <VStack align="stretch" spacing={3}>
                      {/* USDT Card */}
                      <Box
                        role="button"
                        onClick={() => setMethod("usdt")}
                        p={4}
                        borderRadius="xl"
                        border="1px solid"
                        borderColor={method === "usdt" ? AI.accent : "rgba(255,255,255,0.10)"}
                        bg={method === "usdt" ? "rgba(0,191,99,0.10)" : "rgba(15,23,42,0.55)"}
                        cursor="pointer"
                        transition="all .15s ease"
                        _hover={{ transform: "translateY(-1px)" }}
                      >
                        <HStack justify="space-between" flexWrap="wrap" gap={3}>
                          <HStack spacing={3}>
                            <Box
                              w="42px"
                              h="42px"
                              borderRadius="xl"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              border="1px solid rgba(255,255,255,0.10)"
                              bg="rgba(11,19,34,0.55)"
                            >
                              <Icon as={Coins as any} boxSize={5} color={AI.accent} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Text color={AI.accent} fontWeight="bold">
                                USDT (TRC20)
                              </Text>
                              <Text color={AI.accent} opacity={0.7} fontSize="sm">
                                Pay to address, then paste TXID
                              </Text>
                            </VStack>
                          </HStack>

                          {method === "usdt" ? (
                            <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                              Selected
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              borderRadius="full"
                              px={3}
                              py={1}
                              borderColor="rgba(255,255,255,0.18)"
                              color="rgba(255,255,255,0.8)"
                            >
                              Recommended
                            </Badge>
                          )}
                        </HStack>
                      </Box>

                      {/* Card / Stripe */}
                      <Box
                        role="button"
                        onClick={() => setMethod("card")}
                        p={4}
                        borderRadius="xl"
                        border="1px solid"
                        borderColor={method === "card" ? AI.accent : "rgba(255,255,255,0.10)"}
                        bg={method === "card" ? "rgba(0,191,99,0.10)" : "rgba(15,23,42,0.55)"}
                        cursor="pointer"
                        transition="all .15s ease"
                        _hover={{ transform: "translateY(-1px)" }}
                      >
                        <HStack justify="space-between" flexWrap="wrap" gap={3}>
                          <HStack spacing={3}>
                            <Box
                              w="42px"
                              h="42px"
                              borderRadius="xl"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              border="1px solid rgba(255,255,255,0.10)"
                              bg="rgba(11,19,34,0.55)"
                            >
                              <Icon as={CreditCard as any} boxSize={5} color={AI.accent} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Text color={AI.accent} fontWeight="bold">
                                Card (Stripe)
                              </Text>
                              <Text color={AI.accent} opacity={0.7} fontSize="sm">
                                Redirect to secure checkout
                              </Text>
                            </VStack>
                          </HStack>

                          {method === "card" ? (
                            <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                              Selected
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              borderRadius="full"
                              px={3}
                              py={1}
                              borderColor="rgba(255,255,255,0.18)"
                              color="rgba(255,255,255,0.8)"
                            >
                              Fast
                            </Badge>
                          )}
                        </HStack>
                      </Box>
                    </VStack>
                  </Box>

                  {/* Right: Summary */}
                  <Box>
                    <Heading size="md" color={AI.accent} mb={3}>
                      Summary
                    </Heading>

                    <Box
                      p={5}
                      borderRadius="2xl"
                      border="1px solid rgba(255,255,255,0.10)"
                      bg="rgba(15,23,42,0.55)"
                    >
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text color={AI.accent} opacity={0.75}>
                            Token
                          </Text>
                          <Text color={AI.accent} fontWeight="bold">
                            {symbol}
                          </Text>
                        </HStack>

                        <HStack justify="space-between">
                          <Text color={AI.accent} opacity={0.75}>
                            Amount
                          </Text>
                          <Text color={AI.accent} fontWeight="bold">
                            {tokensWanted ? tokensWanted.toLocaleString() : "—"}
                          </Text>
                        </HStack>

                        <HStack justify="space-between">
                          <Text color={AI.accent} opacity={0.75}>
                            Price
                          </Text>
                          <Text color={AI.accent} fontWeight="bold">
                            {price ? `$${price}` : "—"}
                          </Text>
                        </HStack>

                        <Divider borderColor="rgba(255,255,255,0.08)" />

                        <HStack justify="space-between">
                          <Text color={AI.accent} opacity={0.75}>
                            Total due
                          </Text>
                          <Text color={AI.accent} fontWeight="bold" fontSize="lg">
                            {estDue
                              ? `${estDue.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })} USDT`
                              : "—"}
                          </Text>
                        </HStack>

                        <Text color={AI.accent} opacity={0.55} fontSize="xs">
                          By continuing, you confirm you will submit a valid TXID (for USDT) or
                          complete checkout (card).
                        </Text>

                        <Button
                          mt={2}
                          bg={AI.accent}
                          color="black"
                          boxShadow={AI.glow}
                          onClick={startCheckout}
                          isLoading={loading}
                          isDisabled={!tokensWanted || tokensWanted <= 0}
                        >
                          Complete Purchase
                        </Button>

                        <Button
                          variant="outline"
                          borderColor={AI.accent}
                          color={AI.accent}
                          onClick={() => navigate("/token")}
                        >
                          Back
                        </Button>
                      </VStack>
                    </Box>
                  </Box>
                </SimpleGrid>
              </Box>
            </SpotlightCard>
          </VStack>
        </MotionBox>
      </Container>

      {/* Payment Modal (USDT) */}
      <Modal
        isOpen={paymentOpen && method === "usdt"}
        onClose={() => setPaymentOpen(false)}
        isCentered
        size={isMdUp ? "xl" : "full"}
      >
        <ModalOverlay bg="rgba(0,0,0,0.55)" />
        <ModalContent bg={AI.bg} border={`1px solid ${AI.edge}`} borderRadius="2xl">
          <ModalHeader color={AI.accent}>
            <HStack justify="space-between" pr={10}>
              <Text>Payment Details</Text>
              <HStack spacing={2}>
                <Icon as={Timer as any} color={AI.accent} />
                <Badge
                  borderRadius="full"
                  px={3}
                  py={1}
                  variant="outline"
                  borderColor={AI.accent}
                  color={AI.accent}
                >
                  {timeMMSS}
                </Badge>
              </HStack>
            </HStack>
          </ModalHeader>

          <ModalCloseButton color={AI.accent} />

          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Box
                p={4}
                borderRadius="2xl"
                border="1px solid rgba(255,255,255,0.10)"
                bg="rgba(15,23,42,0.55)"
              >
                <Text color={AI.accent} opacity={0.8} fontSize="sm">
                  Send <b>USDT (TRC20)</b> to the address below, then paste your <b>TXID</b>.
                </Text>

                <Divider my={3} borderColor="rgba(255,255,255,0.08)" />

                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text color={AI.accent} opacity={0.7} fontSize="xs">
                      Destination address
                    </Text>

                    <HStack mt={2} spacing={2} align="start">
                      <Code
                        w="full"
                        p={3}
                        borderRadius="xl"
                        bg="rgba(11,19,34,0.65)"
                        color={AI.accent}
                        border="1px solid rgba(255,255,255,0.10)"
                        wordBreak="break-all"
                      >
                        {address || "—"}
                      </Code>

                      <Tooltip label="Copy">
                        <Button
                          minW="46px"
                          h="46px"
                          p={0}
                          variant="outline"
                          borderColor={AI.accent}
                          color={AI.accent}
                          onClick={() => address && copy(address)}
                          isDisabled={!address}
                        >
                          <Icon as={Copy as any} />
                        </Button>
                      </Tooltip>
                    </HStack>

                    {amount != null ? (
                      <Text mt={2} color={AI.accent} opacity={0.75} fontSize="sm">
                        Amount (approx): <b>{amount} USDT</b>
                      </Text>
                    ) : null}
                  </Box>

                  {qrDataUrl && (
                    <Box
                      p={4}
                      borderRadius="2xl"
                      border="1px solid rgba(255,255,255,0.10)"
                      bg="rgba(11,19,34,0.45)"
                      textAlign="center"
                    >
                      <img
                        src={qrDataUrl}
                        alt="USDT QR"
                        style={{ width: 190, margin: "0 auto", borderRadius: 12 }}
                      />
                      <Text color={AI.accent} opacity={0.65} fontSize="xs" mt={2}>
                        Scan to pay
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Box>

              <Box
                p={4}
                borderRadius="2xl"
                border="1px solid rgba(255,255,255,0.10)"
                bg="rgba(15,23,42,0.55)"
              >
                <Text color={AI.accent} opacity={0.85} fontWeight="bold" mb={2}>
                  Paste TXID
                </Text>

                <Input
                  value={txnHash}
                  onChange={(e) => setTxnHash(e.target.value)}
                  placeholder="Transaction hash"
                  bg="rgba(11,19,34,0.65)"
                  borderColor="rgba(255,255,255,0.15)"
                  color={AI.accent}
                />

                {purchaseStatus && (
                  <Text mt={2} color={AI.accent} opacity={0.8} fontSize="sm">
                    Current status: <b>{purchaseStatus}</b>
                  </Text>
                )}

                {proofError && (
                  <Box
                    mt={3}
                    p={3}
                    borderRadius="xl"
                    border="1px solid rgba(255,90,90,0.35)"
                    bg="rgba(255,90,90,0.10)"
                    color="red.200"
                  >
                    {proofError}
                  </Box>
                )}

                {proofSubmitted && purchaseStatus !== "CONFIRMED" && (
                  <Text mt={2} color={AI.accent} opacity={0.7} fontSize="sm">
                    We’re verifying your transaction. This can take a few minutes.
                  </Text>
                )}
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack w="100%" justify="space-between" flexWrap="wrap" gap={2}>
              <Button
                variant="outline"
                borderColor="rgba(255,255,255,0.18)"
                color="rgba(255,255,255,0.85)"
                onClick={() => setPaymentOpen(false)}
              >
                Close
              </Button>

              <Button
                bg={AI.accent}
                color="black"
                boxShadow={AI.glow}
                onClick={submitProof}
                isLoading={proofSubmitting}
                isDisabled={!txnHash || txnHash.trim().length < 10}
              >
                I’ve Paid
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TokenCheckout;
