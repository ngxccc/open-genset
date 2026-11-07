import { Link } from "@opengenset/shared/routing";
import { useTranslations } from "next-intl";
import { Terminal, Home, Headset } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  const t = useTranslations("notFound");

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center space-y-6">
        {/* Terminal Icon Badge */}
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
          <Terminal className="size-10 text-primary" />
        </div>

        {/* 404 Heading & Status */}
        <div className="flex flex-col items-center justify-center gap-1.5">
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
            404
          </h1>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {t("status")}
          </p>
        </div>

        {/* Error Code Tag */}
        <div className="inline-flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
          <Terminal className="size-3.5" />
          <span>{t("errorCode")}</span>
        </div>

        {/* Descriptive Message */}
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t("errorMessage")}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <Button
            asChild
            size="default"
            className="w-full gap-2 shadow-xs sm:w-auto"
          >
            <Link href="/">
              <Home className="size-4" />
              <span>{t("actions.home.title")}</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="default"
            className="w-full gap-2 shadow-xs sm:w-auto"
          >
            <Link href="/contact">
              <Headset className="size-4" />
              <span>{t("actions.support.title")}</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
