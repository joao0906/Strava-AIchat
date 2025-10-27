"use client";

import { useEffect } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";

export default function ChatPage() {
  const { control, setOptions } = useChatKit({
    api: {
      async getClientSecret(existing?: string) {
        const res = await fetch("/api/chatkit/session", {
          method: "POST",
          headers: existing ? { "X-ChatKit-Session": existing } : undefined,
        });
        const { client_secret } = await res.json();
        return client_secret as string;
      },
    },
  });

  useEffect(() => {
    setOptions({
      theme: {
        colorScheme: "dark",
        radius: "pill",
        density: "normal",
        typography: {
          baseSize: 16,
          fontFamily: "'JetBrains Mono', monospace",
          fontFamilyMono: "'JetBrains Mono', monospace",
          fontSources: [
            {
              family: "JetBrains Mono",
              style: "normal",
              weight: 300,
              display: "swap",
              src: "https://fonts.gstatic.com/s/jetbrainsmono/v23/tDbV2o-flEEny0FZhsfKu5WU4xD1OwGtT0rU3BE.woff2",
              unicodeRange:
                "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
            },
          ],
        },
      },
      composer: {
        attachments: { enabled: true, maxCount: 5, maxSize: 10 * 1024 * 1024 },
        tools: [
          {
            id: "search_docs",
            label: "Search docs",
            shortLabel: "Docs",
            placeholderOverride: "Search documentation",
            icon: "book-open",
            pinned: false,
          },
          {
            id: "analyze_runs",
            label: "Analisar corridas",
            shortLabel: "Runs",
            placeholderOverride: "Pergunte sobre pace/carga",
            icon: "activity",
            pinned: true,
          },
        ],
      },
      startScreen: {
        greeting: "Olá! Eu sou a Nara. Pergunte sobre seus treinos. 🐆",
        prompts: [
          { icon: "circle-question", label: "O que é o ChatKit?", prompt: "O que é o ChatKit?" },
          { icon: "bolt", label: "Carga semanal", prompt: "Qual minha carga de treino na semana?" },
          { icon: "chart-line", label: "Tendência de pace", prompt: "Minha tendência de ritmo nas últimas 6 semanas?" },
        ],
      },
    });
  }, [setOptions]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-6">
      <header>
        <h1 className="text-3xl font-semibold">Nara • Chat (ChatKit)</h1>
        <p className="mt-2 text-slate-300">
          Interface oficial do ChatKit já conectada ao fluxo do Agent Builder. Ajuste workflow e ferramentas
          para personalizar as respostas com dados do seu atleta.
        </p>
      </header>
      <ChatKit control={control} className="h-[640px] w-full" />
    </div>
  );
}
