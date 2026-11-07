"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@opengenset/shared/routing";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  RotateCcw,
  Home,
  ChevronDown,
  ChevronUp,
  Terminal,
} from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  const t = useTranslations("errorPage");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log segment error for observability
    console.error("[Admin Segment Error Captured]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center space-y-6">
        {/* Error Icon Badge with Soft Glow */}
        <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5 transition-all">
          <AlertTriangle className="size-10 stroke-[2.25]" />
        </div>

        {/* Error Heading & Status Tag */}
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-bold tracking-wider text-destructive uppercase">
            <Terminal className="size-3.5" />
            {t("status")}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h1>
        </div>

        {/* Descriptive Message */}
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t("description")}
        </p>

        {/* Optional Error Digest Badge */}
        {error.digest && (
          <div className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
            <span>{t("digest", { digest: error.digest })}</span>
          </div>
        )}

        {/* Action Buttons: Try Again & Back to Dashboard */}
        <div className="flex w-full max-w-sm flex-col items-center justify-center gap-3 pt-1 sm:max-w-none sm:flex-row">
          <Button
            onClick={() => reset()}
            variant="default"
            size="default"
            className="w-full gap-2 font-semibold shadow-xs sm:w-auto"
          >
            <RotateCcw className="size-4" />
            <span>{t("retryButton")}</span>
          </Button>

          <Button
            asChild
            variant="outline"
            size="default"
            className="w-full gap-2 font-medium shadow-xs sm:w-auto"
          >
            <Link href="/">
              <Home className="size-4" />
              <span>{t("homeButton")}</span>
            </Link>
          </Button>
        </div>

        {/* Technical Error Details (Collapsible & Safe in Non-Production) */}
        {process.env.NODE_ENV !== "production" && (
          <div className="w-full pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails((prev) => !prev)}
              className="gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <span>{t("technicalDetails")}</span>
              {showDetails ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </Button>

            {showDetails && (
              <div className="relative mt-3 max-h-56 w-full [scrollbar-width:thin] [scrollbar-color:var(--color-border)_transparent] overflow-auto rounded-xl border border-border/80 bg-muted/60 p-4 text-left font-mono text-xs text-foreground shadow-xs [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-track]:bg-transparent">
                <p className="font-bold text-destructive">
                  {error.name}: {error.message}
                </p>
                {error.stack && (
                  <pre className="mt-2.5 text-[11px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
