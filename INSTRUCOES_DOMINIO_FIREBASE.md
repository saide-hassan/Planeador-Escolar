# Erro: Firebase: Error (auth/unauthorized-domain)

Este erro acontece porque o domínio onde seu site está rodando não foi autorizado no painel do Firebase. Por segurança, o Firebase bloqueia logins de domínios desconhecidos.

## Como Corrigir

1.  Acesse o [Console do Firebase](https://console.firebase.google.com/).
2.  Selecione seu projeto.
3.  No menu lateral esquerdo, vá em **Criação** > **Authentication**.
4.  Clique na aba **Configurações** (Settings).
5.  Role até a seção **Domínios autorizados** (Authorized domains).
6.  Clique em **Adicionar domínio**.
7.  Adicione os seguintes domínios:
    *   **Seu domínio do Netlify:** (ex: `seu-site.netlify.app`)
    *   **O domínio do AI Studio Preview:** (Copie o domínio da URL onde você está testando agora, ex: `ais-dev-....run.app`)
    *   `localhost` (Geralmente já vem adicionado)

## Importante
Após adicionar o domínio, pode levar alguns minutos para propagar. Tente fazer login novamente após adicionar.
