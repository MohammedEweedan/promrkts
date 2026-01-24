import React from "react";
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  useColorModeValue,
  SimpleGrid,
  Badge,
  Divider,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Switch,
  Spinner,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import api from "../api/client";
import SpotlightCard from "../components/SpotlightCard";

import {
  createChart,
  ColorType,
  IChartApi,
  CandlestickSeries,
  UTCTimestamp,
} from "lightweight-charts";
import { ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";

// If you want time scale labels later, you can add date adapter.
// For now we’ll use string labels (works without adapter).
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

type Trade = {
  id: string;
  pair: string;
  side: "BUY" | "SELL";
  result: "OPEN" | "WIN" | "LOSS" | "BREAKEVEN";
  pnl?: number | null;
  entryPrice?: number | null;
  exitPrice?: number | null;
  slPrice?: number | null;
  tpPrice?: number | null;
  size?: number | null;
  openedAt?: string | null;
  closedAt?: string | null;
  createdAt?: string;
  accountBalance?: number | null;
  leverage?: number | null;
};

type StatsResp = {
  totals: {
    totalTrades: number;
    closedTrades: number;
    wins: number;
    losses: number;
    winRate: number;
    profitFactor: number;
  };
  byPair: Record<string, { count: number; wins: number; losses: number; pnl: number }>;
  trades: Array<Trade>;
};

const ACCENT = "#65a8bf";

const fmt = (n: any) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return x.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

type Candle = { time: UTCTimestamp; open: number; high: number; low: number; close: number };

const toUtc = (unixSec: number) => Math.floor(unixSec) as UTCTimestamp;

const JournalCandleChart: React.FC<{
  candles: Candle[];
  height?: number | string;
  trade?: Trade | null;
}> = ({ candles, height = 360, trade }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const seriesRef = React.useRef<ReturnType<IChartApi["addSeries"]> | null>(null);
  const priceLinesRef = React.useRef<any[]>([]);

  const textColor = useColorModeValue("rgba(10,10,10,0.70)", "rgba(255,255,255,0.75)");
  const gridColor = useColorModeValue("rgba(0,0,0,0.06)", "rgba(255,255,255,0.08)");
  const borderColor = useColorModeValue("rgba(0,0,0,0.10)", "rgba(255,255,255,0.10)");
  const upColor = useColorModeValue("rgba(0,191,99,1)", "rgba(0,191,99,1)");
  const downColor = useColorModeValue("rgba(220,38,38,1)", "rgba(183,162,125,1)");

  React.useEffect(() => {
    if (!ref.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
      priceLinesRef.current = [];
    }

    const el = ref.current;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "rgba(0,0,0,0)" },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      rightPriceScale: { borderColor },
      timeScale: { borderColor, timeVisible: true, secondsVisible: false },
      crosshair: {
        vertLine: { color: gridColor, width: 1 },
        horzLine: { color: gridColor, width: 1 },
      },
      handleScroll: true,
      handleScale: true,
    });

    chartRef.current = chart;

    const candlesSeries = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      wickUpColor: upColor,
      wickDownColor: downColor,
      borderVisible: false,
    });

    seriesRef.current = candlesSeries;

    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      chart.applyOptions({
        width: Math.max(10, Math.floor(width)),
        height: Math.max(10, Math.floor(height)),
      });
      chart.timeScale().fitContent();
    });
    ro.observe(el);

    candlesSeries.setData((candles || []) as any);
    chart.timeScale().fitContent();

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      priceLinesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textColor, gridColor, borderColor, upColor, downColor]);

  React.useEffect(() => {
    if (!seriesRef.current) return;
    seriesRef.current.setData((candles || []) as any);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  React.useEffect(() => {
    if (!seriesRef.current) return;

    try {
      // Clear previous price lines
      for (const pl of priceLinesRef.current) {
        try {
          seriesRef.current.removePriceLine(pl);
        } catch {}
      }
      priceLinesRef.current = [];

      // Clear previous markers
      (seriesRef.current as any).setMarkers?.([]);

      if (!trade) return;

      const openedAtMs = new Date(trade.openedAt || trade.createdAt || Date.now()).getTime();
      const entry = trade.entryPrice != null ? Number(trade.entryPrice) : null;

      if (Number.isFinite(entry as any)) {
        // Mark entry at nearest candle
        const nearest = (candles || []).reduce<
          { time: UTCTimestamp; delta: number } | null
        >((best, c) => {
          const tMs = Number(c.time) * 1000;
          const d = Math.abs(tMs - openedAtMs);
          if (!best || d < best.delta) return { time: c.time, delta: d };
          return best;
        }, null);

        if (nearest) {
          (seriesRef.current as any).setMarkers?.([
            {
              time: nearest.time,
              position: trade.side === "BUY" ? "belowBar" : "aboveBar",
              color: ACCENT,
              shape: trade.side === "BUY" ? "arrowUp" : "arrowDown",
              text: `${trade.side} @ ${entry}`,
            },
          ]);
        }
      }

      const mkLine = (price: number, title: string, color: string) => {
        const pl = seriesRef.current!.createPriceLine({
          price,
          color,
          lineWidth: 2,
          lineStyle: 2,
          axisLabelVisible: true,
          title,
        });
        priceLinesRef.current.push(pl);
      };

      if (trade.tpPrice != null && Number.isFinite(Number(trade.tpPrice))) {
        mkLine(Number(trade.tpPrice), "TP", "rgba(0,191,99,0.9)");
      }
      if (trade.slPrice != null && Number.isFinite(Number(trade.slPrice))) {
        mkLine(Number(trade.slPrice), "SL", "rgba(220,38,38,0.9)");
      }
      if (trade.entryPrice != null && Number.isFinite(Number(trade.entryPrice))) {
        mkLine(Number(trade.entryPrice), "Entry", "rgba(0,191,99,0.45)");
      }
    } catch {
      // Avoid chart crashes
    }
  }, [trade, candles]);

  return (
    <Box
      ref={ref as any}
      w="100%"
      h={height}
      borderRadius="2xl"
      bg={useColorModeValue("white", "gray.800")}
      borderWidth="1px"
      borderColor={useColorModeValue("blackAlpha.200", "whiteAlpha.200")}
      position="relative"
    />
  );
};

export default function Journal() {
  const border = useColorModeValue("blackAlpha.200", "whiteAlpha.200");

  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<StatsResp | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Modal state
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [entryTouched, setEntryTouched] = React.useState(false);
  const [autoEntryNote, setAutoEntryNote] = React.useState<string>("");

  // Form state
  const [pair, setPair] = React.useState("EURUSD");
  const [side, setSide] = React.useState<"BUY" | "SELL">("BUY");

  const [entryPrice, setEntryPrice] = React.useState<string>("");
  const [exitPrice, setExitPrice] = React.useState<string>("");

  const [slPrice, setSlPrice] = React.useState<string>("");
  const [tpPrice, setTpPrice] = React.useState<string>("");

  const [accountBalance, setAccountBalance] = React.useState<string>("");
  const [leverage, setLeverage] = React.useState<string>("");
  const [size, setSize] = React.useState<string>("");
  const [riskPct, setRiskPct] = React.useState<string>("1");

  const [pnl, setPnl] = React.useState<string>("");
  const [notes, setNotes] = React.useState("");

  const [manualDate, setManualDate] = React.useState(false);
  const [openedAt, setOpenedAt] = React.useState<string>(""); // datetime-local string

  // Chart + live PnL
  const [chartPair, setChartPair] = React.useState<string>("EURUSD");
  const [chartTradeId, setChartTradeId] = React.useState<string>("");
  const [tf, setTf] = React.useState<string>("15m");
  const [range, setRange] = React.useState<string>("5d");
  const [candles, setCandles] = React.useState<Candle[]>([]);
  const [quotePrice, setQuotePrice] = React.useState<number | null>(null);
  const [quoteAt, setQuoteAt] = React.useState<number | null>(null);
  const [quoteLoading, setQuoteLoading] = React.useState(false);

  const lotCalc = React.useMemo(() => {
    const bal = Number(accountBalance);
    const rp = Number(riskPct);
    const entry = Number(entryPrice);
    const sl = Number(slPrice);

    if (!Number.isFinite(bal) || bal <= 0) return { ok: false as const, reason: "Enter account balance" };
    if (!Number.isFinite(rp) || rp <= 0) return { ok: false as const, reason: "Enter risk %" };
    if (!Number.isFinite(entry) || entry <= 0) return { ok: false as const, reason: "Entry price required" };
    if (!Number.isFinite(sl) || sl <= 0) return { ok: false as const, reason: "SL price required" };

    const riskUsd = (bal * rp) / 100;
    const stopDist = Math.abs(entry - sl);
    if (!Number.isFinite(stopDist) || stopDist <= 0) return { ok: false as const, reason: "Invalid SL distance" };

    const p = String(pair || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const isFx = /^[A-Z]{6}$/.test(p);

    if (isFx) {
      const contractUnits = 100000;
      const units = riskUsd / stopDist;
      const lots = units / contractUnits;
      return {
        ok: true as const,
        riskUsd,
        stopDist,
        lots,
        units,
      };
    }

    // For crypto/other, treat "size" as base units
    const units = riskUsd / stopDist;
    return {
      ok: true as const,
      riskUsd,
      stopDist,
      lots: null,
      units,
    };
  }, [accountBalance, riskPct, entryPrice, slPrice, pair]);

  const resetForm = () => {
    setPair("EURUSD");
    setSide("BUY");
    setEntryPrice("");
    setEntryTouched(false);
    setAutoEntryNote("");
    setExitPrice("");
    setSlPrice("");
    setTpPrice("");
    setAccountBalance("");
    setLeverage("");
    setSize("");
    setRiskPct("1");
    setPnl("");
    setNotes("");
    setManualDate(false);
    setOpenedAt("");
  };

  const autoPickRangeAndInterval = (targetMs: number) => {
    const now = Date.now();
    const diffDays = Math.abs(now - targetMs) / (1000 * 60 * 60 * 24);
    if (diffDays <= 7) return { range: "5d", interval: "1m" };
    if (diffDays <= 32) return { range: "1mo", interval: "15m" };
    if (diffDays <= 190) return { range: "6mo", interval: "1h" };
    return { range: "1y", interval: "1d" };
  };

  const autoFillEntryFromQuote = React.useCallback(async (pairForQuote: string) => {
    try {
      setAutoEntryNote("Fetching live price…");
      const resp = await api.get("/market/quote", { params: { pair: pairForQuote } });
      const price = Number(resp.data?.price);
      const t = Number(resp.data?.t);
      if (Number.isFinite(price)) {
        // Only set if user hasn't typed
        setEntryPrice((prev) => (prev && prev.trim() !== "" ? prev : String(price)));
        setAutoEntryNote(
          `Auto entry: ${price} (live${Number.isFinite(t) ? ` @ ${new Date(t * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ""})`
        );
      } else {
        setAutoEntryNote("Live price unavailable");
      }
    } catch {
      setAutoEntryNote("Live price unavailable");
    }
  }, []);

  const autoFillEntryFromOpenedAt = React.useCallback(
    async (pairForQuote: string, openedAtIso: string) => {
      try {
        const target = new Date(openedAtIso).getTime();
        if (!Number.isFinite(target)) return;

        const { range, interval } = autoPickRangeAndInterval(target);
        setAutoEntryNote(`Fetching price near selected time… (${interval}, ${range})`);

        const resp = await api.get("/market/candles", {
          params: { pair: pairForQuote, interval, range },
        });

        const raw: any[] = Array.isArray(resp.data?.candles) ? resp.data.candles : [];
        const best = raw.reduce(
        (acc: { t: number; c: number; delta: number } | null, row: any) => {
          const t = Number(row?.t);
          const c = Number(row?.c);
          if (!Number.isFinite(t) || !Number.isFinite(c)) return acc;
          const delta = Math.abs(t * 1000 - target);
          if (!acc || delta < acc.delta) return { t, c, delta };
          return acc;
        }, null as { t: number; c: number; delta: number } | null);

        if (best && Number.isFinite(best.c)) {
          setEntryPrice((prev) => (entryTouched || (prev && prev.trim() !== "") ? prev : String(best.c)));
          setAutoEntryNote(
            `Auto entry: ${best.c} (nearest candle @ ${new Date(best.t * 1000).toLocaleString()})`
          );
        } else {
          setAutoEntryNote("No historical candle price found for that time");
        }
      } catch {
        setAutoEntryNote("No historical candle price found for that time");
      }
    },
    [entryTouched]
  );

  React.useEffect(() => {
    if (!open) return;
    // When modal opens, auto-fill entry from live quote if empty
    if (!entryTouched && (!entryPrice || entryPrice.trim() === "")) {
      autoFillEntryFromQuote(pair);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    if (!manualDate) return;
    if (!openedAt) return;
    if (entryTouched) return;
    autoFillEntryFromOpenedAt(pair, openedAt);
  }, [open, manualDate, openedAt, entryTouched, pair, autoFillEntryFromOpenedAt]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get("/journal/trades/stats");
      setStats(resp.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load journal stats");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const openTrades = React.useMemo(() => {
    const rows = (stats?.trades || []) as Trade[];
    return rows
      .filter((t) => String(t?.result || "").toUpperCase() === "OPEN")
      .slice()
      .sort((a, b) => {
        const da = new Date(a.openedAt || a.createdAt || 0).getTime();
        const db = new Date(b.openedAt || b.createdAt || 0).getTime();
        return db - da;
      });
  }, [stats]);

  const [openEdits, setOpenEdits] = React.useState<Record<string, any>>({});
  const [openSaving, setOpenSaving] = React.useState<Record<string, boolean>>({});

  const patchOpenTrade = React.useCallback(
    async (id: string, patch: any) => {
      setOpenSaving((s) => ({ ...s, [id]: true }));
      try {
        await api.patch(`/journal/trades/${id}`, patch);
        await load();
      } finally {
        setOpenSaving((s) => ({ ...s, [id]: false }));
      }
    },
    [load]
  );

  React.useEffect(() => {
    load();
  }, [load]);

  const totals = stats?.totals;

  const tradeOptions = React.useMemo(() => {
    const rows = (stats?.trades || []) as Trade[];
    const sorted = rows.slice().sort((a, b) => {
      const da = new Date(a.openedAt || a.createdAt || 0).getTime();
      const db = new Date(b.openedAt || b.createdAt || 0).getTime();
      return db - da;
    });
    return sorted;
  }, [stats]);

  const pairOptions = React.useMemo(() => {
    const set = new Set<string>();
    for (const t of (stats?.trades || []) as Trade[]) {
      if (t?.pair) set.add(String(t.pair).toUpperCase());
    }
    const arr = Array.from(set).sort();
    return arr.length ? arr : ["EURUSD", "BTCUSDT"];
  }, [stats]);

  const selectedTrade = React.useMemo<Trade | null>(() => {
    const rows = (stats?.trades || []) as Trade[];
    if (!rows.length) return null;
    if (chartTradeId) return rows.find((t) => String(t.id) === String(chartTradeId)) || null;

    // Default: most recent trade for selected pair
    const inPair = rows.filter((t) => String(t.pair).toUpperCase() === String(chartPair).toUpperCase());
    const sorted = inPair.slice().sort((a, b) => {
      const da = new Date(a.openedAt || a.createdAt || 0).getTime();
      const db = new Date(b.openedAt || b.createdAt || 0).getTime();
      return db - da;
    });
    return sorted[0] || null;
  }, [stats, chartTradeId, chartPair]);

  const refreshCandles = React.useCallback(async () => {
    try {
      const resp = await api.get("/market/candles", {
        params: { pair: chartPair, interval: tf, range },
      });
      const raw = Array.isArray(resp.data?.candles) ? resp.data.candles : [];
      const mapped: Candle[] = raw
        .map((c: any) => ({
          time: toUtc(Number(c.t)),
          open: Number(c.o),
          high: Number(c.h),
          low: Number(c.l),
          close: Number(c.c),
        }))
        .filter((c: Candle) =>
          Number.isFinite(c.time as any) &&
          Number.isFinite(c.open) &&
          Number.isFinite(c.high) &&
          Number.isFinite(c.low) &&
          Number.isFinite(c.close)
        );
      setCandles(mapped);
    } catch {
      setCandles([]);
    }
  }, [chartPair, tf, range]);

  const refreshQuote = React.useCallback(async () => {
    setQuoteLoading(true);
    try {
      const resp = await api.get("/market/quote", { params: { pair: chartPair } });
      const price = Number(resp.data?.price);
      const t = Number(resp.data?.t);
      setQuotePrice(Number.isFinite(price) ? price : null);
      setQuoteAt(Number.isFinite(t) ? t : null);
    } catch {
      setQuotePrice(null);
      setQuoteAt(null);
    } finally {
      setQuoteLoading(false);
    }
  }, [chartPair]);

  React.useEffect(() => {
    if (!chartPair) return;
    refreshCandles();
    refreshQuote();
  }, [chartPair, tf, range, refreshCandles, refreshQuote]);

  React.useEffect(() => {
    const t = window.setInterval(() => {
      refreshQuote();
    }, 5000);
    return () => window.clearInterval(t);
  }, [refreshQuote]);

  const livePnl = React.useMemo(() => {
    if (!selectedTrade) return null;
    if (String(selectedTrade.result).toUpperCase() !== "OPEN") return null;
    const entry = selectedTrade.entryPrice != null ? Number(selectedTrade.entryPrice) : null;
    if (!Number.isFinite(entry as any)) return null;
    if (quotePrice == null || !Number.isFinite(quotePrice)) return null;
    const dir = String(selectedTrade.side).toUpperCase() === "BUY" ? 1 : -1;
    const perUnit = (quotePrice - Number(entry)) * dir;
    const size = selectedTrade.size != null && Number.isFinite(Number(selectedTrade.size)) ? Number(selectedTrade.size) : 1;
    return {
      current: quotePrice,
      entry: Number(entry),
      perUnit,
      total: perUnit * size,
      size,
    };
  }, [selectedTrade, quotePrice]);

  const totalPnl = React.useMemo(() => {
    const trades = stats?.trades || [];
    return trades.reduce((a, t) => a + (t.pnl || 0), 0);
  }, [stats]);

  const distribution = React.useMemo(() => {
    const trades = (stats?.trades || []).filter((t) => t.result !== "OPEN");
    let win = 0,
      loss = 0,
      be = 0;
    for (const t of trades) {
      if (t.result === "WIN") win++;
      else if (t.result === "LOSS") loss++;
      else if (t.result === "BREAKEVEN") be++;
    }
    return { win, loss, be, closed: trades.length };
  }, [stats]);

  const pnlSeries = React.useMemo(() => {
    const trades = (stats?.trades || []).slice().sort((a, b) => {
      const da = new Date(a.openedAt || a.createdAt || 0).getTime();
      const db = new Date(b.openedAt || b.createdAt || 0).getTime();
      return da - db;
    });

    const labels = trades.map((t) => {
      const d = new Date(t.openedAt || t.createdAt || Date.now());
      // compact label
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    });

    const data = trades.map((t) => t.pnl ?? 0);

    return { labels, data };
  }, [stats]);

  const pnlByPair = React.useMemo(() => {
    const byPair = stats?.byPair || {};
    const entries = Object.entries(byPair)
      .map(([k, v]) => ({ pair: k, pnl: v.pnl, count: v.count }))
      .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))
      .slice(0, 12); // top 12

    return {
      labels: entries.map((e) => e.pair),
      data: entries.map((e) => e.pnl),
    };
  }, [stats]);

  const lineData = React.useMemo(() => {
    return {
      labels: pnlSeries.labels,
      datasets: [
        {
          label: "PNL",
          data: pnlSeries.data,
          borderColor: ACCENT,
          backgroundColor: "rgba(0,191,99,0.15)",
          fill: true,
          tension: 0.25,
          pointRadius: 2,
        },
      ],
    };
  }, [pnlSeries]);

  const doughnutData = React.useMemo(() => {
    return {
      labels: ["Win", "Loss", "Breakeven"],
      datasets: [
        {
          data: [distribution.win, distribution.loss, distribution.be],
          backgroundColor: [
            "rgba(0, 191, 99, 0.85)",
            "rgba(220, 38, 38, 0.85)",
            "rgba(148, 163, 184, 0.85)",
          ],
          borderColor: [
            "rgba(0, 191, 99, 1)",
            "rgba(220, 38, 38, 1)",
            "rgba(148, 163, 184, 1)",
          ],
          hoverBackgroundColor: [
            "rgba(0, 191, 99, 1)",
            "rgba(220, 38, 38, 1)",
            "rgba(148, 163, 184, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [distribution]);

  const barData = React.useMemo(() => {
    return {
      labels: pnlByPair.labels,
      datasets: [
        {
          label: "PNL by pair",
          data: pnlByPair.data,
        },
      ],
    };
  }, [pnlByPair]);

  async function onCreateTrade() {
    setSaving(true);
    try {
      const body: any = {
        pair: pair.trim(),
        side,
        notes: notes.trim() || undefined,
      };

      const nEntry = entryPrice !== "" ? Number(entryPrice) : null;
      const nExit = exitPrice !== "" ? Number(exitPrice) : null;
      const nSl = slPrice !== "" ? Number(slPrice) : null;
      const nTp = tpPrice !== "" ? Number(tpPrice) : null;
      const nBal = accountBalance !== "" ? Number(accountBalance) : null;
      const nLev = leverage !== "" ? Number(leverage) : null;
      const nPnl = pnl !== "" ? Number(pnl) : null;
      const nSize = size !== "" ? Number(size) : null;

      if (Number.isFinite(nEntry as any)) body.entryPrice = nEntry;
      if (Number.isFinite(nExit as any)) body.exitPrice = nExit;
      if (Number.isFinite(nSl as any)) body.slPrice = nSl;
      if (Number.isFinite(nTp as any)) body.tpPrice = nTp;
      if (Number.isFinite(nBal as any)) body.accountBalance = nBal;
      if (Number.isFinite(nLev as any)) body.leverage = Math.trunc(nLev as any);
      if (Number.isFinite(nPnl as any)) body.pnl = nPnl;
      if (Number.isFinite(nSize as any)) body.size = nSize;

      // Manual date toggle:
      if (manualDate && openedAt) {
        // datetime-local => ISO string
        const d = new Date(openedAt);
        if (!isNaN(d.getTime())) body.openedAt = d.toISOString();
      }

      await api.post("/journal/trades", body);

      setOpen(false);
      resetForm();
      await load();
    } catch (e: any) {
      // keep modal open but show error toast-like message
      alert(e?.response?.data?.message || e?.message || "Failed to create trade");
    } finally {
      setSaving(false);
    }
  }

  return (
    <VStack align="stretch" spacing={4}>
      {/* TradingView-style chart */}
      <SpotlightCard>
        <Box>
          <HStack justify="space-between" wrap="wrap" gap={3} mb={3}>
            <Box>
              <Text fontWeight="900" fontSize="lg">
                Chart
              </Text>
              <Text fontSize="sm">
                Pick a pair and a trade to see entry/TP/SL on the chart.
              </Text>
            </Box>

          <HStack spacing={2} wrap="wrap">
            <FormControl>
              <FormLabel fontSize="xs" mb={1} >
                Pair
              </FormLabel>
              <Select value={chartPair} onChange={(e) => setChartPair(e.target.value)} size="sm">
                {pairOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="xs" mb={1} >
                Trade
              </FormLabel>
              <Select
                value={chartTradeId}
                onChange={(e) => setChartTradeId(e.target.value)}
                size="sm"
                placeholder="Latest"
              >
                {tradeOptions
                  .filter((t) => String(t.pair).toUpperCase() === String(chartPair).toUpperCase())
                  .slice(0, 50)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {String(t.side)} {String(t.result)} @ {t.entryPrice ?? "—"}
                    </option>
                  ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="xs" mb={1} >
                TF
              </FormLabel>
              <Select value={tf} onChange={(e) => setTf(e.target.value)} size="sm">
                <option value="1m">1m</option>
                <option value="5m">5m</option>
                <option value="15m">15m</option>
                <option value="30m">30m</option>
                <option value="1h">1h</option>
                <option value="1d">1d</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="xs" mb={1} >
                Range
              </FormLabel>
              <Select value={range} onChange={(e) => setRange(e.target.value)} size="sm">
                <option value="1d">1d</option>
                <option value="5d">5d</option>
                <option value="1mo">1mo</option>
                <option value="3mo">3mo</option>
                <option value="6mo">6mo</option>
              </Select>
            </FormControl>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refreshCandles();
                refreshQuote();
              }}
              leftIcon={<Icon as={RefreshCcw as any} />}
            >
              Refresh
            </Button>
          </HStack>
        </HStack>

        <HStack spacing={3} mb={3} wrap="wrap">
          <Badge borderRadius="full" px={3}>
            {quoteLoading ? "Quote: …" : quotePrice != null ? `Quote: ${fmt(quotePrice)}` : "Quote: —"}
          </Badge>
          <Badge borderRadius="full" px={3} variant="outline" >
            {quoteAt ? `Updated: ${new Date(Number(quoteAt) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Updated: —"}
          </Badge>
          {selectedTrade ? (
            <Badge
              borderRadius="full"
              px={3}
              colorScheme={String(selectedTrade.side).toUpperCase() === "BUY" ? "green" : "orange"}
            >
              {selectedTrade.side}
            </Badge>
          ) : null}
          {selectedTrade ? (
            <Badge borderRadius="full" px={3}>
              {selectedTrade.result}
            </Badge>
          ) : null}
          {livePnl ? (
            <Badge
              borderRadius="full"
              px={3}
              bg={livePnl.total >= 0 ? "green.400" : "red.400"}
              color="black"
            >
              Live PnL: {fmt(livePnl.total)}
            </Badge>
          ) : null}
          {livePnl ? (
            <HStack spacing={1}>
              <Icon as={(livePnl.total >= 0 ? ArrowUpRight : ArrowDownRight) as any} />
              <Text fontSize="sm" >
                {fmt(livePnl.current)} vs {fmt(livePnl.entry)}
              </Text>
            </HStack>
          ) : null}
        </HStack>

        <JournalCandleChart candles={candles} trade={selectedTrade} height={360} />
        </Box>
      </SpotlightCard>

      {/* Open trades */}
      <SpotlightCard>
        <Box>
          <HStack justify="space-between" wrap="wrap" gap={3} mb={3}>
            <Box>
              <Text fontWeight="900" fontSize="lg">Open trades</Text>
              <Text fontSize="sm">Quick edit TP/SL, or close a trade.</Text>
            </Box>
            <Badge borderRadius="full" px={3}>
              {openTrades.length} open
            </Badge>
          </HStack>
          <Divider mb={4} opacity={0.6} />

          {!openTrades.length ? (
            <Text >No open trades.</Text>
          ) : (
            <VStack align="stretch" spacing={3}>
              {openTrades.map((t) => {
                const edit = openEdits[t.id] || {};
                const pairLabel = String(t.pair || "").toUpperCase();
                const started = t.openedAt || t.createdAt;
                return (
                  <Box key={t.id} borderWidth="1px" borderColor={border} borderRadius="xl" p={4}>
                    <HStack justify="space-between" wrap="wrap" gap={3}>
                      <HStack spacing={3} wrap="wrap">
                        <Badge borderRadius="full" px={3}>
                          {pairLabel}
                        </Badge>
                        <Badge
                          borderRadius="full"
                          px={3}
                          colorScheme={String(t.side).toUpperCase() === "BUY" ? "green" : "orange"}
                        >
                          {t.side}
                        </Badge>
                        <Badge borderRadius="full" px={3} variant="outline">
                          Entry: {t.entryPrice ?? "—"}
                        </Badge>
                        <Badge borderRadius="full" px={3} variant="outline">
                          SL: {t.slPrice ?? "—"}
                        </Badge>
                        <Badge borderRadius="full" px={3} variant="outline">
                          TP: {t.tpPrice ?? "—"}
                        </Badge>
                        {started ? (
                          <Text fontSize="sm" >
                            {new Date(String(started)).toLocaleString()}
                          </Text>
                        ) : null}
                      </HStack>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 6 }} spacing={2} mt={3}>
                      <FormControl>
                        <FormLabel fontSize="xs" mb={1} >TP</FormLabel>
                        <Input
                          size="sm"
                          value={edit.tpPrice ?? ""}
                          placeholder={t.tpPrice != null ? String(t.tpPrice) : ""}
                          onChange={(e) =>
                            setOpenEdits((s) => ({ ...s, [t.id]: { ...edit, tpPrice: e.target.value } }))
                          }
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" mb={1} >SL</FormLabel>
                        <Input
                          size="sm"
                          value={edit.slPrice ?? ""}
                          placeholder={t.slPrice != null ? String(t.slPrice) : ""}
                          onChange={(e) =>
                            setOpenEdits((s) => ({ ...s, [t.id]: { ...edit, slPrice: e.target.value } }))
                          }
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" mb={1} >Exit</FormLabel>
                        <Input
                          size="sm"
                          value={edit.exitPrice ?? ""}
                          placeholder={t.exitPrice != null ? String(t.exitPrice) : ""}
                          onChange={(e) =>
                            setOpenEdits((s) => ({ ...s, [t.id]: { ...edit, exitPrice: e.target.value } }))
                          }
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" mb={1} >Result</FormLabel>
                        <Select
                          size="sm"
                          value={edit.result ?? ""}
                          placeholder="Select"
                          onChange={(e) =>
                            setOpenEdits((s) => ({ ...s, [t.id]: { ...edit, result: e.target.value } }))
                          }
                        >
                          <option value="WIN">WIN</option>
                          <option value="LOSS">LOSS</option>
                          <option value="BREAKEVEN">BREAKEVEN</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" mb={1} >PnL</FormLabel>
                        <Input
                          size="sm"
                          value={edit.pnl ?? ""}
                          placeholder={t.pnl != null ? String(t.pnl) : ""}
                          onChange={(e) =>
                            setOpenEdits((s) => ({ ...s, [t.id]: { ...edit, pnl: e.target.value } }))
                          }
                        />
                      </FormControl>

                      <VStack align="stretch" spacing={2}>
                        <Button
                          size="sm"
                          variant="solid"
                          bg={ACCENT}
                          color="black"
                          _hover={{ opacity: 0.9 }}
                          isLoading={!!openSaving[t.id]}
                          onClick={() => {
                            const patch: any = {};
                            if (edit.tpPrice !== undefined && edit.tpPrice !== "") patch.tpPrice = Number(edit.tpPrice);
                            if (edit.slPrice !== undefined && edit.slPrice !== "") patch.slPrice = Number(edit.slPrice);
                            patchOpenTrade(t.id, patch);
                          }}
                        >
                          Save TP/SL
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="red"
                          isLoading={!!openSaving[t.id]}
                          onClick={() => {
                            const patch: any = {
                              closedAt: new Date().toISOString(),
                            };
                            if (edit.exitPrice !== undefined && edit.exitPrice !== "") patch.exitPrice = Number(edit.exitPrice);
                            if (edit.result) patch.result = String(edit.result);
                            if (edit.pnl !== undefined && edit.pnl !== "") patch.pnl = Number(edit.pnl);
                            patchOpenTrade(t.id, patch);
                          }}
                        >
                          Close
                        </Button>
                      </VStack>
                    </SimpleGrid>
                  </Box>
                );
              })}
            </VStack>
          )}
        </Box>
      </SpotlightCard>

      {/* Header controls */}
      <SpotlightCard>
      <Box>
        <HStack justify="space-between" wrap="wrap" gap={3}>
          <Box>
            <Text fontWeight="800" fontSize="lg">
              Trade Journal
            </Text>
            <Text fontSize="sm">
              Track every trade. Review winners/losers. Level up your execution.
            </Text>
          </Box>

          <HStack spacing={2} wrap="wrap">
            <Button variant="outline" onClick={load}>
              Refresh
            </Button>
            <Button
              bg={ACCENT}
              color="black"
              _hover={{ opacity: 0.9 }}
              onClick={() => setOpen(true)}
            >
              + Add trade
            </Button>
          </HStack>
        </HStack>

        {error ? (
          <Text mt={3} color="red.400" fontSize="sm">
            {error}
          </Text>
        ) : null}
      </Box>
      </SpotlightCard>

      {/* Summary cards */}
      <SpotlightCard>
        <Box>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Box borderWidth="1px" borderColor={border} borderRadius="2xl" p={4}>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.12em">
                Total PnL
              </Text>
              <Text fontSize="2xl" fontWeight="900" mt={1}>
                {fmt(totalPnl)}
              </Text>
            </Box>

            <Box borderWidth="1px" borderColor={border} borderRadius="2xl" p={4}>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.12em">
                Win rate
              </Text>
              <Text fontSize="2xl" fontWeight="900" mt={1}>
                {totals ? `${fmt(totals.winRate)}%` : "—"}
              </Text>
              <HStack mt={2} spacing={2}>
                <Badge borderRadius="full" px={2}>
                  W: {totals?.wins ?? 0}
                </Badge>
                <Badge borderRadius="full" px={2}>
                  L: {totals?.losses ?? 0}
                </Badge>
              </HStack>
            </Box>

            <Box borderWidth="1px" borderColor={border} borderRadius="2xl" p={4}>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.12em">
                Profit factor
              </Text>
              <Text fontSize="2xl" fontWeight="900" mt={1}>
                {totals ? fmt(totals.profitFactor) : "—"}
              </Text>
              <Text fontSize="xs" mt={1}>
                (gross wins / gross losses)
              </Text>
            </Box>

            <Box borderWidth="1px" borderColor={border} borderRadius="2xl" p={4}>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.12em">
                Closed trades
              </Text>
              <Text fontSize="2xl" fontWeight="900" mt={1}>
                {totals ? totals.closedTrades : "—"}
              </Text>
              <Text fontSize="xs" mt={1}>
                Total: {totals?.totalTrades ?? 0}
              </Text>
            </Box>
          </SimpleGrid>
        </Box>
      </SpotlightCard>

      {/* Charts */}
      <SpotlightCard>
        <Box>
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
            <Box
              borderWidth="1px"
              borderColor={border}
              borderRadius="2xl"
              p={5}
              gridColumn={{ lg: "span 2" }}
            >
              <HStack justify="space-between" mb={3} wrap="wrap">
                <Text fontWeight="800">PNL over time</Text>
                {!loading && stats ? (
                  <Badge borderRadius="full" px={3} bg={ACCENT} color="black">
                    {stats.trades.length} trades
                  </Badge>
                ) : null}
              </HStack>
              <Divider mb={4} opacity={0.6} />
              {loading ? (
                <HStack>
                  <Spinner /> <Text >Loading chart…</Text>
                </HStack>
              ) : stats ? (
                <Line
                  data={lineData}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: true } },
                    scales: {
                      x: { ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
                    },
                  }}
                />
              ) : (
                <Text >No data yet.</Text>
              )}
            </Box>

            <Box borderWidth="1px" borderColor={border} borderRadius="2xl" p={5}>
              <Text fontWeight="800" mb={3}>
                Results
              </Text>
              <Divider mb={4} opacity={0.6} />
              {loading ? (
                <HStack>
                  <Spinner /> <Text >Loading…</Text>
                </HStack>
              ) : stats ? (
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
              ) : (
                <Text >No data yet.</Text>
              )}
            </Box>

            <Box
              borderWidth="1px"
              borderColor={border}
              borderRadius="2xl"
              p={5}
              gridColumn={{ lg: "span 3" }}
            >
              <Text fontWeight="800" mb={3}>
                PNL by pair
              </Text>
              <Divider mb={4} opacity={0.6} />
              {loading ? (
                <HStack>
                  <Spinner /> <Text >Loading…</Text>
                </HStack>
              ) : stats ? (
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                  }}
                />
              ) : (
                <Text >No data yet.</Text>
              )}
            </Box>
          </SimpleGrid>
        </Box>
      </SpotlightCard>

      {/* Add Trade Modal */}
      <Modal isOpen={open} onClose={() => !saving && setOpen(false)} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Add trade</ModalHeader>
          <ModalCloseButton disabled={saving} />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Box borderWidth="1px" borderColor={border} borderRadius="xl" p={3}>
                <HStack justify="space-between" wrap="wrap" gap={2}>
                  <Text fontSize="sm" >
                    Live quote: {quoteLoading ? "…" : quotePrice != null ? fmt(quotePrice) : "—"}
                  </Text>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEntryTouched(false);
                        setEntryPrice("");
                        autoFillEntryFromQuote(pair);
                      }}
                    >
                      Re-sync price
                    </Button>
                    <Button
                      size="sm"
                      bg={ACCENT}
                      color="black"
                      _hover={{ opacity: 0.9 }}
                      onClick={() => {
                        if (quotePrice == null) return;
                        setEntryTouched(true);
                        setEntryPrice(String(quotePrice));
                      }}
                      isDisabled={quotePrice == null}
                    >
                      Use quote as entry
                    </Button>
                  </HStack>
                </HStack>
              </Box>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <FormControl>
                  <FormLabel>Pair</FormLabel>
                  <Input
                    value={pair}
                    onChange={(e) => setPair(e.target.value)}
                    placeholder="EURUSD"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Side</FormLabel>
                  <Select value={side} onChange={(e) => setSide(e.target.value as any)}>
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Entry price (optional)</FormLabel>
                  <Input
                    value={entryPrice}
                    onChange={(e) => {
                      setEntryTouched(true);
                      setEntryPrice(e.target.value);
                    }}
                    placeholder="1.0950"
                  />
                  {autoEntryNote ? (
                    <Text fontSize="xs" mt={1}>
                      {autoEntryNote}
                    </Text>
                  ) : null}
                </FormControl>

                <FormControl>
                  <FormLabel>Exit price (optional)</FormLabel>
                  <Input
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                    placeholder="1.1000"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>SL (optional)</FormLabel>
                  <Input
                    value={slPrice}
                    onChange={(e) => setSlPrice(e.target.value)}
                    placeholder="Stop loss price"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>TP (optional)</FormLabel>
                  <Input
                    value={tpPrice}
                    onChange={(e) => setTpPrice(e.target.value)}
                    placeholder="Take profit price"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Account balance (optional)</FormLabel>
                  <Input
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(e.target.value)}
                    placeholder="1000"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Leverage (optional)</FormLabel>
                  <NumberInput value={leverage} onChange={(v) => setLeverage(v)} min={1} max={500}>
                    <NumberInputField placeholder="10" />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Position size / lots (optional)</FormLabel>
                  <Input value={size} onChange={(e) => setSize(e.target.value)} placeholder={"e.g. 0.10"} />
                  <Text fontSize="xs" mt={1}>
                    For FX pairs, this is interpreted as lots. For crypto/others, use base units.
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel>Risk % (lot calculator)</FormLabel>
                  <NumberInput value={riskPct} onChange={(v) => setRiskPct(v)} min={0.1} max={10} step={0.1}>
                    <NumberInputField placeholder="1" />
                  </NumberInput>
                  <HStack mt={2} spacing={2} wrap="wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (!lotCalc.ok) return;
                        if (lotCalc.lots != null) {
                          const v = lotCalc.lots;
                          if (Number.isFinite(v) && v > 0) setSize(String(Number(v.toFixed(3))));
                        } else {
                          const v = lotCalc.units;
                          if (Number.isFinite(v) && v > 0) setSize(String(Number(v.toFixed(6))));
                        }
                      }}
                      isDisabled={!lotCalc.ok}
                    >
                      Apply suggested size
                    </Button>
                    <Badge borderRadius="full" px={3}>
                      {lotCalc.ok
                        ? `Risk: ${fmt(lotCalc.riskUsd)} | Stop: ${fmt(lotCalc.stopDist)} | ${lotCalc.lots != null ? `Lots: ${fmt(lotCalc.lots)}` : `Units: ${fmt(lotCalc.units)}`}`
                        : lotCalc.reason}
                    </Badge>
                  </HStack>
                </FormControl>

                <FormControl>
                  <FormLabel>PNL (optional)</FormLabel>
                  <Input
                    value={pnl}
                    onChange={(e) => setPnl(e.target.value)}
                    placeholder="e.g. 25 or -12"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb="0">Manual date/time?</FormLabel>
                  <Switch
                    isChecked={manualDate}
                    onChange={(e) => {
                      setManualDate(e.target.checked);
                      if (e.target.checked) {
                        setAutoEntryNote("Pick a time to auto-fill entry price.");
                      } else {
                        // revert to live price if user hasn't typed
                        if (!entryTouched && (!entryPrice || entryPrice.trim() === "")) {
                          autoFillEntryFromQuote(pair);
                        }
                      }
                    }}
                  />
                </FormControl>

                {manualDate ? (
                  <FormControl gridColumn={{ base: "span 1", md: "span 2" }}>
                    <FormLabel>Opened at</FormLabel>
                    <Input
                      type="datetime-local"
                      value={openedAt}
                      onChange={(e) => {
                        setOpenedAt(e.target.value);
                        setEntryTouched(false);
                      }}
                      onBlur={() => {
                        if (!manualDate) return;
                        if (!openedAt) return;
                        if (!entryTouched && (!entryPrice || entryPrice.trim() === "")) {
                          autoFillEntryFromOpenedAt(pair, openedAt);
                        }
                      }}
                    />
                    <Text fontSize="xs" mt={1}>
                      If off, the system uses “now” (creation time).
                    </Text>
                  </FormControl>
                ) : null}

                <FormControl gridColumn={{ base: "span 1", md: "span 2" }}>
                  <FormLabel>Notes (optional)</FormLabel>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What was the setup? Did you follow rules?"
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={2}>
              <Button variant="outline" onClick={() => setOpen(false)} isDisabled={saving}>
                Cancel
              </Button>
              <Button
                bg={ACCENT}
                color="black"
                _hover={{ opacity: 0.9 }}
                onClick={onCreateTrade}
                isLoading={saving}
              >
                Save trade
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
