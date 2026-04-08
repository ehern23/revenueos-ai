import { NextResponse } from "next/server";

import { accounts, signals } from "@/data";
import { buildFallbackCompanyResearch, type CompanyResearch } from "@/lib/company-research";
import {
  buildFallbackOutreachForResult,
  type OpportunityContext,
  type ProspectingInputs,
} from "@/lib/prospecting";

type RequestResult = {
  accountId: string;
  persona: string;
  signalId: string;
  opportunityContext: OpportunityContext;
  research?: CompanyResearch;
};

type RouteOutreachResult = {
  accountId: string;
  outreach: ReturnType<typeof buildFallbackOutreachForResult>;
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
      email: string;
      linkedin: string;
      call: string;
    }>;
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    inputs?: ProspectingInputs;
    results?: RequestResult[];
  };

  const inputs = body.inputs;
  const requestedResults = body.results ?? [];

  if (!inputs || requestedResults.length === 0) {
    return NextResponse.json(
      { error: "Missing prospecting inputs or results." },
      { status: 400 },
    );
  }

  const deterministicResults = requestedResults.map((item) => {
    const account = accounts.find((entry) => entry.id === item.accountId);
    const signal = signals.find((entry) => entry.id === item.signalId);

    if (!account || !signal) {
      return null;
    }

    return {
      accountId: item.accountId,
      outreach: buildFallbackOutreachForResult({
        result: {
          account,
          persona: item.persona,
          signal,
          opportunityContext: item.opportunityContext,
          research:
            item.research ??
            buildFallbackCompanyResearch({
              account,
              signal,
              persona: item.persona,
              inputs,
            }),
        },
        productDescription: inputs.productDescription,
      }),
    };
  }).filter((item): item is RouteOutreachResult => item !== null);

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
        bestSignal: signal?.title,
        signalSummary: signal?.summary,
        accountHypothesis: account?.hypothesis,
        research: item.research,
        productDescription: inputs.productDescription,
        opportunityContext: item.opportunityContext,
      };
    });

    const systemPrompt = `
You write outbound messages like a top-performing SDR who spent 20 minutes researching each company.

EMAIL RULES (under 90 words):
- Subject line: max 6 words, no clickbait
- Open with a specific observation (product launch, hiring signal, strategic move)
- Connect to a relevant pain point in 1 sentence
- Propose a specific conversation topic, not vague "let's chat"
- FORBIDDEN: "I hope this finds you well", "I'd love to connect", "Are you the right person?"
- Format: Subject line on first line, then blank line, then body with short paragraphs

LINKEDIN RULES (under 50 words):
- Even more direct than email
- Lead with the signal
- Bridge to relevance in one line
- End with one specific question
- No pleasantries

COLD CALL RULES (under 30 words):
- Pattern-interrupt style
- Name the signal immediately
- State why you're calling in one breath
- No "How are you today?"

CRITICAL: Each message must feel like it could only have been written for that specific company. Reference their actual product names, launches, and metrics from the context provided.

Return valid JSON only with this shape:
{
  "results": [
    {
      "accountId": "string",
      "email": "string",
      "linkedin": "string",
      "call": "string"
    }
  ]
}
`;

    const userPrompt = `
Generate outbound messaging using this context:

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
        input: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
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
        (entry) => entry?.accountId === item.accountId,
      );

      if (!generated || !fallback) {
        return fallback;
      }

      return {
        accountId: item.accountId,
        outreach: {
          email: generated.email,
          linkedin: generated.linkedin,
          call: generated.call,
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
        : "OpenAI generation failed. Using deterministic fallback.";

    return NextResponse.json({
      source: "deterministic",
      error: message,
      results: deterministicResults.map((item) =>
        item
          ? {
              ...item,
              outreach: {
                ...item.outreach,
                error: message,
              },
            }
          : item,
      ),
    });
  }
}
