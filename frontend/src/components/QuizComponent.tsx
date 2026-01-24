import React from 'react';
import { Box, Button, VStack, Text, Progress } from '@chakra-ui/react';

type Question = {
  question: string;
  options: string[];
  correct: number;
};

interface QuizProps {
  topic: string;
  questions: Question[];
  currentQuestion: number;
  score: number;
  onSubmit: (questionIndex: number, answerIndex: number) => void;
  onClose: () => void;
}

export const QuizComponent: React.FC<QuizProps> = ({
  topic,
  questions,
  currentQuestion,
  score,
  onSubmit,
  onClose
}) => {
  if (currentQuestion >= questions.length) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg">
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Quiz Complete: {topic}
        </Text>
        <Text mb={4}>
          Final Score: {score}/{questions.length}
        </Text>
        <Progress value={(score / questions.length) * 100} mb={4} />
        <Button onClick={onClose} colorScheme="blue">
          Close Quiz
        </Button>
      </Box>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <Text fontSize="xl" fontWeight="bold" mb={2}>
        Quiz: {topic}
      </Text>
      <Text mb={4}>
        Question {currentQuestion + 1} of {questions.length}
      </Text>
      
      <Text fontSize="lg" mb={4}>
        {currentQ.question}
      </Text>
      
      <VStack align="stretch" spacing={3} mb={4}>
        {currentQ.options.map((option, i) => (
          <Button 
            key={i}
            onClick={() => onSubmit(currentQuestion, i)}
            variant="outline"
            textAlign="left"
          >
            {option}
          </Button>
        ))}
      </VStack>
      
      <Text>
        Score: {score}/{questions.length}
      </Text>
    </Box>
  );
};
