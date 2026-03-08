# Instruções de Atualização (Firebase + Netlify)

Como você já tem o deploy automático configurado, siga estes passos para que as novas funcionalidades de Login e Banco de Dados funcionem no seu site ao vivo.

## 1. Configurar o Firebase (Se ainda não fez)
1.  Acesse [console.firebase.google.com](https://console.firebase.google.com/).
2.  Crie um projeto (ou use um existente).
3.  No menu **Criação**:
    *   **Authentication:** Ative o provedor **Google**.
    *   **Firestore Database:** Crie um banco de dados (inicie em modo de teste para facilitar).
4.  Vá em **Configurações do Projeto** (engrenagem) > **Geral** > **Seus aplicativos**.
5.  Adicione um app Web (`</>`) e copie as configurações (`apiKey`, `authDomain`, etc.).

## 2. Adicionar Variáveis no Netlify (CRÍTICO)
O seu site no Netlify **vai quebrar** ou o login não vai funcionar se você não adicionar estas variáveis. O Netlify não lê o arquivo `.env` local, ele precisa que você configure isso no painel.

1.  Acesse seu painel no [Netlify](https://app.netlify.com/).
2.  Selecione seu site.
3.  Vá em **Site configuration** > **Environment variables**.
4.  **DICA:** Você não precisa adicionar uma por uma! Clique em **"Edit as text"** (ou "Import variables") e cole todas de uma vez no formato `CHAVE=VALOR`.

Copie e cole este bloco (substituindo pelos seus valores reais):

```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

> **Nota:** Mantenha a `GEMINI_API_KEY` que você provavelmente já configurou.

## 3. Atualizar o Código (Commit & Push)
1.  Faça o commit de todas as alterações que fizemos hoje:
    *   `src/services/firebase.ts` (Novo)
    *   `src/contexts/AuthContext.tsx` (Novo)
    *   `src/services/planService.ts` (Novo)
    *   `src/components/WelcomeScreen.tsx` (Atualizado com botão de login)
    *   `src/App.tsx` (Atualizado com AuthProvider)
    *   `src/components/HistoryScreen.tsx` (Atualizado para ler do Firebase)
    *   `netlify.toml` (Garante que o site não dê erro 404 ao recarregar páginas)
2.  Faça o push para o GitHub.

## 5. Erro Comum: Domínio Não Autorizado
Se você ver o erro `auth/unauthorized-domain` ao tentar logar:
1.  Vá no [Console do Firebase](https://console.firebase.google.com/).
2.  **Authentication** > **Configurações** (Settings) > **Domínios autorizados**.
3.  Adicione o domínio do seu site no Netlify (ex: `meu-site.netlify.app`).

## 4. Testar
Assim que o Netlify terminar o deploy (geralmente leva 1-2 minutos):
1.  Abra seu site.
2.  Tente fazer login com o Google.
3.  Crie um plano de aula e salve.
4.  Verifique se ele aparece no Histórico.
