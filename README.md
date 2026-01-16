# Nara x Strava — Agent Chat Starter Kit

Blueprint completo em Next.js 14 com App Router, Prisma e ChatKit para lançar um hub de treinos que:

- Faz OAuth com o Strava e sincroniza atividades (webhook + ingestão incremental).
- Expõe um dashboard base para atletas com dados prontos para gráficos.
- Oferece chat com IA usando o Agent Builder + ChatKit (frontend pronto).
- Calcula digest semanal e prepara envio de notificações (Resend/Web Push/Telegram opcionais).

## Stack

- Next.js 14 (App Router, TypeScript)
- Prisma + PostgreSQL (Supabase ready)
- NextAuth (Strava OAuth + Credentials dev login)
- OpenAI Agent Builder + ChatKit

## Pré-requisitos

- Node.js 18+
- Conta Strava Developer com credenciais OAuth e webhook configurado
- Banco PostgreSQL (recomendado: Supabase)
- Chave da OpenAI com acesso ao Agent Builder / ChatKit

## Configuração

1. Clone o projeto e instale dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env.local` e preencha as variáveis:

   ```bash
   cp .env.example .env.local
   ```

3. Execute as migrações Prisma:

   ```bash
   npx prisma migrate dev
   ```

4. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

## Fluxos principais

### Autenticação

- `GET /api/strava/connect` inicia OAuth no Strava.
- `GET /api/strava/callback` recebe `code`, troca por tokens e salva no banco.
- `POST /api/strava/refresh-token` atualiza tokens (use em cron).
- `app/api/auth/[...nextauth]` implementa NextAuth com adapter Prisma.

### Ingestão e Webhooks

- `GET /api/strava/webhook` valida assinatura do webhook do Strava.
- `POST /api/strava/webhook` registra eventos recebidos.
- `POST /api/ingest/activities` busca atividades detalhadas, salva Activity/Lap/Split e métricas derivadas.

### Chat IA (ChatKit)

- `POST /api/chatkit/session` cria/renova sessão com ChatKit (Agent Builder).
- `POST /api/agent/chat` implementa ferramentas de dados esportivos (pace, carga semanal, últimas corridas).
- `app/chat/page.tsx` embed oficial ChatKit com tema customizado e atalhos.

### Digest semanal

- `POST /api/analyze/digest` calcula totais da última semana por atleta e retorna payload base para notificações.

## Estrutura de diretórios

```
app/
  (marketing)/
  dashboard/
  chat/
  api/
lib/
prisma/
components/
```

- `lib/strava.ts` concentra helpers de API e refresh de tokens.
- `lib/authOptions.ts` expõe a configuração NextAuth.
- `prisma/schema.prisma` define usuários, atletas, atividades, splits/laps, notificações e eventos de webhook.

## Próximos passos sugeridos

- Conectar gráficos reais no dashboard (Recharts, Tremor, Grafana embutido etc.).
- Substituir roteamento heurístico do `/api/agent/chat` por function calling com OpenAI.
- Integrar Resend/Web Push/Telegram na rota de digest.
- Implementar storage para anexos do ChatKit (S3, Supabase Storage).

## Scripts úteis

- `npm run dev` — inicia Next.js em modo desenvolvimento.
- `npm run build` — build de produção.
- `npm run prisma:migrate` — executa novas migrações.
- `npm run prisma:generate` — gera cliente Prisma.

Boas construções! 🐆
