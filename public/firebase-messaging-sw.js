// Importa os scripts de compatibilidade do Firebase necessários para o escopo do Service Worker (compatível com a versão v10)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Inicializa a instância do Firebase no ambiente de background com as credenciais do projeto
firebase.initializeApp({
  apiKey: "AIzaSyDrqCMpwhPtf_PAvJ6IETde7DPlhQ12HTU",
  authDomain: "controle-de-gastos2.firebaseapp.com",
  projectId: "controle-de-gastos2",
  storageBucket: "controle-de-gastos2.appspot.com",
  messagingSenderId: "383611015869",
  appId: "1:383611015869:web:06aa216bb5fcf148bd1dd4"
});

// Instancia o serviço de mensageria do Firebase (Firebase Messaging)
const messaging = firebase.messaging();

/**
 * Manipulador de Notificações em Segundo Plano (Background Message Handler).
 * Executado pelo Service Worker quando o aplicativo está fechado ou rodando em segundo plano,
 * capturando a carga útil (payload) da mensagem push e disparando a notificação nativa do sistema.
 */
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload?.notification?.title || "Nova Notificação";
  const notificationOptions = {
    body: payload?.notification?.body || "Você tem uma nova atualização.",
    icon: '/favicon.ico'
  };

  // Exibe a notificação na área de trabalho do usuário através do registro ativo do Service Worker
  self.registration.showNotification(notificationTitle, notificationOptions);
});