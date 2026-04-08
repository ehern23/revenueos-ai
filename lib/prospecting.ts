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

// Account-specific outreach that sounds researched, not templated
const accountSpecificOutreach: Record<string, { email: string; linkedin: string; call: string }> = {
  vercel: {
    email: `Subject: AI Gateway timing

Saw you shipped AI Gateway last week — unified model routing is a big unlock for teams juggling multiple providers.

With v0 hitting 1M users and enterprise demand spiking, I'd guess the SDR motion is shifting from "explain the platform" to "prioritize which enterprise accounts to work first."

That's exactly what we built RevenueOS for: turning product-led signals into sequenced outbound without adding spreadsheet overhead.

Would a 15-min walkthrough of how we'd prioritize your top 20 enterprise targets be useful?`,
    linkedin: `AI Gateway launch + 1M v0 users in the same quarter is a signal most SDR teams would kill for. Curious how you're deciding which enterprise accounts get attention first — or if that's still being figured out?`,
    call: `Quick context for the call: you launched AI Gateway last week and v0 just crossed a million users. That usually means enterprise demand is outpacing the team's ability to prioritize. Wanted to share how we help SDR teams sequence that.`
  },
  ramp: {
    email: `Subject: Post-doubling prioritization

Noticed Ramp doubled enterprise customers in Q1 while posting 12 ML roles — that's a pace most finance teams can't match with manual account planning.

When enterprise count scales that fast, the usual problem isn't lead volume. It's figuring out which accounts actually convert at your new price point and which are tire-kickers.

We help SDR teams score and sequence accounts using your actual conversion patterns, not generic firmographics.

Worth 15 minutes to compare how you're handling prioritization today?`,
    linkedin: `12 ML hires + 2x enterprise customers in one quarter. The prioritization challenge at that growth rate is real — curious how your SDR team is deciding which accounts get worked first vs. left in nurture.`,
    call: `Calling about the ML hiring push and enterprise doubling. At that growth rate, most SDR teams I talk to are drowning in accounts and starving for prioritization. Wanted to see if that's on your radar.`
  },
  anthropic: {
    email: `Subject: Claude 4.6 enterprise motion

Claude 4.6 shipped with the enterprise API expansion — which means you're probably fielding more inbound enterprise interest than your current GTM team can qualify.

The pattern I've seen with AI labs at this stage: product momentum creates a flood of "interested" accounts, but only 15-20% are actually ready to move. The rest burn SDR cycles.

We help teams like yours identify which accounts have real buying intent vs. curiosity, based on signals beyond just form fills.

Would it help to see how we'd score your current pipeline?`,
    linkedin: `Claude 4.6 + enterprise API expansion is going to create a wave of inbound. Curious how you're separating real enterprise buyers from AI tourists — that's usually the bottleneck at this stage.`,
    call: `Reaching out about the Claude 4.6 launch and enterprise API push. Most AI companies at this stage have more inbound than they can qualify well. Wanted to share a quick POV on how to separate signal from noise.`
  },
  stripe: {
    email: `Subject: AI infra GTM sequencing

Stripe's AI infrastructure rollout puts you in a new competitive motion — you're not just selling payments anymore, you're selling platform.

The challenge I've seen with platform expansions: existing customers are the fastest path to revenue, but SDR teams default to net-new prospecting because that's what the playbook says.

We help identify which existing accounts have expansion signals and which net-new targets actually match your new platform story.

15 minutes to compare how you're thinking about account sequencing for the AI push?`,
    linkedin: `AI infrastructure launch changes the Stripe GTM motion significantly. Curious if the SDR team is already seeing different account profiles convert — or if that's still emerging.`,
    call: `Calling about the AI infrastructure launch. Platform expansion usually means the best opportunities are hiding in existing accounts, but SDR teams keep hunting net-new. Wanted to see how you're balancing that.`
  },
  databricks: {
    email: `Subject: Enterprise surge prioritization

The Databricks enterprise adoption surge is visible from the outside — which means your SDR team is probably dealing with more qualified accounts than they can work effectively.

The counterintuitive problem at this stage: when everything looks good, nothing gets prioritized. Reps spread too thin across too many "hot" accounts.

We help teams identify the 20% of accounts that drive 80% of pipeline and build sequences around those, not spray across everything.

Would a quick look at how we'd tier your current target list be valuable?`,
    linkedin: `Enterprise adoption surge means your SDR team has the opposite of a demand problem — too many good accounts, not enough prioritization. How are you deciding what gets worked first?`,
    call: `Calling about the enterprise adoption numbers. When demand spikes like this, the usual problem is prioritization, not prospecting. Wanted to share how we help SDR teams focus on the right 20%.`
  },
  openai: {
    email: `Subject: Enterprise demand triage

OpenAI's enterprise demand is public knowledge at this point — which means you're probably turning away more qualified leads than most companies generate.

The problem I'd guess you're facing: every account looks strategic, but SDR capacity is finite. Without a systematic way to score and sequence, you're leaving pipeline on the table.

We help enterprise teams like yours identify which accounts are ready to move vs. which need nurturing — based on signals beyond company size.

Worth 15 minutes to see how we'd approach your current queue?`,
    linkedin: `Enterprise demand at OpenAI's scale creates a unique problem: too many good accounts, not enough prioritization. Curious how your SDR team decides what gets attention first.`,
    call: `Quick reason for the call: enterprise demand at your scale usually means triage is the bottleneck, not prospecting. Wanted to share how we help teams prioritize when everything looks like a good opportunity.`
  },
  snowflake: {
    email: `Subject: Platform expansion coverage

Snowflake's platform breadth keeps growing — which means the SDR motion is getting more complex, not simpler.

The pattern I see with platform companies: more products = more buying personas = more accounts that look "good" but don't actually close. The signal-to-noise ratio drops.

We help SDR teams cut through that noise by identifying which accounts have real intent signals for specific products, not just generic interest.

Would it help to see how we'd segment your target accounts by product fit?`,
    linkedin: `Platform expansion usually means more complexity for SDR teams, not less. Curious how you're matching accounts to specific Snowflake products vs. running a generic motion.`,
    call: `Calling because platform expansion usually creates SDR complexity — more products, more personas, more accounts that look good but don't convert. Wanted to share how we help teams cut through that.`
  },
  brex: {
    email: `Subject: Fintech expansion sequencing

Brex's infrastructure expansion is visible in the product announcements — which usually means the SDR team is working a wider ICP than six months ago.

The challenge: broader ICP = more accounts that technically qualify, but conversion rates drop because messaging isn't specific enough.

We help SDR teams identify which segments of the expanded ICP actually convert and build targeted sequences for each, rather than generic outreach.

15 minutes to compare how you're handling the expanded target list?`,
    linkedin: `Fintech infrastructure expansion usually means a wider ICP for SDR teams to cover. Curious how you're segmenting the new target accounts vs. running the same playbook.`,
    call: `Calling about the infrastructure expansion. Broader ICP usually means lower conversion rates unless SDR messaging gets more specific. Wanted to see how you're approaching that.`
  },
  plaid: {
    email: `Subject: Partnership-led account planning

Plaid's enterprise partnership expansion means your SDR team is probably getting pulled into more complex, multi-stakeholder deals.

The challenge I see: partnership deals require different account planning than direct sales, but most SDR teams run the same motion for both.

We help teams identify which partnership-sourced accounts need multi-threaded outreach vs. which can be worked directly — and sequence accordingly.

Worth a quick conversation on how you're handling partnership-led accounts today?`,
    linkedin: `Enterprise partnership expansion changes the SDR motion — multi-stakeholder deals require different account planning than direct sales. How are you adjusting the approach?`,
    call: `Calling about the partnership expansion. Those deals usually require different SDR planning than direct sales. Wanted to see if that complexity is already hitting your team.`
  },
  "scale-ai": {
    email: `Subject: Public sector + enterprise coverage

Scale AI's expansion into both enterprise and public sector is a big surface area for an SDR team to cover.

The challenge: these are fundamentally different buying motions, but most teams run a single playbook and wonder why conversion rates differ.

We help teams identify which accounts fit which motion and build separate prioritization logic for each, rather than treating everything the same.

15 minutes to see how we'd segment your current target list across both motions?`,
    linkedin: `Enterprise + public sector expansion is a lot of surface area. Curious how your SDR team is differentiating the approach — or if it's still a single playbook.`,
    call: `Calling about the enterprise and public sector expansion. Those are different buying motions, and most SDR teams run a single playbook for both. Wanted to see how you're handling that.`
  },
  mercury: {
    email: `Subject: Startup segment scaling

Mercury's startup momentum is strong — which usually means the SDR challenge shifts from "find leads" to "qualify efficiently."

At scale, the problem isn't volume. It's figuring out which startups have real budget vs. which are kicking tires because banking is free.

We help teams identify buying signals that correlate with actual conversion, not just signup activity.

Would a quick look at how we'd score your current startup pipeline be useful?`,
    linkedin: `Startup segment momentum at Mercury's scale creates a qualification challenge — lots of interest, but conversion signals are harder to read. How are you sorting real buyers from browsers?`,
    call: `Calling about the startup segment growth. At this scale, qualification is usually the bottleneck. Wanted to share how we help teams identify which startups actually convert.`
  },
  "modern-treasury": {
    email: `Subject: Payment ops scaling

Modern Treasury's focus on payment ops scale is resonating — which means inbound quality matters more than volume now.

The challenge I see at this stage: SDR teams optimize for speed (work every lead fast) when they should optimize for fit (work the right leads deeply).

We help teams identify which inbound accounts match your actual conversion patterns and prioritize those, rather than first-in-first-out processing.

15 minutes to compare how you're handling lead prioritization today?`,
    linkedin: `Payment ops scale messaging is landing — curious how the SDR team is prioritizing which inbound to work deeply vs. which to nurture. That's usually where conversion rates hide.`,
    call: `Calling about the payment ops positioning. At this stage, lead prioritization usually matters more than lead volume. Wanted to see how you're thinking about that.`
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

  // Fallback for accounts without specific outreach
  const seed = deterministicIndex(account.id, 3);

  const emailPatterns = [
    `Subject: ${signal.category} timing\n\n${signal.title} caught my attention — that kind of movement usually changes how ${maturity} teams decide where to focus.\n\nThe pattern I see: when ${signal.category.toLowerCase()} signals spike, account prioritization becomes the bottleneck, not prospecting.\n\nWe help SDR teams identify which accounts are actually ready to move vs. which are just showing activity.\n\n15 minutes to see how we'd approach ${account.name}'s target list?`,
    `Subject: ${account.industry} prioritization\n\n${signal.summary}\n\nFor ${maturity} companies in ${account.industry.toLowerCase()}, that usually creates a gap between market opportunity and SDR focus.\n\nWe help teams close that gap by scoring accounts on actual buying signals, not just firmographics.\n\nWorth a quick look at how we'd prioritize your current pipeline?`,
    `Subject: Quick ${signal.category.toLowerCase()} question\n\n${signal.title} suggests ${account.name} is at a decision point about where to focus SDR effort.\n\n${research.recommendedGtmAngle}\n\nWe help teams make that call systematically rather than gut-feel. Would a 15-minute walkthrough be useful?`,
  ];

  const linkedinPatterns = [
    `${signal.title} is a clear signal. Curious how your SDR team is adjusting prioritization — or if that's still being figured out.`,
    `${signal.category} momentum at ${account.name} usually means account prioritization becomes the bottleneck. How are you handling that?`,
    `Quick question: with ${signal.title.toLowerCase()}, how is the team deciding which accounts get attention first?`,
  ];

  const callPatterns = [
    `${signal.title} — that's why I'm calling. At this stage, most teams need a tighter way to prioritize which accounts get SDR attention first.`,
    `Calling because ${signal.category.toLowerCase()} signals like yours usually mean prioritization is the bottleneck. Wanted to see if that's on your radar.`,
    `Quick context: ${signal.summary} Most ${maturity} teams I talk to are dealing with prioritization challenges at this stage.`,
  ];

  const followThrough = recentOutreach
    ? `\n\nNote: there's been ${recentOutreach.channel} activity on "${recentOutreach.subject}" — worth building on that context.`
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
