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
Antes de clicar em "Deploy", você **DEVE** configurar as variáveis de ambiente no painel do Netlify. Sem elas, a IA não funcionará.

Vá em **Site settings > Environment variables** e adicione a seguinte chave:

| Chave | Descrição | Onde encontrar |
|-------|-----------|----------------|
| `GEMINI_API_KEY` | Chave da API do Google Gemini | [Google AI Studio](https://aistudio.google.com/) |

### 4. Finalizar
Após configurar as variáveis, clique em **"Deploy site"**. O Netlify fará o build e publicará seu site em alguns minutos.

## 🛠️ Desenvolvimento Local

1.  Clone o repositório.
2.  Instale as dependências: `npm install`
3.  Crie um arquivo `.env` na raiz com as variáveis acima.
4.  Inicie o servidor de desenvolvimento: `npm run dev`

## 🐛 Resolução de Problemas
*   **"Fica a processar, não gera o plano":** Isso geralmente acontece se a API do Gemini demorar muito para responder ou se o formato da resposta for inválido. O aplicativo agora inclui um limite de tempo (timeout de 45s) e um sistema mais robusto para extrair o plano gerado, evitando que fique travado.

