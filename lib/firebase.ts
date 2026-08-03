import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

// Credenciais de configuração do projeto obtidas no console do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDrQmCPwhPtf_PAvj6IETDE7dP1hq12HTU",
  authDomain: "controle-de-gastos2.firebaseapp.com",
  projectId: "controle-de-gastos2",
  storageBucket: "controle-de-gastos2.firebasestorage.app",
  messagingSenderId: "383611015869",
  appId: "1:383611015869:web:06aa216bb5bcf148bd1dd4"
};

/**
 * Inicialização segura do Firebase para ambientes Next.js.
 * Verifica se já existe uma instância ativa para evitar erros de reinicialização no Hot Reload.
 */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Instância do serviço de Autenticação do Firebase
const auth = getAuth(app);

// Instância do Banco de Dados Firestore exportada para uso global
export const db = getFirestore(app);

// Instância do Provedor de Autenticação via Conta Google (Google Auth Provider)
const googleProvider = new GoogleAuthProvider();

// Exportação centralizada dos módulos de autenticação e provedores
export { auth, googleProvider };

/**
 * Instância do Firebase Messaging (Push Notifications).
 * Utiliza verificação de ambiente (`typeof window !== "undefined"`) para garantir
 * que o serviço de mensageria seja inicializado estritamente no lado do cliente (Browser).
 */
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;