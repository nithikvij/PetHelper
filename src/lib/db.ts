import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // During build time, DATABASE_URL might not be available
  // Return a proxy that defers errors until actual database operations
  if (!process.env.DATABASE_URL && !process.env.DATABASE_PUBLIC_URL) {
    // Create a deep proxy that allows property access but throws on method calls
    const createDeepProxy = (): unknown => {
      return new Proxy(() => {}, {
        get(_, prop) {
          // These properties should return undefined to avoid issues
          if (prop === "then" || prop === "catch" || prop === "finally") {
            return undefined;
          }
          // Return another proxy for chained property access
          return createDeepProxy();
        },
        apply() {
          throw new Error(
            "Database is not available. Please ensure DATABASE_URL is set."
          );
        },
      });
    };
    return createDeepProxy() as PrismaClient;
  }
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production" && process.env.DATABASE_URL) {
  globalForPrisma.prisma = prisma as PrismaClient;
}
