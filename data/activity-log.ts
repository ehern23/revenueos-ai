import type { ActivityLogEntry } from "@/data/types";

export const activityLog: ActivityLogEntry[] = [
  {
    id: "activity-001",
    accountId: "stripe",
    type: "signal_reviewed",
    detail: "AI infrastructure launch signal marked as high-priority for follow-up.",
    actor: "RevenueOS AI",
    timestamp: "2026-03-10T09:15:00Z",
  },
  {
    id: "activity-002",
    accountId: "ramp",
    type: "account_scored",
    detail: "Opportunity score updated after new hiring signal and persona alignment.",
    actor: "System",
    timestamp: "2026-03-10T11:30:00Z",
  },
  {
    id: "activity-003",
    accountId: "databricks",
    type: "hypothesis_created",
    detail: "Created enterprise adoption hypothesis for strategic outbound sequence.",
    actor: "Avery Morgan",
    timestamp: "2026-03-11T14:05:00Z",
  },
  {
    id: "activity-004",
    accountId: "openai",
    type: "persona_recommended",
    detail: "Recommended enterprise expansion persona attached to account record.",
    actor: "RevenueOS AI",
    timestamp: "2026-03-11T16:20:00Z",
  },
  {
    id: "activity-005",
    accountId: "brex",
    type: "weekly_plan_updated",
    detail: "Brex added to this week's pipeline plan due to infrastructure expansion signal.",
    actor: "Jordan Lee",
    timestamp: "2026-03-12T08:40:00Z",
  },
  {
    id: "activity-006",
    accountId: "scale-ai",
    type: "simulation_run",
    detail: "Territory attack simulation run for enterprise and public sector expansion path.",
    actor: "RevenueOS AI",
    timestamp: "2026-03-12T17:10:00Z",
  },
];
