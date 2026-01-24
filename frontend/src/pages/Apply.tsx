import React from "react";
import {
  Box,
  Container,
  Stack,
  Heading,
  Text,
  Input,
  Textarea,
  Button,
  HStack,
  Badge,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { Paperclip, Calendar, ShieldCheck, FileText } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import SpotlightCard from "../components/SpotlightCard";

const GOLD = "#65a8bf";

type Job = {
  id: string;
  title: string;
  description: string;
  expectedPay: string | null;
  closingDate: string;
  isActive: boolean;
  requirements?: string[] | null;
};

export default function Apply() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { t, i18n } = useTranslation() as any;
  const isRTL = i18n?.language?.startsWith("ar");

  const [job, setJob] = React.useState<Job | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [err, setErr] = React.useState<string | null>(null);

  // form
  const [name, setName] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [phone, setPhone] = React.useState<string>("");
  const [coverLetter, setCoverLetter] = React.useState<string>("");
  const [cv, setCv] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  // fetch job
  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) {
        setErr(t("company.careers.apply.errors.missing_id") || "Missing job id");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get(`/careers/jobs/${encodeURIComponent(id)}`);
        const payload = res?.data;
        const j: Job | null =
          Array.isArray(payload?.data) && payload.data.length > 0 ? (payload.data[0] as Job) : null;

        if (!alive) return;
        if (!j) setErr(t("company.careers.apply.errors.not_found") || "Job not found");
        else {
          setJob(j);
          setErr(null);
        }
      } catch {
        if (alive) setErr(t("company.careers.apply.errors.load_failed") || "Failed to load job");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, i18n.language]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!id || !name || !email || !cv) {
      setNotice(
        t("company.careers.apply.errors.required") ||
          "Please fill all required fields and attach your CV."
      );
      return;
    }
    try {
      setSubmitting(true);
      setNotice(null);
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      if (phone) fd.append("phone", phone);
      if (coverLetter) fd.append("coverLetter", coverLetter);
      fd.append("cv", cv);

      const res = await api.post(`/careers/jobs/${encodeURIComponent(id)}/apply`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const json = res?.data;
      if (json?.error) {
        setNotice(json.error);
      } else {
        setTimeout(() => nav("/careers"), 900);
      }
    } catch {
      setNotice(t("company.careers.apply.errors.submit_failed") || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  }

  // Small helper for section shells (matches your policy page vibe)
  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Box>
      <Heading size="md" mb={3} color={GOLD}>
        {title}
      </Heading>
      <VStack align="stretch" gap={3}>
        {children}
      </VStack>
    </Box>
  );

  return (
    <Box py={{ base: 6, md: 10 }} dir={isRTL ? "rtl" : "ltr"} mt={10}>
      <Container maxW="5xl">
        <Stack gap={6}>
          {/* Header */}
          <Stack gap={1}>
            <Heading size="lg">{t("company.careers.apply.title") || "Apply"}</Heading>
            <Text color="text.muted">
              {t("company.careers.apply.subtitle") ||
                "Submit your application for this role. We respect your time and review every submission carefully."}
            </Text>
          </Stack>

          {/* Job info */}
          {loading ? (
            <Text color="text.muted">{t("company.careers.apply.loading") || "Loading…"}</Text>
          ) : err ? (
            <Text color="red.400">{err}</Text>
          ) : job ? (
            <>
            <SpotlightCard>
                <Section title={t("company.careers.apply.role_overview") || "Role overview"}>
                  <Stack gap={2}>
                    <Heading size="md" color="#65a8bf">{job.title}</Heading>
                    <HStack gap={3} flexWrap="wrap">
                      {job.expectedPay ? (
                        <Badge colorScheme="yellow" borderRadius="full">
                          {job.expectedPay}
                        </Badge>
                      ) : null}
                      <Badge variant="outline" borderColor={GOLD} color={GOLD} borderRadius="full">
                        <HStack gap={1}>
                          <Icon as={Calendar} boxSize={4} />
                          <Text>
                            {t("company.careers.apply.closes", { defaultValue: "Closes" })}:{" "}
                            {new Date(job.closingDate).toLocaleDateString()}
                          </Text>
                        </HStack>
                      </Badge>
                    </HStack>

                    <Text color="#65a8bf" whiteSpace="pre-wrap">
                      {job.description}
                    </Text>

                    {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
                      <>
                        <Heading size="sm" color={GOLD}>
                          {t("company.careers.apply.requirements") || "Requirements"}
                        </Heading>
                        <Box as="ul" ps={5} display="grid" rowGap={2} color="#65a8bf">
                          {job.requirements.map((req, i) => (
                            <Box as="li" key={i}>
                              {req}
                            </Box>
                          ))}
                        </Box>
                      </>
                    ) : null}
                  </Stack>
                </Section>
              </SpotlightCard>

              {/* Application form */}
              <SpotlightCard>
                <Section title={t("company.careers.apply.application") || "Application"}>
                  <Box>
                    <form onSubmit={submit}>
                      <Stack gap={4}>
                        <VStack align="stretch" gap={4}>
                      <Box>
                        <Text mb={2} fontWeight="semibold" color="#65a8bf">
                          {t("company.careers.apply.form.name") || "Name"} *
                        </Text>
                        <Input
                          value={name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setName(e.target.value)
                          }
                          placeholder={t("company.careers.apply.form.name_ph") || "Your full name"}
                        />
                      </Box>

                      <Box>
                        <Text mb={2} fontWeight="semibold" color="#65a8bf">
                          {t("company.careers.apply.form.email") || "Email"} *
                        </Text>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEmail(e.target.value)
                          }
                          placeholder={t("company.careers.apply.form.email_ph") || "you@example.com"}
                        />
                      </Box>

                      <Box>
                        <Text mb={2} fontWeight="semibold" color="#65a8bf">
                          {t("company.careers.apply.form.phone") || "Phone"}
                        </Text>
                        <Input
                          value={phone}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPhone(e.target.value)
                          }
                          placeholder={t("company.careers.apply.form.phone_ph") || "+218…"}
                        />
                      </Box>

                      <Box>
                        <Text mb={2} fontWeight="semibold" color="#65a8bf">
                          {t("company.careers.apply.form.cover") || "Cover Letter"}
                        </Text>
                        <Textarea
                          rows={6}
                          value={coverLetter}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setCoverLetter(e.target.value)
                          }
                          placeholder={
                            t("company.careers.apply.form.cover_ph") ||
                            "Tell us why you’re a great fit…"
                          }
                        />
                        <HStack mt={1} gap={2} color="#65a8bf" fontSize="sm">
                          <Icon as={FileText} boxSize={4} />
                          <Text>
                            {t("company.careers.apply.form.cover_hint") ||
                              "Optional but recommended."}
                          </Text>
                        </HStack>
                      </Box>

                      <Box>
                        <Text mb={2} fontWeight="semibold" color="#65a8bf">
                          {t("company.careers.apply.form.cv") || "CV (PDF/DOC)"} *
                        </Text>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setCv(e.target.files?.[0] || null)
                          }
                        />
                        <HStack mt={1} gap={2} color="#65a8bf" fontSize="sm">
                          <Icon as={Paperclip} boxSize={4} />
                          <Text>
                            {t("company.careers.apply.form.cv_hint") || "Accepted: PDF, DOC, DOCX"}
                          </Text>
                        </HStack>
                        {cv ? (
                          <Badge
                            mt={2}
                            variant="outline"
                            borderColor={GOLD}
                            color={GOLD}
                            borderRadius="full"
                          >
                            {cv.name}
                          </Badge>
                        ) : null}
                      </Box>

                      {notice ? <Text color="yellow.400">{notice}</Text> : null}

                      <Button
                        type="submit"
                        bg={GOLD}
                        color="black"
                        _hover={{ opacity: 0.9 }}
                        borderRadius="xl"
                        disabled={submitting}
                      >
                        {submitting
                          ? t("company.careers.apply.submit_loading") || "Submitting…"
                          : t("company.careers.apply.submit") || "Submit Application"}
                      </Button>

                      <HStack color="#65a8bf" fontSize="sm" mt={1}>
                        <Icon as={ShieldCheck} boxSize={4} />
                        <Text color="#65a8bf">
                          {t("company.careers.apply.privacy") ||
                            "We store your application securely and only use it to evaluate your candidacy."}
                        </Text>
                      </HStack>
                    </VStack>
                    </Stack>
                    </form>
                  </Box>
                </Section>
              </SpotlightCard>
            </>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}
