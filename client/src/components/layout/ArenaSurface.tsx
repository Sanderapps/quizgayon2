import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ArenaSurfaceProps {
  children: ReactNode;
  className?: string;
  variant?: "panel" | "reading" | "soft";
}

const variantClasses = {
  panel: "arena-panel",
  reading: "quiz-reading-surface",
  soft: "arena-panel-soft",
};

export function ArenaSurface({ children, className, variant = "panel" }: ArenaSurfaceProps) {
  return <div className={cn(variantClasses[variant], className)}>{children}</div>;
}
