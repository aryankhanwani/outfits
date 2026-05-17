import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "OutfitAI — AI outfit studio",
  description: "Create polished try-on and outfit visuals from simple product photos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://cdn.wavespeed.ai" crossOrigin="anonymous" />
      </head>
      <body className="flex min-h-full flex-col text-zinc-900 antialiased dark:text-zinc-100">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
