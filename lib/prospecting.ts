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

// Account-specific outreach - no em-dashes, varied structure, under 75 words
const accountSpecificOutreach: Record<string, { email: string; linkedin: string; call: string }> = {
  vercel: {
    email: `Subject: v0 at 1M vs your account list

Quick question: with AI Gateway live and v0 crossing a million users, how is the team deciding which enterprise accounts to prioritize first?

That inflection point usually breaks whatever spreadsheet was working before. Happy to share how other PLG teams are handling it if useful.`,
    linkedin: `AI Gateway plus 1M v0 users. How are you deciding which enterprise accounts get attention first?`,
    call: `v0 just crossed a million users. Calling to see how you're prioritizing enterprise accounts at that scale.`
  },
  ramp: {
    email: `Subject: Your ML hiring vs your account list

12 ML roles posted while enterprise customers doubled. That's a signal your product is outpacing your GTM motion.

Most teams I talk to at this stage have the opposite problem from a year ago: too many qualified accounts, not enough prioritization. Is that landing?`,
    linkedin: `2x enterprise customers, 12 ML hires. Is prioritization the bottleneck now, or still demand gen?`,
    call: `Doubled enterprise customers while hiring 12 ML engineers. Curious if prioritization has become the bottleneck.`
  },
  anthropic: {
    email: `Subject: Claude 4.6 inbound quality

How much of your post-Claude 4.6 inbound is real enterprise buyers versus AI tourists kicking tires?

That ratio is usually around 15-20% at this stage. If you're seeing something different, I'd actually love to hear what's working.`,
    linkedin: `Post-Claude 4.6, what percentage of enterprise inbound is actually qualified? Curious if the ratio matches what I'm seeing elsewhere.`,
    call: `Claude 4.6 enterprise API launch. Wondering how you're separating real buyers from the wave of inbound.`
  },
  stripe: {
    email: `Subject: AI infra vs payments ICPs

Are you seeing different account profiles convert on AI infrastructure versus core payments? Most platform expansions fracture the ICP before teams realize it.

Would be curious to compare notes if you're tracking that.`,
    linkedin: `AI infrastructure launch. Are different account profiles converting versus payments, or same ICP?`,
    call: `AI infrastructure rollout. Curious if your converting accounts look different from core payments.`
  },
  databricks: {
    email: `Subject: When every account looks hot

Enterprise adoption surge is visible from the outside. The counterintuitive problem: when demand spikes, prioritization breaks because everything looks good.

How is your team deciding what gets worked first versus what sits in nurture?`,
    linkedin: `Enterprise surge means too many good accounts. How are you deciding what gets worked first?`,
    call: `Enterprise adoption is spiking. Calling to see how you're prioritizing when everything looks like a good opportunity.`
  },
  openai: {
    email: `Subject: Turning away qualified leads

You're probably rejecting more qualified enterprise leads than most companies generate. The question is whether that triage is systematic or gut feel.

Worth comparing approaches? I've seen a few patterns that might be relevant.`,
    linkedin: `At your demand level, triage matters more than prospecting. Is that systematic yet or still being figured out?`,
    call: `Enterprise demand at your scale. Curious if the triage process is systematic or still evolving.`
  },
  snowflake: {
    email: `Subject: More products, same playbook?

Platform breadth keeps growing. More products means more personas means more accounts that look qualified but don't close.

Is your SDR team running different motions per product, or still one playbook across everything?`,
    linkedin: `More products, more personas, more noise. Running different SDR motions per product line?`,
    call: `Platform expansion. Are you running different SDR motions per product or one playbook?`
  },
  brex: {
    email: `Subject: Wider ICP, same conversion rate?

Infrastructure expansion usually means the ICP gets broader. Broader ICP usually means conversion rates drop before anyone notices.

Seeing that pattern, or has messaging kept pace with the product expansion?`,
    linkedin: `Broader ICP from the infrastructure expansion. Has conversion rate held, or starting to drift?`,
    call: `Infrastructure expansion usually widens the ICP. Curious if conversion rates have held.`
  },
  plaid: {
    email: `Subject: Direct vs partner-sourced accounts

Partnership deals require different account planning than direct sales. Most teams run the same motion for both and wonder why partner-sourced deals stall.

How are you handling that split?`,
    linkedin: `Partnership expansion. Are you running different motions for partner-sourced versus direct accounts?`,
    call: `Enterprise partnerships. Curious how you're planning partner-sourced accounts differently from direct.`
  },
  "scale-ai": {
    email: `Subject: Enterprise vs public sector motion

Enterprise and public sector are fundamentally different buying motions. Running one playbook for both usually means mediocre results in both.

Is your SDR team differentiating, or still figuring that out?`,
    linkedin: `Enterprise plus public sector is a lot of surface area. Same playbook or different motions?`,
    call: `Enterprise and public sector expansion. Same SDR playbook or different approaches?`
  },
  mercury: {
    email: `Subject: Free banking, real buyers

Startup momentum means lots of signups. The hard part is figuring out which ones have actual budget versus which are kicking tires because banking is free.

What signals are you using to sort them?`,
    linkedin: `Lots of startup interest. How are you identifying which ones have real budget versus free tier explorers?`,
    call: `Startup momentum is strong. Curious how you're identifying real buyers versus tire kickers.`
  },
  "modern-treasury": {
    email: `Subject: Inbound speed vs inbound fit

Payment ops positioning is landing. When inbound volume rises, most SDR teams optimize for speed. The ones that win optimize for fit.

Which side is your team leaning toward right now?`,
    linkedin: `Inbound is up. Optimizing for speed or for fit? That choice usually determines conversion rates.`,
    call: `Payment ops messaging is resonating. Curious if you're optimizing inbound for speed or fit.`
  },
};

