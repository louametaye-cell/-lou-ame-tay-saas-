import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    // Password requested in spec: "admin123"
    if (password === 'admin123') {
      return NextResponse.json({
        success: true,
        token: 'super_admin_session_token_valid',
      });
    }

    return NextResponse.json(
      { error: 'Mot de passe administrateur incorrect' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de l\'authentification' },
      { status: 500 }
    );
  }
}
