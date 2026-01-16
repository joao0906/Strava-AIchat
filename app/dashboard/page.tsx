import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-5xl">
      <header>
        <h1 className="text-3xl font-semibold">Dashboard do atleta</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Esta área combina dados sincronizados do Strava com análises derivadas armazenadas via Prisma.
          Adapte para seus gráficos favoritos (Recharts, Tremor, Nivo) e conecte notificações semanais.
        </p>
      </header>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-xl font-semibold text-sky-300">Próximos passos</h2>
          <ol className="mt-4 space-y-2 text-sm text-slate-200">
            <li>1. Conecte-se ao Strava via <code>/api/strava/connect</code>.</li>
            <li>2. Rode cron jobs para `/api/ingest/activities` e `/api/analyze/digest`.</li>
            <li>3. Renderize métricas com dados de `Activity`, `Lap`, `Split` e `MetricsDerivados`.</li>
          </ol>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-xl font-semibold text-sky-300">Chat inteligente</h2>
          <p className="mt-2 text-slate-300">
            Combine a página de dashboard com o chat (<Link href="/chat" className="text-sky-400">/chat</Link>)
            para um copiloto atlético que responde dúvidas e gera recomendações acionáveis.
          </p>
        </article>
      </section>
    </main>
  );
}
