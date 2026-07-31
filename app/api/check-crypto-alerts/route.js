import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

// Inicializa o Firebase Admin SDK...

// Inicializa o Firebase Admin SDK (usando as credenciais de ambiente do projeto)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: 'controle-de-gastos2', // Fixado direto para evitar falhas
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export async function GET(request) {
  try {
    // 1. Busca o preço atual da cripto (exemplo puxando da Coingecko ou API que você já usa)
    // Aqui você pode adaptar para a mesma API de preço que seu gráfico usa
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=axie-infinity&vs_currencies=brl');
    const data = await response.json();
    const currentPrice = data['axie-infinity']?.brl; // Exemplo para o Axie Infinity

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
      const upperAlert = parseFloat(userData.cryptoUpperAlert); // Valor limite superior cadastrado pelo usuário

      // Se o usuário tem token e definiu um alerta de teto
      if (fcmToken && !isNaN(upperAlert)) {
        // Se o preço atual for MAIOR ou IGUAL à meta do usuário
        if (currentPrice >= upperAlert) {
          
          // Prepara a mensagem Push para o Firebase Cloud Messaging
          const message = {
            token: fcmToken,
            notification: {
              title: `🚀 Meta Batida!`,
              body: `O preço atual da cripto atingiu R$ ${currentPrice} (Sua meta era R$ ${upperAlert}).`,
            },
            webpush: {
              fcmOptions: {
                link: 'https://card-flow-o9wl.vercel.app/dash board' // Link para abrir o seu site ao clicar
              }
            }
          };

          // Envia a notificação em segundo plano
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