import type { Metadata } from "next";
import { Manrope, DM_Sans } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://try.sparkagent.in.net"),
  title: "SparkAgent — Sign in to your AI workspace",
  description: "Sign in or create your SparkAgent account to start working with your AI assistant for conversations, document analysis, and automated workflows.",
  icons: { icon: "/favicon.ico" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className={`${manrope.variable} ${dmSans.variable}`}><body className="min-h-screen bg-base font-body text-ink antialiased">{children}</body></html>);
}
