"use client";

import { useState } from "react";
import { ChevronDown, LoaderCircle, Target } from "lucide-react";

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
    <div className="space-y-6">
      <PageHeader
        eyebrow="SDR Workflow"
        title="Prospecting Copilot"
        description="Turn a narrow ICP and product narrative into a strategic target list using the existing mock account, signal, and trend data."
        actions={
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleGeneratePipeline}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Target />
            )}
            Generate Pipeline
          </Button>
        }
      />

      {generationError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {generationError}
        </div>
      ) : null}

      <Card className="border-slate-200 bg-slate-50 shadow-sm">
        <CardHeader>
          <CardTitle>Pipeline inputs</CardTitle>
          <CardDescription>
            Keep the filters simple for now. The scoring logic is deterministic
            and uses only the local mock data layer.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Industry</span>
            <select
              value={inputs.industry}
              onChange={(event) => updateInput("industry", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            >
              {industryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Persona</span>
            <select
              value={inputs.persona}
              onChange={(event) => updateInput("persona", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            >
              {personaOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Region</span>
            <select
              value={inputs.region}
              onChange={(event) => updateInput("region", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            >
              {regionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Company size
            </span>
            <select
              value={inputs.companySize}
              onChange={(event) => updateInput("companySize", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            >
              {companySizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-medium text-slate-700">
              Product description
            </span>
            <textarea
              value={inputs.productDescription}
              onChange={(event) =>
                updateInput("productDescription", event.target.value)
              }
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {results.map((result, index) => (
          <Card key={result.account.id} className="border-slate-200 bg-slate-50 shadow-sm">
            <CardHeader className="gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-50">
                      Priority #{index + 1}
                    </Badge>
                    <Badge variant="outline" className="border-slate-300 bg-white text-slate-700">
                      Score {result.score}
                    </Badge>
                    <Badge variant="outline" className="border-slate-300 bg-white text-slate-700">
                      {result.account.region}
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-950">
                      {result.account.name}
                    </CardTitle>
                    <CardDescription className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
                      {result.account.industry} · {result.account.employeeRange} employees · Persona to target:{" "}
                      <span className="font-medium text-slate-900">
                        {result.persona}
                      </span>
                    </CardDescription>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    Best signal
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {result.signal.title}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {result.opportunityContext.scoreSummary}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-500">Account hypothesis</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {result.hypothesis}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-500">
                      Outreach drafts
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-slate-300 bg-white text-slate-700"
                      >
                        {result.outreach.source === "openai"
                          ? "AI-tailored"
                          : "Deterministic fallback"}
                      </Badge>
                      {isGenerating ? (
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                          <LoaderCircle className="mr-1 size-3 animate-spin" />
                          Generating
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
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
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition ${
                            getSelectedChannel(result.account.id) === channel
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          {channel === "call" ? "Call opener" : channel}
                        </button>
                      ),
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {result.outreach[getSelectedChannel(result.account.id)]}
                  </p>
                  {result.outreach.error ? (
                    <p className="mt-3 text-xs text-amber-700">
                      {result.outreach.error}
                    </p>
                  ) : null}
                </div>
              </div>

              <details className="group rounded-2xl border border-slate-200 bg-white p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-slate-900">
                  Why this account?
                  <ChevronDown className="size-4 text-slate-400 transition group-open:rotate-180" />
                </summary>
                <div className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                  {result.whyThisAccount.map((reason) => (
                    <p key={reason}>{reason}</p>
                  ))}
                  <p>
                    Signal summary: {result.signal.summary}
                  </p>
                </div>
              </details>

              <details className="group rounded-2xl border border-slate-200 bg-white p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-slate-900">
                  Company Research
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-slate-300 bg-white text-slate-700"
                    >
                      {result.research.source === "openai"
                        ? "AI researched"
                        : "Mock research"}
                    </Badge>
                    <ChevronDown className="size-4 text-slate-400 transition group-open:rotate-180" />
                  </div>
                </summary>
                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">
                      Company overview
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {result.research.companyOverview}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">
                      Product focus
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {result.research.productFocus}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">
                      Strategic direction
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {result.research.strategicDirection}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">
                      Market position
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {result.research.marketPosition}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">
                      Likely priorities
                    </p>
                    <div className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                      {result.research.likelyPriorities.map((priority) => (
                        <p key={priority}>{priority}</p>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">
                      Possible pain points
                    </p>
                    <div className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                      {result.research.possiblePainPoints.map((painPoint) => (
                        <p key={painPoint}>{painPoint}</p>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 xl:col-span-2">
                    <p className="text-sm font-medium text-slate-500">
                      Recommended GTM angle
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {result.research.recommendedGtmAngle}
                    </p>
                    {result.research.error ? (
                      <p className="mt-3 text-xs text-amber-700">
                        {result.research.error}
                      </p>
                    ) : null}
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
