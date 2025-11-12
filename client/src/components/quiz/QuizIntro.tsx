import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rainbow, Vote, MapPin, Sparkles } from "lucide-react";

interface QuizIntroProps {
  onStart: () => void;
  title?: string;
  description?: string;
  quizId?: string;
}

// Mapeamento de ícones para cada quiz
const quizIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "gay": Rainbow,
  "politico": Vote,
  "regional": MapPin,
};

/**
 * Tela de introdução do quiz
 */
export function QuizIntro({ 
  onStart, 
  title = "Quão Gay Você É?",
  description = "Descubra seu nível de gayness com este quiz divertido e sem compromisso!",
  quizId = "gay"
}: QuizIntroProps) {
  const IconComponent = quizIcons[quizId] || Rainbow;
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center space-y-6 bg-white/10 backdrop-blur-md border-white/20">
        <div className="mb-4 flex justify-center animate-bounce">
          <IconComponent className="w-24 h-24 md:w-32 md:h-32 text-white" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {title.replace(/[^\w\s]/gi, '').trim()}
        </h1>
        
        <p className="text-lg md:text-xl text-white/90 mb-8">
          {description}
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={onStart}
            size="lg"
            className="w-full text-lg md:text-xl py-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 flex items-center justify-center gap-2"
          >
            <span>Começar Quiz!</span>
            <Sparkles className="w-5 h-5" />
          </Button>
          
          <p className="text-sm text-white/70">
            15 perguntas • ~1 minuto • 100% anônimo
          </p>
        </div>
      </Card>
    </div>
  );
}