function buildDeterministicOutreachBundle(args: {
  account: Account;
  signal: Signal;
  personaName: string;
  productDescription: string;
  opportunityContext: OpportunityContext;
  research: CompanyResearch;
}): OutreachBundle {
  const { account, signal, personaName, opportunityContext, research } = args;
  const recentOutreach = outreachHistory.find((entry) => entry.accountId === account.id);
  const maturity = opportunityContext.maturity;
  
  // Use account-specific outreach if available
  const specificOutreach = accountSpecificOutreach[account.id];
  if (specificOutreach) {
    return {
      email: specificOutreach.email,
      linkedin: specificOutreach.linkedin,
      call: specificOutreach.call,
      source: "deterministic",
    };
  }

  // Fallback for accounts without specific outreach - varied structure, no em-dashes
  const seed = deterministicIndex(account.id, 3);

  const emailPatterns = [
    `Subject: ${signal.category.toLowerCase()} timing\n\n${signal.title}. For ${maturity} teams, that usually breaks whatever prioritization system was working before.\n\nIs that landing, or is demand still the bottleneck?`,
    `Subject: Quick ${signal.category.toLowerCase()} question\n\nHow is the team deciding which accounts to prioritize given ${signal.title.toLowerCase()}?\n\nCurious if you're seeing the same pattern I'm hearing from other ${account.industry.toLowerCase()} companies.`,
    `Subject: ${maturity} prioritization\n\n${signal.summary}\n\nThat signal usually means account prioritization matters more than lead volume. Worth comparing approaches?`,
  ];

  const linkedinPatterns = [
    `${signal.title}. How is that changing which accounts get prioritized?`,
    `${signal.category} momentum usually means prioritization becomes the bottleneck. Seeing that?`,
    `Quick question: with ${signal.title.toLowerCase()}, how is the team deciding what gets worked first?`,
  ];

  const callPatterns = [
    `${signal.title}. Calling to see how that's changing your account prioritization.`,
    `${signal.category} signal caught my attention. Curious how you're handling prioritization.`,
  ];

  const followThrough = recentOutreach
    ? `\n\n(Building on the earlier ${recentOutreach.channel} thread about "${recentOutreach.subject}")`
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
