"use client";

import { useTranslations } from "next-intl";
import { Calculator, Save, RotateCcw, Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { useQuoteDraftStore } from "../stores/quote-draft.store";

export interface QuoteFinancialSummaryProps {
  isSubmitting?: boolean;
  onSubmitQuote: () => void;
}

export const QuoteFinancialSummary = ({
  isSubmitting = false,
  onSubmitQuote,
}: QuoteFinancialSummaryProps) => {
  const t = useTranslations("adminQuotes.composer.summary");

  const items = useQuoteDraftStore((state) => state.items);
  const vatRate = useQuoteDraftStore((state) => state.commercialTerms.vatRate);
  const resetDraft = useQuoteDraftStore((state) => state.resetDraft);

  // Compute metrics
  let subtotal = 0;
  let totalUnits = 0;

  for (const item of items) {
    const finalUnit = item.unitPrice * (1 - item.discountPercent / 100);
    subtotal += finalUnit * item.quantity;
    totalUnits += item.quantity;
  }

  const vatAmount = subtotal * (vatRate / 100);
  const grandTotal = subtotal + vatAmount;

  return (
    <Card size="dense" className="sticky top-6">
      <CardHeader bordered size="dense" className="bg-muted/20">
        <CardTitle>
          <Calculator />
          {t("title")}
        </CardTitle>
      </CardHeader>

      <CardContent size="dense" className="space-y-3 text-xs">
        {/* Total Items & Units */}
        <div className="flex items-center justify-between text-muted-foreground">
          <span>{t("totalItems")}</span>
          <span className="font-semibold text-foreground">
            {items.length} {t("lineItemsUnit")} ({totalUnits} {t("unitsCount")})
          </span>
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("subtotal")}</span>
          <span className="text-sm font-semibold text-foreground">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {/* VAT Amount */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            {t("vat")} ({vatRate}%)
          </span>
          <span className="font-semibold text-foreground">
            {formatCurrency(vatAmount)}
          </span>
        </div>

        <Separator className="my-2" />

        {/* Grand Total */}
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-sm font-bold text-foreground">
            {t("grandTotal")}
          </span>
          <div className="text-right">
            <span className="block text-lg font-bold text-primary">
              {formatCurrency(grandTotal)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {t("vatInclusiveNotice")}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter size="dense" className="flex flex-col gap-2 border-t pt-2">
        <Button
          type="button"
          disabled={isSubmitting || items.length === 0}
          onClick={onSubmitQuote}
          className="w-full gap-2 font-semibold shadow-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("submitting")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {t("submitButton")}
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isSubmitting || items.length === 0}
          onClick={() => {
            if (window.confirm(t("confirmResetDraft"))) {
              resetDraft();
            }
          }}
          className="w-full gap-1.5 text-xs text-muted-foreground hover:text-destructive"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {t("resetDraftButton")}
        </Button>
      </CardFooter>
    </Card>
  );
};
