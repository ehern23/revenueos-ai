import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "RevenueOS AI",
  description:
    "A multi-page revenue operations dashboard built with Next.js, Tailwind CSS, shadcn/ui, and Recharts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
