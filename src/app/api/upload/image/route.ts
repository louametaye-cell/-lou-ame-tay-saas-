import { NextResponse } from 'next/server';
import { uploadImageToCloud } from '@/lib/cloud-storage';

// POST /api/upload/image
// Upload sécurisé d'image de plat ou de logo avec transformation WebP
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'louametay/dishes';

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier transmis' }, { status: 400 });
    }

    // Validation du type MIME
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Format non supporté. Veuillez envoyer un fichier JPG, PNG ou WebP.' }, { status: 400 });
    }

    // Validation de la taille (< 5 Mo)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Taille maximale dépassée (Max: 5 Mo)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImageToCloud(buffer, file.name, folder);

    return NextResponse.json({
      success: true,
      image: result,
      message: 'Photo uploadée et optimisée en WebP sur le CDN avec succès !',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de l\'upload de l\'image' }, { status: 500 });
  }
}
