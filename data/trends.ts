import type { Trend } from "@/data/types";

export const trends: Trend[] = [
  {
    id: "trend-ramp",
    accountId: "ramp",
    series: [
      { period: "Jan", opportunityScore: 78, trendScore: 74, signalVolume: 4 },
      { period: "Feb", opportunityScore: 84, trendScore: 81, signalVolume: 6 },
      { period: "Mar", opportunityScore: 92, trendScore: 88, signalVolume: 8 },
    ],
  },
  {
    id: "trend-stripe",
    accountId: "stripe",
    series: [
      { period: "Jan", opportunityScore: 86, trendScore: 84, signalVolume: 5 },
      { period: "Feb", opportunityScore: 91, trendScore: 90, signalVolume: 7 },
      { period: "Mar", opportunityScore: 95, trendScore: 94, signalVolume: 9 },
    ],
  },
  {
    id: "trend-snowflake",
    accountId: "snowflake",
    series: [
      { period: "Jan", opportunityScore: 80, trendScore: 82, signalVolume: 4 },
      { period: "Feb", opportunityScore: 84, trendScore: 87, signalVolume: 5 },
      { period: "Mar", opportunityScore: 89, trendScore: 91, signalVolume: 7 },
    ],
  },
  {
    id: "trend-databricks",
    accountId: "databricks",
    series: [
      { period: "Jan", opportunityScore: 85, trendScore: 88, signalVolume: 5 },
      { period: "Feb", opportunityScore: 89, trendScore: 92, signalVolume: 7 },
      { period: "Mar", opportunityScore: 94, trendScore: 96, signalVolume: 10 },
    ],
  },
  {
    id: "trend-brex",
    accountId: "brex",
    series: [
      { period: "Jan", opportunityScore: 72, trendScore: 70, signalVolume: 3 },
      { period: "Feb", opportunityScore: 78, trendScore: 76, signalVolume: 5 },
      { period: "Mar", opportunityScore: 84, trendScore: 82, signalVolume: 6 },
    ],
  },
  {
    id: "trend-mercury",
    accountId: "mercury",
    series: [
      { period: "Jan", opportunityScore: 68, trendScore: 66, signalVolume: 2 },
      { period: "Feb", opportunityScore: 74, trendScore: 72, signalVolume: 4 },
      { period: "Mar", opportunityScore: 81, trendScore: 79, signalVolume: 5 },
    ],
  },
  {
    id: "trend-plaid",
    accountId: "plaid",
    series: [
      { period: "Jan", opportunityScore: 76, trendScore: 75, signalVolume: 3 },
      { period: "Feb", opportunityScore: 81, trendScore: 80, signalVolume: 5 },
      { period: "Mar", opportunityScore: 86, trendScore: 85, signalVolume: 6 },
    ],
  },
  {
    id: "trend-modern-treasury",
    accountId: "modern-treasury",
    series: [
      { period: "Jan", opportunityScore: 65, trendScore: 64, signalVolume: 2 },
      { period: "Feb", opportunityScore: 71, trendScore: 69, signalVolume: 3 },
      { period: "Mar", opportunityScore: 78, trendScore: 76, signalVolume: 4 },
    ],
  },
  {
    id: "trend-scale-ai",
    accountId: "scale-ai",
    series: [
      { period: "Jan", opportunityScore: 82, trendScore: 84, signalVolume: 4 },
      { period: "Feb", opportunityScore: 87, trendScore: 89, signalVolume: 6 },
      { period: "Mar", opportunityScore: 90, trendScore: 93, signalVolume: 8 },
    ],
  },
  {
    id: "trend-openai",
    accountId: "openai",
    series: [
      { period: "Jan", opportunityScore: 90, trendScore: 91, signalVolume: 6 },
      { period: "Feb", opportunityScore: 94, trendScore: 95, signalVolume: 8 },
      { period: "Mar", opportunityScore: 97, trendScore: 98, signalVolume: 11 },
    ],
  },
];
