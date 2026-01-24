import React from "react";
import {
  Box,
  Container,
  Stack,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  SimpleGrid,
  Badge,
  HStack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import api from "../../api/client";

const GOLD = "#65a8bf";

type Job = {
  id: string;
  title: string;
  description: string;
  requirements: string[] | null;
  expectedPay: string | null;
  closingDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function JobsAdminPanel() {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [err, setErr] = React.useState<string | null>(null);

  // form state
  const [title, setTitle] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [requirements, setRequirements] = React.useState<string>("");
  const [expectedPay, setExpectedPay] = React.useState<string>("");
  const [closingDate, setClosingDate] = React.useState<string>("");
  const [isActive, setIsActive] = React.useState<boolean>(true);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState<boolean>(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await api.get("/careers/jobs", { params: { limit: 100 } });
      setJobs(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setErr("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function create() {
    if (!title || !description || !closingDate) {
      setNotice("title, description, and closingDate are required");
      return;
    }
    try {
      setSaving(true);
      setNotice(null);
      const body = {
        title,
        description,
        requirements, // CSV or array supported by backend
        expectedPay,
        closingDate,
        isActive,
      };

      const { data } = await api.post("/careers/jobs", body);
      if (data?.error) {
        setNotice(data.error);
      } else {
        setNotice("Job created");
        setTitle("");
        setDescription("");
        setRequirements("");
        setExpectedPay("");
        setClosingDate("");
        setIsActive(true);
        await load();
      }
    } catch {
      setNotice("Failed to create job");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(job: Job) {
    try {
      await api.patch(`/careers/jobs/${job.id}`, { isActive: !job.isActive });
      await load();
    } catch {
      // swallow
    }
  }

  return (
    <Box py={{ base: 6, md: 10 }}>
      <Container maxW="7xl">
        <Stack gap={6}>
          <Heading size="lg">Admin · Jobs</Heading>

          {/* Create job */}
          <Box border="1px solid" borderColor={GOLD} borderRadius="xl" p={{ base: 4, md: 6 }}>
            <Heading size="md" mb={3} color={GOLD}>
              Create a Job
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <Box>
                <Text mb={2} fontWeight="semibold">
                  Title
                </Text>
                <Input
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                />
              </Box>
              <Box>
                <Text mb={2} fontWeight="semibold">
                  Expected Pay (e.g., USD 2k–3k / mo)
                </Text>
                <Input
                  value={expectedPay}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setExpectedPay(e.target.value)
                  }
                />
              </Box>
              <Box>
                <Text mb={2} fontWeight="semibold">
                  Closing Date
                </Text>
                <Input
                  type="date"
                  value={closingDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setClosingDate(e.target.value)
                  }
                />
              </Box>
              <Box>
                <Text mb={2} fontWeight="semibold">
                  Active
                </Text>
                <HStack>
                  <Input
                    type="checkbox"
                    width="auto"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setIsActive(e.target.checked)
                    }
                    checked={isActive}
                  />
                  <Text>{isActive ? "Active" : "Inactive"}</Text>
                </HStack>
              </Box>
            </SimpleGrid>
            <Box mt={4}>
              <Text mb={2} fontWeight="semibold">
                Description
              </Text>
              <Textarea
                rows={6}
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(e.target.value)
                }
              />
            </Box>
            <Box mt={4}>
              <Text mb={2} fontWeight="semibold">
                Requirements (comma-separated)
              </Text>
              <Textarea
                rows={4}
                value={requirements}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setRequirements(e.target.value)
                }
              />
            </Box>
            {notice ? (
              <Text mt={3} color="yellow.400">
                {notice}
              </Text>
            ) : null}
            <Button
              mt={4}
              bg={GOLD}
              color="black"
              _hover={{ opacity: 0.9 }}
              onClick={create}
              disabled={saving}
            >
              {saving ? "Saving…" : "Create"}
            </Button>
          </Box>

          <Heading size="md" color={GOLD}>
            Jobs
          </Heading>
          {loading ? (
            <Text color="text.muted">Loading…</Text>
          ) : err ? (
            <Text color="red.400">{err}</Text>
          ) : (
            <Stack gap={4}>
              {jobs.map((j) => (
                <Box
                  key={j.id}
                  border="1px solid"
                  borderColor={GOLD}
                  borderRadius="xl"
                  p={{ base: 4, md: 5 }}
                >
                  <Stack gap={2}>
                    <Heading size="sm">{j.title}</Heading>
                    <HStack gap={3} flexWrap="wrap">
                      {j.expectedPay ? (
                        <Badge colorScheme="yellow" borderRadius="full">
                          {j.expectedPay}
                        </Badge>
                      ) : null}
                      <Badge variant="outline" borderColor={GOLD} color={GOLD} borderRadius="full">
                        Closes: {new Date(j.closingDate).toLocaleDateString()}
                      </Badge>
                      <Badge colorScheme={j.isActive ? "green" : "gray"} borderRadius="full">
                        {j.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </HStack>
                    <Text
                      color="text.muted"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {j.description}
                    </Text>
                    <HStack>
                      <Button variant="outline" borderColor={GOLD} onClick={() => toggleActive(j)}>
                        {j.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <RouterLink to={`/admin/careers/jobs/${j.id}/applications`}>
                        <Button
                          bg={GOLD}
                          color="black"
                          _hover={{ opacity: 0.9 }}
                        >
                          View Applications
                        </Button>
                      </RouterLink>
                    </HStack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
