importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDrqCMpwhPtf_PAvJ6IETde7DPlhQ12HTU",
  authDomain: "controle-de-gastos2.firebaseapp.com",
  projectId: "controle-de-gastos2",
  storageBucket: "controle-de-gastos2.appspot.com",
  messagingSenderId: "383611015869",
  appId: "1:383611015869:web:06aa216bb5fcf148bd1dd4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload?.notification?.title || "Nova Notificação";
  const notificationOptions = {
    body: payload?.notification?.body || "Você tem uma nova atualização.",
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});