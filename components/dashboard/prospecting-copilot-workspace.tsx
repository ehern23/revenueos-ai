"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  LoaderCircle,
  Sparkles,
  Mail,
  Linkedin,
  Phone,
  Building2,
  Users,
  Globe,
} from "lucide-react";

import { personas, type Persona } from "@/data";
import { type CompanyResearch } from "@/lib/company-research";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  applyResearchToProspectingResult,
  generateProspectingPipeline,
  type OutreachBundle,
  type ProspectingInputs,
  type ProspectingResult,
} from "@/lib/prospecting";

const defaultInputs: ProspectingInputs = {
  industry: "Fintech",
  persona: "Auto-select best fit",
  region: "North America",
  companySize: "Growth",
  productDescription:
    "AI workflow software that helps SDR teams prioritize strategic accounts, turn signals into outreach, and build better pipeline plans.",
};

const industryOptions = [
  "Fintech",
  "Payments Infrastructure",
  "Data",
  "AI Infrastructure",
  "Enterprise Software",
];

const regionOptions = ["North America", "Europe", "Global"];
const companySizeOptions = ["Seed/Series A", "Growth", "Late Stage", "Enterprise"];

function getPersonaOptions(items: Persona[]) {
  return ["Auto-select best fit", ...items.map((item) => item.name)];
}

type OutreachChannel = "email" | "linkedin" | "call";

