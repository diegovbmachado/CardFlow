import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const email = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  return NextResponse.json({
    hasEmail: !!email,
    emailValue: email ? email.substring(0, 10) + "..." : "FALTANDO",
    hasPrivateKey: !!privateKey,
    privateKeyLength: privateKey ? privateKey.length : 0,
    privateKeyStart: privateKey ? privateKey.substring(0, 30) : "FALTANDO"
  });
}