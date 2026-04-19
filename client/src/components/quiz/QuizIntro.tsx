import { Button } from "@/components/ui/button";
import { Rainbow, Vote, MapPin, Zap, Radio, ShieldCheck } from "lucide-react";

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

export function QuizIntro({ onStart, title = "Escolha sua leitura", description = "Responda rápido, descubra sua faixa e compartilhe o resultado.", quizId = "gay" }: QuizIntroProps) {
  const IconComponent = quizIcons[quizId] || Rainbow;

  return (
    <div className="page-enter flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="quiz-reading-surface w-full max-w-4xl rounded-[30px] p-5 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1.05fr,0.95fr] md:items-center">
          <div className="text-center md:text-left">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[26px] border border-slate-200/70 bg-white/70 md:mx-0 md:h-28 md:w-28 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="quiz-intro-icon-core flex h-16 w-16 items-center justify-center rounded-2xl md:h-20 md:w-20">
                <IconComponent className="h-12 w-12 text-purple-300 md:h-14 md:w-14" />
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Arena pronta</div>
              <h1 className="mb-3 text-3xl font-black text-slate-900 dark:text-slate-50 md:text-4xl">
                {title}
              </h1>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:mx-0 md:text-base">
                {description}
              </p>
            </div>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 dark:text-slate-300 md:justify-start">
              <span className="arena-panel-soft flex items-center gap-1 rounded-full px-3 py-2"><Zap className="w-3.5 h-3.5 text-amber-500" /> 15 perguntas</span>
              <span className="arena-panel-soft flex items-center gap-1 rounded-full px-3 py-2"><Radio className="w-3.5 h-3.5 text-cyan-500" /> trilha no ar</span>
              <span className="arena-panel-soft flex items-center gap-1 rounded-full px-3 py-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> sem cadastro</span>
            </div>

            <Button onClick={onStart} size="lg"
              className="neon-btn w-full rounded-xl py-6 text-base font-bold">
              <span>Entrar no quiz</span>
              <Zap className="w-5 h-5" />
            </Button>
          </div>

          <div className="arena-poster-frame overflow-hidden rounded-[24px] p-3">
            <img
              src="/share-cover.svg"
              alt="Poster neon da arena QuiZoeira"
              className="h-full w-full rounded-[18px] object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
