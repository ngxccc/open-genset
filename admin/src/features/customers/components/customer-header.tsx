"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@opengenset/shared/routing";
import { Button } from "@/components/ui/button";
import { List, Award } from "lucide-react";

interface CustomerHeaderProps {
  title: string;
  description?: string;
}

export const CustomerHeader = ({ title, description }: CustomerHeaderProps) => {
  const tNav = useTranslations("adminDashboard.nav");
  const pathname = usePathname();

  const isTiersActive = pathname.includes("/tiers");
  const isDirectoryActive = !isTiersActive;

  return (
    <div className="flex flex-col gap-4 pb-1">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Segmented active page navigations */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Button
          asChild
          variant={isDirectoryActive ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          <Link href="/customers">
            <List className="size-4" />
            <span>{tNav("customers")}</span>
          </Link>
        </Button>
        <Button
          asChild
          variant={isTiersActive ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          <Link href="/customers/tiers">
            <Award className="size-4" />
            <span>{tNav("dealerTiers")}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};
