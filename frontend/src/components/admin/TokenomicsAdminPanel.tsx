import React from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  VStack,
  HStack,
  Button,
  Spinner,
  Progress,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { RefreshCw, Flame, PieChart as PieChartIcon, TrendingUp, Shield } from "lucide-react";
import api from "../../api/client";

type TokenMetricsSummary = {
  priceUsd: number;
  totalSupply: number;
  soldSupply: number;
  remainingSupply: number;
  saleActive: boolean;
  confirmedRevenueUsd: number;
  purchaseCounts: Record<string, number>;
  depositsUsd: number;
  ledgerUsd: number;
};

type TokenPricePoint = {
  date: string;
  price: number;
  soldSupply: number;
};

const COLORS = ["#22c55e", "#f59e0b", "#f97316", "#ef4444", "#6366f1", "#14b8a6"];

const toNumericValue = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "bigint") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normalizeDate = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

const buildTokenSummary = (raw: any, fallbackRevenueUsd: number): TokenMetricsSummary | null => {
  if (!raw) return null;
  const priceUsd = Number(raw?.sale?.priceUsdtPerTok || 0);
  const totalSupply = toNumericValue(raw?.sale?.totalSupply);
  const soldSupply = toNumericValue(raw?.sale?.soldSupply);
  const remainingSupply = Math.max(0, totalSupply - soldSupply);
  const confirmedRevenue = Number(raw?.confirmedUsdt ?? 0) || fallbackRevenueUsd || 0;
  const purchaseCounts: Record<string, number> = {};
  (raw?.purchasesByStatus || []).forEach((entry: any) => {
    const key = String(entry?.status || "").toUpperCase() || "UNKNOWN";
    purchaseCounts[key] =
      (purchaseCounts[key] || 0) + Number(entry?.count ?? entry?._count?._all ?? 0);
  });
  const depositsUsd = (raw?.deposits || []).reduce(
    (sum: number, entry: any) => sum + Number(entry?.sumAmount || 0),
    0
  );
  const ledgerUsd = Number(raw?.ledger?.totalUsdtBalance || 0);

  return {
    priceUsd,
    totalSupply,
    soldSupply,
    remainingSupply,
    saleActive: !!raw?.sale?.active,
    confirmedRevenueUsd: confirmedRevenue,
    purchaseCounts,
    depositsUsd,
    ledgerUsd,
  };
};

