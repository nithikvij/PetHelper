import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // During build time, DATABASE_URL might not be available
  // Return a proxy that will throw helpful errors if used during build
  if (!process.env.DATABASE_URL && !process.env.DATABASE_PUBLIC_URL) {
    // Return a dummy client during build that throws on access
    return new Proxy({} as PrismaClient, {
      get(_, prop) {
        if (prop === "then") return undefined; // Not a promise
        throw new Error(
          `Database not available during build. Attempted to access prisma.${String(prop)}`
        );
      },
    });
  }
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production" && process.env.DATABASE_URL) {
  globalForPrisma.prisma = prisma as PrismaClient;
}
