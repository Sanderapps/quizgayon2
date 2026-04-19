import type { ReactNode } from "react";
import { ChatWidget } from "@/components/ChatWidget";
import { RadioPlayer } from "@/components/RadioPlayer";
import { TopMenu } from "@/components/TopMenu";
import { cn } from "@/lib/utils";

interface ArenaPageShellProps {
  children: ReactNode;
  onNavigate?: (page: string) => void;
  overlay?: ReactNode;
  rootClassName?: string;
  shellClassName?: string;
  showMenu?: boolean;
  showChat?: boolean;
  showRadio?: boolean;
}

export function ArenaPageShell({
  children,
  onNavigate,
  overlay,
  rootClassName,
  shellClassName,
  showMenu = true,
  showChat = true,
  showRadio = true,
}: ArenaPageShellProps) {
  return (
    <div className={cn("relative min-h-screen", rootClassName)}>
      <div className="arena-backdrop" />
      {overlay}
      <div className={cn("arena-shell", shellClassName)}>
        {showMenu ? <TopMenu onNavigate={onNavigate} /> : null}
        {children}
      </div>
      {showChat ? <ChatWidget /> : null}
      {showRadio ? <RadioPlayer /> : null}
    </div>
  );
}
