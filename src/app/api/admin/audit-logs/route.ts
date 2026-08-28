import { NextResponse } from 'next/server';
import { getAllAuditLogs, recordAuditLog } from '@/lib/audit-logger';

// GET /api/admin/audit-logs
// Récupère l'historique complet des actions administratives
export async function GET() {
  try {
    const logs = getAllAuditLogs();
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération journal d\'audit' }, { status: 500 });
  }
}

// POST /api/admin/audit-logs
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = recordAuditLog(body);
    return NextResponse.json({ success: true, log: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur écriture audit log' }, { status: 500 });
  }
}
