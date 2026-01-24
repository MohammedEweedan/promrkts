/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import {
  Box,
  Button,
  HStack,
  VStack,
  Heading,
  Input,
  Text,
  Icon,
  SimpleGrid,
} from "@chakra-ui/react";
import { Plus, RefreshCcw, Trash2, Save } from "lucide-react";
import api from "../../api/client";
import { useTranslation } from "react-i18next";

const brand = "#65a8bf";

type Promo = {
  id: string;
  code: string;
  discountType: "PERCENT" | "AMOUNT";
  value: number;
  startsAt?: string | null;
  endsAt?: string | null;
  maxGlobalRedemptions?: number | null;
  maxPerUser?: number | null;
  minSpendUsd?: number | null;
  applicableTierIds?: string[] | null;
  active: boolean;
  createdAt: string;
  usedCount?: number; // 👈 NEW
  revenueFromPromoUsd?: number; // 👈 optional, if you used it
};

const PromoAdminPanel: React.FC = () => {
  const [items, setItems] = React.useState<Promo[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { t } = useTranslation();

  const [form, setForm] = React.useState<Partial<Promo>>({
    code: "",
    discountType: "PERCENT",
    value: 10,
    startsAt: "",
    endsAt: "",
    maxGlobalRedemptions: null,
    maxPerUser: 1,
    minSpendUsd: null,
    applicableTierIds: [],
    active: true,
  });

  // Load list: read r.data.data
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/admin/promos");
      setItems(Array.isArray(r.data?.data) ? r.data.data : []); // 👈 fix
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    const payload: any = { ...form };
    if (!payload.code) return;

    // normalize empties to null/undefined
    payload.startsAt = payload.startsAt ? payload.startsAt : null;
    payload.endsAt = payload.endsAt ? payload.endsAt : null;

    await api.post("/admin/promos", payload);
    setForm({ code: "", discountType: "PERCENT", value: 10, maxPerUser: 1, active: true });
    load();
  };

  const updateField = (k: keyof Promo, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const toggleActive = async (it: Promo) => {
    await api.patch(`/admin/promos/${it.id}`, { active: !it.active }); // 👈 PATCH
    load();
  };

  const del = async (id: string) => {
    if (!window.confirm("Delete promo?")) return;
    await api.delete(`/admin/promos/${id}`);
    load();
  };

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="md">Promo Codes</Heading>
        <Button onClick={load} variant="solid" bg="#65a8bf">
          <Icon as={RefreshCcw} style={{ marginRight: 8 }} />
          {t('admin.refresh')}
        </Button>
      </HStack>

      {/* Create form */}
      <Box borderWidth={1} borderColor={brand} borderRadius="lg" p={4} mb={6}>
        <Heading size="sm" mb={3}>
          {t('admin.createPromo')}
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
          <Input
            placeholder={t('admin.code')}
            value={form.code || ""}
            onChange={(e) => updateField("code", e.target.value.toUpperCase())}
          />
          <Input
            placeholder={t('admin.discountType')}
            value={form.discountType || "PERCENT"}
            onChange={(e) => updateField("discountType", (e.target.value || "PERCENT") as any)}
          />
          <Input
            type="number"
            placeholder={form.discountType === "AMOUNT" ? "Amount" : "%"}
            value={form.value as any}
            onChange={(e) => updateField("value", Number(e.target.value))}
          />
          <Input
            type="datetime-local"
            value={(form.startsAt as any) || ""}
            onChange={(e) => updateField("startsAt", e.target.value)}
          />
          <Input
            type="datetime-local"
            value={(form.endsAt as any) || ""}
            onChange={(e) => updateField("endsAt", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Min spend USD"
            value={form.minSpendUsd as any}
            onChange={(e) =>
              updateField("minSpendUsd", e.target.value ? Number(e.target.value) : null)
            }
          />
          <Input
            type="number"
            placeholder="Max global uses"
            value={form.maxGlobalRedemptions as any}
            onChange={(e) =>
              updateField("maxGlobalRedemptions", e.target.value ? Number(e.target.value) : null)
            }
          />
          <Input
            type="number"
            placeholder="Max per user"
            value={form.maxPerUser as any}
            onChange={(e) =>
              updateField("maxPerUser", e.target.value ? Number(e.target.value) : null)
            }
          />
          <Input
            placeholder="Applicable tier IDs (comma-separated)"
            value={(form.applicableTierIds || []).join(",")}
            onChange={(e) =>
              updateField(
                "applicableTierIds",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
          />
          <HStack>
            <Button onClick={() => updateField("active", !form.active)} variant="solid" bg="#65a8bf">
              {form.active ? "Active" : "Paused"}
            </Button>
            <Button onClick={create} bg="#65a8bf" variant="solid">
              <Icon as={Plus} style={{ marginRight: 8 }} /> {t('admin.create')}
            </Button>
          </HStack>
        </SimpleGrid>
      </Box>

      {/* List */}
      <VStack align="stretch" gap={3}>
        {items.map((p) => (
          <Box key={p.id} borderWidth={1} borderRadius="lg" p={3}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={1}>
                <HStack gap={3}>
                  <Text fontWeight={700}>{p.code}</Text>
                  <Text fontSize="sm">
                    {p.discountType} {p.discountType === "PERCENT" ? `${p.value}%` : `$${p.value}`}
                  </Text>
                  <Text fontSize="sm">{p.active ? "Active" : "Paused"}</Text>
                </HStack>
                <Text fontSize="xs">
                  used {p.usedCount ?? 0}
                  {p.maxGlobalRedemptions ? ` / ${p.maxGlobalRedemptions}` : ""} • min $
                  {p.minSpendUsd ?? "—"} • global {p.maxGlobalRedemptions ?? "—"} • per-user{" "}
                  {p.maxPerUser ?? "—"}
                </Text>
                {typeof p.revenueFromPromoUsd === "number" && (
                  <Text fontSize="xs">revenue via promo ${p.revenueFromPromoUsd.toFixed(2)}</Text>
                )}
                <Text fontSize="xs">
                  min ${p.minSpendUsd ?? "—"} • global {p.maxGlobalRedemptions ?? "—"} • per-user{" "}
                  {p.maxPerUser ?? "—"}
                </Text>
              </VStack>
              <HStack>
                <Button size="xs" variant="solid" bg="#65a8bf" onClick={() => toggleActive(p)}>
                  <Icon as={Save} style={{ marginRight: 6 }} /> {p.active ? "Pause" : "Activate"}
                </Button>
                <Button size="xs" variant="solid" bg="#65a8bf" onClick={() => del(p.id)}>
                  <Icon as={Trash2} style={{ marginRight: 6 }} /> Delete
                </Button>
              </HStack>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default PromoAdminPanel;
