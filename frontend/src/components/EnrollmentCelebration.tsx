import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  useDisclosure,
  Box,
  HStack,
  VStack,
  Divider,
  Badge,
  Icon,
  keyframes,
  SimpleGrid,
  Stack,
  useToken,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api, { getMyPurchases } from "../api/client";
import Confetti from "./Confetti";
import { CheckCircle2, Send } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const getJson = <T,>(k: string, def: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : def;
  } catch {
    return def;
  }
};
const setJson = (k: string, v: any) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

const CELEBRATED_KEY = "celebratedPurchaseIds"; // string[]
const WATCH_KEY = "watchPurchaseIds"; // string[] set by checkout after proof submit

const GOLD = "#65a8bf";

/* ------------------------------------------------------------------ */
/* Visual polish: sheen + TOP-ONLY sprinkles (no emojis)              */
/* ------------------------------------------------------------------ */

const shine = keyframes`
  0% { transform: translateX(-120%); opacity: 0; }
  25% { opacity: 0.5; }
  100% { transform: translateX(140%); opacity: 0; }
`;

/** Tiny light/dark-aware dots that spawn near the TOP, drift & fade away */
const sprinkleFall = keyframes`
  0%   { transform: translateY(-10px) scale(0.9); opacity: 0; filter: blur(0px); }
  18%  { opacity: 0.85; }
  60%  { transform: translateY(32px) scale(1); }
  100% { transform: translateY(56px) scale(0.98); opacity: 0; filter: blur(0.3px); }
`;

