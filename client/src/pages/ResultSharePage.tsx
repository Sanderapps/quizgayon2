import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArenaPageShell } from "@/components/layout/ArenaPageShell";
import { ArenaSurface } from "@/components/layout/ArenaSurface";
import { QuizShareButtons } from "@/components/quiz/QuizShareButtons";
import { quizAudio } from "@/lib/quizAudio";
import { buildResultShareMeta, buildResultShareUrl, buildSavedScoreShareMeta, buildSavedScoreShareUrl, buildShareMessage } from "@/lib/quizShare";
import { getQuizById, getDefaultQuiz } from "@/data/quizzes";
import { buscarResultadoCompartilhavel, pontuacaoParaPercentual } from "@/services/api";
import { Copy, RotateCcw, Search, Trophy } from "lucide-react";
import { toast } from "sonner";

function useShareQueryParams() {
  return useMemo(() => new URLSearchParams(window.location.search), []);
}

export default function ResultSharePage() {
  const params = useParams<{ quizId?: string; percentage?: string; scoreId?: string }>();
  const [, navigate] = useLocation();
  const query = useShareQueryParams();
  const [lookupCode, setLookupCode] = useState(params.scoreId || "");
  const [loadedScore, setLoadedScore] = useState<Awaited<ReturnType<typeof buscarResultadoCompartilhavel>>>(null);
  const [isLoading, setIsLoading] = useState(Boolean(params.scoreId));
  const [loadError, setLoadError] = useState("");

  const percentage = loadedScore ? pontuacaoParaPercentual(loadedScore.pontuacao, 15) : Number(params.percentage || 0);
  const quiz = getQuizById(loadedScore?.quiz_id || params.quizId || "") || getDefaultQuiz();
  const meta = loadedScore
    ? buildSavedScoreShareMeta(loadedScore.id, quiz.id, percentage)
    : buildResultShareMeta(quiz.id, percentage);
  const points = query.get("pontos");
  const time = query.get("tempo");
  const resultPoints = loadedScore ? loadedScore.pontuacao : points ? Number(points) : undefined;
  const resultTime = loadedScore ? loadedScore.tempo_segundos : time ? Number(time) : undefined;
  const canonicalUrl = loadedScore
    ? buildSavedScoreShareUrl(window.location.origin, loadedScore.id)
    : buildResultShareUrl(window.location.origin, quiz.id, percentage, resultPoints, resultTime);

  useEffect(() => {
    if (!params.scoreId) {
      setLoadedScore(null);
      setLoadError("");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setLoadError("");
    buscarResultadoCompartilhavel(Number(params.scoreId)).then((score) => {
      if (!isMounted) return;
      setLoadedScore(score);
      setLookupCode(String(params.scoreId));
      setLoadError(score ? "" : "Não encontrei um resultado salvo com esse código.");
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [params.scoreId]);

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
    quizAudio.playShare();
    const url = canonicalUrl;
    const text = buildShareMessage(quiz.id, percentage);
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    };
    window.open(shareUrls[platform], "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      quizAudio.playSubmit();
      toast.success("Link copiado");
    } catch (error) {
      console.error("Falha ao copiar link:", error);
      toast.error("Não deu para copiar o link agora");
    }
  };

  const handleLookup = (event: FormEvent) => {
    event.preventDefault();
    const numericCode = lookupCode.trim();
    if (!numericCode) {
      setLoadError("Digite um código para abrir um resultado.");
      return;
    }
    quizAudio.playConfirm();
    navigate(`/resultado/codigo/${encodeURIComponent(numericCode)}`);
  };

  const showResultCard = Boolean(params.quizId && params.percentage) || Boolean(loadedScore);

  return (
    <ArenaPageShell shellClassName="px-4 pb-32 pt-24">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <ArenaSurface variant="reading" className="rounded-[30px] p-8 text-center md:p-10">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Central de compartilhamento</div>
          <h1 className="mb-3 text-3xl font-black text-slate-900 dark:text-slate-50 md:text-4xl">
            {showResultCard ? meta.headline : "Abrir resultado por código"}
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
            {showResultCard
              ? meta.description
              : "Cole o código de um resultado salvo para abrir a página oficial de compartilhamento."}
          </p>

          <form onSubmit={handleLookup} className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="share-code">Código do resultado</label>
            <input
              id="share-code"
              type="text"
              inputMode="numeric"
              value={lookupCode}
              onChange={(event) => setLookupCode(event.target.value.replace(/[^\d]/g, ""))}
              placeholder="Digite o código do resultado"
              className="w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-fuchsia-400/60 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-purple-400/50"
            />
            <button type="submit" className="neon-btn neon-btn-strong inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white">
              <Search className="mr-2 h-4 w-4" />
              Abrir resultado
            </button>
          </form>

          {loadError ? (
            <div className="mt-3 text-sm font-medium text-rose-500">{loadError}</div>
          ) : null}

          {isLoading ? (
            <div className="mt-8 text-sm text-slate-500 dark:text-slate-400">Carregando resultado salvo...</div>
          ) : null}

          {showResultCard ? (
            <>
              <ArenaSurface variant="soft" className="mx-auto mt-8 max-w-2xl rounded-2xl p-5 text-left">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Link oficial</div>
                <div className="rounded-xl border border-slate-200/85 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-950/55">
                  <div className="text-xs uppercase tracking-[0.16em] text-cyan-700/70 dark:text-cyan-300/70">QuiZoeira</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-50">{meta.headline}</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{meta.description}</p>
                  <div className="mt-3 truncate text-xs text-slate-500">{canonicalUrl}</div>
                </div>
              </ArenaSurface>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <ArenaSurface variant="soft" className="rounded-xl p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Quiz</div>
                  <div className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{meta.quizTitle}</div>
                </ArenaSurface>
                <ArenaSurface variant="soft" className="rounded-xl p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Faixa</div>
                  <div className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{meta.resultTitle}</div>
                </ArenaSurface>
                <ArenaSurface variant="soft" className="rounded-xl p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Pontuação</div>
                  <div className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{percentage}%</div>
                </ArenaSurface>
              </div>

              {loadedScore ? (
                <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                  Código #{loadedScore.id} • {loadedScore.apelido}
                  {typeof resultTime === "number" ? ` • ${Math.round(resultTime)}s` : ""}
                </div>
              ) : (points || time) ? (
                <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                  {points ? `${points} pontos` : null}
                  {points && time ? " • " : null}
                  {time ? `${time}s de partida` : null}
                </div>
              ) : null}

              <div className="mt-8">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Enviar para</div>
                <QuizShareButtons onShare={handleShare} className="mx-auto" />
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="mx-auto mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/85 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <Copy className="h-4 w-4" />
                Copiar link
              </button>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link href={`/quiz/${quiz.slug}`} onClick={() => quizAudio.playConfirm()} className="neon-btn neon-btn-strong rounded-xl px-5 py-4 text-center font-semibold text-white">
                  <RotateCcw className="mr-2 inline h-4 w-4" />
                  Jogar este quiz
                </Link>
                <Link href="/" onClick={() => quizAudio.playTap()} className="rounded-xl border border-slate-200/85 bg-white px-5 py-4 text-center font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
                  <Trophy className="mr-2 inline h-4 w-4" />
                  Explorar outras arenas
                </Link>
              </div>
            </>
          ) : null}
        </ArenaSurface>
      </div>
    </ArenaPageShell>
  );
}
