import { NextResponse } from 'next/server';
import { prisma, getDatabasePoolMetrics } from '@/lib/prisma';

// GET /api/health
// Endpoint public de surveillance de santé système et monitoring du pool de base de données
export async function GET() {
  try {
    const t0 = Date.now();
    let dbStatus = 'UP';
    let dbError = null;
    let tenantCount = 0;

    try {
      tenantCount = await prisma.tenant.count();
    } catch (err: any) {
      dbStatus = 'DOWN';
      dbError = err.message;
    }
    const dbLatencyMs = Date.now() - t0;

    const poolMetrics = await getDatabasePoolMetrics();

    const isHealthy = dbStatus === 'UP' && poolMetrics.status !== 'SATURATED';
    const httpStatus = isHealthy ? 200 : 503;

    return NextResponse.json(
      {
        status: isHealthy ? 'HEALTHY' : 'DEGRADED',
        timestamp: new Date().toISOString(),
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          tenantsCount: tenantCount,
          error: dbError,
        },
        connectionPool: {
          status: poolMetrics.status,
          saturationPercent: `${poolMetrics.poolSaturationPercent}%`,
          connectionsOpen: poolMetrics.connectionsOpen,
          connectionsBusy: poolMetrics.connectionsBusy,
          connectionsIdle: poolMetrics.connectionsIdle,
          queriesWaitingInQueue: poolMetrics.queriesWaiting,
          activeQueries: poolMetrics.activeQueries,
          maxConfiguredLimit: poolMetrics.maxConfiguredLimit,
          alertMessage:
            poolMetrics.status === 'SATURATED'
              ? 'ALERTE : Le pool de connexions est saturé. Des requêtes attendent en file d\'attente.'
              : poolMetrics.status === 'WARNING'
              ? 'ATTENTION : Le pool de connexions approche de sa capacité maximale.'
              : 'NORMAL : Pool de connexions opérationnel et fluide.',
        },
      },
      { status: httpStatus }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'CRITICAL',
        error: error.message || 'Erreur inattendue healthcheck',
      },
      { status: 500 }
    );
  }
}
