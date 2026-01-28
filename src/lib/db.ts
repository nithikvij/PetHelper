/* eslint-disable @typescript-eslint/no-explicit-any */
let prismaInstance: any = null;

function createPrismaClient() {
  // Only import and create PrismaClient when actually needed
  const { PrismaClient } = require("@prisma/client");
  return new PrismaClient();
}

// Use a getter pattern to defer initialization
export const prisma = new Proxy({} as any, {
  get(_target, prop) {
    // Lazy initialize prisma client on first actual use
    if (!prismaInstance) {
      const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;

      if (!databaseUrl) {
        // Return a no-op proxy during build time
        return new Proxy(() => {}, {
          get() { return this; },
          apply() {
            return Promise.resolve(null);
          }
        });
      }

      prismaInstance = createPrismaClient();

      // Cache in globalThis for development
      if (process.env.NODE_ENV !== "production") {
        (globalThis as any).__prisma = prismaInstance;
      }
    }

    return prismaInstance[prop];
  }
});

// Restore cached instance in development
if (process.env.NODE_ENV !== "production" && (globalThis as any).__prisma) {
  prismaInstance = (globalThis as any).__prisma;
}
