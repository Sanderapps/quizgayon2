import { FacebookBrandIcon, TelegramBrandIcon, WhatsAppBrandIcon, XBrandIcon } from "@/components/icons/BrandIcons";
import { cn } from "@/lib/utils";

interface QuizShareButtonsProps {
  onShare: (platform: "twitter" | "facebook" | "telegram" | "whatsapp") => void;
  className?: string;
}

const shareButtons = [
  { platform: "twitter" as const, label: "X", ariaLabel: "Compartilhar no X", icon: XBrandIcon, className: "text-slate-100" },
  { platform: "facebook" as const, label: "Facebook", ariaLabel: "Compartilhar no Facebook", icon: FacebookBrandIcon, className: "text-[#1877F2]" },
  { platform: "telegram" as const, label: "Telegram", ariaLabel: "Compartilhar no Telegram", icon: TelegramBrandIcon, className: "text-[#229ED9]" },
  { platform: "whatsapp" as const, label: "WhatsApp", ariaLabel: "Compartilhar no WhatsApp", icon: WhatsAppBrandIcon, className: "text-[#25D366]" },
];

export function QuizShareButtons({ onShare, className }: QuizShareButtonsProps) {
  return (
    <div className={cn("grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4", className)}>
      {shareButtons.map(({ platform, label, ariaLabel, icon: Icon, className: iconClassName }) => (
        <button
          key={platform}
          onClick={() => onShare(platform)}
          className="group flex min-h-[68px] items-center gap-3 rounded-xl border border-slate-200/85 bg-white/85 px-4 py-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10 dark:focus-visible:ring-offset-[#090d16]"
          aria-label={ariaLabel}
          title={ariaLabel}
        >
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-slate-50 dark:border-white/8 dark:bg-slate-950/55">
            <Icon className={cn("h-5 w-5", iconClassName)} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</span>
            <span className="block text-xs text-slate-500 transition-colors group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-300">
              Abrir compartilhamento
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
