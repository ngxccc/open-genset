"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { LogOut, Settings, Search, ChevronsUpDown } from "lucide-react";
import { Link, usePathname, useRouter } from "@opengenset/shared/routing";
import { useAdminNavGroups } from "../hooks/use-admin-nav";
import { toast } from "@/components/ui/sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { adminLogoutAction } from "@/features/auth/actions/admin-logout.action";
import type { AdminUser } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { COMPANY_CONFIG } from "@/constants/company.constant";
const AdminCommandDialog = dynamic(
  () => import("./admin-command-dialog").then((mod) => mod.AdminCommandDialog),
  { ssr: false },
);

const AdminSettingsDialog = dynamic(
  () =>
    import("./admin-settings-dialog").then((mod) => mod.AdminSettingsDialog),
  { ssr: false },
);
interface AdminSidebarProps {
  user: AdminUser;
}
export const AdminSidebar = ({ user }: AdminSidebarProps) => {
  const t = useTranslations("adminDashboard");
  const router = useRouter();
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const navGroups = useAdminNavGroups();
  const [commandOpen, setCommandOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await adminLogoutAction();
      toast.success(t("logoutSuccess"));
      router.replace("/login");
    } catch {
      toast.error(t("logoutError"));
    }
  };

  return (
    <>
      <Sidebar collapsible="icon">
        {/* Header: Brand Logo Only */}
        <SidebarHeader className="h-12 justify-center border-b border-sidebar-border/60 p-2 group-data-[collapsible=icon]:p-0">
          <div className="flex h-8 items-center gap-2.5 overflow-hidden px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0">
            <div className="relative flex size-8 shrink-0 items-center justify-center">
              <Image
                src="/brand/logo-icon.svg"
                alt={COMPANY_CONFIG.BRAND_NAME}
                width={26}
                height={26}
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src="/brand/logo-icon-dark.svg"
                alt={COMPANY_CONFIG.BRAND_NAME}
                width={26}
                height={26}
                className="hidden object-contain dark:block"
                priority
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden text-left">
                <span className="truncate text-sm font-bold tracking-tight text-foreground">
                  {t("title").toUpperCase()}
                </span>
                <span className="truncate text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                  {t("subtitle")}
                </span>
              </div>
            )}
          </div>
        </SidebarHeader>
        {/* Content: 3 Grouped Navigation Sections */}
        <SidebarContent className="px-2 py-2">
          {/* Search Morphing Action Button */}
          <div className="px-1 pb-1">
            {isCollapsed ? (
              <SidebarMenuButton
                tooltip={t("quickSearch")}
                onClick={() => setCommandOpen(true)}
                className="mx-auto text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              >
                <Search className="size-4 shrink-0" />
                <span className="sr-only">{t("quickSearch")}</span>
              </SidebarMenuButton>
            ) : (
              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className="flex h-8 w-full cursor-pointer items-center justify-between rounded-md border border-sidebar-border bg-sidebar-accent/50 px-2.5 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Search className="size-3.5 shrink-0" />
                  <span className="truncate">{t("quickSearch")}</span>
                </div>
                <kbd className="pointer-events-none inline-flex h-4.5 shrink-0 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 select-none">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
            )}
          </div>
          {navGroups.map((group) => (
            <SidebarGroup key={group.id} className="py-1">
              <SidebarGroupLabel className="px-2 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                {group.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                          className={
                            isActive
                              ? "border-primary bg-sidebar-accent font-semibold text-sidebar-primary shadow-xs"
                              : "font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                          }
                        >
                          <Link
                            href={item.href}
                            onClick={() => {
                              if (isMobile) setOpenMobile(false);
                            }}
                          >
                            <item.icon className="size-4 shrink-0" />
                            {!isCollapsed && <span>{item.label}</span>}
                          </Link>
                        </SidebarMenuButton>
                        {item.badge !== undefined && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        {/* Footer: User Profile Dock & Popover Menu */}
        <SidebarFooter className="border-t border-sidebar-border/60 p-2 group-data-[collapsible=icon]:p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    tooltip={user.fullName}
                    className="group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:p-0! data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary uppercase">
                      {user.fullName.charAt(0)}
                    </div>
                    {!isCollapsed && (
                      <>
                        <div className="grid flex-1 text-left text-xs leading-tight">
                          <span className="truncate font-semibold text-foreground">
                            {user.fullName}
                          </span>
                          <span className="truncate text-[11px] text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                        <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                      </>
                    )}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="p-2 font-normal">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs leading-none font-semibold">
                          {user.fullName}
                        </p>
                        <Badge
                          variant="outline"
                          className="px-1 py-0 text-[10px]"
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setSettingsOpen(true)}
                    className="flex cursor-pointer items-center"
                  >
                    <Settings className="mr-2 size-4" />
                    <span>{t("userMenu.settings")}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="mr-2 size-4" />
                    <span>{t("userMenu.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        {/* Rail for desktop mouse resize / hover toggle */}
        <SidebarRail />
      </Sidebar>

      {/* Interactive Command Palette Modal (Mounted only on-demand) */}
      {commandOpen ? (
        <AdminCommandDialog open={commandOpen} onOpenChange={setCommandOpen} />
      ) : null}

      {/* Centralized Settings Popup Dialog (Mounted only on-demand) */}
      {settingsOpen ? (
        <AdminSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          user={user}
        />
      ) : null}
    </>
  );
};
