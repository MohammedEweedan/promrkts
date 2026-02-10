import React from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Input,
  Textarea,
  Text,
  Icon,
  chakra,
  Image,
  Badge,
  SimpleGrid,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  useToast,
} from "@chakra-ui/react";
import {
  FilePlus2,
  Save,
  Upload,
  Trash2,
  Pencil,
  Layers,
  Film,
  Share2,
  BookOpen,
} from "lucide-react";
import api from "../../api/client";
import { useThemeMode } from "../../themeProvider";
import { useTranslation } from "react-i18next";

const CInput = chakra(Input);
const CSelect = chakra("select");

export type ContentAdminPanelProps = {
  isAdmin?: boolean;
  apiClient?: typeof api;
  autoLoad?: boolean;
  initialTiers?: Tier[];
  initialBanners?: Banner[];
  onTiersChange?: (tiers: Tier[]) => void;
  onBannersChange?: (banners: Banner[]) => void;
  initialTab?: "content" | "banners";
};

type Tier = {
  id?: string;
  name: string;
  description: string;
  imageUrl?: string;
  price_usdt: number | string;
  price_stripe: number | string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  trailerUrl?: string;
  previewUrl?: string;
  instructorName?: string;
  instructorBio?: string;
  instructorAvatarUrl?: string;
  telegramEmbedUrl?: string;
  telegramUrl?: string;
  discordWidgetId?: string;
  discordInviteUrl?: string;
  twitterTimelineUrl?: string;
  href?: string;
  isVipProduct?: boolean;
  vipType?: "telegram" | "discord";
  isBundle?: boolean;
  bundleTierIds?: string[];
  bundleLabel?: string;
};

type Banner = {
  id?: string | number;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  href?: string;
};

const GOLD = "#65a8bf";

