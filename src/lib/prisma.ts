import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Supabase Transaction Pooler (port 6543) avec PgBouncer en mode Transaction :
// Permet de supporter des dizaines de connexions concurrentes simultanées sans saturer le pool session (EMAXCONNSESSION).
const defaultDbUrl =
  'postgresql://postgres.ghkxrrmxvhwoyodygohc:Digitalartswork%40mg2023@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=20';

const envUrl = process.env.DATABASE_URL?.trim();

// Si DATABASE_URL pointe sur l'ancien hôte direct ou session, basculer sur le Transaction Pooler 6543
let connectionUrl =
  envUrl && envUrl.startsWith('postgres') && !envUrl.includes('db.ghkxrrmxvhwoyodygohc.supabase.co')
    ? envUrl
    : defaultDbUrl;

// Si l'URL utilise le pooler (6543 ou 5432), s'assurer que pgbouncer et connection_limit sont présents
if (connectionUrl.includes('6543') && !connectionUrl.includes('pgbouncer=true')) {
  connectionUrl += connectionUrl.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true';
}

if (!connectionUrl.includes('connection_limit')) {
  const limit = connectionUrl.includes('6543') ? 10 : 3;
  connectionUrl += connectionUrl.includes('?') ? `&connection_limit=${limit}&pool_timeout=20` : `?connection_limit=${limit}&pool_timeout=20`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl,
      },
    },
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

// Surveillance proactive et logging d'alerte en cas de tension sur le pool de connexions
// @ts-ignore Prisma event emitter typing
prisma.$on('warn', (e: { message: string; timestamp: Date }) => {
  if (e.message?.toLowerCase().includes('pool') || e.message?.toLowerCase().includes('connection')) {
    console.warn(`⚠️ [DB_POOL_WARNING] ${new Date().toISOString()} :`, e.message);
  }
});

// @ts-ignore Prisma event emitter typing
prisma.$on('error', (e: { message: string; timestamp: Date }) => {
  if (
    e.message?.includes('EMAXCONNSESSION') ||
    e.message?.includes('Timed out fetching a connection') ||
    e.message?.includes('pool')
  ) {
    console.error(`🚨 [CRITICAL_DB_POOL_ALERT] Risque de saturation du pool de base de données :`, e.message);
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export interface PoolMetrics {
  status: 'HEALTHY' | 'WARNING' | 'SATURATED';
  connectionsOpen: number;
  connectionsBusy: number;
  connectionsIdle: number;
  queriesWaiting: number;
  activeQueries: number;
  poolSaturationPercent: number;
  maxConfiguredLimit: number;
}

/**
 * Retourne l'état de saturation en temps réel du pool de connexions Prisma
 */
export async function getDatabasePoolMetrics(): Promise<PoolMetrics> {
  const maxLimit = connectionUrl.includes('connection_limit=')
    ? parseInt(connectionUrl.split('connection_limit=')[1].split('&')[0], 10) || 10
    : 10;

  try {
    const raw = await prisma.$metrics.json();
    const gauges = raw.gauges || [];

    const getVal = (k: string) => gauges.find((g: any) => g.key === k)?.value ?? 0;

    const connectionsOpen = getVal('prisma_pool_connections_open');
    const connectionsBusy = getVal('prisma_pool_connections_busy');
    const connectionsIdle = getVal('prisma_pool_connections_idle');
    const queriesWaiting = getVal('prisma_client_queries_wait');
    const activeQueries = getVal('prisma_client_queries_active');

    const poolSaturationPercent = maxLimit > 0 ? Math.round((connectionsBusy / maxLimit) * 100) : 0;

    let status: 'HEALTHY' | 'WARNING' | 'SATURATED' = 'HEALTHY';
    if (queriesWaiting > 0 || poolSaturationPercent >= 90) {
      status = 'SATURATED';
    } else if (poolSaturationPercent >= 70) {
      status = 'WARNING';
    }

    return {
      status,
      connectionsOpen,
      connectionsBusy,
      connectionsIdle,
      queriesWaiting,
      activeQueries,
      poolSaturationPercent,
      maxConfiguredLimit: maxLimit,
    };
  } catch {
    return {
      status: 'HEALTHY',
      connectionsOpen: 0,
      connectionsBusy: 0,
      connectionsIdle: 0,
      queriesWaiting: 0,
      activeQueries: 0,
      poolSaturationPercent: 0,
      maxConfiguredLimit: maxLimit,
    };
  }
}



