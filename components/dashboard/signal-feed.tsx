"use client";

import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SignalType = "Hiring" | "Funding" | "Product Launch" | "Leadership" | "Partnership";

interface Signal {
  id: string;
  company: string;
  headline: string;
  type: SignalType;
  timestamp: string;
}

const signals: Signal[] = [
  {
    id: "1",
    company: "OpenAI",
    headline: "Posted 23 enterprise sales roles in the last 30 days",
    type: "Hiring",
    timestamp: "2h ago",
  },
  {
    id: "2",
    company: "Stripe",
    headline: "Launched AI-powered revenue optimization suite",
    type: "Product Launch",
    timestamp: "4h ago",
  },
  {
    id: "3",
    company: "Datadog",
    headline: "Acquiring AI observability startup for $180M",
    type: "Partnership",
    timestamp: "5h ago",
  },
  {
    id: "4",
    company: "Snowflake",
    headline: "Raised $500M secondary at $38B valuation",
    type: "Funding",
    timestamp: "8h ago",
  },
  {
    id: "5",
    company: "Palantir",
    headline: "New CRO hired from Salesforce enterprise division",
    type: "Leadership",
    timestamp: "12h ago",
  },
  {
    id: "6",
    company: "HashiCorp",
    headline: "Announced strategic partnership with AWS",
    type: "Partnership",
    timestamp: "14h ago",
  },
  {
    id: "7",
    company: "Supabase",
    headline: "Series C extension of $80M led by Felicis",
    type: "Funding",
    timestamp: "1d ago",
  },
  {
    id: "8",
    company: "Figma",
    headline: "Launched AI design assistant for enterprise teams",
    type: "Product Launch",
    timestamp: "1d ago",
  },
  {
    id: "9",
    company: "Vercel",
    headline: "AI Gateway crosses 10M API calls per day",
    type: "Product Launch",
    timestamp: "1d ago",
  },
  {
    id: "10",
    company: "Anthropic",
    headline: "Hiring 15 enterprise account executives",
    type: "Hiring",
    timestamp: "2d ago",
  },
  {
    id: "11",
    company: "Cursor",
    headline: "New VP of Sales from GitHub enterprise team",
    type: "Leadership",
    timestamp: "2d ago",
  },
  {
    id: "12",
    company: "Scale AI",
    headline: "Expanded federal contracts by $200M",
    type: "Partnership",
    timestamp: "3d ago",
  },
];

const signalTypeColors: Record<SignalType, { bg: string; text: string; border: string }> = {
  Hiring: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  Funding: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  "Product Launch": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  Leadership: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  Partnership: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
};

const companyColors: Record<string, string> = {
  OpenAI: "bg-emerald-600",
  Stripe: "bg-purple-600",
  Datadog: "bg-violet-600",
  Snowflake: "bg-cyan-600",
  Palantir: "bg-slate-600",
  HashiCorp: "bg-slate-700",
  Supabase: "bg-emerald-500",
  Figma: "bg-orange-500",
  Vercel: "bg-slate-800",
  Anthropic: "bg-amber-600",
  Cursor: "bg-blue-600",
  "Scale AI": "bg-rose-600",
};

const filterOptions: Array<SignalType | "All"> = ["All", "Hiring", "Funding", "Product Launch", "Leadership"];

export function SignalFeed() {
  const [activeFilter, setActiveFilter] = useState<SignalType | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSignals = signals.filter((signal) => {
    const matchesFilter = activeFilter === "All" || signal.type === activeFilter;
    const matchesSearch =
      searchQuery === "" ||
      signal.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signal.headline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150",
                activeFilter === filter
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  : "text-slate-400 border border-white/[0.06] hover:border-white/[0.1] hover:text-slate-200"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search signals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] py-2 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 transition-colors focus:border-white/[0.1] focus:outline-none focus:ring-0 sm:w-64"
          />
        </div>
      </div>

      {/* Signal Feed */}
      <div className="space-y-3">
        {filteredSignals.map((signal, index) => {
          const colors = signalTypeColors[signal.type];
          const companyColor = companyColors[signal.company] || "bg-slate-600";

          return (
            <div
              key={signal.id}
              className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#111827] p-4 transition-all duration-200 hover:border-white/[0.1] hover:bg-[#151d2e]"
              style={{
                animation: `slideInLeft 400ms ease-out ${index * 50}ms both`,
              }}
            >
              {/* Company Logo Placeholder */}
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                  companyColor
                )}
              >
                {signal.company.charAt(0)}
              </div>

              {/* Signal Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">{signal.company}</span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium border",
                      colors.bg,
                      colors.text,
                      colors.border
                    )}
                  >
                    {signal.type}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-medium text-slate-100">{signal.headline}</p>
              </div>

              {/* Timestamp and Action */}
              <div className="flex shrink-0 items-center gap-4">
                <span className="text-xs text-slate-500">{signal.timestamp}</span>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-amber-500 group-hover:text-slate-400"
                >
                  Add to pipeline
                  <ArrowRight className="size-3" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredSignals.length === 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-[#111827] p-12 text-center">
            <p className="text-sm text-slate-500">No signals match your filters</p>
          </div>
        )}
      </div>

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
