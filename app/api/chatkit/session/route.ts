import { NextResponse } from "next/server";

export async function POST() {
  const res = await fetch("https://api.openai.com/v1/chatkit/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "OpenAI-Beta": "chatkit_beta=v1",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      workflow: { id: process.env.CHATKIT_WORKFLOW_ID },
      user: "sample-athlete", // personalize com o ID do atleta logado
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json({ error: "chatkit_session_failed", detail }, { status: 502 });
  }

  const json = await res.json();
  return NextResponse.json({ client_secret: json.client_secret });
}
