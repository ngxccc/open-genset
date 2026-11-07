"use client";

import { useState, useEffect, useTransition, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Search, Loader2, Plus, Check, Zap, Package } from "lucide-react";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { canUseCldImage } from "@/lib";
import type { AdminProduct } from "@/types/api";
import { formatCurrency } from "@/lib/utils";
import { searchProductsAction } from "@/features/products/actions";
import { useQuoteDraftStore } from "../stores/quote-draft.store";

export interface ProductSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProduct?: (product: AdminProduct) => void;
  trigger?: ReactNode;
}

export const ProductSearchModal = ({
  open,
  onOpenChange,
  onSelectProduct,
}: ProductSearchModalProps) => {
  const t = useTranslations("adminQuotes.searchModal");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminProduct[]>([]);
  const [isSearching, startSearchTransition] = useTransition();
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const addProductToDraft = useQuoteDraftStore((state) => state.addProduct);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
    }
    onOpenChange(isOpen);
  };

  // Debounced search query execution (300ms)
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || !open) {
      return;
    }

    const timer = setTimeout(() => {
      startSearchTransition(async () => {
        const response = await searchProductsAction(trimmed, 8);
        if (response.success) {
          setResults(response.data);
        } else {
          toast.error(response.error);
        }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, open]);

  const handleSelect = (product: AdminProduct) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      addProductToDraft(product);
      toast.success(t("productAddedToast", { name: product.name }));
    }

    setRecentlyAddedId(product.id);
    setTimeout(() => setRecentlyAddedId(null), 1200);
  };

  const extractModelAndPower = (product: AdminProduct) => {
    let model: string | null = null;

    if (Array.isArray(product.specSheet)) {
      for (const group of product.specSheet) {
        const modelItem = group.items.find((i) => i.key === "model");
        if (modelItem?.value.trim()) {
          model = modelItem.value.trim();
          break;
        }
      }
    }

    const power = product.powerKva ?? product.powerKw;
    const powerStr = power ? `${power} kVA` : null;
    const phaseStr =
      product.phase === "1phase"
        ? "1 Pha"
        : product.phase === "3phase"
          ? "3 Pha"
          : product.phase;

    return {
      model,
      power: powerStr,
      phase: phaseStr,
    };
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b p-4 pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Search className="h-5 w-5 text-primary" />
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="border-b bg-muted/30 p-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("inputPlaceholder")}
              className="h-11 bg-background pr-9 pl-9 text-sm font-medium shadow-xs focus-visible:ring-primary"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="max-h-[380px] min-h-[160px] divide-y divide-border/60 overflow-y-auto p-2">
          {isSearching && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs">{t("searching")}</p>
            </div>
          ) : results.length > 0 ? (
            results.map((product) => {
              const { model, power, phase } = extractModelAndPower(product);
              const image = product.images[0];
              const inStock = product.totalStockCache > 0;
              const isJustAdded = recentlyAddedId === product.id;

              return (
                <div
                  key={product.id}
                  className="group flex items-center justify-between gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
                      {image && canUseCldImage(image) ? (
                        <CldImage
                          src={image}
                          alt={product.name}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      ) : image ? (
                        <Image
                          src={image}
                          alt={product.name}
                          width={56}
                          height={56}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Package className="h-6 w-6 stroke-1" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col gap-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="max-w-xs truncate text-sm font-semibold text-foreground">
                          {product.name}
                        </span>
                        {model && (
                          <Badge
                            variant="outline"
                            className="bg-background px-1.5 py-0 text-[10px] uppercase"
                          >
                            {model}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {power && (
                          <span className="flex items-center gap-0.5 font-medium text-orange-600 dark:text-orange-400">
                            <Zap className="h-3 w-3" />
                            {power}
                          </span>
                        )}
                        {phase && <span>• {phase}</span>}
                        <span>•</span>
                        <span
                          className={`font-medium ${
                            inStock
                              ? "text-green-600 dark:text-green-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {inStock
                            ? t("inStock", {
                                count: String(product.totalStockCache),
                              })
                            : t("outOfStock")}
                        </span>
                      </div>

                      <div className="mt-0.5 text-sm font-bold text-primary">
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant={isJustAdded ? "secondary" : "default"}
                    onClick={() => handleSelect(product)}
                    className="shrink-0 gap-1.5 font-medium shadow-xs"
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-600" />
                        {t("added")}
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        {t("select")}
                      </>
                    )}
                  </Button>
                </div>
              );
            })
          ) : query.trim() ? (
            <div className="flex flex-col items-center justify-center gap-1 py-10 text-muted-foreground">
              <p className="text-sm font-medium">{t("noResults")}</p>
              <p className="text-xs">{t("noResultsHint")}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 py-10 text-muted-foreground">
              <Search className="h-8 w-8 stroke-1 text-muted-foreground/40" />
              <p className="mt-1 text-xs">{t("emptyPrompt")}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
