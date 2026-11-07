import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ProductThumbnail } from "./product-thumbnail";
import type { TopSellingProduct } from "@/types/api";

interface TopProductsProps {
  products: TopSellingProduct[];
}

/**
 * Top Selling Products section.
 * Pure React Server Component rendering list items with minimal client footprint.
 */
export async function TopProducts({ products = [] }: TopProductsProps) {
  const t = await getTranslations("adminDashboard.topProducts");

  return (
    <Card size="compact" className="h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
        <h3 className="text-base font-semibold text-foreground">
          {t("title")}
        </h3>
        <Button
          variant="link"
          className="px-0 text-xs font-medium text-primary"
        >
          {t("viewAll")}
        </Button>
      </div>
      {products.length === 0 ? (
        <div className="flex h-full min-h-[220px] flex-1 items-center justify-center p-4 text-center text-xs text-muted-foreground">
          {t("noProducts")}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto pt-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
            >
              <div className="relative size-10 shrink-0 overflow-hidden rounded border border-border/50 bg-muted">
                <ProductThumbnail src={product.image} alt={product.name} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-xs font-medium text-foreground">
                  {product.name}
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  {t("sold", {
                    count: String(product.sold),
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-foreground">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
