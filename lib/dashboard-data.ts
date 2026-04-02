export type Metric = {
  label: string;
  value: string;
  change: string;
  context: string;
  trend: "up" | "down";
};

export const overviewMetrics: Metric[] = [
  {
    label: "Net new ARR",
    value: "$1.84M",
    change: "+12.4%",
    context: "vs. last month",
    trend: "up",
  },
  {
    label: "Qualified pipeline",
    value: "$8.6M",
    change: "+18.1%",
    context: "4.7x coverage",
    trend: "up",
  },
  {
    label: "Expansion rate",
    value: "126%",
    change: "+7.2%",
    context: "gross dollar retention",
    trend: "up",
  },
  {
    label: "Forecast risk",
    value: "9.3%",
    change: "-2.1%",
    context: "late-stage slippage",
    trend: "down",
  },
];

export const analyticsMetrics: Metric[] = [
  {
    label: "Win rate",
    value: "34.8%",
    change: "+4.6%",
    context: "quarter to date",
    trend: "up",
  },
  {
    label: "Sales velocity",
    value: "42 days",
    change: "-6 days",
    context: "median cycle",
    trend: "up",
  },
  {
    label: "CAC payback",
    value: "11.2 mo",
    change: "-1.4 mo",
    context: "blended acquisition",
    trend: "up",
  },
];

export const revenueSeries = [
  { month: "Jan", actual: 240, target: 220 },
  { month: "Feb", actual: 300, target: 260 },
  { month: "Mar", actual: 365, target: 310 },
  { month: "Apr", actual: 390, target: 350 },
  { month: "May", actual: 448, target: 380 },
  { month: "Jun", actual: 520, target: 430 },
  { month: "Jul", actual: 610, target: 500 },
];

export const focusAreas = [
  {
    title: "Expansion plays in strategic accounts",
    impact: "$420k upside",
    description:
      "Three accounts show strong product adoption and stakeholder growth. Prioritize pricing workshops and executive sponsorship.",
  },
  {
    title: "Late-stage deal support",
    impact: "5 deals at risk",
    description:
      "Security review delays are the main blocker. Create a shared escalation lane between sales engineering and legal.",
  },
  {
    title: "Champion onboarding nudges",
    impact: "2.1x activation",
    description:
      "New admins that complete setup in seven days are far more likely to convert into multi-team rollouts.",
  },
];

export const analyticsHighlights = [
  {
    title: "Healthcare outbound is outperforming",
    delta: "+29%",
    note: "Conversion rates improved after pairing vertical messaging with compliance-led demos.",
  },
  {
    title: "Paid search efficiency rebounded",
    delta: "+14%",
    note: "High-intent keyword groups are generating higher-value opportunities with lower blended CAC.",
  },
  {
    title: "Renewal saves are compounding",
    delta: "+11%",
    note: "Targeted health checks reduced contraction risk in the mid-market portfolio.",
  },
];

export const channelPerformance = [
  {
    channel: "Outbound",
    revenue: "$612k",
    change: "+18%",
    quality: "High",
    summary: "Enterprise targeting is creating bigger initial land deals.",
  },
  {
    channel: "Partnerships",
    revenue: "$488k",
    change: "+9%",
    quality: "Strong",
    summary: "Referral quality remains stable with better multi-threading in discovery.",
  },
  {
    channel: "Product-led",
    revenue: "$356k",
    change: "+23%",
    quality: "Rising",
    summary:
      "Usage-triggered outreach is converting active workspaces into paid expansions.",
  },
];

export const pipelineStages = [
  {
    name: "Discovery",
    deals: 24,
    value: "$2.1M",
    progress: 64,
    change: "+8%",
    summary:
      "Healthy top-of-funnel intake with stronger qualification discipline.",
  },
  {
    name: "Evaluation",
    deals: 17,
    value: "$2.9M",
    progress: 72,
    change: "+15%",
    summary: "Buyer engagement is rising after tailoring proof-of-value plans.",
  },
  {
    name: "Proposal",
    deals: 11,
    value: "$1.8M",
    progress: 59,
    change: "+6%",
    summary: "Procurement timing is the main source of drag heading into quarter end.",
  },
  {
    name: "Commit",
    deals: 8,
    value: "$1.6M",
    progress: 81,
    change: "+12%",
    summary:
      "Executive involvement is helping unblock legal and security reviews.",
  },
];

export const deals = [
  {
    account: "Northstar Health",
    owner: "Maya Chen",
    stage: "Proposal",
    arr: "$180k",
    closeDate: "Mar 28",
    confidence: "82%",
  },
  {
    account: "LatticeWorks",
    owner: "Jordan Kim",
    stage: "Commit",
    arr: "$240k",
    closeDate: "Apr 02",
    confidence: "91%",
  },
  {
    account: "SummitGrid",
    owner: "Alex Rivera",
    stage: "Evaluation",
    arr: "$135k",
    closeDate: "Apr 11",
    confidence: "68%",
  },
  {
    account: "Praxis Bio",
    owner: "Nina Shah",
    stage: "Discovery",
    arr: "$95k",
    closeDate: "Apr 18",
    confidence: "54%",
  },
];

export const customerSegments = [
  {
    name: "Enterprise champions",
    count: "32",
    value: "$4.2M ARR",
    change: "+16% expansion",
    summary:
      "High adoption, strong stakeholder depth, and active expansion opportunities.",
  },
  {
    name: "Growth accounts",
    count: "58",
    value: "$2.8M ARR",
    change: "+9% retention",
    summary:
      "Healthy product engagement with room to increase cross-functional usage.",
  },
  {
    name: "At-risk renewals",
    count: "14",
    value: "$740k ARR",
    change: "-3% health score",
    summary:
      "Monitor support responsiveness, seat utilization, and executive alignment.",
  },
];

export const strategicAccounts = [
  {
    initials: "NH",
    name: "Northstar Health",
    owner: "Owner: Maya Chen",
    stage: "Expansion",
    arr: "$620k",
    renewal: "Jun 30",
    health: "Strong",
    nextStep:
      "Schedule an executive roadmap review and align procurement on a two-year expansion path.",
  },
  {
    initials: "LW",
    name: "LatticeWorks",
    owner: "Owner: Jordan Kim",
    stage: "Renewal",
    arr: "$410k",
    renewal: "May 12",
    health: "Stable",
    nextStep:
      "Package adoption wins into a renewal business case and add services upsell options.",
  },
  {
    initials: "SB",
    name: "SummitGrid",
    owner: "Owner: Alex Rivera",
    stage: "Onboarding",
    arr: "$185k",
    renewal: "Aug 18",
    health: "Rising",
    nextStep:
      "Accelerate activation with a champion workshop and set weekly launch checkpoints.",
  },
  {
    initials: "PB",
    name: "Praxis Bio",
    owner: "Owner: Nina Shah",
    stage: "Risk watch",
    arr: "$128k",
    renewal: "Apr 29",
    health: "Needs attention",
    nextStep:
      "Escalate support issues, re-engage the sponsor, and confirm success plan milestones.",
  },
];