const SprinklesTop: React.FC<{ zIndex?: number; count?: number }> = ({
  zIndex = 2,
  count = 28,
}) => {
  const lightColor = "rgba(182, 233, 255,0.80)"; // brand gold in light
  const darkColor = "rgba(140, 195, 219, 0.95)"; // warmer bright gold in dark
  const particleColor = useColorModeValue(lightColor, darkColor);
  const glowColor = useColorModeValue("rgba(182, 233, 255, 0.45)", "rgba(140, 195, 219, 0.55)");

  const [items, setItems] = React.useState<
    { id: number; left: string; top: string; size: number; delay: number; duration: number }[]
  >([]);

  React.useEffect(() => {
    const make = (i: number) => {
      // Spawn ONLY in the top band (2%..18% of height)
      const left = Math.random() * 90 + 5; // 5..95%
      const top = Math.random() * 16 + 2; // 2..18%
      const size = Math.round(Math.random() * 2) + 2; // 2..4px dots
      const delay = Math.random() * 1.6;
      const duration = Math.random() * 1.6 + 1.8; // 1.8..3.4s
      return { id: i, left: `${left}%`, top: `${top}%`, size, delay, duration };
    };
    const arr = Array.from({ length: count }).map((_, i) => make(i));
    setItems(arr);

    // Soft reshuffle so it keeps feeling alive
    const t = setInterval(() => {
      setItems((prev) => prev.map((it, i) => ({ ...make(i) })));
    }, 9000);
    return () => clearInterval(t);
  }, [count]);

  return (
    <Box
      position="absolute"
      inset={0}
      zIndex={zIndex}
      pointerEvents="none"
      aria-hidden="true"
      // clip the motion just a bit below the top so dots don't go everywhere
      overflow="hidden"
    >
      {items.map((it) => (
        <Box
          key={it.id}
          position="absolute"
          left={it.left}
          top={it.top}
          transform="translate(-50%, -50%)"
          w={`${it.size}px`}
          h={`${it.size}px`}
          borderRadius="999px"
          bg={particleColor}
          boxShadow={`0 0 10px ${glowColor}`}
          animation={`${sprinkleFall} ${it.duration}s ease-out ${it.delay}s infinite`}
        />
      ))}
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const EnrollmentCelebration: React.FC = () => {
  const { t } = useTranslation() as any;
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [current, setCurrent] = React.useState<{
    id: string;
    tierId?: string;
    tierName?: string;
    isVip?: boolean;
  } | null>(null);
  const [vipSelected, setVipSelected] = React.useState(false);

  // VIP window locals
  const [vipStart, setVipStart] = React.useState<string | null>(null);
  const [vipEnd, setVipEnd] = React.useState<string | null>(null);

  // Theme tokens for consistent shadows
  const [shadowLg] = useToken("shadows", ["lg"]);

  // Telegram handle (env)
  const tgHandle = process.env.REACT_APP_TELEGRAM_HANDLE || "";
  const tgLink = React.useMemo(
    () => (tgHandle ? `https://t.me/${tgHandle}` : "https://t.me/"),
    [tgHandle]
  );

  // URL param (optional)
  const vipParam = React.useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get("vip");
    } catch {
      return null;
    }
  }, []);

  // If returned from VIP checkout with vip=1, auto-open & persist/activate VIP
  React.useEffect(() => {
    if (vipParam === "1" && !isOpen) {
      setVipSelected(true);
      if (!current) setCurrent({ id: "vip" });
      onOpen();
      (async () => {
        try {
          await api.post("/community/vip/activate", {});
        } catch {}
      })();
      try {
        const key = "vipSubscription";
        const raw = localStorage.getItem(key);
        let startIso: string | null = null;
        let endIso: string | null = null;
        if (raw) {
          const parsed = JSON.parse(raw);
          startIso = parsed?.startIso || null;
          endIso = parsed?.endIso || null;
        }
        const now = new Date();
        if (!startIso) startIso = now.toISOString();
        if (!endIso) {
          const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          endIso = end.toISOString();
        }
        localStorage.setItem(key, JSON.stringify({ startIso, endIso }));
        setVipStart(startIso);
        setVipEnd(endIso);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vipParam, isOpen]);

  // Load persisted VIP window if any
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("vipSubscription");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.startIso) setVipStart(parsed.startIso);
        if (parsed?.endIso) setVipEnd(parsed.endIso);
      }
    } catch {}
  }, []);

  const trigger = React.useCallback(
    (purchase: any) => {
      const preferInline = localStorage.getItem("preferInlineCelebrate") === "1";
      setCurrent({
        id: purchase.id,
        tierId: purchase.tier?.id,
        tierName: purchase.tier?.name,
        isVip: !!purchase?.tier?.isVipProduct,
      });

      if (preferInline) {
        try {
          localStorage.setItem("celebrationInlineOpen", "1");
          localStorage.setItem(
            "celebrationCurrent",
            JSON.stringify({
              id: purchase.id,
              tierId: purchase.tier?.id,
              tierName: purchase.tier?.name,
            })
          );
          localStorage.setItem("disableModalCelebrate", "1");
        } catch {}
      } else {
        onOpen();
      }

      const celebrated = new Set(getJson<string[]>(CELEBRATED_KEY, []));
      celebrated.add(purchase.id);
      setJson(CELEBRATED_KEY, Array.from(celebrated));

      const watch = new Set(getJson<string[]>(WATCH_KEY, []));
      if (watch.has(purchase.id)) {
        watch.delete(purchase.id);
        setJson(WATCH_KEY, Array.from(watch));
      }

      try {
        const extras = getJson<Record<string, any>>("celebrationExtras", {});
        setVipSelected(!!extras[purchase.id]?.vipTelegram || !!purchase?.tier?.isVipProduct);
      } catch {}
    },
    [onOpen]
  );

  // Poll only when necessary (auth present AND there are watched purchases). Restart on storage changes.
  React.useEffect(() => {
    let mounted = true;
    let timer: any = null;

    const hasToken = () => !!localStorage.getItem("token");
    const watchSize = () => new Set(getJson<string[]>(WATCH_KEY, [])).size;

    const poll = async () => {
      if (!mounted) return;
      // If hidden, skip this cycle and try later
      if (document.visibilityState === "hidden") {
        timer = setTimeout(poll, 15000);
        return;
      }
      // Preconditions
      if (!hasToken() || watchSize() === 0) {
        // stop polling until storage changes
        return;
      }
      try {
        const data = await getMyPurchases({ force: true });
        if (!mounted || !Array.isArray(data)) {
          timer = setTimeout(poll, 15000);
          return;
        }
        const celebrated = new Set(getJson<string[]>(CELEBRATED_KEY, []));
        const watch = new Set(getJson<string[]>(WATCH_KEY, []));
        const confirmed = data.filter(
          (p: any) => String(p.status || "").toUpperCase() === "CONFIRMED"
        );
        const watchedConfirmed = confirmed.find(
          (p: any) => watch.has(p.id) && !celebrated.has(p.id)
        );
        if (watchedConfirmed) {
          trigger(watchedConfirmed);
        } else {
          const recent = confirmed.find((p: any) => !celebrated.has(p.id));
          if (recent) trigger(recent);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) timer = setTimeout(poll, 15000);
      }
    };

    const maybeStart = () => {
      if (!mounted) return;
      if (timer) return; // already running
      if (hasToken() && watchSize() > 0) {
        poll();
      }
    };

    // Start immediately if conditions are met
    maybeStart();

    // Restart on storage changes (watch list or token)
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== WATCH_KEY && e.key !== "token") return;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      // debounce a touch
      setTimeout(maybeStart, 100);
    };
    window.addEventListener("storage", onStorage);

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
    };
  }, [trigger]);

  const goToEnrolled = React.useCallback(() => {
    onClose();
    navigate("/enrolled");
  }, [navigate, onClose]);

  const startVip = React.useCallback(async () => {
    try {
      if (!current?.id) return;
      const resp = await api.post("/payments/vip", { purchaseId: current.id });
      const url = resp?.data?.url as string | undefined;
      if (url) window.location.href = url;
    } catch {}
  }, [current?.id]);

  const isVipPurchase = !!current?.isVip || vipSelected;

  /* ------------------------------------------------------------------ */
  /* UI                                                                 */
  /* ------------------------------------------------------------------ */

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg" motionPreset="scale">
      {/* Dim overlay */}
      <ModalOverlay bg="rgba(0,0,0,0.7)" backdropFilter="blur(6px)" />

      <ModalContent
        role="dialog"
        aria-labelledby="enroll-title"
        aria-modal="true"
        position="relative"
        overflow="hidden"
        bg="rgba(16,16,16,0.78)"
        backdropFilter="blur(14px)"
        borderRadius="2xl"
        px={{ base: 1, md: 2 }}
        py={{ base: 0, md: 0 }}
        border="1px solid"
        borderColor="transparent"
        _before={{
          content: '""',
          position: "absolute",
          inset: 0,
          padding: "1px",
          borderRadius: "inherit",
          background: `linear-gradient(135deg, rgba(182, 233, 255,0.85), rgba(255,255,255,0.08))`,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
        }}
        boxShadow="0 24px 72px rgba(0,0,0,0.5)"
      >
        {/* Confetti — no emojis now */}
        {isOpen && (
          <Confetti
            count={36}
            emojis={[]} // 🚫 remove emojis entirely
            durationRangeSec={[1.5, 3.0]}
            sizeRangePx={[18, 28]}
          />
        )}

        {/* TOP-ONLY sprinkles (light/dark aware) */}
        <SprinklesTop zIndex={2} count={26} />

        {/* sheen sweep */}
        <Box
          position="absolute"
          top={0}
          left={0}
          h="100%"
          w="36%"
          bg="linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0) 100%)"
          transform="skewX(-15deg)"
          animation={`${shine} 2000ms ease-out 400ms 1`}
          pointerEvents="none"
        />

        {/* Header */}
        <ModalHeader px={{ base: 5, md: 6 }} pt={{ base: 5, md: 6 }} pb={2}>
          <HStack spacing={3} align="center">
            <Box
              bg="rgba(182, 233, 255,0.22)"
              border="1px solid"
              borderColor="rgba(182, 233, 255,0.55)"
              rounded="full"
              p="6px"
              display="grid"
              placeItems="center"
              boxShadow="0 6px 18px rgba(182, 233, 255,0.25)"
            >
              <Icon as={CheckCircle2} color={GOLD} boxSize={5} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text id="enroll-title" fontWeight={900} color={GOLD} lineHeight="1.15" fontSize="lg">
                {isVipPurchase
                  ? t("celebration.vip_ready", { defaultValue: "VIP unlocked" })
                  : t("celebration.title", { defaultValue: "Enrollment Confirmed!" })}
              </Text>
              {current?.tierName && (
                <Badge mt="4px" colorScheme="yellow" variant="subtle">
                  {current.tierName}
                </Badge>
              )}
            </VStack>
          </HStack>
        </ModalHeader>

        {/* Body */}
        <ModalBody px={{ base: 5, md: 6 }} pb={4}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {/* Left: message */}
            <Stack spacing={3}>
              <Text fontWeight={700} >
                {isVipPurchase
                  ? t("celebration.vip_ready_desc", {
                      defaultValue:
                        "Join our VIP Telegram to access signals, live sessions and premium chat.",
                    })
                  : t("celebration.body", {
                      defaultValue:
                        "Congratulations, you're enrolled into {{course_name}} successfully.",
                      course_name:
                        current?.tierName || t("learn.course_fallback", { defaultValue: "Course" }),
                    })}
              </Text>

              <Text >
                {t("celebration.cta_hint", {
                  defaultValue: "Click below to get started on your path to mastering trading.",
                })}
              </Text>
            </Stack>

            {/* Right: VIP */}
            {!isVipPurchase && (
              <Box
                p={3}
                borderRadius="lg"
                bg="rgba(255,255,255,0.04)"
                border="1px solid rgba(182, 233, 255,0.35)"
                boxShadow={shadowLg}
              >
                {vipSelected ? (
                  <>
                    <HStack justify="space-between" align="start" mb={2}>
                      <VStack spacing={0} align="start">
                        <Text fontWeight={800} color={GOLD}>
                          {t("celebration.vip_ready", { defaultValue: "VIP unlocked" })}
                        </Text>
                        <Text fontSize="sm" >
                          {t("celebration.vip_ready_desc", {
                            defaultValue:
                              "Join our VIP Telegram to access signals, live sessions and premium chat.",
                          })}
                        </Text>
                      </VStack>
                      <Badge variant="outline" colorScheme="yellow">
                        VIP
                      </Badge>
                    </HStack>

                    <HStack gap={3} wrap="wrap">
                      <Button
                        onClick={() => window.open(tgLink, "_blank", "noreferrer")}
                        bg={GOLD}
                        color="#1a1a1a"
                        leftIcon={<Icon as={Send} />}
                        _hover={{ filter: "brightness(0.95)" }}
                      >
                        {t("celebration.vip_join", { defaultValue: "Open VIP Telegram" })}
                      </Button>

                      {(vipStart || vipEnd) && (
                        <Box fontSize="xs" >
                          {vipStart && <Text>Start: {new Date(vipStart).toLocaleString()}</Text>}
                          {vipEnd && <Text>Renews: {new Date(vipEnd).toLocaleString()}</Text>}
                        </Box>
                      )}
                    </HStack>
                  </>
                ) : (
                  <>
                    <Text fontWeight={800} color={GOLD} mb={1}>
                      {t("celebration.vip_offer", {
                        defaultValue: "Add VIP Telegram monthly subscription now:",
                      })}
                    </Text>
                    <Button
                      onClick={startVip}
                      bg={GOLD}
                      color="#1a1a1a"
                      leftIcon={<Icon as={Send} />}
                      _hover={{ filter: "brightness(0.95)" }}
                    >
                      {t("celebration.vip_subscribe", { defaultValue: "Subscribe to VIP" })}
                    </Button>
                  </>
                )}
              </Box>
            )}
          </SimpleGrid>
        </ModalBody>

        <Divider opacity={0.15} />

        {/* Footer CTAs */}
        <ModalFooter px={{ base: 5, md: 6 }} pb={{ base: 5, md: 6 }}>
          <HStack w="100%" justify="space-between" flexWrap="wrap" gap={3}>
            <Text fontSize="sm" >
              {t("celebration.help", {
                defaultValue: "Need help? Reach out in community chat any time.",
              })}
            </Text>
            <HStack spacing={3}>
              <Button
                variant="solid"
                _hover={{ bg: "whiteAlpha.100" }}
                onClick={onClose}
              >
                {t("common.close", { defaultValue: "Close" })}
              </Button>
              {isVipPurchase ? (
                <Button
                  bg={GOLD}
                  color="#1a1a1a"
                  _hover={{ filter: "brightness(0.95)" }}
                  onClick={() => window.open(tgLink, "_blank", "noreferrer")}
                >
                  {t("celebration.vip_join", { defaultValue: "Open VIP Telegram" })}
                </Button>
              ) : (
                <Button
                  bg={GOLD}
                  color="#1a1a1a"
                  _hover={{ filter: "brightness(0.95)" }}
                  onClick={goToEnrolled}
                >
                  {t("celebration.cta", { defaultValue: "Go to My Courses" })}
                </Button>
              )}
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EnrollmentCelebration;
