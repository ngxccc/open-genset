"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { AdminDealerTier } from "@/types/api";
import { Award, Percent, DollarSign } from "lucide-react";

interface DealerTiersTableProps {
  tiers: AdminDealerTier[];
}

export function DealerTiersTable({ tiers }: DealerTiersTableProps) {
  const t = useTranslations("adminDealerTiers");

  if (tiers.length === 0) {
    return (
      <Card className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border-border/60 p-8 text-center shadow-xs">
        <Award className="mb-2 size-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      </Card>
    );
  }

  return (
    <Card size="dense" className="overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-semibold">{t("table.name")}</TableHead>
            <TableHead className="font-semibold">
              {t("table.discount")}
            </TableHead>
            <TableHead className="font-semibold">
              {t("table.minSpend")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers.map((tier) => (
            <TableRow key={tier.id} className="hover:bg-muted/30">
              <TableCell className="font-medium text-foreground">
                <div className="flex items-center gap-2">
                  <Award className="size-4 shrink-0 text-primary" />
                  <span>{tier.nameVi}</span>
                  {tier.nameEn && (
                    <span className="text-xs font-normal text-muted-foreground">
                      ({tier.nameEn})
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className="gap-1 font-mono text-xs font-semibold text-primary"
                >
                  <Percent className="size-3" />
                  <span>{tier.discountPercentage}%</span>
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  <DollarSign className="size-3.5 text-muted-foreground/70" />
                  <span>{formatCurrency(Number(tier.minimumSpend))}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
