# Planificador Escolar com IA

Este projeto é uma aplicação web para professores criarem planos de aula, apontamentos e exercícios com o auxílio de IA.

## 🚀 Como fazer Deploy no Netlify

### 1. Preparação (GitHub)
1.  Crie um novo repositório no GitHub.
2.  Faça o push do código para o repositório.

### 2. Configuração no Netlify
1.  Acesse [netlify.com](https://www.netlify.com/) e faça login.
2.  Clique em **"Add new site"** > **"Import an existing project"**.
3.  Conecte-se ao **GitHub** e selecione o repositório do projeto.
4.  O Netlify detectará automaticamente as configurações (graças ao arquivo `netlify.toml`):
    *   **Build command:** `npm run build`
    *   **Publish directory:** `dist`

### 3. Variáveis de Ambiente (IMPORTANTE)
Antes de clicar em "Deploy", você **DEVE** configurar as variáveis de ambiente no painel do Netlify. Sem elas, o login e a IA não funcionarão.

Vá em **Site settings > Environment variables** e adicione as seguintes chaves:

| Chave | Descrição | Onde encontrar |
|-------|-----------|----------------|
| `GEMINI_API_KEY` | Chave da API do Google Gemini | [Google AI Studio](https://aistudio.google.com/) |
| `VITE_FIREBASE_API_KEY` | Chave da API do Firebase | Console do Firebase > Configurações do Projeto |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domínio de autenticação | Console do Firebase |
| `VITE_FIREBASE_PROJECT_ID` | ID do projeto | Console do Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de armazenamento | Console do Firebase |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID do remetente | Console do Firebase |
| `VITE_FIREBASE_APP_ID` | ID do aplicativo | Console do Firebase |

### 4. Finalizar
Após configurar as variáveis, clique em **"Deploy site"**. O Netlify fará o build e publicará seu site em alguns minutos.

## 🛠️ Desenvolvimento Local

1.  Clone o repositório.
2.  Instale as dependências: `npm install`
3.  Crie um arquivo `.env` na raiz com as variáveis acima.
4.  Inicie o servidor de desenvolvimento: `npm run dev`
