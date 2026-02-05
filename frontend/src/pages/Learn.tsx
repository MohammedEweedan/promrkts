/* eslint-disable react/style-prop-object */
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Spinner,
  Icon,
  SimpleGrid,
  Badge,
  IconButton,
  Input,
} from "@chakra-ui/react";
import { useAuth } from "../auth/AuthContext";
import { useTranslation } from "react-i18next";
import api, { getMyPurchases } from "../api/client";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle,
  GraduationCap,
  Star,
  Play,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useThemeMode } from "../themeProvider";
import ProgressWidget from "../components/ProgressWidget";
import Dock, { DockItemData } from "../components/Dock";
import TrackedVideo from "../components/TrackedVideo";
import TrackedPDFPro from "../components/TrackedPDFPro";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

type AiMessage = { id: string; from: "user" | "assistant"; text: string };

type ChatMessage = {
  id: string;
  userId?: string;
  userName?: string;
  text: string;
  createdAt?: string;
  self?: boolean;
};

const Learn: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // tier id
  const navigate = useNavigate();
  const { user } = useAuth() as any;
  const { t, i18n } = useTranslation() as any;
  const { mode } = useThemeMode(); // "light" | "dark"

  const primaryTextColor = mode === "dark" ? "gray.100" : "gray.800";
  const mutedTextColor = mode === "dark" ? "gray.400" : "gray.600";
  const cardBg = mode === "dark" ? "gray.900" : "white";
  const surfaceBg = mode === "dark" ? "gray.950" : "gray.50";

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [course, setCourse] = React.useState<any | null>(null);
  const [resources, setResources] = React.useState<any[]>([]);
  const [allowed, setAllowed] = React.useState(false);

  const [pdfBlobUrls, setPdfBlobUrls] = React.useState<Record<string, string>>(
    {}
  );

  // Cert / completion
  const [certDataUrl, setCertDataUrl] = React.useState<string>("");
  const [certOpen, setCertOpen] = React.useState(false);
  const [completing, setCompleting] = React.useState(false);

  // Player / episodes
  const [useCinematic] = React.useState(true);
  const [episodeIdx, setEpisodeIdx] = React.useState(0);
  const [showUpNext, setShowUpNext] = React.useState(false);
  const [autoplayNext, setAutoplayNext] = React.useState(true);
  const playerRef = React.useRef<HTMLVideoElement | null>(null);

  // Inline PDF overlay while video is playing
  const [showInlinePdf, setShowInlinePdf] = React.useState(false);
  const [activePdfIdx, setActivePdfIdx] = React.useState(0);

  // AI coach bubble over the video
  const [aiOpen, setAiOpen] = React.useState(false);
  const [aiMessages, setAiMessages] = React.useState<AiMessage[]>([]);
  const [aiInput, setAiInput] = React.useState("");
  const [aiLoading, setAiLoading] = React.useState(false);

  // Lazy loading for media
  const [loadedPDFs, setLoadedPDFs] = React.useState<Set<number>>(new Set());

  // Live chat
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = React.useState("");
  const [chatLoading, setChatLoading] = React.useState(false);
  const [onlineStudents, setOnlineStudents] = React.useState<any[]>([]);
  const [chatConnecting, setChatConnecting] = React.useState(false);

  // Logos & constants
  const tpLogo =
    mode === "dark" ? "/images/logos/TP-White.png" : "/images/logos/TP-Black.png";
  const TRUSTPILOT_URL = "https://www.trustpilot.com/review/promrkts";
  const stampLogo = "/logo.png";

  // Refs for dock navigation
  const episodesRef = React.useRef<HTMLDivElement | null>(null);
  const notesRef = React.useRef<HTMLDivElement | null>(null);
  const chartRef = React.useRef<HTMLDivElement | null>(null);
  const supportRef = React.useRef<HTMLDivElement | null>(null);

  const topCarouselRef = React.useRef<HTMLDivElement | null>(null);
  const materialsVideosRef = React.useRef<HTMLDivElement | null>(null);

  const isCompleted = Boolean(
    (course as any)?.completed || (course as any)?.status === "COMPLETED"
  );

  // --- Helpers / URL handling -------------------------------------------------

  // Derive backend origin (strip trailing /api)
  const BACKEND_ORIGIN = String((api.defaults as any).baseURL || "")
    .replace(/\/?api\/?$/, "")
    .replace(/\/+$/, "");
  const toAbsoluteUrl = (url: string) => {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;
    const path = url.startsWith("/") ? url : `/${url}`;
    const origin = BACKEND_ORIGIN || window.location.origin;
    return `${origin}${path}`;
  };

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const preventContext = (e: React.SyntheticEvent) => {
    e.preventDefault();
    return false;
  };

  const scrollTopCarousel = (dir: "left" | "right") => {
    const el = topCarouselRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const cardWidth = first ? first.offsetWidth + 16 : Math.floor(el.clientWidth * 0.8);
    el.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  // --- Load access + course ---------------------------------------------------

  React.useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        // Always load the tier first to know if it is free/public
        const courseResp = await api
          .get(`/courses/${id}`)
          .catch(async () => await api.get(`/subscriptions/${id}`));

        const tierData = courseResp.data;
        setCourse(tierData);

        const price = Number((tierData as any)?.price_usdt ?? 0);
        const isVip = !!(tierData as any)?.isVipProduct;
        const isBundle = !!(tierData as any)?.isBundle;
        const isFreePublic = !isVip && !isBundle && (!Number.isFinite(price) || price <= 0);

        if (isFreePublic) {
          // Free public tier: allow access for everyone and use the public resources endpoint
          setAllowed(true);
          const res = await api.get(`/resources/${id}`).catch(() => ({ data: [] }));
          const r = Array.isArray(res.data) ? res.data : [];
          setResources(r);
        } else {
          // Paid / VIP / bundle: preserve purchase-based gating
          const list = await getMyPurchases({ ttlMs: 10 * 60 * 1000 });
          const arr: any[] = Array.isArray(list) ? list : [];
          const ok = arr.some((p) => p?.tierId === id && p?.status === "CONFIRMED");
          setAllowed(ok);
          if (!ok) {
            setError(t("learn.errors.access_denied"));
          } else {
            const r = Array.isArray(tierData?.resources) ? tierData.resources : [];
            setResources(r);
          }
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || t("learn.errors.load_failed"));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, t]);

  // --- Preload PDFs as blobs --------------------------------------------------

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const list = Array.isArray(resources) ? resources : [];
      const pdfs = list.filter(
        (r: any) => (r.type || "").toLowerCase() === "pdf" && r.url
      );
      const entries = await Promise.all(
        pdfs.map(async (r: any) => {
          try {
            const abs = toAbsoluteUrl(String(r.url));
            const resp = await api.get(abs, { responseType: "blob" });
            const blobUrl = URL.createObjectURL(resp.data);
            return [String(r.url), blobUrl] as const;
          } catch {
            return [String(r.url), ""] as const;
          }
        })
      );
      if (!cancelled) {
        setPdfBlobUrls((prev) => {
          Object.values(prev).forEach((u) => {
            try {
              URL.revokeObjectURL(u);
            } catch {}
          });
          return Object.fromEntries(entries);
        });
      } else {
        entries.forEach(([, u]) => {
          if (u) {
            try {
              URL.revokeObjectURL(u);
            } catch {}
          }
        });
      }
    };
    load();
    return () => {
      cancelled = true;
      setPdfBlobUrls((prev) => {
        Object.values(prev).forEach((u) => {
          try {
            URL.revokeObjectURL(u);
          } catch {}
        });
        return {};
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources]);

  // --- Certificate generation -------------------------------------------------

  type CertCopy = {
    heading: string;
    subheading: string;
    statement: (student: string, course: string) => string;
    footer: string;
    labelName: string;
    labelCourse: string;
    labelDate: string;
    shareTitle: string;
    shareText: (student: string, course: string) => string;
  };

  function getCertCopy(lang: string): CertCopy {
    const L = lang.toLowerCase();
    if (L.startsWith("ar")) {
      return {
        heading: "شهادة إنجاز",
        subheading: "تُمنح هذه الشهادة إلى",
        statement: (student, course) =>
          `تقديرًا لإكماله/ا بنجاح كورس: ${course}`,
        footer: "نؤكد أن هذه الشهادة صادرة بعد استيفاء متطلبات الكورس.",
        labelName: "الاسم",
        labelCourse: "الكورس",
        labelDate: "التاريخ",
        shareTitle: "شهادة إنجاز",
        shareText: (student, course) =>
          `حصل/ت ${student} على شهادة إنجاز في ${course}`,
      };
    }
    if (L.startsWith("fr")) {
      return {
        heading: "Certificat d'Accomplissement",
        subheading: "Ce certificat est décerné à",
        statement: (student, course) =>
          `en reconnaissance de la réussite du cours : ${course}`,
        footer:
          "Nous certifions que ce document est délivré après l'accomplissement du cours.",
        labelName: "Nom",
        labelCourse: "Cours",
        labelDate: "Date",
        shareTitle: "Certificat d'Accomplissement",
        shareText: (student, course) =>
          `${student} a obtenu un certificat pour ${course}`,
      };
    }
    // EN default
    return {
      heading: "Certificate of Achievement",
      subheading: "This certificate is awarded to",
      statement: (student, course) =>
        `in recognition of successfully completing: ${course}`,
      footer:
        "We certify this document is issued upon satisfying course requirements.",
      labelName: "Name",
      labelCourse: "Course",
      labelDate: "Date",
      shareTitle: "Certificate of Achievement",
      shareText: (student, course) =>
        `${student} earned a certificate for ${course}`,
    };
  }

  const QR_SIZE = 160;
  const QR_PAD = 120;
  const STAMP_W = 320;
  const STAMP_H = 140;
  const STAMP_PAD_X = 160;
  const STAMP_PAD_Y = 180;

  async function drawCertificate({
    studentName,
    courseName,
    lang,
    themeMode,
    logoUrl,
    tpLogoUrl,
    accent = "#65a8bf",
    purchaseDate,
    completionDate,
    trustpilotUrl,
    embedQr = false,
  }: {
    studentName: string;
    courseName: string;
    lang: string;
    themeMode: "light" | "dark";
    logoUrl: string;
    tpLogoUrl: string;
    accent?: string;
    purchaseDate?: Date;
    completionDate?: Date;
    trustpilotUrl?: string;
    embedQr?: boolean;
  }): Promise<HTMLCanvasElement> {
    const W = 1920,
      H = 1358;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    const bg0 = themeMode === "dark" ? "#0b1220" : "#ffffff";
    const bg1 = themeMode === "dark" ? "#101a2f" : "#faf7f2";
    const ink = themeMode === "dark" ? "#f5f6fa" : "#111827";
    const subtle =
      themeMode === "dark"
        ? "rgba(255,255,255,0.12)"
        : "rgba(0,0,0,0.06)";
    const isRTL = lang.toLowerCase().startsWith("ar");
    const copy = getCertCopy(lang);

    const centerText = (
      text: string,
      y: number,
      size: number,
      weight = "600"
    ) => {
      ctx.save();
      ctx.fillStyle = ink;
      ctx.font = `${weight} ${size}px "Inter", system-ui, -apple-system, "Segoe UI", Arial`;
      ctx.textAlign = "center";
      ctx.direction = (isRTL ? "rtl" : "ltr") as CanvasDirection;
      ctx.fillText(text, W / 2, y);
      ctx.restore();
    };
    const formatD = (d?: Date) => {
      try {
        return (d || new Date()).toLocaleDateString();
      } catch {
        return "";
      }
    };

    // Background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, bg0);
    grad.addColorStop(1, bg1);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle dots
    ctx.save();
    ctx.globalAlpha = themeMode === "dark" ? 0.06 : 0.05;
    ctx.fillStyle = themeMode === "dark" ? "#65a8bf" : "#3a2f22";
    const step = 32;
    for (let y = 80; y < H; y += step) {
      for (let x = 80; x < W; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Borders
    ctx.strokeStyle = accent;
    ctx.lineWidth = 12;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    ctx.strokeStyle = subtle;
    ctx.lineWidth = 6;
    ctx.strokeRect(80, 80, W - 160, H - 160);

    // Title / name / statement
    centerText(copy.heading, 260, 76, "800");
    centerText(copy.subheading, 340, 38, "500");
    centerText(studentName, 440, 72, "800");

    const statementFull = copy.statement(studentName, courseName);
    const sLine = statementFull
      .replace(courseName, "")
      .replace(/\s+([:：،,.])$/, "$1")
      .trim();
    centerText(sLine, 520, 34, "500");

    ctx.save();
    ctx.fillStyle = accent;
    ctx.font = `800 44px "Inter", system-ui, Arial`;
    ctx.textAlign = "center";
    ctx.direction = (isRTL ? "rtl" : "ltr") as CanvasDirection;
    ctx.fillText(courseName, W / 2, 570);
    ctx.restore();

    // Divider
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(220, H * 0.52);
    ctx.lineTo(W - 220, H * 0.52);
    ctx.stroke();

    // Dates row
    const rowY = 650;
    const cols = 2;
    const colW = 520;
    const totalW = colW * cols;
    const startX = (W - totalW) / 2;

    const courseStart = isRTL
      ? "تاريخ البدء"
      : lang.startsWith("fr")
      ? "Date de début"
      : "Start Date";
    const courseDone = isRTL
      ? "تاريخ الإكمال"
      : lang.startsWith("fr")
      ? "Date d’achèvement"
      : "Completion Date";

    const drawCell = (
      label: string,
      value: string,
      colIndex: number
    ) => {
      const x =
        startX +
        (isRTL
          ? totalW - (colIndex + 1) * colW + colW / 2
          : colIndex * colW + colW / 2);
      ctx.save();
      ctx.fillStyle =
        themeMode === "dark"
          ? "rgba(255,255,255,0.75)"
          : "rgba(0,0,0,0.65)";
      ctx.font = `600 26px "Inter", system-ui, Arial`;
      ctx.textAlign = "center";
      ctx.direction = (isRTL ? "rtl" : "ltr") as CanvasDirection;
      ctx.fillText(label, x, rowY);
      ctx.fillStyle = ink;
      ctx.font = `700 34px "Inter", system-ui, Arial`;
      ctx.fillText(value, x, rowY + 46);
      ctx.restore();
    };

    drawCell(courseStart, formatD(purchaseDate), 0);
    drawCell(courseDone, formatD(completionDate), 1);

    const getCommitmentMsg = (lng: string) => {
      const L = (lng || "en").toLowerCase();
      if (L.startsWith("ar")) {
        return "شكرًا لثقتكم وجهودكم. نؤكد التزامنا بدعم تعلمكم المستمر وخطواتكم نحو تحقيق الحرية المالية.";
      }
      if (L.startsWith("fr")) {
        return "Merci pour votre confiance et vos efforts. Nous restons engagés à soutenir votre apprentissage continu vers l’atteinte de la liberté financière.";
      }
      return "Thank you for your trust and effort. We’re committed to supporting your continued learning on the path to financial freedom.";
    };

    const drawCenteredParagraph = ({
      text,
      y,
      maxWidth = 1280,
      lineHeight = 36,
      font = `500 24px "Inter", system-ui, Arial`,
      color = "#65a8bf",
    }: {
      text: string;
      y: number;
      maxWidth?: number;
      lineHeight?: number;
      font?: string;
      color?: string;
    }) => {
      ctx.save();
      ctx.font = font;
      ctx.fillStyle = color!;
      ctx.textAlign = "center";
      ctx.direction = (isRTL ? "rtl" : "ltr") as CanvasDirection;

      const words = text.split(/\s+/);
      const lines: string[] = [];
      let current = "";

      const measure = (s: string) => ctx.measureText(s).width;

      words.forEach((w, i) => {
        const test = current ? `${current} ${w}` : w;
        if (measure(test) <= maxWidth) {
          current = test;
        } else {
          if (current) lines.push(current);
          current = w;
        }
        if (i === words.length - 1 && current) lines.push(current);
      });

      lines.forEach((ln, idx) => {
        ctx.fillText(ln, W / 2, y + idx * lineHeight);
      });
      ctx.restore();
    };

    drawCenteredParagraph({
      text: getCommitmentMsg(lang),
      y: rowY + 120,
      maxWidth: 1280,
      lineHeight: 38,
      font: `500 46px "Inter", system-ui, Arial`,
      color: "#65a8bf",
    });

    // Footer
    ctx.save();
    ctx.fillStyle =
      themeMode === "dark"
        ? "rgba(255,255,255,0.85)"
        : "rgba(0,0,0,0.85)";
    ctx.font = `500 26px "Inter", system-ui, Arial`;
    ctx.textAlign = "center";
    ctx.direction = (isRTL ? "rtl" : "ltr") as CanvasDirection;
    ctx.fillText(copy.footer, W / 2, H - 260);
    ctx.restore();

    // Brand stamp
    const stampX = isRTL ? STAMP_PAD_X : W - (STAMP_W + STAMP_PAD_X);
    const stampY = H - (STAMP_H + STAMP_PAD_Y);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = logoUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });
      ctx.save();
      ctx.shadowColor =
        themeMode === "dark"
          ? "rgba(0,0,0,0.45)"
          : "rgba(0,0,0,0.15)";
      ctx.shadowBlur = 8;
      ctx.drawImage(img, stampX, stampY, STAMP_W, STAMP_H);
      ctx.restore();
    } catch {}

    // Trustpilot CTA
    const tpX = isRTL ? W - (280 + 140) : 140;
    const tpY = H - 380;

    try {
      const tp = new Image();
      tp.crossOrigin = "anonymous";
      tp.src = tpLogoUrl;
      await new Promise((res, rej) => {
        tp.onload = res;
        tp.onerror = rej;
      });
      ctx.drawImage(tp, tpX, tpY, 180, 44);

      ctx.save();
      ctx.fillStyle = ink;
      ctx.font = `700 28px "Inter", system-ui, Arial`;
      ctx.textAlign = isRTL ? "right" : "left";
      ctx.direction = (isRTL ? "rtl" : "ltr") as CanvasDirection;
      const cta = isRTL
        ? "اترك لنا تقييمًا"
        : lang.startsWith("fr")
        ? "Laissez-nous un avis"
        : "Leave us a review";
      if (isRTL) ctx.fillText(cta, tpX + 280, tpY + 84);
      else ctx.fillText(cta, tpX, tpY + 84);
      ctx.restore();
    } catch {}

    // QR
    if (embedQr && trustpilotUrl) {
      const enc = encodeURIComponent(trustpilotUrl);
      const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&margin=0&data=${enc}`;
      try {
        const qr = new Image();
        qr.crossOrigin = "anonymous";
        qr.src = qrSrc;
        await new Promise((res, rej) => {
          qr.onload = res;
          qr.onerror = rej;
        });

        const qrX = isRTL ? W - (QR_SIZE + QR_PAD) : QR_PAD;
        const qrY = QR_PAD;

        ctx.save();
        ctx.strokeStyle = subtle;
        ctx.lineWidth = 2;
        ctx.strokeRect(qrX - 6, qrY - 6, QR_SIZE + 12, QR_SIZE + 12);
        ctx.drawImage(qr, qrX, qrY, QR_SIZE, QR_SIZE);
        ctx.restore();
      } catch {}
    }

    return canvas;
  }

  const purchaseAt = (course as any)?.purchasedAt
    ? new Date((course as any).purchasedAt)
    : (course as any)?.createdAt
    ? new Date((course as any).createdAt)
    : undefined;

  const completedAt = (course as any)?.completedAt
    ? new Date((course as any).completedAt)
    : (course as any)?.completed
    ? new Date()
    : undefined;

  async function handleGenerateCertificate() {
    const studentName =
      user?.fullName || user?.name || user?.email || "Student";
    const courseName =
      (course as any)?.name || t("learn.course_fallback");
    const canvas = await drawCertificate({
      studentName,
      courseName,
      lang: i18n.language || "en",
      themeMode: mode === "dark" ? "dark" : "light",
      logoUrl: stampLogo,
      tpLogoUrl: tpLogo,
      purchaseDate: purchaseAt,
      completionDate: completedAt,
      trustpilotUrl: TRUSTPILOT_URL,
      embedQr: true,
    } as any);

    try {
      const dataUrl = canvas.toDataURL("image/png");
      setCertDataUrl(dataUrl);
    } catch (err) {
      console.error(
        "Certificate export failed (likely CORS/tainted canvas):",
        err
      );
      setCertDataUrl("");
    }
    setCertOpen(true);
  }

  async function handleShare() {
    try {
      if (!navigator.canShare || !navigator.share)
        throw new Error("share unsupported");
      const res = await fetch(certDataUrl);
      const blob = await res.blob();
      const file = new File([blob], "certificate.png", {
        type: "image/png",
      });

      const copy = getCertCopy(i18n.language || "en");
      await navigator.share({
        title: copy.shareTitle,
        text: copy.shareText(
          user?.fullName || user?.name || user?.email || "Student",
          (course as any)?.name || t("learn.course_fallback")
        ),
        files: [file],
      });
    } catch {
      const win = window.open();
      if (win) {
        win.document.write(
          `<img src="${certDataUrl}" style="max-width:100%"/>`
        );
        win.document.close();
      }
    }
  }

  function handleDownload() {
    const a = document.createElement("a");
    a.href = certDataUrl;
    a.download = "certificate.png";
    a.click();
  }

  // --- Completion -------------------------------------------------------------

  async function handleMarkCompleted() {
    if (!id) return;
    try {
      setCompleting(true);
      await api.post(`/courses/${id}/complete`);
      try {
        await api.post(`/progress/lesson/${id}`);
      } catch (progressError) {
        console.error("Failed to track progress:", progressError);
      }

      setCourse((prev: any) => ({
        ...(prev || {}),
        completed: true,
        status: "COMPLETED",
      }));
      alert(
        t("learn.completion.marked") ||
          "Course marked as completed"
      );
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        t("learn.errors.complete_failed") ||
        "Failed to mark as completed";
      alert(msg);
    } finally {
      setCompleting(false);
    }
  }

  // --- AI coach ---------------------------------------------------------------

  async function handleAskAi(kind: "explain" | "quiz") {
    const tier = course || {};
    const list = Array.isArray(resources) ? resources : [];
    const videos = list.filter(
      (r: any) => (r.type || "").toLowerCase() === "video" && r.url
    );
    const currentEpisode = videos[episodeIdx];
    const label =
      (currentEpisode && (currentEpisode.title || currentEpisode.name)) ||
      String(currentEpisode?.url || tier.name || "Lesson");

    let prompt: string;
    if (kind === "explain") {
      prompt = `Explain the current concept from "${label}" in simple language and connect it to trading examples.`;
    } else {
      prompt = `Create a very short quiz (3 questions max) to test my understanding of "${label}". Include answers at the end.`;
    }

    if (aiInput.trim()) {
      prompt += `\n\nLearner note: ${aiInput.trim()}`;
    }

    const msgId = `${Date.now()}-${kind}`;
    setAiMessages((prev) => [
      ...prev,
      { id: msgId, from: "user", text: prompt },
    ]);
    setAiLoading(true);

    try {
      const resp = await api.post("/ai/coach", {
        prompt,
        courseId: tier.id,
        resourceId: currentEpisode?.id,
        lang: i18n.language || "en",
      });

      const reply =
        resp?.data?.reply ||
        resp?.data?.answer ||
        (typeof resp?.data === "string"
          ? resp.data
          : JSON.stringify(resp.data));

      setAiMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          from: "assistant",
          text: reply || "…",
        },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          from: "assistant",
          text:
            t("learn.ai.error") ||
            "Sorry, something went wrong while asking the AI coach.",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  }

  // --- Live chat --------------------------------------------------------------

  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      try {
        setChatConnecting(true);
        const [msgsRes, onlineRes] = await Promise.all([
          api.get(`/courses/${id}/chat`).catch(() => ({ data: [] })),
          api.get(`/courses/${id}/online`).catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;

        const msgs = Array.isArray(msgsRes.data)
          ? msgsRes.data
          : [];
        const online = Array.isArray(onlineRes.data)
          ? onlineRes.data
          : [];

        setChatMessages(msgs);
        setOnlineStudents(online);
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to load chat", e);
        }
      } finally {
        if (!cancelled) setChatConnecting(false);
      }
    };

    load();
    const interval = window.setInterval(load, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [id]);

  async function handleSendChat() {
    if (!id || !chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput("");
    setChatLoading(true);

    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      id: tempId,
      userId: user?.id,
      userName:
        user?.fullName || user?.name || user?.email || "You",
      text,
      createdAt: new Date().toISOString(),
      self: true,
    };

    setChatMessages((prev) => [...prev, tempMsg]);

    try {
      const resp = await api.post(`/courses/${id}/chat`, { text });
      if (resp?.data) {
        setChatMessages((prev) =>
          prev.map((m) => (m.id === tempId ? resp.data : m))
        );
      }
    } catch (e) {
      console.error("Failed to send chat", e);
      // remove temp message on failure
      setChatMessages((prev) =>
        prev.filter((m) => m.id !== tempId)
      );
    } finally {
      setChatLoading(false);
    }
  }

  // --- Early returns for loading / access ------------------------------------

  if (loading) {
    return (
      <Box
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={3}
      >
        <Spinner />
        <Text>{t("learn.loading")}</Text>
      </Box>
    );
  }

  if (!allowed) {
    return (
      <Container maxW="5xl" py={10}>
        <VStack gap={4} align="center" textAlign="center">
          <Heading size="md">
            {t("learn.access.title")}
          </Heading>
          <Text color={primaryTextColor}>
            {error || t("learn.access.denied_fallback")}
          </Text>
          <Button
            onClick={() => navigate("/enrolled")}
            variant="solid"
            bg="#65a8bf"
            color="black"
            _hover={{ opacity: 0.9 }}
          >
            {t("learn.access.back_to_my_courses")}
          </Button>
        </VStack>
      </Container>
    );
  }

  // --- Derived data -----------------------------------------------------------

  const tier = course || {};
  const list = Array.isArray(resources) ? resources : [];
  const pdfs = list.filter(
    (r: any) => (r.type || "").toLowerCase() === "pdf" && r.url
  );
  const videos = list.filter(
    (r: any) => (r.type || "").toLowerCase() === "video" && r.url
  );

  // language-specific PDFs
  const lang = String(i18n?.language || "en").toLowerCase();
  const langCode = lang.startsWith("fr")
    ? "FR"
    : lang.startsWith("ar")
    ? "AR"
    : "EN";
  const pdfsForRender = pdfs.filter((doc: any) => {
    try {
      const name = String(doc.url).split("/").pop() || "";
      const baseName = name.replace(/\.[^.]+$/, ""); // Remove file extension
      return baseName.toUpperCase().endsWith(`_${langCode}`);
    } catch {
      return false;
    }
  });

  const prettyDocName = (url: string) => {
    const raw = String(url).split("?")[0].split("#")[0].split("/").pop() || "Document";
    // Remove extension
    let name = raw.replace(/\.[^.]+$/, "");

    // Remove leading lang tag: EN_, AR_, FR_ (also EN-, EN )
    name = name.replace(/^(EN|AR|FR)[\s._-]+/i, "");

    // Remove trailing lang tag: _EN, -EN, .EN, (EN), [EN], " EN"
    name = name.replace(/([\s._-]+(EN|AR|FR)$)|(\((EN|AR|FR)\)$)|(\[(EN|AR|FR)\]$)/i, "");

    // Also handle double separators like "Title__EN" or "Title--EN"
    name = name.replace(/[\s._-]+$/g, "");

    // Make it prettier if you want:
    name = name.replace(/_/g, " ").replace(/\s+/g, " ").trim();

    return name || "Document";
  };

  // Dock items
  const dockItems: DockItemData[] = [
    {
      icon: <Play size={22} />,
      label: t("learn.dock.episodes") || "Episodes",
      onClick: () => scrollTo(episodesRef),
    },
    {
      icon: <FileText size={20} />,
      label: t("learn.dock.documents") || "Notes",
      onClick: () => scrollTo(notesRef),
    },
    {
      icon: <TrendingUp size={20} />,
      label: t("learn.dock.chart") || "Live Chart",
      onClick: () => scrollTo(chartRef),
    },
    {
      icon: <CheckCircle size={20} />,
      label: t("learn.dock.support") || "Support",
      onClick: () => scrollTo(supportRef),
    },
  ];

  // --- JSX --------------------------------------------------------------------

  return (
    <>
      <Box
        minH="100vh"
        pb={16}
      >
        <Container maxW="6xl" pt={8} pb={12}>
          <VStack align="stretch" spacing={8}>
            {/* HERO: Netflix-style title band */}
            <Box
              textAlign="center"
            >
              <VStack spacing={3}>
                <Heading
                  size="2xl"
                  lineHeight="short"
                  maxW="3xl"
                  mx="auto"
                >
                  {tier.name || t("learn.course_fallback")}
                </Heading>

                <HStack spacing={3} mt={3} justify="center">
                  {tier.level && (
                    <Badge
                      variant="subtle"
                      colorScheme="cyan"
                      borderRadius="full"
                      px={3}
                    >
                      {tier.level}
                    </Badge>
                  )}
                  {videos.length > 0 && (
                    <Badge
                      variant="outline"
                      borderRadius="full"
                      px={3}
                    >
                      {t("learn.meta.episodes", {
                        defaultValue: "{{n}} episodes",
                        n: videos.length,
                      })}
                    </Badge>
                  )}
                  {pdfsForRender.length > 0 && (
                    <Badge
                      variant="outline"
                      borderRadius="full"
                      px={3}
                    >
                      {t("learn.meta.notes", {
                        defaultValue: "{{n}} notes",
                        n: pdfsForRender.length,
                      })}
                    </Badge>
                  )}
                </HStack>

                {/* Single primary CTA */}
                {!isCompleted ? (
                  <Button
                    mt={4}
                    size="lg"
                    px={8}
                    bg="#65a8bf"
                    color="black"
                    _hover={{ opacity: 0.9 }}
                    leftIcon={<CheckCircle size={18} />}
                    onClick={handleMarkCompleted}
                    isDisabled={completing}
                  >
                    {t("learn.actions.mark_completed") ||
                      "I've completed this course"}
                  </Button>
                ) : (
                  <VStack spacing={1} mt={4}>
                    <Button
                      size="lg"
                      px={8}
                      bg="green.500"
                      color="#65a8bf"
                      _hover={{ bg: "green.600" }}
                      leftIcon={<GraduationCap size={18} />}
                      onClick={handleGenerateCertificate}
                    >
                      {t("learn.certificate.get") ||
                        "Get Certificate"}
                    </Button>
                  </VStack>
                )}
              </VStack>
            </Box>

            {/* MAIN: cinematic player + sidebar */}
            {videos.length > 0 && useCinematic && (
              <SimpleGrid
                columns={{ base: 1, lg: 3 }}
                spacing={6}
                alignItems="flex-start"
              >
                {/* LEFT: player + episodes */}
                <Box
                  ref={episodesRef}
                  gridColumn={{ base: 1, lg: "span 2" }}
                  borderRadius="2xl"
                  overflow="hidden"
                  bg="black"
                  borderWidth={1}
                  
                  boxShadow="0 32px 100px rgba(0,0,0,1)"
                >
                  <Box position="relative">
                    {/* top-right floating controls */}
                    <HStack
                      position="absolute"
                      top={3}
                      right={3}
                      zIndex={5}
                      spacing={2}
                    >
                      {pdfsForRender.length > 0 && (
                        <Button
                          size="xs"
                          variant="solid"
                          leftIcon={<FileText size={14} />}
                          bg="blackAlpha.700"
                          color="#65a8bf"
                          _hover={{
                            bg: "blackAlpha.900",
                            transform: "translateY(-1px)",
                          }}
                          onClick={() => {
                            setShowInlinePdf((s) => !s);
                            setActivePdfIdx(0);
                          }}
                        >
                          {showInlinePdf
                            ? t("learn.inline_pdf.hide") ||
                              "Hide notes"
                            : t("learn.inline_pdf.show") || "Notes"}
                        </Button>
                      )}

                      <IconButton
                        aria-label="AI coach"
                        icon={<Sparkles size={16} />}
                        size="sm"
                        variant="solid"
                        bg="blackAlpha.800"
                        color="#65a8bf"
                        _hover={{
                          bg: "blackAlpha.900",
                          transform: "translateY(-1px)",
                        }}
                        onClick={() => {
                          setAiOpen((o) => !o);
                          if (!aiOpen && aiMessages.length === 0) {
                            setAiMessages([
                              {
                                id: "intro",
                                from: "assistant",
                                text:
                                  t("learn.ai.intro") ||
                                  "Hi! I’m your trading coach. Ask me to explain what you’re watching, or hit “Quiz me” to test yourself.",
                              },
                            ]);
                          }
                        }}
                      />
                    </HStack>

                    {/* Main cinematic player */}
                    <TrackedVideo
                      resourceId={
                        videos[episodeIdx]?.id ||
                        `video-${episodeIdx}-${tier.id}`
                      }
                      src={toAbsoluteUrl(
                        String(videos[episodeIdx]?.url || "")
                      )}
                      tierId={tier.id}
                      controls
                      playsInline
                      disablePictureInPicture
                      controlsList="nodownload"
                      style={{
                        width: "100%",
                        height: "auto",
                        aspectRatio: "16/9" as any,
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                      onEnded={() => {
                        if (autoplayNext) {
                          setShowUpNext(true);
                          setTimeout(() => {
                            setEpisodeIdx((i) =>
                              i + 1 < videos.length ? i + 1 : 0
                            );
                            setShowUpNext(false);
                            try {
                              playerRef.current?.play?.();
                            } catch {}
                          }, 5000);
                        } else {
                          setShowUpNext(true);
                        }
                      }}
                      videoRefExternal={playerRef}
                    />

                    {/* Inline PDF overlay – slides in from right */}
                    {showInlinePdf && pdfsForRender.length > 0 && (
                      <Box
                        position="absolute"
                        top={0}
                        right={0}
                        height="100%"
                        width={{ base: "100%", md: "36%" }}
                        bg="blackAlpha.900"
                        borderLeftWidth={{ base: 0, md: 1 }}
                        
                        zIndex={4}
                        display="flex"
                        flexDirection="column"
                      >
                        <HStack
                          justify="space-between"
                          align="center"
                          px={3}
                          py={2}
                          borderBottomWidth={1}
                          
                        >
                          <Text
                            fontSize="xs"
                            fontWeight="600"
                            textTransform="uppercase"
                          >
                            {t("learn.inline_pdf.title") ||
                              "Lesson notes"}
                          </Text>
                          <HStack spacing={2}>
                            {pdfsForRender.length > 1 && (
                              <HStack spacing={1}>
                                {pdfsForRender.map(
                                  (doc, idx) => (
                                    <Button
                                      key={idx}
                                      size="xs"
                                      variant={
                                        idx === activePdfIdx
                                          ? "solid"
                                          : "ghost"
                                      }
                                      bg={
                                        idx === activePdfIdx
                                          ? "#65a8bf"
                                          : "transparent"
                                      }
                                      color={
                                        idx === activePdfIdx
                                          ? "black"
                                          : "whiteAlpha.800"
                                      }
                                      _hover={{
                                        opacity: 0.9,
                                      }}
                                      onClick={() =>
                                        setActivePdfIdx(
                                          idx
                                        )
                                      }
                                    >
                                      {idx + 1}
                                    </Button>
                                  )
                                )}
                              </HStack>
                            )}
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() =>
                                setShowInlinePdf(false)
                              }
                            >
                              {t("common.close") ||
                                "Close"}
                            </Button>
                          </HStack>
                        </HStack>

                        <Box flex="1" overflow="hidden">
                          {(() => {
                            const doc =
                              pdfsForRender[activePdfIdx];
                            const blob =
                              pdfBlobUrls[String(doc.url)];
                            const src = blob
                              ? `${blob}#toolbar=0&navpanes=0`
                              : `${toAbsoluteUrl(
                                  String(doc.url)
                                )}#toolbar=0&navpanes=0`;
                            const resourceId =
                              doc.id ||
                              `pdf-inline-${activePdfIdx}-${tier.id}`;

                            return (
                              <TrackedPDFPro
                                resourceId={resourceId}
                                src={src}
                                tierId={tier.id}
                                style={{ width: "100%", height: "100%" }}
                                watermark={
                                  <>
                                    <Box
                                      position="absolute"
                                      inset={0}
                                      pointerEvents="none"
                                      zIndex={1}
                                    />
                                    <Watermark
                                      text={
                                        user?.email ||
                                        user?.id
                                          ? t(
                                              "learn.watermark.user",
                                              {
                                                user:
                                                  user?.email ||
                                                  user?.id,
                                              }
                                            )
                                          : undefined
                                      }
                                    />
                                  </>
                                }
                              />
                            );
                          })()}
                        </Box>
                      </Box>
                    )}

                    {/* AI coach bubble */}
                    {aiOpen && (
                      <Box
                        position="absolute"
                        bottom={{ base: 2, md: 3 }}
                        right={{ base: 2, md: 3 }}
                        width={{
                          base: "90%",
                          md: "380px",
                        }}
                        bg={cardBg}
                        borderRadius="xl"
                        borderWidth={1}
                        
                        boxShadow="0 20px 50px rgba(0,0,0,0.9)"
                        zIndex={6}
                      >
                        <VStack
                          align="stretch"
                          spacing={2}
                          p={3}
                        >
                          <HStack
                            justify="space-between"
                            align="center"
                          >
                            <HStack spacing={2}>
                              <Sparkles
                                size={16}
                                color="#65a8bf"
                              />
                              <Text
                                fontSize="sm"
                                fontWeight="700"
                              >
                                {t("learn.ai.title") ||
                                  "AI Trading Coach"}
                              </Text>
                            </HStack>
                            <HStack spacing={1}>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() =>
                                  handleAskAi(
                                    "explain"
                                  )
                                }
                                isDisabled={aiLoading}
                              >
                                {t(
                                  "learn.ai.explain"
                                ) || "Explain"}
                              </Button>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() =>
                                  handleAskAi("quiz")
                                }
                                isDisabled={aiLoading}
                              >
                                {t(
                                  "learn.ai.quiz"
                                ) || "Quiz me"}
                              </Button>
                            </HStack>
                          </HStack>

                          <Box
                            maxH="260px"
                            overflowY="auto"
                            fontSize="sm"
                            pr={1}
                          >
                            {aiMessages.length ===
                              0 && (
                              <Text
                                color={mutedTextColor}
                              >
                                {t(
                                  "learn.ai.empty"
                                ) ||
                                  "Ask me about the current part of the episode, or let me quiz you on it."}
                              </Text>
                            )}
                            {aiMessages.map((msg) => (
                              <Box
                                key={msg.id}
                                mt={2}
                                display="flex"
                                justifyContent={
                                  msg.from === "user"
                                    ? "flex-end"
                                    : "flex-start"
                                }
                              >
                                <Box
                                  maxW="100%"
                                  px={3}
                                  py={2}
                                  borderRadius="lg"
                                  bg={
                                    msg.from === "user"
                                      ? "#65a8bf"
                                      : mode ===
                                        "dark"
                                      ? "gray.800"
                                      : "gray.100"
                                  }
                                  color={
                                    msg.from ===
                                    "user"
                                      ? "black"
                                      : undefined
                                  }
                                >
                                  <Text whiteSpace="pre-wrap">
                                    {msg.text}
                                  </Text>
                                </Box>
                              </Box>
                            ))}
                            {aiLoading && (
                              <Text
                                mt={2}
                                fontSize="xs"
                                color={mutedTextColor}
                              >
                                {t(
                                  "learn.ai.thinking"
                                ) || "Thinking…"}
                              </Text>
                            )}
                          </Box>

                          <HStack pt={1}>
                            <Input
                              size="sm"
                              placeholder={
                                t(
                                  "learn.ai.input_ph"
                                ) ||
                                "Ask about this episode or what confused you…"
                              }
                              value={aiInput}
                              onChange={(e) =>
                                setAiInput(
                                  e.target.value
                                )
                              }
                              onKeyDown={(e) => {
                                if (
                                  e.key ===
                                    "Enter" &&
                                  !e.shiftKey
                                ) {
                                  e.preventDefault();
                                  handleAskAi(
                                    "explain"
                                  );
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              bg="#65a8bf"
                              color="black"
                              _hover={{ opacity: 0.9 }}
                              isLoading={aiLoading}
                              onClick={() =>
                                handleAskAi("explain")
                              }
                            >
                              {t("common.send") ||
                                "Send"}
                            </Button>
                          </HStack>
                        </VStack>
                      </Box>
                    )}

                    {/* "Up next" prompt */}
                    {showUpNext && (
                      <HStack
                        position="absolute"
                        right={3}
                        bottom={3}
                        gap={2}
                        bg="whiteAlpha.900"
                        color="black"
                        borderRadius="md"
                        p={2}
                        zIndex={3}
                      >
                        <Text fontSize="sm">
                          {t("learn.up_next") ||
                            "Up next"}
                        </Text>
                        <Button
                          size="sm"
                          onClick={() => {
                            setEpisodeIdx((i) =>
                              i + 1 < videos.length
                                ? i + 1
                                : 0
                            );
                            setShowUpNext(false);
                            try {
                              playerRef.current?.play?.();
                            } catch {}
                          }}
                        >
                          {t("learn.play_now") ||
                            "Play now"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setShowUpNext(false)
                          }
                        >
                          {t("common.cancel") ||
                            "Cancel"}
                        </Button>
                      </HStack>
                    )}
                  </Box>

                  {/* Episode rail */}
                  <Box bg={cardBg} borderTopWidth={1} borderColor="blackAlpha.600">
                    <HStack
                      justify="space-between"
                      align="center"
                      px={4}
                      py={3}
                    >
                      <VStack
                        align="flex-start"
                        spacing={0}
                      >
                        <Text
                          fontSize="xs"
                          textTransform="uppercase"
                          letterSpacing="0.18em"
                          color={mutedTextColor}
                        >
                          {t("learn.episodes.label") ||
                            "Episodes"}
                        </Text>
                        <Text color={primaryTextColor}>
                          {tier.name ||
                            t("learn.course_fallback")}
                        </Text>
                      </VStack>
                      <Button
                        size="sm"
                        variant="outline"
                        
                        onClick={() =>
                          setAutoplayNext(
                            (s) => !s
                          )
                        }
                      >
                        {t("learn.autoplay", {
                          defaultValue: "Autoplay",
                        })}
                        : {autoplayNext ? "On" : "Off"}
                      </Button>
                    </HStack>

                    <HStack
                      gap={3}
                      px={3}
                      pb={4}
                      pt={2}
                      overflowX="auto"
                    >
                      {videos.map((vid: any, idx: number) => {
                        const videoName =
                          String(vid.url)
                            .split("/")
                            .pop()
                            ?.replace(
                              /\.[^/.]+$/,
                              ""
                            ) ||
                          `Episode ${idx + 1}`;
                        const active =
                          idx === episodeIdx;
                        return (
                          <Box
                            key={idx}
                            minW="220px"
                            borderWidth={
                              active ? 2 : 1
                            }
                            borderColor={
                              active
                                ? "#65a8bf"
                                : "gray.700"
                            }
                            borderRadius="lg"
                            p={3}
                            bg={
                              active
                                ? "blackAlpha.800"
                                : surfaceBg
                            }
                            color={
                              active
                                ? "white"
                                : primaryTextColor
                            }
                            cursor="pointer"
                            _hover={{
                              transform:
                                "translateY(-2px)",
                              boxShadow:
                                "0 10px 30px rgba(0,0,0,0.4)",
                            }}
                            transition="all 0.15s ease-out"
                            onClick={() => {
                              setEpisodeIdx(idx);
                              setShowUpNext(false);
                              setTimeout(() => {
                                try {
                                  playerRef.current?.play?.();
                                } catch {}
                              }, 50);
                            }}
                          >
                            <VStack
                              align="flex-start"
                              spacing={1}
                            >
                              <Text
                                fontSize="xs"
                                textTransform="uppercase"
                                color={
                                  active
                                    ? "whiteAlpha.80"
                                    : mutedTextColor
                                }
                              >
                                {t(
                                  "learn.episode_short",
                                  {
                                    defaultValue:
                                      "Ep {{n}}",
                                    n: idx + 1,
                                  }
                                )}
                              </Text>
                              <Text
                                fontWeight={600}
                                noOfLines={2}
                              >
                                {videoName}
                              </Text>
                            </VStack>
                          </Box>
                        );
                      })}
                    </HStack>
                  </Box>
                </Box>

                {/* RIGHT: sleek sidebar */}
                <VStack
                  align="stretch"
                  spacing={4}
                >
                  <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    borderWidth={1}
                    
                    p={4}
                    boxShadow="0 18px 60px rgba(0,0,0,0.7)"
                  >
                    <Heading
                      size="sm"
                      mb={2}
                      color={primaryTextColor}
                    >
                      {t("learn.sidebar.progress", {
                        defaultValue:
                          "Your progress",
                      })}
                    </Heading>
                    <ProgressWidget compact />
                  </Box>

                  <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    borderWidth={1}
                    
                    p={4}
                  >
                    <Heading
                      size="sm"
                      mb={3}
                      color={primaryTextColor}
                    >
                      {t("learn.sidebar.quick_links", {
                        defaultValue: "Quick links",
                      })}
                    </Heading>
                    <VStack
                      align="stretch"
                      spacing={2}
                      fontSize="sm"
                    >
                      {pdfsForRender.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          
                          onClick={() =>
                            scrollTo(notesRef)
                          }
                          leftIcon={
                            <FileText size={16} />
                          }
                        >
                          {t(
                            "learn.sidebar.open_notes"
                          ) || "Open course notes"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        
                        onClick={() =>
                          scrollTo(chartRef)
                        }
                        leftIcon={
                          <TrendingUp size={16} />
                        }
                      >
                        {t(
                          "learn.sidebar.practice_chart"
                        ) || "Practice on live chart"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        
                        onClick={() =>
                          scrollTo(supportRef)
                        }
                        leftIcon={<Star size={16} />}
                      >
                        {t(
                          "learn.sidebar.need_help"
                        ) || "Need help or support?"}
                      </Button>
                    </VStack>
                  </Box>

                  {(tier.instructorName ||
                    tier.instructorBio) && (
                    <Box
                      bg={cardBg}
                      borderRadius="2xl"
                      borderWidth={1}
                      
                      p={4}
                    >
                      <Heading
                        size="sm"
                        mb={2}
                        color={primaryTextColor}
                      >
                        {t("learn.instructor.title")}
                      </Heading>
                      {tier.instructorName && (
                        <Text
                          fontWeight={600}
                          color={primaryTextColor}
                        >
                          {tier.instructorName}
                        </Text>
                      )}
                      {tier.instructorBio && (
                        <Text
                          fontSize="sm"
                          mt={1}
                          color={mutedTextColor}
                        >
                          {tier.instructorBio}
                        </Text>
                      )}
                    </Box>
                  )}
                </VStack>
              </SimpleGrid>
            )}

            {/* NOTES & PDFs -------------------------------------------------- */}
            <Box
              ref={notesRef}
              bg={cardBg}
              borderRadius="2xl"
              borderWidth={1}
              
              p={5}
            >
              <HStack
                justify="space-between"
                align="center"
                mb={3}
              >
                <Heading
                  size="md"
                  color={primaryTextColor}
                >
                  {t("learn.documents.title") ||
                    "Notes & Documents"}
                </Heading>
                {pdfsForRender.length > 0 && (
                  <Badge
                    borderRadius="full"
                    variant="subtle"
                    colorScheme="cyan"
                  >
                    {pdfsForRender.length} PDF
                  </Badge>
                )}
              </HStack>

              {pdfsForRender.length === 0 ? (
                <Text color={mutedTextColor}>
                  {t("learn.materials.empty")}
                </Text>
              ) : (
                <VStack align="stretch" gap={4}>
                  {pdfsForRender.map(
                    (doc: any, idx: number) => {
                      const blob =
                        pdfBlobUrls[String(doc.url)];
                      const src = blob
                        ? `${blob}#toolbar=0&navpanes=0`
                        : `${toAbsoluteUrl(
                            String(doc.url)
                          )}#toolbar=0&navpanes=0`;
                      const resourceId =
                        doc.id || `pdf-${idx}-${tier.id}`;
                      const isLoaded =
                        loadedPDFs.has(idx);
                      const displayName = prettyDocName(doc.url);

                      <Text fontWeight="bold" fontSize="md" color={primaryTextColor}>
                        {displayName}
                      </Text>;

                      return (
                        <Box
                          key={idx}
                          borderRadius="lg"
                          overflow="hidden"
                          borderWidth={1}
                          position="relative"
                          onContextMenu={preventContext}
                        >
                          {!isLoaded ? (
                            <Button
                              w="full"
                              h="120px"
                              bg={surfaceBg}
                              borderWidth={2}
                              borderStyle="dashed"
                              _hover={{
                                bg: mode === "dark" ? "whiteAlpha.50" : "gray.100",
                                borderStyle: "solid",
                              }}
                              onClick={() =>
                                setLoadedPDFs((prev) => {
                                  const s = new Set(prev);
                                  s.add(idx);
                                  return s;
                                })
                              }
                            >
                              <VStack spacing={3}>
                                <Icon as={FileText} boxSize={8} color="#65a8bf" />
                                <VStack spacing={1}>
                                  <Text fontWeight="bold" fontSize="md" color={primaryTextColor}>
                                    {displayName}
                                  </Text>
                                  <Text fontSize="sm" color={mutedTextColor}>
                                    {t("common.click_to_load") || "Click to load PDF"}
                                  </Text>
                                </VStack>
                              </VStack>
                            </Button>
                          ) : blob ? (
                            <TrackedPDFPro
                              resourceId={resourceId}
                              src={src}
                              tierId={tier.id}
                              style={{ width: "100%", height: "100%" }}
                              watermark={
                                <>
                                  <Box
                                    position="absolute"
                                    inset={0}
                                    pointerEvents="none"
                                    zIndex={1}
                                  />
                                  <Watermark
                                    text={
                                      user?.email || user?.id
                                        ? t("learn.watermark.user", {
                                            user: user?.email || user?.id,
                                          })
                                        : undefined
                                    }
                                  />
                                </>
                              }
                            />
                          ) : (
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              height="40vh"
                            >
                              <Spinner />
                              <Text ml={2} color={primaryTextColor}>
                                {t("learn.documents.loading")}
                              </Text>
                            </Box>
                          )}

                          {isLoaded && (
                            <Text mt={2} px={3} pb={3} fontSize="sm" color={mutedTextColor}>
                              {t("learn.guard.note")}
                            </Text>
                          )}
                        </Box>
                      );
                    }
                  )}
                </VStack>
              )}
            </Box>

            {/* PREVIEW/TRAILER ROW ------------------------------------------- */}
            {(tier.previewUrl || tier.trailerUrl) && (
              <Box
                bg={cardBg}
                borderRadius="2xl"
                borderWidth={1}
                
                p={5}
              >
                <HStack
                  justify="space-between"
                  mb={3}
                  align="center"
                >
                  <Heading
                    size="md"
                    color={primaryTextColor}
                  >
                    {t("learn.materials.media") ||
                      "Preview & Trailer"}
                  </Heading>
                  <HStack gap={2}>
                    <IconButton
                      aria-label="Previous"
                      size="sm"
                      icon={<ChevronLeft size={16} />}
                      onClick={() =>
                        scrollTopCarousel("left")
                      }
                    />
                    <IconButton
                      aria-label="Next"
                      size="sm"
                      icon={<ChevronRight size={16} />}
                      onClick={() =>
                        scrollTopCarousel("right")
                      }
                    />
                  </HStack>
                </HStack>

                <HStack
                  ref={topCarouselRef}
                  gap={4}
                  overflowX="auto"
                  pb={2}
                  style={{
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {["preview", "trailer"].map(
                    (kind) => {
                      const url =
                        kind === "preview"
                          ? tier.previewUrl
                          : tier.trailerUrl;
                      if (!url) return null;
                      const isVid =
                        /\.(mp4|webm|ogg)(\?|#|$)/i.test(
                          String(url)
                        );
                      if (!isVid) return null;
                      const resource = resources.find(
                        (r: any) =>
                          r.url === url || r.url === kind
                      );
                      const resourceId =
                        resource?.id ||
                        `${kind}-${tier.id}`;

                      return (
                        <Box
                          key={kind}
                          minWidth={{
                            base: "320px",
                            md: "440px",
                          }}
                          maxWidth={{
                            base: "100%",
                            md: "480px",
                          }}
                          borderWidth={1}
                          borderRadius="lg"
                          
                          overflow="hidden"
                          position="relative"
                          bg="black"
                          style={{
                            scrollSnapAlign: "start",
                          }}
                        >
                          <TrackedVideo
                            resourceId={resourceId}
                            src={toAbsoluteUrl(
                              String(url)
                            )}
                            tierId={tier.id}
                            controls
                            style={{
                              width: "100%",
                              height: "auto",
                              aspectRatio: "16/9" as any,
                            }}
                            onContextMenu={(e) =>
                              e.preventDefault()
                            }
                            onEnded={() =>
                              materialsVideosRef.current?.scrollIntoView(
                                {
                                  behavior:
                                    "smooth",
                                  block: "start",
                                }
                              )
                            }
                          />
                        </Box>
                      );
                    }
                  )}
                </HStack>
              </Box>
            )}

            {/* LIVE CHART ---------------------------------------------------- */}
            <Box
              ref={chartRef}
              bg={cardBg}
              borderRadius="2xl"
              borderWidth={1}
              
              p={5}
            >
              <HStack
                justify="space-between"
                mb={4}
                align="center"
              >
                <HStack>
                  <Icon
                    as={TrendingUp}
                    boxSize={6}
                    color="#65a8bf"
                  />
                  <Heading
                    size="md"
                    color={primaryTextColor}
                  >
                    {t("learn.chart.title") ||
                      "Live Chart Practice"}
                  </Heading>
                </HStack>
              </HStack>
              <VStack align="stretch" spacing={3}>
                <Text
                  fontSize="sm"
                  color={mutedTextColor}
                >
                  {t("learn.chart.description") ||
                    "Practice reading charts in real-time. Use the tools below to analyze price action, identify patterns, and apply what you've learned."}
                </Text>
                <Box
                  borderRadius="md"
                  overflow="hidden"
                  borderWidth={1}
                  
                  h="600px"
                >
                  {/* eslint-disable-next-line react/style-prop-object */}
                  <AdvancedRealTimeChart
                    theme={mode === "dark" ? "dark" : "light"}
                    autosize
                    symbol="BTCUSD"
                    interval="D"
                    timezone="Etc/UTC"
                    style="1"
                    locale="en"
                    toolbar_bg="#f1f3f6"
                    enable_publishing={false}
                    allow_symbol_change={true}
                    save_image={false}
                    container_id="tradingview_chart"
                  />
                </Box>
                <Text
                  fontSize="xs"
                  color={mutedTextColor}
                  textAlign="center"
                >
                  {t("learn.chart.tip") ||
                    "💡 Tip: Try different timeframes and symbols to practice your analysis skills"}
                </Text>
              </VStack>
            </Box>

            {/* LIVE CLASSROOM CHAT ------------------------------------------- */}
            <Box
              bg={cardBg}
              borderRadius="2xl"
              borderWidth={1}
              
              p={5}
            >
              <HStack
                justify="space-between"
                align="center"
                mb={3}
              >
                <Heading
                  size="md"
                  color={primaryTextColor}
                >
                  {t("learn.chat.title", {
                    defaultValue: "Live classroom chat",
                  })}
                </Heading>
                <HStack spacing={2}>
                  <Box
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg={
                      mode === "dark"
                        ? "green.900"
                        : "green.50"
                    }
                    borderWidth={1}
                    borderColor="green.500"
                    fontSize="xs"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <Box
                      boxSize={2}
                      borderRadius="full"
                      bg="green.400"
                    />
                    <Text
                      fontWeight="600"
                      color={primaryTextColor}
                    >
                      {t("learn.chat.online_count", {
                        defaultValue: "{{n}} online now",
                        n: Math.max(onlineStudents.length, 1),
                      })}
                    </Text>
                  </Box>
                </HStack>
              </HStack>

              {onlineStudents.length > 0 && (
                <HStack
                  spacing={2}
                  mb={3}
                  flexWrap="wrap"
                >
                  {onlineStudents.slice(0, 8).map((s: any) => (
                    <Box
                      key={s.id || s.email}
                      px={3}
                      py={1}
                      borderRadius="full"
                      bg={
                        mode === "dark"
                          ? "whiteAlpha.100"
                          : "gray.100"
                      }
                      fontSize="xs"
                    >
                      {s.name ||
                        s.fullName ||
                        s.email ||
                        t("learn.chat.anonymous", {
                          defaultValue:
                            "Student",
                        })}
                    </Box>
                  ))}
                  {onlineStudents.length > 8 && (
                    <Text
                      fontSize="xs"
                      color={mutedTextColor}
                    >
                      +
                      {onlineStudents.length -
                        8}{" "}
                      {t("learn.chat.more", {
                        defaultValue: "more",
                      })}
                    </Text>
                  )}
                </HStack>
              )}

              <Box
                borderRadius="lg"
                borderWidth={1}
                borderColor={
                  mode === "dark"
                    ? "whiteAlpha.200"
                    : "gray.200"
                }
                bg={
                  mode === "dark"
                    ? "blackAlpha.500"
                    : "gray.50"
                }
                h="260px"
                overflowY="auto"
                p={3}
                mb={3}
              >
                {chatConnecting && chatMessages.length === 0 ? (
                  <HStack>
                    <Spinner size="sm" />
                    <Text
                      fontSize="sm"
                      color={mutedTextColor}
                    >
                      {t("learn.chat.connecting", {
                        defaultValue:
                          "Connecting to classroom chat…",
                      })}
                    </Text>
                  </HStack>
                ) : chatMessages.length === 0 ? (
                  <Text
                    fontSize="sm"
                    color={mutedTextColor}
                  >
                    {t("learn.chat.empty", {
                      defaultValue:
                        "No messages yet. Say hi and start the discussion!",
                    })}
                  </Text>
                ) : (
                  <VStack
                    align="stretch"
                    spacing={2}
                  >
                    {chatMessages.map((m) => {
                      const self =
                        (m.userId &&
                          m.userId === user?.id) ||
                        m.self;
                      return (
                        <Box
                          key={m.id}
                          display="flex"
                          justifyContent={
                            self
                              ? "flex-end"
                              : "flex-start"
                          }
                        >
                          <Box
                            maxW="80%"
                            px={3}
                            py={2}
                            borderRadius="lg"
                            bg={
                              self
                                ? "#65a8bf"
                                : mode === "dark"
                                ? "gray.800"
                                : "white"
                            }
                            color={
                              self
                                ? "black"
                                : primaryTextColor
                            }
                            boxShadow="sm"
                          >
                            <Text
                              fontSize="xs"
                              mb={0.5}
                              color={
                                self
                                  ? "blackAlpha.700"
                                  : mutedTextColor
                              }
                            >
                              {self
                                ? t("learn.chat.you", {
                                    defaultValue:
                                      "You",
                                  })
                                : m.userName ||
                                  t(
                                    "learn.chat.anonymous",
                                    {
                                      defaultValue:
                                        "Student",
                                    }
                                  )}
                            </Text>
                            <Text
                              fontSize="sm"
                              whiteSpace="pre-wrap"
                            >
                              {m.text}
                            </Text>
                          </Box>
                        </Box>
                      );
                    })}
                  </VStack>
                )}
              </Box>

              <HStack spacing={2}>
                <Input
                  placeholder={
                    t("learn.chat.input_ph", {
                      defaultValue:
                        "Share a thought, ask a question…",
                    }) as string
                  }
                  value={chatInput}
                  onChange={(e) =>
                    setChatInput(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                />
                <Button
                  bg="#65a8bf"
                  color="black"
                  _hover={{ opacity: 0.9 }}
                  isLoading={chatLoading}
                  onClick={handleSendChat}
                >
                  {t("learn.chat.send", {
                    defaultValue: "Send",
                  })}
                </Button>
              </HStack>
            </Box>

            {/* SUPPORT / PURCHASE INFO -------------------------------------- */}
            <Box
              ref={supportRef}
              bg={cardBg}
              borderRadius="2xl"
              borderWidth={1}
              
              p={5}
            >
              <Heading
                size="sm"
                mb={2}
                color={primaryTextColor}
              >
                {t("learn.support.title")}
              </Heading>
              <Text
                fontSize="sm"
                color={mutedTextColor}
              >
                {t("learn.support.body")}
              </Text>
              <style>
                {`@media print { body * { display: none !important; } }`}
              </style>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* CERTIFICATE MODAL ----------------------------------------------------- */}
      {certOpen && (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.700"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
          p={4}
        >
          <Box
            bg={cardBg}
            borderRadius="xl"
            
            borderWidth={1}
            p={4}
            maxW="90vw"
            maxH="90vh"
          >
            <VStack spacing={4} align="stretch">
              <Heading size="md" color={primaryTextColor}>
                {t("learn.certificate.preview") ||
                  "Certificate Preview"}
              </Heading>
              <Box
                overflow="auto"
                maxH="70vh"
                borderWidth={1}
                
                borderRadius="lg"
              >
                {certDataUrl && (
                  <img
                    src={certDataUrl}
                    alt="Certificate"
                    style={{
                      display: "block",
                      maxWidth: "100%",
                    }}
                  />
                )}
              </Box>
              <HStack spacing={3} justify="flex-end">
                <Button
                  onClick={handleDownload}
                  bg="#65a8bf"
                  color="black"
                  _hover={{ opacity: 0.9 }}
                >
                  {t("learn.certificate.download") ||
                    "Download PNG"}
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  
                  color="#65a8bf"
                >
                  {t("learn.certificate.share") || "Share"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setCertOpen(false)}
                >
                  {t("common.close") || "Close"}
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* FLOATING DOCK --------------------------------------------------------- */}
      <Dock
        items={dockItems}
        className="bottom-dock"
        baseItemSize={48}
        magnification={72}
        distance={220}
      />
    </>
  );
};

// Watermark overlay used for PDFs
const Watermark: React.FC<{ text?: string }> = ({
  text = "Protected Content",
}) => (
  <Box position="absolute" inset={0} pointerEvents="none" opacity={0.1}>
    <Box
      position="absolute"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%) rotate(-15deg)"
      fontWeight={800}
      fontSize={{ base: "2xl", md: "4xl" }}
      color="blackAlpha.700"
      textAlign="center"
    >
      {text}
    </Box>
  </Box>
);

export default Learn;
