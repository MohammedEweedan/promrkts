import React from "react";
import {
  Box,
  Button,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
  Progress,
} from "@chakra-ui/react";
import api from "../api/client";

type QuizOption = { id: string; text: string };
type QuizQuestion = { id: string; prompt: string; options: QuizOption[] };
type Quiz = {
  id: string;
  title: string;
  passingScore?: number;
  questions: QuizQuestion[];
};

export default function QuizModule({
  tierId,
  resourceId,
}: {
  tierId: string;
  resourceId?: string;
}) {
  const [quiz, setQuiz] = React.useState<Quiz | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [result, setResult] = React.useState<{ score: number; passed?: boolean } | null>(null);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      setSubmitted(false);
      setResult(null);
      setAnswers({});
      try {
        // You will swap this to your real endpoint:
        // GET /quizzes?tierId=...&resourceId=...
        const res = await api.get("/quizzes/active", { params: { tierId, resourceId } });
        setQuiz(res.data || null);
      } catch {
        setQuiz(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [tierId, resourceId]);

  if (loading) return <Text fontSize="sm">Loading quiz…</Text>;
  if (!quiz) return null;

  const total = quiz?.questions?.length || 1;
  const answered = Object.keys(answers).length;
  const pct = Math.round((answered / total) * 100);

  const canSubmit = answered === total;

  async function submit() {
    setSubmitted(true);
    try {
      // Swap to your endpoint:
      // POST /quiz-attempts { quizId, tierId, resourceId, answers: [{questionId, optionId}] }
      const payload = {
        quizId: quiz?.id,
        tierId,
        resourceId,
        answers: Object.entries(answers).map(([questionId, optionId]) => ({
          questionId,
          optionId,
        })),
      };
      const res = await api.post("/quiz-attempts", payload);
      setResult(res.data || null);
    } catch {
      // Fallback: no server scoring
      setResult({ score: 0 });
    }
  }

  return (
    <Box borderWidth={1} borderRadius="2xl" p={5}>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Heading size="md">{quiz?.title}</Heading>
          <Text fontSize="sm" opacity={0.7}>
            Answer all questions to submit.
          </Text>
        </Box>

        <Box>
          <Text fontSize="sm" mb={2} opacity={0.7}>
            Progress
          </Text>
          <Progress value={pct} borderRadius="md" />
        </Box>

        {quiz?.questions?.map((q, idx) => (
          <Box key={q.id} borderWidth={1} borderRadius="xl" p={4}>
            <Text fontWeight="700">
              {idx + 1}. {q.prompt}
            </Text>

            <RadioGroup
              value={answers[q.id] || ""}
              onChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
            >
              <Stack mt={3}>
                {q.options.map((o) => (
                  <Radio key={o.id} value={o.id}>
                    {o.text}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          </Box>
        ))}

        <Button
          bg="#65a8bf"
          color="black"
          _hover={{ opacity: 0.9 }}
          isDisabled={!canSubmit || submitted}
          onClick={submit}
        >
          Submit quiz
        </Button>

        {result && (
          <Box borderRadius="xl" borderWidth={1} p={4}>
            <Text fontWeight="800">Score: {result.score}%</Text>
            {typeof result.passed === "boolean" && (
              <Text mt={1} opacity={0.8}>
                {result.passed ? "✅ Passed" : "❌ Not passed"}
              </Text>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
}
