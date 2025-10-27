import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nara x Strava • Agent Chat Starter Kit",
  description:
    "Starter kit Next.js 14 com Strava OAuth, ingestão de atividades e chat IA via ChatKit.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="bg-slate-950 text-slate-100">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
