import { getTranslations } from "next-intl/server";
import {
  DollarSign,
  ShoppingBag,
  Receipt,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { DashboardMetrics } from "@/types/api";

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

const GrowthBadge = ({ value }: { value: number }) => {
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="size-3" /> +{value}%
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded border border-destructive/20 bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive">
        <TrendingDown className="size-3" /> {value}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
      <Minus className="size-3" /> 0%
    </span>
  );
};

/**
 * KPI Metrics Overview Cards.
 * Pure React Server Component (RSC) rendered on the server with zero client JS bundle.
 */
export const MetricsCards = async ({ metrics }: MetricsCardsProps) => {
  const t = await getTranslations("adminDashboard.metrics");

  const cards = [
    {
      title: t("totalRevenue"),
      value: formatCurrency(metrics.totalRevenue),
      growth: metrics.revenueGrowth,
      icon: DollarSign,
    },
    {
      title: t("totalOrders"),
      value: formatNumber(metrics.totalOrders),
      growth: metrics.ordersGrowth,
      icon: ShoppingBag,
    },
    {
      title: t("averageOrderValue"),
      value: formatCurrency(metrics.averageOrderValue),
      growth: metrics.aovGrowth,
      icon: Receipt,
    },
    {
      title: t("newCustomers"),
      value: formatNumber(metrics.newCustomers),
      growth: metrics.customersGrowth,
      icon: UserPlus,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className="flex flex-col justify-between gap-2.5 rounded-lg border border-border/80 bg-card p-3.5 shadow-none transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {card.title}
              </span>
              <div className="flex size-7 items-center justify-center rounded-md border border-border/60 bg-muted/30 text-muted-foreground">
                <Icon className="size-3.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">
                {card.value}
              </span>
              <GrowthBadge value={card.growth} />
            </div>
          </Card>
        );
      })}
    </div>
  );
};
