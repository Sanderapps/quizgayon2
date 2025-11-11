import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface QuizIntroProps {
  onStart: () => void;
  title?: string;
  description?: string;
  emoji?: string;
}

/**
 * Tela de introdução do quiz
 */
export function QuizIntro({ 
  onStart, 
  title = "Quão Gay Você É?",
  description = "Descubra seu nível de gayness com este quiz divertido e sem compromisso!",
  emoji = "🌈"
}: QuizIntroProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center space-y-6 bg-white/10 backdrop-blur-md border-white/20">
        <div className="text-8xl mb-4 animate-bounce">
          {emoji}
        </div>
        
        <h1 className="text-5xl font-bold text-white mb-4">
          {title}
        </h1>
        
        <p className="text-xl text-white/90 mb-8">
          {description}
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={onStart}
            size="lg"
            className="w-full text-xl py-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            Começar Quiz! 🎉
          </Button>
          
          <p className="text-sm text-white/70">
            15 perguntas • ~2 minutos • 100% anônimo
          </p>
        </div>
      </Card>
    </div>
  );
}
