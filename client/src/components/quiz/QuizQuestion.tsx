import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Answer {
  text: string;
  points: number;
}

interface QuizQuestionProps {
  question: string;
  answers: Answer[];
  onAnswer: (points: number) => void;
  questionNumber: number;
}

/**
 * Componente de pergunta do quiz
 */
export function QuizQuestion({ 
  question, 
  answers, 
  onAnswer,
  questionNumber 
}: QuizQuestionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 bg-white/10 backdrop-blur-md border-white/20">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          {question}
        </h2>
        
        <div className="space-y-4">
          {answers.map((answer, index) => (
            <Button
              key={index}
              onClick={() => onAnswer(answer.points)}
              className="w-full text-lg py-6 bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 transition-all"
              variant="outline"
            >
              {answer.text}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
