import type { Metadata, Viewport } from "next";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aim Trainer",
  description: "Fast aim training with Quick Play, Survival, and Chaos modes.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon.png" },
};

export const viewport: Viewport = { themeColor: "#0b1220" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-[#0b1220] to-[#0f172a] font-sans text-[color:var(--text)]">
        <header className="border-b border-slate-800/70 bg-[color:var(--surface)]/70 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--surface)]/60">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <Image
              src="/icons/icon.png"
              alt="Aim Trainer"
              width={28}
              height={28}
              className="rounded"
            />
            <Link href="/" className="font-semibold tracking-wide">
              Aim Trainer
            </Link>
            <div className="ml-auto text-xs text-slate-400">Prototype</div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4 md:p-6">{children}</main>
      </body>
    </html>
  );
}
