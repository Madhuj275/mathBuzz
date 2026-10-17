import type { Metadata } from "next";
import { Geist_Mono, Press_Start_2P, VT323 } from "next/font/google";
import { Providers } from "@/providers/providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const vt323 = VT323({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const ps2 = Press_Start_2P({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-press-start",
});

export const metadata: Metadata = {
  title: "Mathbuzz Daily Challenge",
  description:
    "Daily math puzzle game with XP, levels, streaks, badges, and weekly leaderboards.",
  openGraph: {
    title: "Mathbuzz Daily Challenge",
    description:
      "Daily math puzzle game with XP, levels, streaks, badges, and weekly leaderboards.",
    url: "/",
    siteName: "Mathbuzz Daily Challenge",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "font-sans",
        vt323.variable,
        geistMono.variable,
        ps2.variable,
      )}
    >
      <body className="antialiased">
        {/* CRT overlay — always on top, never blocks interaction */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[200] overflow-hidden"
        >
          <div className="crt-scanlines absolute inset-0" />
          <div className="crt-vignette absolute inset-0" />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
