import { redirect } from "next/navigation";

import { defaultAppHref } from "@/lib/app-navigation";

export default function DashboardIndexPage() {
  redirect(defaultAppHref);
}
