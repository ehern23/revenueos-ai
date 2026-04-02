export type AppNavigationItem = {
  href: string;
  label: string;
  description: string;
  purpose: string;
};

export const defaultAppHref = "/revenue-command-center";

export const appNavigation: AppNavigationItem[] = [
  {
    href: "/prospecting-copilot",
    label: "Prospecting Copilot",
    description: "AI-guided lead discovery and outreach preparation.",
    purpose:
      "This workspace will help sellers identify strong-fit prospects, personalize outreach, and prioritize who to contact next.",
  },
  {
    href: "/revenue-command-center",
    label: "Revenue Command Center",
    description: "A single operating view for revenue performance and risk.",
    purpose:
      "This workspace will surface the core metrics, alerts, and actions leadership needs to manage pipeline, forecast health, and team momentum.",
  },
  {
    href: "/territory-strategist",
    label: "Territory Strategist",
    description: "Coverage planning for regions, segments, and capacity.",
    purpose:
      "This workspace will help teams shape territory plans, balance account coverage, and identify whitespace for the next selling cycle.",
  },
  {
    href: "/account-intelligence",
    label: "Account Intelligence",
    description: "A research hub for buying signals and account context.",
    purpose:
      "This workspace will organize account insights, stakeholder context, and expansion signals so reps can prepare with confidence.",
  },
  {
    href: "/weekly-pipeline-plan",
    label: "Weekly Pipeline Plan",
    description: "Structured weekly execution planning for active deals.",
    purpose:
      "This workspace will turn pipeline reviews into a clear weekly action plan with owners, milestones, and follow-ups.",
  },
  {
    href: "/sales-ai-assistant",
    label: "Sales AI Assistant",
    description: "An always-on assistant for sales questions and tasks.",
    purpose:
      "This workspace will support reps with quick answers, messaging help, deal strategy suggestions, and day-to-day sales execution.",
  },
  {
    href: "/autonomous-mode",
    label: "Autonomous Mode",
    description: "Automated workflows and AI-driven operating loops.",
    purpose:
      "This workspace will coordinate high-confidence automations, recommended actions, and guardrailed AI workflows across the revenue team.",
  },
  {
    href: "/territory-attack-simulation",
    label: "Territory Attack Simulation",
    description: "Scenario modeling for competitive territory strategies.",
    purpose:
      "This workspace will simulate attack plans, test strategic bets, and show how different moves could affect pipeline creation and coverage.",
  },
];