const TokenomicsAdminPanel: React.FC = () => {
  const [summary, setSummary] = React.useState<TokenMetricsSummary | null>(null);
  const [priceSeries, setPriceSeries] = React.useState<TokenPricePoint[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const accent = useColorModeValue("#f3ba2f", "#f3ba2f");

  const fetchTokenData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [metrics, market] = await Promise.all([
        api.get("/tokens/admin/metrics"),
        api.get("/tokens/market", { params: { limit: 500 } }),
      ]);

      const tokenSummary = buildTokenSummary(metrics?.data, Number(metrics?.data?.confirmedUsdt || 0));
      const marketPoints: TokenPricePoint[] = Array.isArray(market?.data?.data)
        ? market.data.data.map((tick: any) => ({
            date: tick?.t,
            price: Number(tick?.price || 0),
            soldSupply: toNumericValue(tick?.soldSupply),
          }))
        : [];

      setSummary(tokenSummary);
      setPriceSeries(marketPoints);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load token metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTokenData();
  }, [fetchTokenData]);

  const tokenSupplyPct =
    summary && summary.totalSupply > 0
      ? Math.min(1, Math.max(0, summary.soldSupply / summary.totalSupply))
      : 0;

  const purchaseMix = React.useMemo(
    () =>
      Object.entries(summary?.purchaseCounts || {})
        .map(([status, count]) => ({ status, count }))
        .filter((row) => row.count > 0),
    [summary?.purchaseCounts]
  );

  const pricePeopleSeries = React.useMemo(() => {
    let prevSupply: number | null = null;
    return priceSeries.map((row) => {
      const sold = row.soldSupply;
      const tokensSold = prevSupply !== null ? Math.max(0, sold - prevSupply) : 0;
      prevSupply = sold;
      return {
        ...row,
        label: normalizeDate(row.date),
        tokensSold,
        revenueUsd: tokensSold * row.price,
      };
    });
  }, [priceSeries]);

  const lastPrice = priceSeries.length ? priceSeries[priceSeries.length - 1].price : summary?.priceUsd || 0;
  const firstPrice = priceSeries.length ? priceSeries[0].price : lastPrice;
  const priceChangePct =
    firstPrice > 0 ? ((lastPrice - firstPrice) / Math.max(1e-6, firstPrice)) * 100 : 0;

  const heroGradient =
    "linear-gradient(135deg, rgba(243,186,47,0.15), rgba(10,14,29,0.8) 40%, rgba(39,57,88,0.9))";

  const renderContent = () => {
    if (loading) {
      return (
        <Flex justify="center" py={20}>
          <Spinner size="lg" color={accent} />
        </Flex>
      );
    }
    if (error) {
      return (
        <VStack spacing={4} py={12}>
          <Text color="red.300" fontWeight="semibold">
            {error}
          </Text>
          <Button leftIcon={<RefreshCw size={16} />} onClick={fetchTokenData}>
            Retry
          </Button>
        </VStack>
      );
    }
    if (!summary) {
      return (
        <VStack spacing={4} py={12}>
          <Text  fontSize="sm">
            No token metrics available yet.
          </Text>
          <Button leftIcon={<RefreshCw size={16} />} onClick={fetchTokenData}>
            Refresh
          </Button>
        </VStack>
      );
    }

    return (
      <VStack align="stretch" spacing={8}>
        <Box
          borderRadius="2xl"
          p={{ base: 6, md: 8 }}
          bg={heroGradient}
          border="1px solid rgba(255,255,255,0.1)"
          boxShadow="0 20px 50px rgba(0,0,0,0.45)"
        >
          <Flex direction={{ base: "column", md: "row" }} justify="space-between" gap={6}>
            <Box>
              <Text fontSize="sm"  textTransform="uppercase" letterSpacing="0.2em">
                PMKX / USDT
              </Text>
              <Heading size="2xl" color="#65a8bf" mt={2}>
                ${lastPrice.toFixed(4)}
              </Heading>
              <HStack spacing={3} mt={3}>
                <Text color={priceChangePct >= 0 ? "green.300" : "red.300"} fontWeight="semibold">
                  {priceChangePct >= 0 ? "+" : ""}
                  {priceChangePct.toFixed(2)}%
                </Text>
                <Text >24h change</Text>
              </HStack>
              <Button
                leftIcon={<RefreshCw size={16} />}
                mt={6}
                size="sm"
                variant="outline"
                borderColor="rgba(255,255,255,0.3)"
                color="#65a8bf"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={fetchTokenData}
              >
                Sync Token Feed
              </Button>
            </Box>
            <Box flex="1">
              <SimpleGrid columns={[1, 2]} gap={4}>
                <CardStat
                  label="Tokens Sold"
                  value={summary.soldSupply.toLocaleString()}
                  helper={`Remaining: ${summary.remainingSupply.toLocaleString()}`}
                  icon={<TrendingUp size={18} color={accent} />}
                >
                  <Progress
                    value={tokenSupplyPct * 100}
                    colorScheme="yellow"
                    bg="rgba(255,255,255,0.1)"
                    borderRadius="full"
                    mt={3}
                  />
                </CardStat>
                <CardStat
                  label="Confirmed Revenue"
                  value={summary.confirmedRevenueUsd.toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 2,
                  })}
                  helper={`Ledger Balance: ${summary.ledgerUsd.toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 2,
                  })}`}
                  icon={<Flame size={18} color={accent} />}
                />
              </SimpleGrid>
            </Box>
          </Flex>
        </Box>

        <SimpleGrid columns={[1, 2, 4]} gap={5}>
          <CardStat
            label="Tracked Deposits"
            value={summary.depositsUsd.toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 2,
            })}
            helper="Across ERC + TRC wallets"
            icon={<Shield size={16} color={accent} />}
            muted
          />
          <CardStat
            label="Sale Status"
            value={summary.saleActive ? "Active" : "Paused"}
            helper={summary.saleActive ? "Incoming orders allowed" : "Purchases disabled"}
            icon={<PieChartIcon size={16} color={accent} />}
            muted
          />
          <CardStat
            label="Total Supply"
            value={summary.totalSupply.toLocaleString()}
            helper="Initial allocation"
            muted
          />
          <CardStat
            label="Tickets Pending"
            value={purchaseMix.find((row) => row.status === "PENDING")?.count?.toLocaleString() || "0"}
            helper="Awaiting admin action"
            muted
          />
        </SimpleGrid>

        <SimpleGrid columns={[1, 1, 2]} gap={6}>
          <Box borderRadius="xl" p={5} border="1px solid rgba(255,255,255,0.08)">
            <Heading size="sm" mb={2}>
              Price & Supply
            </Heading>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={pricePeopleSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" hide />
                <YAxis yAxisId="left" stroke="#fbbf24" />
                <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="soldSupply"
                  name="Sold Supply"
                  stroke="#38bdf8"
                  fill="rgba(56,189,248,0.2)"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="price"
                  name="Price (USDT)"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>

          <Box borderRadius="xl" p={5} border="1px solid rgba(255,255,255,0.08)">
            <Heading size="sm" mb={2}>
              Purchase Status Mix
            </Heading>
            {purchaseMix.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={purchaseMix}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ status, count }: { status: string; count: number }) =>
                      `${status}: ${count}`
                    }
                  >
                    {purchaseMix.map((entry, idx) => (
                      <Cell key={`status-${entry.status}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Flex align="center" justify="center" h="260px">
                <Text  fontSize="sm">
                  No purchase activity yet.
                </Text>
              </Flex>
            )}
          </Box>
        </SimpleGrid>

        <Box borderRadius="xl" p={5} border="1px solid rgba(255,255,255,0.08)">
          <Heading size="sm" mb={2}>
            Volume & Revenue (Synthetic)
          </Heading>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pricePeopleSeries.slice(-60)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" hide />
              <YAxis yAxisId="left" stroke="#f97316" />
              <YAxis yAxisId="right" orientation="right" stroke="#14b8a6" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="tokensSold"
                name="Tokens Sold"
                fill="rgba(249,115,22,0.9)"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="revenueUsd"
                name="Revenue (USDT)"
                fill="rgba(20,184,166,0.7)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </VStack>
    );
  };

  return (
    <VStack align="stretch" spacing={6}>
      <Flex align="center" justify="space-between">
        <Box>
          <Text  fontSize="sm" textTransform="uppercase" letterSpacing="0.3em">
            Token Operations
          </Text>
          <Heading size="lg" color="#65a8bf">
            Tokenomics Console
          </Heading>
          <Text  fontSize="sm">
            Monitor PMKX sale performance, wallet inflows, and price movements in real time.
          </Text>
        </Box>
        <Button
          leftIcon={<RefreshCw size={16} />}
          variant="outline"
          colorScheme="yellow"
          onClick={fetchTokenData}
        >
          Refresh
        </Button>
      </Flex>
      <Divider opacity={0.15} />
      {renderContent()}
    </VStack>
  );
};

const CardStat: React.FC<{
  label: string;
  value: string | number;
  helper?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  muted?: boolean;
}> = ({ label, value, helper, icon, children, muted }) => (
  <Box
    borderRadius="xl"
    p={5}
    border="1px solid rgba(255,255,255,0.08)"
  >
    <HStack justify="space-between">
      <Text fontSize="xs"  textTransform="uppercase" letterSpacing="0.2em">
        {label}
      </Text>
      {icon}
    </HStack>
    <Heading size="md" color="#65a8bf" mt={2}>
      {value}
    </Heading>
    {helper && (
      <Text fontSize="xs"  mt={1}>
        {helper}
      </Text>
    )}
    {children}
  </Box>
);

export default TokenomicsAdminPanel;
