import React from "react";
import {
  Box,
  Container,
  Stack,
  Heading,
  Text,
  Link,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import api from "../../api/client";

const GOLD = "#65a8bf";

type Job = {
  id: string;
  title: string;
};

type AppRow = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  coverLetter?: string | null;
  cvUrl: string;
  status: string;
  createdAt: string;
};

export default function JobApplicationsAdminPanel({ jobId: jobIdProp }: { jobId?: string }) {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [jobId, setJobId] = React.useState<string>(jobIdProp || "");
  const [apps, setApps] = React.useState<AppRow[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/careers/jobs", { params: { limit: 100 } });
        const list = (Array.isArray(data?.data) ? data.data : []).map((j: any) => ({
          id: j.id,
          title: j.title,
        })) as Job[];

        if (!alive) return;
        setJobs(list);
        if (!jobIdProp && list.length > 0) setJobId(list[0].id);
      } catch {
        if (alive) setErr("Failed to load jobs list");
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!jobId) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const { data } = await api.get(`/careers/jobs/${jobId}/applications`);
        if (!alive) return;
        setApps(Array.isArray(data?.data) ? data.data : []);
      } catch {
        if (alive) setErr("Failed to load applications");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [jobId]);

  return (
    <Box py={{ base: 6, md: 10 }}>
      <Container maxW="7xl">
        <Stack gap={6}>
          <Heading size="lg">Admin · Applications</Heading>

          {!jobIdProp ? (
            <Box>
              <Text mb={2} fontWeight="semibold">
                Select Job
              </Text>
              <select
                value={jobId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setJobId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "12px",
                  border: `1px solid ${GOLD}`,
                  background: "transparent",
                  color: "inherit",
                }}
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </Box>
          ) : null}

          {loading ? (
            <Text color="text.muted">Loading…</Text>
          ) : err ? (
            <Text color="red.400">{err}</Text>
          ) : apps.length === 0 ? (
            <Text color="text.muted">No applications yet.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              {apps.map((a) => (
                <Box
                  key={a.id}
                  border="1px solid"
                  borderColor={GOLD}
                  borderRadius="xl"
                  p={{ base: 4, md: 5 }}
                >
                  <Stack gap={2}>
                    <Heading size="sm">{a.name}</Heading>
                    <Text color="text.muted">
                      {a.email}
                      {a.phone ? ` · ${a.phone}` : ""}
                    </Text>
                    <Badge colorScheme="yellow" w="fit-content" borderRadius="full">
                      {new Date(a.createdAt).toLocaleString()}
                    </Badge>
                    <Text
                      color="text.muted"
                      whiteSpace="pre-wrap"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 6,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {a.coverLetter || "—"}
                    </Text>
                    <Link href={a.cvUrl} color={GOLD}>
                      View CV
                    </Link>
                    <Badge borderRadius="full" variant="outline" borderColor={GOLD} color={GOLD}>
                      {a.status}
                    </Badge>
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
