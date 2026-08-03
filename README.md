# 🚀 CardFlow - Sistema de Gestão Financeira & Módulo Web3

O **CardFlow** é uma aplicação web moderna de controle de gastos e faturamento, desenvolvida com tecnologias de ponta para proporcionar uma experiência analítica fluida, segura e em tempo real. O sistema conta com autenticação robusta, painéis interativos de fluxo de caixa, gestão de categorias personalizadas e um módulo Web3 avançado com monitoramento de criptomoedas e notificações push.

---

## 🛠️ Tecnologias e Stack Utilizada

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
* **Componentes UI:** [Shadcn UI](https://ui.shadcn.com/) (Construído sobre Radix UI)
* **Banco de Dados & Backend:** [Firebase Firestore & Auth](https://firebase.google.com/)
* **Notificações Push:** Firebase Cloud Messaging (FCM) & Service Workers
* **Gráficos e Indicadores:** Recharts e Lucide React
* **Integração Externa:** CoinGecko API (Dados de mercado em tempo real)

---

## ✨ Principais Funcionalidades

* 🔐 **Autenticação Segura:** Login por e-mail/senha, recuperação de senha e autenticação social via Google Pop-up com rotas protegidas (`ProtectedRoute`).
* 📊 **Dashboard Financeiro Completo:** 
  * Cartões de métricas globais (Saldo disponível, total de receitas, despesas e taxa de comprometimento).
  * Cartões de destaque customizáveis baseados nas categorias favoritas do usuário.
  * Gráficos analíticos de fluxo de caixa anual e distribuição percentual por categorias (Pizza interativa).
* 💸 **Lançamentos Dinâmicos:** Registro de receitas e despesas vinculadas a categorias padrão e personalizadas criadas pelo usuário.
* ⚙️ **Configurações Personalizadas:** Painel de customização de categorias e gerenciamento de cards de destaque.
* 🪙 **Módulo Web3 & Alertas Cripto:** 
  * Busca e autocomplete de ativos digitais integrados à API do CoinGecko.
  * Monitoramento de preços teto e piso com salvamento de preferências no Firestore.
  * Sistema de Notificações Push nativas em background via Service Worker e Firebase Admin SDK.

---

## 📂 Estrutura do Projeto

```text
├── app/
│   ├── api/check-crypto-alerts/ # API Route para checagem de preços e disparo de Push Notifications
│   ├── dash-board/             # Painel principal do usuário e sub-rotas
│   ├── sign-up/                # Página de cadastro de novos usuários
│   ├── forgot-password/        # Recuperação de senha via Firebase Auth
│   ├── transactions/           # Módulo de cadastro de receitas e despesas
│   ├── settings/               # Configurações de perfil e preferências
│   ├── crypto-settings/        # Configuração de ativos Web3 e alertas de criptomoedas
│   ├── layout.tsx              # Layout raiz com fontes Geist e provedores
│   └── page.tsx                # Tela principal de Login
├── components/
│   ├── auth/                   # Componente de segurança e rotas protegidas
│   ├── dashboard/              # Gráficos, barras laterais e cartões de métricas
│   └── ui/                     # Biblioteca de componentes base do Shadcn UI
├── lib/
│   ├── firebase.ts             # Configuração e inicialização segura do Firebase (Client/Auth/DB)
│   └── utils.ts                # Utilitários globais (clsx e tailwind-merge)
└── public/
    └── firebase-messaging-sw.js # Service Worker para manipulação de Push Notifications em background

⚙️ Como Executar o Projeto Localmente
1-Clone o repositório:

    git clone [https://github.com/seu-usuario/card-flow.git](https://github.com/seu-usuario/card-flow.git)
cd card-flow

2-Instale as dependências:
npm install
# ou yarn install / pnpm install

3-Configure as variáveis de ambiente / credenciais:
Certifique-se de que o arquivo lib/firebase.ts esteja configurado com as credenciais do seu projeto no Firebase Console.

4-Execute o servidor de desenvolvimento:
npm run dev

5-Acesse no navegador:
Abra http://localhost:3000 para visualizar a aplicação.

📄 Licença
Este projeto foi desenvolvido para fins de portfólio e aprimoramento técnico.

---

Basta copiar esse conteúdo, substituir o seu `README.md` atual por ele e fazer um commit. O seu GitHub vai ficar com uma apresentação impecável, destacando exatamente a complexidade e a arquitetura profissional do seu sistema