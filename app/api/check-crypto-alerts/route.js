import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// Força o comportamento dinâmico da rota no Next.js (evita cache estático nas requisições)
export const dynamic = 'force-dynamic';

/**
 * Inicializa a instância do Firebase Admin SDK com credenciais de serviço privadas.
 * Garante que múltiplos apps não sejam inicializados simultaneamente no servidor.
 */
function getFirebaseAdmin() {
  const apps = getApps();
  if (!apps.length) {
    return initializeApp({
      credential: cert({
        projectId: 'controle-de-gastos2',
        clientEmail: 'firebase-adminsdk-73pps@controle-de-gastos2.iam.gserviceaccount.com',
        privateKey: `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCaWU5+vlbFsIXK\nNr2DCQ5UTxhUhcq7+oTzmyYtb7kF/Jr8nfM9WjIH4cUhm8uaRyXq1boPZeIurrCj\n8uNLCYRTYnkgj7UiklRCxlWKOIWoZRPsYbQl0pvOe83nrvMHrmG8JWoeDwCllsJG\noupjKWdELqYDJgohE1xsm0Bz0skKjbi/Y0Qt6OBhxcE/CfTSH6lA6mD5Kf0Eod/L\nQ7WDRHYcgOJj/Yyh8jFKyrf6ZCG8UFMf1t1JaBI3/TRScJw8059D3o/E8nMy9y7L\nSbQQpmRr9c7NupzO1y8OfQSNkbwZUDPJdfw0RX7ueAp9sdBhSkwAU/HIwlxnyj8Q\nplXCHFGzAgMBAAECggEACR2WH7EhEcrTk/Y4qgj6YitLrg46w3BPss1qa0uKW1qo\nUpwHdguiIcoJKOt5ElL6X8ygkPE88vHZN82L8+4LdRs/OReTpIeM12a8PY4KAsB5\ndT/t8j/meMLiDblM3BrF5eU1x7GuIZluPtq3SgTzdtjkcBIqjfqFPlrK6yw7OFa/\n4QORzjyL7SDZ41VjsQRCVmzQMZr3I83buREwsKU34+g0FeJW5113P/ofB/zL0UCf\nxQYP4aeyxYlTub45jzsLwZ1LFvlugdsOPhtVJ7/FAIUJ1pv8BB5lBuXaaiUcbl6h\nvNTweSyN4UyXGdzM+FVio0XfpADcLlQgDDDINdCmHQKBgQDNYgPvW+6L+h+P7OPr\YZKOG+DSCDq5imS+8PyFWm6Rgud0KPoMIBSqzCU6WngFxEioXaVY8axJd+yzcCKW\nMxUimIjjcYf5hv1BHliT7iaSN3bDgaTKP0uC7EyAhkjVw37iw6+WnNUgPYHNgbz/\nPKL3O/55Q+pghW0VCihex8V19wKBgQDAY3X2rk3r7E9yfa8t48XMfY6530wkkljw\nYEDJ2YnDDtyY/C8zzYoliQoGZdQc5EHvoo5Ry99XCaxZIOC0fR7jip/exiL6TDMR\nagjzv598d36oG8fd3TOQAQ+GC79jC8StKOrahZyuVcm7UTgPieR7DWLev5w2igMO\BtWCZbqjJQKBgQCCzbjp2ef8eElftaSXBaZ8IV83BQy5nF17iimZmLWwsOlN/sb5\nr/jZqnjPSE0GhzMrH7EuC4UJqXoz8eflNxVv2ivchzLthb6HmZcaZ+Ni3jYiX9Af\Ct7BvFMgy+VZV0/Zhn2u86V9Cg9AXi+LcwfrY+c3PjzoSjHl43lAnASzkwKBgQCh\noe41dXOZxktpERbgIwDHMKV8m5HJF/sI2JUWAGGxMwc6sISnrQNnTZ7SiTKPo2WS\nAqw3JGVbJpFZwDmI6aXN3WU7MJOqXeJ5uvASeOdxFqOecNiWGYV8cqesIqqEeBqg\nsEO/m4lrHkAB09aZl2wRxclPAwQm/gRbAHrYtsb60QKBgBVSPzgOj4ziYjzEFgTn\nkDFiONxFJ+fp9dwgwdI9hTHqexESRSpoANH1BniQSuGzZlEejP6q0H18s70RTyx8\EAcNLnh1ulcEIcXulFSrySWXa+GIduyA68/VkgET736rTCIwEc3hSnEtudDfgtd4\n4ekYfew8mwlucURSncriHEVH
-----END PRIVATE KEY-----`
      }),
    });
  }
  return getApps()[0];
}

/**
 * Método HTTP GET (API Route).
 * Consulta o preço atual do ativo (Axie Infinity) na API pública do CoinGecko, 
 * varre o banco de dados em busca de tokens de notificação cadastrados pelos usuários 
 * e dispara notificações push direcionadas via Firebase Cloud Messaging (FCM).
 */
export async function GET() {
  try {
    getFirebaseAdmin();
    const db = getFirestore();

    // Busca o preço atualizado da criptomoeda em Reais (BRL) na API do CoinGecko (fallback para 4.26 se falhar)
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=axie-infinity&vs_currencies=brl');
    const data = await response.json();
    const currentPrice = data['axie-infinity']?.brl || 4.26;

    // Recupera todos os documentos de configuração dos usuários no Firestore
    const settingsSnapshot = await db.collection('user_settings').get();
    const notificationsSent = [];

    if (!settingsSnapshot.empty) {
      for (const docSnap of settingsSnapshot.docs) {
        const userData = docSnap.data();
        
        // Mapeia e consolida a lista de tokens (suportando tanto o array novo 'fcmTokens' quanto o formato antigo 'fcmToken')
        let tokens = [];
        if (userData?.fcmTokens && Array.isArray(userData.fcmTokens)) {
          tokens = userData.fcmTokens;
        } else if (userData?.fcmToken) {
          tokens = [userData.fcmToken];
        }

        // Itera sobre cada token de dispositivo válido associado ao usuário
        for (const token of tokens) {
          if (!token) continue;

          // Configuração customizada da mensagem push para diferentes plataformas (Android e Web Push)
          const message = {
            token: token,
            notification: {
              title: `🚀 Meta Batida!`,
              body: `O preço atingiu o teto: R$ ${currentPrice}`,
            },
            android: {
              notification: {
                sound: 'default',
                clickAction: 'FLUTTER_NOTIFICATION_CLICK',
              }
            },
            webpush: {
              headers: {
                Image: 'https://card-flow.vercel.app/favicon.ico',
              },
              notification: {
                title: `🚀 Meta Batida!`,
                body: `O preço atingiu o teto: R$ ${currentPrice}`,
                icon: 'https://card-flow.vercel.app/favicon.ico',
                requireInteraction: true
              }
            }
          };

          try {
            // Dispara a notificação push através do Firebase Admin Messaging
            await getMessaging().send(message);
            notificationsSent.push({ userId: docSnap.id, tokenSnippet: token.substring(0, 6) + '...', status: 'sent' });
          } catch (sendError) {
            // Trata de forma inteligente tokens inválidos, expirados ou não registrados
            if (sendError.code === 'messaging/registration-token-not-registered' || sendError.message.includes('NotRegistered')) {
              notificationsSent.push({ userId: docSnap.id, error: 'Token inválido/expirado ignorado' });
            } else {
              notificationsSent.push({ userId: docSnap.id, error: sendError.message });
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, currentPrice, notificationsSent });
  } catch (error) {
    console.error('Erro detalhado:', error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}