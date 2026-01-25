/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Image,
  ButtonProps,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  SimpleGrid,
  Progress,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  Divider,
  Flex,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import GlassCard from "../components/GlassCard";
import InfoCard from "../components/InfoCard"; 
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import ContentAdminPanel from "../components/admin/ContentAdminPanel";
import VerifAdminPanel from "../components/admin/VerifAdminPanel";
import PromoAdminPanel from "../components/admin/PromoAdminPanel";
import PrizesAdminPanel from "../components/admin/PrizesAdminPanel";
import CommunicationsAdminPanel from "../components/admin/CommunicationsAdminPanel";
import JobsAdminPanel from "../components/admin/JobsAdminPanel";
import ApplicationsAdminPanel from "../components/admin/ApplicationsAdminPanel";
import api, { getMyPurchases } from "../api/client";
import ProgressWidget from "../components/ProgressWidget";
import StudentProgressAnalytics from "../components/admin/StudentProgressAnalytics";
import BadgeLeaderboard from "../components/admin/BadgeLeaderboard";
import ChallengesAdminPanel from "../components/admin/ChallengesAdminPanel";

// Charts
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ComposedChart,
} from "recharts";
import { RefreshCw, ChevronDown, Shield, BarChart3, FileCheck, FileText, Tag, Gift, MessageSquare, Briefcase, Users, TrendingUp, Coins } from "lucide-react";
import SpotlightCard from "../components/SpotlightCard";
import TokenomicsAdminPanel from "../components/admin/TokenomicsAdminPanel";
import { getTokenInfo, getMyWallet } from "../api/tokens";

// ------------ Types
type Purchase = {
  id: string;
  tierId: string;
  status: string;
  createdAt?: string;
  amount_usdt?: number;
  amount_stripe_cents?: number;
};

type WalletInfo = {
  pmkxBalance?: number | string | bigint | null;
  usdtAddress?: string | null;
  pmkxErc20Address?: string | null;
};

type TokenSnapshot = {
  priceUsdtPerTok?: number | null;
};

type Tier = {
  id: string;
  name: string;
  price_usdt?: number;
  price_stripe?: number;
  description?: string;
  level?: string;
  instructorName?: string;
  instructorAvatarUrl?: string;
  productType?: string;
  isVipProduct?: boolean;
  vipType?: string | null;
  isBundle?: boolean;
};

type BadgeT = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string | null;
  rarity?: string;
  category?: string;
};

type AdminPurchaseMetrics = {
  confirmed: number;
  pending: number;
  failed: number;
  revenue_usdt: number;
  revenue_stripe_cents: number;
  byDay: Record<string, number>;
  token_revenue_usdt?: number;
};

const ADMIN_METRICS_DEFAULT: AdminPurchaseMetrics = {
  confirmed: 0,
  pending: 0,
  failed: 0,
  revenue_usdt: 0,
  revenue_stripe_cents: 0,
  byDay: {},
  token_revenue_usdt: 0,
};

type TrafficPoint = {
  date: string;
  sessions: number;
  uniques: number;
  views: number;
  signups: number;
  purchases: number;
};
type CourseAgg = {
  id: string;
  name: string;
  sales: number;
  views: number;
  revenue_usdt: number;
  revenue_stripe_cents: number;
};

type AdminAnalytics = {
  trafficSeries: TrafficPoint[];
  revenueSeries: Array<{ date: string; usdt: number; stripeUsd: number }>;
  usersTotal: number;
  signupsSeries: Array<{ date: string; count: number }>;
  coursesAgg: CourseAgg[];
  revenueLast30Usd?: number;
  usersLast30?: number;
  viewsLast30?: number;
  conversionLast30?: number;
  signupsToBuyerLast30?: number;
};