/* ------------------------------------------------------------------ */
/* Tier Editor (full)                                                  */
/* ------------------------------------------------------------------ */
function EditTierModal(props: {
  isOpen: boolean;
  onClose: () => void;
  tier: Tier | null;
  setTier: (t: Tier) => void;
  onSave: () => Promise<void>;
  onDelete?: () => Promise<void>;
  saving: boolean;
  // materials
  resources?: any[];
  onLoadResources?: () => Promise<void>;
  onUploadPdf?: (f: File) => Promise<void>;
  onUploadVideo?: (f: File) => Promise<void>;
  onRemoveResource?: (rid: string) => Promise<void>;
}) {
  const { t } = useTranslation() as any;
  const {
    isOpen,
    onClose,
    tier,
    setTier,
    onSave,
    onDelete,
    saving,
    resources,
    onLoadResources,
    onUploadPdf,
    onUploadVideo,
    onRemoveResource,
  } = props;
  if (!tier) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack justify="space-between">
            <HStack>
              <Icon as={Pencil} />
              <Text>{t("admin.edit_tier", "Edit Course")}</Text>
              {tier.id && <Badge colorScheme="yellow">#{tier.id}</Badge>}
            </HStack>
            <Badge>{tier.level}</Badge>
          </HStack>
        </ModalHeader>
        <ModalBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <VStack align="stretch" spacing={3}>
              <CInput
                placeholder={t("common.name", "Name")}
                value={tier.name}
                onChange={(e: any) => setTier({ ...tier, name: e.target.value })}
              />
              <Select
                value={tier.level}
                onChange={(e) => setTier({ ...tier, level: e.target.value as any })}
              >
                <option value="BEGINNER">{t("course.level.beginner", "BEGINNER")}</option>
                <option value="INTERMEDIATE">
                  {t("course.level.intermediate", "INTERMEDIATE")}
                </option>
                <option value="ADVANCED">{t("course.level.advanced", "ADVANCED")}</option>
              </Select>

              <HStack>
                <CInput
                  placeholder={t("common.price_usdt", "USDT")}
                  value={tier.price_usdt}
                  onChange={(e: any) => setTier({ ...tier, price_usdt: e.target.value })}
                />
                <CInput
                  placeholder={t("common.price_stripe", "Stripe cents")}
                  value={tier.price_stripe}
                  onChange={(e: any) => setTier({ ...tier, price_stripe: e.target.value })}
                />
              </HStack>

              {/* MEDIA (Trailer/Preview URLs) */}
              <CInput
                placeholder={t("admin.trailer_url", "Trailer URL")}
                value={tier.trailerUrl || ""}
                onChange={(e: any) => setTier({ ...tier, trailerUrl: e.target.value })}
              />
              <CInput
                placeholder={t("admin.preview_url", "Preview URL")}
                value={tier.previewUrl || ""}
                onChange={(e: any) => setTier({ ...tier, previewUrl: e.target.value })}
              />

              <Textarea
                placeholder={t("common.description", "Description")}
                value={tier.description}
                onChange={(e) => setTier({ ...tier, description: (e.target as any).value })}
              />
            </VStack>

            <VStack align="stretch" spacing={3}>
              {/* INSTRUCTOR */}
              <CInput
                placeholder={t("instructor.name", "Instructor Name")}
                value={tier.instructorName || ""}
                onChange={(e: any) => setTier({ ...tier, instructorName: e.target.value })}
              />
              <HStack align="start">
                <CInput
                  placeholder={t("instructor.avatar_url", "Instructor Avatar URL")}
                  value={tier.instructorAvatarUrl || ""}
                  onChange={(e: any) => setTier({ ...tier, instructorAvatarUrl: e.target.value })}
                />
                {tier.instructorAvatarUrl && (
                  <Image
                    src={tier.instructorAvatarUrl}
                    alt="instructor"
                    boxSize="56px"
                    borderRadius="md"
                    objectFit="cover"
                  />
                )}
              </HStack>
              <Textarea
                placeholder={t("instructor.bio", "Instructor Bio")}
                value={tier.instructorBio || ""}
                onChange={(e) => setTier({ ...tier, instructorBio: (e.target as any).value })}
              />

              {/* SOCIALS (Telegram/Discord/Twitter) */}
              <CInput
                placeholder={t("social.telegram_embed", "Telegram embed URL")}
                value={tier.telegramEmbedUrl || ""}
                onChange={(e: any) => setTier({ ...tier, telegramEmbedUrl: e.target.value })}
              />
              <CInput
                placeholder={t("social.telegram_join", "Telegram join URL")}
                value={tier.telegramUrl || ""}
                onChange={(e: any) => setTier({ ...tier, telegramUrl: e.target.value })}
              />
              <HStack>
                <CInput
                  placeholder={t("social.discord_widget", "Discord widget ID")}
                  value={tier.discordWidgetId || ""}
                  onChange={(e: any) => setTier({ ...tier, discordWidgetId: e.target.value })}
                />
                <CInput
                  placeholder={t("social.discord_invite", "Discord invite URL")}
                  value={tier.discordInviteUrl || ""}
                  onChange={(e: any) => setTier({ ...tier, discordInviteUrl: e.target.value })}
                />
              </HStack>
              <CInput
                placeholder={t("social.twitter_timeline", "X/Twitter timeline URL")}
                value={tier.twitterTimelineUrl || ""}
                onChange={(e: any) => setTier({ ...tier, twitterTimelineUrl: e.target.value })}
              />
            </VStack>
          </SimpleGrid>

          <Divider my={4} />

          {/* MATERIALS */}
          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between">
              <HStack>
                <Icon as={Layers} />
                <Heading size="sm">{t("materials.title", "Materials")}</Heading>
              </HStack>
              <HStack>
                {onLoadResources && (
                  <Button size="sm" variant="solid" bg={GOLD} onClick={onLoadResources}>
                    {t("materials.load", "Load Materials")}
                  </Button>
                )}
                {onUploadPdf && (
                  <Button
                    as="label"
                    size="sm"
                    variant="solid"
                    bg={GOLD}
                    leftIcon={<Icon as={Upload} />}
                  >
                    {t("materials.upload_pdf", "Upload PDF")}
                    <Input
                      type="file"
                      accept="application/pdf"
                      display="none"
                      onChange={(e: any) => {
                        const f = e.target.files?.[0];
                        if (f) onUploadPdf(f);
                        e.target.value = "";
                      }}
                    />
                  </Button>
                )}
                {onUploadVideo && (
                  <Button
                    as="label"
                    size="sm"
                    variant="solid"
                    bg={GOLD}
                    leftIcon={<Icon as={Upload} />}
                  >
                    {t("materials.upload_video", "Upload Video")}
                    <Input
                      type="file"
                      accept="video/*"
                      display="none"
                      onChange={(e: any) => {
                        const f = e.target.files?.[0];
                        if (f) onUploadVideo(f);
                        e.target.value = "";
                      }}
                    />
                  </Button>
                )}
              </HStack>
            </HStack>

            <VStack align="stretch" spacing={2} maxH="220px" overflow="auto" pr={1}>
              {Array.isArray(resources) && resources.length > 0 ? (
                resources.map((r: any) => (
                  <HStack
                    key={r.id}
                    justify="space-between"
                    borderWidth="1px"
                    borderRadius="md"
                    p={2}
                  >
                    <HStack>
                      <Badge>{String(r.type).toUpperCase()}</Badge>
                      <Text fontSize="sm" maxW="520px" noOfLines={1}>
                        {r.url}
                      </Text>
                    </HStack>
                    {onRemoveResource && (
                      <Button
                        size="xs"
                        variant="solid"
                        bg="red.500"
                        onClick={() => onRemoveResource(r.id)}
                      >
                        {t("common.delete", "Delete")}
                      </Button>
                    )}
                  </HStack>
                ))
              ) : (
                <Text fontSize="sm" color="gray.500">
                  {t("materials.none", 'No materials loaded. Click "Load Materials".')}
                </Text>
              )}
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack w="100%" justify="flex-end" gap={3}>
            {onDelete && tier.id && (
              <Button
                size="sm"
                variant="solid"
                bg="red.500"
                isDisabled={saving}
                onClick={onDelete}
                leftIcon={<Icon as={Trash2} />}
              >
                {t("common.delete", "Delete")}
              </Button>
            )}
            <Button size="sm" variant="solid" bg="gray.500" onClick={onClose}>
              {t("common.close", "Close")}
            </Button>
            <Button
              size="sm"
              variant="solid"
              bg={GOLD}
              color="#1a1a1a"
              isDisabled={saving}
              onClick={onSave}
              leftIcon={<Icon as={Save} />}
            >
              {t("common.save", "Save")}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Media Modal (Trailer/Preview uploads + direct URLs)                 */
/* ------------------------------------------------------------------ */
function MediaModal(props: {
  isOpen: boolean;
  onClose: () => void;
  tier: Tier | null;
  setTier: (t: Tier) => void;
  onUpload: (f: File) => Promise<string>;
  onCommit: (t: Tier) => Promise<void>;
  saving?: boolean;
}) {
  const { t } = useTranslation() as any;
  const { isOpen, onClose, tier, setTier, onUpload, onCommit, saving } = props;
  if (!tier) return null;

  const uploadAndSet = async (file: File, field: "trailerUrl" | "previewUrl") => {
    const url = await onUpload(file);
    setTier({ ...tier, [field]: url });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={Film} />
            <Text>{t("admin.media", "Media")}</Text>
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text mb={2} fontWeight="semibold">
                {t("admin.trailer_url", "Trailer URL")}
              </Text>
              <HStack>
                <CInput
                  placeholder="https://…"
                  value={tier.trailerUrl || ""}
                  onChange={(e: any) => setTier({ ...tier, trailerUrl: e.target.value })}
                />
                <Button as="label" variant="outline" leftIcon={<Icon as={Upload} />}>
                  {t("admin.upload_trailer", "Upload Trailer")}
                  <Input
                    type="file"
                    accept="video/*"
                    display="none"
                    onChange={async (e: any) => {
                      const f = e.target.files?.[0];
                      if (f) await uploadAndSet(f, "trailerUrl");
                      e.target.value = "";
                    }}
                  />
                </Button>
              </HStack>
            </Box>

            <Box>
              <Text mb={2} fontWeight="semibold">
                {t("admin.preview_url", "Preview URL")}
              </Text>
              <HStack>
                <CInput
                  placeholder="https://…"
                  value={tier.previewUrl || ""}
                  onChange={(e: any) => setTier({ ...tier, previewUrl: e.target.value })}
                />
                <Button as="label" variant="outline" leftIcon={<Icon as={Upload} />}>
                  {t("admin.upload_preview", "Upload Preview")}
                  <Input
                    type="file"
                    accept="video/*"
                    display="none"
                    onChange={async (e: any) => {
                      const f = e.target.files?.[0];
                      if (f) await uploadAndSet(f, "previewUrl");
                      e.target.value = "";
                    }}
                  />
                </Button>
              </HStack>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack justify="flex-end" w="100%" gap={3}>
            <Button variant="ghost" onClick={onClose}>
              {t("common.close", "Close")}
            </Button>
            <Button
              bg={GOLD}
              color="#1a1a1a"
              isDisabled={saving}
              onClick={() => tier && onCommit(tier)}
              leftIcon={<Icon as={Save} />}
            >
              {t("common.save", "Save")}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Socials Modal (Telegram/Discord/Twitter)                            */
/* ------------------------------------------------------------------ */
function SocialsModal(props: {
  isOpen: boolean;
  onClose: () => void;
  tier: Tier | null;
  setTier: (t: Tier) => void;
  onCommit: (t: Tier) => Promise<void>;
  saving?: boolean;
}) {
  const { t } = useTranslation() as any;
  const { isOpen, onClose, tier, setTier, onCommit, saving } = props;
  if (!tier) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={Share2} />
            <Text>{t("admin.socials", "Socials")}</Text>
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack align="stretch" spacing={3}>
            <CInput
              placeholder={t("social.telegram_embed", "Telegram embed URL")}
              value={tier.telegramEmbedUrl || ""}
              onChange={(e: any) => setTier({ ...tier, telegramEmbedUrl: e.target.value })}
            />
            <CInput
              placeholder={t("social.telegram_join", "Telegram join URL")}
              value={tier.telegramUrl || ""}
              onChange={(e: any) => setTier({ ...tier, telegramUrl: e.target.value })}
            />
            <HStack>
              <CInput
                placeholder={t("social.discord_widget", "Discord widget ID")}
                value={tier.discordWidgetId || ""}
                onChange={(e: any) => setTier({ ...tier, discordWidgetId: e.target.value })}
              />
              <CInput
                placeholder={t("social.discord_invite", "Discord invite URL")}
                value={tier.discordInviteUrl || ""}
                onChange={(e: any) => setTier({ ...tier, discordInviteUrl: e.target.value })}
              />
            </HStack>
            <CInput
              placeholder={t("social.twitter_timeline", "X/Twitter timeline URL")}
              value={tier.twitterTimelineUrl || ""}
              onChange={(e: any) => setTier({ ...tier, twitterTimelineUrl: e.target.value })}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack justify="flex-end" w="100%" gap={3}>
            <Button variant="ghost" onClick={onClose}>
              {t("common.close", "Close")}
            </Button>
            <Button
              bg={GOLD}
              color="#1a1a1a"
              isDisabled={saving}
              onClick={() => tier && onCommit(tier)}
              leftIcon={<Icon as={Save} />}
            >
              {t("common.save", "Save")}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Banner Editor                                                       */
/* ------------------------------------------------------------------ */
function EditBannerModal(props: {
  isOpen: boolean;
  onClose: () => void;
  banner: Banner | null;
  setBanner: (b: Banner) => void;
  onSave: () => Promise<void>;
  onDelete?: () => Promise<void>;
  saving: boolean;
  onUploadImage: (f: File) => Promise<void>;
}) {
  const { t } = useTranslation() as any;
  const { isOpen, onClose, banner, setBanner, onSave, onDelete, saving, onUploadImage } = props;
  if (!banner) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={Pencil} />
            <Text>{t("admin.edit_banner", "Edit Banner")}</Text>
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack align="stretch" spacing={3}>
            <CInput
              placeholder={t("common.title", "Title")}
              value={banner.title || ""}
              onChange={(e: any) => setBanner({ ...banner, title: e.target.value })}
            />
            <CInput
              placeholder={t("common.subtitle", "Subtitle")}
              value={banner.subtitle || ""}
              onChange={(e: any) => setBanner({ ...banner, subtitle: e.target.value })}
            />
            <CInput
              placeholder={t("common.badge", "Badge")}
              value={banner.badge || ""}
              onChange={(e: any) => setBanner({ ...banner, badge: e.target.value })}
            />
            <CInput
              placeholder={t("common.href", "Href (link)")}
              value={banner.href || ""}
              onChange={(e: any) => setBanner({ ...banner, href: e.target.value })}
            />
            <HStack align="center">
              <Button as="label" variant="outline" leftIcon={<Icon as={Upload} />}>
                {t("common.select_image", "Select image…")}
                <Input
                  type="file"
                  accept="image/*"
                  display="none"
                  onChange={async (e: any) => {
                    const f = e.target.files?.[0];
                    if (f) await onUploadImage(f);
                    e.target.value = "";
                  }}
                />
              </Button>
              {banner.imageUrl ? (
                <HStack>
                  <Image
                    src={banner.imageUrl}
                    alt={t("common.preview", "preview")}
                    boxSize="56px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                  <Text fontSize="xs" maxW="260px" noOfLines={1}>
                    {banner.imageUrl}
                  </Text>
                </HStack>
              ) : (
                <Text fontSize="sm" color="gray.500">
                  {t("admin.no_image", "No image selected.")}
                </Text>
              )}
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack w="100%" justify="flex-end" gap={3}>
            {onDelete && banner.id && (
              <Button
                size="sm"
                variant="solid"
                colorScheme="red"
                isDisabled={saving}
                onClick={onDelete}
                leftIcon={<Icon as={Trash2} />}
              >
                {t("common.delete", "Delete")}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onClose}>
              {t("common.close", "Close")}
            </Button>
            <Button
              size="sm"
              bg={GOLD}
              color="#1a1a1a"
              isDisabled={saving}
              onClick={onSave}
              leftIcon={<Icon as={Save} />}
            >
              {t("common.save", "Save")}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Main Panel                                                          */
/* ------------------------------------------------------------------ */
const ContentAdminPanel: React.FC<ContentAdminPanelProps> = ({
  isAdmin = false,
  apiClient = api,
  autoLoad = true,
  initialTiers = [],
  initialBanners = [],
  onTiersChange,
  onBannersChange,
  initialTab = "content",
}) => {
  const { t } = useTranslation() as any;
  const toast = useToast();
  const [saving, setSaving] = React.useState(false);
  const { mode } = useThemeMode();

  const [tiers, setTiers] = React.useState<Tier[]>(initialTiers);
  const [newTier, setNewTier] = React.useState<Tier>({
    name: "",
    description: "",
    price_usdt: "",
    price_stripe: "",
    level: "BEGINNER",
    trailerUrl: "",
    previewUrl: "",
  });

  const [resourcesByTier, setResourcesByTier] = React.useState<Record<string, any[]>>({});
  const [showNewTier, setShowNewTier] = React.useState(false);
  const [newPdfFiles, setNewPdfFiles] = React.useState<File[]>([]);
  const [newVideoFiles, setNewVideoFiles] = React.useState<File[]>([]);

  const [banners, setBanners] = React.useState<Banner[]>(initialBanners);
  const [newBanner, setNewBanner] = React.useState<Banner>({
    imageUrl: "",
    title: "",
    subtitle: "",
    badge: "",
    href: "",
  });
  const [showNewBanner, setShowNewBanner] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"content" | "banners">(initialTab);

  const vipTelegramTier = React.useMemo(() => {
    return (tiers || []).find((x: any) => x?.isVipProduct && x?.vipType === "telegram") || null;
  }, [tiers]);
  const vipDiscordTier = React.useMemo(() => {
    return (tiers || []).find((x: any) => x?.isVipProduct && x?.vipType === "discord") || null;
  }, [tiers]);
  const [vipTelegramUsd, setVipTelegramUsd] = React.useState<string>("");
  const [vipTelegramStripe, setVipTelegramStripe] = React.useState<string>("");
  const [vipDiscordUsd, setVipDiscordUsd] = React.useState<string>("");
  const [vipDiscordStripe, setVipDiscordStripe] = React.useState<string>("");

  // New Bundle form
  const [bundleName, setBundleName] = React.useState("");
  const [bundleDesc, setBundleDesc] = React.useState("");
  const [bundleUsd, setBundleUsd] = React.useState("");
  const [bundleStripe, setBundleStripe] = React.useState("");
  const [bundleTierIds, setBundleTierIds] = React.useState<string[]>([]);

  // Editors
  const tierEditDisc = useDisclosure();
  const [editingTier, setEditingTier] = React.useState<Tier | null>(null);
  const [editingTierLocal, setEditingTierLocal] = React.useState<Tier | null>(null);

  const mediaDisc = useDisclosure();
  const [mediaTierLocal, setMediaTierLocal] = React.useState<Tier | null>(null);

  const socialsDisc = useDisclosure();
  const [socialsTierLocal, setSocialsTierLocal] = React.useState<Tier | null>(null);

  const bannerEditDisc = useDisclosure();
  const [editingBanner, setEditingBanner] = React.useState<Banner | null>(null);
  const [editingBannerLocal, setEditingBannerLocal] = React.useState<Banner | null>(null);

  // Load initial
  React.useEffect(() => {
    if (!autoLoad) return;
    (async () => {
      try {
        // Load both courses and subscriptions, then merge
        const [coursesRes, subsRes] = await Promise.all([
          apiClient.get("/courses").catch(() => ({ data: [] })),
          apiClient.get("/subscriptions").catch(() => ({ data: [] })),
        ]);
        const courses = Array.isArray(coursesRes?.data) ? coursesRes.data : [];
        const subs = Array.isArray(subsRes?.data) ? subsRes.data : [];
        const combined = [...courses, ...subs];
        setTiers(combined);
        onTiersChange?.(combined);
      } catch {}
      try {
        const bRes = await apiClient.get("/content/banners");
        const data = (bRes?.data?.data || []) as any[];
        const mapped = data.map((r) => ({
          id: r.id,
          imageUrl: r.imageUrl || r.image_url,
          title: r.title,
          subtitle: r.subtitle,
          badge: r.badge,
          href: r.href,
        }));
        setBanners(mapped);
        onBannersChange?.(mapped);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, apiClient]);

  React.useEffect(() => {
    if (vipTelegramTier) {
      setVipTelegramUsd(String(vipTelegramTier.price_usdt ?? ""));
      setVipTelegramStripe(String(vipTelegramTier.price_stripe ?? ""));
    }
  }, [vipTelegramTier]);

  React.useEffect(() => {
    if (vipDiscordTier) {
      setVipDiscordUsd(String(vipDiscordTier.price_usdt ?? ""));
      setVipDiscordStripe(String(vipDiscordTier.price_stripe ?? ""));
    }
  }, [vipDiscordTier]);

  // Helpers
  const onUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post("/upload/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data?.url as string;
  };

  const loadResources = async (tierId: string) => {
    if (!tierId) return;
    try {
      const { data } = await apiClient.get(`/courses/${tierId}`);
      const items = Array.isArray(data?.resources) ? data.resources : [];
      setResourcesByTier((prev) => ({ ...prev, [tierId]: items }));
    } catch {}
  };

  const addResource = async (tierId: string, file: File, forcedType?: "pdf" | "video") => {
    if (!tierId || !file) return;
    const url = await onUpload(file);
    const type: "pdf" | "video" = forcedType || (file.type.includes("pdf") ? "pdf" : "video");
    const { data } = await apiClient.post(`/courses/${tierId}/resources`, { type, url });
    const next = { ...resourcesByTier, [tierId]: [...(resourcesByTier[tierId] || []), data] };
    setResourcesByTier(next);
  };

  const removeResource = async (rid: string, tierId: string) => {
    if (!rid) return;
    await apiClient.delete(`/courses/resources/${rid}`);
    setResourcesByTier((prev) => ({
      ...prev,
      [tierId]: (prev[tierId] || []).filter((r) => r.id !== rid),
    }));
  };

  // Tier CRUD
  const createTier = async () => {
    setSaving(true);
    try {
      const payload = {
        ...newTier,
        price_usdt: Number(newTier.price_usdt || 0),
        price_stripe: Number(newTier.price_stripe || 0),
      };
      const { data } = await apiClient.post("/courses", payload);
      const created = data;
      const next = [...tiers, created];
      setTiers(next);
      onTiersChange?.(next);

      if (created?.id) {
        for (const f of newPdfFiles) {
          const url = await onUpload(f);
          await apiClient.post(`/courses/${created.id}/resources`, { type: "pdf", url });
        }
        for (const f of newVideoFiles) {
          const url = await onUpload(f);
          await apiClient.post(`/courses/${created.id}/resources`, { type: "video", url });
        }
      }

      setNewTier({
        name: "",
        description: "",
        price_usdt: "",
        price_stripe: "",
        level: "BEGINNER",
        trailerUrl: "",
        previewUrl: "",
      });
      setNewPdfFiles([]);
      setNewVideoFiles([]);
      toast({ title: t("common.created", "Created"), status: "success" });
    } finally {
      setSaving(false);
    }
  };

  const updateTierRow = async (tier: Tier) => {
    if (!tier.id) return;
    setSaving(true);
    try {
      const payload = {
        ...tier,
        price_usdt: Number(tier.price_usdt || 0),
        price_stripe: Number(tier.price_stripe || 0),
      };
      const { data } = await apiClient.put(`/courses/${tier.id}`, payload);
      const next = tiers.map((t) => (t.id === tier.id ? data : t));
      setTiers(next);
      onTiersChange?.(next);
      toast({ title: t("common.saved", "Saved"), status: "success" });
    } finally {
      setSaving(false);
    }
  };

  const deleteTierRow = async (id?: string) => {
    if (!id) return;
    setSaving(true);
    try {
      await apiClient.delete(`/courses/${id}`);
      const next = tiers.filter((t) => t.id !== id);
      setTiers(next);
      onTiersChange?.(next);
      toast({ title: t("common.deleted", "Deleted"), status: "info" });
    } finally {
      setSaving(false);
    }
  };

  // Banner CRUD
  const createBanner = async () => {
    setSaving(true);
    try {
      const { data } = await apiClient.post("/admin/content/banner", newBanner);
      const created = data?.data || null;
      if (created) {
        const mapped = { ...created, imageUrl: created.imageUrl };
        const next = [mapped, ...banners];
        setBanners(next);
        onBannersChange?.(next);
        setNewBanner({ imageUrl: "", title: "", subtitle: "", badge: "", href: "" });
        toast({ title: t("common.created", "Created"), status: "success" });
      }
    } finally {
      setSaving(false);
    }
  };

  const updateBannerRow = async (b: Banner) => {
    if (!b.id) return;
    setSaving(true);
    try {
      const { data } = await apiClient.put(`/admin/content/banner/${b.id}` as string, b as any);
      const updated = data?.data || null;
      if (updated) {
        const next = banners.map((x) => (x.id === b.id ? { ...x, ...updated } : x));
        setBanners(next);
        onBannersChange?.(next);
        toast({ title: t("common.saved", "Saved"), status: "success" });
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteBannerRow = async (id?: string | number) => {
    if (!id) return;
    setSaving(true);
    try {
      await apiClient.delete(`/admin/content/banner/${id}` as string);
      const next = banners.filter((x) => x.id !== id);
      setBanners(next);
      onBannersChange?.(next);
      toast({ title: t("common.deleted", "Deleted"), status: "info" });
    } finally {
      setSaving(false);
    }
  };

  // Openers
  const openTierEditor = (tier: Tier) => {
    setEditingTier(tier);
    setEditingTierLocal({ ...tier });
    tierEditDisc.onOpen();
  };
  const openMedia = (tier: Tier) => {
    setMediaTierLocal({ ...tier });
    mediaDisc.onOpen();
  };
  const openSocials = (tier: Tier) => {
    setSocialsTierLocal({ ...tier });
    socialsDisc.onOpen();
  };

  // Savers
  const saveEditingTier = async () => {
    if (!editingTierLocal) return;
    await updateTierRow(editingTierLocal);
    setEditingTier(null);
    setEditingTierLocal(null);
    tierEditDisc.onClose();
  };

  const commitMedia = async (t: Tier) => {
    await updateTierRow(t);
    // update list state to reflect immediately
    setTiers((prev) => prev.map((x) => (x.id === t.id ? { ...x, ...t } : x)));
    mediaDisc.onClose();
  };

  const commitSocials = async (t: Tier) => {
    await updateTierRow(t);
    setTiers((prev) => prev.map((x) => (x.id === t.id ? { ...x, ...t } : x)));
    socialsDisc.onClose();
  };

  const cardBorder = mode === "dark" ? "gray.700" : "gray.200";

  const createVipProduct = async (vipType: "telegram" | "discord") => {
    setSaving(true);
    try {
      const isDiscord = vipType === "discord";
      const payload: any = {
        name: isDiscord ? "VIP Discord" : "VIP Telegram",
        description: isDiscord ? "VIP Discord Monthly Subscription" : "VIP Telegram Monthly Subscription",
        imageUrl: "",
        price_usdt: Number(isDiscord ? vipDiscordUsd : vipTelegramUsd || 10),
        price_stripe: Number(isDiscord ? vipDiscordStripe : vipTelegramStripe || 1000),
        level: "BEGINNER",
        isVipProduct: true,
        vipType,
      };
      // Create as subscription product
      const { data } = await apiClient.post("/courses", payload);
      const created = data;
      const next = [...tiers, created];
      setTiers(next);
      onTiersChange?.(next);
      toast({ title: t("common.created", "Created"), status: "success" });
    } finally {
      setSaving(false);
    }
  };

  const saveVipProduct = async (vipType: "telegram" | "discord") => {
    const vipTier = vipType === "telegram" ? vipTelegramTier : vipDiscordTier;
    if (!vipTier) return createVipProduct(vipType);
    setSaving(true);
    try {
      const isDiscord = vipType === "discord";
      const payload: any = {
        ...vipTier,
        price_usdt: Number(isDiscord ? vipDiscordUsd : vipTelegramUsd || 0),
        price_stripe: Number(isDiscord ? vipDiscordStripe : vipTelegramStripe || 0),
        isVipProduct: true,
        vipType,
      };
      const { data } = await apiClient.put(`/courses/${vipTier.id}`, payload);
      const updated = data;
      const next = tiers.map((t) => (t.id === vipTier.id ? updated : t));
      setTiers(next);
      onTiersChange?.(next);
      toast({ title: t("common.saved", "Saved"), status: "success" });
    } finally {
      setSaving(false);
    }
  };

  const createBundle = async () => {
    if (!bundleTierIds || bundleTierIds.length < 2) {
      toast({ title: t("admin.bundle_need_two", "Select at least two tiers"), status: "warning" });
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: bundleName || "Bundle",
        description: bundleDesc || "",
        imageUrl: "",
        price_usdt: Number(bundleUsd || 0),
        price_stripe: Number(bundleStripe || 0),
        level: "BEGINNER",
        isBundle: true,
        bundleTierIds,
      };
      const { data } = await apiClient.post("/courses", payload);
      const created = data;
      const next = [...tiers, created];
      setTiers(next);
      onTiersChange?.(next);
      toast({ title: t("common.created", "Created"), status: "success" });
      setBundleName("");
      setBundleDesc("");
      setBundleUsd("");
      setBundleStripe("");
      setBundleTierIds([]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box py={6} color="#65a8bf">
      {!isAdmin ? (
        <>
          <Heading size="md" mb={2}>
            {t("common.forbidden", "Forbidden")}
          </Heading>
          <Text>{t("admin.must_be_admin", "You must be an admin to view this section.")}</Text>
        </>
      ) : (
        <>
          <HStack justify="center" mb={4}>
            <Heading size="lg">{t("admin.create_content", "Create Content")}</Heading>
            <Icon as={FilePlus2} />
          </HStack>

          <HStack justify="center" mb={4} gap={3}>
            <Button
              variant={activeTab === "content" ? "solid" : "outline"}
              bg={activeTab === "content" ? GOLD : "white"}
              color={activeTab === "content" ? "white" : "black"}
              onClick={() => setActiveTab("content")}
            >
              {t("admin.content", "Content")}
            </Button>
            <Button
             variant={activeTab === "banners" ? "solid" : "outline"}
              bg={activeTab === "banners" ? GOLD : "white"}
              color={activeTab === "banners" ? "white" : "black"}
              onClick={() => setActiveTab("banners")}
            >
              {t("admin.banners", "Banners")}
            </Button>
          </HStack>

          {/* ==================== COURSES ==================== */}
          {activeTab === "content" && (
            <VStack align="stretch" gap={8}>
                <HStack justify="space-between" mb={3}>
                  <Heading size="md">{t("admin.course_tiers", "Course Tiers")}</Heading>
                  <Button variant="solid" bg={GOLD} onClick={() => setShowNewTier((v) => !v)}>
                    <Icon as={FilePlus2} mr={2} />
                    {showNewTier
                      ? t("common.hide", "Hide")
                      : t("admin.create_content", "Create New")}
                  </Button>
                </HStack>

                {/* Quick creator (unchanged logic) */}
                {showNewTier && (
                  <VStack align="stretch" gap={3} mb={6}>
                    <HStack gap={3} flexWrap="wrap">
                      <CInput
                        placeholder={t("common.name", "Name")}
                        value={newTier.name}
                        onChange={(e: any) => setNewTier({ ...newTier, name: e.target.value })}
                      />
                      <CSelect
                        value={newTier.level}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setNewTier({ ...newTier, level: e.target.value as any })
                        }
                      >
                        <option value="BEGINNER">{t("course.level.beginner", "BEGINNER")}</option>
                        <option value="INTERMEDIATE">
                          {t("course.level.intermediate", "INTERMEDIATE")}
                        </option>
                        <option value="ADVANCED">{t("course.level.advanced", "ADVANCED")}</option>
                      </CSelect>
                      <CInput
                        placeholder={t("common.price_usdt", "Price (USDT)")}
                        value={newTier.price_usdt}
                        onChange={(e: any) =>
                          setNewTier({ ...newTier, price_usdt: e.target.value })
                        }
                      />
                      <CInput
                        placeholder={t("common.price_stripe", "Price (Stripe cents)")}
                        value={newTier.price_stripe}
                        onChange={(e: any) =>
                          setNewTier({ ...newTier, price_stripe: e.target.value })
                        }
                      />
                    </HStack>

                    <HStack gap={3} flexWrap="wrap">
                      <CInput
                        placeholder={t("admin.trailer_url", "Trailer URL (optional)")}
                        value={newTier.trailerUrl || ""}
                        onChange={(e: any) =>
                          setNewTier({ ...newTier, trailerUrl: e.target.value })
                        }
                      />
                      <CInput
                        placeholder={t("admin.preview_url", "Preview URL (optional)")}
                        value={newTier.previewUrl || ""}
                        onChange={(e: any) =>
                          setNewTier({ ...newTier, previewUrl: e.target.value })
                        }
                      />
                    </HStack>

                    <Textarea
                      placeholder={t("common.description", "Description")}
                      value={newTier.description}
                      onChange={(e) =>
                        setNewTier({ ...newTier, description: (e.target as any).value })
                      }
                    />

                    {/* NOTE: staged files stay as-is for creator (optional) */}
                    <Box borderWidth="1px" borderRadius="md" p={3}>
                      <Heading size="sm" mb={2}>
                        {t("materials.staged_title", "Materials (staged)")}
                      </Heading>
                      <HStack gap={4} flexWrap="wrap" mb={3}>
                        <Box>
                          <Text fontSize="sm" mb={1}>
                            {t("materials.add_pdfs", "Add PDFs")}
                          </Text>
                          <Input
                            type="file"
                            accept="application/pdf"
                            multiple
                            onChange={(e: any) => {
                              const files = Array.from(e.target.files || []) as File[];
                              if (files.length) setNewPdfFiles(files);
                            }}
                          />
                        </Box>
                        <Box>
                          <Text fontSize="sm" mb={1}>
                            {t("materials.add_videos", "Add Videos")}
                          </Text>
                          <Input
                            type="file"
                            accept="video/*"
                            multiple
                            onChange={(e: any) => {
                              const files = Array.from(e.target.files || []) as File[];
                              if (files.length) setNewVideoFiles(files);
                            }}
                          />
                        </Box>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {t(
                          "materials.staged_note",
                          "These will be uploaded and attached after you click Create."
                        )}
                      </Text>
                    </Box>

                    <Button mt={1} disabled={saving} onClick={createTier} variant="solid" bg={GOLD}>
                      <Icon as={Save} mr={2} /> {t("common.create", "Create")}
                    </Button>
                  </VStack>
                )}

                {/* Cards */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {tiers.map((tier) => (
                    <Box
                      key={tier.id || tier.name}
                      borderWidth="1px"
                      borderColor={cardBorder}
                      borderRadius="lg"
                      p={3}
                    >
                      <HStack justify="space-between" align="start" mb={2}>
                        <Heading size="sm" noOfLines={1} color="#65a8bf">
                          {tier.name}
                        </Heading>
                        <Badge>{tier.level}</Badge>
                      </HStack>

                      <HStack mb={2} spacing={2} wrap="wrap">
                        <Badge colorScheme="green" color="#65a8bf">USDT: {tier.price_usdt || 0}</Badge>
                        <Badge colorScheme="purple" color="#65a8bf">Stripe: {tier.price_stripe || 0}</Badge>
                        {tier.trailerUrl && (
                          <Badge colorScheme="blue" color="#65a8bf">{t("admin.trailer", "Trailer")}</Badge>
                        )}
                        {tier.previewUrl && (
                          <Badge colorScheme="cyan" color="#65a8bf">{t("admin.preview", "Preview")}</Badge>
                        )}
                      </HStack>

                      <HStack spacing={3} align="center" mb={3}>
                        {tier.instructorAvatarUrl ? (
                          <Image
                            src={tier.instructorAvatarUrl}
                            alt="instructor"
                            boxSize="40px"
                            borderRadius="full"
                            objectFit="cover"
                          />
                        ) : (
                          <Box
                            boxSize="40px"
                            borderRadius="full"
                            display="grid"
                            placeItems="center"
                          >
                            <Icon as={BookOpen} />
                          </Box>
                        )}
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="semibold" noOfLines={1} color="#65a8bf">
                            {tier.instructorName || t("instructor.name", "Instructor Name")}
                          </Text>
                          <Text fontSize="xs" color="#65a8bf" noOfLines={1}>
                            {tier.instructorBio || t("instructor.bio", "Instructor Bio")}
                          </Text>
                        </VStack>
                      </HStack>

                      <Text fontSize="sm" color="#65a8bf" noOfLines={3} mb={3}>
                        {tier.description}
                      </Text>

                      {/* Quick actions: Edit / Media / Socials / Materials / Delete */}
                      <SimpleGrid columns={2} spacing={2}>
                        <Button
                          size="sm"
                          variant="solid"
                          bg={GOLD}
                          onClick={() => openTierEditor(tier)}
                          leftIcon={<Icon as={Pencil} />}
                        >
                          {t("common.edit", "Edit")}
                        </Button>
                        <Button
                          size="sm"
                          variant="solid"
                          bg={GOLD}
                          onClick={() => openMedia(tier)}
                          leftIcon={<Icon as={Film} />}
                        >
                          {t("admin.media", "Media")}
                        </Button>
                        <Button
                          size="sm"
                          variant="solid"
                          bg={GOLD}
                          onClick={() => openSocials(tier)}
                          leftIcon={<Icon as={Share2} />}
                        >
                          {t("admin.socials", "Socials")}
                        </Button>
                        <Button
                          size="sm"
                          variant="solid"
                          bg={GOLD}
                          leftIcon={<Icon as={Layers} />}
                          onClick={async () => {
                            // open full editor focused on materials
                            openTierEditor(tier);
                            if (tier.id) await loadResources(tier.id);
                          }}
                        >
                          {t("materials.title", "Materials")}
                        </Button>
                        <Button
                          size="sm"
                          variant="solid"
                          bg="red.500"
                          onClick={() => deleteTierRow(tier.id)}
                          leftIcon={<Icon as={Trash2} />}
                          gridColumn={{ base: "span 2" }}
                        >
                          {t("common.delete", "Delete")}
                        </Button>
                      </SimpleGrid>
                    </Box>
                  ))}
                </SimpleGrid>

                {!tiers.length && (
                  <Text mt={3} fontSize="sm" color="gray.500">
                    {t("admin.no_tiers", "No tiers yet.")}
                  </Text>
                )}

              <Box>
                <HStack justify="space-between" mb={3}>
                  <Heading size="md">{t("admin.vip_settings", "VIP Settings")}</Heading>
                </HStack>
                <VStack align="stretch" gap={6}>
                  {/* VIP Telegram */}
                  <Box>
                    <Heading size="sm" mb={3} color={GOLD}>
                      {t("admin.vip_telegram", "VIP Telegram")}
                    </Heading>
                    <VStack align="stretch" gap={3}>
                      <HStack gap={3} flexWrap="wrap">
                        <CInput
                          placeholder={t("checkout.addons.vip.price_usd", {
                            defaultValue: "USD/month",
                          })}
                          value={vipTelegramUsd}
                          onChange={(e: any) => setVipTelegramUsd(e.target.value)}
                        />
                        <CInput
                          placeholder={t("admin.price_stripe_cents", {
                            defaultValue: "Stripe cents/month",
                          })}
                          value={vipTelegramStripe}
                          onChange={(e: any) => setVipTelegramStripe(e.target.value)}
                        />
                      </HStack>
                      <HStack>
                        {!vipTelegramTier ? (
                          <Button
                            onClick={() => createVipProduct("telegram")}
                            variant="solid"
                            bg={GOLD}
                            isDisabled={saving}
                          >
                            {t("admin.create_vip_telegram", "Create VIP Telegram")}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => saveVipProduct("telegram")}
                            variant="solid"
                            bg={GOLD}
                            isDisabled={saving}
                          >
                            {t("common.save", "Save")}
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  </Box>

                  <Divider />

                  {/* VIP Discord */}
                  <Box>
                    <Heading size="sm" mb={3} color={GOLD}>
                      {t("admin.vip_discord", "VIP Discord")}
                    </Heading>
                    <VStack align="stretch" gap={3}>
                      <HStack gap={3} flexWrap="wrap">
                        <CInput
                          placeholder={t("checkout.addons.vip.price_usd", {
                            defaultValue: "USD/month",
                          })}
                          value={vipDiscordUsd}
                          onChange={(e: any) => setVipDiscordUsd(e.target.value)}
                        />
                        <CInput
                          placeholder={t("admin.price_stripe_cents", {
                            defaultValue: "Stripe cents/month",
                          })}
                          value={vipDiscordStripe}
                          onChange={(e: any) => setVipDiscordStripe(e.target.value)}
                        />
                      </HStack>
                      <HStack>
                        {!vipDiscordTier ? (
                          <Button
                            onClick={() => createVipProduct("discord")}
                            variant="solid"
                            bg={GOLD}
                            isDisabled={saving}
                          >
                            {t("admin.create_vip_discord", "Create VIP Discord")}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => saveVipProduct("discord")}
                            variant="solid"
                            bg={GOLD}
                            isDisabled={saving}
                          >
                            {t("common.save", "Save")}
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  </Box>
                </VStack>
              </Box>

              <Box>
                <HStack justify="space-between" mb={3}>
                  <Heading size="md">{t("admin.bundles", "Bundles")}</Heading>
                </HStack>
                <VStack align="stretch" gap={3}>
                  <HStack gap={3} flexWrap="wrap">
                    <CInput
                      placeholder={t("common.name", "Name")}
                      value={bundleName}
                      onChange={(e: any) => setBundleName(e.target.value)}
                    />
                    <CInput
                      placeholder={t("common.price_usdt", "USDT/month or one-time")}
                      value={bundleUsd}
                      onChange={(e: any) => setBundleUsd(e.target.value)}
                    />
                    <CInput
                      placeholder={t("admin.price_stripe_cents", { defaultValue: "Stripe cents" })}
                      value={bundleStripe}
                      onChange={(e: any) => setBundleStripe(e.target.value)}
                    />
                  </HStack>
                  <Textarea
                    placeholder={t("common.description", "Description")}
                    value={bundleDesc}
                    onChange={(e) => setBundleDesc((e.target as any).value)}
                  />
                  <Box>
                    <Text fontWeight={600} mb={1}>
                      {t("admin.bundle_select", "Select tiers to include (2+)")}
                    </Text>
                    <CSelect
                      multiple
                      value={bundleTierIds as any}
                      onChange={(e: any) => {
                        const opts = Array.from(e.target.selectedOptions || []).map(
                          (o: any) => o.value
                        );
                        setBundleTierIds(opts);
                      }}
                    >
                      {(tiers || [])
                        .filter((t) => !t.isBundle && !t.isVipProduct)
                        .map((t) => (
                          <option key={t.id || t.name} value={t.id || t.name}>
                            {t.name}
                          </option>
                        ))}
                    </CSelect>
                  </Box>
                  <HStack>
                    <Button onClick={createBundle} variant="solid" bg={GOLD} isDisabled={saving}>
                      {t("admin.create_bundle", "Create Bundle")}
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          )}

          {/* ==================== BANNERS ==================== */}
          {activeTab === "banners" && (
            <VStack align="stretch" gap={8}>
              <Box bg="bg.surface">
                <HStack justify="space-between" mb={3}>
                  <Heading size="md">{t("admin.banners", "Banners")}</Heading>
                  <Button onClick={() => setShowNewBanner((v) => !v)} variant="solid" bg={GOLD}>
                    <Icon as={FilePlus2} mr={2} />
                    {showNewBanner
                      ? t("common.hide", "Hide")
                      : t("admin.create_banner", "Create New")}
                  </Button>
                </HStack>

                {showNewBanner && (
                  <VStack align="stretch" gap={3} mb={6}>
                    <HStack gap={3} flexWrap="wrap">
                      <CInput
                        placeholder={t("common.title", "Title")}
                        value={newBanner.title}
                        onChange={(e: any) => setNewBanner({ ...newBanner, title: e.target.value })}
                      />
                      <CInput
                        placeholder={t("common.subtitle", "Subtitle")}
                        value={newBanner.subtitle}
                        onChange={(e: any) =>
                          setNewBanner({ ...newBanner, subtitle: e.target.value })
                        }
                      />
                      <CInput
                        placeholder={t("common.badge", "Badge")}
                        value={newBanner.badge}
                        onChange={(e: any) => setNewBanner({ ...newBanner, badge: e.target.value })}
                      />
                      <CInput
                        placeholder={t("common.href", "Href (link)")}
                        value={newBanner.href}
                        onChange={(e: any) => setNewBanner({ ...newBanner, href: e.target.value })}
                      />
                    </HStack>

                    <HStack gap={3} align="center">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e: any) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await onUpload(file);
                          setNewBanner((b) => ({ ...b, imageUrl: url }));
                        }}
                      />
                      {newBanner.imageUrl ? (
                        <HStack>
                          <Image
                            src={newBanner.imageUrl}
                            alt={t("common.preview", "preview")}
                            boxSize="56px"
                            objectFit="cover"
                            borderRadius="md"
                          />
                          <Text fontSize="xs" maxW="240px" noOfLines={1}>
                            {newBanner.imageUrl}
                          </Text>
                        </HStack>
                      ) : (
                        <Text fontSize="sm" color="gray.500">
                          <Icon as={Upload} mr={2} />
                          {t("common.select_image", "Select image…")}
                        </Text>
                      )}
                    </HStack>

                    <Button mt={1} disabled={saving} onClick={createBanner}>
                      <Icon as={Save} mr={2} /> {t("common.create", "Create")}
                    </Button>
                  </VStack>
                )}

                {/* Banner cards */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {banners.map((b) => (
                    <Box
                      key={b.id || b.imageUrl}
                      borderWidth="1px"
                      borderColor={cardBorder}
                      borderRadius="lg"
                      overflow="hidden"
                    >
                      {b.imageUrl && (
                        <Image
                          src={b.imageUrl}
                          alt={b.title || "banner"}
                          w="100%"
                          h="160px"
                          objectFit="cover"
                        />
                      )}
                      <Box p={3}>
                        <HStack justify="space-between" align="start" mb={2}>
                          <Heading size="sm" noOfLines={1}>
                            {b.title || t("common.title", "Title")}
                          </Heading>
                          {b.badge && <Badge>{b.badge}</Badge>}
                        </HStack>
                        {b.subtitle && (
                          <Text fontSize="sm" color="gray.600" noOfLines={2} mb={3}>
                            {b.subtitle}
                          </Text>
                        )}
                        <HStack justify="space-between">
                          <Button
                            size="sm"
                            variant="solid"
                            bg={GOLD}
                            onClick={() => {
                              setEditingBanner(b);
                              setEditingBannerLocal({ ...b });
                              bannerEditDisc.onOpen();
                            }}
                            leftIcon={<Icon as={Pencil} />}
                          >
                            {t("common.edit", "Edit")}
                          </Button>
                          <Button
                            size="sm"
                            variant="solid"
                            bg="red.500"
                            onClick={() => deleteBannerRow(b.id)}
                            leftIcon={<Icon as={Trash2} />}
                          >
                            {t("common.delete", "Delete")}
                          </Button>
                        </HStack>
                      </Box>
                    </Box>
                  ))}
                </SimpleGrid>

                {!banners.length && (
                  <Text mt={3} fontSize="sm" color="gray.500">
                    {t("admin.no_banners", "No banners yet.")}
                  </Text>
                )}
              </Box>
            </VStack>
          )}
        </>
      )}

      {/* Tier Editor */}
      <EditTierModal
        isOpen={tierEditDisc.isOpen}
        onClose={() => {
          setEditingTier(null);
          setEditingTierLocal(null);
          tierEditDisc.onClose();
        }}
        tier={editingTierLocal}
        setTier={(t) => setEditingTierLocal({ ...t })}
        onSave={saveEditingTier}
        onDelete={
          editingTier?.id
            ? async () => {
                await deleteTierRow(editingTier.id);
                setEditingTier(null);
                setEditingTierLocal(null);
                tierEditDisc.onClose();
              }
            : undefined
        }
        saving={saving}
        resources={editingTier?.id ? resourcesByTier[editingTier.id] : undefined}
        onLoadResources={editingTier?.id ? async () => loadResources(editingTier.id!) : undefined}
        onUploadPdf={
          editingTier?.id ? async (f) => addResource(editingTier.id!, f, "pdf") : undefined
        }
        onUploadVideo={
          editingTier?.id ? async (f) => addResource(editingTier.id!, f, "video") : undefined
        }
        onRemoveResource={
          editingTier?.id ? async (rid) => removeResource(rid, editingTier.id!) : undefined
        }
      />

      {/* Media quick dialog */}
      <MediaModal
        isOpen={mediaDisc.isOpen}
        onClose={() => {
          setMediaTierLocal(null);
          mediaDisc.onClose();
        }}
        tier={mediaTierLocal}
        setTier={(t) => setMediaTierLocal({ ...t })}
        onUpload={onUpload}
        onCommit={commitMedia}
        saving={saving}
      />

      {/* Socials quick dialog */}
      <SocialsModal
        isOpen={socialsDisc.isOpen}
        onClose={() => {
          setSocialsTierLocal(null);
          socialsDisc.onClose();
        }}
        tier={socialsTierLocal}
        setTier={(t) => setSocialsTierLocal({ ...t })}
        onCommit={commitSocials}
        saving={saving}
      />

      {/* Banner Editor */}
      <EditBannerModal
        isOpen={bannerEditDisc.isOpen}
        onClose={() => {
          setEditingBanner(null);
          setEditingBannerLocal(null);
          bannerEditDisc.onClose();
        }}
        banner={editingBannerLocal}
        setBanner={(b) => setEditingBannerLocal({ ...b })}
        onSave={async () => {
          if (!editingBannerLocal) return;
          await updateBannerRow(editingBannerLocal);
          setEditingBanner(null);
          setEditingBannerLocal(null);
          bannerEditDisc.onClose();
        }}
        onDelete={
          editingBanner?.id
            ? async () => {
                await deleteBannerRow(editingBanner.id);
                setEditingBanner(null);
                setEditingBannerLocal(null);
                bannerEditDisc.onClose();
              }
            : undefined
        }
        saving={saving}
        onUploadImage={async (file) => {
          if (!editingBannerLocal) return;
          const url = await onUpload(file);
          setEditingBannerLocal({ ...editingBannerLocal, imageUrl: url });
        }}
      />
    </Box>
  );
};

export default ContentAdminPanel;
