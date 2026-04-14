import { Button } from "@/components/ui/button";
import { Rainbow, Vote, MapPin, Zap } from "lucide-react";

interface QuizIntroProps {
  onStart: () => void;
  title?: string;
  description?: string;
  quizId?: string;
}

const quizIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "gay": Rainbow,
  "politico": Vote,
  "regional": MapPin,
};

export function QuizIntro({ onStart, title = "Quão Gay Você É?", description = "Descubra seu nível com este quiz divertido!", quizId = "gay" }: QuizIntroProps) {
  const IconComponent = quizIcons[quizId] || Rainbow;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 page-enter">
      <div className="max-w-lg w-full neon-card rounded-3xl p-8 md:p-10 text-center space-y-6">
        {/* Icon with glow */}
        <div className="relative w-24 h-24 md:w-28 md:h-28 mx-auto">
          <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30"
            style={{ background: "linear-gradient(135deg, #a855f7, #06b6d4)" }} />
          <div className="relative w-full h-full rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(6, 182, 212, 0.15))", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
            <IconComponent className="w-12 h-12 md:w-14 md:h-14 text-purple-400" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="orbitron text-3xl md:text-4xl font-black dark:text-white text-gray-900 mb-3">
            {title.replace(/[^\w\s]/gi, '').trim()}
          </h1>
          <p className="dark:text-gray-400 text-gray-500 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
            {description}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 text-xs dark:text-gray-500 text-gray-400">
          <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> 50 perguntas</span>
          <span>•</span>
          <span>~2 minutos</span>
          <span>•</span>
          <span>100% anônimo</span>
        </div>

        {/* Start Button */}
        <Button onClick={onStart} size="lg"
          className="w-full text-base py-6 rounded-xl font-bold neon-btn">
          <span>Entrar na Arena</span>
          <Zap className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
