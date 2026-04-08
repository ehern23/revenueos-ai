"use client";

import { useState, useEffect } from "react";
import { ChevronDown, LoaderCircle, Target, Sparkles } from "lucide-react";

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
const companySizeOptions = ["Mid-market", "Growth", "Enterprise"];

function getPersonaOptions(items: Persona[]) {
  return ["Auto-select best fit", ...items.map((item) => item.name)];
}

type OutreachChannel = "email" | "linkedin" | "call";

// Animated Score Ring Component
function ScoreRing({ score, maxScore = 200 }: { score: number; maxScore?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  const radius = 36;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(animatedScore / maxScore, 1);
  const strokeDashoffset = circumference * (1 - progress);
  
  useEffect(() => {
    setMounted(true);
    const duration = 1000;
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
  }, [score]);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="88"
        height="88"
        viewBox="0 0 88 88"
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? strokeDashoffset : circumference}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: "drop-shadow(0 0 6px rgba(245, 158, 11, 0.4))"
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-2xl font-bold tabular-nums text-slate-100">
          {animatedScore}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
          Score
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
              ? "border-amber-500/30 bg-amber-500/10 text-amber-500 shadow-sm shadow-amber-500/10"
              : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/[0.1] hover:text-slate-200"
          }`}
        >
          {option}
        </button>
      ))}
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
    <div className="inline-flex rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-150 ${
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

export function ProspectingCopilotWorkspace() {
  const [inputs, setInputs] = useState<ProspectingInputs>(defaultInputs);
  const [results, setResults] = useState(() =>
    generateProspectingPipeline(defaultInputs),
  );
  const [selectedChannels, setSelectedChannels] = useState<
    Record<string, OutreachChannel>
  >({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

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

      if (!update) {
        return result;
      }

      return {
        ...result,
        outreach: update.outreach,
      };
    });
  }

  function applyResearchUpdates(
    currentResults: ProspectingResult[],
    updates: Array<{ accountId: string; research: CompanyResearch }>,
  ) {
    return currentResults.map((result) => {
      const update = updates.find((item) => item.accountId === result.account.id);

      if (!update) {
        return result;
      }

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
        headers: {
          "Content-Type": "application/json",
        },
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

      if (payload.error) {
        setGenerationError(payload.error);
      }

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
        headers: {
          "Content-Type": "application/json",
        },
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

      if (payload.error) {
        setGenerationError(payload.error);
      }

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

    try {
      const nextResults = generateProspectingPipeline(inputs);
      setResults(nextResults);
      const researchedResults = await enhanceResearch(nextResults);
      await enhanceOutreach(researchedResults);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="SDR Workflow"
        title="Prospecting Copilot"
        description="Turn a narrow ICP and product narrative into a strategic target list using the existing mock account, signal, and trend data."
        actions={
          <Button
            className="bg-amber-500 px-6 py-3 text-[#0A0E17] shadow-lg shadow-amber-500/25 transition-all duration-200 hover:bg-amber-400 hover:shadow-amber-500/40 hover:shadow-xl"
            onClick={handleGeneratePipeline}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Generate Pipeline
          </Button>
        }
      />

      {generationError ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-400">
          {generationError}
        </div>
      ) : null}

      <Card className="border-white/[0.06] bg-[#111827]">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg text-slate-100">Pipeline inputs</CardTitle>
          <CardDescription className="text-slate-400">
            Keep the filters simple for now. The scoring logic is deterministic
            and uses only the local mock data layer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Industry - Multi-select Pills */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Industry</label>
            <MultiSelectPills
              options={industryOptions}
              selected={inputs.industry}
              onChange={(value) => updateInput("industry", value)}
            />
          </div>

          {/* Company Size - Segmented Control */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Company size</label>
            <SegmentedControl
              options={companySizeOptions}
              selected={inputs.companySize}
              onChange={(value) => updateInput("companySize", value)}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Persona - Styled Select */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">Persona</label>
              <div className="relative">
                <select
                  value={inputs.persona}
                  onChange={(event) => updateInput("persona", event.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 pr-10 text-sm text-slate-100 outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                >
                  {personaOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#111827] text-slate-100">
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            {/* Region - Styled Select */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">Region</label>
              <div className="relative">
                <select
                  value={inputs.region}
                  onChange={(event) => updateInput("region", event.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 pr-10 text-sm text-slate-100 outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                >
                  {regionOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#111827] text-slate-100">
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">
              Product description
            </label>
            <textarea
              value={inputs.productDescription}
              onChange={(event) =>
                updateInput("productDescription", event.target.value)
              }
              rows={4}
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-sm leading-relaxed text-slate-100 outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {results.map((result, index) => (
          <Card key={result.account.id} className="card-hover border-white/[0.06] bg-[#111827]">
            <CardHeader className="gap-6 pb-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-6">
                  {/* Score Ring */}
                  <ScoreRing score={result.score} />
                  
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/10">
                        Priority #{index + 1}
                      </Badge>
                      <Badge variant="outline" className="border-white/[0.1] bg-white/[0.02] text-slate-300">
                        {result.account.region}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-slate-100">
                        {result.account.name}
                      </CardTitle>
                      <CardDescription className="mt-2 max-w-3xl text-base leading-relaxed text-slate-400">
                        {result.account.industry} · {result.account.employeeRange} employees · Persona:{" "}
                        <span className="font-medium text-slate-200">
                          {result.persona}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-right lg:min-w-[240px]">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                    Best signal
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-200">
                    {result.signal.title}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {result.opportunityContext.scoreSummary}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-5 xl:grid-cols-2">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <p className="text-sm font-medium text-slate-500">Account hypothesis</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {result.hypothesis}
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-500">
                      Outreach drafts
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-white/[0.1] bg-white/[0.02] text-slate-300"
                      >
                        {result.outreach.source === "openai"
                          ? "AI-tailored"
                          : "Deterministic fallback"}
                      </Badge>
                      {isGenerating ? (
                        <Badge className="border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/10">
                          <LoaderCircle className="mr-1 size-3 animate-spin" />
                          Generating
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(["email", "linkedin", "call"] as OutreachChannel[]).map(
                      (channel) => (
                        <button
                          key={channel}
                          type="button"
                          onClick={() =>
                            setSelectedChannels((current) => ({
                              ...current,
                              [result.account.id]: channel,
                            }))
                          }
                          className={`rounded-lg border px-4 py-2 text-xs font-medium capitalize transition-all duration-150 ${
                            getSelectedChannel(result.account.id) === channel
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                              : "border-white/[0.06] bg-transparent text-slate-400 hover:border-white/[0.1] hover:text-slate-200"
                          }`}
                        >
                          {channel === "call" ? "Call opener" : channel}
                        </button>
                      ),
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-300">
                    {result.outreach[getSelectedChannel(result.account.id)]}
                  </p>
                  {result.outreach.error ? (
                    <p className="mt-3 text-xs text-amber-400">
                      {result.outreach.error}
                    </p>
                  ) : null}
                </div>
              </div>

              <details className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-slate-200">
                  Why this account?
                  <ChevronDown className="size-4 text-slate-500 transition group-open:rotate-180" />
                </summary>
                <div className="mt-4 space-y-2 text-sm leading-relaxed text-slate-400">
                  {result.whyThisAccount.map((reason) => (
                    <p key={reason}>{reason}</p>
                  ))}
                  <p>
                    Signal summary: {result.signal.summary}
                  </p>
                </div>
              </details>

              <details className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-slate-200">
                  Company Research
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-white/[0.1] bg-white/[0.02] text-slate-300"
                    >
                      {result.research.source === "openai"
                        ? "AI researched"
                        : "Mock research"}
                    </Badge>
                    <ChevronDown className="size-4 text-slate-500 transition group-open:rotate-180" />
                  </div>
                </summary>
                <div className="mt-5 grid gap-4 xl:grid-cols-2">
                  <div className="rounded-xl border border-white/[0.06] bg-[#0A0E17]/50 p-5">
                    <p className="text-sm font-medium text-slate-500">
                      Company overview
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      {result.research.companyOverview}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-[#0A0E17]/50 p-5">
                    <p className="text-sm font-medium text-slate-500">
                      Product focus
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      {result.research.productFocus}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-[#0A0E17]/50 p-5">
                    <p className="text-sm font-medium text-slate-500">
                      Strategic direction
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      {result.research.strategicDirection}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-[#0A0E17]/50 p-5">
                    <p className="text-sm font-medium text-slate-500">
                      Market position
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      {result.research.marketPosition}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-[#0A0E17]/50 p-5">
                    <p className="text-sm font-medium text-slate-500">
                      Key challenges
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      {result.research.keyChallenges}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-[#0A0E17]/50 p-5">
                    <p className="text-sm font-medium text-slate-500">
                      Our angle
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      {result.research.ourAngle}
                    </p>
                  </div>
                </div>
              </details>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
