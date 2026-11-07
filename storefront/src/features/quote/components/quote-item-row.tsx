"use client";

import { useTranslations } from "next-intl";
import { type QuoteItem } from "../hooks/use-quote";
import { ProductImage } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  priceFormatter,
  formatNumberInput,
  parseNumberInput,
} from "@/lib/utils";
import { Trash2, Plus, Minus, PackagePlus } from "lucide-react";

interface QuoteItemRowProps {
  item: QuoteItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdateRequestedPrice: (id: string, requestedPrice: string | null) => void;
  onRemoveItem: (id: string) => void;
}

/**
 * Single line item in the B2B Quote Request items list.
 */
export function QuoteItemRow({
  item,
  onUpdateQuantity,
  onUpdateRequestedPrice,
  onRemoveItem,
}: QuoteItemRowProps) {
  const t = useTranslations("Quote");
  const itemId = item.id;
  const inputId = `req-price-${itemId}`;
  const itemPriceNum = Number(item.price);
  const hasPrice = itemPriceNum > 0;

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-6">
      <div className="flex items-start gap-4">
        {/* Thumbnail / Custom Icon */}
        <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40 sm:size-20">
          {item.isCustomItem ? (
            <PackagePlus className="size-7 text-primary opacity-80" />
          ) : (
            <ProductImage
              src={item.image}
              alt={item.name}
              fill
              sizes="80px"
              className="object-contain p-1"
              iconClassName="size-5"
            />
          )}
        </div>

        {/* Item Details */}
        <div className="flex grow flex-col">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground sm:text-base">
                {item.name}
              </h3>
              {item.isCustomItem && (
                <span className="mt-1 inline-block rounded-xs bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {t("customBadge")}
                </span>
              )}
              {item.model && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Model:{" "}
                  <strong className="text-foreground">{item.model}</strong>
                </p>
              )}
              {item.specs && (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground italic">
                  {item.specs}
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onRemoveItem(itemId)}
              title={t("deleteItem")}
              aria-label={t("deleteItem")}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          {!item.isCustomItem && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("referencePriceLabel")}{" "}
              <span className="font-medium text-foreground">
                {hasPrice
                  ? priceFormatter.format(itemPriceNum)
                  : t("contactForPrice")}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Controls: Quantity & Requested Price */}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {t("customItemQuantity")}:
          </span>
          <div className="flex items-center rounded-md border border-border">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-7 rounded-none text-muted-foreground hover:bg-muted disabled:opacity-40"
              onClick={() => {
                onUpdateQuantity(itemId, Math.max(1, item.quantity - 1));
              }}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="size-3" />
            </Button>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onUpdateQuantity(itemId, isNaN(val) ? 1 : Math.max(1, val));
              }}
              className="w-10 [appearance:textfield] bg-transparent text-center text-xs font-bold text-foreground outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label={t("customItemQuantity")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-7 rounded-none text-muted-foreground hover:bg-muted"
              onClick={() => {
                onUpdateQuantity(itemId, item.quantity + 1);
              }}
              aria-label="Increase quantity"
            >
              <Plus className="size-3" />
            </Button>
          </div>
        </div>

        {/* Requested Price Input */}
        <div className="flex items-center gap-2">
          <label
            htmlFor={inputId}
            className="text-xs whitespace-nowrap text-muted-foreground select-none"
          >
            {t("requestedPriceLabel")}
          </label>
          <Input
            id={inputId}
            type="text"
            placeholder={
              hasPrice
                ? formatNumberInput(itemPriceNum)
                : t("requestedPricePlaceholder")
            }
            value={
              item.requestedPrice ? formatNumberInput(item.requestedPrice) : ""
            }
            onChange={(e) => {
              const digits = parseNumberInput(e.target.value);
              onUpdateRequestedPrice(itemId, digits ? digits : null);
            }}
            className="h-8 w-36 text-right text-xs placeholder:text-muted-foreground/60 sm:w-44"
          />
        </div>
      </div>
    </div>
  );
}
