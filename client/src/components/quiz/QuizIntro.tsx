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
    <div className="page-enter flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="quiz-reading-surface w-full max-w-xl rounded-[30px] p-8 text-center md:p-10">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[26px] border border-white/10 bg-white/[0.03] md:h-28 md:w-28">
          <div className="quiz-intro-icon-core flex h-16 w-16 items-center justify-center rounded-2xl md:h-20 md:w-20">
            <IconComponent className="h-12 w-12 text-purple-300 md:h-14 md:w-14" />
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Pronto para entrar?</div>
          <h1 className="mb-3 text-3xl font-black text-slate-50 md:text-4xl">
            {title.replace(/[^\w\s]/gi, '').trim()}
          </h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-300 md:text-base">
            {description}
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
          <span className="arena-panel-soft flex items-center gap-1 rounded-full px-3 py-2"><Zap className="w-3.5 h-3.5 text-amber-500" /> 50 perguntas</span>
          <span className="arena-panel-soft rounded-full px-3 py-2">~2 minutos</span>
          <span className="arena-panel-soft rounded-full px-3 py-2">100% anônimo</span>
        </div>

        <Button onClick={onStart} size="lg"
          className="neon-btn w-full rounded-xl py-6 text-base font-bold">
          <span>Entrar na Arena</span>
          <Zap className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
