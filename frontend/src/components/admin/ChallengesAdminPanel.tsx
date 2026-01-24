import React from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Input,
  Select,
  Spinner,
  Textarea,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import api from "../../api/client";

type TierRow = {
  id: string;
  name: string;
  description: string;
  price_usdt: number;
  price_stripe: number;
  level?: string;
  productType?: string;
  challengePlatform?: string | null;
  challengeMeta?: any;
  updatedAt?: string;
};

type AccountRow = {
  id: string;
  status: string;
  platform?: string | null;
  mt5Login?: string | null;
  mt5Server?: string | null;
  createdAt?: string;
  user?: { id: string; name?: string | null; email?: string | null };
  tier?: { id: string; name?: string | null; challengeMeta?: any };
  purchase?: { id: string; status?: string; createdAt?: string };
  latestDaily?: {
    date?: string;
    pnl?: number;
    maxDailyDrawdown?: number;
    maxDailyProfit?: number;
    balance?: number;
    equity?: number;
  } | null;
};

const ChallengesAdminPanel: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<AccountRow[]>([]);

  const [tiersLoading, setTiersLoading] = React.useState(false);
  const [tiers, setTiers] = React.useState<TierRow[]>([]);

  const [edit, setEdit] = React.useState<Record<string, any>>({});

  const [tierEdit, setTierEdit] = React.useState<Record<string, any>>({});

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get("/admin/challenges/accounts");
      setRows(Array.isArray(resp.data?.data) ? resp.data.data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load challenge accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTiers = React.useCallback(async () => {
    setTiersLoading(true);
    setError(null);
    try {
      const resp = await api.get("/admin/challenges/tiers");
      setTiers(Array.isArray(resp.data?.data) ? resp.data.data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load challenge tiers");
    } finally {
      setTiersLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
    loadTiers();
  }, [load, loadTiers]);

  React.useEffect(() => {
    // keep deps explicit to avoid stale closure without changing behavior
  }, [loadTiers]);

  const patchTier = async (id: string) => {
    const patch = tierEdit[id] || {};
    const payload: any = { ...patch };
    // If meta is edited in textarea, send as string (backend supports string or object)
    if (payload.challengeMetaText != null) {
      payload.challengeMeta = payload.challengeMetaText;
      delete payload.challengeMetaText;
    }
    setTiersLoading(true);
    setError(null);
    try {
      await api.patch(`/admin/challenges/tiers/${id}`, payload);
      await loadTiers();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to update challenge tier");
    } finally {
      setTiersLoading(false);
    }
  };

  const patchAccount = async (id: string) => {
    const patch = edit[id] || {};
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/admin/challenges/accounts/${id}`, patch);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to update account");
    } finally {
      setLoading(false);
    }
  };

  const pushDaily = async (id: string) => {
    const patch = edit[id] || {};
    const payload = {
      date: patch.dailyDate || new Date().toISOString(),
      pnl: patch.pnl,
      maxDailyDrawdown: patch.maxDailyDrawdown,
      maxDailyProfit: patch.maxDailyProfit,
      balance: patch.balance,
      equity: patch.equity,
    };
    setLoading(true);
    setError(null);
    try {
      await api.post(`/admin/challenges/accounts/${id}/daily`, payload);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to ingest daily stats");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack align="stretch" gap={4}>
      <HStack justify="space-between" align="center">
        <Heading size="md" color="#65a8bf">
          Challenges Command Center
        </Heading>
        <HStack>
          <Button size="sm" onClick={loadTiers} isLoading={tiersLoading}>
            Refresh Products
          </Button>
          <Button size="sm" onClick={load} isLoading={loading}>
            Refresh Accounts
          </Button>
        </HStack>
      </HStack>

      {error && (
        <Box border="1px solid" borderColor="red.300" borderRadius="md" p={3} color="red.200">
          {error}
        </Box>
      )}

      <Tabs colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab>Challenge Products</Tab>
          <Tab>Challenge Accounts</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            {tiersLoading && tiers.length === 0 ? (
              <HStack>
                <Spinner size="sm" />
                <Text color="gray.300">Loading…</Text>
              </HStack>
            ) : (
              <SimpleGrid columns={[1, 1, 2]} gap={4}>
                {tiers.map((t) => {
                  const patch = tierEdit[t.id] || {};
                  const metaText =
                    patch.challengeMetaText != null
                      ? patch.challengeMetaText
                      : JSON.stringify(t.challengeMeta ?? {}, null, 2);

                  return (
                    <Box
                      key={t.id}
                      border="1px solid"
                      borderRadius="lg"
                      p={4}
                      bg="rgba(0,0,0,0.2)"
                    >
                      <VStack align="stretch" gap={3}>
                        <Box>
                          <Text fontSize="xs" opacity={0.7} color="gray.200">
                            Tier ID: {t.id}
                          </Text>
                          <Text fontSize="xs" opacity={0.7} color="gray.300">
                            Updated: {t.updatedAt ? String(t.updatedAt) : "—"}
                          </Text>
                        </Box>

                        <Input
                          size="sm"
                          placeholder="Name"
                          value={patch.name ?? t.name ?? ""}
                          onChange={(e) =>
                            setTierEdit((prev) => ({
                              ...prev,
                              [t.id]: { ...(prev[t.id] || {}), name: e.target.value },
                            }))
                          }
                        />

                        <Textarea
                          size="sm"
                          placeholder="Description"
                          value={patch.description ?? t.description ?? ""}
                          onChange={(e) =>
                            setTierEdit((prev) => ({
                              ...prev,
                              [t.id]: { ...(prev[t.id] || {}), description: e.target.value },
                            }))
                          }
                        />

                        <SimpleGrid columns={[1, 2, 2]} gap={2}>
                          <Input
                            size="sm"
                            placeholder="Price USDT (USD)"
                            value={patch.price_usdt ?? t.price_usdt ?? ""}
                            onChange={(e) =>
                              setTierEdit((prev) => ({
                                ...prev,
                                [t.id]: { ...(prev[t.id] || {}), price_usdt: e.target.value },
                              }))
                            }
                          />
                          <Input
                            size="sm"
                            placeholder="Price Card (cents)"
                            value={patch.price_stripe ?? t.price_stripe ?? ""}
                            onChange={(e) =>
                              setTierEdit((prev) => ({
                                ...prev,
                                [t.id]: { ...(prev[t.id] || {}), price_stripe: e.target.value },
                              }))
                            }
                          />
                          <Input
                            size="sm"
                            placeholder="Platform (e.g. MT5)"
                            value={patch.challengePlatform ?? t.challengePlatform ?? ""}
                            onChange={(e) =>
                              setTierEdit((prev) => ({
                                ...prev,
                                [t.id]: { ...(prev[t.id] || {}), challengePlatform: e.target.value },
                              }))
                            }
                          />
                          <Select
                            size="sm"
                            value={patch.level ?? t.level ?? "BEGINNER"}
                            onChange={(e) =>
                              setTierEdit((prev) => ({
                                ...prev,
                                [t.id]: { ...(prev[t.id] || {}), level: e.target.value },
                              }))
                            }
                          >
                            <option value="BEGINNER">BEGINNER</option>
                            <option value="INTERMEDIATE">INTERMEDIATE</option>
                            <option value="ADVANCED">ADVANCED</option>
                          </Select>
                        </SimpleGrid>

                        <Box>
                          <Text fontSize="xs" opacity={0.75} color="gray.200" mb={2}>
                            Challenge Meta (JSON)
                          </Text>
                          <Textarea
                            size="sm"
                            fontFamily="mono"
                            minH="180px"
                            value={metaText}
                            onChange={(e) =>
                              setTierEdit((prev) => ({
                                ...prev,
                                [t.id]: { ...(prev[t.id] || {}), challengeMetaText: e.target.value },
                              }))
                            }
                          />
                        </Box>

                        <HStack justify="flex-end">
                          <Button size="sm" onClick={() => patchTier(t.id)} isLoading={tiersLoading}>
                            Save Tier
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  );
                })}
              </SimpleGrid>
            )}
          </TabPanel>

          <TabPanel px={0}>
            {loading && rows.length === 0 ? (
              <HStack>
                <Spinner size="sm" />
                <Text color="gray.300">Loading…</Text>
              </HStack>
            ) : (
              <SimpleGrid columns={[1, 1, 2]} gap={4}>
                {rows.map((r) => {
                  const patch = edit[r.id] || {};
                  const tierName = r.tier?.name || "Challenge";
                  const userLabel = r.user?.email || r.user?.name || r.user?.id || "";
                  return (
                    <Box
                      key={r.id}
                      border="1px solid"
                      borderRadius="lg"
                      p={4}
                      bg="rgba(0,0,0,0.2)"
                    >
                      <VStack align="stretch" gap={3}>
                        <Box>
                          <Text fontSize="xs" opacity={0.7} color="gray.200">
                            {tierName}
                          </Text>
                          <Text fontSize="sm" color="gray.100">
                            {userLabel}
                          </Text>
                          <Text fontSize="xs" opacity={0.7} color="gray.300">
                            Status: <b>{String(r.status || "PENDING")}</b> • Platform: {String(r.platform || "MT5")}
                          </Text>
                        </Box>

                        <HStack gap={2} flexWrap="wrap">
                          <Select
                            size="sm"
                            value={patch.status ?? r.status}
                            onChange={(e) =>
                              setEdit((prev) => ({
                                ...prev,
                                [r.id]: { ...(prev[r.id] || {}), status: e.target.value },
                              }))
                            }
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="FAILED">FAILED</option>
                            <option value="PASSED">PASSED</option>
                          </Select>
                          <Input
                            size="sm"
                            placeholder="MT5 Login"
                            value={patch.mt5Login ?? r.mt5Login ?? ""}
                            onChange={(e) =>
                              setEdit((prev) => ({
                                ...prev,
                                [r.id]: { ...(prev[r.id] || {}), mt5Login: e.target.value },
                              }))
                            }
                          />
                          <Input
                            size="sm"
                            placeholder="MT5 Server"
                            value={patch.mt5Server ?? r.mt5Server ?? ""}
                            onChange={(e) =>
                              setEdit((prev) => ({
                                ...prev,
                                [r.id]: { ...(prev[r.id] || {}), mt5Server: e.target.value },
                              }))
                            }
                          />
                        </HStack>

                        <HStack justify="flex-end" gap={2}>
                          <Button size="sm" onClick={() => patchAccount(r.id)} isLoading={loading}>
                            Save
                          </Button>
                        </HStack>

                        <Box borderTop="1px solid" pt={3}>
                          <Text fontSize="xs" opacity={0.75} color="gray.200" mb={2}>
                            Daily stats (placeholder ingestion)
                          </Text>
                          <SimpleGrid columns={[1, 2, 2]} gap={2}>
                            <Input
                              size="sm"
                              placeholder="Date (ISO)"
                              value={patch.dailyDate || ""}
                              onChange={(e) =>
                                setEdit((prev) => ({
                                  ...prev,
                                  [r.id]: { ...(prev[r.id] || {}), dailyDate: e.target.value },
                                }))
                              }
                            />
                            <Input
                              size="sm"
                              placeholder="PnL"
                              value={patch.pnl ?? ""}
                              onChange={(e) =>
                                setEdit((prev) => ({
                                  ...prev,
                                  [r.id]: { ...(prev[r.id] || {}), pnl: e.target.value },
                                }))
                              }
                            />
                            <Input
                              size="sm"
                              placeholder="Max DD"
                              value={patch.maxDailyDrawdown ?? ""}
                              onChange={(e) =>
                                setEdit((prev) => ({
                                  ...prev,
                                  [r.id]: { ...(prev[r.id] || {}), maxDailyDrawdown: e.target.value },
                                }))
                              }
                            />
                            <Input
                              size="sm"
                              placeholder="Max Profit"
                              value={patch.maxDailyProfit ?? ""}
                              onChange={(e) =>
                                setEdit((prev) => ({
                                  ...prev,
                                  [r.id]: { ...(prev[r.id] || {}), maxDailyProfit: e.target.value },
                                }))
                              }
                            />
                            <Input
                              size="sm"
                              placeholder="Balance"
                              value={patch.balance ?? ""}
                              onChange={(e) =>
                                setEdit((prev) => ({
                                  ...prev,
                                  [r.id]: { ...(prev[r.id] || {}), balance: e.target.value },
                                }))
                              }
                            />
                            <Input
                              size="sm"
                              placeholder="Equity"
                              value={patch.equity ?? ""}
                              onChange={(e) =>
                                setEdit((prev) => ({
                                  ...prev,
                                  [r.id]: { ...(prev[r.id] || {}), equity: e.target.value },
                                }))
                              }
                            />
                          </SimpleGrid>

                          <HStack justify="space-between" mt={2}>
                            <Text fontSize="xs" opacity={0.7} color="gray.300">
                              Latest: {r.latestDaily ? `PnL ${r.latestDaily.pnl ?? 0}` : "—"}
                            </Text>
                            <Button size="sm" variant="outline" onClick={() => pushDaily(r.id)} isLoading={loading}>
                              Push Daily
                            </Button>
                          </HStack>
                        </Box>
                      </VStack>
                    </Box>
                  );
                })}
              </SimpleGrid>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default ChallengesAdminPanel;
