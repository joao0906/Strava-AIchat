import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createClient() {
  if (!process.env.DATABASE_URL) {
    const message =
      "DATABASE_URL não está configurada. Defina a variável para habilitar o Prisma.";

    if (process.env.NODE_ENV === "production") {
      console.error(message);
    }

    // Permitimos que o app suba sem banco, lançando um erro amigável
    // apenas quando algum método do client for chamado.
    return new Proxy(
      {},
      {
        get() {
          throw new Error(message);
        },
      },
    ) as PrismaClient;
  }

  return new PrismaClient({ log: ["warn", "error"] });
}

export const prisma = global.prisma ?? createClient();

if (process.env.NODE_ENV !== "production" && process.env.DATABASE_URL) {
  global.prisma = prisma;
}
