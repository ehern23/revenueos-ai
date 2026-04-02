import {
  accounts,
  outreachHistory,
  signals,
  trends,
  type Account,
  type Signal,
} from "@/data";
import {
  buildFallbackCompanyResearch,
  type CompanyResearch,
} from "@/lib/company-research";

export type ProspectingInputs = {
  industry: string;
  persona: string;
  region: string;
  companySize: string;
  productDescription: string;
};

export type ProspectingResult = {
  account: Account;
  persona: string;
  signal: Signal;
  hypothesis: string;
  outreach: OutreachBundle;
  opportunityContext: OpportunityContext;
  research: CompanyResearch;
  whyThisAccount: string[];
  score: number;
};

export type OutreachBundle = {
  email: string;
  linkedin: string;
  call: string;
  source: "deterministic" | "openai";
  error?: string;
};

export type OpportunityContext = {
  maturity: string;
  strategicAngle: string;
  openingAngle: string;
  cta: string;
  scoreSummary: string;
};

const industryKeywords: Record<string, string[]> = {
  fintech: ["fintech", "payments", "finance", "treasury", "banking"],
  data: ["data", "warehouse", "analytics", "platform"],
  ai: ["ai", "ml", "machine learning", "infrastructure", "automation"],
  enterprise: ["enterprise", "strategic accounts", "ops", "workflow"],
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getAccountSizeBucket(employeeRange: string) {
  const range = employeeRange.replace(/,/g, "");
  const upperBound = Number(range.split("-")[1] ?? range.split("+")[0]);

  if (upperBound <= 1000) return "Mid-market";
  if (upperBound <= 3000) return "Growth";
  return "Enterprise";
}

function getSignalWeight(signal: Signal) {
  if (signal.impact === "high") return 14;
  if (signal.impact === "medium") return 8;
  return 4;
}

function getSignalStrategy(category: string) {
  const normalizedCategory = normalize(category);

  if (normalizedCategory.includes("hiring")) {
    return {
      strategicAngle: "new team formation and internal tooling buildout",
      openingAngle: "anchor the conversation on how fast-growing technical teams create planning noise before systems catch up",
      cta: "compare where new hiring priorities are creating pipeline blind spots",
    };
  }

  if (normalizedCategory.includes("product") || normalizedCategory.includes("platform")) {
    return {
      strategicAngle: "platform expansion and launch coordination",
      openingAngle: "lead with how platform expansion changes which accounts deserve coordinated coverage",
      cta: "trade notes on which launch-adjacent accounts should be prioritized first",
    };
  }

  if (normalizedCategory.includes("adoption") || normalizedCategory.includes("demand")) {
    return {
      strategicAngle: "enterprise pull and conversion execution",
      openingAngle: "speak to the execution gap that appears when market pull rises faster than account planning",
      cta: "pressure-test whether the current team is focused on the right enterprise motions",
    };
  }

  if (normalizedCategory.includes("partnership") || normalizedCategory.includes("market")) {
    return {
      strategicAngle: "ecosystem growth and account coordination",
      openingAngle: "frame the conversation around multi-threaded coverage as the market footprint widens",
      cta: "compare how strategic accounts are being segmented across the expanded motion",
    };
  }

  return {
    strategicAngle: "operational scaling and territory focus",
    openingAngle: "focus on where scaling motions create noisy prioritization and uneven rep focus",
    cta: "share a quick point of view on where the next wave of pipeline should come from",
  };
}

function getIndustryStrategy(industry: string) {
  const normalizedIndustry = normalize(industry);

  if (normalizedIndustry.includes("fintech") || normalizedIndustry.includes("payments")) {
    return "Tie the message to infrastructure complexity, operating leverage, and precision in high-value account selection.";
  }

  if (normalizedIndustry.includes("data")) {
    return "Speak to platform sprawl, solution packaging, and the challenge of lining up the right buyers as the data story expands.";
  }

  if (normalizedIndustry.includes("ai")) {
    return "Emphasize market speed, account prioritization, and the need to convert momentum into repeatable enterprise execution.";
  }

  return "Keep the message operational and specific, with a bias toward territory focus and better account sequencing.";
}

function getProductRelevance(
  productDescription: string,
  account: Account,
  signal: Signal,
  personaName: string,
) {
  const text = normalize(
    `${productDescription} ${account.industry} ${account.hypothesis} ${signal.title} ${signal.summary} ${personaName}`,
  );

  return Object.values(industryKeywords).reduce((score, keywords) => {
    const matchedKeyword = keywords.some((keyword) => text.includes(keyword));
    return matchedKeyword ? score + 4 : score;
  }, 0);
}

function getLatestTrendBoost(accountId: string) {
  const trend = trends.find((item) => item.accountId === accountId);
  const latestPoint = trend?.series.at(-1);
  return latestPoint ? Math.round(latestPoint.signalVolume * 1.5) : 0;
}

function getCompanyMaturity(employeeRange: string) {
  const bucket = getAccountSizeBucket(employeeRange);

  if (bucket === "Mid-market") return "scaling";
  if (bucket === "Growth") return "growth-stage";
  return "enterprise-scale";
}

function getScoreSummary(score: number) {
  if (score >= 100) return "top-priority account with immediate SDR relevance";
  if (score >= 90) return "high-priority account with a strong timing signal";
  return "credible pipeline target with enough context to personalize";
}

function deterministicIndex(seed: string, mod: number) {
  return seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % mod;
}

function buildWhyThisAccount(args: {
  account: Account;
  signal: Signal;
  personaName: string;
  inputs: ProspectingInputs;
  research: CompanyResearch;
}) {
  const { account, signal, personaName, inputs, research } = args;
  const reasons = [
    `${account.name} already scores strongly on opportunity (${account.opportunityScore}) and trend momentum (${account.trendScore}).`,
    `Recent signal: ${signal.title}, which suggests timely movement the SDR can reference right away.`,
    `${personaName} is a credible starting stakeholder because the research brief points to priorities around ${research.likelyPriorities[0]?.toLowerCase() ?? "execution focus"}.`,
    `Recommended GTM angle: ${research.recommendedGtmAngle}`,
  ];

  if (inputs.region && (account.region.includes(inputs.region) || account.region === "Global")) {
    reasons.push(
      `${account.region} coverage aligns with the selected region focus, keeping territory fit clean.`,
    );
  }

  if (inputs.companySize && getAccountSizeBucket(account.employeeRange) === inputs.companySize) {
    reasons.push(
      `${account.employeeRange} places this account in the selected ${inputs.companySize.toLowerCase()} company-size segment.`,
    );
  }

  if (inputs.industry && account.industry.toLowerCase().includes(inputs.industry.toLowerCase())) {
    reasons.push(
      `${account.industry} maps directly to the selected industry focus, making the messaging more specific.`,
    );
  }

  return reasons;
}

function buildOpportunityContext(args: {
  account: Account;
  signal: Signal;
  personaName: string;
  score: number;
  research: CompanyResearch;
}) {
  const { account, signal, personaName, score, research } = args;
  const signalStrategy = getSignalStrategy(signal.category);
  const maturity = getCompanyMaturity(account.employeeRange);

  return {
    maturity,
    strategicAngle: `${signalStrategy.strategicAngle}. ${getIndustryStrategy(account.industry)} ${research.recommendedGtmAngle}`,
    openingAngle: `${signalStrategy.openingAngle} This is especially relevant for ${personaName.toLowerCase()} stakeholders at ${maturity} companies. Brief focus: ${research.strategicDirection}`,
    cta: signalStrategy.cta,
    scoreSummary: getScoreSummary(score),
  };
}

function buildDeterministicOutreachBundle(args: {
  account: Account;
  signal: Signal;
  personaName: string;
  productDescription: string;
  opportunityContext: OpportunityContext;
  research: CompanyResearch;
}): OutreachBundle {
  const {
    account,
    signal,
    personaName,
    productDescription,
    opportunityContext,
    research,
  } = args;
  const recentOutreach = outreachHistory.find((entry) => entry.accountId === account.id);
  const trimmedProduct = productDescription.trim().replace(/\.$/, "");
  const productLine = trimmedProduct
    ? `We help teams with ${trimmedProduct}.`
    : "We help teams turn market signals into focused pipeline actions.";
  const maturity = opportunityContext.maturity;
  const seed = deterministicIndex(account.id, 3);

  const emailPatterns = [
    `Hi ${personaName} team — ${signal.title} stood out because it usually changes how ${maturity} companies decide where sellers should spend time. ${account.name} is operating in ${account.industry.toLowerCase()}, and ${research.companyOverview.toLowerCase()} ${productLine} Worth a short conversation on whether ${opportunityContext.cta}.`,
    `${account.name} looks like a timely account to reach right now. ${signal.summary} ${research.productFocus} For a ${maturity} business in ${account.industry.toLowerCase()}, that often creates a gap between market movement and account focus. Open to a brief exchange on whether ${opportunityContext.cta}?`,
    `Reaching out with a specific point of view: ${signal.title.toLowerCase()} suggests ${account.name} may be rethinking where execution focus belongs across key accounts. ${research.recommendedGtmAngle} ${productLine} If useful, I can share a concise example of how an SDR team would approach that without adding workflow overhead.`,
  ];

  const linkedinPatterns = [
    `${signal.title} is a sharp signal for ${account.name}. Curious if ${personaName.toLowerCase()} priorities are shifting around ${research.likelyPriorities[0]?.toLowerCase() ?? "account focus"} as that motion expands.`,
    `${account.name} seems to be hitting a point where ${signal.category.toLowerCase()} momentum changes how teams prioritize outreach. ${research.marketPosition}`,
    `Quick thought: for ${maturity} companies in ${account.industry.toLowerCase()}, signals like "${signal.title}" usually mean the old targeting model starts to drift. ${research.recommendedGtmAngle}`,
  ];

  const callPatterns = [
    `I’m calling with a focused idea for ${account.name}. ${signal.title} suggests the team may need a tighter way to decide which accounts and stakeholders deserve immediate attention, especially around ${research.likelyPriorities[0]?.toLowerCase() ?? "current priorities"}. We help SDR teams operationalize that without adding another planning layer.`,
    `Reason for the call: ${account.name} has a live signal around ${signal.category.toLowerCase()}, and that usually affects how ${personaName.toLowerCase()} leaders want pipeline built. The brief points to ${research.possiblePainPoints[0]?.toLowerCase() ?? "execution friction"}, and I wanted to see if that is already on your radar.`,
    `I had a specific hypothesis before calling. ${signal.summary} For a ${maturity} company, that often creates friction between strategy and day-to-day execution. ${research.recommendedGtmAngle}`,
  ];

  const followThrough = recentOutreach
    ? ` There has already been ${recentOutreach.channel} activity on "${recentOutreach.subject}," so I’d build on that context rather than restart the conversation cold.`
    : "";

  return {
    email: `${emailPatterns[seed]}${followThrough}`,
    linkedin: linkedinPatterns[(seed + 1) % linkedinPatterns.length],
    call: callPatterns[(seed + 2) % callPatterns.length],
    source: "deterministic",
  };
}

function withOutreachError(outreach: OutreachBundle, error: string): OutreachBundle {
  return {
    ...outreach,
    error,
  };
}

export function generateProspectingPipeline(
  inputs: ProspectingInputs,
): ProspectingResult[] {
  const normalizedIndustry = normalize(inputs.industry);
  const normalizedRegion = normalize(inputs.region);
  const selectedPersona =
    inputs.persona === "Auto-select best fit" ? "" : inputs.persona;

  const scored = accounts.map((account) => {
    const signal =
      signals.find((item) => item.accountId === account.id) ?? signals[0];
    const personaName = selectedPersona || account.recommendedPersona;
    const industryMatch = normalizedIndustry
      ? account.industry.toLowerCase().includes(normalizedIndustry)
      : false;
    const regionMatch = normalizedRegion
      ? account.region.toLowerCase().includes(normalizedRegion) ||
        account.region === "Global"
      : false;
    const sizeMatch = inputs.companySize
      ? getAccountSizeBucket(account.employeeRange) === inputs.companySize
      : false;
    const personaMatch = selectedPersona
      ? account.recommendedPersona === selectedPersona
      : true;

    let score =
      Math.round(account.opportunityScore * 0.45) +
      Math.round(account.trendScore * 0.3) +
      getSignalWeight(signal) +
      getLatestTrendBoost(account.id) +
      getProductRelevance(inputs.productDescription, account, signal, personaName);

    if (industryMatch) score += 12;
    if (regionMatch) score += 10;
    if (sizeMatch) score += 8;
    if (personaMatch) score += 12;

    const research = buildFallbackCompanyResearch({
      account,
      signal,
      persona: personaName,
      inputs,
    });
    const hypothesis = `${account.hypothesis} Research brief: ${research.strategicDirection} Recommended GTM angle: ${research.recommendedGtmAngle}`;
    const opportunityContext = buildOpportunityContext({
      account,
      signal,
      personaName,
      score,
      research,
    });

    return {
      account,
      persona: personaName,
      signal,
      hypothesis,
      outreach: buildDeterministicOutreachBundle({
        account,
        signal,
        personaName,
        productDescription: inputs.productDescription,
        opportunityContext,
        research,
      }),
      opportunityContext,
      research,
      whyThisAccount: buildWhyThisAccount({
        account,
        signal,
        personaName,
        inputs,
        research,
      }),
      score,
    };
  });

  const filtered = scored.filter((item) => {
    if (!inputs.industry && !inputs.region && !inputs.companySize && !selectedPersona) {
      return true;
    }

    const industryPass = !inputs.industry
      ? true
      : item.account.industry.toLowerCase().includes(normalizedIndustry);
    const regionPass = !inputs.region
      ? true
      : item.account.region.toLowerCase().includes(normalizedRegion) ||
        item.account.region === "Global";
    const sizePass = !inputs.companySize
      ? true
      : getAccountSizeBucket(item.account.employeeRange) === inputs.companySize;
    const personaPass = !selectedPersona
      ? true
      : item.account.recommendedPersona === selectedPersona;

    return [industryPass, regionPass, sizePass, personaPass].filter(Boolean).length >= 2;
  });

  const results = (filtered.length > 0 ? filtered : scored)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return results;
}

export function buildFallbackOutreachForResult(args: {
  result: Pick<
    ProspectingResult,
    "account" | "persona" | "signal" | "opportunityContext" | "research"
  >;
  productDescription: string;
  error?: string;
}): OutreachBundle {
  const outreach = buildDeterministicOutreachBundle({
    account: args.result.account,
    signal: args.result.signal,
    personaName: args.result.persona,
    productDescription: args.productDescription,
    opportunityContext: args.result.opportunityContext,
    research: args.result.research,
  });

  return args.error ? withOutreachError(outreach, args.error) : outreach;
}

export function applyResearchToProspectingResult(args: {
  result: Pick<ProspectingResult, "account" | "persona" | "signal" | "score">;
  research: CompanyResearch;
  inputs: ProspectingInputs;
}): ProspectingResult {
  const hypothesis = `${args.result.account.hypothesis} Research brief: ${args.research.strategicDirection} Recommended GTM angle: ${args.research.recommendedGtmAngle}`;
  const opportunityContext = buildOpportunityContext({
    account: args.result.account,
    signal: args.result.signal,
    personaName: args.result.persona,
    score: args.result.score,
    research: args.research,
  });

  return {
    ...args.result,
    hypothesis,
    opportunityContext,
    research: args.research,
    outreach: buildDeterministicOutreachBundle({
      account: args.result.account,
      signal: args.result.signal,
      personaName: args.result.persona,
      productDescription: args.inputs.productDescription,
      opportunityContext,
      research: args.research,
    }),
    whyThisAccount: buildWhyThisAccount({
      account: args.result.account,
      signal: args.result.signal,
      personaName: args.result.persona,
      inputs: args.inputs,
      research: args.research,
    }),
  };
}
