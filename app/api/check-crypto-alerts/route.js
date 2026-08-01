import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

export const dynamic = 'force-dynamic';

function getFirebaseAdmin() {
  const apps = getApps();
  if (!apps.length) {
    return initializeApp({
      credential: cert({
        projectId: 'controle-de-gastos2',
        clientEmail: 'firebase-adminsdk-73pps@controle-de-gastos2.iam.gserviceaccount.com',
        privateKey: `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCaWU5+vlbFsIXK\nNr2DCQ5UTxhUhcq7+oTzmyYtb7kF/Jr8nfM9WjIH4cUhm8uaRyXq1boPZeIurrCj\n8uNLCYRTYnkgj7UiklRCxlWKOIWoZRPsYbQl0pvOe83nrvMHrmG8JWoeDwCllsJG\noupjKWdELqYDJgohE1xsm0Bz0skKjbi/Y0Qt6OBhxcE/CfTSH6lA6mD5Kf0Eod/L\nQ7WDRHYcgOJj/Yyh8jFKyrf6ZCG8UFMf1t1JaBI3/TRScJw8059D3o/E8nMy9y7L\nSbQQpmRr9c7NupzO1y8OfQSNkbwZUDPJdfw0RX7ueAp9sdBhSkwAU/HIwlxnyj8Q\nplXCHFGzAgMBAAECggEACR2WH7EhEcrTk/Y4qgj6YitLrg46w3BPss1qa0uKW1qo\nUpwHdguiIcoJKOt5ElL6X8ygkPE88vHZN82L8+4LdRs/OReTpIeM12a8PY4KAsB5\ndT/t8j/meMLiDblM3BrF5eU1x7GuIZluPtq3SgTzdtjkcBIqjfqFPlrK6yw7OFa/\n4QORzjyL7SDZ41VjsQRCVmzQMZr3I83buREwsKU34+g0FeJW5113P/ofB/zL0UCf\nxQYP4aeyxYlTub45jzsLwZ1LFvlugdsOPhtVJ7/FAIUJ1pv8BB5lBuXaaiUcbl6h\nvNTweSyN4UyXGdzM+FVio0XfpADcLlQgDDDINdCmHQKBgQDNYgPvW+6L+h+P7OPr\nYZKOG+DSCDq5imS+8PyFWm6Rgud0KPoMIBSqzCU6WngFxEioXaVY8axJd+yzcCKW\nMxUimIjjcYf5hv1BHliT7iaSN3bDgaTKP0uC7EyAhkjVw37iw6+WnNUgPYHNgbz/\nPKL3O/55Q+pghW0VCihex8V19wKBgQDAY3X2rk3r7E9yfa8t48XMfY6530wkkljw\nYEDJ2YnDDtyY/C8zzYoliQoGZdQc5EHvoo5Ry99XCaxZIOC0fR7jip/exiL6TDMR\nagjzv598d36oG8fd3TOQAQ+GC79jC8StKOrahZyuVcm7UTgPieR7DWLev5w2igMO\nBtWCZbqjJQKBgQCCzbjp2ef8eElftaSXBaZ8IV83BQy5nF17iimZmLWwsOlN/sb5\nr/jZqnjPSE0GhzMrH7EuC4UJqXoz8eflNxVv2ivchzLthb6HmZcaZ+Ni3jYiX9Af\nCt7BvFMgy+VZV0/Zhn2u86V9Cg9AXi+LcwfrY+c3PjzoSjHl43lAnASzkwKBgQCh\noe41dXOZxktpERbgIwDHMKV8m5HJF/sI2JUWAGGxMwc6sISnrQNnTZ7SiTKPo2WS\nAqw3JGVbJpFZwDmI6aXN3WU7MJOqXeJ5uvASeOdxFqOecNiWGYV8cqesIqqEeBqg\nsEO/m4lrHkAB09aZl2wRxclPAwQm/gRbAHrYtsb60QKBgBVSPzgOj4ziYjzEFgTn\nkDFiONxFJ+fp9dwgwdI9hTHqexESRSpoANH1BniQSuGzZlEejP6q0H18s70RTyx8\EAcNLnh1ulcEIcXulFSrySWXa+GIduyA68/VkgET736rTCIwEc3hSnEtudDfgtd4\n4ekYfew8mwlucURSncriHEVH\n-----END PRIVATE KEY-----`
      }),
    });
  }
  return getApps()[0];
}

export async function GET() {
  try {
    getFirebaseAdmin();
    const db = getFirestore();

    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=axie-infinity&vs_currencies=brl');
    const data = await response.json();
    const currentPrice = data['axie-infinity']?.brl;

    if (!currentPrice) {
      return NextResponse.json({ error: 'Não foi possível buscar o preço atual' }, { status: 500 });
    }

    const settingsSnapshot = await db.collection('user_settings').get();
    const notificationsSent = [];
    const debugUsers = [];

    if (!settingsSnapshot.empty) {
      for (const docSnap of settingsSnapshot.docs) {
        const userData = docSnap.data();
        const fcmToken = userData?.fcmToken;
        const upperAlert = parseFloat(userData?.cryptoUpperAlert);

        debugUsers.push({ id: docSnap.id, hasToken: !!fcmToken, upperAlert, currentPrice });

        if (fcmToken && !isNaN(upperAlert)) {
          if (currentPrice >= upperAlert) {
            const message = {
              token: fcmToken,
              notification: {
                title: `🚀 Meta Batida!`,
                body: `O preço atual da cripto atingiu R$ ${currentPrice} (Sua meta era R$ ${upperAlert}).`,
              },
              webpush: {
                notification: {
                  title: `🚀 Meta Batida!`,
                  body: `O preço atual da cripto atingiu R$ ${currentPrice} (Sua meta era R$ ${upperAlert}).`,
                  icon: '/favicon.ico'
                }
              }
            };

            try {
              await getMessaging().send(message);
              notificationsSent.push({ userId: docSnap.id, price: currentPrice, status: 'sent' });
            } catch (sendError) {
              notificationsSent.push({ userId: docSnap.id, error: sendError.message });
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, currentPrice, debugUsers, notificationsSent });
  } catch (error) {
    console.error('Erro detalhado:', error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}