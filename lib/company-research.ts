import { trends, type Account, type Signal } from "@/data";

export type ResearchContextInputs = {
  industry: string;
  region: string;
  companySize: string;
  productDescription: string;
};

export type CompanyResearch = {
  companyOverview: string;
  productFocus: string;
  strategicDirection: string;
  marketPosition: string;
  likelyPriorities: string[];
  possiblePainPoints: string[];
  recommendedGtmAngle: string;
  source: "deterministic" | "openai";
  error?: string;
};

type CompanyProfile = Omit<CompanyResearch, "source" | "error">;

const companyProfiles: Record<string, CompanyProfile> = {
  ramp: {
    companyOverview:
      "Ramp is a finance automation company moving beyond spend management into a broader operating system for finance teams.",
    productFocus:
      "Core product energy is concentrated around finance workflows, operational automation, and intelligent decision support for modern finance orgs.",
    strategicDirection:
      "The hiring signal points to a deeper push into internal intelligence and workflow automation rather than surface-level feature expansion.",
    marketPosition:
      "Ramp competes as a fast-moving fintech challenger with a reputation for product velocity and strong operator appeal.",
    likelyPriorities: [
      "Operationalize AI across finance and internal tooling workflows",
      "Maintain product velocity without diluting execution focus",
      "Identify the highest-value expansion paths inside enterprise finance accounts",
    ],
    possiblePainPoints: [
      "Fast growth can create noisy prioritization across GTM teams",
      "New ML investment can outpace clear commercial packaging",
      "Enterprise account selection may become uneven as use cases broaden",
    ],
    recommendedGtmAngle:
      "Lead with how AI-informed account planning can keep finance-product momentum tied to the right enterprise buying centers.",
  },
  stripe: {
    companyOverview:
      "Stripe is a global payments and developer infrastructure platform with strong leverage across commerce, financial services, and programmable money movement.",
    productFocus:
      "The company is extending its platform from payments into broader infrastructure layers, including AI-oriented developer and platform capabilities.",
    strategicDirection:
      "The current direction suggests Stripe is widening its technical surface area while protecting its position as the default platform for builders and enterprise teams.",
    marketPosition:
      "Stripe is still one of the strongest infrastructure brands in fintech, with significant developer trust and enterprise reach.",
    likelyPriorities: [
      "Translate AI infrastructure launches into commercial adoption",
      "Coordinate platform storytelling across multiple buyer groups",
      "Prioritize the accounts most likely to convert from infrastructure relevance into platform expansion",
    ],
    possiblePainPoints: [
      "Platform breadth can create diffuse GTM focus",
      "Launch-adjacent motions may overwhelm traditional segmentation",
      "Different product lines may compete for the same strategic accounts",
    ],
    recommendedGtmAngle:
      "Position RevenueOS AI as a way to sharpen launch-adjacent account prioritization and keep platform expansion tied to the right enterprise opportunities.",
  },
  snowflake: {
    companyOverview:
      "Snowflake is a data cloud platform pushing from storage and compute into a broader applications and intelligence story.",
    productFocus:
      "Product focus is shifting toward a fuller data platform narrative that combines analytics, applications, governance, and AI use cases.",
    strategicDirection:
      "Expansion efforts suggest Snowflake wants to own more of the practical application layer on top of its data foundation.",
    marketPosition:
      "Snowflake is a category-defining player with strong enterprise penetration and a large ecosystem, but it competes in an increasingly crowded AI data stack.",
    likelyPriorities: [
      "Package platform expansion into clearer account-level stories",
      "Identify which enterprise segments are most ready for broader adoption",
      "Support sellers with a more precise map of where platform breadth matters most",
    ],
    possiblePainPoints: [
      "Platform breadth can become hard to message cleanly",
      "Multiple use cases may blur rep focus across target accounts",
      "Account teams may lack a shared view of which buyers are ready for broader adoption",
    ],
    recommendedGtmAngle:
      "Lead with account planning that helps Snowflake sellers connect platform expansion to the right buyer motions instead of pitching the full platform everywhere.",
  },
  databricks: {
    companyOverview:
      "Databricks operates at the center of the data and AI platform market, especially where enterprise standardization and AI deployment intersect.",
    productFocus:
      "The company is focused on turning technical adoption into broad enterprise platform commitments across analytics, AI, and developer workflows.",
    strategicDirection:
      "The adoption signal suggests Databricks is leaning into enterprise-scale execution, not just product awareness, which raises the stakes on account focus.",
    marketPosition:
      "Databricks has strong momentum and brand gravity in enterprise AI, often entering strategic transformation conversations earlier than many peers.",
    likelyPriorities: [
      "Convert AI platform demand into repeatable enterprise pipeline",
      "Multi-thread strategic accounts across technical and executive stakeholders",
      "Avoid wasting seller cycles on accounts without platform-scale expansion potential",
    ],
    possiblePainPoints: [
      "Market momentum can mask weak account qualification",
      "Enterprise demand may outpace disciplined account planning",
      "Large deal motions require tighter stakeholder mapping and sequencing",
    ],
    recommendedGtmAngle:
      "Use a strategic-account narrative: RevenueOS AI helps the team focus energy on the enterprise accounts most likely to turn AI platform interest into committed expansion.",
  },
  brex: {
    companyOverview:
      "Brex is evolving from spend management into broader financial infrastructure and operating tooling for modern businesses.",
    productFocus:
      "Its product energy is moving toward deeper fintech infrastructure and more integrated operating workflows.",
    strategicDirection:
      "The infrastructure expansion signal implies a move toward more complex buyer motions and a wider range of enterprise use cases.",
    marketPosition:
      "Brex remains a recognizable fintech brand with strong product awareness, but execution quality matters as the story expands.",
    likelyPriorities: [
      "Translate infrastructure breadth into clear commercial segmentation",
      "Prioritize buyers who care about integrated financial operations",
      "Tighten weekly GTM planning around accounts with real expansion fit",
    ],
    possiblePainPoints: [
      "A broader story can dilute seller focus",
      "Not all accounts will respond to the infrastructure angle equally",
      "Revenue teams may need sharper planning discipline as buyer complexity grows",
    ],
    recommendedGtmAngle:
      "Frame the pitch around GTM precision: which accounts actually warrant a broader infrastructure motion, and how should the team sequence them.",
  },
  mercury: {
    companyOverview:
      "Mercury is a banking and financial operations platform serving startups and growth companies with a modern, operator-friendly approach.",
    productFocus:
      "The product emphasis sits at the intersection of banking, startup operations, and lightweight financial workflows.",
    strategicDirection:
      "Current momentum suggests Mercury is strengthening its grip on a focused segment rather than trying to become all things to all buyers.",
    marketPosition:
      "Mercury is well regarded in startup circles and benefits from clarity of audience, though enterprise-style GTM complexity is still growing.",
    likelyPriorities: [
      "Deepen fit within high-growth startup segments",
      "Identify where stronger account prioritization can create efficient pipeline",
      "Protect GTM focus as the market motion broadens",
    ],
    possiblePainPoints: [
      "Segment expansion can create uneven territory focus",
      "Lean teams may not have time for heavy account planning motions",
      "Broader ambitions can pull attention from the core ICP",
    ],
    recommendedGtmAngle:
      "Lead with efficiency and focus: show how the team can stay disciplined on the highest-yield accounts without adding process drag.",
  },
  plaid: {
    companyOverview:
      "Plaid is a financial connectivity and data infrastructure company embedded across a large portion of the fintech ecosystem.",
    productFocus:
      "Its product focus remains centered on secure connectivity, data access, and the infrastructure layer powering financial applications.",
    strategicDirection:
      "Partnership signals suggest Plaid is leaning further into ecosystem scale and deeper enterprise relationships.",
    marketPosition:
      "Plaid holds a strong infrastructure position with broad market recognition, but must coordinate a complex mix of partners, product lines, and enterprise accounts.",
    likelyPriorities: [
      "Multi-thread larger strategic accounts more effectively",
      "Align partnership momentum with direct account strategy",
      "Clarify which enterprise accounts merit the most coordinated effort",
    ],
    possiblePainPoints: [
      "Ecosystem breadth can make ownership of strategic accounts fuzzy",
      "Partnership growth may outpace clean account segmentation",
      "Teams may struggle to connect market signals to concrete weekly actions",
    ],
    recommendedGtmAngle:
      "Take an account-coordination angle: RevenueOS AI can help Plaid line up ecosystem momentum with a more disciplined strategic account plan.",
  },
  "modern-treasury": {
    companyOverview:
      "Modern Treasury is a payments operations company focused on making money movement more controllable and programmable for growing businesses.",
    productFocus:
      "Its energy is concentrated on payment operations infrastructure and operational clarity for finance teams.",
    strategicDirection:
      "The signal profile points to operational depth and execution quality rather than rapid category expansion.",
    marketPosition:
      "Modern Treasury has a strong specialist position, particularly where teams care deeply about financial operations rigor.",
    likelyPriorities: [
      "Target enterprise accounts with acute operations complexity",
      "Keep account selection disciplined in a narrower market",
      "Support a high-context outbound motion without bloating process",
    ],
    possiblePainPoints: [
      "Niche specialization means every target account matters",
      "A smaller TAM raises the cost of weak prioritization",
      "Reps may need more context per account than generic scoring provides",
    ],
    recommendedGtmAngle:
      "Lead with precision: show how deeper account briefs and cleaner targeting can help a specialist sales motion stay efficient.",
  },
  "scale-ai": {
    companyOverview:
      "Scale AI sits at the intersection of AI infrastructure, enterprise deployment, and increasingly strategic public sector and large-scale operational use cases.",
    productFocus:
      "Its product motion spans data, model deployment support, and practical AI execution for complex organizations.",
    strategicDirection:
      "Recent expansion signals point toward broader enterprise and public sector coverage, which raises the importance of territory and account orchestration.",
    marketPosition:
      "Scale AI has strong relevance in the enterprise AI narrative, but market breadth can create difficult prioritization choices.",
    likelyPriorities: [
      "Decide which enterprise and public sector motions deserve top coverage",
      "Support reps with deeper account strategy in technically complex deals",
      "Turn market relevance into focused pipeline creation instead of broad noise",
    ],
    possiblePainPoints: [
      "Market breadth can create uneven territory attack plans",
      "Complex technical deals demand better account context",
      "Not every AI-relevant account deserves the same level of seller investment",
    ],
    recommendedGtmAngle:
      "Use a territory-and-strategy brief angle: help the team separate real strategic accounts from noisy AI interest.",
  },
  openai: {
    companyOverview:
      "OpenAI is operating as both an AI product company and a fast-scaling enterprise platform provider with rapidly widening commercial relevance.",
    productFocus:
      "Product energy spans model access, applied enterprise experiences, platform capabilities, and the operating systems required to support large-scale AI adoption.",
    strategicDirection:
      "The demand signal implies intense pressure to turn market pull into disciplined enterprise execution without losing strategic focus.",
    marketPosition:
      "OpenAI has outsized market gravity and broad buyer attention, which makes prioritization discipline more important than raw awareness generation.",
    likelyPriorities: [
      "Identify which enterprise accounts warrant the deepest expansion effort",
      "Maintain focus as inbound and outbound demand scales simultaneously",
      "Equip sellers with sharper account context across many possible use cases",
    ],
    possiblePainPoints: [
      "Massive market pull can obscure account prioritization mistakes",
      "Different enterprise motions may compete for the same resources",
      "Teams may need more strategic account planning than standard SDR tooling provides",
    ],
    recommendedGtmAngle:
      "Anchor on focus and operating discipline: RevenueOS AI helps convert high demand into better account sequencing, sharper hypotheses, and more strategic expansion execution.",
  },
};

