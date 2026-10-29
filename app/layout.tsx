import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Sponsors from "@/components/Sponsors";

export const metadata: Metadata = {
  title: "ZombieSign",
  description: "A half-built e-signature app. Bring it back to life.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="zombie-bar">
          🧟 Zombie build: it half works. Read ZOMBIE.md for what to fix.
        </div>
        <nav className="nav">
          <Link href="/" className="brand">ZombieSign</Link>
          <Link href="/">Dashboard</Link>
          <Link href="/documents">Documents</Link>
          <Link href="/templates">Templates</Link>
          <Link href="/new">New document</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>
        <main>{children}</main>
        <Sponsors />
      </body>
    </html>
  );
}
