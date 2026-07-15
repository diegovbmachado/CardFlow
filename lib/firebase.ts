import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Suas credenciais reais obtidas do console do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDrQmCPwhPtf_PAvj6IETDE7dP1hq12HTU",
  authDomain: "controle-de-gastos2.firebaseapp.com",
  projectId: "controle-de-gastos2",
  storageBucket: "controle-de-gastos2.firebasestorage.app",
  messagingSenderId: "383611015869",
  appId: "1:383611015869:web:06aa216bb5bcf148bd1dd4"
};

// Inicializa o Firebase garantindo que não crie múltiplas instâncias no Next.js
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { auth };
// Evita inicializar o Firebase várias vezes durante o recarregamento do Next.js
