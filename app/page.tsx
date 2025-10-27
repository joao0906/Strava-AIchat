import Link from "next/link";

const checklist = [
  "OAuth com Strava + NextAuth",
  "Ingestão incremental + Webhooks",
  "Chat IA via ChatKit (Agent Builder)",
  "Prisma + PostgreSQL (Supabase ready)",
  "Digest semanal + notificações",
];

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-5xl">
      <header className="rounded-3xl border border-slate-800 bg-slate-900/50 p-10 shadow-2xl backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-sky-400">
          Nara x Strava
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
          Lance seu hub de treinos com IA e dados Strava em minutos.
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-slate-300">
          Este starter kit combina Next.js 14, Prisma, Supabase/Postgres, Strava OAuth e o novo ChatKit
          da OpenAI (Agent Builder) para entregar experiências de atleta com análises inteligentes,
          notificações e suporte conversacional.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-200">
          {checklist.map((item) => (
            <span key={item} className="rounded-full border border-sky-500/60 px-4 py-2">
              ✅ {item}
            </span>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/dashboard"
            className="rounded-full bg-sky-500 px-6 py-3 font-semibold text-slate-900 shadow-lg shadow-sky-500/40 transition hover:bg-sky-400"
          >
            Ir para o dashboard
          </Link>
          <Link
            href="/chat"
            className="rounded-full border border-slate-700 px-6 py-3 font-semibold text-slate-200 hover:border-slate-500"
          >
            Abrir o chat (ChatKit)
          </Link>
        </div>
      </header>

      <section>
        <h2 className="text-2xl font-semibold">Blueprint rápido</h2>
        <p className="mt-3 text-slate-300">
          O repositório já traz rotas API, schema Prisma e integrações essenciais para começar. Ajuste os
          workflows do Agent Builder, configure seu banco e personalize o design para seu produto.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h3 className="text-xl font-semibold text-sky-300">Strava OAuth + Ingestão</h3>
          <p className="mt-2 text-slate-300">
            Rotas `/api/strava/*` incluem connect, callback, webhook, refresh e ingest incremental. Basta
            definir as variáveis de ambiente e rodar os cron jobs para sincronizar atividades.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h3 className="text-xl font-semibold text-sky-300">Chat IA com ferramentas</h3>
          <p className="mt-2 text-slate-300">
            `/api/agent/chat` expõe ferramentas para ritmo, carga semanal e últimas atividades. O frontend
            usa ChatKit com tema customizado e suporte a anexos.
          </p>
        </article>
      </section>
    </main>
  );
}
