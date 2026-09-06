import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const defaultDbUrl =
  'postgresql://postgres:Digitalartswork%40mg2023@db.ghkxrrmxvhwoyodygohc.supabase.co:5432/postgres';

const connectionUrl =
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim().startsWith('postgres')
    ? process.env.DATABASE_URL
    : defaultDbUrl;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