// Animated Score Ring Component
function ScoreRing({ score, maxScore = 200, delay = 0 }: { score: number; maxScore?: number; delay?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  const radius = 32;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(animatedScore / maxScore, 1);
  const strokeDashoffset = circumference * (1 - progress);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const duration = 800;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setAnimatedScore(Math.round(score * easeOut));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [score, delay]);

  return (
    <div className="relative flex shrink-0 items-center justify-center">
      <svg
        width="76"
        height="76"
        viewBox="0 0 76 76"
        className="-rotate-90"
      >
        <circle
          cx="38"
          cy="38"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="38"
          cy="38"
          r={radius}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? strokeDashoffset : circumference}
          className="transition-all duration-[800ms] ease-out"
          style={{
            filter: "drop-shadow(0 0 6px rgba(245, 158, 11, 0.4))"
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-xl font-bold tabular-nums text-slate-100">
          {animatedScore}
        </span>
      </div>
    </div>
  );
}

// Multi-select Pills Component
function MultiSelectPills({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
}) {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggleOption(option)}
            className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
              isSelected
                ? "border-amber-500/30 bg-amber-500/10 text-amber-500 shadow-sm shadow-amber-500/10"
                : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/[0.1] hover:text-slate-200"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

// Segmented Control Component
function SegmentedControl({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 lg:w-auto">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 lg:flex-none ${
            selected === option
              ? "bg-amber-500 text-[#0A0E17] shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

// Toggle Group Component
function ToggleGroup({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
            selected === option
              ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
              : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/[0.1] hover:text-slate-200"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

// Account Card Component
function AccountCard({
  result,
  index,
  isGenerating,
  selectedChannel,
  onChannelChange,
  delay,
}: {
  result: ProspectingResult;
  index: number;
  isGenerating: boolean;
  selectedChannel: OutreachChannel;
  onChannelChange: (channel: OutreachChannel) => void;
  delay: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const channelIcons = {
    email: Mail,
    linkedin: Linkedin,
    call: Phone,
  };

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <Card className="overflow-hidden border-white/[0.06] bg-[#111827] transition-all duration-200 hover:border-white/[0.1]">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            {/* Rank Badge */}
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full border-l-2 border-amber-500 bg-amber-500/10 font-mono text-sm font-bold text-amber-500">
              {index + 1}
            </div>

            {/* Company Info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg text-slate-100">
                  {result.account.name}
                </CardTitle>
              </div>
              <CardDescription className="mt-1 line-clamp-1 text-sm text-slate-400">
                {result.signal.title}
              </CardDescription>
              
              {/* Micro-badges */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-xs text-slate-400">
                  <Building2 className="size-3" />
                  {result.account.industry}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-xs text-slate-400">
                  <Users className="size-3" />
                  {result.account.employeeRange}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-xs text-slate-400">
                  <Globe className="size-3" />
                  {result.account.region}
                </span>
              </div>
            </div>

            {/* Score Ring */}
            <ScoreRing score={result.score} delay={delay + 200} />
          </div>
        </CardHeader>

        {/* Expandable Content */}
        <div
          className={`grid transition-all duration-300 ease-out ${
            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <CardContent className="space-y-5 border-t border-white/[0.06] pt-5">
              {/* Account Hypothesis */}
              <div className="border-l-2 border-amber-500/50 bg-amber-500/5 py-3 pl-4 pr-4">
                <p className="text-xs font-medium uppercase tracking-wider text-amber-500/70">
                  Account Hypothesis
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {result.hypothesis}
                </p>
              </div>

              {/* Signal Breakdown */}
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Signal Breakdown
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                    <p className="text-xs text-slate-500">Signal</p>
                    <p className="text-sm font-medium text-slate-200">{result.signal.title}</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                    <p className="text-xs text-slate-500">Persona</p>
                    <p className="text-sm font-medium text-slate-200">{result.persona}</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                    <p className="text-xs text-slate-500">Score</p>
                    <p className="font-mono text-sm font-medium text-amber-500">{result.score}</p>
                  </div>
                </div>
              </div>

              {/* Outreach Drafts - Tabbed */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Outreach Drafts
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-white/[0.1] bg-white/[0.02] text-xs text-slate-400"
                    >
                      {result.outreach.source === "openai" ? "AI-tailored" : "Template"}
                    </Badge>
                    {isGenerating && (
                      <Badge className="border border-blue-500/20 bg-blue-500/10 text-xs text-blue-400">
                        <LoaderCircle className="mr-1 size-3 animate-spin" />
                        Generating
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-1">
                  {(["email", "linkedin", "call"] as OutreachChannel[]).map((channel) => {
                    const Icon = channelIcons[channel];
                    return (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => onChannelChange(channel)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium capitalize transition-all duration-150 ${
                          selectedChannel === channel
                            ? "bg-amber-500 text-[#0A0E17]"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Icon className="size-3.5" />
                        {channel === "call" ? "Call" : channel}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 rounded-lg border border-white/[0.06] bg-[#0A0E17]/50 p-4">
                  <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-line">
                    {result.outreach[selectedChannel]}
                  </p>
                </div>
              </div>

              {/* Research Brief - 2x2 Grid */}
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Research Brief
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/[0.06] bg-[#0A0E17]/50 p-3">
                    <p className="text-xs font-medium text-slate-500">Overview</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      {result.research.companyOverview}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-[#0A0E17]/50 p-3">
                    <p className="text-xs font-medium text-slate-500">Product Focus</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      {result.research.productFocus}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-[#0A0E17]/50 p-3">
                    <p className="text-xs font-medium text-slate-500">Strategy</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      {result.research.strategicDirection}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-[#0A0E17]/50 p-3">
                    <p className="text-xs font-medium text-slate-500">Our Angle</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      {result.research.ourAngle}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-white/[0.06] py-3 text-xs text-slate-500 transition-colors hover:bg-white/[0.02] hover:text-slate-400"
        >
          {isExpanded ? "Collapse" : "Expand details"}
          <ChevronDown
            className={`size-3.5 transition-transform duration-300 ease-out ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </Card>
    </div>
  );
}

export function ProspectingCopilotWorkspace() {
  const [inputs, setInputs] = useState<ProspectingInputs>(defaultInputs);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([defaultInputs.industry]);
  const [results, setResults] = useState<ProspectingResult[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<Record<string, OutreachChannel>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const personaOptions = getPersonaOptions(personas);

  function updateInput<K extends keyof ProspectingInputs>(
    key: K,
    value: ProspectingInputs[K],
  ) {
    setInputs((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function getSelectedChannel(accountId: string) {
    return selectedChannels[accountId] ?? "email";
  }

  function applyOutreachUpdates(
    currentResults: ProspectingResult[],
    updates: Array<{ accountId: string; outreach: OutreachBundle }>,
  ) {
    return currentResults.map((result) => {
      const update = updates.find((item) => item.accountId === result.account.id);
      if (!update) return result;
      return { ...result, outreach: update.outreach };
    });
  }

  function applyResearchUpdates(
    currentResults: ProspectingResult[],
    updates: Array<{ accountId: string; research: CompanyResearch }>,
  ) {
    return currentResults.map((result) => {
      const update = updates.find((item) => item.accountId === result.account.id);
      if (!update) return result;
      return applyResearchToProspectingResult({
        result,
        research: update.research,
        inputs,
      });
    });
  }

  async function enhanceResearch(nextResults: ProspectingResult[]) {
    try {
      const response = await fetch("/api/company-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs,
          results: nextResults.map((result) => ({
            accountId: result.account.id,
            persona: result.persona,
            signalId: result.signal.id,
          })),
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        results?: Array<{ accountId: string; research: CompanyResearch }>;
      };

      if (!response.ok || !payload.results) {
        throw new Error(payload.error ?? "Failed to generate company research.");
      }

      if (payload.error) setGenerationError(payload.error);

      const updatedResults = applyResearchUpdates(nextResults, payload.results);
      setResults(updatedResults);
      return updatedResults;
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Company research failed. Using deterministic brief.",
      );
      return nextResults;
    }
  }

  async function enhanceOutreach(nextResults: ProspectingResult[]) {
    try {
      const response = await fetch("/api/prospecting-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs,
          results: nextResults.map((result) => ({
            accountId: result.account.id,
            persona: result.persona,
            signalId: result.signal.id,
            opportunityContext: result.opportunityContext,
            research: result.research,
          })),
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        results?: Array<{ accountId: string; outreach: OutreachBundle }>;
      };

      if (!response.ok || !payload.results) {
        throw new Error(payload.error ?? "Failed to generate outreach.");
      }

      if (payload.error) setGenerationError(payload.error);

      setResults((current) => applyOutreachUpdates(current, payload.results ?? []));
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Outreach generation failed. Using deterministic fallback.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleGeneratePipeline() {
    setIsGenerating(true);
    setGenerationError(null);
    setShowResults(false);

    try {
      // Update inputs with selected industries
      const updatedInputs = { ...inputs, industry: selectedIndustries[0] || "Fintech" };
      const nextResults = generateProspectingPipeline(updatedInputs);
      setResults(nextResults);
      
      // Trigger staggered reveal after a brief delay
      setTimeout(() => setShowResults(true), 500);
      
      const researchedResults = await enhanceResearch(nextResults);
      await enhanceOutreach(researchedResults);
    } finally {
      setIsGenerating(false);
    }
  }

  // Initialize with default results
  useEffect(() => {
    const initialResults = generateProspectingPipeline(defaultInputs);
    setResults(initialResults);
    setShowResults(true);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SDR Workflow"
        title="Prospecting Copilot"
        description="Configure your ICP and generate a strategic target list from signals."
      />

      {generationError && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          {generationError}
        </div>
      )}

      {/* Two Column Layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left Column - ICP Configuration (40%) */}
        <div className="lg:sticky lg:top-6 lg:w-[40%] lg:self-start">
          <Card className="border-white/[0.06] bg-[#111827]">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-slate-100">ICP Configuration</CardTitle>
              <CardDescription className="text-sm text-slate-400">
                Define your ideal customer profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Industry - Multi-select Pills */}
              <div className="space-y-2.5">
                <label className="text-sm font-medium text-slate-300">Industry</label>
                <MultiSelectPills
                  options={industryOptions}
                  selected={selectedIndustries}
                  onChange={setSelectedIndustries}
                />
              </div>

              {/* Company Size - Segmented Control */}
              <div className="space-y-2.5">
                <label className="text-sm font-medium text-slate-300">Company Size</label>
                <SegmentedControl
                  options={companySizeOptions}
                  selected={inputs.companySize}
                  onChange={(value) => updateInput("companySize", value)}
                />
              </div>

              {/* Region - Toggle Group */}
              <div className="space-y-2.5">
                <label className="text-sm font-medium text-slate-300">Region</label>
                <ToggleGroup
                  options={regionOptions}
                  selected={inputs.region}
                  onChange={(value) => updateInput("region", value)}
                />
              </div>

              {/* Persona - Styled Dropdown */}
              <div className="space-y-2.5">
                <label className="text-sm font-medium text-slate-300">Persona</label>
                <div className="relative">
                  <select
                    value={inputs.persona}
                    onChange={(event) => updateInput("persona", event.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 pr-10 text-sm text-slate-100 outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                  >
                    {personaOptions.map((option) => (
                      <option key={option} value={option} className="bg-[#111827] text-slate-100">
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              {/* Product Description */}
              <div className="space-y-2.5">
                <label className="text-sm font-medium text-slate-300">Product Description</label>
                <textarea
                  value={inputs.productDescription}
                  onChange={(event) => updateInput("productDescription", event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-slate-100 outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Generate Pipeline Button */}
              <Button
                className="w-full bg-amber-500 py-6 text-[#0A0E17] shadow-lg shadow-amber-500/25 transition-all duration-200 hover:bg-amber-400 hover:[box-shadow:0_0_20px_rgba(245,158,11,0.3),0_10px_15px_-3px_rgba(245,158,11,0.4)]"
                onClick={handleGeneratePipeline}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Analyzing signals...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Generate Pipeline
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Account Results (60%) */}
        <div className="space-y-6 lg:w-[60%]">
          {results.length === 0 && !isGenerating ? (
            <Card className="border-white/[0.06] bg-[#111827]">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-amber-500/10 p-4">
                  <Sparkles className="size-8 text-amber-500" />
                </div>
                <p className="text-lg font-medium text-slate-200">No accounts generated yet</p>
                <p className="mt-2 text-sm text-slate-400">
                  Configure your ICP and click Generate Pipeline
                </p>
              </CardContent>
            </Card>
          ) : (
            results.map((result, index) => (
              <AccountCard
                key={result.account.id}
                result={result}
                index={index}
                isGenerating={isGenerating}
                selectedChannel={getSelectedChannel(result.account.id)}
                onChannelChange={(channel) =>
                  setSelectedChannels((current) => ({
                    ...current,
                    [result.account.id]: channel,
                  }))
                }
                delay={showResults ? index * 100 : 0}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