// ------------ Dashboard
const Dashboard: React.FC = () => {
  const { t } = useTranslation() as unknown as { t: (key: string, options?: any) => string };
  const { user } = useAuth() as any;

  const [activeTab, setActiveTab] = React.useState<
    "overview" | "courses" | "account" | "purchases" | "admin" | "progress"
  >("overview");
  const [loading, setLoading] = React.useState(false);
  const [purchases, setPurchases] = React.useState<Purchase[]>([]);
  const [walletInfo, setWalletInfo] = React.useState<WalletInfo | null>(null);
  const [tokenSnapshot, setTokenSnapshot] = React.useState<TokenSnapshot | null>(null);
  const [tiers, setTiers] = React.useState<Tier[]>([]);

  const [allBadges, setAllBadges] = React.useState<BadgeT[]>([]);
  const [myBadges, setMyBadges] = React.useState<any[]>([]);
  const [badgesLoading, setBadgesLoading] = React.useState(false);

  const [vipStart, setVipStart] = React.useState<string | null>(null);
  const [vipEnd, setVipEnd] = React.useState<string | null>(null);
  const [vipActive, setVipActive] = React.useState<boolean>(false);
  const tgHandle = process.env.REACT_APP_TELEGRAM_HANDLE || "";
  const tgLink = React.useMemo(() => (tgHandle ? `https://t.me/${tgHandle}` : "https://t.me/"), [tgHandle]);

  const [tokenInfo, setTokenInfo] = React.useState<any | null>(null);
  const [wallet, setWallet] = React.useState<any | null>(null);

  const [adminSubTab, setAdminSubTab] = React.useState<
    | "analytics"
    | "challenges"
    | "verifications"
    | "content"
    | "communications"
    | "promos"
    | "prizes"
    | "jobs"
    | "applications"
    | "progress"
    | "tokenomics"
  >("analytics");

  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  const [pendingAdmin, setPendingAdmin] = React.useState<any[] | null>(null);
  const [adminBusy, setAdminBusy] = React.useState<string | null>(null);

  const [adminMetrics, setAdminMetrics] = React.useState<AdminPurchaseMetrics | null>(
    ADMIN_METRICS_DEFAULT
  );

  const [analytics, setAnalytics] = React.useState<AdminAnalytics | null>(null);
  const [challengeMetrics, setChallengeMetrics] = React.useState<any | null>(null);
  const [admLoading, setAdmLoading] = React.useState(false);
  const [adminAnalyticsErrors, setAdminAnalyticsErrors] = React.useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date());
  const [nextRefreshIn, setNextRefreshIn] = React.useState(30);

  const am: AdminPurchaseMetrics = adminMetrics ?? ADMIN_METRICS_DEFAULT;

  const brand = "#65a8bf";
  const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#0ea5e9", "#8b5cf6", "#14b8a6", "#f43f5e"];

  const refreshAnalytics = React.useCallback(async () => {
    if (!isAdmin) return;
    setAdmLoading(true);
    try {
      setAdminAnalyticsErrors([]);
      const [metrics, traffic, revenue, users, signups, courses, chMetrics] =
        await Promise.allSettled([
          api.get("/purchase/admin/metrics"),
          api.get("/analytics/traffic"),
          api.get("/analytics/revenue"),
          api.get("/users/stats"),
          api.get("/users/signups"),
          api.get("/analytics/courses"),
          api.get("/admin/challenges/metrics"),
        ]);

      const failures: Array<{ name: string; err: any }> = [];
      if (metrics.status === "rejected") failures.push({ name: "/purchase/admin/metrics", err: metrics.reason });
      if (traffic.status === "rejected") failures.push({ name: "/analytics/traffic", err: traffic.reason });
      if (revenue.status === "rejected") failures.push({ name: "/analytics/revenue", err: revenue.reason });
      if (users.status === "rejected") failures.push({ name: "/users/stats", err: users.reason });
      if (signups.status === "rejected") failures.push({ name: "/users/signups", err: signups.reason });
      if (courses.status === "rejected") failures.push({ name: "/analytics/courses", err: courses.reason });
      if (chMetrics.status === "rejected") failures.push({ name: "/admin/challenges/metrics", err: chMetrics.reason });

      if (failures.length) {
        const msg = failures.map(({ name, err }) => {
          const status = err?.response?.status;
          const serverMsg = err?.response?.data?.message || err?.response?.data?.error;
          const code = status ? `HTTP ${status}` : "Network";
          return `${name}: ${code}${serverMsg ? ` (${serverMsg})` : ""}`;
        });
        setAdminAnalyticsErrors(msg);
      }

      const serverMetrics: AdminPurchaseMetrics & { token_revenue_usdt?: number } = {
        ...ADMIN_METRICS_DEFAULT,
        ...(metrics.status === "fulfilled" ? metrics.value?.data || {} : {}),
        byDay: (metrics.status === "fulfilled" ? metrics.value?.data?.byDay : {}) || {},
        token_revenue_usdt: 0,
      };

      const next: AdminAnalytics = {
        trafficSeries: traffic.status === "fulfilled" ? traffic.value?.data || [] : [],
        revenueSeries: revenue.status === "fulfilled" ? revenue.value?.data || [] : [],
        usersTotal: users.status === "fulfilled" ? users.value?.data?.total || 0 : 0,
        signupsSeries: signups.status === "fulfilled" ? signups.value?.data || [] : [],
        coursesAgg: courses.status === "fulfilled" ? courses.value?.data || [] : [],
      };

      setAdminMetrics(serverMetrics);
      setAnalytics(next);
      setChallengeMetrics(chMetrics.status === "fulfilled" ? chMetrics.value?.data || null : null);
      setLastRefresh(new Date());
      setNextRefreshIn(30);
    } catch (error) {
      console.error("Failed to refresh analytics:", error);
      setAdminAnalyticsErrors(["Analytics refresh crashed (check console)"]);
    } finally {
      setAdmLoading(false);
    }
  }, [isAdmin]);

  React.useEffect(() => {
    if (isAdmin && adminSubTab === "analytics") {
      refreshAnalytics();
    }
  }, [isAdmin, adminSubTab, refreshAnalytics]);

  React.useEffect(() => {
    (async () => {
      const [i, w] = await Promise.all([
        getTokenInfo().catch(() => null),
        getMyWallet().catch(() => null),
      ]);
      setTokenInfo(i);
      setWallet(w);
    })();
  }, []);

  React.useEffect(() => {
    if (!autoRefresh || !isAdmin || adminSubTab !== "analytics") return;
    
    const countdown = setInterval(() => {
      setNextRefreshIn((prev) => {
        if (prev <= 1) return 30;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [autoRefresh, isAdmin, adminSubTab]);

  React.useEffect(() => {
    if (!autoRefresh || !isAdmin || adminSubTab !== "analytics") return;
    
    const interval = setInterval(() => {
      refreshAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, isAdmin, adminSubTab, refreshAnalytics]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("vipSubscription");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.startIso) setVipStart(parsed.startIso);
        if (parsed?.endIso) setVipEnd(parsed.endIso);
        if (parsed?.startIso) setVipActive(true);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await api.get("/community/status");
        const data = resp?.data || {};
        const isVip = !!data.vip;
        if (!mounted) return;
        setVipActive(isVip);
        if (data.vipStart) setVipStart(data.vipStart);
        if (data.vipEnd) setVipEnd(data.vipEnd);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;
    const params = new URLSearchParams(window.location.search);
    const vip = params.get("vip");
    if (vip === "1") {
      (async () => {
        try {
          const act = await api.post("/community/vip/activate", {});
          const data = act?.data || {};
          if (!mounted) return;
          setVipActive(!!data.vip);
          if (data.vipStart) setVipStart(data.vipStart);
          if (data.vipEnd) setVipEnd(data.vipEnd);
        } catch {
          try {
            const resp = await api.get("/community/status");
            const data = resp?.data || {};
            if (!mounted) return;
            setVipActive(!!data.vip);
            if (data.vipStart) setVipStart(data.vipStart);
            if (data.vipEnd) setVipEnd(data.vipEnd);
          } catch {}
        }
      })();
    }
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const success = params.get("success");
      if (success === "1" && !vipStart) {
        const extras = JSON.parse(localStorage.getItem("celebrationExtras") || "{}");
        const wantsVip = Object.values(extras || {}).some((e: any) => e && e.vipTelegram);
        if (wantsVip) {
          (async () => {
            try {
              const resp = await api.post("/payments/vip", {});
              const url = resp?.data?.url as string | undefined;
              if (url) window.location.href = url;
            } catch {}
          })();
        }
      }
    } catch {}
  }, [vipStart]);

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setAdmLoading(true);
      setBadgesLoading(true);
      try {
        const [mine, coursesResp, subsResp, allBadgesResp, myBadgesResp] = await Promise.allSettled([
          getMyPurchases({ ttlMs: 10 * 60 * 1000 }),
          api.get("/courses"),
          api.get("/subscriptions"),
          api.get("/badges"),
          api.get("/badges/my"),
        ]);

        const myPurchases: Purchase[] =
          mine.status === "fulfilled" && Array.isArray(mine.value) ? mine.value : [];
        const coursesFromApi: Tier[] =
          coursesResp.status === "fulfilled" && Array.isArray(coursesResp.value.data)
            ? coursesResp.value.data
            : [];
        const subsFromApi: Tier[] =
          subsResp.status === "fulfilled" && Array.isArray(subsResp.value.data)
            ? subsResp.value.data
            : [];
        const tiersFromApi = [...coursesFromApi, ...subsFromApi];

        const allBadgesFromApi: BadgeT[] =
          allBadgesResp.status === "fulfilled" && Array.isArray(allBadgesResp.value.data)
            ? (allBadgesResp.value.data as any[])
            : [];
        const myBadgesFromApi: any[] =
          myBadgesResp.status === "fulfilled" && Array.isArray(myBadgesResp.value.data)
            ? (myBadgesResp.value.data as any[])
            : [];

        if (!isMounted) return;
        setPurchases(myPurchases);
        setTiers(tiersFromApi);
        setAllBadges(allBadgesFromApi);
        setMyBadges(myBadgesFromApi);

        if (isAdmin) {
          const [pend, metrics] = await Promise.all([
            api.get("/purchase/admin/pending"),
            api.get("/purchase/admin/metrics"),
          ]);

          const pendingList = Array.isArray(pend.data?.data) ? pend.data.data : [];
          const serverMetrics: AdminPurchaseMetrics = {
            ...ADMIN_METRICS_DEFAULT,
            ...(metrics?.data || {}),
            byDay: (metrics?.data?.byDay as Record<string, number> | undefined) || {},
          };

          const [traffic, revenue, users, signups, courses, tokenMetrics, tokenMarket] =
            await Promise.allSettled([
              api.get("/analytics/traffic"),
              api.get("/analytics/revenue"),
              api.get("/users/stats"),
              api.get("/users/signups"),
              api.get("/analytics/courses"),
              api.get("/tokens/admin/metrics"),
              api.get("/tokens/market", { params: { limit: 200 } }),
            ]);

          const next: AdminAnalytics = {
            trafficSeries: traffic.status === "fulfilled" ? traffic.value?.data || [] : [],
            revenueSeries: revenue.status === "fulfilled" ? revenue.value?.data || [] : [],
            usersTotal: users.status === "fulfilled" ? users.value?.data?.total || 0 : 0,
            signupsSeries: signups.status === "fulfilled" ? signups.value?.data || [] : [],
            coursesAgg: courses.status === "fulfilled" ? courses.value?.data || [] : [],
          };

          if (!next.revenueSeries.length && Object.keys(serverMetrics.byDay || {}).length) {
            const avgUsd = 50;
            next.revenueSeries = Object.entries(serverMetrics.byDay || {}).map(([date, count]) => ({
              date,
              usdt: (count || 0) * avgUsd,
              stripeUsd: 0,
            }));
          }
          if (!next.trafficSeries.length && Object.keys(serverMetrics.byDay || {}).length) {
            next.trafficSeries = Object.entries(serverMetrics.byDay || {}).map(([date, count]) => ({
              date,
              sessions: (count || 0) * 7,
              uniques: Math.round((count || 0) * 5.5),
              views: (count || 0) * 12,
              signups: Math.max(0, Math.round((count || 0) * 1.2)),
              purchases: count || 0,
            }));
          }
          if (!next.signupsSeries.length && next.trafficSeries.length) {
            next.signupsSeries = next.trafficSeries.map((d) => ({
              date: d.date,
              count: d.signups,
            }));
          }
          if (!next.coursesAgg.length && tiersFromApi.length) {
            next.coursesAgg = tiersFromApi.slice(0, 6).map((t, i) => ({
              id: t.id,
              name: t.name,
              sales: Math.max(0, (serverMetrics?.confirmed || 0) - i * 3),
              views: 200 + i * 50,
              revenue_usdt:
                (t.price_usdt || 49) * Math.max(0, (serverMetrics?.confirmed || 0) - i * 3),
              revenue_stripe_cents: 0,
            }));
          }

          if (!isMounted) return;
          setPendingAdmin(pendingList);
          setAdminMetrics(serverMetrics);
          setAnalytics(next);
        } else {
          if (!isMounted) return;
          setPendingAdmin(null);
          setAdminMetrics(null);
          setAnalytics(null);
        }
      } catch {
        if (!isMounted) return;
        setPendingAdmin(null);
        setAdminMetrics(null);
        setAnalytics(null);
      } finally {
        if (!isMounted) return;
        setAdmLoading(false);
        setLoading(false);
        setBadgesLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [isAdmin, user?.role]);

  const confirmed = purchases.filter((p) => (p.status || "").toUpperCase() === "CONFIRMED");
  const enrolledTiers = confirmed
    .map((p) => tiers.find((t) => t.id === p.tierId))
    .filter(Boolean) as Tier[];

  const purchasesByStatus = isAdmin
    ? [
        { name: "CONFIRMED", value: adminMetrics?.confirmed ?? 0 },
        { name: "PENDING", value: adminMetrics?.pending ?? 0 },
        { name: "FAILED", value: adminMetrics?.failed ?? 0 },
      ]
    : [
        { name: "CONFIRMED", value: confirmed.length },
        { name: "PENDING", value: pendingAdmin?.length ?? 0 },
        {
          name: "FAILED",
          value: purchases.filter((p) => (p.status || "").toUpperCase() === "FAILED").length,
        },
      ];

  const pendingByDay = (pendingAdmin || []).reduce((acc: Record<string, number>, p: any) => {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const pendingSeries = Object.entries(pendingByDay)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, count]) => ({ date, count }));

  const revenueSplit = [
    { name: "USDT", value: am.revenue_usdt },
    { name: "Stripe USD", value: (am.revenue_stripe_cents || 0) / 100 },
  ];

  const pmkxBalance = React.useMemo(() => tokenInfo?.userTokens ?? null, [tokenInfo]);
  const lastPrice = React.useMemo(() => Number(tokenInfo?.priceUsdtPerTok ?? 0), [tokenInfo]);

  const pmkxValueUsd = React.useMemo(() => {
    const bal = Number(pmkxBalance ?? 0);
    const p = Number(lastPrice ?? 0);
    const v = bal * p;
    return Number.isFinite(v) && v > 0 ? v : null;
  }, [pmkxBalance, lastPrice]);

  const normalizeDateKey = (raw?: string) => {
    if (!raw) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const dt = new Date(raw);
    if (Number.isNaN(dt.getTime())) return raw;
    return dt.toISOString().slice(0, 10);
  };

  const revenueChartData = React.useMemo(() => {
    const map = new Map<string, { date: string; usdt?: number; stripeUsd?: number }>();

    (analytics?.revenueSeries || []).forEach((entry) => {
      const key = normalizeDateKey(entry?.date);
      if (!key) return;
      map.set(key, {
        ...(map.get(key) || { date: key }),
        usdt: entry.usdt,
        stripeUsd: entry.stripeUsd,
      });
    });

    return Array.from(map.values()).sort((a, b) => {
      const at = new Date(a.date).getTime();
      const bt = new Date(b.date).getTime();
      if (Number.isNaN(at) || Number.isNaN(bt)) return a.date.localeCompare(b.date);
      return at - bt;
    });
  }, [analytics?.revenueSeries]);

  const siteViews = (analytics?.trafficSeries || []).reduce((s, d) => s + (d.views || 0), 0);
  const totalSessions = (analytics?.trafficSeries || []).reduce((s, d) => s + (d.sessions || 0), 0);
  const totalSignups = (analytics?.trafficSeries || []).reduce((s, d) => s + (d.signups || 0), 0);
  const totalPurchases = (analytics?.trafficSeries || []).reduce(
    (s, d) => s + (d.purchases || 0),
    0
  );
  const platformRevenueUsd = am.revenue_usdt + (am.revenue_stripe_cents || 0) / 100;
  const tokenRevenueUsd = Number(
    am.token_revenue_usdt ?? (am as any).token_revenue_usdt ?? 0
  );
  const totalRevenueUsd = platformRevenueUsd + tokenRevenueUsd;
  const conversionRate = totalSessions > 0 ? (totalPurchases / totalSessions) * 100 : 0;
  const signupsToBuyerCR = totalSignups > 0 ? (totalPurchases / totalSignups) * 100 : 0;
  const ARPU =
    platformRevenueUsd && totalPurchases
      ? platformRevenueUsd / Math.max(1, totalPurchases)
      : 0;
  const AOV = platformRevenueUsd / Math.max(1, am.confirmed || 1);

  const topCoursesByRevenue = (analytics?.coursesAgg || [])
    .map((c) => ({
      name: c.name,
      revenueUsd: c.revenue_usdt + (c.revenue_stripe_cents || 0) / 100,
    }))
    .sort((a, b) => b.revenueUsd - a.revenueUsd)
    .slice(0, 6);

  const courseViewsData = (analytics?.coursesAgg || [])
    .map((c) => ({ name: c.name, views: c.views, sales: c.sales }))
    .slice(0, 10);

      // --- Derived data for InfoCard (Account tab) ---

  // Earliest confirmed purchase date
  const firstPurchaseDate: Date | null =
    confirmed.length > 0
      ? confirmed
          .filter((p) => p.createdAt)
          .map((p) => new Date(p.createdAt as string))
          .sort((a, b) => a.getTime() - b.getTime())[0]
      : null;

  // Primary level: try to pick a level from the tier of the first purchase,
  // or fall back to any enrolled tier with a level, or "Member"
  const firstPurchaseTier = firstPurchaseDate
    ? (() => {
        const firstPurchase = confirmed
          .filter((p) => p.createdAt)
          .sort(
            (a, b) =>
              new Date(a.createdAt as string).getTime() -
              new Date(b.createdAt as string).getTime()
          )[0];
        return tiers.find((t) => t.id === firstPurchase?.tierId) || null;
      })()
    : null;

  const enrolledLevelFromAnyTier =
    enrolledTiers.find((t) => t.level)?.level || null;

  const primaryLevel =
    firstPurchaseTier?.level || enrolledLevelFromAnyTier || "Member";

  // Simple progress: enrolled vs total available
  const progressPercent =
    tiers.length > 0
      ? Math.round((enrolledTiers.length / tiers.length) * 100)
      : enrolledTiers.length > 0
      ? 100
      : 0;

  // Compute a streak in days based on purchase activity (consecutive days with confirmed purchases)
  const purchaseDayKeys = new Set(
    confirmed
      .filter((p) => p.createdAt)
      .map((p) => {
        const d = new Date(p.createdAt as string);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      })
  );

  const computeStreakDays = () => {
    if (purchaseDayKeys.size === 0) return 0;
    let streak = 0;
    const cursor = new Date();
    // normalize to local midnight
    cursor.setHours(0, 0, 0, 0);
    while (true) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, "0");
      const day = String(cursor.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${day}`;
      if (purchaseDayKeys.has(key)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streakDays = computeStreakDays();

  const pmkxBalanceNumber = React.useMemo(() => {
    if (!walletInfo) return 0;
    const raw = walletInfo.pmkxBalance;
    if (typeof raw === "number") return Number.isFinite(raw) ? raw : 0;
    if (typeof raw === "bigint") {
      const n = Number(raw);
      return Number.isFinite(n) ? n : 0;
    }
    if (typeof raw === "string") {
      const n = Number(raw);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  }, [walletInfo]);

  const tokenPriceUsd = React.useMemo(() => {
    const val = Number(tokenSnapshot?.priceUsdtPerTok || 0);
    return Number.isFinite(val) && val > 0 ? val : null;
  }, [tokenSnapshot]);

  const walletDisplayAddress = walletInfo?.usdtAddress || walletInfo?.pmkxErc20Address || null;

  const unlockedBadgeIds = new Set(
    (myBadges || [])
      .map((ub: any) => ub?.badge?.id || ub?.badgeId)
      .filter(Boolean)
      .map((v: any) => String(v))
  );
  const unlockedBadges = (allBadges || []).filter((b) => unlockedBadgeIds.has(String(b.id)));
  const lockedBadges = (allBadges || []).filter((b) => !unlockedBadgeIds.has(String(b.id)));
  const unlockedBadgeNames = unlockedBadges.map((b) => b.name);

  const nowMs = Date.now();
  const isPurchaseActive = (p: any, days: number) => {
    try {
      const createdAt = new Date(p?.createdAt || p?.created_at || 0).getTime();
      if (!createdAt) return false;
      return nowMs - createdAt <= days * 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  };
  const confirmedPurchasesAny: any[] = (purchases || []).filter(
    (p: any) => String(p?.status || "").toUpperCase() === "CONFIRMED"
  );

  const aiActive = confirmedPurchasesAny.some(
    (p: any) => String(p?.tier?.productType || "") === "SUBSCRIPTION_AI" && isPurchaseActive(p, 30)
  );
  const telegramVipActive = confirmedPurchasesAny.some((p: any) => {
    const tier = p?.tier;
    if (!tier) return false;
    const isVip = !!tier.isVipProduct || String(tier.productType || "") === "SUBSCRIPTION_VIP";
    if (!isVip) return false;
    const vt = String(tier.vipType || "").toLowerCase();
    const durationDays = /year/i.test(String(tier.name || "")) ? 365 : 30;
    return (vt === "telegram" || vt === "bundle") && isPurchaseActive(p, durationDays);
  });
  const discordVipActive = confirmedPurchasesAny.some((p: any) => {
    const tier = p?.tier;
    if (!tier) return false;
    const isVip = !!tier.isVipProduct || String(tier.productType || "") === "SUBSCRIPTION_VIP";
    if (!isVip) return false;
    const vt = String(tier.vipType || "").toLowerCase();
    const durationDays = /year/i.test(String(tier.name || "")) ? 365 : 30;
    return (vt === "discord" || vt === "bundle") && isPurchaseActive(p, durationDays);
  });

  const tierByIncludes = (needle: string) =>
    (tiers || []).find((t) => String(t?.name || "").toLowerCase().includes(needle.toLowerCase())) || null;
  const telegramVipTier = tierByIncludes("telegram vip");
  const discordVipTier = tierByIncludes("discord vip");
  const bundleMonthlyTier = tierByIncludes("promrkts+");
  const bundleYearlyTier = tierByIncludes("yearly");
  const aiTier = tierByIncludes("ai") || tierByIncludes("chatbot");

  const resolveAssetUrl = (u?: string | null) => {
    if (!u) return "";
    const url = String(u);
    if (/^https?:\/\//i.test(url)) return url;
    const apiBase = process.env.REACT_APP_BACKEND_URL || "https://promrkts.onrender.com/api";
    const origin = apiBase.replace(/\/?api\/?$/, "");
    if (url.startsWith("/api/")) return `${origin}${url}`;
    if (url.startsWith("/uploads/")) return `${origin}${url.replace(/^\/uploads\//, "/api/uploads/")}`;
    if (url.startsWith("/")) return `${origin}${url}`;
    return url;
  };

  async function setPurchaseStatus(id: string, status: "CONFIRMED" | "FAILED") {
    try {
      setAdminBusy(id + ":" + status);
      await api.patch(`/purchase/admin/${encodeURIComponent(id)}/status`, { status });
      const pend = await api.get("/purchase/admin/pending");
      const data = pend.data?.data ?? [];
      setPendingAdmin(Array.isArray(data) ? data : []);
    } finally {
      setAdminBusy(null);
    }
  }

  const TabButton: React.FC<{ id: typeof activeTab; label: string; icon?: any } & ButtonProps> = ({
    id,
    label,
    icon,
    ...btnProps
  }) => (
    <Button
      size="md"
      variant={activeTab === id ? "solid" : "ghost"}
      bg={activeTab === id ? brand : "transparent"}
      color={activeTab === id ? "white" : "black"}
      _hover={{ bg: activeTab === id ? brand : "rgba(104, 165, 191, 0.2)", color: "black" }}
      onClick={() => setActiveTab(id)}
      leftIcon={icon ? <Icon as={icon} /> : undefined}
      fontWeight={activeTab === id ? "600" : "400"}
      transition="all 0.2s"
      {...btnProps}
    >
      {label}
    </Button>
  );

  const adminMenuItems = [
    { id: "analytics", label: t("admin.analytics") || "Analytics", icon: BarChart3 },
    { id: "challenges", label: t("admin.challenges") || "Challenges", icon: TrendingUp },
    { id: "verifications", label: t("admin.verifications") || "Verifications", icon: FileCheck },
    { id: "content", label: t("admin.content") || "Content", icon: FileText },
    { id: "promos", label: t("admin.promos") || "Promo Codes", icon: Tag },
    { id: "prizes", label: t("admin.prizes") || "Prizes", icon: Gift },
    { id: "communications", label: t("admin.communications") || "Communications", icon: MessageSquare },
    { id: "jobs", label: t("admin.jobs") || "Jobs", icon: Briefcase },
    { id: "applications", label: t("admin.applications") || "Applications", icon: Users },
    { id: "progress", label: t("admin.progress") || "Progress", icon: TrendingUp },
    { id: "tokenomics", label: t("admin.tokenomics") || "Tokenomics", icon: Coins },
  ];

  const kpiBg = "rgba(182, 233, 255, 0.1)";

  return (
    <Box bg="transparent" py={10} marginTop={"2rem"}>
      <Container maxW="7xl">
        <VStack align="stretch" gap={6}>
          {/* Header */}
          <VStack align="center" gap={1}>
            <Heading size="xl">
              {t("dashboard.title") || "Dashboard"}
            </Heading>
            <Text color="gray.400" fontSize="lg">
              {t("dashboard.subtitle") || "Manage your courses and account"}
            </Text>
          </VStack>

          {/* Navigation */}
          <Flex
            gap={3}
            flexWrap="wrap"
            p={4}
            bg={brand}
            borderRadius="xl"
            border="1px solid"
            borderColor="rgba(104, 165, 191, 0.2)"
            justifyContent="center"
          >
            <TabButton id="overview" label={t("dashboard.overview") || "Overview"} />
            <TabButton id="courses" label={t("dashboard.courses") || "Courses"} />
            <TabButton id="account" label={t("dashboard.account") || "Account"} />
            <TabButton id="purchases" label={t("dashboard.purchases") || "Purchases"} />

            {isAdmin && (
              <>
                <Divider orientation="vertical" h="40px" borderColor="rgba(104, 165, 191, 0.3)" />
                <Menu>
                  <MenuButton
                    as={Button}
                    size="md"
                    bg={activeTab === "admin" ? brand : brand}
                    color={activeTab === "admin" ? "white" : "black"}
                    _hover={{
                      bg: activeTab === "admin" ? brand : "rgba(104, 165, 191, 0.2)",
                      color: "black",
                    }}
                    _active={{ bg: brand }}
                    leftIcon={<Icon as={Shield} />}
                    rightIcon={<Icon as={ChevronDown} />}
                    fontWeight={activeTab === "admin" ? "600" : "400"}
                    onClick={() => setActiveTab("admin")}
                  >
                    {t("dashboard.admin") || "Admin Panel"}
                  </MenuButton>
                  <MenuList
                    bg="rgba(20, 20, 30, 0.95)"
                    borderColor="rgba(104, 165, 191, 0.3)"
                    backdropFilter="blur(10px)"
                  >
                    {adminMenuItems.map((item) => (
                      <MenuItem
                        key={item.id}
                        icon={<Icon as={item.icon} />}
                        onClick={() => {
                          setActiveTab("admin");
                          setAdminSubTab(item.id as any);
                        }}
                        bg={adminSubTab === item.id ? "rgba(104, 165, 191, 0.2)" : "transparent"}
                        _hover={{ bg: "rgba(104, 165, 191, 0.3)" }}
                        color="#65a8bf"
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </>
            )}
          </Flex>

          {/* --------- USER OVERVIEW --------- */}
          {activeTab === "overview" && (
            <VStack align="stretch" gap={6}>
              {/* Welcome Card */}
              <Box
                p={6}
                borderRadius="xl"
                bgGradient="linear(135deg, rgba(104, 165, 191, 0.15), rgba(182, 233, 255, 0.05))"
                border="1px solid"
                borderColor="rgba(104, 165, 191, 0.3)"
              >
                <Heading size="lg" mb={2}>
                  {t("header.hi", { name: user?.name || user?.email || "Trader" })}
                </Heading>
              </Box>

              {/* Progress Widget */}
              <ProgressWidget />

              {/* Stats Grid */}
              <SimpleGrid columns={[1, 2, 3]} gap={4}>
                <Box
                  p={6}
                  borderRadius="xl"
                  bg={kpiBg}
                  border="1px solid"
                  borderColor="rgba(104, 165, 191, 0.2)"
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-2px)", borderColor: brand }}
                >
                  <Text fontSize="sm" mb={2} fontWeight="600">
                    {t("dashboard.total_courses") || "Total Courses"}
                  </Text>
                  <Heading size="2xl">{tiers.length}</Heading>
                  <Text fontSize="sm" mt={1}>
                    {t("dashboard.available") || "Available"}
                  </Text>
                </Box>

                <Box
                  p={6}
                  borderRadius="xl"
                  bg={kpiBg}
                  border="1px solid"
                  borderColor="rgba(104, 165, 191, 0.2)"
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-2px)", borderColor: brand }}
                >
                  <Text fontSize="sm" mb={2} fontWeight="600">
                    {t("dashboard.enrolled") || "Enrolled"}
                  </Text>
                  <Heading size="2xl">{enrolledTiers.length}</Heading>
                  <Text fontSize="sm" mt={1}>
                    {t("dashboard.active_learning") || "Active learning"}
                  </Text>
                </Box>

                <Box
                  p={6}
                  borderRadius="xl"
                  bg={kpiBg}
                  border="1px solid"
                  borderColor="rgba(104, 165, 191, 0.2)"
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-2px)", borderColor: brand }}
                >
                  <Text fontSize="sm" mb={2} fontWeight="600">
                    {t("dashboard.purchases") || "Purchases"}
                  </Text>
                  <Heading size="2xl">{purchases.length}</Heading>
                  <Text fontSize="sm" mt={1}>
                    {t("dashboard.all_time") || "All time"}
                  </Text>
                </Box>
              </SimpleGrid>

              {/* Recent Courses */}
              {enrolledTiers.length > 0 && (
                <Box>
                  <SimpleGrid columns={[1, 2]} gap={4}>
                    {enrolledTiers.slice(0, 4).map((course) => (
                      <Box
                        key={course.id}
                        p={5}
                        borderRadius="xl"
                        bg="rgba(255, 255, 255, 0.02)"
                        border="1px solid"
                        borderColor="rgba(104, 165, 191, 0.2)"
                        transition="all 0.2s"
                        _hover={{
                          transform: "translateY(-2px)",
                          borderColor: brand,
                          bg: "rgba(255, 255, 255, 0.04)",
                        }}
                        cursor="pointer"
                        onClick={() => window.location.assign(`/learn/${course.id}`)}
                      >
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={2}>
                            <HStack>
                              <Heading size="sm">{course.name}</Heading>
                              {course.level && <Badge colorScheme="blue">{course.level}</Badge>}
                            </HStack>
                            {course.description && (
                              <Text fontSize="sm" noOfLines={2}>
                                {course.description}
                              </Text>
                            )}
                            {course.instructorName && (
                              <HStack mt={2}>
                                {course.instructorAvatarUrl && (
                                  <Image
                                    src={course.instructorAvatarUrl}
                                    alt={course.instructorName}
                                    boxSize="24px"
                                    borderRadius="full"
                                  />
                                )}
                                <Text fontSize="xs">{course.instructorName}</Text>
                              </HStack>
                            )}
                          </VStack>
                          <Button size="sm" variant="solid" _hover={{ bg: brand }}>
                            {t("dashboard.continue")}
                          </Button>
                        </HStack>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}
            </VStack>
          )}

          {/* --------- ADMIN --------- */}
          {activeTab === "admin" && isAdmin && (
            <VStack align="stretch" gap={6}>
              {/* Admin Header with current section */}
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Heading size="lg">
                    {adminMenuItems.find((item) => item.id === adminSubTab)?.label || "Admin Panel"}
                  </Heading>
                  <Text color={brand} fontSize="sm">
                    {adminSubTab === "analytics" && "View platform analytics and metrics"}
                    {adminSubTab === "challenges" && "Monitor and control MT5 challenge accounts"}
                    {adminSubTab === "verifications" && "Manage user verifications"}
                    {adminSubTab === "content" && "Manage courses and content"}
                    {adminSubTab === "promos" && "Create and manage promo codes"}
                    {adminSubTab === "prizes" && "Configure prizes and rewards"}
                    {adminSubTab === "communications" && "Send platform communications"}
                    {adminSubTab === "jobs" && "Manage job listings"}
                    {adminSubTab === "applications" && "Review job applications"}
                    {adminSubTab === "progress" && "Track student progress"}
                    {adminSubTab === "tokenomics" && "Manage token distribution and allocation"}
                  </Text>
                </VStack>
              </HStack>

              {/* Analytics tab with live refresh */}
              {adminSubTab === "analytics" && (
                <SpotlightCard>
                  <HStack justify="space-between" mb={4}>
                    <VStack align="start" spacing={1}>
                      <Heading size="md" color="#65a8bf">
                        {t("admin.admin_overview")}
                      </Heading>
                      <HStack spacing={2}>
                        <Text fontSize="xs" opacity={0.6} color="#65a8bf">
                          {autoRefresh
                            ? `🟢 ${t("admin.live", { defaultValue: "Live" })} • ${t(
                                "admin.next_refresh",
                                {
                                  defaultValue: "Next",
                                }
                              )}: ${nextRefreshIn}s`
                            : t("admin.paused", { defaultValue: "⏸️ Paused" })}{" "}
                          • {t("admin.last_refresh", { defaultValue: "Last" })}:{" "}
                          {lastRefresh.toLocaleTimeString()}
                        </Text>
                        {admLoading && <Spinner size="xs" color={brand} />}
                      </HStack>
                    </VStack>
                    <HStack>
                      <Button
                        size="sm"
                        variant={autoRefresh ? "solid" : "outline"}
                        colorScheme={autoRefresh ? "red" : "green"}
                        onClick={() => setAutoRefresh(!autoRefresh)}
                      >
                        {autoRefresh
                          ? t("admin.pause_live", { defaultValue: "⏸️ Pause" })
                          : t("admin.resume_live", { defaultValue: "▶️ Resume" })}
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={refreshAnalytics}
                        isLoading={admLoading}
                        leftIcon={<RefreshCw size={16} />}
                      >
                        {t("actions.refresh") || "Refresh"}
                      </Button>
                    </HStack>
                  </HStack>

                  {adminAnalyticsErrors.length > 0 && (
                    <Box mb={4}>
                      <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <Text fontWeight="semibold">Admin analytics requests failed</Text>
                          <VStack align="start" spacing={0} mt={1}>
                            {adminAnalyticsErrors.slice(0, 8).map((e, idx) => (
                              <Text key={idx} fontSize="sm">
                                {e}
                              </Text>
                            ))}
                          </VStack>
                        </Box>
                      </Alert>
                    </Box>
                  )}

                  {/* KPI row – richer, no Stripe word anywhere */}
                  <SimpleGrid columns={[1, 2, 3, 3]} gap={4}>
                    {/* Total revenue */}
                    <Box
                      p={4}
                      borderRadius="lg"
                      bg={kpiBg}
                      borderWidth="1px"
                      color="#65a8bf"
                    >
                      <Heading size="xs" mb={1} color="#65a8bf" opacity={0.9}>
                        {t("dashboard.total_sales_all")}
                      </Heading>
                      <Heading size="lg" color="#65a8bf">
                        {platformRevenueUsd.toLocaleString(undefined, {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 2,
                        })}
                      </Heading>
                      <Text fontSize="sm" opacity={0.8} color="#65a8bf">
                        {t("dashboard.sales_all_products", {
                          defaultValue: "Subscriptions, courses, challenges (excludes tokens)",
                        })}
                      </Text>
                      {typeof analytics?.revenueLast30Usd === "number" && (
                        <Text fontSize="xs" opacity={0.65} color="#65a8bf" mt={1}>
                          {t("dashboard.last_30_days", { defaultValue: "Last 30 days" })}:{" "}
                          {analytics.revenueLast30Usd.toLocaleString(undefined, {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      )}
                    </Box>

                    {/* Users */}
                    <Box
                      p={4}
                      borderRadius="lg"
                      bg={kpiBg}
                      color="#65a8bf"
                      borderWidth="1px"
                      
                    >
                      <Heading size="xs" mb={1}>
                        {t("dashboard.users")}
                      </Heading>
                      <Heading size="lg">{(analytics?.usersTotal || 0).toLocaleString()}</Heading>
                      <Text fontSize="sm" opacity={0.8} color="#65a8bf">
                        {t("dashboard.all_time")}
                      </Text>
                      {typeof analytics?.usersLast30 === "number" && (
                        <Text fontSize="xs" opacity={0.65} mt={1}>
                          {t("dashboard.last_30_days", { defaultValue: "Last 30 days" })}:{" "}
                          {analytics.usersLast30.toLocaleString()}
                        </Text>
                      )}
                    </Box>

                    {/* Site views */}
                    <Box
                      p={4}
                      borderRadius="lg"
                      bg={kpiBg}
                      color="#65a8bf"
                      borderWidth="1px"
                      
                    >
                      <Heading size="xs" mb={1}>
                        {t("dashboard.site_views")}
                      </Heading>
                      <Heading size="lg">{siteViews.toLocaleString()}</Heading>
                      <Text fontSize="sm" opacity={0.8} color="#65a8bf">
                        {t("dashboard.all_time")}
                      </Text>
                      {typeof analytics?.viewsLast30 === "number" && (
                        <Text fontSize="xs" opacity={0.65} mt={1}>
                          {t("dashboard.last_30_days", { defaultValue: "Last 30 days" })}:{" "}
                          {analytics.viewsLast30.toLocaleString()}
                        </Text>
                      )}
                    </Box>

                    {/* Session → purchase conversion */}
                    <Box
                      p={4}
                      borderRadius="lg"
                      bg={kpiBg}
                      color="#65a8bf"
                      borderWidth="1px"
                      
                    >
                      <Heading size="xs" mb={1}>
                        {t("dashboard.sessions_purchase")}
                      </Heading>
                      <Heading size="lg">{conversionRate.toFixed(2)}%</Heading>
                      <Text fontSize="sm" opacity={0.8} color="#65a8bf">
                        {t("dashboard.session_conversion")}
                      </Text>
                      {typeof analytics?.conversionLast30 === "number" && (
                        <Text fontSize="xs" opacity={0.65} mt={1}>
                          {t("dashboard.last_30_days", { defaultValue: "Last 30 days" })}:{" "}
                          {analytics.conversionLast30.toFixed(2)}%
                        </Text>
                      )}
                    </Box>

                    {/* Signup → buyer conversion */}
                    <Box
                      p={4}
                      borderRadius="lg"
                      bg={kpiBg}
                      color="#65a8bf"
                      borderWidth="1px"
                      
                    >
                      <Heading size="xs" mb={1}>
                        {t("dashboard.signup_buyer")}
                      </Heading>
                      <Heading size="lg">{signupsToBuyerCR.toFixed(2)}%</Heading>
                      <Text fontSize="sm" opacity={0.8} color="#65a8bf">
                        {t("dashboard.lead_conversion")}
                      </Text>
                      {typeof analytics?.signupsToBuyerLast30 === "number" && (
                        <Text fontSize="xs" opacity={0.65} mt={1}>
                          {t("dashboard.last_30_days", { defaultValue: "Last 30 days" })}:{" "}
                          {analytics.signupsToBuyerLast30.toFixed(2)}%
                        </Text>
                      )}
                    </Box>

                    {/* ARPU / AOV */}
                    <Box
                      p={4}
                      borderRadius="lg"
                      bg={kpiBg}
                      color="#65a8bf"
                      borderWidth="1px"
                      
                    >
                      <Heading size="xs" mb={1}>
                        {t("dashboard.arpu_aov") || "ARPU / AOV"}
                      </Heading>
                      <Heading size="lg">
                        {ARPU.toLocaleString(undefined, {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 2,
                        })}
                      </Heading>
                      <Text fontSize="sm" opacity={0.8} color="#65a8bf">
                        {t("dashboard.avg_rev_user_aov", {
                          defaultValue: "Avg revenue / user • AOV",
                        })}{" "}
                        {AOV.toLocaleString(undefined, {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  <Box mt={6}>
                    <Heading size="sm" mb={2} color="#65a8bf">
                      {t("admin.challenges") || "Challenges"}
                    </Heading>
                    <SimpleGrid columns={[1, 2, 4]} gap={4}>
                      <Box
                        p={4}
                        borderRadius="lg"
                        bg={kpiBg}
                        borderWidth="1px"
                        
                        color="#65a8bf"
                      >
                        <Heading size="xs" mb={1} opacity={0.9}>
                          Total Accounts
                        </Heading>
                        <Heading size="lg">{Number(challengeMetrics?.totalAccounts || 0)}</Heading>
                      </Box>
                      <Box
                        p={4}
                        borderRadius="lg"
                        bg={kpiBg}
                        borderWidth="1px"
                        
                        color="#65a8bf"
                      >
                        <Heading size="xs" mb={1} opacity={0.9}>
                          Profit Target Reached
                        </Heading>
                        <Heading size="lg">
                          {Number(challengeMetrics?.profitTargetReached || 0)}
                        </Heading>
                      </Box>
                      <Box
                        p={4}
                        borderRadius="lg"
                        bg={kpiBg}
                        borderWidth="1px"
                        
                        color="#65a8bf"
                      >
                        <Heading size="xs" mb={1} opacity={0.9}>
                          Max Daily Drawdown
                        </Heading>
                        <Heading size="lg">
                          {Number(challengeMetrics?.maxDailyDrawdown || 0).toFixed(2)}
                        </Heading>
                      </Box>
                      <Box
                        p={4}
                        borderRadius="lg"
                        bg={kpiBg}
                        borderWidth="1px"
                        
                        color="#65a8bf"
                      >
                        <Heading size="xs" mb={1} opacity={0.9}>
                          Max Daily Profit
                        </Heading>
                        <Heading size="lg">
                          {Number(challengeMetrics?.maxDailyProfit || 0).toFixed(2)}
                        </Heading>
                      </Box>
                    </SimpleGrid>
                  </Box>

                  <SimpleGrid columns={[1, 1, 2]} gap={6} mt={6}>
                    {/* Revenue over time */}
                    <Box h="300px">
                      <Heading size="sm" mb={2} color="#65a8bf">
                        {t("admin.revenue_over_time")}
                      </Heading>
                      <ResponsiveContainer width="100%" height="90%">
                        <AreaChart
                          data={revenueChartData}
                          margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="usdt"
                            name={t("admin.channel_onchain", {
                              defaultValue: "USDT (on-chain)",
                            })}
                            stackId="1"
                            stroke={brand}
                            fill={brand}
                          />
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="stripeUsd"
                            name={t("admin.channel_offchain", {
                              defaultValue: "Card / off-chain",
                            })}
                            stackId="1"
                            stroke="#8884d8"
                            fill="#8884d8"
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="tokenPrice"
                            name={t("admin.token_price_history", {
                              defaultValue: "Token price (USDT)",
                            })}
                            stroke="#fbbf24"
                            strokeWidth={2}
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Traffic & conversions */}
                    <Box h="300px">
                      <Heading size="sm" mb={2} color="#65a8bf">
                        {t("admin.traffic_conversions")}
                      </Heading>
                      <ResponsiveContainer width="100%" height="90%">
                        <ComposedChart
                          data={analytics?.trafficSeries || []}
                          margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Bar
                            yAxisId="left"
                            dataKey="views"
                            name={t("admin.metric_views", { defaultValue: "Views" })}
                            fill={brand}
                          />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="sessions"
                            name={t("admin.metric_sessions", { defaultValue: "Sessions" })}
                            stroke="#0ea5e9"
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="purchases"
                            name={t("admin.metric_purchases", { defaultValue: "Purchases" })}
                            stroke="#22c55e"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Purchase status pie */}
                    <Box h="300px">
                      <Heading size="sm" mb={2} color="#65a8bf">
                        {t("admin.purchase_status_breakdown")}
                      </Heading>
                      <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                          <Pie
                            data={purchasesByStatus}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={90}
                            label
                          >
                            {purchasesByStatus.map((_, idx) => (
                              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* On-chain vs off-chain split (no Stripe wording) */}
                    <Box h="300px">
                      <Heading size="sm" mb={2} color="#65a8bf">
                        {t("admin.revenue_split")}
                      </Heading>
                      <ResponsiveContainer width="100%" height="90%">
                        <RadialBarChart
                          innerRadius="20%"
                          outerRadius="90%"
                          data={revenueSplit.map((d, i) => ({
                            ...d,
                            name:
                              i === 0
                                ? t("admin.channel_onchain", {
                                    defaultValue: "USDT (on-chain)",
                                  })
                                : t("admin.channel_offchain", {
                                    defaultValue: "Card / off-chain",
                                  }),
                            fill: i === 0 ? brand : "#0ea5e9",
                            pv: d.value,
                          }))}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <RadialBar minAngle={15} background clockWise dataKey="pv" />
                          <Legend />
                          <Tooltip />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Top courses by revenue */}
                    <Box h="300px">
                      <Heading size="sm" mb={2} color="#65a8bf">
                        {t("admin.top_courses_revenue")}
                      </Heading>
                      <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={topCoursesByRevenue}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="revenueUsd"
                            name={t("admin.revenue_usd", {
                              defaultValue: "Revenue (USD)",
                            })}
                            fill={brand}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Course views vs sales */}
                    <Box h="300px">
                      <Heading size="sm" mb={2} color="#65a8bf">
                        {t("admin.course_views_sales")}
                      </Heading>
                      <ResponsiveContainer width="100%" height="90%">
                        <ComposedChart data={courseViewsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="views"
                            name={t("admin.metric_views", { defaultValue: "Views" })}
                            fill="#8b5cf6"
                          />
                          <Line
                            type="monotone"
                            dataKey="sales"
                            name={t("admin.metric_sales", { defaultValue: "Sales" })}
                            stroke="#22c55e"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </Box>
                  </SimpleGrid>
                </SpotlightCard>
              )}

              {adminSubTab === "challenges" && (
                <SpotlightCard>
                  <ChallengesAdminPanel />
                </SpotlightCard>
              )}

              {/* Verifications tab */}
              {adminSubTab === "verifications" && (
                <SpotlightCard>
                  <VerifAdminPanel isAdmin={true} />
                </SpotlightCard>
              )}

              {/* Content tab */}
              {adminSubTab === "content" && (
                <SpotlightCard>
                  <ContentAdminPanel isAdmin={true} />
                </SpotlightCard>
              )}

              {/* Promos tab */}
              {adminSubTab === "promos" && (
                <SpotlightCard>
                  <PromoAdminPanel />
                </SpotlightCard>
              )}

              {/* Prizes tab */}
              {adminSubTab === "prizes" && (
                <SpotlightCard>
                  <PrizesAdminPanel />
                </SpotlightCard>
              )}

              {/* Communications tab */}
              {adminSubTab === "communications" && (
                <SpotlightCard>
                  <CommunicationsAdminPanel />
                </SpotlightCard>
              )}

              {/* Jobs tab */}
              {adminSubTab === "jobs" && (
                <SpotlightCard>
                  <JobsAdminPanel />
                </SpotlightCard>
              )}

              {/* Applications tab */}
              {adminSubTab === "applications" && (
                <SpotlightCard>
                  <ApplicationsAdminPanel />
                </SpotlightCard>
              )}

              {/* Progress tab */}
              {adminSubTab === "progress" && (
                <SpotlightCard>
                  <Box bg="transparent" py={8}>
                    <Container maxW="container.xl">
                      <VStack align="stretch" spacing={6}>
                        <Heading size="xl">Student Progress & Analytics</Heading>

                        <Tabs colorScheme="blue" variant="enclosed">
                          <TabList>
                            <Tab>📊 Student Progress</Tab>
                            <Tab>🏆 Badge Statistics</Tab>
                          </TabList>

                          <TabPanels>
                            <TabPanel px={0}>
                              <StudentProgressAnalytics />
                            </TabPanel>

                            <TabPanel px={0}>
                              <BadgeLeaderboard />
                            </TabPanel>
                          </TabPanels>
                        </Tabs>
                      </VStack>
                    </Container>
                  </Box>
                </SpotlightCard>
              )}

              {/* Tokenomics tab */}
              {adminSubTab === "tokenomics" && (
                <SpotlightCard>
                  <TokenomicsAdminPanel />
                </SpotlightCard>
              )}

              {/* Optional: keep the small "pending over time" chart */}
              {!!pendingSeries.length && (
                <SpotlightCard>
                  <Box>
                    <Heading size="sm" mb={2}>
                      {t("dashboard.pending_over_time")}
                    </Heading>
                    <Box h="260px">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={pendingSeries}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke={brand}
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </SpotlightCard>
              )}
            </VStack>
          )}

          {/* --------- COURSES (user) --------- */}
          {activeTab === "courses" && (
            <VStack align="stretch" gap={4}>
              {loading && (
                <HStack>
                  <Spinner size="sm" />
                  <Text>{t("common.loading") || "Loading..."}</Text>
                </HStack>
              )}
              {!loading && !enrolledTiers.length && (
                <Box
                  p={8}
                  textAlign="center"
                  borderRadius="xl"
                  bg="rgba(255, 255, 255, 0.02)"
                  border="1px solid"
                  borderColor="rgba(104, 165, 191, 0.2)"
                >
                  <Text color="gray.400" fontSize="lg">
                    {t("dashboard.no_courses") || "You are not enrolled in any courses yet."}
                  </Text>
                  <Button
                    mt={4}
                    colorScheme="blue"
                    onClick={() => window.location.assign("/products")}
                  >
                    Browse Courses
                  </Button>
                </Box>
              )}
              {enrolledTiers.map((course) => (
                <GlassCard key={course.id}>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" gap={1}>
                      <HStack>
                        <Heading size="md">{course.name}</Heading>
                        {course.level && <Badge>{course.level}</Badge>}
                      </HStack>
                      {course.description && (
                        <Text color="text.primary" p={2} maxW="3xl">
                          {course.description}
                        </Text>
                      )}
                      {course.instructorName && (
                        <HStack>
                          {course.instructorAvatarUrl && (
                            <Image
                              src={course.instructorAvatarUrl}
                              alt={course.instructorName}
                              boxSize="28px"
                              borderRadius="full"
                            />
                          )}
                          <Text fontSize="sm">{course.instructorName}</Text>
                        </HStack>
                      )}
                    </VStack>
                    <Button size="sm" onClick={() => window.location.assign(`/learn/${course.id}`)}>
                      {t("dashboard.continue") || "Continue"}
                    </Button>
                  </HStack>
                </GlassCard>
              ))}
            </VStack>
          )}

          {/* --------- ACCOUNT --------- */}
          {activeTab === "account" && (
            <VStack align="stretch" gap={4}>
              <Box
                p={6}
                borderRadius="xl"
                bg="rgba(255, 255, 255, 0.02)"
                border="1px solid"
                borderColor="rgba(104, 165, 191, 0.2)"
              >
                {user ? (
                  <VStack align="center" spacing={4}>
                    <InfoCard
                      id={user?.id}
                      name={user?.name}
                      email={user?.email}
                      firstPurchaseAt={firstPurchaseDate}
                      levelLabel={primaryLevel}
                      badges={unlockedBadgeNames} // or myBadges.map(...)
                      streakDays={streakDays}
                      logoSrc="/card-logo.png"
                      tokenSymbol="PMKX"
                      pmkxBalance={pmkxBalance}
                      pmkxValueUsd={pmkxValueUsd}
                      wallet={wallet}
                    />
                    <Text fontSize="xs" opacity={0.7} color="gray.300">
                      {t("dashboard.account_hint", {
                        defaultValue:
                          "Your profile is displayed as a virtual membership card for your eyes only.",
                      })}
                    </Text>

                    <Box w="full" pt={2}>
                      <Heading size="sm" mb={2} color="gray.200">
                        Badges
                      </Heading>
                      {badgesLoading && (
                        <HStack>
                          <Spinner size="sm" />
                          <Text color="gray.400">Loading badges…</Text>
                        </HStack>
                      )}
                      {!badgesLoading && allBadges.length === 0 && (
                        <Text color="gray.400">No badges found.</Text>
                      )}

                      {!badgesLoading && allBadges.length > 0 && (
                        <VStack align="stretch" gap={4}>
                          <Box>
                            <Text fontWeight="600" mb={2} color="gray.200">
                              Unlocked ({unlockedBadges.length})
                            </Text>
                            {unlockedBadges.length === 0 ? (
                              <Text color="gray.400">No unlocked badges yet.</Text>
                            ) : (
                              <SimpleGrid columns={[2, 3, 4]} gap={3}>
                                {unlockedBadges.map((b) => (
                                  <Box
                                    key={b.id}
                                    p={3}
                                    borderRadius="lg"
                                    bg="rgba(255,255,255,0.02)"
                                    border="1px solid"
                                    borderColor="rgba(104, 165, 191, 0.25)"
                                  >
                                    {b.imageUrl ? (
                                      <Image
                                        src={resolveAssetUrl(b.imageUrl)}
                                        alt={b.name}
                                        boxSize="56px"
                                        mx="auto"
                                        mb={2}
                                      />
                                    ) : null}
                                    <Text fontSize="sm" fontWeight="600" textAlign="center">
                                      {b.name}
                                    </Text>
                                  </Box>
                                ))}
                              </SimpleGrid>
                            )}
                          </Box>

                          <Box>
                            <Text fontWeight="600" mb={2} color="gray.200">
                              Locked ({lockedBadges.length})
                            </Text>
                            {lockedBadges.length === 0 ? (
                              <Text color="gray.400">You’ve unlocked everything.</Text>
                            ) : (
                              <SimpleGrid columns={[2, 3, 4]} gap={3}>
                                {lockedBadges.map((b) => (
                                  <Box
                                    key={b.id}
                                    p={3}
                                    borderRadius="lg"
                                    bg="rgba(255,255,255,0.01)"
                                    border="1px solid"
                                    borderColor="rgba(255,255,255,0.06)"
                                    opacity={0.65}
                                  >
                                    {b.imageUrl ? (
                                      <Image
                                        src={resolveAssetUrl(b.imageUrl)}
                                        alt={b.name}
                                        boxSize="56px"
                                        mx="auto"
                                        mb={2}
                                        filter="grayscale(100%)"
                                      />
                                    ) : null}
                                    <Text fontSize="sm" fontWeight="600" textAlign="center">
                                      {b.name}
                                    </Text>
                                  </Box>
                                ))}
                              </SimpleGrid>
                            )}
                          </Box>
                        </VStack>
                      )}
                    </Box>

                    <Box w="full" pt={4}>
                      <Heading size="sm" mb={3} color="gray.200">
                        Subscriptions
                      </Heading>
                      <SimpleGrid columns={[1, 2]} gap={3} w="full">
                        <Box
                          p={4}
                          borderRadius="lg"
                          bg="rgba(255,255,255,0.02)"
                          border="1px solid"
                          borderColor="rgba(104, 165, 191, 0.2)"
                        >
                          <HStack justify="space-between" mb={1}>
                            <Text fontWeight="700">Telegram VIP</Text>
                            <Badge colorScheme={telegramVipActive ? "green" : "gray"}>
                              {telegramVipActive ? "ACTIVE" : "INACTIVE"}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.300" mb={3}>
                            $10 / month
                          </Text>
                          <Button
                            size="sm"
                            bg={brand}
                            color="black"
                            _hover={{ opacity: 0.9 }}
                            isDisabled={!telegramVipTier?.id}
                            onClick={() =>
                              telegramVipTier?.id &&
                              window.location.assign(`/checkout?tierId=${telegramVipTier.id}`)
                            }
                          >
                            Subscribe
                          </Button>
                        </Box>

                        <Box
                          p={4}
                          borderRadius="lg"
                          bg="rgba(255,255,255,0.02)"
                          border="1px solid"
                          borderColor="rgba(104, 165, 191, 0.2)"
                        >
                          <HStack justify="space-between" mb={1}>
                            <Text fontWeight="700">Discord VIP</Text>
                            <Badge colorScheme={discordVipActive ? "green" : "gray"}>
                              {discordVipActive ? "ACTIVE" : "INACTIVE"}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.300" mb={3}>
                            $10 / month
                          </Text>
                          <Button
                            size="sm"
                            bg={brand}
                            color="black"
                            _hover={{ opacity: 0.9 }}
                            isDisabled={!discordVipTier?.id}
                            onClick={() =>
                              discordVipTier?.id &&
                              window.location.assign(`/checkout?tierId=${discordVipTier.id}`)
                            }
                          >
                            Subscribe
                          </Button>
                        </Box>

                        <Box
                          p={4}
                          borderRadius="lg"
                          bg="rgba(255,255,255,0.02)"
                          border="1px solid"
                          borderColor="rgba(104, 165, 191, 0.2)"
                        >
                          <HStack justify="space-between" mb={1}>
                            <Text fontWeight="700">promrkts+ Bundle</Text>
                            <Badge
                              colorScheme={telegramVipActive && discordVipActive ? "green" : "gray"}
                            >
                              {telegramVipActive && discordVipActive ? "ACTIVE" : "INACTIVE"}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.300" mb={3}>
                            $15 / month
                          </Text>
                          <Button
                            size="sm"
                            bg={brand}
                            color="black"
                            _hover={{ opacity: 0.9 }}
                            isDisabled={!bundleMonthlyTier?.id}
                            onClick={() =>
                              bundleMonthlyTier?.id &&
                              window.location.assign(`/checkout?tierId=${bundleMonthlyTier.id}`)
                            }
                          >
                            Subscribe
                          </Button>
                        </Box>

                        <Box
                          p={4}
                          borderRadius="lg"
                          bg="rgba(255,255,255,0.02)"
                          border="1px solid"
                          borderColor="rgba(104, 165, 191, 0.2)"
                        >
                          <HStack justify="space-between" mb={1}>
                            <Text fontWeight="700">promrkts+ Yearly</Text>
                            <Badge
                              colorScheme={telegramVipActive && discordVipActive ? "green" : "gray"}
                            >
                              {telegramVipActive && discordVipActive ? "ACTIVE" : "INACTIVE"}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.300" mb={1}>
                            $150 / year
                          </Text>
                          <Text fontSize="xs" color="gray.400" mb={3}>
                            12 months access for the price of 10 months
                          </Text>
                          <Button
                            size="sm"
                            bg={brand}
                            color="black"
                            _hover={{ opacity: 0.9 }}
                            isDisabled={!bundleYearlyTier?.id}
                            onClick={() =>
                              bundleYearlyTier?.id &&
                              window.location.assign(`/checkout?tierId=${bundleYearlyTier.id}`)
                            }
                          >
                            Subscribe
                          </Button>
                        </Box>

                        <Box
                          p={4}
                          borderRadius="lg"
                          bg="rgba(255,255,255,0.02)"
                          border="1px solid"
                          borderColor="rgba(104, 165, 191, 0.2)"
                        >
                          <HStack justify="space-between" mb={1}>
                            <Text fontWeight="700">AI Chatbot</Text>
                            <Badge colorScheme={aiActive ? "green" : "gray"}>
                              {aiActive ? "ACTIVE" : "INACTIVE"}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.300" mb={3}>
                            $10 / month
                          </Text>
                          <Button
                            size="sm"
                            bg={brand}
                            color="black"
                            _hover={{ opacity: 0.9 }}
                            isDisabled={!aiTier?.id}
                            onClick={() =>
                              aiTier?.id && window.location.assign(`/checkout?tierId=${aiTier.id}`)
                            }
                          >
                            Subscribe
                          </Button>
                        </Box>
                      </SimpleGrid>
                    </Box>
                  </VStack>
                ) : (
                  <Text color="gray.400">{t("dashboard.not_logged_in") || "Not logged in."}</Text>
                )}
              </Box>
            </VStack>
          )}

          {/* --------- PURCHASES --------- */}
          {activeTab === "purchases" && (
            <VStack align="stretch" gap={4}>
              {loading && (
                <HStack>
                  <Spinner size="sm" />
                  <Text>{t("common.loading") || "Loading..."}</Text>
                </HStack>
              )}
              {!loading && !purchases.length && (
                <Box
                  p={8}
                  textAlign="center"
                  borderRadius="xl"
                  bg="rgba(255, 255, 255, 0.02)"
                  border="1px solid"
                  borderColor="rgba(104, 165, 191, 0.2)"
                >
                  <Text color="gray.400" fontSize="lg">
                    {t("dashboard.no_purchases") || "No purchases yet."}
                  </Text>
                </Box>
              )}
              {purchases.map((p) => {
                const tier = tiers.find((t) => t.id === p.tierId);
                return (
                  <GlassCard key={p.id}>
                    <HStack justify="space-between" align="start">
                      <VStack align="start" gap={1}>
                        <Heading size="sm">{tier?.name || "Course"}</Heading>
                        <HStack gap={2}>
                          <Badge
                            colorScheme={
                              p.status === "CONFIRMED"
                                ? "green"
                                : p.status === "PENDING"
                                ? "yellow"
                                : "gray"
                            }
                          >
                            {p.status}
                          </Badge>
                          {p.createdAt && (
                            <Text fontSize="xs" color="text.muted">
                              {new Date(p.createdAt).toLocaleString()}
                            </Text>
                          )}
                        </HStack>
                      </VStack>
                      {p.status === "CONFIRMED" && tier && (
                        <Button
                          size="sm"
                          onClick={() => window.location.assign(`/learn/${tier.id}`)}
                        >
                          {t("dashboard.open") || "Open"}
                        </Button>
                      )}
                    </HStack>
                  </GlassCard>
                );
              })}
            </VStack>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Dashboard;