import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { validateManagerPassword } from '@/lib/password-policy';
import { isAuthorizedTenantAdmin } from '@/lib/tenant-auth';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, currentPassword, newPassword } = body;

    if (!restaurantId || !newPassword) {
      return NextResponse.json(
        { error: 'Identifiant du restaurant et nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    const tenant = await (prisma as any).tenant.findUnique({
      where: { id: restaurantId },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Restaurant introuvable' },
        { status: 404 }
      );
    }

    // 🔒 Contrôle d'autorisation strict : seul le gérant de ce tenant ou le Super-Admin peut modifier ce mot de passe
    if (!isAuthorizedTenantAdmin(req, tenant.id, tenant.subdomain, restaurantId)) {
      return NextResponse.json(
        { error: 'Accès non autorisé : Session gérant invalide pour cet établissement.' },
        { status: 403 }
      );
    }

    // 🔒 Règle de complexité stricte (min 8 caractères, majuscule, chiffre, non trivial)
    const passwordValidation = validateManagerPassword(String(newPassword), tenant.subdomain);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Vérification de l'ancien mot de passe si le gérant l'a renseigné ou s'il a déjà un passwordHash
    if (tenant.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Veuillez renseigner votre mot de passe actuel' },
          { status: 400 }
        );
      }
      const isMatch = await bcrypt.compare(String(currentPassword).trim(), tenant.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'Le mot de passe actuel saisi est incorrect' },
          { status: 401 }
        );
      }
    }

    const hashedNewPassword = await bcrypt.hash(String(newPassword).trim(), 10);

    await (prisma as any).tenant.update({
      where: { id: restaurantId },
      data: {
        passwordHash: hashedNewPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Votre mot de passe a été modifié avec succès !',
    });
  } catch (error) {
    console.error('Erreur changement mot de passe restaurant:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du mot de passe' },
      { status: 500 }
    );
  }
}
