import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Utilisation de l'hôte Supabase Connection Pooler (IPv4) compatible Vercel Serverless
const defaultDbUrl =
  'postgresql://postgres.ghkxrrmxvhwoyodygohc:Digitalartswork%40mg2023@aws-0-eu-central-1.pooler.supabase.com:5432/postgres';

const envUrl = process.env.DATABASE_URL?.trim();

// Si DATABASE_URL pointe sur l'ancien hôte IPv6 direct db.ghkxrrmxvhwoyodygohc.supabase.co:5432, basculer sur le Pooler IPv4
const connectionUrl =
  envUrl && envUrl.startsWith('postgres') && !envUrl.includes('db.ghkxrrmxvhwoyodygohc.supabase.co')
    ? envUrl
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


