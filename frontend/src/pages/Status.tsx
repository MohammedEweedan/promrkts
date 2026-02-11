// src/pages/Status.tsx — Vercel-inspired system status page
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
  Icon,
  SimpleGrid,
  Tooltip,
  Button,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useThemeMode } from "../themeProvider";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  Database,
  Globe,
  Shield,
  Wifi,
  Clock,
  Activity,
  Zap,
} from "lucide-react";
import axios from "axios";

/** Resolve backend origin (without /api suffix) for root-level endpoints like /health */
const getBackendOrigin = () => {
  const raw =
    process.env.REACT_APP_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://api.promrkts.com";
  // Strip trailing /api if present
  let origin = raw.replace(/\/+$/, "").replace(/\/api$/i, "");
  // Upgrade to https if page is https and origin is http (non-localhost)
  try {
    if (
      typeof window !== "undefined" &&
      /^https:/i.test(window.location.protocol) &&
      /^http:/i.test(origin)
    ) {
      const u = new URL(origin);
      if (!/(^|\.)localhost$/i.test(u.hostname)) {
        u.protocol = "https:";
        origin = u.toString().replace(/\/+$/, "");
      }
    }
  } catch {}
  return origin;
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  memory: { used: number; total: number };
  database: {
    prisma: { isConnected: boolean; latencyMs?: number };
    pg: { isConnected: boolean; latencyMs?: number };
  };
}

type ServiceStatus = "operational" | "degraded" | "down" | "checking";

