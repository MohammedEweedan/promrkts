import React from "react";
import {
  Box,
  Button,
  HStack,
  Icon,
  Input,
  SimpleGrid,
  Spinner,
  Text,
  Badge,
  VStack,
  chakra,
  Link,
  Wrap,
  WrapItem,
  useBreakpointValue,
  Grid,
} from "@chakra-ui/react";
import {
  Download,
  Eye,
  EyeOff,
  RefreshCcw,
  Mail,
  PhoneCall,
  MessageSquare,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import api from "../../api/client";
import { useTranslation } from "react-i18next";

export type CommItem = {
  id: string;
  name: string;
  email: string;
  message: string;
  courseId?: string;
  courseName?: string;
  locale?: string;
  url?: string;
  utm?: { source?: string; medium?: string; campaign?: string };
  createdAt: string;
  read: boolean;
  status?: "open" | "closed" | "escalated";
  priority?: "low" | "medium" | "high" | "critical";
  assignedAdminId?: string;
  assignee?: string;
  ticketShort?: string;
};

const brand = "#65a8bf";

const priorityColor: Record<NonNullable<CommItem["priority"]>, string> = {
  low: "gray",
  medium: "blue",
  high: "orange",
  critical: "red",
};

const statusColor: Record<NonNullable<CommItem["status"]>, string> = {
  open: "yellow",
  closed: "green",
  escalated: "purple",
};

const CommunicationsAdminPanel: React.FC = () => {
  const [items, setItems] = React.useState<CommItem[]>([]);
  const { t } = useTranslation() as unknown as { t: (key: string, options?: any) => string };
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [onlyUnread, setOnlyUnread] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [notif, setNotif] = React.useState<string | null>(null);
  const compact = useBreakpointValue({ base: true, sm: false });
  const [saving, setSaving] = React.useState<Record<string, boolean>>({});
  const [editingAssigneeFor, setEditingAssigneeFor] = React.useState<string | null>(null);
  const [assigneeIdDraft, setAssigneeIdDraft] = React.useState<string>("");
  type AdminUser = { id: string; name: string; email: string };
  const [admins, setAdmins] = React.useState<AdminUser[]>([]);

  const getAdminLabel = React.useCallback(
    (id?: string) => {
      if (!id) return undefined;
      const a = admins.find((x) => x.id === id);
      return a ? `${a.name || a.email} (${a.email})` : undefined;
    },
    [admins]
  );

  const fetchItems = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    setNotif(null);
    try {
      const res = await api.get("/admin/communications", {
        params: { q: q || undefined, unread: onlyUnread || undefined },
      });
      const raw = Array.isArray(res.data) ? res.data : res.data?.items || [];
      const normalized: CommItem[] = raw.map((it: CommItem) => ({
        status: "open",
        priority: "medium",
        ...it,
      }));
      setItems(normalized);
    } catch {
      setErr("Failed to load communications");
    } finally {
      setLoading(false);
    }
  }, [q, onlyUnread]);

  React.useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/admins");
        const list = res?.data?.data || [];
        setAdmins(Array.isArray(list) ? list : []);
      } catch {
        setAdmins([]);
      }
    })();
  }, []);

  const patchItem = async (id: string, patch: Partial<CommItem>, successMsg?: string) => {
    try {
      setSaving((s) => ({ ...s, [id]: true }));
      setNotif(null);
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
      await api.patch(`/admin/communications/${encodeURIComponent(id)}`, patch);
      if (successMsg) setNotif(successMsg);
    } catch {
      setErr("Failed to update");
      fetchItems();
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  };

  const toggleRead = async (id: string, next: boolean) => {
    await patchItem(
      id,
      { read: next },
      next ? t("admin.comm.status_read") : t("admin.comm.status_open")
    );
  };

  const setPriority = async (id: string, priority: NonNullable<CommItem["priority"]>) => {
    await api.patch(`/admin/communications/${encodeURIComponent(id)}/priority`, {
      priority: priority.toUpperCase(),
    });
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, priority } : it)));
  };

  const openAssign = (id: string) => {
    setEditingAssigneeFor(id);
    const currentItem = items.find((x) => x.id === id);
    setAssigneeIdDraft(currentItem?.assignedAdminId || "");
  };

  const saveAssign = async () => {
    if (!editingAssigneeFor) return;
    const id = editingAssigneeFor;
    await api.patch(`/admin/communications/${encodeURIComponent(id)}/assign`, {
      assignedAdminId: assigneeIdDraft || undefined,
    });
    const label = getAdminLabel(assigneeIdDraft) || "";
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, assignedAdminId: assigneeIdDraft, assignee: label } : it))
    );
    setEditingAssigneeFor(null);
    setAssigneeIdDraft("");
  };

  const cancelAssign = () => {
    setEditingAssigneeFor(null);
    setAssigneeIdDraft("");
  };

  const closeTicket = async (id: string) => {
    await api.patch(`/admin/communications/${encodeURIComponent(id)}/close`);
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: "closed", read: true } : it)));
  };

  const escalateTicket = async (id: string) => {
    await api.patch(`/admin/communications/${encodeURIComponent(id)}/escalate`);
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: "escalated", priority: "critical" } : it))
    );
  };

  const handleAssigneeChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setAssigneeIdDraft(e.target.value);
  };

  const exportCsv = () => {
    const header = [
      "id",
      "name",
      "email",
      "message",
      "courseId",
      "courseName",
      "locale",
      "url",
      "utm.source",
      "utm.medium",
      "utm.campaign",
      "createdAt",
      "read",
      "status",
      "priority",
      "assignee",
      "ticketShort",
    ].join(",");
    const rows = items.map((it) =>
      [
        it.id,
        JSON.stringify(it.name || ""),
        JSON.stringify(it.email || ""),
        JSON.stringify(it.message || ""),
        JSON.stringify(it.courseId || ""),
        JSON.stringify(it.courseName || ""),
        JSON.stringify(it.locale || ""),
        JSON.stringify(it.url || ""),
        JSON.stringify(it.utm?.source || ""),
        JSON.stringify(it.utm?.medium || ""),
        JSON.stringify(it.utm?.campaign || ""),
        it.createdAt,
        String(!!it.read),
        it.status || "open",
        it.priority || "medium",
        JSON.stringify(it.assignee || ""),
        JSON.stringify((it as any).ticketShort || it.id || ""),
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `communications_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box color="#65a8bf">
      {/* Top controls */}
      <HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
        <HStack gap={2} flexWrap="wrap">
          <Input
            placeholder={t("admin.comm.search_ph", "Search name, email, message…")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            bg="#1A202C"
            color="#65a8bf"
          />
          <Button
            onClick={() => setOnlyUnread((v) => !v)}
            bg={brand}
            color="#65a8bf"
            _hover={{ bg: "#5596a6" }}
          >
            <Icon as={onlyUnread ? EyeOff : Eye} />
          </Button>
          <Button onClick={fetchItems} bg={brand} color="#65a8bf" isLoading={loading}>
            <Icon as={RefreshCcw} />
          </Button>
        </HStack>
        <Button onClick={exportCsv} bg={brand} color="#65a8bf">
          <Icon as={Download} />
        </Button>
      </HStack>

      {/* Error / notification */}
      {err && <Text color="red.500" mb={2}>{err}</Text>}
      {notif && <Text color="green.400" mb={2}>{notif}</Text>}

      {loading ? (
        <HStack>
          <Spinner size="sm" />
          <Text>Loading…</Text>
        </HStack>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          {items.map((it) => (
            <Box
              key={it.id}
              borderWidth={1}
              borderColor={it.read ? "gray.600" : brand}
              borderRadius="lg"
              p={4}
              bg={it.read ? "transparent" : "rgba(182, 233, 255,0.06)"}
              opacity={saving[it.id] ? 0.7 : 1}
            >
              {/* Header */}
              <HStack justify="space-between" align="start" mb={2} wrap="wrap">
                <HStack gap={2} wrap="wrap">
                  <Text fontWeight="bold">{it.name}</Text>
                  <Badge colorScheme="cyan">{it.locale || "—"}</Badge>
                  {!it.read && <Badge colorScheme="yellow">NEW</Badge>}
                  {it.status && (
                    <Badge colorScheme={statusColor[it.status] || "gray"}>
                      {it.status.toUpperCase()}
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs">{new Date(it.createdAt).toLocaleString()}</Text>
              </HStack>

              {/* Email / Course / Message */}
              <VStack align="start" gap={2}>
                <HStack>
                  <Icon as={Mail} />
                  <Link href={`mailto:${it.email}`} color="#65a8bf">{it.email}</Link>
                </HStack>
                <Box>
                  <Text fontSize="sm" opacity={0.7}>Course</Text>
                  <Text>
                    {it.courseName || "—"}
                    {it.courseId && (
                      <Text as="span" opacity={0.6} fontSize="xs">
                        {" "}({it.courseId})
                      </Text>
                    )}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" opacity={0.7} mb={1}>Message</Text>
                  <Text
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {it.message}
                  </Text>
                </Box>
              </VStack>

              {/* Ticket + priority + assignee */}
              <Box mt={3}>
                <Grid templateColumns={{ base: "1fr", md: "1fr auto" }} gap={2} alignItems="center">
                  {/* Left cluster */}
                  <Wrap gap="6px" align="center">
                    <WrapItem>
                      <Badge variant="outline" borderColor={brand}>
                        Ticket: {it.ticketShort || it.id}
                      </Badge>
                    </WrapItem>
                    {(["low","medium","high","critical"] as const).map((p) => (
                      <WrapItem key={p}>
                        <Button
                          size="xs"
                          px={2}
                          variant={it.priority === p ? "solid" : "outline"}
                          onClick={() => setPriority(it.id, p)}
                        >
                          <Badge colorScheme={priorityColor[p]}>{p.toUpperCase()}</Badge>
                        </Button>
                      </WrapItem>
                    ))}
                    {editingAssigneeFor === it.id ? (
                      <HStack spacing={2}>
                        <chakra.select
                          value={assigneeIdDraft}
                          onChange={handleAssigneeChange}
                          bg="gray.800"
                          color="#65a8bf"
                          px={2} py={1}
                          borderRadius="md"
                        >
                          <option value="">Select assignee</option>
                          {admins.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name || a.email}
                            </option>
                          ))}
                        </chakra.select>
                        <Button size="xs" onClick={saveAssign}>Save</Button>
                        <Button size="xs" variant="outline" onClick={cancelAssign}>Cancel</Button>
                      </HStack>
                    ) : (
                      <Button size="xs" variant="outline" onClick={() => openAssign(it.id)}>
                        {it.assignedAdminId ? `Assignee: ${getAdminLabel(it.assignedAdminId)}` : "Assign…"}
                      </Button>
                    )}
                  </Wrap>

                  {/* Right cluster */}
                  <Wrap gap={2} justify="flex-end">
                    <Button size="xs" colorScheme="red" onClick={() => escalateTicket(it.id)} leftIcon={<ShieldAlert />}>
                      {!compact && "Escalate"}
                    </Button>
                    <Button size="xs" colorScheme="green" onClick={() => closeTicket(it.id)} leftIcon={<AlertTriangle />}>
                      {!compact && "Close"}
                    </Button>
                  </Wrap>
                </Grid>
              </Box>

              {/* Action buttons */}
              <HStack mt={3} spacing={2}>
                <Button size="sm" bg={brand} onClick={() => toggleRead(it.id, !it.read)} leftIcon={it.read ? <EyeOff /> : <Eye />} color="#65a8bf">
                  {it.read ? "Mark unread" : "Mark read"}
                </Button>
                <Button size="sm" bg={brand} color="#65a8bf" onClick={() => window.open(`mailto:${it.email}`)} leftIcon={<MessageSquare />}>
                  Reply
                </Button>
                <Button size="sm" bg={brand} color="#65a8bf" onClick={() => window.open(`https://wa.me/`)} leftIcon={<PhoneCall />}>
                  WhatsApp
                </Button>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {!loading && !items.length && <Text color="gray.400">No messages</Text>}
    </Box>
  );
};

export default CommunicationsAdminPanel;
