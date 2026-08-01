import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

function getDb() {
  if (!admin.apps || admin.apps.length === 0) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY 
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '') 
      : undefined;

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: 'controle-de-gastos2',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  }
  return admin.firestore();
}

export async function GET() {
  try {
    const db = getDb();

    // 1. Busca o preço atual da cripto
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=axie-infinity&vs_currencies=brl');
    const data = await response.json();
    const currentPrice = data['axie-infinity']?.brl;

    if (!currentPrice) {
      return NextResponse.json({ error: 'Não foi possível buscar o preço atual' }, { status: 500 });
    }

    // 2. Busca todas as configurações de usuários no Firestore
    const settingsSnapshot = await db.collection('user_settings').get();
    const notificationsSent = [];

    // 3. Varre cada usuário cadastrado no banco
    for (const docSnap of settingsSnapshot.docs) {
      const userData = docSnap.data();
      const fcmToken = userData.fcmToken;
      const upperAlert = parseFloat(userData.cryptoUpperAlert);

      if (fcmToken && !isNaN(upperAlert)) {
        if (currentPrice >= upperAlert) {
          const message = {
            token: fcmToken,
            notification: {
              title: `🚀 Meta Batida!`,
              body: `O preço atual da cripto atingiu R$ ${currentPrice} (Sua meta era R$ ${upperAlert}).`,
            },
            webpush: {
              fcmOptions: {
                link: 'https://card-flow-o9wl.vercel.app/dash board'
              }
            }
          };

          await admin.messaging().send(message);
          notificationsSent.push({ userId: docSnap.id, price: currentPrice });
        }
      }
    }

    return NextResponse.json({ success: true, currentPrice, notificationsSent });
  } catch (error) {
    console.error('Erro ao processar alertas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}