function getFallbackProfile(account: Account, signal: Signal): CompanyProfile {
  return {
    companyOverview: `${account.name} is operating in ${account.industry.toLowerCase()} with enough scale to require sharper commercial coordination across accounts and buyer groups.`,
    productFocus: `The current signal pattern suggests the company is pushing deeper into ${signal.category.toLowerCase()}-adjacent workflows and product expansion.`,
    strategicDirection:
      "The business appears to be broadening its market motion in a way that raises the value of better account segmentation and planning discipline.",
    marketPosition:
      "This account looks like a credible market leader or fast mover where seller focus and account quality matter more than raw activity volume.",
    likelyPriorities: [
      "Keep GTM effort focused on the right accounts",
      "Translate market momentum into disciplined pipeline creation",
      "Improve coordination across strategic buyer motions",
    ],
    possiblePainPoints: [
      "Signal-rich accounts can still suffer from weak prioritization",
      "Broader product or market motion can create messaging sprawl",
      "Teams may struggle to convert momentum into a clean account plan",
    ],
    recommendedGtmAngle:
      "Lead with account focus, strategic segmentation, and cleaner execution against the accounts most likely to convert.",
  };
}

export function buildFallbackCompanyResearch(args: {
  account: Account;
  signal: Signal;
  persona: string;
  inputs: ResearchContextInputs;
}): CompanyResearch {
  const trend = trends.find((item) => item.accountId === args.account.id);
  const latestTrend = trend?.series.at(-1);
  const profile = companyProfiles[args.account.id] ?? getFallbackProfile(args.account, args.signal);
  const productContext = args.inputs.productDescription.trim().replace(/\.$/, "");
  const regionContext = args.inputs.region
    ? ` The selected regional lens is ${args.inputs.region}.`
    : "";

  return {
    companyOverview: `${profile.companyOverview}${regionContext} Latest signal volume sits at ${latestTrend?.signalVolume ?? 0}, which reinforces current timing.`,
    productFocus: `${profile.productFocus} Pair this with the prospecting product story around ${productContext}.`,
    strategicDirection: profile.strategicDirection,
    marketPosition: profile.marketPosition,
    likelyPriorities: [
      ...profile.likelyPriorities,
      `Support ${args.persona.toLowerCase()} stakeholders with clearer account-level decision support.`,
    ],
    possiblePainPoints: profile.possiblePainPoints,
    recommendedGtmAngle: profile.recommendedGtmAngle,
    source: "deterministic",
  };
}
