import { cookies, headers } from 'next/headers';
import { isAuthorizedSuperAdmin, verifyAdminToken } from '@/lib/admin-auth';

export interface AuthSessionUser {
  id: string;
  role: 'SUPER_ADMIN' | 'RESTAURANT_ADMIN' | 'KITCHEN_STAFF' | 'CASHIER' | 'CUSTOMER';
  name?: string;
  email?: string;
}

export interface AuthSession {
  user: AuthSessionUser;
}

/**
 * Récupère la session d'authentification actuelle.
 * Vérifie le rôle SUPER_ADMIN via token signé HMAC, cookie HttpOnly ou en-tête d'autorisation.
 */
export async function getAuthSession(req?: Request): Promise<AuthSession | null> {
  // 1. Si un objet Request est fourni directement
  if (req) {
    if (isAuthorizedSuperAdmin(req)) {
      return {
        user: {
          id: 'super-admin-root',
          role: 'SUPER_ADMIN',
          name: 'Super Administrateur DAW',
        },
      };
    }
  }

  // 2. Vérification côté serveur via next/headers
  try {
    const nextHeaders = headers();
    const authHeader = nextHeaders.get('authorization');
    const customHeader = nextHeaders.get('x-superadmin-token');

    let token = customHeader;
    if (!token && authHeader?.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '').trim();
    }

    if (token && verifyAdminToken(token)) {
      return {
        user: {
          id: 'super-admin-root',
          role: 'SUPER_ADMIN',
          name: 'Super Administrateur DAW',
        },
      };
    }

    // Vérifier le cookie Next.js
    const cookieStore = cookies();
    const cookieToken = cookieStore.get('superadmin_token')?.value;
    if (cookieToken && verifyAdminToken(decodeURIComponent(cookieToken))) {
      return {
        user: {
          id: 'super-admin-root',
          role: 'SUPER_ADMIN',
          name: 'Super Administrateur DAW',
        },
      };
    }
  } catch {
    // Si appelé hors contexte SSR / route handler
  }

  // Rétrocompatibilité dev locale si token dev
  if (process.env.NODE_ENV !== 'production' && req) {
    const token = req.headers.get('x-superadmin-token') || req.headers.get('authorization');
    if (token?.includes('admin_authorized_token')) {
      return {
        user: {
          id: 'super-admin-dev',
          role: 'SUPER_ADMIN',
          name: 'Super Admin Dev',
        },
      };
    }
  }

  return null;
}
