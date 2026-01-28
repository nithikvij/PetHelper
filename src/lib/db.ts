import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if we're in a build environment
const isBuildTime = process.env.NODE_ENV === "production" && !process.env.DATABASE_URL;

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const client = new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

// Create a mock PrismaClient for build time that won't throw on property access
function createBuildTimeMock(): PrismaClient {
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      if (prop === "then" || prop === "catch" || prop === "finally") {
        return undefined;
      }
      // Return a function that returns a proxy for chaining
      return (..._args: unknown[]) => {
        return new Proxy({}, handler);
      };
    },
    apply() {
      return new Proxy({}, handler);
    },
  };
  return new Proxy({}, handler) as PrismaClient;
}

// Export prisma client - use mock during build, real client at runtime
export const prisma: PrismaClient = isBuildTime
  ? createBuildTimeMock()
  : getPrismaClient();
