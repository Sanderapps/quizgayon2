import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RankBadge } from "@/components/RankBadge";

interface QuizResultProps {
  percentage: number;
  title: string;
  description: string;
  emoji: string;
  badge?: string;
  onRestart: () => void;
  onShowLeaderboard: () => void;
  onSaveScore?: () => void;
}

/**
 * Tela de resultado do quiz
 */
export function QuizResult({
  percentage,
  title,
  description,
  emoji,
  badge,
  onRestart,
  onShowLeaderboard,
  onSaveScore
}: QuizResultProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center space-y-6 bg-white/10 backdrop-blur-md border-white/20">
        <div className="text-8xl mb-4 animate-bounce">
          {emoji}
        </div>
        
        <h2 className="text-4xl font-bold text-white mb-4">
          {title}
        </h2>
        
        <div className="text-6xl font-bold text-white mb-4">
          {Math.round(percentage)}%
        </div>
        
        {badge && (
          <div className="flex justify-center mb-4">
            <RankBadge rank={badge} />
          </div>
        )}
        
        <p className="text-xl text-white/90 mb-8">
          {description}
        </p>
        
        <div className="space-y-4">
          {onSaveScore && (
            <Button
              onClick={onSaveScore}
              size="lg"
              className="w-full text-xl py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              💾 Salvar Pontuação
            </Button>
          )}
          
          <Button
            onClick={onShowLeaderboard}
            size="lg"
            variant="outline"
            className="w-full text-xl py-6 bg-white/20 hover:bg-white/30 text-white border-2 border-white/30"
          >
            🏆 Ver Placar
          </Button>
          
          <Button
            onClick={onRestart}
            size="lg"
            variant="outline"
            className="w-full text-xl py-6 bg-white/20 hover:bg-white/30 text-white border-2 border-white/30"
          >
            🔄 Fazer Novamente
          </Button>
        </div>
      </Card>
    </div>
  );
}
