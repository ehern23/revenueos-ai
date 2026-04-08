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
  Command,
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
    <div className="min-h-screen bg-[#0A0E17] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* Sidebar */}
        <aside className="noise-overlay hidden w-72 shrink-0 flex-col border-r border-white/[0.06] bg-[#0D1117] xl:flex">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-5 py-6">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500 text-[#0A0E17] shadow-lg shadow-amber-500/20">
              <Bot className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Workspace
              </p>
              <h1 className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-100">
                RevenueOS
                <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0A0E17]">
                  AI
                </span>
              </h1>
            </div>
          </div>

          {/* Command-K Search Hint */}
          <div className="mx-4 mb-4">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm text-slate-400 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]"
            >
              <Search className="size-4" />
              <span className="flex-1 text-left">Search...</span>
              <kbd className="flex items-center gap-0.5 rounded border border-white/[0.1] bg-white/[0.05] px-1.5 py-0.5 font-mono text-xs text-slate-500">
                <Command className="size-3" />K
              </kbd>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2">
            {appNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = iconMap[item.href];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                    isActive
                      ? "bg-white/[0.04] text-slate-100"
                      : "text-slate-400 hover:bg-white/[0.02] hover:text-slate-200"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-amber-500" />
                  )}
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      isActive ? "text-amber-500" : "text-slate-500 group-hover:text-slate-400"
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-white/[0.06] p-4">
            <div className="flex items-center gap-3">
              <div className="relative flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 text-sm font-medium text-amber-500">
                ER
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#0D1117] bg-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-slate-200">
                  Erik R.
                </p>
                <p className="truncate text-xs text-slate-500">
                  SDR — Commercial
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0A0E17]/95 backdrop-blur-xl">
            <div className="flex flex-col gap-4 px-4 py-4 md:px-6 xl:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="border-white/[0.06] bg-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 xl:hidden"
                  >
                    <PanelLeftClose />
                  </Button>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                      Main Panel
                    </p>
                    <h2 className="mt-0.5 text-lg font-semibold text-slate-100">
                      {activePage?.label ?? "RevenueOS AI"}
                    </h2>
                  </div>
                </div>

                {/* Desktop Search */}
                <div className="hidden items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-slate-400 lg:flex">
                  <Search className="size-4" />
                  <span>Search pages, accounts, or workflows</span>
                  <kbd className="ml-2 rounded border border-white/[0.1] bg-white/[0.05] px-1.5 py-0.5 font-mono text-xs text-slate-500">
                    /
                  </kbd>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="border-white/[0.06] bg-transparent text-slate-300 hover:bg-white/[0.04] hover:text-slate-100"
                  >
                    Invite team
                  </Button>
                  <Button className="bg-amber-500 text-[#0A0E17] shadow-lg shadow-amber-500/20 hover:bg-amber-400">
                    <CircleUserRound />
                    Workspace settings
                  </Button>
                </div>
              </div>

              {/* Page Description */}
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-slate-400">
                {activePage?.description}
              </div>

              {/* Mobile Navigation */}
              <nav className="flex gap-2 overflow-x-auto pb-1 xl:hidden">
                {appNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-lg border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150",
                        isActive
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                          : "border-white/[0.06] bg-transparent text-slate-400 hover:border-white/[0.1] hover:text-slate-200"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 px-4 py-8 md:px-6 xl:px-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
