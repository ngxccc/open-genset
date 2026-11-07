"use client";

import { useState, useRef } from "react";
import { ProductImage } from "@/components";
import { useQuote } from "../hooks/use-quote";
import { useIsClient } from "@/hooks/useIsClient";
import { Link } from "@opengenset/shared/routing";
import { FileText, PackagePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { priceFormatter } from "@/lib/utils";

export function HeaderQuote() {
  const t = useTranslations("Quote");
  const isMounted = useIsClient();
  const quoteItems = useQuote((state) => state.items) ?? [];
  const totalCount = quoteItems.reduce((acc, item) => acc + item.quantity, 0);

  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpen = () => {
    clearTimeout(timeoutRef.current ?? undefined);
    setIsOpen(true);
  };

  const handleClose = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  if (!isMounted) {
    return (
      <div className="relative p-2" data-testid="quote-skeleton">
        <FileText className="size-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Mobile View: Direct Link */}
      <Link
        href="/quote"
        className="relative p-2 md:hidden"
        aria-label={t("quoteList")}
      >
        <FileText className="size-6 text-zinc-600" />
        {totalCount > 0 && (
          <Badge className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary p-0 font-mono text-[9px] font-bold text-primary-foreground">
            {totalCount}
          </Badge>
        )}
      </Link>

      {/* Desktop View: Popover */}
      <div className="hidden md:block">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverAnchor asChild>
            <Link
              href="/quote"
              className="relative block cursor-pointer p-2 outline-none"
              aria-label={t("quoteList")}
              onMouseEnter={handleOpen}
              onMouseLeave={handleClose}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              <FileText className="size-6 text-zinc-600 transition-colors hover:text-zinc-900" />
              {totalCount > 0 && (
                <Badge className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary p-0 font-mono text-[9px] font-bold text-primary-foreground">
                  {totalCount}
                </Badge>
              )}
            </Link>
          </PopoverAnchor>
          <PopoverContent
            className="w-80 rounded-lg border border-border bg-background/95 p-4 shadow-lg backdrop-blur-md"
            onMouseEnter={handleOpen}
            onMouseLeave={handleClose}
          >
            {quoteItems.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {t("emptyTitle")}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-60 space-y-3 overflow-y-auto">
                  {quoteItems.slice(0, 5).map((item) => {
                    const priceNum = Number(item.price);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0"
                      >
                        <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                          {item.isCustomItem ? (
                            <PackagePlus className="size-5 text-primary opacity-80" />
                          ) : (
                            <ProductImage
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                              showText={false}
                              iconClassName="size-4"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-xs font-semibold text-foreground">
                            {item.name}
                          </h4>
                          <p className="text-[10px] text-muted-foreground">
                            {item.quantity} x{" "}
                            {priceNum > 0
                              ? priceFormatter.format(priceNum)
                              : t("contactForPrice")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button
                  asChild
                  className="h-9 w-full rounded-md text-xs font-bold tracking-wider uppercase"
                >
                  <Link href="/quote">
                    {t("viewQuoteList", { count: totalCount.toString() })}
                  </Link>
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
