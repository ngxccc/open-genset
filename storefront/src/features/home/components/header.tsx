import { getTranslations } from "next-intl/server";
import { Link } from "@opengenset/shared/routing";
import { HeaderQuote } from "@/features/quote";
import { MobileMenu } from "./mobile-menu";

export async function Header() {
  const t = await getTranslations("HomePage");
  const navItems = ["products", "solutions", "services"] as const;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-xl transition-all supports-backdrop-blur:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo & Brand */}
        <div className="flex items-center gap-10">
          <Link
            className="font-display flex items-center gap-2 text-2xl font-black tracking-tighter text-primary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/"
          >
            {t("brand")}
            <span className="hidden text-sm font-light tracking-widest text-muted-foreground sm:inline-block">
              {t("branchName")}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item}
                className="font-display text-xs font-bold tracking-widest text-muted-foreground uppercase transition-all duration-300 outline-none hover:scale-105 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                href={`/${item}`}
              >
                {t(`nav.${item}`)}
              </Link>
            ))}
          </nav>
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-4">
          <HeaderQuote />

          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
