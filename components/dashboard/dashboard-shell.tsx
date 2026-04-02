"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Bot,
  Building2,
  CalendarRange,
  CircleUserRound,
  Compass,
  LayoutDashboard,
  type LucideIcon,
  PanelLeftClose,
  Radar,
  Search,
  Map,
  MessageSquareMore,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  appNavigation,
  defaultAppHref,
  type AppNavigationItem,
} from "@/lib/app-navigation";
import { cn } from "@/lib/utils";

const iconMap: Record<AppNavigationItem["href"], LucideIcon> = {
  "/prospecting-copilot": Compass,
  "/revenue-command-center": LayoutDashboard,
  "/territory-strategist": Map,
  "/account-intelligence": Building2,
  "/weekly-pipeline-plan": CalendarRange,
  "/sales-ai-assistant": MessageSquareMore,
  "/autonomous-mode": Bot,
  "/territory-attack-simulation": Radar,
} as const;

export function DashboardShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const activePage =
    appNavigation.find((item) => item.href === pathname) ??
    appNavigation.find((item) => item.href === defaultAppHref);

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-80 shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-6 xl:flex">
          <div className="flex items-center gap-3 px-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Bot className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                Workspace
              </p>
              <h1 className="text-lg font-semibold tracking-tight">
                RevenueOS AI
              </h1>
            </div>
          </div>

          <nav className="mt-8 space-y-1.5">
            {appNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = iconMap[item.href];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border px-3 py-3 text-sm transition",
                    isActive
                      ? "border-blue-100 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <Icon className="mt-0.5 size-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium">{item.label}</p>
                    <p
                      className={cn(
                        "mt-1 text-xs leading-5",
                        isActive ? "text-blue-600" : "text-slate-500",
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl border border-blue-100 bg-blue-50 p-5 text-slate-900">
            <p className="text-xs uppercase tracking-[0.24em] text-blue-600">
              Shell Status
            </p>
            <h2 className="mt-3 text-xl font-semibold">Current focus</h2>
            <p className="mt-2 text-sm text-slate-600">
              The application shell is ready. Each navigation destination now
              opens inside the main panel and can be expanded into a full
              workflow without changing the layout.
            </p>
            <Button className="mt-5 w-full bg-blue-600 text-white hover:bg-blue-700">
              Continue building
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex flex-col gap-4 px-4 py-4 md:px-6 xl:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon-sm" className="xl:hidden">
                    <PanelLeftClose />
                  </Button>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
                      Main Panel
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-950">
                      {activePage?.label ?? "RevenueOS AI"}
                    </h2>
                  </div>
                </div>
                <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 lg:flex">
                  <Search className="size-4" />
                  Search pages, accounts, or workflows
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline">Invite team</Button>
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    <CircleUserRound />
                    Workspace settings
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {activePage?.description}
              </div>

              <nav className="flex gap-2 overflow-x-auto pb-1 xl:hidden">
                {appNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition",
                        isActive
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>

          <main className="flex-1 bg-white px-4 py-6 md:px-6 xl:px-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
