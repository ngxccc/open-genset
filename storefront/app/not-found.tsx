import { Terminal, Home, ArrowRight, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Link from "next/link";

const inter = Inter({
  subsets: ["vietnamese", "latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function GlobalNotFound() {
  return (
    <html
      lang="vi"
      className={`${inter.variable} h-full font-sans antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24">
          {/* Background Decoration */}
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05]">
            <Activity
              className="h-[120vw] w-[120vw] md:h-[60vw] md:w-[60vw]"
              strokeWidth={0.5}
            />
          </div>

          <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Column: System Error Notice */}
            <div className="flex flex-col items-start text-left lg:col-span-7">
              <div className="mb-6 flex items-center gap-4 text-sm tracking-[0.3em] text-primary uppercase">
                <span className="h-px w-12 bg-primary"></span>
                <span className="font-bold">Status: Terminal</span>
              </div>

              <h1 className="font-display mb-8 flex flex-col text-[12vw] leading-[0.85] font-black tracking-tighter text-foreground lg:text-[10rem]">
                <span className="opacity-20">ERROR</span>
                <span className="-mt-4 text-primary lg:-mt-10">404</span>
              </h1>

              <div className="mb-12 flex flex-col gap-2">
                <code className="flex items-center gap-3 text-lg font-bold text-destructive lg:text-xl">
                  <Terminal className="h-5 w-5" />
                  SYSTEM_ERROR: ASSET_NOT_FOUND
                </code>
                <p className="mt-4 max-w-md border-l-2 border-muted py-2 pl-6 text-lg text-muted-foreground">
                  File hệ thống hoặc đường dẫn không tồn tại. <br />
                  <span className="text-sm opacity-70">
                    The requested asset or path does not exist on this server.
                  </span>
                </p>
              </div>
            </div>

            {/* Right Column: Navigation Cards */}
            <div className="flex flex-col gap-6 lg:col-span-5">
              {/* Action Card: Home */}
              <Card
                size="dense"
                className="group border-muted/50 transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-xl"
              >
                <Link href="/" className="block cursor-pointer p-8">
                  <CardContent size="compact">
                    <div className="mb-12 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Home className="h-6 w-6" />
                      </div>
                      <span className="text-xs tracking-widest text-muted-foreground uppercase">
                        Khởi động lại / Restart
                      </span>
                    </div>
                    <h3 className="font-display mb-2 text-2xl font-bold text-foreground transition-colors group-hover:text-primary">
                      Về Trang Chủ / Go Home
                    </h3>
                    <div className="mt-6 flex items-center gap-2 text-sm font-bold tracking-wider text-primary uppercase transition-all group-hover:gap-4">
                      Khôi phục / Let&apos;s Go{" "}
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
