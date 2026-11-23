import type { Metadata } from "next";
import { Fraunces, Sora } from "next/font/google";
import "./globals.css";
import { getSetting, supabaseConfigured } from "@/lib/supabase";
import { DEFAULT_THEME, isThemeId } from "@/lib/themes";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const sora = Sora({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Glow Studio — Beauty Studio & Online Booking",
  description:
    "Glow Studio is a fictional beauty studio demo with online appointment booking. Facials, hair, nails and bridal trials — book in under a minute.",
};

export const dynamic = "force-dynamic";

/** The active theme lives in Supabase (site_settings.theme) so the owner
 *  can re-skin the whole site from the admin panel. Falls back to the
 *  default palette when the database is not connected yet. */
async function activeTheme(): Promise<string> {
  if (!supabaseConfigured()) return DEFAULT_THEME;
  try {
    const value = await getSetting("theme");
    return isThemeId(value) ? value : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const theme = await activeTheme();
  return (
    <html lang="en" data-theme={theme} className={`${fraunces.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
