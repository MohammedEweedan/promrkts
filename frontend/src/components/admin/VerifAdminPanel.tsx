import React from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Icon,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
} from "@chakra-ui/react";
import { ShieldCheck, Check } from "lucide-react";
import defaultApi from "../../api/client";
import { useTranslation } from "react-i18next";

type PurchaseStatus = "CONFIRMED" | "FAILED" | "PENDING";

export type VerificationsPanelProps = {
  /** Whether the current viewer is an admin (gate the panel). */
  isAdmin: boolean;
  /** Optional: inject a custom API client; defaults to ../../api/client */
  apiClient?: typeof defaultApi;
};

const VerificationsPanel: React.FC<VerificationsPanelProps> = ({
  isAdmin,
  apiClient = defaultApi,
}) => {
  const { t, i18n } = useTranslation() as any;

  const [users, setUsers] = React.useState<any[]>([]);
  const [businesses, setBusinesses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [coursePurchases, setCoursePurchases] = React.useState<any[]>([]);
  const [subscriptionPurchases, setSubscriptionPurchases] = React.useState<any[]>([]);
  const [challengePurchases, setChallengePurchases] = React.useState<any[]>([]);
  const [tokenPurchases, setTokenPurchases] = React.useState<any[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [u, b, p, tp] = await Promise.all([
        apiClient.get("/admin/users/pending"),
        apiClient.get("/admin/businesses/pending"),
        apiClient.get("/purchase/admin/pending"),
        apiClient.get("/tokens/purchase/pending"),
      ]);
      setUsers(u?.data?.data || []);
      setBusinesses(b?.data?.data || []);
      const pending = p?.data?.data || [];
      const getType = (purchase: any) =>
        String(purchase?.tier?.productType || "COURSE").toUpperCase();
      setCoursePurchases(pending.filter((purchase: any) => getType(purchase) === "COURSE"));
      setSubscriptionPurchases(
        pending.filter((purchase: any) => {
          const type = getType(purchase);
          return type === "SUBSCRIPTION_VIP" || type === "SUBSCRIPTION_AI";
        })
      );
      setChallengePurchases(pending.filter((purchase: any) => getType(purchase) === "CHALLENGE"));
      setTokenPurchases(tp?.data?.data || []);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  React.useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const verifyUser = async (id: string) => {
    await apiClient.post(`/admin/users/${id}/verify`);
    load();
  };

  const verifyBusiness = async (id: string) => {
    await apiClient.post(`/admin/businesses/${id}/verify`);
    load();
  };

  const setPurchaseStatus = async (id: string, status: PurchaseStatus) => {
    try {
      setUpdatingId(id);
      await apiClient.patch(`/purchase/admin/${id}/status`, { status });
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const setTokenPurchaseStatus = async (id: string, status: PurchaseStatus) => {
    try {
      setUpdatingId(id);
      await apiClient.patch("/tokens/purchase/status", { tokenPurchaseId: id, status });
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColor = (s: PurchaseStatus) =>
    s === "PENDING" ? "orange" : s === "CONFIRMED" ? "green" : "red";

  const statusLabel = (s: PurchaseStatus) =>
    ({
      PENDING: t("statuses.pending"),
      CONFIRMED: t("statuses.confirmed"),
      FAILED: t("statuses.failed"),
    }[s]);

  if (!isAdmin) {
    return (
      <Box py={6} color="text.primary">
        <Heading size="md" mb={2}>
          {t("forbidden.title")}
        </Heading>
        <Text>{t("forbidden.message")}</Text>
      </Box>
    );
  }

  const renderPurchaseCards = (
    items: any[],
    options: {
      showTier?: boolean;
      onConfirm: (id: string) => void;
      onFail: (id: string) => void;
      emptyLabel: string;
      meta?: (purchase: any) => React.ReactNode;
    }
  ) => {
    if (!items.length) return <Text>{options.emptyLabel}</Text>;
    return (
      <VStack align="stretch" gap={2}>
        {items.map((p) => (
          <Box
            key={p.id}
            border="1px solid"
            borderColor={statusColor(p.status as PurchaseStatus)}
            borderRadius="md"
            p={3}
          >
            <HStack justify="space-between" align="start">
              <Box>
                <HStack gap={3}>
                  <Badge colorScheme={statusColor(p.status as PurchaseStatus) as any}>
                    {statusLabel(p.status as PurchaseStatus)}
                  </Badge>
                  <Text fontWeight={600}>
                    {t("labels.purchase_short_id", { id: `#${String(p.id).slice(0, 8)}` })}
                  </Text>
                </HStack>
                <Text fontSize="sm" mt={1}>
                  {t("labels.user_line", {
                    name: p.user?.name || p.userId,
                    email: p.user?.email || t("labels.na"),
                  })}
                </Text>
                {options.showTier && (
                  <Text fontSize="sm">
                    {t("labels.course_line", {
                      course: p.tier?.name || p.tierId,
                    })}
                  </Text>
                )}
                {p.txnHash && (
                  <Text fontSize="sm">{t("labels.proof_line", { hash: p.txnHash })}</Text>
                )}
                {options.meta?.(p)}
                <Text fontSize="xs" color="text.muted">
                  {t("labels.created_at", {
                    date: new Date(p.createdAt).toLocaleString(i18n.language),
                  })}
                </Text>
              </Box>
              <HStack gap={2}>
                <Button
                  size="xs"
                  bg="green"
                  color="#65a8bf"
                  onClick={() => options.onConfirm(p.id)}
                  isLoading={updatingId === p.id}
                >
                  {t("actions.confirm")}
                </Button>
                <Button
                  size="xs"
                  variant="solid"
                  color="red"
                  onClick={() => options.onFail(p.id)}
                  isLoading={updatingId === p.id}
                >
                  {t("actions.fail")}
                </Button>
              </HStack>
            </HStack>
          </Box>
        ))}
      </VStack>
    );
  };

  const tabs = [
    {
      key: "users",
      label: t("sections.pending_users"),
      count: users.length,
      content: (
        <VStack align="stretch" gap={2}>
          {users.map((u) => (
            <HStack
              key={u.id}
              justify="space-between"
              border="1px solid"
              borderColor="border.default"
              borderRadius="md"
              p={3}
              bg="bg.surface"
            >
              <Box>
                <Text fontWeight={600}>{u.name}</Text>
                <Text fontSize="sm">{u.email}</Text>
              </Box>
              <HStack gap={3}>
                <Badge colorScheme="orange">{t("statuses.pending")}</Badge>
                <Button size="xs" onClick={() => verifyUser(u.id)}>
                  <Icon as={Check} style={{ marginInlineEnd: 8 }} /> {t("actions.verify")}
                </Button>
              </HStack>
            </HStack>
          ))}
          {users.length === 0 && <Text>{t("empty_states.no_pending_users")}</Text>}
        </VStack>
      ),
    },
    {
      key: "courses",
      label: t("sections.pending_course_purchases") || "Course Purchases",
      count: coursePurchases.length,
      content: renderPurchaseCards(coursePurchases, {
        showTier: true,
        onConfirm: (id) => setPurchaseStatus(id, "CONFIRMED"),
        onFail: (id) => setPurchaseStatus(id, "FAILED"),
        emptyLabel: t("empty_states.no_pending_payments"),
      }),
    },
    {
      key: "subscriptions",
      label: t("sections.pending_subscription_purchases") || "Subscriptions",
      count: subscriptionPurchases.length,
      content: renderPurchaseCards(subscriptionPurchases, {
        showTier: true,
        onConfirm: (id) => setPurchaseStatus(id, "CONFIRMED"),
        onFail: (id) => setPurchaseStatus(id, "FAILED"),
        emptyLabel: t("empty_states.no_pending_payments"),
      }),
    },
    {
      key: "challenges",
      label: t("sections.pending_challenge_purchases") || "Challenges",
      count: challengePurchases.length,
      content: renderPurchaseCards(challengePurchases, {
        showTier: true,
        onConfirm: (id) => setPurchaseStatus(id, "CONFIRMED"),
        onFail: (id) => setPurchaseStatus(id, "FAILED"),
        emptyLabel: t("empty_states.no_pending_payments"),
        meta: (p) =>
          p.tier?.challengePlatform ? (
            <Text fontSize="xs" color="text.muted">
              {t("labels.challenge_platform", { platform: p.tier.challengePlatform })}
            </Text>
          ) : null,
      }),
    },
    {
      key: "tokens",
      label: t("sections.pending_token_purchases") || "Token Purchases",
      count: tokenPurchases.length,
      content: renderPurchaseCards(tokenPurchases, {
        showTier: false,
        onConfirm: (id) => setTokenPurchaseStatus(id, "CONFIRMED"),
        onFail: (id) => setTokenPurchaseStatus(id, "FAILED"),
        emptyLabel: t("empty_states.no_pending_payments"),
        meta: (purchase) => (
          <>
            <Text fontSize="sm">
              {t("labels.tokens_line", {
                tokens: Number(purchase.tokens || 0).toLocaleString(),
                amount: purchase.usdtDue,
              })}
            </Text>
            {purchase.address && (
              <Text fontSize="xs" color="text.muted">
                {t("labels.wallet_address")}: {purchase.address}
              </Text>
            )}
          </>
        ),
      }),
    },
    {
      key: "businesses",
      label: t("sections.pending_businesses"),
      count: businesses.length,
      content: (
        <VStack align="stretch" gap={2}>
          {businesses.map((b) => (
            <HStack
              key={b.id}
              justify="space-between"
              border="1px solid"
              borderColor="border.default"
              borderRadius="md"
              p={3}
              bg="bg.surface"
            >
              <Box>
                <Text fontWeight={600}>{b.name}</Text>
                <Text fontSize="sm">{t("labels.owner_line", { owner: b.owner_id })}</Text>
              </Box>
              <HStack gap={3}>
                <Badge colorScheme={b.verified ? "green" : "orange"}>
                  {b.verified ? t("labels.yes") : t("labels.no")}
                </Badge>
                {!b.verified && (
                  <Button size="xs" onClick={() => verifyBusiness(b.id)}>
                    <Icon as={Check} style={{ marginInlineEnd: 8 }} /> {t("actions.verify")}
                  </Button>
                )}
              </HStack>
            </HStack>
          ))}
          {businesses.length === 0 && <Text>{t("empty_states.no_pending_businesses")}</Text>}
        </VStack>
      ),
    },
  ];

  return (
    <Box py={6} color="#65a8bf">
      <HStack justify="space-between" mb={4}>
        <Button onClick={load} isLoading={loading}>
          <Icon as={ShieldCheck} style={{ marginInlineEnd: 8 }} /> {t("actions.refresh")}
        </Button>
      </HStack>

      <Tabs colorScheme="teal" variant="enclosed" isLazy>
        <TabList flexWrap="wrap">
          {tabs.map((tab) => (
            <Tab key={tab.key}>
              {tab.label}
              <Badge ml={2} colorScheme="cyan">
                {tab.count}
              </Badge>
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabs.map((tab) => (
            <TabPanel key={tab.key}>
              <Heading size="md" mb={3}>
                {tab.label}
              </Heading>
              <Divider mb={4} opacity={0.2} />
              {tab.content}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default VerificationsPanel;