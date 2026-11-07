import { CopyrightYear } from "./copyright-year";
import { Link } from "@opengenset/shared/routing";
import { getTranslations } from "next-intl/server";
import { getCompanySettings } from "@/features/settings/api/company-settings.api";

export async function Footer() {
  const [t, company] = await Promise.all([
    getTranslations("HomePage"),
    getCompanySettings(),
  ]);
  return (
    <footer className="mt-10 border-t bg-muted/20 pt-14 pb-4 lg:mt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Legal Entity & Overview */}
          <div>
            <Link
              href="/"
              className="font-display mb-4 block text-2xl font-black tracking-tighter text-primary transition-opacity hover:opacity-80"
            >
              {t("brand")}{" "}
              <span className="font-light text-foreground opacity-80">
                {t("branchName").toUpperCase()}
              </span>
            </Link>
            <p className="mb-2 text-xs font-semibold tracking-wider text-foreground uppercase">
              {t("footer.companyName")}
            </p>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
              {t("footer.description")}
            </p>
            <p className="text-xs text-muted-foreground">{t("footer.taxId")}</p>
          </div>

          {/* Column 2: Headquarters & Warehouses */}
          <div>
            <div className="font-display mb-4 text-sm font-bold tracking-widest text-foreground uppercase">
              {t("footer.headquartersTitle")}
            </div>
            <ul className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
              <li>{t("footer.headquarters")}</li>
              <li>{t("footer.branchHcm")}</li>
              <li>{t("footer.warehouse")}</li>
            </ul>
          </div>

          {/* Column 3: Services & Technical Support */}
          <div>
            <div className="font-display mb-4 text-sm font-bold tracking-widest text-foreground uppercase">
              {t("footer.servicesTitle")}
            </div>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>{t("footer.service1")}</li>
              <li>{t("footer.service2")}</li>
              <li>{t("footer.service3")}</li>
              <li>{t("footer.service4")}</li>
            </ul>
          </div>

          {/* Column 4: Projects & Contact */}
          <div>
            <div className="font-display mb-4 text-sm font-bold tracking-widest text-foreground uppercase">
              {t("footer.contactTitle")}
            </div>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {company.hotlines.project.raw ? (
                <li>
                  <a
                    href={`tel:${company.hotlines.project.raw}`}
                    className="transition-colors hover:text-primary"
                  >
                    {company.hotlines.project.display} (Dự án)
                  </a>
                </li>
              ) : null}
              {company.hotlines.technical.raw ? (
                <li>
                  <a
                    href={`tel:${company.hotlines.technical.raw}`}
                    className="transition-colors hover:text-primary"
                  >
                    {company.hotlines.technical.display} (Kỹ thuật)
                  </a>
                </li>
              ) : null}
              {company.emails.project ? (
                <li>
                  <a
                    href={`mailto:${company.emails.project}`}
                    className="transition-colors hover:text-primary"
                  >
                    {company.emails.project}
                  </a>
                </li>
              ) : null}
              <li className="pt-1 text-xs">{t("footer.workingHours")}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="flex flex-col items-center justify-between gap-2 border-t pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground md:text-sm">
            © <CopyrightYear /> {t("footer.companyName")}.{" "}
            {t("footer.allRightsReserved")}
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground md:text-sm">
            <Link
              href="/privacy"
              className="transition-colors hover:text-primary"
            >
              {t("footer.privacyPolicy")}
            </Link>
            <span>•</span>
            <Link
              href="/terms"
              className="transition-colors hover:text-primary"
            >
              {t("footer.termsOfService")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
