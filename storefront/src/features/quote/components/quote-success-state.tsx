"use client";

import { useTranslations } from "next-intl";
import { Link } from "@opengenset/shared/routing";
import { Button } from "@/components/ui/button";
import type { StorefrontCompanySettings } from "@/types/api";
import {
  CheckCircle2,
  PhoneCall,
  Mail,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

interface QuoteSuccessStateProps {
  quoteNumber: string;
  customerName: string;
  company: StorefrontCompanySettings;
  onReset?: () => void;
}
/**
 * Rendered upon successful submission of a B2B quote request.
 */
export function QuoteSuccessState({
  quoteNumber,
  customerName,
  company,
  onReset,
}: QuoteSuccessStateProps) {
  const t = useTranslations("Quote");
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      {/* Brand-consistent success icon */}
      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="size-10" />
      </div>

      <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
        {t("successTitle")}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {t("successDesc", { name: customerName })}
      </p>

      <div className="my-8 rounded-xl border border-border bg-muted/40 p-6 text-left">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-sm text-muted-foreground">
            {t("quoteNumberLabel")}
          </span>
          <span className="font-mono text-base font-bold text-primary">
            {quoteNumber}
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <PhoneCall className="size-4 text-primary" />
            <span>
              {t("hotline")}{" "}
              <strong className="text-foreground">
                {company.hotlines.project.display}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-primary" />
            <span>
              {t("emailSales")}{" "}
              <strong className="text-foreground">
                {company.emails.sales}
              </strong>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="lg" className="gap-2" onClick={onReset}>
          <Link href="/products">
            {t("continueBrowsing")}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={onReset}
        >
          <RotateCcw className="size-4" />
          {t("createNewQuote")}
        </Button>
      </div>
    </div>
  );
}
