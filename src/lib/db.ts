import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  // Prisma 7 requires using a driver adapter
  const adapter = new PrismaPg({
    connectionString: databaseUrl,
    // For Railway/cloud PostgreSQL that may have SSL issues
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });

  const client = new PrismaClient({ adapter });

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

// Check if we're in a build environment (no DATABASE_URL available)
const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
const isBuildTime = !databaseUrl;

// Export prisma client - use mock during build, real client at runtime
export const prisma: PrismaClient = isBuildTime
  ? createBuildTimeMock()
  : getPrismaClient();
