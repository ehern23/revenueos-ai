export type Account = {
  id: string;
  name: string;
  industry: string;
  employeeRange: string;
  region: string;
  opportunityScore: number;
  trendScore: number;
  hypothesis: string;
  recommendedPersona: string;
};

export type Signal = {
  id: string;
  accountId: string;
  title: string;
  category: string;
  summary: string;
  impact: "low" | "medium" | "high";
  detectedAt: string;
};

export type TrendPoint = {
  period: string;
  opportunityScore: number;
  trendScore: number;
  signalVolume: number;
};

export type Trend = {
  id: string;
  accountId: string;
  series: TrendPoint[];
};

export type Persona = {
  id: string;
  name: string;
  title: string;
  focus: string;
  buyingSignal: string;
  messagingAngle: string;
};

export type ActivityLogEntry = {
  id: string;
  accountId: string;
  type: string;
  detail: string;
  actor: string;
  timestamp: string;
};

export type OutreachHistoryEntry = {
  id: string;
  accountId: string;
  channel: "email" | "linkedin" | "call";
  subject: string;
  status: "sent" | "replied" | "drafted" | "scheduled";
  owner: string;
  timestamp: string;
};
