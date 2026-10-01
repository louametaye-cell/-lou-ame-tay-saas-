import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Message d'erreur utilisateur officiel Lou Ame Tay
export const DEFAULT_USER_ERROR_MESSAGE = "Une erreur est survenue, l'équipe technique a été notifiée.";

export interface ApiLogEntry {
  method: string;
  endpoint: string;
  tenantId?: string | null;
  userId?: string | null;
  timestamp?: string;
  durationMs: number;
  statusCode: number;
  errorMessage?: string | null;
  metadata?: Record<string, any>;
}

// Chronomètre haute précision pour routes API
export function startTimer() {
  const start = performance.now();
  return {
    elapsedMs: () => Math.round((performance.now() - start) * 100) / 100,
  };
}

export function logPerformance(route: string, durationMs: number, extraInfo?: string) {
  const statusBadge = durationMs < 50 ? '⚡ FAST' : durationMs < 200 ? '✅ NORMAL' : '⚠️ SLOW';
  console.log(`[PERF] ${statusBadge} | ${route} -> ${durationMs}ms ${extraInfo ? `(${extraInfo})` : ''}`);
}

/**
 * Journalise un appel API de façon structurée et l'enregistre dans Supabase (table: api_logs) en production.
 */
export async function logApiCall(entry: ApiLogEntry): Promise<void> {
  const timestamp = entry.timestamp || new Date().toISOString();
  const duration = Math.round(entry.durationMs * 100) / 100;
  
  // Format console structuré pour observabilité immédiate
  const badge = entry.statusCode >= 500 ? '🛑 ERR500' : entry.statusCode >= 400 ? '⚠️ WARN' : '✅ OK';
  console.log(
    `[API_AUDIT] ${badge} | ${entry.method.toUpperCase()} ${entry.endpoint} | Status: ${entry.statusCode} | Durée: ${duration}ms` +
    (entry.tenantId ? ` | Tenant: ${entry.tenantId}` : '') +
    (entry.userId ? ` | User: ${entry.userId}` : '') +
    (entry.errorMessage ? ` | Erreur: ${entry.errorMessage}` : '')
  );

  // Enregistrement dans Supabase pour audit (table api_logs)
  // Non-bloquant pour ne jamais ralentir ou planter la réponse client
  try {
    const isProd = process.env.NODE_ENV === 'production' || process.env.ENABLE_SUPABASE_LOGS === 'true';
    if (isProd) {
      // Insérer de manière asynchrone non-bloquante
      Promise.resolve(
        supabase.from('api_logs').insert([
          {
            method: entry.method.toUpperCase(),
            endpoint: entry.endpoint,
            tenant_id: entry.tenantId || null,
            user_id: entry.userId || null,
            duration_ms: duration,
            status_code: entry.statusCode,
            error_message: entry.errorMessage || null,
            metadata: entry.metadata || {},
            created_at: timestamp,
          },
        ])
      ).catch((supaErr) => {
        // En cas d'absence de la table ou de refus RLS en prod, on journalise sans crasher
        console.warn('[logger] Supabase api_logs audit non-bloquant:', supaErr?.message || supaErr);
      });
    }
  } catch (err) {
    // Fail-safe silencieux
  }
}

/**
 * Génère une réponse HTTP 500 uniforme et journalisée avec le message clair requis :
 * "Une erreur est survenue, l'équipe technique a été notifiée."
 */
export function createApiErrorResponse(
  error: any,
  context: {
    method?: string;
    endpoint: string;
    tenantId?: string | null;
    userId?: string | null;
    durationMs?: number;
    metadata?: Record<string, any>;
  }
): NextResponse {
  const errMsg = error?.message || String(error);
  
  // Journalisation asynchrone de l'incident
  logApiCall({
    method: context.method || 'UNKNOWN',
    endpoint: context.endpoint,
    tenantId: context.tenantId || null,
    userId: context.userId || null,
    durationMs: context.durationMs || 0,
    statusCode: 500,
    errorMessage: errMsg,
    metadata: context.metadata,
  }).catch(() => {});

  return NextResponse.json(
    {
      success: false,
      error: DEFAULT_USER_ERROR_MESSAGE,
      // On n'expose jamais de stack trace technique au client en production
    },
    { status: 500 }
  );
}