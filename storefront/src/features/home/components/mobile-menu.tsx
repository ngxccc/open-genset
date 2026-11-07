"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, usePathname } from "@opengenset/shared/routing";

export function MobileMenu() {
  const t = useTranslations("HomePage");
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const navItems = ["products", "solutions", "services"] as const;
  const ctaClasses =
    "font-display h-10 rounded-md px-4 text-xs font-bold uppercase tracking-widest transition-all duration-200";

  const close = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Toggle mobile menu"
        >
          <Menu className="size-6 text-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full max-w-xs border-l border-zinc-200 bg-white p-6"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-xl font-bold tracking-tight text-primary">
            {t("brand")}
          </SheetTitle>
          <SheetDescription className="text-xs text-zinc-500">
            {t("branchName")}
          </SheetDescription>
        </SheetHeader>

        {/* Navigation Links */}
        <nav className="mt-8 flex flex-col gap-6">
          {navItems.map((item) => (
            <Link
              key={item}
              className="font-display text-sm font-semibold tracking-wider text-zinc-600 uppercase transition-colors hover:text-primary"
              href={`/${item}`}
              onClick={(e) => {
                close();
                if (pathname === `/${item}`) {
                  e.preventDefault();
                }
              }}
            >
              {t(`nav.${item}`)}
            </Link>
          ))}
        </nav>

        {/* Actions Area */}
        <div className="mt-auto flex flex-col gap-3 border-t border-zinc-100 pt-6">
          <Button
            asChild
            className={`${ctaClasses} w-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90`}
            onClick={close}
          >
            <Link href="/products">{t("nav.products")}</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
