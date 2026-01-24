import React from "react";
import { Box, Button, FormControl, FormLabel, Heading, HStack, Input, Select, SimpleGrid, Textarea, VStack, useToast, Text, Badge, Divider, Image, Spinner } from "@chakra-ui/react";
import api from "../../api/client";

const PrizesAdminPanel: React.FC = () => {
  const toast = useToast();

  const [prizeName, setPrizeName] = React.useState("");
  const [photoUrl, setPhotoUrl] = React.useState("");
  const [createdPrize, setCreatedPrize] = React.useState<any | null>(null);

  const [drawAudience, setDrawAudience] = React.useState<"ENROLLED" | "VISITOR">("ENROLLED");
  const [visitorNames, setVisitorNames] = React.useState("");
  const [randomize] = React.useState(true);

  const [prizes, setPrizes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  async function loadPrizes() {
    try {
      setLoading(true);
      const resp = await api.get("/admin/prizes");
      setPrizes(resp.data?.data || []);
    } catch (e) {
      toast({ status: "error", title: "Failed to load prizes" });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadPrizes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createPrize() {
    try {
      const resp = await api.post("/admin/prizes", { name: prizeName, photoUrl: photoUrl || undefined });
      setCreatedPrize(resp.data?.data || null);
      toast({ status: "success", title: "Prize created" });
      setPrizeName("");
      setPhotoUrl("");
      loadPrizes();
    } catch (e: any) {
      toast({ status: "error", title: "Failed to create prize" });
    }
  }

  async function runDraw() {
    if (!createdPrize?.id) {
      toast({ status: "warning", title: "Create a prize first" });
      return;
    }
    try {
      const names = visitorNames
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);
      await api.post(`/admin/prizes/${encodeURIComponent(createdPrize.id)}/draw`, {
        audience: drawAudience,
        visitorNames: drawAudience === "VISITOR" ? names : undefined,
        randomize,
      });
      toast({ status: "success", title: "Draw executed" });
      setVisitorNames("");
      loadPrizes();
    } catch (e: any) {
      toast({ status: "error", title: "Failed to run draw" });
    }
  }

  return (
    <VStack align="stretch" gap={6}>
      <Heading size="md">Prizes</Heading>
      
      {/* Create & Draw Forms */}
      <SimpleGrid columns={[1, 2]} gap={6}>
        <Box p={4} borderRadius="lg" bg="rgba(182, 233, 255, 0.1)">
          <Heading size="sm" mb={3}>Create Prize</Heading>
          <VStack align="stretch" gap={3}>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input value={prizeName} onChange={(e) => setPrizeName(e.target.value)} placeholder="iPhone 15 Pro" />
            </FormControl>
            <FormControl>
              <FormLabel>Photo URL</FormLabel>
              <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
            </FormControl>
            <Button onClick={createPrize} isDisabled={!prizeName}>Create Prize</Button>
          </VStack>
        </Box>
        <Box p={4} borderRadius="lg" bg="rgba(182, 233, 255, 0.1)">
          <Heading size="sm" mb={3}>Top-3 Draw</Heading>
          <VStack align="stretch" gap={3}>
            <FormControl>
              <FormLabel>Audience</FormLabel>
              <Select value={drawAudience} onChange={(e) => setDrawAudience(e.target.value as any)}>
                <option value="ENROLLED">Enrolled (Leaderboard Top 3)</option>
                <option value="VISITOR">Visitors (names list)</option>
              </Select>
            </FormControl>
            {drawAudience === "VISITOR" && (
              <FormControl>
                <FormLabel>Visitor Names (comma or newline)</FormLabel>
                <Textarea value={visitorNames} onChange={(e) => setVisitorNames(e.target.value)} placeholder="Ali Al-Libi, Mohamed El-Masri, ..." rows={6} />
              </FormControl>
            )}
            <HStack>
              <Button onClick={runDraw} isDisabled={!createdPrize?.id}>Run Draw</Button>
            </HStack>
          </VStack>
        </Box>
      </SimpleGrid>

      <Divider />

      {/* Prizes History */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <Heading size="sm">Prizes & Winners History</Heading>
          <Button size="sm" onClick={loadPrizes} isLoading={loading}>Refresh</Button>
        </HStack>

        {loading && <Spinner />}

        {!loading && prizes.length === 0 && (
          <Text opacity={0.7}>No prizes created yet.</Text>
        )}

        <VStack align="stretch" gap={4}>
          {prizes.map((prize: any) => (
            <Box key={prize.id} p={4} borderRadius="lg" bg="rgba(182, 233, 255,0.05)" border="1px solid rgba(182, 233, 255,0.2)">
              <HStack justify="space-between" mb={3}>
                <VStack align="start" gap={1}>
                  <Heading size="sm">{prize.name}</Heading>
                  {prize.photoUrl && (
                    <Image src={prize.photoUrl} alt={prize.name} maxH="60px" borderRadius="md" />
                  )}
                </VStack>
                <Badge colorScheme="blue">{prize.draws?.length || 0} draws</Badge>
              </HStack>

              {prize.draws && prize.draws.length > 0 && (
                <VStack align="stretch" gap={3} mt={3}>
                  {prize.draws.map((draw: any) => (
                    <Box key={draw.id} p={3} bg="rgba(0,0,0,0.1)" borderRadius="md">
                      <HStack justify="space-between" mb={2}>
                        <Badge colorScheme={draw.audience === "ENROLLED" ? "green" : "purple"}>
                          {draw.audience}
                        </Badge>
                        <Text fontSize="xs" opacity={0.7}>
                          {new Date(draw.executedAt).toLocaleString()}
                        </Text>
                      </HStack>
                      
                      {draw.winners && draw.winners.length > 0 && (
                        <VStack align="stretch" gap={2} mt={2}>
                          <Text fontSize="sm" fontWeight="semibold">Winners:</Text>
                          {draw.winners.map((winner: any) => (
                            <HStack key={winner.id} justify="space-between" p={2} bg="rgba(182, 233, 255,0.1)" borderRadius="md">
                              <HStack>
                                <Badge colorScheme="gold">#{winner.position}</Badge>
                                <Text fontSize="sm">{winner.name}</Text>
                                {winner.user && (
                                  <Badge colorScheme={winner.user.role === "fake_user" ? "orange" : "green"} fontSize="xs">
                                    {winner.user.role === "fake_user" ? "Fake" : "Real"}
                                  </Badge>
                                )}
                              </HStack>
                              {winner.user && (
                                <Text fontSize="xs" opacity={0.6}>{winner.user.email}</Text>
                              )}
                            </HStack>
                          ))}
                        </VStack>
                      )}
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
};

export default PrizesAdminPanel;
