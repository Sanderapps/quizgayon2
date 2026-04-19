import { useEffect, useMemo } from "react";
import { Link, useParams } from "wouter";
import { ArenaPageShell } from "@/components/layout/ArenaPageShell";
import { ArenaSurface } from "@/components/layout/ArenaSurface";
import { QuizShareButtons } from "@/components/quiz/QuizShareButtons";
import { buildResultShareMeta, buildResultShareUrl, buildShareMessage } from "@/lib/quizShare";
import { getQuizById, getDefaultQuiz } from "@/data/quizzes";
import { Copy, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";

function useShareQueryParams() {
  return useMemo(() => new URLSearchParams(window.location.search), []);
}

export default function ResultSharePage() {
  const params = useParams<{ quizId?: string; percentage?: string }>();
  const query = useShareQueryParams();

  const percentage = Number(params.percentage || 0);
  const quiz = getQuizById(params.quizId || "") || getDefaultQuiz();
  const meta = buildResultShareMeta(quiz.id, percentage);
  const points = query.get("pontos");
  const time = query.get("tempo");

  useEffect(() => {
    document.title = `${meta.headline} • QuiZoeira`;

    const upsertMeta = (selector: string, attr: "content" | "href", value: string, tagName = "meta") => {
      let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
      if (!element) {
        element = document.createElement(tagName) as HTMLMetaElement | HTMLLinkElement;
        if (tagName === "meta") {
          const [, name, property] = selector.match(/\[(name|property)="([^"]+)"\]/) || [];
          if (name === "name") (element as HTMLMetaElement).setAttribute("name", property);
          if (name === "property") (element as HTMLMetaElement).setAttribute("property", property);
        }
        if (tagName === "link") (element as HTMLLinkElement).rel = "canonical";
        document.head.appendChild(element);
      }
      element.setAttribute(attr, value);
    };

    const canonicalUrl = buildResultShareUrl(window.location.origin, quiz.id, percentage);
    upsertMeta('meta[name="description"]', "content", meta.description);
    upsertMeta('meta[property="og:title"]', "content", meta.headline);
    upsertMeta('meta[property="og:description"]', "content", meta.description);
    upsertMeta('meta[property="og:image"]', "content", `${window.location.origin}${meta.imagePath}`);
    upsertMeta('meta[property="og:url"]', "content", canonicalUrl);
    upsertMeta('meta[name="twitter:title"]', "content", meta.headline);
    upsertMeta('meta[name="twitter:description"]', "content", meta.description);
    upsertMeta('meta[name="twitter:image"]', "content", `${window.location.origin}${meta.imagePath}`);
    upsertMeta('link[rel="canonical"]', "href", canonicalUrl, "link");
  }, [meta, percentage, quiz.id]);

  const handleShare = (platform: "twitter" | "facebook" | "telegram" | "whatsapp") => {
    const url = buildResultShareUrl(window.location.origin, quiz.id, percentage, points ? Number(points) : undefined, time ? Number(time) : undefined);
    const text = buildShareMessage(quiz.id, percentage);
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    };
    window.open(shareUrls[platform], "_blank", "noopener,noreferrer");
  };

  const canonicalUrl = buildResultShareUrl(window.location.origin, quiz.id, percentage, points ? Number(points) : undefined, time ? Number(time) : undefined);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      toast.success("Link copiado");
    } catch (error) {
      console.error("Falha ao copiar link:", error);
      toast.error("Não deu para copiar o link agora");
    }
  };

  return (
    <ArenaPageShell shellClassName="px-4 pb-32 pt-24">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <ArenaSurface variant="reading" className="rounded-[30px] p-8 text-center md:p-10">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Resultado compartilhável</div>
          <h1 className="mb-3 text-3xl font-black text-slate-50 md:text-4xl">{meta.headline}</h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">{meta.description}</p>

          <ArenaSurface variant="soft" className="mx-auto mt-8 max-w-2xl rounded-2xl p-5 text-left">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Prévia do link</div>
            <div className="rounded-xl border border-white/10 bg-slate-950/55 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-cyan-300/70">QuiZoeira</div>
              <div className="mt-2 text-lg font-semibold text-slate-50">{meta.headline}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{meta.description}</p>
              <div className="mt-3 truncate text-xs text-slate-500">{canonicalUrl}</div>
            </div>
          </ArenaSurface>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ArenaSurface variant="soft" className="rounded-xl p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Quiz</div>
              <div className="mt-2 text-base font-semibold text-slate-100">{meta.quizTitle}</div>
            </ArenaSurface>
            <ArenaSurface variant="soft" className="rounded-xl p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Faixa</div>
              <div className="mt-2 text-base font-semibold text-slate-100">{meta.resultTitle}</div>
            </ArenaSurface>
            <ArenaSurface variant="soft" className="rounded-xl p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Pontuação</div>
              <div className="mt-2 text-base font-semibold text-slate-100">{percentage}%</div>
            </ArenaSurface>
          </div>

          {(points || time) && (
            <div className="mt-6 text-sm text-slate-400">
              {points ? `${points} pontos` : null}
              {points && time ? " • " : null}
              {time ? `${time}s de partida` : null}
            </div>
          )}

          <div className="mt-8">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Enviar para</div>
            <QuizShareButtons onShare={handleShare} className="mx-auto" />
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="mx-auto mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
          >
            <Copy className="h-4 w-4" />
            Copiar link
          </button>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link href={`/quiz/${quiz.slug}`} className="neon-btn rounded-xl px-5 py-4 text-center font-semibold text-white">
              <RotateCcw className="mr-2 inline h-4 w-4" />
              Jogar este quiz
            </Link>
            <Link href="/" className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-center font-semibold text-slate-200 transition-colors hover:bg-white/10">
              <Trophy className="mr-2 inline h-4 w-4" />
              Explorar outras arenas
            </Link>
          </div>
        </ArenaSurface>
      </div>
    </ArenaPageShell>
  );
}
