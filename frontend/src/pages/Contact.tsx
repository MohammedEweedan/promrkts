// src/pages/Contact.tsx
import React from "react";
import {
  Box,
  Button,
  Container,
  HStack,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
  Icon,
  useToast,
  SimpleGrid,
  GridItem,
  Divider,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import api from "../api/client";
import { MessageSquare, Send, PhoneCall } from "lucide-react";
import { chakra } from "@chakra-ui/system";
import SpotlightCard from "../components/SpotlightCard";

type CourseTier = { id: string; name: string };
type MyTicket = {
  id: string;
  ticketId: string;
  status: "OPEN" | "READ" | "ESCALATED" | "RESOLVED";
  read: boolean;
  createdAt: string;
  courseId?: string | null;
  courseName?: string | null;
  preview: string;
};

// === SAME COUNTRY/DIAL APPROACH AS REGISTER ===
type Country = { name: string; cca2: string; iddRoots: string[]; iddSuffixes: string[] };

const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || "";
const telegramHandle = process.env.REACT_APP_TELEGRAM_HANDLE || "";
const CSelect = chakra("select");

const Contact: React.FC = () => {
  const { t, i18n } = useTranslation() as any;
  const loc = useLocation();
  const params = React.useMemo(() => new URLSearchParams(loc.search), [loc.search]);
  const brand = "#65a8bf";
  const toast = useToast();
  const tz = React.useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Tripoli",
    []
  );

  // Core form
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");

  // === Countries + Phone (IDENTICAL BEHAVIOR TO REGISTER) ===
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = React.useState<string>(""); // cca2
  const [dialCode, setDialCode] = React.useState<string>("");
  const [phone, setPhone] = React.useState<string>("");

  // Compose international phone (best-effort E.164-like)
  const fullPhone = React.useMemo(() => {
    const d = (dialCode || "").trim();
    const p = (phone || "").trim();
    if (!d && !p) return "";
    const dc = d.startsWith("+") ? d : d ? `+${d}` : "+";
    return (dc + p).replace(/[^\d+]/g, "");
  }, [dialCode, phone]);

  // Load countries from RestCountries (same source/shape as Register)
  React.useEffect(() => {
    (async () => {
      try {
        const resp = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd");
        const data = await resp.json();
        const mapped: Country[] = (data || [])
          .map((c: any) => {
            const root = c?.idd?.root || "";
            const suffixes = Array.isArray(c?.idd?.suffixes) ? c.idd.suffixes : [];
            return {
              name: c?.name?.common || c?.name?.official || "Unknown",
              cca2: c?.cca2 || "",
              iddRoots: root ? [root] : [],
              iddSuffixes: suffixes,
            } as Country;
          })
          .filter((c: Country) => !!c.name);
        mapped.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(mapped);
      } catch {
        // If this fails, user can still type phone manually
      }
    })();
  }, []);

  // Auto-select first dial code when nationality changes (same as Register)
  React.useEffect(() => {
    if (!selectedCountry) return;
    const c = countries.find((x) => x.cca2 === selectedCountry);
    if (!c) return;
    const root = c.iddRoots[0] || "";
    const firstSuffix = c.iddSuffixes[0] || "";
    const code = `${root}${firstSuffix}` || "";
    setDialCode(code);
  }, [selectedCountry, countries]);

  // Other state
  const [message, setMessage] = React.useState("");
  const [courseId, setCourseId] = React.useState<string>("");
  const [courses, setCourses] = React.useState<CourseTier[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Tickets (auth’d)
  const [me, setMe] = React.useState<any>(null);
  const [myTickets, setMyTickets] = React.useState<MyTicket[]>([]);
  const [myTicketsLoading, setMyTicketsLoading] = React.useState(false);
  const [myTicketsErr, setMyTicketsErr] = React.useState<string | null>(null);

  // Tracker
  const [trackOpen, setTrackOpen] = React.useState(false);
  const [trackId, setTrackId] = React.useState("");
  const [trackLoading, setTrackLoading] = React.useState(false);
  const [trackError, setTrackError] = React.useState<string | null>(null);
  const [trackResult, setTrackResult] = React.useState<any | null>(null);

  // Scheduling
  const [schedDate, setSchedDate] = React.useState<string>("");
  const [slots, setSlots] = React.useState<{ iso: string; available: boolean }[]>([]);
  const [slotsLoading, setSlotsLoading] = React.useState(false);
  const [slotErr, setSlotErr] = React.useState<string | null>(null);
  const [selectedIso, setSelectedIso] = React.useState<string>("");
  const [booking, setBooking] = React.useState(false);

  // Preselect course from URL
  React.useEffect(() => {
    const preselect = params.get("courseId") || "";
    if (preselect) setCourseId(preselect);
  }, [params]);

  // Load course list (including subscriptions)
  React.useEffect(() => {
    (async () => {
      try {
        const [coursesResp, subsResp] = await Promise.all([
          api.get("/courses").catch(() => ({ data: [] })),
          api.get("/subscriptions").catch(() => ({ data: [] })),
        ]);
        const courses = Array.isArray(coursesResp.data) ? coursesResp.data : [];
        const subs = Array.isArray(subsResp.data) ? subsResp.data : [];
        const allTiers = [...courses, ...subs];
        setCourses(
          allTiers.map((t: any) => ({
            id: String(t.id),
            name: String(
              t.name || t.title || t("contact.course_fallback", { defaultValue: "Course" })
            ),
          }))
        );
      } catch {}
    })();
  }, [t]);

  // Prefill /users/me
  React.useEffect(() => {
    (async () => {
      try {
        const meResp = await api.get("/users/me");
        const u = meResp.data || {};
        setMe(u);
        if (u?.name && !name) setName(String(u.name));
        if (u?.email && !email) setEmail(String(u.email));
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // My tickets (auth’d)
  React.useEffect(() => {
    (async () => {
      if (!me?.email) return;
      setMyTicketsLoading(true);
      setMyTicketsErr(null);
      try {
        const resp = await api.get("/communications/my");
        const items = Array.isArray(resp?.data?.items) ? resp.data.items : [];
        setMyTickets(items);
      } catch (e: any) {
        setMyTicketsErr(
          e?.response?.data?.message ||
            t("contact.my_tickets_error", { defaultValue: "Failed to load your tickets." })
        );
      } finally {
        setMyTicketsLoading(false);
      }
    })();
  }, [me, t]);

  // Availability for scheduling
  React.useEffect(() => {
    (async () => {
      setSlots([]);
      setSelectedIso("");
      setSlotErr(null);
      if (!schedDate) return;
      try {
        setSlotsLoading(true);
        const resp = await api.get(`/communications/availability`, { params: { date: schedDate } });
        const arr = Array.isArray(resp?.data?.slots) ? resp.data.slots : [];
        setSlots(arr);
      } catch (e: any) {
        setSlotErr(
          e?.response?.data?.message ||
            t("contact.avail_error", { defaultValue: "Failed to load availability." })
        );
      } finally {
        setSlotsLoading(false);
      }
    })();
  }, [schedDate, t]);

  function formatLocal(iso: string) {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(d);
    } catch {
      return iso;
    }
  }

  async function submitSchedule() {
    if (!name || (!email && !fullPhone)) {
      toast({
        status: "warning",
        title: t("contact.validation_required", {
          defaultValue: "Please enter your name and either email or phone.",
        }),
      });
      return;
    }
    if (!schedDate || !selectedIso) {
      toast({
        status: "warning",
        title: t("contact.pick_slot", { defaultValue: "Please pick a date and time." }),
      });
      return;
    }

    setBooking(true);
    try {
      const selected = courses.find((c) => c.id === courseId);
      const payload = {
        name,
        email: email || undefined,
        phone: fullPhone || undefined,
        courseId: courseId || undefined,
        courseName: selected?.name,
        message: message || "Requesting a WhatsApp call",
        whenIso: selectedIso,
        tz,
        durationMinutes: 30,
        url: window.location.href,
        utm: {
          source: params.get("utm_source") || undefined,
          medium: params.get("utm_medium") || undefined,
          campaign: params.get("utm_campaign") || undefined,
        },
      };

      const resp = await api.post("/communications/schedule", payload);
      const rec = resp.data;

      toast({
        status: "success",
        title: t("contact.scheduled", { defaultValue: "Your call is scheduled!" }),
        description:
          t("contact.scheduled_desc", {
            defaultValue: "We’ll reach you via WhatsApp at the selected time.",
          }) + ` (#${rec.ticketId})`,
      });

      if (whatsappNumber) {
        const text = encodeURIComponent(
          t("contact.whatsapp_confirm", {
            defaultValue: "Hi! I just scheduled a call on your site. Looking forward to it.",
          })
        );
        const base = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}`;
        window.open(`${base}?text=${text}`, "_blank", "noreferrer");
      }

      setSelectedIso("");
      setSchedDate("");
    } catch (e: any) {
      toast({
        status: "error",
        title:
          e?.response?.data?.message ||
          t("contact.schedule_error", { defaultValue: "Failed to schedule call." }),
      });
    } finally {
      setBooking(false);
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSent(false);

    // Require: name + message + (email OR phone)
    if (!name || !message || (!email && !fullPhone)) {
      setError(
        t("contact.validation_required", {
          defaultValue: "Please fill your name, message, and either email or phone.",
        })
      );
      return;
    }

    try {
      setIsLoading(true);
      const selected = courses.find((c) => c.id === courseId);
      const url = window.location.href;
      const utm = {
        source: params.get("utm_source") || undefined,
        medium: params.get("utm_medium") || undefined,
        campaign: params.get("utm_campaign") || undefined,
      };

      await api.post("/communications", {
        name,
        email: email || undefined,
        phone: fullPhone || undefined,
        message,
        courseId: courseId || undefined,
        courseName: selected?.name,
        locale: i18n?.language || "en",
        url,
        utm,
      });

      setSent(true);
      setName("");
      setEmail("");
      setSelectedCountry("");
      setDialCode("");
      setPhone("");
      setMessage("");
      setCourseId("");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        t("contact.error_send", { defaultValue: "Failed to send message" });
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const waLink = React.useMemo(() => {
    const base = whatsappNumber
      ? `https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}`
      : "https://wa.me/";
    const text = encodeURIComponent(
      `${t("contact.default_text", {
        defaultValue: "Hello, I would like to know more about your courses.",
      })}${
        courseId ? ` (${t("contact.course_id", { defaultValue: "Course ID" })}: ${courseId})` : ""
      }`
    );
    return `${base}?text=${text}`;
  }, [courseId, t]);

  const tgLink = React.useMemo(() => {
    return telegramHandle ? `https://t.me/${telegramHandle}` : "https://t.me/";
  }, []);

  const trackTicket = async (forcedId?: string) => {
    setTrackError(null);
    setTrackResult(null);
    const id = (forcedId ?? trackId ?? "").trim();
    if (!id) {
      setTrackError(t("contact.ticket_required", { defaultValue: "Please enter a ticket ID." }));
      return;
    }
    try {
      setTrackLoading(true);
      const resp = await api.get(`/communications/track/${encodeURIComponent(id)}`);
      setTrackResult(resp.data);
      setTrackId(id);
    } catch (err: any) {
      setTrackError(
        err?.response?.data?.message ||
          t("contact.ticket_not_found", { defaultValue: "Ticket not found." })
      );
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <Box color="text.primary" py={{ base: 8, md: 12 }}>
      <Container maxW="6xl">
        <VStack align="stretch" gap={{ base: 6, md: 10 }}>
          {/* Page title */}
          <Box textAlign="center">
            <Heading as="h1" size="lg" mb={2}>
              {t("contact.title", { defaultValue: "Contact us" })}
            </Heading>
            <Text color="text.muted">
              {t("contact.subtitle", { defaultValue: "Tell us how we can help." })}
            </Text>
          </Box>

          {/* ===== Contact form ===== */}
          <SpotlightCard>
          <Box
            as="form"
            onSubmit={submit}
            borderWidth={1}
            borderColor={brand}
            borderRadius="lg"
            p={{ base: 4, md: 6 }}
            bg="bg.surface"
          >
            <VStack align="stretch" gap={{ base: 6, md: 8 }}>
              {/* Section: Basic info */}
              <Box>
                <Heading as="h2" size="sm" mb={3}>
                  {t("contact.basic_info", { defaultValue: "Basic information" })}
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
                  <GridItem>
                    <Text mb={1}>{t("contact.name", { defaultValue: "Your Name" })}</Text>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("contact.name_ph", { defaultValue: "John Doe" })}
                      borderColor={brand}
                      _hover={{ borderColor: brand }}
                      _focus={{ borderColor: brand, boxShadow: `0 0 0 1px ${brand}` }}
                    />
                  </GridItem>

                  <GridItem>
                    <Text mb={1}>{t("contact.email", { defaultValue: "Email (optional)" })}</Text>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("contact.email_ph", { defaultValue: "you@example.com" })}
                      borderColor={brand}
                      _hover={{ borderColor: brand }}
                      _focus={{ borderColor: brand, boxShadow: `0 0 0 1px ${brand}` }}
                    />
                  </GridItem>
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Section: Phone (country + dial) */}
              <Box>
                <Heading as="h2" size="sm" mb={3}>
                  {t("contact.phone_info", { defaultValue: "Phone (optional)" })}
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
                  <GridItem>
                    <Text fontSize="sm" mb={1} color="text.muted">
                      {t("auth.nationality") || "Nationality"}
                    </Text>
                    <CSelect
                      value={selectedCountry}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setSelectedCountry(e.target.value)
                      }
                      borderRadius="md"
                      maxW="200px"
                      px={3}
                      py={2}
                      borderWidth={1}
                      borderColor={brand}
                    >
                      <option value="">
                        {t("auth.nationality_placeholder") || "Select a country"}
                      </option>
                      {countries.map((c) => (
                        <option key={c.cca2} value={c.cca2}>
                          {c.name}
                        </option>
                      ))}
                    </CSelect>
                  </GridItem>

                  <GridItem>
                    <Text fontSize="sm" mb={1} color="text.muted">
                      {t("auth.phone") || "Phone"}
                    </Text>
                    <HStack>
                      <CSelect
                        value={dialCode}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setDialCode(e.target.value)
                        }
                        minW="36%"
                        borderRadius="md"
                        px={3}
                        py={2}
                        borderWidth={1}
                        borderColor={brand}
                      >
                        {(() => {
                          const c = countries.find((x) => x.cca2 === selectedCountry);
                          const root = c?.iddRoots?.[0] || "";
                          const suffixes = c?.iddSuffixes?.length ? c.iddSuffixes : [""];
                          const opts = suffixes.map((s) => `${root}${s || ""}`).filter(Boolean);
                          const unique = Array.from(new Set(opts));
                          return (unique.length ? unique : ["+"]).map((code: string) => (
                            <option key={code} value={code}>
                              {code}
                            </option>
                          ));
                        })()}
                      </CSelect>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t("auth.phone_placeholder") || "e.g. 91 234 5678"}
                        borderRadius="md"
                        px={3}
                        py={2}
                        borderWidth={1}
                        borderColor={brand}
                      />
                    </HStack>

                    {fullPhone && (
                      <Text fontSize="xs" mt={1} color="text.muted">
                        {t("contact.phone_preview", { defaultValue: "Will send:" })} {fullPhone}
                      </Text>
                    )}
                  </GridItem>
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Section: Course & Message */}
              <Box>
                <Heading as="h2" size="sm" mb={3}>
                  {t("contact.details", { defaultValue: "Details" })}
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
                  <GridItem>
                    <Text mb={1}>{t("contact.course", { defaultValue: "Course (optional)" })}</Text>
                    <CSelect
                      value={courseId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setCourseId(e.target.value)
                      }
                      style={{ padding: "10px", borderRadius: 8 }}
                      borderColor={brand}
                      _hover={{ borderColor: brand }}
                      _focus={{ borderColor: brand, boxShadow: `0 0 0 1px ${brand}` }}
                      bg="transparent"
                    >
                      <option value="">
                        {t("contact.course_ph", { defaultValue: "Select a course" })}
                      </option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </CSelect>
                  </GridItem>

                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Text mb={1}>{t("contact.message", { defaultValue: "Message" })}</Text>
                    <Textarea
                      value={message}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setMessage(e.target.value)
                      }
                      rows={6}
                      placeholder={t("contact.message_ph", {
                        defaultValue: "Tell us more about what you need...",
                      })}
                      borderColor={brand}
                      _hover={{ borderColor: brand }}
                      _focus={{ borderColor: brand, boxShadow: `0 0 0 1px ${brand}` }}
                    />
                  </GridItem>
                </SimpleGrid>
              </Box>

              {/* Section: Schedule a call */}
              <Box borderWidth={1} borderColor={brand} borderRadius="lg" p={{ base: 3, md: 4 }}>
                <HStack justify="space-between" align="center" mb={3} flexWrap="wrap" gap={3}>
                  <Heading size="sm" color={brand} fontWeight="bold">
                    {t("contact.schedule_title", {
                      defaultValue: "Schedule a call with an advisor",
                    })}
                  </Heading>
                  <Text fontSize="xs" opacity={0.8} color={brand} fontWeight="bold">
                    {t("contact.schedule_desc", {
                      defaultValue: "Pick a date and time for a WhatsApp call.",
                    })}
                  </Text>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
                  <GridItem>
                    <Text mb={1}>{t("contact.pick_date", { defaultValue: "Pick a date" })}</Text>
                    <Input
                      type="date"
                      value={schedDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setSchedDate(e.target.value)}
                      borderColor={brand}
                      color={brand}
                      _hover={{ borderColor: brand }}
                      _focus={{ borderColor: brand, boxShadow: `0 0 0 1px ${brand}` }}
                    />
                  </GridItem>

                  <GridItem>
                    {schedDate && (
                      <Box>
                        <Text mb={2}>
                          {t("contact.pick_time", { defaultValue: "Pick a time" })}
                        </Text>
                        {slotsLoading && (
                          <Text>{t("common.loading", { defaultValue: "Loading…" })}</Text>
                        )}
                        {slotErr && <Text color="red.400">{slotErr}</Text>}
                        {!slotsLoading && !slotErr && slots.length === 0 && (
                          <Text opacity={0.8}>
                            {t("contact.no_slots", {
                              defaultValue: "No slots available for this day.",
                            })}
                          </Text>
                        )}
                        {!slotsLoading && !slotErr && slots.length > 0 && (
                          <Box
                            display="grid"
                            gridTemplateColumns={{ base: "repeat(3, 1fr)", md: "repeat(4, 1fr)" }}
                            gap={2}
                          >
                            {slots.map((s) => {
                              const disabled = !s.available;
                              const selected = selectedIso === s.iso;
                              return (
                                <Button
                                  key={s.iso}
                                  size="sm"
                                  variant={selected ? "solid" : "outline"}
                                  bg={selected ? brand : "transparent"}
                                  color={selected ? "black" : "inherit"}
                                  borderColor={disabled ? "gray.500" : brand}
                                  opacity={disabled ? 0.4 : 1}
                                  _hover={
                                    disabled
                                      ? {}
                                      : { bg: selected ? brand : "rgba(182, 233, 255,0.1)" }
                                  }
                                  onClick={() => !disabled && setSelectedIso(s.iso)}
                                  isDisabled={disabled}
                                >
                                  {formatLocal(s.iso)}
                                </Button>
                              );
                            })}
                          </Box>
                        )}
                      </Box>
                    )}
                  </GridItem>
                </SimpleGrid>

                <HStack justify="flex-start" pt={3}>
                  <Button
                    onClick={submitSchedule}
                    bg={brand}
                    color="black"
                    _hover={{ opacity: 0.9 }}
                    isLoading={booking}
                    isDisabled={!schedDate || !selectedIso || booking}
                  >
                    <Icon as={PhoneCall} style={{ marginRight: 8 }} />
                    {t("contact.schedule_cta", { defaultValue: "Schedule WhatsApp Call" })}
                  </Button>
                </HStack>
              </Box>

              {/* Form status */}
              {error && <Text color="red.500">{error}</Text>}
              {sent && (
                <VStack align="start" gap={2}>
                  <Text color="green.500">
                    {t("contact.sent", {
                      defaultValue: "Your message has been sent. We will get back to you soon.",
                    })}
                  </Text>
                </VStack>
              )}

              {/* Submit */}
              <HStack>
                <Button
                  type="submit"
                  bg={brand}
                  color="black"
                  _hover={{ opacity: 0.9 }}
                  isLoading={isLoading}
                >
                  <Icon as={Send} style={{ marginRight: 8 }} />
                  {t("contact.send", { defaultValue: "Send Message" })}
                </Button>
              </HStack>
            </VStack>
          </Box>
          </SpotlightCard>

          {/* ===== Tickets (if logged in) ===== */}
          {me?.email && (
            <SpotlightCard>
            <Box borderWidth={1} borderColor={brand} borderRadius="lg" p={{ base: 4, md: 6 }} bg="bg.surface">
              <HStack justify="space-between" align="center" mb={3}>
                <Heading size="sm">
                  {t("contact.my_tickets_title", { defaultValue: "Your Tickets" })}
                </Heading>
                <Text fontSize="xs" color="text.muted">
                  {t("contact.my_tickets_hint", {
                    defaultValue: "Showing up to the last 50 tickets",
                  })}
                </Text>
              </HStack>

              {myTicketsLoading && <Text>{t("common.loading", { defaultValue: "Loading…" })}</Text>}
              {myTicketsErr && <Text color="red.500">{myTicketsErr}</Text>}

              {!myTicketsLoading && !myTicketsErr && (
                <>
                  {myTickets.length === 0 ? (
                    <Text color="text.muted">
                      {t("contact.my_tickets_empty", {
                        defaultValue: "You don't have any tickets yet.",
                      })}
                    </Text>
                  ) : (
                    <VStack align="stretch" gap={2}>
                      {myTickets.map((tk) => (
                        <HStack
                          key={tk.id}
                          p={3}
                          borderWidth={1}
                          borderColor={brand}
                          borderRadius="md"
                          justify="space-between"
                          flexWrap="wrap"
                          gap={2}
                        >
                          <VStack align="start" gap={0}>
                            <Text fontWeight="semibold">
                              {t("contact.ticket_id", { defaultValue: "Ticket ID" })}: {tk.ticketId}
                            </Text>
                            <Text fontSize="xs" opacity={0.8}>
                              {new Date(tk.createdAt).toLocaleString()}
                              {tk.courseName ? ` • ${tk.courseName}` : ""}
                            </Text>
                            <Text fontSize="sm" noOfLines={2}>
                              {tk.preview}
                            </Text>
                          </VStack>

                          <HStack gap={2}>
                            <Box
                              as="span"
                              px={2}
                              py={1}
                              borderWidth={1}
                              borderColor={brand}
                              borderRadius="md"
                              fontSize="xs"
                            >
                              {tk.status}
                            </Box>
                            <Button
                              size="sm"
                              bg={brand}
                              color="black"
                              _hover={{ opacity: 0.9 }}
                              onClick={async () => {
                                setTrackOpen(true);
                                await trackTicket(tk.ticketId);
                              }}
                            >
                              {t("contact.track_this", { defaultValue: "Track" })}
                            </Button>
                            <Button
                              size="sm"
                              bg={brand}
                              color="black"
                              _hover={{ opacity: 0.9 }}
                              onClick={() => navigator.clipboard.writeText(tk.ticketId)}
                            >
                              {t("contact.copy_this", { defaultValue: "Copy" })}
                            </Button>
                          </HStack>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </>
              )}
            </Box>
            </SpotlightCard>
          )}

          {/* Tracker panel */}
          {trackOpen && (
            <SpotlightCard>
            <Box borderWidth={1} borderColor={brand} borderRadius="lg" p={4} bg="bg.surface">
              {trackLoading && (
                <Text mb={2}>{t("common.loading", { defaultValue: "Loading…" })}</Text>
              )}

              <HStack justify="space-between" align="center" mb={3}>
                <Heading size="sm">
                  {t("contact.track_title", { defaultValue: "Track Ticket" })}
                </Heading>
                <HStack gap={2}>
                  <Button
                    size="sm"
                    bg={brand}
                    color="black"
                    _hover={{ opacity: 0.9 }}
                    onClick={() => navigator.clipboard.writeText(trackId)}
                  >
                    {t("contact.copy_this", { defaultValue: "Copy" })}
                  </Button>
                  <Button
                    size="sm"
                    variant="solid"
                    bg="gray.500"
                    color="#65a8bf"
                    _hover={{ opacity: 0.9 }}
                    onClick={() => {
                      setTrackOpen(false);
                      setTrackResult(null);
                      setTrackError(null);
                    }}
                  >
                    {t("common.close", { defaultValue: "Close" })}
                  </Button>
                </HStack>
              </HStack>

              <Text fontSize="sm" color="text.muted" mb={2}>
                {t("contact.ticket_id", { defaultValue: "Ticket ID" })}: {trackId}
              </Text>

              {trackError && <Text color="red.500">{trackError}</Text>}
              {!trackError && !trackResult && !trackLoading && (
                <Text>
                  {t("contact.enter_ticket", { defaultValue: "Enter a ticket to track." })}
                </Text>
              )}

              {trackResult && (
                <VStack align="stretch" gap={3}>
                  {(() => {
                    const status = String(trackResult.status || "").toUpperCase();
                    const steps = [
                      {
                        key: "OPEN",
                        label: t("contact.stage_received", { defaultValue: "Received" }),
                      },
                      { key: "READ", label: t("contact.stage_read", { defaultValue: "Read" }) },
                      {
                        key: "ESCALATED",
                        label: t("contact.stage_escalated", { defaultValue: "Escalated" }),
                      },
                      {
                        key: "RESOLVED",
                        label: t("contact.stage_resolved", { defaultValue: "Resolved" }),
                      },
                    ];
                    const activeIndex = Math.max(
                      0,
                      steps.findIndex((s) => s.key === status)
                    );
                    const isDone = (idx: number) => idx <= activeIndex;
                    return (
                      <HStack gap={2} align="center">
                        {steps.map((s, idx) => (
                          <HStack key={s.key} gap={2} align="center">
                            <Box
                              px={3}
                              py={1}
                              borderRadius="full"
                              bg={isDone(idx) ? brand : "transparent"}
                              borderWidth={1}
                              borderColor={brand}
                              color={isDone(idx) ? "black" : "inherit"}
                              minW="96px"
                              textAlign="center"
                              fontSize="sm"
                            >
                              {s.label}
                            </Box>
                            {idx < steps.length - 1 && (
                              <Box
                                flexShrink={0}
                                w="24px"
                                h="2px"
                                bg={isDone(idx) ? brand : "gray.600"}
                                borderRadius="full"
                              />
                            )}
                          </HStack>
                        ))}
                      </HStack>
                    );
                  })()}

                  <VStack align="start" gap={1}>
                    <Text>
                      <strong>{t("contact.status", { defaultValue: "Status" })}:</strong>{" "}
                      {trackResult.status}
                    </Text>
                    <Text>
                      <strong>{t("contact.created", { defaultValue: "Created" })}:</strong>{" "}
                      {new Date(trackResult.createdAt).toLocaleString()}
                    </Text>
                    {trackResult.courseName && (
                      <Text>
                        <strong>{t("contact.course", { defaultValue: "Course" })}:</strong>{" "}
                        {trackResult.courseName}
                      </Text>
                    )}
                    {trackResult.preview && (
                      <Text>
                        <strong>
                          {t("contact.preview", { defaultValue: "Message Preview" })}:
                        </strong>{" "}
                        {trackResult.preview}
                      </Text>
                    )}
                  </VStack>
                </VStack>
              )}
            </Box>
            </SpotlightCard>
          )}
        </VStack>
        {/* Alt channels */}
        <Box mt={4} p={{ base: 4, md: 6 }}>
          <Heading size="sm" mb={3} textAlign="center">
            {t("contact.alt", { defaultValue: "Prefer WhatsApp or Telegram?" })}
          </Heading>
          <HStack gap={3} justifyContent="center">
            <Button
              onClick={() => window.open(waLink, "_blank", "noreferrer")}
              variant="solid"
              bg="#25D366"
              color="#65a8bf"
            >
              <Icon as={PhoneCall} style={{ marginRight: 8 }} />
              {t("contact.whatsapp", { defaultValue: "WhatsApp" })}
            </Button>
            <Button
              onClick={() => window.open(tgLink, "_blank", "noreferrer")}
              variant="solid"
              bg="#229ED9"
              color="#65a8bf"
            >
              <Icon as={MessageSquare} style={{ marginRight: 8 }} />
              {t("contact.telegram", { defaultValue: "Telegram" })}
            </Button>
          </HStack>
        </Box>
      </Container>
    </Box>
  );
};

export default Contact;
