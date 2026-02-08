/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/Checkout.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { checkoutFunnel } from "../utils/tracking";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Code,
  chakra,
  Grid,
  GridItem,
  Input,
  Badge,
  useBreakpointValue,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import api, { getMyPurchases } from "../api/client";
import { getAllCountries, getDeviceCountryCode } from "../utils/countries";
import { printInvoice } from "../utils/printInvoice";
import SpotlightCard from "../components/SpotlightCard";
import PremiumCheckoutCard from "../components/PremiumCheckoutCard";
import TrustBadges, { SocialProofBanner } from "../components/TrustBadges";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

type Method = "usdt" | "card";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation() as any;
  const location = useLocation();
  const [deviceCode, setDeviceCode] = React.useState<string | null>(null);
  const qs = React.useMemo(() => new URLSearchParams(location.search), [location.search]);

  const tierId = qs.get("tierId") || "";
  const [purchaseId, setPurchaseId] = React.useState<string>(qs.get("purchaseId") || "");
  const [method, setMethod] = React.useState<Method>("usdt");
  const [network, setNetwork] = React.useState<'erc20' | 'trc20'>('trc20'); // Default to TRC-20 as preferred
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState<number | null>(null);
  const [tier, setTier] = React.useState<any | null>(null);
  const [allTiers, setAllTiers] = React.useState<any[]>([]);
  const [user, setUser] = React.useState<any | null>(null);
  const [country, setCountry] = React.useState("");
  const [courseLanguage, setCourseLanguage] = React.useState("en");
  const [promoCode, setPromoCode] = React.useState<string>("");
  const [refCode, setRefCode] = React.useState<string>("");
  const [alreadyEnrolled, setAlreadyEnrolled] = React.useState(false);
  const [vipTelegram, setVipTelegram] = React.useState(false);

  const [previewAmount, setPreviewAmount] = React.useState<number | null>(null);
  const [previewDiscount, setPreviewDiscount] = React.useState<number | null>(null);
  const [previewBase, setPreviewBase] = React.useState<number | null>(null);
  const [previewPath, setPreviewPath] = React.useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [previewError, setPreviewError] = React.useState<string | null>(null);

  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [paymentExpiresAt, setPaymentExpiresAt] = React.useState<number | null>(null);
  const [remainingSec, setRemainingSec] = React.useState(0);
  const [fromPhone, setFromPhone] = React.useState("");
  const [txnHash, setTxnHash] = React.useState("");
  const [proofSubmitting, setProofSubmitting] = React.useState(false);
  const [proofError, setProofError] = React.useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = React.useState<string | null>(null);
  const [proofSubmitted, setProofSubmitted] = React.useState(false);

  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);

  // NEW: Promo UX controls
  const [showPromoInput, setShowPromoInput] = React.useState(false);
  const [promoConfirmed, setPromoConfirmed] = React.useState(false);
  const hasTrackedStart = React.useRef(false);

  const brand = "#65a8bf";
  const cardBorder = "#65a8bf";
  const subtleText = "text.muted";
  const selectBorder = "#65a8bf";
  const selectFocus = "#65a8bf";

  const isMdUp = useBreakpointValue({ base: false, md: true });

  const openPaymentModal = React.useCallback(() => {
    const expires = Date.now() + 30 * 60 * 1000;
    setPaymentExpiresAt(expires);
    setPaymentOpen(true);
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        // Try to fetch from both courses and subscriptions endpoints
        let tResp: any = { data: null };
        if (tierId) {
          tResp = await api.get(`/courses/${tierId}`).catch(async () => {
            // If not found in courses, try subscriptions
            return await api.get(`/subscriptions/${tierId}`).catch(async () => {
              return await api.get(`/challenges/${tierId}`).catch(() => ({ data: null }));
            });
          });
        }
        
        const [me, mine, coursesResp, subsResp, challengesResp] = await Promise.all([
          api.get("/users/me").catch(() => ({ data: null })),
          getMyPurchases({ ttlMs: 10 * 60 * 1000 }).catch(() => [] as any[]),
          api.get("/courses").catch(() => ({ data: [] })),
          api.get("/subscriptions").catch(() => ({ data: [] })),
          api.get("/challenges").catch(() => ({ data: [] })),
        ]);
        
        setUser((me as any).data);
        setTier(tResp.data);
        
        const courses = Array.isArray(coursesResp.data) ? coursesResp.data : [];
        const subs = Array.isArray(subsResp.data) ? subsResp.data : [];
        const challenges = Array.isArray(challengesResp.data) ? challengesResp.data : [];
        setAllTiers([...challenges, ...courses, ...subs]);
        
        const list: any[] = Array.isArray(mine) ? (mine as any[]) : [];
        const enrolled = list.some(
          (p) =>
            String(p.status || "").toUpperCase() === "CONFIRMED" &&
            ((p.tier && p.tier.id === tierId) || p.tierId === tierId)
        );
        setAlreadyEnrolled(enrolled);
        
        // Track checkout started once tier is loaded
        if (tResp.data && !hasTrackedStart.current) {
          hasTrackedStart.current = true;
          const tierData = tResp.data;
          checkoutFunnel.started(
            tierData.id || tierId,
            tierData.name || 'Unknown',
            tierData.productType || 'course',
            tierData.price_usdt || 0
          );
        }
      } catch {}
    })();
  }, [tierId]);

  React.useEffect(() => {
    const ref = qs.get("ref");
    const stored = localStorage.getItem("refCode") || "";
    if (ref) {
      localStorage.setItem("refCode", ref);
      setRefCode(ref);
    } else if (stored) {
      setRefCode(stored);
    }
  }, [qs]);

  const priceStr = tier?.price_usdt ?? "";
  const usdPrice: number = typeof priceStr === "number" ? priceStr : Number(priceStr) || 0;

  const fetchPurchaseStatus = React.useCallback(async (): Promise<string | null> => {
    try {
      const list = await getMyPurchases({ force: true });
      const arr: any[] = Array.isArray(list) ? list : [];
      const found = arr.find((p) => p.id === purchaseId);
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
      if (st === "CONFIRMED") return;
      setTimeout(poll, 5000);
    };
    poll();
    return () => {
      active = false;
    };
  }, [fetchPurchaseStatus]);

  const startCheckout = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        tierId,
        method,
        purchaseId,
        country,
        courseLanguage,
        vipTelegram: !!vipTelegram && !tier?.isVipProduct,
      };
      if (promoConfirmed && promoCode) payload.promoCode = promoCode.trim();
      if (refCode) payload.refCode = refCode.trim();
      const resp = await api.post("/purchase/create", payload);
      const provider = (resp.data?.provider || "").toString().toLowerCase();

      if (resp.data?.purchaseId && !purchaseId) {
        setPurchaseId(resp.data.purchaseId as string);
        try {
          const k = "watchPurchaseIds";
          const arr = JSON.parse(localStorage.getItem(k) || "[]");
          if (Array.isArray(arr)) {
            if (!arr.includes(resp.data.purchaseId)) arr.push(resp.data.purchaseId);
            localStorage.setItem(k, JSON.stringify(arr));
          } else {
            localStorage.setItem(k, JSON.stringify([resp.data.purchaseId]));
          }
        } catch {}
      }

      if (provider === "usdt") {
        const addr = resp.data?.address || null;
        const amt =
          typeof resp.data?.amount === "number"
            ? resp.data.amount
            : Number(resp.data?.amount) || null;
        const finalAmt = previewAmount != null ? previewAmount : amt;
        setAddress(addr);
        setAmount(finalAmt);
        if (addr) {
          const { default: QRCode } = await import("qrcode");
          const dataUrl = await QRCode.toDataURL(addr, { margin: 1, scale: 5 });
          setQrDataUrl(dataUrl);
        } else {
          setQrDataUrl(null);
        }
        // Track payment initiated
        checkoutFunnel.paymentInitiated('usdt', finalAmt || 0);
        openPaymentModal();
      } else if (provider === "card") {
        const url = resp.data?.checkoutUrl || null;
        if (url) {
          // Track payment initiated for card
          checkoutFunnel.paymentInitiated('stripe', previewAmount || usdPrice || 0);
          window.location.href = String(url);
          return;
        }
        setError(t("checkout.errors.card_failed", { defaultValue: "Card checkout failed" }));
      } else if (provider === "free") {
        try {
          const k = "watchPurchaseIds";
          const arr = JSON.parse(localStorage.getItem(k) || "[]");
          if (Array.isArray(arr)) {
            if (!arr.includes(resp.data.purchaseId)) arr.push(resp.data.purchaseId);
            localStorage.setItem(k, JSON.stringify(arr));
          } else {
            localStorage.setItem(k, JSON.stringify([resp.data.purchaseId]));
          }
        } catch {}
        // Track free enrollment as completed checkout
        checkoutFunnel.completed(resp.data.purchaseId, 0, 'usdt');
        navigate("/enrolled");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to start checkout");
    } finally {
      setLoading(false);
    }
  }, [tierId, method, purchaseId, country, courseLanguage, promoConfirmed, promoCode, usdPrice, refCode, openPaymentModal, navigate, previewAmount, t, vipTelegram, tier?.isVipProduct]);

  const confirmPromo = React.useCallback(async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      if (!tierId) throw new Error("Missing course");
      const payload: any = {
        tierId,
        method,
        country,
        courseLanguage,
        preview: true,
        vipTelegram: !!vipTelegram && !tier?.isVipProduct,
      };
      if (promoCode) payload.promoCode = promoCode.trim();
      if (refCode) payload.refCode = refCode.trim();

      const resp = await api.post("/purchase/create", payload);
      const due = Number(resp.data?.amount);
      const disc = Number(resp.data?.discount);
      const baseUsed = Number(resp.data?.baseUsed);
      const validDue = Number.isFinite(due) ? due : null;
      const validDisc = Number.isFinite(disc) ? disc : null;
      const validBase = Number.isFinite(baseUsed) ? baseUsed : null;
      setPreviewAmount(validDue);
      setPreviewDiscount(validDisc);
      setPreviewBase(validBase);
      setPreviewPath(resp.data?.pricingPath || null);

      // Determine if promo applied
      const applied =
        !!promoCode &&
        validBase != null &&
        validDue != null &&
        Math.abs(validDue - validBase) >= 1e-6;

      setPromoConfirmed(applied);
      if (applied) {
        setShowPromoInput(false);
        // Track promo applied
        const discountPct = validBase && validDue ? Math.round((1 - validDue / validBase) * 100) : 0;
        checkoutFunnel.promoApplied(promoCode, discountPct);
      }

      if (promoCode && !applied) {
        setPreviewError(
          t("checkout.promo.not_applied", {
            defaultValue:
              "This promo didn’t apply (invalid, expired, not applicable, or per-user limit).",
          })
        );
      }
    } catch (e: any) {
      setPreviewError(e?.response?.data?.message || e?.message || "Failed to preview");
      setPreviewAmount(null);
      setPreviewDiscount(null);
      setPreviewBase(null);
      setPreviewPath(null);
      setPromoConfirmed(false);
    } finally {
      setPreviewLoading(false);
    }
  }, [
    tierId,
    method,
    country,
    courseLanguage,
    promoCode,
    refCode,
    t,
    vipTelegram,
    tier?.isVipProduct,
  ]);

  // Debounce preview on code typing (keep behavior)
  React.useEffect(() => {
    if (!promoCode) {
      setPreviewAmount(null);
      setPreviewDiscount(null);
      setPreviewBase(null);
      setPreviewPath(null);
      setPreviewError(null);
      setPromoConfirmed(false);
      return;
    }
    const id = setTimeout(() => {
      confirmPromo();
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoCode, method, country, courseLanguage, tierId]);

  const enrollFree = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!tierId) throw new Error("Missing course");
      const payload: any = { tierId, method: "free" };
      if (promoConfirmed && promoCode) payload.promoCode = promoCode.trim();
      if (refCode) payload.refCode = refCode.trim();
      await api.post("/purchase/create", payload);
      navigate("/enrolled");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to enroll");
    } finally {
      setLoading(false);
    }
  }, [tierId, navigate, promoConfirmed, promoCode, refCode]);

  const submitProof = async () => {
    setProofError(null);
    setProofSubmitting(true);
    try {
      let pid = purchaseId;
      if (!pid) {
        if (!tierId) throw new Error("Missing purchase ID");
        const resp = await api.post("/purchase/create", { tierId, method });
        const provider = (resp.data?.provider || "").toString().toLowerCase();
        if (resp.data?.purchaseId) {
          pid = resp.data.purchaseId as string;
          setPurchaseId(pid);
        }
        if (provider === "usdt") {
          setAddress(resp.data.address || "");
          setAmount(resp.data.amount || null);
        }
      }

      if (!txnHash)
        throw new Error(
          t("checkout.errors.txid_required", { defaultValue: "Please enter the transaction hash" })
        );
      const payload: any = { purchaseId: pid, method: "usdt", txHash: txnHash.trim() };

      let ok = false;
      try {
        await api.post("/purchase/confirm", payload);
        ok = true;
      } catch {
        await api.post("/purchase/proof", payload);
        ok = true;
      }

      if (ok) {
        setProofSubmitted(true);
        // Track proof submitted
        checkoutFunnel.proofSubmitted();
        startPollingStatus();
        try {
          const idToWatch = pid;
          if (idToWatch) {
            const k = "watchPurchaseIds";
            const arr = JSON.parse(localStorage.getItem(k) || "[]");
            if (Array.isArray(arr)) {
              if (!arr.includes(idToWatch)) arr.push(idToWatch);
              localStorage.setItem(k, JSON.stringify(arr));
            } else {
              localStorage.setItem(k, JSON.stringify([idToWatch]));
            }
          }
        } catch {}
      }
    } catch (e: any) {
      setProofError(
        e?.response?.data?.message ||
          e?.message ||
          t("checkout.errors.proof_failed", { defaultValue: "Failed to submit proof" })
      );
    } finally {
      setProofSubmitting(false);
    }
  };

  const CSelect = chakra("select");
  const isFree = usdPrice <= 0;
  const baseUsd = previewBase != null ? previewBase : usdPrice;

  const effectiveUsd = previewAmount != null ? previewAmount : baseUsd;
  const vipTier = React.useMemo(
    () => (allTiers || []).find((x: any) => x?.isVipProduct) || null,
    [allTiers]
  );
  const vipPriceUsd: number = React.useMemo(() => {
    const v = vipTier?.price_usdt;
    return typeof v === "number" ? v : Number(v || 0);
  }, [vipTier?.price_usdt]);
  const savedUsd = Math.max(0, baseUsd - effectiveUsd);

  const lang = String(i18n?.language || "en").toLowerCase();
  const freeLabel = t("checkout.free", {
    defaultValue: lang.startsWith("ar") ? "مجاني" : lang.startsWith("fr") ? "Gratuit" : "Free",
  });

  const countryOptions = React.useMemo(() => {
    return getAllCountries(i18n?.language || "en", deviceCode);
  }, [i18n?.language, deviceCode]);

  const vipAddonUsd = React.useMemo(() => {
    if (tier?.isVipProduct || !vipTelegram) return 0;
    const p = Number(vipPriceUsd);
    return Number.isFinite(p) && p > 0 ? p : 20; // fallback to 20 if price missing
  }, [tier?.isVipProduct, vipTelegram, vipPriceUsd]);  

  // Combined due amount (course + VIP add-on). Drives UI and totals.
  const totalUsd = React.useMemo(() => {
    const base = Number(effectiveUsd) || 0;
    const addon = Number(vipAddonUsd) || 0;
    return Math.max(0, base + addon);
  }, [effectiveUsd, vipAddonUsd]);
  const isZeroDue = totalUsd <= 0;

  React.useEffect(() => {
    const dc = getDeviceCountryCode();
    setDeviceCode(dc);
    if (!country && dc) setCountry(dc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const isAdvancedTier = React.useMemo(() => {
    const name = String(tier?.name || "").toLowerCase();
    const level = String(tier?.level || "").toLowerCase();
    return name.includes("advanced") || level.includes("advanced");
  }, [tier?.name, tier?.level]);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      alert(t("common.copied", { defaultValue: "Copied!" }));
    } catch {}
  };

  // Helpers for where to render controls
  const renderPromoBlock = (variant: "inline" | "footer") => {
    // hide when free product
    if (isFree) return null;

    const PromoToggle = (
      <HStack gap={2} flexWrap="wrap" align="center">
        {!showPromoInput && !promoConfirmed && (
          <ChakraLink
            as="button"
            color={brand}
            textDecoration="underline"
            onClick={() => setShowPromoInput(true)}
          >
            {t("checkout.promo.have_code", { defaultValue: "I have a promo code" })}
          </ChakraLink>
        )}
      </HStack>
    );

    const PromoInput = (
      <>
        <HStack gap={2} flexWrap="wrap" align="stretch" bg="bg.surface"> 
          <Input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder={t("checkout.promo.placeholder", {
              defaultValue: "Enter code",
            })}
            w={{ base: "100%", sm: "auto" }}
            flex="1"
          />
          <Button
            onClick={confirmPromo}
            isLoading={previewLoading}
            variant="outline"
            borderColor={brand}
            color="inherit"
            _hover={{ bg: "#65a8bf" }}
            w={{ base: "100%", sm: "auto" }}
          >
            {t("checkout.promo.confirm", { defaultValue: "Apply" })}
          </Button>
        </HStack>
        {previewError && (
          <Text mt={2} color="red.500" fontSize="sm">
            {previewError}
          </Text>
        )}
        {promoConfirmed && (
          <Text mt={2} color="green.600" fontSize="sm">
            {t("checkout.promo.applied", { defaultValue: "Promo applied!" })} {promoCode}
          </Text>
        )}
      </>
    );

    return (
      <Box mt={variant === "footer" ? 0 : 4}>
        <Text fontWeight={600} mb={1}>
          {t("checkout.promo.label", { defaultValue: "Promo Code" })}
        </Text>
        {!promoConfirmed && !showPromoInput && PromoToggle}
        {!promoConfirmed && showPromoInput && PromoInput}
      </Box>
    );
  };

  const onPrintInvoice = React.useCallback(() => {
    const buyer = { name: user?.name || "", email: user?.email || "", country };
    const items: { name: string; description?: string; unitPrice: number; quantity: number; total: number }[] = [];
    const courseName = String(tier?.name || "Course");
    const courseDesc = String(tier?.description || "");
    items.push({ name: courseName, description: courseDesc, unitPrice: baseUsd, quantity: 1, total: baseUsd });
    if (vipAddonUsd > 0) {
      items.push({ name: "VIP Telegram (monthly)", unitPrice: vipAddonUsd, quantity: 1, total: vipAddonUsd });
    }
    const status = String(purchaseStatus || "PENDING").toUpperCase();
    const subtotal = Math.max(0, baseUsd + (vipAddonUsd || 0));
    const discount = savedUsd > 0 ? savedUsd : undefined;
    const total = Math.max(0, totalUsd);
    printInvoice({
      id: purchaseId || "",
      status,
      issuedAt: new Date().toISOString(),
      currency: "USD",
      buyer,
      items,
      subtotal,
      discount,
      total,
      paymentMethod: method.toUpperCase(),
    });
  }, [user?.name, user?.email, country, tier?.name, tier?.description, baseUsd, vipAddonUsd, savedUsd, totalUsd, purchaseId, purchaseStatus, method]);

  const renderVipUpsell = (variant: "inline" | "footer") => {
    if (tier?.isVipProduct) return null; // don't upsell inside VIP product
    return (
      <Box
        mt={variant === "footer" ? 2 : 2}
        p={3}
        borderWidth={1}
        borderColor="#229ED9"
        borderRadius="md"
        bg="#229ED9"
      >
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <Box minW={0}>
            <Text fontWeight={600} color="white">
              {t("checkout.addons.vip.title", { defaultValue: "VIP Telegram (monthly)" })}
            </Text>
            <Text fontSize="sm" color="white">
              {t("checkout.addons.vip.subtitle", {
                defaultValue: `Recurring $${vipPriceUsd}/month. Cancel anytime.`,
              })}
            </Text>
          </Box>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={vipTelegram}
              onChange={(e) => setVipTelegram(e.target.checked)}
            />
            <Text fontSize="sm" color="white">
              {t("checkout.addons.vip.choose", {
                defaultValue: `Add ($${vipPriceUsd || 10}/month)`,
              })}
            </Text>
          </label>
        </HStack>
      </Box>
    );
  };

  return (
    <Box py={{ base: 4, md: 10 }} color="text.primary" overflowX="hidden">
      <Container maxW={{ base: "full", md: "6xl" }} px={{ base: 3, md: 6 }}>
        {/* Premium Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Box
            borderRadius="2xl"
            p={{ base: 5, md: 8 }}
            mb={{ base: 4, md: 6 }}
            bg="linear-gradient(135deg, rgba(101, 168, 191, 0.1) 0%, rgba(183, 162, 125, 0.05) 100%)"
            border="1px solid"
            borderColor="rgba(101, 168, 191, 0.3)"
            backdropFilter="blur(10px)"
          >
            <VStack spacing={4}>
              <HStack justify="space-between" align="start" w="full" flexWrap="wrap" gap={3}>
                <VStack align="start" gap={2} minW={0}>
                  <Heading
                    size={useBreakpointValue({ base: "lg", md: "xl" })}
                    bgGradient="linear(to-r, #65a8bf, #b7a27d)"
                    bgClip="text"
                    fontWeight="800"
                  >
                    {t("checkout.title", { defaultValue: "Complete Your Enrollment" })}
                  </Heading>
                  <Text color={subtleText} fontSize={{ base: "sm", md: "md" }}>
                    {t("checkout.subtitle", {
                      defaultValue: "You're one step away from transforming your trading journey",
                    })}
                  </Text>
                </VStack>
                <HStack gap={3}>
                  {tier?.level && (
                    <Badge
                      bg="linear-gradient(135deg, #65a8bf, #b7a27d)"
                      color="white"
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontWeight="600"
                    >
                      {tier.level}
                    </Badge>
                  )}
                  {purchaseId && (
                    <Button
                      variant="outline"
                      borderColor="#65a8bf"
                      color="#65a8bf"
                      _hover={{ bg: "rgba(101, 168, 191, 0.1)" }}
                      onClick={() => onPrintInvoice()}
                      size="sm"
                    >
                      {t("checkout.print_invoice", { defaultValue: "Print Invoice" })}
                    </Button>
                  )}
                </HStack>
              </HStack>
              <SocialProofBanner enrolledCount={2847} recentPurchases={12} />
            </VStack>
          </Box>
        </MotionBox>

        {tier?.isBundle && Array.isArray(tier?.bundleTierIds) && tier.bundleTierIds.length > 0 && (
          <Box
            p={3}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="md"
            mb={{ base: 4, md: 6 }}
            bg="bg.surface"
            w="full"
          >
            <Text fontWeight={600} mb={1}>
              {t("checkout.bundle.includes", { defaultValue: "This bundle includes:" })}
            </Text>
            <VStack align="start" spacing={1}>
              {tier.bundleTierIds
                .map((id: string) => allTiers.find((x) => x.id === id)?.name)
                .filter(Boolean)
                .map((name: any, idx: number) => (
                  <Text key={`bund-i-${idx}`}>• {name}</Text>
                ))}
            </VStack>
          </Box>
        )}

        {!tierId && (
          <Box
            p={3}
            border="1px solid"
            borderColor={brand}
            borderRadius="md"
            mb={{ base: 4, md: 6 }}
            bg="bg.surface"
            w="full"
          >
            <Text>
              {t("checkout.no_tier", {
                defaultValue: "No course tier selected. Go back and choose a course.",
              })}
            </Text>
          </Box>
        )}
        {alreadyEnrolled && (
          <Box
            p={3}
            border="1px solid"
            borderColor="green.300"
            borderRadius="md"
            mb={{ base: 4, md: 6 }}
            bg="bg.surface"
            color="green.700"
            w="full"
          >
            {t("checkout.already_enrolled", {
              defaultValue: "You already own this course. Enjoy learning!",
            })}
            <Button ml={3} mt={{ base: 2, md: 0 }} size="sm" onClick={() => navigate("/enrolled")}>
              {t("celebration.cta", { defaultValue: "Go to My Courses" })}
            </Button>
          </Box>
        )}

        {error && (
          <Box
            border="1px solid"
            borderColor="red.300"
            borderRadius="md"
            textAlign="center"
            borderWidth={1}
            bg="red.500"
            p={{ base: 4, md: 5 }}
            boxShadow="md"
            position={{ base: "static", md: "sticky" }}
            w="full"
            minW={0}
            color="#65a8bf"
            mb={{ base: 4, md: 4 }}
          >
            {error}
          </Box>
        )}

        <Grid
          templateColumns={{ base: "1fr", md: "2fr 1fr" }}
          gap={{ base: 4, md: 8 }}
          alignItems="start"
          w="full"
          minW={0}
        >
          {/* Left */}
          <GridItem minW={0}>
            <VStack align="stretch" gap={{ base: 4, md: 6 }} w="full" minW={0}>
              {/* Customer details */}
              <Box
                borderWidth={1}
                borderColor={cardBorder}
                bg="bg.surface"
                borderRadius="xl"
                p={{ base: 4, md: 5 }}
                boxShadow="md"
                position={{ base: "static", md: "sticky" }}
                top={{ md: 4 }}
                w="full"
                minW={0}
              >
                <Heading size="md" mb={4}>
                  {t("checkout.customer.details", { defaultValue: "Customer Details" })}
                </Heading>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <Box minW={0}>
                    <Text fontWeight={600} mb={1}>
                      {t("checkout.customer.full_name", { defaultValue: "Full Name" })}
                    </Text>
                    <Input
                      defaultValue={user?.name || ""}
                      placeholder={t("checkout.placeholders.name", { defaultValue: "Your name" })}
                      w="full"
                    />
                  </Box>
                  <Box minW={0}>
                    <Text fontWeight={600} mb={1}>
                      {t("checkout.customer.email", { defaultValue: "Email" })}
                    </Text>
                    <Input
                      defaultValue={user?.email || ""}
                      placeholder="you@example.com"
                      type="email"
                      w="full"
                    />
                  </Box>
                  <Box minW={0}>
                    <Text fontWeight={600} mb={1}>
                      {t("checkout.customer.country", { defaultValue: "Country/Region" })} <Text as="span" color="whiteAlpha.500" fontSize="xs" fontWeight="normal">({t("common.optional", { defaultValue: "optional" })})</Text>
                    </Text>
                    <CSelect
                      value={country}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setCountry(e.target.value)
                      }
                      style={{ padding: "10px", borderRadius: 10 }}
                      bg="bg.surface"
                      border="1px solid"
                      borderColor={selectBorder}
                      _focus={{ outline: "none", boxShadow: `0 0 0 1px ${selectFocus}` }}
                      w="full"
                    >
                      <option value="">
                        {t("checkout.placeholders.country", { defaultValue: "Choose country" })}
                      </option>
                      {countryOptions.map((opt) => (
                        <option key={opt.code} value={opt.code}>
                          {opt.name}
                        </option>
                      ))}
                    </CSelect>
                  </Box>
                  <Box minW={0}>
                    <Text fontWeight={600} mb={1}>
                      {t("checkout.customer.pref_lang", {
                        defaultValue: "Preferred Course Language",
                      })}
                    </Text>
                    <CSelect
                      value={courseLanguage}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setCourseLanguage(e.target.value)
                      }
                      style={{ padding: "10px", borderRadius: 10 }}
                      bg="bg.surface"
                      border="1px solid"
                      borderColor={selectBorder}
                      _focus={{ outline: "none", boxShadow: `0 0 0 1px ${selectFocus}` }}
                      w="full"
                    >
                      <option value="en">
                        {t("checkout.lang.en", { defaultValue: "English" })}
                      </option>
                      <option value="ar">
                        {t("checkout.lang.ar", { defaultValue: "Arabic" })}
                      </option>
                      <option value="fr">
                        {t("checkout.lang.fr", { defaultValue: "French" })}
                      </option>
                    </CSelect>
                  </Box>
                </Grid>
              </Box>

              {/* Payment */}
              {!isZeroDue && (
                <Box
                  borderWidth={1}
                  borderColor={cardBorder}
                  bg="bg.surface"
                  borderRadius="xl"
                  p={{ base: 4, md: 5 }}
                  boxShadow="md"
                  position={{ base: "static", md: "sticky" }}
                  top={{ md: 4 }}
                  w="full"
                  minW={0}
                >
                  <Heading size="md" mb={4}>
                    {t("checkout.payment.title", { defaultValue: "Payment Method" })}
                  </Heading>

                  <VStack align="stretch" gap={3}>
                    <HStack gap={3} flexWrap="wrap" align="center">
                      <input
                        type="radio"
                        id="usdt"
                        name="method"
                        checked={method === "usdt"}
                        onChange={() => setMethod("usdt")}
                      />
                      <label htmlFor="usdt">
                        {t("checkout.payment.usdt", { defaultValue: "USDT (TRC20)" })}
                      </label>
                    </HStack>
                    <HStack gap={3} flexWrap="wrap" align="center">
                      <input
                        type="radio"
                        id="card"
                        name="method"
                        checked={method === "card"}
                        onChange={() => setMethod("card")}
                      />
                      <label htmlFor="card">
                        {t("checkout.payment.card", { defaultValue: "Card (Stripe)" })}
                      </label>
                    </HStack>
                    <Text fontSize="sm" color={subtleText}>
                      {method === "usdt"
                        ? t("checkout.payment.usdt_only", {
                            defaultValue:
                              "You will see the address and QR code after clicking Complete Purchase.",
                          })
                        : t("checkout.payment.card_hint", {
                            defaultValue:
                              "You will be redirected to Stripe to complete your payment.",
                          })}
                    </Text>
                  </VStack>

                  {/* VIP upsell (kept inline for desktop view) */}
                  {isMdUp && !tier?.isVipProduct && renderVipUpsell("inline")}

                  {/* Promo block:
                      - Desktop: keep here.
                      - Mobile: rendered later at page footer. */}
                  {isMdUp && renderPromoBlock("inline")}

                  {/* Actions (desktop only) */}
                  {isMdUp && (
                    <HStack mt={6} gap={3} flexWrap="wrap">
                      <Button
                        onClick={startCheckout}
                        isLoading={loading}
                        disabled={!tierId || alreadyEnrolled}
                        size="lg"
                        bg="linear-gradient(135deg, #65a8bf, #b7a27d)"
                        color="white"
                        fontWeight="700"
                        px={8}
                        _hover={{
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 25px rgba(101, 168, 191, 0.4)",
                        }}
                        _active={{ transform: "translateY(0)" }}
                        transition="all 0.2s"
                        w={{ base: "100%", sm: "auto" }}
                      >
                        🔒 {t("checkout.actions.complete", { defaultValue: "Complete Secure Purchase" })}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        color="#65a8bf"
                        _hover={{ bg: "rgba(101, 168, 191, 0.1)" }}
                        w={{ base: "100%", sm: "auto" }}
                      >
                        {t("checkout.actions.back", { defaultValue: "Back" })}
                      </Button>
                    </HStack>
                  )}
                </Box>
              )}

              {/* Free path */}
              {isZeroDue && (
                <HStack gap={3} flexWrap="wrap">
                  <Button
                    onClick={enrollFree}
                    isLoading={loading}
                    disabled={!tierId || alreadyEnrolled}
                    variant="solid"
                    bg={brand}
                    _hover={{ opacity: 0.9 }}
                    w={{ base: "100%", sm: "auto" }}
                  >
                    {freeLabel}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    borderColor={brand}
                    color="inherit"
                    _hover={{ bg: "#65a8bf" }}
                    w={{ base: "100%", sm: "auto" }}
                  >
                    {t("checkout.actions.back", { defaultValue: "Back" })}
                  </Button>
                </HStack>
              )}
            </VStack>
          </GridItem>

          {/* Right: Order summary */}
          <GridItem minW={0}>
            <Box
              borderWidth={1}
              borderColor={cardBorder}
              bg="bg.surface"
              borderRadius="xl"
              p={{ base: 4, md: 5 }}
              boxShadow="md"
              position={{ base: "static", md: "sticky" }}
              top={{ md: 4 }}
              w="full"
              minW={0}
            >
              <Heading size="md" mb={4}>
                {t("checkout.summary.title", { defaultValue: "Order Summary" })}
              </Heading>
              <VStack align="stretch" gap={3}>
                <HStack justify="space-between" align="start" minW={0}>
                  <Box minW={0}>
                    <Text fontWeight={600} noOfLines={1}>
                      {tier?.name || t("checkout.summary.course", { defaultValue: "Course" })}
                    </Text>
                    <Text fontSize="sm" noOfLines={3}>
                      {tier?.description}
                    </Text>
                  </Box>
                  <Text fontWeight={700} textAlign="right" flexShrink={0} color="#65a8bf">
                    {isFree ? (
                      freeLabel
                    ) : savedUsd > 0 ? (
                      <>
                        <s>${baseUsd}</s> ${effectiveUsd}
                      </>
                    ) : (
                      `$${baseUsd || ""}`
                    )}
                  </Text>
                </HStack>

                <Box h="1px" bg="bg.surface" />

                {/* Benefits */}
                <VStack align="start" gap={1}>
                  <Text>
                    •{" "}
                    {t("checkout.benefits.certificate", {
                      defaultValue: "You’ll receive a certificate of achievement",
                    })}
                  </Text>
                  <Text>
                    •{" "}
                    {t("checkout.benefits.lifetime", {
                      defaultValue: "Lifetime access to all tiers",
                    })}
                  </Text>
                  {isAdvancedTier && (
                    <Text>
                      •{" "}
                      {t("checkout.benefits.vipSignals", {
                        defaultValue: "+ our Telegram VIP signals group",
                      })}
                    </Text>
                  )}
                  <Text>
                    •{" "}
                    {t("checkout.benefits.brokerBonus", {
                      defaultValue:
                        "Join our certified broker and enjoy a complimentary 50–100% bonus on your deposits",
                    })}
                  </Text>
                </VStack>

                <Box h="1px" bg="bg.surface" />

                {/* VIP add-on (summary) */}
                {!tier?.isVipProduct && vipTelegram && (
                  <>
                    <HStack justify="space-between">
                      <Text color="#65a8bf">
                        {t("checkout.addons.vip.title", { defaultValue: "VIP Telegram (monthly)" })}
                      </Text>
                      <Text fontWeight={700}>${vipPriceUsd || 20}</Text>
                    </HStack>
                    <Box h="1px" bg="bg.surface" />
                  </>
                )}

                {/* Promo line item (code + discount) */}
                {promoConfirmed && !isFree && (
                  <>
                    <HStack justify="space-between">
                      <Text>
                        {t("checkout.summary.promo", { defaultValue: "Promo" })}{" "}
                        <Text as="span" color={brand}>
                          ({promoCode})
                        </Text>
                      </Text>
                      <Text fontWeight={700} color="green.600">
                        {-1 * (previewDiscount || savedUsd) < 0
                          ? `- $${Math.abs(previewDiscount || savedUsd).toFixed(2)}`
                          : `- $${(previewDiscount || savedUsd).toFixed(2)}`}
                      </Text>
                    </HStack>
                    <Box h="1px" bg="bg.surface" />
                  </>
                )}

                <HStack justify="space-between">
                  <Text>{t("checkout.summary.subtotal", { defaultValue: "Subtotal" })}</Text>
                  <Text fontWeight={700} color="#65a8bf">
                    {isFree ? freeLabel : `$${(effectiveUsd + vipAddonUsd).toFixed(2)}`}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>{t("checkout.summary.total", { defaultValue: "Total" })}</Text>
                  <Text
                    fontWeight={800}
                    fontSize="xl"
                    bgGradient="linear(to-r, #65a8bf, #b7a27d)"
                    bgClip="text"
                  >
                    {isFree ? freeLabel : `$${(effectiveUsd + vipAddonUsd).toFixed(2)}`}
                  </Text>
                </HStack>

                {/* Trust Badges */}
                <Box pt={4}>
                  <TrustBadges variant="compact" />
                </Box>
              </VStack>
            </Box>
          </GridItem>
        </Grid>

        {/* === MOBILE FOOTER CONTROLS (shown only on base) === */}
        {!isMdUp && !isFree && (
          <VStack align="stretch" gap={4} mt={4}>
            {/* VIP upsell before purchase on mobile */}
            {renderVipUpsell("footer")}

            {/* Promo at the end on mobile */}
            {renderPromoBlock("footer")}

            {/* Final actions at the very end on mobile */}
            <VStack mt={2} gap={3} w="full">
              <Button
                onClick={startCheckout}
                isLoading={loading}
                disabled={!tierId || alreadyEnrolled}
                size="lg"
                w="full"
                bg="linear-gradient(135deg, #65a8bf, #b7a27d)"
                color="white"
                fontWeight="700"
                py={6}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(101, 168, 191, 0.4)",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
              >
                🔒 {t("checkout.actions.complete", { defaultValue: "Complete Secure Purchase" })}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                color="#65a8bf"
                w="full"
                _hover={{ bg: "rgba(101, 168, 191, 0.1)" }}
              >
                {t("checkout.actions.back", { defaultValue: "Back" })}
              </Button>
              <TrustBadges variant="compact" />
            </VStack>
          </VStack>
        )}

        {/* Payment modal */}
        {paymentOpen && !isZeroDue && (
          <Box
            position="fixed"
            inset={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
            px={{ base: 3, md: 4 }}
            py={{ base: 3, md: 6 }}
            bg="rgba(0,0,0,0.55)"
          >
            <Box
              bg="bg.surface"
              p={{ base: 4, md: 6 }}
              borderRadius="lg"
              maxW={{ base: "100%", sm: "540px" }}
              w="full"
              maxH="90vh"
              overflowY="auto"
              border="1px solid"
              borderColor="bg.surface"
              boxShadow="xl"
            >
              <Heading size="md" mb={4}>
                {t("checkout.modal.title", { defaultValue: "Payment Details" })}
              </Heading>

              <Text mb={2}>
                {t("checkout.modal.remaining", { defaultValue: "Time remaining:" })}{" "}
                <b>
                  {Math.floor(remainingSec / 60)}:{String(remainingSec % 60).padStart(2, "0")}
                </b>
              </Text>

              {method === "usdt" ? (
                <VStack align="stretch" gap={3}>
                  {address && (
                    <Box>
                      <Text fontSize="sm">
                        {t("checkout.modal.send_to", { defaultValue: "Send USDT (TRC20) to:" })}
                      </Text>
                      <HStack gap={2} align="stretch" mt={1} flexWrap="wrap">
                        <Code
                          p={2}
                          borderRadius="md"
                          display="block"
                          w={{ base: "100%", sm: "auto" }}
                          overflowWrap="anywhere"
                          wordBreak="break-all"
                        >
                          {address}
                        </Code>
                      </HStack>
                      <HStack gap={2} align="center" mt={2} flexWrap="wrap">
                        <Button
                          variant="solid"
                          bg={brand}
                          _hover={{ opacity: 0.9 }}
                          onClick={() => copy(address)}
                          w={{ base: "100%", sm: "auto" }}
                        >
                          {t("common.copy", { defaultValue: "Copy" })}
                        </Button>
                        {qrDataUrl && (
                          <a
                            href={qrDataUrl}
                            download="usdt-address-qr.png"
                            style={{ width: "100%" }}
                          >
                            <Button
                              variant="solid"
                              bg={brand}
                              color="#65a8bf"
                              _hover={{ opacity: 0.9 }}
                              w={{ base: "100%", sm: "auto" }}
                            >
                              {t("common.download_qr", { defaultValue: "Download QR" })}
                            </Button>
                          </a>
                        )}
                      </HStack>
                      {qrDataUrl && (
                        <Box mt={3} textAlign="center">
                          <img
                            src={qrDataUrl}
                            alt="USDT Address QR"
                            style={{
                              width: "180px",
                              maxWidth: "100%",
                              height: "auto",
                              margin: "0 auto",
                            }}
                          />
                          <Text fontSize="xs" color={subtleText} mt={1}>
                            {t("checkout.modal.scan_qr", { defaultValue: "Scan to pay" })}
                          </Text>
                        </Box>
                      )}
                      {amount ? (
                        <Text fontSize="sm" color={subtleText} mt={2}>
                          {t("checkout.modal.amount", { defaultValue: "Amount (approx):" })}{" "}
                          {amount} USDT
                        </Text>
                      ) : null}
                    </Box>
                  )}

                  <Text fontSize="sm">
                    {t("checkout.modal.txid_prompt", {
                      defaultValue: "Enter your transaction hash (TXID) after sending the USDT.",
                    })}
                  </Text>
                  <Input
                    placeholder={t("checkout.modal.txid_ph", { defaultValue: "Transaction hash" })}
                    value={txnHash}
                    onChange={(e) => setTxnHash(e.target.value)}
                    w="full"
                  />

                  {purchaseStatus && (
                    <Text fontSize="sm">
                      {t("checkout.modal.status", { defaultValue: "Current status:" })}{" "}
                      <b>{purchaseStatus}</b>
                    </Text>
                  )}
                  {proofError && (
                    <Box
                      p={2}
                      border="1px solid"
                      borderColor="red.300"
                      color="red.700"
                      borderRadius="md"
                    >
                      {proofError}
                    </Box>
                  )}
                  {proofSubmitted && purchaseStatus !== "CONFIRMED" && (
                    <Text fontSize="sm" color={subtleText}>
                      {t("checkout.modal.verifying", {
                        defaultValue:
                          "We are verifying your transaction. This can take a few minutes.",
                      })}
                    </Text>
                  )}
                </VStack>
              ) : null}

              <HStack justify="flex-end" mt={6} gap={3} flexWrap="wrap">
                <Button
                  variant="solid"
                  bg="red"
                  onClick={() => setPaymentOpen(false)}
                  w={{ base: "100%", sm: "auto" }}
                >
                  {t("checkout.modal.close", { defaultValue: "Close" })}
                </Button>
                <Button
                  variant="solid"
                  bg="green"
                  _hover={{ opacity: 0.9 }}
                  onClick={submitProof}
                  isLoading={!!proofSubmitting}
                  w={{ base: "100%", sm: "auto" }}
                >
                  {t("checkout.modal.paid", { defaultValue: "I've Paid" })}
                </Button>
              </HStack>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Checkout;
