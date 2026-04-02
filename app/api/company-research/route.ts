import { NextResponse } from "next/server";

import { accounts, signals } from "@/data";
import {
  buildFallbackCompanyResearch,
  type CompanyResearch,
  type ResearchContextInputs,
} from "@/lib/company-research";

type RequestResult = {
  accountId: string;
  persona: string;
  signalId: string;
};

type RouteResearchResult = {
  accountId: string;
  research: CompanyResearch;
};

function extractOutputText(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "output_text" in payload &&
    typeof payload.output_text === "string"
  ) {
    return payload.output_text;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "output" in payload &&
    Array.isArray(payload.output)
  ) {
    const output = payload.output as Array<{
      content?: Array<{ text?: string }>;
    }>;

    return output
      .flatMap((item) => item.content ?? [])
      .map((item) => item.text ?? "")
      .join("");
  }

  return "";
}

function parseJsonResponse(text: string) {
  const trimmed = text.trim();
  const withoutFences = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");

  return JSON.parse(withoutFences) as {
    results: Array<{
      accountId: string;
      companyOverview: string;
      productFocus: string;
      strategicDirection: string;
      marketPosition: string;
      likelyPriorities: string[];
      possiblePainPoints: string[];
      recommendedGtmAngle: string;
    }>;
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    inputs?: ResearchContextInputs;
    results?: RequestResult[];
  };

  const inputs = body.inputs;
  const requestedResults = body.results ?? [];

  if (!inputs || requestedResults.length === 0) {
    return NextResponse.json(
      { error: "Missing research inputs or account results." },
      { status: 400 },
    );
  }

  const deterministicResults = requestedResults
    .map((item) => {
      const account = accounts.find((entry) => entry.id === item.accountId);
      const signal = signals.find((entry) => entry.id === item.signalId);

      if (!account || !signal) {
        return null;
      }

      return {
        accountId: item.accountId,
        research: buildFallbackCompanyResearch({
          account,
          signal,
          persona: item.persona,
          inputs,
        }),
      };
    })
    .filter((item): item is RouteResearchResult => item !== null);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      source: "deterministic",
      results: deterministicResults,
    });
  }

  try {
    const enrichedContext = requestedResults.map((item) => {
      const account = accounts.find((entry) => entry.id === item.accountId);
      const signal = signals.find((entry) => entry.id === item.signalId);

      return {
        accountId: item.accountId,
        companyName: account?.name,
        industry: account?.industry,
        region: account?.region,
        companySize: account?.employeeRange,
        targetPersona: item.persona,
        accountHypothesis: account?.hypothesis,
        bestSignal: signal?.title,
        signalSummary: signal?.summary,
        productDescription: inputs.productDescription,
      };
    });

    const prompt = `
You are producing a concise but insightful account-planning research brief for a top SDR or AE.

Return valid JSON only with this shape:
{
  "results": [
    {
      "accountId": "string",
      "companyOverview": "string",
      "productFocus": "string",
      "strategicDirection": "string",
      "marketPosition": "string",
      "likelyPriorities": ["string"],
      "possiblePainPoints": ["string"],
      "recommendedGtmAngle": "string"
    }
  ]
}

Rules:
- Write like a sharp account strategist, not a generic summary bot.
- Make the research materially different across companies.
- Focus on deep company understanding before shallow sales language.
- Be concise, credible, and specific.
- Keep arrays to 3 items each.
- Use the signal and company context, but do not make the brief only about the signal.

Context:
${JSON.stringify(enrichedContext, null, 2)}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5",
        instructions:
          "Return concise structured company research for account planning. Output JSON only.",
        input: prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as unknown;
    const parsed = parseJsonResponse(extractOutputText(payload));

    const results = requestedResults.map((item) => {
      const generated = parsed.results.find(
        (entry) => entry.accountId === item.accountId,
      );
      const fallback = deterministicResults.find(
        (entry) => entry.accountId === item.accountId,
      );

      if (!generated || !fallback) {
        return fallback;
      }

      return {
        accountId: item.accountId,
        research: {
          ...generated,
          source: "openai" as const,
        },
      };
    });

    return NextResponse.json({
      source: "openai",
      results,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Company research generation failed. Using deterministic fallback.";

    return NextResponse.json({
      source: "deterministic",
      error: message,
      results: deterministicResults.map((item) => ({
        ...item,
        research: {
          ...item.research,
          error: message,
        },
      })),
    });
  }
}