interface ServiceInfo {
  id: string;
  nameKey: string;
  defaultName: string;
  icon: React.ElementType;
  status: ServiceStatus;
  latency?: number;
  detail?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const STATUS_CONFIG: Record<ServiceStatus, { color: string; bg: string; label: string }> = {
  operational: { color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Operational" },
  degraded: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Degraded" },
  down: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "Down" },
  checking: { color: "#6b7280", bg: "rgba(107,114,128,0.1)", label: "Checking" },
};

const StatusIcon: React.FC<{ status: ServiceStatus; size?: number }> = ({ status, size = 5 }) => {
  const cfg = STATUS_CONFIG[status];
  const icons: Record<ServiceStatus, React.ElementType> = {
    operational: CheckCircle,
    degraded: AlertTriangle,
    down: XCircle,
    checking: Activity,
  };
  return <Icon as={icons[status]} boxSize={size} color={cfg.color} />;
};

const PulseDot: React.FC<{ status: ServiceStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <Box position="relative" display="inline-flex" alignItems="center" justifyContent="center">
      {status === "operational" && (
        <Box
          position="absolute"
          w="10px"
          h="10px"
          borderRadius="full"
          bg={cfg.color}
          opacity={0.4}
          sx={{
            animation: "statusPulse 2s ease-in-out infinite",
            "@keyframes statusPulse": {
              "0%, 100%": { transform: "scale(1)", opacity: 0.4 },
              "50%": { transform: "scale(2)", opacity: 0 },
            },
          }}
        />
      )}
      <Box w="10px" h="10px" borderRadius="full" bg={cfg.color} position="relative" />
    </Box>
  );
};

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const Status: React.FC = () => {
  const { t } = useTranslation() as any;
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`${getBackendOrigin()}/health`, { timeout: 10000 });
      setHealth(res.data);
      setError(false);
    } catch {
      setError(true);
      setHealth(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  // Derive service statuses
  const services: ServiceInfo[] = React.useMemo(() => {
    if (loading && !health) {
      return [
        { id: "api", nameKey: "status.services.api", defaultName: "API Server", icon: Server, status: "checking" },
        { id: "database", nameKey: "status.services.database", defaultName: "Database", icon: Database, status: "checking" },
        { id: "cdn", nameKey: "status.services.cdn", defaultName: "CDN & Assets", icon: Globe, status: "checking" },
        { id: "auth", nameKey: "status.services.auth", defaultName: "Authentication", icon: Shield, status: "checking" },
        { id: "realtime", nameKey: "status.services.realtime", defaultName: "Real-time Data", icon: Wifi, status: "checking" },
        { id: "cloudflare", nameKey: "status.services.cloudflare", defaultName: "Cloudflare Protection", icon: Zap, status: "checking" },
      ];
    }

    if (error || !health) {
      return [
        { id: "api", nameKey: "status.services.api", defaultName: "API Server", icon: Server, status: "down", detail: t("status.unreachable", { defaultValue: "Unreachable" }) },
        { id: "database", nameKey: "status.services.database", defaultName: "Database", icon: Database, status: "down" },
        { id: "cdn", nameKey: "status.services.cdn", defaultName: "CDN & Assets", icon: Globe, status: "operational", detail: t("status.static_ok", { defaultValue: "Static assets served via CDN" }) },
        { id: "auth", nameKey: "status.services.auth", defaultName: "Authentication", icon: Shield, status: "down" },
        { id: "realtime", nameKey: "status.services.realtime", defaultName: "Real-time Data", icon: Wifi, status: "down" },
        { id: "cloudflare", nameKey: "status.services.cloudflare", defaultName: "Cloudflare Protection", icon: Zap, status: "operational", detail: t("status.edge_ok", { defaultValue: "Edge protection active" }) },
      ];
    }

    const prismaOk = health.database?.prisma?.isConnected;
    const pgOk = health.database?.pg?.isConnected;
    const dbStatus: ServiceStatus = prismaOk && pgOk ? "operational" : prismaOk || pgOk ? "degraded" : "down";
    const apiStatus: ServiceStatus = health.status === "ok" ? "operational" : "degraded";

    return [
      { id: "api", nameKey: "status.services.api", defaultName: "API Server", icon: Server, status: apiStatus, latency: health.database?.pg?.latencyMs, detail: `Uptime: ${formatUptime(health.uptime)}` },
      { id: "database", nameKey: "status.services.database", defaultName: "Database", icon: Database, status: dbStatus, latency: health.database?.prisma?.latencyMs || health.database?.pg?.latencyMs },
      { id: "cdn", nameKey: "status.services.cdn", defaultName: "CDN & Assets", icon: Globe, status: "operational" },
      { id: "auth", nameKey: "status.services.auth", defaultName: "Authentication", icon: Shield, status: apiStatus },
      { id: "realtime", nameKey: "status.services.realtime", defaultName: "Real-time Data", icon: Wifi, status: apiStatus },
      { id: "cloudflare", nameKey: "status.services.cloudflare", defaultName: "Cloudflare Protection", icon: Zap, status: "operational", detail: t("status.edge_ok", { defaultValue: "Edge protection active" }) },
    ];
  }, [health, loading, error, t]);

  const overallStatus: ServiceStatus = services.some((s) => s.status === "down")
    ? "down"
    : services.some((s) => s.status === "degraded")
    ? "degraded"
    : services.every((s) => s.status === "checking")
    ? "checking"
    : "operational";

  const overallCfg = STATUS_CONFIG[overallStatus];

  const cardBg = isDark ? "rgba(15,23,42,0.6)" : "white";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const subtleText = isDark ? "whiteAlpha.600" : "gray.500";

  return (
    <Container maxW="container.md" py={{ base: 10, md: 16 }}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <VStack spacing={4} textAlign="center">
          <HStack spacing={3} justify="center">
            <PulseDot status={overallStatus} />
            <Heading fontSize={{ base: "2xl", md: "3xl" }} fontWeight="700" letterSpacing="-0.02em">
              {t("status.title", { defaultValue: "System Status" })}
            </Heading>
          </HStack>

          <Box
            px={5}
            py={2.5}
            borderRadius="full"
            bg={overallCfg.bg}
            border="1px solid"
            borderColor={overallCfg.color}
          >
            <HStack spacing={2}>
              <StatusIcon status={overallStatus} size={4} />
              <Text fontWeight="600" fontSize="sm" color={overallCfg.color}>
                {overallStatus === "operational"
                  ? t("status.all_operational", { defaultValue: "All Systems Operational" })
                  : overallStatus === "degraded"
                  ? t("status.some_degraded", { defaultValue: "Some Systems Degraded" })
                  : overallStatus === "down"
                  ? t("status.major_outage", { defaultValue: "Major Outage Detected" })
                  : t("status.checking", { defaultValue: "Checking Systems..." })}
              </Text>
            </HStack>
          </Box>

          <HStack spacing={4} opacity={0.6} fontSize="xs">
            <HStack spacing={1}>
              <Icon as={Clock} boxSize={3} />
              <Text>
                {t("status.last_checked", { defaultValue: "Last checked" })}: {lastChecked.toLocaleTimeString()}
              </Text>
            </HStack>
            <Tooltip label={t("status.refresh", { defaultValue: "Refresh" })}>
              <Button
                size="xs"
                variant="ghost"
                onClick={fetchHealth}
                isLoading={refreshing}
                leftIcon={<Icon as={RefreshCw} boxSize={3} />}
                _hover={{ opacity: 1 }}
              >
                {t("status.refresh", { defaultValue: "Refresh" })}
              </Button>
            </Tooltip>
          </HStack>
        </VStack>

        {/* Services */}
        <VStack spacing={3} align="stretch">
          <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.1em" fontWeight="600" color={subtleText}>
            {t("status.services_label", { defaultValue: "Services" })}
          </Text>

          {services.map((svc) => {
            const cfg = STATUS_CONFIG[svc.status];
            return (
              <Box
                key={svc.id}
                p={4}
                borderRadius="xl"
                bg={cardBg}
                border="1px solid"
                borderColor={cardBorder}
                transition="all 0.2s"
                _hover={{ borderColor: cfg.color, transform: "translateY(-1px)", boxShadow: `0 4px 20px ${cfg.bg}` }}
              >
                <HStack justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Box
                      w={9}
                      h={9}
                      borderRadius="lg"
                      bg={cfg.bg}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={svc.icon} boxSize={4} color={cfg.color} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="600" fontSize="sm">
                        {t(svc.nameKey, { defaultValue: svc.defaultName })}
                      </Text>
                      {svc.detail && (
                        <Text fontSize="xs" color={subtleText}>
                          {svc.detail}
                        </Text>
                      )}
                    </VStack>
                  </HStack>

                  <HStack spacing={3}>
                    {svc.latency != null && (
                      <Text fontSize="xs" color={subtleText}>
                        {svc.latency}ms
                      </Text>
                    )}
                    {svc.status === "checking" ? (
                      <Spinner size="xs" color={cfg.color} />
                    ) : (
                      <Badge
                        px={2.5}
                        py={0.5}
                        borderRadius="full"
                        bg={cfg.bg}
                        color={cfg.color}
                        fontSize="2xs"
                        fontWeight="600"
                        textTransform="capitalize"
                      >
                        {t(`status.label_${svc.status}`, { defaultValue: cfg.label })}
                      </Badge>
                    )}
                  </HStack>
                </HStack>
              </Box>
            );
          })}
        </VStack>

        {/* Metrics */}
        {health && (
          <Box>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.1em" fontWeight="600" color={subtleText} mb={3}>
              {t("status.metrics_label", { defaultValue: "Metrics" })}
            </Text>
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
              {[
                { label: t("status.uptime", { defaultValue: "Uptime" }), value: formatUptime(health.uptime), icon: Clock },
                { label: t("status.memory", { defaultValue: "Memory" }), value: `${health.memory.used}/${health.memory.total} MB`, icon: Activity },
                { label: t("status.response", { defaultValue: "Response" }), value: `${health.database?.pg?.latencyMs ?? "—"}ms`, icon: Zap },
                { label: t("status.status_label", { defaultValue: "Status" }), value: health.status === "ok" ? t("status.healthy", { defaultValue: "Healthy" }) : t("status.unhealthy", { defaultValue: "Unhealthy" }), icon: Server },
              ].map((m) => (
                <Box
                  key={m.label}
                  p={3}
                  borderRadius="lg"
                  bg={cardBg}
                  border="1px solid"
                  borderColor={cardBorder}
                  textAlign="center"
                >
                  <Icon as={m.icon} boxSize={4} color="#65a8bf" mb={1} />
                  <Text fontSize="lg" fontWeight="700">
                    {m.value}
                  </Text>
                  <Text fontSize="2xs" color={subtleText} textTransform="uppercase" letterSpacing="0.05em">
                    {m.label}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* Cloudflare info */}
        <Box
          p={5}
          borderRadius="xl"
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorder}
        >
          <HStack spacing={3} mb={3}>
            <Icon as={Shield} boxSize={5} color="#f6821f" />
            <Heading fontSize="md" fontWeight="700">
              {t("status.cloudflare.title", { defaultValue: "Cloudflare Protection" })}
            </Heading>
          </HStack>
          <VStack align="start" spacing={2}>
            {[
              t("status.cloudflare.ddos", { defaultValue: "DDoS mitigation active on all endpoints" }),
              t("status.cloudflare.waf", { defaultValue: "Web Application Firewall (WAF) enabled" }),
              t("status.cloudflare.ssl", { defaultValue: "SSL/TLS encryption enforced (Full Strict)" }),
              t("status.cloudflare.cache", { defaultValue: "Edge caching for static assets worldwide" }),
            ].map((item, i) => (
              <HStack key={i} spacing={2}>
                <Icon as={CheckCircle} boxSize={3.5} color="#10b981" />
                <Text fontSize="sm" opacity={0.8}>
                  {item}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>

        {/* Footer note */}
        <Text fontSize="xs" textAlign="center" opacity={0.4}>
          {t("status.auto_refresh", { defaultValue: "This page auto-refreshes every 30 seconds." })}
        </Text>
      </VStack>
    </Container>
  );
};

export default Status;
