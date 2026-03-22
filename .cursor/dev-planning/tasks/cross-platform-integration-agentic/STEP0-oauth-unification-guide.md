# Step 0: Unificação do OAuth App — Guia Passo a Passo

> **Objetivo**: Escolher 1 OAuth App e configurá-lo em **asap-protocol** e **agentic-orchestration** para SSO contínuo.
> **Pré-requisito**: Acesso a `github.com/settings/developers` e aos projetos Vercel de ambos os apps.

---

## 1. Qual App Usar?

Você tem 3 **OAuth Apps** no GitHub. Para SSO entre ASAP e Agent Builder, há duas estratégias:

### Estratégia 1: GitHub App (recomendada para SSO)

Crie uma **GitHub App** em `github.com/settings/apps` — ela suporta múltiplas callback URLs. Pule para a [seção 2.5](#25-opção-a-criar-github-app-para-sso-com-2-domínios).

### Estratégia 2: Unificar em 1 OAuth App (sem SSO entre domínios)

Se aceitar que o usuário autorize cada app separadamente, escolha **1** dos 3 OAuth Apps:

| App                            | Descrição                                 |
| ------------------------------ | ----------------------------------------- |
| **Agentic Orchestration**      | Nome alinhado ao Agent Builder            |
| **ASAP Marketplace Registry**  | "AI Agents' registry using ASAP protocol" |
| **ASAP Protocol Web (Vercel)** | "Marketplace deployed @ Vercel"           |

Configure cada projeto com seu próprio OAuth App (ou use o mesmo app em um domínio e troque a callback URL ao alternar — inviável em produção). Na prática, com 1 OAuth App você só pode ter 1 callback — então **cada app (ASAP e Agent Builder) precisaria de seu próprio OAuth App**, e não haverá SSO unificado.

> **Resumo**: Para SSO real → use **GitHub App**. Para manter OAuth Apps → use 2 apps (um por projeto), sem SSO.

---

## 2. Configurar o OAuth App no GitHub

### 2.1 Acessar e Editar o App

1. Acesse: **https://github.com/settings/developers**
2. Em **OAuth Apps**, clique em **Edit** no app escolhido.

### 2.2 Callback URLs — Limitação Importante

**GitHub OAuth Apps aceitam apenas 1 URL** no campo "Authorization callback URL" ([docs](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)). O PRD assume múltiplas URLs, mas isso **não é suportado** por OAuth Apps.

| URL desejada                                                    | App           |
| --------------------------------------------------------------- | ------------- |
| `https://asap-protocol.vercel.app/api/auth/callback/github`     | ASAP Protocol |
| `https://open-agentic-flow.vercel.app/api/auth/callback/github` | Agent Builder |

**Opções para SSO entre dois domínios**:

| Opção | Solução                                                                                                               | SSO?   | Esforço                                         |
| ----- | --------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------- |
| **A** | Migrar para **GitHub App** (suporta até 10 callback URLs)                                                             | ✅ Sim | Médio — requer mudança no provider NextAuth     |
| **B** | **Proxy unificado**: um único domínio que recebe o callback e redireciona para ASAP ou Agent Builder conforme `state` | ✅ Sim | Alto — arquitetura custom                       |
| **C** | Manter 2 OAuth Apps separados (um por domínio)                                                                        | ❌ Não | Baixo — usuário autoriza cada app separadamente |

**Recomendação para SSO real**: Use **Opção A (GitHub App)**. GitHub Apps suportam até 10 callback URLs e usam o mesmo fluxo OAuth 2.0. O NextAuth funciona com GitHub App — basta usar o Client ID e Client Secret do GitHub App (em vez do OAuth App). Crie em: **github.com/settings/apps** → **New GitHub App**.

**Workaround temporário (Opção C)**: Use 2 OAuth Apps separados. O usuário autoriza cada app na primeira visita; em visitas subsequentes o GitHub pode fazer re-auth rápido.

### 2.3 Homepage URL (opcional)

Configure para o domínio principal, por exemplo:

- `https://asap-protocol.vercel.app` ou
- `https://open-agentic-flow.vercel.app`

### 2.4 Salvar e Copiar Credenciais

1. Clique em **Update application**.
2. Copie o **Client ID** (público).
3. Gere um novo **Client Secret** se necessário (em "Generate a new client secret") e copie — **guarde em local seguro**, pois não será exibido novamente.

---

## 2.5 Opção A: Criar GitHub App (para SSO com 2 domínios)

Se optar por **GitHub App** em vez de OAuth App:

1. Acesse **https://github.com/settings/apps** → **New GitHub App**
2. **GitHub App name**: ex. `ASAP Protocol Suite`
3. **Homepage URL**: `https://asap-protocol.vercel.app`
4. **Callback URL**: adicione **ambas** (GitHub Apps permitem múltiplas):
   - `https://asap-protocol.vercel.app/api/auth/callback/github`
   - `https://open-agentic-flow.vercel.app/api/auth/callback/github`
5. **Permissions** → Account permissions → `Read-only` em "Email addresses" e "Profile"
6. Crie o app e em **Client secrets** gere um secret
7. Use o **Client ID** e o **Client Secret** nos projetos (mesmo formato que OAuth App no NextAuth)

O NextAuth usa o mesmo provider `GitHub` — não é necessário alterar código.

---

## 3. Configurar no Vercel — ASAP Protocol (asap-protocol)

### 3.1 Variáveis de Ambiente

No projeto Vercel **asap-protocol**:

| Variável                        | Valor                                  | Observação                       |
| ------------------------------- | -------------------------------------- | -------------------------------- |
| `GITHUB_CLIENT_ID`              | (Client ID do app escolhido)           | O mesmo em ambos os projetos     |
| `GITHUB_CLIENT_SECRET`          | (Client Secret)                        | O mesmo em ambos os projetos     |
| `NEXT_PUBLIC_AGENT_BUILDER_URL` | `https://open-agentic-flow.vercel.app` | Já documentado em `.env.example` |

### 3.2 Onde configurar

1. Vercel Dashboard → projeto **asap-protocol**
2. **Settings** → **Environment Variables**
3. Adicione/atualize `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` com os valores do app unificado.
4. **Redeploy** o projeto para aplicar as variáveis.

---

## 4. Configurar no Vercel — Agent Builder (agentic-orchestration)

### 4.1 Variáveis de Ambiente

No projeto Vercel **v0-agent-kit** (Agent Builder / open-agentic-flow):

| Variável                        | Valor                              | Observação                        |
| ------------------------------- | ---------------------------------- | --------------------------------- |
| `AUTH_GITHUB_ID`                | (mesmo Client ID)                  | NextAuth usa este nome por padrão |
| `AUTH_GITHUB_SECRET`            | (mesmo Client Secret)              | Idem                              |
| `NEXT_PUBLIC_ASAP_PROTOCOL_URL` | `https://asap-protocol.vercel.app` | Para back-navigation              |

### 4.2 Onde configurar

1. Vercel Dashboard → projeto **v0-agent-kit**
2. **Settings** → **Environment Variables**
3. Use os **mesmos** Client ID e Client Secret. O agentic-orchestration usa `AUTH_GITHUB_ID` e `AUTH_GITHUB_SECRET` (padrão NextAuth); o asap-protocol usa `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` — os **valores** devem ser idênticos.
4. **Redeploy** o projeto.

---

## 5. Desativar/Remover os Outros 2 Apps (Opcional)

Após unificar:

1. Em **OAuth Apps**, você pode **deletar** os 2 apps não utilizados, ou
2. Deixá-los inativos (não os use em produção).

> **Cuidado**: Se algum deles ainda estiver configurado em produção, remova as credenciais do Vercel antes de deletar o app no GitHub.

---

## 6. Verificação

### Checklist

- [ ] App configurado no GitHub (OAuth App ou GitHub App)
- [ ] Callback URL(s): ambas as URLs se GitHub App; 1 URL se OAuth App
- [ ] Client ID e Client Secret copiados
- [ ] ASAP Protocol (Vercel): `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` configurados
- [ ] Agent Builder (Vercel): mesmas credenciais configuradas
- [ ] Ambos os projetos redeployados
- [ ] Teste: login no ASAP Protocol → funciona
- [ ] Teste: login no Agent Builder → funciona
- [ ] Teste: login no ASAP → clicar "Agent Builder" → SSO (sem novo consent no GitHub)

---

## 6.1 Como Testar

### Pré-requisito

Ambos os apps devem estar deployados no Vercel com as variáveis configuradas.

### Teste 1: Login no ASAP Protocol

1. Abra **https://asap-protocol.vercel.app** em aba anônima (ou limpe cookies).
2. Clique em **Connect / Login** ou **Build Agents**.
3. Autorize no GitHub (se solicitado).
4. **Esperado**: Você volta ao ASAP Protocol logado (avatar/nome no header).

### Teste 2: Login no Agent Builder

1. Abra **https://open-agentic-flow.vercel.app** em aba anônima.
2. Faça login com GitHub.
3. **Esperado**: Você entra no Agent Builder logado.

### Teste 3: SSO — ASAP → Agent Builder (sem novo consent)

1. Faça login no ASAP Protocol (Teste 1).
2. No header, clique em **Agent Builder**.
3. **Esperado**: Você vai para o Agent Builder **já logado** (GitHub não pede autorização de novo).

### Teste 4: Pre-login CTA — Build Agents

1. Abra o ASAP Protocol **sem** estar logado.
2. Clique em **Build Agents** (CTA em indigo).
3. **Esperado**: GitHub pede autorização → após autorizar, você é redirecionado para o Agent Builder logado.

### Teste 5: Back-navigation

1. No Agent Builder, clique em **ASAP Protocol** no sidebar.
2. **Esperado**: Navega para `asap-protocol.vercel.app`.

### Se algo falhar

- **redirect_uri_mismatch**: A callback URL usada não está registrada na GitHub App. Verifique as URLs em **Settings** do app.
- **401 / Session null**: Credenciais diferentes entre os projetos ou `AUTH_SECRET` ausente.
- **Loop de redirect**: `redirect` callback no `auth.ts` pode estar bloqueando a URL; confira `NEXT_PUBLIC_AGENT_BUILDER_URL` e `NEXT_PUBLIC_ASAP_PROTOCOL_URL`.
- **"Server error" / "There is a problem with the server configuration"** (Agent Builder): Ver [6.2 Troubleshooting — Agent Builder](#62-troubleshooting--agent-builder).

---

## 6.2 Troubleshooting — Agent Builder

O erro **"Server error" / "There is a problem with the server configuration"** no Agent Builder geralmente indica variáveis de ambiente ausentes ou inválidas.

### 1. Verificar variáveis no Vercel (projeto v0-agent-kit)

Confirme que estas variáveis existem e estão corretas:

| Variável             | Obrigatório | Valor                                           |
| -------------------- | ----------- | ----------------------------------------------- |
| `AUTH_SECRET`        | Sim         | Mín. 32 caracteres (gere com `npx auth secret`) |
| `AUTH_GITHUB_ID`     | Sim         | Client ID da GitHub App (mesmo do ASAP)         |
| `AUTH_GITHUB_SECRET` | Sim         | Client Secret da GitHub App (mesmo do ASAP)     |

> **Nota**: O Agent Builder pode usar `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` em vez de `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`. Verifique o `auth.ts` do agentic-orchestration para confirmar os nomes.

### 2. Conferir logs no Vercel

1. Vercel Dashboard → projeto **v0-agent-kit**
2. **Deployments** → último deployment → **Functions** ou **Logs**
3. Procure por erros relacionados a `AUTH_SECRET`, `GITHUB`, ou `NextAuth`

### 3. Redeploy após alterar variáveis

Após adicionar ou alterar variáveis, faça **Redeploy** do projeto (Deployments → ⋮ → Redeploy).

### 4. Callback URL na GitHub App

Confirme que `https://open-agentic-flow.vercel.app/api/auth/callback/github` está nas callback URLs da GitHub App.

---

## 7. Desenvolvimento Local

Para `.env.local` em **asap-protocol**:

```bash
# apps/web/.env.local
GITHUB_CLIENT_ID=<mesmo do app unificado>
GITHUB_CLIENT_SECRET=<mesmo do app unificado>
NEXT_PUBLIC_AGENT_BUILDER_URL=https://open-agentic-flow.vercel.app
# ... demais vars
```

Para desenvolvimento local, adicione também no GitHub OAuth App:

- `http://localhost:3000/api/auth/callback/github` (se a interface permitir múltiplas URLs).

Se o GitHub permitir apenas 1 URL, use a de produção e teste login apenas em staging/produção.

---

## Referências

- PRD ASAP: `prd-cross-platform-integration-asap.md`
- PRD Agentic: `prd-cross-platform-integration-agentic.md` (§11, Step 0)
- Tasks: `tasks-cross-platform-integration-asap.md`

80370da46a01328ccfd99fad7e62bc85200103a7
